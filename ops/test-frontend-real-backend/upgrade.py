"""Replace only the previously verified own Test frontend unit, retaining an inverse."""
import argparse,fcntl,importlib.util,json,os,pathlib,re,time
HERE=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("native_test_deploy",HERE/"deploy.py")
deploy=importlib.util.module_from_spec(spec);spec.loader.exec_module(deploy)
UNIT=deploy.UNIT

def jar_path(source):
    if not re.fullmatch("[a-f0-9]{40}",source):raise ValueError("Exact source required")
    return deploy.routing.BASE+"/"+source+"/app.jar"

def retarget(original,previous,source):
    if original!=deploy.routing.unit(jar_path(previous)).encode():
        raise ValueError("Only the canonical owned Test frontend may be replaced")
    return deploy.routing.unit(jar_path(source)).encode()

def require_process(pid,jar,proc=pathlib.Path("/proc")):
    if type(pid)is not int or pid<1:raise ValueError("Positive owned process required")
    p=proc/str(pid);jar=pathlib.Path(jar)
    if str(jar).encode() not in (p/"cmdline").read_bytes().split(b"\0") or (p/"cwd").readlink()!=jar.parent:
        raise ValueError("Foreign process command or working directory")
    held=False
    for fd in (p/"fd").iterdir():
        try:held=held or fd.readlink()==jar
        except OSError:pass
    if not held:raise ValueError("Process does not hold the immutable Test JAR")

def manager():
    state={}
    for l in deploy.run("systemctl","show",deploy.routing.UNIT,"-p","MainPID","-p","FragmentPath","-p","DropInPaths").splitlines():
        k,_,v=l.partition("=");state[k]=v
    if state.get("FragmentPath")!=str(UNIT) or state.get("DropInPaths"):
        raise ValueError("Foreign systemd authority")
    return int(state["MainPID"])


def recovery_state(stage,unit):
    before=json.loads((stage/"unit-before.json").read_text())
    intent_path=stage/"unit-owned.intent.json"
    intent=json.loads(intent_path.read_text()) if intent_path.exists() else None
    if unit.exists() or unit.is_symlink():
        now=deploy.snapshot(unit)
        if now==before:return "previous",now,None
        if intent and intent.get("path")==str(unit) and now==intent.get("candidate"):
            return "candidate",now,None
        raise ValueError("Recovery refuses a foreign unit occupant")
    if not intent or intent.get("path")!=str(unit):raise ValueError("Missing ownership intent")
    directory=pathlib.Path(intent["recoveryDirectory"])
    if directory.parent!=unit.parent or not directory.name.startswith("."+unit.name+".nov18-qa-"):
        raise ValueError("Unapproved recovery directory")
    slot=directory/"displaced";deploy.same(slot,before)
    return "displaced",before,slot

def wait_process(jar,verify,timeout=5):
    deadline=time.monotonic()+timeout
    while time.monotonic()<deadline:
        verify()
        try:
            pid=manager()
            if pid==0:return 0
            require_process(pid,jar);return pid
        except (OSError,ValueError):pass
        time.sleep(.1)
    raise ValueError("Test process ownership did not become provable")

def recover(stage,context):
    old=pathlib.Path(jar_path(context["previous"]));new=pathlib.Path(jar_path(context["source"]))
    original=(stage/"unit.before").read_bytes()
    retarget(original,context["previous"],context["source"])
    if deploy.sha(old.read_bytes())!=context["previousJarSha256"]:
        raise ValueError("Inverse artifact changed")
    kind,proof,slot=recovery_state(stage,UNIT)
    if kind=="candidate":
        if proof["sha256"]!=deploy.sha(deploy.routing.unit(str(new)).encode()):
            raise ValueError("Planned unit bytes are not the candidate")
        wait_process(new,lambda:deploy.same(UNIT,proof))
        deploy.run("systemctl","stop",deploy.routing.UNIT)
        if manager()!=0:raise ValueError("Owned candidate did not stop")
        proof=deploy.atomic(UNIT,original,proof,0o644,stage,"unit-restored")
    elif kind=="displaced":
        # A hard link cannot replace a foreign occupant arriving after the check.
        os.link(slot,UNIT);deploy.same(UNIT,proof)
    deploy.same(UNIT,proof)
    deploy.run("systemctl","daemon-reload")
    running=wait_process(old,lambda:deploy.same(UNIT,proof))
    if running==0:deploy.run("systemctl","start",deploy.routing.UNIT)
    def verify():
        deploy.same(UNIT,proof);manager()
    deploy.wait_identity(deploy.routing.PORT,context["previous"],verify,timeout=30)
    pid=wait_process(old,verify)
    if not pid:raise ValueError("Restored source has no owned process")
    deploy.wait_identity(80,context["previous"],verify)
    deploy.record(stage,"rollback.json",{"source":context["previous"],"pid":pid,"unit":proof,"testOnly":True})

