/**
 * The site map, in one place. It follows the team's wiki outline:
 * Project / Wet Lab / Model / Human Practices / Team.
 * Links point at page ids (the Markdown file names in src/content/pages), so
 * a page's address lives only in its own frontmatter. The top bar, the phone
 * menu, the footer and the previous/next links are all built from here.
 *
 * `optional: true` marks the outline's optional pages. Their files wait in
 * src/content/optional/; move one into src/content/pages/ and its link
 * appears here, in the phone menu and in the page order automatically.
 */
export interface NavLink { page: string; label: string; blurb?: string; optional?: boolean }
export interface NavGroup { kind: 'group'; id: string; label: string; narrow?: boolean; items: NavLink[] }
export type NavItem = { kind: 'home'; label: string } | ({ kind: 'link' } & NavLink) | NavGroup;

export const primaryNav: NavItem[] = [
  { kind: 'home', label: 'Home' },
  {
    kind: 'group', id: 'project', label: 'Project', narrow: true, items: [
      { page: 'description', label: 'Description', blurb: 'Why nematode signals, and what we propose' },
      { page: 'engineering', label: 'Engineering', blurb: 'Design, build, test, learn' },
      { page: 'contribution', label: 'Contribution', blurb: 'What future teams can reuse' },
      { page: 'background', label: 'Background', blurb: 'The pest, its cost and why it persists', optional: true },
    ],
  },
  {
    kind: 'group', id: 'wetlab', label: 'Wet Lab', items: [
      { page: 'parts', label: 'Parts and Collections', blurb: 'Every part, and the collections they form' },
      { page: 'experiments', label: 'Experiments', blurb: 'What each experiment tests' },
      { page: 'notebook', label: 'Notebook', blurb: 'Dated bench records', optional: true },
      { page: 'results', label: 'Results', blurb: 'What the bench has shown so far' },
      { page: 'safety', label: 'Safety', blurb: 'Biosafety at the bench and beyond' },
    ],
  },
  {
    kind: 'group', id: 'model', label: 'Model', narrow: true, items: [
      { page: 'model', label: 'Overview', blurb: 'How the models fit together' },
      { page: 'model-docking', label: 'Docking', blurb: 'Two-ligand contacts and receptor candidates' },
      { page: 'model-md', label: 'Molecular Dynamics', blurb: 'Ligand motion and persistent contacts' },
      { page: 'model-ode', label: 'ODE & Two-channel', blurb: 'Signal dynamics and density estimation' },
      { page: 'model-eco', label: 'Economic Benefit', blurb: 'When density information changes a decision' },
    ],
  },
  {
    kind: 'group', id: 'hp', label: 'Human Practices', narrow: true, items: [
      { page: 'human-practices', label: 'Integrated Human Practices', blurb: 'Growers, experts and what changed' },
      { page: 'education', label: 'Education', blurb: 'Classes and outreach across China' },
      { page: 'sustainability', label: 'Sustainability', blurb: 'Soil health and the SDGs', optional: true },
      { page: 'collaborations', label: 'Collaboration', blurb: 'Work done with other teams', optional: true },
    ],
  },
  {
    kind: 'group', id: 'team', label: 'Team', narrow: true, items: [
      { page: 'members', label: 'Members', blurb: 'The people behind the project' },
      { page: 'attributions', label: 'Attributions', blurb: 'Who did what' },
      { page: 'awards', label: 'Awards' },
      { page: 'acknowledgements', label: 'Acknowledgements' },
      { page: 'sponsors', label: 'Sponsors & Partners', blurb: 'Who supports the project', optional: true },
    ],
  },
];

/** Phone menu: the same groups as the top bar, as headed lists of links. */
export const mobileNav: { label?: string; items: NavLink[] }[] = [
  { items: [{ page: 'home', label: 'Home' }] },
  ...primaryNav.filter((item): item is NavGroup => item.kind === 'group').map((g) => ({ label: g.label, items: g.items })),
];

/** Footer uses the same published groups as the main navigation. */
export const footerNav: { label: string; items: NavLink[] }[] = primaryNav
  .filter((item): item is NavGroup => item.kind === 'group')
  .map(({ label, items }) => ({ label, items }));

/** Reading order for the previous / next links: the top bar, left to right. */
export function readingOrder(): NavLink[] {
  const out: NavLink[] = [];
  for (const item of primaryNav) {
    if (item.kind === 'link') out.push(item);
    if (item.kind === 'group') out.push(...item.items);
  }
  return out;
}
