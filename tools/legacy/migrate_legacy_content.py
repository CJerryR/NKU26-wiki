#!/usr/bin/env python3
"""Convert the v6 `_content/*.html` pages into the v7 Markdown dialect.

This is the one-off converter used to create src/content/pages/*.md. It is
kept for provenance and for re-running on an old-format page if needed:

    python3 tools/legacy/migrate_legacy_content.py <old-repo-root> <new-repo-root>

It reuses the old builder's own clean-up step (prepare_body), so the Markdown
contains exactly the text the old site published. Card icons are mapped to
names in src/lib/icons.mjs; inline SVG diagrams become src/figures/*.svg.
"""
from __future__ import annotations

import hashlib
import html
import importlib.util
import json
import posixpath
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString, Tag

OLD = Path(sys.argv[1]).resolve()
NEW = Path(sys.argv[2]).resolve()

spec = importlib.util.spec_from_file_location("legacy_build", OLD / "build.py")
B = importlib.util.module_from_spec(spec)
spec.loader.exec_module(B)

ICON_NAMES = {
    "9a625e": "people", "ed4dcf": "flask", "f8c485": "chip", "6f691f": "board", "5188b7": "file",
    "fecab6": "book", "b9d353": "building", "72a948": "briefcase", "4e22b0": "check-circle",
    "1c9f85": "link", "5ec533": "camera", "d9983c": "cycle", "296b52": "globe", "e68501": "shield",
    "61858f": "mic", "4da130": "clock", "08ddc1": "cost", "7913af": "inspect", "75fdca": "search",
    "214481": "chart", "32cb0e": "leaf", "4edacb": "group", "8286c8": "hand", "88e4c5": "balance",
    "3f6127": "gear", "e6c28c": "rocket", "edfc0e": "signal", "1c48ac": "lines", "f9c031": "timer",
    "6fa635": "alert", "843029": "verified", "65f78a": "roster", "fa658f": "person",
    "cd626f": "id-card", "a4c5e6": "doc",
}
CALLOUT_ICON_HASH = {"note": "6fa635", "tip": "7e1aea", "warning": "adc792"}
INLINE_TAGS = {"a", "b", "strong", "em", "i", "code", "span", "br", "sup", "sub", "abbr", "small", "mark", "u", "s", "q", "time", "cite"}

warnings: list[str] = []
icon_markup: dict[str, str] = {}


def svg_inner(svg: Tag) -> str:
    return re.sub(r"\s+", " ", "".join(str(c) for c in svg.contents).strip())


def svg_hash(svg: Tag) -> str:
    return hashlib.md5(svg_inner(svg).encode()).hexdigest()[:6]


def collapse(s: str) -> str:
    return re.sub(r"\s+", " ", s)


def esc_text(s: str) -> str:
    s = s.replace("\\", "\\\\").replace("*", "\\*").replace("`", "\\`").replace("~", "\\~")
    s = re.sub(r"(?<![A-Za-z0-9])_|_(?![A-Za-z0-9])", r"\\_", s)
    s = re.sub(r"<(?=[A-Za-z/!?])", "&lt;", s)
    s = re.sub(r"&(?=#?\w+;)", "&amp;", s)
    if "](" in s or "][" in s:
        s = s.replace("[", "\\[").replace("]", "\\]")
    return s


def esc_start(s: str) -> str:
    s = re.sub(r"^(\d+)([.)])(\s)", r"\1\\\2\3", s)
    if re.match(r"^(#{1,6}(\s|$)|>|[-+](\s|$)|=+\s*$|:)", s):
        s = "\\" + s
    return s


def fix_href(href: str | None) -> str:
    href = (href or "").strip()
    if not href or href.startswith(("#", "http://", "https://", "mailto:", "tel:")):
        return href
    path, _, frag = href.partition("#")
    trailing = path.endswith("/")
    resolved = posixpath.normpath(posixpath.join("/x/", path))
    if resolved.endswith("/index.html"):
        resolved, trailing = resolved[: -len("index.html")], False
    if trailing and not resolved.endswith("/"):
        resolved += "/"
    return resolved + (("#" + frag) if frag else "")


def md_url(url: str) -> str:
    return f"<{url}>" if re.search(r"[\s()<>]", url) else url


def code_span(text: str) -> str:
    text = collapse(text)
    fence = "`"
    while fence in text:
        fence += "`"
    pad = " " if text.startswith("`") or text.endswith("`") else ""
    return f"{fence}{pad}{text}{pad}{fence}"


