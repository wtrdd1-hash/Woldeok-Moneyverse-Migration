#!/usr/bin/env python3
"""Read-only post-promotion QA: SEO-only frontend and original app coexist.

No administrator secrets, production login, external provider requests or
mutation calls. Source of truth is real local Nginx and both Next workers.
"""
import json
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

SHA='20daef3f6f254f6a0e5b085756a08d4d0d874c9c'
REL=Path('/srv/moneyverse-data/releases/seo-v2026.11.17.3-20daef3f6f/frontend')
BASES={'edge':'http://127.0.0.1','legacy':'http://127.0.0.1:4501','candidate':'http://127.0.0.1:4521'}
results=[]

def get(which,path):
    req=Request(BASES[which]+path,headers={'Host':'easy-scraping.com','X-Forwarded-Proto':'https','Accept':'application/json'})
    try:
        with urlopen(req,timeout=9) as r: return r.status,r.read(1500000),{k.lower():v for k,v in r.headers.items()}
    except HTTPError as e: return e.code,e.read(50000),{k.lower():v for k,v in e.headers.items()}

def record(name,condition,detail=''):
    results.append((name,bool(condition),detail))
    print(('PASS' if condition else 'FAIL')+' '+name+(' '+str(detail) if detail else ''))

try:
    status,data,headers=get('candidate','/frontend-version')
    record('exact-SHA candidate build',status==200 and json.loads(data).get('id')==SHA)
    old_status,old_data,_=get('legacy','/frontend-version')
    edge_status,edge_data,_=get('edge','/frontend-version')
    record('non-SEO homepage remains old frontend', old_status==200 and edge_status==200 and old_data==edge_data and json.loads(old_data).get('id')!=SHA)
    for which in ('edge','candidate'):
        status,body,_=get(which,'/api/seo/status')
        v=json.loads(body)
        record(which+' honest crawler public schema',status==200 and isinstance(v.get('totalHits24h'),int)
            and isinstance(v.get('botDistribution'),dict) and 'healthyPercent' not in v
            and 'recentLogs' not in v and 'indexNowKey' not in v)
    for path in ('/admin/seo','/admin/seo-audit','/api/admin/seo-audit',
                 '/api/admin/seo/status','/api/admin/seo/indexing-submit',
                 '/api/admin/seo/gsc-sitemap-submit','/api/indexnow'):
        status,_,headers=get('edge',path)
        record('edge anonymous denied '+path,status in (401,403)
            and headers.get('x-moneyverse-seo-frontend')=='v2026.11.17.3'
            and 'no-store' in headers.get('cache-control','')
            and 'noindex' in headers.get('x-robots-tag',''),str(status))
    for path in ('/api/admin/seo/status','/api/admin/seo-audit'):
        status,_,_=get('candidate',path)
        record('candidate human-admin BFF refused '+path,status in (401,403),str(status))
    for path in ('/admin/seo','/admin/seo-audit'):
        status,body,_=get('candidate',path)
        text=body.decode('utf-8','replace')
        record('candidate SSR page redirects anonymous '+path,status in (200,307,308)
            and 'login_required' in text and 'NEXT_REDIRECT' in text
            and '실측 연동 미검증' not in text and '651건' not in text)
    new='/_next/static/chunks/1479-e7fff652a81712e1.js'
    status,new_body,headers=get('edge',new)
    record('v3 static asset exact bytes',status==200
        and new_body==(REL/'.next/static/chunks/1479-e7fff652a81712e1.js').read_bytes()
        and headers.get('x-moneyverse-static-source')=='seo-v3')
    candidate=REL/'.next/static'
    old_static=Path('/srv/moneyverse-data/releases/production-current/frontend/.next/static')
    old_file=next((f for f in old_static.rglob('*.js') if f.is_file() and not (candidate/f.relative_to(old_static)).exists()),None)
    if old_file:
        old_uri='/_next/static/'+str(old_file.relative_to(old_static))
        status,data,_=get('edge',old_uri)
        record('legacy JS still serves old build',status==200 and data==old_file.read_bytes())
    else:
        record('legacy JS still serves old build',False,'no fixture')
    for which in ('edge','candidate'):
        status,key,_=get(which,'/.well-known/indexnow.key')
        record('canonical IndexNow key readable '+which,status==200 and len(key)>10)
    _,edge_key,_=get('edge','/.well-known/indexnow.key')
    _,candidate_key,_=get('candidate','/.well-known/indexnow.key')
    record('public IndexNow key parity',edge_key==candidate_key)
    for path in ('/','/login','/tools','/stocks'):
        status,_,_=get('edge',path)
        record('unmodified public route '+path,status in (200,301,302,307,308),str(status))
    for name,url in (('Nest backend','http://127.0.0.1:4500/health'),('Spring backend','http://127.0.0.1:4550/health')):
        with urlopen(url,timeout=5) as r: status=r.status
        record(name+' healthy',status==200)
except Exception as exc:
    print('ERROR limited QA: '+type(exc).__name__+': '+str(exc),file=sys.stderr)
    sys.exit(2)
fail=[r for r in results if not r[1]]
print(f'RESULT={"PASS" if not fail else "FAIL"} ({len(results)-len(fail)}/{len(results)} read-only checks)')
if fail:sys.exit(1)
