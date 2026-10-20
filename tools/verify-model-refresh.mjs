import fs from 'node:fs';
import {unified} from 'unified';
import parse from 'remark-parse';
const plain=n=>n.value??(n.children||[]).map(plain).join('');
const expected={};
for(const [slug,name] of [['model','Overview'],['model-docking','Docking'],['model-md','Molecular Dynamics']]){
 let s=fs.readFileSync(`docs/model-refresh-20261020/Model -_ ${name}.md`,'utf8');
 s=s.replace(/^\\\[\s*\n([\s\S]*?)^\\\]\s*$/gm,'');
 const nodes=unified().use(parse).parse(s).children.slice(1);
 expected[slug]=nodes.filter(n=>!(n.type==='paragraph'&&n.children[0]?.type==='image')).map(n=>({type:n.type,text:plain(n)}));
}
fs.writeFileSync('../../evidence/model-refresh-20261020/expected-author-text.json',JSON.stringify(expected,null,2));
