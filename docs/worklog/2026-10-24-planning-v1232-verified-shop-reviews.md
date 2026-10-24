# Planning v1232 — Verified Store 2.0 Purchase Reviews (2026-10-24)

**Status:** PARTIAL / DRAFT / RELEASE HOLD. **Cycle:** Previous Feature Improvement v1230 → Current Feature Addition v1232 → Next Feature Improvement v1234 provisional. Main source `49788d09494fed3e463651945b83386e87dd47bc`, latest QA v1237 FAILED/HOLD.

## Source inspection
- Debian 13.6 miniPC active backend/frontend/bot/MCP/Nginx/Docker and connected Production-linked DEV PostgreSQL (read-only status only); local Superpowers skills read because `skills__list` returned no installed skill URIs.
- GitHub main `AGENTS.md`, `README.md`, canonical EN `docs/planning/PROJECT_PLAN.md`, KO comparison, open PRs and QA v1237 inspected. Start/mid SHA and canonical plan hashes recorded in external task logs.
- Store 2.0 shop catalog and `shop_purchases` confirmed in migration071; economic command wrapper migration218; Nest `shop.controller.ts` has no review route. Legacy shop purchases are a separate authority. Existing `/shop` has no verified review flow; existing admin shop handles catalog changes, not review moderation. No runtime product tests performed (documentation only).
- Reviewed 4 independent technical publisher families (PostgreSQL/OWASP/W3C/Google), newly approved 0, cumulative approved UNKNOWN/10,000 → BLOCKED / IN PROGRESS. These are guidance references, not counted toward the 10,000 evidence target.

## Product / backlog
- Proposed F675-115 verified-purchase, one-review-per-owner/catalog, prepublication moderation, immutable request receipts, owner/admin actor controls, SEO conservative no review JSON-LD, Android parity, accessibility, privacy, abuse prevention, analytics, flag-OFF rollout.
- P0/P1: ENV1232-01 SEC1232-02 REL1232-03 SHOP1232-04 SHOP1232-05 SHOP1232-06 SHOP1232-07 SHOP1232-08 SHOP1232-09 SHOP1232-10.
- P0 blockers: DB shared/5433, app DML 235/241, PUBLIC bank EXECUTE 3, migration266 drift, four competing migration280 #1147, skipped CI gate #1088, frontend 5 FAIL, audits Critical2/High10, no authenticated official Test exact-SHA financial E2E/isolated restore, disk 92% used.
- No runtime, DB, WLD, Test, Production, feature-switch, merge or deployment changes. Other A/B/C/Gemini/QA branches untouched.

## GitHub handoff
- Branch: `auto/planning-v1232-verified-shop-reviews-20261024-2005` (from main; not stacked on unmerged v1230).
- Draft PR: **PENDING**.
- Development issue: **#1166** — https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1166.
- Independent engineering: isolate real PostgreSQL → TDD + ACL/owner negative tests → full exact-SHA CI/security → official Test authenticated finance E2E → backup restore → independent review → authorized GitOps; never promote while any gate is FAIL/BLOCKED.

## Verification
- Pending final `git diff --check`, six-doc backlog-ID parity, branch comparison and GitHub confirmation. Planning-only verification cannot certify product tests.
