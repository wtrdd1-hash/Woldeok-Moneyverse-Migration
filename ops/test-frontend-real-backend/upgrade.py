"""Replace only the previously verified own Test frontend unit, retaining an inverse."""
import argparse,fcntl,importlib.util,json,os,pathlib,re
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

def restore(stage,context,acquired):
    deploy.same(UNIT,acquired)
    old=pathlib.Path(jar_path(context["previous"]))
    new=pathlib.Path(jar_path(context["source"]))
    if deploy.sha(old.read_bytes())!=context["previousJarSha256"]:raise ValueError("Inverse artifact changed")
    pid=manager()
    if pid:require_process(pid,new)
    deploy.run("systemctl","stop",deploy.routing.UNIT)
    if manager()!=0:raise ValueError("Candidate did not stop")
    restored=deploy.atomic(UNIT,(stage/"unit.before").read_bytes(),acquired,0o644,stage,"unit-restored")
    deploy.run("systemctl","daemon-reload");deploy.run("systemctl","start",deploy.routing.UNIT)
    def verify():
        deploy.same(UNIT,restored);require_process(manager(),old)
    deploy.wait_identity(deploy.routing.PORT,context["previous"],verify,timeout=30)
    deploy.wait_identity(80,context["previous"],verify)
    deploy.record(stage,"rollback.json",{"source":context["previous"],"pid":manager(),"unit":restored,"testOnly":True})

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
    # Nginx and the real API/DB stay running; only this proven Test renderer is stopped.
    deploy.same(UNIT,before)
    if manager()!=pid:raise ValueError("Previous manager process changed")
    require_process(pid,old_jar)
    deploy.run("systemctl","stop",deploy.routing.UNIT)
    if manager()!=0:raise ValueError("Previous renderer did not stop")
    acquired=deploy.atomic(UNIT,unit,before,0o644,stage,"unit-owned")
    deploy.record(stage,"unit.json",acquired)
    deploy.record(stage,"start-intent.json",{"source":source,"previous":previous})
    try:
        deploy.run("systemctl","daemon-reload");deploy.run("systemctl","start",deploy.routing.UNIT)
        def verify():
            deploy.same(UNIT,acquired)
            running=manager()
            if running:require_process(running,jar)
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
        restore(stage,context,acquired);raise
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
            restore(stage,context,json.loads((stage/"unit.json").read_text()))
        else:
            if not a.previous or a.archive is None or not a.ci_run:raise ValueError("Explicit accepted predecessor and attested candidate required")
            jar_path(a.previous);upgrade(a.archive,a.source,a.ci_run,a.previous)
if __name__=="__main__":main()
