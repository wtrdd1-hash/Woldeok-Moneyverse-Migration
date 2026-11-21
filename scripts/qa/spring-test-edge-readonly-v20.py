#!/usr/bin/env python3
"""
v2026.11.18.20: localhost-only Test ingress smoke; never read private bodies.
No credentials, money writes, authentication impersonation or destructive HTTP.
Run ON the authorized test host; public access to Test is deliberately blocked.
"""
import json
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ORIGIN = "http://127.0.0.1"
HOST = "test.easy-scraping.com"
CASES = [
    ("/", 200, "text/html"),
    ("/health", 200, "application/json"),
    ("/api/version", 200, "application/json"),
    ("/api/auth/providers", 200, "application/json"),
    ("/api/shop/catalog", 200, "application/json"),
    ("/api/v1/admin/users", 401, "application/json"),
    ("/api/pension/my-account", 401, "application/json"),
    ("/app-api/v1/auth/viewer", 404, "application/json"),
    ("/shop", 200, "text/html"),
    ("/api/quant/strategies", 503, "application/json"),
]

def check():
    failures = []
    results = []
    for path, expected_status, expected_ct in CASES:
        headers = {
            "Host": HOST,
            "Accept": "text/html" if expected_ct == "text/html" else "application/json",
            "User-Agent": "moneyverse-test-readonly-v20",
        }
        request = Request(ORIGIN + path, headers=headers, method="GET")
        try:
            with urlopen(request, timeout=5) as res:
                actual = res.status
                content_type = res.headers.get("Content-Type", "").split(";")[0]
        except HTTPError as error:
            actual = error.code
            content_type = error.headers.get("Content-Type", "").split(";")[0]
            error.close()
        except OSError as error:
            actual = type(error).__name__
            content_type = ""
        results.append({"path": path, "status": actual, "content_type": content_type})
        if (actual, content_type) != (expected_status, expected_ct):
            failures.append(path)
    print(json.dumps({"total": len(results), "failures": failures,
                      "samples": results}, ensure_ascii=False))
    # Transport checks do not prove authorization, finance, UI hydration or E2E correctness.
    return 0 if not failures else 1

if __name__ == "__main__":
    sys.exit(check())
