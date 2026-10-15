# F675-01 — Feature Reality, User Trust and Recovery Specification

> Version **v2026.10.15.677** | Status **PLANNING / BLOCKED for runtime release** | Date 2026-10-15 KST
> Parent authority: [PROJECT_PLAN](PROJECT_PLAN.md) → [INTEGRATED_PLANNING_MASTER](INTEGRATED_PLANNING_MASTER.md) → [v675 feature portfolio](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.md).
> 한국어: [F675-01 이용자 신뢰·실제 기능 상태 상세 기획](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.ko.md)
> Exact starting `origin/main=a24a8ae9e0d14dbd63738f5bb7e4e857ca412c13`; mid/final reference recorded in [worklog](../worklog/2026-10-15-feature-truth-ux-v677.md).

## 0. Product decision / non-goals

**Promise:** A user should never infer “my action succeeded” merely from a button click, HTTP 200 from a status endpoint, a feature switch being enabled, or a green dashboard. The app states **what can be attempted now**, **what was submitted**, **whether the authoritative outcome is known**, and **what to do safely if unknown**. The administrator sees the underlying evidence-to-action trace, not invented 100% scores.

**Scope:** User-facing just-in-time availability and recovery for money-moving/market/jobs/account flows; privileged feature registry with source-to-UI-to-API-to-DB/worker mappings; machine-checkable release gates. Extend existing `/admin/api-health`, `/admin/controls`, `frontend/src/lib/action-state.ts`, contract/QA ledgers and error surfaces. Not a separate competing status authority.

**Non-goals:** No automatic approval of incomplete features; no user-visible internal hostnames, endpoint topology, security weaknesses, audit identities or account balances; no probing of state-changing endpoints; no hardcoded “all healthy”; no irreversible live smoke transactions; no replacing existing feature switches or granting DB rights; no real money, investment claims, or new SEO pages for each failure mode.

## 1. Existing code and evidence gaps (source ≠ Production status)

| Evidence identity / source | Confirmable observation from exact main source | Risk / acceptance need |
|---|---|---|
| `backend/src/admin/api-health.controller.ts` | Domain summaries include fixed `OPERATIONAL` values, example `100.0` success rates, constant latencies; `isLiveTelemetry: true` on a response whose some fields are preset, with real DB probe on only some domains | **T677-01 P0:** no fixed score may be advertised as measured; separate measured metrics from inventory/examples and show `UNKNOWN` if insufficient |
| `frontend/src/app/admin/api-health/api-health-dashboard.tsx` | Refresh catches and ignores transport failure; existing data remains; `lastRefreshedAt` is local refresh time | **T677-02 P1:** failed poll must show stale/error with last successful sample and observation/expiry timestamps, not a fresh green state |
| `frontend/src/lib/action-state.ts` | `idle / ok / error` for server actions | **T677-03 P0:** async money/worker flows additionally need PENDING / OUTCOME_UNKNOWN / SERVER_CONFIRMED; no premature ok |
| `docs/planning/FULL_ROUTE_UI_QA_SPEC.md` | Complete routes, roles and five full passes required | **T677-04 P0:** automated action registry supports, **does not replace**, authenticated complete UI testing |
| `docs/planning/PROJECT_PLAN.md` v397 + v530 | Server-backed UI requires implemented API contract, DB and exact-SHA E2E; all-admin mobile blocked | **T677-05 P0:** never treat UI test alone or endpoint existence as functional parity |
| v638/v651/v652 historical worklogs | Historical 404s, role-grant concerns and Test/Production identity drift | **T677-06 P0:** re-evaluate current exact SHA and live evidence independently; no assertion those counts remain current |

Source inventory count is intentionally omitted until an actual generator examines the exact candidate. No assertion that Production is currently serving these source lines.

## 2. User research before rollout: people, jobs-to-be-done and hypotheses

No user interview, observational study, support-ticket sampling or A/B result has been performed by this planning cycle; all proposed reactions are **hypotheses**. Observe participants with consent; use anonymous task scenarios and never collect passwords, account IDs, private portfolio/trade content or device fingerprinting.

