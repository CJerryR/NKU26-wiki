/* Presentation-only behavior for the compact Wiki embed. The full app remains intact. */
(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('embed') !== '1' || window.parent === window) return;

  document.body.classList.add('wiki-embed');
  for (const id of ['dynamics', 'eco']) {
    const section = document.getElementById(id);
    if (section) section.hidden = true;
  }
  const gallery = document.getElementById('figures')?.closest('section');
  if (gallery) gallery.hidden = true;

  const originalStatus = document.getElementById('status');
  const form = originalStatus?.parentElement;
  const resultBody = document.getElementById('resultBody');
  if (!originalStatus || !form || !resultBody) return;

  const startup = document.createElement('p');
  startup.className = 'embed-startup';
  startup.setAttribute('role', 'status');
  startup.setAttribute('aria-live', 'polite');
  form.insertBefore(startup, originalStatus);

  const startedAt = Number(document.documentElement.dataset.nemaklearRuntimeStartedAt);
  const start = Number.isFinite(startedAt) ? startedAt : performance.now();
  let phase = document.documentElement.dataset.nemaklearRuntimePhase || 'loading-runtime';
  let active = true;
  let timer;
  const observers = [];

  const label = () => {
    const language = document.getElementById('language')?.value === 'zh' ? 'zh' : 'en';
    const labels = {
      'loading-runtime': { en: 'Loading calculation engine…', zh: '正在载入计算引擎…' },
      'preparing-model': { en: 'Preparing model…', zh: '正在准备模型…' },
      ready: { en: 'Preparing model…', zh: '正在准备模型…' },
      running: { en: 'Running example…', zh: '正在计算样例…' },
      error: { en: 'The model could not be prepared.', zh: '模型暂时无法准备。' }
    };
    return (labels[phase] || labels['loading-runtime'])[language];
  };

  const update = () => {
    if (!active) return;
    const seconds = Math.floor(Math.max(0, performance.now() - start) / 1000);
    startup.textContent = `${label()}${seconds ? ` · ${seconds}s` : ''}`;
  };
  const stop = () => {
    if (!active) return;
    active = false;
    startup.hidden = true;
    if (timer) clearInterval(timer);
    for (const observer of observers) observer.disconnect();
    window.removeEventListener('nemaklear:runtime', onRuntime);
  };

  const onRuntime = event => {
    if (event.detail?.phase) phase = event.detail.phase;
    if (phase === 'error') {
      stop();
      return;
    }
    update();
  };
  window.addEventListener('nemaklear:runtime', onRuntime);

  const statusObserver = new MutationObserver(() => {
    const text = originalStatus.textContent.trim();
    if (!text) return;
    if (/正在计算(?:\s*ODE)?|Calculating(?:\s+ODE)?…?|Solving ODE…?/i.test(text)) {
      phase = 'running';
      update();
    } else {
      // The application may display backend/job errors verbatim, without a
      // stable keyword. Any non-busy status ends startup feedback; the
      // application's own status remains visible to explain the outcome.
      stop();
    }
  });
  statusObserver.observe(originalStatus, { childList: true, characterData: true, subtree: true });
  observers.push(statusObserver);

  const resultObserver = new MutationObserver(() => {
    if (resultBody.querySelector('.densityline')) stop();
  });
  resultObserver.observe(resultBody, { childList: true, subtree: true });
  observers.push(resultObserver);

  if (resultBody.querySelector('.densityline')) stop();
  else {
    update();
    timer = setInterval(update, 1000);
  }
})();
