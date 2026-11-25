"""Configuration contracts for the bounded authored frontend connection."""
import importlib.util
from pathlib import Path
import subprocess
import tempfile
import unittest

def module():
    p=Path(__file__).with_name('routing.py')
    spec=importlib.util.spec_from_file_location('public_connection_routing',p)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

BASE_MAP=r'''map $http_accept $mv_nov18_maintenance_accept { default 0; ~*text/html 1; }
map $uri $mv_nov18_maintenance_document {
 default $mv_nov18_maintenance_accept;
 "/" 1; "/tools" 1; "/wallet" 1;
 ~^/api/ 0;
 ~^/assets/ 0;
}
map "$server_name:$remote_addr" $mv_nov18_maintenance_scope { default 1; ~^test\.easy-scraping\.com:(?!127\.0\.0\.1$|::1$) 0; }
map "$mv_nov18_maintenance_document:$mv_nov18_maintenance_scope" $mv_nov18_maintenance_gate {
    default 0;
    "1:1" 1;
}
'''
class RoutingTests(unittest.TestCase):
    def test_only_test_is_exempt_before_production_acceptance(self):
        m=module();text=m.maintenance_map(BASE_MAP,False)
        self.assertIn('~^test',text);self.assertIn(':/tools$',text)
        self.assertNotIn('"~^easy',text)
        self.assertIn('"1:1:0" 1;',text)
        self.assertNotIn('"easy-scraping.com:/wallet"',text)
    def test_production_exempts_exact_authored_routes_and_keeps_other_pages_closed(self):
        m=module();text=m.maintenance_map(BASE_MAP,True)
        self.assertIn('"~^easy',text);self.assertIn(':/$',text)
        self.assertIn(':/login$',text)
        for path in ['/admin','/wallet','/status','/api/v1/stocks','/unknown']:
            self.assertNotIn('"easy-scraping.com:'+path+'"',text)
        self.assertEqual(len(m.PAGES),40)
    def test_unknown_or_already_modified_gate_is_not_reinterpreted(self):
        m=module()
        for text in [BASE_MAP.replace('"1:1" 1;','"1:1" 0;'),m.maintenance_map(BASE_MAP,False),BASE_MAP+BASE_MAP]:
            with self.assertRaises(ValueError):m.maintenance_map(text,True)
    def test_current_asset_update_preserves_historical_versions(self):
        m=module();a='a'*64;b='b'*64
        before='map "$uri|$arg_v" $mv_frontend_asset_file { default "";\n "/assets/mv39/app.js|'+a+'" "/old/app.js";\n}\n'
        data={'/assets/mv39/app.js':{'sha256':b,'file':'/srv/moneyverse-native-rebuild-assets/'+b+'/app.js'}}
        result=m.asset_map(before,data)
        self.assertIn('"/old/app.js"',result);self.assertIn(b+'/app.js"',result)
        same=m.asset_map(result,data);self.assertEqual(same,result)
    def test_asset_path_and_hash_injection_is_refused(self):
        m=module();before='map "$uri|$arg_v" $mv_frontend_asset_file { default "";\n}\n'
        for path,sha,file in [('/api/v1/auth/me','a'*64,'/tmp/a'),('/assets/mv39/../app.js','a'*64,'/tmp/a'),('/assets/mv39/app.js','broken','/tmp/a'),('/assets/mv39/app.js','a'*64,'/srv/moneyverse-native-rebuild-assets/'+'a'*64+'/other.js')]:
            with self.assertRaises(ValueError):m.asset_map(before,{path:{'sha256':sha,'file':file}})
    def test_units_are_database_free_separate_and_fixed_loopback(self):
        m=module()
        for channel,port in [('test',4820),('prod',4822)]:
            path='/srv/moneyverse-native-rebuild-releases/'+channel+'-nov18-public-v2026.11.22.1-'+'a'*12+'/moneyverse-spring-backend-0.0.1-SNAPSHOT.jar'
            text=m.unit(channel,path)
            self.assertIn('--server.port='+str(port),text);self.assertIn('runtime-mode=frontend-presentation',text)
            self.assertIn('DynamicUser=yes',text);self.assertIn('Restart=on-failure',text)
            self.assertNotIn('EnvironmentFile=',text);self.assertNotIn('catalog-read',text)
        with self.assertRaises(ValueError):m.unit('prod','/tmp/unverified.jar')
    def test_test_source_reads_are_fixed_cookie_only_and_unknown_routes_stay_private(self):
        m=module()
        locations='\n'.join('location = '+path+' { if ($request_method !~ ^(GET|HEAD)$) { return 405; } proxy_pass http://127.0.0.1:4820; proxy_pass_request_headers off; proxy_pass_request_body off; proxy_hide_header Set-Cookie; }' for path in m.PAGES)
        before='server { server_name test.easy-scraping.com;\n allow 127.0.0.1; allow ::1; deny all;\n if ($http_cf_ray != "") { return 403; }\n if ($http_cf_connecting_ip != "") { return 403; }\n'+locations+'\nlocation / { return 403; } }\n# 2. Main Website & API Server\nserver { server_name _; }'
        result=m.test_sources(before)
        self.assertIn('if ($mv_native_test_external_block) { return 403; }',result)
        self.assertIn('deny all;',result);self.assertIn('allow all;',result)
        self.assertIn('location = /api/v1/auth/session',result)
        self.assertIn('proxy_set_header Cookie $http_cookie;',result)
        self.assertIn('proxy_pass_request_headers off;',result)
        self.assertIn('return 405;',result)
        self.assertNotIn('Authorization',result)
        self.assertEqual(result.split('# 2. Main Website & API Server')[1],before.split('# 2. Main Website & API Server')[1])
        with self.assertRaises(ValueError):m.test_sources(result)

    def test_version_patch_targets_only_the_production_block(self):
        m=module()
        block='location = /frontend-version { return 204; }'
        before='server { server_name test.easy-scraping.com; '+block+' }\n# 2. Main Website & API Server\nserver { server_name _;\n'+block+'\n}'
        out=m.production_version(before)
        self.assertEqual(out.split('# 2. Main Website & API Server')[0],before.split('# 2. Main Website & API Server')[0])
        self.assertIn('proxy_pass http://127.0.0.1:4822;',out)
        with self.assertRaises(ValueError):m.production_version(before.replace(block,'',1).replace(block,'',1))