| Participant group / task | User language / need | High-risk failure | First research task |
|---|---|---|---|
| Guest from Google calculator/guide | “Where does this button go; can I use it without signing in?” | visible CTA dead-ends at login/404, no return path | arrive from guide, follow public→login→return |
| New Korean mobile member | “Can I earn and see my first WLD reward?” | enabled but inaccessible action, action label clipped, fake success | find Work, complete eligible job, inspect result |
| Returning investor/game player | “Did my order go through? I must not buy twice.” | timeout after DB commit, blind retry doubles trade | submit fictional order under injected lost response |
| Large-balance bank/treasury participant | “Where is my WLD; did it settle?” | BigInt precision, split/partial posting, optimistic balance | inspect authoritative receipt after network loss |
| Limited-connectivity or assistive-tech user | “Read what changed and let me recover without losing input.” | silent state, automatic retry loops, focus loss | keyboard/screen reader, offline/reconnect and reflow |
| Admin on mobile / support worker | “Which route is broken, who owns it and what can I safely do?” | static green health, sensitive debug details leaked | identify failing CTA from tagged evidence and create incident |

Qualitative discovery plan: 3–5 task-specific participants **per distinct user group as recruiting permits**, not asserted representativeness; compare plain error-copy alternatives with moderated task success and an accessibility review. This is a proposed pilot sample, not statistical proof. Expose consent-based anonymous usability events with a retention and privacy review. Hold each cohort's actual baseline as `UNKNOWN` until research.

### User-facing principles

1. Explain availability **where the user would act**, not as a perpetual site-wide alarm.
2. Distinguish: intentionally disabled/coming soon, role-locked, age/legal restricted, no data, degraded, retryable request error, and **uncertain commit**.
3. Preserve drafts, selections, filters and navigation return path; do not invent success or blame the user for a server fault.
4. **Do not ask for a second money-moving request while the first outcome is unknown.** Provide “check result”/transaction-status lookup first.
5. Show enough detail for the next step, not infrastructure details; no rainbow-green dashboards or false promises about recovery time.
6. Use textual status plus accessible live regions; never convey outcomes solely with colors/icons/spinners.

## 3. Information architecture / surfaces

**Public/member context UI:** On individual card/detail/form show `Available`, `Sign in`, `Requires permission`, `Temporarily unavailable`, `Coming soon` (only approved public roadmap), or `Checking`. A release's internal `IMPLEMENTED` label is not suitable as a member-facing claim. Do not disable navigational links for non-applicable member rights without an accessible explanation; prefer a destination that explains prerequisites.

**Transaction-specific status:** Existing form component receives `IDLE → VALIDATING → SUBMITTING → PENDING_CONFIRMATION → CONFIRMED | DECLINED | OUTCOME_UNKNOWN`. On `OUTCOME_UNKNOWN`, state “We are checking whether your last request was processed” with a status lookup; original idempotency key reused only for sanctioned check/retry after server verifies safe semantics. Repeat submit disabled while unknown. Receipt shows canonical server record, not client math.

**Public service advisory:** One short contextual message only if relevant to what the member tries to do; optional `/status` aggregate page **only after reliable evidence feed exists**. No broad “site healthy” claim if coverage unknown. Indexing of public status is a separate SEO decision; default `noindex` while unstable, authenticated UI and debug routes always noindex.

**Operator:** Extend existing `/admin/api-health` via **Features** tab, rather than new parallel control panel:
- filters: domain, severity, user impact, lifecycle, source SHA, client web/Android, owner, age of last evidence;
- rows: visible UI action ID and locale, route, BFF/Nest contract, access/flag prerequisites, read/write/worker boundary, CI/Test/Prod evidence, observed failures, earliest failing hop, incident/issue link;
- details: source file + line/commit, generated contract diff, recent error category (redacted), trace sample, assigned team, last user-safe fallback, test/rollback instruction;
- bulk export in safe schema only; secrets, raw SQL, tokens, full user records must not appear;
- privileged role + CSRF + step-up for any eventual mutating incident-control action; v1 read-only except links to existing audited controls.

## 4. Canonical two-axis state model

**Axis A — engineering lifecycle (internal):** `PLANNING | BLOCKED | IMPLEMENTED | TEST_VERIFIED | PRODUCTION_VERIFIED`; exact release SHA required for the latter two.

**Axis B — observed availability (per deployment, route/action and audience, time-scoped):**
- `AVAILABLE`: verified authorized read/operation evidence within freshness window, no open blocking incident;
- `DEGRADED`: meaningful partial failures/latency with supported safe fallback;
- `MAINTENANCE`: explicitly scheduled policy shutdown with confirmed window and user disposition;
- `UNAVAILABLE`: verified outage or intentionally blocked capability, with reason subtype;
- `UNKNOWN`: missing evidence, mismatched runtime SHA, expired sample, monitor failure, low sample, or unmapped action.

A `PRODUCTION_VERIFIED` source lifecycle does not imply this minute's `AVAILABLE`. An `enabled` flag, HTTP 200 health, mere route compilation, cached badge or default 100.0% can never override `UNKNOWN/UNAVAILABLE`. Safety/authorization veto takes precedence over any scoring. Do not reveal `UNKNOWN` to members with frightening jargon; show “We cannot confirm availability right now” only where action needs it.

