# All API Inventory and Real HTTP QA — v2026.11.18.17

**EN canonical · [Korean](./2026-11-18-all-api-real-http-v2026.11.18.17.ko.md) · 18 November 2026 KST · QA EVIDENCE ONLY · RELEASE HOLD**

## Source of truth and scope
The living `docs/planning/PROJECT_PLAN.md` takes precedence, followed by `INTEGRATED_PLANNING_MASTER.md`, `AGENTS.md`, the official API catalog, Spring API-contract/QA skills and the Android Retrofit source. Source reference at audit start and midpoint: GitHub `main` `0590fac4e8a82bc986ba1b8c64f014d18daca9e9`. The shared MiniPC `main` was ahead 15 commits and deliberately untouched. This is not a certification of an exact-SHA official Test or Production deployment.

## Evidence, not assumptions
- Isolated Spring QA runtime (`127.0.0.1:4611`) responded to OpenAPI with **903 paths, 982 HTTP operations**: **578 GET, 340 POST, 28 PUT, 22 DELETE, 10 PATCH, 2 OPTIONS, 2 HEAD**. Inventorying an operation does **not** mean its full request/response contract was tested.
- **520 real GET calls** on the isolated read-only QA canary: **270 HTTP 200, 210 HTTP 401, 38 HTTP 503, 1 HTTP 500, 1 HTTP 406**. 401 is frequently the correct unauthenticated refusal; 503 may intentionally fail closed on missing authoritative finance data. The 406 is a text-only well-known route requested as JSON and is not counted as a generic API failure.
- **130 additional read-only invalid-credential responses** on selected private-looking paths: **110 HTTP 401 and 20 HTTP 200**. The 20 include possibly public by-design paths; route-name heuristics must not be treated as proof of 20 vulnerabilities. A separate direct Production Spring negative-auth read did confirm an administrative authorization regression; details and reproduction inputs are retained privately, not posted publicly.
- **Official Test edge: 16/18 representative GET requests were HTTP 502**, while only `/health` and `/api/version` returned HTTP 200. The two successful Test paths explicitly proxy to the production Spring 4550 service; they do not establish Test's independent health. Nginx's general Test upstream port 3101 had no listener at inspection.
- **Production edge sample: 13 HTTP 200, 4 HTTP 404, 1 HTTP 406**. 200 is transport success, not proof of authenticated workflow, real DB values, or correct backend ownership.
- **Android app gateway:** tested four `/app-api/v1/` GET samples on the Production entry point, all answered **HTTP 200 with HTML rather than the required JSON**; the official Test entry point returned 502. A separate static Retrofit review counted **158 declared API methods, 0 direct Spring path matches, 59 matching method+path aliases after a hypothetical gateway prefix rewrite, 99 not matched even after that rewrite**. The static comparison does **not** prove those 99 are unsupported by other BFF routing or verify Android runtime decoding.

## Release-blocking findings
| Severity | Finding | Direct evidence | Gate |
|---|---|---|---|
| P0 | Official Test service unavailable for functional QA | 16/18 edge requests 502; Test upstream absent | Restore isolated Test and repeat exact-SHA E2E |
| P0 | Incomplete Spring administrative security boundary / CSRF | Read-only negative authorization mismatch in Production; reviewed source globally permits requests and disables CSRF | SEC1 session and role checks; independent negative and positive MFA/CSRF |
| P0 | Misleading shop catalog success on source failure | Production Spring returned 200 with two fallback items while QA returned 146; source DB function invocation incompatible with actual PostgreSQL required-actor signature | Correct DB-bound read; no fabricated successful response |
| P0 | GET handler may write account state | Source pension read delegates to get-or-create transaction; it can insert if missing | Split read and create; audit any write and require actual session |
| P0 | Android HTTP contract broken at web entry | App API paths yielded HTML, not JSON, or Test 502 | Verify gateway, Retrofit DTO/identity and error contract |
| P1 | Pension read error on QA canary | 500 on isolated read-only QA, with creation on GET implicated | Rework owner-scoped read; retest without mutations |
| P1 | Multiple domains return 503 | 38 HTTP responses across derivative/FX/KDIC/venture/quant/shop/brief pathways and aliases | Distinguish expected fail-closed from incomplete implementation; verify source-backed operation |

