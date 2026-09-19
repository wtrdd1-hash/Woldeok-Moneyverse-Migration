from pathlib import Path
import importlib.util

MODULE = Path(__file__).with_name('switch-nginx-server-ports.py')
spec = importlib.util.spec_from_file_location('switch_nginx', MODULE)
assert spec and spec.loader
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

sample = '''
server {
  server_name test.example;
  location = /health { proxy_pass http://127.0.0.1:3100/health; }
  location / { proxy_pass http://127.0.0.1:3101; }
}
server {
  server_name prod.example;
  location = /health { proxy_pass http://127.0.0.1:3000/health; }
  location /api { proxy_pass http://127.0.0.1:3000; }
  location / { proxy_pass http://127.0.0.1:3001; }
}
'''

updated = mod.switch_ports(sample, 'prod.example', 3000, 3002, 3001, 3003)
assert '127.0.0.1:3002/health' in updated
assert '127.0.0.1:3002;' in updated
assert '127.0.0.1:3003;' in updated
assert '127.0.0.1:3100/health' in updated
assert '127.0.0.1:3101;' in updated

try:
    mod.switch_ports(sample, 'missing.example', 3000, 3002, 3001, 3003)
except ValueError:
    pass
else:
    raise AssertionError('missing server_name should fail closed')

print('switch-nginx-server-ports: tests passed')
