#!/usr/bin/env python3
"""Convert authenticated Feishu browser captures into a private local archive.

The capture step writes one directory per document (metadata.json, record.json,
content.html/content.txt, image-map.json and images/) plus folder-*/folder.json
records.  This tool turns that raw snapshot into clean Markdown source files,
generates archive-manifest.json, then delegates final indexing and asset copying
to build_feishu_archive.py.

The generated manifest, converted sources and library are private local data.
Authenticated Feishu URLs are kept in YAML front matter only; body links to a
known captured document become local relative links and other Feishu links are
rendered as plain labels.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import posixpath
import re
import shutil
import tempfile
import unicodedata
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from typing import Any, Callable, Iterable
from urllib.parse import quote, unquote, urljoin, urlparse

from build_feishu_archive import ArchiveError, build_archive, default_output_name


CAPTURE_MARKER = ".generated-by-convert-feishu-captures"
TOKEN_RE = re.compile(r"^[A-Za-z0-9._-]+$")
FEISHU_TOKEN_URL_RE = re.compile(
    r"/(?:docx|wiki|file|slides|sheets|base|mindnotes|drive/folder)/([A-Za-z0-9._-]+)"
)
DRIVE_TOKEN_RE = re.compile(
    r"(?:drivetoken://|/(?:all|preview)/)([A-Za-z0-9._-]{12,})"
)
PLAIN_URL_RE = re.compile(r"https?://[^\s<>\])}]+")
LOCAL_RASTER_TYPES = {
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}
BLOCK_TAGS = {
    "blockquote",
    "byte-sheet-html-origin",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "ol",
    "p",
    "table",
    "ul",
}
VOID_TAGS = {"br", "col", "hr", "img", "meta", "source", "wbr"}
IGNORED_TAGS = {"head", "meta", "script", "style"}


class ConversionError(ValueError):
    """Raised when raw captures cannot be converted safely."""


@dataclass
class HtmlNode:
    tag: str
    attrs: dict[str, str]
    children: list[HtmlNode | str] = field(default_factory=list)
    parent: HtmlNode | None = None


class FragmentParser(HTMLParser):
    """Small tolerant HTML tree builder using only the Python standard library."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = HtmlNode("document", {})
        self.stack = [self.root]

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        node = HtmlNode(tag, {key: value or "" for key, value in attrs}, parent=self.stack[-1])
        self.stack[-1].children.append(node)
        if tag not in VOID_TAGS:
            self.stack.append(node)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        if tag.lower() not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, data: str) -> None:
        self.stack[-1].children.append(data)


@dataclass(frozen=True)
class FolderCapture:
    token: str
    title: str
    parent: str
    url: str
    captured_at: str
    entries: tuple[dict[str, Any], ...]
    raw: dict[str, Any]


@dataclass
class DocumentCapture:
    token: str
    title: str
    parent: str
    url: str
    source_type: str
    captured_at: str
    directory: Path | None
    metadata: dict[str, Any]
    entry: dict[str, Any] | None = None
    folder_path: tuple[str, ...] = ()
    output_name: str = ""
    order: int = 0


@dataclass
class ConversionStats:
    folders: int = 0
    documents: int = 0
    captured_documents: int = 0
    discovered_documents: int = 0
    body_documents: int = 0
    image_only_documents: int = 0
    empty_documents: int = 0
    unavailable_documents: int = 0
    file_documents: int = 0
    images: int = 0
    missing_images: int = 0
    files: int = 0
    missing_files: int = 0
    embedded_files_localized: int = 0
    missing_embedded_files: int = 0
    local_document_links: int = 0
    stripped_feishu_links: int = 0


def read_json(path: Path, *, expected: type | tuple[type, ...] = dict) -> Any:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ConversionError(f"Missing capture file: {path}") from exc
    except json.JSONDecodeError as exc:
        raise ConversionError(f"Invalid JSON in {path}: {exc}") from exc
    if not isinstance(value, expected):
        expected_name = (
            "/".join(item.__name__ for item in expected)
            if isinstance(expected, tuple)
            else expected.__name__
        )
        raise ConversionError(f"{path} must contain a JSON {expected_name}")
    return value


