"""Exact configuration changes for the already-authored public presentation."""
from pathlib import Path
import re

PUBLIC=('/', '/index.html','/tools','/calculators','/tools/compound-calculator','/tools/stock-calculator')
AUTH=tuple('/'+page+suffix for page in ('login','login/providers','register','forgot-password','reset-password','verify-email','verify-email-change','account-deletion') for suffix in ('','/','.html','/index.html'))
PAGES=PUBLIC+AUTH+('/frontend-version','/frontend-ui-version')
UNITS={'test':'moneyverse-nov18-frontend-test-v20261122.service','prod':'moneyverse-nov18-frontend-prod-v20261122.service'}
PORTS={'test':4820,'prod':4822}
OLD_GATE='''map "$mv_nov18_maintenance_document:$mv_nov18_maintenance_scope" $mv_nov18_maintenance_gate {
    default 0;
    "1:1" 1;
}'''

TEST_READS=('/api/v1/auth/session','/api/v1/stocks','/api/v1/board','/api/v1/wallet/summary')

def maintenance_map(before,production,test_assets=()):
    if before.count(OLD_GATE)!=1 or '$mv_native_connected' in before:
        raise ValueError('Expected unmodified maintenance authority')
    hosts=['test.easy-scraping.com']+(['easy-scraping.com'] if production else [])
    ready='map "$host:$uri" $mv_native_connected {\n    default 0;\n'
    for host in hosts:
        for path in PAGES:ready+='    "~^'+re.escape(host+':'+path)+'$" 1;\n'
    ready+='}\n'
    gate='''map "$mv_nov18_maintenance_document:$mv_nov18_maintenance_scope:$mv_native_connected" $mv_nov18_maintenance_gate {
    default 0;
    "1:1:0" 1;
}'''
    return before.replace(OLD_GATE,ready+test_access_map(test_assets)+gate,1)

def block_end(text,start):
    depth=0;quote=None;escape=False;comment=False
    for i in range(start,len(text)):
        c=text[i]
        if comment:
            if c=='\n':comment=False
            continue
        if escape:escape=False;continue
        if c=='\\':escape=True;continue
        if quote:
            if c==quote:quote=None
            continue
        if c in ('"',"'"):quote=c;continue
        if c=='#':comment=True;continue
        if c=='{':depth+=1
        elif c=='}':
            depth-=1
            if depth==0:return i+1
    raise ValueError('Unclosed configuration block')

def asset_map(before,current):
    anchor='map "$uri|$arg_v" $mv_frontend_asset_file {'
    if before.count(anchor)!=1:raise ValueError('Unique compatibility asset map required')
    a=before.index(anchor);b=block_end(before,a+len(anchor)-1);body=before[a:b-1]
    for path,item in sorted(current.items()):
        sha=item['sha256'];file=item['file']
        if (not re.fullmatch(r'/assets/(?:mv39|mv40|mv43|mv46)/[A-Za-z0-9_.-]+',path)
            or not re.fullmatch('[0-9a-f]{64}',sha)
            or file!='/srv/moneyverse-native-rebuild-assets/'+sha+'/'+Path(path).name):
            raise ValueError('Verified immutable asset path required')
        key=path+'|'+sha
        pattern=r'(?m)^[ \t]*"'+re.escape(key)+r'"[ \t]+"[^"\n]+";[ \t]*$'
        found=list(re.finditer(pattern,body))
        if len(found)>1:raise ValueError('Duplicate asset authority')
        line=' "'+key+'" "'+file+'";'
        if found:body=body[:found[0].start()]+line+body[found[0].end():]
        else:body=body.rstrip()+'\n'+line+'\n'
    return before[:a]+body+'}'+before[b:]

def unit(channel,jar):
    if channel not in PORTS or not re.fullmatch(r'/srv/moneyverse-native-rebuild-releases/'+channel+r'-nov18-public-v2026\.11\.22\.1-[0-9a-f]{12}/moneyverse-spring-backend-0\.0\.1-SNAPSHOT\.jar',jar):
        raise ValueError('Fixed immutable public generation required')
    return '''[Unit]
Description=Moneyverse authored Nov18 frontend CHANNEL
After=network.target nginx.service
StartLimitIntervalSec=300
StartLimitBurst=5
[Service]
Type=simple
DynamicUser=yes
User=mv-nov18-public-CHANNEL
WorkingDirectory=GENERATION
ExecStart=/usr/bin/java -Xmx256m -XX:+ExitOnOutOfMemoryError -Dmoneyverse.runtime-mode=frontend-presentation -Djava.net.preferIPv4Stack=true -jar JAR --server.address=127.0.0.1 --server.port=PORT --moneyverse.admin.source-origin=http://127.0.0.1:4821 --spring.main.banner-mode=off
Restart=on-failure
RestartSec=3
SuccessExitStatus=143
TimeoutStopSec=30
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectControlGroups=yes
RestrictSUIDSGID=yes
RestrictAddressFamilies=AF_UNIX AF_INET
IPAddressDeny=any
IPAddressAllow=127.0.0.1
CapabilityBoundingSet=
UMask=0077
MemoryMax=384M
[Install]
WantedBy=multi-user.target
'''.replace('CHANNEL',channel).replace('GENERATION',str(Path(jar).parent)).replace('JAR',jar).replace('PORT',str(PORTS[channel]))

