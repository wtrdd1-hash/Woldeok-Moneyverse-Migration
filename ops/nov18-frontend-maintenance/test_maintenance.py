import importlib.util
import json
from pathlib import Path
import socket
import subprocess
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = Path(__file__).resolve().parent
MODULE = HERE / 'maintenance.py'


def module():
    if not MODULE.exists():
        raise AssertionError('The reversible frontend maintenance implementation is missing')
    spec = importlib.util.spec_from_file_location('maintenance', MODULE)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


class MaintenanceTests(unittest.TestCase):
    def test_patch_is_limited_to_two_frontend_servers_and_fails_on_ambiguous_input(self):
        m = module()
        before = 'server { listen 127.0.0.1:4400; location /api/ { return 409; } }\nserver { listen 80; listen [::]:80; server_name test.easy-scraping.com;\n allow 127.0.0.1; allow ::1; deny all;\n if ($http_cf_ray != "") { return 403; }\n if ($http_cf_connecting_ip != "") { return 403; }\n location / { return 200; }\n}\nserver {\n    listen 80 default_server;\n    server_name _;\n    location /api/ { return 409; }\n}\n'
        after = m.patch_site(before, '/etc/nginx/snippets/owned-maintenance.conf')
        self.assertEqual(after.count('include /etc/nginx/snippets/owned-maintenance.conf;'), 2)
        test_only = m.patch_site(before, '/etc/nginx/snippets/owned-maintenance.conf', test_only=True)
        self.assertEqual(test_only.count('include /etc/nginx/snippets/owned-maintenance.conf;'), 1)
        self.assertIn('    listen 80 default_server;\n    server_name _;', test_only)
        self.assertEqual(after.replace('    include /etc/nginx/snippets/owned-maintenance.conf;\n', ''), before)
        with self.assertRaises(ValueError):
            m.patch_site(before + before, '/etc/nginx/snippets/owned-maintenance.conf')

    def test_real_nginx_preserves_api_methods_bodies_status_and_internal_authorization(self):
        m = module()
        class Echo(BaseHTTPRequestHandler):
            def log_message(self, *args):
                pass
            def do_GET(self):
                self.answer()
            def do_POST(self):
                self.answer()
            def answer(self):
                body = self.rfile.read(int(self.headers.get('Content-Length', '0'))).decode()
                data = json.dumps({'method': self.command, 'path': self.path, 'body': body}).encode()
                self.send_response(503 if self.path.startswith('/api/failure') else 200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(data)
        upstream = ThreadingHTTPServer(('127.0.0.1', 0), Echo)
        thread = threading.Thread(target=upstream.serve_forever, daemon=True)
        thread.start()
        nginx = None
        try:
            with tempfile.TemporaryDirectory(prefix='mv-maintenance-nginx-') as folder:
                root = Path(folder)
                with socket.socket() as probe:
                    probe.bind(('127.0.0.1', 0))
                    port = probe.getsockname()[1]
                (root / 'map.conf').write_text(m.render_map(['/', '/wallet', '/wallet.html', '/admin/users', '/tools/tax-calculator'], [r'^/stocks/[^/]+/?$']))
                (root / 'page.conf').write_text(m.render_gate(m.maintenance_html()))
                (root / 'nginx.conf').write_text(f'''pid {root}/nginx.pid; error_log {root}/error.log; events {{}} http {{ access_log off; include {root}/map.conf;
server {{ listen 127.0.0.1:{port}; include {root}/page.conf;
 location = /api/authorized {{ auth_request /__mv_authorize; proxy_pass http://127.0.0.1:{upstream.server_port}; }}
 location = /api/denied {{ auth_request /__mv_deny; proxy_pass http://127.0.0.1:{upstream.server_port}; }}
 location /api/ {{ proxy_pass http://127.0.0.1:{upstream.server_port}; }}
 location = /__mv_authorize {{ internal; return 204; }} location = /__mv_deny {{ internal; return 403; }}
 location / {{ return 200 "legacy"; }} }}
server {{ listen 127.0.0.1:{port}; server_name test.easy-scraping.com;
 set_real_ip_from 127.0.0.1; real_ip_header X-QA-Address;
 allow 127.0.0.1; allow ::1; deny all;
 if ($http_cf_ray != "") {{ return 403; }} if ($http_cf_connecting_ip != "") {{ return 403; }}
 include {root}/page.conf; location / {{ proxy_pass http://127.0.0.1:{upstream.server_port}; }} }} }}''')
                subprocess.run(['/usr/sbin/nginx', '-t', '-p', str(root), '-c', str(root / 'nginx.conf')], check=True, capture_output=True)
                nginx = subprocess.Popen(['/usr/sbin/nginx', '-p', str(root), '-c', str(root / 'nginx.conf'), '-g', 'daemon off;'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                def request(path, accept='text/html', data=None, extra=None):
                    req = urllib.request.Request(f'http://127.0.0.1:{port}{path}', data=data, headers={'Accept': accept, **(extra or {})})
                    try:
                        response = urllib.request.urlopen(req, timeout=2)
                    except urllib.error.HTTPError as error:
                        response = error
                    return response.status, response.headers, response.read().decode()
                import time
                deadline = time.monotonic() + 5
                while True:
                    try:
                        status, headers, body = request('/')
                        break
                    except (OSError, urllib.error.URLError):
                        if time.monotonic() >= deadline:
                            raise
                        time.sleep(.05)
                for path in ['/', '/wallet', '/wallet.html', '/admin/users', '/tools/tax-calculator', '/unknown-document']:
                    status, headers, body = request(path)
                    self.assertEqual(status, 503, path)
                    self.assertIn('프론트엔드 긴급 점검 중', body)
                    self.assertIn('text/html', headers.get('Content-Type', ''))
                    self.assertIn('no-store', headers.get('Cache-Control', ''))
                    self.assertEqual(headers.get('Retry-After'), '300')
                self.assertEqual(request('/wallet', accept='*/*')[0], 503)
                self.assertEqual(request('/stocks/AAA', accept='*/*')[0], 503)
                self.assertEqual(request('/api/authorized')[0], 200)
                self.assertEqual(request('/api/denied')[0], 403)
                self.assertEqual(request('/', extra={'Host': 'test.easy-scraping.com'})[0], 503)
                self.assertEqual(request('/', extra={'Host': 'test.easy-scraping.com', 'CF-Ray': 'qa'})[0], 403)
                self.assertEqual(request('/', extra={'Host': 'test.easy-scraping.com', 'CF-Connecting-IP': '198.51.100.9'})[0], 403)
                self.assertEqual(request('/', extra={'Host': 'test.easy-scraping.com', 'X-QA-Address': '198.51.100.9'})[0], 403)
                for path in ['/api/v1/stocks', '/api/v1/admin/me', '/api/failure']:
                    status, headers, body = request(path)
                    self.assertEqual(status, 503 if path == '/api/failure' else 200)
                    self.assertIn('application/json', headers.get('Content-Type', ''))
                    self.assertNotIn('프론트엔드', body)
                status, headers, body = request('/api/v1/wallet/transfers?qa=1', data=b'qa-body')
                self.assertEqual(status, 200)
                self.assertEqual(json.loads(body), {'method': 'POST', 'path': '/api/v1/wallet/transfers?qa=1', 'body': 'qa-body'})
                self.assertEqual(request('/__mv_authorize')[0], 404)
                self.assertEqual(request('/__mv_nov18_frontend_maintenance')[0], 404)
        finally:
            if nginx is not None:
                nginx.terminate()
                nginx.wait(timeout=5)
            upstream.shutdown()
            upstream.server_close()


    def test_a_partial_install_failure_leaves_no_owned_configuration(self):
        m = module()
        with tempfile.TemporaryDirectory(prefix='mv-maintenance-transaction-') as folder:
            stage = Path(folder)
            m.SITE, m.MAP, m.GATE = stage / 'live-site', stage / 'live-map', stage / 'live-gate'
            m.SITE.write_bytes(b'original')
            contents = {'site.before': b'original', 'site.test': b'candidate-test', 'site.after': b'candidate', 'map.conf': b'map', 'gate.conf': b'gate'}
            for name, data in contents.items():
                (stage / name).write_bytes(data)
            manifest = {'siteBefore': m.digest(b'original'), 'files': {name: m.digest(data) for name, data in contents.items()}}
            m.validate_stage = lambda _: manifest
            m.nginx = lambda _: None
            actual_atomic = m.atomic
            def interrupted(path, data, *args):
                if path == m.GATE:
                    raise OSError('Synthetic gate install failure')
                actual_atomic(path, data, *args)
            m.atomic = interrupted
            with self.assertRaises(OSError):
                m.apply(stage)
            self.assertEqual(m.SITE.read_bytes(), b'original')
            self.assertFalse(m.MAP.exists(), 'Partial map install must be removed')
            self.assertFalse(m.GATE.exists())

    def test_invalid_candidate_restores_the_exact_original_before_reload(self):
        m = module()
        with tempfile.TemporaryDirectory(prefix='mv-maintenance-invalid-') as folder:
            stage = Path(folder)
            m.SITE, m.MAP, m.GATE = stage / 'live-site', stage / 'live-map', stage / 'live-gate'
            m.SITE.write_bytes(b'original')
            contents = {'site.before': b'original', 'site.test': b'invalid candidate', 'site.after': b'invalid candidate', 'map.conf': b'map', 'gate.conf': b'gate'}
            for name, data in contents.items():
                (stage / name).write_bytes(data)
            manifest = {'siteBefore': m.digest(b'original'), 'files': {name: m.digest(data) for name, data in contents.items()}}
            m.validate_stage = lambda _: manifest
            actions = []
            def syntax(action):
                actions.append(action)
                if m.SITE.read_bytes() == b'invalid candidate':
                    raise RuntimeError('Synthetic candidate syntax rejection')
            m.nginx = syntax
            with self.assertRaises(RuntimeError):
                m.apply(stage)
            self.assertEqual(m.SITE.read_bytes(), b'original')
            self.assertFalse(m.MAP.exists())
            self.assertFalse(m.GATE.exists())
            self.assertEqual(actions[-2:], ['test', 'reload'])


if __name__ == '__main__':
    unittest.main()
