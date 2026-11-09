# Treasury & Social Insurance — New / Changed Plan Register and Comparison Index
> **Initiative:** 2026-11-10 to 2026-11-11 06:00 Asia/Seoul
> **Register version:** vTSI.2026.11.10.004 · **Status:** DRAFT / DOCS ONLY
> **Existing baseline:** [Frozen baseline](TREASURY_SOCIAL_INSURANCE_20261110_BASELINE.md) · [한국어](TREASURY_SOCIAL_INSURANCE_20261110_CHANGE_REGISTER.ko.md)
> **Authority:** current [PROJECT_PLAN.md](PROJECT_PLAN.md) and [INTEGRATED_PLANNING_MASTER.md](INTEGRATED_PLANNING_MASTER.md), not this tracking document.

## Executive diff — initial state
| Category | Count | Meaning |
|---|---:|---|
| ADD (newly specified features) | 1 | One new proposal, not implemented |
| MODIFY (changes to existing plans) | 2 | Historical QA-linked reconciliation amendment |
| REMOVE (withdrawn ideas) | 0 | No withdrawals recorded |
| DEFER (proposals postponed) | 0 | No deferred entries recorded |
| INTEGRATED into canonical plan | 0 | No incorporation or PR merge claimed |

This register starts as a **tracking scaffold**, not a claim that no plans existed. It is not evidence of code delivery, Test QA, Production deployment or a new insurance service.

## Comparison index (append on every actual planning cycle)
| ID | Cycle A QA-fix / B New | Type | Existing document & section / immutable link | Previously planned behavior | Newly planned behavior / proposal link | Version / KST | Priority | State | Canonical integration PR |
|---|---|---|---|---|---|---|---|---|---|
| TSI-20261110-001 | A QA-fix | MODIFY | [PROJECT_PLAN.md at baseline](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/PROJECT_PLAN.md) — FIN1518-03 | Treasury 552 unlinked, MINT/SWF provenance and divergent exploratory vs canonical balance probes unresolved | Propose read-only reconciliation evidence contract, deterministic snapshot and quarantine gate (details below) | vTSI.2026.11.10.004 / 01:05 | P0 | PROPOSED / canonical pending | PR #3006 tracking only |

| TSI-20261110-003 | A QA-fix | MODIFY | Baseline PROJECT_PLAN.md OPS1518-01/REL1518-04/FIN1518-03 at main edd709bc | Release SHA and Treasury source unverified | Immutable runtime-to-ledger provenance gate | v2012 / 03:05 | P0 | PROPOSED / canonical pending | PR #3006 |
| TSI-20261110-002 | B New | ADD | [NPS baseline](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/NATIONAL_PENSION_SERVICE_SPEC.md) / baseline row 9 | Pension concept exists; no verified cross-fund eligibility event bridge | Propose cross-fund eligibility change inbox with evidence-only preview, no automatic collection (below) | vTSI.2026.11.10.004 / 02:05 | P1 | PROPOSED / canonical pending | PR #3006 tracking only |

