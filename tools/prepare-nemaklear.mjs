/** Build the author's unchanged application and a browser Python transport.
 * Binary runtime resources are serialized as genuine JSON payloads, with hashes;
 * they are decoded back to the upstream bytes in the worker, never renamed wheels.
 * Runtime fetches use only local files or the team's explicit iGEM asset mapping.
 */
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import zlib from 'node:zlib';
const root=process.cwd(), source=path.join(root,'vendor/nemaklear-original'),dest=path.join(root,'static/widgets/nemaklear');
const runtime=path.join(root,'node_modules/pyodide');const cache=path.resolve(root,'../../tmp/nemaklear-browser-runtime/package');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
await fs.mkdir(dest,{recursive:true});await fs.cp(path.join(source,'app/public'),dest,{recursive:true});
for(const file of ['bridge.js','worker.js','mobile.css'])await fs.copyFile(path.join(root,'src/nemaklear',file),path.join(dest,file));
// Presentation copy only: scientific source files in vendor retain all original hashes.
const index=await fs.readFile(path.join(source,'app/public/index.html'),'utf8');
await fs.writeFile(path.join(dest,'index.html'),index.replace(/(src|href)="\/(?!\/)/g,'$1="./').replace('<script src="./i18n.js">','<script src="./bridge.js"></script><script src="./i18n.js">'));
const files=[];
async function scan(dir,prefix=''){for(const e of await fs.readdir(dir,{withFileTypes:true})){const rel=path.posix.join(prefix,e.name),full=path.join(dir,e.name);if(e.isDirectory())await scan(full,rel);else if(/\.(py|json|csv)$/.test(e.name)){const b=await fs.readFile(full);files.push({path:rel,sha256:sha(b),text:b.toString('utf8')});}}}
const publicFiles=[];async function publicScan(dir,prefix=''){for(const e of await fs.readdir(dir,{withFileTypes:true})){const rel=path.posix.join(prefix,e.name);if(e.isDirectory())await publicScan(path.join(dir,e.name),rel);else if(rel.startsWith('figures/'))publicFiles.push(rel);}}await publicScan(path.join(source,'app/public'));await fs.writeFile(path.join(dest,'asset-index.json'),JSON.stringify(publicFiles));
await scan(path.join(source,'app'));await fs.writeFile(path.join(dest,'source-files.json'),JSON.stringify({files}));
const rd=path.join(dest,'runtime');await fs.mkdir(rd,{recursive:true});
await fs.copyFile(path.join(runtime,'pyodide.mjs'),path.join(rd,'pyodide-loader.js'));
await fs.copyFile(path.join(runtime,'pyodide.asm.mjs'),path.join(rd,'pyodide-core.js'));
const lock=JSON.parse(await fs.readFile(path.join(runtime,'pyodide-lock.json'),'utf8'));
await fs.writeFile(path.join(rd,'pyodide-lock.json'),JSON.stringify(lock));
const binary=[];
for(const name of ['pyodide.asm.wasm','python_stdlib.zip',...['numpy','scipy'].map(n=>lock.packages[n].file_name)]){
 let b;try{b=await fs.readFile(path.join(runtime,name));}catch{try{b=await fs.readFile(path.join(cache,name));}catch{const url=`https://cdn.jsdelivr.net/pyodide/v314.0.7/full/${name}`;const r=await fetch(url);if(!r.ok)throw Error(`${r.status} downloading pinned runtime ${name}`);b=Buffer.from(await r.arrayBuffer());await fs.mkdir(cache,{recursive:true});await fs.writeFile(path.join(cache,name),b);}}
 const pkg=Object.values(lock.packages).find(p=>p.file_name===name);if(pkg&&sha(b)!==pkg.sha256)throw Error(`Upstream wheel hash mismatch: ${name}`);
 const encoded=zlib.gzipSync(b,{level:9}).toString('base64'),chunks=[];
 for(let at=0;at<encoded.length;at+=2_000_000){const file=`payload-${sha(b).slice(0,12)}-${String(chunks.length).padStart(2,'0')}.json`;chunks.push(file);await fs.writeFile(path.join(rd,file),JSON.stringify({encoding:'gzip+base64',data:encoded.slice(at,at+2_000_000)}));}
 binary.push({name,sha256:sha(b),bytes:b.length,chunks});
}
await fs.writeFile(path.join(rd,'runtime-manifest.json'),JSON.stringify({pyodide:'314.0.7',python:lock.info.python,numpy:lock.packages.numpy.version,scipy:lock.packages.scipy.version,files:binary}));
const pack=await fs.readFile(path.join(source,'app/public/figure-pack.zip'));await fs.writeFile(path.join(dest,'figure-pack.json'),JSON.stringify({name:'figure-pack.zip',sha256:sha(pack),base64:pack.toString('base64')}));await fs.unlink(path.join(dest,'figure-pack.zip'));
const manifest=JSON.parse(await fs.readFile(path.join(source,'MANIFEST-SHA256.json'),'utf8'));for(const [name,digest]of Object.entries(manifest)){if(sha(await fs.readFile(path.join(source,name)))!==digest)throw Error(`Author file changed: ${name}`);}
await fs.writeFile(path.join(dest,'submission-manifest.json'),JSON.stringify(manifest));
console.log(`NemaKlear: ${Object.keys(manifest).length} author files verified; original Python executed in browser; NumPy ${lock.packages.numpy.version}, SciPy ${lock.packages.scipy.version}.`);

// Deployment transport: explicit official CDN map, retaining original resource bytes.
const cdnMap=JSON.parse(await fs.readFile(path.join(root,'content/nemaklear-cdn.json'),'utf8'));
const mappedFetch=(object)=>`((raw)=>(input,init)=>{const u=new URL(typeof input==='string'||input instanceof URL?input:input.url,import.meta.url);const item=Object.entries(${JSON.stringify(cdnMap)}).find(([p])=>u.pathname.endsWith('/'+p));return raw(item?item[1]:input,init);})(${object}.fetch.bind(${object}))`;
for(const [file,object] of [['worker.js','globalThis'],['bridge.js','window']]){
 const p=path.join(dest,file);let s=await fs.readFile(p,'utf8');
 // bridge.js is a classic script, so use its captured script base URL.
 let replacement=mappedFetch(object);if(object==='window')replacement=replacement.replace('import.meta.url','base');
 s=s.replace(`${object}.fetch.bind(${object})`,replacement);await fs.writeFile(p,s);
}
