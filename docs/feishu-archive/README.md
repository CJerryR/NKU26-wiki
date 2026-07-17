# Feishu local archive workspace

This directory is the staging and output area for a reviewable local mirror of
the team's Feishu material. The archive consists of Markdown plus local assets;
it is independent of the public wiki pages and does not treat a captured note as
scientific verification.

## Layout

```text
docs/feishu-archive/
├── archive-manifest.json        # real capture inventory (create from the example)
├── archive-manifest.example.json
├── captures/                    # suggested raw capture area
│   ├── documents/<id>.md
│   └── assets/<id>/<image>
└── library/                     # generated, locally browsable mirror
    ├── README.md                # root index and status summary
    └── <Feishu folder>/
        ├── README.md            # index for this folder
        ├── <document>.md
        └── _assets/<document>/<image>
```

The generator owns `library/`. Do not edit generated files there: update the
manifest or a file under `captures/`, then rebuild. It refuses to overwrite an
unmanaged directory.

## Convert authenticated browser captures

When `captures/` contains the browser-capture layout used by this workspace
(`metadata.json`, `record.json`, `content.html`, `content.txt`, optional
`image-map.json`/`images/`, and `folder-*/folder.json`), generate the private
manifest and local library in one step:

```bash
python3 tools/convert_feishu_captures.py
```

The converter writes derived Markdown under `captures/_converted/`, writes the
private `archive-manifest.json`, validates it, and rebuilds `library/`. It
preserves headings, paragraphs, lists, tables, public links and local images.
Links to known captured Feishu documents become local relative links. Other
authenticated Feishu URLs remain only in private front matter, never in the
Markdown body.

`content.html` may also reference a capture-local raster with a plain relative
path, for example `<img src="images/embedded-table.jpg">`. The converter turns
it into a managed `feishu-asset://` entry after checking that it resolves inside
that capture, contains no symlink, is a regular file, and has matching
PNG/JPEG/GIF/WebP extension and file signature. Absolute paths, path traversal,
URL query/fragment tricks, SVG, unsupported formats, missing files, symlinks,
and extension/content mismatches are hard errors. This keeps local HTML useful
without allowing it to make the builder copy arbitrary files.

Empty captures, image-only captures, missing images, unsupported embedded
blocks and undownloaded file cards are labelled explicitly and use a `partial`
status. Entries seen in a folder listing but not yet captured are retained as
`discovered` stubs instead of silently disappearing. A downloaded Feishu file
(`.dna`, `.pptx`, `.pdf`, and other formats) is copied into the generated
document's `_assets/` directory and exposed as a local download link. A file
card embedded in a document links to that local file page when the card's
`driveKey` has a corresponding `file-<token>/` capture.

For a standalone Feishu file capture, use this minimal private layout:

```text
captures/file-<token>/
├── metadata.json       # token, url, parent, title, downloaded_name, size
└── <downloaded file>
```

If Feishu denies access, keep `metadata.json` but omit the nonexistent payload
and set `"status": "no-access"` plus an explanatory `note`. The generated page
then uses `unavailable`; the converter never invents file content. If
`downloaded_name` is present but the named file is missing, the page is
`partial`. The declared byte size is checked when available, and a mismatch is
recorded in provenance rather than silently accepted as complete.

Downloaded PowerPoint/PDF files remain available as their original binaries.
If a separate renderer creates page images, list them in `metadata.json` to make
the same Markdown page visually browsable:

```json
{
  "page_renders": [
    {"page": 1, "file": "slides/slide-001.png"},
    {"page": 2, "file": "slides/slide-002.png"}
  ]
}
```

Declared preview paths must stay inside the capture directory. Missing declared
pages make the result `partial` and are recorded in provenance.

## Capture workflow

1. Copy `archive-manifest.example.json` to `archive-manifest.json`.
2. Record every Feishu folder in `folders`, including its complete path and URL.
3. Save each document as UTF-8 Markdown under `captures/documents/` and add one
   `documents` entry. A document can be indexed before its body is available by
   omitting `content_file` and using an honest status such as `discovered`.
4. Save downloaded images under `captures/assets/<document-id>/`. Declare every
   image in the document's `assets` array.
5. In captured Markdown, use a stable asset placeholder rather than guessing a
   final path:

   ```markdown
   ![Original figure caption](feishu-asset://figure-01)
   ```

   On build, the placeholder becomes a relative link such as
   `_assets/0506/figure-01.png`. Missing declarations are a hard error.
6. Validate and generate:

   ```bash
   python3 tools/build_feishu_archive.py --validate-only
   python3 tools/build_feishu_archive.py
   ```

7. Open `docs/feishu-archive/library/README.md` in a Markdown viewer and follow
   the folder links. Before publishing anything to the website, review the
   source URL, provenance, status, privacy, and claim boundaries recorded on
   each page.

## Status vocabulary

- `discovered`: indexed from a folder listing; body not captured.
- `partial`: some body content or assets are missing.
- `archived`: visible source content and assets have been captured locally.
- `verified`: capture has been compared with the source by a reviewer.
- `blocked`: capture cannot currently continue; record the reason in provenance.
- `unavailable`: source was deleted, inaccessible, or otherwise unavailable.

Other lowercase status tokens are accepted when needed and remain visible in
the generated status summaries. A capture status describes archival completeness,
not whether an experiment succeeded or a scientific claim is true.

## Provenance rules

- `source_url` is mandatory for every document and every explicitly listed
  folder. Asset-level URLs are optional because Feishu images often have only a
  transient download URL.
- `captured_at` should be an ISO 8601 timestamp with an explicit timezone.
- `provenance` may be a short string or structured JSON. Record the capture
  method, displayed author/editor names, displayed modification time, reviewer,
  omissions, and any uncertainty that matters.
- Keep Feishu URLs and personal information out of public deployment unless the
  team has explicitly reviewed them. This archive is local evidence inventory
  by default.
- Do not silently repair source typos, units, names, or conclusions. Transcribe
  faithfully and put interpretation or uncertainty in provenance/editorial notes.

## Manifest fields

The example manifest is the executable template. Important document fields are:

| Field | Purpose |
| --- | --- |
| `id` | Stable capture identifier; letters, digits, `.`, `_`, and `-` only. |
| `folder_path` | Feishu hierarchy as an array, for example `["Wet lab", "Notebook"]`. |
| `source_url` | Original Feishu document URL. |
| `source_type` | Source kind such as `docx`, `wiki`, `sheet`, or `folder-note`. |
| `status` | Capture completeness, not scientific validity. |
| `content_file` | Markdown source relative to the manifest. May be omitted for an indexed stub. |
| `assets` | Local files and their stable placeholder IDs/provenance. |
| `output_name` | Optional stable basename for the generated `.md` document. |
| `order` | Optional integer controlling order within a folder. |

Folder metadata is optional for intermediate paths: the builder synthesizes an
index when a document refers to a missing parent. Such indexes are visibly marked
`metadata pending`, so the inventory can be completed without losing hierarchy.
