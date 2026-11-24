"""Closed, independent Test backend configuration; no production discovery."""
from pathlib import Path
import re

SHA='f0336fded6068f884c87f88efedeb770fd3387d4'
JAR_SHA='8a1c75c685ad31805a772ff9af6a94e6f7fd2e57f66809412ac2e900b1d6f38c'
IMAGE='sha256:18cfe3ef5e6815560c98237d6216d1e5119702fb0f3894c8785dd58b8bbe5d73'
IMAGE_REPO_DIGEST='postgres@sha256:18cfe3ef5e6815560c98237d6216d1e5119702fb0f3894c8785dd58b8bbe5d73'
CONTAINER='mv-nov18-test-db-20261122'
VOLUME=CONTAINER+'-data'
DATABASE='moneyverse_nov18_public_test'
STAGE=Path('/var/lib/moneyverse-frontend-rebuild-20261121/test-backend-f0336fded6-r1')
SOURCE=STAGE/'source'
RELEASE=Path('/srv/moneyverse-native-rebuild-releases/test-backend-nov18-v2026.11.22.1-f0336fded606')
JAR=str(RELEASE/'moneyverse-spring-backend-0.0.1-SNAPSHOT.jar')
UNIT='moneyverse-nov18-test-backend-v20261122.service'
LABEL='moneyverse.nov18-test-backend'
OWNER='f0336fded606-20261122-r1'

def validate_authority(env):
    for k,v in {'PGHOST':'127.0.0.1','PGPORT':'55436','PGUSER':'moneyverse_migrator','PGDATABASE':DATABASE}.items():
        if env.get(k)!=v:raise ValueError('wrong Test authority: '+k)
    for k in ['PGPASSWORD','APP_DB_PASSWORD']:
        if not re.fullmatch('[a-f0-9]{48,128}',env.get(k,'')):raise ValueError('missing Test credential: '+k)

def runtime_env(password,token,secret):
    for value in [password,token,secret]:
        if not re.fullmatch('[a-f0-9]{48,128}',value):raise ValueError('Test-only random credential required')
    return {
      'SERVER_ADDRESS':'127.0.0.1','PORT':'55438','APP_BASE_URL':'https://test.easy-scraping.com',
      'SPRING_DATASOURCE_URL':'jdbc:postgresql://127.0.0.1:55436/'+DATABASE,
      'SPRING_DATASOURCE_USERNAME':'moneyverse_app','SPRING_DATASOURCE_PASSWORD':password,
      'SPRING_DATASOURCE_DRIVERCLASSNAME':'org.postgresql.Driver',
      'SPRING_DATASOURCE_HIKARI_READONLY':'true',
      'SPRING_DATASOURCE_HIKARI_MAXIMUMPOOLSIZE':'2',
      'SPRING_DATASOURCE_HIKARI_MINIMUMIDLE':'0',
      'SPRING_DATASOURCE_HIKARI_CONNECTIONTIMEOUT':'5000',
      'LOGGING_LEVEL_COM_ZAXXER_HIKARI':'DEBUG','SPRING_SQL_INIT_MODE':'never','SPRING_JPA_HIBERNATE_DDLAUTO':'none',
      'INTERNAL_API_TOKEN':token,'MONEYVERSE_SECURITY_APPSECRET':secret,
      'MONEYVERSE_SECURITY_ENCRYPTIONKEY':secret,
      'MONEYVERSE_SCHEDULING_ENABLED':'false','MONEYVERSE_MARKET_TICKERENABLED':'false',
      'SOCKETIO_HOST':'127.0.0.1','SOCKETIO_PORT':'0',
      'MONEYVERSE_SOCKET_HOST':'127.0.0.1','MONEYVERSE_SOCKET_PORT':'0',
      'DISCORD_BOT_TOKEN':'','MONEYVERSE_DISCORD_CLIENTID':'',
      'MONEYVERSE_DISCORD_CLIENTSECRET':'','MONEYVERSE_DISCORD_REDIRECTURI':'http://127.0.0.1:55438/auth/discord/callback',
      'TELEGRAM_BOT_TOKEN':'','TELEGRAM_ADMIN_CHAT_ID':'','TELEGRAM_ALERTS_CHAT_ID':'',
      'DISCORD_WEBHOOK_URL':'','DISCORD_ADMIN_WEBHOOK_URL':'',
      'MONEYVERSE_STORAGE_PATH':'/run/moneyverse-nov18-test-backend/media',
      'MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE':'health,info',
      'MONEYVERSE_FEATURES_SWFOPERATIONAL':'false','MONEYVERSE_FEATURES_KDICOPERATIONAL':'false',
      'MONEYVERSE_FEATURES_BLACKMARKETOPERATIONAL':'false','MONEYVERSE_FEATURES_PENSIONOPERATIONAL':'false',
    }

