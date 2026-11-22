"""Pure proposals for a protected real-read preview; nothing here installs or starts a service."""
import importlib.util
from pathlib import Path
import re
from urllib.parse import urlsplit,unquote,parse_qsl

PREFIX='/_mv/nov18-rebuild-qa/'
FRONT_UNIT='moneyverse-nov18-rebuild-qa-v20261121.service'
API_UNIT='moneyverse-nov18-catalog-read-qa-v20261122.service'
ENVIRONMENT=Path('/etc/moneyverse/nov18-catalog-read-qa-v20261122.env')
RELEASE_ROOT=Path('/srv/moneyverse-native-rebuild-releases')

def database_environment(raw):
    try:
        if not isinstance(raw,str) or not raw or any(ord(c)<33 or ord(c)==127 for c in raw):raise ValueError()
        u=urlsplit(raw)
        if u.scheme not in {'postgres','postgresql'} or u.hostname not in {'127.0.0.1','localhost'} or u.fragment:raise ValueError()
        user=unquote(u.username or '',errors='strict');password=unquote(u.password or '',errors='strict')
        if user!='moneyverse_app' or not password or any(ord(c)<32 or ord(c)==127 for c in password):raise ValueError()
        if not re.fullmatch(r'/[A-Za-z0-9_][A-Za-z0-9_-]{0,62}',u.path):raise ValueError()
        port=u.port or 5432
        if not 1<=port<=65535:raise ValueError()
        query=parse_qsl(u.query,keep_blank_values=True,strict_parsing=True)
        if len(query)>1 or any(k!='sslmode' or v not in {'disable','allow','prefer','require','verify-ca','verify-full'} for k,v in query):raise ValueError()
        # Preserve the approved hostname so verification settings retain their original peer identity.
        url='jdbc:postgresql://'+u.hostname+':'+str(port)+u.path
        if query:url+='?sslmode='+query[0][1]
        values={'SPRING_DATASOURCE_URL':url,'SPRING_DATASOURCE_USERNAME':user,'SPRING_DATASOURCE_PASSWORD':password,
            'SPRING_DATASOURCE_DRIVER_CLASS_NAME':'org.postgresql.Driver','SPRING_DATASOURCE_HIKARI_READ_ONLY':'true',
            'SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE':'2','SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE':'0',
            'SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT':'5000','SPRING_SQL_INIT_MODE':'never','SPRING_JPA_HIBERNATE_DDL_AUTO':'none'}
        def quote(value):return '"'+value.replace('\\','\\\\').replace('"','\\"')+'"'
        return ''.join(key+'='+quote(value)+'\n' for key,value in values.items())
    except Exception:
        raise ValueError('Unapproved application database configuration') from None

def qa_module():
    here=Path(__file__).resolve()
    path=here.with_name('qa.py')
    if not path.exists():path=here.parent.parent/'nov18-frontend-rebuild-qa/qa.py'
    spec=importlib.util.spec_from_file_location('owned_qa_proposal',path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

def render_config(front_port=4830,api_port=4832):
    if any(type(port) is not int or not 1<=port<=65535 for port in [front_port,api_port]):raise ValueError('Invalid fixed loopback ports')
    catalog='''location = '''+PREFIX+'''catalog {
 if ($request_method !~ ^(GET|HEAD)$) { return 405; }
 auth_request /__mv_p0_admin_auth_20261118;
 proxy_pass_request_headers off;
 proxy_pass_request_body off;
 proxy_set_header Content-Length "";
 proxy_set_header Host easy-scraping.com;
 proxy_set_header Cookie $http_cookie;
 proxy_set_header Accept application/json;
 proxy_set_header X-Forwarded-Proto https;
 proxy_connect_timeout 2s;
 proxy_read_timeout 10s;
 proxy_hide_header Set-Cookie;
 proxy_hide_header Cache-Control;
 add_header Cache-Control "private, no-store" always;
 add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
 add_header X-MV-Rebuild-QA "nov18-real-read-20261122" always;
 proxy_pass http://127.0.0.1:'''+str(api_port)+'''/api/v1/admin/shop/items;
}
'''
    return catalog+qa_module().render_config(front_port)

def render_units(jar):
    if not isinstance(jar,str) or not re.fullmatch(re.escape(str(RELEASE_ROOT))+r'/test-nov18-catalog-read-canary-v2026\.11\.22\.1-[0-9a-f]{12}/moneyverse-spring-backend-0\.0\.1-SNAPSHOT\.jar',jar):
        raise ValueError('Unapproved immutable canary generation')
    common='''Restart=on-failure
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
'''
    def unit(description,user,mode,port,extra):
        return '''[Unit]
Description='''+description+'''
After=network.target nginx.service
StartLimitIntervalSec=300
StartLimitBurst=5
[Service]
Type=simple
DynamicUser=yes
User='''+user+'''
WorkingDirectory='''+str(Path(jar).parent)+'''
'''+('EnvironmentFile='+str(ENVIRONMENT)+'\n' if mode=='catalog-read' else '')+'''ExecStart=/usr/bin/java -Xmx256m -XX:+ExitOnOutOfMemoryError -Djava.net.preferIPv4Stack=true -Dmoneyverse.runtime-mode='''+mode+' -jar '+jar+' --server.address=127.0.0.1 --server.port='+str(port)+' --spring.main.banner-mode=off '+extra+'\n'+common
    return {
        FRONT_UNIT:unit('Moneyverse protected Nov18 real-read frontend QA only','mv-nov18-rebuild-qa','frontend-presentation',4830,
            '--moneyverse.admin.source-origin=http://127.0.0.1:4821 --moneyverse.admin.catalog-read-path='+PREFIX+'catalog'),
        API_UNIT:unit('Moneyverse protected canonical catalog read QA only','mv-nov18-catalog-read-qa','catalog-read',4832,'')
    }
