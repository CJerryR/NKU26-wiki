/** Download complete submitted source files without changing their bytes or formatting. */
import documents from '../../content/source-archive.json';
type SourceDocument={id:string;original_name:string;sha256:string;mime_type:string;chunks:string[]};
const manifest=documents as SourceDocument[];
const files=new Map(manifest.map(entry=>[entry.id,entry]));
const cache=new Map<string,Promise<string>>();
async function sourceUrl(entry:SourceDocument):Promise<string>{
 if(!cache.has(entry.id))cache.set(entry.id,(async()=>{
  const parts=await Promise.all(entry.chunks.map(async url=>{
   const response=await fetch(url);if(!response.ok)throw Error(`HTTP ${response.status}`);
   const part=await response.json();if(part.encoding!=='gzip+base64'||part.source_sha256!==entry.sha256)throw Error('Source document identity mismatch');return part.data as string;
  }));
  const compressed=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));
  const bytes=await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
  if(digest!==entry.sha256)throw Error('Source document checksum mismatch');
  return URL.createObjectURL(new Blob([bytes],{type:entry.mime_type}));
 })().catch(error=>{cache.delete(entry.id);throw error;}));
 return cache.get(entry.id)!;
}
export function initSourceArchive():void{
 document.addEventListener('click',async event=>{
  const anchor=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[data-source-document]'):null;
  if(!anchor)return;
  const entry=files.get(anchor.dataset.sourceDocument||'');if(!entry)return;
  event.preventDefault();
  if(anchor.getAttribute('aria-busy')==='true')return;
  const status=anchor.parentElement?.querySelector<HTMLElement>('[role="status"]');anchor.setAttribute('aria-busy','true');
  if(status)status.textContent='Preparing original…';
  try{
   const url=await sourceUrl(entry);const download=document.createElement('a');download.href=url;download.download=entry.original_name;download.click();
   anchor.dataset.sourceState='verified';anchor.dataset.sourceSha256=entry.sha256;
   if(status)status.textContent='Original file verified. Download ready.';
  }catch(error){anchor.dataset.sourceState='error';if(status)status.textContent='Download could not be verified. Please try again.';console.error('Submitted source document download failed',entry.id,error);}
  finally{anchor.removeAttribute('aria-busy');}
 });
}
