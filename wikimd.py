# -*- coding: utf-8 -*-
"""
Markdown article pipeline for the NKU iGEM 2026 wiki.

Pages in _content/*.md are written in Markdown with a small set of
MDX-style components (<Figure>, <Callout>, <DBTL> ...), pandoc-style
citations ([@key] / @key) resolved against _data/references.bib, and a
wiki-wide abbreviation glossary (_data/glossary.json).

The syntax deliberately mirrors what an Astro + MDX + rehype-citation stack
accepts, so pages can move to Astro later with little or no rewriting.
The component reference lives in _styleguide/components.md
(build it with `python3 build.py --styleguide`).
"""
import html
import json
import re
import textwrap

try:
    import markdown
except ImportError as exc:  # pragma: no cover - clear message for teammates
    raise SystemExit(
        "The Markdown page pipeline needs Python-Markdown.\n"
        "Install it with:  python3 -m pip install -r requirements.txt"
    ) from exc


# ---------------------------------------------------------------------------
# Icons (24px line icons, drawn for this wiki)
# ---------------------------------------------------------------------------
_ICON_PATHS = {
    "magnifier": '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
    "wrench": '<path d="M14.5 5.5a4 4 0 0 0-5 5L4 16v4h4l5.5-5.5a4 4 0 0 0 5-5l-2.8 2.8-2.7-.3-.3-2.7z"/>',
    "chart": '<path d="M4 4v16h16"/><path d="M7 15l4-5 3 3 5-7"/>',
    "code": '<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>',
    "puzzle": '<path d="M5 8h3.2a2 2 0 1 1 3.6 0H15v3.2a2 2 0 1 1 0 3.6V18H5z"/>',
    "dna": '<path d="M7 3c0 6 10 6 10 12M17 3c0 3-2.5 4.6-5 6M7 21c0-3 2.5-4.6 5-6M17 21c0-2-1-3.3-2.4-4.3"/><path d="M8.5 6.5h7M8.5 17.5h7"/>',
    "flask": '<path d="M9 3h6M10 3v6.5L5 18a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-8.5V3"/><path d="M7.5 15h9"/>',
    "bars": '<path d="M5 20V11M12 20V5M19 20v-6"/>',
    "notebook": '<rect x="6" y="3" width="13" height="18" rx="2"/><path d="M4 7h3M4 12h3M4 17h3M10 8h6M10 12h6"/>',
    "shield": '<path d="M12 3l7 3v5.5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
    "chip": '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
    "chat": '<path d="M4 5h16v11H10l-5 4v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    "book": '<path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5C17 4 14 4.5 12 6z"/><path d="M12 6v14.5"/>',
    "leaf": '<path d="M5 19C5 10.5 11 5 19 5c0 8.5-6 14-14 14z"/><path d="M5 19l7.5-7.5"/>',
    "hands": '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    "briefcase": '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V5.5h6v2M3.5 12.5h17"/>',
    "people": '<circle cx="9" cy="8.5" r="3"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M3.5 19c.6-3.3 3-5 5.5-5s4.9 1.7 5.5 5M14.5 14.3c2.6-.5 5.2.9 6 4.7"/>',
    "scroll": '<path d="M7 4h11v13a3 3 0 0 1-3 3H6a2 2 0 0 1-2-2v-2h10v2a2 2 0 0 0 2 2"/><path d="M10 8h5M10 11.5h5"/>',
    "scale": '<path d="M12 4v16M6 20h12M5 8h14"/><path d="M5 8l-2.5 5a2.5 2.5 0 0 0 5 0zM19 8l-2.5 5a2.5 2.5 0 0 0 5 0z"/>',
    "medal": '<circle cx="12" cy="15" r="5"/><path d="M8.5 11.2L6 3h4l2 4.5L14 3h4l-2.5 8.2"/><path d="M12 13v4"/>',
    "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.2"/>',
    "warn": '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.2v.2"/>',
    "link": '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-left": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    "chevron": '<path d="M6 9l6 6 6-6"/>',
    "search": '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    "external": '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
}


