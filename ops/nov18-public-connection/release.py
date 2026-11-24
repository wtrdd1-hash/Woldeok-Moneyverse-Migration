#!/usr/bin/env python3
"""Explicit immutable Test-first connection of the already-authored public UI."""
import argparse,fcntl,glob,hashlib,importlib.util,io,json,os,re,subprocess,time,urllib.error,urllib.request,zipfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
base=load('public_owned_catalog_helpers',HERE/'catalog_install.py' if (HERE/'catalog_install.py').exists() else HERE.parent/'nov18-catalog-read-canary/install.py')
routing=load('public_authored_routing',HERE/'routing.py')
ROOT=base.ROOT
MAP=Path('/etc/nginx/conf.d/00-moneyverse-nov18-maintenance-20261121.conf')
ASSET_MAP=Path('/etc/nginx/conf.d/00-moneyverse-frontend-consolidated-v20261121.conf')
SITE=base.SITE
TARGETS=(MAP,ASSET_MAP,SITE)
ASSETS=Path('/srv/moneyverse-native-rebuild-assets')
RELEASES=Path('/srv/moneyverse-native-rebuild-releases')
def digest(data):return hashlib.sha256(data).hexdigest()
def write_journal(stage,phase,owned,extra=None):
    path=stage/(phase+'-journal.json')
    previous=json.loads(path.read_text()) if path.exists() else {}
    value={**previous,'owned':owned.created,'recoveries':owned.recoveries,**(extra or {})}
    base.save(stage/(phase+'-journal.json'),value);return value
def owned_from(stage,phase):
    value=json.loads((stage/(phase+'-journal.json')).read_text());owned=base.OwnedFiles()
    owned.created={k:tuple(v) for k,v in value['owned'].items()};owned.recoveries=value.get('recoveries',[]);return owned

def handoff_restored_test(stage,owned,expected):
    path=stage/'test-journal.json';previous=json.loads(path.read_text())
    records=previous.setdefault('handoffs',[])
    change={}
    for target,identity in owned.created.items():
        if not owned.owns(Path(target)) or identity[2]!=expected[target]['sha256']:
            raise ValueError('Restored generation cannot be handed off')
        origin=[expected[target][k] for k in ['dev','ino','sha256']]
        current=list(identity);parent=previous['owned'].get(target)
        witnessed=any(q.get('phase')=='prod' and q.get('from',{}).get(target)==origin and q.get('to',{}).get(target)==current for q in records)
        if parent!=origin and not (parent==current and witnessed):
            raise ValueError('Predecessor authority changed concurrently')
        change[target]=(origin,current)
    record={'phase':'prod','from':{},'to':{}}
    for target,(origin,current) in change.items():
        previous['owned'][target]=current;record['from'][target]=origin;record['to'][target]=current
    if record['from'] and record not in records:records.append(record)
    base.save(path,previous)

def restore_batch(stage,phase,before,verify,reload):
    owned=owned_from(stage,phase);errors=[]
    expected=json.loads((stage/(phase+'-journal.json')).read_text())['expected']
    for path in reversed(list(owned.created)):
        target=Path(path)
        try:
            actual=base.snapshot(target)
            if (not owned.owns(target) or actual['uid']!=expected[path]['uid']
                or actual['mode']!=expected[path]['mode'] or digest(before[path])!=expected[path]['sha256']):
                raise ValueError('Concurrent target or inverse evidence must be preserved')
            if target.read_bytes()!=before[path]:
                identity=owned.created[path]
                try:owned.write(target,before[path],expected[path]['mode'],True,identity[2],identity[:2])
                finally:write_journal(stage,phase,owned)
        except Exception as failure:errors.append(type(failure).__name__)
    if not errors and phase=='prod':
        try:handoff_restored_test(stage,owned,expected)
        except Exception as failure:errors.append(type(failure).__name__)
    if not errors:
        try:verify();reload()
        except Exception as failure:errors.append(type(failure).__name__)
    result={'complete':not errors,'errors':errors};base.save(stage/(phase+'-inverse.json'),result);return result

