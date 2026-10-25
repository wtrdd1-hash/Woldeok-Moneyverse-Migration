# Backend B v546 — IPv6 mapped-address SSRF boundary (P1 / HOLD)

## Before work (2026-10-26 04:35 KST)
- Source: origin/main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; isolated branch `auto/hourly-b-ssrf-ipv6-v546-20261026-0435` and separate worktree.
- Reviewed AGENTS.md, README.md, English/Korean living plans, current open PRs, QA #1317, issues, and CI. No active SSRF-specific PR found. Existing security `ssrf-defense.ts` checks dotted mapped IPv4 but not the equivalent IPv6 hextet encoding. No production data touched.
- Safety: do not modify shared branches/worktrees, applied migrations, DB roles, financial ledger, Test or Production. Root disk 99%, 1.3GiB free; use data volume.
- Scope: reject mapped private IPv4 regardless of IPv6 text representation; preserve public mapped IPv4 behavior. Write RED tests, minimal fix, run verification; no release before full gates.
- Planned: [ ] RED mapped IPv4 tests; [ ] fix; [ ] unit/build/typecheck/lint; [ ] CI and Test evidence; [ ] final HOLD record.

## In progress (2026-10-26 04:33 KST)
- Reproduced security bypass before implementation: `isPrivateIp('::ffff:7f00:1')` returned false; mocked DNS `::ffff:7f00:1` was accepted by `assertSafeOutboundUrl`. TDD RED: 2 failures / 9 tests.
- Root cause: `isPrivateIPv6` handled only `::ffff:` dotted-decimal strings. Equivalent hexadecimal/expanded mapped IPv4 escaped the private-range classifier.
- Added `node:net` CIDR-based mapped-prefix recognition and decoded final two hextets to IPv4 bytes before applying the existing IPv4 private/reserved policy. Public mapped IPv4 remains allowed.
- GREEN: `ssrf-defense.test.ts` and `ssrf-redirect-credentials.test.ts` 14/14 PASS. No API path, response shape, DB schema, migration, ledger or WLD changes.
- Mid-run `origin/main` checked and English/Korean living plans reread; no main advancement.
- Remaining: full gates, PR/CI, official exact-SHA Test.

## Finished
- Pending validation; release HOLD.
