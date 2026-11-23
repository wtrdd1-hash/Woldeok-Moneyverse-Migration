"""Install only an exact tested Test candidate; Production has no command here."""
import argparse, fcntl, hashlib, importlib.util, json, os, pathlib, re, socket, subprocess, time, urllib.request, zipfile, io

HERE=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("test_routing",HERE/"routing.py")
routing=importlib.util.module_from_spec(spec);spec.loader.exec_module(routing)
_spec=importlib.util.spec_from_file_location("test_owned_files",HERE/"owned_files.py")
owned=importlib.util.module_from_spec(_spec);_spec.loader.exec_module(owned)
ROOT=pathlib.Path("/var/lib/moneyverse-test-frontend-20261123")
SITE=pathlib.Path("/etc/nginx/sites-enabled/moneyverse")
UNIT=pathlib.Path("/etc/systemd/system")/routing.UNIT

def sha(data):return hashlib.sha256(data).hexdigest()
def run(*args):return subprocess.check_output(args,text=True,stderr=subprocess.STDOUT)
def capture(path):
    if path.is_symlink():raise ValueError("Ordinary configuration file required")
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
    with os.fdopen(fd,"rb") as f:
        before=os.fstat(f.fileno());data=f.read();after=os.fstat(f.fileno())
    current=path.lstat()
    fields=lambda st:(st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns,st.st_ctime_ns,st.st_mode,st.st_uid)
    if fields(before)!=fields(after) or fields(after)!=fields(current):
        raise ValueError("File changed during consistent capture")
    return data,{"device":before.st_dev,"inode":before.st_ino,"sha256":sha(data),"mode":before.st_mode&0o777,"uid":before.st_uid}
def snapshot(path):return capture(path)[1]
def same(path,expected):
    if snapshot(path)!=expected:raise ValueError("Concurrent file replacement; refusing to overwrite")
def private(path,data):
    fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    with os.fdopen(fd,"wb") as f:f.write(data);f.flush();os.fsync(f.fileno())
def record(stage,name,data):private(stage/name,(json.dumps(data,sort_keys=True,indent=2)+"\n").encode())
def root_dir(path,mode):
    if not path.exists():path.mkdir(mode=mode)
    if path.is_symlink() or path.stat().st_uid!=0 or path.stat().st_mode&0o022:
        raise ValueError("Owned protected directory required")
def atomic(path,data,expected,mode,stage,name):
    same(path,expected)
    writer=owned.OwnedFiles()
    try:
        same(path,expected)
        writer.write(path,data,mode=mode,replace=True,expected=expected["sha256"],
            expected_identity=(expected["device"],expected["inode"]))
        acquired=writer.created.get(str(path))
        if acquired is None:raise ValueError("Installed identity was not acquired")
        proof={"device":acquired[0],"inode":acquired[1],"sha256":acquired[2],"mode":mode,"uid":os.geteuid()}
        same(path,proof)
        record(stage,name+".json",proof)
        return proof
    finally:
        # Keep displaced files in root-private NOREPLACE recovery directories.
        record(stage,name+".recovery.json",writer.recoveries)
def identity(port):
    req=urllib.request.Request("http://127.0.0.1:"+str(port)+"/frontend-ui-version",headers={"Host":"test.easy-scraping.com"})
    with urllib.request.urlopen(req,timeout=8) as r:return json.load(r)
def check_packaged(data,source,expected):
    if not re.fullmatch("[a-f0-9]{40}",source) or sha(data)!=expected:raise ValueError("Exact candidate digest required")
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        props=z.read("META-INF/build-info.properties").decode()
        if "build.sourceRevision="+source not in props or "build.runtimeKind=spring-native" not in props:
            raise ValueError("Packaged source identity mismatch")

