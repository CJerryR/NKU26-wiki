// N05 (checkpoint-13): PDF blocks keep the browser's own reader and put open/download ABOVE the frame,
// so phones without inline PDF support still reach the file. Run: npm run test:media (no dependencies).
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMediaBlock } from '../../src/lib/media-blocks.mjs';

const url = 'https://static.igem.wiki/teams/6303/wiki/v8-0/v8c-3539c6074fb1-protocol-01.pdf';
test('PDF block: bar with open/download before the native-reader iframe', () => {
  const html = renderMediaBlock({ title: 'PCR Amplification', file: url, height: 650 }, 'pdf');
  const bar = html.indexOf('wiki-media__bar'), frame = html.indexOf('<iframe');
  assert.ok(bar > 0 && frame > bar, 'bar precedes iframe');
  assert.match(html, new RegExp(`<a class="wiki-media__action" href="${url}" target="_blank" rel="noopener noreferrer">Open PDF / Download</a>`));
  assert.match(html, new RegExp(`<iframe class="wiki-media__frame" src="${url}" title="PCR Amplification" loading="lazy" style="height:650px"`));
  assert.equal(html.includes('<figcaption>'), false, 'no empty caption');
});
test('PDF block: caption, escaping, height clamp and unsafe URL', () => {
  const html = renderMediaBlock({ title: 'A & "B"', file: url, height: 5000, caption: 'Fig <1>' }, 'pdf');
  assert.ok(html.includes('<span class="wiki-media__title">A &amp; &quot;B&quot;</span>'));
  assert.ok(html.includes('style="height:1200px"'));
  assert.ok(html.endsWith('<figcaption>Fig &lt;1&gt;</figcaption></figure>'));
  assert.match(renderMediaBlock({ file: 'javascript:alert(1)' }, 'pdf'), /wiki-media__invalid/);
  assert.match(renderMediaBlock({}, 'pdf'), /wiki-media--empty/);
});