def text(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def safe_token(value: str, context: str) -> str:
    if not TOKEN_RE.fullmatch(value):
        raise ConversionError(f"Unsafe token in {context}: {value!r}")
    return value


def safe_folder_title(value: str, token: str) -> str:
    value = unicodedata.normalize("NFC", value).strip()
    value = value.replace("/", "／").replace("\\", "＼").replace("\0", "")
    if not value or value in {".", ".."} or value.casefold() in {"readme.md", "_assets"}:
        return f"未命名文件夹-{token[:8]}"
    return value


def source_type_from_url(url: str) -> str:
    parts = [part for part in urlparse(url).path.split("/") if part]
    if parts:
        kind = parts[0].lower()
        return {"docx": "docx", "wiki": "wiki", "file": "file", "slides": "slides", "sheets": "sheet"}.get(kind, kind)
    return "folder-entry"


def token_from_url(url: str) -> str:
    match = FEISHU_TOKEN_URL_RE.search(urlparse(url).path)
    return match.group(1) if match else ""


def is_feishu_url(url: str) -> bool:
    hostname = (urlparse(url).hostname or "").lower()
    return hostname == "feishu.cn" or hostname.endswith(".feishu.cn") or hostname.endswith(".larksuite.com")


def discover_folders(captures_root: Path) -> dict[str, FolderCapture]:
    folders: dict[str, FolderCapture] = {}
    for path in sorted(captures_root.glob("folder-*/folder.json")):
        raw = read_json(path)
        token = safe_token(text(raw.get("token")) or path.parent.name.removeprefix("folder-"), str(path))
        title = text(raw.get("title")) or f"未命名文件夹-{token[:8]}"
        entries = raw.get("entries", [])
        if not isinstance(entries, list):
            raise ConversionError(f"folder entries must be an array: {path}")
        folders[token] = FolderCapture(
            token=token,
            title=safe_folder_title(title, token),
            parent=text(raw.get("parent")),
            url=text(raw.get("url")),
            captured_at=text(raw.get("captured_at")),
            entries=tuple(item for item in entries if isinstance(item, dict)),
            raw=raw,
        )
    return folders


def discover_documents(captures_root: Path, folders: dict[str, FolderCapture]) -> dict[str, DocumentCapture]:
    documents: dict[str, DocumentCapture] = {}
    for directory in sorted(captures_root.iterdir()):
        metadata_path = directory / "metadata.json"
        if not directory.is_dir() or not metadata_path.is_file():
            continue
        metadata = read_json(metadata_path)
        # Other private local archives may coexist under captures/ and use their
        # own metadata schema (for example a locally rendered PDF).  This
        # converter only owns Feishu records with the capture token/url pair.
        if not text(metadata.get("token")) and not text(metadata.get("url")):
            continue
        token = safe_token(text(metadata.get("token")) or directory.name, str(metadata_path))
        url = text(metadata.get("url"))
        if not url:
            raise ConversionError(f"Captured document has no source URL: {metadata_path}")
        if token in documents:
            raise ConversionError(
                f"Duplicate capture token {token!r}: {documents[token].directory} and {directory}"
            )
        documents[token] = DocumentCapture(
            token=token,
            title=text(metadata.get("title")) or f"未命名文档-{token[:8]}",
            parent=text(metadata.get("parent")),
            url=url,
            source_type=source_type_from_url(url),
            captured_at=text(metadata.get("captured_at")),
            directory=directory,
            metadata=metadata,
        )

    # Folder listings can contain files that have been discovered but whose body
    # has not yet been captured.  Keep them as honest, browsable stubs.
    for folder in folders.values():
        for index, entry in enumerate(folder.entries):
            href = text(entry.get("href"))
            absolute_url = urljoin(folder.url or "https://nankai.feishu.cn/", href)
            token = token_from_url(absolute_url)
            if not token:
                seed = f"{folder.token}\0{index}\0{href}\0{text(entry.get('title'))}"
                token = f"entry-{hashlib.sha256(seed.encode()).hexdigest()[:20]}"
            safe_token(token, f"entry {index} in folder {folder.token}")
            if token in folders:
                continue
            if token in documents:
                if documents[token].entry is None:
                    documents[token].entry = entry
                continue
            title = text(entry.get("title")) or text(entry.get("display")).splitlines()[0].strip()
            documents[token] = DocumentCapture(
                token=token,
                title=title or f"未命名条目-{token[:8]}",
                parent=folder.token,
                url=absolute_url or folder.url,
                source_type=source_type_from_url(absolute_url),
                captured_at=folder.captured_at,
                directory=None,
                metadata={},
                entry=entry,
            )
    return documents


def assign_paths(
    folders: dict[str, FolderCapture],
    documents: dict[str, DocumentCapture],
) -> dict[str, tuple[str, ...]]:
    folder_cache: dict[str, tuple[str, ...]] = {}

    def folder_path(token: str, trail: tuple[str, ...] = ()) -> tuple[str, ...]:
        if token in folder_cache:
            return folder_cache[token]
        if token in trail:
            raise ConversionError(f"Folder parent cycle: {' -> '.join(trail + (token,))}")
        folder = folders[token]
        parent = folder_path(folder.parent, trail + (token,)) if folder.parent in folders else ()
        result = parent + (folder.title,)
        folder_cache[token] = result
        return result

    document_cache: dict[str, tuple[str, ...]] = {}

    def document_folder(token: str, trail: tuple[str, ...] = ()) -> tuple[str, ...]:
        if token in document_cache:
            return document_cache[token]
        if token in trail:
            raise ConversionError(f"Document parent cycle: {' -> '.join(trail + (token,))}")
        document = documents[token]
        if document.parent in folders:
            result = folder_path(document.parent)
        elif document.parent in documents:
            parent = documents[document.parent]
            result = document_folder(parent.token, trail + (token,)) + (
                safe_folder_title(parent.title, parent.token),
            )
        else:
            result = ()
        document_cache[token] = result
        return result

    for token in folders:
        folder_path(token)
    for token, document in documents.items():
        document.folder_path = document_folder(token)

    # Folder listing order is more useful than alphabetical order for notebooks.
    listed_order: dict[tuple[str, str], int] = {}
    for folder in folders.values():
        for index, entry in enumerate(folder.entries):
            entry_token = token_from_url(urljoin(folder.url or "https://nankai.feishu.cn/", text(entry.get("href"))))
            if entry_token:
                listed_order[(folder.token, entry_token)] = index
    for index, document in enumerate(sorted(documents.values(), key=lambda item: item.token)):
        document.order = listed_order.get((document.parent, document.token), 100000 + index)

    used: dict[tuple[str, ...], set[str]] = {}
    for document in sorted(documents.values(), key=lambda item: (item.folder_path, item.order, item.token)):
        names = used.setdefault(document.folder_path, set())
        candidate = default_output_name(document.title)
        if candidate.casefold() in {"readme", "_assets"}:
            candidate = f"{candidate}-{document.token[:8]}"
        if candidate.casefold() in names:
            candidate = f"{candidate}-{document.token[:8]}"
        suffix = 2
        unique = candidate
        while unique.casefold() in names:
            unique = f"{candidate}-{suffix}"
            suffix += 1
        document.output_name = unique
        names.add(unique.casefold())
    return folder_cache


def iter_nodes(node: HtmlNode) -> Iterable[HtmlNode]:
    for child in node.children:
        if isinstance(child, HtmlNode):
            yield child
            yield from iter_nodes(child)


def first_root(node: HtmlNode) -> HtmlNode:
    for child in iter_nodes(node):
        if child.attrs.get("data-lark-html-role") == "root":
            return child
    return node


def normalize_inline_space(value: str) -> str:
    return re.sub(r"[\t\r\n ]+", " ", value)


def clean_inline(value: str) -> str:
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"(?:<br>){3,}", "<br><br>", value)
    return value.strip()


def clean_markdown(value: str) -> str:
    value = value.replace("\u200b", "").replace("\ufeff", "")
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