def validate_attestation(source,metadata,jobs,artifacts,archive):
    if (metadata.get("name")!="Build Test Candidate" or metadata.get("head_sha")!=source
        or metadata.get("head_branch")!="fix/test-frontend-real-backend-20261123"
        or metadata.get("status")!="completed" or metadata.get("conclusion")!="success"):
        raise ValueError("Exact successful Test candidate CI required")
    required={"verify / classify","verify / policy","verify / runtime-check","verify / spring-web-check"}
    found={j.get("name"):j for j in jobs}
    if any(found.get(n,{}).get("conclusion")!="success" for n in required):
        raise ValueError("Required candidate checks incomplete")
    selected=[a for a in artifacts if a.get("name")=="spring-native-candidate-"+source and a.get("expired") is False]
    if len(selected)!=1 or selected[0].get("digest")!="sha256:"+sha(archive):
        raise ValueError("Attested CI archive digest mismatch")
    return selected[0]

def require_control_only(paths):
    if any(not (p=="AGENTS.md" or p.startswith("docs/") or p.startswith("ops/test-frontend-real-backend/")) for p in paths):
        raise ValueError("Application source changed after the attested candidate")
def operation_revision(source,remote_head):
    repo=HERE.parent.parent
    head=run("git","-C",str(repo),"rev-parse","HEAD").strip()
    if head!=remote_head:raise ValueError("Operational checkpoint is not the pushed branch HEAD")
    run("git","-C",str(repo),"merge-base","--is-ancestor",source,head)
    require_control_only(run("git","-C",str(repo),"diff","--name-only",source,head).splitlines())
    for name in ("deploy.py","routing.py","owned_files.py"):
        expected=subprocess.check_output(["git","-C",str(repo),"show",head+":ops/test-frontend-real-backend/"+name])
        if (HERE/name).read_bytes()!=expected:raise ValueError("Operational code differs from reviewed commit")
    return head

def candidate(archive,source,ci_run):
    if not re.fullmatch("[0-9]+",ci_run):raise ValueError("CI run id required")
    prefix="repos/wtrdd1-hash/Woldeok-Moneyverse-Migration/"
    def gh(path):return json.loads(run("runuser","-u","debian","--","gh","api",prefix+path))
    metadata=gh("actions/runs/"+ci_run)
    jobs=gh("actions/runs/"+ci_run+"/jobs?per_page=100")["jobs"]
    artifacts=gh("actions/runs/"+ci_run+"/artifacts?per_page=100")["artifacts"]
    head=gh("git/ref/heads/fix/test-frontend-real-backend-20261123")["object"]["sha"]
    ops_source=operation_revision(source,head)
    data=archive.read_bytes()
    proof=validate_attestation(source,metadata,jobs,artifacts,data)
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        manifests=[n for n in z.namelist() if n.endswith("source-manifest.json")]
        if len(manifests)!=1:raise ValueError("Unique source manifest required")
        manifest=json.loads(z.read(manifests[0]))
        names=[n for n in z.namelist() if n.rsplit("/",1)[-1]==manifest.get("jar") and n.endswith(".jar") and not n.endswith("-plain.jar")]
        if manifest.get("sourceSha")!=source or len(names)!=1:raise ValueError("Source manifest mismatch")
        jar=z.read(names[0]);expected=manifest.get("sha256")
        check_packaged(jar,source,expected)
    return jar,expected,{"ciRun":ci_run,"artifactId":proof["id"],"archiveSha256":sha(data),"source":source,"jarSha256":expected,"operationalSource":ops_source}

def validate_unit_vacant():
    if UNIT.exists() or UNIT.is_symlink():raise ValueError("Refusing existing unit")
    state=run("systemctl","show",routing.UNIT,"-p","LoadState","-p","FragmentPath","-p","DropInPaths","-p","MainPID")
    for line in state.splitlines():
        key,_,value=line.partition("=")
        if key=="LoadState" and value!="not-found":raise ValueError("Foreign manager authority")
        if key in ("FragmentPath","DropInPaths") and value:raise ValueError("Foreign unit authority")
        if key=="MainPID" and value!="0":raise ValueError("Unit already owns a process")
    with socket.socket() as sock:sock.bind(("127.0.0.1",routing.PORT))