**Safety incident disclosure:** The pension `GET` was found *after* a comparative Production read had already been issued. Although the agent intentionally made no POST/PUT/PATCH/DELETE or money command, this GET can create an account. A Production DB write was **not verified or ruled out**. That endpoint was immediately excluded from further Production probes and requires an audit before any broader scanning. Never label arbitrary GET endpoints inherently side-effect-free.

## Per-domain API probe matrix
Counts below are **HTTP status observations**, not PASS/FAIL totals. OpenAPI paths may have aliases across modules; separate paths are counted separately. Only GET without mandatory params and without previously recognized mutation-like names were eligible for the automatic campaign.

| Domain | Operations | GET defined | GET probed | 200 | 401 | 503 | 500 | Other |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `.well-known` | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 1 |
| `account` | 18 | 8 | 8 | 0 | 8 | 0 | 0 | 0 |
| `activity` | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `admin` | 282 | 162 | 154 | 14 | 140 | 0 | 0 | 0 |
| `advisor` | 16 | 12 | 12 | 12 | 0 | 0 | 0 | 0 |
| `arena` | 8 | 2 | 2 | 2 | 0 | 0 | 0 | 0 |
| `audit` | 4 | 2 | 2 | 2 | 0 | 0 | 0 | 0 |
| `auth` | 44 | 17 | 11 | 11 | 0 | 0 | 0 | 0 |
| `banking` | 13 | 3 | 3 | 1 | 2 | 0 | 0 | 0 |
| `blog` | 9 | 9 | 6 | 6 | 0 | 0 | 0 | 0 |
| `board` | 22 | 13 | 11 | 11 | 0 | 0 | 0 | 0 |
| `bonds` | 8 | 5 | 5 | 5 | 0 | 0 | 0 | 0 |
| `business` | 12 | 8 | 8 | 8 | 0 | 0 | 0 | 0 |
| `businesses` | 15 | 6 | 6 | 0 | 0 | 6 | 0 | 0 |
| `casino` | 3 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| `central-bank` | 6 | 4 | 4 | 4 | 0 | 0 | 0 | 0 |
| `chat` | 8 | 6 | 4 | 4 | 0 | 0 | 0 | 0 |
| `club` | 12 | 8 | 6 | 6 | 0 | 0 | 0 | 0 |
| `clubs` | 12 | 6 | 6 | 6 | 0 | 0 | 0 | 0 |
| `collections` | 6 | 3 | 3 | 0 | 3 | 0 | 0 | 0 |
| `content` | 24 | 18 | 12 | 12 | 0 | 0 | 0 | 0 |
| `controls` | 6 | 6 | 6 | 6 | 0 | 0 | 0 | 0 |
| `crafting` | 8 | 6 | 6 | 6 | 0 | 0 | 0 | 0 |
| `dopamine` | 18 | 10 | 10 | 0 | 10 | 0 | 0 | 0 |
| `early-game` | 9 | 6 | 6 | 0 | 6 | 0 | 0 | 0 |
| `economy` | 34 | 28 | 28 | 28 | 0 | 0 | 0 | 0 |
| `engagement` | 27 | 16 | 16 | 0 | 16 | 0 | 0 | 0 |
| `fx` | 21 | 12 | 12 | 0 | 0 | 12 | 0 | 0 |
| `game-clock` | 4 | 4 | 4 | 4 | 0 | 0 | 0 | 0 |
| `health` | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| `help` | 12 | 6 | 3 | 3 | 0 | 0 | 0 | 0 |
| `integrations` | 9 | 3 | 3 | 3 | 0 | 0 | 0 | 0 |
| `kdic` | 4 | 4 | 4 | 0 | 0 | 4 | 0 | 0 |
| `market` | 6 | 4 | 2 | 2 | 0 | 0 | 0 | 0 |
| `marketplace` | 3 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| `media` | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `mint` | 14 | 10 | 0 | 0 | 0 | 0 | 0 | 0 |
| `newspaper` | 10 | 8 | 8 | 6 | 0 | 2 | 0 | 0 |
| `notifications` | 12 | 6 | 6 | 6 | 0 | 0 | 0 | 0 |
| `pension` | 5 | 3 | 3 | 2 | 0 | 0 | 1 | 0 |
| `photos` | 8 | 2 | 2 | 0 | 2 | 0 | 0 | 0 |
| `privacy` | 6 | 3 | 3 | 0 | 3 | 0 | 0 | 0 |
| `profile` | 22 | 12 | 10 | 0 | 10 | 0 | 0 | 0 |
| `progression` | 12 | 10 | 10 | 10 | 0 | 0 | 0 | 0 |
| `public` | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| `quant` | 15 | 6 | 3 | 0 | 0 | 3 | 0 | 0 |
| `safety` | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `seasons` | 2 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| `seo` | 27 | 18 | 18 | 18 | 0 | 0 | 0 | 0 |
| `shop` | 18 | 14 | 14 | 8 | 4 | 2 | 0 | 0 |
| `space` | 14 | 8 | 8 | 8 | 0 | 0 | 0 | 0 |
| `spaces` | 14 | 8 | 8 | 8 | 0 | 0 | 0 | 0 |
| `stocks` | 61 | 36 | 32 | 17 | 6 | 9 | 0 | 0 |
| `support` | 8 | 6 | 4 | 4 | 0 | 0 | 0 | 0 |
| `treasury` | 20 | 10 | 10 | 10 | 0 | 0 | 0 | 0 |
| `version` | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| `wallet` | 3 | 2 | 2 | 2 | 0 | 0 | 0 | 0 |
| `work` | 14 | 10 | 10 | 10 | 0 | 0 | 0 | 0 |