class MarkdownConverter:
    def __init__(
        self,
        document: DocumentCapture,
        known_targets: dict[str, PurePosixPath],
        downloaded_file_tokens: set[str],
        image_records: dict[str, dict[str, Any]],
        stats: ConversionStats,
    ) -> None:
        self.document = document
        self.known_targets = known_targets
        self.downloaded_file_tokens = downloaded_file_tokens
        self.image_records = image_records
        self.stats = stats
        self.referenced_images: set[str] = set()
        self.missing_images: set[str] = set()
        self.embedded_files: list[dict[str, Any]] = []
        self.unsupported_blocks: Counter[str] = Counter()

    def convert(self, source: str) -> str:
        parser = FragmentParser()
        parser.feed(source)
        parser.close()
        return self.sanitize_authenticated_urls(clean_markdown(self.render_blocks(first_root(parser.root).children)))

    def sanitize_authenticated_urls(self, markdown: str) -> str:
        def replace(match: re.Match[str]) -> str:
            url = match.group(0)
            if not is_feishu_url(url):
                return url
            target_token = token_from_url(url)
            if target_token and target_token in self.known_targets:
                current_dir = PurePosixPath(*self.document.folder_path)
                relative = posixpath.relpath(str(self.known_targets[target_token]), str(current_dir) or ".")
                self.stats.local_document_links += 1
                return f"[本地归档文档]({quote(relative, safe='/._-~')})"
            self.stats.stripped_feishu_links += 1
            return "飞书内部链接（见私密来源元数据）"

        return PLAIN_URL_RE.sub(replace, markdown)

    def render_blocks(self, children: Iterable[HtmlNode | str]) -> str:
        parts: list[str] = []
        text_buffer: list[str] = []

        def flush_text() -> None:
            value = clean_inline("".join(text_buffer))
            text_buffer.clear()
            if value:
                parts.append(value)

        for child in children:
            if isinstance(child, str):
                if child.strip():
                    text_buffer.append(normalize_inline_space(child))
                continue
            if self.is_ignored(child):
                continue
            if self.is_block(child):
                flush_text()
                rendered = self.render_block(child)
                if rendered.strip():
                    parts.append(rendered.strip())
            else:
                text_buffer.append(self.render_inline(child))
        flush_text()
        return "\n\n".join(parts)

    def is_ignored(self, node: HtmlNode) -> bool:
        classes = set(node.attrs.get("class", "").split())
        return node.tag in IGNORED_TAGS or "lark-record-clipboard" in classes

    def is_block(self, node: HtmlNode) -> bool:
        return node.tag in BLOCK_TAGS or bool(node.attrs.get("data-type"))

    def render_block(self, node: HtmlNode) -> str:
        data_type = node.attrs.get("data-type", "")
        classes = set(node.attrs.get("class", "").split())
        if data_type == "image":
            image = next((item for item in iter_nodes(node) if item.tag == "img"), None)
            return self.render_image(image or node)
        if data_type == "quote_container" or node.tag == "blockquote":
            content = self.render_blocks(node.children)
            return "\n".join(f"> {line}" if line else ">" for line in content.splitlines())
        if data_type == "divider" or node.tag == "hr":
            return "---"
        if data_type == "file":
            return self.render_embedded_file(node)
        if data_type in {"whiteboard", "fallback", "folder_manager"}:
            self.unsupported_blocks[data_type] += 1
            label = {"whiteboard": "白板", "fallback": "嵌入内容", "folder_manager": "文件夹组件"}[data_type]
            return f"_[未在本地捕获的飞书{label}]_"
        if node.tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            # The generated page already has a title and a Captured content
            # section, so source headings begin two levels deeper.
            level = min(int(node.tag[1]) + 2, 6)
            return f"{'#' * level} {clean_inline(self.render_inline_children(node))}"
        if node.tag in {"ul", "ol"}:
            return self.render_list(node, 0)
        if node.tag == "table":
            return self.render_table(node)
        if node.tag == "div" and "ace-line" in classes:
            value = clean_inline(self.render_inline_children(node))
            value = re.sub(r"(?:<br>)+$", "", value)
            return value
        if node.tag == "p":
            value = clean_inline(self.render_inline_children(node))
            value = re.sub(r"(?:<br>)+$", "", value)
            return value
        return self.render_blocks(node.children)

    def render_inline_children(self, node: HtmlNode) -> str:
        return "".join(
            normalize_inline_space(child) if isinstance(child, str) else self.render_inline(child)
            for child in node.children
            if not (isinstance(child, HtmlNode) and self.is_ignored(child))
        )

    def render_inline(self, node: HtmlNode) -> str:
        if self.is_ignored(node):
            return ""
        content = self.render_inline_children(node)
        if node.tag == "br":
            return "<br>"
        if node.tag == "img":
            return self.render_image(node)
        if node.tag == "a":
            return self.render_link(node, content)
        if node.tag in {"strong", "b"}:
            return f"**{content.strip()}**" if content.strip() else ""
        if node.tag in {"em", "i"}:
            return f"*{content.strip()}*" if content.strip() else ""
        if node.tag in {"s", "strike", "del"}:
            return f"~~{content.strip()}~~" if content.strip() else ""
        if node.tag == "u":
            return f"<u>{content.strip()}</u>" if content.strip() else ""
        if node.tag == "code":
            ticks = "``" if "`" in content else "`"
            return f"{ticks}{content.strip()}{ticks}" if content.strip() else ""
        if node.tag in {"div", "p"}:
            return f"{clean_inline(content)}<br>" if clean_inline(content) else ""
        if node.tag in {"ul", "ol", "table"}:
            return clean_inline(self.render_block(node).replace("\n", "<br>"))
        return content

    def render_link(self, node: HtmlNode, content: str) -> str:
        label = clean_inline(content) or text(node.attrs.get("title")) or "链接"
        href = text(node.attrs.get("href")) or text(node.attrs.get("data-href"))
        if not href:
            return label
        target_token = token_from_url(href)
        if target_token and target_token in self.known_targets:
            current_dir = PurePosixPath(*self.document.folder_path)
            relative = posixpath.relpath(str(self.known_targets[target_token]), str(current_dir) or ".")
            self.stats.local_document_links += 1
            return f"[{label}]({quote(relative, safe='/._-~')})"
        if is_feishu_url(href):
            self.stats.stripped_feishu_links += 1
            return label
        parsed = urlparse(href)
        if parsed.scheme in {"http", "https", "mailto"}:
            return f"[{label}]({href.replace(' ', '%20')})"
        return label

    def image_token(self, node: HtmlNode) -> str:
        candidates: list[str] = []
        current: HtmlNode | None = node
        for _ in range(3):
            if current is None:
                break
            candidates.extend(current.attrs.values())
            current = current.parent
        for candidate in candidates:
            if candidate.startswith("drivetoken://"):
                token = candidate.removeprefix("drivetoken://").split("/", 1)[0]
                if TOKEN_RE.fullmatch(token):
                    return token
            match = DRIVE_TOKEN_RE.search(candidate)
            if match:
                return match.group(1)
            for token in self.image_records:
                if token in candidate:
                    return token
        source = text(node.attrs.get("src"))
        for token, record in self.image_records.items():
            if source and source in {text(record.get("source_url")), text(record.get("html_src"))}:
                return token
        return ""

    def render_image(self, node: HtmlNode) -> str:
        token = self.image_token(node)
        if not token:
            self.missing_images.add("unknown-token")
            return "_[原文包含一张图片，但镜像中没有可识别的图片 token。]_"
        if token not in self.image_records:
            self.missing_images.add(token)
            return f"_[原文图片 `{token}` 尚未下载到本地镜像。]_"
        self.referenced_images.add(token)
        record = self.image_records[token]
        alt = text(node.attrs.get("alt")) or text(record.get("original_name")) or f"飞书图片 {token}"
        alt = alt.replace("[", "（").replace("]", "）")
        return f"![{alt}](feishu-asset://{token})"

    def render_list(self, node: HtmlNode, depth: int) -> str:
        items = [child for child in node.children if isinstance(child, HtmlNode) and child.tag == "li"]
        if not items:
            return self.render_blocks(node.children)
        ordered = node.tag == "ol"
        try:
            start = int(node.attrs.get("start", "1"))
        except ValueError:
            start = 1
        lines: list[str] = []
        for index, item in enumerate(items):
            nested = [child for child in item.children if isinstance(child, HtmlNode) and child.tag in {"ul", "ol"}]
            body_children = [child for child in item.children if child not in nested]
            body = clean_inline(
                "".join(
                    normalize_inline_space(child) if isinstance(child, str) else self.render_inline(child)
                    for child in body_children
                )
            ).replace("<br><br>", "<br>")
            body = re.sub(r"(?:<br>)+$", "", body)
            prefix = f"{start + index}. " if ordered else "- "
            indentation = "    " * depth
            lines.append(f"{indentation}{prefix}{body}".rstrip())
            for child in nested:
                lines.extend(self.render_list(child, depth + 1).splitlines())
        return "\n".join(lines)

    def render_table(self, node: HtmlNode) -> str:
        row_nodes = [item for item in iter_nodes(node) if item.tag == "tr"]
        rows: list[list[str]] = []
        for row in row_nodes:
            cells = [child for child in row.children if isinstance(child, HtmlNode) and child.tag in {"td", "th"}]
            values: list[str] = []
            for cell in cells:
                value = clean_inline(self.render_inline_children(cell))
                value = re.sub(r"(?:<br>)+$", "", value)
                value = value.replace("|", "\\|").replace("\n", "<br>") or " "
                colspan = 1
                try:
                    colspan = max(1, int(cell.attrs.get("colspan", "1")))
                except ValueError:
                    pass
                values.append(value)
                values.extend(" " for _ in range(colspan - 1))
            if values:
                rows.append(values)
        if not rows:
            return "_[空表格]_"
        width = max(len(row) for row in rows)
        rows = [row + [" "] * (width - len(row)) for row in rows]
        lines = ["| " + " | ".join(rows[0]) + " |", "| " + " | ".join("---" for _ in range(width)) + " |"]
        lines.extend("| " + " | ".join(row) + " |" for row in rows[1:])
        return "\n".join(lines)

    def render_embedded_file(self, node: HtmlNode) -> str:
        name = "未命名附件"
        token = ""
        size: int | None = None
        mime_type = ""
        raw = node.attrs.get("data-meta-block-props", "")
        if raw:
            try:
                metadata = json.loads(raw)
                file_info = metadata.get("props", {}).get("data", {}).get("fileInfo", {})
                if isinstance(file_info, dict):
                    name = text(file_info.get("name")) or name
                    token = text(file_info.get("driveKey")) or text(file_info.get("token"))
                    raw_size = file_info.get("size")
                    size = raw_size if isinstance(raw_size, int) and not isinstance(raw_size, bool) else None
                    mime_type = text(file_info.get("actualType")) or text(file_info.get("mimeType"))
            except (json.JSONDecodeError, AttributeError):
                pass
        if token and TOKEN_RE.fullmatch(token) and token in self.known_targets:
            current_dir = PurePosixPath(*self.document.folder_path)
            relative = posixpath.relpath(str(self.known_targets[token]), str(current_dir) or ".")
            downloaded = token in self.downloaded_file_tokens
            self.embedded_files.append(
                {
                    "name": name,
                    "token": token,
                    "size": size,
                    "mime_type": mime_type,
                    "downloaded": downloaded,
                }
            )
            self.stats.local_document_links += 1
            if downloaded:
                self.stats.embedded_files_localized += 1
                label = f"附件：{name}"
            else:
                label = f"附件索引（原始文件尚未下载）：{name}"
            return f"[{markdown_label(label)}]({quote(relative, safe='/._-~')})"
        self.embedded_files.append(
            {
                "name": name,
                "token": token,
                "size": size,
                "mime_type": mime_type,
                "downloaded": False,
            }
        )
        return f"_[飞书内嵌附件尚未下载：{markdown_label(name)}]_"


