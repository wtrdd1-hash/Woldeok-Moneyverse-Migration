#!/usr/bin/env python3
"""Read-only post-promotion checks against the actual local production ingress.

Safe: no auth cookies, POSTs, external submissions, database writes or secrets.
"""
import json
import sys
from urllib.error import HTTPError
from urllib.request import Request, urlopen

failures=[]
checks=[]
def req(port, path, host=None):
    headers={'Accept':'application/json'}
    if host:
        headers.update({'Host':host,'X-Forwarded-Proto':'https'})
    request=Request(f'http://127.0.0.1:{port}{path}',headers=headers)
    try:
        with urlopen(request,timeout=8) as response:
            return response.status,response.read(65536),dict(response.headers.items())
    except HTTPError as exc:
        return exc.code,exc.read(4096),dict(exc.headers.items())

def check(label, ok, detail=''):
    checks.append((label,ok,detail))
    if not ok: failures.append(label+': '+detail)

node_status, node_body,_=req(4400,'/api/v1/seo/status')
public_status,public_body,_=req(80,'/api/seo/status','easy-scraping.com')
check('gateway public status',node_status==200 and b'totalHits24h' in node_body,f'{node_status}')
check('production Next public telemetry',public_status==200 and b'totalHits24h' in public_body,f'{public_status}')
if node_status==200:
    payload=json.loads(node_body)
    check('no Spring mock fields or raw private records',not any(x in payload for x in ('healthyPercent','totalCrawls','recentLogs','ipAddress','indexNowKey')),','.join(payload))
for path in ('/api/v1/seo/status/admin','/api/v1/seo/gsc/analytics','/api/v1/seo/crawl-audit'):
    status,_,_=req(4400,path)
    check('backend unauthorized '+path,status in (401,403),str(status))
for path in ('/admin/seo','/admin/seo-audit','/api/admin/seo-audit'):
    status,_,_=req(80,path,'easy-scraping.com')
    # 503 is a correctly fail-closed authority outage, not a successful login.
    check('edge denied '+path,status in (401,403,503),str(status))
status,key_gateway,_=req(4400,'/.well-known/indexnow.key')
code,key_public,_=req(80,'/.well-known/indexnow.key','easy-scraping.com')
check('canonical key parity',status==200 and code==200 and bool(key_gateway) and key_gateway==key_public,f'{status}/{code}')
for port,path,label in ((80,'/','homepage'),(4500,'/health','Node backend'),(4550,'/health','Spring backend')):
    status,_,_=req(port,path,'easy-scraping.com' if port==80 else None)
    check(label,status==200,str(status))
for label,ok,detail in checks: print(('PASS' if ok else 'FAIL')+' '+label+' '+detail)
print('RESULT='+('PASS' if not failures else 'FAIL')+f' ({len(checks)-len(failures)}/{len(checks)} independent read-only checks)')
if failures: sys.exit(1)
