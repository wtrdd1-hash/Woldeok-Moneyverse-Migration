"""Narrow artifact, vacancy and filesystem ownership guards for the protected preview."""
import ctypes,hashlib,io,json,os,re,stat,uuid,zipfile
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

def _rename_noreplace(source,destination):
    # A pathname precheck cannot condition a later rename or unlink. Move the
    # actual occupant without overwriting any destination, then inspect it.
    library=ctypes.CDLL(None,use_errno=True)
    rename=library.renameat2
    rename.argtypes=[ctypes.c_int,ctypes.c_char_p,ctypes.c_int,ctypes.c_char_p,ctypes.c_uint]
    rename.restype=ctypes.c_int
    if rename(-100,os.fsencode(source),-100,os.fsencode(destination),1):
        number=ctypes.get_errno()
        raise OSError(number,os.strerror(number))


def _fingerprint(path):
    if not stat.S_ISREG(path.lstat().st_mode):raise ValueError('Ordinary owned file required')
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
    with os.fdopen(fd,'rb') as stream:
        before=os.fstat(stream.fileno())
        if not path.is_file() or path.is_symlink():raise ValueError('Ordinary owned file required')
        sha=digest(stream.read())
        after=os.fstat(stream.fileno())
    current=path.lstat()
    if ((before.st_dev,before.st_ino)!=(current.st_dev,current.st_ino)
        or (before.st_size,before.st_mtime_ns)!=(after.st_size,after.st_mtime_ns)):
        raise ValueError('File changed while inspected')
    return before.st_dev,before.st_ino,sha


def _occupant(path):
    current=path.lstat()
    if stat.S_ISREG(current.st_mode):
        try:return _fingerprint(path)
        except OSError:return current.st_dev,current.st_ino,'unreadable'
    # A foreign symlink, directory or special node is preserved without opening
    # it or following its target. Its inode is enough to verify restoration.
    return current.st_dev,current.st_ino,'nonregular:'+str(stat.S_IFMT(current.st_mode))


class OwnedFiles:
    def __init__(self):
        self.created={}
        self.recoveries=[]
    def owns(self,path):
        expected=self.created.get(str(path))
        if expected is None:return False
        try:return _fingerprint(path)==tuple(expected)
        except (OSError,ValueError):return False
    def _recovery(self,path,action,expected):
        directory=path.with_name('.'+path.name+'.nov18-qa-'+uuid.uuid4().hex)
        directory.mkdir(mode=0o700)
        record={'directory':str(directory),'target':str(path),'action':action,
                'expected':list(expected) if expected is not None else None,'status':'prepared'}
        self.recoveries.append(record)
        fd=os.open(directory/'recovery.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
        with os.fdopen(fd,'wb') as output:
            output.write((json.dumps(record)+'\n').encode());output.flush();os.fsync(output.fileno())
        return directory,record
    def _restore(self,slot,path,record,displaced):
        try:
            _rename_noreplace(slot,path)
        except OSError:
            record['status']='restore-blocked'
            raise ValueError('Displaced file retained in private recovery; target occupied or uncertain') from None
        if _occupant(path)!=displaced:
            record['status']='restore-uncertain'
            raise ValueError('Restored occupant changed; private recovery retained')
        record['status']='foreign-restored'
    def _displace(self,path,slot,expected,record):
        _rename_noreplace(path,slot)
        actual=_occupant(slot)
        record['displaced']=list(actual)
        if actual!=tuple(expected):
            self._restore(slot,path,record,actual)
            raise ValueError('Actual displaced occupant was foreign; restored without overwrite')
        record['status']='owned-held'
    def write(self,path,data,mode=0o644,replace=False,expected=None,expected_identity=None):
        if replace and (expected is None or expected_identity is None):
            raise ValueError('Replacement requires expected inode and bytes')
        prior=(*expected_identity,expected) if replace else None
        directory,record=self._recovery(path,'replace' if replace else 'acquire',prior)
        candidate=directory/(path.name+'.nov18-qa-'+uuid.uuid4().hex)
        slot=directory/'displaced'
        identity=None
        try:
            fd=os.open(candidate,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
            with os.fdopen(fd,'wb') as output:
                stat=os.fstat(output.fileno());identity=(stat.st_dev,stat.st_ino,digest(data))
                output.write(data);output.flush();os.fsync(output.fileno());os.fchmod(output.fileno(),mode)
            record['candidate']=list(identity)
            if replace:self._displace(path,slot,prior,record)
            try:
                os.link(candidate,path)
            except BaseException:
                # An error may follow a successful link. The finally clause
                # records that acquired inode; otherwise a vacant path can be
                # restored with NOREPLACE. An occupied foreign path is retained.
                if replace and not self._matches(path,identity):
                    self._restore(slot,path,record,prior)
                raise
            if not self._matches(path,identity):
                raise ValueError('Acquired candidate changed concurrently')
        finally:
            if identity is not None and self._matches(path,identity):
                self.created[str(path)]=identity
                record['status']='installed'
            # Never unlink staging/quarantine names after a check. Keep every
            # candidate and displaced inode recoverable behind its private dir.
    def _matches(self,path,expected):
        try:return _fingerprint(path)==tuple(expected)
        except (OSError,ValueError):return False
    def remove(self,path):
        expected=self.created.get(str(path))
        if expected is None:raise ValueError('Target was not acquired by this transaction')
        directory,record=self._recovery(path,'remove',expected)
        self._displace(path,directory/'displaced',expected,record)
        record['status']='removed-held'
