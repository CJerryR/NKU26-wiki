# Feishu archive publication design

## Outcome

Use two physically separate content trees:

```text
docs/feishu-archive/                 local evidence workspace; never deployed
├── archive-manifest.json             authenticated source inventory
├── captures/                         faithful Markdown and original assets
└── library/                          generated local folder mirror

archive-content/                     reviewed publication source; safe to commit
├── catalog.json                     public titles, categories and slugs only
├── documents/<slug>.md              approved, redacted Markdown
└── assets/<slug>/<asset>            approved, metadata-stripped images

archive/                             generated static website; safe to deploy
├── index.html                       directory and archive-only search
├── category/<slug>/index.html       public category indexes
├── document/<slug>/index.html       rendered document pages
├── md/<slug>.md                     downloadable Markdown copies
├── assets/<slug>/<asset>            local image copies
├── search-data.js                   public archive records only
├── archive.css
└── archive.js
```

`docs/feishu-archive/library/` mirrors the real source hierarchy for local
review. `archive-content/` is a separate publication decision, not a generated
copy of everything discovered in Feishu. No website builder should read the
authenticated manifest directly.

## Why the existing wiki builder should stay unchanged

`build.py` scans only `_content/*.html`, writes the wiki pages, and builds the
global search index from those HTML sources. It does not inspect `docs/` and it
only cleans generated page routes, so an independently generated `archive/`
tree will survive normal wiki rebuilds.

The archive should therefore have its own generator and archive-only static
search. This avoids changing `_content`, `build.py`, the existing CSS and the
existing generated HTML while the source capture is still incomplete. Once the
archive passes publication review, the primary navigation needs only one link
to `archive/`; global wiki search integration can remain a later enhancement.

## Publication boundary

Capture everything locally, but publish only records that satisfy all of these
conditions:

1. The body is captured and reviewed, rather than merely discovered or partial.
2. Publication is explicitly approved for this exact revision.
3. Personal names, contact details, interview identities and quotations have a
   documented public-attribution basis, or are redacted.
4. Images have publication permission and do not expose faces, account chrome,
   comments, notifications, access tokens, QR codes, private folder names or
   unrelated browser content.
5. Raw questionnaire responses, credentials, private protocols, unpublished
   personal data and restricted partner material remain local.
6. The public Markdown contains no authenticated workspace URL, provenance
   object, editor history, capture path or transient image URL.
7. An archived statement is labelled as an archival record. Copying it does not
   convert it into verified scientific evidence or a validated project result.

The public `catalog.json` should contain only fields required for display:

```json
{
  "schema_version": 1,
  "documents": [
    {
      "slug": "education-nematode-chase",
      "title": "Nematode Chase teaching record",
      "category": "Education",
      "summary": "Reviewed public summary of the teaching material.",
      "markdown": "documents/education-nematode-chase.md",
      "status": "approved",
      "record_date": "2026-05-14",
      "claim_status": "archival-record",
      "search": true
    }
  ]
}
```

Do not put a source URL, private document ID, real Feishu folder path or capture
provenance in this file. The local manifest remains the traceability record.

## Markdown and image rules

- Public Markdown uses relative images only, for example
  `../assets/<slug>/figure-01.png` in `archive-content/documents/<slug>.md`.
- The website generator rewrites that path for both the rendered HTML and the
  copied `archive/md/<slug>.md` file.
- Raw HTML in Markdown is escaped or rejected. `javascript:`, `data:` and
  protocol-relative URLs are rejected.
- Ordinary cited hyperlinks may remain, but runtime resources such as images,
  scripts, styles, fonts, video and audio must be local.
- Publish raster images only at first: PNG, JPEG or WebP. Reject SVG until a
  dedicated sanitizer exists. Reject filenames containing source tokens or
  personal names; use stable public slugs.
- Re-encode raster images during the public build to remove EXIF and ancillary
  metadata. Preserve the original only inside the local capture tree.
- Require useful alt text and a caption/source note when the image conveys
  evidence. Decorative images use empty alt text.
- Apply file-size and pixel-dimension limits so a single source image cannot
  make the static deployment unusable.

The current environment includes Pillow but no Markdown renderer. The smallest
reliable implementation is a pinned build-only Markdown library configured to
escape raw HTML, plus Pillow for metadata-stripping. Neither becomes a runtime
website dependency; the deployed output remains HTML, CSS, JavaScript and local
assets only.

## Directory browsing and search

