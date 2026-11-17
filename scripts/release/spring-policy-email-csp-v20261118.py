#!/usr/bin/env python3
"""Switch precisely versioned, unified Spring public UI include after Test QA.

Only changes the v2026.11.18.6 include for exact guest pages.
Existing /api, /auth, /admin, OAuth bridge, Next fallback and finance routes stay.
Automatically rolls Nginx back on syntax/reload failures, with byte-exact backups.
"""
import argparse
import fcntl
import hashlib
import os
from pathlib import Path
import subprocess
import tempfile
from datetime import datetime, timezone

SITE=Path('/etc/nginx/sites-enabled/moneyverse')
RECOVERY=Path('/srv/moneyverse-data/ops/recovery/spring-public-canonical-v2026.11.18.8')
ANCHORS={
 'test':'# Isolated Moneyverse test origin — exact-SHA QA only.\nserver {',
 'prod':'# 2. Main Website & API Server (easy-scraping.com only - NO MCP routes)\nserver {'
}
BASE={env:f'include /etc/nginx/snippets/moneyverse-spring-public-canonical-v20261118-{env}.conf;' for env in ANCHORS}
UPDATED={env:f'include /etc/nginx/snippets/moneyverse-spring-public-canonical-v20261118-8-{env}.conf;' for env in ANCHORS}
TARGET={env:Path(f'/etc/nginx/snippets/moneyverse-spring-public-canonical-v20261118-8-{env}.conf') for env in ANCHORS}
SOURCE={env:Path(f'ops/nginx/spring-public-canonical-v2026.11.18.8.{env}.conf') for env in ANCHORS}

def sha(b):return hashlib.sha256(b).hexdigest()
def atomic(path,data):
 st=path.stat() if path.exists() else None
 fd,tmp=tempfile.mkstemp(prefix=path.name+'.tmp-',dir=path.parent)
 try:
  with os.fdopen(fd,'wb') as f:f.write(data);f.flush();os.fsync(f.fileno())
  if st:
   os.chmod(tmp,st.st_mode & 0o777);os.chown(tmp,st.st_uid,st.st_gid)
  else:os.chmod(tmp,0o644)
  os.replace(tmp,path)
 finally:
  if os.path.exists(tmp):os.unlink(tmp)
def main():
 p=argparse.ArgumentParser();p.add_argument('env',choices=ANCHORS);p.add_argument('action',choices=('enable','disable'));p.add_argument('--source-root',type=Path);a=p.parse_args()
 if os.geteuid():raise SystemExit('root only')
 RECOVERY.mkdir(parents=True,exist_ok=True)
 with open('/run/lock/moneyverse-spring-public-canonical-v20261118-8.lock','w') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  old=SITE.read_bytes();original=old.decode('utf8')
  if original.count(ANCHORS[a.env])!=1:raise RuntimeError('Nginx target virtual host is ambiguous')
  prefix,within=original.split(ANCHORS[a.env],1)
  before,after=(BASE[a.env],UPDATED[a.env]) if a.action=='enable' else (UPDATED[a.env],BASE[a.env])
  if within.count(before)!=1:raise RuntimeError('Expected prior include missing or duplicated; fail closed')
  if a.action=='enable':
   if not a.source_root:raise RuntimeError('source root required')
   source=(a.source_root/SOURCE[a.env]).read_bytes()
   target=TARGET[a.env]
   if target.exists() and target.read_bytes()!=source:raise RuntimeError('Conflicting installed snippet; abort')
   if not target.exists():atomic(target,source)
  new=(prefix+ANCHORS[a.env]+within.replace(before,after,1)).encode('utf8')
  backup=RECOVERY/(datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')+f'-{a.env}-{a.action}-before-'+sha(old)[:12]+'.conf')
  backup.write_bytes(old);backup.chmod(0o440)
  if SITE.read_bytes()!=old:raise RuntimeError('Concurrent Nginx edit, abort')
  try:
   atomic(SITE,new)
   subprocess.run(['/usr/sbin/nginx','-t'],check=True)
   subprocess.run(['/usr/bin/systemctl','reload','nginx'],check=True)
  except Exception:
   if SITE.read_bytes()==new:
    atomic(SITE,old)
    subprocess.run(['/usr/sbin/nginx','-t'],check=True)
    subprocess.run(['/usr/bin/systemctl','reload','nginx'],check=True)
   raise
  print('SPRING_PUBLIC_CANONICAL',a.env,a.action,'OK','prior_sha='+sha(old),'new_sha='+sha(new),'backup='+str(backup))
if __name__=='__main__':main()
