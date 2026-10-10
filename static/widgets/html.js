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
} catch(error) { fail(error); }
