---
title: Component reference
group: Team
icon: book
hidden: true
summary: Every component a Markdown page can use, with the source on the left of each example and the rendered result underneath.
desc: Internal component reference for NKU26-China wiki authors.
meta: Audience=Wiki authors | Build=python3 build.py --styleguide
---

This page is built only with `python3 build.py --styleguide`. It is not part of the live wiki
and the content audit skips it. Open it while writing a page, copy what you need.

## The shape of a page {#page-shape data-toc="The shape of a page"}

A page lives in `_content/<name>.md` and starts with front matter:

```yaml
---
title: Engineering           # the H1 and the browser title
route: engineering           # the URL: /engineering/  (omit to use the file name)
group: Project               # which nav group the breadcrumb shows
icon: wrench                 # the prop the mascot holds in the page icon
summary: One or two sentences under the H1.
desc: The search-result and social-preview description.
meta: Framework=DBTL | Scope=18-record notebook audit
---
```

Then write in Markdown. Each `##` becomes a section in the outline island on the left.
Give it a stable id so links from other pages never break:

```markdown
## What has to be shown {#gates data-toc="Open gates"}
```

`{#gates}` is the anchor, `data-toc` is the (shorter) label in the outline. A `###` with an
id appears as a sub-entry. Reading time, breadcrumb, previous/next links and the evidence
legend are generated; do not write them by hand.

## Linking between pages {#links data-toc="Links"}

Use `page:` plus the **file name** in `_content/`, not the URL. If someone changes a route
later, these links follow it, and the build fails loudly if the page does not exist.

```markdown
See the [Engineering](page:engineering-cycle) page, or jump straight to
[the open gates](page:engineering-cycle#gates).
```

External links are ordinary Markdown links. Do not embed anything that loads from a
non-iGEM server: fonts, scripts, images and videos must be in this repository or on
`video.igem.org` / `static.igem.wiki`.

## Citations {#citations data-toc="Citations"}

Add the entry to `_data/references.bib` once, then cite it anywhere. The reference list at the
foot of the page is generated from what you actually cited, in alphabetical order.

```markdown
Ascaroside signalling is conserved across nematodes [@choe2012].
@kuo2024 report receptors for ascr#3 and ascr#7.
Two at once [@choe2012; @kuo2024], or with a locator [@jones2013, p. 949].
```

Ascaroside signalling is conserved across nematodes [@choe2012].
@kuo2024 report receptors for ascr#3 and ascr#7.
Two at once [@choe2012; @kuo2024], or with a locator [@jones2013, p. 949].

Hovering a citation shows the full reference. Put `<Bibliography />` where you want the list
if the default position (a References section at the end) is wrong for your page.

## Evidence tags {#evidence data-toc="Evidence tags"}

The tags are the core convention of this wiki: a reader should always be able to tell what we
read, what we assume, and what we observed. `<Tag />` is inline, `<Evidence>` wraps a
paragraph. Levels: `literature`, `hypothesis`, `result`, `open`.

```markdown
Gpr2 responds to ascr#3 [@kuo2024]. <Tag level="literature" />

<Evidence level="result">
The 0528 record states that no yeast grew on the double-auxotrophy medium, while
competent yeast grew on YPD as a positive control.
</Evidence>
```

Gpr2 responds to ascr#3 [@kuo2024]. <Tag level="literature" />

<Evidence level="result">
The 0528 record states that no yeast grew on the double-auxotrophy medium, while competent
yeast grew on YPD as a positive control.
</Evidence>

<Evidence level="open">
Independent or sequence confirmation of the delta-Gal80 edit.
</Evidence>

## Callouts {#callouts data-toc="Callouts"}

Three types: `note` for context, `warn` for a limit or risk a reader must not miss, `tip`
for an aside from the mascot. Use `warn` sparingly; if everything is a warning, nothing is.

```markdown
<Callout type="warn" title="The receptor question is open">
Our source material contains no evidence that Gpr2 binds ascr#18.
</Callout>
```

<Callout type="note" title="A note">
Background a reader needs but that would interrupt the argument in the main text.
</Callout>

