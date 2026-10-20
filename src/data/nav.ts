/**
 * The site map, in one place. It follows the team's wiki outline:
 * Project / Wet lab / Model / Human practices / Team.
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
      { page: 'background', label: 'Background', blurb: 'The pest, its cost and why it persists' },
      { page: 'engineering', label: 'Engineering', blurb: 'Design, build, test, learn' },
      { page: 'contribution', label: 'Contribution', blurb: 'What future teams can reuse' },
    ],
  },
  {
    kind: 'group', id: 'wetlab', label: 'Wet lab', items: [
      { page: 'parts', label: 'Parts and collections', blurb: 'Every part, and the collections they form' },
      { page: 'experiments', label: 'Experiments', blurb: 'What each experiment tests' },
      { page: 'notebook', label: 'Notebook', blurb: 'Dated bench records', optional: true },
      { page: 'results', label: 'Results', blurb: 'What the bench has shown so far' },
      { page: 'safety', label: 'Safety', blurb: 'Biosafety at the bench and beyond' },
    ],
  },
  {
    kind: 'group', id: 'model', label: 'Model', narrow: true, items: [
      { page: 'model', label: 'Overview', blurb: 'How the models fit together' },
      { page: 'model-docking', label: 'Molecular Docking', blurb: 'Two-ligand contacts and receptor candidates' },
      { page: 'model-md', label: 'Molecular Dynamics', blurb: 'Ligand motion and persistent contacts' },
      { page: 'model-ode', label: 'ODE & Dual-channel modeling', blurb: 'Signal dynamics and density estimation' },
      { page: 'model-eco', label: 'Economic Benefit', blurb: 'When density information changes a decision' },
    ],
  },
  {
    kind: 'group', id: 'hp', label: 'Human practices', narrow: true, items: [
      { page: 'hp-overview', label: 'Overview', blurb: 'Connecting our research with society' },
      { page: 'human-practices', label: 'Integrated human practices', blurb: 'Bringing real-world perspectives into research' },
      { page: 'education', label: 'Education', blurb: 'Making synthetic biology and our project accessible' },
      { page: 'hp-investigation', label: 'Investigation', blurb: 'Exploring agriculture through visits and dialogue' },
      { page: 'hp-industry', label: 'Industry engagement and support', blurb: 'Exploring applications and building connections' },
      { page: 'sustainability', label: 'Sustainability', blurb: 'Soil health and the SDGs', optional: true },
      { page: 'collaborations', label: 'Collaboration', blurb: 'Work done with other teams', optional: true },
    ],
  },
  {
    kind: 'group', id: 'team', label: 'Team', narrow: true, items: [
      { page: 'members', label: 'Members', blurb: 'The people behind the project' },
      { page: 'attributions', label: 'Attributions', blurb: 'Who did what' },
      { page: 'awards', label: 'Awards', blurb: 'Recognition the team has received', optional: true },
      { page: 'acknowledgements', label: 'Acknowledgements', blurb: 'People and places we thank', optional: true },
      { page: 'sponsors', label: 'Sponsors & partners', blurb: 'Who supports the project', optional: true },
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
