import importlib.util
import json
from pathlib import Path
import shlex,socket,subprocess,tempfile,threading,time,unittest,urllib.parse,urllib.request,urllib.error,uuid
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer

def module():
    path=Path(__file__).with_name('canary.py')
    if not path.exists():raise AssertionError('Protected real-read canary helpers are missing')
    spec=importlib.util.spec_from_file_location('catalog_canary',path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

def source_url():
    password='ci_'+uuid.uuid4().hex+'$"\\'
    return 'postgresql://moneyverse_app:'+urllib.parse.quote(password,safe='')+'@127.0.0.1:5433/disposable_example?sslmode=disable',password

class CanaryTests(unittest.TestCase):
    def test_only_the_existing_loopback_application_connection_can_become_a_readonly_environment(self):
        m=module();url,password=source_url();rendered=m.database_environment(url)
        values={key:shlex.split(value)[0] for key,value in (line.split('=',1) for line in rendered.splitlines())}
        self.assertEqual(values['SPRING_DATASOURCE_USERNAME'],'moneyverse_app')
        self.assertEqual(values['SPRING_DATASOURCE_PASSWORD'],password)
        self.assertEqual(values['SPRING_DATASOURCE_URL'],'jdbc:postgresql://127.0.0.1:5433/disposable_example?sslmode=disable')
        self.assertEqual(values['SPRING_DATASOURCE_HIKARI_READONLY'],'true')
        self.assertEqual(values['SPRING_DATASOURCE_HIKARI_MAXIMUMPOOLSIZE'],'2')
        self.assertEqual(values['SPRING_DATASOURCE_DRIVERCLASSNAME'],'org.postgresql.Driver')
        self.assertEqual(values['SPRING_JPA_HIBERNATE_DDLAUTO'],'none')
        self.assertNotIn('SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT',values)
        for unsafe in [url.replace('moneyverse_app','postgres'),url.replace('127.0.0.1','example.com'),url+'#fragment',url+'&options=role%3Dpostgres',url+'&sslmode=require',url.replace('sslmode=disable','sslmode=invalid'),url.replace('disposable_example','../private'),url.replace(urllib.parse.quote(password,safe=''),'ci_example%0Ainjected'),url+'\n']:
            with self.assertRaises(ValueError) as raised:m.database_environment(unsafe)
            self.assertNotIn(password,str(raised.exception));self.assertNotIn(unsafe,str(raised.exception))

    def test_loopback_hostname_is_preserved_for_the_existing_tls_configuration(self):
        m=module();url,_=source_url();url=url.replace('127.0.0.1','localhost').replace('sslmode=disable','sslmode=verify-full')
        values={key:shlex.split(value)[0] for key,value in (line.split('=',1) for line in m.database_environment(url).splitlines())}
        self.assertEqual(values['SPRING_DATASOURCE_URL'],'jdbc:postgresql://localhost:5433/disposable_example?sslmode=verify-full')

    def test_single_backslash_password_round_trips_without_systemd_escape_loss(self):
        m=module();password='ci_generated'+chr(92)+'q'+chr(34)+'tail'
        url='postgresql://moneyverse_app:'+urllib.parse.quote(password,safe='')+'@localhost/disposable'
        values={key:shlex.split(value)[0] for key,value in (line.split('=',1) for line in m.database_environment(url).splitlines())}
        self.assertEqual(values['SPRING_DATASOURCE_PASSWORD'],password)

    def test_generated_units_are_valid_systemd_and_reject_unowned_jar_paths(self):
        m=module();jar='/srv/moneyverse-native-rebuild-releases/test-nov18-catalog-read-canary-v2026.11.22.1-'+'a'*12+'/moneyverse-spring-backend-0.0.1-SNAPSHOT.jar'
        units=m.render_units(jar)
        with tempfile.TemporaryDirectory(prefix='mv-canary-units-') as folder:
            files=[]
            for name,data in units.items():
                path=Path(folder)/name;path.write_text(data);files.append(str(path))
                self.assertNotIn('SPRING_DATASOURCE_PASSWORD=',data);self.assertNotIn('runtime-mode=application',data)
                self.assertIn('-Djava.net.preferIPv4Stack=true',data)
            result=subprocess.run(['systemd-analyze','verify','--man=no',*files],capture_output=True,text=True)
            self.assertEqual(result.returncode,0,result.stderr)
        for jar in ['/tmp/unowned.jar','/srv/moneyverse-data/releases/../private.jar','/srv/moneyverse-data/releases/anything.jar\nEnvironment=unsafe']:
            with self.assertRaises(ValueError):m.render_units(jar)

    def test_executable_generations_use_a_dedicated_root_owned_tree(self):
        m=module()
        self.assertEqual(m.RELEASE_ROOT,Path('/srv/moneyverse-native-rebuild-releases'))
        path=Path(__file__).with_name('install.py')
        spec=importlib.util.spec_from_file_location('owned_root_installer',path)
        installer=importlib.util.module_from_spec(spec);spec.loader.exec_module(installer)
        self.assertEqual(installer.RELEASES,m.RELEASE_ROOT)
        legacy='/srv/moneyverse-data/releases/test-nov18-catalog-read-canary-v2026.11.22.1-'+'a'*12+'/moneyverse-spring-backend-0.0.1-SNAPSHOT.jar'
        with self.assertRaises(ValueError):m.render_units(legacy)

    def test_actual_nginx_protects_the_catalog_and_never_forwards_actor_transport_headers(self):
        m=module();seen=[]
        class Source(BaseHTTPRequestHandler):
            def log_message(self,*args):pass
            def do_GET(self):
                if self.path=='/auth':
                    cookie=self.headers.get('Cookie');self.send_response(204 if cookie=='qa-admin' else 403 if cookie=='qa-member' else 401);self.end_headers();return
                seen.append(dict(self.headers))
                self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('X-MV-Owner','qa-owner');self.send_header('Set-Cookie','unexpected=qa');self.end_headers();self.wfile.write(b'{"items":[]}')
        source=ThreadingHTTPServer(('127.0.0.1',0),Source);threading.Thread(target=source.serve_forever,daemon=True).start();nginx=None
        try:
            with tempfile.TemporaryDirectory(prefix='mv-canary-nginx-') as folder:
                p=Path(folder)
                with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
                (p/'canary.conf').write_text(m.render_config(source.server_port,source.server_port))
                (p/'nginx.conf').write_text(f'pid {p}/nginx.pid;error_log {p}/error.log;events {{}} http {{access_log off;server {{listen 127.0.0.1:{port} default_server;include {p}/canary.conf;location = /__mv_p0_admin_auth_20261118 {{internal;proxy_pass http://127.0.0.1:{source.server_port}/auth;proxy_pass_request_body off;proxy_set_header Content-Length "";proxy_set_header Cookie $http_cookie;}}location /api/ {{default_type application/json;return 200 \'{{"unchanged":true}}\';}}location / {{return 503 "maintenance";}}}}server {{listen 127.0.0.1:{port};server_name test.easy-scraping.com;return 403;}}}}')
                subprocess.run(['/usr/sbin/nginx','-t','-p',str(p),'-c',str(p/'nginx.conf')],capture_output=True,check=True)
                nginx=subprocess.Popen(['/usr/sbin/nginx','-p',str(p),'-c',str(p/'nginx.conf'),'-g','daemon off;'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
                def request(path,cookie=None,method='GET',host='easy-scraping.com'):
                    headers={'Host':host,'X-User-Id':'untrusted-actor','Authorization':'Bearer qa-transport','X-Internal-Token':'qa-internal'}
                    if cookie:headers['Cookie']=cookie
                    try:r=urllib.request.urlopen(urllib.request.Request(f'http://127.0.0.1:{port}'+path,headers=headers,method=method),timeout=2)
                    except urllib.error.HTTPError as error:r=error
                    return r.status,r.headers,r.read()
                deadline=time.monotonic()+4
                while True:
                    try:request('/');break
                    except OSError:
                        if time.monotonic()>deadline:raise
                        time.sleep(.05)
                path=m.PREFIX+'catalog'
                self.assertEqual(request(path)[0],401);self.assertEqual(request(path,'qa-member')[0],403)
                status,headers,body=request(path,'qa-admin');self.assertEqual(status,200);self.assertEqual(json.loads(body),{'items':[]});self.assertEqual(headers.get('X-MV-Owner'),'qa-owner');self.assertIsNone(headers.get('Set-Cookie'));self.assertIn('no-store',headers.get('Cache-Control',''))
                self.assertEqual(seen[-1].get('Cookie'),'qa-admin')
                for field in ['X-User-Id','Authorization','X-Internal-Token']:self.assertNotIn(field,seen[-1])
                self.assertEqual(request(path,'qa-admin','POST')[0],405);self.assertEqual(request(m.PREFIX+'unknown','qa-admin')[0],404)
                self.assertEqual(request('/')[0],503);self.assertEqual(request('/api/v1/stocks')[0],200)
                self.assertEqual(request(path,'qa-admin',host='test.easy-scraping.com')[0],403)
        finally:
            if nginx:nginx.terminate();nginx.wait(timeout=5)
            source.shutdown();source.server_close()

if __name__=='__main__':unittest.main()