def replace_batch(stage,phase,changes,expected,before,verify,reload):
    if (stage/(phase+'-journal.json')).exists():raise ValueError('Proposal already attempted; explicit inverse required')
    for name in changes:base.check_snapshot(Path(name),expected[name])
    owned=base.OwnedFiles();write_journal(stage,phase,owned,{'expected':expected})
    try:
        for name,data in changes.items():
            for p in changes:
                if p in owned.created:
                    if not owned.owns(Path(p)):raise ValueError('Acquired configuration changed')
                else:base.check_snapshot(Path(p),expected[p])
            old=expected[name]
            try:owned.write(Path(name),data,old['mode'],True,old['sha256'],[old['dev'],old['ino']])
            finally:write_journal(stage,phase,owned)
        verify();reload();write_journal(stage,phase,owned,{'reloaded':True});return owned
    except BaseException:
        restore_batch(stage,phase,before,verify,reload);raise

def inventory():
    text=subprocess.check_output(['/usr/sbin/nginx','-T'],stderr=subprocess.PIPE,text=True)
    return {name:{'resolved':str(Path(name).resolve()),'identity':base.snapshot(Path(name).resolve())}
            for name in re.findall(r'^# configuration file (.+):$',text,re.M)}
def unchanged_inventory(manifest,expected):
    current=inventory()
    if set(current)!=set(manifest['inventory']):raise ValueError('Nginx include inventory changed')
    for name,entry in manifest['inventory'].items():
        if name in expected:base.check_snapshot(Path(name),expected[name])
        elif current[name]!=entry:raise ValueError('Unrelated Nginx configuration changed')
