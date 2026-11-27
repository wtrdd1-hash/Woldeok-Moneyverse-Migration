#!/usr/bin/env python3
"""CANDIDATE replacement for /usr/local/bin/moneyverse-blog-post-publish-notify.py (not installed).

The installed hook has failed on every run since 2026-11-25: it posts caller-built text to the
public notify route, which became administrator-only. It also read the database directly as the
application role (relying on grants a clean migration chain does not have) and announced the
latest article on every run. This version sends no content: it asks the local API to claim the
newest unannounced article (migration 355) and the API builds the message from the database.
Installing it is a Production change (owner approval). Rollback: restore the previous file.
"""
import json, os, sys, urllib.error, urllib.request

ENDPOINT = os.environ.get("MONEYVERSE_BLOG_NOTIFY_URL", "http://127.0.0.1:4550/internal/blog/published-notify")

def main() -> int:
    token = os.environ.get("INTERNAL_API_TOKEN", "")
    if len(token) < 32:
        print("[BlogHook] INTERNAL_API_TOKEN not configured; skipping", file=sys.stderr)
        return 0  # never fail the publisher unit because the announcement could not be sent
    req = urllib.request.Request(ENDPOINT, data=b"{}", method="POST",
                                 headers={"Content-Type": "application/json", "x-internal-token": token})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read() or b"{}")
            print(f"[BlogHook] status={resp.status} result={body.get('status')}")
    except urllib.error.HTTPError as e:
        print(f"[BlogHook] notify refused: HTTP {e.code}", file=sys.stderr)
    except Exception as e:  # network/timeout: report, do not fail the publisher
        print(f"[BlogHook] notify unavailable: {type(e).__name__}", file=sys.stderr)
    return 0

if __name__ == "__main__":
    sys.exit(main())
