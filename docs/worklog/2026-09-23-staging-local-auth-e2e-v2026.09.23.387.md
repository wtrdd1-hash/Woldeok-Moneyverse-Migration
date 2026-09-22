# v2026.09.23.387 — Isolated Test local-auth E2E unblock

## Scope
- Fix the `wdmv-test` local-email registration path used by Android end-to-end QA.
- Keep Production fail-closed when verification email delivery is unavailable.
- Allow a verification token response only behind an explicit Test-only switch and only when `APP_BASE_URL` resolves to `test.easy-scraping.com`.

## Defect
- The isolated Test backend intentionally runs with `NODE_ENV=production` for production-like behavior.
- SMTP is not configured in the isolated Test stack.
- Local registration therefore rethrew verification-mail delivery failure as HTTP 503, blocking real Android signup/verification QA.

## Implementation
- Added `localAuthTestVerificationTokenEnabled` to `AppConfig`.
- `LOCAL_AUTH_TEST_VERIFICATION_TOKEN_ENABLED=true` is honored only for hostname `test.easy-scraping.com`.
- Registration tolerates mail delivery failure and returns the one-time verification token only when that safe Test flag is active.
- The same flag is force-disabled for `easy-scraping.com`, so Production behavior remains unchanged.

## Verification
- Focused auth/config tests: 37/37 passed.
- Backend typecheck passed.
- Full backend unit/E2E suite without DB fixture: 943 passed, 361 DB-dependent tests skipped by the existing local test policy.
- Backend build passed.

## Release gate
- Branch: `fix/staging-local-auth-token-v2026.09.23.387`.
- Requires exact-SHA Test candidate deployment and Android emulator signup/verification/login proof before Production promotion.