def public_dir(path):
    if path.exists():base.root_path(path);return
    base.root_path(path.parent);path.mkdir(mode=0o700);fd=os.open(path,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
    try:os.fchmod(fd,0o755)
    finally:os.close(fd)
def file_bytes(path,data,mode=0o444):
    base.private_write(path,data,mode);fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
    try:os.fchmod(fd,mode)
    finally:os.close(fd)
def source_gate(m):
    base.approved_ci(m['source'],m['run']);base.artifact_still_approved(m['source'],m['run'],m['artifactProof'])
def operation_files():
    head=base.git('rev-parse','HEAD').decode().strip()
    sources={'release.py':HERE/'release.py','routing.py':HERE/'routing.py','browser-test.mjs':HERE/'browser-test.mjs',
        'catalog_install.py':HERE.parent/'nov18-catalog-read-canary/install.py',
        'canary.py':HERE.parent/'nov18-catalog-read-canary/canary.py',
        'guards.py':HERE.parent/'nov18-frontend-rebuild-qa/guards.py','qa.py':HERE.parent/'nov18-frontend-rebuild-qa/qa.py'}
    files={}
    for name,path in sources.items():
        if path.read_bytes()!=base.git('show',head+':'+str(path.relative_to(base.REPO))):raise ValueError('Uncommitted operational implementation')
        files[name]=path.read_bytes()
    return head,files

def shadow_validation(stage,proposals,channel):
    root=Path('/etc/nginx/nginx.conf').read_text()
    for pattern in ['/etc/nginx/conf.d/*.conf','/etc/nginx/sites-enabled/*']:
        anchor='include '+pattern+';'
        if root.count(anchor)!=1:raise ValueError('Expected Nginx root include anchor')
        root=root.replace(anchor,'\n'.join('include '+str(stage/proposals[path] if path in proposals else path)+';' for path in sorted(glob.glob(pattern))),1)
    root,count=re.subn(r'(?m)^[ \t]*pid[ \t]+[^;]+;','pid '+str(stage/(channel+'-validation.pid'))+';',root)
    if count!=1:raise ValueError('Expected Nginx root PID authority')
    path=stage/(channel+'-validation.conf');base.private_write(path,root.encode())
    result=subprocess.run(['/usr/sbin/nginx','-t','-c',str(path)],capture_output=True,text=True)
    base.private_write(stage/(channel+'-validation.log'),(result.stdout+result.stderr).encode())
    if result.returncode:raise RuntimeError('Proposed Nginx configuration failed before live changes')

def prepare(stage,source_stage):
    base.protected_stage(stage,False);base.protected_stage(source_stage)
    base.root_path(source_stage/'manifest.json',True);base.root_path(source_stage/'ci-artifact.zip',True)
    old=json.loads((source_stage/'manifest.json').read_text())
    m={'source':old['applicationSource'],'run':old['run'],'artifactProof':old['artifactProof']};source_gate(m)
    archive=(source_stage/'ci-artifact.zip').read_bytes()
    if digest(archive)!=m['artifactProof']['archiveSha256']:raise ValueError('CI archive changed')
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        if set(z.namelist())!={'moneyverse-spring-backend-0.0.1-SNAPSHOT.jar','source-manifest.json'}:raise ValueError('Unexpected source archive')
        artifact=json.loads(z.read('source-manifest.json'));data=z.read(artifact['jar'])
    if artifact['sourceSha']!=m['source'] or digest(data)!=artifact['sha256']:raise ValueError('CI manifest mismatch')
    base.verify_packaged(data,m['source']);ops,files=operation_files()
    for channel in routing.UNITS:vacant(channel)
    for path in TARGETS:base.root_path(path)
    m.update(operations=ops,artifact=artifact,inventory=inventory(),targets={str(p):base.snapshot(p) for p in TARGETS})
    stage.mkdir(mode=0o700)
    for name,body in files.items():base.private_write(stage/name,body)
    public_dir(ASSETS);current={}
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        for name in z.namelist():
            match=re.fullmatch(r'BOOT-INF/classes/static(/assets/(?:mv39|mv40|mv43|mv46)/[A-Za-z0-9_.-]+)',name)
            if not match:continue
            path=match[1];body=z.read(name);sha=digest(body);directory=ASSETS/sha;public_dir(directory);target=directory/Path(path).name
            if target.exists():
                base.root_path(target)
                if target.stat().st_mode&0o222 or digest(target.read_bytes())!=sha:raise ValueError('Immutable asset collision')
            else:file_bytes(target,body)
            current[path]={'sha256':sha,'file':str(target)}
    m['assets']=current;m['jars']={}
    for channel in routing.UNITS:
        directory=RELEASES/(channel+'-nov18-public-v2026.11.22.1-'+m['source'][:12])
        if directory.exists():raise ValueError('Public generation already exists')
        public_dir(directory);jar=directory/artifact['jar'];file_bytes(jar,data)
        file_bytes(directory/'source-manifest.json',(json.dumps(artifact)+'\n').encode())
        m['jars'][channel]=str(jar);base.private_write(stage/(channel+'.service'),routing.unit(channel,str(jar)).encode())
    original={str(p):p.read_bytes() for p in TARGETS}
    public_assets=[path for path in current if re.fullmatch(r'/assets/(?:mv39|mv43)/[A-Za-z0-9_.-]+',path) and not Path(path).name.startswith('admin-') and re.search(r'\.(?:css|js|ico|png|svg|woff2?)$',path)]
    test_site=routing.test_sources(original[str(SITE)].decode(),public_assets)
    common=routing.asset_map(original[str(ASSET_MAP)].decode(),current).encode();m['proposals']={};m['files']={}
    for channel in ['test','prod']:
        proposed={str(MAP):routing.maintenance_map(original[str(MAP)].decode(),channel=='prod',public_assets).encode(),
                  str(ASSET_MAP):common,str(SITE):(routing.production_version(test_site) if channel=='prod' else test_site).encode()}
        m['proposals'][channel]={}
        for i,(path,body) in enumerate(proposed.items()):
            name=channel+'-target-'+str(i)+'.conf';base.private_write(stage/name,body);m['proposals'][channel][path]=name
    for i,(path,body) in enumerate(original.items()):base.private_write(stage/('original-'+str(i)+'.conf'),body)
    m['original']={path:'original-'+str(i)+'.conf' for i,path in enumerate(original)}
    for channel in ['test','prod']:shadow_validation(stage,m['proposals'][channel],channel)
    for p in stage.iterdir():
        if p.is_file():m['files'][p.name]=digest(p.read_bytes())
    helper=base.maintenance();m['apiBefore']={p:helper.probe(p) for p in helper.API_PROBES}
    for p,identity in m['targets'].items():base.check_snapshot(Path(p),identity)
    source_gate(m);base.save(stage/'manifest.json',m);print(json.dumps({'prepared':True,'source':m['source'],'liveChanges':False}))

def validate(stage):
    base.protected_stage(stage);base.root_path(stage/'manifest.json',True);m=json.loads((stage/'manifest.json').read_text())
    for name,sha in m['files'].items():
        if Path(name).name!=name:raise ValueError('Invalid staged file')
        base.root_path(stage/name,True)
        if digest((stage/name).read_bytes())!=sha:raise ValueError('Staged proposal changed')
    for name in ['release.py','routing.py','catalog_install.py','canary.py','guards.py','qa.py']:
        if HERE!=stage or digest((HERE/name).read_bytes())!=m['files'][name]:raise ValueError('Use only protected staged implementation')
    for path in m['jars'].values():base.jar_proof(Path(path),m['artifact']['sha256'],m['source'])
    return m

def state(channel):return base.System(ROOT).state(routing.UNITS[channel])
def vacant(channel):
    path=Path('/etc/systemd/system')/routing.UNITS[channel]
    base.guards.require_vacant(path,lambda:state(channel),lambda:base.System(ROOT).free(routing.PORTS[channel]))
    old='moneyverse-frontend-consolidated-'+channel+'-v20261121.service';status=base.System(ROOT).state(old)
    enabled=subprocess.run(['systemctl','is-enabled',old],capture_output=True,text=True).stdout.strip()
    if status['MainPID']!='0' or status['ActiveState']!='inactive' or status['DropInPaths'] or enabled!='disabled':raise ValueError('Original presentation unit is not safely retired')
def runtime_proof(channel,m,expected_pid=None,version=True):
    unit=routing.UNITS[channel];path=Path('/etc/systemd/system')/unit;s=state(channel);pid=s.get('MainPID','')
    if (s.get('LoadState')!='loaded' or s.get('ActiveState')!='active' or s.get('FragmentPath')!=str(path)
        or s.get('DropInPaths') or not re.fullmatch('[1-9][0-9]*',pid) or expected_pid and str(expected_pid)!=pid):raise ValueError('Uncertain public runtime ownership')
    jar=Path(m['jars'][channel]);base.jar_proof(jar,m['artifact']['sha256'],m['source']);proc=Path('/proc')/pid;args=(proc/'cmdline').read_bytes().split(b'\0')
    for item in [str(jar),'-Dmoneyverse.runtime-mode=frontend-presentation','--server.address=127.0.0.1',
                 '--server.port='+str(routing.PORTS[channel]),'--moneyverse.admin.source-origin=http://127.0.0.1:4821']:
        if args.count(item.encode())!=1:raise ValueError('Runtime argument mismatch')
    if not (proc/'cwd').resolve().samefile(jar.parent):raise ValueError('Runtime directory mismatch')
    opened=False
    for fd in (proc/'fd').iterdir():
        try:opened=opened or (fd.stat().st_dev,fd.stat().st_ino)==(jar.stat().st_dev,jar.stat().st_ino)
        except FileNotFoundError:pass
    if not opened:raise ValueError('Runtime does not hold packaged JAR')
    rows=subprocess.check_output(['ss','-ltnp'],text=True).splitlines()
    listeners=[row for row in rows if re.search(r'\b127\.0\.0\.1:'+str(routing.PORTS[channel])+r'\s',row)]
    if len(listeners)!=1 or set(re.findall(r'pid=([0-9]+),',listeners[0]))!={pid}:raise ValueError('Serving listener is not the sampled process')
    if version and base.http(routing.PORTS[channel],'/frontend-ui-version')[1].get('id')!=m['source']:raise ValueError('Runtime source mismatch')
    if state(channel).get('MainPID')!=pid:raise ValueError('Runtime changed while sampled')
    return pid

BACKEND_CHECKS={'sourceIdentity','databaseIsolation','readOnly','migrationParity','anonymousSession','walletDenied','adminDenied','stockCanonical','boardCanonical','forgedActorDenied','testCors','privilegeBoundary','syntheticOnly','guestSummaryRedacted','jobsConfiguredOff','botOffline','loopbackSandbox'}
def validate_backend_report(report,m):
    process=report.get('processIdentity',{});database=report.get('database',{});checks=report.get('checks',{})
    if (report.get('applicationSource')!=m['source'] or report.get('jarSha256')!=m['artifact']['sha256']
        or report.get('apiOrigin')!='http://127.0.0.1:55438'
        or process.get('unit')!='moneyverse-nov18-test-backend-v20261122.service'
        or process.get('openJarSha256')!=m['artifact']['sha256'] or process.get('sourceVersion')!=m['source']
        or database.get('name')!='moneyverse_nov18_public_test' or database.get('host')!='127.0.0.1'
        or database.get('port')!=55436 or database.get('role')!='moneyverse_app'
        or database.get('readOnly') is not True or database.get('syntheticOnly') is not True
        or database.get('migrationParity') is not True or database.get('migrationsCount',0)<1
        or any(checks.get(key) is not True for key in BACKEND_CHECKS)):
        raise ValueError('Independent exact-artifact backend Test acceptance incomplete')

def verify_backend_process(report,m):
    validate_backend_report(report,m)
    pid=str(report['processIdentity']['pid']);unit='moneyverse-nov18-test-backend-v20261122.service'
    state=base.System(ROOT).state(unit)
    if (state.get('MainPID')!=pid or state.get('ActiveState')!='active' or state.get('LoadState')!='loaded'
        or state.get('FragmentPath')!='/etc/systemd/system/'+unit or state.get('DropInPaths')):
        raise ValueError('Backend Test process no longer matches its evidence')
    jar=RELEASES/('test-backend-nov18-v2026.11.22.1-'+m['source'][:12])/m['artifact']['jar']
    base.jar_proof(jar,m['artifact']['sha256'],m['source']);proc=Path('/proc')/pid
    args=(proc/'cmdline').read_bytes().split(b'\0')
    if args.count(b'-jar')!=1 or args[args.index(b'-jar')+1]!=str(jar).encode() or (proc/'cwd').resolve()!=Path('/run/moneyverse-nov18-test-backend'):
        raise ValueError('Backend Test executable generation differs')
    opened=False
    for fd in (proc/'fd').iterdir():
        try:opened=opened or (fd.stat().st_dev,fd.stat().st_ino)==(jar.stat().st_dev,jar.stat().st_ino)
        except FileNotFoundError:pass
    if not opened:raise ValueError('Backend Test does not hold its artifact')
    status,value=base.http(55438,'/api/version')
    if status!=200 or value.get('data',{}).get('applicationSourceSha')!=m['source']:
        raise ValueError('Backend Test HTTP source differs')
    if base.System(ROOT).state(unit).get('MainPID')!=pid:raise ValueError('Backend Test process changed')

def accept_backend(stage,m,path):
    path=Path(path);base.root_path(path,True)
    report=json.loads(path.read_text());verify_backend_process(report,m)
    # Only sanitized evidence fields cross into the release receipt.
    safe={key:report[key] for key in ['applicationSource','jarSha256','apiOrigin','processIdentity','database','checks','limitations'] if key in report}
    raw=(json.dumps(safe)+'\n').encode();base.private_write(stage/'test-backend-report.json',raw)
    base.save(stage/'test-backend-accepted.json',{'accepted':True,'source':m['source'],'reportSha256':digest(raw)})
    print(json.dumps({'backendTestAccepted':True,'source':m['source']}))

def require_test_approval(stage,m):
    raw_backend=(stage/'test-backend-report.json').read_bytes();backend=json.loads(raw_backend)
    backend_approval=json.loads((stage/'test-backend-accepted.json').read_text())
    if backend_approval.get('accepted') is not True or backend_approval.get('source')!=m['source'] or backend_approval.get('reportSha256')!=digest(raw_backend):raise ValueError('Backend acceptance receipt changed')
    verify_backend_process(backend,m)
    approval=json.loads((stage/'test-browser-accepted.json').read_text())
    applied=json.loads((stage/'test-apply.json').read_text())
    raw=(stage/'test-browser-report.json').read_bytes();report=json.loads(raw)
    if (approval.get('accepted') is not True or approval.get('source')!=m['source']
        or approval.get('reportSha256')!=digest(raw) or applied.get('accepted') is not True
        or applied.get('source')!=m['source'] or applied.get('artifactSha256')!=m['artifact']['sha256']
        or report.get('source')!=m['source'] or report.get('origin')!='http://test.easy-scraping.com'
        or report.get('failed')!=0 or report.get('cases',0)<240 or report.get('interactionsPassed') is not True
        or report.get('freshProfile') is not True):
        raise ValueError('Verified exact-artifact Test browser acceptance required')

def install(stage,m,channel):
    if channel=='prod':require_test_approval(stage,m)
    source_gate(m);vacant(channel);path=Path('/etc/systemd/system')/routing.UNITS[channel];owned=base.OwnedFiles()
    try:owned.write(path,(stage/(channel+'.service')).read_bytes())
    finally:write_journal(stage,channel+'-unit',owned)
    subprocess.run(['systemctl','daemon-reload'],check=True,capture_output=True);subprocess.run(['systemctl','start',routing.UNITS[channel]],check=True,capture_output=True)
    deadline=time.monotonic()+30
    while True:
        try:
            health=base.http(routing.PORTS[channel],'/frontend-ui-health')
            if health[0]==200 and health[1].get('ok') is True and health[1].get('databaseRequired') is False:pid=runtime_proof(channel,m);break
        except (OSError,ValueError):pass
        if time.monotonic()>deadline:raise RuntimeError('Public runtime readiness failed')
        time.sleep(.2)
    base.save(stage/(channel+'-runtime.json'),{'pid':pid,'source':m['source'],'unit':routing.UNITS[channel]});print(json.dumps({'running':channel,'source':m['source']}))
def request(host,path):
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),base.NoRedirect())
    req=urllib.request.Request('http://127.0.0.1'+path,headers={'Host':host,'Accept':'text/html,application/json'})
    try:response=opener.open(req,timeout=8)
    except urllib.error.HTTPError as failure:response=failure
    with response:return response.status,dict(response.headers),response.read(2*1024*1024)

