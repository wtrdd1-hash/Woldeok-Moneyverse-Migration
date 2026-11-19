# Moneyverse full-function real-runtime QA — v2026.11.19.0958

**Date:** November 19, 2026 (KST)  
**Status:** READ-ONLY AUDIT FINISHED / FULL FEATURE ACCEPTANCE BLOCKED  
**Systems:** Production public HTTPS, Spring Boot primary local runtime, PostgreSQL catalog and ledger, Android contract source, Spring-integrated Discord4J service logs.  
**Authoritative planning:** `PROJECT_PLAN.md` and `INTEGRATED_PLANNING_MASTER.md`. This audit does not amend or supersede product planning.  
**Operating constraints:** No production writes, financial transactions, identity bypass, secret extraction, app-role changes, service restarts or deployment. Missing evidence is **UNKNOWN**, not PASS.

## Executive result

No credible all-function acceptance can be issued. The deployed application returns many successful HTTP statuses, but there are independently reproduced routing and compatibility defects, an app-database least-privilege deviation, and broad authenticated/transactional test gaps.

### 180 web page source-route audit — PUBLIC HTTPS

| Measured classification | Count | Interpretation |
|---|---:|---|
| HTTP 200, *semantics not verified* | 103 | Page responds, but controls/actions/data untested |
| Authorization response or redirect | 40 | Boundary observed; valid account E2E not executed |
| Parameterized route without real resource fixture | 30 | UNKNOWN |
| HTTP 200 with exact homepage fallback body | 5 | Route identity incorrect, not a function PASS |
| HTTP 405 / 406 | 2 | Contract/method/content negotiation review |
| **Total** | **180** | **0 certified functional journeys from this probe** |

This is a *single uncredentialed public-HTTP sweep*, not a browser or logged-in test. A fabricated random pathname returned HTTP 200 with the homepage. Independent direct Spring comparisons showed `/quest` and `/dashboard` rendering the homepage. The previously local `VERIFIED_PASS:180` claim is incompatible with this evidence and with the integrated master’s **5 native Production UI verified / 175 not certified** statement. Preserve both historical records, do not silently rewrite them.

Per-route evidence: [CSV matrix](2026-11-19-readonly-route-matrix-v2026.11.19.0958.csv).

### 637 OpenAPI GET operations — LOCAL SPRING, no credentials

Spring OpenAPI advertised 960 distinct paths, 637 GET and 338 POST operations. All GETs were enumerated, but 47 required path-variable fixtures and were not invoked.

| Observed state | Count |
|---|---:|
| HTTP 200 without authentication | 282 |
| HTTP 401/403 (access-controlled) | 307 |
| Missing verified path-variable fixture (not called) | 47 |
| HTTP 406 | 1 |
| HTTP 5xx in invoked GETs | 0 |
| **Total GET operations** | **637** |

**590 requests actually executed**, not 637 positive functional tests. The 307 auth blocks are correct negative security observations, not authorized business transactions. No internal override/superadmin token was used. The 338 POST operations were **not** exercised in production because writes/settlement may result.

Per-GET evidence: [CSV matrix](2026-11-19-readonly-api-get-matrix-v2026.11.19.0958.csv).

## Defect and gap register

