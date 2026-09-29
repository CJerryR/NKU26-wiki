/**
 * The site map, in one place. Links point at page ids (the Markdown file
 * names in src/content/pages), so a page's address only lives in its own
 * frontmatter. The top bar, the phone menu, the footer and the
 * previous/next links at the end of each page are all built from here.
 */
export interface NavLink { page: string; label: string; blurb?: string }
export interface NavGroup { kind: 'group'; id: string; label: string; narrow?: boolean; items: NavLink[] }
export type NavItem = { kind: 'home'; label: string } | ({ kind: 'link' } & NavLink) | NavGroup;

export const primaryNav: NavItem[] = [
  { kind: 'home', label: 'Home' },
  {
    kind: 'group', id: 'project', label: 'Project', items: [
      { page: 'description', label: 'Description', blurb: 'Why nematode signals, and what we propose' },
      { page: 'engineering-cycle', label: 'Engineering', blurb: 'Design, build, test, learn' },
      { page: 'results', label: 'Results', blurb: 'What the bench has shown so far' },
      { page: 'modeling', label: 'Model', blurb: 'From signal input to color output' },
      { page: 'parts', label: 'Parts', blurb: 'Registry entries' },
      { page: 'hardware', label: 'Hardware', blurb: 'The closed test device' },
      { page: 'software', label: 'Software', blurb: 'Tools we built' },
      { page: 'contribution', label: 'Contribution', blurb: 'What future teams can reuse' },
    ],
  },
  {
    kind: 'group', id: 'hp', label: 'Human Practices', items: [
      { page: 'human-practices', label: 'Human Practices', blurb: 'Growers, experts and what changed' },
      { page: 'education', label: 'Education', blurb: 'Classes and outreach across China' },
      { page: 'entrepreneurship', label: 'Entrepreneurship', blurb: 'Who would use it, and how' },
      { page: 'sustainability', label: 'Sustainability', blurb: 'Soil health and the SDGs' },
      { page: 'diversity-inclusion', label: 'Inclusion', blurb: 'Who we built this with' },
    ],
  },
  { kind: 'link', page: 'safety', label: 'Safety' },
  {
    kind: 'group', id: 'team', label: 'Team', narrow: true, items: [
      { page: 'team-members', label: 'Members', blurb: 'The people behind the wiki' },
      { page: 'attribution', label: 'Attributions', blurb: 'Who did what' },
      { page: 'licensing', label: 'Licensing & AI use', blurb: 'How this site may be reused' },
    ],
  },
];

/** Phone menu: headed groups of plain links. `home` is the start page. */
export const mobileNav: { label?: string; items: NavLink[] }[] = [
  { items: [{ page: 'home', label: 'Home' }] },
  { label: 'Project', items: [
    { page: 'description', label: 'Description' }, { page: 'engineering-cycle', label: 'Engineering' },
    { page: 'results', label: 'Results' }, { page: 'modeling', label: 'Model' }, { page: 'parts', label: 'Parts' },
    { page: 'hardware', label: 'Hardware' }, { page: 'software', label: 'Software' }, { page: 'contribution', label: 'Contribution' },
  ] },
  { label: 'Human Practices', items: [
    { page: 'human-practices', label: 'Human Practices' }, { page: 'education', label: 'Education' },
    { page: 'entrepreneurship', label: 'Entrepreneurship' }, { page: 'sustainability', label: 'Sustainability' },
    { page: 'diversity-inclusion', label: 'Inclusion' },
  ] },
  { label: 'More', items: [
    { page: 'safety', label: 'Safety' }, { page: 'team-members', label: 'Team' },
    { page: 'attribution', label: 'Attributions' }, { page: 'licensing', label: 'Licensing & AI use' },
  ] },
];

/** Footer columns; `repository` is the source-code link from src/data/site.ts. */
export const footerNav: { label: string; items: NavLink[] }[] = [
  { label: 'Project', items: [
    { page: 'description', label: 'Description' }, { page: 'contribution', label: 'Contribution' },
    { page: 'engineering-cycle', label: 'Engineering' }, { page: 'results', label: 'Results' },
  ] },
  { label: 'People & Practice', items: [
    { page: 'human-practices', label: 'Human Practices' }, { page: 'education', label: 'Education' },
    { page: 'diversity-inclusion', label: 'Inclusivity' }, { page: 'team-members', label: 'Team' },
    { page: 'safety', label: 'Safety' }, { page: 'attribution', label: 'Attributions' },
  ] },
  { label: 'Open science', items: [
    { page: 'modeling', label: 'Model' }, { page: 'software', label: 'Software' },
    { page: 'sustainability', label: 'Sustainability' }, { page: 'licensing', label: 'Licensing & AI use' },
    { page: 'repository', label: 'Source repository' },
  ] },
];

/** Reading order for the previous / next links: the top bar, left to right. */
export function readingOrder(): NavLink[] {
  const out: NavLink[] = [];
  for (const item of primaryNav) {
    if (item.kind === 'link') out.push(item);
    if (item.kind === 'group') out.push(...item.items);
  }
  return out;
}
