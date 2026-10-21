#!/usr/bin/env python3
"""Verify only the selected standard Project pages are published."""
from pathlib import Path
import json
root=Path('public').resolve()
removed=['preview/project-feishu/index.html']+[f'preview/project-feishu/{s}/index.html' for s in ['description','engineering','contribution']]
for path in removed:
    assert not (root/path).exists(), f'Unselected Project comparison still published: {path}'
for slug in ['description','background','engineering','contribution']:
    text=(root/f'{slug}/index.html').read_text()
    assert 'data-doc' in text, f'{slug}: standard page missing article'
    assert 'data-project-preview' not in text, f'{slug}: comparison marker remains'
for path in root.rglob('*.html'):
    text=path.read_text()
    assert 'preview/project-feishu/' not in text, f'{path}: obsolete comparison link'
print(json.dumps({'passed':True,'standard_pages':4,'removed_comparison_routes':4}))