def icon(name, cls="ico", size=24):
    body = _ICON_PATHS.get(name, _ICON_PATHS["magnifier"])
    return (
        f'<svg class="{cls}" viewBox="0 0 24 24" width="{size}" height="{size}" aria-hidden="true" '
        'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" '
        f'stroke-linejoin="round">{body}</svg>'
    )


def icon_names():
    return sorted(_ICON_PATHS)


# ---------------------------------------------------------------------------
# Evidence levels (the NKU-specific component)
# ---------------------------------------------------------------------------
EVIDENCE_LEVELS = {
    "literature": ("Literature", "Reported in a cited publication."),
    "hypothesis": ("Hypothesis", "A project assumption that has not been tested by the team."),
    "result": ("Team result", "Observed in the team's own records."),
    "open": ("Not yet shown", "Required evidence the team has not produced yet."),
}


# ---------------------------------------------------------------------------
# BibTeX
# ---------------------------------------------------------------------------
_LATEX_ACCENTS = {
    '\\"a': "ä", '\\"o': "ö", '\\"u': "ü", '\\"A': "Ä", '\\"O': "Ö", '\\"U': "Ü",
    "\\'e": "é", "\\'a": "á", "\\'i": "í", "\\'o": "ó", "\\'u": "ú", "\\`e": "è",
    "\\^e": "ê", "\\~n": "ñ", "\\c{c}": "ç", "\\ss": "ß", "\\o": "ø",
}


def latex_to_html(text):
    """Very small LaTeX-to-HTML cleanup for bibliography fields."""
    text = re.sub(r"\s+", " ", text or "").strip()
    for old, new in _LATEX_ACCENTS.items():
        text = text.replace("{" + old + "}", new).replace(old, new)
    text = html.escape(text, quote=False)
    text = text.replace("\\&amp;", "&amp;").replace("\\%", "%").replace("\\_", "_")
    for cmd in ("textit", "emph", "mkbibemph"):
        text = re.sub(r"\\" + cmd + r"\{([^{}]*)\}", r"<em>\1</em>", text)
    text = re.sub(r"\\textbf\{([^{}]*)\}", r"<b>\1</b>", text)
    text = text.replace("---", "\u2014").replace("--", "\u2013").replace("~", "\u00a0")
    text = text.replace("{", "").replace("}", "")
    return text


def _read_braced(text, i):
    """text[i] == '{'  ->  (content, index after closing brace)."""
    depth, j = 0, i
    while j < len(text):
        ch = text[j]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[i + 1 : j], j + 1
        j += 1
    raise ValueError("Unbalanced braces in BibTeX entry")


def _parse_fields(body):
    fields, i, n = {}, 0, len(body)
    while i < n:
        m = re.compile(r"\s*,?\s*([A-Za-z][\w-]*)\s*=\s*").match(body, i)
        if not m:
            break
        name, i = m.group(1).lower(), m.end()
        if i < n and body[i] == "{":
            value, i = _read_braced(body, i)
        elif i < n and body[i] == '"':
            j = body.index('"', i + 1)
            value, i = body[i + 1 : j], j + 1
        else:
            m2 = re.compile(r"[^,\s}]+").match(body, i)
            value, i = (m2.group(0), m2.end()) if m2 else ("", i + 1)
        fields[name] = value.strip()
    return fields


def parse_bibtex(text):
    text = "\n".join(line for line in text.splitlines() if not line.lstrip().startswith("%"))
    entries = {}
    for m in re.finditer(r"@(\w+)\s*\{\s*([^,\s]+)\s*,", text):
        kind = m.group(1).lower()
        if kind in {"comment", "string", "preamble"}:
            continue
        body, _ = _read_braced(text, m.start() + m.group(0).index("{"))
        body = body[body.index(",") + 1 :]
        fields = _parse_fields(body)
        fields["_type"] = kind
        key = m.group(2)
        if key in entries:
            raise ValueError(f"Duplicate BibTeX key: {key}")
        entries[key] = fields
    return entries