def upgrade(archive,source,ci_run,previous):
    data,expected,attestation=deploy.candidate(archive,source,ci_run)
    if source==previous:raise ValueError("Upgrade requires a different exact artifact")
    old_stage=deploy.ROOT/previous;deploy.root_dir(old_stage,0o700)
    accepted=json.loads((old_stage/"accepted.json").read_text())
    runtime=json.loads((old_stage/"runtime.json").read_text())
    old_proof=json.loads((old_stage/"unit.json").read_text())
    old_jar=pathlib.Path(jar_path(previous))
    original,before=deploy.capture(UNIT)
    if before!=old_proof or accepted["source"]!=previous or runtime["source"]!=previous:
        raise ValueError("Previously accepted unit identity changed")
    if deploy.sha(old_jar.read_bytes())!=accepted["jarSha256"]:raise ValueError("Previous artifact changed")
    pid=manager()
    if pid!=runtime["pid"]:raise ValueError("Previous process changed; fresh acceptance required")
    require_process(pid,old_jar)
    if deploy.identity(deploy.routing.PORT).get("id")!=previous:raise ValueError("Previous source changed")
    unit=retarget(original,previous,source)
    site=deploy.SITE.resolve(strict=True);site_proof=deploy.snapshot(site)
    text=site.read_text();a,b=deploy.routing.span(text)
    if text[a:b]!=deploy.routing.server():raise ValueError("Test routing no longer matches the verified lane")
    deploy.root_dir(deploy.ROOT,0o700)
    stage=deploy.ROOT/source
    if stage.exists():raise ValueError("Immutable upgrade stage already exists")
    stage.mkdir(mode=0o700)
    deploy.record(stage,"attestation.json",attestation)
    context={"kind":"test-frontend-upgrade","source":source,"previous":previous,
        "previousPid":pid,"previousJarSha256":accepted["jarSha256"],"jarSha256":expected}
    deploy.record(stage,"upgrade-context.json",context)
    deploy.private(stage/"unit.before",original)
    deploy.record(stage,"unit-before.json",before)
    deploy.record(stage,"nginx-unchanged.json",site_proof)
    generation=pathlib.Path(jar_path(source)).parent
    deploy.root_dir(generation.parent,0o755)
    if generation.exists():raise ValueError("Immutable upgrade generation already exists")
    generation.mkdir(mode=0o755)
    jar=generation/"app.jar";deploy.private(jar,data);os.chmod(jar,0o444)
    # Recovery intent exists before any service transition, including a process crash.
    deploy.record(stage,"transition-intent.json",{"source":source,"previous":previous,"previousPid":pid})
    try:
        deploy.same(UNIT,before)
        if manager()!=pid:raise ValueError("Previous manager process changed")
        require_process(pid,old_jar)
        deploy.run("systemctl","stop",deploy.routing.UNIT)
        if manager()!=0:raise ValueError("Previous renderer did not stop")
        acquired=deploy.atomic(UNIT,unit,before,0o644,stage,"unit-owned")
        deploy.record(stage,"unit.json",acquired)
        deploy.record(stage,"start-intent.json",{"source":source,"previous":previous})
        deploy.run("systemctl","daemon-reload");deploy.run("systemctl","start",deploy.routing.UNIT)
        def verify():
            deploy.same(UNIT,acquired)
            manager()
        deploy.wait_identity(deploy.routing.PORT,source,verify,timeout=30)
        verify();new_pid=manager();require_process(new_pid,jar)
        deploy.record(stage,"runtime.json",{"source":source,"pid":new_pid,"jarSha256":expected,"unit":deploy.routing.UNIT})
        deploy.wait_identity(80,source,verify)
        deploy.same(site,site_proof)
        if deploy.run("systemctl","is-enabled",deploy.routing.UNIT).strip()!="enabled":
            raise ValueError("Own Test restart policy is not enabled")
        deploy.record(stage,"accepted.json",{"kind":"test-frontend-upgrade","source":source,"previousSource":previous,
            "operationalSource":attestation["operationalSource"],"jarSha256":expected,"pid":new_pid,
            "testOnly":True,"wholeSiteAccepted":False,"nginxConfigurationUnchanged":True})
    except Exception:
        recover(stage,context);raise
    print(json.dumps({"source":source,"previousSource":previous,"pid":new_pid,"testOnly":True,"nginxConfigurationUnchanged":True}))

def main():
    p=argparse.ArgumentParser();p.add_argument("action",choices=("upgrade","inverse"))
    p.add_argument("--source",required=True);p.add_argument("--previous");p.add_argument("--archive",type=pathlib.Path);p.add_argument("--ci-run")
    a=p.parse_args();jar_path(a.source)
    if os.geteuid()!=0:raise ValueError("Root-owned operation required")
    deploy.root_dir(deploy.ROOT,0o700)
    with(deploy.ROOT/"operation.lock").open("a+b")as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        if a.action=="inverse":
            stage=deploy.ROOT/a.source;deploy.root_dir(stage,0o700)
            context=json.loads((stage/"upgrade-context.json").read_text())
            if context.get("source")!=a.source or context.get("kind")!="test-frontend-upgrade":raise ValueError("Wrong upgrade receipt")
            recover(stage,context)
        else:
            if not a.previous or a.archive is None or not a.ci_run:raise ValueError("Explicit accepted predecessor and attested candidate required")
            jar_path(a.previous);upgrade(a.archive,a.source,a.ci_run,a.previous)
if __name__=="__main__":main()
