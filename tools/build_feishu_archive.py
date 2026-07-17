#!/usr/bin/env python3
"""Build a browsable Markdown-and-assets mirror from a Feishu capture manifest.

The builder intentionally does not talk to Feishu.  Browser/API capture is kept
separate from deterministic archive generation so a captured snapshot can be
reviewed, rebuilt, and audited without an authenticated session.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import tempfile
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import quote, urlparse


ASSET_URI_RE = re.compile(r"feishu-asset://([A-Za-z0-9._-]+)")
MARKDOWN_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(\s*([^\s)]+)")
SAFE_ID_RE = re.compile(r"^[A-Za-z0-9._-]+$")
MANAGED_MARKER = ".generated-by-build-feishu-archive"
KNOWN_STATUSES = (
    "discovered",
    "partial",
    "archived",
    "verified",
    "blocked",
    "unavailable",
)


class ArchiveError(ValueError):
    """Raised when the capture manifest cannot produce a safe archive."""


@dataclass(frozen=True)
class Folder:
    path: tuple[str, ...]
    source_url: str
    status: str
    provenance: Any
    order: int
    explicit: bool


@dataclass(frozen=True)
class Asset:
    asset_id: str
    source: Path
    filename: str
    source_url: str
    provenance: Any
    caption: str


@dataclass(frozen=True)
class Document:
    doc_id: str
    title: str
    folder_path: tuple[str, ...]
    output_name: str
    source_url: str
    source_type: str
    status: str
    captured_at: str
    provenance: Any
    content_file: Path | None
    assets: tuple[Asset, ...]
    order: int


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ArchiveError(f"Manifest not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise ArchiveError(f"Invalid JSON in {path}: {exc}") from exc
    if not isinstance(value, dict):
        raise ArchiveError("Manifest root must be a JSON object")
    return value


def required_text(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ArchiveError(f"{field} must be a non-empty string")
    return value.strip()


def optional_text(value: Any, field: str) -> str:
    if value is None:
        return ""
    if not isinstance(value, str):
        raise ArchiveError(f"{field} must be a string")
    return value.strip()


def validate_url(value: str, field: str, *, required: bool = True) -> str:
    value = value.strip()
    if not value and not required:
        return ""
    if not value:
        raise ArchiveError(f"{field} is required")
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ArchiveError(f"{field} must be an http(s) URL: {value!r}")
    return value


def validate_status(value: Any, field: str) -> str:
    value = required_text(value, field).lower()
    if not re.fullmatch(r"[a-z][a-z0-9-]*", value):
        raise ArchiveError(f"{field} must be a lowercase status token: {value!r}")
    return value


def validate_id(value: Any, field: str) -> str:
    value = required_text(value, field)
    if not SAFE_ID_RE.fullmatch(value):
        raise ArchiveError(f"{field} may contain only letters, digits, '.', '_' and '-'")
    return value


def validate_segment(value: Any, field: str) -> str:
    value = required_text(value, field)
    if value in {".", ".."} or "/" in value or "\\" in value or "\0" in value:
        raise ArchiveError(f"{field} is not a safe path segment: {value!r}")
    if value.casefold() in {"readme.md", "_assets"}:
        raise ArchiveError(f"{field} uses a reserved archive name: {value!r}")
    return value


def parse_path(value: Any, field: str) -> tuple[str, ...]:
    if not isinstance(value, list):
        raise ArchiveError(f"{field} must be an array of folder names")
    return tuple(validate_segment(segment, f"{field}[{index}]") for index, segment in enumerate(value))


def default_output_name(title: str) -> str:
    normalized = unicodedata.normalize("NFKC", title).strip()
    normalized = re.sub(r"[\s/\\]+", "-", normalized)
    normalized = re.sub(r"[^\w.\-\u3400-\u9fff]+", "-", normalized, flags=re.UNICODE)
    normalized = normalized.strip("-._")
    return normalized or "document"


def parse_order(value: Any, field: str, fallback: int) -> int:
    if value is None:
        return fallback
    if not isinstance(value, int) or isinstance(value, bool):
        raise ArchiveError(f"{field} must be an integer")
    return value


def source_path(base: Path, value: Any, field: str) -> Path:
    raw = required_text(value, field)
    candidate = Path(raw)
    if not candidate.is_absolute():
        candidate = base / candidate
    candidate = candidate.resolve()
    if not candidate.is_file():
        raise ArchiveError(f"{field} does not exist or is not a file: {candidate}")
    return candidate


def parse_manifest(manifest_path: Path) -> tuple[dict[str, Any], dict[tuple[str, ...], Folder], list[Document]]:
    raw = load_json(manifest_path)
    if raw.get("schema_version") != 1:
        raise ArchiveError("schema_version must be 1")
    archive = raw.get("archive")
    if not isinstance(archive, dict):
        raise ArchiveError("archive must be an object")
    required_text(archive.get("title"), "archive.title")
    base = manifest_path.parent.resolve()

    raw_folders = raw.get("folders", [])
    raw_documents = raw.get("documents", [])
    if not isinstance(raw_folders, list) or not isinstance(raw_documents, list):
        raise ArchiveError("folders and documents must be arrays")

    folders: dict[tuple[str, ...], Folder] = {
        (): Folder((), "", "archived", archive.get("provenance", {}), -1, False)
    }
    for index, item in enumerate(raw_folders):
        if not isinstance(item, dict):
            raise ArchiveError(f"folders[{index}] must be an object")
        path = parse_path(item.get("path"), f"folders[{index}].path")
        if not path:
            raise ArchiveError(f"folders[{index}].path cannot be empty")
        if path in folders and folders[path].explicit:
            raise ArchiveError(f"Duplicate folder path: {' / '.join(path)}")
        folders[path] = Folder(
            path=path,
            source_url=validate_url(required_text(item.get("source_url"), f"folders[{index}].source_url"), f"folders[{index}].source_url"),
            status=validate_status(item.get("status"), f"folders[{index}].status"),
            provenance=item.get("provenance", {}),
            order=parse_order(item.get("order"), f"folders[{index}].order", index),
            explicit=True,
        )

    documents: list[Document] = []
    seen_ids: set[str] = set()
    seen_outputs: set[tuple[tuple[str, ...], str]] = set()
    for index, item in enumerate(raw_documents):
        if not isinstance(item, dict):
            raise ArchiveError(f"documents[{index}] must be an object")
        prefix = f"documents[{index}]"
        doc_id = validate_id(item.get("id"), f"{prefix}.id")
        if doc_id in seen_ids:
            raise ArchiveError(f"Duplicate document id: {doc_id}")
        seen_ids.add(doc_id)
        title = required_text(item.get("title"), f"{prefix}.title")
        folder_path = parse_path(item.get("folder_path", []), f"{prefix}.folder_path")
        output_name = validate_segment(item.get("output_name", default_output_name(title)), f"{prefix}.output_name")
        if output_name.lower().endswith(".md"):
            output_name = output_name[:-3]
        if not output_name or output_name.casefold() == "readme":
            raise ArchiveError(f"{prefix}.output_name would overwrite a folder index")
        output_key = (folder_path, output_name.casefold())
        if output_key in seen_outputs:
            raise ArchiveError(f"Duplicate document output path: {' / '.join(folder_path + (output_name + '.md',))}")
        seen_outputs.add(output_key)

        content_file: Path | None = None
        if item.get("content_file"):
            content_file = source_path(base, item.get("content_file"), f"{prefix}.content_file")

        raw_assets = item.get("assets", [])
        if not isinstance(raw_assets, list):
            raise ArchiveError(f"{prefix}.assets must be an array")
        assets: list[Asset] = []
        asset_ids: set[str] = set()
        asset_names: set[str] = set()
        for asset_index, raw_asset in enumerate(raw_assets):
            if not isinstance(raw_asset, dict):
                raise ArchiveError(f"{prefix}.assets[{asset_index}] must be an object")
            asset_prefix = f"{prefix}.assets[{asset_index}]"
            asset_id = validate_id(raw_asset.get("id"), f"{asset_prefix}.id")
            if asset_id in asset_ids:
                raise ArchiveError(f"Duplicate asset id {asset_id!r} in document {doc_id!r}")
            asset_ids.add(asset_id)
            asset_source = source_path(base, raw_asset.get("source"), f"{asset_prefix}.source")
            filename = validate_segment(raw_asset.get("filename", asset_source.name), f"{asset_prefix}.filename")
            if filename.casefold() in asset_names:
                raise ArchiveError(f"Duplicate asset filename {filename!r} in document {doc_id!r}")
            asset_names.add(filename.casefold())
            assets.append(
                Asset(
                    asset_id=asset_id,
                    source=asset_source,
                    filename=filename,
                    source_url=validate_url(optional_text(raw_asset.get("source_url"), f"{asset_prefix}.source_url"), f"{asset_prefix}.source_url", required=False),
                    provenance=raw_asset.get("provenance", {}),
                    caption=optional_text(raw_asset.get("caption"), f"{asset_prefix}.caption"),
                )
            )

        documents.append(
            Document(
                doc_id=doc_id,
                title=title,
                folder_path=folder_path,
                output_name=output_name,
                source_url=validate_url(required_text(item.get("source_url"), f"{prefix}.source_url"), f"{prefix}.source_url"),
                source_type=required_text(item.get("source_type"), f"{prefix}.source_type"),
                status=validate_status(item.get("status"), f"{prefix}.status"),
                captured_at=optional_text(item.get("captured_at"), f"{prefix}.captured_at"),
                provenance=item.get("provenance", {}),
                content_file=content_file,
                assets=tuple(assets),
                order=parse_order(item.get("order"), f"{prefix}.order", index),
            )
        )

        for depth in range(1, len(folder_path) + 1):
            path = folder_path[:depth]
            folders.setdefault(path, Folder(path, "", "discovered", {}, 100000 + len(folders), False))

    return archive, folders, documents


def json_scalar(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True)


def escape_table(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ").strip()


def link_url(path: str) -> str:
    return quote(path, safe="/._-~")


def relative_link(from_dir: tuple[str, ...], to_path: PurePosixPath) -> str:
    current = PurePosixPath(*from_dir)
    common = 0
    current_parts = current.parts
    target_parts = to_path.parts
    while common < min(len(current_parts), len(target_parts)) and current_parts[common] == target_parts[common]:
        common += 1
    relative = [".."] * (len(current_parts) - common) + list(target_parts[common:])
    return link_url("/".join(relative) or ".")


def folder_front_matter(folder: Folder, title: str) -> str:
    values = {
        "archive_kind": "folder",
        "title": title,
        "source_url": folder.source_url,
        "status": folder.status,
        "provenance": folder.provenance,
    }
    return "---\n" + "\n".join(f"{key}: {json_scalar(value)}" for key, value in values.items()) + "\n---\n"


def document_front_matter(document: Document, asset_records: list[dict[str, Any]]) -> str:
    values = {
        "archive_kind": "document",
        "archive_id": document.doc_id,
        "title": document.title,
        "source_url": document.source_url,
        "source_type": document.source_type,
        "status": document.status,
        "captured_at": document.captured_at,
        "provenance": document.provenance,
        "assets": asset_records,
    }
    return "---\n" + "\n".join(f"{key}: {json_scalar(value)}" for key, value in values.items()) + "\n---\n"


def render_document(
    document: Document,
    output_dir: Path,
    *,
    source_urls_in_body: bool = True,
) -> str:
    content = ""
    if document.content_file:
        content = document.content_file.read_text(encoding="utf-8").strip()
    if not content:
        content = "_No local body content has been captured for this source yet._"

    asset_dir_name = document.output_name
    declared = {asset.asset_id: asset for asset in document.assets}
    referenced = set(ASSET_URI_RE.findall(content))
    non_placeholder_images = sorted(
        target for target in MARKDOWN_IMAGE_RE.findall(content) if not target.startswith("feishu-asset://")
    )
    if non_placeholder_images:
        raise ArchiveError(
            f"Document {document.doc_id!r} has image links that are not local-asset placeholders: "
            + ", ".join(non_placeholder_images)
        )
    missing = sorted(referenced - declared.keys())
    if missing:
        raise ArchiveError(f"Document {document.doc_id!r} references undeclared assets: {', '.join(missing)}")

    asset_records: list[dict[str, Any]] = []
    asset_targets: dict[str, str] = {}
    for asset in document.assets:
        target_dir = output_dir / "_assets" / asset_dir_name
        target_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(asset.source, target_dir / asset.filename)
        relative_path = f"_assets/{asset_dir_name}/{asset.filename}"
        asset_targets[asset.asset_id] = link_url(relative_path)
        asset_records.append(
            {
                "id": asset.asset_id,
                "path": relative_path,
                "source_url": asset.source_url,
                "caption": asset.caption,
                "provenance": asset.provenance,
            }
        )
    # Replace complete placeholders in one pass.  Repeated str.replace calls
    # can corrupt an ID that is a prefix of another ID (for example ``a`` and
    # ``a-2``), especially now that non-image file downloads are assets too.
    content = ASSET_URI_RE.sub(lambda match: asset_targets[match.group(1)], content)

    unused = sorted(declared.keys() - referenced)
    metadata_rows = [
        ("Source type", escape_table(document.source_type)),
        ("Archive status", f"`{escape_table(document.status)}`"),
        ("Captured at", escape_table(document.captured_at) or "Not recorded"),
        ("Archive ID", f"`{escape_table(document.doc_id)}`"),
    ]
    if source_urls_in_body:
        metadata_rows.insert(0, ("Source", f"[{document.source_url}]({document.source_url})"))
    lines = [
        document_front_matter(document, asset_records).rstrip(),
        "",
        f"# {document.title}",
        "",
        "## Archive metadata",
        "",
        "| Field | Value |",
        "| --- | --- |",
    ]
    lines.extend(f"| {field} | {value} |" for field, value in metadata_rows)
    if unused:
        lines.extend(["", f"<!-- Unreferenced copied assets: {', '.join(unused)} -->"])
    lines.extend(["", "## Captured content", "", content, ""])
    return "\n".join(lines)


def render_folder_index(
    archive: dict[str, Any],
    folder: Folder,
    folders: dict[tuple[str, ...], Folder],
    documents: list[Document],
    *,
    source_urls_in_body: bool = True,
) -> str:
    title = folder.path[-1] if folder.path else required_text(archive.get("title"), "archive.title")
    child_folders = [item for path, item in folders.items() if len(path) == len(folder.path) + 1 and path[:-1] == folder.path]
    child_documents = [document for document in documents if document.folder_path == folder.path]
    child_folders.sort(key=lambda item: (item.order, item.path[-1].casefold()))
    child_documents.sort(key=lambda item: (item.order, item.title.casefold()))

    counts = Counter(document.status for document in documents if document.folder_path[: len(folder.path)] == folder.path)
    lines = [folder_front_matter(folder, title).rstrip(), "", f"# {title}", ""]
    if folder.source_url and source_urls_in_body:
        lines.extend(
            [
                f"Source folder: [{folder.source_url}]({folder.source_url})  ",
                f"Archive status: `{folder.status}`",
                "",
            ]
        )
    if folder.path:
        parent_target = PurePosixPath(*folder.path[:-1], "README.md")
        lines.extend([f"[← Parent index]({relative_link(folder.path, parent_target)})", ""])

    if counts:
        ordered_statuses = list(KNOWN_STATUSES) + sorted(set(counts) - set(KNOWN_STATUSES))
        summary = ", ".join(f"{status}: {counts[status]}" for status in ordered_statuses if counts[status])
        lines.extend([f"Documents in this subtree: **{sum(counts.values())}** ({summary}).", ""])

    lines.extend(["## Contents", ""])
    if not child_folders and not child_documents:
        lines.extend(["_No child items captured._", ""])
        return "\n".join(lines)

    for child in child_folders:
        target = PurePosixPath(*child.path, "README.md")
        synthetic = " · metadata pending" if not child.explicit else ""
        lines.append(f"- 📁 [{child.path[-1]}]({relative_link(folder.path, target)}) — `{child.status}`{synthetic}")
    for document in child_documents:
        target = PurePosixPath(*document.folder_path, f"{document.output_name}.md")
        lines.append(f"- 📄 [{document.title}]({relative_link(folder.path, target)}) — `{document.status}` · {document.source_type}")
    lines.append("")
    return "\n".join(lines)


def build_archive(manifest_path: Path, output: Path, *, validate_only: bool = False) -> tuple[int, int, Counter[str]]:
    archive, folders, documents = parse_manifest(manifest_path)
    source_urls_in_body = not bool(archive.get("source_urls_in_front_matter_only", False))
    counts = Counter(document.status for document in documents)
    if validate_only:
        for document in documents:
            if document.content_file:
                content = document.content_file.read_text(encoding="utf-8")
                declared = {asset.asset_id for asset in document.assets}
                missing = set(ASSET_URI_RE.findall(content)) - declared
                if missing:
                    raise ArchiveError(f"Document {document.doc_id!r} references undeclared assets: {', '.join(sorted(missing))}")
                non_placeholder_images = sorted(
                    target for target in MARKDOWN_IMAGE_RE.findall(content) if not target.startswith("feishu-asset://")
                )
                if non_placeholder_images:
                    raise ArchiveError(
                        f"Document {document.doc_id!r} has image links that are not local-asset placeholders: "
                        + ", ".join(non_placeholder_images)
                    )
        return len(folders) - 1, len(documents), counts

    output = output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists() and not (output / MANAGED_MARKER).is_file():
        raise ArchiveError(f"Refusing to replace unmanaged output directory: {output}")

    temporary = Path(tempfile.mkdtemp(prefix=f".{output.name}-", dir=output.parent))
    try:
        (temporary / MANAGED_MARKER).write_text("Generated output; edit capture sources and rebuild.\n", encoding="utf-8")
        for path in sorted(folders, key=lambda value: (len(value), value)):
            destination = temporary.joinpath(*path)
            destination.mkdir(parents=True, exist_ok=True)
            index = render_folder_index(
                archive,
                folders[path],
                folders,
                documents,
                source_urls_in_body=source_urls_in_body,
            )
            (destination / "README.md").write_text(index, encoding="utf-8")
        for document in documents:
            destination = temporary.joinpath(*document.folder_path)
            destination.mkdir(parents=True, exist_ok=True)
            rendered = render_document(
                document,
                destination,
                source_urls_in_body=source_urls_in_body,
            )
            (destination / f"{document.output_name}.md").write_text(rendered, encoding="utf-8")

        backup = output.with_name(f".{output.name}.previous")
        if backup.exists():
            shutil.rmtree(backup)
        if output.exists():
            output.rename(backup)
        try:
            temporary.rename(output)
        except Exception:
            if backup.exists() and not output.exists():
                backup.rename(output)
            raise
        if backup.exists():
            shutil.rmtree(backup)
    finally:
        if temporary.exists():
            shutil.rmtree(temporary)
    return len(folders) - 1, len(documents), counts


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=Path("docs/feishu-archive/archive-manifest.json"))
    parser.add_argument("--output", type=Path, default=Path("docs/feishu-archive/library"))
    parser.add_argument("--validate-only", action="store_true", help="Validate inputs without writing the archive")
    args = parser.parse_args()
    try:
        folder_count, document_count, counts = build_archive(args.manifest, args.output, validate_only=args.validate_only)
    except ArchiveError as exc:
        raise SystemExit(f"ERROR: {exc}") from exc
    status_summary = ", ".join(f"{status}={count}" for status, count in sorted(counts.items())) or "no documents"
    action = "Validated" if args.validate_only else "Built"
    print(f"{action} {folder_count} folders and {document_count} documents ({status_summary})")
    if not args.validate_only:
        print(f"Archive index: {(args.output.resolve() / 'README.md')}")


if __name__ == "__main__":
    main()
