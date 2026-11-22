#!/usr/bin/env python3
"""Protected, explicitly invoked administrator-only canary transaction and inverse.

The old QA receipt is authority to replace that generation. This installer never
adopts a similarly named service or replaces the Nginx site.
"""
import argparse
import contextlib
import fcntl
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import re
import shlex
import socket
import stat
import subprocess
import time
import urllib.error
import urllib.request
import uuid
import zipfile


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


HERE = Path(__file__).resolve().parent
canary = load('owned_canary', HERE/'canary.py')
# A protected stage carries its own exact reviewed dependencies.
DEPENDENCIES = HERE if (HERE/'guards.py').exists() else HERE.parent/'nov18-frontend-rebuild-qa'
guards = load('owned_guards', DEPENDENCIES/'guards.py')
qa = load('owned_qa', DEPENDENCIES/'qa.py')
ROOT = Path('/var/lib/moneyverse-frontend-rebuild-20261121')
BASE = ROOT/'qa-main-72714c3efd-r1'
REPO = Path('/home/debian/mv-nov18-visual-unification-20261121')
REPOSITORY = 'wtrdd1-hash/Woldeok-Moneyverse-Migration'
RELEASES = canary.RELEASE_ROOT
SOURCE_ENV = Path('/home/debian/Woldeok-Moneyverse-Migration/backend/.env')
ENVIRONMENT = canary.ENVIRONMENT
FRONT_UNIT, API_UNIT = canary.FRONT_UNIT, canary.API_UNIT
FRONT_FILE = Path('/etc/systemd/system')/FRONT_UNIT
API_FILE = Path('/etc/systemd/system')/API_UNIT
INCLUDE = qa.INCLUDE
SITE = Path('/etc/nginx/sites-enabled/moneyverse')
MAINTENANCE = ROOT/'maintenance-proposal-r3/runner.py'
BASE_SITE_SHA = '7a80aba9dcd093d105529f4fed8370ff71e446e01f12a661c42b03e1a23dd9a7'
FILES = {'front.before','include.before','front.service','api.service','qa.conf','secret.env',
         'install.py','canary.py','guards.py','qa.py'}
MODE = {FRONT_UNIT:'frontend-presentation', API_UNIT:'catalog-read'}


def digest(data):
    return hashlib.sha256(data).hexdigest()


@contextlib.contextmanager
def private_umask():
    previous = os.umask(0o077)
    try:
        yield
    finally:
        os.umask(previous)


class OwnedFiles(guards.OwnedFiles):
    def write(self, *args, **kwargs):
        # The shared writer chmods after writing. A private umask closes that window.
        with private_umask():
            return super().write(*args, **kwargs)


def private_write(path, data, mode=0o600, replace=False):
    temporary = path.with_name(path.name+'.private-'+uuid.uuid4().hex)
    try:
        fd = os.open(temporary, os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW, mode)
        with os.fdopen(fd, 'wb') as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        if replace:
            os.replace(temporary,path)
        else:
            os.link(temporary,path)
    finally:
        temporary.unlink(missing_ok=True)


def save(path, value):
    private_write(path, (json.dumps(value,indent=2)+'\n').encode(), replace=True)


def snapshot(path):
    if path.is_symlink() or not path.is_file():
        raise ValueError('Expected ordinary file is absent or linked')
    fd = os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
    with os.fdopen(fd,'rb') as stream:
        st=os.fstat(stream.fileno())
        data=stream.read()
    after=path.lstat()
    if (st.st_dev,st.st_ino)!=(after.st_dev,after.st_ino):
        raise ValueError('File changed while inspected')
    return {'dev':st.st_dev,'ino':st.st_ino,'sha256':digest(data),'mode':st.st_mode&0o777,
            'uid':st.st_uid}


def check_snapshot(path, expected):
    if snapshot(path) != expected:
        raise ValueError('File identity, permissions or content changed')


def root_path(path, private=False):
    if path.is_symlink() or not path.exists() or path.stat().st_uid != 0:
        raise ValueError('Root-owned ordinary path required')
    if path.stat().st_mode & (0o077 if private else 0o022):
        raise ValueError('Unsafe root path permissions')
    # Reject symlink ancestors, including a linked protected root.
    if any(parent.is_symlink() for parent in path.parents):
        raise ValueError('Linked ancestor is not permitted')


def protected_stage(stage, exists=True):
    if os.geteuid()!=0 or stage.parent!=ROOT or stage.name in {'.','..'}:
        raise ValueError('Explicit root-private stage required')
    root_path(ROOT,True)
    if stage.is_symlink() or (not exists and stage.exists()):
        raise ValueError('Stage already exists or is linked')
    if exists:
        root_path(stage,True)
        if not stage.is_dir(): raise ValueError('Stage is not a directory')


