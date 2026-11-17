#!/usr/bin/env python3
"""Scoped read-only KDIC admin recovery: deterministic, reversible Nginx renderer."""
import argparse
import re
from pathlib import Path

MARKER = "# v2026.11.17.13 authenticated KDIC admin read bridge"
ACTIONS = ("overview", "ledger-integrity")
PREFIXES = ("/api", "/api/v1")


def exact_locations():
    result = ""
    for action in ACTIONS:
        for prefix in PREFIXES:
            public_path = f"{prefix}/admin/kdic/{action}"
            canonical_path = f"/api/v1/admin/kdic/{action}"
            result += (
                f"    location = {public_path} {{\n"
                '        if ($request_method !~ ^(GET|HEAD)$) { return 405; }\n'
                f"        proxy_pass http://127.0.0.1:4500{canonical_path};\n"
                "        proxy_http_version 1.1;\n"
                "        proxy_set_header Host $host;\n"
                "        proxy_set_header X-Real-IP $remote_addr;\n"
                "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n"
                "        proxy_set_header X-Forwarded-Proto https;\n"
                '        proxy_set_header x-internal-token "";\n'
                '        proxy_set_header x-user-id "";\n'
                '        proxy_set_header x-actor-user-id "";\n'
                "        proxy_connect_timeout 3s;\n"
                "        proxy_read_timeout 12s;\n"
                '        add_header Cache-Control "private, no-store" always;\n'
                '        add_header X-Robots-Tag "noindex, nofollow" always;\n'
                "    }\n\n"
            )
    return result


def render(config: str) -> str:
    if MARKER in config:
        raise ValueError("route already installed")
    fragments = re.split(r"(?m)(?=^server \{)", config)
    matched = set()
    for idx, fragment in enumerate(fragments):
        internal = re.search(r"(?m)^\s*listen\s+127\.0\.0\.1:4400\s*;", fragment)
        public = re.search(r"(?m)^\s*listen\s+80\s+default_server\s*;", fragment)
        if not internal and not public:
            continue
        scope = "internal" if internal else "public"
        if scope in matched:
            raise ValueError("duplicate server: " + scope)
        matched.add(scope)
        if not fragment.startswith("server {\n"):
            raise ValueError("unexpected server declaration")
        for action in ACTIONS:
            for prefix in PREFIXES:
                path = f"{prefix}/admin/kdic/{action}"
                if re.search(r"(?m)^\s*location\s*=\s*" + re.escape(path) + r"\s*\{", fragment):
                    raise ValueError("existing exact KDIC path: " + path)
        fragments[idx] = fragment.replace("server {\n", "server {\n    " + MARKER + " (" + scope + ")\n" + exact_locations(), 1)
    if matched != {"public", "internal"}:
        raise ValueError("two expected Nginx server scopes were not found")
    return "".join(fragments)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    args = p.parse_args()
    inp, out = Path(args.input), Path(args.output)
    if inp.resolve() == out.resolve():
        p.error("never overwrite active input")
    out.write_text(render(inp.read_text()))
    print("KDIC admin GET/HEAD-only renderer ready")


if __name__ == "__main__":
    main()
