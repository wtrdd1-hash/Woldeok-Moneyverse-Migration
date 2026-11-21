"""Narrow artifact, vacancy and filesystem ownership guards for the protected preview."""
import hashlib,io,json,os,re,uuid,zipfile
from pathlib import Path

def digest(data):return hashlib.sha256(data).hexdigest()

def fetch_artifact(stage,source,run,gh,download,repository):
    entries=json.loads(gh('api','repos/'+repository+'/actions/runs/'+run+'/artifacts?per_page=100'))['artifacts']
    found=[a for a in entries if a.get('name')=='spring-native-candidate-'+source]
    if len(found)!=1:raise ValueError('The approved run has no unique native artifact')
    a=found[0];workflow=a.get('workflow_run',{});identity=a.get('id');archive_digest=a.get('digest','')
    if type(identity) is not int or identity<1 or a.get('expired') is not False or workflow.get('head_sha')!=source or str(workflow.get('id'))!=run or workflow.get('head_branch')!='main' or not re.fullmatch('sha256:[0-9a-f]{64}',archive_digest):raise ValueError('Artifact identity is not bound to the approved main run')
    path=stage/'ci-artifact.zip';download('repos/'+repository+'/actions/artifacts/'+str(identity)+'/zip',path)
    h=hashlib.sha256()
    with path.open('rb') as stream:
        while chunk:=stream.read(1024*1024):h.update(chunk)
    if h.hexdigest()!=archive_digest.removeprefix('sha256:'):raise ValueError('Downloaded artifact digest differs from GitHub')
    with zipfile.ZipFile(path) as z:
        names={i.filename for i in z.infolist() if not i.is_dir()};jar='moneyverse-spring-backend-0.0.1-SNAPSHOT.jar'
        if names!={jar,'source-manifest.json'} or sum(i.file_size for i in z.infolist())>400*1024*1024 or z.getinfo('source-manifest.json').file_size>4096:raise ValueError('Unexpected native artifact archive')
        m=json.loads(z.read('source-manifest.json'));data=z.read(jar)
    if m.get('sourceSha')!=source or m.get('jar')!=jar or m.get('sha256')!=digest(data):raise ValueError('Native JAR differs from the CI manifest')
    return {'artifactId':identity,'archiveSha256':h.hexdigest(),'run':run},m,data

def require_vacant(unit_file,state,free):
    if unit_file.exists() or unit_file.is_symlink():raise ValueError('QA unit file already exists')
    expected={'LoadState':'not-found','ActiveState':'inactive','MainPID':'0','FragmentPath':'','DropInPaths':''}
    if state()!=expected or not free():raise ValueError('Existing unit identity or listener cannot be adopted')

class OwnedFiles:
    def __init__(self):self.created={}
    def owns(self,path):
        info=self.created.get(str(path))
        if info is None:return False
        try:current=path.lstat();return (current.st_dev,current.st_ino)==info[:2] and path.is_file() and not path.is_symlink() and digest(path.read_bytes())==info[2]
        except FileNotFoundError:return False
    def write(self,path,data,mode=0o644,replace=False,expected=None,expected_identity=None):
        temp=path.with_name(path.name+'.nov18-qa-'+uuid.uuid4().hex);identity=None
        try:
            with temp.open('xb') as output:
                identity=(os.fstat(output.fileno()).st_dev,os.fstat(output.fileno()).st_ino);output.write(data);output.flush();os.fsync(output.fileno());os.fchmod(output.fileno(),mode)
            if expected is not None and digest(path.read_bytes())!=expected:raise ValueError('Owned compare-and-swap bytes changed')
            if expected_identity is not None and tuple(expected_identity)!=(path.stat().st_dev,path.stat().st_ino):raise ValueError('Owned compare-and-swap inode changed')
            if replace:os.replace(temp,path)
            else:os.link(temp,path)
        finally:
            if identity is not None:
                try:
                    current=path.lstat()
                    if (current.st_dev,current.st_ino)==identity:self.created[str(path)]=(*identity,digest(data))
                except FileNotFoundError:pass
                try:
                    current=temp.lstat()
                    if (current.st_dev,current.st_ino)==identity:temp.unlink()
                except FileNotFoundError:pass
    def remove(self,path):
        if not self.owns(path):raise ValueError('Target was not acquired by this transaction')
        path.unlink()
