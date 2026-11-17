#!/usr/bin/env python3
"""Reviewable, reversible, exact-match authenticated GET/HEAD edge read bridge.

Intentionally leaves all finance POSTs and synthetic/unsupported Spring routes
under the earlier 503 release hold. Never changes a live config itself.
"""
import argparse
import re
from pathlib import Path

VERSION = "v2026.11.17.9"
MARKER = f"# {VERSION} verified-member engagement read bridge"
ENDPOINTS = (
    "/engagement",
    "/engagement/early-game",
    "/engagement/dopamine/attendance/status",
    "/engagement/dopamine/daily-quest/status",
)


def locations():
    result = ""
    for endpoint in ENDPOINTS:
        for prefix in ("/api", "/api/v1"):
            source = prefix + endpoint
            target = "/api/v1" + endpoint
            result += (
                f"    location = {source} {{\n"
                '        if ($request_method !~ ^(GET|HEAD)$) { return 405; }\n'
                f"        proxy_pass http://127.0.0.1:4500{target};\n"
                "        proxy_http_version 1.1;\n"
                "        proxy_set_header Host $host;\n"
                "        proxy_set_header X-Real-IP $remote_addr;\n"
                "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n"
                "        proxy_set_header X-Forwarded-Proto https;\n"
                "        proxy_connect_timeout 3s;\n"
                "        proxy_read_timeout 10s;\n"
                '        add_header Cache-Control "private, no-store" always;\n'
                '        add_header X-Robots-Tag "noindex, nofollow" always;\n'
                "    }\n\n"
            )
    return result


def render(config):
    if MARKER in config:
        raise ValueError("already applied")
    parts = re.split(r"(?m)(?=^server \{)", config)
    scopes = set()
    for idx, part in enumerate(parts):
        internal = re.search(r"(?m)^\s*listen\s+127\.0\.0\.1:4400\s*;", part)
        production = re.search(r"(?m)^\s*listen\s+80\s+default_server\s*;", part)
        if not internal and not production:
            continue
        kind = "internal" if internal else "production"
        if kind in scopes:
            raise ValueError("duplicate server " + kind)
        scopes.add(kind)
        if not part.startswith("server {\n"):
            raise ValueError("unknown server layout")
        for endpoint in ENDPOINTS:
            for prefix in ("/api", "/api/v1"):
                route = prefix + endpoint
                if re.search(r"(?m)^\s*location\s*=\s*" + re.escape(route) + r"\s*\{", part):
                    raise ValueError("existing exact route: " + route)
        parts[idx] = part.replace(
            "server {\n",
            "server {\n    " + MARKER + " (" + kind + ")\n" + locations(),
            1
        )
    if scopes != {"internal", "production"}:
        raise ValueError("required gateway topology not found: " + repr(scopes))
    return "".join(parts)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    src = Path(args.input)
    dst = Path(args.output)
    if src.resolve() == dst.resolve():
        parser.error("output cannot overwrite input")
    dst.write_text(render(src.read_text()))
    print("Rendered edge read bridge:", VERSION)