def _split_authors(raw):
    names = [a.strip() for a in re.split(r"\s+and\s+", raw or "") if a.strip()]
    others = any(n.lower() == "others" for n in names)
    names = [n for n in names if n.lower() != "others"]
    parsed = []
    for name in names:
        name = re.sub(r"[{}]", "", name)
        if "," in name:
            last, given = [p.strip() for p in name.split(",", 1)]
        else:
            parts = name.split()
            last, given = parts[-1], " ".join(parts[:-1])
        parsed.append((last, given))
    return parsed, others


def _initials(given):
    out = []
    for part in given.split():
        if re.fullmatch(r"[A-Z]\.?", part):
            out.append(part.rstrip(".") + ".")
        elif "-" in part:
            out.append("-".join(p[:1] + "." for p in part.split("-") if p))
        elif part:
            out.append(part[0] + ".")
    return " ".join(out)


def cite_label(entry):
    authors, others = _split_authors(entry.get("author") or entry.get("editor", ""))
    year = latex_to_html(entry.get("year", "n.d."))
    if not authors:
        who = latex_to_html(entry.get("title", "Anon."))[:40]
    elif len(authors) == 1 and not others:
        who = latex_to_html(authors[0][0])
    elif len(authors) == 2 and not others:
        who = f"{latex_to_html(authors[0][0])} &amp; {latex_to_html(authors[1][0])}"
    else:
        who = f"{latex_to_html(authors[0][0])} et al."
    return who, year


def format_reference(entry):
    authors, others = _split_authors(entry.get("author", ""))
    names = [f"{latex_to_html(last)}, {_initials(latex_to_html(given))}".rstrip(", ") for last, given in authors]
    if others:
        names.append("et al.")
    if len(names) > 1 and not others:
        who = ", ".join(names[:-1]) + ", &amp; " + names[-1]
    else:
        who = ", ".join(names)
    year = latex_to_html(entry.get("year", "n.d."))
    title = latex_to_html(entry.get("title", ""))
    venue = latex_to_html(entry.get("journal") or entry.get("booktitle") or entry.get("publisher") or "")
    vol = latex_to_html(entry.get("volume", ""))
    num = latex_to_html(entry.get("number", ""))
    pages = latex_to_html(entry.get("pages", ""))
    parts = [f"{who} ({year}). {title}."]
    if venue:
        tail = f"<em>{venue}</em>"
        if vol:
            tail += f", <em>{vol}</em>" + (f"({num})" if num else "")
        if pages:
            tail += f", {pages}"
        parts.append(tail + ".")
    doi = entry.get("doi", "").strip()
    url = entry.get("url", "").strip()
    if doi:
        href = doi if doi.startswith("http") else f"https://doi.org/{doi}"
        parts.append(f'<a href="{html.escape(href, quote=True)}">{html.escape(href)}</a>')
    elif url:
        parts.append(f'<a href="{html.escape(url, quote=True)}">{html.escape(url)}</a>')
    return " ".join(parts)


def _sort_key(entry):
    authors, _ = _split_authors(entry.get("author", ""))
    first = authors[0][0].lower() if authors else entry.get("title", "").lower()
    return (re.sub(r"[{}\\]", "", first), entry.get("year", ""))


# ---------------------------------------------------------------------------
# Render context
# ---------------------------------------------------------------------------
TOKEN_RE = re.compile(r"NKU(?:CMP|INL)\d+X")