def wrap_emph(inner: str, mark: str) -> str:
    lead = inner[: len(inner) - len(inner.lstrip())]
    trail = inner[len(inner.rstrip()):]
    core = inner.strip()
    return f"{lead}{mark}{core}{mark}{trail}" if core else inner


def inline_node(n) -> str:
    if isinstance(n, Comment):
        return ""
    if isinstance(n, NavigableString):
        return esc_text(collapse(str(n)))
    name = n.name
    if name in ("strong", "b"):
        return wrap_emph(inline(n), "**")
    if name in ("em", "i", "cite"):
        return wrap_emph(inline(n), "*")
    if name == "code":
        return code_span(n.get_text())
    if name == "a":
        label = collapse(inline(n)).strip()
        return f"[{label}]({md_url(fix_href(n.get('href')))})"
    if name == "br":
        return "<br>"
    if name == "span" and "ink-accent" in (n.get("class") or []):
        return wrap_emph(inline(n), "*")
    if name in ("sup", "sub"):
        return f"<{name}>{inline(n)}</{name}>"
    if name == "svg":
        warnings.append("inline <svg> inside text dropped")
        return ""
    return inline(n)


def inline(el) -> str:
    return "".join(inline_node(c) for c in el.children)


def plain(el) -> str:
    return collapse(el.get_text()).strip()


def clean_label(s: str) -> str:
    s = collapse(html.unescape(s)).strip()
    return s.replace('"', "'").replace("{", "(").replace("}", ")")


def heading_md(h: Tag, extra: dict[str, str] | None = None) -> str:
    level = int(h.name[1])
    title = collapse(inline(h)).strip()
    attrs = []
    if h.get("id"):
        attrs.append("#" + h["id"])
    if h.get("data-toc-sub") is not None:
        label = clean_label(h["data-toc-sub"])
        attrs.append(f'toc="{label}"' if label and label != plain(h) else "toc")
    for k, v in (extra or {}).items():
        attrs.append(f'{k}="{clean_label(v)}"')
    return "#" * level + " " + title + (" {" + " ".join(attrs) + "}" if attrs else "")


def md_list(el: Tag, ordered: bool, indent: str = "") -> str:
    lines = []
    start = int(el.get("start", 1)) if ordered else 1
    for i, li in enumerate(el.find_all("li", recursive=False)):
        marker = f"{start + i}." if ordered else "-"
        pad = indent + " " * (len(marker) + 1)
        parts, nested = [], []
        for ch in li.children:
            if isinstance(ch, Tag) and ch.name in ("ul", "ol"):
                nested.append(md_list(ch, ch.name == "ol", pad))
            elif isinstance(ch, Tag) and ch.name == "p":
                parts.append(" " + inline(ch) + " ")
            else:
                parts.append(inline_node(ch))
        text = collapse("".join(parts)).strip()
        lines.append(f"{indent}{marker} {text}")
        lines.extend(nested)
    return "\n".join(lines)


def md_table(t: Tag) -> str:
    def cell(c):
        return collapse(inline(c)).strip().replace("|", "\\|")
    if t.find(attrs={"colspan": True}) or t.find(attrs={"rowspan": True}):
        warnings.append("table with colspan/rowspan flattened")
    head = t.find("thead")
    rows = (t.find("tbody") or t).find_all("tr", recursive=False) if t.find("tbody") else t.find_all("tr")
    if head:
        hdr = [cell(c) for c in head.find_all(["th", "td"])]
    else:
        first, rows = rows[0], rows[1:]
        hdr = [cell(c) for c in first.find_all(["th", "td"])]
    out = ["| " + " | ".join(hdr) + " |", "| " + " | ".join("---" for _ in hdr) + " |"]
    for tr in rows:
        cells = [cell(c) for c in tr.find_all(["td", "th"], recursive=False)]
        cells += [""] * (len(hdr) - len(cells))
        out.append("| " + " | ".join(cells) + " |")
    return "\n".join(out)


class Page:
    def __init__(self, stem: str, raw_body: str):
        self.stem = stem
        self.svgs = re.findall(r'<div class="figure__media">\s*(<svg\b.*?</svg>)', raw_body, re.S)
        self.fig_n = 0
        self.stats = {"cards": 0, "callouts": 0, "figures": 0, "tables": 0, "timelines": 0, "features": 0, "stats": 0, "refs": 0}


def blocks(nodes, page: Page) -> list[str]:
    out: list[str] = []
    buf: list = []

    def flush():
        if buf:
            s = collapse("".join(inline_node(n) for n in buf)).strip()
            if s:
                out.append(esc_start(s))
            buf.clear()

    for n in nodes:
        if isinstance(n, Comment):
            continue
        if isinstance(n, NavigableString):
            if str(n).strip() or buf:
                buf.append(n)
            continue
        if n.name in INLINE_TAGS:
            buf.append(n)
            continue
        flush()
        out.extend(block(n, page))
    flush()
    return out


