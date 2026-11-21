#!/usr/bin/env python3
"""Stage one protected administrator preview, not full isolated Test acceptance. Public maintenance stays authoritative."""
import argparse,fcntl,hashlib,importlib.util,json,os,subprocess,time,zipfile,io
from pathlib import Path
import qa,guards
OwnedFiles=guards.OwnedFiles

ROOT=Path('/var/lib/moneyverse-frontend-rebuild-20261121')
SITE=Path('/etc/nginx/sites-enabled/moneyverse')
UNIT='moneyverse-nov18-rebuild-qa-v20261121.service'
UNIT_FILE=Path('/etc/systemd/system')/UNIT
REPO=Path('/home/debian/mv-nov18-visual-unification-20261121')
REPOSITORY='wtrdd1-hash/Woldeok-Moneyverse-Migration'
MAINTENANCE=ROOT/'maintenance-proposal-r3/runner.py'

def digest(data):return hashlib.sha256(data).hexdigest()
def gh(*args):return subprocess.check_output(['runuser','-u','debian','--','gh',*args],text=True,cwd=REPO)
def gh_download(route,target):
    with target.open('xb') as output:
        subprocess.run(['runuser','-u','debian','--','gh','api',route],stdout=output,stderr=subprocess.PIPE,check=True,cwd=REPO)
def fetch_artifact(stage,source,run):return guards.fetch_artifact(stage,source,run,gh,gh_download,REPOSITORY)
def unit_state():
    text=subprocess.check_output(['systemctl','show',UNIT,'-p','LoadState','-p','ActiveState','-p','MainPID','-p','FragmentPath','-p','DropInPaths'],text=True)
    return dict(line.split('=',1) for line in text.splitlines())
def port_is_free():
    import socket
    if subprocess.check_output(['ss','-H','-ltn','sport','=',':4830'],text=True).strip():return False
    try:
        with socket.socket() as sock:sock.bind(('127.0.0.1',4830))
        return True
    except OSError:return False
def require_vacant_unit():guards.require_vacant(UNIT_FILE,unit_state,port_is_free)
def current_main(source):
    if gh('api','repos/'+REPOSITORY+'/branches/main','--jq','.commit.sha').strip()!=source:raise ValueError('Application source is no longer current main')
def maintenance():
    if digest(MAINTENANCE.read_bytes())!='7dbab08f6b977bbfdbafcc18f282351dd63fa930ce8e9577a407d9958321e4c6':raise ValueError('Reviewed maintenance helper changed')
    spec=importlib.util.spec_from_file_location('owned_maintenance',MAINTENANCE);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