def acceptance(stage,m,channel):
    host='test.easy-scraping.com' if channel=='test' else 'easy-scraping.com';deadline=time.monotonic()+6
    while True:
        status,headers,body=request(host,'/frontend-ui-version')
        if status==200 and json.loads(body).get('id')==m['source']:break
        if time.monotonic()>deadline:raise RuntimeError('Public route adoption failed')
        time.sleep(.1)
    for path in routing.PAGES:
        status,headers,body=request(host,path)
        if status!=200 or 'X-MV-Frontend-Maintenance' in headers:raise ValueError('Accepted authored route unavailable')
        if path not in ['/frontend-version','/frontend-ui-version'] and b'<!DOCTYPE html>' not in body and b'<!doctype html>' not in body:raise ValueError('Authored route did not serve HTML')
    helper=base.maintenance()
    for path,before in m['apiBefore'].items():
        if helper.probe(path)!=before:raise ValueError('Existing API admission changed')
    for path in ['/wallet','/admin','/status']:
        if request('easy-scraping.com',path)[0]!=503:raise ValueError('Unaccepted document escaped maintenance')
    if channel=='test' and request('easy-scraping.com','/')[0]!=503:raise ValueError('Production changed before Test acceptance')

def apply(stage,m,channel):
    source_gate(m);pid=json.loads((stage/(channel+'-runtime.json')).read_text())['pid'];runtime_proof(channel,m,pid)
    if channel=='prod':
        require_test_approval(stage,m)
        runtime_proof('test',m,json.loads((stage/'test-runtime.json').read_text())['pid']);owned_test=owned_from(stage,'test')
        expected={p:base.snapshot(Path(p)) for p in m['targets']}
        for p in m['targets']:
            if p in owned_test.created and not owned_test.owns(Path(p)):raise ValueError('Test configuration changed')
    else:expected=m['targets']
    unchanged_inventory(m,expected);changes={p:(stage/name).read_bytes() for p,name in m['proposals'][channel].items()};before={p:Path(p).read_bytes() for p in changes}
    for i,(p,body) in enumerate(before.items()):base.private_write(stage/(channel+'-before-'+str(i)+'.conf'),body)
    helper=base.maintenance();helper.DIAGNOSTICS_STAGE=stage
    replace_batch(stage,channel,changes,expected,before,lambda:helper.nginx('test'),lambda:helper.nginx('reload'))
    try:acceptance(stage,m,channel)
    except BaseException:
        restore_batch(stage,channel,before,lambda:helper.nginx('test'),lambda:helper.nginx('reload'));raise
    base.save(stage/(channel+'-apply.json'),{'accepted':True,'source':m['source'],'artifactSha256':m['artifact']['sha256'],'pid':pid,'scope':'authored public pages and pure auth presentations only'})
    print(json.dumps({'connected':channel,'source':m['source']}))
