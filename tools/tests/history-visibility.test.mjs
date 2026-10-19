import test from 'node:test';
import assert from 'node:assert/strict';
import { visibleHistory } from '../../src/lib/history-visibility.mjs';

const versions = [
  { version: 'V1', entries: [
    { number: '1', text: '新增历史资料区，提供 12 份完整旧稿。' },
    { number: '2', text: '恢复作者程序的报告、图件和结果下载。' },
    { number: '3', text: '原稿、模型运行库和下载文件完成官方 CDN 迁移。' },
  ] },
  { version: 'V2', entries: [
    { number: '1', text: '历史资料区补上 HP_Project Word 的公开下载。' },
    { number: '2', text: '公开副本仅清除图片 GPS，保留文字、排版和图片像素。' },
    { number: '3', text: '调整下载链接与核验状态之间的间距。' },
  ] },
];

test('ordinary pages omit archive history while preserving scientific output downloads', () => {
  const snapshot = JSON.stringify(versions);
  const result = visibleHistory(versions);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].entries, [versions[0].entries[1]]);
  assert.equal(JSON.stringify(versions), snapshot);
});

test('dedicated archive page retains its complete original history', () => {
  assert.equal(visibleHistory(versions, true), versions);
});
