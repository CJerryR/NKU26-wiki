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
const odeOnly = process.argv.includes('--ode-only');
const restoredFormulae = odeOnly ? JSON.parse(fs.readFileSync(path.join(source,'ode-formula-restoration.json'))).changes.map(c=>c.restored_tex) : [];
function renderMath(s,displayMode=false) {
 const html=katex.renderToString(s,{displayMode,throwOnError:true,output:'htmlAndMathml'});
 // Prevent Markdown from interpreting TeX stars, escapes or blank lines inside
 // the accessible annotation. Entities decode back to the identical TeX.
 return html.replace(/(<annotation[^>]*>)([\s\S]*?)(<\/annotation>)/g,(_,a,t,z)=>a+t.replaceAll('\\','&#92;').replaceAll('*','&#42;').replaceAll('_','&#95;').replaceAll('\n','&#10;')+z);
}
const math = s => '<div class="model-equation">'+renderMath(s,true)+'</div>';
function odeCell(value) {
 const input=String(value??'');let out='',cursor=0;
 for(let i=0;i<input.length;i++) {
  if(input[i]!=='(')continue;
  let depth=1,j=i+1;for(;j<input.length&&depth;j++){if(input[j]==='(')depth++;if(input[j]===')')depth--;}
  if(depth)break;
  const tex=input.slice(i+1,j-1);
  if(/[\\_^=]/.test(tex)&&!/[\^]\(/.test(tex)) {out+=esc(input.slice(cursor,i))+renderMath(tex);cursor=j;}
  i=j-1;
 }
 return out+esc(input.slice(cursor));
}
function tableHtml(rows) {
  const cell=v=>odeOnly?odeCell(v):String(v??'').split(/(\([^()]*[\\_^][^()]*\))/g).map(s=>/^\([^()]*[\\_^][^()]*\)$/.test(s)?katex.renderToString(s.slice(1,-1),{throwOnError:true,output:'htmlAndMathml'}):esc(s)).join('');
  return '<div class="model-table-scroll" tabindex="0"><table class="model-source-table"><thead><tr>'+rows[0].map(v=>'<th scope="col">'+cell(v)+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(1).map(row=>'<tr>'+row.map(v=>'<td>'+cell(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
}
const config = odeOnly ? [['model-ode','Model -_ ODE and Dual-Channel Model','Model -_ ODE and Dual-Channel Model-restored.md']] : [
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
 manuscript=manuscript.replace(/^\\\[\s*\n([\s\S]*?)^\\\]\s*$/gm,(_all,formula)=>{const raw=formula.trim();const tex=restoredFormulae.includes(raw)?raw:unescape(raw);formulae.push(tex);return '\n\n'+math(tex)+'\n\n';});
 if(slug==='model-ode') {
  // Feishu escapes ordinary parentheses and TeX alike. Only render mathematical
  // spans; retain prose parentheses, species abbreviations and citations verbatim.
  manuscript=manuscript.replace(/\\\((.*?)\\\)/g,(all,value)=>{
   const tex=unescape(value);
   if(!/[\\_^=]/.test(tex)&&!/^([A-Z]|[bcmnajr])$/.test(tex))return all;
   return renderMath(tex);
  });
 }
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
   const block={_template:'image',src,alt:plain(caption).split('. ').slice(0,2).join('. '),body:processor.stringify({type:'root',children:caption.children}).trim(),layout:'full',imageWidth:'wide',openOriginal:true};
   if(a.dimensions[0]<a.dimensions[1]*1.1 && blocks.at(-1)?._template==='text'&&!blocks.at(-1).body.startsWith('<')) {
    block.accompanyingBody=blocks.pop().body;block.layout='right';block.imageWidth='wide';
   }
   blocks.push(block);i++;
  } else if(slug==='model-eco'&&value==='【此处插入网页】') {
   blocks.push(text('<div data-nemaklear-original></div>'));
  } else blocks.push(text(md(n)));
  fidelity.push({source_type:n.type,text:value});
  for(const t of pendingTables) {
   if(!t.used&&(t.preceding_text===value||(slug==='model-ode'&&value.startsWith(t.preceding_text.split(' Here,')[0])))) {
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
fs.writeFileSync(odeOnly?'docs/model-refresh-20261020/ode-import-receipt.json':'docs/model-refresh-20261020/import-receipt.json',JSON.stringify(report,null,2)+'\n');
console.log(report.map(({slug,blocks,table_count})=>({slug,blocks,table_count})));
