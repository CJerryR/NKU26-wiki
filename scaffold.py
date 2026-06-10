#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scaffold.py — generate _content/*.html for every iGEM deliverable page.

This writes themed, fully-structured scaffolds (front-matter + sectioned body
with data-toc markers, framing copy, reusable components and clearly-marked
placeholder tags) so the team can drop in real data without touching layout.

Hand-authored pages (index, description) are NOT overwritten.
Run once:  python3 scaffold.py   then:  python3 build.py
"""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parent
CONTENT = ROOT / "_content"
CONTENT.mkdir(exist_ok=True)
KEEP = {"index", "description"}   # never overwrite these

# ── component helpers ───────────────────────────────────────────────────────
def prose(*paras):
    return '<div class="prose">' + "".join(f"<p>{p}</p>" for p in paras) + "</div>"

def rich(html):  # raw prose block
    return f'<div class="prose">{html}</div>'

def ph(txt):
    return f'<p class="placeholder-tag">{txt}</p>'

ICONS = {
  "search":'<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.7" y2="16.7"/>',
  "flask":'<path d="M9 3v4l-5 9a3 3 0 0 0 3 4h10a3 3 0 0 0 3-4l-5-9V3"/><line x1="8" y1="3" x2="16" y2="3"/>',
  "cycle":'<path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 4 21 9 16 9"/>',
  "dna":'<path d="M12 2v6M5 8l-2 4 2 4M19 8l2 4-2 4M9 22h6"/><circle cx="12" cy="13" r="3"/>',
  "people":'<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M17 5a3 3 0 0 1 0 6M16 20a6 6 0 0 0-2-4.5"/>',
  "chart":'<line x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="11" width="3" height="6"/><rect x="11" y="7" width="3" height="10"/><rect x="16" y="13" width="3" height="4"/>',
  "shield":'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  "doc":'<path d="M7 3h7l5 5v13H7z"/><polyline points="14 3 14 8 19 8"/>',
  "bulb":'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c.7.7 1 1.3 1 2h6c0-.7.3-1.3 1-2a6 6 0 0 0-4-10z"/>',
  "globe":'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  "gear":'<circle cx="12" cy="12" r="3.2"/><path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.3-1.3L13.7 2h-3.4l-.4 2.5a7 7 0 0 0-2.3 1.3l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.3 1.3l.4 2.5h3.4l.4-2.5a7 7 0 0 0 2.3-1.3l2.3 1 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z"/>',
  "cpu":'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>',
  "leaf":'<path d="M11 20A7 7 0 0 1 4 13c0-6 7-9 16-9 0 9-3 16-9 16z"/><line x1="6" y1="18" x2="13" y2="11"/>',
  "hand":'<path d="M9 11V5a1.5 1.5 0 0 1 3 0v6M12 11V4a1.5 1.5 0 0 1 3 0v7M15 11V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.5L3 14a1.6 1.6 0 0 1 2.5-2L7 14"/>',
  "mic":'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  "rocket":'<path d="M5 15c-2 1-2 5-2 5s4 0 5-2M9 11a8 8 0 0 1 11-7 8 8 0 0 1-7 11l-2 2-4-4z"/><circle cx="15" cy="9" r="1.3"/>',
  "scale":'<path d="M12 3v18M5 7h14M7 7l-3 7h6zM17 7l3 7h-6z"/>',
  "link":'<path d="M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1"/>',
  "book":'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><line x1="9" y1="3" x2="9" y2="19"/>',
  "map":'<polygon points="3 6 9 4 15 6 21 4 21 18 15 20 9 18 3 20"/><line x1="9" y1="4" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="20"/>',
  "users":'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 21a6.5 6.5 0 0 1 13 0M16 5a3.2 3.2 0 0 1 0 6.4M22 21a6.5 6.5 0 0 0-4-6"/>',
  "award":'<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5"/>',
}
def icon(name):
    return (f'<div class="card__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{ICONS.get(name, ICONS["search"])}</svg></div>')

def cards(items, cols=3, stagger=True):
    """items: list of (icon, title, body[, href])"""
    out = [f'<div class="grid grid-{cols}{" reveal" if stagger else ""}"{" data-stagger" if stagger else ""} style="margin-top:26px">']
    for it in items:
        ic, title, body = it[0], it[1], it[2]
        href = it[3] if len(it) > 3 else None
        tag, close = (f'<a class="card" href="{href}">', "</a>") if href else ('<div class="card">', "</div>")
        out.append(f'{tag}<span class="card__ring"></span>{icon(ic)}<h3>{title}</h3><p>{body}</p>{close}')
    out.append("</div>")
    return "".join(out)

def callout(kind, title, body):
    ic = {"note":ICONS_C("note"), "tip":ICONS_C("tip"), "warn":ICONS_C("warn")}[kind]
    return (f'<div class="callout callout--{kind}" style="margin-top:24px">{ic}'
            f'<div><b>{title}</b><p>{body}</p></div></div>')
def ICONS_C(k):
    paths = {
      "note":'<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="13"/><circle cx="12" cy="16.5" r=".6" fill="currentColor"/>',
      "tip":'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c.7.7 1 1.3 1 2h6c0-.7.3-1.3 1-2a6 6 0 0 0-4-10z"/>',
      "warn":'<path d="M12 3l9 16H3z"/><line x1="12" y1="9" x2="12" y2="14"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    }
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
            f'stroke-linecap="round" stroke-linejoin="round">{paths[k]}</svg>')

def timeline(items):
    """items: list of (label, head, body)"""
    lis = "".join(f'<li><span class="when">{a}</span><h4>{b}</h4><p>{c}</p></li>' for a, b, c in items)
    return f'<ul class="timeline" style="margin-top:24px">{lis}</ul>'

def stat_grid(items):
    """items: list of (number_html, label)"""
    cells = "".join(f'<div class="stat"><div class="stat__num">{n}</div><div class="stat__label">{l}</div></div>' for n, l in items)
    return f'<div class="stat-grid reveal" data-stagger style="margin-top:26px">{cells}</div>'

def figure(caption, n="Fig"):
    inner = ('<svg viewBox="0 0 600 200" style="max-width:560px" aria-hidden="true">'
             '<rect x="20" y="30" width="560" height="140" rx="14" fill="none" stroke="#9a7a6b" '
             'stroke-dasharray="6 7"/><text x="300" y="105" text-anchor="middle" '
             'font-family="Space Mono,monospace" font-size="13" fill="#9a7a6b">figure placeholder</text></svg>')
    return (f'<figure class="figure" style="margin-top:26px"><div class="figure__media">{inner}</div>'
            f'<figcaption><b>{n}</b> {caption}</figcaption></figure>')

def refs(items):
    lis = "".join(f'<li>{x} <span class="placeholder-tag">replace</span></li>' for x in items)
    return f'<ol class="refs">{lis}</ol>'

def feature_list(items):
    """items: list of (idx, title, body, href)"""
    out = ['<div class="feature-list reveal" data-stagger>']
    arrow = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
             'stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/>'
             '<polyline points="7 7 17 7 17 17"/></svg>')
    for idx, title, body, href in items:
        out.append(f'<div class="feature"><span class="feature__idx">{idx}</span>'
                   f'<div><h3>{title}</h3><p>{body}</p></div>'
                   f'<a class="feature__go" href="{href}" aria-label="{title}">{arrow}</a></div>')
    out.append("</div>")
    return "".join(out)

# ── section assembler ───────────────────────────────────────────────────────
def section(sid, toc, eyebrow, title, *blocks, subs=None):
    """subs: optional list of (sub_id, sub_label) used only for TOC level-2 entries
       (the matching elements must carry id+data-toc-sub inside the blocks)."""
    head = (f'<p class="eyebrow sec-label">{eyebrow}</p>'
            f'<h2 class="section-title">{title}</h2>')
    return f'<section id="{sid}" data-toc="{toc}">{head}{"".join(blocks)}</section>'

def page(name, meta, sections):
    fm = ["<!--META"]
    for k in ("title", "crumbs", "eyebrow", "heading", "sub", "meta", "desc"):
        if k in meta:
            fm.append(f"{k}: {meta[k]}")
    fm.append("-->")
    body = "\n".join(sections)
    (CONTENT / f"{name}.html").write_text("\n".join(fm) + "\n" + body + "\n", encoding="utf-8")

# editor's note reused at the foot of scaffolded pages
NOTE = callout("tip", "Editor's note",
    "This page is a styled, ready-to-fill scaffold — the layout, outline and animations are wired up. Replace the placeholder tags with your real content.")

# ════════════════════════════════════════════════════════════════════════════
#  PAGE REGISTRY
# ════════════════════════════════════════════════════════════════════════════
PAGES = {}

# ---- PROJECT ---------------------------------------------------------------
PAGES["background"] = (dict(
    title="Background", crumbs="Project / Background", eyebrow="Project · Case file 02",
    heading="The world the pest <span class='ink-accent'>lives in</span>",
    sub="Where these nematodes come from, what they cost, and why the problem keeps growing.",
    meta="Field=Plant pathology | Reading=5 min"),
  [
    section("biology", "Nematode biology", "01 — Biology", "Life cycle of a hidden parasite",
      prose("A short, referenced primer on how plant-parasitic nematodes infect roots, reproduce, and persist in soil between seasons.",
            "Understanding the life cycle is what tells us <em>when</em> and <em>where</em> a detector has to look."),
      figure("Generalised nematode life cycle — replace with your annotated diagram.", "Fig 1"),
      ph("Add life-cycle stages specific to H. glycines and M. incognita")),
    section("impact", "Economic impact", "02 — Impact", "A quietly enormous cost",
      prose("Quantify the agricultural and economic burden of nematode infestation, globally and in your region."),
      stat_grid([("$<span data-count='80'>0</span><span class='unit'>B+</span>", "Lower-bound annual loss · cite"),
                 ("<span data-count='1'>0</span><span class='unit'>st</span>", "Soybean pathogen · H. glycines"),
                 ("<span data-count='2000'>0</span><span class='unit'>+</span>", "Hosts of M. incognita · cite")]),
      ph("Insert local crop-loss figures with citations")),
    section("status", "Why it persists", "03 — Status quo", "Why the problem is not solved",
      cards([("cycle","Survives in soil","Eggs and cysts remain viable for years, defeating crop rotation alone."),
             ("globe","Spreads invisibly","Movement of soil, water and equipment carries infestations between fields."),
             ("shield","Few good tools","Resistant cultivars and nematicides are limited, costly, or environmentally fraught.")]),
      NOTE),
    section("refs", "References", "04 — Sources", "References",
      refs(["Author A. <em>et al.</em> Global nematode impact. <em>Journal</em> (Year).",
            "Author B. <em>et al.</em> Soil persistence of cyst nematodes. <em>Journal</em> (Year)."])),
  ])

PAGES["design"] = (dict(
    title="Design", crumbs="Project / Design", eyebrow="Project · The build",
    heading="Designing the <span class='ink-accent'>detector</span>",
    sub="From a detection requirement to a concrete biological circuit — the reasoning behind every part.",
    meta="Discipline=Synthetic biology | Reading=7 min | Status=Living document"),
  [
    section("brief", "Design brief", "01 — Brief", "What the sensor must do",
      prose("State the design requirements that fall out of the problem: which molecules to detect, the specificity needed to tell the two species apart, the sensitivity threshold, and the constraint that the readout work in the field."),
      cards([("search","Specific","Distinguish each target species from each other and from harmless relatives."),
             ("chart","Sensitive","Detect infestation early, below the threshold of visible crop damage."),
             ("leaf","Field-ready","Function from a soil-derived sample without lab infrastructure.")]),
      ),
    section("architecture", "Circuit architecture", "02 — Architecture", "How the circuit is put together",
      prose("Describe the modular architecture: a recognition module that binds the target signature, a signal-processing/amplification module, and a reporter module that produces the readout."),
      figure("Modular circuit diagram: recognition → amplification → reporter.", "Fig 1"),
      ph("Insert your construct maps and module choices")),
    section("recognition", "Recognition module", "03 — Recognition", "Telling the suspects apart",
      rich("<p>The hardest part of the design. Detail the sequences or biomarkers chosen to uniquely identify each nematode, and the recognition chemistry that reads them.</p>"
           "<h3 id='r-glycines' data-toc-sub='Targeting H. glycines'>Targeting <em class='serif-italic'>H. glycines</em></h3>"
           "<p>Your species-specific target and rationale.</p>"
           "<h3 id='r-incognita' data-toc-sub='Targeting M. incognita'>Targeting <em class='serif-italic'>M. incognita</em></h3>"
           "<p>Your species-specific target and rationale.</p>"),
      ph("Add sequence/biomarker selection evidence")),
    section("reporter", "Reporter & readout", "04 — Reporter", "Making the answer visible",
      prose("Explain the output: colourimetric, fluorescent, or otherwise, and why it suits a field user. Note how a positive is distinguished from background."),
      callout("note","Design for the reader","The readout was chosen so a non-specialist can interpret it confidently — a direct response to what we heard in Human Practices.")),
    section("iterations", "Design iterations", "05 — Iterations", "What changed, and why",
      timeline([("v0.1","First paper design","Initial architecture on paper, before any building."),
                ("v0.2","Revised after modelling","Parameters adjusted in light of the model's predictions."),
                ("v1.0","Build-ready design","The version carried into the wet lab.")]),
      ph("Link each iteration to its Engineering cycle")),
  ])

PAGES["engineering-cycle"] = (dict(
    title="Engineering", crumbs="Project / Engineering", eyebrow="Project · Evidence",
    heading="Engineering <span class='ink-accent'>success</span>",
    sub="Design–Build–Test–Learn, documented cycle by cycle. This is how the detector earned our trust.",
    meta="Framework=DBTL | Cycles=3+ | Reading=8 min"),
  [
    section("approach", "Our approach", "01 — Approach", "How we engineer",
      prose("Introduce the Design–Build–Test–Learn philosophy and how your team applied it rigorously across the season."),
      feature_list([("D","Design","Specify the construct and the hypothesis it tests.","../pages/design.html"),
                    ("B","Build","Assemble the parts and constructs at the bench.","../pages/protocols.html"),
                    ("T","Test","Measure against a defined success criterion.","../pages/results.html"),
                    ("L","Learn","Feed the result into the next design.","#cycle-1")])),
    section("cycle-1", "Cycle 1 — Recognition", "02 — Cycle 1", "Proving the recognition module",
      rich("<h4>Design</h4><p>Hypothesis and construct for this cycle.</p>"
           "<h4>Build</h4><p>What was assembled.</p>"
           "<h4>Test</h4><p>Assay and success criterion.</p>"
           "<h4>Learn</h4><p>Outcome and the change it drove.</p>"),
      figure("Cycle 1 key result.", "Fig 1"), ph("Add data for cycle 1")),
    section("cycle-2", "Cycle 2 — Reporter", "03 — Cycle 2", "Tuning the readout",
      rich("<h4>Design</h4><p>...</p><h4>Build</h4><p>...</p><h4>Test</h4><p>...</p><h4>Learn</h4><p>...</p>"),
      ph("Add data for cycle 2")),
    section("cycle-3", "Cycle 3 — Integration", "04 — Cycle 3", "Putting it together",
      rich("<h4>Design</h4><p>...</p><h4>Build</h4><p>...</p><h4>Test</h4><p>...</p><h4>Learn</h4><p>...</p>"),
      callout("tip","Tell the story","Judges reward a clear narrative thread: each cycle should visibly build on what the previous one taught you.")),
  ])

PAGES["results"] = (dict(
    title="Results", crumbs="Project / Results", eyebrow="Project · Evidence",
    heading="What the detector <span class='ink-accent'>actually did</span>",
    sub="The experimental evidence, presented honestly — including what did not work.",
    meta="Type=Experimental data | Reading=6 min"),
  [
    section("summary", "Headline results", "01 — Summary", "The short version",
      prose("Open with your two or three most important findings, stated plainly, before the detailed data."),
      stat_grid([("<span data-count='0'>0</span>", "Constructs validated · fill"),
                 ("<span data-count='0'>0</span>", "Independent replicates · fill"),
                 ("<span data-count='0'>0</span>", "Species detected · fill")])),
    section("recognition-data", "Recognition results", "02 — Recognition", "Did it bind the right target?",
      figure("Specificity assay across target and non-target species.", "Fig 1"),
      prose("Interpret the figure: specificity, cross-reactivity, and what it means for field use."),
      ph("Insert specificity / binding data")),
    section("readout-data", "Readout results", "03 — Readout", "Was the signal clear?",
      figure("Dose–response / signal-to-noise of the reporter.", "Fig 2"),
      prose("Report sensitivity and the limit of detection achieved."), ph("Insert readout data")),
    section("matrix", "Soil-matrix test", "04 — Matrix", "Did it survive contact with reality?",
      prose("Show performance in a soil-like matrix versus clean buffer — the step toward real deployment."),
      callout("warn","Report the negatives too","Document conditions where detection failed; honest limitations strengthen your case and guide future teams."),
      ph("Insert matrix results")),
    section("refs", "References", "05 — Sources", "References",
      refs(["Methods reference for the assays used above."])),
  ])

PAGES["proof-of-concept"] = (dict(
    title="Proof of Concept", crumbs="Project / Proof of Concept", eyebrow="Project · Evidence",
    heading="Proof of <span class='ink-accent'>concept</span>",
    sub="The end-to-end demonstration that the idea holds together.",
    meta="Milestone=Integrated demo | Reading=4 min"),
  [
    section("claim", "The claim", "01 — Claim", "What we set out to prove",
      prose("State precisely the proof-of-concept claim: that a soil-derived sample can be turned into a correct species call by your integrated system.")),
    section("demo", "The demonstration", "02 — Demo", "Start to finish",
      figure("End-to-end run: sample in, verdict out.", "Fig 1"),
      prose("Walk through the integrated demonstration and its result."), ph("Insert end-to-end demo data")),
    section("limits", "Limitations & next steps", "03 — Limits", "How far it goes",
      prose("Be candid about the boundaries of the demonstration and what would be needed for a deployable product."),
      NOTE),
  ])

PAGES["implementation"] = (dict(
    title="Implementation", crumbs="Project / Implementation", eyebrow="Project · Real world",
    heading="Into the <span class='ink-accent'>field</span>",
    sub="Who would use this, how it reaches them, and what has to be true for it to work in practice.",
    meta="Lens=Deployment | Reading=5 min"),
  [
    section("users", "Intended users", "01 — Users", "Who this is for",
      cards([("users","Smallholder farmers","People who cannot ship samples to a central lab and need an answer on-site."),
             ("leaf","Agronomists & advisors","Professionals guiding planting and treatment decisions."),
             ("globe","Extension & co-ops","Organisations supporting many growers at once.")])),
    section("delivery", "How it's delivered", "02 — Delivery", "From bench to soil",
      prose("Describe the intended product form, the workflow in the hands of a user, and the supply/manufacturing assumptions."),
      ph("Add product form-factor sketch")),
    section("safety-reg", "Safety & regulation", "03 — Regulation", "Doing it responsibly",
      prose("Summarise the biosafety and regulatory considerations of real-world deployment; link to the Safety page."),
      callout("note","Grounded in HP","These plans were shaped by the regulators and practitioners we spoke with — see Human Practices.")),
    section("roadmap", "Roadmap", "04 — Roadmap", "What comes next",
      timeline([("Now","Proof of concept","Validated at the bench."),
                ("Next","Field pilot","Trials with partner growers."),
                ("Later","Scale","Manufacturing and distribution.")])),
  ])

PAGES["parts"] = (dict(
    title="Parts", crumbs="Project / Parts", eyebrow="Project · Registry",
    heading="Our <span class='ink-accent'>parts</span>",
    sub="The basic and composite parts we designed, built, and contributed to the iGEM Registry.",
    meta="Registry=iGEM | Reading=5 min"),
  [
    section("collection", "Part collection", "01 — Collection", "What we contributed",
      prose("Summarise your part collection and how the parts fit together into the detector. Link each to its Registry page."),
      ph("Paste your parts table / Registry links here")),
    section("featured", "Featured parts", "02 — Featured", "The parts we are proud of",
      cards([("dna","BBa_XXXXX — Recognition","One-line description of the part and its role.","#"),
             ("dna","BBa_XXXXX — Reporter","One-line description of the part and its role.","#"),
             ("dna","BBa_XXXXX — Composite","One-line description of the composite device.","#")])),
    section("characterization", "Characterization", "03 — Characterization", "Evidence behind the parts",
      figure("Characterization data for a featured part.", "Fig 1"),
      prose("Show the measurements that document how each contributed part behaves."),
      callout("tip","Document well","Strong part characterization is one of the most reliable ways to score — make the data reproducible.")),
    section("registry", "Registry & contribution", "04 — Registry", "For the next team",
      prose("Note what you added to the Registry for future teams and how it links to your Contribution page."), NOTE),
  ])

PAGES["contribution"] = (dict(
    title="Contribution", crumbs="Project / Contribution", eyebrow="Project · For the community",
    heading="What we leave <span class='ink-accent'>behind</span>",
    sub="A documented contribution that the next team can pick up and build on.",
    meta="Audience=Future iGEMers | Reading=4 min"),
  [
    section("what", "Our contribution", "01 — Contribution", "What we added",
      prose("Describe clearly and concisely what you are contributing to the iGEM community — new parts, characterization, data, protocols, or tools.")),
    section("how", "How to use it", "02 — How to use", "Pick up where we left off",
      feature_list([("01","Read this","What the contribution is and what problem it solves.","#what"),
                    ("02","Get the parts","Where to find the parts and data in the Registry.","../pages/parts.html"),
                    ("03","Reproduce","Protocols to reproduce our results.","../pages/protocols.html")])),
    section("docs", "Documentation", "03 — Docs", "Everything you need",
      prose("Point to the detailed documentation, datasets, and protocols that make the contribution genuinely reusable."), NOTE),
  ])

PAGES["safety"] = (dict(
    title="Safety", crumbs="Project / Safety", eyebrow="Project · Responsibility",
    heading="Working <span class='ink-accent'>safely</span>",
    sub="How we kept ourselves, our community, and the environment safe throughout the project.",
    meta="Scope=Biosafety | Reading=5 min"),
  [
    section("lab", "Lab safety", "01 — Lab", "In the laboratory",
      prose("Describe your lab's safety level, training, supervision, and the practices your team followed day-to-day."),
      cards([("shield","Training","All members completed required biosafety training before bench work."),
             ("flask","Containment","Work performed at the appropriate biosafety level under supervision."),
             ("doc","Protocols","Documented, reviewed procedures for every experiment.")])),
    section("chassis", "Chassis & parts safety", "02 — Chassis", "What we worked with",
      prose("Justify the safety of your chassis organism and the parts used, including any risk-group considerations."),
      ph("List organisms / parts and their risk groups")),
    section("design-safety", "Safety by design", "03 — By design", "Built-in safeguards",
      prose("Explain any design choices that reduce risk — non-pathogenic targets of detection, containment features, and the fact that the device detects rather than releases."),
      callout("note","Detect, don't release","Our system is a diagnostic: it reads a signature from soil rather than introducing an organism into the environment.")),
    section("risk", "Risk assessment", "04 — Risk", "Deployment risks",
      prose("Assess the risks of real-world use and how they are mitigated; connect to Implementation."), NOTE),
  ])

# ---- LAB -------------------------------------------------------------------
PAGES["wet-lab"] = (dict(
    title="Experiments", crumbs="Lab / Wet Lab", eyebrow="Lab · Wet lab",
    heading="At the <span class='ink-accent'>bench</span>",
    sub="The experimental programme behind the detector — what we ran and why.",
    meta="Reading=5 min | See also=Protocols, Results"),
  [
    section("plan", "Experimental plan", "01 — Plan", "How the work was organised",
      prose("Lay out the experimental strategy: the questions, the assays chosen to answer them, and the controls that make the answers trustworthy.")),
    section("workstreams", "Workstreams", "02 — Workstreams", "The parallel tracks",
      cards([("dna","Recognition","Building and testing the species-recognition module."),
             ("flask","Reporter","Developing and tuning the readout."),
             ("leaf","Matrix","Moving from clean buffer toward soil-derived samples.")])),
    section("controls", "Controls & rigour", "03 — Rigour", "Making results mean something",
      prose("Document the positive and negative controls, replication, and blinding that underpin your conclusions."),
      callout("tip","Controls first","Reviewers look hard at controls — describe them as carefully as the experiments themselves."),
      ph("Summarise control design")),
    section("results-link", "Results", "04 — Results", "Where the data lives",
      prose('The findings from these experiments are presented on the <a href="../pages/results.html">Results</a> page.')),
  ])

PAGES["protocols"] = (dict(
    title="Protocols", crumbs="Lab / Protocols", eyebrow="Lab · Methods",
    heading="The <span class='ink-accent'>recipes</span>",
    sub="Reproducible protocols so anyone can repeat what we did.",
    meta="Reading=3 min | Format=Step-by-step"),
  [
    section("index", "Protocol index", "01 — Index", "Everything in one place",
      prose("A linked index of every protocol used in the project, grouped by workstream."),
      cards([("doc","Cloning & assembly","Construct building procedures."),
             ("flask","Assay protocols","Detection and characterization assays."),
             ("leaf","Sample prep","Soil-derived sample preparation.")])),
    section("featured", "A worked protocol", "02 — Example", "One protocol in full",
      rich("<h4>Materials</h4><ul><li>Item one</li><li>Item two</li></ul>"
           "<h4>Steps</h4><ol><li>First step.</li><li>Second step.</li><li>Third step.</li></ol>"),
      ph("Replace with a real, complete protocol")),
    section("repro", "Reproducibility", "03 — Reproducibility", "Notes for repeaters",
      prose("Tips, pitfalls, and version notes that help others reproduce your work faithfully."), NOTE),
  ])

PAGES["notebook"] = (dict(
    title="Notebook", crumbs="Lab / Notebook", eyebrow="Lab · Field notebook",
    heading="The <span class='ink-accent'>casebook</span>",
    sub="Dated entries from the lab — the day-by-day record of the investigation.",
    meta="Reading=ongoing | Format=Chronological"),
  [
    section("how", "How to read this", "01 — Guide", "About this notebook",
      prose("Each entry is dated and tagged by workstream. Together they form the honest, chronological record of how the project actually unfolded — dead ends included.")),
    section("timeline", "Timeline", "02 — Timeline", "The season, in order",
      timeline([("Week 1","Kick-off","Project scoping, literature, and safety training."),
                ("Week 3","First builds","Initial construct assembly begins."),
                ("Week 6","First signal","Earliest evidence of recognition."),
                ("Week 9","Reporter tuning","Optimising the readout."),
                ("Week 12","Integration","End-to-end testing toward proof of concept.")]),
      ph("Add real dated entries")),
    section("entries", "Selected entries", "03 — Entries", "A few in detail",
      rich("<h3 id='entry-a' data-toc-sub='Entry — first signal'>First signal</h3>"
           "<p>What happened, what it meant, what we did next.</p>"
           "<h3 id='entry-b' data-toc-sub='Entry — the setback'>The setback</h3>"
           "<p>A failure and how it reshaped the plan.</p>"),
      callout("note","Honesty scores","A candid notebook that shows real problem-solving is far more convincing than a tidy one.")),
  ])

PAGES["modeling"] = (dict(
    title="Modeling", crumbs="Lab / Modeling", eyebrow="Dry lab · Modeling",
    heading="Modelling the <span class='ink-accent'>signal</span>",
    sub="The mathematics and simulation that guided the design and explained the data.",
    meta="Reading=6 min | Tools=fill in"),
  [
    section("why", "Why we modelled", "01 — Motivation", "What the model is for",
      prose("Explain the questions the model answers: predicting sensitivity, choosing parameters, or interpreting results — and how it fed back into design.")),
    section("model", "The model", "02 — Model", "Assumptions & equations",
      rich("<p>State the model type, key assumptions, and governing equations.</p>"
           "<p>Use inline code for variables, e.g. <code>k_on</code>, <code>k_cat</code>.</p>"),
      figure("Model schematic / equation system.", "Fig 1"), ph("Insert equations and assumptions")),
    section("results", "Predictions vs data", "03 — Results", "Did reality agree?",
      figure("Model prediction overlaid on experimental data.", "Fig 2"),
      prose("Compare predictions with measurements and discuss the fit."),
      callout("tip","Close the loop","The strongest modelling sections show the model changing a real design decision.")),
    section("refs", "References", "04 — Sources", "References",
      refs(["Modelling method / parameter source."])),
  ])

PAGES["software"] = (dict(
    title="Software", crumbs="Lab / Software", eyebrow="Dry lab · Software",
    heading="The <span class='ink-accent'>code</span>",
    sub="Software tools we built to design, analyse, or deploy the detector.",
    meta="Reading=4 min | License=open source"),
  [
    section("overview", "Overview", "01 — Overview", "What we built",
      prose("Introduce the software: what problem it solves, who it is for, and where the repository lives."),
      cards([("cpu","Analysis","Turning raw readout into a clear call."),
             ("gear","Design tools","Helpers for selecting targets or parts."),
             ("globe","Access","How users run it.")])),
    section("how", "How it works", "02 — Architecture", "Under the hood",
      prose("Describe the architecture and key components at a high level."),
      figure("Software architecture diagram.", "Fig 1"), ph("Add architecture + repo link")),
    section("repro", "Use & reproducibility", "03 — Use", "Run it yourself",
      prose("Installation and usage notes; everything needed to reproduce or extend the tool."),
      callout("note","Static & open","Code is hosted in our repository and the wiki ships no external scripts — keeping the site Best-Wiki compliant.")),
  ])

PAGES["hardware"] = (dict(
    title="Hardware", crumbs="Lab / Hardware", eyebrow="Dry lab · Hardware",
    heading="The <span class='ink-accent'>device</span>",
    sub="Physical hardware that takes the detector out of the lab and into the field.",
    meta="Reading=4 min | Status=Prototype"),
  [
    section("need", "The need", "01 — Need", "Why hardware",
      prose("Explain why a hardware component is necessary — what the biology alone cannot do in a field setting.")),
    section("design", "Design", "02 — Design", "How it's built",
      cards([("gear","Mechanical","Enclosure, sample handling, and ergonomics."),
             ("cpu","Readout","How the signal is captured and reported."),
             ("leaf","Field use","Power, robustness, and cost.")]),
      figure("Hardware concept / CAD render.", "Fig 1"), ph("Insert CAD / photos / BOM")),
    section("build", "Build & test", "03 — Build", "Prototype results",
      prose("Document the prototype, how it was built, and how it performed."),
      callout("tip","Open hardware","Share your design files so other teams can reproduce the build.")),
  ])

# ---- HUMAN PRACTICES -------------------------------------------------------
PAGES["human-practices"] = (dict(
    title="Human Practices", crumbs="Human Practices / Overview", eyebrow="Human Practices · In the field",
    heading="Talking to the <span class='ink-accent'>field</span>",
    sub="We asked the people who actually fight nematodes what they need — and let their answers steer the science.",
    meta="Reading=7 min | Approach=Reflexive & integrated"),
  [
    section("approach", "Our approach", "01 — Approach", "How we did human practices",
      prose("Describe your philosophy: who you spoke to, why, and how their input was genuinely fed back into design rather than collected after the fact.")),
    section("stakeholders", "Who we met", "02 — Stakeholders", "The people behind the problem",
      cards([("leaf","Growers","The people living with the pest day to day."),
             ("people","Agronomists","Advisors who translate science into field decisions."),
             ("scale","Regulators","Those who decide what may be deployed and how."),
             ("dna","Researchers","Nematology and diagnostics experts."),
             ("globe","Industry","Companies working on crop protection."),
             ("hand","Community","Local voices on responsible use.")], cols=3)),
    section("what-changed", "What changed", "03 — Impact", "How they reshaped the project",
      timeline([("Input 1","A practitioner told us…","…and we changed X in the design."),
                ("Input 2","A regulator raised…","…and we adjusted our deployment plan."),
                ("Input 3","A grower needed…","…and we reframed the readout.")]),
      callout("note","Integration is the point","Each conversation here maps to a concrete change elsewhere on this wiki — that is what makes it <em>integrated</em> human practices."),
      ph("Document each engagement and its consequence")),
    section("ethics", "Responsibility & ethics", "04 — Ethics", "Doing good, safely",
      prose("Reflect on the ethical, social, and environmental responsibilities of releasing a tool like this into agriculture."), NOTE),
  ])

PAGES["integrated-hp"] = (dict(
    title="Integrated HP", crumbs="Human Practices / Integrated", eyebrow="Human Practices · Integration",
    heading="From conversation to <span class='ink-accent'>circuit</span>",
    sub="A focused look at the specific design decisions that human practices changed.",
    meta="Reading=5 min"),
  [
    section("loop", "The feedback loop", "01 — Loop", "How input became design",
      prose("Show the explicit loop: stakeholder input → design question → change → validation. Make the causality unmistakable.")),
    section("cases", "Worked cases", "02 — Cases", "Three decisions we changed",
      rich("<h3 id='case-1' data-toc-sub='Case — the readout'>The readout</h3>"
           "<p>What we heard, what we changed, and the evidence it was the right call.</p>"
           "<h3 id='case-2' data-toc-sub='Case — the target'>The target</h3>"
           "<p>What we heard, what we changed, and why.</p>"
           "<h3 id='case-3' data-toc-sub='Case — deployment'>Deployment</h3>"
           "<p>What we heard, what we changed, and why.</p>"),
      ph("Tie each case to a page: Design, Results, Implementation")),
    section("reflection", "Reflection", "03 — Reflection", "What we learned about listening",
      callout("tip","Specific beats broad","One design decision you can prove was changed by a stakeholder is worth more than a long list of meetings.")),
  ])

PAGES["education"] = (dict(
    title="Education", crumbs="Human Practices / Education", eyebrow="Human Practices · Education",
    heading="Sharing the <span class='ink-accent'>science</span>",
    sub="How we helped others understand nematodes, biosensing, and synthetic biology.",
    meta="Reading=4 min | Audience=Public & students"),
  [
    section("goals", "Goals", "01 — Goals", "What we wanted to achieve",
      prose("State who you set out to reach and what you wanted them to come away understanding.")),
    section("activities", "Activities", "02 — Activities", "What we did",
      cards([("book","Workshops","Hands-on sessions for students."),
             ("mic","Talks & outreach","Public-facing explanations of the project."),
             ("globe","Materials","Resources we created and shared.")]),
      ph("Add activity descriptions, photos, and reach numbers")),
    section("impact", "Impact", "03 — Impact", "Did it land?",
      prose("Evidence of impact — feedback, reach, or follow-on engagement — rather than just a list of events."),
      callout("note","Measure, don't just do","Reviewers value evidence that your education actually changed understanding.")),
  ])

PAGES["communication"] = (dict(
    title="Communication", crumbs="Human Practices / Communication", eyebrow="Human Practices · Communication",
    heading="Telling the <span class='ink-accent'>story</span>",
    sub="How we communicated the project to the wider world.",
    meta="Reading=3 min"),
  [
    section("channels", "Channels", "01 — Channels", "Where we showed up",
      cards([("globe","Online","Social and web presence."),
             ("mic","In person","Events and presentations."),
             ("book","Press & media","Any coverage or publications.")])),
    section("strategy", "Strategy", "02 — Strategy", "Who we spoke to, and how",
      prose("Explain the communication strategy and how it was tailored to different audiences."), ph("Add reach / engagement evidence")),
    section("reflection", "Reflection", "03 — Reflection", "What worked", NOTE),
  ])

PAGES["entrepreneurship"] = (dict(
    title="Entrepreneurship", crumbs="Human Practices / Entrepreneurship", eyebrow="Human Practices · Business",
    heading="A path to <span class='ink-accent'>impact</span>",
    sub="What it would take for the detector to exist as a real product or service.",
    meta="Reading=5 min"),
  [
    section("problem", "Problem & market", "01 — Market", "The opportunity",
      prose("Frame the market need: who pays, how big the problem is, and why now."),
      ph("Add market sizing with sources")),
    section("model", "Business model", "02 — Model", "How it could work",
      cards([("scale","Value","The value delivered to each customer."),
             ("gear","Model","How the venture would sustain itself."),
             ("rocket","Go-to-market","How it reaches users.")])),
    section("plan", "Plan & feasibility", "03 — Plan", "Getting from here to there",
      timeline([("Stage 1","Validate","Confirm need and technical feasibility."),
                ("Stage 2","Pilot","Limited real-world trials."),
                ("Stage 3","Scale","Manufacturing and distribution.")]),
      callout("tip","Be realistic","A grounded, evidenced plan beats an over-optimistic one.")),
  ])

PAGES["sustainability"] = (dict(
    title="Sustainability", crumbs="Human Practices / Sustainability", eyebrow="Human Practices · Impact",
    heading="Designing for the <span class='ink-accent'>long term</span>",
    sub="How the project connects to sustainable agriculture and global goals.",
    meta="Reading=4 min"),
  [
    section("why", "Why it matters", "01 — Why", "Detection as sustainability",
      prose("Argue how early detection reduces crop loss, chemical use, and waste — a sustainability win, not just a diagnostic.")),
    section("sdgs", "Global goals", "02 — SDGs", "Where we fit",
      cards([("leaf","Food security","Protecting yields for a growing population."),
             ("globe","Responsible inputs","Reducing unnecessary nematicide use."),
             ("scale","Equitable access","A tool usable by smallholders, not only large farms.")]),
      ph("Map explicitly to relevant UN SDGs")),
    section("footprint", "Our footprint", "03 — Footprint", "Practising what we preach",
      prose("Reflect on the sustainability of your own approach — including the choice to ship a lightweight, static, tracker-free wiki."), NOTE),
  ])

PAGES["diversity-inclusion"] = (dict(
    title="Inclusion", crumbs="Human Practices / Inclusion", eyebrow="Human Practices · Inclusion",
    heading="Who gets to <span class='ink-accent'>take part</span>",
    sub="How we worked to make our team, and our science, more inclusive.",
    meta="Reading=3 min"),
  [
    section("team", "In our team", "01 — Team", "How we worked together",
      prose("Describe how your team fostered an inclusive, respectful working environment.")),
    section("reach", "In our reach", "02 — Reach", "Beyond the team",
      cards([("users","Access","Lowering barriers to who can use the tool."),
             ("globe","Language","Reaching beyond a single language or region."),
             ("hand","Equity","Considering who is usually left out.")]),
      ph("Add concrete inclusion initiatives")),
    section("reflection", "Reflection", "03 — Reflection", "What we learned", NOTE),
  ])

# ---- TEAM ------------------------------------------------------------------
PAGES["team-members"] = (dict(
    title="Team", crumbs="Team / Members", eyebrow="Team · The crew",
    heading="The <span class='ink-accent'>investigators</span>",
    sub="The Nankai University students on the trail of a hidden pest.",
    meta="Institution=Nankai University | Reading=3 min"),
  [
    section("members", "Members", "01 — Members", "Meet the team",
      prose("Introduce your student team. Add a photo, name, and one-line role for each member — the people behind every result on this wiki."),
      cards([("people","Member name","Role on the team — e.g. wet lab, modelling, design."),
             ("people","Member name","Role on the team."),
             ("people","Member name","Role on the team."),
             ("people","Member name","Role on the team."),
             ("people","Member name","Role on the team."),
             ("people","Member name","Role on the team.")], cols=3),
      ph("Replace cards with real member photos & bios")),
    section("subteams", "Sub-teams", "02 — Sub-teams", "How we organised",
      cards([("flask","Wet lab","Built and tested the detector."),
             ("cpu","Dry lab","Modelling, software, hardware."),
             ("people","Human practices","Engagement, education, outreach.")])),
    section("thanks", "Thanks", "03 — Thanks", "Standing on shoulders",
      prose('With gratitude to our advisors, instructors, and supporters — see <a href="../pages/attribution.html">Attributions</a>.')),
  ])

PAGES["advisors"] = (dict(
    title="Advisors", crumbs="Team / Advisors", eyebrow="Team · Guidance",
    heading="Our <span class='ink-accent'>advisors</span>",
    sub="The mentors who guided the investigation.",
    meta="Reading=2 min"),
  [
    section("advisors", "Advisors", "01 — Advisors", "Who advised us",
      prose("Introduce your advisors and how they supported the team."),
      cards([("people","Advisor name","Affiliation and how they helped."),
             ("people","Advisor name","Affiliation and how they helped."),
             ("people","Advisor name","Affiliation and how they helped.")]),
      ph("Add advisor names, photos & contributions")),
  ])

PAGES["instructors"] = (dict(
    title="Instructors", crumbs="Team / Instructors", eyebrow="Team · Faculty",
    heading="Our <span class='ink-accent'>instructors</span>",
    sub="The faculty who made this team possible.",
    meta="Reading=2 min"),
  [
    section("instructors", "Instructors", "01 — Instructors", "Who led us",
      prose("Introduce your instructors / PIs and their role in the project."),
      cards([("people","Instructor name","Affiliation and role."),
             ("people","Instructor name","Affiliation and role.")]),
      ph("Add instructor names, photos & roles")),
  ])

PAGES["collaborations"] = (dict(
    title="Collaborations", crumbs="Team / Collaborations", eyebrow="Team · Friends",
    heading="Better <span class='ink-accent'>together</span>",
    sub="The other iGEM teams we worked with, and what we built together.",
    meta="Reading=4 min"),
  [
    section("overview", "Overview", "01 — Overview", "Who we collaborated with",
      prose("Summarise your collaborations and why they mattered to both teams.")),
    section("what", "What we did together", "02 — Activities", "Real, two-way work",
      cards([("link","Team name","What you did together and what each side gained."),
             ("link","Team name","What you did together."),
             ("link","Team name","What you did together.")]),
      callout("tip","Two-way value","Describe what the other team got out of it too — collaborations are judged on mutual benefit."),
      ph("Add collaboration details & outcomes")),
  ])

PAGES["partnerships"] = (dict(
    title="Partnerships", crumbs="Team / Partnerships", eyebrow="Team · Partners",
    heading="Our <span class='ink-accent'>partners</span>",
    sub="Sustained partnerships that shaped the project.",
    meta="Reading=3 min"),
  [
    section("partners", "Partners", "01 — Partners", "Who we partnered with",
      prose("Introduce any sustained partnerships — organisations, labs, or another team you worked with closely over time."),
      cards([("hand","Partner name","Nature of the partnership and its impact."),
             ("hand","Partner name","Nature of the partnership.")]),
      ph("Add partnership descriptions")),
    section("story", "The story", "02 — Story", "How it developed",
      prose("Describe how the partnership evolved and what it produced."), NOTE),
  ])

PAGES["attribution"] = (dict(
    title="Attributions", crumbs="Team / Attributions", eyebrow="Team · Credit",
    heading="Who did <span class='ink-accent'>what</span>",
    sub="Honest attribution of the work behind this project.",
    meta="Reading=3 min | Required=iGEM"),
  [
    section("work", "Attribution of work", "01 — Work", "Crediting the team",
      prose("Per iGEM rules, clearly state which work was done by the student team and which was supported by others. Be specific and honest.")),
    section("breakdown", "By area", "02 — Breakdown", "Who led each part",
      cards([("flask","Wet lab","Members who led the experimental work."),
             ("cpu","Dry lab","Members who led modelling/software/hardware."),
             ("people","Human practices","Members who led engagement & outreach."),
             ("doc","Wiki","Members who built this wiki."),
             ("book","Writing","Members who wrote and edited content."),
             ("hand","Support","Help received from advisors, instructors & others.")], cols=3),
      ph("Replace with your real attribution table")),
    section("thanks", "Acknowledgements", "03 — Thanks", "Thank you",
      prose("Acknowledge everyone — labs, sponsors, the people who gave their time in Human Practices — who helped make this project happen."),
      callout("note","Be generous & precise","Good attribution is both a rule and a courtesy: name names, and say exactly what each person contributed.")),
  ])

# ── write everything ────────────────────────────────────────────────────────
def main():
    written = 0
    for name, (meta, sections) in PAGES.items():
        if name in KEEP:
            continue
        page(name, meta, sections)
        written += 1
    print(f"scaffolded {written} content pages → _content/  (kept: {', '.join(sorted(KEEP))})")

if __name__ == "__main__":
    main()
