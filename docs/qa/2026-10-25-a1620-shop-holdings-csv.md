# QA — A1620 verified shop holdings CSV (P1, RELEASE HOLD)

## Scope and truth
Owner-only current shop holdings export. The source is the existing PostgreSQL SECURITY DEFINER shop_my_items_v2(actor), reached via NestJS with session/consent and via Next server-only API. Browser downloads CSV; Android receives authenticated JSON. The CSV is NOT a purchase history, ledger transaction, or WLD balance statement.

## Security / integrity
- No actor parameter, no direct app-role table read, no new migration, no ledger writes.
- Whitelist export columns, reject invalid UUID, negative/fractional quantities, malformed dates and >5000 rows.
- Spreadsheet formula injection escaped, double quotes escaped, CRLF CSV, UTF-8 BOM.
- Private no-store, noindex, nosniff, attachment disposition; upstream failure/invalid payload => 503, never empty successful CSV.
- Session/consent guards and Android same-origin gateway; Android route declared in 180-endpoint mobile API contract.
- Rollback: revert this feature branch/PR, no database rollback necessary.

## Evidence
- Focused backend: 15 PASS; focused frontend: 21 PASS; Android gateway: 11 PASS.
- Typecheck: PASS. Lint: 0 errors, 1128 warnings.
- Full backend: 1316 PASS / 398 SKIPPED. Frontend: 1404 PASS / 6 FAIL (SEO x3, login touch target, registration CTA, admin M2 telemetry).
- Isolated PostgreSQL wdmv_v761_test_acl: owner fixture 1, foreign 0, app function EXECUTE true, direct user_items SELECT/INSERT false; ROLLBACK; final persisted holdings count 0.
- Build and security audit: see final PR evidence and release report (required gate; no assumed PASS).
- Official Test exact SHA, authenticated user browser-to-API-to-DB E2E and GitOps release: BLOCKED. No Test/Production changes.

## Branch and deployment
Start: 162 remote branches, 158 open PRs; unique non-main changes preserved. Conflicts #1107, #1110, #1143. No unrelated branch deletion. One temporary empty/main-identical local branch removed.
Production release HOLD; no main merge, no production write, no migration, no service restart, no release.
