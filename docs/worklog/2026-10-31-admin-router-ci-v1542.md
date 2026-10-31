# v2026.10.31.1542 — Resolve full frontend CI router fixture failures

STATUS: START / isolated integration branch only. No actual Test/Production traffic or DB/WLD change.

## START AND SOURCE AUTHORITY
User approved exact-SHA Test and zero-downtime Production promotion. Source plan, integrated master, documentation standard and RELEASING reread. Remote origin/main remains 761a55a...; a concurrent developer's local committed main advanced to 45998b344... including independent frontend router fixture corrections. Never modify their worktree or merge unreviewed local in-memory build-ID commit.

b089... corrected the single backend CI failure and now passes backend all 2,779 with 501 DB-test skips, but GitHub full CI backend PASS and frontend FAIL 7 tests: four suites of admin blog, enterprise SOE, monetary bureau and bank screens report Next app router invariant because tests mount client components without router mocks. Concurrent local main commit 45998b344 modifies only three affected test files, admin bank page test, monetary bureau source truth, and implementation plan. This is existing developer work, so prefer cherry-pick on isolated branch to avoid duplicate coding. Prior local commit 51b22 tracked frontend/.build_id timestamp and route fallback; its numeric-ID provenance remains unsuitable, so do NOT silently import it.

## MID / FINISH
PENDING.

## MID — reviewed concurrent developer commit
- Safely cherry-picked only local committed 45998b344 into isolated branch without changing the author's main worktree. Included admin bank/blog/SOE router fixture mocks, monetary bureau actual-data truth correction and implementation_plan documentation. The PR/source merges had NO conflicts.
- Explicitly did NOT import local main 51b22 numeric frontend/.build_id and fallback reorder, nor duplicate 881da CI fix; candidate retains exact-SHA integrity boundary and current durable finance test.
- Reproduced GitHub CI frontend failures: 4 files / 7 failed tests. With the existing local fix applied, focused 4 files/12 tests PASS. Full frontend suite follows.
- Additional Test restoration: permission-restricted custom PostgreSQL Test-only backup taken and SHA-256 verified in /srv/moneyverse-data/backups/v1541-test-drill, successfully restored into NEW DB woldeok_moneyverse_ci_v1541_restore (214 migration records, 70MB). Original Test DB still has 214 records; Production untouched. Read-only source comparison: 311 SQL source migrations, 98 unapplied in restored old Test DB, one applied checksum mismatch (221-stock-halt-cost-basis-settlement.sql), one unknown recorded migration (203-google-admin-subject-hash-bootstrap.sql). This definitively BLOCKS using the old Test DB as exact-source acceptance without isolated migration reconciliation. No migration blindly applied, no invented checksum waiver.

## Fresh isolated Test candidate DB — pre-operation record
Restored old Test DB has 98 missing migrations, one source checksum conflict and one unknown migration; it cannot serve as authoritative exact-source Test. Next safe experiment is a NEW disposable PostgreSQL 17.11 Test-only instance, with fresh random credentials in root-owned 0600 env files and data mounted only on secondary disk /srv/moneyverse-data/test-runtime/v1542, applying immutable 311 source migrations from blank schema. Bind PostgreSQL to loopback 127.0.0.1:5591, no connection to existing Production/Test DB, no copied user sessions and no public Nginx traffic. The new database may be used only to validate candidate backend startup and negative financial truth until authenticated Test and rollback are independently proven.

## Fresh migration first attempt and correction
The first fresh migration attempt stopped before any SQL because host psql client is absent (spawnSync ENOENT). New isolated DB still has 0 public tables. The PostgreSQL 17.11 container itself has psql. To guarantee isolation and avoid installing host packages, all migration SQL sources are copied to the same paths INSIDE ONLY the new Test container and a private psql wrapper routes each command exclusively through docker exec -i mv-test-v1542-pg. No SQL command can address existing Test or Production from this wrapper.

## FINISH source tests and independent DB
- After cherry-pick: all frontend 526 files / 2772 tests PASS, 0 failures. Monorepo typecheck PASS; touched frontend ESLint exit 0 with 4 nonfatal warnings; release suite 122/122 PASS. Backend from b089 2779 PASS, 501 skipped; DB skips are not acceptance.
- FRESH independent PostgreSQL17.11 instance mv-test-v1542-pg on 127.0.0.1:5591, secondary disk only, installed ALL 311 immutable SQL migration files into a blank separate DB, 311/311 recorded PASS. Initial host psql ENOENT before SQL, corrected by private wrapper forwarding commands only to mv-test-v1542-pg with copied SQL sources, no old Test/Production changes. No credentials logged.
- During work remote origin/main moved 761a55a... to 30cbbe02f... (PR #2146 build-ID notice fixes), with overlapping paths. Preserve this commit and recheck/merge latest remote main on isolated branch, resolve source truth, re-run exact-SHA CI/build/Test; do not promote previous SHA.
