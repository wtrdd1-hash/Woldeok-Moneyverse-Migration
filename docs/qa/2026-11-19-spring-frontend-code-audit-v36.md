# Spring frontend conversion reality check — v2026.11.19.36
**Date:** 2026-11-19 13:52–13:58 KST. **Scope:** source and live read-only inspection; no app, API, DB or deployment changes. **Reviewer:** ChatGPT (mini-PC MCP).

## Executive result
**Strict independently verified Spring-native UI rollout: 5 / 180 route-source baseline = 2.78%.** This is a *limited page-render/UI verification rate*, **NOT** a proven end-to-end function completion rate. The broader service already uses Spring Boot for some website delivery; Spring-served legacy Next.js/React static bundles do not constitute a frontend rewrite. Do not equate the separate route board's `180 HTTP 200` with 180 verified working Spring views.

## Evidence and measurement
- Source snapshot inspected (mini-PC local integration HEAD observed: `404f9e199b`; remote GitHub `main`: `c131ef1039` at audit time). The local worktree includes unmerged source/QA history. In particular `docs/qa/2026-11-19-spring-only-frontend-migration-board-v30.json` is present locally but **not on remote main**. Do not imply identical snapshots.
- `frontend/src/app`: **180 Next page components**. Spring templates: **5 HTML files, including one shared layout, four page views**: compound, stock average calculator, service status, and calculator hub. `PublicStocksReadOnlyPage` separately generates a live read-only stock market page in Java. The native independent production-tested set documented in local `docs/findings/2026-11-19-spring-native-financial-hub-v30.ko.md`: `/stocks`, `/tools/compound-calculator`, `/tools/stock-calculator`, `/status`, `/calculators` = **5 routes**.
- `/tools` currently returns a Spring-rendered `data-spring-page="tools-hub"` in live GET, but **do not count as fully migrated**: legacy `/tools` source includes six interactive game/economy widgets, which the local v30 report explicitly states were not faithfully reimplemented. The current hub lists financial tools instead; parity needs signed-off functional QA.
- `spring-backend/src/main/resources/static`: **290 HTML files, all 290 reference `/_next/static`**; **1,004 existing `_next` artifacts** found. `SpaWebMvcConfig` serves route HTML/Next static exports and has a fallback to index HTML, not native Thymeleaf for every route. Live GET `/wallet` and `/admin` still show `_next/static` references, whereas `/stocks`, `/calculators`, `/tools`, `/status`, and `/tools/stock-calculator` do not. Live `GET /__mv_not_real_20261119` returned HTML 200, demonstrating why successful HTTP probes alone are false positives.
- Live homepage `GET /` includes hardcoded `100,000,000,000,000 WLD` Treasury metric, `+2.41%` illustration, `Spring Boot 3.3.5`, and ledger synchronization status. The source remains hardcoded in `spring-backend/src/main/resources/static/index.html`. These violate personal-assets-first/actual-data-only and no-internal-diagnostics requirements merged in v2026.11.19.34. The local v93 change adds stock API/session hydration, but it does **not** eliminate those static hero values.
- Live unauthenticated probes: `/api/wallet/overview` and `/api/v1/wallet/overview` returned 403; `/api/v1/stocks/portfolio` and `/api/v1/admin/stocks` returned 401. This may be correct fail-closed behavior but **does not** certify authenticated personal wallet, trade writes, chat, payment or finance E2E.
- The local v30 machine board claims `180/180 VERIFIED_PASS`, each with status 200, but its own associated v30 engineering report records only **5 newly redesigned and production-browser-verified native pages**, **175 unverified**, 28 known legacy 503 endpoint aliases and unfinished admin/global chat. The board's coverage is not proof of real route/functional acceptance. An independent source-based and authenticated E2E re-audit is mandatory.

## Release classification
| Scope | Result | Meaning |
|---|---|---|
| Spring Java server delivery | Confirmed operational | Does not mean UI rendering was migrated |
| Spring-native independently verified UI | 5 / 180 = **2.78%** | Partial native page rollout; not full feature parity |
| Spring-rendered extra `/tools` path | Served, not feature-equivalent certified | Existing interactive widgets need restoration |
| Legacy static Next-export HTML | 290 / 290 reference Next assets | Remaining JS/React artifacts persisted |
| Authenticated 180-page business E2E | NOT CERTIFIED | Completion rate cannot be stated |
| New personal-asset dashboard and no-internal-diagnostics policy | NOT IMPLEMENTED on live root | Static Treasury metric and framework version remain |

## Required next gates
1. Establish a single immutable SHA truth between GitHub `main`, mini-PC local development HEAD, deployed immutable JAR/static frontend bundle, and documented release; avoid clashes with Gemini's worktree.
2. Create a full 180-route source-to-Spring view and specific API capability map with exact endpoint ownership, login/guest/admin states and screen screenshots. Make unknown and placeholder routes fail closed with valid 404.
3. Restore complete `/tools` game-widget functionality, not just calculator navigation; implement wallet, portfolio, trading, quests, community and admin views using genuine server-backed data and secure sessions; remove mock Treasury figures and public Spring/system diagnostics from both HTML and API.
4. TDD UI/API negatives, live authenticated Test browser and DB-ledger proofs, screenshots at 320/390/768/1440 px, CI, precise artifact SHA and zero-downtime production gates before reporting complete.

No code modifications, authenticated transactions, full browsers or production promotion were performed in this audit.
