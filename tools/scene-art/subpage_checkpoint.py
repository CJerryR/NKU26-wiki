"""Package the six opening increments, source sprites, and independent GPT kit.

python3 tools/scene-art/subpage_checkpoint.py final --output /absolute/path/openings.zip
Requires the existing website checkout to use the incremental source package.
"""
import argparse
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[2]
PAGES = ['hp-overview', 'hp-investigation', 'hp-industry', 'description', 'engineering', 'contribution']
PREFIX = ('ov-', 'iv-', 'in-', 'pd-', 'pe-', 'pc-')
TOOLS = ['subpage_openings.py', 'subpage_gpt_ingest.py', 'subpage_preview.py', 'subpage_checkpoint.py', 'pages.py']


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('checkpoint')
    ap.add_argument('--output', type=Path)
    args = ap.parse_args()
    output = args.output or ROOT / 'tmp' / f'subpage-opening-{args.checkpoint}.zip'
    output.parent.mkdir(parents=True, exist_ok=True)
    files = [ROOT / 'src/data/scenes.ts', ROOT / 'src/styles/scene-hero.css']
    for page in PAGES:
        files += [ROOT / f'src/data/scenes/{page}.json', ROOT / f'src/data/scenes/{page}.atlas.json',
                  ROOT / f'static/img/scenes/{page}-desktop.webp', ROOT / f'static/img/scenes/{page}-mobile.webp']
    for kind in ('auto', 'gpt'):
        files += [p for p in (ROOT / 'assets/scenes-2d' / kind).glob('*.png') if p.name.startswith(PREFIX)]
    for folder in ('gpt/subpage-openings', 'docs/subpage-opening'):
        files += [p for p in (ROOT / folder).rglob('*') if p.is_file() and not p.is_symlink()]
    files += [ROOT / 'tools/scene-art' / name for name in TOOLS]
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(set(files)):
            archive.write(path, 'website/' + path.relative_to(ROOT).as_posix())
    with zipfile.ZipFile(output) as archive:
        assert archive.testzip() is None
        assert 'website/gpt/manifest.json' not in archive.namelist()
        assert all(not any(ord(c) > 127 for c in item.filename) or item.flag_bits & 0x800 for item in archive.infolist())
        count = len(archive.infolist())
    print(f'{output}: {count} files, {output.stat().st_size:,} bytes, CRC/UTF-8 PASS')


if __name__ == '__main__':
    main()
