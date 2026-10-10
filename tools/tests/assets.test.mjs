import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { finalizeAssets } from '../finalize-stage-assets.mjs';
async function fixture(t, files) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'nku-assets-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await fs.writeFile(path.join(root, name), content);
  }
  return root;
}
const exists = async (root, file) => fs.stat(path.join(root, file)).then(() => true, () => false);
test('CDN-only stage excludes unused media and inactive lazy viewers', async (t) => {
  const root = await fixture(t, {'index.html':'<img src="https://static.igem.wiki/image.avif"><script src="js/app.js"></script>','js/app.js':'document.querySelector("img"); const lazy = () => "/widgets/vendor/katex/katex.min.css";','img/unused.png':'image','widgets/vendor/katex/katex.min.css':'unused'});
  const r = await finalizeAssets(root);
  assert.equal(r.widgetRuntime, false);
  assert.equal(await exists(root,'img/unused.png'),false);
  assert.equal(await exists(root,'widgets/vendor/katex/katex.min.css'),false);
  assert.equal(await exists(root,'js/app.js'),true);
});
test('retains CSS fonts, srcset, poster, downloads and dynamic JS images', async (t) => {
  const media=['fonts/font.woff2','img/a.png','img/b.png','img/bg.svg','img/poster.jpg','docs/read.pdf','img/runtime.png'];
  const root=await fixture(t,{'index.html':'<link href="css/app.css"><img srcset="img/a.png 1x, img/b.png 2x"><video poster="img/poster.jpg"></video><a href="docs/read.pdf">PDF</a><script src="js/app.js"></script>','css/app.css':"@font-face{src:url('../fonts/font.woff2')}body{background:url('../img/bg.svg')}",'js/app.js':"const image = prefix + 'img/runtime.png';",...Object.fromEntries(media.map(f=>[f,'asset'])),'img/unused.png':'unused'});
  await finalizeAssets(root);
  for(const f of media)assert.equal(await exists(root,f),true,f);
  assert.equal(await exists(root,'img/unused.png'),false);
});
test('equation retains lazy KaTeX stylesheet and fonts; excludes unused PDF engine', async(t)=>{
  const needed=['widgets/vendor/katex/katex.min.css','widgets/vendor/katex/fonts/math.woff2','widgets/vendor/katex/LICENSE'];
  const root=await fixture(t,{'index.html':'<wiki-toolkit data-type="equation"></wiki-toolkit><script src="_astro/app.js"></script>','_astro/app.js':'const lazy = () => import("./data.js");','_astro/data.js':'const css = asset("/widgets/vendor/katex/katex.min.css");',...Object.fromEntries(needed.map(f=>[f,'asset'])),'widgets/vendor/katex/katex.min.css':'@font-face{src:url(fonts/math.woff2)}','widgets/vendor/pdf/unused.wasm':'unused'});
  await finalizeAssets(root);
  for(const f of needed)assert.equal(await exists(root,f),true,f);
  assert.equal(await exists(root,'widgets/vendor/pdf/unused.wasm'),false);
});
test('viewer preserves module, worker, fonts and model encoded in props',async(t)=>{
  const needed=['widgets/protein.html','widgets/protein.js','widgets/viewer.css','widgets/vendor/worker.mjs','widgets/vendor/decoder.wasm','fonts/font.woff2','docs/model.cif'];
  const root=await fixture(t,{...Object.fromEntries(needed.map(f=>[f,'asset'])),'description/index.html':'<iframe src="../widgets/protein.html?src=https%3A%2F%2Fstatic.igem.wiki%2Fmodel.cif"></iframe><wiki-toolkit data-props="{&quot;file&quot;:&quot;/docs/model.cif&quot;}"></wiki-toolkit>','widgets/protein.html':'<link href="viewer.css"><script type="module" src="protein.js"></script>','widgets/viewer.css':'@font-face{src:url(../fonts/font.woff2)}','widgets/protein.js':'const worker = new URL("vendor/worker.mjs", import.meta.url);','widgets/vendor/worker.mjs':'const data = new URL("decoder.wasm", import.meta.url);','widgets/html.html':'unused demo'});
  await finalizeAssets(root);
  for(const f of needed)assert.equal(await exists(root,f),true,f);
  assert.equal(await exists(root,'widgets/html.html'),false);
});
test('keeps query model, imported stylesheet, filenames with spaces and computed folders',async(t)=>{
  const needed=['widgets/protein.html','docs/model.cif','css/fonts.css','fonts/body font.woff2','img/computed.png'];
  const root=await fixture(t,{...Object.fromEntries(needed.map(f=>[f,'asset'])),'index.html':'<iframe src="widgets/protein.html?src=%2Fdocs%2Fmodel.cif"></iframe><link href="css/main.css"><script src="js/app.js"></script>','css/main.css':'@import "fonts.css";','css/fonts.css':'@font-face{src:url("../fonts/body font.woff2")}','js/app.js':'const image = "/img" + "/" + name;'});
  await finalizeAssets(root);
  for(const f of needed)assert.equal(await exists(root,f),true,f);
});
