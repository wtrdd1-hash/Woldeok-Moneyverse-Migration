#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
from pathlib import Path
import tempfile


def server_block(text: str, server_name: str) -> tuple[int, int]:
    marker = f"server_name {server_name};"
    marker_at = text.find(marker)
    if marker_at < 0:
        raise ValueError(f"server_name not found: {server_name}")
    start = text.rfind("server {", 0, marker_at)
    if start < 0:
        raise ValueError(f"server block start not found: {server_name}")
    depth = 0
    opened = False
    for index in range(start, len(text)):
        char = text[index]
        if char == "{":
            depth += 1
            opened = True
        elif char == "}":
            depth -= 1
            if opened and depth == 0:
                return start, index + 1
    raise ValueError(f"server block end not found: {server_name}")


def switch_ports(text: str, server_name: str, backend_from: int, backend_to: int, frontend_from: int, frontend_to: int) -> str:
    start, end = server_block(text, server_name)
    block = text[start:end]
    backend_old = f"127.0.0.1:{backend_from}"
    backend_new = f"127.0.0.1:{backend_to}"
    frontend_old = f"127.0.0.1:{frontend_from}"
    frontend_new = f"127.0.0.1:{frontend_to}"
    backend_hits = block.count(backend_old)
    frontend_hits = block.count(frontend_old)
    if backend_hits < 1:
        raise ValueError(f"backend port {backend_from} not present in {server_name} block")
    if frontend_hits < 1:
        raise ValueError(f"frontend port {frontend_from} not present in {server_name} block")
    block = block.replace(backend_old, backend_new).replace(frontend_old, frontend_new)
    return text[:start] + block + text[end:]


def atomic_write(path: Path, text: str) -> None:
    mode = path.stat().st_mode & 0o777
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(tmp_name, mode)
        os.replace(tmp_name, path)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("config", type=Path)
    parser.add_argument("server_name")
    parser.add_argument("backend_from", type=int)
    parser.add_argument("backend_to", type=int)
    parser.add_argument("frontend_from", type=int)
    parser.add_argument("frontend_to", type=int)
    args = parser.parse_args()
    original = args.config.read_text(encoding="utf-8")
    updated = switch_ports(original, args.server_name, args.backend_from, args.backend_to, args.frontend_from, args.frontend_to)
    atomic_write(args.config, updated)


if __name__ == "__main__":
    main()
