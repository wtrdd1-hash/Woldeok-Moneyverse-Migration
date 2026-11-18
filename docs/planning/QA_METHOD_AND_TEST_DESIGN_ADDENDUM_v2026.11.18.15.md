# Moneyverse — QA Process, Test Design & Evidence Addendum

> Version: v2026.11.18.15 | State: PLANNING / DOC-ONLY / RELEASE HOLD
> English canonical; Korean: [QA_METHOD_AND_TEST_DESIGN_ADDENDUM_v2026.11.18.15.ko.md](QA_METHOD_AND_TEST_DESIGN_ADDENDUM_v2026.11.18.15.ko.md)
> Authority: supplements, never replaces, PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, FULL_ROUTE_UI_QA_SPEC, Spring G0–G6 and ledger/security release gates.

## 1. Source provenance and boundaries

The owner supplied three public QAonTOP Instagram reels and the account profile on 2026-11-18:
- [Testing types (12) — Df1gBVOR55n](https://www.instagram.com/reel/Df1gBVOR55n/): public caption confirms the *topic*, but does not list the 12 types. **Do not attribute our classification below to the creator or claim that all 12 video slides were verified.**
- [12-step test process — Df25MnXybqW](https://www.instagram.com/reel/Df25MnXybqW/): the caption explicitly lists requirements analysis → plan → scenarios → test cases → environment → data → execution → defect registration → retest → regression → report → closure decision.
- [12 test concepts — Df05BgtRMpe](https://www.instagram.com/reel/Df05BgtRMpe/): the caption explicitly lists defect types, boundary analysis, equivalence partitions, decision tables, state transitions, test pyramid, regression, V-model, coverage, pairwise, defect life cycle and risk-based testing.
- [QAonTOP public account](https://www.instagram.com/qaonetop/). Accessible Instagram embed captions are the verified source level; complete speech, video frames and account-wide posts were NOT independently inspected.
- Independent technique reference: [ISTQB CTFL v4.0.1 syllabus](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf) for black-box techniques and risk-based testing.

All specific Moneyverse test cases, templates, metrics, thresholds and the operational twelve-basket taxonomy below are **our recommendations**, not quotes or claims about unseen video content. A web-content summary is not QA execution evidence.

## 2. Twelve compulsory QA process stages

| Stage | Procedure | Required output / gate |
|---|---|---|
| 01 Requirements analysis | Read current canonical plan, route/API inventory, Spring migration ownership, security/financial invariants, admin/Android/Discord contracts. Identify conflicts and changes since baseline. | Requirements-to-test traceability IDs and explicit unknowns; no inferred behavior. |
| 02 Test planning | Define exact candidate SHA, scope, risk, owner, roles, environment, worktree, independent rollback, entry/exit criteria and budgets. | Test plan plus release-blocking P0 matrix. |
| 03 Scenario design | Build valid/invalid/abusive/empty/loading/stale/timeout/concurrent/offline/account-switch and state-transition paths. | Scenario catalog including negative and recovery paths. |
| 04 Test-case design | Derive partitions, boundaries, decision tables, transitions, pairwise combinations and assertions for both response and persisted side effects. | IDs, setup, input, action, expected UI/API/DB result, teardown. |
| 05 Environment readiness | Certify Test endpoint, frontend+Spring backend+Nginx identity, real database contract, no Production writes, dedicated safe fixtures. | Exact SHA/port/config provenance; unavailable Test = BLOCKED. |
| 06 Test-data readiness | Create deterministic synthetic accounts (guest/member/other owner/admin), isolated financial fixtures and redacted logs; enforce reset and non-interference. | Fixture IDs and reset proofs, no copied production personal data. |
| 07 Execute | Run unit/integration/API/browser/Android/Discord/security/finance/load/visual checks appropriate to risk; execute full-route five-pass contract. | Timestamped per-case evidence and actual observed outcome. |
| 08 Defect registration | File reproducible defects with P0–P3 severity, observed vs expected, SHA, route, role, request/correlation IDs, screenshots/logs and redacted evidence. | Linked issue, owner, affected components and containment decision. |
| 09 Retest | Reproduce original failure, check isolated patch with targeted tests and verify root-cause assertion; ensure verified build SHA. | Actual RED/GREEN or equivalent before/after evidence. |
| 10 Regression | Rerun shared-layout consumers, affected API callers, Test authentic sessions and all security/financial/high-risk journeys; full-site passes remain mandatory. | Impact matrix and exact-SHA regression evidence. |
| 11 Report | State PASS/FAIL/BLOCKED/NOT_RUN counts separately for routes, API, roles, devices and scenarios; state open issues and risks. | Signed/report-linked evidence, not synthetic percentages. |
| 12 Closure decision | Fail closed on unresolved P0/P1, missing route evidence, real backend Test failures, financial drift, source fabrication, security break, unavailable restore or version mismatch. | GO / NO-GO with basis; deployment is a **separate** authorized and validated operation. |

Stages must produce linked evidence, not merely checkboxes. Requirements or main SHA changes invalidate affected planned assertions until re-reviewed; record start, midpoint, finish and collaborate via separate branches/owner locks.

## 3. The twelve cited test concepts made executable

| Concept from caption | Moneyverse test-design requirement |
|---|---|
| Defect types | Classify UI, API, security, identity, data-loss, accessibility, performance, integration, environment, financial false-success and regression separately. |
| Boundary value analysis | For an allowed maximum N test N−1, N, N+1; for zero/negative/overflow amounts test each rejected case; use canonical integer money representation. |
| Equivalence partitioning | Valid owner, unauthenticated, wrong owner, expired consent, revoked admin, disabled feature, malformed data and upstream unavailable must never be treated as one successful partition. |
| Decision tables | Cover combinations of role × session freshness × MFA × CSRF × feature status × source health, including deny-by-default outcomes. |
| State-transition testing | Login/log out/re-auth, request pending/succeeded/failed, bot connect/disconnect/reconnect, transaction requested/posted/replayed and account change. |
| Test pyramid | Unit tests are fast feedback; real PostgreSQL and Spring API integration, browser/system flows and a thin fully authenticated E2E layer certify user outcomes. Mocks alone cannot certify release. |
| Regression testing | Verify dependent consumers after each fix; keep the existing candidate-generated full-route **five complete passes** including all admin pages. |
| V-model | Tie requirements to acceptance tests, system design to system tests, integration contracts to integration tests and units to unit tests; link requirement IDs in results. |
| Coverage | Measure distinct discovered routes, roles/states, API operations, decision rules, transitions and financial posting paths; do not equate raw test count with coverage. |
| Pairwise combinations | Optimize low-risk device/browser/locale/display combinations; NEVER replace exhaustive authorization, ledger, replay and P0 money-state assertions with pairwise sampling. |
| Defect life cycle | NEW → TRIAGED → ASSIGNED → FIXED → RETESTED → CLOSED; REOPEN on repeat, and BLOCKED if environment/evidence prevents decision. |
| Risk-based testing | Prioritize security, financial correctness, login/admin, data isolation, production recovery, Spring migration and Android/Discord interoperability, then cosmetic polish. |

## 4. Twelve Moneyverse QA coverage baskets (project taxonomy; not a transcript)

1. Unit and property tests: validation, state reducers and money-safe integer handling.
2. Contract tests: HTTP status, DTO/schema, auth headers/cookies, API version and error semantics.
3. Integration tests: Spring, database stored functions, Nginx, session authority and event wiring.
4. End-to-end tests: real browser/member/admin and Android API user journeys.
5. Functional and exploratory tests: happy path, discoverability, hidden menu, save/apply and interrupted flows.
6. Regression tests: altered routes, shared components, cross-repo compatibility and historical failures.
7. Security and privacy tests: IDOR, owner boundaries, CSRF, MFA, role escalation, cache/noindex and secrets.
8. Financial/data integrity tests: canonical PostgreSQL double entry, WLD reads/writes, rollback, idempotency and genuine receipts.
9. Reliability and recovery tests: timeout, 5xx, unavailable data, rolling/rollback behavior and backup restore.
10. Performance and concurrency tests: load, burst, rate limit, lock contention and latency compared with measured baseline; no invented SLOs.
11. Compatibility and accessibility tests: 320px–desktop, Android, browser engines, keyboard, focus, reduced motion and WCAG 2.2 AA.
12. Operational and external integration tests: Discord voice/login, callbacks, scheduled jobs, administrator live logs, alerting and observability.

These are risk-coverage buckets, not mutually exclusive ISTQB levels. Each tested feature maps to at least one bucket; P0 journeys typically map to several.

## 5. High-risk candidate scenarios (minimum real checks)

| ID | Scenario | Observable pass condition |
|---|---|---|
| AUTH-01 | Guest, stale login, wrong owner, forged user header; compare real member and superadmin | 401/403 or explicit denial; no private user data, no admin elevation, no unexpected DB writes. |
| AUTH-02 | Admin MFA/CSRF/re-auth success and rejection | Actual authenticated privileged Test session works when authorized; failures denied without false success. |
| FIN-01 | Attempt repeated/simultaneous same-idempotency-key WLD transfer, issue, tax or benefit in isolated Test | Exactly one approved canonical ledger posting and receipt, balanced debit/credit; retries cannot mint duplicates. No Production funds touched. |
| FIN-02 | DB/ledger upstream missing or inconsistent; compare treasury, KDIC, shop upkeep and returned UI | Explicit unavailable/unknown/failed; never fabricated zero, paid or successful transfer. Reconciliation against actual source records. |
| SHOP-01 | Inventory no rows vs 401/403/503/malformed/stale partial response | Truly empty only on valid authorized empty source; source failure never converted to empty or fully paid. |
| WEB-01 | Every route incl. dynamic and /admin; burger, dialogs, forms, page scroll, keyboard and touch at prescribed widths | Five complete route passes with evidence and no occluded interaction, dead CTA, horizontal overflow or false dashboard values. |
| SPR-01 | Spring versus previous API contracts on isolated Test: session, response DTO/errors, Android client and real DB | Compatible status/shape/permission behavior; source of truth and single financial writer preserved. |
| BOT-01 | Discord login and voice-channel connect → permission reject → disconnect/reconnect/restart | Real bot joins authorized voice channel and recovers as designed; log-only or gateway-connected state is not a successful voice join. |
| AND-01 | Android logout/login as different user, offline/online, old cached finance and inventory state | No cross-account leak, clear stale state, correct native error rendering and canonical API parity. |
| OPS-01 | Admin logs: Nginx/Spring/frontend access, live streaming, role gate, PII redaction, retention | Real authenticated Test reads and live refresh; secrets/tokens/passwords excluded, 7-day ordinary/30-day important policy verified where applicable. |
| DEP-01 | Exact SHA Test route, backend, database, production promotion and independently restorable previous version | All known P0/P1 gates pass, documented rollback/restore is demonstrated, no mismatched deployed artifact. |
| NET-01 | API timeout/502/retry, malformed values, concurrency and disconnected socket | Visible retryable failure, preserved state and zero false-positive PASS; logs/correlation IDs support diagnosis. |

Never run unapproved real monetary transfers or destructive experiments on Production. Test failures must remain FAIL/BLOCKED until reproduced and fixed; a smoke 200 is not a complete user or finance PASS.

### Route inventory under Spring transition
When the candidate moves from Next.js/App Router into Spring MVC, templated pages or bundled static frontend assets, derive route inventory from the **candidate actually served** and its source ownership map, not solely historical Next.js page.tsx glob counts. Include Spring-owned authenticated/admin pages, error and permission states, routes reached via navigation, deep links, and applicable Android entry points. Record renderer/runtime origin per row; compare actual Nginx + Spring route behavior with the inventory. Historical counts never imply current coverage.

## 6. Evidence schema and release gate

A minimum record for every test:
- Identity: candidate_sha, frontend_sha, backend_sha, migration_checksums, test_case_id, requirement_id, route_or_api, environment, timestamp.
- Conditions: role, session/MFA/CSRF state, fixture_id, viewport/device, browser/app version, feature switch, locale, source-health and concurrency conditions.
- Execution: step/action, input (redacted), expected_result, observed_result, API status and source DB/ledger receipt reference when authorized.
- Result: PASS, FAIL, BLOCKED or NOT_RUN; defect_id, proof URI, reproduction/trace ID, owning agent and rerun timestamp.
- Risk/decision: impacted domains, release_blocker, rollback_verified, go_no_go_basis.

Preserve the existing FULL_ROUTE_UI_QA_SPEC arithmetic:
discovered routes = ledger routes = routes with accepted final evidence, with **five complete passes**, including all admin routes. Mocks, screenshots, Swagger success, synthetic counters and older release receipts do not satisfy exact-SHA authenticated Test. Route/role/API/ledger deficiencies block promotion regardless of aggregate pass count.

Use synthetic Test fixtures, redacted logs and authorized internal evidence storage. Do **not** commit cookies, tokens, DB exports, secret values, user identifiers, private screenshots or production logs to GitHub. Public change logs reference safe issue IDs and sanitized evidence descriptors only.

## 7. Collaboration, workflow and adoption

- Scope of v2026.11.18.15: **documentation/QA-planning only**; current frontend, Android app, Java runtime, Nginx, PostgreSQL, Test and Production are untouched.
- Recheck authoritative main before integration; maintain an independent task worktree, worklog BEFORE/DURING/AFTER, English+Korean parity and internal/GitHub update records. Never overwrite work from Gemini or parallel QA/repair/design branches.
- This addendum is useful as soon as adopted by canonical plans, but makes NO claim that the 12-basket suite or 12 steps were executed, that tests passed or that user-visible defects have been fixed.
- A later implementation needs dedicated fixture/test owners, new isolated code branch, current real Test + backend verification, regression, safety checks and a documented no-downtime promotion gate.