def accept_test(stage,m,report_path):
    report_path=Path(report_path)
    if report_path.is_symlink() or not report_path.is_file():raise ValueError('Actual browser report required')
    raw=report_path.read_bytes();report=json.loads(raw)
    if (report.get('source')!=m['source'] or report.get('origin')!='http://test.easy-scraping.com' or report.get('failed')!=0
        or report.get('cases',0)<240 or report.get('interactionsPassed') is not True or report.get('freshProfile') is not True):raise ValueError('Test browser acceptance incomplete')
    acceptance(stage,m,'test');base.private_write(stage/'test-browser-report.json',raw)
    base.save(stage/'test-browser-accepted.json',{'accepted':True,'source':m['source'],'reportSha256':digest(raw)});print(json.dumps({'browserTestAccepted':True,'source':m['source']}))
def main():
    parser=argparse.ArgumentParser();parser.add_argument('action',choices=['prepare','install-test','apply-test','accept-test','accept-backend','install-prod','apply-prod','rollback-test','rollback-prod'])
    parser.add_argument('--stage',required=True);parser.add_argument('--source-stage');parser.add_argument('--report');args=parser.parse_args();stage=Path(args.stage)
    base.protected_stage(stage,args.action!='prepare')
    with (ROOT/'maintenance.lock').open('rb') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        try:
            if args.action=='prepare':prepare(stage,Path(args.source_stage));return
            m=validate(stage)
            if args.action.startswith('install-'):install(stage,m,args.action.split('-')[1])
            elif args.action.startswith('apply-'):apply(stage,m,args.action.split('-')[1])
            elif args.action=='accept-test':accept_test(stage,m,args.report)
            elif args.action=='accept-backend':accept_backend(stage,m,args.report)
            else:
                channel=args.action.split('-')[1];before={p:(stage/(channel+'-before-'+str(i)+'.conf')).read_bytes() for i,p in enumerate(m['proposals'][channel])}
                helper=base.maintenance();helper.DIAGNOSTICS_STAGE=stage
                print(json.dumps(restore_batch(stage,channel,before,lambda:helper.nginx('test'),lambda:helper.nginx('reload'))))
        except Exception as failure:print(json.dumps({'ok':False,'errorType':type(failure).__name__,'protectedStage':str(stage)}));raise SystemExit(1) from None
if __name__=='__main__':main()
