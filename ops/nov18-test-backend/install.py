#!/usr/bin/env python3
"""One-shot bootstrap of only the newly reserved synthetic Test generation."""
import hashlib,json,os,secrets,shutil,socket,subprocess,time
from pathlib import Path
import backend as b

REPO=Path('/home/debian/mv-nov18-visual-unification-20261121')
CATALOG=Path('/var/lib/moneyverse-frontend-rebuild-20261121/catalog-main-f0336fded6-r6')
def run(args,**kwargs):
    return subprocess.run(args,check=True,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,**kwargs)
def private(path,text,mode=0o600):
    fd=os.open(path,os.O_CREAT|os.O_EXCL|os.O_WRONLY,mode)
    with os.fdopen(fd,'w') as f:f.write(text)
OWNED_STAGE=None
def failure_record(error,owned,stage=b.STAGE):
    if owned is None or stage.is_symlink() or not stage.is_dir():return False
    st=stage.stat()
    if (st.st_dev,st.st_ino)!=owned:return False
    private(stage/('failure-'+str(time.time_ns())+'.txt'),repr(error)+'\n'+getattr(error,'stderr',''))
    return True

def snapshot():
    return json.loads(run(['docker','inspect',b.CONTAINER]).stdout)[0]
def assert_vacant():
    if os.geteuid()!=0:raise ValueError('root required')
    for p in [b.STAGE,b.RELEASE,Path('/etc/systemd/system')/b.UNIT,Path('/run/moneyverse-nov18-test-backend')]:
        if p.exists() or p.is_symlink():raise ValueError('reserved path already exists: '+str(p))
    for directory in ['/etc/systemd/system','/run/systemd/system','/run/systemd/transient','/usr/lib/systemd/system','/lib/systemd/system']:
        for suffix in ['', '.d']:
            target=Path(directory)/(b.UNIT+suffix)
            if target.exists() or target.is_symlink():raise ValueError('existing unit or drop-in must not be shadowed')
    state=run(['systemctl','show',b.UNIT,'-p','LoadState','-p','FragmentPath','-p','ActiveState','-p','DropInPaths','-p','Transient']).stdout
    b.validate_unit_state(dict(line.split('=',1) for line in state.splitlines()))
    for kind,name in [('container',b.CONTAINER),('volume',b.VOLUME)]:
        if subprocess.run(['docker',kind,'inspect',name],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0:raise ValueError('reserved Docker resource exists')
    for port in [55436,55438]:
        with socket.socket() as sock:sock.bind(('127.0.0.1',port))
    image=json.loads(run(['docker','image','inspect',b.IMAGE]).stdout)[0]
    b.validate_image(image)
    manifest=json.loads((CATALOG/'manifest.json').read_text())
    if manifest['applicationSource']!=b.SHA or manifest['jarSha256']!=b.JAR_SHA:raise ValueError('wrong accepted artifact')
    original=Path(manifest['jar'])
    st=original.stat()
    if st.st_uid!=0 or st.st_mode&0o222 or hashlib.sha256(original.read_bytes()).hexdigest()!=b.JAR_SHA:raise ValueError('unprotected original JAR')
    return original

SHIM='''#!/usr/bin/python3
import sys,os,json,subprocess
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
import backend as b
b.validate_authority(os.environ)
receipt=json.loads((b.STAGE/'database-receipt.json').read_text())
item=json.loads(subprocess.check_output(['docker','inspect',b.CONTAINER]))[0]
b.validate_container(item,receipt['containerId'])
args=sys.argv[1:]
if args[:3]!=['-X','-v','ON_ERROR_STOP=1']:raise ValueError('unexpected ci psql prefix')
mapped=b.map_files(args[3:])
cmd=['docker','exec','-i','-e','PGPASSWORD',b.CONTAINER,'psql','-X','-v','ON_ERROR_STOP=1','-h','127.0.0.1','-p','5432','-U','moneyverse_migrator','-d',b.DATABASE]+mapped
raise SystemExit(subprocess.run(cmd,stdin=sys.stdin).returncode)
'''

def main():
    global OWNED_STAGE
    original=assert_vacant()
    os.umask(0o077)
    b.STAGE.mkdir(mode=0o700)
    created=b.STAGE.stat();OWNED_STAGE=(created.st_dev,created.st_ino)
    b.SOURCE.mkdir(mode=0o700)
    # The SQL authority is an immutable commit archive, never the dirty task tree.
    archive=b.STAGE/'source.tar'
    with archive.open('wb') as out:
        subprocess.run(['git','-C',str(REPO),'archive',b.SHA],stdout=out,check=True)
    run(['tar','-xf',str(archive),'-C',str(b.SOURCE)])
    shutil.copyfile(Path(__file__).with_name('backend.py'),b.STAGE/'backend.py')
    admin=secrets.token_hex(32);app=secrets.token_hex(32)
    env={'PGHOST':'127.0.0.1','PGPORT':'55436','PGUSER':'moneyverse_migrator','PGPASSWORD':admin,'PGDATABASE':b.DATABASE,'APP_DB_PASSWORD':app}
    b.validate_authority(env)
    private(b.STAGE/'bootstrap.json',json.dumps(env))
    private(b.STAGE/'postgres.env','POSTGRES_DB='+b.DATABASE+'\nPOSTGRES_USER=moneyverse_migrator\nPOSTGRES_PASSWORD='+admin+'\n')
    runtime=b.runtime_env(app,secrets.token_hex(32),secrets.token_hex(32))
    private(b.STAGE/'runtime.env',''.join(k+'='+v+'\n' for k,v in runtime.items()))
    run(['docker','volume','create','--label',b.LABEL+'='+b.OWNER,b.VOLUME])
    args=['docker','run','--detach','--name',b.CONTAINER,'--label',b.LABEL+'='+b.OWNER,'--restart','unless-stopped','--memory','384m','--cpus','1','--env-file',str(b.STAGE/'postgres.env'),'-p','127.0.0.1:55436:5432','--mount','type=volume,src='+b.VOLUME+',dst=/var/lib/postgresql/data','--mount','type=bind,src='+str(b.SOURCE/'packages/database')+',dst=/bootstrap,readonly',b.IMAGE]
    cid=run(args).stdout.strip()
    item=snapshot();b.validate_container(item,cid)
    private(b.STAGE/'database-receipt.json',json.dumps({'containerId':cid,'imageDigest':b.IMAGE,'volume':b.VOLUME,'source':b.SHA},indent=2))
    for attempt in range(60):
        ready=subprocess.run(['docker','exec',b.CONTAINER,'pg_isready','-h','127.0.0.1','-p','5432','-U','moneyverse_migrator','-d',b.DATABASE],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        if ready.returncode==0:break
        time.sleep(0.5)
    else:raise ValueError('new Test PostgreSQL did not become ready')
    shimdir=b.STAGE/'bin';shimdir.mkdir(mode=0o700)
    private(shimdir/'psql',SHIM,0o700)
    procenv={**os.environ,**env,'PATH':str(shimdir)+':/usr/bin:/bin'}
    with (b.STAGE/'bootstrap.log').open('w') as log:
        subprocess.run(['/usr/bin/node',str(b.SOURCE/'packages/database/ci-apply.mjs')],env=procenv,stdout=log,stderr=subprocess.STDOUT,check=True)
    # Apply the exact application artifact only after the source bootstrap succeeds.
    b.RELEASE.mkdir(mode=0o755)
    os.chmod(b.RELEASE,0o755)
    shutil.copyfile(original,b.JAR);os.chmod(b.JAR,0o444)
    if hashlib.sha256(Path(b.JAR).read_bytes()).hexdigest()!=b.JAR_SHA:raise ValueError('copied JAR mismatch')
    unit=b.render_unit();private(b.STAGE/'backend.service',unit)
    run(['systemd-analyze','verify',str(b.STAGE/'backend.service')])
    private(Path('/etc/systemd/system')/b.UNIT,unit,0o644)
    run(['systemctl','daemon-reload'])
    run(['systemctl','start',b.UNIT])
    print('Isolated Test generation created; run acceptance before declaring readiness.')
if __name__=='__main__':
    try:main()
    except Exception as error:
        # Subprocess stderr/logs may contain private diagnostics; keep them off shared output.
        failure_record(error,OWNED_STAGE)
        print('Test bootstrap failed; private failure record retained. No existing resource was changed.')
        raise SystemExit(1)