### TSI-20261110-001 — Treasury reconciliation evidence gate (QA-linked amendment)
- **First recorded:** 2026-11-10 01:05 KST; **cycle:** A / Feature Improvement; **version:** v2008 + vTSI.2026.11.10.004; **owner:** planning, implementation owner unassigned; **status:** PROPOSED, not integrated or implemented.
- **Before / immutable source:** main `edd709bcbe96f6f5ceca8372f244b632e8211242`, `PROJECT_PLAN.md` FIN1518-03 and QA v1394 summary. Existing P0 flags 552 Treasury-unlinked records, MINT/SWF source uncertainty, 24 exploratory vs 0 canonical mismatches. Those are **historical QA assertions**, not fresh independently reproduced defects; live production impact UNKNOWN.
- **Change / why:** turn ambiguous aggregate failures into a reproducible, read-only reconciliation workflow; do not auto-adjust balances, mint WLD or treat different query scopes as fraud. Priority P0 because erroneous settlement may affect virtual balances. No new financial feature claimed.
- **Reproduction evidence required:** environment (production/test/dev), immutable frontend/backend/DB migration SHA, SQL/query revision, tenant and account cohort, transaction cut-off, isolation level and single snapshot identifier; expected: identical opening + signed postings = closing balance and central/subledger totals; actual: QA summary reports 552 unlinked and 24-vs-0 probe divergence, with no shared snapshot proof. Root cause **UNVERIFIED**.
- **User/admin UX:** normal wallet read remains unchanged; restricted Treasury > Reconciliation console shows run id, scope, cutoff, source proof, `PENDING / MATCHED / DISCREPANCY / INCONCLUSIVE / BLOCKED`, export redacted evidence, CTA `Re-run same snapshot` (only if snapshot retained), `Escalate`. No manual credit/debit CTA; no public indexable route; keyboard and 320px layouts.
- **Internal API proposal (not implemented):** `POST /internal/treasury/reconciliation-runs` with `scope,cutoff,queryVersion,idempotencyKey` -> 202 `runId,status`; `GET /internal/treasury/reconciliation-runs/:id` -> counts, proof hashes, provenance status and pagination; `POST /internal/treasury/reconciliation-runs/:id/escalate` -> audit event. Service RBAC `treasury.reconcile.read` / `treasury.reconcile.escalate`, independent approver, MFA; 403/409/422/429/503 fail closed. No user PII in exports.
- **DB proposal:** append-only `treasury_reconciliation_runs` and `treasury_reconciliation_findings`, tenant-qualified FK, unique(tenant_id,idempotency_key), unique(tenant_id,run_id,source_entry_id,finding_type), index(tenant_id,status,created_at), CHECK nonnegative counts, integer WLD units, immutable source hashes, FORCE RLS; migration additive/backfillable and reversible by feature-off (retain audit rows). Read-only REPEATABLE READ snapshot, canonical central/subledger join, deterministic row ordering; Outbox for audit alerts, fenced worker lease and bounded retries.
- **Security / alert noise:** mask identities, no raw financial exports, rate limits and two-person escalation; distinguish `UNLINKED` from `BALANCE_MISMATCH`; alert only on repeatable same-snapshot mismatch, preserve first-observed evidence and suppress duplicates by fingerprint.
- **Acceptance:** same snapshot + same SQL version yields deterministic counts; reproduce or invalidate 552 and 24/0 under identical scope; zero mutation of production balances; injected partial timeout cannot mark MATCHED; 2 concurrent idempotent requests create one run; tenant isolation, RLS, rollback, a11y and redaction tests pass in isolated PostgreSQL. Independent QA and exact-SHA Test required before rollout. Current test status **NOT RUN**.
- **P0:** FIN1518-03 provenance and snapshot proof, production executable SHA/restore and DB ACL gates remain blocked. **P1:** API/UI reconciliation read model and synthetic concurrency tests. **P2:** trend KPI (inconclusive rate, repeat discrepancy rate, median triage time) after evidence approval.
- **Cross-team:** no runtime edits; Dev B owns future DB/API proposal, Dev C future admin UX, QA evidence reproduction, Dev A integration; coordinate via separate implementation PR. English/Korean register only; canonical integration pending.

