// F02 (checkpoint-10): caption lead and panel letters. Run: npm run test:captions (needs npm ci for katex).
import test from 'node:test';
import assert from 'node:assert/strict';
import { captionLead, toText } from '../../src/lib/remark-wiki.mjs';

const t = (value) => ({ type: 'text', value });
const em = (value) => ({ type: 'emphasis', children: [t(value)] });
const code = (value) => ({ type: 'inlineCode', value });
const link = (value) => ({ type: 'link', url: 'https://example.org', children: [t(value)] });
const strongs = (nodes) => nodes.filter((n) => n.type === 'strong').map(toText);
const nested = (nodes, inside = false) => nodes.some((n) => (n.type === 'strong' && inside) || (n.children && nested(n.children, inside || n.type === 'strong')));
function run(children) {
  const before = children.map(toText).join('');
  const out = captionLead(children.map((c) => structuredClone(c)));
  assert.equal(out.map(toText).join(''), before, 'caption text must not change');
  assert.equal(nested(out), false, 'no strong inside strong');
  assert.ok(!out.some((n) => n.type === 'strong' && toText(n) === ''), 'no empty strong');
  return out;
}

test('Nature-style comma labels after the lead (Results Fig. 1, DBTL-1)', () => {
  const out = run([t('Figure 1. Construction of the plasmid for heterologous expression of GPR2-sfGFP. a, Plasmid map of the pRS315-GPR2-sfGFP construct. b, Colony PCR results during plasmid construction. Sample T3 showed the expected positive band. c, Double restriction digestion verification of pRS315-GPR2-sfGFP.')]);
  assert.deepEqual(strongs(out), ['Figure 1. Construction of the plasmid for heterologous expression of GPR2-sfGFP.', 'a,', 'b,', 'c,']);
});
test('a title ending in a digit stops before the first panel label (KOGal80.)', () => {
  const out = run([t('Figure 1. Construction of Gal80 knockout cassette KOGal80. a, PCR amplification of the three fragments constituting KOGal80. b, KOGal80 cassette assembled by Double-joint PCR.')]);
  assert.deepEqual(strongs(out), ['Figure 1. Construction of Gal80 knockout cassette KOGal80.', 'a,', 'b,']);
});
test('"panel b," reference and labels around emphasis', () => {
  assert.deepEqual(strongs(run([t('Figure 3. The first attempt to construct pRS315-sTF plasmid. a, Colony PCR result. The No.6 colony was selected for plasmid extraction and subsequent double digestion, shown in panel b, It was difficult to confirm the correctness of the plasmid from this result.')])).slice(1), ['a,', 'b,']);
  assert.deepEqual(strongs(run([t('Figure 2. Gal80 Gene Knockout. a, Schematic diagram of yeast homologous recombination (HR). b, Transformant verification results, confirming the successful knockout of the '), em('Gal80'), t(' gene.')])).slice(1), ['a,', 'b,']);
  assert.deepEqual(strongs(run([t('Figure 9. Title. Panels a and b show maps; see Panel c.')])).slice(1), ['a and b', 'c']);
});
test('parenthesised letters keep working, including inside a bold title', () => {
  assert.deepEqual(strongs(run([t('Figure 1. Symptoms on soybean roots. (a) '), em('Meloidogyne incognita'), t(': root galls. (b) '), em('Heterodera glycines'), t(': white females.')])).slice(1), ['(a)', '(b)']);
  const title = run([t('Figure 7. Fragment construction of Expression Cassette (a) and sTF Expression Cassette (b).')]);
  assert.deepEqual(strongs(title), ['Figure 7. Fragment construction of Expression Cassette (a) and sTF Expression Cassette (b).']);
  assert.deepEqual(strongs(run([t('Figure 5. (a) Map of X. (b, c) Gels. (d–f) Sequencing.')])), ['Figure 5.', '(a)', '(b, c)', '(d–f)']);
});
test('combined and alternative label forms', () => {
  assert.deepEqual(strongs(run([t('Figure 4. Title. a–c, Growth. d and e, Maps. f: Blot; g) Gel. a, and b, Repeats.')])).slice(1), ['a–c,', 'd and e,', 'f:', 'g)', 'a, and b,']);
});
test('ordinary letters are never bolded', () => {
  const out = run([t('Figure 6. Centrifugation. Cells were spun at 5000 g, 4 °C for 24 h, kept 3 d, then lysed; a small band appeared, see Fig. 2b, i.e., e.g., as Lee D, et al. reported (Figure 1.a), and a, the article, is not here.')]);
  assert.deepEqual(strongs(out), ['Figure 6. Centrifugation.']);
  const out2 = run([t('Figure 8. Model fit. Parameters $a, b$ and '), code('a, b'), t(' and '), link('c, d'), t('.')]);
  assert.deepEqual(strongs(out2), ['Figure 8. Model fit.']);
});
test('captions without a Figure label and title-only captions', () => {
  const out = run([t('a, Map of the plasmid. b, Gel.')]);
  assert.equal(out[0].type, 'strong');
  assert.deepEqual(strongs(out), ['a,', 'b,']);
  assert.deepEqual(strongs(run([t('Figure 2 Knockout of the '), em('Gal80'), t(' Gene')])), ['Figure 2 Knockout of the Gal80 Gene']);
});
