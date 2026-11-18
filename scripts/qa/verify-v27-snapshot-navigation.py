#!/usr/bin/env python3
"""Verify Spring-served v24 snapshots use one v27 native-nav guard, not broken RSC.

No login, no money writes. Compare the pre-filter source hash after removing the
single intentional Nginx HTML insertion; every other byte must remain immutable.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import urllib.error
import urllib.request
from pathlib import Path

TAG=b'<script defer src="/_mv/static-navigation-v27.js"></script>'


def probe(base, path, rsc=False):
    headers={'Host':'easy-scraping.com','User-Agent':'MoneyverseSourceParity-V27/1','Accept':'text/x-component' if rsc else 'text/html'}
    if rsc: headers['RSC']='1'
    req=urllib.request.Request(base+path+('?_rsc=v27qa' if rsc else ''),headers=headers)
    try:
        with urllib.request.urlopen(req,timeout=8) as r:
            return r.status,r.headers,r.read(700000)
    except urllib.error.HTTPError as e:return e.code,e.headers,e.read(5000)


def main():
    ap=argparse.ArgumentParser();ap.add_argument('--release-dir',type=Path,required=True);ap.add_argument('--base',default='http://127.0.0.1');args=ap.parse_args()
    release=args.release_dir.resolve(strict=True)
    manifest=json.loads((release/'_mv-frontend-release.json').read_text())
    source={r['path']:r for r in manifest['anonymousPublicRoutes']}
    expected=('/', '/tools', '/calculators', '/guide','/features','/roadmap','/safety','/privacy','/terms',
              '/tools/compound-calculator','/tools/stock-calculator','/tools/real-estate-calculator','/tools/tax-calculator')
    assert len(expected)==13 and all(p in source for p in expected)
    issues=[]
    for path in expected:
        code,headers,raw=probe(args.base,path)
        matched=(code==200 and raw.count(TAG)==1 and
                 hashlib.sha256(raw.replace(TAG,b'')).hexdigest()==source[path]['sha256'] and
                 headers.get('X-MV-Frontend-Release')==manifest['version'])
        print('HTML_V27',path,code,'INJECTION',raw.count(TAG),'ORIGINAL_SHA_OK',matched)
        if not matched:issues.append(path)
        flight,flight_headers,flight_body=probe(args.base,path,True)
        if flight!=204 or flight_body:issues.append(path+'_RSC')
    code,headers,body=probe(args.base,'/_mv/static-navigation-v27.js')
    guard_ok=code==200 and 'javascript' in headers.get('Content-Type','') and b'__mvStaticSnapshotNativeNavigation' in body
    print('SCRIPT_VERIFIED',guard_ok,'RAW_BYTES',len(body))
    if not guard_ok:issues.append('static-js')
    print('SUMMARY',json.dumps({'snapshotHtmlChecked':len(expected),'rscNoHtmlChecked':len(expected),'failures':issues}))
    assert not issues

if __name__=='__main__':main()