class RenderContext:
    def __init__(self, page, bib, glossary, prefix="{{P}}"):
        self.page = page
        self.bib = bib
        self.glossary = glossary
        self.prefix = prefix
        self.stash = {}
        self.code = {}
        self.counter = 0
        self.figures = 0
        self.tables = 0
        self.cited = []
        self.cite_counts = {}
        self.bib_placed = False
        self.evidence_levels = []

    def put(self, fragment, block):
        key = f"NKU{'CMP' if block else 'INL'}{self.counter}X"
        self.counter += 1
        self.stash[key] = fragment
        return f"\n\n{key}\n\n" if block else key

    def restore(self, text):
        for _ in range(12):
            if not TOKEN_RE.search(text):
                break
            text = re.sub(r"<p>\s*(NKUCMP\d+X)\s*</p>", lambda m: self.stash.get(m.group(1), m.group(0)), text)
            text = TOKEN_RE.sub(lambda m: self.stash.get(m.group(0), m.group(0)), text)
        return text

    def asset(self, src):
        src = (src or "").strip()
        if re.match(r"^(https?:|data:|#)", src):
            return src
        return self.prefix + src.lstrip("/")

    def note_evidence(self, level):
        if level not in self.evidence_levels:
            self.evidence_levels.append(level)


# ---------------------------------------------------------------------------
# Source protection helpers
# ---------------------------------------------------------------------------
FENCE_RE = re.compile(r"(^|\n)(```|~~~)[^\n]*\n.*?\n\2[ \t]*(?=\n|$)", re.S)
CODE_SPAN_RE = re.compile(r"(`+)(?!`)(.+?)(?<!`)\1(?!`)", re.S)


def _split_fences(src):
    parts, last = [], 0
    for m in FENCE_RE.finditer(src):
        parts.append((False, src[last : m.start()]))
        parts.append((True, src[m.start() : m.end()]))
        last = m.end()
    parts.append((False, src[last:]))
    return parts


def _protect_code_spans(text, saved):
    """Hide `code spans` so components and citations inside them stay literal.

    The store is shared through the render context, so a component's inner text
    still carries its parent's tokens and can restore them before its own
    Markdown pass turns the backticks into <code>.
    """
    def keep(m):
        key = f"NKUCODE{len(saved)}Z"
        saved[key] = m.group(0)
        return key

    return CODE_SPAN_RE.sub(keep, text)


def _unprotect(text, saved):
    for key, value in saved.items():
        text = text.replace(key, value)
    return text


# ---------------------------------------------------------------------------
# Citations
# ---------------------------------------------------------------------------
BRACKET_CITE_RE = re.compile(r"\[((?:\s*-?@[A-Za-z0-9_:.\-]+[^;\]\[]*;?)+)\]")
NARRATIVE_CITE_RE = re.compile(r"(?<![\w@\[/.])@([A-Za-z0-9_:.\-]*[A-Za-z0-9_])")


def _cite_anchor(ctx, key, text):
    if key not in ctx.bib:
        raise ValueError(f"[{ctx.page}] unknown citation key @{key} (add it to _data/references.bib)")
    if key not in ctx.cited:
        ctx.cited.append(key)
    n = ctx.cite_counts.get(key, 0) + 1
    ctx.cite_counts[key] = n
    return (
        f'<a class="cite" id="cite-{html.escape(key, quote=True)}-{n}" '
        f'href="#bib-{html.escape(key, quote=True)}" data-cite="{html.escape(key, quote=True)}">{text}</a>'
    )


def process_citations(text, ctx):
    def bracket(m):
        items = [s.strip() for s in m.group(1).split(";") if s.strip()]
        rendered = []
        for item in items:
            im = re.match(r"(-?)@([A-Za-z0-9_:.\-]*[A-Za-z0-9_])\s*,?\s*(.*)$", item)
            if not im:
                return m.group(0)
            suppress, key, locator = im.groups()
            who, year = cite_label(ctx.bib.get(key, {})) if key in ctx.bib else ("", "")
            label = year if suppress else f"{who}, {year}"
            if locator:
                label += ", " + html.escape(locator)
            rendered.append(_cite_anchor(ctx, key, label))
        return ctx.put("(" + "; ".join(rendered) + ")", block=False)

    text = BRACKET_CITE_RE.sub(bracket, text)

    def narrative(m):
        key = m.group(1)
        if key not in ctx.bib:
            return m.group(0)
        who, year = cite_label(ctx.bib[key])
        return ctx.put(f"{who} ({_cite_anchor(ctx, key, year)})", block=False)

    return NARRATIVE_CITE_RE.sub(narrative, text)


