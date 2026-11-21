#!/usr/bin/env python3
"""A reversible document-only maintenance gate; backend requests keep their original authority."""
import argparse
import fcntl
import hashlib
import html
import json
import os
from pathlib import Path
import re
import subprocess
import time
import urllib.error
import urllib.request

SITE = Path('/etc/nginx/sites-enabled/moneyverse')
MAP = Path('/etc/nginx/conf.d/00-moneyverse-nov18-maintenance-20261121.conf')
GATE = Path('/etc/nginx/snippets/moneyverse-nov18-maintenance-20261121.conf')
ROOT = Path('/var/lib/moneyverse-frontend-rebuild-20261121')
INTERNAL = '/__mv_nov18_frontend_maintenance'
API_PROBES = ['/api/v1/stocks', '/api/v1/auth/me', '/api/v1/admin/me']
DIAGNOSTICS_STAGE = None


def digest(data):
    return hashlib.sha256(data).hexdigest()


def maintenance_html():
    return '''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#0C1020"><title>프론트엔드 긴급 점검 중 · Woldeok Moneyverse</title><link rel="icon" href="/favicon.ico"><style>*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:24px;background:#0C1020;color:#E9F1FF;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.7}main{width:min(100%,720px);padding:clamp(28px,6vw,56px);border:1px solid #9C83FF66;border-radius:24px;background:#151D32;box-shadow:0 24px 80px #0004}.brand{display:flex;align-items:center;gap:14px;font-weight:750}.brand img{width:48px;height:48px;object-fit:contain}.tag{margin:32px 0 12px;color:#9C83FF;font-size:12px;font-weight:750;letter-spacing:.13em}h1{margin:0 0 20px;font-size:clamp(25px,5vw,36px);line-height:1.4;overflow-wrap:anywhere}p{margin:0;color:#A8BCD8}.english{margin-top:20px;padding-top:20px;border-top:1px solid #A8BCD833;font-size:14px}.status{display:inline-flex;align-items:center;gap:9px;margin-top:30px;font-size:13px;color:#64B7FF}.dot{width:8px;height:8px;border-radius:50%;background:#64B7FF}@media(max-width:360px){body{padding:14px}main{padding:25px 20px}}</style></head><body><main><div class="brand"><img src="/favicon.ico" alt=""><span>Woldeok Moneyverse</span></div><div class="tag">SERVICE MAINTENANCE</div><h1>프론트엔드 긴급 점검 중</h1><p>화면을 새롭게 정비하고 있습니다.<br>잠시 후 다시 접속해 주세요.</p><p class="english" lang="en">The website is temporarily under maintenance.<br>Please check back later.</p><div class="status"><span class="dot" aria-hidden="true"></span><span>이용에 불편을 드려 죄송합니다.</span></div></main></body></html>'''


def quoted(value):
    return json.dumps(value, ensure_ascii=False).replace('$', r'\$')


def render_map(frontend_paths, dynamic_patterns=()):
    entries = []
    for path in sorted(set(frontend_paths)):
        if not path.startswith('/') or path.startswith(('/api/', '/app-api/', '/auth/')):
            raise ValueError('Only inventoried frontend paths may be exact document matches')
        entries.append('    ' + quoted(path) + ' 1;')
    for pattern in sorted(set(dynamic_patterns)):
        entries.append('    ' + json.dumps('~' + pattern, ensure_ascii=False) + ' 1;')
    return '''map $http_accept $mv_nov18_maintenance_accept {
    default 0;
    ~*text/html 1;
}
map $uri $mv_nov18_maintenance_document {
    volatile;
    default $mv_nov18_maintenance_accept;
''' + '\n'.join(entries) + '''
    ~^/(?:api|app-api|auth|seo|socket\\.io|health|actuator|v3/api-docs|integrations)(?:/|$) 0;
    ~^/(?:__mv|_mv|assets|_next|css|js|images|fonts|uploads)(?:/|_|$) 0;
    ~^/(?:favicon\\.ico|apple-touch-icon\\.png|robots\\.txt|sitemap[^/]*\\.xml|feed\\.xml|rss\\.xml)$ 0;
}
map "$server_name:$remote_addr" $mv_nov18_maintenance_scope {
    default 1;
    ~^test\\.easy-scraping\\.com:(?!127\\.0\\.0\\.1$|::1$) 0;
}
map "$mv_nov18_maintenance_document:$mv_nov18_maintenance_scope" $mv_nov18_maintenance_gate {
    default 0;
    "1:1" 1;
}
'''


