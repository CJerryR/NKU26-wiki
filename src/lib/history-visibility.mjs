// Keep historical-source references on their dedicated archive page without
// rewriting the immutable README publication history.
const archiveEntry = /历史(?:文档|原稿|资料)|historical\s+(?:source|documents?)|source-archive|original submission|原稿[^。]*下载/i;
const archiveDetail = /公开副本|下载链接|核验状态|完整原件|文档格式|图片 GPS/;

export function visibleHistory(versions, includeHistoricalSources = false) {
  if (includeHistoricalSources) return versions;
  return versions.flatMap(version => {
    const sourceOnly = version.entries.some(entry => archiveEntry.test(entry.text))
      && version.entries.every(entry => archiveEntry.test(entry.text) || archiveDetail.test(entry.text));
    const entries = sourceOnly ? [] : version.entries.filter(entry => !archiveEntry.test(entry.text));
    return entries.length ? [{ ...version, entries }] : [];
  });
}