def render_bibliography(ctx):
    if not ctx.cited:
        return ""
    entries = sorted(ctx.cited, key=lambda k: _sort_key(ctx.bib[k]))
    items = []
    for key in entries:
        ref = format_reference(ctx.bib[key])
        back = f' <a class="bib__back" href="#cite-{html.escape(key, quote=True)}-1" aria-label="Back to first citation">&#8617;</a>'
        items.append(f'<li id="bib-{html.escape(key, quote=True)}">{ref}{back}</li>')
    return '<ol class="bib">' + "".join(items) + "</ol>"


# ---------------------------------------------------------------------------
# Components
# ---------------------------------------------------------------------------
COMPONENTS = {
    "Figure", "Callout", "Evidence", "Tag", "DBTL", "Step", "Details",
    "Video", "PartCard", "Stakeholder", "Bibliography",
}
INLINE_COMPONENTS = {"Tag"}
OPEN_TAG_RE = re.compile(
    r"<([A-Z][A-Za-z]*)((?:\s+[A-Za-z_][\w-]*(?:\s*=\s*(?:\"[^\"]*\"|'[^']*'))?)*)\s*(/?)>"
)
ATTR_RE = re.compile(r"([A-Za-z_][\w-]*)(?:\s*=\s*(?:\"([^\"]*)\"|'([^']*)'))?")


def _attrs(raw):
    out = {}
    for m in ATTR_RE.finditer(raw or ""):
        value = m.group(2) if m.group(2) is not None else m.group(3)
        out[m.group(1)] = True if value is None else value
    return out


def _find_close(src, name, start):
    pattern = re.compile(r"<" + name + r"\b[^>]*?(/?)>|</" + name + r"\s*>")
    depth = 1
    for m in pattern.finditer(src, start):
        if m.group(0).startswith("</"):
            depth -= 1
            if depth == 0:
                return m.start(), m.end()
        elif m.group(1) != "/":
            depth += 1
    raise ValueError(f"<{name}> is missing its closing </{name}> tag")


def expand_components(src, ctx):
    out, i = [], 0
    while True:
        m = OPEN_TAG_RE.search(src, i)
        if not m:
            out.append(src[i:])
            break
        name = m.group(1)
        if name not in COMPONENTS:
            out.append(src[i : m.end()])
            i = m.end()
            continue
        out.append(src[i : m.start()])
        attrs = _attrs(m.group(2))
        if m.group(3) == "/":
            inner, end = None, m.end()
        else:
            close_start, end = _find_close(src, name, m.end())
            inner = src[m.end() : close_start]
        fragment = render_component(name, attrs, inner, ctx)
        out.append(ctx.put(fragment, block=name not in INLINE_COMPONENTS))
        i = end
    return "".join(out)


def _esc(value):
    return html.escape(str(value or ""), quote=True)


def _require(name, attrs, *keys):
    missing = [k for k in keys if not attrs.get(k)]
    if missing:
        raise ValueError(f"<{name}> needs attribute(s): {', '.join(missing)}")


