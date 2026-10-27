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
