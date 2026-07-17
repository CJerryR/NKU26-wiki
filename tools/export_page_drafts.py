#!/usr/bin/env python3
"""Export each _content HTML source into a reviewer-friendly Markdown draft."""

from __future__ import annotations

import argparse
import html
import re
from html.parser import HTMLParser
from pathlib import Path


META_RE = re.compile(r"<!--META\s*(.*?)\s*-->", re.S)
SPACE_RE = re.compile(r"[ \t\f\v]+")
BLANK_RE = re.compile(r"\n{3,}")


def clean_inline(value: str) -> str:
    value = html.unescape(value)
    value = value.replace("\xa0", " ")
    value = SPACE_RE.sub(" ", value)
    return value.strip()


class MarkdownTextParser(HTMLParser):
    """Small dependency-free HTML-to-Markdown converter for wiki source prose."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.stack: list[str] = []
        self.links: list[str | None] = []
        self.list_stack: list[dict[str, int | str]] = []
        self.in_pre = False
        self.skip_depth = 0
        self.table_row: list[str] | None = None
        self.table_cell: list[str] | None = None

    def write(self, value: str) -> None:
        self.parts.append(value)

    def newline(self, count: int = 1) -> None:
        current = "".join(self.parts)
        existing = len(current) - len(current.rstrip("\n"))
        if existing < count:
            self.parts.append("\n" * (count - existing))

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        self.stack.append(tag)
        if tag in {"script", "style", "svg"}:
            self.skip_depth += 1
            return
        if self.skip_depth:
            return
        if tag in {"section", "article", "header", "footer", "div", "figure", "figcaption", "p"}:
            self.newline(2)
        elif tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self.newline(2)
            self.write("#" * int(tag[1]) + " ")
        elif tag == "br":
            self.newline()
        elif tag in {"strong", "b"}:
            self.write("**")
        elif tag in {"em", "i"}:
            self.write("*")
        elif tag == "code" and not self.in_pre:
            self.write("`")
        elif tag == "pre":
            self.newline(2)
            self.write("```\n")
            self.in_pre = True
        elif tag == "a":
            href = attrs_dict.get("href")
            self.links.append(href)
            if href:
                self.write("[")
        elif tag == "img":
            alt = clean_inline(attrs_dict.get("alt") or "image")
            src = attrs_dict.get("src") or ""
            self.write(f"![{alt}]({src})")
        elif tag in {"ul", "ol"}:
            self.newline()
            self.list_stack.append({"tag": tag, "index": 0})
        elif tag == "li":
            self.newline()
            indent = "  " * max(0, len(self.list_stack) - 1)
            if self.list_stack and self.list_stack[-1]["tag"] == "ol":
                self.list_stack[-1]["index"] = int(self.list_stack[-1]["index"]) + 1
                marker = f"{self.list_stack[-1]['index']}. "
            else:
                marker = "- "
            self.write(indent + marker)
        elif tag == "blockquote":
            self.newline(2)
            self.write("> ")
        elif tag == "hr":
            self.newline(2)
            self.write("---")
            self.newline(2)
        elif tag == "tr":
            self.table_row = []
        elif tag in {"th", "td"}:
            self.table_cell = []

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "svg"}:
            self.skip_depth = max(0, self.skip_depth - 1)
            if self.stack:
                self.stack.pop()
            return
        if self.skip_depth:
            if self.stack:
                self.stack.pop()
            return
        if tag in {"strong", "b"}:
            self.write("**")
        elif tag in {"em", "i"}:
            self.write("*")
        elif tag == "code" and not self.in_pre:
            self.write("`")
        elif tag == "pre":
            self.newline()
            self.write("```")
            self.newline(2)
            self.in_pre = False
        elif tag == "a":
            href = self.links.pop() if self.links else None
            if href:
                self.write(f"]({href})")
        elif tag in {"ul", "ol"}:
            if self.list_stack:
                self.list_stack.pop()
            self.newline(2)
        elif tag in {"section", "article", "header", "footer", "div", "figure", "figcaption", "p", "blockquote"}:
            self.newline(2)
        elif tag in {"h1", "h2", "h3", "h4", "h5", "h6", "li"}:
            self.newline()
        elif tag in {"th", "td"}:
            if self.table_row is not None and self.table_cell is not None:
                self.table_row.append(clean_inline("".join(self.table_cell)))
            self.table_cell = None
        elif tag == "tr":
            if self.table_row:
                self.newline()
                self.write("| " + " | ".join(self.table_row) + " |")
            self.table_row = None
        if self.stack:
            self.stack.pop()

    def handle_data(self, data: str) -> None:
        if self.skip_depth:
            return
        if self.table_cell is not None:
            self.table_cell.append(data)
            return
        if self.in_pre:
            self.write(data)
            return
        leading_space = bool(data and data[0].isspace())
        trailing_space = bool(data and data[-1].isspace())
        value = SPACE_RE.sub(" ", data)
        if not value.strip():
            if value and self.parts and not self.parts[-1].endswith((" ", "\n")):
                self.write(" ")
            return
        if leading_space and self.parts and not self.parts[-1].endswith((" ", "\n")):
            self.write(" ")
        elif self.parts and not self.parts[-1].endswith((" ", "\n", "*", "`", "> ")) and not value.startswith((" ", ".", ",", ";", ":", "!", "?", ")")):
            self.write(" ")
        self.write(value.strip())
        if trailing_space and not self.parts[-1].endswith((" ", "\n")):
            self.write(" ")

    def markdown(self) -> str:
        value = "".join(self.parts)
        value = re.sub(r" +\n", "\n", value)
        value = re.sub(r"\n +", "\n", value)
        value = BLANK_RE.sub("\n\n", value)
        return value.strip() + "\n"


def parse_meta(source: str) -> tuple[dict[str, str], str]:
    match = META_RE.search(source)
    if not match:
        return {}, source
    meta: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip()
    return meta, source[: match.start()] + source[match.end() :]


def export_one(source_path: Path, output_path: Path) -> None:
    source = source_path.read_text(encoding="utf-8")
    meta, body = parse_meta(source)
    parser = MarkdownTextParser()
    parser.feed(body)
    title = clean_inline(re.sub(r"<[^>]+>", "", meta.get("title", source_path.stem)))
    lines = ["---", f"source: {source_path.as_posix()}", f"slug: {source_path.stem}"]
    for key, value in meta.items():
        plain_value = clean_inline(re.sub(r"<[^>]+>", "", value))
        lines.append(f"{key}: {plain_value}")
    lines.extend(["---", "", f"# {title}", "", parser.markdown().rstrip(), ""])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=Path("_content"))
    parser.add_argument("--output", type=Path, default=Path("docs/page-drafts"))
    args = parser.parse_args()
    sources = sorted(args.source.glob("*.html"))
    if not sources:
        raise SystemExit(f"No HTML sources found in {args.source}")
    for source_path in sources:
        export_one(source_path, args.output / f"{source_path.stem}.md")
    index_lines = ["# NKU-iGEM26 page text drafts", "", "Generated from `_content/*.html` for copy review.", ""]
    for source_path in sources:
        index_lines.append(f"- [{source_path.stem}]({source_path.stem}.md)")
    index_lines.append("")
    (args.output / "README.md").write_text("\n".join(index_lines), encoding="utf-8")
    print(f"Exported {len(sources)} page drafts to {args.output}")


if __name__ == "__main__":
    main()
