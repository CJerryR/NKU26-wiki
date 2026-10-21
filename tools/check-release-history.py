#!/usr/bin/env python3
"""Block a release missing its visible changelog or prior publication time."""
import json,re
from pathlib import Path
release=json.loads(Path('static/release.json').read_text());text=Path('README.md').read_text().split('## 版本改动',1)[1]
blocks={m[1]:m[2] for m in re.finditer(r'### (V[\d.]+)(?: 改动)?[：:]?\s*([\s\S]*?)(?=### |$)',text)}
current='V'+release['version'];assert current in blocks, f'{current}: missing website changelog'
assert re.search(r'^\d+\. .+',blocks[current],re.M), f'{current}: missing changes'
assert re.search(r'^(?:发布|改动)时间：\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}（北京时间）$',blocks[current],re.M), f'{current}: exact Beijing time required'
previous=release.get('previous_release',{}).get('version')
if previous:
 assert re.search(r'^发布时间：\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}（北京时间）$',blocks.get('V'+previous,''),re.M), f'V{previous}: backfill verified publication time before next release'
print('PASS: visible current changelog and exact prior publication time')
