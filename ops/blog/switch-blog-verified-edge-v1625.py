#!/usr/bin/env python3
"""v1625: atomically switch *only* the verified-blog Nginx locations.

Run as root, after canary HTTP/canonical/sitemap checks.
Refuses concurrent edits and fails closed on wrong route counts.
No backend/database/finance configuration is modified.
"""
import argparse
import hashlib
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import tempfile
from datetime import datetime, timezone

LOCATIONS = {
    ("=", "/blog"), ("=", "/en/blog"), ("=", "/ja/blog"), ("=", "/zh/blog"),
    ("=", "/admin/blog"), ("=", "/api/blog"), ("=", "/sitemap-blog.xml"),
    ("^~", "/blog/"), ("^~", "/en/blog/"), ("^~", "/ja/blog/"),
    ("^~", "/zh/blog/"), ("^~", "/admin/blog/"), ("^~", "/api/admin/blog/"),
}
LOCATION_RE = re.compile(r"^\s*location\s+(=|\^~)\s+([^\s{]+)\s*\{\s*$")

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="/etc/nginx/sites-enabled/moneyverse")
    parser.add_argument("--expected-sha256", required=True)
    parser.add_argument("--old-port", type=int, default=4205)
    parser.add_argument("--new-port", type=int, default=4207)
    parser.add_argument("--backup-dir", default="/srv/moneyverse-data/ops/private/blog-v1625")
    parser.add_argument("--check-only", action="store_true")
    args = parser.parse_args()

    config = Path(args.config)
    original = config.read_bytes()
    if sha(original) != args.expected_sha256:
        raise SystemExit("REFUSED: Nginx source SHA changed; another agent may have edited it")
    if args.old_port == args.new_port:
        raise SystemExit("REFUSED: same port")
    old = f"proxy_pass http://127.0.0.1:{args.old_port};"
    new = f"proxy_pass http://127.0.0.1:{args.new_port};"
    inside = None
    changes = set()
    transformed = []
    for line in original.decode("utf-8").splitlines(keepends=True):
        match = LOCATION_RE.match(line)
        if match:
            inside = (match.group(1), match.group(2))
        if inside in LOCATIONS and old in line:
            if inside in changes:
                raise SystemExit(f"REFUSED: duplicate blog proxy for {inside}")
            line = line.replace(old, new)
            changes.add(inside)
        if line.lstrip().startswith("}"):
            inside = None
        transformed.append(line)
    if changes != LOCATIONS:
        raise SystemExit(f"REFUSED: expected {len(LOCATIONS)} routes, got {len(changes)}")
    result = "".join(transformed).encode("utf-8")
    if old.encode() not in original or result == original:
        raise SystemExit("REFUSED: no effective change")
    print("ROUTES_VALIDATED", len(changes), "config_sha256", sha(original), "target_sha256", sha(result))
    if args.check_only:
        return
    if os.geteuid() != 0:
        raise SystemExit("REFUSED: root required for atomic activation")

    backup_dir = Path(args.backup_dir)
    backup_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup = backup_dir / f"moneyverse-before-blog-v1625-{stamp}.conf"
    shutil.copy2(config, backup)
    backup.chmod(0o600)
    previous_stat = config.stat()
    fd, tmp = tempfile.mkstemp(prefix=".moneyverse-blog-v1625-", dir=str(config.parent))
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(result)
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(tmp, stat.S_IMODE(previous_stat.st_mode))
        os.chown(tmp, previous_stat.st_uid, previous_stat.st_gid)
        if sha(config.read_bytes()) != args.expected_sha256:
            raise SystemExit("REFUSED: Nginx changed between backup and swap")
        os.replace(tmp, config)
        tested = subprocess.run(["nginx", "-t"], capture_output=True, text=True)
        if tested.returncode:
            shutil.copy2(backup, config)
            subprocess.run(["nginx", "-t"], check=False)
            raise SystemExit("NGINX_TEST_FAILED: restored original file")
        reloaded = subprocess.run(["systemctl", "reload", "nginx"], capture_output=True, text=True)
        if reloaded.returncode:
            shutil.copy2(backup, config)
            subprocess.run(["nginx", "-t"], check=False)
            subprocess.run(["systemctl", "reload", "nginx"], check=False)
            raise SystemExit("NGINX_RELOAD_FAILED: restored original file")
        print("BLOG_EDGE_SWITCHED", len(changes), "BACKUP", backup, "NGINX_OK", True)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)

if __name__ == "__main__":
    main()