def render_component(name, a, inner, ctx):
    body = lambda: render_markdown(inner or "", ctx) if inner and inner.strip() else ""

    if name == "Figure":
        kind = a.get("kind", "figure")
        if kind == "table":
            ctx.tables += 1
            label = f"Table {ctx.tables}"
        else:
            ctx.figures += 1
            label = f"Figure {ctx.figures}"
        fid = a.get("id") or ("tab" if kind == "table" else "fig") + f"-{ctx.tables if kind == 'table' else ctx.figures}"
        if a.get("src"):
            _require(name, a, "alt")
            zoom = "" if a.get("zoom") == "false" else ' data-zoom'
            media = (
                f'<img src="{_esc(ctx.asset(a["src"]))}" alt="{_esc(a["alt"])}" loading="lazy" decoding="async"{zoom}>'
            )
        else:
            media = body()
        caption = render_inline(a.get("caption", ""), ctx)
        credit = f' <span class="afig__credit">{render_inline(a["credit"], ctx)}</span>' if a.get("credit") else ""
        width = f" afig--{_esc(a['width'])}" if a.get("width") else ""
        return (
            f'<figure class="afig{width}" id="{_esc(fid)}"><div class="afig__media">{media}</div>'
            f'<figcaption><b class="afig__num">{label}</b> {caption}{credit}</figcaption></figure>'
        )

    if name == "Callout":
        kind = a.get("type", "note")
        if kind not in {"note", "warn", "tip"}:
            raise ValueError("<Callout type> must be note, warn or tip")
        title = f'<p class="callout2__title">{render_inline(a["title"], ctx)}</p>' if a.get("title") else ""
        if kind == "tip":
            badge = f'<span class="callout2__mascot"><img src="{_esc(ctx.asset("img/mascot-trim.png"))}" alt="" width="46" height="42"></span>'
        else:
            badge = f'<span class="callout2__icon">{icon("warn" if kind == "warn" else "info")}</span>'
        return f'<aside class="callout2 callout2--{kind}">{badge}<div class="callout2__body">{title}{body()}</div></aside>'

    if name in {"Evidence", "Tag"}:
        level = a.get("level", "")
        if level not in EVIDENCE_LEVELS:
            raise ValueError(f"<{name} level> must be one of {', '.join(EVIDENCE_LEVELS)}")
        ctx.note_evidence(level)
        label, hint = EVIDENCE_LEVELS[level]
        tag = f'<span class="etag etag--{level}" title="{_esc(hint)}">{label}</span>'
        if name == "Tag":
            return tag
        return f'<div class="evi evi--{level}">{tag}<div class="evi__body">{body()}</div></div>'

    if name == "DBTL":
        if not inner or "<Step" not in inner:
            raise ValueError("<DBTL> needs <Step phase=...> children")
        steps = []
        for sm in re.finditer(r"<Step\b([^>]*)>(.*?)</Step\s*>", inner, re.S):
            sa = _attrs(sm.group(1))
            phase = str(sa.get("phase", "")).lower()
            if phase not in {"design", "build", "test", "learn"}:
                raise ValueError("<Step phase> must be design, build, test or learn")
            steps.append(
                f'<li class="dbtl__step dbtl__step--{phase}"><span class="dbtl__letter" aria-hidden="true">{phase[0].upper()}</span>'
                f'<div class="dbtl__text"><p class="dbtl__phase">{phase.title()}</p>{render_markdown(sm.group(2), ctx)}</div></li>'
            )
        head = ""
        if a.get("cycle") or a.get("title") or a.get("outcome"):
            cycle = f'<span class="dbtl__cycle">Cycle {_esc(a["cycle"])}</span>' if a.get("cycle") else ""
            title = f'<span class="dbtl__title">{render_inline(a["title"], ctx)}</span>' if a.get("title") else ""
            outcome = f'<span class="dbtl__outcome">{render_inline(a["outcome"], ctx)}</span>' if a.get("outcome") else ""
            head = f'<div class="dbtl__head">{cycle}{title}{outcome}</div>'
        compact = " dbtl--compact" if a.get("compact") else ""
        return f'<div class="dbtl{compact}">{head}<ol class="dbtl__steps">{"".join(steps)}</ol></div>'

    if name == "Step":
        raise ValueError("<Step> can only be used inside <DBTL>")

    if name == "Details":
        _require(name, a, "summary")
        return (
            f'<details class="adetails"><summary>{render_inline(a["summary"], ctx)}</summary>'
            f'<div class="adetails__body">{body()}</div></details>'
        )

    if name == "Video":
        _require(name, a, "src", "title")
        if not str(a["src"]).startswith("https://video.igem.org/"):
            raise ValueError("<Video src> must be an iGEM-hosted embed (https://video.igem.org/...)")
        return (
            f'<div class="avideo"><iframe src="{_esc(a["src"])}" title="{_esc(a["title"])}" loading="lazy" '
            'allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups" '
            'referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'
        )

    if name == "PartCard":
        _require(name, a, "id", "name")
        pid = str(a["id"]).strip()
        href = a.get("href") or f"https://registry.igem.org/parts/{pid.lower().replace('_', '-')}"
        status = str(a.get("status", "designed")).lower()
        kind = f'<span class="part__type">{_esc(a["type"])}</span>' if a.get("type") else ""
        return (
            f'<article class="part"><header class="part__head"><a class="part__id" href="{_esc(href)}">{_esc(pid)}</a>{kind}'
            f'<span class="part__status part__status--{_esc(status)}">{_esc(status.title())}</span></header>'
            f'<p class="part__name">{render_inline(a["name"], ctx)}</p><div class="part__body">{body()}</div></article>'
        )

    if name == "Stakeholder":
        _require(name, a, "who")
        who = str(a["who"])
        initials = "".join(w[0] for w in re.findall(r"[A-Za-z]+", who)[:2]).upper() or "?"
        role = f'<span class="stk__role">{render_inline(a["role"], ctx)}</span>' if a.get("role") else ""
        when = f'<span class="stk__when">{_esc(a["when"])}</span>' if a.get("when") else ""
        changed = ""
        if a.get("changed"):
            text = render_inline(a["changed"], ctx)
            if a.get("href"):
                text = f'<a href="{_esc(a["href"])}">{text}</a>'
            changed = f'<footer class="stk__changed"><b>What this changed</b> {text}</footer>'
        return (
            f'<article class="stk"><header class="stk__head"><span class="stk__avatar" aria-hidden="true">{_esc(initials)}</span>'
            f'<span class="stk__who"><b>{_esc(who)}</b>{role}</span>{when}</header>'
            f'<div class="stk__said">{body()}</div>{changed}</article>'
        )

    if name == "Bibliography":
        ctx.bib_placed = True
        return "NKUBIBLIOGRAPHY"

    raise ValueError(f"Unknown component <{name}>")


