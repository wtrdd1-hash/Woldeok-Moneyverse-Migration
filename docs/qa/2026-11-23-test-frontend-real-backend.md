# Actual Test frontend/API audit — 2026-11-23

> **Superseded for the current runtime — 2026-11-24:** the running JAR changed while retaining the7b identity. The240-case pass below remains evidence for the original attested artifact only. Current findings: [runtime/design/route diagnosis](2026-11-24-frontend-diagnosis.md). Current /api/v1/status is200 with unknown states and broadened Test raw-table SELECT; the earlier503 is historical.


## Current accepted slice

Owner scope is **Test only**. [Test frontend](https://test.easy-scraping.com/) · [exact frontend identity](https://test.easy-scraping.com/frontend-ui-version). Production was not promoted by this task.

The independent native Spring MVC/Thymeleaf presentation service is connected to a real isolated Spring backend and synthetic Test PostgreSQL. There are no mocked API responses or fabricated balances in this acceptance. The current process was checked against the isolated Test database; this does not claim that every business read/write contract is correct.

| Identity | Verified value |
| --- | --- |
| Frontend application source | `7b676e602bc984ab74572d4081655fdb297d176a` |
| Real backend source | `f0336fded6068f884c87f88efedeb770fd3387d4` |
| Source-bound frontend JAR SHA256 | `a751dc6b8760967c7e3e8bcb7ca0c30fd1a73e9ad7df09548de66fe3a6893706` |
| Candidate CI | [45139863605](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/45139863605), success |
| Whole-site acceptance | **OPEN** |

The required classify, policy, runtime and Spring web jobs succeeded for this exact application source. Inapplicable/skipped work is not counted passing. Later documentation/operations commits do not relabel this running application.

## Actual browser verification

**240 conditions, zero failures**, with calculator/search/menu/support interactions and a negative overlap-guard self-test. The matrix uses fresh owned browser contexts, the real Test hostname resolved to the Test host's loopback, and actual Test Nginx HTTP. A separate external HTTPS probe returned200 and exact source7b. This is not240 external-network/TLS cases.

- Four public screens (home, tools and two calculators), eight widths320–1920px and five languages:160 conditions.
- Eight authentication screens, two widths390/1440px and five languages:80 conditions.
- Checks include SSR language/labels, navy/violet shared chrome, real favicon, no horizontal overflow or input/peer collisions, asset/JavaScript errors and four actual read-API response shapes.
- Compound calculator:1000 at10% for2years ->1210. Stock average calculator:100×10 +200×10 -> average150, quantity20, cost3000, target165 and profit300.
- Search/filter/empty states; mobile menu and Escape/focus; support modal open/close/focus.
- Unsubmitted authentication drafts survive language changes. No login POST or user credentials were recorded.

Evidence: [matrix](2026-11-23-test-frontend-browser-accepted.json), [interactions](2026-11-23-test-frontend-interactions-accepted.json), [connection receipt](2026-11-23-test-frontend-connection-accepted.json), [desktop screenshot](2026-11-23-test-frontend-screenshots/actual-home-1440.png), [mobile screenshot](2026-11-23-test-frontend-screenshots/actual-home-390.png).

This verifies the listed common/public/auth-rendering slice. It does not accept actual OAuth, member/admin positive sessions, financial mutations or every180 route.

## Findings and rulings

| ID | Status | Finding and evidence |
| --- | --- | --- |
| F01 | Fixed for current slice | Test reused the Production renderer and lacked reliable JSON identity. It now has its own immutable frontend artifact and explicitly uses the real Test backend. |
| F02 | Fixed | Administrator decoration used a letter emblem. It now uses the actual current favicon; repository, Production favicon, Test favicon and branded asset have identical bytes. [Hash evidence](2026-11-23-test-frontend-favicon-accepted.json). |
| F03 | Fixed | Explicit Korean URL stayed English. Server/client now agree on a single supported URL language before saved preference, with canonical-cookie/browser fallbacks and duplicate-query consistency. Actual five-language matrix passed. |
| F04 | OPEN |117 native routes are still missing or denied/unconnected in the anonymous inventory. A403 is not implementation acceptance. |
| F05 | OPEN |/status returns503. The backend reads revoked raw tables rather than the intended restricted function. [Real-role finding](../findings/2026-11-23-test-status-read-boundary.md). No table GRANT or synthetic healthy response was added. |
| F06 | OPEN |Authenticated member/admin positives, OAuth/CSRF and actual financial writes require separate real-role/fixture evidence. |
| F07 | Fixed |The lower-right56px support launcher overlapped the320px tools search field by5.25px. It now occupies reserved space in the shared member/admin toolbar; the full matrix and forced-collision negative guard passed. |

Ruling1: a single explicit supported URL language wins over an older saved preference. Cost: a direct language link intentionally changes the saved selection. Ruling2: the same56px support control moves to the common toolbar at all widths. Cost: placement differs from the former floating lower-right control. Both retain fallbacks/modal behavior.

Historical failures remain visible: [initial language failure](2026-11-23-test-frontend-browser-initial-failure.json), [tools overlap](2026-11-23-test-frontend-browser-overlap.json), [initial route inventory](2026-11-23-test-frontend-route-180-initial.json). They are not current passes.

## All180 routes — anonymous GET inventory only

| Latest result | Count | Meaning |
| --- | ---: | --- |
| Guest HTML available |15| A screen exists; not all functionality accepted |
| Login required |14| Protected screen; authenticated positive behavior unaccepted |
| Dynamic fixture required |33| No arbitrary member/post IDs invented |
| HTTP403 |117| Missing/denied/unconnected native UI; not implemented success |
| HTTP503 |1| Real status backend unavailable |

[All180 rows](2026-11-23-test-frontend-route-180-latest.json). A parallel Test-only routing change replaced the original117 HTTP404 results with native security403 responses. That change does not close117 implementation gaps. Newly parallel API/OAuth/socket routes were preserved by the unit-only upgrade, not claimed as business-operation acceptance.

## Validation and deployment limits

Application source7b: Java674 and Node354, zero failures/errors/skips in the default suites; operational regression suite23 passes. PostgreSQL-tagged tests excluded by the local default are not counted passing. Required candidate CI succeeded, but does not override the real status defect or incomplete functional coverage.

The exact current frontend was upgraded on Test only. The full Nginx snapshot stayed unchanged throughout that upgrade and QA; temporary development units were ownership-checked and stopped. This does not prove a host reboot or an actual rollback drill of this final7b deployment.

GitHub changed concurrently: original PR3402 was closed unmerged and another actor advanced its branch into consolidated PR3407 at1ecf461fc8. Those additional application changes were **not deployed or accepted by this evidence**. This documentation-only evidence branch is based on that remote tip to preserve its work without overwriting it. Current origin/main was still9876c09888 when fetched. No main integration or Production promotion was performed.