### TSI-20261110-002 — Cross-fund eligibility change evidence inbox (NEW; B)
- **First recorded:** 2026-11-10 02:05 KST; v2010 / vTSI.2026.11.10.004; ADD; P1; planning owner, Dev B/C and QA unassigned; **PROPOSED**, canonical NOT integrated. Previous B v2006 → A v2008 → current B v2010 → next A v2012.
- **Baseline/before:** frozen baseline row 9 references `docs/NATIONAL_PENSION_SERVICE_SPEC.md` at main `edd709bcbe96f6f5ceca8372f244b632e8211242`; retirement/social-security mechanics are proposed, but a cross-fund eligibility evidence inbox is not established by this source. Health insurance implementation and live QA remain **UNVERIFIED**. This is a game-world virtual-economy proposal, not a claim about Korean statutory eligibility or real contribution rates.
- **Purpose/acceptance:** allow a member or authorized employer to submit a change in virtual eligibility (join, exit, income-band or employer link) and let independent insurance administrators verify source evidence before separate health/pension modules compute future charges. Never mutate ledger, grant benefits, or issue refunds on intake.
- **UX:** member Insurance > Eligibility > 'Report change' CTA; employer scoped employee roster > 'Submit change'; admin Insurance > Evidence inbox > 'Compare source', 'Request correction', 'Approve effective date', 'Reject'. States `DRAFT → SUBMITTED → EVIDENCE_PENDING → IN_REVIEW → ACCEPTED/REJECTED`, plus `WITHDRAWN`, `EXPIRED`, `BLOCKED`. Show virtual effective date, source authority, and downstream pending impact, not a promised real-world rate. 320px responsive, keyboard focus/labels and WCAG 2.2 AA; private pages noindex/no-store.
- **API (proposed, not implemented):** `POST /api/insurance/eligibility-changes` {fundScope,changeType,effectiveAt,sourceRef,idempotencyKey}; `GET /api/insurance/eligibility-changes/:id`; `POST /internal/insurance/eligibility-changes/:id/decision` {decision,reason,expectedRevision,nonce}. Member owns submission, employer only current authorized employment scope; independent `insurance.eligibility.review` RBAC + fresh MFA for decisions. 403/404/409/412/422/429/503 fail closed; no public bulk lookup.
- **DB:** `insurance_eligibility_change_requests` (tenant_id,request_id PK composite, subject_id, fund_scope, change_type, effective_at, status, revision, source_digest, actor_id, created_at); `insurance_eligibility_change_events` immutable tenant-scoped FK and unique event id. Unique(tenant_id,actor_id,idempotency_key); indexes (tenant_id,subject_id,created_at) and (tenant_id,status,effective_at); CHECK valid transitions and nonempty source digest, FORCE RLS, least privilege. Additive migration and backfill preview only; no invented statutory rate table.
- **Consistency/security:** SERIALIZABLE or ordered row locks for decision, compare-and-swap revision, immutable decision audit and transactional outbox; downstream modules consume one event id once, re-evaluate eligibility at charge time and never retroactively debit without separately approved adjustment. Separate identity/medical evidence access, encrypted restricted attachments, retention policy and audit export redaction; dual-control for sensitive overrides; bound retries, dead-letter escalation and deduplicated alerts.
- **Testing/rollout:** unit state-machine/RBAC; PostgreSQL tenant isolation, duplicate POST, conflicting effective dates, concurrent reviewer CAS, outbox failure, clock boundary, evidence expiry; API contract, mobile/a11y and E2E submission→independent review→event (no debit). Acceptance: exactly one accepted event per idempotent decision, zero balance changes, revoked reviewer cannot approve, unavailable source never auto-accepts. Feature flag `insurance_eligibility_evidence_inbox_v1` OFF; Test exact-SHA, QA/security review, canary, monitoring and flag rollback (retain append-only evidence) before production.
- **Backlog:** P0 independent treasury provenance and production release/restore gates remain; P1 verify existing NPS/health code/contracts, implement inbox schema/API/UI separately, QA evidence; P2 dashboard median review time, duplicate submission ratio and delayed decision rate after privacy review. No 10,000 independent external references validated this cycle (0 new, cumulative UNKNOWN/10,000; BLOCKED/IN PROGRESS). No production or QA tests run.

## Required detailed entry template
```md
### TSI-20261110-001 — Feature title
- Timestamp (KST), cycle A/B, sequence version, author/workstream:
- Status: PROPOSED | REVIEWED | INTEGRATED | IMPLEMENTED | VERIFIED | BLOCKED
- Type: ADD | MODIFY | REMOVE | DEFER
- Scope, P0/P1/P2, current behavior and source (main commit + exact path/section):
- QA evidence (URL/role/repro/request/status) or reason for a net-new feature:
- Existing plan / before:
- Proposed plan / after: user entry point, screens/states/CTA, administrator flows:
- API (auth, request/response, errors), DB constraints/migrations, access boundary:
- Ledger / WLD supply / idempotency / reconciliation / privacy / audit:
- Test plan and precise acceptance/rollback gates:
- Link to exact English/Korean canonical section, worklog, PR/commit:
- Verification truth: DOCS ONLY unless run evidence exists:
```

## Hourly log (append-only)
| Cycle KST | A/B | Plan version | Baseline SHA rechecked | New / modified / removed / deferred IDs | Main change detected | PR / evidence | Outcome |
|---|---|---|---|---|---|---|---|
| 2026-11-10, initialization | Setup, not an A/B cycle | vTSI.2026.11.10.001 | `edd709bcbe96f6f5ceca8372f244b632e8211242` | 0 / 0 / 0 / 0 | Not claimed | Draft branch and pending PR | Baseline index and change register scaffold only |

| 2026-11-10 01:05 | A QA-based improvement (previous B v2006, next B v2010) | v2008 / vTSI.2026.11.10.004 | `edd709bcbe96f6f5ceca8372f244b632e8211242` | 0 / 1 / 0 / 0 | no change at start | PR #3006 / QA v1394 historical summary | PROPOSED; QA not rerun; canonical pending |

