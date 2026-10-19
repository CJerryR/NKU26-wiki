/* Transport only. Author app.js, eco.js, i18n.js and all Python calculations remain unchanged. */
(()=>{
 const base=new URL('./',document.currentScript.src),nativeFetch=window.fetch.bind(window),worker=new Worker(new URL('worker.js',base),{type:'module'});
 const mobileSheet=document.createElement('link');mobileSheet.rel='stylesheet';mobileSheet.href=new URL('mobile.css',base).href;document.head.append(mobileSheet);
 nativeFetch(new URL('asset-index.json',base)).catch(()=>{});
 let sequence=0;const jobs=new Map();
 worker.onmessage=({data})=>{if(data.type==='ready'){document.documentElement.dataset.nemaklearRuntime='ready';return;}const job=jobs.get(data.id);if(!job)return;jobs.delete(data.id);data.error?job.reject(Error(data.error)):job.resolve(data.response);};
 worker.onerror=e=>{for(const job of jobs.values())job.reject(Error(e.message||'Original Python runtime failed to load.'));jobs.clear();document.documentElement.dataset.nemaklearRuntime='error';};
 function request(method,url,payload,signal,type){return new Promise((resolve,reject)=>{const id=++sequence;if(signal?.aborted)return reject(new DOMException('Aborted','AbortError'));jobs.set(id,{resolve,reject});signal?.addEventListener('abort',()=>{jobs.delete(id);reject(new DOMException('Aborted','AbortError'));},{once:true});worker.postMessage({id,method,url,payload,type});});}
 window.fetch=async(input,init={})=>{const u=new URL(typeof input==='string'||input instanceof URL?input:input.url,location.href);if(u.origin===location.origin&&/^\/(?:api|report)\//.test(u.pathname)){const r=await request(init.method||'GET',u.pathname+u.search,init.body||'',init.signal);return new Response(typeof r.body==='string'?r.body:JSON.stringify(r.body),{status:r.status,headers:{'Content-Type':r.contentType}});}return nativeFetch(input,init);};
 // Use the supplied relative figure paths on both / and /nku-china/ deployments.
 function assets(){for(const node of document.querySelectorAll('[src^="/figures/"],[href^="/figures/"]')){const attribute=node.hasAttribute('src')?'src':'href';node.setAttribute(attribute,new URL(node.getAttribute(attribute).slice(1),base).href);}}
 new MutationObserver(assets).observe(document.documentElement,{childList:true,subtree:true});
 document.addEventListener('click',async e=>{const anchor=e.target.closest('a[href]');if(!anchor)return;const u=new URL(anchor.href);
 if(u.origin===location.origin&&u.pathname.startsWith('/report/')){e.preventDefault();const win=window.open('about:blank','_blank');try{const r=await request('GET',u.pathname+u.search,'');if(r.status!==200)throw Error(r.body.error);const blob=new Blob([r.body],{type:'text/html'});const url=URL.createObjectURL(blob);if(win)win.location.replace(url);else{const a=document.createElement('a');a.href=url;a.download='NemaKlear-report.html';a.click();}setTimeout(()=>URL.revokeObjectURL(url),120000);}catch(err){if(win)win.document.body.textContent=err.message;}}
 else if(u.pathname.endsWith('/figure-pack.zip')){e.preventDefault();const data=await(await nativeFetch(new URL('figure-pack.json',base))).json();const bytes=Uint8Array.from(atob(data.base64),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:'application/zip'}));const a=document.createElement('a');a.href=url;a.download=data.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 });
 // Read-only acceptance hook: invokes the author's unchanged twelve tests.
 window.nemaklearVerify=()=>request('GET','','',undefined,'verify');
})();
