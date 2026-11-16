#!/usr/bin/env python3
"""A strictly scoped Production Nginx public-KDIC read bridge.

Only previously fail-closed 2026-11-17 finance-gateway protection is augmented.
Does not expose KDIC admin data or reward/ledger write endpoints.
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

MARKER = "# v2026.11.17.8 canonical KDIC public portal read bridge"
PREVIOUS = "# v2026.11.17.6 KDIC + legacy engagement release hold"
PATHS = ("/api/kdic/portal", "/api/v1/kdic/portal")


def exact_read_location(path: str) -> str:
    return (
        f"    location = {path} {{\n"
        '        if ($request_method !~ ^(GET|HEAD)$) { return 405; }\n'
        '        proxy_pass http://127.0.0.1:4500/api/v1/kdic/portal;\n'
        '        proxy_http_version 1.1;\n'
        '        proxy_set_header Host $host;\n'
        '        proxy_set_header X-Real-IP $remote_addr;\n'
        '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n'
        '        proxy_set_header X-Forwarded-Proto https;\n'
        '        proxy_connect_timeout 3s;\n'
        '        proxy_read_timeout 10s;\n'
        '        add_header Cache-Control "private, no-store" always;\n'
        '        add_header X-Robots-Tag "noindex, nofollow" always;\n'
        '    }\n'
    )


def render(raw: str) -> str:
    if MARKER in raw:
        raise ValueError("already applied: repeat bridge layering forbidden")
    parts = re.split(r"(?m)(?=^server \{)", raw)
    changed = set()
    for index, part in enumerate(parts):
        internal = re.search(r"(?m)^\s*listen\s+127\.0\.0\.1:4400\s*;", part)
        public = re.search(r"(?m)^\s*listen\s+80\s+default_server\s*;", part)
        if not internal and not public:
            continue
        scope = "internal" if internal else "public"
        if scope in changed:
            raise ValueError(f"duplicate {scope} Nginx server")
        if not part.startswith("server {\n"):
            raise ValueError("unsupported Nginx server indentation")
        if f"{PREVIOUS} ({scope})" not in part:
            raise ValueError(f"missing previous fail-closed guard in {scope}")
        for path in PATHS:
            if re.search(r"(?m)^\s*location\s*=\s*" + re.escape(path) + r"\s*\{",part):
                raise ValueError("existing exact KDIC portal location; collision")
            if f"location ^~ {'/api/v1/kdic/' if '/v1/' in path else '/api/kdic/'}" not in part:
                raise ValueError(f"previous KDIC hold location missing {path}")
        inserted = f"    {MARKER} ({scope})\n"
        for path in PATHS:
            inserted += exact_read_location(path) + "\n"
        parts[index] = part.replace("server {\n", "server {\n" + inserted, 1)
        changed.add(scope)
    if changed != {"internal","public"}:
        raise ValueError(f"expected 2 reviewed Production/internal servers, got {changed}")
    return "".join(parts)


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--input",required=True)
    p.add_argument("--output",required=True)
    x=p.parse_args()
    source=Path(x.input)
    dest=Path(x.output)
    if source.resolve()==dest.resolve():
        p.error("refusing in-place edit")
    dest.write_text(render(source.read_text()))
    print("rendered v2026.11.17.8: KDIC public portal exact-only, 2 servers")


if __name__=="__main__":
    main()
