# Backend B v758 — Discord loopback broadcast authentication and truthful receipt

Status: implemented in an isolated branch, Draft/HOLD; no runtime activation.

## Source evidence and design

QA #2451 reproduces that the loopback-only bot HTTP listener accepts unauthenticated POSTs and returns success when Discord's channel is absent or send fails. The bot's generic `sendLog` swallows exceptions; the listener trusts its return value. Frontend C Draft #2449 separately hardens the Next ingress and requires the existing `{ok:true,status:'Broadcast sent to Discord'}` success receipt. No other open PR modifies the bot's loopback handler.

Chosen approach: retain loopback binding, extract a testable HTTP handler, require a strong configured `INTERNAL_API_SECRET` with constant-time hash comparison, bound payload size and Discord embed fields, and report 200 only after `channel.send` resolves. Keep the exact existing success status for compatibility with #2449. Optional admin DM failure is a separate boolean and cannot turn an already accepted channel send into a retry. Do not persist credentials, send real Discord messages in tests, or claim recipient delivery.

Alternatives rejected: trusting loopback, hardcoding a fallback credential, swallowing send failure, or returning optimistic 200; all undermine the ingress boundary.

## Execution and verification

1. Reproduce the missing handler via RED Node HTTP tests.
2. Implement `bot/broadcast-webhook.js` and wire `bot/index.js` with a fail-closed missing-secret startup.
3. Add malformed/oversized/cross-origin-independent authentication, channel failure, optional DM, Unicode, and success receipt regression tests to `npm --prefix bot test`.
4. Run bot tests, lint, typecheck, build, frontend/backend unit suites, contract, database package tests, and security checks; record all non-PASS gates.
5. Preserve Draft PR #2449 and QA #2451; do not deploy or merge without exact-SHA Test, real PostgreSQL, CI, authenticated E2E and GitOps approvals.

Rollback: leave the bot webhook disabled by withholding the configured secret, or revert the branch. No database migration, financial write, or production service restart.