def render_gate(page):
    return '''if ($mv_nov18_maintenance_gate) { rewrite ^ ''' + INTERNAL + ''' last; }
location = ''' + INTERNAL + ''' {
    internal;
    default_type text/html;
    charset utf-8;
    add_header Cache-Control "private, no-store, max-age=0" always;
    add_header Retry-After "300" always;
    add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
    add_header X-MV-Frontend-Maintenance "nov18-20261121" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Content-Security-Policy "default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" always;
    return 503 ''' + quoted(page) + ''';
}
'''


def patch_site(before, snippet, test_only=False):
    if 'include ' + snippet + ';' in before:
        raise ValueError('Maintenance include already exists')
    production = '    listen 80 default_server;\n'
    test_start = 'server { listen 80; listen [::]:80; server_name test.easy-scraping.com;\n'
    if before.count(production) != 1 or before.count(test_start) != 1:
        raise ValueError('The two expected frontend servers are not unique')
    start = before.index(test_start) + len(test_start)
    end = before.find('location ', start)
    header = before[start:end]
    guards = [line for line in header.splitlines(keepends=True) if 'if ($http_cf_connecting_ip' in line and 'return 403;' in line]
    if len(guards) != 1 or 'deny all;' not in header:
        raise ValueError('Protected Test admission guards are missing')
    anchor = test_start + header
    guarded = anchor + '    include ' + snippet + ';\n'
    after = before.replace(anchor, guarded, 1)
    if not test_only:
        after = after.replace(production, production + '    include ' + snippet + ';\n', 1)
    return after


def collect_routes(repo):
    exact = {'/', '/index.html'}
    dynamic = set()
    tracked = subprocess.check_output(['git', '-c', 'safe.directory=' + str(repo), '-C', str(repo), 'ls-tree', '-r', '--name-only', 'HEAD', 'frontend/src/app', 'spring-backend/src/main/resources/static'], text=True).splitlines()
    for relative in tracked:
        if not relative.startswith('frontend/src/app/') or not relative.endswith('/page.tsx'):
            continue
        pieces = [p for p in Path(relative).relative_to('frontend/src/app').parts[:-1] if not p.startswith('(')]
        if any(p.startswith('[') for p in pieces):
            pattern = '^/' + '/'.join('(?:en|ko|ja|zh|vi)' if p == '[locale]' else '[^/]+' if p.startswith('[') else re.escape(p) for p in pieces) + '/?$'
            dynamic.add(pattern)
        else:
            path = '/' + '/'.join(pieces)
            exact.update({path, path.rstrip('/') + '/'})
    for tracked_path in tracked:
        if not tracked_path.startswith('spring-backend/src/main/resources/static/') or not tracked_path.endswith('.html'):
            continue
        relative = tracked_path.removeprefix('spring-backend/src/main/resources/static/')
        if relative.split('/')[0] in {'assets', '_next', 'css', 'js', 'images'}:
            continue
        exact.add('/' + relative)
        canonical = '/' + relative.removesuffix('.html')
        exact.update({canonical, canonical + '/'})
        if canonical.endswith('/index'):
            exact.add(canonical[:-6] or '/')
    return sorted(exact), sorted(dynamic)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def probe(path, host='easy-scraping.com', accept='application/json'):
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    request = urllib.request.Request('http://127.0.0.1' + path, headers={'Host': host, 'Accept': accept})
    try:
        response = opener.open(request, timeout=8)
    except urllib.error.HTTPError as error:
        response = error
    body = response.read(2_000_000)
    return {'status': response.status, 'type': response.headers.get('Content-Type', ''),
            'maintenance': response.headers.get('X-MV-Frontend-Maintenance') == 'nov18-20261121',
            'noStore': 'no-store' in response.headers.get('Cache-Control', ''),
            'retryAfter': response.headers.get('Retry-After'),
            'messagePresent': '프론트엔드 긴급 점검 중'.encode() in body}


def atomic(path, data, mode=0o644, replace=True, expected=None):
    temporary = path.with_name(path.name + '.nov18-pending')
    identity = None
    try:
        with open(temporary, 'xb') as output:
            identity = (os.fstat(output.fileno()).st_dev, os.fstat(output.fileno()).st_ino)
            output.write(data)
            output.flush()
            os.fsync(output.fileno())
        os.chmod(temporary, mode)
        if expected is not None and digest(path.read_bytes()) != expected:
            raise ValueError('Compare-and-swap target changed before install')
        if replace:
            os.replace(temporary, path)
        else:
            os.link(temporary, path)
            temporary.unlink()
    finally:
        if identity is not None and temporary.exists():
            current = temporary.lstat()
            if (current.st_dev, current.st_ino) == identity:
                temporary.unlink()


