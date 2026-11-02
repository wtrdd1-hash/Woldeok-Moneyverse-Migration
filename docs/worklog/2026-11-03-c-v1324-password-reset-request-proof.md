# C v1324 — Password-reset request provenance (canonical)
## BEFORE WORK — 2026-11-03 07:15 KST
- Baseline: f5c3fbedae1c3b3ec2374882b049aac43a655eb4 (origin/main).
- MiniPC Debian 13.6; seven core services active, development DB connected.
- Read AGENTS.md, README.md, README/README.ko.md, both PROJECT_PLAN documents; reviewed open PRs/branches, A/B, planning, QA and CI. No open PR targets password-reset request feedback.
- Verified defect: /forgot-password?sent=1 displays a success-like claim without a request; action catches any Nest failure and redirects to the same claim. Nest returns {accepted:true} for both known and unknown emails and intentionally suppresses mail delivery failures for enumeration resistance.
- Scope: a verified *request acceptance*, not a mail-delivery receipt. Preserve indistinguishability of account existence and avoid disclosing user email. No database grants/migrations.
- Plan: RED tests for spoofing, error, malformed receipt and accepted receipt; implement a server action + client useActionState; keyboard/AT response; noindex/private HTTP; run exact-SHA gates; never promote on incomplete gates.
- Stage: BEFORE; TDD tests pending.

## IN PROGRESS — 2026-11-03 07:18 KST
- RED: 13/13 focused cases failed against original action/query-based success flow.
- Implemented server action receipt validation; API exceptions and malformed receipts are UNAVAILABLE, never success.
- Client form uses useActionState, 44px targets, pending guard, accessible live status, and no address/secret echoes.
- Backend {accepted:true} contract intentionally remains non-enumerating; do not confuse acceptance with email delivery.
- Added explicit six-locale noindex/private/no-referrer HTTP policy.
- Next: focused tests and main recheck; no merge until release gates.

## FINISHED IMPLEMENTATION / RELEASE HOLD — 2026-11-03 07:27 KST
- Midpoint main fetch: unchanged at f5c3fbedae1c3b3ec2374882b049aac43a655eb4; both integrated plan hashes unchanged. Draft PR #2586 created; code remains isolated and clean.
- Focused GREEN: 14 frontend tests and 4 backend controller tests. Existing backend contract intentionally returns identical {accepted:true} when address unknown or SMTP fails; UI states *request accepted*, never mail delivered.
- First full code SHA 71356d8d7dd47aa269120c0cb00f535aa7b82595: lint PASS (0 errors, 1027 warnings), typecheck PASS, build PASS, app-api 184 endpoint contract PASS; frontend 2961 PASS; backend 2984 PASS / 2 FAIL / 518 SKIP (existing profile-private HTTP expected 200 vs actual 401); database package 72 PASS / 5 SKIP; contract 41 PASS. Real isolated PostgreSQL 17.11: 327 migrations PASS and 21 auth/session tests PASS, container removed.
- HTTP GET: six locale recovery routes returned 200 and noindex/nofollow, private/no-store, no-referrer; forged ?sent=1 did not render the old success text. First standalone build used a generated build ID; exact-SHA rebuild and version proof are mandatory in the final pass.
- Security audit FAIL: 8 moderate + 1 low; production high-or-above audit PASS. Full-route ledger FAIL: artifacts/qa/full-route-ledger.json absent. Root test suite FAIL due to two existing profile HTTP tests. Official authenticated browser/Android E2E and exact-SHA official Test backend/API/DB/auth/user flow NOT DONE; no PASS claim.
- GitHub required CI: policy/classify/release-input passed; runtime jobs pending at this checkpoint. This PR is DRAFT/HOLD; no main merge, no Test or Production deployment, no GitOps mutation, no rollback necessary.
- Official Test public version 2dd507030dc1e461cbcf18f060260959f4c26a8f and Production 305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b; neither is candidate.
- No unrelated A/B/Gemini/QA worktree/PR or scheduled automation modified. Preserve every unmerged branch. No branch deletion authorized.
- Next: commit this final worklog, run exact-HEAD gates and standalone build-ID check, post evidence to PR. Release remains BLOCKED unless all gates pass.
