import importlib.util
from pathlib import Path
import socket,subprocess,tempfile,threading,time,unittest,urllib.request,urllib.error
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer

def module():
    path=Path(__file__).with_name('qa.py')
    if not path.exists():raise AssertionError('The protected frontend QA implementation is missing')
    spec=importlib.util.spec_from_file_location('qa',path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

class QaTests(unittest.TestCase):
    def test_site_patch_is_one_addition_after_the_existing_maintenance_gate(self):
        m=module();before='server {\n    listen 80 default_server;\n    include /etc/nginx/snippets/moneyverse-nov18-maintenance-20261121.conf;\n    location /api/ { return 200; }\n}\n'
        after=m.patch_site(before);self.assertEqual(after.replace('    include '+str(m.INCLUDE)+';\n',''),before)
        with self.assertRaises(ValueError):m.patch_site(before+before)
        with self.assertRaises(ValueError):m.patch_site(before.replace('moneyverse-nov18-maintenance-20261121','other'))
    def test_real_nginx_requires_actual_admin_auth_and_preserves_maintenance_and_api(self):
        m=module()
        class Source(BaseHTTPRequestHandler):
            def log_message(self,*args):pass
            def do_GET(self):
                if self.path=='/auth':
                    cookie=self.headers.get('Cookie');status=204 if cookie=='qa-admin' else 403 if cookie=='qa-member' else 401
                    self.send_response(status);self.end_headers();return
                self.send_response(200);self.send_header('Content-Type','text/html' if self.path.startswith('/admin/shop') else 'text/javascript');self.send_header('Set-Cookie','unexpected=qa');self.end_headers()
                self.wfile.write(('<html><head><link href="/assets/mv46/admin-shop.css"><script src="/assets/mv46/admin-shop.js"></script></head><body>'+self.path+'</body></html>').encode())
        upstream=ThreadingHTTPServer(('127.0.0.1',0),Source);threading.Thread(target=upstream.serve_forever,daemon=True).start();nginx=None
        try:
            with tempfile.TemporaryDirectory(prefix='mv-native-qa-') as folder:
                p=Path(folder)
                with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
                (p/'qa.conf').write_text(m.render_config(upstream.server_port))
                (p/'nginx.conf').write_text(f'''pid {p}/nginx.pid;error_log {p}/error.log;events {{}} http {{access_log off;server {{listen 127.0.0.1:{port};include {p}/qa.conf;location = /__mv_p0_admin_auth_20261118 {{internal;proxy_pass http://127.0.0.1:{upstream.server_port}/auth;proxy_pass_request_body off;proxy_set_header Content-Length "";proxy_set_header Cookie $http_cookie;}}location /api/ {{default_type application/json;return 200 '{{"ok":true}}';}}location / {{return 503 "maintenance";}}}}}}''')
                subprocess.run(['/usr/sbin/nginx','-t','-p',str(p),'-c',str(p/'nginx.conf')],capture_output=True,check=True)
                nginx=subprocess.Popen(['/usr/sbin/nginx','-p',str(p),'-c',str(p/'nginx.conf'),'-g','daemon off;'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
                def request(path,cookie=None,method='GET'):
                    headers={'Cookie':cookie} if cookie else {}
                    try:r=urllib.request.urlopen(urllib.request.Request(f'http://127.0.0.1:{port}'+path,headers=headers,method=method),timeout=2)
                    except urllib.error.HTTPError as e:r=e
                    return r.status,r.headers,r.read().decode()
                deadline=time.monotonic()+4
                while True:
                    try:request('/');break
                    except OSError:
                        if time.monotonic()>deadline:raise
                        time.sleep(.05)
                route=m.PREFIX+'admin-shop'
                self.assertEqual(request(route)[0],401);self.assertEqual(request(route,'qa-member')[0],403)
                status,headers,body=request(route+'?lang=ko','qa-admin');self.assertEqual(status,200);self.assertIn(m.PREFIX+'assets/mv46/admin-shop.js',body);self.assertIn('/admin/shop?lang=ko',body);self.assertIsNone(headers.get('Set-Cookie'));self.assertIn('no-store',headers.get('Cache-Control',''))
                self.assertEqual(request(m.PREFIX+'assets/mv46/admin-shop.js')[0],401)
                self.assertEqual(request(m.PREFIX+'assets/mv46/admin-shop.js','qa-admin')[0],200)
                self.assertEqual(request(route,'qa-admin','POST')[0],405);self.assertEqual(request(m.PREFIX+'other','qa-admin')[0],404)
                self.assertEqual(request('/')[0],503);self.assertEqual(request('/api/v1/stocks')[0],200)
        finally:
            if nginx:nginx.terminate();nginx.wait(timeout=5)
            upstream.shutdown();upstream.server_close()


    def test_failure_after_atomic_unit_install_removes_only_the_owned_partial_target(self):
        path=Path(__file__).with_name('install.py');spec=importlib.util.spec_from_file_location('qa_installer',path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
        with tempfile.TemporaryDirectory(prefix='mv-qa-rollback-') as folder:
            stage=Path(folder);old_include=m.qa.INCLUDE;m.SITE=stage/'live-site';m.UNIT_FILE=stage/'live-unit';m.qa.INCLUDE=stage/'live-include';m.SITE.write_bytes(b'original')
            contents={'site.before':b'original','site.after':b'candidate','qa.conf':b'include','qa.service':b'unit'}
            for name,data in contents.items():(stage/name).write_bytes(data)
            manifest={'files':{name:m.digest(data) for name,data in contents.items()},'siteMode':0o644,'jar':str(stage/'qa.jar')}
            class Helper:
                NoRedirect=urllib.request.HTTPRedirectHandler
                def nginx(self,action):pass
            m.validate_stage=lambda _: (manifest,Helper(),stage/'qa.jar');m.require_vacant_unit=lambda:None;m.unit_state=lambda:{'MainPID':'0'}
            original_run=m.subprocess.run;actual_link=m.os.link
            m.subprocess.run=lambda *args,**kwargs:None
            def interrupted(a,b):
                actual_link(a,b)
                if b==m.UNIT_FILE:raise OSError('Synthetic failure after unit link exists')
            m.os.link=interrupted
            try:
                with self.assertRaises(OSError):m.apply(stage)
                self.assertEqual(m.SITE.read_bytes(),b'original');self.assertFalse(m.UNIT_FILE.exists());self.assertFalse(m.qa.INCLUDE.exists())
            finally:m.subprocess.run=original_run;m.os.link=actual_link;m.qa.INCLUDE=old_include

    def test_preexisting_service_or_listener_is_not_adopted(self):
        path=Path(__file__).with_name('install.py');spec=importlib.util.spec_from_file_location('qa_vacancy',path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
        with tempfile.TemporaryDirectory(prefix='mv-qa-vacancy-') as folder:
            m.UNIT_FILE=Path(folder)/'unit';m.port_is_free=lambda:True
            blank={'LoadState':'not-found','ActiveState':'inactive','MainPID':'0','FragmentPath':'','DropInPaths':''}
            for extra in [{'LoadState':'loaded'},{'MainPID':'123'},{'ActiveState':'active'},{'FragmentPath':'/run/systemd/transient/other.service'},{'DropInPaths':'/etc/systemd/system/other.conf'}]:
                m.unit_state=lambda:{**blank,**extra}
                with self.assertRaises(ValueError):m.require_vacant_unit()
            m.unit_state=lambda:blank;m.port_is_free=lambda:False
            with self.assertRaises(ValueError):m.require_vacant_unit()
    def test_ci_import_reads_the_approved_run_artifact_and_rejects_archive_digest_changes(self):
        import io,json,zipfile,hashlib
        path=Path(__file__).with_name('install.py');spec=importlib.util.spec_from_file_location('qa_artifact',path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
        source='a'*40;run='123';jar='moneyverse-spring-backend-0.0.1-SNAPSHOT.jar';data=io.BytesIO()
        with zipfile.ZipFile(data,'w') as z:z.writestr(jar,b'CI fixture executable');z.writestr('source-manifest.json',json.dumps({'sourceSha':source,'jar':jar,'sha256':hashlib.sha256(b'CI fixture executable').hexdigest()}))
        archive=data.getvalue();calls=[]
        metadata={'artifacts':[{'id':12,'name':'spring-native-candidate-'+source,'expired':False,'digest':'sha256:'+hashlib.sha256(archive).hexdigest(),'workflow_run':{'id':123,'head_sha':source,'head_branch':'main'}}]}
        def gh(*args):calls.append(args);return json.dumps(metadata)
        m.gh=gh;m.gh_download=lambda route,path:(calls.append(route),path.write_bytes(archive))
        with tempfile.TemporaryDirectory(prefix='mv-qa-ci-') as folder:
            proof,manifest,executable=m.fetch_artifact(Path(folder),source,run)
            self.assertEqual(proof['artifactId'],12);self.assertEqual(executable,b'CI fixture executable');self.assertEqual(manifest['sourceSha'],source)
            self.assertIn('/actions/runs/123/artifacts',calls[0][1]);self.assertTrue(any(isinstance(c,str) and '/artifacts/12/zip' in c for c in calls))
        metadata['artifacts'][0]['digest']='sha256:'+'0'*64
        with tempfile.TemporaryDirectory(prefix='mv-qa-ci-bad-') as folder:
            with self.assertRaises(ValueError):m.fetch_artifact(Path(folder),source,run)
    def test_identical_existing_file_is_never_owned_but_post_link_failure_is_owned(self):
        path=Path(__file__).with_name('install.py');spec=importlib.util.spec_from_file_location('qa_owned',path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
        with tempfile.TemporaryDirectory(prefix='mv-qa-owned-') as folder:
            p=Path(folder)/'target';p.write_bytes(b'same');tx=m.OwnedFiles()
            with self.assertRaises(FileExistsError):tx.write(p,b'same')
            self.assertFalse(tx.owns(p));self.assertEqual(p.read_bytes(),b'same');m.UNIT_FILE=p;self.assertFalse(m.cleanup_unit(tx,Path(folder)/'qa.jar')['removed']);self.assertTrue(p.exists());p.unlink()
            actual=m.os.link
            def interrupted(a,b):actual(a,b);raise OSError('Synthetic post-link interruption')
            m.os.link=interrupted
            try:
                with self.assertRaises(OSError):tx.write(p,b'same')
                self.assertTrue(tx.owns(p));self.assertEqual(p.read_bytes(),b'same')
            finally:m.os.link=actual

    def test_nginx_rollback_failure_does_not_strand_the_owned_test_unit(self):
        path=Path(__file__).with_name('install.py');spec=importlib.util.spec_from_file_location('qa_cleanup',path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
        with tempfile.TemporaryDirectory(prefix='mv-qa-independent-cleanup-') as folder:
            stage=Path(folder);old_include=m.qa.INCLUDE;m.SITE=stage/'live-site';m.UNIT_FILE=stage/'live-unit';m.qa.INCLUDE=stage/'live-include'
            (stage/'site.before').write_bytes(b'original')
            tx=m.OwnedFiles();tx.write(m.SITE,b'candidate');tx.write(m.UNIT_FILE,b'owned unit');tx.write(m.qa.INCLUDE,b'owned include')
            manifest={'files':{'site.after':m.digest(b'candidate')},'siteMode':0o644,'jar':str(stage/'qa.jar')}
            class Helper:
                def nginx(self,action):raise RuntimeError('Synthetic Nginx rollback failure')
            original=m.subprocess.run;m.subprocess.run=lambda *a,**k:None;m.unit_state=lambda:{'MainPID':'0'}
            try:
                outcome=m.rollback(stage,manifest,Helper(),tx)
                self.assertEqual(m.SITE.read_bytes(),b'original');self.assertFalse(m.UNIT_FILE.exists());self.assertFalse(m.qa.INCLUDE.exists())
                self.assertTrue(outcome['unitCleanup']['removed']);self.assertEqual(outcome['errors'],['config:RuntimeError'])
            finally:m.subprocess.run=original;m.qa.INCLUDE=old_include

if __name__=='__main__':unittest.main()
