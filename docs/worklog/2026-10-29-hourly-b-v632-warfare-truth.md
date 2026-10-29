# B v632 — Club warfare financial-evidence containment (Draft/HOLD)

- Date: 2026-10-29; base main `b84d645a87e8fa0d544ca3ee17e785e737e477ea`.
- Scope: previously closed, unmerged C v1031 PR #1250 recovered onto a new independent B worktree, with new NestJS HTTP no-store tests and headers.
- Root cause: authenticated warfare GET endpoints returned static invented guild ownership, a rolling season end, 4,200,000 WLD accumulated and 1,250,000 WLD unclaimed tax; web used static sample territories and local payout counter. No database evidence linked these to real club holdings or balanced ledger receipts.
- Contract: GET `/api/v1/clubs/warfare/strongholds` and `/status`, and POST `/declare`, `/:id/attack`, `/claim-tax` return HTTP 503 until authoritative receipts exist. All five set `Cache-Control: no-store`; session/consent guards remain. Authenticated web page reads only verified `/api/v1/clubs?limit=50` and distinguishes empty from error; no WLD payout success claim; `noindex,nofollow` metadata.
- RED: Backend direct 2 failures; frontend 5 failures; new HTTP no-store 2 failures. GREEN: backend focused 11/11; frontend focused 5/5. Additional gates and remote CI are recorded in PR/miniPC logs; do not infer Test or Production success from local unit tests.
- Real PostgreSQL 17.11 synthetic fixture: owner-specific club membership read and app-role direct UPDATE/DELETE denial 2/2 PASS. The isolated container was removed. No live DB or migration touched.
- No migrations, financial writes, shared DB changes, branch deletion, Test or Production promotion. Other workers' changes preserved. Full release remains HOLD pending all gates.

## Verified local gates (13:44 KST)
- `pnpm typecheck` PASS; `pnpm lint` PASS with 0 errors / 1,074 preexisting warnings.
- `pnpm test` PASS: contract 38, database 46 PASS/4 SKIP, backend 1,961 PASS/440 SKIP, frontend 1,915 PASS. API contract generation/check PASS.
- `pnpm build` PASS on the successful isolated retry (Next.js webpack; earlier concurrent invocation hit its own `.next/lock` and failed). The tool execution retried while an earlier command was running; do not count the lock failure as product regression.
- Actual NestJS HTTP regression 3 PASS, controller 3 PASS, endpoint contract 5 PASS, web UI/SEO 5 PASS. Real PostgreSQL 17.11 synthetic owner-scoped club read and write denial 2 PASS; disposable container removed.
- `pnpm audit --prod --audit-level moderate` FAIL: preexisting `qs@6.16.0` Moderate advisory GHSA-6pq8-jhm2-2vcw, tracked by separate QA PR #1687. No dependency modifications here.
- Full migration suite, authenticated official Test exact-SHA, Android end-to-end, independent backup restore and GitOps gate NOT VERIFIED; Production HOLD.