def install(archive,source,ci_run):
    data,expected,attestation=candidate(archive,source,ci_run);validate_unit_vacant()
    root_dir(ROOT,0o700);stage=ROOT/source
    if stage.exists():raise ValueError("Candidate stage is immutable; inspect prior receipt")
    stage.mkdir(mode=0o700)
    record(stage,"attestation.json",attestation)
    target=SITE.resolve(strict=True)
    if not str(target).startswith("/etc/nginx/"):raise ValueError("Unexpected site authority")
    original,before=capture(target);mode=before["mode"]
    proposed=routing.site(original.decode()).encode()
    a,b=routing.span(original.decode());c,d=routing.span(proposed.decode())
    if original.decode()[:a]!=proposed.decode()[:c] or original.decode()[b:]!=proposed.decode()[d:]:
        raise ValueError("Non-Test configuration changed")
    private(stage/"site.before",original);private(stage/"site.after",proposed)
    record(stage,"before.json",{"target":str(target),"identity":before,"mode":mode,"source":source,"jarSha256":expected})
    base=pathlib.Path(routing.BASE);root_dir(base,0o755)
    generation=base/source
    if generation.exists():raise ValueError("Immutable generation already exists")
    generation.mkdir(mode=0o755);app=generation/"app.jar"
    private(app,data);os.chmod(app,0o444)
    private(UNIT,routing.unit(str(app)).encode());os.chmod(UNIT,0o644)
    record(stage,"unit.json",snapshot(UNIT))
    run("systemctl","daemon-reload");run("systemctl","start",routing.UNIT)
    for attempt in range(30):
        try:
            if identity(routing.PORT).get("id")==source:break
        except Exception:pass
        time.sleep(1)
    else:raise ValueError("Candidate failed startup; traffic remains unchanged")
    pid=int(run("systemctl","show",routing.UNIT,"-p","MainPID","--value").strip())
    cmd=pathlib.Path("/proc")/str(pid)/"cmdline"
    if str(app).encode() not in cmd.read_bytes().split(b"\0"):raise ValueError("Running candidate JAR mismatch")
    record(stage,"runtime.json",{"pid":pid,"source":source,"jarSha256":sha(app.read_bytes()),"unit":routing.UNIT})
    # A syntax failure never reloads Nginx; restore only the bytes installed by this operation.
    owned=atomic(target,proposed,before,mode,stage,"site-owned")
    try:
        run("nginx","-t");run("systemctl","reload","nginx")
        wait_identity(80,source,lambda:same(target,owned))
        for path in routing.READS:
            req=urllib.request.Request("http://127.0.0.1"+path,headers={"Host":"test.easy-scraping.com","Accept":"application/json"})
            with urllib.request.urlopen(req,timeout=10) as r:
                if r.status!=200:raise ValueError("Real Test backend failed")
        run("systemctl","enable",routing.UNIT)
        record(stage,"accepted.json",{"source":source,"jarSha256":expected,"pid":pid,"testOnly":True,"wholeSiteAccepted":False,"productionConfigurationUnchanged":True,"siteReceipt":"site-owned.json"})
    except Exception:
        atomic(target,original,owned,mode,stage,"site-restored")
        run("nginx","-t");run("systemctl","reload","nginx")
        raise
    print(json.dumps({"source":source,"testOnly":True,"stage":str(stage),"frontendPort":routing.PORT,"realBackendPort":55438}))


def wait_identity(port,source,verify,timeout=8):
    deadline=time.monotonic()+timeout
    while time.monotonic()<deadline:
        verify()
        try:ready=identity(port).get("id")==source
        except Exception:ready=False
        if ready:
            verify();return
        time.sleep(.1)
    raise ValueError("New-source readiness did not converge; old HTML is never acceptance")

