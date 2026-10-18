// Runs during HTML parsing, independently of the deferred site/motion bundle.
(() => {
  const html = document.documentElement;
  const root = document.querySelector('[data-scene]');
  if (!root || !html.classList.contains('scene-loading')) return;
  const kind = matchMedia(root.dataset.scenePortrait).matches ? 'mobile' : 'desktop';
  const atlas = root.querySelector(`[data-scene-set="${kind}"]`);
  const assets = [
    { url: atlas?.dataset.src, fallback: 'scene--noart', ready: false },
    { url: root.dataset.sceneGround, fallback: 'scene--noground', ready: false },
    { url: root.dataset.sceneSky, fallback: 'scene--nosky', ready: false },
  ];
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    for (const asset of assets) {
      if (!asset.ready) root.classList.add(asset.fallback);
    }
    html.classList.remove('scene-loading');
  };
  const timeout = setTimeout(finish, 2500);
  Promise.all(assets.map(asset => new Promise(resolve => {
    if (!asset.url) { resolve(); return; }
    const img = new Image();
    img.fetchPriority = 'high';
    img.onload = async () => {
      try {
        if (img.decode) await img.decode();
        asset.ready = true;
      } catch { /* A decoding failure uses the same fallback as a failed load. */ }
      resolve();
    };
    img.onerror = () => resolve();
    img.src = asset.url;
  }))).then(() => {
    clearTimeout(timeout);
    finish();
  });
})();
