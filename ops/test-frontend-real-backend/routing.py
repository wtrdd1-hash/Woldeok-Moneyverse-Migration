"""Test-only presentation wiring; never proxy a fallback to Production."""
import re

PORT=55440
UNIT="moneyverse-test-frontend-real-backend-v20261123.service"
BASE="/srv/moneyverse-native-test-20261123"
PUBLIC=("/", "/index.html", "/tools", "/calculators", "/tools/compound-calculator", "/tools/stock-calculator")
AUTH=tuple("/"+page+suffix for page in ("login","login/providers","register","forgot-password","reset-password","verify-email","verify-email-change","account-deletion") for suffix in ("","/",".html","/index.html"))
MEMBER=tuple("/"+page+suffix for page in ("wallet","support","chat","announcements","gallery","status") for suffix in ("","/",".html","/index.html"))
ADMIN=("/admin","/admin/","/admin/shop","/admin/shop/","/admin/shop.html","/admin/shop/index.html","/admin/users","/admin/market","/admin/controls","/admin/enterprises","/admin/economy","/admin/economy/scenario-lab","/admin/logs/system","/admin/logs/delivery","/admin/api-health")
PAGES=PUBLIC+AUTH+MEMBER+ADMIN+("/frontend-version","/frontend-ui-version","/frontend-ui-health")
READS=("/api/v1/auth/session","/api/v1/stocks","/api/v1/board","/api/v1/wallet/summary")

def end(text,start):
    depth=0;quote=None;escape=False;comment=False
    for i in range(start,len(text)):
        c=text[i]
        if comment:
            if c=="\n":comment=False
            continue
        if escape:escape=False;continue
        if c=="\\":escape=True;continue
        if quote:
            if c==quote:quote=None
            continue
        if c in ('"',"'"):quote=c;continue
        if c=="#":comment=True;continue
        if c=="{":depth+=1
        elif c=="}":
            depth-=1
            if depth==0:return i+1
    raise ValueError("Unclosed server block")

def proxy(port):
    return f"""
 if ($request_method !~ ^(GET|HEAD)$) {{ return 405; }}
 proxy_pass http://127.0.0.1:{port};
 proxy_pass_request_headers off;
 proxy_pass_request_body off;
 proxy_set_header Content-Length "";
 proxy_set_header Host test.easy-scraping.com;
 proxy_set_header X-Forwarded-Proto https;
 proxy_set_header Cookie $http_cookie;
 proxy_set_header Accept $http_accept;
 proxy_set_header Accept-Language $http_accept_language;
 proxy_connect_timeout 2s;
 proxy_read_timeout 15s;
 proxy_hide_header Set-Cookie;
 proxy_hide_header Cache-Control;
 proxy_hide_header X-Robots-Tag;
 add_header Cache-Control "private, no-store" always;
 add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
"""

def server():
    s="""server {
 listen 80; listen [::]:80;
 server_name test.easy-scraping.com;
 add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
"""
    for path in PAGES:s+="location = "+path+" {"+proxy(PORT)+"}\n"
    for path in READS:s+="location = "+path+" {"+proxy(55438)+"}\n"
    s+='location ~ ^/assets/(?:mv39|mv40|mv43|mv46)/[A-Za-z0-9_.-]+$ {'+proxy(PORT)+"}\n"
    for path in ("/favicon.ico","/apple-touch-icon.png"):
        target="/assets/mv39/favicon.ico" if path=="/favicon.ico" else path
        if path=="/favicon.ico":
            s+='location = /favicon.ico {'+proxy(PORT).replace(f"proxy_pass http://127.0.0.1:{PORT};",f"proxy_pass http://127.0.0.1:{PORT}{target};")+"}\n"
    return s+"location / { return 404; }\n}"

def span(before):
    matches=list(re.finditer(r"\bserver\s*\{[^{}]*\bserver_name\s+test\.easy-scraping\.com\s*;",before))
    if len(matches)!=1:raise ValueError("Exactly one Test server is required")
    a=matches[0].start();b=end(before,before.index("{",a))
    return a,b

def site(before):
    a,b=span(before)
    return before[:a]+server()+before[b:]

def unit(jar):
    if not re.fullmatch(re.escape(BASE)+"/[a-f0-9]{40}/app.jar",jar):raise ValueError("Immutable Test generation required")
    return f"""[Unit]
Description=Moneyverse Test-only native frontend with real isolated API
After=network.target
StartLimitIntervalSec=300
StartLimitBurst=5
[Service]
Type=simple
DynamicUser=yes
User=mv-native-test-20261123
WorkingDirectory={jar.rsplit("/",1)[0]}
ExecStart=/usr/bin/java -Xmx192m -XX:MaxMetaspaceSize=144m -XX:+ExitOnOutOfMemoryError -Dmoneyverse.runtime-mode=frontend-presentation -jar {jar} --server.address=127.0.0.1 --server.port={PORT} --moneyverse.admin.source-origin=http://127.0.0.1:55438 --moneyverse.public.source-origin=http://127.0.0.1:55438 --spring.main.banner-mode=off
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
"""
