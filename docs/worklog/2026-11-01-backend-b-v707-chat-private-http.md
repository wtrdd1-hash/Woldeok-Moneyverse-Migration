# Backend B v707 — Member chat private HTTP boundary

## Before work
- State: IN PROGRESS / DRAFT / RELEASE HOLD. Start from `origin/main` `f13bbce273ffc65e8576170992d82ea00c27a1c9`; independent worktree `auto/hourly-b-v707-chat-private-http-20261101-0435`.
- Reviewed AGENTS.md, README.md, English/Korean project plan, QA v1427, active A/C/B/QA/planning PRs and CI. No overlap with support #2251, gallery #2249, league #2250, bot CI #2248.
- P1 hypothesis: `GET /api/v1/chat/conversations`, messages, sync and mutation/guard error responses lack explicit private no-store/noindex/no-referrer at Nest HTTP boundary. Potential cache exposure, **not evidence of actual leakage**.
- Scope: response metadata only; preserve session/consent/CSRF, actor ownership, SQL function calls and exact bigint sequences. No DB/ledger/WLD changes.
- Plan: (1) RED HTTP regression for success, guard-denied, HEAD and unrelated public route (2) pre-guard middleware scoped to ChatController (3) focused + full verification (4) draft PR/HOLD and no deploy without all gates.

## In progress
- RED/GREEN and verification evidence pending.

## Finished
- Pending.

## In progress — 04:35 KST
- RED: 6/7 real Nest HTTP tests fail because private cache header is absent; 1 public-route control passes. Initial fixture PG_POOL injection error corrected before authoritative RED.
- GREEN: 7/7 real HTTP tests pass after ChatModule pre-guard middleware. GET list/unread/messages/sync, 401 denied, POST, HEAD, unrelated public endpoint tested.
- No SQL, actor/consent, ledger, DB migration, or response body changes.