**Axis C — individual user eligibility:** `ELIGIBLE | LOGIN_REQUIRED | CONSENT_REQUIRED | ROLE_RESTRICTED | AGE_OR_LEGAL_RESTRICTED | POLICY_DISABLED | UNKNOWN`. This is derived by server policy, not inferred from UI; do not disclose why another user's entitlement differs. `AVAILABLE` + `ROLE_RESTRICTED` means “not available to this viewer”, not global downtime.

**Axis D — mutation outcome:** `NOT_SENT | VALIDATION_REJECTED | SUBMITTED | PENDING | CONFIRMED | REJECTED | OUTCOME_UNKNOWN`. Only server/ledger/read-after-write determines `CONFIRMED`.

**Priority:** known hard veto / unauthorized / unsafe monetary action → blocked; unknown financial outcome → verify, not retry; stale observation → unknown; only then positive enablement. Do not mark planned/unimplemented controls “soon” absent explicit public release approval.

## 5. Concrete Korean/English customer copy (editable prototypes)

| Situation | Korean | English | Safe action |
|---|---|---|---|
| Guest action | 로그인하면 이 기능을 이용할 수 있어요. 로그인 후 이 화면으로 돌아옵니다. | Sign in to use this feature. We'll bring you back here. | Sign in / public alternative |
| Feature not built | 현재 제공하지 않는 기능입니다. 이용 가능한 다른 기능을 확인해 주세요. | This feature isn't available yet. Try another available activity. | Back to list; no dead CTA |
| Not entitled | 현재 계정에서는 이용할 수 없습니다. 필요한 조건을 확인해 주세요. | This account cannot use this feature. Check the requirements. | Requirements |
| Transient read error | 지금 정보를 불러오지 못했어요. 입력한 내용은 유지됩니다. | We couldn't load this information. Your input is still here. | Retry read |
| Economy unknown | 요청 처리 결과를 아직 확인하지 못했습니다. 중복으로 요청하지 말고 거래 내역을 확인해 주세요. | We can't confirm the result yet. Please check activity before trying again. | Check status / receipt |
| Verified rejected | 요청이 처리되지 않았습니다. 사유를 확인하고 다시 시도할 수 있습니다. | The request was not processed. Review the reason before trying again. | Correct / retry if safe |
| Verified completed | 처리되었습니다. 거래 내역에서 확인할 수 있습니다. | Completed. You can review the record in Activity. | Open authoritative receipt |
| Planned maintenance | 현재 이 기능은 점검 중입니다. 진행 중인 요청은 확인 화면에서 조회할 수 있습니다. | This feature is under maintenance. Check the status of any pending request. | View status |

Copy is provisional: translation editor, actual user interviews and policy/legal review required. Do not promise draft preservation, return URLs or receipt lookup until implemented and tested. Surface the traceable public incident only when disclosure is approved.

## 6. Registry schema and API design (proposal, no implementation)

Build deterministic **inventory manifest** from source-route inventory, JSX action references, Next BFF route handlers/server actions, Nest Swagger/OpenAPI, worker catalog, feature-switch catalog and DB-authorized function declarations. Some relationships (button→action, action→worker, DB read/write ownership) require **manually reviewed manifest entries** and a validated helper; do not falsely claim full static discovery possible for dynamic JS dispatch. Diff against generated route inventory; no regex-only “proof”.

Minimum internal registry row:

```json
{
  "actionId": "stocks.order.submit",
  "domain": "stocks",
  "sourceSha": "<candidate git SHA>",
  "surface": {"client": "web", "routeId": "/stocks/[symbol]", "component": "OrderForm"},
  "transport": {"bff": "POST /api/stocks/orders", "backend": "POST /api/v1/stocks/orders"},
  "execution": {"owner": "stocks", "boundary": "SECURITY_DEFINER", "effect": "VIRTUAL_WLD_MUTATION"},
  "policy": {"auth": "MEMBER", "featureSwitch": "stock_corporate_action", "reviewed": false},
  "lifecycle": "IMPLEMENTED",
  "observed": {"environment": "test", "availability": "UNKNOWN", "evidenceAt": null, "sampleSize": 0},
  "acceptance": {"contract": false, "authNegative": false, "idempotency": false, "e2e": false}
}
```

Example paths/data **illustrate a schema only**; never assume endpoint/policy names above really correspond. No persistent new table until DB ownership, retention and privilege reviews; v1 manifest may be build artifact + dedicated read-only safe projections.