def read_environment():
    before=snapshot(SOURCE_ENV)
    # Read only this literal key; shell expansion and dotenv execution are forbidden.
    raw=SOURCE_ENV.read_bytes()
    check_snapshot(SOURCE_ENV,before)
    if len(raw)>1024*1024: raise ValueError('Unapproved application environment')
    try:
        candidates=[]
        for line in raw.decode('utf-8').splitlines():
            match=re.match(r'^(?:export[ \t]+)?DATABASE_URL=(.*)$',line)
            if match:
                value=match[1]
                if value[:1] in {'"',"'"}:
                    pieces=shlex.split(value,comments=False,posix=True)
                    if len(pieces)!=1: raise ValueError()
                    value=pieces[0]
                candidates.append(value)
        if len(candidates)!=1:raise ValueError()
        rendered=canary.database_environment(candidates[0])
    except Exception:
        raise ValueError('Unapproved application environment') from None
    return before,rendered


def git(*args):
    return subprocess.check_output(['git','-c','safe.directory='+str(REPO),'-C',str(REPO),*args],
                                   stderr=subprocess.PIPE)


def gh(*args):
    return subprocess.check_output(['runuser','-u','debian','--','gh',*args],cwd=REPO,
                                   text=True,stderr=subprocess.PIPE)


def download(route,path):
    with path.open('xb') as output:
        subprocess.run(['runuser','-u','debian','--','gh','api',route],cwd=REPO,
                       stdout=output,stderr=subprocess.PIPE,check=True)


def current_main(source):
    if gh('api','repos/'+REPOSITORY+'/branches/main','--jq','.commit.sha').strip()!=source:
        raise ValueError('Application source is no longer current main')


def validate_ci(source,ci):
    jobs=ci.get('jobs',[])
    expected={'classify','policy','runtime-check','spring-web-check'}
    if (ci.get('headSha')!=source or ci.get('headBranch')!='main' or ci.get('event')!='push'
        or ci.get('status')!='completed' or ci.get('conclusion')!='success'
        or len(jobs)!=len(expected) or {j.get('name') for j in jobs}!=expected
        or any(j.get('conclusion')!='success' for j in jobs)):
        raise ValueError('Exact-main successful CI is required')


def approved_ci(source,run):
    current_main(source)
    identity=json.loads(gh('api','repos/'+REPOSITORY+'/actions/runs/'+run))
    if identity.get('path')!='.github/workflows/ci.yml' or identity.get('head_sha')!=source or identity.get('head_branch')!='main':
        raise ValueError('Approved CI workflow identity differs')
    validate_ci(source,json.loads(gh('run','view',run,'--json',
                                    'headSha,headBranch,event,status,conclusion,jobs')))


def artifact_still_approved(source,run,proof):
    entries=json.loads(gh('api','repos/'+REPOSITORY+'/actions/runs/'+run+'/artifacts?per_page=100'))['artifacts']
    selected=[a for a in entries if a.get('name')=='spring-native-candidate-'+source]
    if len(selected)!=1:raise ValueError('Approved artifact is no longer unique')
    artifact=selected[0];workflow=artifact.get('workflow_run',{})
    if (artifact.get('id')!=proof['artifactId'] or artifact.get('digest')!='sha256:'+proof['archiveSha256']
        or artifact.get('expired') is not False or str(workflow.get('id'))!=run
        or workflow.get('head_sha')!=source or workflow.get('head_branch')!='main' or proof['run']!=run):
        raise ValueError('Approved artifact identity changed')


def forward_gate(manifest):
    approved_ci(manifest['applicationSource'],manifest['run'])
    artifact_still_approved(manifest['applicationSource'],manifest['run'],manifest['artifactProof'])
    check_snapshot(SOURCE_ENV,manifest['sourceEnv'])


def operational_files():
    head=git('rev-parse','HEAD').decode().strip()
    if not re.fullmatch('[0-9a-f]{40}',head):raise ValueError('Explicit operational revision required')
    files={'install.py':HERE/'install.py','canary.py':HERE/'canary.py',
           'guards.py':DEPENDENCIES/'guards.py','qa.py':DEPENDENCIES/'qa.py'}
    for name,path in files.items():
        folder='nov18-frontend-rebuild-qa' if name in {'guards.py','qa.py'} else 'nov18-catalog-read-canary'
        if path.read_bytes()!=git('show',head+':ops/'+folder+'/'+name):
            raise ValueError('Operational code must equal committed reviewed HEAD')
    copies={name:path.read_bytes() for name,path in files.items()}
    if git('rev-parse','HEAD').decode().strip()!=head:raise ValueError('Operational source advanced during prepare')
    return head,copies


def jar_proof(path,sha,source):
    root_path(path)
    root_path(path.parent)
    if path.stat().st_mode&0o222 or digest(path.read_bytes())!=sha:
        raise ValueError('Immutable JAR changed')
    with zipfile.ZipFile(path) as archive:
        if 'build.sourceRevision='+source not in archive.read('META-INF/build-info.properties').decode():
            raise ValueError('Packaged source changed')
    return snapshot(path)


