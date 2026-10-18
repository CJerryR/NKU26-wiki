// Optional iframe sizing bridge; active only with ?embed=1.
(() => {
  if (new URLSearchParams(location.search).get('embed') !== '1' || parent === window) return;
  document.body.classList.add('wiki-embed');
  let parentOrigin = null, pending = false;
  function announce() {
    if (!parentOrigin || pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      parent.postMessage({type:'nemaklear:height',height:Math.ceil(document.body.getBoundingClientRect().height)},parentOrigin);
    });
  }
  window.addEventListener('message',e => {
    if(e.source !== parent || e.data?.type !== 'nemaklear:init' || e.origin === 'null') return;
    parentOrigin=e.origin; announce();
  });
  new ResizeObserver(announce).observe(document.body);
})();