def prepare(source,run,stage):
    import re
    if os.geteuid()!=0 or not re.fullmatch('[0-9a-f]{40}',source) or not run.isdigit():raise ValueError('Root and explicit source/run are required')
    if stage.parent!=ROOT or stage.exists() or ROOT.stat().st_uid!=0 or ROOT.stat().st_mode&0o077:raise ValueError('Unexpected protected stage')
    current_main(source)
    ci=json.loads(gh('run','view',run,'--json','headSha,headBranch,event,status,conclusion,jobs'))
    jobs={job['name']:job['conclusion'] for job in ci['jobs']}
    if ci['headSha']!=source or ci['headBranch']!='main' or ci['event']!='push' or ci['status']!='completed' or ci['conclusion']!='success' or set(jobs)!={'classify','policy','runtime-check','spring-web-check'} or set(jobs.values())!={'success'}:raise ValueError('Exact-main CI is incomplete')
    for name in ['qa.py','test_qa.py','install.py','guards.py']:
        relative='ops/nov18-frontend-rebuild-qa/'+name
        if subprocess.check_output(['git','-c','safe.directory='+str(REPO),'-C',str(REPO),'show','HEAD:'+relative])!=(Path(__file__).parent/name).read_bytes():raise ValueError('Operational source is not committed')
    require_vacant_unit()
    if SITE.is_symlink() or SITE.stat().st_uid!=0 or not SITE.is_file() or qa.INCLUDE.exists():raise ValueError('Fixed QA target ownership differs')
    stage.mkdir(mode=0o700)
    artifact_proof,m,data=fetch_artifact(stage,source,run);name=m['jar']
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        if 'build.sourceRevision='+source not in z.read('META-INF/build-info.properties').decode():raise ValueError('Packaged source differs')
        for relative in ['static/assets/mv39/favicon.ico','static/assets/mv46/admin-shop.js','static/assets/mv46/admin-shop-core.js','static/assets/mv46/admin-shop.css','templates/mv46/admin-shop.html']:
            expected=subprocess.check_output(['git','-c','safe.directory='+str(REPO),'-C',str(REPO),'show',source+':spring-backend/src/main/resources/'+relative])
            if z.read('BOOT-INF/classes/'+relative)!=expected:raise ValueError('Packaged presentation resource differs')
    if SITE.is_symlink() or SITE.stat().st_uid!=0 or not SITE.is_file():raise ValueError('Fixed Nginx site ownership differs')
    if UNIT_FILE.exists() or qa.INCLUDE.exists():raise ValueError('Owned QA target already exists')
    root=Path('/srv/moneyverse-data/releases')/('test-nov18-native-rebuild-v2026.11.21.2-'+source[:12])
    if root.exists():raise ValueError('Immutable Test generation already exists')
    current_main(source);root.mkdir(mode=0o755);jar=root/name
    with jar.open('xb') as output:output.write(data)
    jar.chmod(0o444)
    (root/'source-manifest.json').write_text(json.dumps(m)+'\n');(root/'source-manifest.json').chmod(0o444)
    before=SITE.read_bytes();after=qa.patch_site(before.decode()).encode();include=qa.render_config().encode()
    unit=('''[Unit]
Description=Moneyverse Nov18 protected rebuild Test only
After=network.target nginx.service
StartLimitIntervalSec=300
StartLimitBurst=5
[Service]
Type=simple
DynamicUser=yes
User=mv-nov18-rebuild-qa
WorkingDirectory='''+str(root)+'''
ExecStart=/usr/bin/java -Xmx256m -XX:+ExitOnOutOfMemoryError -Dmoneyverse.runtime-mode=frontend-presentation -jar '''+str(jar)+''' --server.address=127.0.0.1 --server.port=4830 --moneyverse.admin.source-origin=http://127.0.0.1:4821 --spring.main.banner-mode=off
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
''').encode()
    files={'site.before':before,'site.after':after,'qa.conf':include,'qa.service':unit,'install.py':Path(__file__).read_bytes(),'qa.py':Path(qa.__file__).read_bytes(),'guards.py':Path(guards.__file__).read_bytes()}
    for key,value in files.items():(stage/key).write_bytes(value)
    manifest={'applicationSource':source,'operationalSource':subprocess.check_output(['git','-c','safe.directory='+str(REPO),'-C',str(REPO),'rev-parse','HEAD'],text=True).strip(),'run':run,'artifactProof':artifact_proof,'siteBeforeIdentity':[SITE.stat().st_dev,SITE.stat().st_ino],'jar':str(jar),'jarSha256':m['sha256'],'siteMode':SITE.stat().st_mode&0o777,'files':{key:digest(value) for key,value in files.items()},'apiBefore':{path:maintenance().probe(path) for path in maintenance().API_PROBES}}
    (stage/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps({'stage':str(stage),'applicationSource':source,'jarSha256':m['sha256'],'liveChanges':False}))