def verify_packaged(data,source):
    resources=['static/assets/mv39/favicon.ico','static/assets/mv46/admin-shop.js',
               'static/assets/mv46/admin-shop-core.js','static/assets/mv46/admin-shop.css',
               'templates/mv46/admin-shop.html']
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        names=archive.namelist()
        if len(names)!=len(set(names)):raise ValueError('Duplicate JAR entries')
        if 'build.sourceRevision='+source not in archive.read('META-INF/build-info.properties').decode():
            raise ValueError('Packaged source differs')
        for relative in resources:
            expected=git('show',source+':spring-backend/src/main/resources/'+relative)
            if archive.read('BOOT-INF/classes/'+relative)!=expected:
                raise ValueError('Packaged resource differs from selected source')
        for relative in ['com/moneyverse/catalogread/CatalogReadApplication',
                         'com/moneyverse/catalogread/CatalogReadController',
                         'com/moneyverse/adminpresentation/AdminShopPageController']:
            git('show',source+':spring-backend/src/main/java/'+relative+'.java')
            if 'BOOT-INF/classes/'+relative+'.class' not in names:
                raise ValueError('Selected JAR lacks the closed canary runtime')
        # The binding is code-backed and shipped resources must also be selected-source bytes.
        binding=git('show',source+':spring-backend/src/main/java/com/moneyverse/adminpresentation/AdminShopPageController.java')
        if b'moneyverse.admin.catalog-read-path' not in binding or canary.PREFIX.encode()+b'catalog' not in binding:
            raise ValueError('Selected source lacks the closed private binding')


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):
        return None


def http(port,path):
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect())
    request=urllib.request.Request('http://127.0.0.1:'+str(port)+path,headers={'Host':'easy-scraping.com','Accept':'application/json'})
    try:
        response=opener.open(request,timeout=3)
    except urllib.error.HTTPError as failure:
        response=failure
    with response:
        data=response.read(16385)
        if len(data)>16384:raise ValueError('Unbounded readiness response')
        return response.status,json.loads(data) if response.status==200 else None


def edge_status(path,method='GET'):
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect())
    request=urllib.request.Request('http://127.0.0.1'+path,method=method,
                                  headers={'Host':'easy-scraping.com','Accept':'application/json'})
    try:response=opener.open(request,timeout=3)
    except urllib.error.HTTPError as failure:response=failure
    with response:return response.status


def maintenance():
    root_path(MAINTENANCE,True)
    if digest(MAINTENANCE.read_bytes())!='7dbab08f6b977bbfdbafcc18f282351dd63fa930ce8e9577a407d9958321e4c6':
        raise ValueError('Reviewed maintenance helper changed')
    return load('owned_maintenance',MAINTENANCE)


class System:
    def __init__(self,stage):
        self.helper=maintenance()
        self.helper.DIAGNOSTICS_STAGE=stage
    def state(self,unit):
        output=subprocess.check_output(['systemctl','show',unit,'-p','LoadState','-p','ActiveState',
                                       '-p','MainPID','-p','FragmentPath','-p','DropInPaths'],
                                       text=True,stderr=subprocess.PIPE)
        return dict(line.split('=',1) for line in output.splitlines())
    def substate(self,unit):
        return subprocess.check_output(['systemctl','show',unit,'-p','SubState','--value'],
                                       text=True,stderr=subprocess.PIPE).strip()
    def free(self,port):
        if subprocess.check_output(['ss','-H','-ltn','sport','=',':'+str(port)],text=True).strip():return False
        try:
            with socket.socket() as sock:sock.bind(('127.0.0.1',port))
            return True
        except OSError:return False
    def reload(self):
        subprocess.run(['systemctl','daemon-reload'],check=True,capture_output=True)
    def start(self,unit):
        subprocess.run(['systemctl','start',unit],check=True,capture_output=True)
    def stop(self,unit):
        subprocess.run(['systemctl','stop',unit],check=True,capture_output=True)
        if self.state(unit).get('MainPID')!='0':raise ValueError('Owned process did not stop')
    def prove(self,unit,jar,source,expected_pid=None,check_version=True):
        state=self.state(unit);pid=state.get('MainPID','')
        target=FRONT_FILE if unit==FRONT_UNIT else API_FILE
        if (state.get('LoadState')!='loaded' or state.get('ActiveState')!='active'
            or state.get('FragmentPath')!=str(target) or state.get('DropInPaths')!=''
            or not pid.isdigit() or int(pid)<2 or expected_pid is not None and str(expected_pid)!=pid):
            raise ValueError('Process ownership is uncertain')
        process=Path('/proc')/pid
        command=(process/'cmdline').read_bytes().split(b'\0')
        if (str(jar).encode() not in command or ('-Dmoneyverse.runtime-mode='+MODE[unit]).encode() not in command
            or b'--server.address=127.0.0.1' not in command
            or ('--server.port='+('4830' if unit==FRONT_UNIT else '4832')).encode() not in command
            or not (process/'cwd').resolve().samefile(jar.parent)
            or not any(fd.exists() and fd.resolve()==jar and fd.stat().st_ino==jar.stat().st_ino
                       and fd.stat().st_dev==jar.stat().st_dev for fd in (process/'fd').iterdir())):
            raise ValueError('Process executable generation differs')
        if check_version:
            status,version=http(4830 if unit==FRONT_UNIT else 4832,
                                '/frontend-ui-version' if unit==FRONT_UNIT else '/catalog-read-version')
            if status!=200 or version.get('id')!=source:
                raise ValueError('Process packaged source differs')
        return pid
    def ready(self,unit,source):
        front=unit==FRONT_UNIT;port=4830 if front else 4832
        deadline=time.monotonic()+25
        while True:
            try:
                status,health=http(port,'/frontend-ui-health' if front else '/catalog-read-health')
                version_status,version=http(port,'/frontend-ui-version' if front else '/catalog-read-version')
                if (status==version_status==200 and health.get('ok') is True
                    and health.get('databaseRequired') is (not front) and version.get('id')==source
                    and (front or health.get('readOnly') is True and health.get('runtime')=='catalog-read'
                         and health.get('wholeSiteAccepted') is False)):
                    if not front and http(port,'/api/v1/admin/shop/items')[0]!=401:
                        raise ValueError('Anonymous catalog is not refused')
                    return
            except (OSError,ValueError):
                pass
            if time.monotonic()>deadline:raise RuntimeError('Bounded exact-source readiness failed')
            time.sleep(.2)
    def nginx(self,action):self.helper.nginx(action)
    def boundaries(self,before):
        probe=self.helper.probe
        for path in [canary.PREFIX+'admin-shop',canary.PREFIX+'assets/mv46/admin-shop.js',canary.PREFIX+'catalog']:
            if probe(path)['status']!=401:raise ValueError('Anonymous private admission changed')
        if probe(canary.PREFIX+'unknown')['status']!=404:raise ValueError('Unknown QA path admitted')
        if edge_status(canary.PREFIX+'catalog',method='POST')!=405:raise ValueError('QA write admitted')
        if not probe('/',accept='text/html')['maintenance']:raise ValueError('Public maintenance changed')
        for path,old in before.items():
            now=probe(path)
            if now['status']!=old['status'] or now['type']!=old['type'] or now['maintenance']:
                raise ValueError('Existing API admission changed')
        # The Test host's actual external admission is checked by the parent; this
        # local header check verifies the unchanged guarded virtual-host branch.
        request=urllib.request.Request('http://127.0.0.1'+canary.PREFIX+'catalog',
                                      headers={'Host':'test.easy-scraping.com','CF-Connecting-IP':'198.51.100.77'})
        opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect())
        try:response=opener.open(request,timeout=3)
        except urllib.error.HTTPError as failure:response=failure
        with response:
            if response.status!=403:raise ValueError('Test host admission changed')


