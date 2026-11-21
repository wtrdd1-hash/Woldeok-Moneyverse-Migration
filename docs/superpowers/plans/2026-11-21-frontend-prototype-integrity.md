# Prototype frontend integrity repair plan

> **For agentic workers:** Use superpowers:executing-plans inline, task by task.

**Goal:** Restore the approved Nov18 cards and ensure unverified prototype metrics cannot appear as real values.
**Architecture:** Repair the existing five static HTML pages and their five directory aliases. Execute their actual inline hydration scripts against controlled HTTP responses; preserve the existing read APIs and authenticated session authority. No dependencies or economic mutations.
**Tech Stack:** HTML/CSS, browser JavaScript, Node built-in test/vm, existing CSS parser if available.
**Spec:** docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md; docs/qa/2026-11-21-full-frontend-design-functionality-audit.ko.md FE-AUDIT-02/03/04.

## Global Constraints
Existing navy/violet cards, existing user copy, canonical integer money strings, no sample metrics on failed reads, no fake trends, no broader API exposure, exact-source isolated Test before Production.

## Review Focus
- Huge amounts and malformed numeric values must remain exact or unavailable.
- Offline/401/missing data must not retain a previous verified value.
- The first HTML paint must never expose a sample balance or synthetic curve.
- A missing market opening price must not imply a verified zero return.
- Alias pages must satisfy the same integrity contract.

### Task 1: Repair the existing prototype pages
**Files:** scripts/native-prototype-integrity.test.mjs; spring-backend/src/main/resources/static/{shop,stocks,quests,board,status}.html and {shop,stocks,quests,board,status}/index.html.
**Consumes:** existing /api/v1/auth/session, /api/v1/wallet/summary, /api/v1/stocks.
**Produces:** identical page structure with valid CSS, integer-string amount formatting, unavailable first paint and validated read states.
- [ ] Add tests executing the actual inline script: 9007199254740993 =>9,007,199,254,740,993 WLD;0=>0 WLD; unsafe numeric/malformed/failed/unauthenticated=>unavailable; successful read followed by failed refresh=>unavailable.
- [ ] Test server HTML has unavailable KPI values and no fabricated chart points; parse real CSS to catch the missing closing brace. Run and read RED.
- [ ] Close the missing rule, render unavailable values until source success, group digits directly, validate all market prices/opening values and use exact rational rounding for aggregate return. Reuse existing layout.
- [ ] Run focused tests and all existing native tests, Spring test/bootJar, control-byte/diff checks.
- [ ] Review source, record results, commit/push, exact-head CI and main integration.

### Task 2: Source-bound Test and scoped release
**Files:** docs/worklog/2026-11-21-frontend-prototype-integrity.ko.md and scoped release evidence. Deployment files only after actual route/source inventory.
**Consumes:** reviewed exact-main source and CI artifact.
**Produces:** isolated read-only Test receipt; Production only if independent scoped frontend release gates pass.
- [ ] Inspect active routes and identify all actual consumers. Select immutable release mechanism consistent with RELEASING.md; record any ruling.
- [ ] Verify actual PC/mobile rendered cards and missing/error states at isolated Test, plus existing session/API boundaries.
- [ ] Apply only reviewed pages after Test acceptance with a checked rollback; verify public rendering and source bytes. Otherwise record a concrete blocker and preserve the prepared change.
- [ ] Update the audit/worklog with closed and still-open defects.

Self-review: all five review focus inputs are pinned to Task1. Task2 cannot infer runtime acceptance from unit tests. No claim of complete functional shop/stocks/quests/board/status support.
