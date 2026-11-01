# Planning v1638 — F675-215 Microsecond Cursor and Inventory-State Truth

**2026-11-02 07:10 KST | FEATURE IMPROVEMENT | DRAFT / RELEASE HOLD**

Previous Addition v1636 → Current Improvement v1638 → Next Addition v1640 (provisional). Parent Draft #2433; developer handoff #2432. Scope: English canonical + Korean equivalent planning only; no runtime/DB/deployment.

## Evidence
- miniPC Debian 13 services active, DEV PostgreSQL connected; origin/main a8541927c3a351d980454c66e95a3356c47e0722 fetched start/mid.
- Read AGENTS.md, README.md, migrations 071/104/123, shop repository/controller, Next inventory and Android gateway. PostgreSQL `timestamptz` uses microseconds; the installed `pg` parser for OID 1184 returned JS Date `.123` for `.123456` — 456 microseconds lost.
- Design: exact UTC six-digit string from SQL, exact DB keyset predicate, HMAC owner+session cursor, no cross-request MVCC guarantee, page-scoped totals, active/expired verified-empty distinction, Android private responses.
- Public Test and Production `/api/version` 07:10 KST both 510dbe6..., different from main and not runtime attestation. QA #2391 and DEV ACL #993 still open. New approved independent references 0; cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS.

## Handoff and release
P0 4 / P1 6 detailed in PROJECT_PLAN.md and PROJECT_PLAN.ko.md; code requires B/DB, B/API, A/Web, C/Android, QA separate branches and exact-SHA Test. No live acceptance or independent restore. Keep OFF and RELEASE HOLD. Verification results and GitHub PR/issue references recorded after checks.

- Cursor errors: invalid/tampered/expired -> HTTP 400; provably stale -> 409; unverified source -> 503; never pretend an empty verified result.

**Fresh tests:** 171/171 policy/security/backup PASS; 24/24 release classifier PASS; 22/23 QA PASS with one pre-existing warfare-copy failure #2391; pg microsecond probe PASS; EN/KO 4 pairs ×9 markers PASS; git diff --check PASS. Feature E2E NOT RUN.