def block(n: Tag, page: Page) -> list[str]:
    cls = n.get("class") or []
    if n.name == "p":
        if "sec-label" in cls or "eyebrow" in cls:
            return []
        s = collapse(inline(n)).strip()
        return [esc_start(s)] if s else []
    if re.fullmatch(r"h[1-6]", n.name):
        return [heading_md(n)]
    if n.name in ("ul", "ol"):
        if "timeline" in cls:
            return timeline(n, page)
        if "refs" in cls:
            page.stats["refs"] += 1
            return [":::refs", md_list(n, True), ":::"]
        return [md_list(n, n.name == "ol")]
    if n.name == "blockquote":
        inner = "\n\n".join(blocks(n.contents, page))
        return ["\n".join(("> " + line) if line else ">" for line in inner.split("\n"))]
    if n.name == "pre":
        return ["```\n" + n.get_text().strip("\n") + "\n```"]
    if n.name == "table":
        page.stats["tables"] += 1
        return [md_table(n)]
    if n.name == "figure":
        return figure(n, page)
    if n.name in ("div", "section", "article", "aside"):
        if "grid" in cls:
            return cards(n, page)
        if "card" in cls:
            return cards(n, page, single=True)
        if "callout" in cls:
            return callout(n, page)
        if "feature-list" in cls:
            return features(n, page)
        if "stat-grid" in cls:
            return stats(n, page)
        return blocks(n.contents, page)
    if n.name == "hr":
        return ["***"]
    warnings.append(f"{page.stem}: kept unknown <{n.name}> as raw HTML")
    return [str(n)]


def cards(div: Tag, page: Page, single: bool = False) -> list[str]:
    cls = div.get("class") or []
    cols = next((c.split("-")[1] for c in cls if re.fullmatch(r"grid-[234]", c)), None)
    out = [f":::cards{{cols={cols}}}" if cols else ":::cards"]
    items = [div] if single else div.find_all("div", class_="card", recursive=False)
    for card in items:
        page.stats["cards"] += 1
        icon_box = card.find(class_="card__icon")
        extra = {}
        if icon_box and icon_box.find("svg"):
            svg = icon_box.find("svg")
            h = svg_hash(svg)
            name = ICON_NAMES.get(h)
            if not name:
                name = "icon-" + h
                warnings.append(f"{page.stem}: unnamed icon {h}")
            icon_markup.setdefault(name, svg_inner(svg))
            extra["icon"] = name
        head = card.find(re.compile(r"^h[2-6]$"))
        if head is None:
            warnings.append(f"{page.stem}: card without heading")
        rest = [c for c in card.children if c is not head and c is not icon_box
                and not (isinstance(c, Tag) and "card__ring" in (c.get("class") or []))]
        if head is not None:
            out.append(heading_md(head, extra))
        out.extend(blocks(rest, page))
    out.append(":::")
    return out


def callout(div: Tag, page: Page) -> list[str]:
    page.stats["callouts"] += 1
    cls = div.get("class") or []
    kind = "tip" if "callout--tip" in cls else "warning" if "callout--warn" in cls else "note"
    inner = div.find("div", recursive=False) or div
    title_el = inner.find("b", recursive=False)
    title = collapse(inline(title_el)).strip().replace("]", "\\]") if title_el else ""
    rest = [c for c in inner.children if c is not title_el and not (isinstance(c, Tag) and c.name == "svg")]
    return [f":::{kind}[{title}]" if title else f":::{kind}", *blocks(rest, page), ":::"]


def figure(fig: Tag, page: Page) -> list[str]:
    page.stats["figures"] += 1
    cap = fig.find("figcaption")
    table = fig.find("table")
    svg = fig.find("svg")
    out = []
    if svg is not None and table is None:
        raw = page.svgs[page.fig_n] if page.fig_n < len(page.svgs) else str(svg)
        page.fig_n += 1
        name = f"{page.stem}-{page.fig_n}"
        (NEW / "src" / "figures" / f"{name}.svg").write_text(raw.strip() + "\n", encoding="utf-8")
        out.append(f':::figure{{svg="{name}"}}')
    else:
        out.append(":::figure")
        if table is not None:
            page.stats["tables"] += 1
            out.append(md_table(table))
    others = [c for c in fig.children if isinstance(c, Tag) and c is not cap and c.name not in ("div", "table", "svg")]
    for o in others:
        out.extend(block(o, page))
    if cap is not None:
        out.append(esc_start(collapse(inline(cap)).strip()))
    out.append(":::")
    return out