# ---------------------------------------------------------------------------
# Markdown
# ---------------------------------------------------------------------------
def github_slug(value, separator="-"):
    value = html.unescape(re.sub(r"<[^>]+>", "", str(value))).strip().lower()
    value = re.sub(r"[^\w\s-]", "", value)
    return re.sub(r"\s+", separator, value)


def _markdown(ctx, with_ids):
    exts = ["tables", "attr_list", "fenced_code", "sane_lists", "md_in_html", "abbr"]
    cfg = {"abbr": {"glossary": ctx.glossary}}
    if with_ids:
        exts += ["toc", "footnotes"]
        cfg["toc"] = {"slugify": github_slug, "toc_depth": "2-3"}
    return markdown.Markdown(extensions=exts, extension_configs=cfg, output_format="html")


def render_markdown(src, ctx, top=False):
    src = textwrap.dedent(src or "").strip("\n")
    pieces = []
    for is_code, text in _split_fences(src):
        if is_code:
            pieces.append(text)
            continue
        text = _protect_code_spans(text, ctx.code)
        text = expand_components(text, ctx)
        text = process_citations(text, ctx)
        pieces.append(_unprotect(text, ctx.code))
    rendered = _markdown(ctx, with_ids=top).convert("".join(pieces))
    return ctx.restore(rendered)


def render_inline(text, ctx):
    rendered = render_markdown(str(text or ""), ctx)
    m = re.fullmatch(r"\s*<p>(.*)</p>\s*", rendered, re.S)
    return m.group(1) if m and "<p>" not in m.group(1) else rendered


