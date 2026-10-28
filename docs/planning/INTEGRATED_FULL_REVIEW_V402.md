## 2026-10-28 — Planning v1402 / F675-156 (Feature Improvement / DRAFT / RELEASE HOLD)
- Previous Addition v1400 → Current Improvement v1402 → Next Addition v1404 provisional. Fresh main f396d009f41f421ca38f93ef2e7f8d26960dcae2 (09:01 KST); predecessor unmerged #1651. Latest QA v1336 is older-main 08:21 evidence, PR #1646 subsequently MERGED; current main exact-head QA UNKNOWN.
- Verified migration 082 NPC order replay checks UUID only, not actor/NPC/command; borrowed key can produce replayed=true/affinity NULL, same-actor wrong-NPC key can falsely replay. NPC active check lacks FOR SHARE and can race with deactivation. P0 requires immutable actor+NPC+command receipt binding, fail-closed legacy ambiguous keys and serializable order/deactivation; API actor UUID is not DB-session-attested (#993). Keyset cursor is not a stable snapshot.
- Backlog P0 ENV1402-01 SEC1402-02 REL1402-03 NPC1402-04 (P0 #1656); P1 NPC1402-05 NPC1402-06 NPC1402-07 NPC1402-08 NPC1402-09 NPC1402-10. Full UX/API/DB/locks/admin/privacy/SEO/Android/a11y/KPI/tests/rollback in bilingual integrated masters. Synthetic 10,001/100/100 tests NOT RUN. New external accepted 0; dedup cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS. No runtime/DB/WLD/ledger/Test/Production changes.

## 2026-10-28 — Planning v1400 / F675-156 (Feature Addition / DRAFT / RELEASE HOLD)
- Main `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c` verified start/mid. Previous Improvement v1398 → Current Addition v1400 → Next Improvement v1402 provisional. **Issue #1650.**
- Live NPC directory on `/quests`: existing hardcoded NPC buttons can disagree with DB `npc_profiles.active`; introduce authenticated read-only GET `/api/v1/engagement/npcs` and Android parity via bounded SECDEF reader, code-keyset cursor, no direct table grant, safe card projection, no financial writes. Order POST remains authoritative; migration 082 lacks a row lock, so B must harden the deactivation race before guaranteeing stale-order rejection.
- P0: ENV1400-01, SEC1400-02, REL1400-03, NPC1400-04. P1: NPC1400-05, NPC1400-06, NPC1400-07, NPC1400-08, NPC1400-09, NPC1400-10. QA #1646 candidate CI PASS, main lint/parity FAIL, official Test and independent restore NOT VERIFIED. Synthetic 10,001/100/100 **NOT RUN**. External newly approved 0; deduplicated verified UNKNOWN/10,000, BLOCKED/IN PROGRESS. Full spec: `docs/planning/INTEGRATED_PLANNING_MASTER.md`. No runtime/DB/ledger/WLD/Test/Production changes.

## v1398 integrated re-review — F675-155 candidate/source contract (DRAFT / HOLD)
- Main b1cd54fda1123fb07ca81b6e5b3ead70f59f556c unchanged start/mid; A #1641 unmerged SHA 153491e2eaf5c5bb39933d9e2a5634b49a45c44b. Reconcile proposed new SECDEF vs standing-function reuse; app-role actor spoof, missing cash-row=0, API-clock observedAt and stale session results remain open. QA v1334 main lint/test FAIL, legacy backup cron failure, independent restore NOT VERIFIED. Backlog ENV1398-01 SEC1398-02 REL1398-03 LOAN1398-04 LOAN1398-05 LOAN1398-06 LOAN1398-07 LOAN1398-08 LOAN1398-09 LOAN1398-10. External new approved 0, cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS. OFF/HOLD.

# Woldeok Moneyverse — Integrated Full Planning Re-review v2026.09.23.402

> Status: active full re-review / phase 1 authority and contract audit
> Date: 2026-09-23
> Start baseline: origin/main 7b705e1d37e97ccd05ba12042c3fd8d582e396d0
> Parent planning authority: INTEGRATED_PLANNING_MASTER v2026.09.23.401
> Korean companion: [INTEGRATED_FULL_REVIEW_V402.ko.md](INTEGRATED_FULL_REVIEW_V402.ko.md)

## 0. Review rule

This cycle re-reviews the entire planning system against current repository evidence, runtime-facing contracts, normative standards and recent user decisions. Historical sections remain evidence, but historical status text does not automatically remain current. Every open P0/HIGH/P1 claim must be re-proven, closed with exact evidence, or reclassified as stale historical evidence.

Planning changes do not claim runtime implementation, Test completion or Production promotion unless exact evidence exists.

## 1. Scope inventory

Phase-1 mechanical inventory found 166 top-level files under `docs/planning`: 83 English and 83 Korean, with no missing EN/KO counterpart and no broken relative Markdown links in the top-level planning set.

The current runtime source inventory contains 58 backend controller files, 41 module files, 27 service files and 153 backend test/spec files. A rough decorator scan finds 361 HTTP method decorators. These counts are discovery signals only; they are not a replacement for the generated API contract.

Frontend source contains 554 files under `frontend/src`.

## 2. Immediate authority gaps

### G402-01 — P0 planning authority drift

`PROJECT_PLAN.md/.ko.md` still declare current integrated version v2026.09.23.397 while `INTEGRATED_PLANNING_MASTER` is already v2026.09.23.401. The project plan is described as the implementation-facing authoritative contract, so this version mismatch is not cosmetic.

Required correction:
- raise the authoritative project-plan header to v2026.09.23.402;
- record that v398-v401 deltas are now part of current planning authority;
- preserve historical v397 and earlier evidence without letting it supersede newer policy;
- require future integrated-master updates to update the project-plan authority marker in the same planning work unit.

Acceptance: PROJECT_PLAN EN/KO and INTEGRATED_PLANNING_MASTER EN/KO expose the same current planning version and name the same superseding review.
### G402-02 — P1 API inventory drift requires generated proof

The native app contract still records 57 backend controllers / 335 total endpoints / 179 mobile contract endpoints at v2026.09.23.388. Current source discovery finds 58 controller files and 361 HTTP method decorators.

These numbers are not directly comparable because decorators can include non-contract or differently counted routes. Therefore the planning conclusion is not "361 is the new official endpoint count"; the conclusion is that the old count is stale until the generator is rerun and semantically diffed.

Required correction:
- rerun `pnpm api:contract:check` in a dependency-complete environment;
- generate method/path/auth/request/response/error/idempotency/resource-limit inventory;
- classify additions/removals/behavior changes;
- update mobile contract EN/KO only from generated evidence;
- fail CI when an implemented runtime route is absent from the approved API inventory.

Current local evidence: `api:contract:check` cannot execute because this worktree has no installed TypeScript toolchain (`tsc: not found`, `node_modules` absent). This is BLOCKED evidence, not a passing contract check.

### G402-03 — P1 active-status ledger is mixed with historical incidents

PROJECT_PLAN contains many old P0/HIGH incident and release-gate entries from earlier dates. Keeping history is correct, but the document does not provide a single current active-status ledger that separates:
- currently open and re-proven;
- fixed in code but awaiting exact-SHA Test;
- Production reverify required;
- closed;
- historical/stale evidence needing revalidation.

Required correction: add one current status table keyed by gap ID, latest evidence SHA/date, status, owner/workstream, acceptance gate and superseding version. Historical narrative remains append-only but cannot alone define current status.

### G402-04 — P1 unresolved explicit TODOs

The authoritative plan still contains explicit open items including `AUTH-105-02` stale verify-email app documentation and `OPS-CACHE-156-01` permanent cache fix TODO. Each must be revalidated against current main and either closed with exact evidence or moved into the current active-status ledger.
## 3. Current standards refresh

The re-review reconfirms:
- OWASP ASVS latest stable: 5.0.0;
- NIST SP 800-63-4 and SP 800-63B-4: final, July 2025;
- OpenAPI latest published specification: 3.2.1, 2026-09-10;
- WCAG 2.2 remains the W3C Recommendation baseline and maps to ISO/IEC 40500:2025;
- W3C ACT Rules Format 1.1 became a Recommendation in February 2026 and should be used to structure repeatable accessibility test-rule evidence where practical.

Planning consequence: standards references are stored as provenance tuples (standard, version, publication/status date, source URL). Tooling adoption does not follow a version bump blindly; compatibility and conformance evidence are required.

## 4. Domain re-review matrix

The full review is divided into these authority lanes:

1. Identity/auth/session/OAuth/security center/admin privilege.
2. Economy/jobs/rewards/sinks/treasury/banking/business.
3. Stocks/market events/AI scenarios/casino.
4. Inventory/collection/crafting/marketplace/entitlements.
5. Community/private chat/friends/clubs/UGC/moderation.
6. Notifications/search/public content/newspaper/SEO.
7. Native app/BFF/API contract and web/mobile parity.
8. UI/UX/responsive/accessibility/i18n and human-designed route review.
9. AI systems, model governance, fail-safe and deterministic authority.
10. Data/DB/migrations/ledger/reconciliation/backup/restore.
11. CI/CD/Test/Production lineage, zero-downtime and session continuity.
12. Analytics/experiments/monetization/privacy/compliance.

Every lane must record implementation evidence, planning conflicts, missing API/data contracts, security negative tests, QA states, release gate and rollback contract.

## 5. Global invariants retained

The following recent decisions remain current unless later evidence explicitly supersedes them:
- ordinary job participation/mastery unlimited by default, while WLD issuance per unit time is server-paced;
- economy AI/ABM/RL is advisory/shadow/bounded and never replaces deterministic ledger authority;
- every server-backed feature requires a complete API contract in the same implementation work unit;
- public clients do not receive internal control endpoints, anti-abuse thresholds or secrets;
- valid login sessions survive ordinary restart/update/blue-green cutover;
- implementation changes use branch -> tests -> exact-SHA Test -> backend/API/DB/user-flow verification -> main -> zero-downtime Production promotion -> smoke/rollback;
- planning and implementation claims are separated.

## 6. Phase-1 acceptance

Phase 1 is complete only when the authority drift is corrected, the current-status ledger is created, the API-contract drift is explicitly blocked pending generated proof, and EN/KO documents are synchronized. This does not close domain-level review; it establishes the clean authority baseline required for the subsequent full domain audit.

## 7. Current active-status ledger — v402 phase 1

| ID | Severity | Current status | Latest evidence | Acceptance gate |
|---|---|---|---|---|
| G402-01 | P0 | OPEN / correction in this planning branch | PROJECT_PLAN v397 vs master v401 | all four authority docs expose v402 and same superseding review |
| G402-02 | P1 | BLOCKED / generated proof required | source discovery 58 controllers / 361 decorators; mobile spec 57/335/179; local contract check blocked by missing tsc/node_modules | dependency-complete generated contract + semantic diff + EN/KO sync |
| G402-03 | P1 | OPEN | historical P0/HIGH narratives mixed with current status in PROJECT_PLAN | current status ledger becomes mandatory authority; old records marked historical unless re-proven |
| G402-04 | P1 | REVALIDATE | AUTH-105-02 and OPS-CACHE-156-01 explicit TODOs remain | current-main code/runtime evidence closes or reopens each item with exact acceptance evidence |

Historical IDs such as REL-DOCS, BAK, OPS status, Work-clock, casino, and admin navigation are not silently declared open or closed by v402. Each will be revalidated in its domain lane before the full re-review is complete.
