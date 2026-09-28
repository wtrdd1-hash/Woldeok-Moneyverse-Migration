# Update v2026.09.28.477 — Full-surface QA

This update records a QA-only audit of the current v476 web release and current Android main. No product code or runtime was changed.

## Result
- Current web inventory: 108 pages / 24 admin / 12 dynamic.
- Five Test browser passes: 540 route/view rows at 320/390/768/1024/1440; no horizontal overflow reproduced.
- 29 initial navigation aborts were harness collisions; isolated rerun passed 29/29.
- Typecheck/build pass.
- Release gate remains blocked by lint failures, mobile API contract drift, one frontend corpus test failure plus six unhandled test errors, skipped DB-dependent coverage, missing authenticated QA fixtures/full responsive matrix, and blocked Android device/signing acceptance.
- Production promotion: **not performed**.

See `docs/QA_AUDIT_REPORT_V477.md`.