# ---------------------------------------------------------------------------
# Page assembly
# ---------------------------------------------------------------------------
H2_SPLIT_RE = re.compile(r"(?=<h2\b)")
TAG_ATTR_RE = re.compile(r'\s(id|data-toc)="([^"]*)"')


def _heading_text(fragment):
    text = re.sub(r"<abbr[^>]*>(.*?)</abbr>", r"\1", fragment, flags=re.S)
    return html.unescape(re.sub(r"<[^>]+>", "", text)).strip()


def _anchor(hid):
    return (
        f'<a class="h-anchor" href="#{hid}" aria-label="Link to this section">'
        f'{icon("link", "h-anchor__ico", 16)}</a>'
    )


def wrap_sections(body):
    """Wrap each <h2> and its following content in <section id data-toc>."""
    chunks = H2_SPLIT_RE.split(body)
    out = []
    for chunk in chunks:
        if not chunk.startswith("<h2"):
            if chunk.strip():
                out.append(f'<div class="art-intro">{chunk}</div>')
            continue
        m = re.match(r"<h2\b([^>]*)>(.*?)</h2>", chunk, re.S)
        attrs, inner = m.group(1), m.group(2)
        found = dict(TAG_ATTR_RE.findall(attrs))
        hid = found.get("id") or github_slug(_heading_text(inner))
        label = found.get("data-toc") or _heading_text(inner)
        clean_attrs = TAG_ATTR_RE.sub("", attrs)
        rest = chunk[m.end():]

        def h3(mm):
            a3 = dict(TAG_ATTR_RE.findall(mm.group(1)))
            if not a3.get("id"):
                return mm.group(0)
            lab = a3.get("data-toc") or _heading_text(mm.group(2))
            keep = TAG_ATTR_RE.sub("", mm.group(1))
            return (
                f'<h3 id="{a3["id"]}" data-toc-sub="{html.escape(lab, quote=True)}"{keep}>'
                f'{mm.group(2)}{_anchor(a3["id"])}</h3>'
            )

        rest = re.sub(r"<h3\b([^>]*)>(.*?)</h3>", h3, rest, flags=re.S)
        out.append(
            f'<section id="{hid}" data-toc="{html.escape(label, quote=True)}">'
            f'<h2{clean_attrs}>{inner}{_anchor(hid)}</h2>{rest}</section>'
        )
    return "\n".join(out)


def wrap_tables(body):
    return re.sub(r"<table>(.*?)</table>", r'<div class="table-wrap"><table>\1</table></div>', body, flags=re.S)


def renumber_citations(body):
    """Components render before surrounding text, so give citation ids reading order."""
    seen = {}

    def renumber(m):
        key = m.group(1)
        seen[key] = seen.get(key, 0) + 1
        return f'id="cite-{key}-{seen[key]}"'

    return re.sub(r'id="cite-([^"]+?)-\d+"', renumber, body)


def render_article(src, ctx):
    """Full page body for a Markdown article: sections, tables, bibliography."""
    body = render_markdown(src, ctx, top=True)
    body = renumber_citations(wrap_tables(body))
    bibliography = render_bibliography(ctx)
    if ctx.bib_placed:
        body = body.replace("NKUBIBLIOGRAPHY", bibliography)
        body = wrap_sections(body)
    else:
        body = body.replace("NKUBIBLIOGRAPHY", "")
        body = wrap_sections(body)
        if bibliography:
            body += (
                '\n<section id="references" data-toc="References"><h2>References'
                f'{_anchor("references")}</h2>{bibliography}</section>'
            )
    return body


def load_glossary(path):
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    return {k: v for k, v in data.items() if not k.startswith("_")}


def load_bibliography(path):
    if not path.exists():
        return {}
    return parse_bibtex(path.read_text(encoding="utf-8"))
