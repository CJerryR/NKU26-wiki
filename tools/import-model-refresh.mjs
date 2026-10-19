import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import katex from 'katex';

const source = path.resolve('docs/model-refresh-20261020');
const assets = JSON.parse(fs.readFileSync(path.join(source,'assets.json')));
const tables = JSON.parse(fs.readFileSync('docs/model-refresh-20261020/tables.json'));
const processor = unified().use(remarkParse).use(remarkStringify);
const plain = n => n.value ?? (n.children || []).map(plain).join('');
const md = n => processor.stringify({type:'root',children:[n]}).trim();
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const text = body => ({_template:'text',body});
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
const unescape = s => s.replace(/\\([\\`*{}\[\]()#+\-.!_>&|])/g,'$1');
const math = s => katex.renderToString(s,{displayMode:true,throwOnError:true,output:'htmlAndMathml'});
function tableHtml(rows) {
  return '<div class="model-table-scroll" tabindex="0"><table class="model-source-table"><thead><tr>'+rows[0].map(v=>'<th scope="col">'+esc(v??'')+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(1).map(row=>'<tr>'+row.map(v=>'<td>'+esc(v??'')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
}
const config = [
 ['model','Model -_ Overview (1)','Model -_ Overview.md'],
 ['model-docking','Model -_ Docking (1)','Model -_ Docking.md'],
 ['model-md','Model -_ Molecular Dynamics (1)','Model -_ Molecular Dynamics.md'],
 ...(process.argv.includes('--pending-eco')?[['model-eco','','Model -_ Economic Benefit.md']]:[]),
];
const report=[];
for (const [slug,folder,name] of config) {
 const contentPath=`content/wiki/${slug}.json`;
 const archive=`docs/model-refresh-20261020/${slug}-before.json`;
 if(!fs.existsSync(archive))fs.copyFileSync(contentPath,archive);
 const original=JSON.parse(fs.readFileSync(archive));
 let manuscript=fs.readFileSync(path.join(source,name),'utf8');
 const formulae=[];
 manuscript=manuscript.replace(/^\\\[\s*\n([\s\S]*?)^\\\]\s*$/gm,(_all,formula)=>{const tex=unescape(formula).trim();formulae.push(tex);return '\n\n'+math(tex)+'\n\n';});
 const tree=processor.parse(manuscript);
 const nodes=tree.children.slice(1);
 const blocks=[text('<div class="reading-layout model-manuscript" lang="en">')];
 const oldHeads=original.blocks.filter(b=>b._template==='heading');
 const pendingTables=(tables[slug]||[]).map(t=>({...t,used:false}));
 let headingIndex=0;const fidelity=[];
 for(let i=0;i<nodes.length;i++) {
  const n=nodes[i];const value=plain(n);
  if(n.type==='heading') {
   const oldId=oldHeads[headingIndex]?.attributes?.match(/#([^\s]+)/)?.[1];
   const id=slug==='model'&&headingIndex===0?'model-overview':`${slug}-section-${headingIndex}`;
   if(oldId&&oldId!==id)blocks.push(text(`<span id="${esc(oldId)}" aria-hidden="true"></span>`));
   blocks.push({_template:'heading',level:n.depth>2?3:2,text:value,attributes:`#${id} toc="${value.replaceAll('"','&quot;')}" unnumbered`});
   headingIndex++;
  } else if(slug==='model' && n.type==='paragraph'&&n.children[0]?.type==='image') {
   if(!blocks.some(b=>b.body?.includes('model-chapter-links'))) {
    const links=[['model-docking','Docking'],['model-md','Molecular Dynamics'],['model-ode','ODE and Dual-Channel Model'],['model-eco','Eco']];
    const pics=nodes.filter(x=>x.type==='paragraph'&&x.children[0]?.type==='image').map(x=>x.children[0]);
    blocks.push(text('<nav class="model-chapter-links" aria-label="Model chapters">'+links.map(([route,label],j)=>{const a=assets[folder+'/'+decodeURIComponent(pics[j].url)];return `<a href="/${route}/"><img src="${a.src}" width="1024" height="1024" alt="" loading="lazy" decoding="async"><span>${label}</span></a>`;}).join('')+'</nav>'));
   }
  } else if(n.type==='paragraph'&&n.children.length===1&&n.children[0].type==='image') {
   const image=n.children[0];const a=assets[folder+'/'+decodeURIComponent(image.url)];
   if(!a)throw Error('Unmapped image '+image.url);
   const caption=nodes[i+1];if(caption?.type!=='blockquote')throw Error('Caption missing');
   let src=a.src;
   // The author caption specifies Fig.5a–c. Keep the already published matching crop,
   // preserving the prior user disposition rather than replacing it with the full a–k plate.
   if(slug==='model-docking'&&/^Figure 6/.test(plain(caption))) {
    const existing=original.blocks.find(b=>b.body?.includes('Figure 6'))?.body;
    const found=existing?.match(/src="([^"]+)"/);if(found)src=found[1];
   }
   const block={_template:'image',src,alt:plain(caption).split('. ').slice(0,2).join('. '),body:processor.stringify({type:'root',children:caption.children}).trim(),layout:'full',imageWidth:'wide'};
   if(a.dimensions[0]<a.dimensions[1]*1.1 && blocks.at(-1)?._template==='text'&&!blocks.at(-1).body.startsWith('<')) {
    block.accompanyingBody=blocks.pop().body;block.layout='right';block.imageWidth='wide';
   }
   blocks.push(block);i++;
  } else if(slug==='model-eco'&&value==='【此处插入网页】') {
   blocks.push(text('<div data-nemaklear-original></div>'));
  } else blocks.push(text(md(n)));
  fidelity.push({source_type:n.type,text:value});
  for(const t of pendingTables) {
   if(!t.used&&t.preceding_text===value) {
    if(t.empty) {
     // Pending explicit user disposition; leave this marker in the local candidate.
     blocks.push(text('<div data-model-source-table-missing="eco-rules"></div>'));
    } else blocks.push(text(tableHtml(t.rows)));
    t.used=true;
   }
  }
 }
 blocks.push(text('</div>'));
 const unused=pendingTables.filter(t=>!t.used);if(unused.length)throw Error('Unplaced tables '+slug+': '+unused.map(t=>t.preceding_text));
 fs.writeFileSync(contentPath,JSON.stringify({...original,blocks,preserveAuthorFormatting:true},null,2)+'\n');
 report.push({slug,source:name,sha256:hash(fs.readFileSync(path.join(source,name))),blocks:blocks.length,source_nodes:fidelity,formulae,table_count:pendingTables.length});
}
fs.writeFileSync('docs/model-refresh-20261020/import-receipt.json',JSON.stringify(report,null,2)+'\n');
console.log(report.map(({slug,blocks,table_count})=>({slug,blocks,table_count})));