def require_vacant(system):
    if ENVIRONMENT.exists() or ENVIRONMENT.is_symlink():
        raise ValueError('Existing environment target cannot be adopted')
    guards.require_vacant(API_FILE,lambda:system.state(API_UNIT),lambda:system.free(4832))


def initial_targets(manifest):
    for target,identity in manifest['targets'].items():
        check_snapshot(Path(target),identity)


def loaded_inactive(system,unit,path):
    expected={'LoadState':'loaded','ActiveState':'inactive','MainPID':'0','FragmentPath':str(path),'DropInPaths':''}
    if system.state(unit)!=expected:raise ValueError('Loaded unit identity changed before start')


def prior_base(system):
    protected_stage(BASE)
    root_path(BASE/'manifest.json')
    root_path(BASE/'apply-receipt.json')
    manifest=json.loads((BASE/'manifest.json').read_text())
    expected={'site.before','site.after','qa.conf','qa.service','install.py','qa.py','guards.py'}
    if set(manifest['files'])!=expected:raise ValueError('Unexpected prior QA manifest')
    for name,sha in manifest['files'].items():
        root_path(BASE/name)
        if digest((BASE/name).read_bytes())!=sha:raise ValueError('Prior QA stage changed')
    receipt=json.loads((BASE/'apply-receipt.json').read_text())
    if (receipt.get('unit')!=FRONT_UNIT or receipt.get('applicationSource')!=manifest['applicationSource']
        or receipt.get('jarSha256')!=manifest['jarSha256'] or receipt.get('siteAfter')!=BASE_SITE_SHA
        or manifest['files']['site.after']!=BASE_SITE_SHA):
        raise ValueError('Prior QA receipt differs')
    for path,name in [(SITE,'site.after'),(INCLUDE,'qa.conf'),(FRONT_FILE,'qa.service')]:
        root_path(path)
        if digest(path.read_bytes())!=manifest['files'][name]:raise ValueError('Current QA no longer matches its receipt')
    jar=Path(manifest['jar'])
    jar_proof(jar,manifest['jarSha256'],manifest['applicationSource'])
    system.prove(FRONT_UNIT,jar,manifest['applicationSource'],receipt['mainPid'])
    system.ready(FRONT_UNIT,manifest['applicationSource'])
    return manifest,receipt


