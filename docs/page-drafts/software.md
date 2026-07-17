---
source: _content/software.html
slug: software
title: Software
route: software
crumbs: Lab / Software
eyebrow: Dry lab / Software
heading: The code
sub: The static build system behind this wiki - editable page sources and shared templates, assembled by one Python 3 script into the pages you are reading.
meta: Stack=HTML + CSS + JavaScript | Build=Python 3 | Delivery=Static
---

# Software

01 - Overview

## The wiki is the software

Our software contribution is the thing you are looking at. A competition wiki is a multi-page publication that has to stay visually consistent while it is edited, has to be legible months later to someone who did not write it, and must not reach for a third-party service the moment somebody opens it. This repository treats that last constraint as a hard requirement, and the whole system is arranged around it.

The answer is a single source of truth. Page text lives in `_content/*.html`, one fragment per page. The document shell lives in `_templates/base.html`, and the one navigation and the one footer live in `_partials/`. A single script, `build.py`, assembles them into the static HTML that is actually served. Nothing is copied between pages by hand, and generated HTML is never edited by hand either: the builder deletes and rewrites it on every run.

### Edit one file

Page text, the shared shell, and the navigation and footer each exist exactly once. Every page is assembled from them.

### Run one command

One script rebuilds every published page and regenerates the search index. Python 3 is the only prerequisite.

### Ship no dependencies

Self-hosted fonts, native JavaScript, no runtime fetch and no CDN. The pages do still load repository-local CSS, JavaScript, fonts and images.

02 - Architecture

## Source in, static pages out

A page source is a fragment, not a document. It opens with one HTML-comment metadata block and continues with the body sections; it never restates the document head, the navigation or the footer. This page is one such fragment: `_content/software.html`.

For each fragment the builder parses that metadata, prepares the body, and generates the page banner from the metadata fields - the breadcrumb trail from `crumbs`, then the eyebrow, heading, subtitle and the small key/value row beneath them. It collects the outline markers found in the body, renders the floating outline island and its mobile counterpart, wraps everything in the two-column layout, and substitutes the tokens in `_templates/base.html` with the finished nav, footer, title, description and body.

Where the result lands is decided by metadata too. `route: software` writes this page to `software/index.html`; a page with no route falls back to `pages/<name>.html`; and `layout: home`, or the file name `index`, writes the root `index.html`. The relative asset prefix follows from the depth of that output path, so a page one directory down gets `../` in front of every asset and internal link, and the output stays relative rather than pinned to one host.

**Fig 1** One build: editable sources in, static files out. The generated pages sit in the repository alongside the stylesheet, script, fonts and images they load.

That last row of the diagram matters, because it is the claim most easily overstated. The output is static HTML, but a generated page is not a single self-contained file: it still loads `css/style.css`, `js/main.js`, the generated `js/search-data.js`, the self-hosted fonts under `fonts/` and the images under `img/`. Every one of those comes from inside the repository. The accurate claim is no runtime third-party or network dependency - not self-containment.

03 - Pipeline

## What one build does

One command rebuilds the whole site. These are the stages it moves through, in the order the script runs them.

- Read

#### Collect the sources

The builder loads the base template, the shared nav and footer, and the optional site data used for the footer's sponsor and friend entries. It then lists every fragment in _content/ and parses each metadata block.

- Clean

#### Clear the old output

Previously generated page files are removed and each routed output is deleted before anything new is written, so a renamed or retired route cannot linger as a stale page.

- Assemble

#### Build each page

Known scaffold phrases and marked placeholders are normalised, the banner and the outline are generated from the metadata and the content markers, and the template tokens are replaced. Draft pages never reach this stage.

- Write

#### Route the file

The route metadata decides the output path. Nested routes are written as route/index.html, and the relative asset prefix is calculated from how deep that file sits.

- Index

#### Regenerate the search data

Visible text from every searchable page is written to js/search-data.js, which the wiki's search dialog loads as an ordinary repository-local script.

### Publication controls

Metadata is a single HTML comment at the top of the file, one `key: value` per line. A handful of those keys decide what happens to a page, and the distinctions between them are worth stating exactly:

- `route` sets the output path, as above.
- `layout: home` selects the homepage layout, which skips the outline and the two-column frame.
- `draft` pages are not built at all - they are filtered out before the build loop begins.
- `hidden` pages *are* built and reachable; they are only left out of the generated search index.
- Public, non-draft pages are searchable by default. `search` exists to turn that off for one page, not to turn it on.

This page carries `route: software` and no `draft`, `hidden` or `search` field of its own, so it is built, public and searchable.

### Outline and search

