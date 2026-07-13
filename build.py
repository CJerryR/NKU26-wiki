#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NKU iGEM 2026  -  static site builder.

Single source of truth: edit content in _content/*.html and the partials in
_partials/ + _templates/base.html, then run `python3 build.py`. Every page is
written as a fully self-contained static HTML file (no runtime fetch, no CDN),
so it works when opened directly AND on iGEM's static GitLab Pages host.

The floating left-hand TOC island (and its mobile counterpart) is generated
automatically from markers in the content:
    <section id="problem" data-toc="The problem"> ...
    <h3 id="suspects" data-toc-sub="The two suspects"> ...
No need to maintain the outline by hand  -  add a marker, rebuild, done.
"""
import html
import json
import re, sys, pathlib
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent
CONTENT = ROOT / "_content"
DATA = ROOT / "_data"
PARTIALS = ROOT / "_partials"
TPL = ROOT / "_templates"
PAGES_DIR = ROOT / "pages"
JS_DIR = ROOT / "js"
SEARCH_DATA = JS_DIR / "search-data.js"

def read(p): return (ROOT / p).read_text(encoding="utf-8")

BASE   = read("_templates/base.html")
NAV    = read("_partials/nav.html")
FOOTER = read("_partials/footer.html")

# -- small reusable SVG snippets --------------------------------------------
def strata(top, bottom, back):
    """A layered soil cross-section wave that transitions `top` -> `bottom`."""
    return (
      '<div class="strata strata--down" aria-hidden="true">'
      '<svg viewBox="0 0 1440 120" preserveAspectRatio="none">'
      f'<rect width="1440" height="120" fill="{top}"/>'
      f'<path fill="{back}" d="M0,60 C240,18 420,96 720,64 C1020,32 1230,92 1440,52 L1440,120 L0,120 Z"/>'
      f'<path fill="{bottom}" d="M0,86 C260,52 470,110 720,86 C1010,58 1240,108 1440,82 L1440,120 L0,120 Z"/>'
      '</svg></div>'
    )

def phero_bg():
    """Subtle 'depth + detection-ring' atmosphere behind a page banner."""
    rings = "".join(
        f'<circle cx="1320" cy="120" r="{r}" fill="none" stroke="#9b7fe0" '
        f'stroke-opacity="{0.16 - i*0.025:.3f}" stroke-width="1.2"/>'
        for i, r in enumerate((70, 130, 200, 280, 370)))
    lines = "".join(
        f'<path d="M-40,{y} C300,{y-22} 900,{y+26} 1480,{y-12}" fill="none" '
        f'stroke="#f4ecdd" stroke-opacity="{0.05 - i*0.006:.3f}" stroke-width="1"/>'
        for i, y in enumerate((140, 210, 280, 350, 420)))
    return ('<div class="phero__bg" aria-hidden="true">'
            '<svg viewBox="0 0 1440 460" preserveAspectRatio="xMidYMid slice">'
            + rings + lines + '</svg></div>')

CHEV_LEFT  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 5 7 12 13 19"/><polyline points="18 5 12 12 18 19"/></svg>'
CHEV_DOWN  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'
ARROW_UP   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="6 11 12 5 18 11"/></svg>'

# -- front-matter parsing ---------------------------------------------------
META_RE = re.compile(r"^\s*<!--META(.*?)-->\s*", re.S)

def parse(src):
    meta = {}
    m = META_RE.match(src)
    body = src
    if m:
        for line in m.group(1).strip().splitlines():
            line = line.strip()
            if not line or ":" not in line:
                continue
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
        body = src[m.end():]
    return meta, body.strip()

TRUE_VALUES = {"true", "yes", "1", "on"}
FALSE_VALUES = {"false", "no", "0", "off"}

def meta_bool(meta, key, default=False):
    if key not in meta:
        return default
    value = str(meta.get(key, "")).strip().lower()
    if value in TRUE_VALUES:
        return True
    if value in FALSE_VALUES:
        return False
    return default

def is_home_page(name, meta):
    return meta.get("layout", "page") == "home" or name == "index"

def normalize_route(meta):
    raw = str(meta.get("route", "")).strip()
    if not raw:
        return ""
    route = raw.replace("\\", "/").strip("/")
    parts = [part for part in route.split("/") if part]
    if not parts or any(part in (".", "..") for part in parts) or any(":" in part for part in parts):
        raise ValueError(f"Invalid route value: {raw!r}")
    return "/".join(parts)

def output_path_for(name, meta):
    if is_home_page(name, meta):
        return ROOT / "index.html"
    route = normalize_route(meta)
    if route:
        return ROOT.joinpath(*route.split("/")) / "index.html"
    return PAGES_DIR / f"{name}.html"

def page_url_for(name, meta):
    if is_home_page(name, meta):
        return "index.html"
    route = normalize_route(meta)
    if route:
        return f"{route}/"
    return f"pages/{name}.html"

def path_prefix_for(out):
    rel = out.relative_to(ROOT)
    depth = max(len(rel.parts) - 1, 0)
    return "../" * depth

def is_draft(meta):
    return meta_bool(meta, "draft")

def is_hidden(meta):
    return meta_bool(meta, "hidden")

def is_searchable(meta):
    return (not is_draft(meta)) and (not is_hidden(meta)) and meta_bool(meta, "search", True)

def read_meta(path):
    return parse(path.read_text(encoding="utf-8"))[0]

# -- TOC generation ---------------------------------------------------------
TOC_RE = re.compile(r'<[a-zA-Z][^>]*\bdata-toc(?P<sub>-sub)?="(?P<label>[^"]*)"[^>]*>')
PLACEHOLDER_P_RE = re.compile(r'<p class="placeholder-tag">(?P<text>.*?)</p>', re.S)
PLACEHOLDER_SPAN_RE = re.compile(r'<span class="placeholder-tag">(?P<text>.*?)</span>', re.S)
INSTRUCTION_P_RE = re.compile(r'<p>(?P<text>.*?)</p>', re.S)
TAG_RE = re.compile(r"<[^>]+>")
ATTR_RE = re.compile(r'([\w:-]+)\s*=\s*(["\'])(.*?)\2', re.S)
SECTION_RE = re.compile(r'<section\b(?P<attrs>[^>]*)>(?P<body>.*?)</section>', re.S | re.I)

INSTRUCTION_STARTERS = (
    "add", "insert", "replace", "paste", "list", "link", "map", "confirm",
    "describe", "explain", "introduce", "point to", "document", "quantify",
    "report", "show", "assess", "note", "reflect", "walk through",
    "justify", "detail", "cite", "swap in", "summarise", "summarize",
    "state", "open with", "acknowledge", "interpret", "compare", "frame",
)

INSTRUCTION_MARKERS = (
    "who you set out to reach",
    "what you wanted them to come away understanding",
    "rather than just a list of events",
    "proof-of-concept claim",
    "by your integrated system",
    "the hardest part of the design",
    "chosen to uniquely identify",
    "compare predictions with measurements",
    "discuss the fit",
    "your two or three most important findings",
    "conditions where detection failed",
    "your case and guide future teams",
    "lab's safety level",
    "your team followed",
    "all members completed required biosafety training",
    "appropriate biosafety level",
    "documented, reviewed procedures",
    "project scoping, literature",
    "initial construct assembly",
    "earliest evidence of recognition",
    "optimising the readout",
    "end-to-end testing toward proof of concept",
    "what happened, what it meant",
    "a failure and how it reshaped",
    "confirm need and technical feasibility",
    "limited real-world trials",
    "trials with partner growers",
    "validated at the bench",
    "market need: who pays",
    "how big the problem is",
    "your conclusions",
    "your own approach",
    "student team. add a photo",
    "who helped make this project happen",
)

SCAFFOLD_REPLACEMENTS = {
    "Editor's note": "Documentation note",
    "This page is a styled, ready-to-fill scaffold  -  the layout, outline and animations are wired up. Replace the placeholder tags with your real content.": "This page is structurally complete; final team evidence will be added before wiki freeze.",
    "This page is a fully-styled scaffold. Replace the placeholder tags with your real figures, citations, and data  -  the layout, animations and outline are already wired up.": "This page is structurally complete; final figures, citations, and data will be added before wiki freeze.",
    "figure placeholder": "figure pending",
    "  -  replace with your final assay schematic.": " - final assay schematic pending.",
    "  -  replace with your annotated diagram.": " - annotated diagram pending.",
    "  /  cite": " / source pending",
    "Member name": "Team member",
    "Advisor name": "Advisor",
    "Instructor name": "Instructor",
    "Team name": "Collaborating team",
    "Partner name": "Partner",
    "Registry ID pending - ": "Registry entry - ",
    "Pending final Registry ID and characterization summary.": "Registry ID and characterization summary will be added here.",
    "Pending final composite-device Registry ID and characterization summary.": "Composite-device Registry ID and characterization summary will be added here.",
    "Role on the team  -  e.g. wet lab, modelling, design.": "Role and contribution summary.",
    "Role on the team.": "Role and contribution summary.",
    "Affiliation and how they helped.": "Affiliation and contribution summary.",
    "advisor names, photos & contributions": "advisor profiles, photos & contributions",
    "Advisor names, photos & contributions": "Advisor profiles, photos & contributions",
    "What you did together and what each side gained.": "Joint activity and mutual outcome.",
    "What you did together.": "Joint activity and outcome.",
    "Describe what the other team got out of it too  -  collaborations are judged on mutual benefit.": "Mutual benefit evidence for both teams.",
    "Your species-specific target and rationale.": "Species-specific target and rationale.",
    "A short, referenced primer on how plant-parasitic nematodes infect roots, reproduce, and persist in soil between seasons.": "Referenced primer on nematode infection, reproduction, and soil persistence.",
    "Open with your two or three most important findings, stated plainly, before the detailed data.": "Headline findings and the key evidence behind them.",
    "State who you set out to reach and what you wanted them to come away understanding.": "Audience, learning goals, and intended takeaways.",
    "Evidence of impact  -  feedback, reach, or follow-on engagement  -  rather than just a list of events.": "Impact evidence, feedback, reach, and follow-on engagement.",
    "Acknowledge everyone  -  labs, sponsors, the people who gave their time in Human Practices  -  who helped make this project happen.": "Acknowledgements for labs, sponsors, Human Practices contributors, and other support.",
    "The hardest part of the design. Detail the sequences or biomarkers chosen to uniquely identify each nematode, and the recognition chemistry that reads them.": "Sequence or biomarker choices and the recognition chemistry behind them.",
    "Compare predictions with measurements and discuss the fit.": "Model predictions compared with experimental measurements.",
    "State precisely the proof-of-concept claim: that a soil-derived sample can be turned into a correct species call by your integrated system.": "Proof-of-concept claim and acceptance criteria.",
    "Project scoping, literature, and safety training.": "Notebook entry summary.",
    "Initial construct assembly begins.": "Notebook entry summary.",
    "Earliest evidence of recognition.": "Notebook entry summary.",
    "Optimising the readout.": "Notebook entry summary.",
    "End-to-end testing toward proof of concept.": "Notebook entry summary.",
    "Week 1": "Date pending",
    "Week 3": "Date pending",
    "Week 6": "Date pending",
    "Week 9": "Date pending",
    "Week 12": "Date pending",
    "What happened, what it meant, what we did next.": "Detailed notebook entry and next decision.",
    "A failure and how it reshaped the plan.": "Setback, interpretation, and plan adjustment.",
    "Confirm need and technical feasibility.": "Need validation and technical feasibility evidence.",
    "Limited real-world trials.": "Pilot plan and validation criteria.",
    "Validated at the bench.": "Bench validation evidence.",
    "Trials with partner growers.": "Field pilot plan and partner requirements.",
    "Manufacturing and distribution.": "Scale-up path, constraints, and partners.",
    "All members completed required biosafety training before bench work.": "Training records and supervision summary.",
    "Work performed at the appropriate biosafety level under supervision.": "Containment level and supervision summary.",
    "Documented, reviewed procedures for every experiment.": "Reviewed protocol list and safety records.",
    "Introduce your student team. Add a photo, name, and one-line role for each member  -  the people behind every result on this wiki.": "Student member photos, names, roles, and contribution summaries.",
    "This wiki represents the NKU-iGEM 2026 team from Nankai University. Final school, department, and official link details should be verified before the public wiki freeze.": "Verified team affiliation, department, and official links.",
    "Strong part characterization is one of the most reliable ways to score - make the data reproducible.": "Reproducible characterization evidence for each part.",
    "Document conditions where detection failed; honest limitations strengthen your case and guide future teams.": "Failed conditions, limitations, and guidance for future teams.",
    "Reviewers value evidence that your education actually changed understanding.": "Reviewers value evidence that the education work actually changed understanding.",
    "Share your design files so other teams can reproduce the build.": "Share design files so other teams can reproduce the build.",
    "One design decision you can prove was changed by a stakeholder is worth more than a long list of meetings.": "One design decision backed by stakeholder evidence is worth more than a long list of meetings.",
    "Any sustained partnerships - organisations, labs, or another team you worked with closely over time.": "Sustained partnerships with organisations, labs, or another team.",
    "any sustained partnerships - organisations, labs, or another team you worked with closely over time.": "Sustained partnerships with organisations, labs, or another team.",
    "Tips, pitfalls, and version notes that help others reproduce your work faithfully.": "Tips, pitfalls, and version notes that help others reproduce the work faithfully.",
    "Everything you need": "Reusable materials",
    "Judges reward a clear narrative thread: each cycle should visibly build on what the previous one taught you.": "Judges reward a clear narrative thread: each cycle should visibly build on the previous result.",
    "Initial architecture on paper, before any building.": "Initial architecture and rationale.",
    "Parameters adjusted in light of the model's predictions.": "Model-informed design revision.",
    "The version carried into the wet lab.": "Build-ready design version.",
    "First step.": "Step one.",
    "Second step.": "Step two.",
    "Third step.": "Step three.",
    "Item one": "Material one",
    "Item two": "Material two",
}

def slot_text(raw):
    """Turn draft instructions into a short public-facing content slot label."""
    text = html.unescape(re.sub(r"\s+", " ", raw).strip())
    text = TAG_RE.sub("", text)
    text = re.sub(
        r"^(Add|Insert|Replace|Paste|List|Link|Map|Confirm|Describe|Explain|Introduce|Point to|Document|Quantify|Report|Show|Assess|Note|Reflect|Walk through|Justify|Detail|Cite|Swap in|Summarise|Summarize|State|Open with|Acknowledge|Interpret|Compare|Frame)\s+",
        "",
        text,
        flags=re.I,
    )
    text = text.replace("your real ", "final ")
    text = text.replace("your own ", "team ")
    text = text.replace("your ", "team ")
    text = text.replace("you are ", "the team is ")
    text = text.replace("you adopt", "the team adopts")
    text = text.replace("you added", "the team added")
    text = text.replace("you spoke", "the team spoke")
    text = text.replace("you worked", "the team worked")
    text = text.replace("team team", "the team")
    text = text.replace("finalised", "finalized")
    text = text.replace("Replace with ", "")
    for old, new in SCAFFOLD_REPLACEMENTS.items():
        text = text.replace(old, new)
    return html.escape(text[:1].upper() + text[1:] if text else "Team content")

def is_instruction_text(raw):
    text = html.unescape(TAG_RE.sub("", raw))
    text = re.sub(r"\s+", " ", text).strip()
    lower = text.lower()
    if not lower:
        return False
    if lower.startswith(INSTRUCTION_STARTERS):
        return True
    return any(marker in lower for marker in INSTRUCTION_MARKERS)

def prepare_body(body):
    """Normalize scaffold markers into final-site content slots.

    The source files can stay useful for editing, while generated pages avoid
    raw draft language such as "replace this" or "Editor's note".
    """
    for old, new in SCAFFOLD_REPLACEMENTS.items():
        body = body.replace(old, new)

    def p_slot(match):
        label = slot_text(match.group("text"))
        return (
            '<aside class="content-slot" role="note">'
            '<span>Pending documentation</span>'
            f'<p>{label}</p>'
            '</aside>'
        )

    def span_slot(match):
        label = slot_text(match.group("text"))
        if label.lower() in {"replace", "citation", "source"}:
            label = "Reference to add"
        return f'<span class="slot-chip">{label}</span>'

    body = INSTRUCTION_P_RE.sub(lambda m: p_slot(m) if is_instruction_text(m.group("text")) else m.group(0), body)
    body = PLACEHOLDER_P_RE.sub(p_slot, body)
    body = PLACEHOLDER_SPAN_RE.sub(span_slot, body)
    return body

# -- global site data -------------------------------------------------------
def load_site_data():
    path = DATA / "site.json"
    if not path.exists():
        return {"sponsors": [], "friends": []}
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("_data/site.json must contain a JSON object.")
    return data

def as_items(value):
    return value if isinstance(value, list) else []

def footer_initials(name):
    words = re.findall(r"[A-Za-z0-9]+", name)
    if words:
        return "".join(w[0] for w in words[:2]).upper()
    compact = re.sub(r"\s+", "", name)
    return (compact[:2] or "?").upper()

def safe_link(url):
    url = str(url or "").strip()
    if not url or url == "#":
        return ""
    if url.lower().startswith(("javascript:", "data:")):
        return ""
    return url

def render_footer_item(item):
    if not isinstance(item, dict):
        return ""
    name = str(item.get("name", "")).strip()
    if not name:
        return ""
    note = str(item.get("note", "")).strip()
    url = safe_link(item.get("url", ""))
    badge = html.escape(footer_initials(name))
    name_html = html.escape(name)
    note_html = f"<span>{html.escape(note)}</span>" if note else ""
    body = (
        f'<span class="footer-feature__mark" aria-hidden="true">{badge}</span>'
        f'<span class="footer-feature__text"><b>{name_html}</b>{note_html}</span>'
    )
    if url:
        return f'<a class="footer-feature" href="{html.escape(url, quote=True)}">{body}</a>'
    return f'<span class="footer-feature">{body}</span>'

def render_sponsor_badge(item):
    if not isinstance(item, dict):
        return ""
    name = str(item.get("name", "")).strip()
    if not name:
        return ""
    url = safe_link(item.get("url", ""))
    body = (
        f'<span class="sponsor-badge__name">{html.escape(name)}</span>'
        '<i class="sponsor-badge__dot" aria-hidden="true"></i>'
    )
    if url:
        return f'<a class="sponsor-badge" href="{html.escape(url, quote=True)}">{body}</a>'
    return f'<span class="sponsor-badge">{body}</span>'

def render_friend_link(item):
    if not isinstance(item, dict):
        return ""
    name = str(item.get("name", "")).strip()
    if not name:
        return ""
    note = str(item.get("note", "")).strip()
    url = safe_link(item.get("url", ""))
    body = (
        f'<span class="friend-link__name">{html.escape(name)}</span>'
        f'<span class="friend-link__note">{html.escape(note)}</span>'
    )
    if url:
        return f'<a class="friend-link" href="{html.escape(url, quote=True)}">{body}</a>'
    return f'<span class="friend-link">{body}</span>'

def render_sponsor_strip(site_data):
    sponsor_badges = "".join(render_sponsor_badge(item) for item in as_items(site_data.get("sponsors", [])))
    if not sponsor_badges:
        return ""
    return (
        '<section class="sponsor-strip" aria-label="Sponsors">'
        '<span class="sr-only">Sponsors</span>'
        '<div class="sponsor-strip__marquee">'
        '<div class="sponsor-strip__track">'
        f'<div class="sponsor-strip__set">{sponsor_badges}</div>'
        f'<div class="sponsor-strip__set" aria-hidden="true">{sponsor_badges}</div>'
        '</div>'
        '</div>'
        '</section>'
    )

def render_footer_features(site_data):
    friend_links = "".join(render_friend_link(item) for item in as_items(site_data.get("friends", [])))
    if not friend_links:
        return ""
    friends = ""
    if friend_links:
        friends = (
            '<section class="friend-links" aria-label="Friend teams">'
            '<div class="friend-links__head">'
            '<b>Friend links</b>'
            '<p>Collaboration teams and partner pages can be linked here after confirmation.</p>'
            '</div>'
            f'<div class="friend-links__grid">{friend_links}</div>'
            '</section>'
        )
    return (
        '<div class="footer-features" aria-label="Sponsors and friend teams">'
        f'{friends}'
        '</div>'
    )

SITE_DATA = load_site_data()
GLOBAL_SPONSOR_STRIP = render_sponsor_strip(SITE_DATA)
GLOBAL_FOOTER_FEATURES = render_footer_features(SITE_DATA)

# -- search index generation -----------------------------------------------
def clean_text(text):
    return html.unescape(re.sub(r"\s+", " ", str(text or "")).strip())

class VisibleTextParser(HTMLParser):
    SKIP_TAGS = {"script", "style", "noscript"}
    BREAK_TAGS = {
        "address", "article", "aside", "blockquote", "br", "dd", "div", "dt",
        "figcaption", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header",
        "li", "main", "nav", "p", "section", "td", "th", "tr",
    }

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip_depth = 0

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in self.SKIP_TAGS:
            self.skip_depth += 1
            return
        if self.skip_depth:
            return
        if tag in self.BREAK_TAGS:
            self.parts.append(" ")
        if tag == "img":
            for key, value in attrs:
                if key.lower() == "alt" and value:
                    self.parts.append(value)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in self.SKIP_TAGS and self.skip_depth:
            self.skip_depth -= 1
            return
        if not self.skip_depth and tag in self.BREAK_TAGS:
            self.parts.append(" ")

    def handle_data(self, data):
        if not self.skip_depth and data.strip():
            self.parts.append(data)

    def text(self):
        return clean_text(" ".join(self.parts))

def visible_text(fragment):
    parser = VisibleTextParser()
    parser.feed(fragment or "")
    parser.close()
    return parser.text()

def attrs_from(attr_text):
    return {k.lower(): html.unescape(v.strip()) for k, _, v in ATTR_RE.findall(attr_text or "")}

def first_heading_text(fragment):
    m = re.search(r"<h[1-6][^>]*>(.*?)</h[1-6]>", fragment or "", re.S | re.I)
    return visible_text(m.group(1)) if m else ""

def page_crumbs(meta):
    parts = [visible_text(part) for part in meta.get("crumbs", "").split("/") if part.strip()]
    return ["Home"] + parts if parts else ["Home"]

def search_sections(body, page_url):
    sections = []
    for m in SECTION_RE.finditer(body):
        attrs = attrs_from(m.group("attrs"))
        section_id = attrs.get("id", "").strip()
        if not section_id:
            continue
        title = clean_text(attrs.get("data-toc") or first_heading_text(m.group("body")) or section_id.replace("-", " ").title())
        sections.append({
            "id": section_id,
            "title": title,
            "text": visible_text(m.group("body")),
            "url": f"{page_url}#{section_id}",
        })
    return sections

def search_entry(path):
    src = path.read_text(encoding="utf-8")
    meta, body = parse(src)
    body = prepare_body(body)
    name = path.stem
    is_home = is_home_page(name, meta)
    url = page_url_for(name, meta)
    title = visible_text(meta.get("title") or meta.get("heading") or ("NKU iGEM 2026" if is_home else name.replace("-", " ").title()))
    desc = visible_text(meta.get("desc") or meta.get("sub") or "")
    crumbs = page_crumbs(meta)
    sections = search_sections(body, url)
    text = clean_text(" ".join([title, desc, *crumbs, visible_text(body)]))
    return {
        "title": title,
        "url": url,
        "crumbs": crumbs,
        "desc": desc,
        "text": text,
        "sections": sections,
    }

def write_search_data(files):
    index = [search_entry(path) for path in files]
    SEARCH_DATA.parent.mkdir(exist_ok=True)
    payload = "window.NKU_SEARCH_INDEX = " + json.dumps(index, ensure_ascii=False, indent=2) + ";\n"
    SEARCH_DATA.write_text(payload, encoding="utf-8")
    section_count = sum(len(entry["sections"]) for entry in index)
    return SEARCH_DATA, len(index), section_count

def toc_items(body):
    items = []
    for m in TOC_RE.finditer(body):
        tag = m.group(0)
        idm = re.search(r'\bid="([^"]+)"', tag)
        if not idm:
            continue
        items.append((idm.group(1), m.group("label"), 2 if m.group("sub") else 1))
    return items

def render_li(items):
    out = []
    for _id, label, lvl in items:
        out.append(f'<li class="lvl-{lvl}"><a href="#{_id}">{label}</a></li>')
    return "\n        ".join(out)

def toc_island(title, items, P):
    lis = render_li(items)
    return f'''<aside class="toc" aria-label="On this page">
      <div class="toc__top">
        <div class="toc__badge"><img src="{P}img/logo.svg" alt="" width="24" height="24"/></div>
        <div class="toc__titles"><div class="toc__kicker">On this page</div><div class="toc__title">{title}</div></div>
        <button class="toc__collapse" aria-label="Collapse outline">{CHEV_LEFT}</button>
      </div>
      <div class="toc__progress" aria-hidden="true"><i></i></div>
      <ul class="toc__list">
        <span class="toc__rail" aria-hidden="true"></span>
        {lis}
      </ul>
      <div class="toc__foot"><a href="#main">{ARROW_UP}Back to top</a></div>
    </aside>'''

def toc_mini(title, items):
    lis = render_li(items)
    return f'''<div class="toc-mini" aria-label="On this page (mobile)">
        <button type="button" class="toc-mini__bar" aria-expanded="false">
          <div class="toc__badge"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#f4ecdd" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6"/><line x1="20" y1="20" x2="15.5" y2="15.5"/></svg></div>
          <b>{title}</b><span class="now"></span>{CHEV_DOWN}
        </button>
        <div class="toc-mini__panel"><ul>
          {lis}
        </ul></div>
      </div>'''

# -- page banner ------------------------------------------------------------
def phero(meta, P):
    crumbs = ['<a href="' + P + 'index.html">Home</a>']
    raw = meta.get("crumbs", "")
    parts = [c.strip() for c in raw.split("/") if c.strip()]
    for i, c in enumerate(parts):
        crumbs.append('<span>/</span>')
        crumbs.append(f'<span>{c}</span>' if i == len(parts) - 1 else c)
    crumbs_html = "".join(crumbs)

    metarow = ""
    if meta.get("meta"):
        cells = []
        for pair in meta["meta"].split("|"):
            if "=" in pair:
                k, v = pair.split("=", 1)
                cells.append(f'<span>{k.strip()}<b>{v.strip()}</b></span>')
        metarow = '<div class="phero__meta">' + "".join(cells) + '</div>'

    heading = meta.get("heading", meta.get("title", "Untitled"))
    sub = f'<p class="phero__sub">{meta["sub"]}</p>' if meta.get("sub") else ""
    eyebrow = f'<p class="eyebrow" style="margin-bottom:14px">{meta["eyebrow"]}</p>' if meta.get("eyebrow") else ""
    return f'''<header class="phero">
    {phero_bg()}
    <div class="phero__inner">
      <nav class="phero__crumbs" aria-label="Breadcrumb">{crumbs_html}</nav>
      {eyebrow}
      <h1>{heading}</h1>
      {sub}
      {metarow}
    </div>
  </header>'''

# -- assemble one page ------------------------------------------------------
def build_page(path):
    src = path.read_text(encoding="utf-8")
    meta, body = parse(src)
    body = prepare_body(body)
    name = path.stem
    is_home = is_home_page(name, meta)
    out = output_path_for(name, meta)
    P = path_prefix_for(out)

    if is_home:
        body_html = body
    else:
        title = meta.get("title", "Untitled")
        items = toc_items(body)
        island = toc_island(title, items, P)
        mini = toc_mini(title, items)
        body_html = (
            phero(meta, P)
            + "\n  " + strata("#191222", "#f7f2e8", "#241830")
            + f'''\n  <div class="layout">
    {island}
    <div class="content">
      {mini}
{body}
    </div>
  </div>\n  '''
            + strata("#f7f2e8", "#180f1e", "#241830")
        )

    title_tag = meta.get("title", "NKU iGEM 2026")
    title_full = "NKU iGEM 2026" if is_home else f"{title_tag}  /  NKU iGEM 2026"
    desc = meta.get("desc", "NKU iGEM 2026  -  a synthetic-biology biosensor for early detection of plant-parasitic nematodes.")
    footer_html = FOOTER.replace("{{GLOBAL_FOOTER_FEATURES}}", GLOBAL_FOOTER_FEATURES)
    footer_html = footer_html.replace("{{GLOBAL_SPONSOR_STRIP}}", GLOBAL_SPONSOR_STRIP)

    html = (BASE
            .replace("{{TITLE}}", title_full)
            .replace("{{DESC}}", desc)
            .replace("{{NAV}}", NAV)
            .replace("{{FOOTER}}", footer_html)
            .replace("{{GLOBAL_SPONSOR_STRIP}}", GLOBAL_SPONSOR_STRIP)
            .replace("{{GLOBAL_FOOTER_FEATURES}}", GLOBAL_FOOTER_FEATURES)
            .replace("{{BODY}}", body_html)
            .replace("{{P}}", P))

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    return out, len(toc_items(body)) if not is_home else 0

def clean_generated_outputs(files):
    PAGES_DIR.mkdir(exist_ok=True)
    # clean previously generated legacy page files so routed pages do not linger
    for f in PAGES_DIR.glob("*.html"):
        f.unlink()

    route_outputs = set()
    for f in files:
        meta = read_meta(f)
        route = normalize_route(meta)
        if route:
            route_outputs.add(output_path_for(f.stem, meta))
    for out in sorted(route_outputs, key=lambda p: str(p)):
        if out.exists():
            out.unlink()
        parent = out.parent
        if parent != ROOT and parent.exists():
            try:
                parent.rmdir()
            except OSError:
                pass

def main():
    if not CONTENT.exists():
        print("No _content/ directory found."); sys.exit(1)

    all_files = sorted(CONTENT.glob("*.html"))
    clean_generated_outputs(all_files)

    files = [f for f in all_files if not is_draft(read_meta(f))]
    search_files = [f for f in files if is_searchable(read_meta(f))]
    hidden_count = sum(1 for f in files if is_hidden(read_meta(f)))
    draft_count = len(all_files) - len(files)

    print(f"Building {len(files)} pages  ->  static HTML\n" + "-" * 52)
    n_home = 0
    for f in files:
        out, ntoc = build_page(f)
        rel = out.relative_to(ROOT)
        tag = "home" if f.stem == "index" else f"{ntoc:2d} toc"
        if f.stem == "index": n_home += 1
        print(f"  {f.stem:22s}  ->  {str(rel):24s} [{tag}]")
    search_path, search_pages, search_sections_n = write_search_data(search_files)
    print("-" * 52)
    print(f"Done. {len(files)} pages, {n_home} home, {hidden_count} hidden, {draft_count} draft.")
    print(f"Search index: {search_path.relative_to(ROOT)} ({search_pages} pages, {search_sections_n} sections)")

if __name__ == "__main__":
    main()