**Internal authenticated admin read-only APIs (candidate paths, confirm routing convention):**
- `GET /api/v1/admin/feature-reality/summary?sourceSha&environment`: source identity; mapped/unmapped counts; state and evidence coverage.
- `GET /api/v1/admin/feature-reality/actions?domain&status&cursor&limit`: safe paginated rows, versioned ETags; no user payload.
- `GET /api/v1/admin/feature-reality/actions/:actionId`: redacted evidence, named owner, linked CI/test/incident; not bare SQL or secrets.
- `GET /api/v1/admin/feature-reality/incidents`: redacted user-impact severity/last confirmed time.
- Existing status endpoints must retire misleading numerical defaults, not run in parallel as a “green” source.

**Member eligibility read model (optional after data minimization):** `GET /api/v1/features/availability?ids=...`, authenticated where personalized; allowlisted public generic statuses separate; bounded ≤20 action IDs/request, short cache with viewer/role separation, `Cache-Control: private, no-store` for personalized eligibility. Proposed sample response:

```json
{
  "sourceSha": "<running deployment SHA or null>",
  "checkedAt": "ISO-8601",
  "freshUntil": "ISO-8601",
  "items": [{
    "actionId": "wallet.transfer",
    "availability": "UNKNOWN",
    "eligibility": "ELIGIBLE",
    "reasonCode": "EVIDENCE_STALE",
    "nextSafeAction": "CHECK_STATUS"
  }]
}
```

A registry status response **MUST NOT** be treated as authorization to execute; each business endpoint enforces its own user/role/ownership/step-up checks and idempotent server-side state machine. Status is for UX only. Avoid GET actions that mutate. Empty, inaccessible and stale data fail closed. HTTP fault contract may use **RFC 9457** `application/problem+json` with `type/title/status/detail/instance`, correlation ID and stable app reason; redact internals. Existing API response patterns require backward-compatible adaptation. 429 means throttling, 503 temporary unavailable with `Retry-After` only when reasonable, not every business-rule rejection.

## 7. Telemetry, trust and rollout rules

- Gather **synthetic safe read probes** and real-user aggregate success/latency. For mutations use test-environment fixtures and safe receipt-status checks; never issue real transactions solely as a monitoring probe.
- Propagate redacted request/trace correlation across Next BFF → Nest → permitted DB function or worker. OpenTelemetry HTTP semconv fields; **no raw account ID, token, password, amount, private chat payload or secrets in public events**.
- Counters `action_attempt_total`, `action_confirmed_total`, `action_rejected_total`, `action_unknown_total`; histograms for observed service/receipt confirmation latency; `route_mapping_coverage`, `stale_evidence_age`, and `unmapped_visible_action_count`. Limit metric labels to stable action ID, environment, outcome, locale bucket and client; no high-cardinality URLs, user IDs or UUID labels.
- Define measured numerator/denominator, sample windows, missing-data behavior and exact source SHA. **0 samples ⇒ UNKNOWN, not 100%.** Retain evidence/ticket links with privacy/retention schedule under existing ops control.
- Illustrative design thresholds, **not observed SLAs**: freshness default ≤60 s for aggregate availability, exact mutation outcome by receipt lookup on demand; alert after ≥5 confirmed failures in 5 min with ≥20 eligible attempts for a critical action, with fallbacks for low volume via safe synthetic reads; page on any proven false monetary success independently of sample count. These thresholds require baseline tuning and support capacity validation.
- Admin sees current tested/prod SHA side by side and exact Test gate. If release pointer or backend version is `unknown`/mismatched, state is `UNKNOWN`; no unconditional green.
- Minimal user-facing advisory API never includes privileged registry internals. Rate-limit failure-report submissions, dedupe by incident, security review user uploads, require consent and avoid public support screenshots with balances.

## 8. Acceptance matrix and implementation sequence

| Stage | Deliverable | Mandatory acceptance / fail condition |
|---|---|---|
| D0 Inventory/reality audit | exact-main route inventory + UI-action-to-API manifest and gap ledger | all published click targets inventoried; unknown links flagged, no green defaults |
| D1 Engineering source truth | safe manifest generator, schema verifier, runtime SHA evidence | deterministic build diff; static vs measured clearly separated; missing mapping fails CI for new critical CTA |
| D2 Member interaction | per-action availability/read-only prerequisites and outcome UI | 8 customer-copy states, responsive+assistive tech, no unauthorized leak, input preserved only when true |
| D3 Secure result confirmation | idempotency/receipt semantics for existing transaction APIs | lost-response-after-commit scenario returns `OUTCOME_UNKNOWN` until authoritative receipt; no duplicate WLD |
| D4 Operations | extend `/admin/api-health` with filterable status/incident/evidence | source-accurate measured metrics; poll failure stales; admin-only negative auth+CSRF, no fake 100% |
| D5 Test | real DB/worker Test, all-role and full route five passes on exact SHA | 320–430px, tablet/desktop, keyboard/screen reader, 200/400% reflow, 404/401/403/409/429/5xx/timeout and DB crash; no live side effects |
| D6 Release | CI, exact-SHA isolated Test, ledger & DB ACL, session continuity and rollback | no Production if legacy v530/v523/G675 P0 gates remain; source-identity mismatch forces stop |

