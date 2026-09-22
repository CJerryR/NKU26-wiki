# iGEM 2026 wiki compliance baseline

Checked against the official 2026 iGEM Competition website and the current Team Wiki requirements application on 17 July 2026.

## Official sources

- [2026 Deliverable Guides](https://competition.igem.org/deliverables/guides#h-wiki)
- [Team Wiki requirements](https://teams.igem.org/go/deliverables/wiki/requirements)
- [2026 medal criteria](https://competition.igem.org/judging/awards/medals)
- [2026 special awards and Best Wiki ballot](https://competition.igem.org/judging/awards/special)
- [2026 competition calendar](https://competition.igem.org/about/calendar)
- [iGEM External Content Check](https://tools.igem.org/wiki/external-content-check)

## Hard requirements implemented in this repository

- CI/CD builds the public site from source into `public/`; generated HTML is not source material.
- All runtime assets are local to the generated iGEM site. External links are citations or references only.
- Team-authored wiki material is licensed under CC BY 4.0, with the official template `LICENSE` retained at repository root.
- The footer exposes the source repository. On iGEM GitLab, `CI_PROJECT_URL` is injected automatically.
- Licensing, third-party components, and responsible AI use are disclosed on `/licensing`.
- Required medal pages use `/contribution`, `/engineering`, and `/human-practices`.
- Existing award pages use their 2026 Standard URL paths: `/education`, `/entrepreneurship`, `/hardware`, `/inclusivity`, `/model`, `/safety-and-security`, `/software`, and `/sustainability`.
- The build audit checks required routes, license and CI files, runtime external resources, broken local links, duplicate IDs, unresolved template markers, overclaims, and the AI disclosure.

## Official deadlines relevant to the wiki

- Wiki, Attributions Form, Judging Form, Registry contributions, and Software freeze: **21 October 2026, 15:00 UTC**.
- Presentation Video deadline: **28 October 2026, 15:00 UTC**.
- Wiki thaw: **25 November 2026, 15:00 UTC**.
- Final archival: **9 December 2026, 15:00 UTC**.

## Evidence that still requires team action

Technical compliance cannot replace competition evidence. Before the Wiki Freeze, the team must verify and supply real names and contributions, complete the official Attributions Form and Judging Form, complete all required Safety Forms, publish Registry documentation for any Parts claims, choose exactly the Special Awards used for Gold consideration, and replace every evidence gap with reviewed records or leave the limitation stated honestly.

The official 2026 rules prohibit fabricated citations, invented quotations, AI-generated scientific evidence, and unlicensed third-party assets. Do not convert missing evidence into a positive claim merely to make a page look complete.
