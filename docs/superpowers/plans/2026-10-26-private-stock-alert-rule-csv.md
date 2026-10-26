# Private active virtual-stock alert rule CSV — implementation plan

## Design and approval basis
User directs each A cycle to implement one P0/P1 end-to-end user feature while protecting immutable DB migrations and other workers. The existing alert manager already lists active rules; this addition provides a portable snapshot of **active configurations only**, distinct from trigger history Draft #1381. This bounded read-only design needs no new schema and does not claim to be a full deleted/paused alert history.

## Tasks (TDD)
1. Backend: failing repository test asserts `stock_alert_rules_list(actor)` and SQL LIMIT 101 with only server-supplied actor; failing controller test checks 100-limit overflow and refusal. Add repository `exportRules` and guarded `GET /stocks/alerts/rules-export` with `rows` and `limit`, 409 on >100. Preserve 64-bit numeric strings.
2. CSV: failing pure helper tests for correct escaping, UTF-8 BOM, 100 max, formula injection, control characters, malformed rows and large integer precision. Implement `stock-alert-rules-csv.ts`.
3. Web: failing route tests for 401/403/409/503, no-store/noindex, exact filename, no partial downloads. Implement private Next route `/stocks/alerts/rules.csv` using `api`, and visible keyboard-accessible link on existing member alert manager.
4. Android: document and test `GET /app-api/v1/stocks/alerts/rules-export` session-forwarded JSON, contract schema and backend parity. No public direct table grants.
5. Isolated real PostgreSQL 17.11: owner vs foreign actor, SQL role ACL and rollback without touching live 5433; then build/lint/typecheck/unit/integration/security/SEO/a11y/app-api/E2E, exact-SHA Test and GitOps release gate. Any missing gate => Draft PR, HOLD, no merge or deploy.

## Rollback
Revert new frontend/backend endpoints and documentation; existing migration 182 and member data unchanged. No data migration, finance ledger write, release or service restart.