def validate_stage(stage):
    if os.geteuid()!=0 or stage.parent!=ROOT or stage.stat().st_uid!=0 or stage.stat().st_mode&0o077 or ROOT.stat().st_uid!=0 or ROOT.stat().st_mode&0o077:raise ValueError('Private root-owned stage is required')
    m=json.loads((stage/'manifest.json').read_text());expected={'site.before','site.after','qa.conf','qa.service','install.py','qa.py','guards.py'}
    if set(m['files'])!=expected:raise ValueError('Unexpected proposal files')
    for name,h in m['files'].items():
        if digest((stage/name).read_bytes())!=h:raise ValueError('Proposal artifact changed')
    if digest(Path(__file__).read_bytes())!=m['files']['install.py'] or digest(Path(qa.__file__).read_bytes())!=m['files']['qa.py'] or digest(Path(guards.__file__).read_bytes())!=m['files']['guards.py']:raise ValueError('Apply must run the protected reviewed runner')
    if digest(SITE.read_bytes())!=m['files']['site.before'] or UNIT_FILE.exists() or qa.INCLUDE.exists():raise ValueError('Live configuration changed before apply')
    require_vacant_unit()
    current_main(m['applicationSource']);helper=maintenance();helper.DIAGNOSTICS_STAGE=stage
    jar=Path(m['jar'])
    if jar.stat().st_uid!=0 or jar.stat().st_mode&0o222 or jar.parent.stat().st_uid!=0 or jar.parent.stat().st_mode&0o022 or digest(jar.read_bytes())!=m['jarSha256']:raise ValueError('Immutable generation changed')
    return m,helper,jar


