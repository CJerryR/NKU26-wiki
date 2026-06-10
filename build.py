#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NKU iGEM 2026 — static site builder.

Single source of truth: edit content in _content/*.html and the partials in
_partials/ + _templates/base.html, then run `python3 build.py`. Every page is
written as a fully self-contained static HTML file (no runtime fetch, no CDN),
so it works when opened directly AND on iGEM's static GitLab Pages host.

The floating left-hand TOC island (and its mobile counterpart) is generated
automatically from markers in the content:
    <section id="problem" data-toc="The problem"> ...
    <h3 id="suspects" data-toc-sub="The two suspects"> ...
No need to maintain the outline by hand — add a marker, rebuild, done.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
CONTENT = ROOT / "_content"
PARTIALS = ROOT / "_partials"
TPL = ROOT / "_templates"
PAGES_DIR = ROOT / "pages"

def read(p): return (ROOT / p).read_text(encoding="utf-8")

BASE   = read("_templates/base.html")
NAV    = read("_partials/nav.html")
FOOTER = read("_partials/footer.html")

# ── small reusable SVG snippets ────────────────────────────────────────────
def strata(top, bottom, back):
    """A layered soil cross-section wave that transitions `top`→`bottom`."""
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

# ── front-matter parsing ───────────────────────────────────────────────────
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

# ── TOC generation ─────────────────────────────────────────────────────────
TOC_RE = re.compile(r'<[a-zA-Z][^>]*\bdata-toc(?P<sub>-sub)?="(?P<label>[^"]*)"[^>]*>')

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
        <div class="toc-mini__bar" role="button" tabindex="0">
          <div class="toc__badge"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#f4ecdd" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6"/><line x1="20" y1="20" x2="15.5" y2="15.5"/></svg></div>
          <b>{title}</b><span class="now"></span>{CHEV_DOWN}
        </div>
        <div class="toc-mini__panel"><ul>
          {lis}
        </ul></div>
      </div>'''

# ── page banner ────────────────────────────────────────────────────────────
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

# ── assemble one page ──────────────────────────────────────────────────────
def build_page(path):
    src = path.read_text(encoding="utf-8")
    meta, body = parse(src)
    name = path.stem
    is_home = meta.get("layout", "page") == "home" or name == "index"
    P = "" if is_home else "../"

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
    title_full = "NKU iGEM 2026" if is_home else f"{title_tag} · NKU iGEM 2026"
    desc = meta.get("desc", "NKU iGEM 2026 — a synthetic-biology biosensor for early detection of plant-parasitic nematodes.")

    html = (BASE
            .replace("{{TITLE}}", title_full)
            .replace("{{DESC}}", desc)
            .replace("{{NAV}}", NAV)
            .replace("{{FOOTER}}", FOOTER)
            .replace("{{BODY}}", body_html)
            .replace("{{P}}", P))

    out = (ROOT / "index.html") if is_home else (PAGES_DIR / f"{name}.html")
    out.write_text(html, encoding="utf-8")
    return out, len(toc_items(body)) if not is_home else 0

def main():
    if not CONTENT.exists():
        print("No _content/ directory found."); sys.exit(1)
    PAGES_DIR.mkdir(exist_ok=True)
    # clean previously generated pages so nothing stale lingers
    for f in PAGES_DIR.glob("*.html"):
        f.unlink()

    files = sorted(CONTENT.glob("*.html"))
    print(f"Building {len(files)} pages → static HTML\n" + "-" * 52)
    n_home = 0
    for f in files:
        out, ntoc = build_page(f)
        rel = out.relative_to(ROOT)
        tag = "home" if f.stem == "index" else f"{ntoc:2d} toc"
        if f.stem == "index": n_home += 1
        print(f"  {f.stem:22s} → {str(rel):24s} [{tag}]")
    print("-" * 52)
    print(f"Done. {len(files)} pages, {n_home} home. Output: index.html + pages/*.html")

if __name__ == "__main__":
    main()
