import {params, source, status, fail, setup} from './common.js';
setup('PDF 阅读器');
try {
  const pdfjs = await import('./vendor/pdf/build/pdf.mjs');
  globalThis.pdfjsLib = pdfjs;
  const {EventBus,PDFViewer,PDFLinkService,PDFFindController} = await import('./vendor/pdf/web/pdf_viewer.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdf/build/pdf.worker.mjs',import.meta.url).href;
  const url = source(['.pdf']);
  document.querySelector('#download').href = url;
  document.querySelector('#print').href = url;
  const eventBus = new EventBus();
  const linkService = new PDFLinkService({eventBus});
  const findController = new PDFFindController({eventBus,linkService});
  const viewer = new PDFViewer({container:document.querySelector('#viewerContainer'),eventBus,linkService,findController,annotationMode:pdfjs.AnnotationMode.ENABLE});
  linkService.setViewer(viewer);
  const pageField = document.querySelector('#page');
  eventBus.on('pagesinit',()=>{viewer.currentScaleValue='page-width';status.textContent='';});
  eventBus.on('pagechanging',event=>{pageField.value=event.pageNumber;document.querySelector('#prev').disabled=event.pageNumber<=1;document.querySelector('#next').disabled=event.pageNumber>=viewer.pagesCount;});
  eventBus.on('updatefindmatchescount',event=>{document.querySelector('#matches').textContent=`${event.matchesCount.current} / ${event.matchesCount.total}`;});
  eventBus.on('updatefindcontrolstate',event=>{if(event.state===1)document.querySelector('#matches').textContent='未找到';});
  const task = pdfjs.getDocument({url,cMapUrl:new URL('./vendor/pdf/cmaps/',import.meta.url).href,cMapPacked:true,standardFontDataUrl:new URL('./vendor/pdf/standard_fonts/',import.meta.url).href,wasmUrl:new URL('./vendor/pdf/wasm/',import.meta.url).href,isEvalSupported:false});
  task.onPassword = () => { task.destroy(); fail(new Error('此 PDF 需要密码，请上传可直接阅读的版本，或下载后打开')); };
  const doc = await task.promise;
  viewer.setDocument(doc);linkService.setDocument(doc);
  document.querySelector('#count').textContent=`/ ${doc.numPages}`;pageField.max=doc.numPages;
  document.querySelector('#prev').onclick=()=>{viewer.currentPageNumber=Math.max(1,viewer.currentPageNumber-1);};
  document.querySelector('#next').onclick=()=>{viewer.currentPageNumber=Math.min(doc.numPages,viewer.currentPageNumber+1);};
  pageField.onchange=()=>{viewer.currentPageNumber=Math.max(1,Math.min(doc.numPages,Number(pageField.value)||1));};
  document.querySelector('#in').onclick=()=>viewer.increaseScale();
  document.querySelector('#out').onclick=()=>viewer.decreaseScale();
  document.querySelector('#fit').onclick=()=>{viewer.currentScaleValue='page-width';};
  document.querySelector('#rotate').onclick=()=>{viewer.pagesRotation=(viewer.pagesRotation+90)%360;};
  function find(again=false){eventBus.dispatch('find',{source:window,type:again?'again':'',query:document.querySelector('#search').value,phraseSearch:true,caseSensitive:false,entireWord:false,highlightAll:true,findPrevious:false,matchDiacritics:false});}
  document.querySelector('#find').onclick=()=>find(true);
  let searchTimer;document.querySelector('#search').oninput=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>find(),250);};
  document.querySelector('#search').onkeydown=e=>{if(e.key==='Enter')find(true);};
  const thumbs=document.querySelector('#thumbs');let initialized=false;
  document.querySelector('#thumbnails').onclick=()=>{
    thumbs.hidden=!thumbs.hidden;document.querySelector('#thumbnails').setAttribute('aria-expanded',String(!thumbs.hidden));
    if(!initialized){
      initialized=true;
      const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);const n=Number(entry.target.dataset.page);doc.getPage(n).then(async page=>{const viewport=page.getViewport({scale:0.2});const canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;entry.target.prepend(canvas);await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;}).catch(()=>{});}},{root:thumbs});
      for(let n=1;n<=doc.numPages;n++){const button=document.createElement('button');button.dataset.page=n;button.textContent=`第 ${n} 页`;button.style.minHeight='140px';button.onclick=()=>{viewer.currentPageNumber=n;};thumbs.append(button);observer.observe(button);}
    }
    viewer.currentScaleValue='page-width';
  };
  new ResizeObserver(()=>{if(viewer.currentScaleValue==='page-width')viewer.currentScaleValue='page-width';}).observe(document.querySelector('#viewerContainer'));
} catch(error){fail(error);}
