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

## Midpoint — 2026-10-26 19:54 KST
- Re-fetched origin/main, unchanged `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; canonical EN/KO plan hash unchanged (`51683ec3`, `ba7d055f`). No retirement-calculator PR in active queue; A/B/QA/Gemini work preserved.
- RED 5 failing behavior tests + 1 pre-existing passing; GREEN 6/6 on same isolated worktree.
- Implemented strict nonnegative bounded tenure/pay inputs, 12-month threshold, fractional severance, integer tax tenure, explicit under-one-year status, unverified WLD grant removal and fabricated SEO review removal.
- Pure calculator; no API/DB/schema mutation. Next: full gates, CI, exact SHA status.

## Pre-PR checkpoint — 2026-10-26 19:59 KST
- Second RED/GREEN: SEO layout was for unrelated NPS/FIRE and default shared helper inserted fake review ratings. New tests RED 2, then GREEN 8/8. Updated canonical metadata/OG/FAQ/schema to actual severance calculator, without fabricated reviews. Inputs/CTAs meet 44px minimum.
- Local initial HEAD: lint PASS (0 errors/1,128 warnings); typecheck PASS; frontend full 1,403 PASS/6 FAIL (existing SEO3, login1, registration1, admin M2 1); app-api 179 PASS; production audit FAIL (2 high), full audit FAIL (26: 2 critical/10 high). Webpack build failed with 1GiB Node heap OOM; rerun with larger heap or remote CI required.
- Origin/main and EN/KO canonical plans re-fetched, unchanged. No main merge, DB writes or deployment. Release gates remain CLOSED.
