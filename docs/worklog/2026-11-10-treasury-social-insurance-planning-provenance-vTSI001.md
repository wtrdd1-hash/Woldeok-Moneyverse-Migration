# vTSI.2026.11.10.001 — Treasury and Social-Insurance Planning Provenance Register

**Date/time window:** 2026-11-10 through 2026-11-11 06:00 Asia/Seoul  
**Task:** Preserve pre-existing Treasury / health-insurance / pension planning separately from newly added and modified plans, with easy-to-read cross-links and cycle history.  
**Initial main authority:** `edd709bcbe96f6f5ceca8372f244b632e8211242`  
**Task branch:** `docs/treasury-insurance-planning-history-20261110`  
**Owner instruction:** Maintain permanent A/B cycles (A = QA-driven corrections, B = detailed new feature planning) and a time-limited hourly fiscal/insurance deep-dive.  
**Scope:** documentation only. Do not deploy runtime or change real balances.

## Start record
- [x] Read repository `AGENTS.md`, `README.md`, top-level `PROJECT_PLAN.md` / Korean counterpart, `INTEGRATED_PLANNING_MASTER.md` and documentation index.
- [x] Identified existing central-bank/mint/treasury/economy, administrator treasury, economy reconciliation and pension design sources at immutable GitHub commit `edd709bcbe96f6f5ceca8372f244b632e8211242`.
- [x] Confirmed the miniPC system-status endpoint is reachable, with frontend/backend/Nginx reported active and the DEV database connected; this status check **does not prove** the Production website, user flows or ledger reconciliation are correct.
- [x] Created an isolated docs-only branch to avoid shared-main edits and Gemini/other concurrent-work collisions.
- [ ] No production or isolated Test E2E was run. No runtime changes attempted.

## Source boundary and issue
Earlier documentation includes historical Production assertions, and separate v523/v542 monetary authority corrections. Historical words are not present-day Production proof. The original pension plan includes conditional guarantees and funded-liability concerns. Healthcare-insurance specifications and current runtime implementation need further discovery before a feature is labelled an addition or defect.

## Mid-work documentation changes
| Status | File | Reason |
|---|---|---|
| Created | [Existing Baseline — EN](../planning/TREASURY_SOCIAL_INSURANCE_20261110_BASELINE.md) | Pinned source inventory and existing design boundaries |
| Created | [기존 기획 기준선 — KO](../planning/TREASURY_SOCIAL_INSURANCE_20261110_BASELINE.ko.md) | Korean counterpart |
| Created | [New/Changed Planning Register — EN](../planning/TREASURY_SOCIAL_INSURANCE_20261110_CHANGE_REGISTER.md) | ADD/MODIFY/REMOVE/DEFER changes and baseline comparison index |
| Created | [신규·변경 기획 기록 — KO](../planning/TREASURY_SOCIAL_INSURANCE_20261110_CHANGE_REGISTER.ko.md) | Korean counterpart |

No actual hourly A/B feature proposals were fabricated; the initial change count is zero. The next scheduled cycles must append **evidence-backed** item IDs, scope/acceptance details and links to canonical plan changes.

## Acceptance and next steps
- [x] Existing documents are referenced at the original immutable SHA rather than replaced.
- [x] Separate append-only change/index register initialized in both languages.
- [x] Revision identifier and original source SHA are recorded in both records.
- [ ] Automated hourly cycles must update the register and compare main throughout the special period.
- [ ] Each actual proposal must distinguish old/new behavior, risk, priority, UX/API/DB, test criteria and integration state.
- [ ] Final 05:05 KST cycle must produce an evidence-based 06:00 closeout summary.
- [ ] Any canonical plan integration requires separate review/PR before claiming completion.

## Final setup verification
Four documents were committed to the isolated branch; live GitHub checks and review PR details are tracked in the associated pull request. This record claims **documentation setup only**. Browser QA, actual current production ledger integrity, CI/Test/backend behavior and user-facing functionality remain **NOT TESTED by this task**. No deployment or branch merge was performed.