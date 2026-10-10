export const params = new URLSearchParams(location.search);
export const status = document.querySelector('#status');
export function source(extensions) {
  const value = params.get('src');
  if (!value) throw new Error('尚未选择文件，请回到 Tina 为此模块选择素材。');
  const root = new URL('../', location.href);
  const url = new URL(value.replace(/^\/(?!\/)/, ''), root);
  if (!['http:', 'https:'].includes(url.protocol) || value.startsWith('//')) throw new Error('文件地址必须是网站内路径或 HTTPS 地址。');
  if (extensions && !extensions.some(ext => url.pathname.toLowerCase().endsWith(ext))) throw new Error('文件格式不匹配：' + extensions.join(' / '));
  return url.href;
}
export function fail(error) {
  status.textContent = '';
  document.querySelector('#error').textContent = `无法显示此文件：${error.message || error}。请检查文件路径、格式及访问权限。`;
}
export function setup(title) {
  document.querySelector('#title').textContent = params.get('title') || title;
  document.title = params.get('title') || title;
  document.querySelector('#fullscreen').onclick = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { status.textContent = '此浏览器不支持嵌入窗口全屏。'; }
  };
}