def prepare(source,run,stage):
    if not isinstance(source,str) or not re.fullmatch('[0-9a-f]{40}',source) or not isinstance(run,str) or not run.isdigit():
        raise ValueError('Explicit full source and CI run required')
    protected_stage(stage,False)
    operational_source,scripts=operational_files()
    approved_ci(source,run)
    system=System(stage)
    previous,receipt=prior_base(system)
    baseline_targets={str(p):snapshot(p) for p in [FRONT_FILE,INCLUDE,SITE]}
    require_vacant(system)
    for path in [ENVIRONMENT.parent,API_FILE.parent,INCLUDE.parent,RELEASES]:root_path(path)
    env_identity,environment=read_environment()
    stage.mkdir(mode=0o700)
    proof,artifact,data=guards.fetch_artifact(stage,source,run,gh,download,REPOSITORY)
    verify_packaged(data,source)
    generation=RELEASES/('test-nov18-catalog-read-canary-v2026.11.22.1-'+source[:12])
    if generation.exists() or generation.is_symlink():raise ValueError('Immutable generation already exists')
    approved_ci(source,run)
    # Nothing live is replaced by prepare; the immutable executable is retained
    # across inverse so an audit or retry never silently selects another JAR.
    generation.mkdir(mode=0o755)
    jar=generation/artifact['jar']
    private_write(jar,data,0o444)
    private_write(generation/'source-manifest.json',(json.dumps(artifact)+'\n').encode(),0o444)
    units=canary.render_units(str(jar))
    for target,identity in baseline_targets.items():check_snapshot(Path(target),identity)
    files={**scripts,'front.before':FRONT_FILE.read_bytes(),'include.before':INCLUDE.read_bytes(),
           'front.service':units[FRONT_UNIT].encode(),'api.service':units[API_UNIT].encode(),
           'qa.conf':canary.render_config().encode(),'secret.env':environment.encode()}
    for name,value in files.items():private_write(stage/name,value)
    oldjar=Path(previous['jar'])
    manifest={'applicationSource':source,'operationalSource':operational_source,
              'run':run,'artifactProof':proof,'jar':str(jar),'jarSha256':artifact['sha256'],
              'jarIdentity':jar_proof(jar,artifact['sha256'],source),
              'oldJar':str(oldjar),'oldJarSha256':previous['jarSha256'],
              'oldJarIdentity':snapshot(oldjar),'oldSource':previous['applicationSource'],'oldPid':receipt['mainPid'],
              'sourceEnv':env_identity,'files':{name:digest(value) for name,value in files.items()},
              'targets':baseline_targets,
              'apiBefore':{p:system.helper.probe(p) for p in system.helper.API_PROBES}}
    save(stage/'manifest.json',manifest)
    print(json.dumps({'stage':str(stage),'applicationSource':source,'liveChanges':False}))


def validate_stage(stage,forward=False):
    protected_stage(stage)
    root_path(stage/'manifest.json',True)
    manifest=json.loads((stage/'manifest.json').read_text())
    if set(manifest['files'])!=FILES:raise ValueError('Unexpected canary proposal files')
    for name,sha in manifest['files'].items():
        path=stage/name
        root_path(path,True)
        if digest(path.read_bytes())!=sha:raise ValueError('Protected proposal changed')
    for name in ['install.py','canary.py','guards.py','qa.py']:
        if HERE!=stage or digest((HERE/name).read_bytes())!=manifest['files'][name]:
            raise ValueError('Run only protected staged copies')
    for prefix in ['', 'old']:
        key=prefix+'Jar' if prefix else 'jar'
        sha=prefix+'JarSha256' if prefix else 'jarSha256'
        source=manifest['oldSource'] if prefix else manifest['applicationSource']
        jar=Path(manifest[key])
        jar_proof(jar,manifest[sha],source)
        check_snapshot(jar,manifest['oldJarIdentity'] if prefix else manifest['jarIdentity'])
    if forward:
        if (stage/'journal.json').exists():raise ValueError('Stage already attempted; use explicit inverse')
        for parent in [ENVIRONMENT.parent,API_FILE.parent,INCLUDE.parent,RELEASES]:root_path(parent)
        forward_gate(manifest)
    return manifest


def journal_save(stage,journal,owned):
    journal['owned']={path:list(info) for path,info in owned.created.items()}
    journal['recoveries']=owned.recoveries
    save(stage/'journal.json',journal)


