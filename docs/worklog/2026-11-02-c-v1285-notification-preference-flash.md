# C v1285 — Member Notification Preference Confirmation Integrity

**BEFORE WORK (2026-11-02 05:45 KST)** — RELEASE HOLD. Based on `origin/main` `a8541927c3a351d980454c66e95a3356c47e0722`, independent `auto/hourly-c-notification-flash-proof-v1285-20261102-0545` worktree. MiniPC Debian 13.6 services and dev PostgreSQL healthy. Read AGENTS, README, README/README.ko, English canonical/Korean plan, active PRs and QA v1455. No overlapping active PR for notification preference confirmation; v1272 notification inbox is distinct. Current `?saved=1` can be supplied by any URL without a mutation; it claims settings were saved. Backend PUT receipt and subsequent owner readback are already authoritative; preserve them.

- [x] RED: tests for forged URL, mismatch, and verified one-time confirmation.
- [x] GREEN: server-only short-lived HTTP-only confirmation nonce bound to persisted preference and matched against query/readback; failure never writes success cookie.
- [ ] Validate keyboard, screen reader, 320px UI, private/noindex and backend/DB contract.
- [ ] HEAD exact-SHA checks; full CI; isolated Test / Production only if all release gates pass.

**IN PROGRESS (05:50 KST):** RED observed (missing helper and two action assertions); GREEN 29/29 focused tests, including actual SSR page, verified readback, forged URL rejection, and direct/localized privacy headers. QA v1455 baseline: frontend/backend/build/lint/app-api exit 0, full dependency audit, QA policy, and Production identity checks nonzero. Mid-work origin/main unchanged. Full exact-SHA gates pending.

**FINISHED:** pending evidence; no release authorization.
