# Woldeok Moneyverse — Integrated Full Planning Re-review v2026.09.24.435

**English canonical** | [한국어](INTEGRATED_FULL_REVIEW_V435.ko.md)

> Status: PLANNING / current full re-review authority
> Date: 2026-09-24
> Branch: `docs/full-planning-rereview-v2026.09.24.435`
> Start main: `d058df3d29191e48c5ab9b12ec10014d015b5812`
> Runtime claim: none; planning/documentation only

## Review method
- Structurally scanned all 1,525 Markdown documents currently under `docs/` (1,540 files total).
- Deep-read the authority chain: documentation policy, PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, prior v402 review, current deltas/specifications, runtime baseline, update/changelog/worklog evidence, and source areas implicated by open gaps.
- Planning EN/KO pair audit found 0 missing Korean counterparts under `docs/planning/`.
- Historical records remain evidence and are not rewritten as current truth.

## Superseding findings

### G435-01 — P0 paid-work settlement drift
Current `main` still exposes `POST /api/v1/work/tasks/:id/complete` as an immediate paid-completion path. Commit `547399ce` attempted to disable it and force assignment -> minimum duration -> submit -> verify, but `d058df3d29191e48c5ab9b12ec10014d015b5812` immediately reverted that enforcement. Therefore v433 paid-work pacing is **PLANNED, NOT IMPLEMENTED** on current main.

Required contract: ordinary participation/repetition may remain available, but a client click alone cannot create immediately spendable WLD. Reward-bearing work requires a server-authoritative elapsed-time/completion boundary, idempotent settlement, concurrency-safe ledger mutation, replay-safe receipt identity, and exact-candidate Test evidence.

### G435-02 — P0/P1 work/economy wording conflict
Older planning mixes finite runtime daily limits with `null = unlimited` language. This must not imply unlimited paid issuance.

Superseding rule: unlimited means **participation/progression availability**, not unlimited instantaneous WLD issuance. Paid issuance remains subject to authoritative task duration, policy budget/cap/decay, anti-automation controls, and economy telemetry. If play continues after a reward budget is exhausted, only explicitly designed non-monetary progression may continue.

### G435-03 — P1 API inventory drift
This baseline contains **58 controller files and 370 raw HTTP method decorators**. Maintained documents still contain 57/335/361 historical counts. Raw decorators are not an authoritative endpoint count because routing/versioning/composition can change semantics.

Required contract: generated OpenAPI/route introspection is the count authority. Every release candidate must produce a semantic API inventory diff covering method/path, auth/role/CSRF, request/response schema, idempotency, pagination/resource limits, deprecation, mobile availability, and owning feature.

### G435-04 — P1 full-review authority drift
`INDEX.md` still points to v402 as the current full re-review while planning advanced through v433. This v435 document supersedes v402 as the current full-review entry point; v402 remains historical evidence.

### G435-05 — P1 stale-control language containment
Repository-wide scan still finds references to retired admin TOTP/`SecondFactorGuard`, 44px described as if it were the WCAG AA normative minimum, and obsolete direct-to-main documentation wording.

Current maintained specs must use active controls (`AdminSessionGuard`, risk-based recent reauthentication/step-up, browser-mutation CSRF, server authorization, append-only audit), state WCAG 2.2 SC 2.5.8 as 24x24 CSS px minimum with exceptions, and retain Moneyverse >=44x44 only as a stronger product target. Historical documents may retain original wording but must not be used as current acceptance criteria.

### G435-06 — P1 web/mobile cross-repository parity
App `main` alone is insufficient proof that current web/backend contracts are consumed end-to-end by Android/app code. Active app work exists on later feature branches.

Required contract: maintain a generated cross-repo parity matrix with feature, web route, backend endpoint, app screen/client call, auth/session behavior, schema version, negative-path coverage, and exact tested SHAs. App parity is incomplete until the app consumes the authoritative backend contract or an explicit versioned compatibility contract.

### G435-07 — P1 runtime/release evidence freshness
Planning, implementation, and release history move independently. Release/update records prove what was verified at that time, not current Production identity.

Every current-status claim must resolve to exact active frontend/backend runtime identity, Git SHA, DB migration state, session-continuity evidence, health checks, and rollback target. Documentation-only versions do not change runtime identity.

### G435-08 — P1 public/API disclosure boundary
User-facing feature pages may explain behavior and public capabilities, but must not expose internal admin-only endpoint inventories, secrets, signing details, privileged procedure names, or attack-enabling operational metadata. Detailed API documentation belongs in GitHub/developer documentation with explicit auth/authorization boundaries.

## Twelve-lane review status
| Lane | Current status | Next acceptance evidence |
|---|---|---|
| Identity/auth/session | PARTIAL | exact-SHA restart/cutover continuity, revocation, recent-auth, negative authorization |
| Economy/ledger/treasury | PARTIAL + P0 | remove instant paid-work bypass; atomic/replay-safe settlement; source/sink/velocity telemetry |
| Stocks/market/casino | PARTIAL | generated contract diff, manipulation/settlement concurrency, halt/refund tests |
| Inventory/marketplace/business | PARTIAL | escrow/idempotency/ownership authorization and real-DB reconciliation |
| Community/chat/moderation | PARTIAL | BOLA/IDOR, cursor/idempotency, retention/moderation and abuse controls |
| Public content/SEO | PARTIAL | public/private boundary, canonical/noindex/hreflang, truthful runtime content |
| Native app/API | PARTIAL | cross-repo generated parity matrix and exact app+backend E2E |
| UI/responsive/accessibility | PARTIAL | 320px+ viewport matrix, keyboard/screen-reader, target-size semantics, contrast |
| AI/automation/governance | PARTIAL | full AI re-audit, bounded policy changes, provenance, rollback, human override |
| Data/backup/DR | PARTIAL | restore rehearsal, RPO/RTO, backup encryption/retention, DB authority proof |
| Release/branch/runtime lineage | PARTIAL | isolated Test exact SHA, zero-downtime/session continuity, Production identity |
| Analytics/monetization/compliance | PARTIAL | consent/age/platform-policy gates, event schema, experiment guardrails, privacy |

## Ordered implementation priority
1. **P0-1:** close G435-01 paid-work bypass before economy tuning that assumes paced issuance.
2. **P0-2:** generate authoritative semantic API inventory and remove count-based completion claims.
3. **P0-3:** run exact-SHA auth/session, ledger/idempotency, authorization, and real-DB regression gates.
4. **P1-1:** reconcile maintained current specs with active security/accessibility/documentation wording.
5. **P1-2:** publish the web/backend/app parity matrix and classify every user/admin feature as IMPLEMENTED, PARTIAL, BLOCKED, or PLANNED.
6. **P1-3:** refresh runtime identity and release-lineage evidence before calling newer planning/implementation Production-verified.
7. **P2:** consolidate legacy/duplicate historical docs only with compatibility stubs and inbound-link-safe migration.

## Scope truth
v435 changes planning/documentation authority only. It does not claim the paid-work gap is fixed, does not claim raw 370 decorators are the semantic endpoint count, and does not claim a new Test or Production deployment.