def connect_prepared(archive,source,ci_run):
    data,expected,attestation=candidate(archive,source,ci_run)
    stage=ROOT/source;root_dir(stage,0o700)
    if (stage/"accepted.json").exists():raise ValueError("Candidate already accepted")
    before=json.loads((stage/"before.json").read_text())
    target=SITE.resolve(strict=True)
    if str(target)!=before["target"]:raise ValueError("Site authority changed")
    original=(stage/"site.before").read_bytes()
    proposed=(stage/"site.after").read_bytes()
    if routing.site(original.decode()).encode()!=proposed:raise ValueError("Prepared Test transformation changed")
    restored=json.loads((stage/"site-restored.json").read_text())
    same(target,restored)
    if original!=target.read_bytes():raise ValueError("Only a verified own inverse may resume")
    unit_proof=json.loads((stage/"unit.json").read_text())
    runtime=json.loads((stage/"runtime.json").read_text())
    app=pathlib.Path(routing.BASE)/source/"app.jar"
    if runtime["source"]!=source or sha(app.read_bytes())!=expected or runtime["jarSha256"]!=expected:
        raise ValueError("Prepared runtime artifact changed")
    def process():
        same(UNIT,unit_proof)
        pid=int(run("systemctl","show",routing.UNIT,"-p","MainPID","--value").strip())
        if pid!=runtime["pid"] or str(app).encode() not in (pathlib.Path("/proc")/str(pid)/"cmdline").read_bytes().split(b"\0"):
            raise ValueError("Prepared unit process changed")
    wait_identity(routing.PORT,source,process)
    record(stage,"retry-attestation.json",attestation)
    acquired=atomic(target,proposed,restored,before["mode"],stage,"site-retry-owned")
    try:
        run("nginx","-t");run("systemctl","reload","nginx")
        wait_identity(80,source,lambda:same(target,acquired))
        for path in routing.READS:
            req=urllib.request.Request("http://127.0.0.1"+path,headers={"Host":"test.easy-scraping.com","Accept":"application/json"})
            with urllib.request.urlopen(req,timeout=10)as r:
                if r.status!=200 or not isinstance(json.load(r),dict):raise ValueError("Real Test backend response invalid")
        process();run("systemctl","enable",routing.UNIT)
        record(stage,"accepted.json",{"source":source,"operationalSource":attestation["operationalSource"],"jarSha256":expected,"pid":runtime["pid"],"testOnly":True,"wholeSiteAccepted":False,"productionConfigurationUnchanged":True,"siteReceipt":"site-retry-owned.json"})
    except Exception:
        atomic(target,original,acquired,before["mode"],stage,"site-retry-restored")
        run("nginx","-t");run("systemctl","reload","nginx");raise
    print(json.dumps({"source":source,"testOnly":True,"stage":str(stage),"frontendPort":routing.PORT,"realBackendPort":55438}))

def inverse(source):
    if not re.fullmatch("[a-f0-9]{40}",source):raise ValueError("Invalid source")
    stage=ROOT/source
    before=json.loads((stage/"before.json").read_text())
    target=pathlib.Path(before["target"])
    accepted=json.loads((stage/"accepted.json").read_text())
    receipt=accepted["siteReceipt"]
    if receipt not in ("site-owned.json","site-retry-owned.json"):raise ValueError("Unknown ownership receipt")
    owned=json.loads((stage/receipt).read_text())
    atomic(target,(stage/"site.before").read_bytes(),owned,before["mode"],stage,"manual-restored")
    run("nginx","-t");run("systemctl","reload","nginx")
    # Preserve the candidate and receipt for diagnosis; no unrelated service is stopped.
    record(stage,"inverse.json",{"source":source,"routingRestored":True})

def main():
    p=argparse.ArgumentParser();p.add_argument("action",choices=("install","connect","inverse"))
    p.add_argument("--source",required=True);p.add_argument("--archive",type=pathlib.Path);p.add_argument("--ci-run")
    a=p.parse_args()
    if os.geteuid()!=0:raise ValueError("Root-owned deployment required")
    root_dir(ROOT,0o700)
    with (ROOT/"operation.lock").open("a+b") as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        if a.action=="inverse":inverse(a.source)
        else:
            if a.archive is None or not a.ci_run:raise ValueError("Attested CI candidate archive required")
            (connect_prepared if a.action=="connect" else install)(a.archive,a.source,a.ci_run)
if __name__=="__main__":main()
