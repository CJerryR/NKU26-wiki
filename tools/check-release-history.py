#!/usr/bin/env python3
"""Block a release missing its visible changelog or prior publication time."""
import json,re
from pathlib import Path
release=json.loads(Path('static/release.json').read_text());text=Path('README.md').read_text().split('## Changelog',1)[1]
blocks={m[1]:m[2] for m in re.finditer(r'### (V[\d.]+)\s*([\s\S]*?)(?=### |$)',text)}
stamp=r' \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \(UTC\+8\)$'
current='V'+release['version'];assert current in blocks, f'{current}: missing website changelog'
assert re.search(r'^\d+\. .+',blocks[current],re.M), f'{current}: missing changes'
assert re.search(r'^(?:Published|Prepared):'+stamp,blocks[current],re.M), f'{current}: exact Beijing time (UTC+8) required'
previous=release.get('previous_release',{}).get('version')
if previous:
 assert re.search(r'^Published:'+stamp,blocks.get('V'+previous,''),re.M), f'V{previous}: backfill verified publication time before next release'
print('PASS: visible current changelog and exact prior publication time')
