#!/usr/bin/env python3
"""Bounded continuity update for only the already accepted owned Test generation."""
import hashlib,json,os,stat,subprocess,time
from pathlib import Path
import backend as b

HISTORY=b.STAGE/'continuity-v20261122.1'
UNIT=Path('/etc/systemd/system')/b.UNIT
BOOT=Path('/etc/systemd/system/multi-user.target.wants')/b.UNIT

def run(args):
    return subprocess.run(args,check=True,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
def identity(path,symlink=False):
    st=path.lstat() if symlink else path.stat()
    result={'dev':st.st_dev,'ino':st.st_ino,'uid':st.st_uid,'mode':stat.S_IMODE(st.st_mode)}
    if symlink:result['target']=os.readlink(path)
    else:result['sha256']=hashlib.sha256(path.read_bytes()).hexdigest()
    return result
def private(path,text):
    fd=os.open(path,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
    with os.fdopen(fd,'w') as f:f.write(text)
def persist(receipt):
    tmp=HISTORY/'receipt.next'
    private(tmp,json.dumps(receipt,indent=2)+'\n')
    os.replace(tmp,HISTORY/'receipt.json')
OWNED_HISTORY=None
def failure_record(error,owned,history=HISTORY):
    if owned is None or history.is_symlink() or not history.is_dir():return False
    st=history.stat()
    if (st.st_dev,st.st_ino)!=owned:return False
    private(history/('failure-'+str(time.time_ns())+'.txt'),repr(error)+'\n'+getattr(error,'stderr',''))
    return True

def current():
    values=run(['systemctl','show',b.UNIT,'-p','LoadState','-p','ActiveState','-p','SubState','-p','MainPID','-p','FragmentPath','-p','DropInPaths','-p','Transient','-p','UnitFileState'])
    return dict(line.split('=',1) for line in values.splitlines())
def container():
    return json.loads(run(['docker','inspect',b.CONTAINER]))[0]
def pin_process(pid):
    jar=Path(b.JAR);jst=jar.stat()
    if jst.st_uid!=0 or jst.st_mode&0o222 or hashlib.sha256(jar.read_bytes()).hexdigest()!=b.JAR_SHA:raise ValueError('immutable Test artifact mismatch')
    opened=False
    for fd in Path('/proc',str(pid),'fd').iterdir():
        try:
            st=fd.stat()
            if (st.st_dev,st.st_ino)==(jst.st_dev,jst.st_ino):opened=True
        except FileNotFoundError:pass
    cmd=Path('/proc',str(pid),'cmdline').read_bytes().split(b'\0')
    if not opened or b.JAR.encode() not in cmd or Path('/proc',str(pid),'cwd').resolve()!=Path('/run/moneyverse-nov18-test-backend'):raise ValueError('foreign Test process')
def assert_cas(path,expected):
    if path.is_symlink() or identity(path)!=expected:raise ValueError('owned file changed before mutation')
def main():
    global OWNED_HISTORY
    if os.geteuid()!=0:raise ValueError('root required')
    if HISTORY.exists() or HISTORY.is_symlink():raise ValueError('continuity history already exists')
    accepted=json.loads((b.STAGE/'acceptance.json').read_text())
    if not accepted.get('accepted') or accepted['applicationSource']!=b.SHA or accepted['jarSha256']!=b.JAR_SHA:raise ValueError('prior actual Test acceptance is missing')
    before_state=current()
    if any(before_state.get(k)!=v for k,v in {'LoadState':'loaded','ActiveState':'active','SubState':'running','FragmentPath':str(UNIT),'DropInPaths':'','Transient':'no','UnitFileState':'disabled'}.items()):raise ValueError('foreign or unowned current unit generation')
    pid=int(before_state['MainPID'])
    if pid!=accepted['processIdentity']['pid']:raise ValueError('Test PID advanced after acceptance')
    pin_process(pid)
    old=(b.STAGE/'backend.service').read_text()
    old_expected=b.render_unit().replace('StartLimitIntervalSec=300\nStartLimitBurst=5\n','').replace('Restart=on-failure\nRestartSec=3\nSuccessExitStatus=143\n','Restart=no\n')
    if old!=old_expected or UNIT.is_symlink() or UNIT.read_text()!=old:raise ValueError('unit no longer matches original private bootstrap proof')
    if BOOT.exists() or BOOT.is_symlink():raise ValueError('preexisting boot link is not adopted')
    receipt=json.loads((b.STAGE/'database-receipt.json').read_text())
    item=container();b.validate_container(item,receipt['containerId'])
    if item['HostConfig']['RestartPolicy']['Name']!='no':raise ValueError('container restart policy changed')
    unit_before=identity(UNIT);env_before=identity(b.STAGE/'runtime.env')
    original_before=identity(b.STAGE/'backend.service')
    if unit_before['uid']!=0 or env_before['uid']!=0 or env_before['mode']!=0o600:raise ValueError('private/current file ownership mismatch')
    os.umask(0o077);HISTORY.mkdir(mode=0o700)
    hst=HISTORY.stat();OWNED_HISTORY=(hst.st_dev,hst.st_ino)
    private(HISTORY/'unit.before',old)
    private(HISTORY/'unit.after',b.render_unit())
    private(HISTORY/'acceptance.before.json',json.dumps(accepted,indent=2)+'\n')
    op_source={}
    for name in ['backend.py','install.py','acceptance.py','test_backend.py','continuity.py']:
        p=Path(__file__).with_name(name);data=p.read_text()
        before=data
        if name=='backend.py':before=before.replace('StartLimitIntervalSec=300\nStartLimitBurst=5\n','').replace('Restart=on-failure\nRestartSec=3\nSuccessExitStatus=143\n','Restart=no\n')
        if name=='install.py':before=before.replace("'--restart','unless-stopped'","'--restart','no'")
        op_source[name]={'after':hashlib.sha256(data.encode()).hexdigest()}
        if name in ['backend.py','install.py']:op_source[name]['before']=hashlib.sha256(before.encode()).hexdigest()
        if name=='acceptance.py':op_source[name]['before']='202d143b4d9120ecca18c6fdbfcd43bff31bebcd424434b84a74647ff6bfa8f1'
        if name=='test_backend.py':op_source[name]['before']='b39e880c92c6ef8c20c85128b813491f853d10c8ebd004e69e1b507aa8d037d4'
    out={'applicationSource':b.SHA,'jarSha256':b.JAR_SHA,'phase':'prepared','beforePid':pid,'unitBefore':unit_before,'originalBootstrapUnit':original_before,'environmentUnchanged':False,'containerId':receipt['containerId'],'containerRestartBefore':'no','sourceDigestDelta':op_source}
    persist(out)
    assert_cas(UNIT,unit_before);assert_cas(b.STAGE/'runtime.env',env_before)
    if current()!=before_state:raise ValueError('manager state advanced')
    b.validate_container(container(),receipt['containerId'])
    tmp=UNIT.with_name('.'+b.UNIT+'.continuity-tmp')
    fd=os.open(tmp,os.O_CREAT|os.O_EXCL|os.O_WRONLY,unit_before['mode'])
    with os.fdopen(fd,'w') as f:f.write(b.render_unit())
    os.chmod(tmp,unit_before['mode'])
    assert_cas(UNIT,unit_before);os.replace(tmp,UNIT)
    out['phase']='unit-replaced';out['unitAfter']=identity(UNIT);persist(out)
    run(['systemctl','daemon-reload'])
    run(['systemctl','restart',b.UNIT])
    out['phase']='unit-restarted';out['afterPid']=int(current()['MainPID']);persist(out)
    if BOOT.exists() or BOOT.is_symlink():raise ValueError('boot link appeared before enable')
    run(['systemctl','enable',b.UNIT])
    if not BOOT.is_symlink() or BOOT.resolve()!=UNIT or BOOT.lstat().st_uid!=0:raise ValueError('boot link ownership mismatch')
    out['bootLink']=identity(BOOT,True);out['phase']='unit-enabled';persist(out)
    b.validate_container(container(),receipt['containerId'])
    run(['docker','update','--restart','unless-stopped',receipt['containerId']])
    after=container();b.validate_container(after,receipt['containerId'])
    if after['HostConfig']['RestartPolicy']['Name']!='unless-stopped':raise ValueError('container policy did not apply')
    if identity(b.STAGE/'runtime.env')!=env_before or identity(b.STAGE/'backend.service')!=original_before:raise ValueError('private bootstrap or environment changed')
    out['environmentUnchanged']=True;out['containerRestartAfter']='unless-stopped';out['phase']='configured-awaiting-acceptance'
    persist(out)
    print('Owned Test continuity configured; new actual Test acceptance is required.')
if __name__=='__main__':
    try:main()
    except Exception as error:
        failure_record(error,OWNED_HISTORY)
        print('Continuity refused or failed; inspect private history. No unowned resource is authorized.')
        raise SystemExit(1)