def transact(stage,manifest,system):
    forward_gate(manifest)
    initial_targets(manifest)
    require_vacant(system)
    system.prove(FRONT_UNIT,Path(manifest['oldJar']),manifest['oldSource'],manifest['oldPid'])
    system.nginx('test')
    owned=OwnedFiles()
    journal={'owned':{},'pids':{},'frontStopped':False,'accepted':False}
    journal_save(stage,journal,owned)
    def acquire(path,data,**kwargs):
        try:owned.write(path,data,**kwargs)
        finally:journal_save(stage,journal,owned)
    try:
        require_vacant(system)
        acquire(ENVIRONMENT,(stage/'secret.env').read_bytes(),mode=0o600)
        acquire(API_FILE,(stage/'api.service').read_bytes())
        system.reload()
        if not owned.owns(API_FILE) or not owned.owns(ENVIRONMENT):
            raise ValueError('Acquired backend targets changed')
        loaded_inactive(system,API_UNIT,API_FILE)
        system.start(API_UNIT)
        system.ready(API_UNIT,manifest['applicationSource'])
        journal['pids'][API_UNIT]=system.prove(API_UNIT,Path(manifest['jar']),manifest['applicationSource'])
        journal_save(stage,journal,owned)
        # Backend readiness never interrupts the known-good renderer.
        forward_gate(manifest)
        initial_targets(manifest)
        system.prove(FRONT_UNIT,Path(manifest['oldJar']),manifest['oldSource'],manifest['oldPid'])
        journal['frontStopped']=True
        journal_save(stage,journal,owned)
        system.stop(FRONT_UNIT)
        old=manifest['targets'][str(FRONT_FILE)]
        acquire(FRONT_FILE,(stage/'front.service').read_bytes(),replace=True,
                mode=old['mode'],expected=old['sha256'],expected_identity=[old['dev'],old['ino']])
        system.reload()
        if not owned.owns(FRONT_FILE):raise ValueError('Frontend unit changed')
        loaded_inactive(system,FRONT_UNIT,FRONT_FILE)
        if not system.free(4830):raise ValueError('Frontend listener was occupied concurrently')
        system.start(FRONT_UNIT)
        system.ready(FRONT_UNIT,manifest['applicationSource'])
        journal['pids'][FRONT_UNIT]=system.prove(FRONT_UNIT,Path(manifest['jar']),manifest['applicationSource'])
        journal_save(stage,journal,owned)
        forward_gate(manifest)
        check_snapshot(SITE,manifest['targets'][str(SITE)])
        old=manifest['targets'][str(INCLUDE)]
        acquire(INCLUDE,(stage/'qa.conf').read_bytes(),replace=True,
                mode=old['mode'],expected=old['sha256'],expected_identity=[old['dev'],old['ino']])
        system.nginx('test');system.nginx('reload')
        system.boundaries(manifest['apiBefore'])
        journal['accepted']=True
        journal_save(stage,journal,owned)
        receipt={'scope':'ADMIN_PREVIEW_ONLY','applicationSource':manifest['applicationSource'],
                 'operationalSource':manifest.get('operationalSource'),'pids':journal['pids'],
                 'owned':journal['owned'],'recoveries':journal['recoveries'],'jarIdentity':snapshot(Path(manifest['jar'])),
                 'productionMaintenance':True,'bootEnabled':False,'browserAcceptance':'PENDING'}
        save(stage/'apply-receipt.json',receipt)
        return receipt
    except BaseException as failure:
        outcome=rollback(stage,manifest,system,journal,owned)
        save(stage/'apply-failure.json',{'errorType':type(failure).__name__,'rollback':outcome})
        if outcome['errors']:
            raise RuntimeError('Canary inverse incomplete; protected outcome retained') from None
        raise


def stop_acquired(unit,path,jar,source,system,owned,journal,jar_sha):
    if not owned.owns(path):raise ValueError('Owned unit was replaced concurrently')
    if jar.is_symlink() or digest(jar.read_bytes())!=jar_sha:
        raise ValueError('Owned packaged generation changed')
    state=system.state(unit)
    if state=={'LoadState':'not-found','ActiveState':'inactive','MainPID':'0','FragmentPath':'','DropInPaths':''}:
        return
    if state.get('FragmentPath')!=str(path) or state.get('DropInPaths')!='':
        raise ValueError('Owned manager fragment changed')
    if state.get('MainPID')!='0':
        # A failed startup may have no HTTP listener. Acquired file identity,
        # immutable packaged bytes and /proc proof still authorize its cleanup.
        system.prove(unit,jar,source,journal['pids'].get(unit),check_version=False)
        system.stop(unit)
        loaded_inactive(system,unit,path)
    elif state.get('LoadState')=='loaded' and state.get('ActiveState')=='activating' and system.substate(unit)=='auto-restart':
        # PID zero does not mean a Restart=on-failure job is canceled. The
        # acquired fragment and absent drop-ins prove whose pending job to stop.
        if not owned.owns(path):raise ValueError('Owned restart fragment changed')
        system.stop(unit)
        loaded_inactive(system,unit,path)
    elif state.get('LoadState')!='loaded' or state.get('ActiveState') not in {'inactive','failed'}:
        raise ValueError('Owned manager state is uncertain')