| 2026-11-10 02:05 | B new addition (previous A v2008, next A v2012) | v2010 / vTSI.2026.11.10.004 | `edd709bcbe96f6f5ceca8372f244b632e8211242` | 1 / 0 / 0 / 0 | no change at mid-run | PR #3006; baseline NPS row 9 | PROPOSED; QA not rerun; canonical pending |

## Closeout 2026-11-11 05:05 KST (fill using executed results only)
- Baseline corrections:
- Added feature IDs:
- Changed feature IDs:
- Removed/deferred feature IDs:
- Canonical plan integrated / PR pending / blocked:
- QA deficiencies addressed by planning vs issues still open:
- Cross-team review (Gemini, Dev A/B/C, QA):
- Final plan version, documents, PRs, remaining risks:

## Editing and governance
Preserve this register's past entries when refreshing main. Append new IDs; correct errors through a visible correction row. Keep English/Korean semantically equivalent. Each cycle compares old source first, distinguishes historical features from genuine additions, and does not change production code or money. New proposals require review and then canonical plan integration; DRAFT is not approval.
### TSI-20261110-003 — Treasury release-to-ledger provenance gate
- **Recorded:** 2026-11-10 03:05 KST / A Feature Improvement / v2012 / vTSI.004 / MODIFY / P0 / planning owner, implementation/QA owners unassigned / PROPOSED.
- **Before:** Baseline PROJECT_PLAN.md OPS1518-01, REL1518-04, FIN1518-03 require exact-SHA release, restoration and Treasury provenance but lack a single operator evidence handoff linking actual Nginx process, database migrations and immutable ledger source.
- **QA evidence:** miniPC QA report 2026-11-10 02:16 KST: Production and Test HTTP 200, both /api/version=a13a18cd70709a6f4df320d4d76ea834baae2331 versus main edd709bcbe96f6f5ceca8372f244b632e8211242; legacy backend 192310 restarts, browser E2E BLOCKED. /srv/moneyverse symlink target absent on miniPC. Neither outage nor ledger corruption proven. Root cause and active executable mapping UNVERIFIED. PR #3007 separately proposes Treasury mint/SWF runtime changes; no overlap.
- **Reproduction:** collect timestamp/host/health/version, Nginx upstream PID/cwd/executable SHA, release manifest, migration checksums, read-only double-entry Treasury source hashes and isolated Test exact-SHA under one run ID. Expected approved immutable runtime/DB/ledger provenance; observed version difference and broken symlink only, active process mapping not yet established.
- **Admin UX:** Treasury > Release & Ledger Evidence, UNVERIFIED/INCONCLUSIVE/MATCHED/BLOCKED, read-only Capture Evidence, Compare Test SHA, Escalate CTAs; never Force Reconcile or Mint. 320px, keyboard, WCAG 2.2 AA, private noindex/no-store.
- **API (proposed, not implemented):** POST /internal/treasury/provenance-runs (expectedSha,migrationSet,scope,idempotencyKey) → 202 runId; GET /internal/treasury/provenance-runs/:id → hashes, evidence, status; POST /internal/treasury/provenance-runs/:id/escalate → audit ID. Service-only capture, treasury.provenance.read/escalate RBAC, MFA, 401/403/409/422/429/503, rate limiting.
- **DB proposal:** append-only treasury_release_provenance_runs/events, tenant-qualified PK/FK, unique(tenant_id,idempotency_key), index(tenant_id,status,created_at), SHA256/status CHECK, FORCE RLS, transactional audit outbox and worker fencing. Read-only REPEATABLE READ snapshot compares central/subledger and receipt source, integer WLD, separate missing evidence from mismatch; no financial writes.
- **Security/deploy:** default-OFF admin_treasury_release_provenance_v1; UNKNOWN fails closed in newly gated approval workflow, no retroactive changes; two-person escalation, deduplicated hashed alerts, redacted audit, additive migration and feature-OFF rollback retaining evidence. No production edits.
- **Acceptance (NOT RUN):** isolated Test exact-SHA and independent restore; prove PID→executable SHA, migrations and Treasury source; test broken symlink, timeout, idempotency, tenant isolation, concurrency, read-only invariance and safe-account E2E. P0 release/settlement HOLD, P1 API/DB/admin UI, P2 false-alert and evidence latency KPI. Independent QA required. Canonical integration pending, PR #3006 tracking only.
- **Coordination:** QA reproduction, Dev A runtime provenance, Dev B API/DB, Dev C admin UX proposed; do not touch PR #3007–3009 runtime work.