def markdown_label(value: str) -> str:
    """Escape the small subset that can break generated Markdown link labels."""

    return value.replace("\\", "＼").replace("[", "（").replace("]", "）").replace("\n", " ").strip()


CAPTURE_SUPPORT_FILES = {
    "metadata.json",
    "record.json",
    "content.html",
    "content.txt",
    "image-map.json",
    "attachment-map.json",
}


def downloaded_payload_files(document: DocumentCapture) -> list[Path]:
    """Return downloaded top-level payloads for a Feishu file capture.

    Browser downloads use ``downloaded_name`` today.  The fallback keeps the
    converter compatible with manually captured files while excluding its own
    capture bookkeeping.  Payloads are deliberately limited to top-level files
    so an unrelated render/cache directory cannot be copied accidentally.
    """

    if document.directory is None or document.source_type != "file":
        return []
    directory = document.directory
    declared_names: list[str] = []
    downloaded_name = text(document.metadata.get("downloaded_name"))
    if downloaded_name:
        declared_names.append(downloaded_name)
    downloaded_files = document.metadata.get("downloaded_files", [])
    if isinstance(downloaded_files, list):
        declared_names.extend(text(item) for item in downloaded_files if text(item))

    result: list[Path] = []
    for name in declared_names:
        if Path(name).name != name or name in {".", ".."}:
            raise ConversionError(f"Unsafe downloaded filename in {directory / 'metadata.json'}: {name!r}")
        candidate = directory / name
        if candidate.is_file() and candidate not in result:
            result.append(candidate)
    if result or declared_names:
        return result
    return sorted(
        path
        for path in directory.iterdir()
        if path.is_file() and path.name not in CAPTURE_SUPPORT_FILES and not path.name.startswith(".")
    )