def timeline(el: Tag, page: Page) -> list[str]:
    page.stats["timelines"] += 1
    out = [":::timeline"]
    for li in el.find_all("li", recursive=False):
        when = li.find(class_="when")
        head = li.find(re.compile(r"^h[2-6]$"))
        extra = {"when": plain(when)} if when else {}
        rest = [c for c in li.children if c is not when and c is not head]
        if head is not None:
            out.append(heading_md(head, extra))
        else:
            warnings.append(f"{page.stem}: timeline item without heading")
        out.extend(blocks(rest, page))
    out.append(":::")
    return out


def features(div: Tag, page: Page) -> list[str]:
    page.stats["features"] += 1
    out = [":::features"]
    for f in div.find_all("div", class_="feature", recursive=False):
        idx = f.find(class_="feature__idx")
        go = f.find("a", class_="feature__go")
        main = next((c for c in f.children if isinstance(c, Tag) and c.name == "div"), f)
        head = main.find(re.compile(r"^h[2-6]$"))
        extra = {}
        if idx:
            extra["idx"] = plain(idx)
        if go and go.get("href"):
            extra["href"] = fix_href(go["href"])
        out.append(heading_md(head, extra))
        out.extend(blocks([c for c in main.children if c is not head], page))
    out.append(":::")
    return out


def stats(div: Tag, page: Page) -> list[str]:
    page.stats["stats"] += 1
    out = [":::stats"]
    for s in div.find_all("div", class_="stat", recursive=False):
        num = s.find(class_="stat__num")
        label = s.find(class_="stat__label")
        out.append("### " + collapse(inline(num)).strip())
        if label:
            out.append(esc_start(collapse(inline(label)).strip()))
    out.append(":::")
    return out


def yaml_str(s: str) -> str:
    s = str(s)
    risky = (not s or re.search(r"[:#\[\]{}&*!|>'\"%@`,]", s) or re.match(r"^[-?\s\d.+]", s)
             or s != s.strip() or s.lower() in {"true", "false", "null", "yes", "no", "on", "off", "~"})
    return json.dumps(s, ensure_ascii=False) if risky else s


def frag_to_md(fragment: str) -> str:
    soup = BeautifulSoup(fragment, "html.parser")
    return collapse(inline(soup)).strip()


def convert(path: Path) -> tuple[str, Page]:
    meta, body = B.parse(path.read_text(encoding="utf-8"))
    body = B.prepare_body(body)
    page = Page(path.stem, body)
    soup = BeautifulSoup(body, "html.parser")

    fm = ["---", f"title: {yaml_str(html.unescape(meta['title']))}"]
    if meta.get("heading"):
        fm.append(f"heading: {yaml_str(frag_to_md(meta['heading']))}")
    if meta.get("sub"):
        fm.append(f"sub: {yaml_str(frag_to_md(meta['sub']))}")
    crumbs = [html.unescape(c.strip()) for c in meta.get("crumbs", "").split("/") if c.strip()]
    if crumbs:
        fm.append("crumbs: [" + ", ".join(yaml_str(c) for c in crumbs) + "]")
    if meta.get("route"):
        fm.append(f"route: {yaml_str(B.normalize_route(meta))}")
    if B.meta_bool(meta, "hidden"):
        fm.append("hidden: true")
    pairs = [p.split("=", 1) for p in meta.get("meta", "").split("|") if "=" in p]
    if pairs:
        fm.append("meta:")
        for k, v in pairs:
            fm.append(f"  {yaml_str(html.unescape(k.strip()))}: {yaml_str(html.unescape(v.strip()))}")
    if meta.get("desc"):
        fm.append(f"description: {yaml_str(html.unescape(meta['desc']))}")
    fm.append("---")

    parts: list[str] = []
    for sec in soup.find_all("section", recursive=False):
        h2 = sec.find("h2")
        attrs = ["#" + sec["id"]] if sec.get("id") else []
        toc = clean_label(sec.get("data-toc", ""))
        if toc and h2 is not None and toc != plain(h2):
            attrs.append(f'toc="{toc}"')
        title = collapse(inline(h2)).strip() if h2 is not None else toc
        parts.append("## " + title + (" {" + " ".join(attrs) + "}" if attrs else ""))
        parts.extend(blocks([c for c in sec.children if c is not h2], page))
    leftovers = [c for c in soup.children if isinstance(c, Tag) and c.name != "section"]
    if leftovers:
        warnings.append(f"{path.stem}: {len(leftovers)} top-level element(s) outside sections")
        parts.extend(blocks(leftovers, page))

    md = "\n".join(fm) + "\n\n" + "\n\n".join(p for p in parts if p.strip()) + "\n"
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md, page


