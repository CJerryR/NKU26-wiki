import {params, source, status, fail, setup} from './common.js';
setup('HTML 演示');
try {
  const url = source(['.html','.htm']);
  const frame = document.querySelector('#document');
  // Never combine allow-scripts and allow-same-origin: content cannot access Tina storage or the parent page.
  frame.setAttribute('sandbox',params.get('scripts') === '1' ? 'allow-scripts' : '');
  status.textContent = params.get('scripts') === '1' ? '交互演示 · 可在窗口内操作' : '文档阅读 · 脚本关闭';
  // Check same-origin files for missing paths, rather than silently embedding a 404.
  if (new URL(url).origin === location.origin) {
    const response = await fetch(url,{method:'HEAD'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  }
  frame.src = url;
  document.querySelector('#reload').onclick = () => { frame.src = url; };
  const siteBase = new URL('../', location.href);
  const futureWorkUrl = new URL('embeds/results-future-work-20261021/index.html', siteBase);
  const autoHeight = params.get('scripts') === '1'
    && new URL(url).origin === location.origin
    && new URL(url).href === futureWorkUrl.href;
  if (autoHeight) {
    const stage = document.querySelector('.stage');
    document.body.style.minHeight = '0';
    document.body.style.display = 'block';
    stage.style.height = 'auto';
    stage.style.minHeight = '0';
    const sendHeight = () => {
      const bottom = stage.getBoundingClientRect().bottom + window.scrollY;
      parent.postMessage({ type: 'nku-results-future-work:height', height: Math.ceil(bottom) }, location.origin);
    };
    window.addEventListener('message', event => {
      const height = Number(event.data?.height);
      if (event.source !== frame.contentWindow || event.origin !== 'null' || event.data?.type !== 'nku-results-future-work:resize' || !Number.isFinite(height) || height < 200 || height > 2600) return;
      frame.style.height = `${Math.ceil(height)}px`;
      requestAnimationFrame(sendHeight);
    });
    frame.addEventListener('load', sendHeight);
  }
} catch(error) { fail(error); }