def rendered_preview_files(document: DocumentCapture) -> tuple[list[tuple[Path, str]], list[str]]:
    """Load optional rendered pages declared by a downloaded PDF/PPTX capture."""

    if document.directory is None:
        return [], []
    raw_pages = document.metadata.get("page_renders", [])
    if not isinstance(raw_pages, list):
        raise ConversionError(f"metadata.page_renders must be an array: {document.directory / 'metadata.json'}")
    previews: list[tuple[Path, str]] = []
    missing: list[str] = []
    directory = document.directory
    resolved_directory = directory.resolve()
    for index, item in enumerate(raw_pages, start=1):
        if not isinstance(item, dict):
            raise ConversionError(
                f"metadata.page_renders[{index - 1}] must be an object: {document.directory / 'metadata.json'}"
            )
        relative = text(item.get("file"))
        if not relative:
            raise ConversionError(
                f"metadata.page_renders[{index - 1}].file is required: {document.directory / 'metadata.json'}"
            )
        candidate = directory / relative
        resolved_candidate = candidate.resolve()
        try:
            resolved_candidate.relative_to(resolved_directory)
        except ValueError as exc:
            raise ConversionError(f"Rendered preview escapes capture directory: {relative!r}") from exc
        if not candidate.is_file():
            missing.append(relative)
            continue
        mime_type = mimetypes.guess_type(candidate.name)[0] or ""
        if not mime_type.startswith("image/"):
            raise ConversionError(f"Rendered preview is not a recognized image: {relative!r}")
        page = item.get("page")
        label = f"页面 {page}" if isinstance(page, int) and not isinstance(page, bool) else f"预览页 {index}"
        previews.append((candidate, label))
    return previews, missing


def unavailable_status(metadata: dict[str, Any]) -> str:
    """Map capture failure hints to the archive's explicit availability states."""

    status = text(metadata.get("status")).lower().replace("_", "-")
    if status in {"no-access", "access-denied", "permission-denied", "unavailable", "deleted"}:
        return "unavailable"
    if status == "blocked":
        return "blocked"
    return ""


def record_summary(directory: Path) -> dict[str, Any]:
    path = directory / "record.json"
    if not path.is_file():
        return {"present": False}
    raw = read_json(path)
    record_map = raw.get("recordMap", {})
    block_types: Counter[str] = Counter()
    if isinstance(record_map, dict):
        for item in record_map.values():
            if isinstance(item, dict):
                snapshot = item.get("snapshot", {})
                if isinstance(snapshot, dict) and text(snapshot.get("type")):
                    block_types[text(snapshot.get("type"))] += 1
    return {
        "present": True,
        "root_id": text(raw.get("rootId")),
        "record_count": len(record_map) if isinstance(record_map, dict) else 0,
        "selected_block_count": len(raw.get("blockIds", [])) if isinstance(raw.get("blockIds"), list) else 0,
        "block_types": dict(sorted(block_types.items())),
    }


def load_image_map(directory: Path) -> list[dict[str, Any]]:
    path = directory / "image-map.json"
    if not path.is_file():
        return []
    values = read_json(path, expected=list)
    result: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, value in enumerate(values):
        if not isinstance(value, dict):
            raise ConversionError(f"image-map entry {index} is not an object: {path}")
        value = dict(value)
        token = safe_token(text(value.get("token")) or text(value.get("name")), f"{path}[{index}]")
        if token in seen:
            raise ConversionError(f"duplicate image token {token!r} in {path}")
        seen.add(token)
        value["token"] = token
        if not value.get("mime_type") and value.get("content_type"):
            value["mime_type"] = value["content_type"]
        result.append(value)
    return result


def raster_mime_type(path: Path) -> str:
    """Identify the small browser-safe raster set accepted for local HTML images."""

    with path.open("rb") as handle:
        header = handle.read(16)
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if header.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if header.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif"
    if len(header) >= 12 and header.startswith(b"RIFF") and header[8:12] == b"WEBP":
        return "image/webp"
    return ""


