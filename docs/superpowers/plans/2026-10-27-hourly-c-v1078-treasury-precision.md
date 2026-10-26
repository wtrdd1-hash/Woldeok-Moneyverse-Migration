# v1078 Implementation Plan
1. RED: add focused pure-helper tests for >2^53 WLD and malformed input; assert server action never accepts unsafe forms; prove initial failure.
2. GREEN: use BigInt for preset arithmetic, avoid implicit number conversion; validate numeric input and prevent duplicate UI submission while a request is pending.
3. Replace inaccurate TOTP/idempotency claims with actual admin-session/CSRF/role and ledger-review guidance; preserve server action/API/DB path.
4. Add a11y regression tests for live feedback, mobile 44px controls and pending/invalid disabled state. Verify lint, typecheck, tests, build, API/PG/CI; do not merge or deploy without complete release gates.

## Evidence / review
- RED reproduced 9 failures using original Number-based implementation; GREEN 10/10 helper and 5/5 component tests.
- Admin treasury controller uses AdminGuard; its DTO accepts integer-string amount; DB functions use numeric text, not JS Number. No client idempotency contract exists, so we explicitly disclose this and fence ambiguous retries.
- Full frontend 1,438 PASS, workspace typecheck PASS, lint 0 errors, backend build PASS. Further release checks required.