<Callout type="warn" title="A warning">
A limit, a risk, or a claim that could easily be over-read.
</Callout>

<Callout type="tip" title="A tip from the detective">
Light, human, and rare. The mascot is a guide, not a mascot-shaped decoration on every page.
</Callout>

## DBTL cycles {#dbtl data-toc="DBTL cycles"}

The engineering component. `cycle`, `title` and `outcome` are optional; `outcome` should be a
short, honest summary of where the cycle actually landed.

```markdown
<DBTL cycle="2" title="Transformation and selection" outcome="Documented negative with a working control">
  <Step phase="design">What question this cycle asks, and the construct that answers it.</Step>
  <Step phase="build">What was built, and from which records.</Step>
  <Step phase="test">What was measured, against what control.</Step>
  <Step phase="learn">What it means, and what the next gate is.</Step>
</DBTL>
```

<DBTL cycle="0" title="An example cycle" outcome="Illustrative only">
  <Step phase="design">State the design question and the construct meant to test it.</Step>
  <Step phase="build">Describe what was actually built, citing the record.</Step>
  <Step phase="test">Give the measurement and the control it was measured against.</Step>
  <Step phase="learn">Say what follows, and name the next gate. <Tag level="open" /></Step>
</DBTL>

## Figures and tables {#figures data-toc="Figures and tables"}

`<Figure>` numbers itself. An image needs `alt`; a table sets `kind="table"` and wraps
ordinary Markdown table syntax. Click an image to enlarge it.

```markdown
<Figure src="img/figures/sensing-pipeline.svg" alt="Five stages in a row: ..."
  caption="The intended pipeline. A hypothesis, not a result." credit="Drawn by the team." />

<Figure kind="table" caption="Detection method families.">

| Method | Limitation |
|---|---|
| Morphology | Expertise-dependent |

</Figure>
```

<Figure kind="table" caption="A table inside a figure gets a number and a caption.">

| Method | What it offers | Limitation |
|---|---|---|
| Morphology | Inexpensive, direct | Slow and expertise-dependent |
| qPCR | Strong specificity | Equipment and cost |

</Figure>

Keep the blank lines around the table: without them Markdown will not build it.

## Parts, people and long detail {#other data-toc="Other components"}

```markdown
<PartCard id="BBa_K5555000" name="Gpr2 receptor expression cassette" type="Composite" status="designed">
What it is for, and what evidence exists for it so far.
</PartCard>

<Stakeholder who="Name, if consent covers it" role="Soybean grower, Heilongjiang" when="July 2026"
  changed="We dropped the 48-hour protocol." href="page:engineering-cycle#gates">
What they told us, in our words unless we have consent to quote.
</Stakeholder>

<Details summary="Full PCR programme">
Detail a specialist wants and everyone else would scroll past.
</Details>

<Video src="https://video.igem.org/w/abc123" title="NemaKlear project promotion" />
```

<PartCard id="BBa_K0000000" name="Example part" type="Composite" status="designed">
Status is one word: `designed`, `built`, or `characterised`. Do not write `characterised`
until the characterisation data is on the Results page.
</PartCard>

<Stakeholder who="Example contact" role="Role and place" when="Month 2026" changed="What we changed because of this conversation.">
Summarise what they said. Quote only with consent, and keep quotes short.
</Stakeholder>

<Details summary="A collapsed block of detail">
Anything that would break the flow of the page: a full protocol, a long parameter table, a
derivation.
</Details>

## Abbreviations {#abbr data-toc="Abbreviations"}

Terms in `_data/glossary.json` are expanded automatically on hover, everywhere they appear:
GPCR, PCR, LAMP, DBTL. Add a term there rather than writing the expansion out in each page.
Leave out anything so common that marking it is noise.

## Before you commit {#checks data-toc="Before you commit"}

```bash
python3 build.py                                                    # build
python3 tools/audit_wiki_content.py --generated --generated-root public   # must pass
python3 -m http.server -d public 8000                               # read it in a browser
```

The audit fails on placeholder wording, template tokens, duplicate ids, missing front matter,
external runtime resources, broken internal links, and a set of over-claim patterns. It is
deliberately strict: if it complains, fix the page rather than the audit.
