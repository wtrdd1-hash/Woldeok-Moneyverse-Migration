#!/usr/bin/env python3
"""Read-only contract smoke test for the approved Nov-18 design system."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
CSS = ROOT / 'spring-backend/src/main/resources/static/css/mv-theme-nov18.css'
EN = ROOT / '.stitch/DESIGN.md'
KO = ROOT / '.stitch/DESIGN.ko.md'
EXPECTED = {
    '--mv-bg-base': '#0C1020',
    '--mv-bg-surface': '#151D32',
    '--mv-bg-surface-elevated': '#1C2642',
    '--mv-brand-violet': '#9C83FF',
    '--mv-brand-violet-hover': '#B4A0FF',
    '--mv-accent-blue': '#64B7FF',
    '--mv-text-primary': '#E9F1FF',
    '--mv-text-secondary': '#A8BCD8',
    '--mv-status-success': '#4ADE80',
    '--mv-status-danger': '#FB7185',
    '--mv-status-warning': '#FBBF24',
}

def main() -> int:
    css, en, ko = [p.read_text(encoding='utf-8') for p in (CSS, EN, KO)]
    errors = []
    for name, hex_code in EXPECTED.items():
        match = re.search(r'(?m)^\s*' + re.escape(name) + r'\s*:\s*(#[0-9a-fA-F]{6})\s*;', css)
        if not match or match.group(1).lower() != hex_code.lower():
            errors.append(f'CSS token {name} differs from {hex_code}')
        if not all((name in doc and hex_code.lower() in doc.lower()) for doc in (en, ko)):
            errors.append(f'DESIGN.md translations missing {name} {hex_code}')
    for lang in ('en', 'ko', 'ja', 'zh', 'vi'):
        if f'`{lang}`' not in en and f'({lang})' not in en:
            errors.append(f'English design contract is missing locale {lang}')
    for width in ('320', '390', '768', '1440', '1920'):
        if width not in en or width not in ko:
            errors.append(f'DESIGN.md missing viewport {width}')
    for label, doc in [('EN', en), ('KO', ko)]:
        for must in ('Spring', 'Thymeleaf', 'Stitch MCP'):
            if must not in doc:
                errors.append(f'{label} missing critical constraint {must}')
    if errors:
        for error in errors: print('FAIL:', error)
        return 1
    print(f'PASS: {len(EXPECTED)} CSS tokens match EN/KO source-derived DESIGN.md; five locales, required widths and Spring boundary present.')
    print('NOTE: static checks only; no visual QA, Stitch cloud calls, functional tests or deployment.')
    return 0

if __name__ == '__main__':
    sys.exit(main())