Neither the outline nor the search index is maintained by hand. A `<section>` carrying an `id` and a `data-toc` label becomes a first-level entry in both the desktop outline island and the mobile outline; any element with an `id` and a `data-toc-sub` label becomes a second-level entry beneath it. The two indented entries under Build pipeline in the outline beside this text are exactly that.

The search index is generated from the same body text. It holds one entry per searchable page, plus one entry for each top-level `<section>` that has an `id`, using that section's `data-toc` value as the entry title where one is present. A `data-toc-sub` marker contributes to the outline but does not create a search entry of its own - a useful thing to know before wondering why a subheading is not turning up in search.

04 - Authoring

## Edit, build, inspect

The loop is short enough to run between edits.

01

### Edit

Change the fragment for the page in `_content/`, or the shell and partials that every page shares.

[](#architecture)

02

### Build

Run `python3 build.py` from the repository root. It rebuilds every published page and the search index together.

[](#pipeline)

03

### Inspect

Read the generated page before committing. The builder assembles pages; it does not judge whether what they say is true.

[](#limits)

The command is exactly `python3 build.py`. Python 3 is the only prerequisite: the script imports nothing outside the Python standard library, so there is no package to install, no lock file to resolve and no development server to start in the normal editing loop.

Everything editable sits in a handful of places:

- `_content/*.html` - one fragment per page: the metadata block and the body sections.
- `_templates/base.html` - the document shell and the tokens the builder fills in.
- `_partials/nav.html` and `_partials/footer.html` - the single navigation and footer shared by every page.
- `_data/site.json` - optional sponsor and friend entries for the footer.
- `css/style.css` and `js/main.js` - the design system and the interaction layer, both self-hosted and dependency-free.

Generated route HTML is deliberately absent from that list. Editing it is wasted work, because the next build deletes it and writes it again from source.

**Adding a section**

Give the new <section> a unique id and a data-toc label, then run python3 build.py again. The desktop outline, the mobile outline and the search index all pick it up - there is no contents list to update separately. For a second-level outline entry, put an id and a data-toc-sub label on a heading inside the section.

**scaffold.py can overwrite this page**

A second script, scaffold.py, is a registry-driven generator that writes the first structural skeleton of each deliverable page. Its KEEP set contains only index and description, so re-running it rewrites every other registered page - this one included - over whatever has been hand-edited since. Treat it as a one-time bootstrap rather than a repeatable step.

05 - Limits

## Small guarantees, stated exactly

The builder does a little tidying on the way out, and it is worth being exact about how little it promises. Each of these safeguards is narrower than its name suggests.

### Draft-marker cleanup

Two things happen to a body before it is written. A fixed table of known scaffold phrases is replaced with neutral wording, and paragraphs or spans carrying the scaffold's explicit placeholder marker class are converted into a public-facing pending-documentation slot. Both are literal operations: the table matches exact strings, and the conversion fires only on that one marker. Ordinary paragraphs are never rewritten by guesswork.

So nothing here detects an unmarked placeholder, an editorial note left in prose, or a claim the evidence does not support. It is a safety net for one specific authoring convention, not a content validator. Keeping a page honest remains an editorial job.

### Sponsor and friend URLs

The optional `_data/site.json` supplies the sponsor and friend entries rendered into the shared footer. For those URLs only, the builder drops `javascript:` and `data:` schemes and renders the affected entry as plain text instead of a link, rather than failing the build over a bad value. That is narrow handling of two data fields. It is not a site-wide URL check, not a link validator and not a security audit of anything.

### What this is not

This software builds and presents the wiki, and that is the whole of it. It does not analyse experimental measurements, infer a detector call, select a biological target, run a detector or demonstrate field readiness. None of that lives in this repository, and nothing on this page should be read as evidence for any of it. There is no backend, no database, no API and no continuous-integration service behind these pages: the build is a script somebody runs, and the result is files.

No claim is made here about a security audit, accessibility conformance, universal browser support or perfect link validation either. None of those has been established, and this page does not imply otherwise.

**Not yet verified on the live host**

Deployment to the real iGEM GitLab Pages host has not been verified. Rendering, the relative paths and the internal links as served from that host are still an open question and remain a required check before the wiki freeze.

06 - Repository

## Read the code

Everything described above is in one repository, and the shortest way to check any of it is to read `build.py` from top to bottom. It is a single standard-library file, and every behaviour on this page is somewhere inside it.

[ Browse the NKU26-wiki source repository on GitHub](https://github.com/CJerryR/NKU26-wiki) - the build script, the templates and partials, the page sources, the design system and the interaction layer.

That link is ordinary page content. No script, stylesheet, font or image is fetched from it, or from any other off-site origin, while a page is being read - which is the entire point of building the site this way.