def apply(stage):
    m,helper,jar=validate_stage(stage)
    import urllib.request,urllib.error
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),helper.NoRedirect())
    def local(path):
        try:r=opener.open('http://127.0.0.1:4830'+path,timeout=3)
        except urllib.error.HTTPError as failure:r=failure
        return r.status,json.loads(r.read()) if r.status==200 else None
    helper.nginx('test');owned=OwnedFiles()
    try:
        require_vacant_unit()
        owned.write(UNIT_FILE,(stage/'qa.service').read_bytes())
        subprocess.run(['systemctl','daemon-reload'],check=True,capture_output=True)
        state=unit_state()
        if state!={'LoadState':'loaded','ActiveState':'inactive','MainPID':'0','FragmentPath':str(UNIT_FILE),'DropInPaths':''}:raise ValueError('Loaded QA identity changed before start')
        subprocess.run(['systemctl','start',UNIT],check=True,capture_output=True)
        deadline=time.monotonic()+20
        while True:
            try:
                status,health=local('/frontend-ui-health');v,version=local('/frontend-ui-version')
                if status==v==200 and health.get('databaseRequired') is False and version.get('id')==m['applicationSource']:break
            except (OSError,ValueError):pass
            if time.monotonic()>deadline:raise RuntimeError('Exact-source Test renderer readiness failed')
            time.sleep(.2)
        pid=subprocess.check_output(['systemctl','show',UNIT,'-p','MainPID','--value'],text=True).strip()
        if not pid.isdigit() or int(pid)<2 or not Path('/proc/'+pid+'/cwd').resolve().samefile(jar.parent):raise ValueError('Live Test process directory differs')
        if not any(fd.exists() and fd.resolve()==jar and fd.stat().st_ino==jar.stat().st_ino for fd in Path('/proc/'+pid+'/fd').iterdir()):raise ValueError('Live Test open JAR differs')
        current_main(m['applicationSource'])
        owned.write(qa.INCLUDE,(stage/'qa.conf').read_bytes())
        owned.write(SITE,(stage/'site.after').read_bytes(),m['siteMode'],True,m['files']['site.before'],m['siteBeforeIdentity'])
        helper.nginx('test');helper.nginx('reload')
        deadline=time.monotonic()+10
        while True:
            if helper.probe(qa.PREFIX+'admin-shop',accept='text/html')['status']==401:break
            if time.monotonic()>deadline:raise RuntimeError('Protected preview admission failed')
            time.sleep(.1)
        if helper.probe(qa.PREFIX+'assets/mv46/admin-shop.js')['status']!=401 or helper.probe(qa.PREFIX+'other')['status']!=404 or not helper.probe('/',accept='text/html')['maintenance']:raise ValueError('QA boundary or public maintenance changed')
        after={path:helper.probe(path) for path in helper.API_PROBES}
        for path,old in m['apiBefore'].items():
            if after[path]['status']!=old['status'] or after[path]['type']!=old['type'] or after[path]['maintenance']:raise ValueError('Existing API boundary changed')
        receipt={'applicationSource':m['applicationSource'],'jarSha256':m['jarSha256'],'qaOnly':True,'productionMaintenance':True,'anonymousPreview':401,'apiAfter':after,'unit':UNIT,'enabled':False,'mainPid':pid,'siteAfter':digest(SITE.read_bytes())}
        (stage/'apply-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
    except BaseException as failure:
        outcome=rollback(stage,m,helper,owned)
        outcome['applyErrorType']=type(failure).__name__
        path=stage/('failure-'+str(time.time_ns())+'.json');path.write_text(json.dumps(outcome,indent=2)+'\n');path.chmod(0o600)
        if outcome['errors']:raise RuntimeError('QA rollback incomplete; protected outcome retained') from failure
        raise

def cleanup_unit(owned,jar):
    if str(UNIT_FILE) not in owned.created:return {'owned':False,'removed':False}
    if not owned.owns(UNIT_FILE):raise ValueError('Owned unit changed concurrently')
    state=unit_state();pid=state.get('MainPID','')
    if pid!='0':
        if not pid.isdigit() or state.get('FragmentPath')!=str(UNIT_FILE) or state.get('DropInPaths')!='':raise ValueError('QA process identity is uncertain')
        command=Path('/proc/'+pid+'/cmdline').read_bytes().split(b'\0')
        if str(jar).encode() not in command or b'-Dmoneyverse.runtime-mode=frontend-presentation' not in command or not Path('/proc/'+pid+'/cwd').resolve().samefile(jar.parent):raise ValueError('An unrelated process cannot be stopped')
        subprocess.run(['systemctl','stop',UNIT],check=True,capture_output=True)
        if unit_state().get('MainPID')!='0':raise ValueError('QA process did not stop')
    owned.remove(UNIT_FILE);subprocess.run(['systemctl','daemon-reload'],check=True,capture_output=True)
    return {'owned':True,'removed':True}

def rollback(stage,m,helper,owned):
    outcome={'configRestored':False,'nginxReloaded':False,'unitCleanup':None,'errors':[]}
    try:
        site_changed=str(SITE) in owned.created;include_changed=str(qa.INCLUDE) in owned.created
        if site_changed and not owned.owns(SITE):raise ValueError('Owned site changed concurrently')
        if include_changed and not owned.owns(qa.INCLUDE):raise ValueError('Owned include changed concurrently')
        if site_changed:
            identity=owned.created[str(SITE)][:2];owned.write(SITE,(stage/'site.before').read_bytes(),m['siteMode'],True,m['files']['site.after'],identity)
        if include_changed:owned.remove(qa.INCLUDE)
        outcome['configRestored']=True
        if site_changed or include_changed:helper.nginx('test');helper.nginx('reload')
        outcome['nginxReloaded']=True
    except Exception as error:outcome['errors'].append('config:'+type(error).__name__)
    try:outcome['unitCleanup']=cleanup_unit(owned,Path(m['jar']))
    except Exception as error:outcome['errors'].append('unit:'+type(error).__name__)
    return outcome

def main():
    parser=argparse.ArgumentParser();parser.add_argument('action',choices=['prepare','apply']);parser.add_argument('--stage',required=True);parser.add_argument('--source');parser.add_argument('--run');a=parser.parse_args();stage=Path(a.stage).resolve()
    with open(ROOT/'maintenance.lock','a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        if a.action=='prepare':prepare(a.source,a.run,stage)
        else:apply(stage)
if __name__=='__main__':main()