## Not executed, therefore not approved
- Real authenticated user/admin login, MFA, CSRF rotation, logout, owner isolation, OAuth provider callback, Discord voice, WebSocket, Android-device E2E and real browser accessibility.
- **400 declared mutating operations** (POST/PUT/PATCH/DELETE and OPTIONS/HEAD do not count as business writes); 58 GET operations excluded by side-effect/path-param/required-param review. These are **NOT TESTED for functional success**.
- Independent disposable PostgreSQL fixture with rollback-only wallet/stocks/treasury transactions, idempotency, concurrent settlements and double-entry reconciliation; source truth and authorization must be demonstrated before any promotion.
- Capacity/stress thresholds, exact-SHA official Test release, independent DB restore and zero-downtime failover/rollback.

## Required next sequence
1. Fix Test upstream and prove independence from Production using runtime SHA + database identity (G0); stop on 502.
2. Close Spring administrator/member auth, origin/cookie, session and CSRF gaps before positive-path write testing (SEC1).
3. Correct DB contract and falsely successful shop/pension handlers; test against synthetic PostgreSQL functions and read-only guards; audit potential pension GET side effect.
4. Restore Android JSON BFF and contract parity across 158 Retrofit definitions; test isolated logins, DTO failures and account switching.
5. Build a per-operation executable acceptance matrix with seeded disposable DB and actual authenticated Test, then promote only with green G0–G6, independent restore and rollback evidence.

**No code, runtime, deployment or configuration modifications performed for this audit. No intentional financial or account mutation.** Private raw per-path evidence and investigation worklog stay exclusively on the MiniPC in `/srv/moneyverse-data/tasks/gpt-all-api-qa-v2026.11.18.1/` and are **not** uploaded to GitHub. Tracking: [Platform P0 #3265](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3265), [Security P0 #3202](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3202).
