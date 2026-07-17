#!/usr/bin/env python3
"""Strict local completion audit for NKU-iGEM26 source and generated pages."""

from __future__ import annotations

import argparse
import html
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
RESOURCE_RE = re.compile(
    r"<(?P<tag>a|img|script|link)\b[^>]*\b(?:href|src)=[\"'](?P<value>[^\"']+)[\"']",
    re.I,
)

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


def audit_source(path: Path, failures: list[str]) -> dict[str, int | str | bool]:
    source = path.read_text(encoding="utf-8")
    meta, body = parse_meta(source, path, failures)
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
    if EXTERNAL_RUNTIME_RE.search(body):
        failures.append(f"{path}: external runtime resource")
    if "<section" not in body:
        failures.append(f"{path}: no sections")
    return {
        "slug": path.stem,
        "sections": len(re.findall(r"<section\b", body, re.I)),
        "hidden": meta.get("hidden", "false").strip().lower() in {"true", "yes", "1", "on"},
        "draft": meta.get("draft", "false").strip().lower() in {"true", "yes", "1", "on"},
    }


def audit_generated(root: Path, failures: list[str]) -> None:
    generated = [root / "index.html", *sorted((root / "pages").glob("*.html"))]
    generated += sorted(
        path for path in root.glob("*/index.html")
        if not path.parent.name.startswith("_")
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
        if EXTERNAL_RUNTIME_RE.search(source):
            failures.append(f"{path}: generated external runtime resource")
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
    if len(seen) != 30:
        failures.append(f"generated page count is {len(seen)}, expected 30")


def audit_drafts(root: Path, sources: list[Path], failures: list[str]) -> None:
    draft_dir = root / "docs" / "page-drafts"
    drafts = sorted(path for path in draft_dir.glob("*.md") if path.name != "README.md")
    expected = {path.stem for path in sources}
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
    parser.add_argument("--drafts", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    sources = sorted((root / "_content").glob("*.html"))
    failures: list[str] = []
    if len(sources) != 30:
        failures.append(f"source page count is {len(sources)}, expected 30")
    results = [audit_source(path, failures) for path in sources]
    if any(result["draft"] for result in results):
        failures.append("one or more source pages are marked draft")
    if args.generated:
        audit_generated(root, failures)
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
