"""Optional: let the OpenAI Images API draw every sheet, then bring them in.

    OPENAI_API_KEY=sk-... python3 tools/scene-art/gpt_api.py           # every sheet not yet in gpt/out/
    OPENAI_API_KEY=sk-... python3 tools/scene-art/gpt_api.py 05 11     # only these sheets (drawn again)

Instead of chatting with ChatGPT: each request sends the style board and one
layout sheet to the images "edits" endpoint with that sheet's own prompt (kept
in gpt/manifest.json, same rules as the ChatGPT prompt), asks for a transparent
1536x1024 PNG at high quality, and saves it as gpt/out/<sheet>.png. Named by
sheet, so gpt_ingest.py takes each file at its word; it runs at the end.

    --model     image model (default $OPENAI_IMAGE_MODEL or gpt-image-1)
    --base-url  API root (default $OPENAI_BASE_URL or https://api.openai.com/v1)
    --force     redraw sheets that already have a file in gpt/out/
    --no-ingest only draw

Costs a few US dollars for all 16 sheets at high quality. Standard library only.
"""
from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GPT = ROOT / 'gpt'


def multipart(fields: list[tuple[str, str]], files: list[tuple[str, Path]]) -> tuple[bytes, str]:
    b = uuid.uuid4().hex
    out = bytearray()
    for k, v in fields:
        out += f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    for k, p in files:
        ct = mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
        out += f'--{b}\r\nContent-Disposition: form-data; name="{k}"; filename="{p.name}"\r\nContent-Type: {ct}\r\n\r\n'.encode()
        out += p.read_bytes() + b'\r\n'
    out += f'--{b}--\r\n'.encode()
    return bytes(out), f'multipart/form-data; boundary={b}'


def draw(base: str, key: str, model: str, prompt: str, images: list[Path], fidelity: bool) -> bytes:
    fields = [('model', model), ('prompt', prompt), ('size', '1536x1024'), ('quality', 'high'),
              ('background', 'transparent'), ('output_format', 'png'), ('n', '1')]
    if fidelity:
        fields.append(('input_fidelity', 'high'))   # keep the layout as close as the model allows
    body, ctype = multipart(fields, [('image[]', p) for p in images])
    req = urllib.request.Request(f'{base.rstrip("/")}/images/edits', data=body, method='POST',
                                 headers={'Authorization': f'Bearer {key}', 'Content-Type': ctype})
    with urllib.request.urlopen(req, timeout=600) as r:
        data = json.loads(r.read())
    item = data['data'][0]
    if item.get('b64_json'):
        return base64.b64decode(item['b64_json'])
    with urllib.request.urlopen(item['url'], timeout=300) as r:   # some deployments answer with a URL
        return r.read()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('sheets', nargs='*', help='sheet numbers, e.g. 05 11 (default: all missing)')
    ap.add_argument('--model', default=os.environ.get('OPENAI_IMAGE_MODEL', 'gpt-image-1'))
    ap.add_argument('--base-url', default=os.environ.get('OPENAI_BASE_URL', 'https://api.openai.com/v1'))
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--no-ingest', action='store_true')
    args = ap.parse_args()
    key = os.environ.get('OPENAI_API_KEY')
    if not key:
        sys.exit('set OPENAI_API_KEY first, e.g.  OPENAI_API_KEY=sk-... python3 tools/scene-art/gpt_api.py')
    man = json.loads((GPT / 'manifest.json').read_text(encoding='utf-8'))
    out = GPT / 'out'
    out.mkdir(parents=True, exist_ok=True)
    style = GPT / 'ref' / '00-style.png'
    want = [s for s in man['sheets'] if (not args.sheets or s['id'] in args.sheets)]
    if not args.sheets and not args.force:
        want = [s for s in want if not (out / f'{s["id"]}.png').exists()]
    fidelity = True
    failed = []
    for sh in want:
        sheet = next((GPT / '给GPT').rglob(sh['file']))
        for attempt in range(4):
            try:
                print(f'sheet {sh["id"]}: drawing ({args.model}) ...', flush=True)
                png = draw(args.base_url, key, args.model, sh['api_prompt'], [style, sheet], fidelity)
                (out / f'{sh["id"]}.png').write_bytes(png)
                print(f'sheet {sh["id"]}: saved gpt/out/{sh["id"]}.png', flush=True)
                break
            except urllib.error.HTTPError as e:
                msg = e.read().decode('utf-8', 'replace')
                if e.code == 400 and 'input_fidelity' in msg and fidelity:
                    fidelity = False                      # this model does not take it: ask again without
                    continue
                if e.code in (429, 500, 502, 503, 504) and attempt < 3:
                    wait = 20 * (attempt + 1)
                    print(f'sheet {sh["id"]}: HTTP {e.code}, retrying in {wait}s', flush=True)
                    time.sleep(wait)
                    continue
                print(f'sheet {sh["id"]}: HTTP {e.code}: {msg[:400]}', flush=True)
                failed.append(sh['id'])
                break
            except (urllib.error.URLError, TimeoutError, KeyError, ValueError) as e:
                if attempt < 3:
                    time.sleep(15)
                    continue
                print(f'sheet {sh["id"]}: failed: {e}', flush=True)
                failed.append(sh['id'])
                break
    if failed:
        print('not drawn: ' + ' '.join(failed) + '  (run again to retry only these)')
    if not args.no_ingest and any(out.glob('*.png')):
        return subprocess.call([sys.executable, str(Path(__file__).with_name('gpt_ingest.py'))])
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
