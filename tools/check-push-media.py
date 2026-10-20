#!/usr/bin/env python3
"""Read-only audit of media introduced anywhere in a proposed Git push.

Unlike a final-tree diff, this finds files added and later deleted in the range.
Exit 1 means media needs CDN migration/history repair; exit 2 means invalid refs.
"""
import argparse
import json
from pathlib import PurePosixPath
import subprocess
import sys

MEDIA = set('.avif .bmp .gif .heic .ico .jpeg .jpg .jxl .png .svg .tif .tiff .webp .aac .aiff .flac .m4a .mp3 .ogg .opus .wav .avi .m4v .mkv .mov .mp4 .mpeg .mpg .ogv .webm'.split())


def git(*args):
    return subprocess.check_output(['git', *args], stderr=subprocess.PIPE)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', default='origin/main', help='Already-published ref (default: origin/main; fetch first)')
    parser.add_argument('--candidate', default='HEAD', help='Proposed candidate ref')
    args = parser.parse_args()
    try:
        base = git('rev-parse', '--verify', args.base + '^{commit}').decode().strip()
        candidate = git('rev-parse', '--verify', args.candidate + '^{commit}').decode().strip()
        if subprocess.run(['git', 'merge-base', '--is-ancestor', base, candidate], capture_output=True).returncode:
            raise ValueError('Candidate does not descend from base; integrate current official main before checking.')
        commits = git('rev-list', '--reverse', candidate, '^' + base).decode().splitlines()
        # Objects already reachable from published history are not newly uploaded.
        existing = {line.split(b' ', 1)[0].decode() for line in git('rev-list', '--objects', base).splitlines()}
        findings = {}
        for commit in commits:
            fields = git('diff-tree', '--root', '-r', '-m', '--no-commit-id', '--no-renames', '--raw', '-z', commit).split(b'\0')
            i = 0
            while i < len(fields) - 1:
                header = fields[i].decode('ascii'); path = fields[i + 1].decode('utf-8', errors='surrogateescape'); i += 2
                oldmode, mode, oldblob, blob, status = header.lstrip(':').split()
                if status == 'D' or not mode.startswith('100') or blob in existing:
                    continue
                if PurePosixPath(path).suffix.lower() not in MEDIA:
                    continue
                key = (path, blob)
                if key not in findings:
                    findings[key] = {'path': path, 'blob': blob, 'first_commit': commit, 'status': status,
                                     'bytes': int(git('cat-file', '-s', blob))}
        report = {'base': base, 'candidate': candidate, 'commits_checked': len(commits),
                  'scope': 'every added/modified blob in every unpushed commit, including subsequently deleted media',
                  'media': list(findings.values()), 'passed': not findings}
        print(json.dumps(report, indent=2, ensure_ascii=True))
        return 1 if findings else 0
    except (subprocess.CalledProcessError, ValueError) as error:
        print(str(error), file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())