def write_icons(callout_svgs: dict[str, str]) -> None:
    lines = [
        "/**",
        " * Icon set shared by Markdown blocks (`{icon=\"name\"}` on a card heading) and",
        " * Astro components. 24×24 stroke icons; names are what authors type.",
        " * To add one: paste the inner SVG markup under a new name.",
        " */",
        "export const ICONS = {",
    ]
    for name in sorted(icon_markup):
        lines.append(f"  {json.dumps(name)}: {json.dumps(icon_markup[name])},")
    lines += [
        "};",
        "",
        "const UI = {",
        "  arrowUpRight: '<line x1=\"7\" y1=\"17\" x2=\"17\" y2=\"7\"/><polyline points=\"7 7 17 7 17 17\"/>',",
        "  arrowLeft: '<line x1=\"19\" y1=\"12\" x2=\"5\" y2=\"12\"/><polyline points=\"11 18 5 12 11 6\"/>',",
        "  arrowRight: '<line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/><polyline points=\"13 6 19 12 13 18\"/>',",
        "  arrowUp: '<line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"5\"/><polyline points=\"6 11 12 5 18 11\"/>',",
        "  chevronDown: '<polyline points=\"6 9 12 15 18 9\"/>',",
        "  search: '<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><line x1=\"20\" y1=\"20\" x2=\"16\" y2=\"16\"/>',",
        "  close: '<line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/>',",
        "  outline: '<line x1=\"9\" y1=\"6\" x2=\"20\" y2=\"6\"/><line x1=\"9\" y1=\"12\" x2=\"20\" y2=\"12\"/><line x1=\"9\" y1=\"18\" x2=\"20\" y2=\"18\"/><circle cx=\"4.5\" cy=\"6\" r=\"1\"/><circle cx=\"4.5\" cy=\"12\" r=\"1\"/><circle cx=\"4.5\" cy=\"18\" r=\"1\"/>',",
        "  hash: '<line x1=\"5\" y1=\"9\" x2=\"19\" y2=\"9\"/><line x1=\"5\" y1=\"15\" x2=\"19\" y2=\"15\"/><line x1=\"10\" y1=\"4\" x2=\"8\" y2=\"20\"/><line x1=\"16\" y1=\"4\" x2=\"14\" y2=\"20\"/>',",
        "  external: '<path d=\"M14 5h5v5\"/><line x1=\"19\" y1=\"5\" x2=\"11\" y2=\"13\"/><path d=\"M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4\"/>',",
        "};",
        "",
        "export function svg(inner, strokeWidth = 1.8) {",
        "  return `<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"${strokeWidth}\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\">${inner}</svg>`;",
        "}",
        "",
        "export function iconSvg(name) {",
        "  const inner = ICONS[name];",
        "  return inner ? svg(inner) : null;",
        "}",
        "",
        "export const UI_ICONS = Object.fromEntries(Object.entries(UI).map(([k, v]) => [k, svg(v, 2)]));",
        "",
        "export const CALLOUT_ICONS = {",
    ]
    for kind in ("note", "tip", "warning"):
        lines.append(f"  {kind}: svg({json.dumps(callout_svgs[kind])}),")
    lines += ["};", ""]
    (NEW / "src" / "lib" / "icons.mjs").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    out_dir = NEW / "src" / "content" / "pages"
    out_dir.mkdir(parents=True, exist_ok=True)
    (NEW / "src" / "figures").mkdir(parents=True, exist_ok=True)
    callout_svgs: dict[str, str] = {}
    report = []
    for path in sorted((OLD / "_content").glob("*.html")):
        if path.stem == "index":
            continue
        soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
        for co in soup.select(".callout > svg"):
            h = svg_hash(co)
            for kind, want in CALLOUT_ICON_HASH.items():
                if h == want:
                    callout_svgs.setdefault(kind, svg_inner(co))
        md, page = convert(path)
        (out_dir / f"{path.stem}.md").write_text(md, encoding="utf-8")
        report.append((path.stem, page.stats, md.count("\n## ")))
    write_icons(callout_svgs)
    for stem, st, secs in report:
        print(f"{stem:22s} sections={secs:2d} " + " ".join(f"{k}={v}" for k, v in st.items() if v))
    print(f"icons={len(icon_markup)} figures={len(list((NEW / 'src' / 'figures').glob('*.svg')))}")
    for w in sorted(set(warnings)):
        print("WARN", w)


if __name__ == "__main__":
    main()
