#!/usr/bin/env python3
"""Compare the exact Next snapshot release with the current Spring/Nginx origin.

QA only: GET/HEAD no cookies and no side effects. Makes no full-frontend claim.
Requires --release-dir to be an immutable frontend-static folder and --snippet
that represents the deployed route allowlist. Avoids Cloudflare HTML injections by
verifying the origin with its expected Host header.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
from pathlib import Path
import re
import sys
import urllib.error
import urllib.request

ROOT = 'http://127.0.0.1'
KNOWN_FALLBACK = ('/dashboard', '/market', '/settings', '/messages', '/leaderboard', '/space')

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        return None

OPENER = urllib.request.build_opener(NoRedirect)

def request(path: str, method='GET', *, referer=None):
    hdr = {'Host': 'easy-scraping.com', 'User-Agent': 'WoldeokFrontendOriginQA/26', 'Accept': 'text/html,application/json;q=0.9,*/*;q=0.1'}
    if referer:
        hdr['Referer'] = referer
    rq = urllib.request.Request(ROOT + path, headers=hdr, method=method)
    try:
        with OPENER.open(rq, timeout=7) as resp:
            return resp.status, resp.headers, resp.read() if method == 'GET' else b''
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read(15000) if method == 'GET' else b''


def audit(release: Path, snippet: Path, check_assets: bool):
    root = release.resolve(strict=True)
    if root.name != 'frontend-static':
        raise ValueError('Require immutable frontend-static release directory')
    manifest = json.loads((root / '_mv-frontend-release.json').read_text())
    build = manifest['sourceBuildId']
    routes = {r['path']: r for r in manifest['anonymousPublicRoutes']}
    if not routes or not isinstance(build, str) or not build:
        raise ValueError('Invalid frontend manifest')

    conf = snippet.read_text()
    location_routes = set(re.findall(r'(?m)^location = (/[A-Za-z0-9/\-]*)\s*\{', conf))
    deployed = {r.rstrip('/') or '/' for r in location_routes}
    unexpected = sorted(deployed - set(routes))
    results = []
    failures = []
    for route, expected in routes.items():
        if route not in deployed:
            results.append({'route': route, 'state': 'UNPROMOTED', 'source': 'manifest-only'})
            continue
        status, headers, raw = request(route)
        same = hashlib.sha256(raw).hexdigest() == expected['sha256']
        tagged = headers.get('X-MV-Frontend-Release') == manifest['version']
        result = {'route': route, 'state': 'LIVE' if status == 200 and same and tagged else 'BROKEN',
                  'http': status, 'releaseHeaderMatches': tagged, 'originHtmlShaMatches': same}
        results.append(result)
        if result['state'] == 'BROKEN':failures.append(route)

    assets = list((root / '_next' / 'static').rglob('*'))
    files = [x for x in assets if x.is_file()]
    asset_failures = []
    if check_assets:
        def check(p):
            relative = p.relative_to(root).as_posix()
            status, h, _ = request('/' + relative, 'HEAD')
            mime = h.get('Content-Type', '')
            expected_type = ('javascript' if p.suffix == '.js' else 'css' if p.suffix == '.css' else None)
            return None if status == 200 and (expected_type is None or expected_type in mime) else (relative, status, mime[:40])
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            asset_failures = [bad for bad in pool.map(check, files) if bad]

    # Confirm the current mixed-era frontend never silently masquerades 6 client routes as independent pages.
    fingerprints = {}
    for route in KNOWN_FALLBACK:
        status, _, raw = request(route)
        fingerprints[route] = {'http': status, 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
    repeated_fallbacks = len({v['sha256'] for v in fingerprints.values() if v['http'] == 200}) == 1

    version_new = request('/frontend-version', referer='https://easy-scraping.com/tools')
    version_legacy = request('/frontend-version', referer='https://easy-scraping.com/dashboard')
    try:
        json_build = json.loads(version_new[2]).get('id')
    except (ValueError, AttributeError):
        json_build = None
    if version_new[0] != 200 or json_build != build or version_legacy[0] != 204:
        failures.append('/frontend-version')

    admin_status = {}
    for route in ('/admin/seo', '/admin/seo-audit'):
        status, headers, _ = request(route)
        admin_status[route] = {'http': status, 'redirectsToLogin': '/login' in headers.get('Location', '')}
        if status != 302 or not admin_status[route]['redirectsToLogin']:
            failures.append(route)

    result = {
        'manifestRouteCount': len(routes), 'deployedRouteCount': len(deployed),
        'liveVerifiedCount': sum(r['state'] == 'LIVE' for r in results),
        'unpromotedCount': sum(r['state'] == 'UNPROMOTED' for r in results),
        'unexpectedNginxRoutes': unexpected,
        'routeResults': results, 'assetsOnDisk': len(files),
        'assetsChecked': len(files) if check_assets else 0,
        'assetFailures': asset_failures[:20],
        'legacyFallbackIdenticalHtml': repeated_fallbacks,
        'legacyFallbackRoutes': list(KNOWN_FALLBACK),
        'versionEndpoint': {'newStatus':version_new[0], 'newIdMatches':json_build == build,
                            'legacyStatus': version_legacy[0]},
        'adminSeoGuestRoutes': admin_status,
        'failures': failures,
        'scope': '13 public source-proven snapshots, NOT entire dynamic authenticated frontend',
    }
    return result

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--release-dir', required=True, type=Path)
    p.add_argument('--snippet', required=True, type=Path)
    p.add_argument('--out', type=Path)
    p.add_argument('--check-assets', action='store_true')
    opts = p.parse_args()
    result = audit(opts.release_dir, opts.snippet, opts.check_assets)
    if opts.out:
        opts.out.write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n')
    print('FRONTEND_V26_ORIGIN_QA',json.dumps({k:v for k,v in result.items() if k not in ('routeResults','assetFailures','legacyFallbackRoutes','adminSeoGuestRoutes')}, ensure_ascii=False))
    for entry in result['routeResults']:
        print('ROUTE',entry['route'],entry['state'])
    if result['assetFailures']:
        for failure in result['assetFailures'][:12]:print('ASSET_FAIL',failure)
    if result['failures'] or result['assetFailures'] or result['unexpectedNginxRoutes']:
        sys.exit(1)
