#!/usr/bin/env python3
"""Atomic, reversible Nginx exact-path Spring SSR preview exposure.

Requires root. Test is enabled and externally verified before Production.
Never touches active /, /api, /admin or full-site frontend routing.
"""
import argparse
import fcntl
import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone

SITE = Path('/etc/nginx/sites-enabled/moneyverse').resolve()
SNIPPET = Path('/etc/nginx/snippets/moneyverse-spring-web-preview-v20261118.conf')
RECOVERY = Path('/srv/moneyverse-data/ops/recovery/spring-web-preview-v2026.11.18.3')
ANCHORS = {
    'test': ('# Isolated Moneyverse test origin — exact-SHA QA only.\nserver {', '4576'),
    'prod': ('# 2. Main Website & API Server (easy-scraping.com only - NO MCP routes)\nserver {', '4577'),
}

def sha(content: bytes):
    return hashlib.sha256(content).hexdigest()

def install_atomic(target: Path, content: bytes):
    original = target.stat() if target.exists() else None
    fd, temp = tempfile.mkstemp(prefix=target.name+'.tmp-', dir=target.parent)
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())
        if original:
            os.chmod(temp, original.st_mode & 0o777)
            os.chown(temp, original.st_uid, original.st_gid)
        else:
            os.chmod(temp, 0o644)
        os.replace(temp, target)
    finally:
        if os.path.exists(temp): os.unlink(temp)

def validate():
    subprocess.run(['/usr/sbin/nginx', '-t'], check=True)

def reload():
    subprocess.run(['/usr/bin/systemctl', 'reload', 'nginx.service'], check=True)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('phase', choices=ANCHORS)
    parser.add_argument('operation', choices=('enable', 'disable'))
    parser.add_argument('--snippet-source', type=Path)
    args = parser.parse_args()
    assert os.geteuid() == 0, 'root required'
    RECOVERY.mkdir(parents=True, exist_ok=True)
    with open('/run/lock/moneyverse-spring-web-preview-v20261118.lock', 'w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        original = SITE.read_bytes()
        original_text = original.decode('utf-8')
        anchor, port = ANCHORS[args.phase]
        marker = '# mv-spring-web-preview-v2026.11.18.3-' + args.phase
        inject = (f'    {marker}-begin\n'
                  f'    set $mv_spring_preview_upstream 127.0.0.1:{port};\n'
                  '    include /etc/nginx/snippets/moneyverse-spring-web-preview-v20261118.conf;\n'
                  f'    {marker}-end\n')
        if args.operation == 'enable':
            assert args.snippet_source and args.snippet_source.is_file(), 'source snippet required'
            assert original_text.count(anchor) == 1, 'unique server anchor absent'
            assert marker not in original_text, 'already enabled'
            snippet = args.snippet_source.read_bytes()
            if SNIPPET.exists():
                assert SNIPPET.read_bytes() == snippet, 'different installed snippet: fail closed'
            else:
                install_atomic(SNIPPET, snippet)
            modified = original_text.replace(anchor, anchor+'\n'+inject, 1)
        else:
            assert original_text.count(inject) == 1, 'expected release marker absent'
            modified = original_text.replace(inject, '', 1)
        backup = RECOVERY / f'{datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")}-{args.phase}-{args.operation}-before-{sha(original)[:12]}.conf'
        backup.write_bytes(original)
        backup.chmod(0o440)
        try:
            if SITE.read_bytes() != original:
                raise RuntimeError('concurrent Nginx edit detected; no overwrite')
            install_atomic(SITE, modified.encode('utf-8'))
            validate()
            reload()
        except Exception:
            current = SITE.read_bytes()
            if current == modified.encode('utf-8'):
                install_atomic(SITE, original)
                validate()
                reload()
            raise
        print(f'EDGE_{args.operation.upper()}_{args.phase.upper()}_OK before={sha(original)} after={sha(modified.encode())} backup={backup} target={SITE} port={port}')

if __name__ == '__main__':
    main()