### Cycle log / 03:05 KST
Previous B v2010 → Current A v2012 → Next B v2014. ADD 1 / MODIFY 2 / REMOVE 0 / DEFER 0 / INTEGRATED 0. QA/E2E unverified.

### TSI-20261110-004 — Virtual insurance benefit claims and independent adjudication (ADD; B v2014)
- Recorded 2026-11-10 04:05 KST; vTSI.2026.11.10.005; P1; PROPOSED; previous A v2012, current B v2014, next A v2016. Planning owner; Dev B/C and QA implementation assignment pending.
- Before: frozen baseline social-insurance/NPS entry and main PROJECT_PLAN.md at edd709bcbe96f6f5ceca8372f244b632e8211242. TSI-002 covers eligibility evidence, not benefit claims. Current production implementation and E2E UNVERIFIED. This is a game virtual-economy benefit, not statutory Korean NHIS coverage or a real-world rate.
- User: Insurance > Benefits > Submit claim with virtual event reference, coverage period, positive integer WLD amount, privacy notice; receipt, Provide evidence, Withdraw before decision. Admin: Insurance > Claims > Review evidence / Request correction / Approve limited amount / Reject / Escalate. DRAFT→SUBMITTED→EVIDENCE_PENDING→IN_REVIEW→APPROVED/REJECTED; WITHDRAWN/EXPIRED/BLOCKED terminal. No real medical diagnosis, identity numbers or documents collected. Approval is authorization only, not payment.
- Proposed APIs (NOT IMPLEMENTED): POST /api/insurance/benefit-claims {eventRef,coveragePeriod,amountWld,idempotencyKey}; GET /api/insurance/benefit-claims/:id; POST /internal/insurance/benefit-claims/:id/decision {decision,approvedWld,expectedRevision,nonce}. Owner-scoped read, independent reviewer RBAC, fresh MFA, no self approval; 401/403/404/409/412/422/429/503 fail closed. Separate privileged payment workflow required.
- Proposed DB: insurance_benefit_claims(tenant_id,claim_id composite PK,subject_id,event_ref,period_start,period_end,amount_wld BIGINT CHECK >0,approved_wld BIGINT CHECK 0<=approved<=amount,status,revision,source_digest,created_at); insurance_benefit_claim_events(tenant-qualified FK, immutable actor/action/hash/time). UNIQUE(tenant_id,subject_id,event_ref,period_start,period_end), UNIQUE(tenant_id,subject_id,idempotency_key), index(tenant_id,status,created_at), FORCE RLS, least-privilege SECURITY DEFINER and transactional outbox. Additive migration only; no existing balance rewrite.
- Integrity: CAS revision and fenced worker; at payment time recheck eligibility, unique claim payout reference, balanced double entry and idempotency. Outbox failure/timeout -> UNKNOWN or PENDING_REVIEW, never auto-credit; compensating entries only for reversal. Tenant isolation, rate limits, audit redaction and deduplicated alerts.
- Mobile 320px, WCAG 2.2 AA, EN/KO parity, private noindex/no-store; KPI review latency, duplicate rejection and unverified payout attempts. Tests NOT RUN: state/RBAC, real isolated PostgreSQL concurrency/RLS, duplicate claims, outbox crash, eligibility revocation, double payout prevention, E2E submit→review→authorization with zero ledger writes, accessibility and privacy. Flag insurance_virtual_benefit_claims_v1 default OFF, exact-SHA Test and independent QA/security before canary, flag-OFF rollback retains audit.
- Backlog: P0 release provenance/treasury reconciliation HOLD; P1 API/DB/admin/member UI; P2 privacy-safe KPI. Baseline social-insurance row → TSI-20261110-004 → canonical integration PENDING / Draft PR #3006. External independent references 0 newly validated, cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS. No production change.

| 2026-11-10 04:05 | B Feature Addition | v2014 / vTSI.2026.11.10.005 | edd709bcbe96f6f5ceca8372f244b632e8211242 | ADD 1 / MODIFY 0 / REMOVE 0 / DEFER 0 | recheck required | PR #3006 | PROPOSED, canonical pending |
