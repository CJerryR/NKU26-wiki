#!/usr/bin/env python3
"""Verify recorded CDN URLs and output references without equating HTTP with rendering."""
import argparse
import concurrent.futures
import datetime
import json
from pathlib import Path
import re
import urllib.request
from urllib.parse import urlsplit


def check(entry):
    url = entry['cdn_url']
    parsed = urlsplit(url)
    if parsed.scheme != 'https' or parsed.hostname != 'static.igem.wiki' or parsed.username or parsed.password:
        return {'status': 'invalid-url', 'error': 'Expected HTTPS static.igem.wiki URL'}
    try:
        request = urllib.request.Request(url, headers={'Origin': 'https://2026.igem.wiki', 'User-Agent': 'NKU-Wiki-Asset-Check/1.0'})
        with urllib.request.urlopen(request, timeout=30) as response:
            prefix = response.read(64)
            return {'status': response.status, 'content_type': response.headers.get('Content-Type'),
                    'content_length': response.headers.get('Content-Length'),
                    'cors_allow_origin': response.headers.get('Access-Control-Allow-Origin'),
                    'nonempty': bool(prefix), 'final_url': response.url}
    except Exception as error:
        return {'status': 'request-failed', 'error': str(error)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--progress', type=Path, required=True)
    parser.add_argument('--public', type=Path, required=True)
    parser.add_argument('--manifest', type=Path)
    args = parser.parse_args()
    data = json.loads(args.progress.read_text())
    used = set()
    for file in args.public.rglob('*'):
        if file.is_file() and file.suffix in ('.html', '.css', '.js', '.mjs', '.json'):
            used.update(re.findall(r'''https://static\.igem\.wiki/[^"'\s<>);]+''', file.read_text()))
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    failures = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(check, data['assets']))
    for entry, result in zip(data['assets'], results):
        entry['http_verification'] = {'checked_at': now, **result}
        entry['referenced_in_build'] = entry['cdn_url'] in used
        entry.setdefault('browser_verification', {'status': 'not-verified'})
        ok = result['status'] == 200 and result.get('nonempty')
        entry['verification'] = ('HTTP 200 and nonempty response verified' if ok else 'HTTP verification failed') + '; ' + (
            'referenced in current build' if entry['referenced_in_build'] else 'not referenced in current build'
        ) + '; browser status: ' + entry['browser_verification']['status']
        if not ok:
            failures.append({'path': entry['path'], **result})
    recorded = {entry['cdn_url'] for entry in data['assets']}
    missing = sorted(used - recorded)
    data['http_verified_at'] = now
    data['http_verified_count'] = sum(r['status'] == 200 and r.get('nonempty', False) for r in results)
    data['current_build_referenced_count'] = len(used)
    # Preserve original counts, hashes and returned URLs; verification is additive.
    args.progress.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    if args.manifest:
        manifest = {'verified_at': now, 'scope': 'Recorded CDN assets referenced in the current build; HTTP checks do not certify licensing or human review.',
                    'assets': [entry for entry in data['assets'] if entry['referenced_in_build']]}
        args.manifest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'recorded': len(data['assets']), 'http_verified': data['http_verified_count'],
                      'referenced_in_build': len(used), 'missing_mappings': missing, 'failures': failures}, ensure_ascii=False, indent=2))
    return bool(failures or missing)


if __name__ == '__main__':
    raise SystemExit(main())
