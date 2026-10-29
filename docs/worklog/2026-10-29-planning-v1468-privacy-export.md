# Planning v1468 — F675-173 verified owner-private personal-data export

**Date:** 2026-10-29 KST. **Status:** DOCUMENTATION DRAFT / RELEASE HOLD. **Scope:** documentation only; no runtime, database, WLD, Test, Production, feature switch or shared main mutation.

**Cycle:** Previous Feature Improvement v1466 → Current Feature Addition v1468 → Next Feature Improvement v1470 (provisional).
**Start main:** 9ebc5613845ba2e8179a0051e86db996593c8a19.
**Mid main:** 08e281271a102e87ee65fc5dc68996a8467048c2 (implementation_plan.md only); isolated work branch fast-forwarded before edits, canonical planning files unchanged.
**Latest completed QA:** v1369 FAILED/HOLD; 48/50 public HTTP (two expected 404), 36/36 mobile, targeted 48/48 and security 24/24, route-ledger evidence CLI FAIL, moderate audit finding, five migration checksum mismatches, 147 open Draft PR / 58 conflicts, 19 MINT journal backfills totaling 18,000 WLD without proven provenance, 552 treasury rows without direct linkage. Development ledger arithmetic drift 0 is not provenance clearance. Latest-main exact-SHA official Test is not certified.

**Investigation:** The account/privacy page only records privacy requests. NestJS privacy repository accepts access/correction/restriction/withdrawal/deletion and only received status; service explicitly excludes archive generation/delivery. Source inspection includes frontend/src/app/account/privacy/page.tsx, backend/src/privacy/privacy.controller.ts, privacy.repository.ts, privacy.service.ts, account security and Android app-api boundaries. No verified owner-private download artifact or export job found in inspected main. This is a source gap, not evidence of legal noncompliance.

**Decision:** F675-173 adds optional authenticated owner-only data-export request and verified short-lived encrypted archive, distinct from the existing manual data-subject access request. Exact screen/API/DB/worker/manifest, reauthentication, privacy class allowlist, no secrets/other-member PII, no-store/noindex, Android parity, 320px/WCAG 2.2 AA, admin metadata-only oversight, audit/KPI, rollback and real PG test requirements are specified in existing bilingual integrated master. No separate feature spec file created.

**P0:** REPO1468-01 historical ref preservation (#1663); FIN1468-02 MINT and treasury provenance (#1816); SEC1468-03 clean PG chat-report failure (#1874) and checksum integrity; REL1468-04 independent restore, official Test exact SHA and build-only merge prevention (#1088). **P1:** EXPORT1468-05..10 schema, worker, API/web/Android, UX, privacy/admin, real PG regression. Acceptance tests are planned but NOT EXECUTED. External independent deduplicated approved evidence new 0; cumulative UNKNOWN/10,000; BLOCKED/IN PROGRESS.

**GitHub:** development issue #1876; proposed Draft PR on branch docs/planning-v1468-privacy-export-20261029. All runtime implementation delegated to independent development branches and exact-SHA Test→authorized Production gates. No merge/deploy authorized.
