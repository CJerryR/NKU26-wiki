#!/usr/bin/env python3
"""Turn a team Word draft into a starting point for a Markdown wiki page.

    python3 tools/docx_to_md.py drafts/human-practices.docx --page human-practices

What it does:
  * runs pandoc to get GitHub-flavoured Markdown,
  * pulls the embedded images out into img/uploads/<page>/,
  * demotes headings so the document's own title does not fight the page H1,
  * adds front matter with the fields the build and the audit require,
  * flags anything a human has to resolve (numeric claims, bare references,
    "TODO"-style wording) as HTML comments in the file.

What it deliberately does not do:
  * invent citations, evidence tags, or components,
  * decide what is a team result and what is a literature claim.

That judgement is the author's. Read tools/../_styleguide/components.md, then go
through the file and replace the flagged lines.
"""
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FRONT_MATTER = """---
title: {title}
route: {route}
group: {group}
icon: {icon}
summary: ONE OR TWO SENTENCES UNDER THE HEADING - replace this line
desc: SEARCH AND SOCIAL DESCRIPTION - replace this line
meta: Key=Value | Key=Value
---
"""

# Things a reviewer must look at by hand before this page goes live.
FLAGS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("number without a source", re.compile(r"\b\d+(?:\.\d+)?\s*(?:%|nM|uM|µM|mM|ng|ug|µg|mg|g/L|h|hours|min|bp|kb|°C)\b")),
    ("reference in prose - use [@key] and _data/references.bib", re.compile(r"\bet al\.|\(\d{4}\)|\[\d+\]")),
    ("draft marker", re.compile(r"\b(?:TODO|TBD|待定|待补|待确认)\b", re.I)),
    ("claim to check against the records", re.compile(r"\b(?:successful(?:ly)?|validated|proved|demonstrated|achieved|confirmed)\b", re.I)),
)


def run_pandoc(source: Path, media_dir: Path) -> str:
    if shutil.which("pandoc") is None:
        sys.exit("pandoc is not installed. See https://pandoc.org/installing.html")
    result = subprocess.run(
        ["pandoc", str(source), "-t", "gfm", "--wrap=none",
         f"--extract-media={media_dir}"],
        capture_output=True, text=True, check=False,
    )
    if result.returncode != 0:
        sys.exit(f"pandoc failed:\n{result.stderr.strip()}")
    return result.stdout


def demote_headings(text: str) -> str:
    """Word documents usually start at H1; the page template owns the H1."""
    levels = {len(m.group(1)) for m in re.finditer(r"(?m)^(#{1,6})\s", text)}
    if not levels or min(levels) >= 2:
        return text
    shift = 2 - min(levels)
    return re.sub(r"(?m)^(#{1,6})(\s)", lambda m: "#" * min(6, len(m.group(1)) + shift) + m.group(2), text)


def add_anchors(text: str) -> str:
    """Give every H2 an explicit id, because other pages will link to it."""
    def slug(value: str) -> str:
        value = re.sub(r"[^\w\s-]", "", value.strip().lower())
        return re.sub(r"\s+", "-", value)[:40].strip("-") or "section"

    def sub(m: re.Match[str]) -> str:
        if "{#" in m.group(2):
            return m.group(0)
        return f'{m.group(1)} {m.group(2).strip()} {{#{slug(m.group(2))}}}'

    return re.sub(r"(?m)^(##)\s+(.+)$", sub, text)


def rewrite_media(text: str, page: str, media_dir: Path) -> str:
    """Point image links at the repository path the build expects."""
    target = f"img/uploads/{page}/"
    text = re.sub(r"!\[([^\]]*)\]\(([^)\s]*?media/)([^)\s]+)\)",
                  lambda m: f"![{m.group(1)}]({target}{Path(m.group(3)).name})", text)
    extracted = media_dir / "media"
    if extracted.is_dir():
        out = ROOT / "img" / "uploads" / page
        out.mkdir(parents=True, exist_ok=True)
        for item in sorted(extracted.iterdir()):
            if item.is_file():
                shutil.copy2(item, out / item.name)
        shutil.rmtree(media_dir, ignore_errors=True)
    return text


def to_figures(text: str) -> str:
    """A bare image becomes a <Figure> so it is numbered and captioned."""
    def sub(m: re.Match[str]) -> str:
        alt = m.group(1).strip()
        note = "" if alt else '\n<!-- REVIEW: this image has no alt text. Describe what it shows. -->'
        return (f'{note}\n<Figure src="{m.group(2)}" alt="{alt or "DESCRIBE THIS IMAGE"}" '
                f'caption="WRITE A CAPTION: what it shows, and what it does not prove." />')

    return re.sub(r"(?m)^!\[([^\]]*)\]\(([^)\s]+)\)\s*$", sub, text)


def flag_lines(text: str) -> str:
    out = []
    in_fence = False
    for line in text.splitlines():
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
        if not in_fence:
            hits = [label for label, pattern in FLAGS if pattern.search(line)]
            if hits:
                out.append(f"<!-- REVIEW: {'; '.join(sorted(set(hits)))} -->")
        out.append(line)
    return "\n".join(out)


def tidy(text: str) -> str:
    text = text.replace("\r\n", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"(?m)[ \t]+$", "", text)
    # pandoc keeps Word's non-breaking and full-width spaces; they break tables.
    return text.replace("\u00a0", " ").replace("\u3000", " ")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source", type=Path, help="the .docx file")
    parser.add_argument("--page", required=True, help="page name, e.g. human-practices (becomes _content/<page>.md)")
    parser.add_argument("--title", help="page title (default: the page name, capitalised)")
    parser.add_argument("--group", default="Project", help="nav group: Project, Lab, Human Practices or Team")
    parser.add_argument("--icon", default="magnifier", help="page icon name, see wikimd.icon_names()")
    parser.add_argument("--force", action="store_true", help="overwrite an existing page")
    args = parser.parse_args()

    if not args.source.is_file():
        sys.exit(f"No such file: {args.source}")
    out_path = ROOT / "_content" / f"{args.page}.md"
    if out_path.exists() and not args.force:
        sys.exit(f"{out_path} already exists. Pass --force to overwrite it.")

    media_dir = ROOT / "tmp" / f"docx-{args.page}"
    body = run_pandoc(args.source, media_dir)
    body = tidy(body)
    body = demote_headings(body)
    body = rewrite_media(body, args.page, media_dir)
    body = to_figures(body)
    body = add_anchors(body)
    body = flag_lines(body)

    front = FRONT_MATTER.format(
        title=args.title or args.page.replace("-", " ").capitalize(),
        route=args.page,
        group=args.group,
        icon=args.icon,
    )
    header = (
        "<!-- Converted from " + args.source.name + " by tools/docx_to_md.py.\n"
        "     Before this page can go live:\n"
        "       1. fill in summary, desc and meta above;\n"
        "       2. resolve every REVIEW comment and delete it;\n"
        "       3. move references into _data/references.bib and cite them as [@key];\n"
        "       4. tag claims with <Tag level=\"...\" /> or <Evidence level=\"...\">;\n"
        "       5. run the build and the content audit. -->\n\n"
    )
    out_path.write_text(front + header + body.strip() + "\n", encoding="utf-8")

    reviews = body.count("<!-- REVIEW:")
    print(f"Wrote {out_path.relative_to(ROOT)}")
    print(f"{reviews} line(s) flagged for review.")
    print("Next: python3 build.py && python3 tools/audit_wiki_content.py --generated --generated-root public")
    return 0


if __name__ == "__main__":
    sys.exit(main())