Test fixtures must include guest, auth member, restricted, admin, owner/nonowner, switch off, real endpoint absent, backend down, stale metric, 503/429 retry, malformed ID, offline, duplicate click, concurrent submission, post-commit response loss, full-width Korean/English, large amount JSON and screen-reader status. Negative security assertions prove user A cannot enumerate user B's eligibility/action evidence, and that status GET cannot change money or bypass controls.

Success criteria: **100% new high-risk published CTAs mapped to vetted contracts**, **zero counterfeit measured-health values**, **zero client-only success for server writes**, and **all unknown monetary outcomes resolve by an authoritative status read or remain truthfully unknown**. Any numeric conversion, retention or latency improvement is unproven until a baseline exists.

Existing P0 release blocks (DB/ledger privilege drift, authenticated UI v530 and exact-SHA Test/Production mismatch) remain. This spec authorizes documentation and future independently reviewed implementation plans only. No API/DB change or Production readiness is certified by v677.

## 9. External research and adoption logic (checked 2026-10-15)

| ID | Reference / first party | Specific adopted pattern | Rejected overreach |
|---|---|---|---|
| R677-01 | [GOV.UK learning user needs](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs) | tasks/needs over feature checklists, research hypothesis vs findings | no claimed interviews |
| R677-02 | [GOV.UK error message](https://design-system.service.gov.uk/components/error-message/) | clear recovery copy; preserve user input | do not blame users for server errors |
| R677-03 | [GOV.UK service problem](https://design-system.service.gov.uk/patterns/problem-with-the-service-pages/) | explicitly explain failed service and draft disposition | no fabricated save guarantee |
| R677-04 | [GOV.UK unavailable service](https://design-system.service.gov.uk/patterns/service-unavailable-pages/) | intentional maintenance ≠ unexpected outage | no fabricated repair ETA |
| R677-05 | [NN/g Error-Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/) | visible, understandable, actionable local recovery | no generic “error occurred” |
| R677-06 | [Atlassian Statuspage concepts](https://support.atlassian.com/statuspage/docs/what-is-statuspage/) | status by affected component and lifecycle | monitoring badge cannot replace end-to-end probes |
| R677-07 | [IETF RFC 9457](https://datatracker.ietf.org/doc/rfc9457/) | machine-readable HTTP problem details | not all business errors become 500 |
| R677-08 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | 4.1.3 announcements, 3.3.1/error labels, 2.5.8 targets, 2.4 focus | colors alone insufficient |
| R677-09 | [OpenAPI v3.2](https://spec.openapis.org/oas/v3.2.0.html) | authoritative API contract diff/method/path/schema | file presence ≠ live function |
| R677-10 | [OpenTelemetry HTTP metrics](https://opentelemetry.io/docs/specs/semconv/http/http-metrics/) | duration/response class and stable semantic attributes | avoid high-cardinality and privacy leaks |
| R677-11 | [Google SRE monitoring](https://sre.google/sre-book/monitoring-distributed-systems/) | distinguish user symptom from root cause, blackbox + whitebox | no static green score |
| R677-12 | [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests) | preventing double execution after retries (design analogy) | never assume Stripe's exact retention policy applies to WLD |
| R677-13 | [MDN 503 semantics](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503) | use temporary unavailability/Retry-After correctly | rate-limited users require 429 |

Evidence classes: **SOURCE_OBSERVED** = code excerpt from reviewed SHA; **EXTERNAL_STANDARD** = linked publisher guidance; **HYPOTHESIS** = proposed user need/threshold; **LIVE_VERIFIED** = requires separately captured exact-SHA runtime proof. No traffic/user interview metrics or production feature correctness were newly verified by v677.

See [planning delta](deltas/v2026.10.15.677.md), [worklog](../worklog/2026-10-15-feature-truth-ux-v677.md), and [GitHub/internal updates](../updates/v2026.10.15.677-github.md).
