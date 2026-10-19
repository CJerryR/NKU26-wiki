import {loadPyodide} from './runtime/pyodide-loader.js';
import createPyodideModule from './runtime/pyodide-core.js';
const base=new URL('./runtime/',import.meta.url),nativeFetch=globalThis.fetch.bind(globalThis),payloads=new Map();
let py,invoke;const pending=new Map();
const ready=(async()=>{
 const manifest=await(await nativeFetch(new URL('runtime-manifest.json',base))).json();
 const entries=new Map(manifest.files.map(f=>[f.name,f]));
 const cache=typeof caches==='undefined'?null:await caches.open('nemaklear-verified-runtime-v1').catch(()=>null);
 const verify=async(bytes,entry)=>{
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
  if(digest!==entry.sha256)throw Error(`Runtime checksum failed: ${entry.name}`);
  return bytes;
 };
 async function binary(entry){
  if(!payloads.has(entry.name))payloads.set(entry.name,(async()=>{
   const key=new URL(`verified-${entry.sha256}`,base).href;
   const stored=await cache?.match(key).catch(()=>null);
   if(stored){try{return await verify(new Uint8Array(await stored.arrayBuffer()),entry);}catch{await cache.delete(key);}}
   const parts=await Promise.all(entry.chunks.map(async f=>(await(await nativeFetch(new URL(f,base))).json()).data));
   const encoded=atob(parts.join('')),zipped=Uint8Array.from(encoded,c=>c.charCodeAt(0));
   const bytes=new Uint8Array(await new Response(new Blob([zipped]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
   await verify(bytes,entry);
   if(cache)await cache.put(key,new Response(bytes)).catch(()=>{});
   return bytes;
  })());return payloads.get(entry.name);
 }
 // Fetch independent, hash-verified packages together while Python initializes.
 const warmup=Promise.all(manifest.files.map(binary));
 warmup.catch(()=>{}); // loadPyodide reports the same failed payload when requested.
 globalThis.fetch=async(input,init)=>{
  const url=new URL(typeof input==='string'||input instanceof URL?input:input.url,base);
  const entry=url.origin===base.origin?entries.get(url.pathname.split('/').pop()):null;
  if(entry){const bytes=await binary(entry);return new Response(bytes,{headers:{'Content-Type':entry.name.endsWith('.wasm')?'application/wasm':'application/octet-stream'}});}
  // Fail closed: no upstream CDN fallback at browser runtime.
  if(url.origin!==base.origin)throw Error('NemaKlear runtime cannot load an external host.');
  return nativeFetch(input,init);
 };
 const lock=await(await nativeFetch(new URL('pyodide-lock.json',base))).json();
 py=await loadPyodide({indexURL:base.href,packageBaseUrl:base.href,lockFileContents:lock,createPyodideModule,packages:['numpy','scipy']});
 const sources=await(await nativeFetch(new URL('source-files.json',import.meta.url))).json();
 for(const file of sources.files){const dest='/submission/app/'+file.path;py.FS.mkdirTree(dest.slice(0,dest.lastIndexOf('/')));py.FS.writeFile(dest,file.text);}
 await py.runPythonAsync(`import sys, json, io\nsys.dont_write_bytecode=True\nsys.path.insert(0,'/submission/app')\nimport server\ndef wiki_request(method, url, payload):\n    handler=object.__new__(server.Handler)\n    handler.path=url\n    encoded=payload.encode('utf-8')\n    handler.headers={'Content-Length':str(len(encoded)), 'Host':'local-browser'}\n    handler.rfile=io.BytesIO(encoded)\n    response={}\n    def capture(code, content, content_type='application/json; charset=utf-8'):\n        response.update(status=code,body=content,contentType=content_type)\n    handler.send=capture\n    if method=='POST':\n        handler.do_POST()\n    else:\n        handler.do_GET()\n    return json.dumps(response,ensure_ascii=False,allow_nan=False)\n`);
 invoke=py.globals.get('wiki_request');postMessage({type:'ready',runtime:manifest});
})();
let queue=Promise.resolve();
self.onmessage=({data})=>{queue=queue.then(async()=>{
 try{await ready;let body;
 if(data.type==='verify'){body=await py.runPythonAsync(`import unittest,io,json\ns=io.StringIO();r=unittest.TextTestRunner(stream=s,verbosity=2).run(unittest.defaultTestLoader.discover('/submission/app/tests'))\njson.dumps({'tests':r.testsRun,'successful':r.wasSuccessful(),'log':s.getvalue()})`);body=JSON.parse(body);}
 else body=JSON.parse(invoke(data.method||'GET',data.url,data.payload||''));
 postMessage({id:data.id,response:body});
 }catch(e){postMessage({id:data.id,error:String(e?.stack||e)});}
 });};
