#!/usr/bin/env python3
"""Strict local completion audit for NKU-iGEM26 source and generated pages."""

from __future__ import annotations

import argparse
import html
import importlib.util
import json
import re
import sys
from pathlib import Path


META_RE = re.compile(r"^\s*<!--META(?P<meta>.*?)-->\s*", re.S)
ID_RE = re.compile(r"\bid=[\"']([^\"']+)[\"']", re.I)
TOC_TAG_RE = re.compile(r"<[^>]+\bdata-toc(?:-sub)?=[\"'][^\"']*[\"'][^>]*>", re.I)
EXTERNAL_RUNTIME_RE = re.compile(
    r"<(?:script|img|iframe)\b[^>]*\bsrc=[\"']https?://|<link\b[^>]*\bhref=[\"']https?://",
    re.I,
)
# iGEM's own hosts are the only runtime origins the competition allows.
IGEM_RUNTIME_HOSTS = ("video.igem.org", "static.igem.wiki")

def external_runtime_hits(source: str) -> list[str]:
    hits = []
    for match in EXTERNAL_RUNTIME_RE.finditer(source):
        tail = source[match.end() - 8 : match.end() + 120]
        if not any(host in tail for host in IGEM_RUNTIME_HOSTS):
            hits.append(match.group(0))
    return hits
RESOURCE_RE = re.compile(
    r"<(?P<tag>a|img|script|link)\b[^>]*\b(?:href|src)=[\"'](?P<value>[^\"']+)[\"']",
    re.I,
)

STANDARD_ROUTES = {
    "contribution",
    "engineering",
    "human-practices",
    "education",
    "entrepreneurship",
    "hardware",
    "inclusivity",
    "model",
    "safety-and-security",
    "software",
    "sustainability",
}

FORBIDDEN_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("placeholder class", re.compile(r"placeholder-tag|content-slot|slot-chip", re.I)),
    ("placeholder wording", re.compile(r"figure placeholder|pending documentation|reference to add|content slot", re.I)),
    ("template token", re.compile(r"\{\{[^}]+\}\}")),
    ("draft marker", re.compile(r"\b(?:TODO|TBD)\b", re.I)),
    ("fake person", re.compile(r"\b(?:Member|Advisor|Instructor) name\b", re.I)),
    ("fake relationship", re.compile(r"\b(?:Team|Partner) name\b", re.I)),
    ("editing instruction", re.compile(r"Editor's note|Replace (?:with|the)|Add (?:your|real|final|activity|market|reach|instructor|advisor|partnership|collaboration)|Insert (?:CAD|equations|figure)|Confirm official", re.I)),
    ("untraced concentration", re.compile(r"5\s*(?:-|–|&ndash;|&#8211;)\s*100\s*nM", re.I)),
    ("untraced proportion", re.compile(r"60\s*(?:-|–|&ndash;|&#8211;)\s*82\s*%", re.I)),
    ("untraced timing", re.compile(r"24\s*(?:-|–|&ndash;|&#8211;)\s*72\s*(?:h|hours?)\b", re.I)),
)

OVERCLAIM_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("working sensor", re.compile(r"\b(?:working|functional|validated|completed)\s+(?:biosensor|sensor|detector)\b", re.I)),
    ("end-to-end success", re.compile(r"\b(?:validated|demonstrated|proved|achieved)\b.{0,35}\bend[- ]to[- ]end\b", re.I | re.S)),
    ("unsupported field readiness", re.compile(r"\b(?:field[- ]ready|ready for field deployment|validated in soil)\b", re.I)),
    ("unsupported receptor claim", re.compile(r"\bGpr[23]\b.{0,45}\b(?:detects?|binds?|responds? to)\b.{0,20}\bascr#18\b", re.I | re.S)),
    ("unsupported metric", re.compile(r"\b(?:limit of detection|LOD|sensitivity|specificity|response time)\b\s*(?:is|was|of|:)\s*\d", re.I)),
)

NEGATION_RE = re.compile(
    r"\b(?:no|not|never|without|unknown|unproven|unvalidated|inconclusive|"
    r"does not|did not|has not|have not|is not|are not|remains? to|requires? validation)\b",
    re.I,
)


FRONT_RE = re.compile(r"^\ufeff?---[ \t]*\n(?P<meta>.*?)\n---[ \t]*(?:\n|$)", re.S)


def parse_front_meta(source: str, path: Path, failures: list[str]) -> tuple[dict[str, str], str]:
    """Front matter for Markdown pages. The renderer is the source of truth for the body."""
    match = FRONT_RE.match(source)
    if not match:
        failures.append(f"{path}: missing leading front matter")
        return {}, source
    meta: dict[str, str] = {}
    for line in match.group("meta").splitlines():
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        meta[key.strip()] = value
    for required in ("title", "group", "summary"):
        if not meta.get(required):
            failures.append(f"{path}: front matter missing {required}")
    return meta, source[match.end() :]


