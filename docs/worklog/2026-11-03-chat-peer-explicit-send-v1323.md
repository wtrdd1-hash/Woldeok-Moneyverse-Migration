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


## FINISH
Pending.
