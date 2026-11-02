# C v1313 — Verified Guest Takedown Status

## BEFORE WORK — 2026-11-03 00:4x KST
- Baseline: `9cade11af53db9f27c2b9f0ea9d39005ea8d0387` (fetched origin/main).
- Independent branch/worktree; main and all A/B/QA/Gemini worktrees untouched.
- Source proof: `/safety/takedown` collects a case passcode and promises a guest status lookup, but has no lookup UI. Nest `POST /api/v1/safety/takedown/status` and PostgreSQL `safety_get_takedown_status` already implement passcode-gated retrieval. No active PR targets this guest lookup.
- Scope: expose a real passcode-protected status lookup, reject malformed backend responses, do not persist or log secrets, distinguish 404 from source failures, private HTTP headers, mobile keyboard/screen reader UI and regression tests. No finance/DB schema writes.
- Plan: [ ] RED tests [ ] parser/action/UI [ ] focused tests [ ] full gates [ ] PR/CI [ ] final HOLD record.
- Release remains HOLD pending full independent gates.

## IN PROGRESS
Pending.

## FINISHED
Pending.