def parse_meta(source: str, path: Path, failures: list[str]) -> tuple[dict[str, str], str]:
    match = META_RE.match(source)
    if not match:
        failures.append(f"{path}: missing leading META block")
        return {}, source
    meta: dict[str, str] = {}
    for line in match.group("meta").splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip()
    required_fields = ("title",) if path.stem == "index" else ("title", "crumbs", "eyebrow", "heading", "sub", "meta")
    for required in required_fields:
        if not meta.get(required):
            failures.append(f"{path}: META missing {required}")
    return meta, source[match.end() :]


def has_unnegated_match(source: str, pattern: re.Pattern[str]) -> bool:
    for match in pattern.finditer(source):
        left_boundary = max(source.rfind(".", 0, match.start()), source.rfind("!", 0, match.start()), source.rfind("?", 0, match.start()), source.rfind("\n", 0, match.start()))
        right_candidates = [pos for pos in (source.find(".", match.end()), source.find("!", match.end()), source.find("?", match.end()), source.find("\n", match.end())) if pos >= 0]
        right_boundary = min(right_candidates) if right_candidates else min(len(source), match.end() + 160)
        sentence = source[left_boundary + 1 : right_boundary]
        if not NEGATION_RE.search(sentence):
            return True
    return False


def render_markdown_page(path: Path, body: str, failures: list[str]) -> str:
    """Run the real build pipeline so the audit sees what a reader will see."""
    spec = importlib.util.spec_from_file_location("wiki_md_for_audit", path.parent.parent / "wikimd.py")
    wikimd = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(path.parent.parent))
    try:
        spec.loader.exec_module(wikimd)
        root = path.parent.parent
        ctx = wikimd.RenderContext(
            path.stem,
            wikimd.load_bibliography(root / "_data" / "references.bib"),
            wikimd.load_glossary(root / "_data" / "glossary.json"),
        )
        return wikimd.render_article(body, ctx)
    except Exception as error:  # noqa: BLE001 - the audit reports, it does not crash
        failures.append(f"{path}: Markdown page does not render ({error})")
        return ""
    finally:
        sys.path.remove(str(path.parent.parent))


def audit_source(path: Path, failures: list[str]) -> dict[str, int | str | bool]:
    source = path.read_text(encoding="utf-8")
    if path.suffix == ".md":
        meta, markdown_body = parse_front_meta(source, path, failures)
        body = render_markdown_page(path, markdown_body, failures)
        # `{{P}}` and `page:` are build-time link tokens; the generated-page pass
        # checks what they resolve to, so strip them before the wording checks.
        source = source + body.replace("{{P}}", "").replace('"page:', '"')
    else:
        meta, body = parse_meta(source, path, failures)
    # Audit the authored homepage composition, not empty include comments.
    if "<!-- HOME:" in body:
        spec = importlib.util.spec_from_file_location("wiki_build_for_audit", path.parent.parent / "build.py")
        builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        # The homepage is always at the output root; its normal prefix is empty.
        body = builder.expand_home_partials(body).replace("{{P}}", "")
        source = META_RE.match(source).group(0) + body
    for label, pattern in FORBIDDEN_PATTERNS:
        if pattern.search(source):
            failures.append(f"{path}: {label}")
    for label, pattern in OVERCLAIM_PATTERNS:
        if has_unnegated_match(source, pattern):
            failures.append(f"{path}: {label}")
    ids = ID_RE.findall(body)
    duplicates = sorted({value for value in ids if ids.count(value) > 1})
    if duplicates:
        failures.append(f"{path}: duplicate ids {duplicates}")
    for tag in TOC_TAG_RE.findall(body):
        if not ID_RE.search(tag):
            failures.append(f"{path}: data-toc marker without id: {tag[:100]}")
    for hit in external_runtime_hits(body):
        failures.append(f"{path}: external runtime resource: {hit[:60]}")
    if "<section" not in body:
        failures.append(f"{path}: no sections")
    return {
        "slug": path.stem,
        "route": meta.get("route", "").strip("/"),
        "sections": len(re.findall(r"<section\b", body, re.I)),
        "hidden": meta.get("hidden", "false").strip().lower() in {"true", "yes", "1", "on"},
        "draft": meta.get("draft", "false").strip().lower() in {"true", "yes", "1", "on"},
    }


def audit_generated(root: Path, failures: list[str], expected_count: int) -> None:
    generated = [root / "index.html", *sorted((root / "pages").glob("*.html"))]
    generated += sorted(
        path for path in root.glob("**/index.html")
        if path.parent != root and not any(part.startswith("_") for part in path.parts)
    )
    seen: set[Path] = set()
    for path in generated:
        if not path.exists() or path in seen:
            continue
        seen.add(path)
        source = path.read_text(encoding="utf-8")
        for label, pattern in FORBIDDEN_PATTERNS:
            if pattern.search(source):
                failures.append(f"{path}: generated {label}")
        for hit in external_runtime_hits(source):
            failures.append(f"{path}: generated external runtime resource: {hit[:60]}")
        for match in RESOURCE_RE.finditer(source):
            value = html.unescape(match.group("value")).strip()
            if not value or value.startswith(("http://", "https://", "mailto:", "tel:", "javascript:", "data:")):
                continue
            path_part, _, fragment = value.partition("#")
            target = path if not path_part else (path.parent / path_part).resolve()
            if target.is_dir() or path_part.endswith("/"):
                target = target / "index.html"
            if not target.exists():
                failures.append(f"{path}: broken local resource {value}")
                continue
            if fragment and target.suffix.lower() in {".html", ".htm"}:
                target_source = target.read_text(encoding="utf-8")
                fragment_re = re.compile(rf"\bid=[\"']{re.escape(fragment)}[\"']", re.I)
                if not fragment_re.search(target_source):
                    failures.append(f"{path}: missing fragment target {value}")
    if len(seen) != expected_count:
        failures.append(f"generated page count is {len(seen)}, expected {expected_count}")


