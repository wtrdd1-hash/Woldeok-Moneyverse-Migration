# Worklog — Progressive Complexity & First-Week Growth v2026.09.14.82

Date: 2026-09-14  
Repository: `wtrdd1-hash/Woldeok-Moneyverse-Migration`  
Change type: documentation-only

## Inputs reviewed
- latest `main` at start and mid-run: `bedf99608f28198ef12f3ec76b29ce6c2ae3eacb`;
- `PROJECT_PLAN.md` Living Project Plan;
- `PRODUCT_GROWTH_PLAN.md`;
- `SIGNUP_FRICTION_INTENT_RECOVERY_GROWTH_SPEC.md`;
- `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`;
- `SEASON_SYSTEM_SPEC.md`;
- current public production home, `/guide`, and `/announcements`;
- recent official product, search, privacy and consumer-protection references.

## Largest gap found
The planning stack has strong first-value and retention concepts, but the complexity ramp is inconsistent. The older growth plan schedules one major system per first-week day while the public guide already describes nearly the full economy stack in the initial journey. This can optimize feature exposure instead of comprehension and retained value.

## Decision
Created `PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.md` and Korean counterpart.

Selected lifecycle:
`first value → chosen core thread → result → one explainable adjacent preview → continue/defer → D1 same-thread → D3 coherent progress → D7 coherent loop → D14 voluntary breadth → D30 durable history`.

The pass does not introduce feature-lock code, database contracts, APIs, schedulers, auth changes or security architecture.

## Consumer planning changes
- separated feature availability from what is recommended now;
- made one core thread the first-week anchor;
- limited adjacent-system recommendations to one explainable relationship at a time;
- treated D7 coherent understanding as more valuable than broad shallow feature sampling;
- moved voluntary breadth primarily to D14+;
- prevented banking/loan/WDX/casino surfaces from becoming mandatory onboarding milestones;
- kept session depth user-controlled and unlimited-by-default;
- protected first-week learning/closure from interruptive monetization.

## Experiments added
1. intent-led first week vs calendar-led system tour;
2. one adjacent preview vs equal feature grid;
3. explain-before-entry finance-like surface vs direct shortcut;
4. reversible `not now` vs persistent recommendation;
5. monetization after coherent session closure vs before closure.

Each experiment includes downstream retention and trust/safety guardrails; broad rollout should wait for D30 where feasible.

## KPI changes
Added comprehension, next-action clarity, confusion/backtracking, number of systems opened before first value, D1 exact-thread continuation, D3 coherent progress, adjacent-preview accept/defer/hide, D7 coherent-loop completion, D14 voluntary breadth, D30 durable history, and shallow-feature-sampling rate.

Existing visitor→signup, activation, TTFV, D1/D3/D7/D14/D30, WAU/MAU, CAC, LTV, ARPU/ARPDAU, ad-induced churn and cohort revenue remain in force.

## Security/privacy/abuse cross-check
High risks recorded:
- fake progression/unlock phishing and ATO;
- private progression/economy/security-state leakage;
- tutorial/unlock/referral reward farming;
- finance/casino recommendation manipulation and WDX collusion;
- youth/minor exposure to inappropriate finance/probability pressure.

Medium risk:
- cross-feature analytics overcollection.

Minimum conditions preserve canonical-domain messaging, private-by-default personalized progression, public-safe allowlists, no secrets in links/analytics, no meaningful WLD/WDX for raw unlock/open/recommendation events, and existing market/probability/age/legal boundaries.

No security code was changed.

## Research notes
Direct adoption:
- Supercell, 2026-05-13 Collection Levels/Mastery changes: progression complexity and disconnected rewards were explicitly identified as problems; clearer next goals and a connected loop were adopted as directional evidence.
- Supercell, June 2026 update: used to cross-check the progression simplification direction.
- Meta/Threads, June 2026 community update: used for visible voluntary progress/identity patterns.
- Google Search Central people-first and AI-search guidance plus Naver Search Advisor: used to reject scaled low-value unlock/day/level SEO pages.

Reference-only:
- Discord Community Onboarding current FAQ: fewer choices, user-selected interests, later re-selection.
- Google Health Coach 2026-05-07: information surfaced around personal goals rather than all available data.

Legal/policy cross-check:
- FTC Genshin action remains a relevant gaming/youth/probability precedent;
- FTC Genesis Tech 2026-06 reinforces clear subscription terms and simple cancellation;
- PIPC 2026 youth-privacy policy activity is a launch-time review signal;
- PIPC COPPA 2.0 summary is recorded as policy context, not current Korean law or a settled U.S. rule.

## Runtime Product Reality Audit
Verification: available for public web surfaces.

Observed:
- home clearly discloses game-only WLD/rewards;
- quick links expose wallet, minigames, exchange, shop, quests and lobby together;
- guide says to start with one activity but its initial story also presents deposits, bonds, loans, professions, businesses, stocks, passive-income language and casino/minigames;
- first-day checklist still ends with a compound-deposit action;
- asset-threshold / `representative capitalist` roadmap remains;
- announcements remain quiet while a sponsored placement is visible.

Conclusion: the proposed progressive-complexity loop is not yet verified in production and remains a consumer-growth hypothesis.

## Git state
Start/mid-run `main`: `bedf99608f28198ef12f3ec76b29ce6c2ae3eacb`.
Final `main` must be checked immediately before commit/ref update. Apply by non-forced fast-forward only.

## Files planned
- `docs/planning/PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.md`
- `docs/planning/PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-progressive-complexity-first-week-growth-v2026.09.14.82.md`
- `docs/changelog/2026-09-14-progressive-complexity-first-week-growth-v2026.09.14.82.ko.md`
- `docs/worklog/2026-09-14-progressive-complexity-first-week-growth-v2026.09.14.82.md`
- `docs/worklog/2026-09-14-progressive-complexity-first-week-growth-v2026.09.14.82.ko.md`

Deployment: documentation-only; no Test/Production runtime deployment required for this change itself.
