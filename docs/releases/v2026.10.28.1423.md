# v2026.10.28.1423 — Production Treasury Payout DB-Only Containment

## Scope and authority
Owner authorizes zero-downtime Production promotion while allowing existing application database table grants. This is a **DB-only protection deployment**, not a whole-app release. The unresolved 18,000 WLD wallet-vs-ledger mismatch and empty canonical Treasury funding balance are substantive accounting risks, not permission objections.

## Evidence
- Latest main `d12c948a` includes independent blog admin v1418; finance PR #1706 candidate rebased to `be84fe72` without overwriting blog services or official Test.
- Latest encrypted DB/photo backup `moneyverse-debian13-20261028T081756Z.tar.zst.enc` generated 2026-10-28 17:18 KST; SHA256 file verification PASS. No independent restore proof.
- Actual Production schema-only clone in isolated PostgreSQL 17.11 accepted forward migration 291. Prior synthetic PG acceptance applied all 290 migrations and passed balanced dividend cash, receipt, vault, replay, reserve, invalid-auth and unfunded transactions within ROLLBACK. Source focused tests 31 PASS.
- Applied **only** `291-ledger-first-citizen-dividend.sql` to the authoritative Production database as migrator with bounded lock/statement timeouts. `schema_migrations` stores SHA256 `de7d40b747c2187b42a00ca523ecec1edeb849a61d54e834ebef65c3c29aa513`.
- Function now requires stable UUID and uses atomic canonical postings; legacy three-argument direct-wallet payout fails closed. Actual `moneyverse_app` role rejection probe returned expected SQLSTATEs 55000 and 42501 under ROLLBACK. Canonical transaction count 890→890, aggregate account balances 18,000→18,000 WLD. Backend remains HTTP200 with no process restart or Nginx cutover.

## Outstanding full-app deployment blockers
Official Test is a concurrent blog SHA cfb13272, not our candidate; Production DB is missing migration 269–287 while blog 288–290 are present; real canonical Treasury cash is 0, 18 wallets have an unexplained 18k ledger difference, historical dividend records total 63k WLD, and storage use on the data disk is 97%. No financing or historical fake correction, no unrelated DML grant revocation and no full backend/frontend Production cutover was performed. **Only new unsafe payout prevention is live.**

Host audit logs: `/srv/moneyverse-data/qa-reports/treasury-prod-v1423/`.
