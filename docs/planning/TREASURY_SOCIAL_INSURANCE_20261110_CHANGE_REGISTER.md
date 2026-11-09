# Treasury & Social Insurance — New / Changed Plan Register and Comparison Index
> **Initiative:** 2026-11-10 to 2026-11-11 06:00 Asia/Seoul
> **Register version:** vTSI.2026.11.10.001 · **Status:** DRAFT / DOCS ONLY
> **Existing baseline:** [Frozen baseline](TREASURY_SOCIAL_INSURANCE_20261110_BASELINE.md) · [한국어](TREASURY_SOCIAL_INSURANCE_20261110_CHANGE_REGISTER.ko.md)
> **Authority:** current [PROJECT_PLAN.md](PROJECT_PLAN.md) and [INTEGRATED_PLANNING_MASTER.md](INTEGRATED_PLANNING_MASTER.md), not this tracking document.

## Executive diff — initial state
| Category | Count | Meaning |
|---|---:|---|
| ADD (newly specified features) | 0 | No new hourly proposal has yet been recorded in this register |
| MODIFY (changes to existing plans) | 0 | No baseline-linked amendments yet recorded |
| REMOVE (withdrawn ideas) | 0 | No withdrawals recorded |
| DEFER (proposals postponed) | 0 | No deferred entries recorded |
| INTEGRATED into canonical plan | 0 | No incorporation or PR merge claimed |

This register starts as a **tracking scaffold**, not a claim that no plans existed. It is not evidence of code delivery, Test QA, Production deployment or a new insurance service.

## Comparison index (append on every actual planning cycle)
| ID | Cycle A QA-fix / B New | Type | Existing document & section / immutable link | Previously planned behavior | Newly planned behavior / proposal link | Version / KST | Priority | State | Canonical integration PR |
|---|---|---|---|---|---|---|---|---|---|
| _No accepted new entries at register initialization_ | | | | | | | | | |

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