def nginx(action):
    command = ['/usr/sbin/nginx', '-t'] if action == 'test' else ['systemctl', 'reload', 'nginx']
    result = subprocess.run(command, capture_output=True, text=True)
    if DIAGNOSTICS_STAGE is not None:
        log = DIAGNOSTICS_STAGE / ('nginx-' + action + '-' + str(time.time_ns()) + '.log')
        atomic(log, (result.stdout + result.stderr).encode(), 0o600, False)
    if result.returncode:
        raise RuntimeError('Nginx ' + action + ' failed; protected diagnostics retained')


def stage_path(value):
    stage = Path(value).resolve()
    if stage.parent != ROOT or stage.name.startswith('.'):
        raise ValueError('Stage must be an explicit child of the approved maintenance root')
    return stage


def prepare(repo, stage):
    if os.geteuid() != 0:
        raise PermissionError('Root-owned protected maintenance staging is required')
    if SITE.is_symlink() or SITE.stat().st_uid != 0:
        raise ValueError('Unexpected ownership or symlink at the fixed site path')
    if MAP.exists() or GATE.exists():
        raise ValueError('Owned maintenance configuration paths already exist')
    ROOT.mkdir(mode=0o700, exist_ok=True)
    if ROOT.stat().st_uid != 0 or ROOT.stat().st_mode & 0o077:
        raise PermissionError('Maintenance parent must remain root-owned and private')
    for relative in ['ops/nov18-frontend-maintenance/maintenance.py', 'ops/nov18-frontend-maintenance/test_maintenance.py']:
        committed = subprocess.check_output(['git', '-c', 'safe.directory=' + str(repo), '-C', str(repo), 'show', 'HEAD:' + relative])
        if committed != (repo / relative).read_bytes():
            raise ValueError('Maintenance source is not committed at the reviewed revision')
    stage.mkdir(mode=0o700)
    original = SITE.read_bytes()
    exact, dynamic = collect_routes(repo)
    files = {'map.conf': render_map(exact, dynamic).encode(), 'gate.conf': render_gate(maintenance_html()).encode(),
             'site.before': original, 'site.test': patch_site(original.decode(), str(GATE), test_only=True).encode(),
             'site.after': patch_site(original.decode(), str(GATE)).encode()}
    for name, data in files.items():
        (stage / name).write_bytes(data)
    runner = Path(__file__).read_bytes()
    atomic(stage / 'runner.py', runner, 0o600, False)
    source = subprocess.check_output(['git', '-c', 'safe.directory=' + str(repo), '-C', str(repo), 'rev-parse', 'HEAD'], text=True).strip()
    baseline = {path: probe(path) for path in API_PROBES}
    manifest = {'source': source, 'siteBefore': digest(original), 'files': {name: digest(data) for name, data in files.items()},
                'script': digest(runner), 'testScript': digest((repo / 'ops/nov18-frontend-maintenance/test_maintenance.py').read_bytes()),
                'routeInventory': digest(json.dumps({'exact': exact, 'dynamic': dynamic}, sort_keys=True).encode()),
                'siteMode': SITE.stat().st_mode & 0o777, 'repository': str(repo), 'committedMaintenanceSource': True,
                'apiBefore': baseline, 'frontendBefore': probe('/', accept='text/html'), 'exactRoutes': exact, 'dynamicPatterns': dynamic}
    (stage / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    return {'stage': str(stage), 'source': source, 'exactRouteCount': len(exact), 'dynamicPatternCount': len(dynamic), 'siteBefore': manifest['siteBefore']}


def validate_stage(stage):
    if os.geteuid() != 0 or stage.stat().st_uid != 0 or stage.stat().st_mode & 0o022:
        raise PermissionError('Maintenance stage must be root-owned and non-writable by others')
    if ROOT.stat().st_uid != 0 or ROOT.stat().st_mode & 0o077:
        raise PermissionError('Maintenance parent is no longer private')
    manifest = json.loads((stage / 'manifest.json').read_text())
    if set(manifest['files']) != {'map.conf', 'gate.conf', 'site.before', 'site.test', 'site.after'} or manifest['files']['site.before'] != manifest['siteBefore']:
        raise ValueError('Manifest baseline invariants differ')
    if digest(Path(__file__).read_bytes()) != manifest['script']:
        raise ValueError('Reviewed maintenance script changed')
    for name, expected in manifest['files'].items():
        if digest((stage / name).read_bytes()) != expected:
            raise ValueError('Staged artifact changed: ' + name)
    return manifest


def rollback_files(stage, manifest, allow_partial=False):
    expected = manifest['files']['site.after']
    current = digest(SITE.read_bytes())
    allowed = {expected, manifest['siteBefore'], manifest['files']['site.test']} if allow_partial else {expected}
    if current not in allowed:
        raise ValueError('Site changed after apply; refusing a destructive inverse')
    for target, name in [(MAP, 'map.conf'), (GATE, 'gate.conf')]:
        if target.exists():
            if digest(target.read_bytes()) != manifest['files'][name]:
                raise ValueError('Owned include changed; refusing to remove another update')
        elif not allow_partial:
            raise ValueError('Owned include disappeared after apply')
    if current != manifest['siteBefore']:
        atomic(SITE, (stage / 'site.before').read_bytes(), manifest.get('siteMode', 0o644), True, current)
    for target in [MAP, GATE]:
        if target.exists():
            target.unlink()
    nginx('test')
    nginx('reload')


def apply(stage):
    global DIAGNOSTICS_STAGE
    manifest = validate_stage(stage)
    DIAGNOSTICS_STAGE = stage
    if digest(SITE.read_bytes()) != manifest['siteBefore'] or MAP.exists() or GATE.exists():
        raise ValueError('Current Nginx state differs from the reviewed proposal')
    nginx('test')
    try:
        atomic(MAP, (stage / 'map.conf').read_bytes(), 0o644, False)
        atomic(GATE, (stage / 'gate.conf').read_bytes(), 0o644, False)
        atomic(SITE, (stage / 'site.test').read_bytes(), manifest.get('siteMode', 0o644), True, manifest['siteBefore'])
        nginx('test')
        nginx('reload')
        test_deadline = time.monotonic() + 10
        while True:
            test_state = probe('/', host='test.easy-scraping.com', accept='text/html')
            if test_state['status'] == 503 and test_state['maintenance'] and test_state['messagePresent']:
                break
            if time.monotonic() >= test_deadline:
                raise RuntimeError('Isolated Test maintenance did not become ready')
            time.sleep(.1)
        production_before = probe('/', accept='text/html')
        if production_before['maintenance'] or production_before['status'] != manifest['frontendBefore']['status']:
            raise RuntimeError('Production changed during Test-only validation')
        api_after_test = {path: probe(path) for path in API_PROBES}
        for path, old in manifest['apiBefore'].items():
            if api_after_test[path]['status'] != old['status'] or api_after_test[path]['type'] != old['type'] or api_after_test[path]['maintenance']:
                raise RuntimeError('API boundary changed during isolated Test')
        atomic(stage / 'test-receipt.json', json.dumps({'test': test_state, 'productionStillOriginal': production_before, 'apiAfterTest': api_after_test}).encode(), 0o600, False)
        atomic(SITE, (stage / 'site.after').read_bytes(), manifest.get('siteMode', 0o644), True, manifest['files']['site.test'])
        nginx('test')
        nginx('reload')
        deadline = time.monotonic() + 10
        while True:
            state = probe('/', accept='text/html')
            if state['status'] == 503 and state['maintenance'] and state['messagePresent']:
                break
            if time.monotonic() >= deadline:
                raise RuntimeError('Maintenance did not become ready')
            time.sleep(.1)
        pages = {}
        for path in manifest['exactRoutes']:
            value = probe(path, accept='text/html')
            if value['status'] != 503 or not value['maintenance'] or not value['messagePresent']:
                raise RuntimeError('Document maintenance verification failed for an inventoried route')
            pages[path] = value
        after = {path: probe(path) for path in API_PROBES}
        for path, old in manifest['apiBefore'].items():
            if after[path]['status'] != old['status'] or after[path]['type'] != old['type'] or after[path]['maintenance']:
                raise RuntimeError('Backend response boundary changed')
        receipt = {'source': manifest['source'], 'maintenance': True, 'pageCount': len(pages), 'apiBefore': manifest['apiBefore'], 'apiAfter': after,
                   'testLocal': probe('/', host='test.easy-scraping.com', accept='text/html'),
                   'nginxSiteAfter': digest(SITE.read_bytes()), 'frontendUnitsStopped': False}
        (stage / 'apply-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
        return receipt
    except Exception as failure:
        receipt = {'applyErrorType': type(failure).__name__, 'rollbackSucceeded': False}
        try:
            rollback_files(stage, manifest, allow_partial=True)
            receipt['rollbackSucceeded'] = True
        finally:
            atomic(stage / ('failure-' + str(time.time_ns()) + '.json'), json.dumps(receipt).encode(), 0o600, False)
        raise


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['prepare', 'apply'])
    parser.add_argument('--stage', required=True)
    parser.add_argument('--repo', default=str(Path(__file__).resolve().parents[2]))
    args = parser.parse_args()
    stage = stage_path(args.stage)
    if args.action == 'prepare':
        result = prepare(Path(args.repo).resolve(), stage)
    else:
        ROOT.mkdir(mode=0o700, exist_ok=True)
        with open(ROOT / 'maintenance.lock', 'a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            result = apply(stage)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
