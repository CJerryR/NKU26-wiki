# CLAUDE.md

Before changing anything in this repository, read and follow these files. They are mandatory.

@AGENTS.md
@.claude/RESPONSIBLE_AI_USE.md

`AGENTS.md` holds this team's compliance rules for the iGEM 2026 wiki: Standard URLs, the footer link to the team's gitlab.igem.org repository and the CC BY 4.0 notice, loading only from iGEM infrastructure (images and fonts on static.igem.wiki), the 10 MiB artifact limit, the official Attributions form, no fabricated data or citations, and no scroll hijacking.

If the iGEM template already placed a `CLAUDE.md` here, keep its text and add the `@AGENTS.md` line to it rather than replacing it. Never overwrite `.claude/RESPONSIBLE_AI_USE.md`.

After every change: `python3 build.py`, then `python3 tools/audit_wiki_content.py --generated --generated-root public` must print PASS.