class ActualNginxTests(unittest.TestCase):
    def test_phase_exemptions_preserve_api_methods_unknown_documents_and_test_admission(self):
        import socket,time,urllib.request,urllib.error
        m=module()
        for production in (False,True):
            with tempfile.TemporaryDirectory(prefix='mv-public-nginx-') as temp:
                root=Path(temp);sock=socket.socket();sock.bind(('127.0.0.1',0));port=sock.getsockname()[1];sock.close()
                config='daemon off; master_process off; pid '+str(root/'nginx.pid')+'; error_log '+str(root/'error.log')+'; events {} http { map_hash_bucket_size 256; access_log off; '+m.maintenance_map(BASE_MAP,production)+'''
server {
 listen 127.0.0.1:PORT;
 server_name test.easy-scraping.com easy-scraping.com;
 if ($mv_native_test_external_block) { return 403; }
 if ($mv_nov18_maintenance_gate) { return 503 "maintenance"; }
 location = /api/v1/stocks { return 200 "original-api"; }
 location = / { if ($request_method !~ ^(GET|HEAD)$) { return 405; } return 200 "authored-frontend"; }
 location / { return 200 "authored-frontend"; }
}
}'''.replace('PORT',str(port))
                path=root/'nginx.conf';path.write_text(config)
                proc=subprocess.Popen(['/usr/sbin/nginx','-c',str(path)],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
                opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
                def request(host,route,method='GET',extra=None):
                    req=urllib.request.Request('http://127.0.0.1:'+str(port)+route,method=method,
                        headers={'Host':host,'Accept':'text/html',**(extra or {})})
                    try:res=opener.open(req,timeout=2)
                    except urllib.error.HTTPError as e:res=e
                    with res:return res.status,res.read().decode()
                try:
                    deadline=time.monotonic()+3
                    while True:
                        if proc.poll() is not None:self.fail(proc.stderr.read().decode())
                        try:
                            request('easy-scraping.com','/');break
                        except OSError:
                            if time.monotonic()>deadline:raise
                            time.sleep(.02)
                    self.assertEqual(request('test.easy-scraping.com','/'),(200,'authored-frontend'))
                    self.assertEqual(request('easy-scraping.com','/')[0],200 if production else 503)
                    self.assertEqual(request('easy-scraping.com','/wallet')[0],503)
                    self.assertEqual(request('test.easy-scraping.com','/unknown')[0],503)
                    self.assertEqual(request('test.easy-scraping.com','/LOGIN')[0],503)
                    self.assertEqual(request('test.easy-scraping.com','/Tools')[0],503)
                    self.assertEqual(request('easy-scraping.com','/api/v1/stocks','POST'),(200,'original-api'))
                    self.assertEqual(request('test.easy-scraping.com','/','HEAD'),(200,''))
                    self.assertEqual(request('test.easy-scraping.com','/','POST')[0],405)
                    self.assertEqual(request('test.easy-scraping.com','/','GET',{'CF-Connecting-IP':'198.51.100.77'})[0],200)
                    self.assertEqual(request('test.easy-scraping.com','/unknown','GET',{'CF-Connecting-IP':'198.51.100.77'})[0],403)
                finally:
                    proc.terminate()
                    try:proc.wait(timeout=3)
                    except subprocess.TimeoutExpired:proc.kill();proc.wait(timeout=3)
                    proc.stderr.close()

if __name__=='__main__':unittest.main()