def load_relative_html_images(
    document: DocumentCapture,
    html_source: str,
    existing_records: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Declare safe capture-local ``img src`` files as managed archive assets.

    Remote images continue through the Feishu token/image-map path.  A local
    image must use a plain relative path, resolve inside the current capture,
    be a non-symlink regular file, and have matching raster extension/magic.
    """

    if not html_source.strip() or document.directory is None:
        return []
    parser = FragmentParser()
    parser.feed(html_source)
    parser.close()
    directory = document.directory
    resolved_directory = directory.resolve()
    used_tokens = {text(item.get("token")) for item in existing_records}
    used_names = {
        (text(item.get("output_filename")) or text(item.get("file"))).casefold()
        for item in existing_records
        if text(item.get("output_filename")) or text(item.get("file"))
    }
    records: list[dict[str, Any]] = []
    seen_sources: set[str] = set()
    for node in iter_nodes(first_root(parser.root)):
        if node.tag != "img":
            continue
        raw_source = text(node.attrs.get("src"))
        if not raw_source or raw_source in seen_sources:
            continue
        parsed = urlparse(raw_source)
        if parsed.scheme in {"http", "https", "data", "blob"} or parsed.netloc:
            continue
        if parsed.scheme:
            raise ConversionError(
                f"Local HTML image must not use a URL scheme in {directory / 'content.html'}: {raw_source!r}"
            )
        if "?" in raw_source or "#" in raw_source or parsed.query or parsed.fragment:
            raise ConversionError(
                f"Local HTML image must use a plain relative path in {directory / 'content.html'}: {raw_source!r}"
            )
        relative = unquote(parsed.path)
        if (
            not relative
            or relative.startswith(('/', '\\'))
            or "\\" in relative
            or any(ord(character) < 32 or ord(character) == 127 for character in relative)
        ):
            raise ConversionError(
                f"Absolute or platform-dependent local image path in {directory / 'content.html'}: {raw_source!r}"
            )
        relative_path = PurePosixPath(relative)
        if relative_path.is_absolute() or any(part in {"", ".", ".."} for part in relative_path.parts):
            raise ConversionError(
                f"Unsafe local image traversal in {directory / 'content.html'}: {raw_source!r}"
            )
        suffix = relative_path.suffix.lower()
        if suffix in {".svg", ".svgz"}:
            raise ConversionError(f"SVG is not accepted as a local raster asset: {raw_source!r}")
        expected_mime = LOCAL_RASTER_TYPES.get(suffix)
        if not expected_mime:
            raise ConversionError(f"Unsupported local image type in {directory / 'content.html'}: {raw_source!r}")
        candidate = directory.joinpath(*relative_path.parts)
        resolved_candidate = candidate.resolve()
        try:
            resolved_candidate.relative_to(resolved_directory)
        except ValueError as exc:
            raise ConversionError(f"Local image escapes capture directory: {raw_source!r}") from exc
        current = directory
        for part in relative_path.parts:
            current = current / part
            if current.is_symlink():
                raise ConversionError(f"Local image path contains a symbolic link: {raw_source!r}")
        if not candidate.is_file():
            raise ConversionError(f"Local HTML image is missing or not a regular file: {candidate}")
        detected_mime = raster_mime_type(candidate)
        if detected_mime != expected_mime:
            raise ConversionError(
                f"Local image extension/content mismatch in {directory / 'content.html'}: "
                f"{raw_source!r} ({detected_mime or 'unrecognized raster'})"
            )
        digest = hashlib.sha256(relative.encode("utf-8")).hexdigest()[:20]
        token = f"local-{digest}"
        suffix_index = 2
        while token in used_tokens:
            token = f"local-{digest}-{suffix_index}"
            suffix_index += 1
        used_tokens.add(token)
        output_filename = relative_path.name
        suffix_index = 2
        original_filename = output_filename
        while output_filename.casefold() in used_names:
            output_filename = f"{Path(original_filename).stem}-{suffix_index}{Path(original_filename).suffix}"
            suffix_index += 1
        used_names.add(output_filename.casefold())
        seen_sources.add(raw_source)
        records.append(
            {
                "token": token,
                "local_path": relative,
                "output_filename": output_filename,
                "html_src": raw_source,
                "original_name": text(node.attrs.get("alt")) or relative_path.name,
                "mime_type": detected_mime,
            }
        )
    return records


def plain_text_to_markdown(source: str) -> str:
    source = source.replace("\r\n", "\n").replace("\r", "\n").strip()
    if not source:
        return ""
    paragraphs: list[str] = []
    buffer: list[str] = []
    for line in source.splitlines():
        stripped = line.strip()
        if not stripped:
            if buffer:
                paragraphs.append("\n".join(buffer))
                buffer = []
            continue
        buffer.append(stripped)
    if buffer:
        paragraphs.append("\n".join(buffer))
    return "\n\n".join(paragraphs)


def build_manifest(
    archive_root: Path,
    captures_root: Path,
    converted_root: Path,
    folders: dict[str, FolderCapture],
    documents: dict[str, DocumentCapture],
    folder_paths: dict[str, tuple[str, ...]],
) -> tuple[dict[str, Any], ConversionStats]:
    stats = ConversionStats(folders=len(folders), documents=len(documents))
    targets = {
        token: PurePosixPath(*document.folder_path, f"{document.output_name}.md")
        for token, document in documents.items()
    }
    payloads_by_token = {
        token: downloaded_payload_files(document)
        for token, document in documents.items()
        if document.directory is not None and document.source_type == "file"
    }
    downloaded_file_tokens = {token for token, payloads in payloads_by_token.items() if payloads}
    manifest_folders: list[dict[str, Any]] = []
    for index, folder in enumerate(sorted(folders.values(), key=lambda item: (folder_paths[item.token], item.token))):
        missing_entries = 0
        for entry in folder.entries:
            target = token_from_url(urljoin(folder.url or "https://nankai.feishu.cn/", text(entry.get("href"))))
            if target and target not in folders:
                target_document = documents.get(target)
                if (
                    target_document is None
                    or target_document.directory is None
                    or bool(unavailable_status(target_document.metadata))
                    or (
                        target_document.source_type == "file"
                        and not payloads_by_token.get(target_document.token)
                    )
                ):
                    missing_entries += 1
        manifest_folders.append(
            {
                "path": list(folder_paths[folder.token]),
                "source_url": folder.url,
                "status": "partial" if missing_entries else "archived",
                "provenance": {
                    "capture_method": "authenticated browser folder listing",
                    "captured_at": folder.captured_at,
                    "token": folder.token,
                    "parent_token": folder.parent,
                    "listed_entries": len(folder.entries),
                    "entries_without_body_capture": missing_entries,
                    "privacy": "Authenticated URL is retained in private front matter only.",
                },
                "order": index,
            }
        )

    manifest_documents: list[dict[str, Any]] = []
    converted_root.mkdir(parents=True, exist_ok=True)
    for document in sorted(documents.values(), key=lambda item: (item.folder_path, item.order, item.title, item.token)):
        if document.directory is None:
            stats.discovered_documents += 1
            manifest_documents.append(
                {
                    "id": document.token,
                    "title": document.title,
                    "folder_path": list(document.folder_path),
                    "output_name": document.output_name,
                    "source_url": document.url,
                    "source_type": document.source_type,
                    "status": "discovered",
                    "captured_at": document.captured_at,
                    "provenance": {
                        "capture_state": "folder-listing-only",
                        "folder_entry": document.entry or {},
                        "privacy": "Authenticated URL is retained in private front matter only.",
                    },
                    "assets": [],
                    "order": document.order,
                }
            )
            continue

        stats.captured_documents += 1
        directory = document.directory
        availability_status = unavailable_status(document.metadata)
        if availability_status:
            stats.unavailable_documents += 1
            note = text(document.metadata.get("note")) or text(document.metadata.get("reason"))
            detail = f"（{markdown_label(note)}）" if note else ""
            markdown = f"_该飞书来源当前无法访问，未捕获正文或文件{detail}。_"
            content_path = converted_root / f"{document.token}.md"
            content_path.write_text(markdown + "\n", encoding="utf-8")
            manifest_documents.append(
                {
                    "id": document.token,
                    "title": document.title,
                    "folder_path": list(document.folder_path),
                    "output_name": document.output_name,
                    "source_url": document.url,
                    "source_type": document.source_type,
                    "status": availability_status,
                    "captured_at": document.captured_at,
                    "provenance": {
                        "capture_method": "authenticated browser access attempt",
                        "capture_state": text(document.metadata.get("status")) or availability_status,
                        "metadata": {key: value for key, value in document.metadata.items() if key != "url"},
                        "privacy": "Authenticated URL is retained in private front matter only.",
                    },
                    "content_file": str(content_path.relative_to(archive_root)),
                    "assets": [],
                    "order": document.order,
                }
            )
            continue

        if document.source_type == "file":
            stats.file_documents += 1
            payloads = payloads_by_token.get(document.token, [])
            previews, missing_previews = rendered_preview_files(document)
            assets: list[dict[str, Any]] = []
            links: list[str] = []
            expected_size = document.metadata.get("size")
            size_mismatches: list[dict[str, Any]] = []
            for index, source in enumerate(payloads, start=1):
                asset_id = f"download-{document.token}" if len(payloads) == 1 else f"download-{document.token}-{index}"
                actual_size = source.stat().st_size
                if (
                    len(payloads) == 1
                    and isinstance(expected_size, int)
                    and not isinstance(expected_size, bool)
                    and expected_size != actual_size
                ):
                    size_mismatches.append({"expected": expected_size, "actual": actual_size, "file": source.name})
                mime_type = text(document.metadata.get("mime_type")) or text(document.metadata.get("content_type"))
                if not mime_type:
                    mime_type = mimetypes.guess_type(source.name)[0] or "application/octet-stream"
                assets.append(
                    {
                        "id": asset_id,
                        "source": str(source.relative_to(archive_root)),
                        "filename": source.name,
                        "caption": source.name,
                        "source_url": "",
                        "provenance": {
                            "capture_method": "downloaded from authenticated Feishu file page",
                            "mime_type": mime_type,
                            "bytes": actual_size,
                        },
                    }
                )
                links.append(f"- [{markdown_label(source.name)}](feishu-asset://{asset_id}) ({actual_size} bytes)")
            preview_links: list[str] = []
            used_asset_names = {item["filename"].casefold() for item in assets}
            for index, (source, label) in enumerate(previews, start=1):
                filename = source.name
                if filename.casefold() in used_asset_names:
                    filename = f"preview-{index:03d}{source.suffix.lower()}"
                suffix = 2
                original_filename = filename
                while filename.casefold() in used_asset_names:
                    filename = f"{Path(original_filename).stem}-{suffix}{Path(original_filename).suffix}"
                    suffix += 1
                used_asset_names.add(filename.casefold())
                asset_id = f"preview-{document.token}-{index}"
                assets.append(
                    {
                        "id": asset_id,
                        "source": str(source.relative_to(archive_root)),
                        "filename": filename,
                        "caption": label,
                        "source_url": "",
                        "provenance": {
                            "capture_method": "locally rendered preview declared by capture metadata",
                            "mime_type": mimetypes.guess_type(source.name)[0] or "application/octet-stream",
                            "bytes": source.stat().st_size,
                        },
                    }
                )
                preview_links.append(f"![{markdown_label(label)}](feishu-asset://{asset_id})")
            stats.files += len(payloads)
            stats.images += len(previews)
            missing_preview_note = ""
            if missing_previews:
                missing_preview_note = "\n\n> 归档提示：以下声明的预览页缺失：" + "、".join(
                    markdown_label(item) for item in missing_previews
                )
            if payloads:
                markdown = "_原始文件已保存到本地镜像。_\n\n" + "\n".join(links)
                if preview_links:
                    markdown += "\n\n### 本地页面预览\n\n" + "\n\n".join(preview_links)
                markdown += missing_preview_note
                status = "partial" if size_mismatches or missing_previews else "archived"
            else:
                stats.missing_files += 1
                declared = text(document.metadata.get("downloaded_name"))
                suffix = f"：{markdown_label(declared)}" if declared else ""
                markdown = f"_已记录此飞书文件，但原始文件尚未下载到本地{suffix}。_"
                if preview_links:
                    markdown += "\n\n### 本地页面预览\n\n" + "\n\n".join(preview_links)
                markdown += missing_preview_note
                status = "partial"
            content_path = converted_root / f"{document.token}.md"
            content_path.write_text(markdown + "\n", encoding="utf-8")
            manifest_documents.append(
                {
                    "id": document.token,
                    "title": document.title,
                    "folder_path": list(document.folder_path),
                    "output_name": document.output_name,
                    "source_url": document.url,
                    "source_type": document.source_type,
                    "status": status,
                    "captured_at": document.captured_at,
                    "provenance": {
                        "capture_method": "authenticated browser file download",
                        "capture_state": "file-downloaded" if payloads else "file-metadata-only",
                        "metadata": {key: value for key, value in document.metadata.items() if key != "url"},
                        "archived_files": len(payloads),
                        "size_mismatches": size_mismatches,
                        "rendered_previews": len(previews),
                        "missing_rendered_previews": missing_previews,
                        "privacy": "Authenticated URL is retained in private front matter only.",
                    },
                    "content_file": str(content_path.relative_to(archive_root)),
                    "assets": assets,
                    "order": document.order,
                }
            )
            continue

        html_path = directory / "content.html"
        text_path = directory / "content.txt"
        html_source = html_path.read_text(encoding="utf-8", errors="replace") if html_path.is_file() else ""
        text_source = text_path.read_text(encoding="utf-8", errors="replace") if text_path.is_file() else ""
        image_values = load_image_map(directory)
        image_values.extend(load_relative_html_images(document, html_source, image_values))
        image_records = {text(value.get("token")): value for value in image_values}
        converter = MarkdownConverter(document, targets, downloaded_file_tokens, image_records, stats)
        body_source = "none"
        markdown = ""
        if html_source.strip():
            markdown = converter.convert(html_source)
            body_source = "content.html"
        if not markdown.strip() and text_source.strip():
            markdown = converter.sanitize_authenticated_urls(plain_text_to_markdown(text_source))
            body_source = "content.txt"

        assets: list[dict[str, Any]] = []
        missing_declared: list[str] = []
        for value in image_values:
            token = text(value.get("token"))
            local_path = text(value.get("local_path"))
            filename = text(value.get("output_filename")) or text(value.get("file"))
            source = directory.joinpath(*PurePosixPath(local_path).parts) if local_path else directory / "images" / filename
            if not filename or not source.is_file():
                converter.missing_images.add(token)
                missing_declared.append(token)
                continue
            assets.append(
                {
                    "id": token,
                    "source": str(source.relative_to(archive_root)),
                    "filename": filename,
                    "caption": text(value.get("original_name")),
                    "source_url": text(value.get("source_url")),
                    "provenance": {
                        "capture_method": "downloaded from authenticated Feishu document capture",
                        "mime_type": text(value.get("mime_type")),
                        "width": value.get("width"),
                        "height": value.get("height"),
                        "original_name": text(value.get("original_name")),
                        "capture_local_path": local_path,
                    },
                }
            )

        unused_images = [token for token in image_records if token not in converter.referenced_images and token not in converter.missing_images]
        if unused_images:
            if markdown:
                markdown += "\n\n"
            markdown += "### 已捕获图片\n\n"
            markdown += "\n\n".join(
                f"![{text(image_records[token].get('original_name')) or f'飞书图片 {token}'}](feishu-asset://{token})"
                for token in unused_images
                if token not in missing_declared
            )

        has_body = bool(markdown.strip()) and body_source != "none"
        image_only = not has_body and bool(assets)
        empty = not has_body and not assets
        if image_only:
            stats.image_only_documents += 1
            prefix = "_本次捕获没有可转换的正文，仅保留下列已下载图片。_"
            markdown = f"{prefix}\n\n{markdown}" if markdown else prefix
        elif empty:
            stats.empty_documents += 1
            markdown = "_本次捕获的正文与图片均为空；这可能是源文档为空，也可能是捕获尚未完成。_"
        else:
            stats.body_documents += 1

        if converter.missing_images:
            missing_list = "、".join(f"`{token}`" for token in sorted(converter.missing_images))
            markdown += f"\n\n> 归档提示：原文中的图片 {missing_list} 尚未保存到本地。"
        missing_embedded_files = [item for item in converter.embedded_files if not item.get("downloaded")]
        if missing_embedded_files:
            stats.missing_embedded_files += len(missing_embedded_files)

        stats.images += len(assets)
        stats.missing_images += len(converter.missing_images)
        content_path = converted_root / f"{document.token}.md"
        content_path.write_text(clean_markdown(markdown) + "\n", encoding="utf-8")
        status = "archived"
        if image_only or empty or converter.missing_images or missing_embedded_files or converter.unsupported_blocks:
            status = "partial"
        provenance = {
            "capture_method": "authenticated browser copy with deterministic local conversion",
            "capture_state": "image-only" if image_only else "empty" if empty else "body-captured",
            "body_source": body_source,
            "source_files": {
                "metadata_json": (directory / "metadata.json").is_file(),
                "record_json": (directory / "record.json").is_file(),
                "content_html": html_path.is_file(),
                "content_txt": text_path.is_file(),
                "image_map_json": (directory / "image-map.json").is_file(),
            },
            "metadata": {key: value for key, value in document.metadata.items() if key != "url"},
            "record_summary": record_summary(directory),
            "archived_images": len(assets),
            "missing_image_tokens": sorted(converter.missing_images),
            "embedded_files": converter.embedded_files,
            "unarchived_embedded_files": missing_embedded_files,
            "unsupported_blocks": dict(sorted(converter.unsupported_blocks.items())),
            "privacy": "Authenticated source and asset URLs are retained in private front matter only.",
        }
        manifest_documents.append(
            {
                "id": document.token,
                "title": document.title,
                "folder_path": list(document.folder_path),
                "output_name": document.output_name,
                "source_url": document.url,
                "source_type": document.source_type,
                "status": status,
                "captured_at": document.captured_at,
                "provenance": provenance,
                "content_file": str(content_path.relative_to(archive_root)),
                "assets": assets,
                "order": document.order,
            }
        )

    manifest = {
        "schema_version": 1,
        "archive": {
            "title": "NKU iGEM 飞书资料本地镜像",
            "source_urls_in_front_matter_only": True,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "capture_summary": {
                "folder_records": stats.folders,
                "documents_total": stats.documents,
                "documents_captured": stats.captured_documents,
                "documents_discovered_only": stats.discovered_documents,
                "documents_with_body": stats.body_documents,
                "documents_image_only": stats.image_only_documents,
                "documents_empty": stats.empty_documents,
                "documents_unavailable": stats.unavailable_documents,
                "file_documents": stats.file_documents,
                "images_archived": stats.images,
                "images_missing": stats.missing_images,
                "files_archived": stats.files,
                "files_missing": stats.missing_files,
                "embedded_files_localized": stats.embedded_files_localized,
                "embedded_files_not_archived": stats.missing_embedded_files,
            },
            "provenance": {
                "scope": "Authenticated NKU iGEM Feishu workspace captures",
                "generator": "tools/convert_feishu_captures.py",
                "privacy": "Private working archive. Review before any public publication.",
                "note": "Capture completeness is not scientific verification.",
            },
        },
        "folders": manifest_folders,
        "documents": manifest_documents,
    }
    return manifest, stats


def replace_converted_directory(target: Path, source: Path) -> None:
    if target.exists() and not (target / CAPTURE_MARKER).is_file():
        raise ConversionError(f"Refusing to replace unmanaged converted directory: {target}")
    backup = target.with_name(f".{target.name}.previous")
    if backup.exists():
        shutil.rmtree(backup)
    if target.exists():
        target.rename(backup)
    try:
        source.rename(target)
    except Exception:
        if backup.exists() and not target.exists():
            backup.rename(target)
        raise
    if backup.exists():
        shutil.rmtree(backup)


def convert_archive(archive_root: Path, *, build_library: bool = True) -> ConversionStats:
    archive_root = archive_root.resolve()
    captures_root = archive_root / "captures"
    manifest_path = archive_root / "archive-manifest.json"
    library_path = archive_root / "library"
    converted_path = captures_root / "_converted"
    if not captures_root.is_dir():
        raise ConversionError(f"Capture directory does not exist: {captures_root}")

    folders = discover_folders(captures_root)
    documents = discover_documents(captures_root, folders)
    folder_paths = assign_paths(folders, documents)

    temporary = Path(tempfile.mkdtemp(prefix=".feishu-converted-", dir=captures_root))
    try:
        (temporary / CAPTURE_MARKER).write_text("Generated output; edit raw captures and reconvert.\n", encoding="utf-8")
        manifest, stats = build_manifest(
            archive_root,
            captures_root,
            temporary,
            folders,
            documents,
            folder_paths,
        )
        # Content paths were calculated against the temporary directory.  Point
        # them at the stable managed directory before writing the manifest.
        for document in manifest["documents"]:
            content_file = document.get("content_file")
            if content_file:
                document["content_file"] = str(PurePosixPath("captures", "_converted", PurePosixPath(content_file).name))
        replace_converted_directory(converted_path, temporary)
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    finally:
        if temporary.exists():
            shutil.rmtree(temporary)

    # Validate even when the caller only wants a manifest.  It catches missing
    # placeholder declarations and unsafe paths before the local library is used.
    build_archive(manifest_path, library_path, validate_only=True)
    if build_library:
        build_archive(manifest_path, library_path)
    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--archive-root",
        type=Path,
        default=Path("docs/feishu-archive"),
        help="Directory containing captures/ and receiving the private manifest/library",
    )
    parser.add_argument("--manifest-only", action="store_true", help="Generate and validate without rebuilding library/")
    args = parser.parse_args()
    try:
        stats = convert_archive(args.archive_root, build_library=not args.manifest_only)
    except (ArchiveError, ConversionError) as exc:
        raise SystemExit(f"ERROR: {exc}") from exc
    print(
        "Converted "
        f"folders={stats.folders} documents={stats.documents} "
        f"(captured={stats.captured_documents}, discovered={stats.discovered_documents}, "
        f"body={stats.body_documents}, image_only={stats.image_only_documents}, empty={stats.empty_documents}, "
        f"files={stats.file_documents}, unavailable={stats.unavailable_documents})"
    )
    print(
        f"Images archived={stats.images} missing={stats.missing_images}; "
        f"files archived={stats.files} missing={stats.missing_files}; "
        f"embedded files localized={stats.embedded_files_localized} not archived={stats.missing_embedded_files}"
    )
    print(
        f"Links localized={stats.local_document_links}; "
        f"authenticated Feishu body links stripped={stats.stripped_feishu_links}"
    )
    if not args.manifest_only:
        print(f"Archive index: {(args.archive_root.resolve() / 'library' / 'README.md')}")


if __name__ == "__main__":
    main()
