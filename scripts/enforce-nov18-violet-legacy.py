#!/usr/bin/env python3
"""Idempotently attach the SHA-addressed Nov18 violet adapter to captured Next HTML.

Only snapshots that already reference /_next/static/css/ are eligible.  Do not
rewrite app/runtime JavaScript, native Spring views, protected preview pages,
or generated images.  The generated links are relative-to-origin absolute paths.
"""
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / 'spring-backend/src/main/resources/static'
CSS = STATIC / 'css/mv-legacy-violet.css'
TAG = '<link rel="stylesheet" href="/css/mv-legacy-violet.css?v={digest}">'
FALLBACK = '5f13fc286907515d.css'  # Stored Tailwind global CSS, verified present.
MISSING_GLOBALS = ('828951deb2af2cbe.css', '9d01d690ff7707f0.css')
EXISTING = re.compile(r'<link rel="stylesheet" href="/css/mv-legacy-violet\.css(?:\?v=[0-9a-f]+)?">')


def changes() -> list[tuple[Path, str]]:
    digest = hashlib.sha256(CSS.read_bytes()).hexdigest()
    desired = TAG.format(digest=digest)
    results = []
    for path in sorted(STATIC.rglob('*.html')):
        if path.parent == STATIC:
            continue
        text = path.read_text(encoding='utf-8-sig')
        if '/_next/static/css/' not in text:
            # Respect independent native, preview and legacy standalone pages.
            continue
        if text.count('</head>') != 1:
            raise ValueError(f'Cannot safely place style in malformed <head>: {path}')
        updated = EXISTING.sub('', text)
        # Previous snapshots referred to missing hashed CSS. Use the preserved
        # known Tailwind base asset rather than leaving raw, oversized SVG UI.
        # This is an explicitly documented compatibility fallback, NOT an
        # assertion that old Next bundle hashes have equivalent bytes.
        for missing in MISSING_GLOBALS:
            updated = updated.replace(missing, FALLBACK)
        updated = updated.replace('</head>', desired + '</head>', 1)
        if updated != text:
            results.append((path, updated))
    return results


def main() -> int:
    cli = argparse.ArgumentParser()
    cli.add_argument('--write', action='store_true', help='apply to the explicit Next HTML corpus')
    args = cli.parse_args()
    changed = changes()
    for path, _ in changed[:8]:
        print('UPDATE', path.relative_to(ROOT))
    print(f'Next snapshots needing change: {len(changed)}')
    if args.write:
        for path, content in changed:
            path.write_text(content, encoding='utf-8')
    return 0 if args.write or not changed else 1


if __name__ == '__main__':
    raise SystemExit(main())
