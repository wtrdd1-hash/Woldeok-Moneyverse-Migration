#!/usr/bin/env python3
"""Exact-home-and-guide Spring SSR Nginx gate, reversible via byte-exact backups.

Public finance, API, sessions, OAuth, protected admin and Next fallback unaffected.
TEST must be verified with real HTTP before Production promotion.
"""
from pathlib import Path
from datetime import datetime, timezone
import argparse, fcntl, hashlib, os, subprocess, tempfile
SITE=Path('/etc/nginx/sites-enabled/moneyverse')
BACKUPS=Path('/srv/moneyverse-data/ops/recovery/spring-canonical-home-v2026.11.18.6')
TEST_ANCHOR='# Isolated Moneyverse test origin — exact-SHA QA only.\nserver {'
PROD_ANCHOR='# 2. Main Website & API Server (easy-scraping.com only - NO MCP routes)\nserver {'
OLD_PROD='include /etc/nginx/snippets/moneyverse-p0-home-next-recovery-v20261118.conf;'
NEW_PROD='include /etc/nginx/snippets/moneyverse-spring-canonical-home-v20261118-prod.conf;'
TEST_MARK='    # spring-canonical-home-v2026.11.18.6-test-START\n    include /etc/nginx/snippets/moneyverse-spring-canonical-home-v20261118-test.conf;\n    # spring-canonical-home-v2026.11.18.6-test-END\n'
SOURCES={
 'test':(Path('ops/nginx/spring-canonical-home-v2026.11.18.6.test.conf'),Path('/etc/nginx/snippets/moneyverse-spring-canonical-home-v20261118-test.conf')),
 'prod':(Path('ops/nginx/spring-canonical-home-v2026.11.18.6.prod.conf'),Path('/etc/nginx/snippets/moneyverse-spring-canonical-home-v20261118-prod.conf')),
}
def sha(b):return hashlib.sha256(b).hexdigest()
def write(path,data):
 st=path.stat() if path.exists() else None
 fd,temp=tempfile.mkstemp(prefix=path.name+'.tmp-',dir=path.parent)
 try:
  with os.fdopen(fd,'wb') as out:out.write(data);out.flush();os.fsync(out.fileno())
  if st:os.chmod(temp,st.st_mode & 0o777);os.chown(temp,st.st_uid,st.st_gid)
  else:os.chmod(temp,0o644)
  os.replace(temp,path)
 finally:
  if os.path.exists(temp):os.unlink(temp)
def main():
 p=argparse.ArgumentParser();p.add_argument('environment',choices=('test','prod'));p.add_argument('action',choices=('enable','disable'));p.add_argument('--source-root',type=Path);a=p.parse_args()
 if os.geteuid():raise SystemExit('root required')
 BACKUPS.mkdir(parents=True,exist_ok=True)
 with open('/run/lock/moneyverse-spring-canonical-v20261118.lock','w') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  old=SITE.read_bytes();old_str=old.decode('utf8')
  if a.action=='enable':
   if not a.source_root:raise RuntimeError('source root mandatory')
   source, target=SOURCES[a.environment]
   new_data=(a.source_root/source).read_bytes()
   if target.exists():
    if target.read_bytes()!=new_data:raise RuntimeError('source mismatch, cannot overwrite snippet')
   else:write(target,new_data)
  if a.environment=='test':
   if old_str.count(TEST_ANCHOR)!=1:raise RuntimeError('test anchor not unique')
   new=old_str.replace(TEST_ANCHOR,TEST_ANCHOR+('\n'+TEST_MARK if a.action=='enable' else ''),1) if a.action=='enable' else old_str.replace(TEST_MARK,'',1)
   if a.action=='enable' and TEST_MARK in old_str or a.action=='disable' and old_str.count(TEST_MARK)!=1:raise RuntimeError('test marker missing/duplicated')
  else:
   if old_str.count(PROD_ANCHOR)!=1:raise RuntimeError('prod anchor missing')
   pre,post=old_str.split(PROD_ANCHOR,1)
   before,after=(OLD_PROD,NEW_PROD) if a.action=='enable' else (NEW_PROD,OLD_PROD)
   if post.count(before)!=1:raise RuntimeError('prod expected include not found once')
   new=pre+PROD_ANCHOR+post.replace(before,after,1)
  changed=new.encode('utf8')
  backup=BACKUPS/(datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')+'-'+a.environment+'-'+a.action+'-'+sha(old)[:12]+'.conf')
  backup.write_bytes(old);backup.chmod(0o440)
  if SITE.read_bytes()!=old:raise RuntimeError('concurrent config edit; stop')
  try:
   write(SITE,changed)
   subprocess.run(['/usr/sbin/nginx','-t'],check=True)
   subprocess.run(['/usr/bin/systemctl','reload','nginx'],check=True)
  except Exception:
   if SITE.read_bytes()==changed:
    write(SITE,old)
    subprocess.run(['/usr/sbin/nginx','-t'],check=True)
    subprocess.run(['/usr/bin/systemctl','reload','nginx'],check=True)
   raise
  print('SPRING_CANONICAL_'+a.environment.upper()+'_'+a.action.upper()+'_OK','before='+sha(old),'after='+sha(changed),'backup='+str(backup))
if __name__=='__main__':main()
