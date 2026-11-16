#!/usr/bin/env python3
"""Render a limited reversible Nginx guard for unverified finance endpoints.

No live edits, no reload and no secret handling. This renderer fails closed
if the Nginx topology or existing KDIC blocks differ from the baseline.
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

VERSION = "v2026.11.17.6"
MARKER = f"# {VERSION} KDIC + legacy engagement release hold"
PREFIXES = (
    "/api/admin/kdic/",
    "/api/v1/admin/kdic/",
    "/api/kdic/",
    "/api/v1/kdic/",
)
ENGAGEMENT_PATTERN = (
    r"^/api/(?:v1/)?(?:engagement|dopamine)"
    r"(?:/?|/(?:status|streak|features|claim-streak|streak/claim|"
    r"bull-bear|dopamine/bull-bear|dopamine/status|dopamine/spin))$"
)


def location_block(path: str) -> str:
    return (
        f"    location ^~ {path} {{\n"
        '        default_type application/json;\n'
        '        add_header Cache-Control "private, no-store" always;\n'
        '        add_header X-Robots-Tag "noindex, nofollow" always;\n'
        '        return 503 \'{"ok":false,"code":"FINANCE_LEDGER_RELEASE_HOLD"}\';\n'
        "    }\n"
    )


def engagement_block() -> str:
    return (
        f"    location ~ {ENGAGEMENT_PATTERN} {{\n"
        '        default_type application/json;\n'
        '        add_header Cache-Control "private, no-store" always;\n'
        '        add_header X-Robots-Tag "noindex, nofollow" always;\n'
        '        return 503 \'{"ok":false,"code":"ENGAGEMENT_LEDGER_RELEASE_HOLD"}\';\n'
        "    }\n"
    )


def render(config: str) -> str:
    if MARKER in config:
        raise ValueError("already patched: refusing to layer a second guard")
    chunks = re.split(r"(?m)(?=^server \{)", config)
    changed = set()
    for i, chunk in enumerate(chunks):
        internal = re.search(r"(?m)^\s*listen\s+127\.0\.0\.1:4400\s*;", chunk)
        public = re.search(r"(?m)^\s*listen\s+80\s+default_server\s*;", chunk)
        if not internal and not public:
            continue
        scope = "internal" if internal else "public"
        if scope in changed:
            raise ValueError(f"duplicate {scope} server scope")
        changed.add(scope)
        if not chunk.startswith("server {\n"):
            raise ValueError("unexpected server topology")
        insert = f"    {MARKER} ({scope})\n"
        for path in PREFIXES:
            existing = re.compile(
                r"(?ms)^    location \^~ " + re.escape(path) + r" \{\n.*?^    \}\n"
            )
            chunk, count = existing.subn("", chunk)
            if count > 1:
                raise ValueError(f"duplicate existing Nginx location {scope} {path}")
            insert += location_block(path) + "\n"
        insert += engagement_block() + "\n"
        chunks[i] = chunk.replace("server {\n", "server {\n" + insert, 1)
    if changed != {"internal", "public"}:
        raise ValueError(f"expected exact gateway+Production servers, got {changed}")
    return "".join(chunks)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    source = Path(args.input)
    dest = Path(args.output)
    if source.resolve() == dest.resolve():
        parser.error("input and output must differ; renderer must not change live config")
    patched = render(source.read_text())
    dest.write_text(patched)
    print(f"rendered {VERSION}: internal and Production HTTP gateways only")


if __name__ == "__main__":
    main()