def production_version(before):
    marker='# 2. Main Website & API Server'
    if before.count(marker)!=1:raise ValueError('Unique Production authority required')
    lead,body=before.split(marker,1)
    matches=list(re.finditer(r'\blocation\s+=\s+/frontend-version\s*\{',body))
    if len(matches)!=1:raise ValueError('Unique Production version path required')
    match=matches[0];end=block_end(body,body.index('{',match.start()))
    replacement='''location = /frontend-version {
 if ($request_method !~ ^(GET|HEAD)$) { return 405; }
 proxy_pass http://127.0.0.1:4822;
 proxy_pass_request_headers off;
 proxy_pass_request_body off;
 proxy_set_header Host easy-scraping.com;
 proxy_set_header Accept application/json;
 proxy_hide_header Set-Cookie;
 proxy_hide_header Cache-Control;
 add_header Cache-Control "private, no-store" always;
 add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
}'''
    return lead+marker+body[:match.start()]+replacement+body[end:]

def test_access_map(assets=()):
    paths=list(PAGES)+list(TEST_READS)
    for path in assets:
        if not re.fullmatch(r'/assets/(?:mv39|mv43)/[A-Za-z0-9_.-]+',path) or Path(path).name.startswith('admin-'):
            raise ValueError('Only verified public Test assets may be exposed')
        paths.append(path)
    text='map "$request_method:$uri" $mv_native_test_read {\n default 0;\n'
    for method in ('GET','HEAD'):
        for path in sorted(set(paths)):text+=' "~^'+re.escape(method+':'+path)+'$" 1;\n'
    return text+'''}
map "$mv_native_test_read:$http_cf_ray:$http_cf_connecting_ip" $mv_native_test_external_block {
 default 1;
 ~^1: 0;
 "0::" 0;
}
'''

def test_sources(before,assets=()):
    marker='# 2. Main Website & API Server'
    if before.count(marker)!=1:raise ValueError('Unique frontend servers required')
    lead,prod=before.split(marker,1)
    found=list(re.finditer(r'server\s*\{[^{}]*server_name\s+test\.easy-scraping\.com;',lead))
    if len(found)!=1:raise ValueError('Unique guarded Test server required')
    start=lead.index('{',found[0].start());end=block_end(lead,start)-1
    block=lead[start+1:end]
    if 'deny all;' not in block:raise ValueError('Test network admission guard missing')
    for n,key in enumerate(('cf_ray','cf_connecting_ip')):
        pattern=r'if \(\$http_'+key+r' != ""\) \{ return 403; \}'
        if len(re.findall(pattern,block))!=1:raise ValueError('Expected original Test edge guard')
        block=re.sub(pattern,'if ($mv_native_test_external_block) { return 403; }' if n==0 else '',block,count=1)
    public=list(PAGES)+list(assets)
    test_access_map(assets)
    extra=''
    for path in public:
        matches=list(re.finditer(r'\blocation\s+=\s+'+re.escape(path)+r'\s*\{',block))
        if len(matches)>1:raise ValueError('Duplicate Test route')
        if matches:
            at=block.index('{',matches[0].start())+1;finish=block_end(block,at-1)
            original=block[at:finish]
            required=['if ($request_method !~ ^(GET|HEAD)$) { return 405; }',
                'proxy_pass http://127.0.0.1:4820;','proxy_pass_request_headers off;',
                'proxy_pass_request_body off;','proxy_hide_header Set-Cookie;']
            if any(value not in original for value in required):
                raise ValueError('Existing Test presentation policy is not the accepted read-only proxy')
            block=block[:at]+'\n allow all;\n proxy_set_header Content-Length "";'+block[at:]
        else:
            if path not in assets:raise ValueError('Missing authored Test document route')
            extra+='location = '+path+' { allow all; if ($request_method !~ ^(GET|HEAD)$) { return 405; } proxy_pass http://127.0.0.1:4820; proxy_pass_request_headers off; proxy_pass_request_body off; proxy_set_header Content-Length ""; proxy_hide_header Set-Cookie; proxy_set_header Host easy-scraping.com; add_header X-Robots-Tag "noindex, nofollow, noarchive" always; }\n'
    for path in TEST_READS:
        if re.search(r'location\s+=\s+'+re.escape(path)+r'\s*\{',block):raise ValueError('Existing Test API authority cannot be overwritten')
        extra+='''
 location = PATH {
  allow all;
  if ($request_method !~ ^(GET|HEAD)$) { return 405; }
  proxy_pass http://127.0.0.1:55438;
  proxy_pass_request_headers off;
  proxy_pass_request_body off;
  proxy_set_header Content-Length "";
  proxy_set_header Host test.easy-scraping.com;
  proxy_set_header X-Forwarded-Proto https;
  proxy_set_header Cookie $http_cookie;
  proxy_set_header Accept application/json;
  proxy_hide_header Set-Cookie;
  add_header Cache-Control "private, no-store" always;
  add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
 }
'''.replace('PATH',path)
    return lead[:start+1]+block+extra+lead[end:]+marker+prod
