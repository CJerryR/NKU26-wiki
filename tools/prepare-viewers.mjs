import fs from 'node:fs/promises';
import path from 'node:path';
const target = 'static/widgets/vendor';
await fs.mkdir(target, {recursive:true});
for (const [from,to] of [
  ['node_modules/katex/dist','katex'],
  ['node_modules/katex/LICENSE','katex/LICENSE'],
  ['node_modules/chart.js/LICENSE.md','Chartjs-LICENSE.md'],
  ['node_modules/papaparse/LICENSE','PapaParse-LICENSE'],
  ['node_modules/3dmol/build/3Dmol-min.js','3Dmol-min.js'],
  ['node_modules/3dmol/LICENSE','3Dmol-LICENSE'],
  ['node_modules/pdfjs-dist/build','pdf/build'],
  ['node_modules/pdfjs-dist/web','pdf/web'],
  ['node_modules/pdfjs-dist/cmaps','pdf/cmaps'],
  ['node_modules/pdfjs-dist/standard_fonts','pdf/standard_fonts'],
  ['node_modules/pdfjs-dist/wasm','pdf/wasm'],
  ['node_modules/pdfjs-dist/LICENSE','pdf/LICENSE'],
]) {
  await fs.mkdir(path.dirname(path.join(target,to)), {recursive:true});
  await fs.cp(from,path.join(target,to),{recursive:true});
}
console.log('Prepared local protein and PDF viewer assets.');
