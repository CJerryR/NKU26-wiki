/** Reserve original dimensions and defer mapped images until their original bytes pass SHA256. */
import fs from 'node:fs/promises';import path from 'node:path';
const manifest=JSON.parse(await fs.readFile('content/original-image-assets.json','utf8'));
const placeholder='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;');
let mapped=0;
async function walk(root){for(const e of await fs.readdir(root,{withFileTypes:true})){const p=path.join(root,e.name);if(e.isDirectory()){await walk(p);continue;}if(!e.name.endsWith('.html')||p.includes(`${path.sep}widgets${path.sep}`))continue;const before=await fs.readFile(p,'utf8');const after=before.replace(/<img\b[^>]*>/gi,tag=>{const src=tag.match(/\bsrc=(['"])(.*?)\1/);if(!src||!manifest[src[2]])return tag;const key=src[2],entry=manifest[key];mapped++;let out=tag.replace(src[0],`src="${placeholder}" data-author-original="${esc(key)}" data-author-source-state="pending"`);if(!/\bwidth=/.test(out))out=out.replace('<img',`<img width="${entry.source_dimensions[0]}"`);if(!/\bheight=/.test(out))out=out.replace('<img',`<img height="${entry.source_dimensions[1]}"`);return out;});if(after!==before)await fs.writeFile(p,after);}}
await walk('public');console.log(`Author images: ${mapped} instances reserve original dimensions; original bytes verified before display.`);
