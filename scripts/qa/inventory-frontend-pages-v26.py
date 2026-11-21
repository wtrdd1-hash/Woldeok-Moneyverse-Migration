#!/usr/bin/env python3
"""Inventory all Next page.tsx files and compare guest GET against Spring origin.

This inventory is source/file and anonymous-HTTP evidence only. A 200 old HTML
must never certify a dynamic route, member session, financial page or mobile UI.
"""
import argparse
from collections import Counter
import concurrent.futures
import hashlib
import json
from pathlib import Path
import re
import urllib.error
import urllib.request

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):return None

OPENER=urllib.request.build_opener(NoRedirect)

def route(path:Path,app:Path):
    segments=list(path.relative_to(app).parts[:-1])
    segments=[s for s in segments if not (s.startswith('(') and s.endswith(')')) and not s.startswith('@')]
    return '/'+'/'.join(segments) if segments else '/'

def page_info(path:Path,app:Path):
    txt=path.read_text(encoding='utf-8-sig')
    url=route(path,app)
    return {'route':url,'source':path.relative_to(app.parent.parent).as_posix(),
            'parameterized': '[' in url or ']' in url,
            'memberAuthMentioned':bool(re.search(r'\b(requireMember|requireSession|requireUser|currentViewer|currentSession)\b',txt)),
            'adminAuthMentioned':bool(re.search(r'\b(requireAdmin|requireAdministrator|adminRoles)\b',txt)),
            'dynamicRendererDeclared':bool(re.search(r"export\s+const\s+dynamic\s*=\s*['\"]force-dynamic",txt)),
            'usesServerData':bool(re.search(r'\b(apiOrNull|publicApi|fetch\(|requireMember|currentViewer)\b',txt)),
            'isClientSource':bool(re.search(r"^['\"]use client['\"];?",txt)),
            'status':'NOT_CHECKED'}

def fetch(entry,root):
    item=dict(entry)
    if item['parameterized'] or '/_not-found' in item['route']:
        item['status']='PARAMETERIZED_NO_FIXTURE'
        return item
    url=root+item['route'];req=urllib.request.Request(url,headers={'Host':'easy-scraping.com','User-Agent':'Woldeok-Frontend-Guest-Inventory/26','Accept':'text/html'})
    try:
        with OPENER.open(req,timeout=7) as r: status=r.status;raw=r.read(600000);h=r.headers
    except urllib.error.HTTPError as e:status=e.code;raw=e.read(5000);h=e.headers
    except Exception as e:
        item['status']='ERROR_'+type(e).__name__
        return item
    release=h.get('X-MV-Frontend-Release')
    contenttype=h.get('Content-Type','')
    item.update({'http':status,'frontendRelease':release or None,'contentType':contenttype.split(';')[0]})
    if status==200 and 'text/html' in contenttype:
        item['htmlSha256']=hashlib.sha256(raw).hexdigest()
        item['responseBytes']=len(raw)
    item['status']='V24_RELEASE' if release=='v2026.11.18.24' else 'LEGACY_OR_OTHER'
    return item

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--frontend',required=True,type=Path);p.add_argument('--out',required=True,type=Path);p.add_argument('--base',default='http://127.0.0.1');p.add_argument('--public-out',type=Path);args=p.parse_args()
    app=args.frontend/'src/app';pages=sorted(app.rglob('page.tsx'))
    source=[page_info(p,app) for p in pages]
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(lambda i:fetch(i,args.base),source))
    # A valid existing route never proves the corresponding dedicated page if its HTML is shared with generic legacy SPA home.
    hashes=Counter(e.get('htmlSha256') for e in results if e.get('http')==200 and e.get('htmlSha256'))
    for item in results:
        if item['status']=='LEGACY_OR_OTHER' and item.get('http')==200 and hashes[item.get('htmlSha256')]>1:
            item['identicalLegacyHtmlAmongPages']=True
    overview={'pageComponentFiles':len(source),'uniqueSourceRoutes':len(set(p['route'] for p in source)),
              'guestGetAttempted':sum(not p['parameterized'] for p in source),
              'parameterizedSkipped':sum(p['parameterized'] for p in source),
              'v24MarkedGuestRoutes':sum(p['status']=='V24_RELEASE' for p in results),
              'sourceAuthMentions':sum(p['memberAuthMentioned'] or p['adminAuthMentioned'] for p in results),
              'clientSourceCount':sum(p['isClientSource'] for p in results),
              'statusCounts':dict(Counter(str(p.get('http',p['status'])) for p in results)),
              'identicalLegacyHtmlCount':sum(bool(p.get('identicalLegacyHtmlAmongPages')) for p in results),
              'limitations':'No authenticated E2E, parameterized fixtures, real click/hydration or finance writes.'}
    out={'version':'v2026.11.18.26','evidence':'MiniPC public Nginx origin GET guest only','overview':overview,'routes':results}
    args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
    if args.public_out:
        # Public artifact is route coverage only. Strip responses/hashes/body data.
        safe_fields=('route','source','parameterized','memberAuthMentioned',
                     'adminAuthMentioned','dynamicRendererDeclared','usesServerData',
                     'isClientSource','status','http','frontendRelease','contentType',
                     'identicalLegacyHtmlAmongPages')
        public={'version':out['version'], 'coverage':overview,
                'routes':[{k:item[k] for k in safe_fields if k in item} for item in results]}
        args.public_out.parent.mkdir(parents=True,exist_ok=True)
        args.public_out.write_text(json.dumps(public,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(overview,ensure_ascii=False))
    for item in results:
        if item.get('identicalLegacyHtmlAmongPages'):
            print('LEGACY_IDENTICAL_HTML',item['route'],item.get('http'))
