import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage } from '../c01/verify-render.mjs';

test('manuscript title renders as an editable styled paragraph, outside the heading outline', async () => {
  const { html, toc, warnings } = await renderPage({
    preserveAuthorFormatting: true,
    blocks: [{ _template: 'manuscriptTitle', manuscript: 'Engineering NemaKlear: **design–build–test–learn (DBTL)**' }],
  });
  assert.match(html, /<p class="manuscript-title">Engineering NemaKlear: <strong>design–build–test–learn \(DBTL\)<\/strong><\/p>/);
  assert.doesNotMatch(html, /<h[1-6]\b/);
  assert.deepEqual(toc, []);
  assert.deepEqual(warnings, []);
});

test('manuscript title exports from Tina GraphQL typename as well as stored template name', async () => {
  const { html, toc, warnings } = await renderPage({
    preserveAuthorFormatting: true,
    blocks: [{ __typename: 'WikiBlocksManuscriptTitle', manuscript: 'Project **Overview**' }],
  });
  assert.match(html, /<p class="manuscript-title">Project <strong>Overview<\/strong><\/p>/);
  assert.deepEqual(toc, []);
  assert.deepEqual(warnings, []);
});

test('right-side figure text precedes the figure in document order and links preview to original', async () => {
  const preview = 'https://example.org/preview.webp';
  const original = 'https://example.org/original.png';
  const { html, warnings } = await renderPage({
    preserveAuthorFormatting: true,
    blocks: [{
      _template: 'image', src: preview, originalSrc: original, alt: 'A test figure',
      openOriginal: true, body: 'Figure 1. Test caption.', layout: 'right', imageWidth: 'wide',
      accompanyingBody: 'Lead paragraph.',
    }],
  });
  const textAt = html.indexOf('Lead paragraph.');
  const figureAt = html.indexOf('<figure');
  assert.ok(textAt >= 0 && figureAt >= 0 && textAt < figureAt, html);
  assert.match(html, new RegExp(`<a href="${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*><img src="${preview.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  assert.match(html, /Figure 1\. Test caption\./);
  assert.deepEqual(warnings, []);
});

test('left-side figure layout keeps figure-first document order', async () => {
  const { html } = await renderPage({
    preserveAuthorFormatting: true,
    blocks: [{ _template: 'image', src: 'https://example.org/figure.png', alt: 'A test figure', body: 'Caption.', layout: 'left', accompanyingBody: 'Lead paragraph.' }],
  });
  assert.ok(html.indexOf('<figure') < html.indexOf('Lead paragraph.'), html);
});

test('opening an original image falls back to the preview URL when no original is set', async () => {
  const preview = 'https://example.org/figure.png';
  const { html } = await renderPage({
    preserveAuthorFormatting: true,
    blocks: [{ _template: 'image', src: preview, alt: 'A test figure', openOriginal: true }],
  });
  assert.match(html, new RegExp(`<a href="${preview.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*><img src="${preview.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
});

test('stack image layout keeps accompanying text before the figure', async () => {
  const { html } = await renderPage({
    preserveAuthorFormatting: true,
    blocks: [{ _template: 'image', src: 'https://example.org/figure.png', alt: 'A test figure', body: 'Caption.', layout: 'stack', accompanyingBody: 'Lead paragraph.' }],
  });
  assert.ok(html.indexOf('Lead paragraph.') < html.indexOf('<figure'), html);
});