def audit_igem_2026_controls(root: Path, results: list[dict[str, int | str | bool]], failures: list[str]) -> None:
    by_route = {str(result["route"]): result for result in results if result["route"]}
    nav_path = root / "_data" / "nav.json"
    if nav_path.exists():
        nav = json.loads(nav_path.read_text(encoding="utf-8"))
        slugs = {result["slug"] for result in results}
        listed = [item["page"] for group in nav["groups"] for item in group["items"]]
        listed.append(nav["awards"]["page"])
        for page in listed:
            if page not in slugs:
                failures.append(f"_data/nav.json points to a page that does not exist: {page}")

    for route in sorted(STANDARD_ROUTES):
        result = by_route.get(route)
        if result is None:
            failures.append(f"missing 2026 Standard URL route: /{route}")
            continue
        if result["hidden"]:
            failures.append(f"2026 Standard URL route is hidden from search: /{route}")
        if result["draft"]:
            failures.append(f"2026 Standard URL route is draft: /{route}")

    required_files = ("LICENSE", ".gitlab-ci.yml")
    for name in required_files:
        if not (root / name).exists():
            failures.append(f"missing iGEM repository control file: {name}")

    gitignore = (root / ".gitignore").read_text(encoding="utf-8") if (root / ".gitignore").exists() else ""
    if not re.search(r"(?m)^/?public/?$", gitignore):
        failures.append(".gitignore must exclude CI-generated public output")

    pipeline = (root / ".gitlab-ci.yml").read_text(encoding="utf-8") if (root / ".gitlab-ci.yml").exists() else ""
    for marker in ("python3 build.py", "public", "artifacts"):
        if marker not in pipeline:
            failures.append(f".gitlab-ci.yml missing required marker: {marker}")

    footer = (root / "_partials" / "footer.html").read_text(encoding="utf-8")
    for marker in ("creativecommons.org/licenses/by/4.0", "{{SOURCE_REPOSITORY_URL}}", "licensing/"):
        if marker not in footer:
            failures.append(f"footer missing 2026 compliance marker: {marker}")
    if "nankai-seal" in footer.lower():
        failures.append("footer still embeds an uncredited institutional seal")

    licensing = root / "_content" / "licensing.html"
    if not licensing.exists():
        failures.append("missing public licensing and responsible-AI disclosure page")
    else:
        text = licensing.read_text(encoding="utf-8").lower()
        for marker in ("cc by 4.0", "openai codex", "anthropic claude", "human review", "ai-generated"):
            if marker not in text:
                failures.append(f"licensing page missing disclosure marker: {marker}")


def audit_drafts(root: Path, sources: list[Path], failures: list[str]) -> None:
    draft_dir = root / "docs" / "page-drafts"
    drafts = sorted(path for path in draft_dir.glob("*.md") if path.name != "README.md")
    # Markdown pages are the draft: they are readable source, so they need no mirror.
    expected = {path.stem for path in sources if path.suffix == ".html"}
    actual = {path.stem for path in drafts}
    if actual != expected:
        failures.append(f"Markdown draft slug mismatch: missing={sorted(expected-actual)} extra={sorted(actual-expected)}")
    for path in drafts:
        source = path.read_text(encoding="utf-8")
        for label, pattern in FORBIDDEN_PATTERNS:
            if pattern.search(source):
                failures.append(f"{path}: draft {label}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--generated", action="store_true")
    parser.add_argument("--generated-root", type=Path)
    parser.add_argument("--drafts", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    sources = sorted(list((root / "_content").glob("*.html")) + list((root / "_content").glob("*.md")))
    failures: list[str] = []
    results = [audit_source(path, failures) for path in sources]
    audit_igem_2026_controls(root, results, failures)
    if any(result["draft"] for result in results):
        failures.append("one or more source pages are marked draft")
    if args.generated:
        generated_root = (args.generated_root or (root / "public")).resolve()
        audit_generated(generated_root, failures, len([result for result in results if not result["draft"]]))
    if args.drafts:
        audit_drafts(root, sources, failures)
    print(
        f"sources={len(sources)} sections={sum(int(result['sections']) for result in results)} "
        f"hidden={sum(bool(result['hidden']) for result in results)} drafts={sum(bool(result['draft']) for result in results)}"
    )
    if failures:
        print(f"FAIL ({len(failures)})")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
