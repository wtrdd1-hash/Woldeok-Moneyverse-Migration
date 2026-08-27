"""Enumerate every route the original application serves, from its source.

Usage: python3 scripts/extract-original-routes.py [path-to-original-checkout]

Run this whenever the route map is questioned. It needs the original
repository, so it is a developer tool rather than a CI step: CI has only this
repository. `packages/contract/src/route-map.test.ts` pins the resulting
count so a silent shrink still fails there.

The route-surface snapshot is a hand-maintained list of probes, not an
exhaustive enumeration: it never probed the `google` half of any provider
alternation, `/api/v1/bank/withdraw`, either reward command, `/sitemap.xml`,
`/discord/interactions` or `/media/*`. Anything derived from it is short.

This reads the route modules instead and expands the alternations.
"""

import re
import sys
from itertools import product
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else '/home/ruma/Woldeok-Moneyverse')
ROUTES = sorted((ROOT / 'src' / 'routes').glob('*.ts'))
EXTRA = [
    ROOT / 'src' / 'admin' / 'admin-http.ts',
    ROOT / 'src' / 'content' / 'content-http.ts',
    ROOT / 'src' / 'minecraft' / 'approved-operation-http.ts',
    ROOT / 'src' / 'privacy' / 'privacy-request-http.ts',
]

METHOD_NEAR = re.compile(r"request\.method === '([A-Z]+)'")


def methods_for(text: str, index: int) -> list[str]:
    """Methods mentioned within the statement containing `index`."""
    start = text.rfind('\n\n', 0, index)
    window = text[max(0, start) : index + 400]
    found = METHOD_NEAR.findall(window)
    return sorted(set(found)) or ['GET']


def expand(pattern: str) -> list[str]:
    """Turn a route regex source into concrete paths, expanding alternations."""
    path = pattern
    path = path.strip('/')
    if path.endswith('/i'):
        path = path[:-2]
    path = path.lstrip('^').rstrip('$')
    path = path.replace('\\/', '/')
    # Identifier captures become {id}; the media key keeps its extension shape.
    path = re.sub(r'\(\[0-9a-f-\]\{36\}\\\.\(\?:[^)]+\)\)', '{key}', path)
    path = re.sub(r'\(\[0-9a-f-\]\{36\}\)', '{id}', path)
    path = path.replace('(?:', '(')

    groups: list[list[str]] = []
    def take(match: re.Match[str]) -> str:
        groups.append(match.group(1).split('|'))
        return f'\0{len(groups) - 1}\0'

    # Innermost-first, repeated until stable: the wallet command route nests
    # an alternation inside an alternation.
    results = [path]
    while True:
        expanded = []
        changed = False
        for candidate in results:
            groups.clear()
            replaced = re.sub(r'\(([^()]*\|[^()]*)\)', take, candidate)
            if not groups:
                expanded.append(candidate)
                continue
            changed = True
            for combo in product(*groups):
                result = replaced
                for i, value in enumerate(combo):
                    result = result.replace(f'\0{i}\0', value)
                expanded.append(result)
        results = expanded
        if not changed:
            return results


routes: set[tuple[str, str]] = set()

for source in ROUTES:
    text = source.read_text(encoding='utf-8')
    for m in re.finditer(r"url\.pathname === '([^']+)'", text):
        for method in methods_for(text, m.start()):
            routes.add((method, m.group(1)))
    for m in re.finditer(r"pathname\.match\((/[^;]+?/i?)\)", text):
        for path in expand(m.group(1)):
            for method in methods_for(text, m.start()):
                routes.add((method, path))

# The four sub-dispatchers route by exact string against a prefix constant.
for source in EXTRA:
    if not source.exists():
        continue
    text = source.read_text(encoding='utf-8')
    prefixes = dict(re.findall(r"const ([A-Z_]+_PREFIX) = '([^']+)'", text))
    for name, value in prefixes.items():
        for m in re.finditer(rf"`\$\{{{name}\}}([^`]*)`", text):
            routes.add(('*', value + m.group(1)))
    for m in re.finditer(r"pathname === API_PREFIX", text):
        for name, value in prefixes.items():
            if name == 'API_PREFIX':
                routes.add(('*', value))

for method, path in sorted(routes, key=lambda r: (r[1], r[0])):
    print(f'{method} {path}')
