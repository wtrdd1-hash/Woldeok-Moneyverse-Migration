#!/usr/bin/env python3
"""Export APPROVED, anonymous public Next page HTML + immutable browser assets for Spring.

Run Next only on loopback during capture. Never use this for private/admin/financial
transactions; Next SSR and Server Actions do not become Java endpoints by snapshotting.
"""
import argparse
import hashlib
import http.client
import json
import os
import re
import shutil
from pathlib import Path

PUBLIC_ROUTES = (
    '/', '/tools', '/calculators', '/blog', '/guide', '/features',
    '/gallery', '/announcements', '/roadmap', '/newspaper', '/safety',
    '/privacy', '/terms', '/search',
    '/tools/compound-calculator', '/tools/stock-calculator',
    '/tools/real-estate-calculator', '/tools/tax-calculator',
)


def main():
    a = argparse.ArgumentParser()
    a.add_argument('--frontend', required=True)
    a.add_argument('--out', required=True)
    a.add_argument('--preview-port', type=int, required=True)
    opts = a.parse_args()
    frontend = Path(opts.frontend).resolve(strict=True)
    out = Path(opts.out)
    assert not out.exists(), 'Immutable frontend release must not be overwritten'
    assert opts.preview_port in range(1024, 65536)
    next_static = frontend / '.next/static'
    public = frontend / 'public'
    assert (frontend / '.next/BUILD_ID').is_file() and next_static.is_dir()
    out.mkdir(parents=True, mode=0o755)
    try:
        shutil.copytree(next_static, out / '_next/static', symlinks=False)
        for file in public.iterdir():
            if file.is_symlink() or file.name.startswith('.'):
                raise ValueError('Unexpected symlink or hidden public item: '+file.name)
            dst = out / file.name
            if file.is_dir(): shutil.copytree(file, dst, symlinks=False)
            elif file.is_file(): shutil.copy2(file, dst)
        records = []
        for route in PUBLIC_ROUTES:
            assert not any(part in route for part in ('/api','/admin','/wallet','/support','/chat','/login','/register','/account'))
            connection = http.client.HTTPConnection('127.0.0.1', opts.preview_port, timeout=12)
            connection.request('GET', route, headers={
                'Host':'easy-scraping.com',
                'X-Forwarded-Proto':'https',
                'User-Agent':'SpringPublicBuildSnapshot/2026.11.18.24',
                'Accept':'text/html',
            })
            response = connection.getresponse()
            content = response.read(1_000_001)
            status = response.status
            mime = response.getheader('Content-Type','')
            connection.close()
            if status != 200 or len(content) > 1_000_000 or 'text/html' not in mime:
                raise RuntimeError('Public capture failed for '+route+': HTTP '+str(status))
            if not content.startswith(b'<!DOCTYPE html>') and not content.startswith(b'<!doctype html>'):
                raise RuntimeError('Missing HTML document for '+route)
            if b'/_next/static/' not in content or b'<title' not in content:
                raise RuntimeError('Missing Next frontend assets or title for '+route)
            if any(s in content for s in (b'INTERNAL_API_TOKEN=', b'mv_session=', b'private_key')):
                raise RuntimeError('Potential sensitive template data: '+route)
            target = out / (route.lstrip('/') or '.') / 'index.html'
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(content)
            records.append({'path':route,'bytes':len(content),'sha256':hashlib.sha256(content).hexdigest()})
            print('CAPTURED',route,status,len(content))
        # Every referenced webpack chunk must resolve in the versioned static bundle.
        for record in records:
            html = (out / (record['path'].lstrip('/') or '.') / 'index.html').read_text()
            assets = set(re.findall(r'/_next/static/[A-Za-z0-9_./%+\-]+',html))
            for asset in assets:
                if not (out / asset.lstrip('/')).is_file():
                    raise RuntimeError('Missing referenced frontend asset for '+record['path']+': '+asset)
        manifest = {
            'version':'v2026.11.18.24',
            'sourceBuildId':(frontend / '.next/BUILD_ID').read_text().strip(),
            'anonymousPublicRoutes':records,
            'authOrTransactionsCaptured':False,
            'nextRuntimeRequiredForUncapturedDynamicRoutes':True,
        }
        (out / '_mv-frontend-release.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
        for dirpath, dirs, files in os.walk(out):
            Path(dirpath).chmod(0o755)
            for name in files: (Path(dirpath)/name).chmod(0o644)
        print('RELEASE_VALIDATED routes=',len(records),'files=',sum(len(files) for _,_,files in os.walk(out)))
    except BaseException:
        # Never leave an incompletely captured release named as immutable/ready.
        shutil.rmtree(out)
        raise

if __name__ == '__main__':main()