def rollback(stage,manifest,system,journal=None,owned=None):
    # The ordinary inverse reads persisted ownership. An interrupted acquisition
    # also retains its in-memory proof when the journal device itself fails.
    if journal is None:journal=json.loads((stage/'journal.json').read_text())
    if owned is None:
        owned=OwnedFiles()
        owned.created={path:tuple(info) for path,info in journal['owned'].items()}
        owned.recoveries=journal.get('recoveries',[])
    outcome={'frontendRestored':False,'includeRestored':False,'nginxReloaded':False,
             'backendRemoved':False,'environmentRemoved':False,'errors':[]}
    completed=journal.setdefault('inverse',{})
    def record_outcome():
        try:save(stage/'rollback-outcome.json',outcome)
        except Exception as error:
            message='outcomeRecord:'+type(error).__name__
            if message not in outcome['errors']:outcome['errors'].append(message)
    def component(name,action):
        try:
            if not completed.get(name):
                action()
                completed[name]=True
                journal_save(stage,journal,owned)
            outcome[name]=True
        except Exception as error:
            outcome['errors'].append(name+':'+type(error).__name__)
            if name in {'frontendRestored','backendRemoved'}:completed.pop(name,None)
            try:journal_save(stage,journal,owned)
            except Exception as checkpoint:
                outcome['errors'].append(name+'Checkpoint:'+type(checkpoint).__name__)
        record_outcome()
    def restore_front():
        phase=journal.setdefault('frontendInverse',{'phase':'new-generation','pid':None})
        tracked=str(FRONT_FILE) in owned.created
        old_hash=manifest['files']['front.before']
        if tracked:
            # Once the restored inode has been checkpointed, every subsequent
            # proof concerns the old generation, including a second invocation.
            if owned.created[str(FRONT_FILE)][2]!=old_hash:
                phase.update(phase='stopping-new',pid=None)
                journal_save(stage,journal,owned)
                stop_acquired(FRONT_UNIT,FRONT_FILE,Path(manifest['jar']),manifest['applicationSource'],system,owned,journal,manifest['jarSha256'])
                phase['phase']='installing-old-file'
                journal_save(stage,journal,owned)
                old=manifest['targets'][str(FRONT_FILE)]
                identity=owned.created[str(FRONT_FILE)]
                try:
                    owned.write(FRONT_FILE,(stage/'front.before').read_bytes(),old['mode'],True,identity[2],identity[:2])
                finally:
                    if owned.owns(FRONT_FILE) and owned.created[str(FRONT_FILE)][2]==old_hash:
                        phase['phase']='old-file-installed'
                    journal_save(stage,journal,owned)
            if not owned.owns(FRONT_FILE):raise ValueError('Restored old frontend file changed')
        else:
            check_snapshot(FRONT_FILE,manifest['targets'][str(FRONT_FILE)])
            if not journal['frontStopped']:phase['pid']=manifest['oldPid']
        if digest(Path(manifest['oldJar']).read_bytes())!=manifest['oldJarSha256']:
            raise ValueError('Preserved old frontend generation changed')
        system.reload()
        if system.state(FRONT_UNIT).get('MainPID')=='0':
            loaded_inactive(system,FRONT_UNIT,FRONT_FILE)
            if not system.free(4830):raise ValueError('Cannot restore old QA onto an occupied port')
            phase.update(phase='starting-old',pid=None)
            journal_save(stage,journal,owned)
            try:
                system.start(FRONT_UNIT)
            finally:
                # start may succeed before the client reports an error. Record
                # its old-JAR identity before readiness or version HTTP can fail.
                if system.state(FRONT_UNIT).get('MainPID')!='0':
                    phase['pid']=system.prove(FRONT_UNIT,Path(manifest['oldJar']),manifest['oldSource'],check_version=False)
                    phase['phase']='started-old'
                    journal_save(stage,journal,owned)
        else:
            phase['pid']=system.prove(FRONT_UNIT,Path(manifest['oldJar']),manifest['oldSource'],phase.get('pid'),check_version=False)
            phase['phase']='started-old'
            journal_save(stage,journal,owned)
        system.ready(FRONT_UNIT,manifest['oldSource'])
        system.prove(FRONT_UNIT,Path(manifest['oldJar']),manifest['oldSource'],phase['pid'])
        phase['phase']='verified-old'
        journal_save(stage,journal,owned)
    component('frontendRestored',restore_front)
    def restore_include():
        if not outcome['frontendRestored']:raise ValueError('Restore prior QA before its route')
        if str(INCLUDE) in owned.created:
            if not owned.owns(INCLUDE):raise ValueError('Owned include changed concurrently')
            identity=owned.created[str(INCLUDE)]
            mode=manifest['targets'][str(INCLUDE)]['mode']
            owned.write(INCLUDE,(stage/'include.before').read_bytes(),mode,True,identity[2],identity[:2])
            journal_save(stage,journal,owned)
        else:
            check_snapshot(INCLUDE,manifest['targets'][str(INCLUDE)])
    component('includeRestored',restore_include)
    def restore_nginx():
        if not outcome['includeRestored']:raise ValueError('Nginx configuration restore incomplete')
        # No site overwrite: independent hardening changes are preserved.
        system.nginx('test');system.nginx('reload')
    component('nginxReloaded',restore_nginx)
    def remove_backend():
        if str(API_FILE) not in owned.created:return
        identity=list(owned.created[str(API_FILE)])
        absent={'LoadState':'not-found','ActiveState':'inactive','MainPID':'0','FragmentPath':'','DropInPaths':''}
        inactive={**absent,'LoadState':'loaded','FragmentPath':str(API_FILE)}
        allowed=[absent,inactive,{**inactive,'ActiveState':'failed'}]
        phase=journal.get('backendInverse')
        if phase is None:
            stop_acquired(API_UNIT,API_FILE,Path(manifest['jar']),manifest['applicationSource'],system,owned,journal,manifest['jarSha256'])
            manager=system.state(API_UNIT)
            if manager not in allowed:raise ValueError('Stopped backend manager identity is uncertain')
            directory,recovery=owned._recovery(API_FILE,'remove',identity)
            current=directory.lstat()
            phase={'phase':'removing','identity':identity,'manager':manager,'directory':str(directory),
                   'directoryIdentity':[current.st_dev,current.st_ino,current.st_mode,current.st_uid],
                   'metadata':snapshot(directory/'recovery.json')}
            journal['backendInverse']=phase
            # Persist the controlled destination before the no-replace move.
            # Its actual held inode can prove an effect whose reply was lost.
            journal_save(stage,journal,owned)
        directory=Path(phase['directory'])
        slot=directory/'displaced'
        current=directory.lstat()
        if (phase.get('phase') not in {'removing','reload-pending'} or phase.get('identity')!=identity
            or phase.get('manager') not in allowed or directory.parent!=API_FILE.parent
            or not re.fullmatch(r'\.'+re.escape(API_FILE.name)+r'\.nov18-qa-[0-9a-f]{32}',directory.name)
            or not stat.S_ISDIR(current.st_mode) or current.st_mode&0o777!=0o700
            or current.st_uid!=os.geteuid()
            or [current.st_dev,current.st_ino,current.st_mode,current.st_uid]!=phase['directoryIdentity']
            or any(parent.is_symlink() for parent in directory.parents)):
            raise ValueError('Backend removal recovery identity changed')
        check_snapshot(directory/'recovery.json',phase['metadata'])
        recovery=next((r for r in owned.recoveries if r['directory']==str(directory)),None)
        if recovery is None or recovery['target']!=str(API_FILE) or recovery['action']!='remove' or recovery['expected']!=identity:
            raise ValueError('Backend removal recovery receipt changed')
        jar=Path(manifest['jar'])
        if jar.is_symlink() or digest(jar.read_bytes())!=manifest['jarSha256']:
            raise ValueError('Stopped backend packaged generation changed')
        def pending():
            if system.state(API_UNIT) not in [phase['manager'],absent]:
                raise ValueError('Stopped backend manager changed before reload')
        pending()
        if API_FILE.exists() or API_FILE.is_symlink():
            if phase['phase']!='removing' or slot.exists() or slot.is_symlink() or not owned.owns(API_FILE):
                raise ValueError('Backend removal target was occupied concurrently')
            try:
                owned._displace(API_FILE,slot,identity,recovery)
                recovery['status']='removed-held'
            finally:
                journal_save(stage,journal,owned)
        def removed():
            if API_FILE.exists() or API_FILE.is_symlink() or not owned._matches(slot,identity):
                raise ValueError('Backend removal requires target absence and retained owned inode')
        removed()
        phase['phase']='reload-pending'
        journal_save(stage,journal,owned)
        pending();removed()
        system.reload()
        removed()
        if system.state(API_UNIT)!=absent:raise ValueError('Backend manager removal is incomplete')
    component('backendRemoved',remove_backend)
    def remove_environment():
        if str(ENVIRONMENT) in owned.created:
            owned.remove(ENVIRONMENT)
    component('environmentRemoved',remove_environment)
    outcome['complete']=not outcome['errors']
    record_outcome()
    outcome['complete']=not outcome['errors']
    return outcome


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action',choices=['prepare','apply','rollback'])
    parser.add_argument('--stage',required=True)
    parser.add_argument('--source');parser.add_argument('--run')
    args=parser.parse_args()
    # Do not resolve away a caller-provided symlink.
    stage=Path(args.stage)
    if not stage.is_absolute() or '..' in stage.parts:raise ValueError('Explicit absolute stage required')
    protected_stage(stage,args.action!='prepare')
    lock_path=ROOT/'maintenance.lock'
    with private_umask():
        fd=os.open(lock_path,os.O_RDWR|os.O_CREAT|os.O_NOFOLLOW,0o600)
    with os.fdopen(fd,'a') as lock:
        st=os.fstat(lock.fileno())
        if st.st_uid!=0 or st.st_mode&0o077:raise ValueError('Protected maintenance lock required')
        fcntl.flock(lock,fcntl.LOCK_EX)
        try:
            if args.action=='prepare':
                prepare(args.source,args.run,stage)
            else:
                manifest=validate_stage(stage,args.action=='apply')
                system=System(stage)
                if args.action=='apply':
                    result=transact(stage,manifest,system)
                    print(json.dumps({'scope':result['scope'],'applicationSource':result['applicationSource'],
                                      'browserAcceptance':'PENDING'}))
                else:
                    outcome=rollback(stage,manifest,system)
                    print(json.dumps({'complete':outcome['complete'],'errorComponents':outcome['errors']}))
                    if not outcome['complete']:raise RuntimeError('Inverse incomplete; protected outcome retained')
        except Exception as failure:
            # Never echo raw subprocess/JDBC errors, URLs, cookies or records.
            print(json.dumps({'ok':False,'errorType':type(failure).__name__,'protectedStage':str(stage)}))
            raise SystemExit(1) from None


if __name__=='__main__':
    main()