| ID | Priority | Evidence / failure mode | Disposition |
|---|---|---|---|
| QA-001 | P1 | Unknown pathname `GET` returns 200 and homepage rather than 404; invalid pass by status only | REPRODUCED; fix fallback and add distinct-route content assertion |
| QA-002 | P1 | `/quest` and `/dashboard` match homepage instead of requested function | REPRODUCED direct Spring; add behavior tests |
| QA-003 | P0 | Android release consumes canonical `/app-api/v1/`; zero corresponding Spring OpenAPI GET paths; sample `/app-api/v1/stocks` returned 404 in observed direct/public tests | REPRODUCED contract gap; trace edge routing and Android authenticated E2E |
| QA-004 | P1 | Several Spring-served HTML pages still include Next hydration and `/_next/` references; sampled stylesheet returns 404 from direct Spring server | REPRODUCED; test public browser assets and Spring-native parity, not merely process identity |
| QA-005 | P0 SECURITY | Active database app-role table permissions materially exceed the documented least-privilege finance boundary | REPRODUCED; restricted host-side security evidence, reviewed forward-only migration and isolated parity required; sensitive details intentionally excluded |
| QA-006 | P1 SECURITY | Public `/admin` redirects unauthenticated users; direct Spring endpoint supplies admin HTML 200 while its API denies 401 | REPRODUCED; verify network ingress/firewall and absence of sensitive HTML disclosure |
| QA-007 | P1 | Discord Gateway reconnect succeeded after voice 4006/4014 close events; sustained voice playback and command execution not tested | PARTIAL EVIDENCE / E2E OPEN |
| QA-008 | P2 | `/announcements` returned 406 and `/safety/takedown` returned 405 in the route sweep | REPRODUCED HTTP; contract/method expectation needs confirmation |
| QA-009 | GATE | Authenticated user/admin UI, MFA/CSRF, personal-data boundaries, Android emulator, bank/stock/treasury idempotency and rollback untested | NOT CERTIFIED |
| QA-010 | GATE | Main branch advanced during the audit independently of the active Spring JVM; source HEAD cannot prove deployed identity | REVERIFY exact SHA before any release |

Spring primary startup logs also confirm a successful integrated Discord Gateway connection, 11 command registrations and an initial voice join. The obsolete standalone Discord unit being inactive is **not** proof the integrated bot is down.

## Finance data integrity (read-only)

Observed PostgreSQL: 281 public tables, 658 public functions. Counts: 943 ledger transactions, 1,950 postings; debit and credit totals are equal at 450,856,461 units each. Zero unbalanced transactions, zero postings with nonpositive amount, zero transactions missing postings. One negative balance is explicitly permitted; **zero unauthorized negative balances**. A balanced ledger does not prove every source account, treasury balance, expense, payout or race condition is correct.

## Functional coverage still required

- **Identity and security:** local/Discord/Google sign-in, consent, refresh/logout, session isolation, TOTP/MFA, CSRF, anonymous 401/403 and owner/user boundary.
- **Finance:** wallet transfers, bank deposits/loans, stocks buy/sell/order execution, treasury/M0/KDIC/NPS/ASWF, bonds, businesses, grants, balance reconciliation, replay/idempotency, write failure rollback.
- **Engagement:** shop purchase/equipment/upkeep, inventory, quests, work/reward, casino simulations, gallery/board/blog, support/chat, notifications, social and admin moderation.
- **Frontend:** page-specific semantic DOM, actual button/network/database outcomes, mobile 320/390/1440, EN first and KO second, missing JS/CSS, SEO, CSP, error/empty/loading states.
- **Integrations:** Android production binary and device, Discord voice/audio/commands/rejoin, OAuth, ads, webhooks, scheduler jobs and status collector.
- **Release:** exact-SHA isolated Test, complete JUnit/contract/security suites, backup restore, zero-downtime switch and rollback. None is inferred from HTTP 200.

## Reproduction, evidence custody, and release decision

The independent job preserved JSON, CSV, read-only probe scripts, timestamps, error/status classifications, and a **restricted** security report in the authorized host task directory (`/srv/moneyverse-data/tasks/gpt-full-function-qa-20261119-0958/`, permissions 0700/0600). The public GitHub copies contain no account identities, auth tokens, cookies or exploit steps. Work stages are recorded in [worklog](../worklog/2026-11-19-full-function-readonly-audit-v2026.11.19.0958.md).

**Verdict: FULL SYSTEM RELEASE BLOCKED / PRODUCTION UNCHANGED BY THIS AUDIT.** This report identifies both verified deficiencies and unverified operations; it does **not** certify that every function works.
