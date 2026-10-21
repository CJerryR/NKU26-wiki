import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMemberGrid, renderCreditGrid } from '../../src/lib/person-cards.mjs';

test('plain member biographies render only the agreed species names and aliases in italics', () => {
  const output = renderMemberGrid({ items: [{ name: 'Example', introduction:
    'Saccharomyces cerevisiae (S.c), Meloidogyne incognita (M.i), Caenorhabditis elegans (C.e), Heterodera glycines (H. glycines), Arthrobotrys oligospora (A. oligospora).\n\nM.i and S.c.',
  }] });
  for (const name of ['Saccharomyces cerevisiae', 'S.c', 'Meloidogyne incognita', 'M.i', 'Caenorhabditis elegans', 'C.e', 'Heterodera glycines', 'H. glycines', 'Arthrobotrys oligospora', 'A. oligospora']) {
    assert.ok(output.includes(`<em>${name}</em>`), name);
  }
  assert.ok(output.includes('<p><em>M.i</em> and <em>S.c</em>.</p>'));
});

test('credit task text gets scientific italics while names, roles, task chips and facts remain literal', () => {
  const output = renderCreditGrid({ items: [{ name: 'M.i', role: 'C.e', tasks: 'S.c', specificTasks: [
    { text: 'Background research: Studied Meloidogyne incognita (M.i).' },
  ] }] });
  assert.ok(output.includes('Background research:</strong> Studied <em>Meloidogyne incognita</em> (<em>M.i</em>).'));
  assert.match(output, /<h3[^>]*>M\.i<\/h3>/);
  assert.ok(output.includes('<p class="credit-card__role">C.e</p>'));
  assert.ok(output.includes('<li>S.c</li>'));
  const member = renderMemberGrid({ items: [{ name: 'Example', introduction: 'M.i', university: 'C.e', cohort: 'S.c' }] });
  assert.ok(member.includes('<dd><span class="nb">C.e</span></dd>'));
  assert.ok(member.includes('<dd><span class="nb">S.c</span></dd>'));
});

test('species rendering escapes HTML and does not match chemical or identifier substrings', () => {
  const text = 'CeCl3 Mitochondria MicroRNA Mi_ID pRS315-M.i M.i-001 S.c-GFP S.c.txt M.i.txt /M.i/data.csv C.e-GFP <script>alert(1)</script> & "x"';
  const output = renderMemberGrid({ items: [{ name: 'Example', introduction: text }] });
  assert.doesNotMatch(output, /<em>/);
  assert.doesNotMatch(output, /<script>/);
  assert.ok(output.includes('&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;x&quot;'));
  for (const token of ['CeCl3', 'Mitochondria', 'MicroRNA', 'Mi_ID', 'pRS315-M.i', 'M.i-001', 'S.c-GFP', 'S.c.txt', 'M.i.txt', '/M.i/data.csv', 'C.e-GFP']) assert.ok(output.includes(token), token);
});
