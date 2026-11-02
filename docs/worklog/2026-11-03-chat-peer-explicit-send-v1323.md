# Development C v1323 — Explicit consent before opening direct-message conversations

## START — 2026-11-03 06:49 KST
- Branch: `auto/hourly-c-v1323-chat-peer-consent-20261103-0645`; base `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`.
- Debian 13.6 miniPC verified; seven runtime services and development PostgreSQL connected.
- Read `AGENTS.md`, both README guides, English canonical and Korean supporting living plans, active PR list and recent A/B/QA. Root checkout contains another agent's uncommitted work; it is protected.
- Verified P1: authenticated `GET /chat?peer=<uuid>` calls `mutate(POST /api/v1/chat/conversations)` from server rendering, creating persistent conversations from navigation, link previews or refresh without explicit user submission. Existing backend POST contract already creates/reuses the owner-scoped room; no new SQL is needed.
- Overlap: B #2389 changes browser composer CSRF; do not change its mutation transport. Existing chat evidence tests guard failed reads, but one test explicitly expects the unsafe GET mutation. No active PR addresses the GET side effect.
- Plan: RED test for no GET mutation; show explicit preselected compose action on valid peer, retain existing-room navigation; GREEN; focused and full gates; isolated DB/HTTP where feasible. Do not touch financial tables or production.
- Release policy: all required gates must PASS; otherwise DRAFT/HOLD, no main merge or deploy.

## MID — 2026-11-03 06:53 KST
- RED: GET peer navigation invoked `mutate('/api/v1/chat/conversations')` once, confirmed by Vitest. Existing main test expected a redirect after this mutation.
- GREEN: GET now only selects an existing verified conversation. For a new valid peer, a keyboard-accessible explicit form invokes existing `openConversationAction` only on submit. Its server-only `mutate` fetches a CSRF token and calls the Nest authenticated POST; SQL `private_chat_open` is a SECURITY DEFINER function with active-user/owner checks. This avoids overlapping B #2389's browser composer rewrite.
- Added separate client form tests (no write on render, explicit POST and verified UUID receipt, error handling), page tests (invalid peer, existing room, failed list), and private HTTP policy for /chat and localized paths.
- TDD: 7/7 page tests; 2/2 explicit form tests; 9/9 security-header tests; total focused 18 PASS after using `NODE_ENV=test` (the host exports NODE_ENV=production, which breaks React act in jsdom).
- Need full gates, isolated DB, HTTP and CI; release remains blocked.


## FINISH — 2026-11-03 07:04 KST — PARTIAL / RELEASE BLOCKED
- Version sequence: v1323.0 start checkpoint `0179578af1`; v1323.1 implementation `d35c6feb6a`; v1323.2 final evidence/test commit (SHA from git after commit). Branch and PR #2584 remain independent and DRAFT.
- Implementation source: Next `/chat` GET no longer invokes a write. New member-initiated form calls existing server-side authenticated, CSRF-protected chat open POST; verified room ID drives navigation. Existing room and error behavior preserved. Responsive 44px+ control and screen-reader error, localized copy. Browser composer B #2389 untouched.
- TDD: unexpected GET write reproduced RED. Focused 19 PASS after fix; one extra invalid-receipt test added.
- Full implementation-SHA gates `d35c6feb6a00dad7804368930488928a720b2903`: lint PASS (0 errors, 1,027 warnings); typecheck PASS; build PASS; frontend 2,952 PASS; backend 2,985 PASS / 518 SKIP; contract 41 PASS; database package 72 PASS / 5 SKIP; app-api 184 endpoints PASS.
- Isolated PostgreSQL 17.11 (new disposable container): core init + 327 numbered migrations 002–328 PASS; explicit open/read/ACL and chat abuse report DB tests 6 PASS after fixing test isolation (concurrent unrelated test created another room). Container removed. No shared DB or financial write.
- Isolated HTTP with synthetic 401 authentication backend: `/chat`, `/ko/chat`, `/en/chat`, `/ja/chat`, `/zh/chat`, `/vi/chat` all 307 to login and all have private/no-store, noindex/nofollow, no-referrer. First unconfigured server produced 500 because INTERNAL_API_TOKEN was absent; corrected test fixture, not application code. Public Test/Production still report older SHAs; Production /ko returns 500.
- Global dependency audit FAIL: 9 vulnerabilities (8 moderate, 1 low). Full-route QA FAIL: `artifacts/qa/full-route-ledger.json` missing. Required remote CI incomplete; official authenticated browser/Android E2E, official Test exact SHA, independent restore and GitOps release proof BLOCKED.
- Final exact-SHA gates will be rerun after this final commit; evidence and CI outcomes will be posted on PR #2584 without a further code commit. No main merge, Test deployment, Production promotion or GitOps changes. Rollback not needed. No other agent branches/worktrees deleted.
- Local evidence: `/srv/moneyverse-data/tasks/mv-c-v1323-chat-peer-consent-20261103-0645/evidence/`; remote Draft PR #2584. The root checkout's other agent changes were not touched.

