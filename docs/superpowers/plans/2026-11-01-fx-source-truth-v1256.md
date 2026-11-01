# FX source evidence and member safety — v1256

## Source-verified gap and decision
The current public FX portal endpoint is deliberately HTTP 503 (fx_source_unverified) and financial FX service writers reject unledgered settlement. The client nevertheless defaults to a fabricated 1352.5 WLD/USD rate, renders transaction controls before source verification, and advertises real-time settlement. A verified-looking page is not evidence of a valid rate or a ledger receipt.

Chosen minimal repair: fail-closed client state for loading/unavailable, require explicit future source evidence before rendering quotes or trading controls, clear stale values after any failed refresh, preserve keyboard-accessible Retry, and correct SEO to noindex and non-promissory text. Do not create ledger operations or loosen server guards. Do not modify A/B/QA branches.

## TDD and verification
1. Add frontend regression tests for initial loading, HTTP 503, success-shaped payload without source evidence, and retry; demonstrate RED.
2. Implement a guarded FX source state with runtime shape checks; verify GREEN. Keep existing FX UI unreachable without source evidence.
3. Confirm backend FX public 503 and writer rejection contract tests; validate app-api forwarding as applicable.
4. Re-fetch origin/main mid-run; run exact-HEAD focused tests, lint, typecheck, build, unit, integration, PG, security, app-api and E2E where feasible. Record PASS/FAIL/BLOCKED honestly.
5. Keep PR Draft if any required release gate is missing. Never deploy or merge on partial evidence.
