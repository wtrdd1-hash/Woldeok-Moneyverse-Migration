#!/usr/bin/env python3
"""Guarded, reversible Test-only Nginx metadata-route patch. Never touches Production."""
import argparse
import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone

TEST_HOST = b"server_name test.easy-scraping.com;"
TEST_END = b"# 2. Main Website & API Server (easy-scraping.com only - NO MCP routes)"
TEST_INSERT = (
    b"\n # v2026.11.24.3 Test-only crawler metadata (robots disallow and empty sitemap).\n"
    b" include /etc/nginx/snippets/moneyverse-test-crawl-block-v20261124-3.conf;\n"
)
SNIPPET_DEST = Path("/etc/nginx/snippets/moneyverse-test-crawl-block-v20261124-3.conf")
CONFIG = Path("/etc/nginx/sites-enabled/moneyverse")
BACKUP_ROOT = Path("/var/backups/moneyverse-test-ingress-v20261124-3")


def sha(data):
    return hashlib.sha256(data).hexdigest()


def sections(config):
    if config.count(TEST_HOST) != 1 or config.count(TEST_END) != 1:
        raise RuntimeError("Test host or Production boundary missing/ambiguous")
    host = config.index(TEST_HOST)
    end = config.index(TEST_END)
    if host >= end or b"server {" not in config[:host]:
        raise RuntimeError("Test host is not preceding expected Production boundary")
    return host, end


def patched(config):
    host, end = sections(config)
    if TEST_INSERT in config:
        raise RuntimeError("Already installed")
    if b"moneyverse-test-crawl-block-v20261124-3.conf" in config:
        raise RuntimeError("Conflicting prior installation")
    return config[:host + len(TEST_HOST)] + TEST_INSERT + config[host + len(TEST_HOST):]


def unpatched(config):
    host, end = sections(config)
    if config.count(TEST_INSERT) != 1 or config.index(TEST_INSERT) >= end:
        raise RuntimeError("Own installation missing/ambiguous")
    return config.replace(TEST_INSERT, b"", 1)


def run(*args):
    subprocess.run(args, check=True, timeout=12)


def atomic_write(dest, data, mode=None):
    old = dest.stat() if dest.exists() else None
    fd, path = tempfile.mkstemp(prefix=".mv-test-semantic-", dir=str(dest.parent))
    try:
        with os.fdopen(fd, "wb") as file:
            file.write(data)
            file.flush()
            os.fsync(file.fileno())
        os.chmod(path, mode if mode is not None else (old.st_mode & 0o777 if old else 0o644))
        if old:
            os.chown(path, old.st_uid, old.st_gid)
        os.replace(path, dest)
    finally:
        if os.path.exists(path):
            os.unlink(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["preflight", "apply", "rollback"])
    parser.add_argument("--config", type=Path, default=CONFIG)
    parser.add_argument("--snippet", type=Path, required=True)
    args = parser.parse_args()
    proposed = args.snippet.read_bytes()
    if not proposed.startswith(b"# Isolated Test origin ONLY:"):
        raise RuntimeError("Unexpected snippet source")
    original = args.config.read_bytes()
    sections(original)
    print(f"action={args.action} nginx_before_sha256={sha(original)}")
    if args.action == "preflight":
        changed = patched(original)
        assert changed[:original.index(TEST_HOST)] == original[:original.index(TEST_HOST)]
        assert changed[changed.index(TEST_END):] == original[original.index(TEST_END):]
        if SNIPPET_DEST.exists() and SNIPPET_DEST.read_bytes() != proposed:
            raise RuntimeError("Existing Test snippet differs; do not override")
        print(f"PREFLIGHT_OK test-only_diff_bytes={len(changed)-len(original)}")
        return

    if os.geteuid() != 0:
        raise RuntimeError("Root required for Nginx apply/rollback")

    import fcntl
    lock_path = Path("/run/lock/moneyverse-test-ingress-v20261124-3.lock")
    with lock_path.open("w") as lock:
        fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
        original = args.config.read_bytes()
        sections(original)
        if args.action == "apply":
            changed = patched(original)
            if SNIPPET_DEST.exists() and SNIPPET_DEST.read_bytes() != proposed:
                raise RuntimeError("A different snippet occupies destination")
            BACKUP_ROOT.mkdir(parents=True, exist_ok=True)
            os.chmod(BACKUP_ROOT, 0o700)
            backup = BACKUP_ROOT / f"{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}-{sha(original)[:12]}.conf"
            backup.write_bytes(original)
            os.chmod(backup, 0o600)
            if not SNIPPET_DEST.exists():
                atomic_write(SNIPPET_DEST, proposed, 0o644)
            # Recheck the source before the atomic swap; never discard a known foreign change.
            if args.config.read_bytes() != original:
                raise RuntimeError("Concurrent Nginx config update, aborting")
            if changed[changed.index(TEST_END):] != original[original.index(TEST_END):]:
                raise RuntimeError("Production suffix changed, aborting")
            atomic_write(args.config, changed)
            try:
                run("nginx", "-t")
                run("systemctl", "reload", "nginx")
            except Exception:
                if args.config.read_bytes() == changed:
                    atomic_write(args.config, original)
                    run("nginx", "-t")
                    run("systemctl", "reload", "nginx")
                raise
            print(f"APPLIED test_only=true nginx_sha256={sha(changed)} original_backup={backup}")
        else:
            changed = unpatched(original)
            if args.config.read_bytes() != original:
                raise RuntimeError("Concurrent Nginx config update, aborting")
            atomic_write(args.config, changed)
            try:
                run("nginx", "-t")
                run("systemctl", "reload", "nginx")
            except Exception:
                if args.config.read_bytes() == changed:
                    atomic_write(args.config, original)
                    run("nginx", "-t")
                    run("systemctl", "reload", "nginx")
                raise
            print(f"ROLLED_BACK own_include_only=true nginx_sha256={sha(changed)}")
    # Keep the snippet and snapshot after rollback for audit; re-apply is safe.


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, OSError, subprocess.CalledProcessError) as error:
        print(f"BLOCKED: {error}", file=sys.stderr)
        sys.exit(1)