The public directory taxonomy should be curated independently of the private
Feishu hierarchy. A private folder name can itself reveal project, partner or
person information, so it must not become a route automatically.

The generator should create:

- a root index grouped by public category;
- one category index per public category;
- one HTML page and one downloadable Markdown file per approved document;
- breadcrumbs using public categories only;
- a precomputed `window.NKU_ARCHIVE_INDEX` containing title, summary, category,
  approved body text and the local document URL;
- a small archive-only search UI with no fetch and no external dependency.

Do not merge archive text into `window.NKU_SEARCH_INDEX` during the first
release. That index is generated by `build.py` from `_content` and changing it
would couple the evidence archive to the main page pipeline. A single primary
navigation link makes the archive discoverable without that coupling.

## File-level implementation plan

1. `.gitignore`

   Add the private manifest, raw captures and generated local mirror:

   ```gitignore
   docs/feishu-archive/archive-manifest.json
   docs/feishu-archive/captures/
   docs/feishu-archive/library/
   ```

   Do this before any authenticated capture is saved and before any broad
   staging command is run.

2. `archive-content/catalog.json`

   Add the sanitized publication manifest. Every entry must be explicitly
   `approved`; the builder must fail closed for missing or unknown status.

3. `archive-content/documents/*.md`

   Add only reviewed publication copies. Keep editorial qualification visible
   and remove all source-system metadata and authenticated deep links.

4. `archive-content/assets/**`

   Add only images approved for public release. The public builder re-encodes
   them into `archive/assets/**`; it must never copy originals byte-for-byte.

5. `tools/build_public_archive.py`

   Add an independent deterministic builder. It validates the catalog, safely
   renders Markdown, rewrites relative asset paths, strips image metadata,
   builds directory pages, writes archive search data and atomically replaces
   only a marker-owned `archive/` directory.

6. `tools/audit_public_archive.py`

   Add a fail-closed release audit for forbidden source-system domains,
   credential-like query strings, external runtime resources, unsafe Markdown
   schemes, missing or orphaned assets, broken links, image metadata and search
   count mismatches.

7. `archive/**`

   Commit the generated static output because the iGEM deployment is static.
   Include a marker file so the builder cannot delete an unrelated directory.

8. `_partials/nav.html`

   After the archive passes all gates, add one relative `archive/` link. No
   `build.py`, `_content`, existing CSS or existing JavaScript change is needed
   for the first release. Rebuild the normal wiki once so the link appears on
   all generated pages.

## Release gates

### Local completeness gate

- Every visible source folder and child item is present in the local manifest.
- Every document has a terminal capture status: `verified`, `blocked` with a
  reason, or `unavailable` with a reason. `discovered` and `partial` mean the
  archive is not complete.
- Every declared content file and asset exists; every asset placeholder is
  declared; no declared asset is unused.
- The generated local `library/README.md` reaches every captured document and
  image through relative links.

### Public approval gate

- Every catalog entry is `approved` and points to exactly one Markdown file.
- Every public document has a privacy/consent review for the current content
  hash, not merely for an earlier draft.
- Every image has rights/consent approval, useful alt text where applicable,
  an allowed MIME type, bounded dimensions and no retained metadata.
- No public route or filename is derived automatically from a private folder,
  person, source token or authenticated document identifier.

### Static safety gate

- Zero source-system or authenticated workspace domains in `archive-content/`
  and `archive/`.
- Zero credential-like query fields or bearer/token/cookie strings.
- Zero external `src`, stylesheet, font, CSS `url()`, video or audio resource.
- Zero raw script/event-handler HTML originating from Markdown.
- Zero broken internal links, missing images, path traversal or absolute local
  filesystem paths.
- Search entry count equals the number of searchable approved documents, and
  search data contains no text absent from the approved public Markdown.

### Regression gate

Run the normal wiki build and audits after generating the archive:

```bash
python3 tools/build_feishu_archive.py --validate-only
python3 tools/build_feishu_archive.py
python3 tools/build_public_archive.py
python3 tools/audit_public_archive.py
python3 build.py
python3 tools/audit_wiki_content.py --generated --drafts
git diff --check
node --check js/main.js
node --check js/mascot-3d.js
```

Serve the repository root locally and crawl `archive/` at desktop and mobile
widths. Confirm category navigation, Markdown download links, image loading,
archive-only search, keyboard navigation and direct nested-page loads. Finally,
verify the same relative routes on the actual static host before calling the
archive published.