def render_unit():
    return f"""[Unit]
Description=Independent synthetic Nov18 Test backend
After=network.target docker.service
StartLimitIntervalSec=300
StartLimitBurst=5
[Service]
Type=simple
DynamicUser=yes
EnvironmentFile={STAGE}/runtime.env
ExecStart=/usr/bin/java -Xms64m -Xmx256m -XX:MaxMetaspaceSize=160m -XX:ActiveProcessorCount=2 -Dmoneyverse.runtime-mode=application -jar {JAR}
Restart=on-failure
RestartSec=3
SuccessExitStatus=143
TimeoutStartSec=90
TimeoutStopSec=30
RuntimeDirectory=moneyverse-nov18-test-backend
WorkingDirectory=/run/moneyverse-nov18-test-backend
MemoryMax=640M
TasksMax=100
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
PrivateDevices=yes
ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectControlGroups=yes
RestrictSUIDSGID=yes
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6
IPAddressDeny=any
IPAddressAllow=localhost
UMask=0077
[Install]
WantedBy=multi-user.target
"""

def map_files(args):
    # ci-apply owns SQL, while this shim owns the only permitted destination.
    if len(args)==2 and args[0]=='-f':
        path=Path(args[1]).resolve()
        relative=path.relative_to((SOURCE/'packages/database').resolve())
        if relative.parts[0] not in ('init','migrations') or path.suffix!='.sql':raise ValueError('SQL source outside exact archive')
        return ['-f','/bootstrap/'+relative.as_posix()]
    if not args:return []
    raise ValueError('unsupported bootstrap psql arguments')

def validate_container(item,expected_id):
    if item.get('Id')!=expected_id or item.get('Image')!=IMAGE:raise ValueError('foreign Test container generation')
    if item.get('Config',{}).get('Labels',{}).get(LABEL)!=OWNER:raise ValueError('foreign Test container label')
    ports=item.get('HostConfig',{}).get('PortBindings',{})
    if ports!={'5432/tcp':[{'HostIp':'127.0.0.1','HostPort':'55436'}]}:raise ValueError('foreign Test port binding')
    mounts=item.get('Mounts',[])
    volumes=[m for m in mounts if m.get('Type')=='volume']
    binds=[m for m in mounts if m.get('Type')=='bind']
    if len(volumes)!=1 or volumes[0].get('Name')!=VOLUME or volumes[0].get('Destination')!='/var/lib/postgresql/data':raise ValueError('foreign Test volume')
    if len(binds)!=1 or binds[0].get('Source')!=str(SOURCE/'packages/database') or binds[0].get('Destination')!='/bootstrap' or binds[0].get('RW') is not False:raise ValueError('foreign bootstrap source mount')

def signed_out(body):
    return body.get('signedIn') is False and body.get('authenticated') is False and body.get('user','missing') is None

def stock_rows_match(body,source):
    rows=body.get('stocks')
    if not isinstance(rows,list) or len(rows)!=len(source):return False
    if len({r.get('id') for r in rows})!=len(rows):return False
    actual={r.get('id'):r for r in rows}
    for expected in source:
        row=actual.get(expected['id'])
        if row is None:return False
        for key,value in expected.items():
            if row.get(key)!=value:return False
    return True

def validate_image(item):
    if item.get('Id')!=IMAGE:raise ValueError('wrong immutable image config identity')
    if 'postgres:17.11-alpine' not in item.get('RepoTags',[]) or IMAGE_REPO_DIGEST not in item.get('RepoDigests',[]):raise ValueError('official pinned registry image missing')

def validate_unit_state(state):
    if state.get('LoadState')!='not-found' or state.get('FragmentPath') or state.get('ActiveState')!='inactive' or state.get('DropInPaths') or state.get('Transient','no')!='no':raise ValueError('existing loaded Test unit may not be adopted or shadowed')
