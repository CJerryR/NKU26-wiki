/** Display byte-verified author images without iGEM's automatic image transcoding.
 * JSON is a transport envelope; the Blob contains the unchanged submitted file.
 * No canvas, image processing, resizing or pixel editing is used here.
 */
import originals from '../../content/original-image-assets.json';
type Original = {sha256:string; mime_type:string; original_name:string; source_dimensions:number[]; chunks:string[]};
const manifest=originals as Record<string,Original>;
const cache=new Map<string,Promise<string>>();
let running=0;const waiting:Array<()=>void>=[];
async function withSlot<T>(work:()=>Promise<T>):Promise<T>{
 if(running<3)running++;else await new Promise<void>(resolve=>waiting.push(resolve));
 try{return await work();}finally{const next=waiting.shift();if(next)next();else running--;}
}
const scheduled=new WeakMap<HTMLImageElement,string>();
const roots=new WeakSet<Node>();
const observers:MutationObserver[]=[];
const placeholder='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
let transfers=0;const transferQueue:Array<()=>void>=[];
async function envelope(url:string):Promise<{encoding:string;source_sha256:string;data:string}>{
 if(transfers<3)transfers++;else await new Promise<void>(resolve=>transferQueue.push(resolve));
 try{
  for(let attempt=0;;attempt++){
   try{const response=await fetch(url);if(!response.ok)throw Error(`Author image resource HTTP ${response.status}`);return await response.json();}
   catch(error){if(attempt>=2)throw error;await new Promise(resolve=>setTimeout(resolve,300*(attempt+1)));}
  }
 }finally{const next=transferQueue.shift();if(next)next();else transfers--;}
}
async function originalUrl(key:string):Promise<string>{
 if(!cache.has(key))cache.set(key,withSlot(async()=>{
  const entry=manifest[key];
  const encoded=(await Promise.all(entry.chunks.map(async url=>{const d=await envelope(url);if(d.encoding!=='gzip+base64'||d.source_sha256!==entry.sha256)throw Error('Author image envelope identity mismatch');return d.data as string;}))).join('');
  const binary=atob(encoded),compressed=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)compressed[i]=binary.charCodeAt(i);
  const bytes=await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
  if(digest!==entry.sha256)throw Error('Author image checksum mismatch');
  return URL.createObjectURL(new Blob([bytes],{type:entry.mime_type}));
 }));
 return cache.get(key)!;
}
function initRoot(root:Document|ShadowRoot):void{
 if(roots.has(root))return;roots.add(root);
 const scan=(node:Node):void=>{
  if(node instanceof HTMLImageElement)queue(node);
  if(node instanceof Element||node instanceof Document||node instanceof ShadowRoot){
   node.querySelectorAll('img').forEach(queue);
   if(node instanceof Element&&node.shadowRoot)initRoot(node.shadowRoot);
   node.querySelectorAll('*').forEach(el=>{if(el.shadowRoot)initRoot(el.shadowRoot);});
  }
 };
 const nearby=new IntersectionObserver(entries=>{for(const item of entries)if(item.isIntersecting){nearby.unobserve(item.target);void display(item.target as HTMLImageElement);}},{rootMargin:'300px'});
 const queue=(img:HTMLImageElement):void=>{
  const src=img.getAttribute('src')||'';const key=manifest[src]?src:img.dataset.authorOriginal||'';const entry=manifest[key];
  if(!entry)return;
  if(scheduled.get(img)===key){if(src===key&&img.dataset.authorSourceState==='verified')void display(img);return;}
  scheduled.set(img,key);img.dataset.authorOriginal=key;img.dataset.authorSourceState='pending';
  // Keep the existing CSS and aspect ratio; only replace the transport of the image.
  if(!img.hasAttribute('width'))img.width=entry.source_dimensions[0];
  if(!img.hasAttribute('height'))img.height=entry.source_dimensions[1];
  img.removeAttribute('srcset');img.src=placeholder;nearby.observe(img);
 };
 const display=async(img:HTMLImageElement):Promise<void>=>{
  try{const key=img.dataset.authorOriginal!;const url=await originalUrl(key);img.src=url;await img.decode();img.dataset.authorSourceState='verified';img.dataset.authorSourceSha256=manifest[key].sha256;
   // Existing links open the same original bytes as the displayed picture.
   root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(a=>{if(a.getAttribute('href')===key)a.href=url;});
  }catch(error){img.dataset.authorSourceState='error';console.error('Original author image could not be verified',img.dataset.authorOriginal,error);}
 };
 scan(root);
 const observer=new MutationObserver(records=>{for(const record of records){if(record.type==='attributes')scan(record.target);else record.addedNodes.forEach(scan);}});
 observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['src','data-author-original']});observers.push(observer);
}
export function initOriginalImages():void{
 initRoot(document);
 customElements.whenDefined('wiki-toolkit').then(()=>{document.querySelectorAll('wiki-toolkit').forEach(el=>{if(el.shadowRoot)initRoot(el.shadowRoot);});});
}
