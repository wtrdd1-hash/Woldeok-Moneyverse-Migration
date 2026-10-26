# C v1072 — Retirement Calculator Eligibility and Honest Estimate (Release HOLD)

## Start — 2026-10-26 19:5x KST
- Debian 13.6 miniPC connected, all seven services active, PostgreSQL connected; disk 98-99% full.
- Origin/main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; reviewed AGENTS.md, bilingual README and canonical PROJECT_PLAN.md/.ko.md, A/B/C/QA and recent CI.
- Overlap probe: auction defect already covered by unmerged Draft #1301 and #1270; abandoned duplicate without publishing product code.
- Unique P1: public `/tools/retirement-calculator` forces >=1 year in the form and `Math.max(1, totalYears)` in the severance formula, misleading users with less than one year of service. Current form also allows NaN/negative salaries and presents a fabricated aggregate rating in SEO JSON-LD. No PR found for retirement calculator.
- Scope: correct statutory tenure eligibility, safe bounded input, truthful zero result and warning, remove unsupported review markup; pure public calculator (no backend/DB mutation required). Keep responsive keyboard/screen-reader semantics and calculator scenarios.

## Plan
- [ ] RED: pure calculator and UI tests for 0/11/12/13 months, negative and fractional inputs, no false rating.
- [ ] GREEN: eligibility helper, safe form, explicit notice and SEO fix.
- [ ] Midpoint: re-fetch main/plans, overlap and code review.
- [ ] Exact-SHA tests/build/lint/typecheck/security/app-api/CI, report blockers honestly.
- [ ] Draft PR only; no merge/deploy if any required gate fails.

## Midpoint
Pending.

## End
Pending.
