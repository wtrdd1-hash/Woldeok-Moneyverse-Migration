# Backend B v603 — Public stock market query validation

## Before work
- Main: b1cd54fda1123fb07ca81b6e5b3ead70f59f556c. Branch: auto/hourly-b-stock-price-query-v603-20261028-0835.
- QA v1336 and existing draft PRs inspected; independent stock market read-only API contract.
- P1 finding: GET /stocks/sparklines, /stocks/:id/prices, /stocks/:id/candles use Number() on raw query strings; empty, exponent, hex and duplicate query values can be coerced or silently clamped.
- Do not modify ledger, DB migrations, or deployed environments.

## In progress
- [x] RED regression tests (41 failed, 14 passed)
- [x] Strict canonical decimal query validation
- [ ] GREEN regression tests and full gates
- [ ] Exact candidate SHA / CI and release HOLD evidence

## Finished
Pending.

### Implementation checkpoint
- TDD RED: 41 failures / 14 valid cases; root cause is Number() coercion and implicit repository clamp.
- GREEN: 55 direct-controller cases + 2 HTTP cases passed.
- Controller rejects noncanonical or duplicate query values before SQL read; defaults, return shapes and WLD integer-string serialization unchanged.
- Generated API contract artifacts synchronized (only candle enum ordering; no new route). Contract drift checker requires committed generator output, so rerun after commit.
- First full gates: typecheck/build PASS, lint FAIL (two inherited blog-data escapes plus one new test variable, now corrected), root test FAIL on generated contract drift; audit 3 low/9 moderate. Retesting.
- Original stock controller uses CRLF; git diff whitespace checked with cr-at-eol.

## Finished — development candidate (release HOLD)
- [x] RED: 41 failing assertions reproduced Number() query coercion.
- [x] GREEN: 55 controller cases and 2 Nest HTTP tests; malformed/duplicate requests make no service call.
- [x] Latest main fetched and rebased twice (b1cd54f -> 7a823ac -> e270873); English and Korean project plans reread.
- [x] API contract generator artifacts committed, contract checker PASS.
- [x] Isolated PostgreSQL 17.11 role/function synthetic test PASS: application role has no raw stock table SELECT; function EXECUTE, bounded read and bigint text precision PASS. Container removed.
- [x] Full lint PASS (0 errors, 1096 warnings); root test PASS after offline dependency installation, including backend and frontend suites.
- [x] Bot tests 11 PASS and bot audit 0 vulnerabilities after isolated offline install.
- [x] Repository security, control-byte and Prisma checks PASS.
- [x] Typecheck/build PASS after upstream main f396d009 fixed the unrelated SSRF undici callback TS2322.
- [ ] Full root dependency audit PASS: 3 low, 9 moderate.
- [ ] Official Test exact-SHA authenticated E2E/real production schema/rollback PASS: not executed; public Test reports 6f697e74b7bf0cd1e4521d36534cfd9c140f8010.
- [ ] Production: forbidden. Public Production reports 6a989b5ac0c6155587d43426d64f6def6b62c917.
- No migrations, financial mutations, live DB changes, other branches/worktrees edits, or deployment.
- PR to remain Draft + hold until every required gate is independently verified.
- Final integration synchronization: main f396d009 includes an upstream SSRF callback typing fix. Rebased again; typecheck/build PASS on the rebased source. Previous CI failed on pre-fix base, so new exact SHA must be checked separately.
