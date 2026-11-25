"""Actual transformed Test virtual host, with disposable capturing upstreams."""
import http.client,subprocess,tempfile,threading,time,unittest
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import socket
from test_routing import module,BASE_MAP

class GatewayTests(unittest.TestCase):
    def test_transformed_host_preserves_methods_privacy_queries_and_actual_icon_dependency(self):
        m=module();seen=[]
        class Handler(BaseHTTPRequestHandler):
            def serve(self):
                count=int(self.headers.get('Content-Length','0'))
                seen.append({'method':self.command,'path':self.path,'headers':dict(self.headers),'body':self.rfile.read(count)})
                body=b'icon-byte-fixture' if self.path.startswith('/assets/') else b'authored-test'
                self.send_response(200);self.send_header('Content-Length',str(len(body)));self.end_headers()
                if self.command!='HEAD':self.wfile.write(body)
            do_GET=serve
            do_HEAD=serve
            def log_message(self,*args):pass
        upstream=ThreadingHTTPServer(('127.0.0.1',0),Handler)
        thread=threading.Thread(target=upstream.serve_forever,daemon=True);thread.start()
        sock=socket.socket();sock.bind(('127.0.0.1',0));port=sock.getsockname()[1];sock.close()
        icon='/assets/mv39/favicon.ico'
        def block(path):
            return 'location = '+path+''' {
 if ($request_method !~ ^(GET|HEAD)$) { return 405; }
 proxy_pass http://127.0.0.1:4820;
 proxy_pass_request_headers off;
 proxy_pass_request_body off;
 proxy_set_header Host easy-scraping.com;
 proxy_set_header Cookie $http_cookie;
 proxy_hide_header Set-Cookie;
}
'''
        baseline='''server { listen 127.0.0.1:PORT; server_name test.easy-scraping.com;
 allow 127.0.0.1; allow ::1; deny all;
 if ($http_cf_ray != "") { return 403; }
 if ($http_cf_connecting_ip != "") { return 403; }
 if ($mv_nov18_maintenance_gate) { return 503 "maintenance"; }
'''.replace('PORT',str(port))+''.join(block(path) for path in [*m.PAGES,icon])+'''
 location / { return 403; }
}
# 2. Main Website & API Server
server { listen 127.0.0.1:PORT; server_name easy-scraping.com; return 503; }
'''.replace('PORT',str(port))
        transformed=m.test_sources(baseline,[icon])
        transformed=transformed.replace('http://127.0.0.1:4820','http://127.0.0.1:'+str(upstream.server_port)).replace('http://127.0.0.1:55438','http://127.0.0.1:'+str(upstream.server_port))
        with tempfile.TemporaryDirectory(prefix='mv-test-real-gateway-') as directory:
            root=Path(directory)
            conf='daemon off; master_process off; pid '+str(root/'nginx.pid')+'; error_log '+str(root/'error.log')+'; events {} http { map_hash_bucket_size 256; access_log off; '+m.maintenance_map(BASE_MAP,False,[icon])+transformed+' }'
            path=root/'nginx.conf';path.write_text(conf)
            proc=subprocess.Popen(['/usr/sbin/nginx','-c',str(path)],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
            def request(path,method='GET',cf=True,body=None,extra=None):
                connection=http.client.HTTPConnection('127.0.0.1',port,timeout=2,source_address=('127.0.0.2',0))
                headers={'Host':'test.easy-scraping.com','Accept':'text/html',**({'CF-Connecting-IP':'198.51.100.77','CF-Ray':'fixture-edge'} if cf else {}),**(extra or {})}
                connection.request(method,path,body=body,headers=headers);response=connection.getresponse();result=(response.status,response.read());connection.close();return result
            try:
                deadline=time.monotonic()+3
                while True:
                    if proc.poll() is not None:self.fail(proc.stderr.read().decode())
                    try:
                        request('/');break
                    except OSError:
                        if time.monotonic()>deadline:raise
                        time.sleep(.02)
                seen.clear()
                status,body=request('/?lang=ko',body=b'get-body-fixture',extra={'Cookie':'qa_fixture=disposable','Authorization':'Bearer qa-forged','X-User-Id':'qa-forged','X-Internal-Token':'qa-forged'})
                self.assertEqual((status,body),(200,b'authored-test'))
                sent=seen[-1];self.assertEqual(sent['path'],'/?lang=ko');self.assertEqual(sent['body'],b'')
                self.assertEqual(sent['headers'].get('Cookie'),'qa_fixture=disposable')
                for key in ['Authorization','X-User-Id','X-Internal-Token','CF-Connecting-IP']:
                    self.assertNotIn(key,sent['headers'])
                self.assertEqual(request(icon+'?v='+'a'*64),(200,b'icon-byte-fixture'))
                self.assertEqual(request('/',method='HEAD'),(200,b''))
                self.assertEqual(request('/',cf=False),(200,b'authored-test'))
                for api in ['/api/v1/auth/session','/api/v1/stocks','/api/v1/board','/api/v1/wallet/summary']:
                    self.assertEqual(request(api+'?q=fixture',extra={'Cookie':'qa_fixture=disposable','X-Actor-User-Id':'qa-forged','Authorization':'Bearer qa-forged'})[0],200)
                    sent=seen[-1];self.assertEqual(sent['headers'].get('Host'),'test.easy-scraping.com')
                    self.assertEqual(sent['headers'].get('Cookie'),'qa_fixture=disposable')
                    self.assertNotIn('Authorization',sent['headers']);self.assertNotIn('X-Actor-User-Id',sent['headers'])
                count=len(seen)
                for path in ['/admin','/wallet','/unknown','/LOGIN','/Tools','/api/v1/admin/me','/assets/mv46/admin-shop.js','/assets/mv39/FAVICON.ico']:
                    self.assertEqual(request(path)[0],403,path)
                for method in ['POST','OPTIONS']:
                    self.assertEqual(request('/api/v1/stocks',method=method,body=b'write-fixture')[0],403)
                    self.assertEqual(request('/',method=method,cf=False)[0],405)
                self.assertEqual(request('/unknown',cf=False)[0],403)
                self.assertEqual(len(seen),count)
            finally:
                proc.terminate()
                try:proc.wait(timeout=3)
                except subprocess.TimeoutExpired:proc.kill();proc.wait(timeout=3)
                proc.stderr.close();upstream.shutdown();upstream.server_close();thread.join()
    def test_unreviewed_existing_proxy_policy_is_refused(self):
        m=module()
        block='location = / { return 200; }'
        before='server { server_name test.easy-scraping.com; deny all; if ($http_cf_ray != "") { return 403; } if ($http_cf_connecting_ip != "") { return 403; } '+block+' }\\n# 2. Main Website & API Server\\nserver {server_name _;}'
        with self.assertRaises(ValueError):m.test_sources(before)

if __name__=='__main__':unittest.main()
