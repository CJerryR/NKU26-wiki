import {params, status, source, fail, setup} from './common.js';
setup('蛋白质结构');
try {
  const url = source(['.pdb','.cif','.mmcif']);
  document.querySelector('#download').href = url;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.text();
  const format = params.get('format') || (new URL(url).pathname.endsWith('.pdb') ? 'pdb' : 'cif');
  if (!['pdb','cif'].includes(format)) throw new Error('结构格式应为 PDB 或 CIF');
  const viewer = $3Dmol.createViewer(document.querySelector('#model'), {backgroundColor:'#f5f2eb', antialias:true});
  const model = viewer.addModel(data,format);
  if (!model.selectedAtoms({}).length) throw new Error('文件中没有可读取的原子坐标');
  const color = /^#[\da-f]{6}$/i.test(params.get('color') || '') ? params.get('color') : '#8cae73';
  const residues = [];
  for (const part of (params.get('residues') || '').split(',')) {
    const match = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (match) { const from = +match[1], to = Math.min(+(match[2] || from),from + 500); for (let n=from;n<=to;n++) residues.push(n); }
  }
  const select = document.querySelector('#style');
  select.value = ['cartoon','stick','sphere','surface'].includes(params.get('representation')) ? params.get('representation') : 'cartoon';
  let generation = 0;
  async function draw() {
    const current = ++generation;
    viewer.removeAllSurfaces();
    const style = select.value;
    viewer.setStyle({}, style === 'surface' ? {cartoon:{color,opacity:0.25}} : {[style]: {color}});
    viewer.setStyle({hetflag:true},{stick:{colorscheme:'Jmol'},sphere:{scale:0.3,colorscheme:'Jmol'}});
    const chain = params.get('chain');
    if (residues.length) viewer.setStyle({...chain ? {chain} : {},resi:residues},{stick:{color:'#a466bb'},sphere:{scale:0.25,color:'#a466bb'}});
    else if (chain) viewer.setStyle({chain},{cartoon:{color:'#a466bb'}});
    viewer.render();
    if (style === 'surface') {
      status.textContent = '正在计算分子表面…';
      try { await viewer.addSurface($3Dmol.SurfaceType.VDW,{opacity:0.85,color},{}); }
      catch (error) { if (current === generation) fail(error); return; }
    }
    if (current === generation) status.textContent = '拖动旋转 · 滚轮或双指缩放 · 配体按元素着色';
  }
  viewer.zoomTo();
  await draw();
  select.onchange = draw;
  document.querySelector('#reset').onclick = () => { viewer.zoomTo(); viewer.render(); };
  document.querySelector('#spin').onclick = event => { const active = event.target.getAttribute('aria-pressed') !== 'true'; viewer.spin(active ? 'y' : false); event.target.setAttribute('aria-pressed',String(active)); event.target.textContent = active ? '停止旋转' : '自动旋转'; };
  new ResizeObserver(()=>{viewer.resize();viewer.render();}).observe(document.querySelector('#model'));
} catch(error) { fail(error); }
