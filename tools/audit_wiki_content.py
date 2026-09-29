#!/usr/bin/env python3
"""Strict content and publishing audit for the NKU-iGEM26 wiki (Astro, v7).

Sources:   src/content/pages/*.md (Markdown + frontmatter) and the homepage
           sections in src/home/sections/*.html
Generated: the built site in public/ (with --generated)

    python3 tools/audit_wiki_content.py                      # sources only
    python3 tools/audit_wiki_content.py --generated          # + built site
    python3 tools/audit_wiki_content.py --generated --generated-root public

The content rules (placeholder wording, untraced numbers, overclaims, iGEM
2026 standard routes, licensing disclosure) are carried over from v6 unchanged.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path

EXTERNAL_RUNTIME_RE = re.compile(
    r"<(?:script|img|iframe)\b[^>]*\bsrc=[\"']https?://|<link\b[^>]*\bhref=[\"']https?://",
    re.I,
)
MD_EXTERNAL_RE = re.compile(r"!\[[^\]]*\]\(\s*<?https?://|\b(?:src|img)=[\"']https?://", re.I)
RESOURCE_RE = re.compile(
    r"<(?P<tag>a|img|script|link)\b[^>]*\b(?:href|src)=[\"'](?P<value>[^\"']+)[\"']",
    re.I,
)

STANDARD_ROUTES = {
    "contribution", "engineering", "human-practices", "education", "entrepreneurship", "hardware",
    "inclusivity", "model", "safety-and-security", "software", "sustainability",
}

FORBIDDEN_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("placeholder class", re.compile(r"placeholder-tag|content-slot|slot-chip", re.I)),
    ("placeholder wording", re.compile(r"figure placeholder|pending documentation|reference to add|content slot", re.I)),
    ("template token", re.compile(r"\{\{[^}]+\}\}")),
    ("draft marker", re.compile(r"\b(?:TODO|TBD)\b", re.I)),
    ("fake person", re.compile(r"\b(?:Member|Advisor|Instructor) name\b", re.I)),
    ("fake relationship", re.compile(r"\b(?:Team|Partner) name\b", re.I)),
    ("editing instruction", re.compile(r"Editor's note|Replace (?:with|the)|Add (?:your|real|final|activity|market|reach|instructor|advisor|partnership|collaboration)|Insert (?:CAD|equations)", re.I)),
    ("untraced concentration", re.compile(r"5\s*(?:-|–|&ndash;|&#8211;)\s*100\s*nM", re.I)),
    ("untraced proportion", re.compile(r"60\s*(?:-|–|&ndash;|&#8211;)\s*82\s*%", re.I)),
    ("untraced timing", re.compile(r"24\s*(?:-|–|&ndash;|&#8211;)\s*72\s*(?:h|hours?)\b", re.I)),
    ("missing figure notice", re.compile(r"Figure file not found|Figure name not valid", re.I)),
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

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n?", re.S)


def _scalar(value: str):
    value = value.strip()
    if value.startswith('"'):
        return json.loads(value)
    if value.startswith("'") and value.endswith("'"):
        return value[1:-1].replace("''", "'")
    if value in ("true", "false"):
        return value == "true"
    return value


def parse_frontmatter(text: str):
    """The small YAML subset used by the pages (PyYAML is used when installed)."""
    match = FRONTMATTER_RE.match(text)
    if not match:
        return None, text
    raw, body = match.group(1), text[match.end():]
    try:
        import yaml  # type: ignore
        return (yaml.safe_load(raw) or {}), body
    except ImportError:
        pass
    data: dict = {}
    current = None
    for line in raw.split("\n"):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line[:1] in (" ", "\t") and current is not None:
            key, _, value = line.strip().partition(":")
            data[current][_scalar(key)] = _scalar(value)
            continue
        current = None
        key, _, value = line.partition(":")
        key, value = key.strip(), value.strip()
        if value == "":
            data[key] = {}
            current = key
        elif value.startswith("[") and value.endswith("]"):
            data[key] = [_scalar(v) for v in re.findall(r'"(?:[^"\\]|\\.)*"|[^,]+', value[1:-1]) if v.strip()]
        else:
            data[key] = _scalar(value)
    return data, body


def has_unnegated_match(source: str, pattern: re.Pattern[str]) -> bool:
    for match in pattern.finditer(source):
        left = max(source.rfind(".", 0, match.start()), source.rfind("!", 0, match.start()), source.rfind("?", 0, match.start()), source.rfind("\n", 0, match.start()))
        rights = [p for p in (source.find(".", match.end()), source.find("!", match.end()), source.find("?", match.end()), source.find("\n", match.end())) if p >= 0]
        right = min(rights) if rights else min(len(source), match.end() + 160)
        if not NEGATION_RE.search(source[left + 1:right]):
            return True
    return False


def outside_code(body: str) -> list[str]:
    lines, fence = [], False
    for line in body.split("\n"):
        if re.match(r"^\s*```", line):
            fence = not fence
            continue
        if not fence:
            lines.append(line)
    return lines


def check_text(label: str, source: str, failures: list[str]) -> None:
    for name, pattern in FORBIDDEN_PATTERNS:
        if pattern.search(source):
            failures.append(f"{label}: {name}")
    for name, pattern in OVERCLAIM_PATTERNS:
        if has_unnegated_match(source, pattern):
            failures.append(f"{label}: {name}")


def audit_source(root: Path, path: Path, icons: set[str], failures: list[str]) -> dict:
    text = path.read_text(encoding="utf-8")
    rel = path.relative_to(root)
    fm, body = parse_frontmatter(text)
    if fm is None:
        failures.append(f"{rel}: missing frontmatter block (--- ... ---)")
        fm = {}
    for field in ("title", "crumbs", "heading", "sub", "meta"):
        if not fm.get(field):
            failures.append(f"{rel}: frontmatter missing {field}")
    check_text(str(rel), text, failures)

    lines = outside_code(body)
    ids = []
    for line in lines:
        block = re.search(r"\{([^{}]*)\}\s*$", line) if re.match(r"^#{1,6}\s", line) else None
        if block:
            unquoted = re.sub(r"\"[^\"]*\"|'[^']*'|“[^”]*”", "", block.group(1))
            ids += re.findall(r"(?:^|\s)#([\w:.-]+)", unquoted)
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    if dupes:
        failures.append(f"{rel}: duplicate heading ids {dupes}")
    if EXTERNAL_RUNTIME_RE.search(body) or MD_EXTERNAL_RE.search(body):
        failures.append(f"{rel}: external runtime resource (images and scripts must be local)")
    sections = sum(1 for line in lines if re.match(r"^##\s", line))
    if not sections:
        failures.append(f"{rel}: no sections (a page needs at least one '## ' heading)")
    opens = sum(1 for line in lines if re.match(r"^\s*:{3,}\s*[A-Za-z]", line))
    closes = sum(1 for line in lines if re.match(r"^\s*:{3,}\s*$", line))
    if opens != closes:
        failures.append(f"{rel}: {opens} ':::' block(s) opened but {closes} closed")
    for name in re.findall(r"\bsvg=[\"']([^\"']+)[\"']", body):
        if not (root / "src" / "figures" / f"{name}.svg").exists():
            failures.append(f"{rel}: figure file src/figures/{name}.svg not found")
    for name in re.findall(r"\bicon=[\"']([^\"']+)[\"']", body):
        if name not in icons:
            failures.append(f"{rel}: unknown icon '{name}' (see src/lib/icons.mjs)")
    route = str(fm.get("route") or "").strip("/")
    if route and not re.fullmatch(r"[a-z0-9][a-z0-9-]*", route):
        failures.append(f"{rel}: route may only use lowercase letters, digits and -")
    return {
        "slug": path.stem, "route": route, "sections": sections,
        "hidden": fm.get("hidden") is True, "draft": fm.get("draft") is True,
    }


def audit_home(root: Path, page_ids: set[str], failures: list[str]) -> None:
    home_ts = (root / "src" / "lib" / "home.ts").read_text(encoding="utf-8")
    order = re.findall(r"'([a-z]+)'", re.search(r"HOME_SECTIONS\s*=\s*\[([^\]]*)\]", home_ts).group(1))
    data = json.loads((root / "src" / "data" / "home.json").read_text(encoding="utf-8"))
    parts = []
    for name in order:
        path = root / "src" / "home" / "sections" / f"{name}.html"
        if not path.exists():
            failures.append(f"homepage section missing: {path.relative_to(root)}")
            continue
        parts.append(path.read_text(encoding="utf-8"))
    body = "\n".join(parts)
    for key in sorted(set(re.findall(r"\{\{HOME_URL:([a-z-]+)\}\}", body))):
        link = data.get("links", {}).get(key)
        if not link:
            failures.append(f"homepage uses unknown link key {key} (src/data/home.json)")
        elif link.get("source") not in page_ids:
            failures.append(f"src/data/home.json: link {key} points to missing page {link.get('source')}")
    body = re.sub(r"\{\{(?:HOME_URL:[a-z-]+|P)\}\}", "", body)
    check_text("homepage", body, failures)
    if EXTERNAL_RUNTIME_RE.search(body):
        failures.append("homepage: external runtime resource")


def audit_generated(root: Path, failures: list[str], expected_count: int) -> None:
    generated = [root / "index.html", *sorted((root / "pages").glob("*.html"))]
    generated += sorted(p for p in root.glob("*/index.html") if not p.parent.name.startswith("_"))
    seen: set[Path] = set()
    for path in generated:
        if not path.exists() or path in seen:
            continue
        seen.add(path)
        source = path.read_text(encoding="utf-8")
        for name, pattern in FORBIDDEN_PATTERNS:
            if pattern.search(source):
                failures.append(f"{path}: generated {name}")
        if EXTERNAL_RUNTIME_RE.search(source):
            failures.append(f"{path}: generated external runtime resource")
        if "creativecommons.org/licenses/by/4.0" not in source:
            failures.append(f"{path}: footer missing CC BY 4.0 link")
        if not re.search(r"href=[\"'][^\"']*licensing/[\"'#]", source):
            failures.append(f"{path}: footer missing link to the licensing page")
        if re.search(r"(?:href|src)=[\"']/(?!/)", source):
            failures.append(f"{path}: root-absolute link left in output (relative-links step did not run)")
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
                if not re.search(rf"\bid=[\"']?{re.escape(fragment)}[\"'\s>]", target.read_text(encoding="utf-8")):
                    failures.append(f"{path}: missing fragment target {value}")
    if not (root / "js" / "search-data.js").exists():
        failures.append(f"{root}: js/search-data.js was not generated")
    if len(seen) != expected_count:
        failures.append(f"generated page count is {len(seen)}, expected {expected_count}")


def audit_igem_2026_controls(root: Path, results: list[dict], failures: list[str]) -> None:
    by_route = {r["route"]: r for r in results if r["route"]}
    for route in sorted(STANDARD_ROUTES):
        result = by_route.get(route)
        if result is None:
            failures.append(f"missing 2026 Standard URL route: /{route}")
            continue
        if result["hidden"]:
            failures.append(f"2026 Standard URL route is hidden from search: /{route}")
        if result["draft"]:
            failures.append(f"2026 Standard URL route is draft: /{route}")
    for name in ("LICENSE", ".gitlab-ci.yml", "package.json"):
        if not (root / name).exists():
            failures.append(f"missing repository control file: {name}")
    gitignore = (root / ".gitignore").read_text(encoding="utf-8") if (root / ".gitignore").exists() else ""
    if not re.search(r"(?m)^/?public/?$", gitignore):
        failures.append(".gitignore must exclude CI-generated public output")
    pipeline = (root / ".gitlab-ci.yml").read_text(encoding="utf-8") if (root / ".gitlab-ci.yml").exists() else ""
    for marker in ("npm run build", "public", "artifacts"):
        if marker not in pipeline:
            failures.append(f".gitlab-ci.yml missing required marker: {marker}")

    footer = (root / "src" / "components" / "site" / "SiteFooter.astro").read_text(encoding="utf-8")
    nav = (root / "src" / "data" / "nav.ts").read_text(encoding="utf-8")
    home_footer = (root / "src" / "home" / "sections" / "footer.html").read_text(encoding="utf-8")
    for marker, where, label in (
        ("creativecommons.org/licenses/by/4.0", footer, "SiteFooter.astro"),
        ("site.repository", footer, "SiteFooter.astro"),
        ("page: 'licensing'", nav, "footerNav in src/data/nav.ts"),
        ("page: 'repository'", nav, "footerNav in src/data/nav.ts"),
        ("creativecommons.org/licenses/by/4.0", home_footer, "homepage footer"),
        ("{{SOURCE_REPOSITORY_URL}}", home_footer, "homepage footer"),
        ("licensing/", home_footer, "homepage footer"),
    ):
        if marker not in where:
            failures.append(f"{label} missing 2026 compliance marker: {marker}")
    if "nankai-seal" in (footer + home_footer).lower():
        failures.append("footer still embeds an uncredited institutional seal")

    licensing = root / "src" / "content" / "pages" / "licensing.md"
    if not licensing.exists():
        failures.append("missing public licensing and responsible-AI disclosure page")
    else:
        text = licensing.read_text(encoding="utf-8").lower()
        for marker in ("cc by 4.0", "openai codex", "human review", "ai-generated"):
            if marker not in text:
                failures.append(f"licensing page missing disclosure marker: {marker}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--generated", action="store_true")
    parser.add_argument("--generated-root", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    icons_src = (root / "src" / "lib" / "icons.mjs").read_text(encoding="utf-8")
    icons = set(re.findall(r'^\s*"([\w-]+)":\s*"', icons_src, re.M))
    sources = sorted((root / "src" / "content" / "pages").glob("*.md"))
    failures: list[str] = []
    results = [audit_source(root, p, icons, failures) for p in sources]
    audit_home(root, {p.stem for p in sources}, failures)
    audit_igem_2026_controls(root, results, failures)
    if any(r["draft"] for r in results):
        failures.append("one or more pages are marked draft: true")
    if args.generated:
        generated_root = (args.generated_root or (root / "public")).resolve()
        audit_generated(generated_root, failures, 1 + len([r for r in results if not r["draft"]]))
    print(
        f"sources={len(sources)} sections={sum(r['sections'] for r in results)} "
        f"hidden={sum(r['hidden'] for r in results)} drafts={sum(r['draft'] for r in results)}"
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
