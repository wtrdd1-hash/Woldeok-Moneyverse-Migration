# Product-planning worklog — v2026.09.14.83

## Scope
Consumer-growth planning only. No runtime/code/DB/API/authentication/infrastructure/security-code change.

## Inputs reviewed
- latest `main` at start and mid-run: `dbcdf56bf3f2d75806016d35c2bfb55d021e8600`;
- `PROJECT_PLAN.md`;
- `PRODUCT_GROWTH_PLAN.md`;
- recent signup, first-session, priority-home, cross-surface, long-term aspiration, monetization and progressive-complexity growth specs;
- latest runtime merge restoring mobile business catalog compatibility;
- public Production home, getting-started guide and announcements;
- current external product/search/privacy references.

## Gap selection
Recent planning already covers acquisition context, pre-signup value, signup recovery, first-session closure, progressive first-week complexity, return ladders, social belonging, long-term aspiration and retention-safe monetization.

The least-duplicative remaining gap is visible competence: a user may complete jobs and earn WLD/EXP without clearly understanding what they are becoming better at. The current public guide reinforces this problem by making asset accumulation a much clearer progression story than skill, learning, curation or contribution.

## Decision
Add a consumer contract for visible mastery/self-efficacy rather than another implementation progression system.

Preferred loop:
`meaningful action → visible improvement evidence → authored mastery thread → next attainable step → D1 recognition → D3 application → D7 before/after → D14 voluntary depth → D30 durable mastery record`.

Mastery must not be reduced to WLD balance, feature breadth, time spent, trading volume, loan use or casino volume.

## Research
Direct adoption:
- Supercell 2026-05-13 progression/mastery redesign: progress should be simple, clear and aligned to personal goals.
- Supercell June 2026 release/support: clearer Collection Level progress shipped and makes each upgrade/unlock visibly meaningful.
- Google Search Central people-first/Discover guidance: public learning/mastery pages must have independent usefulness and originality rather than scaled thin combinations.
- PIPC 2026-07-27 TikTok/Apple enforcement: behavioral data use requires a lawful privacy basis and should not be treated as unrestricted ad data.

Reference only:
- Supercell Card Mastery support for task-specific progress communication.
- FTC dark-pattern precedent as a design-risk reminder, not a claim of direct legal applicability.

## Runtime reality audit
Public home, guide and announcements were reachable.

Observed mismatch:
- game-only disclosure is prominent and positive;
- home quick links still foreground wallet/minigames/exchange/shop/quests;
- guide contains profession EXP/mastery, but progression is primarily narrated through WLD thresholds, saving, stocks/business and `representative capitalist` status;
- first-day checklist ends with compound-deposit behavior;
- announcements are quiet while sponsored inventory remains present.

Therefore visible mastery is not treated as an already-shipped runtime behavior.

## Security/privacy/abuse findings
- HIGH: phishing/ATO using fake mastery/reward/level-preservation claims.
- HIGH: public cards leaking economy, debt, casino, private social or security state.
- HIGH: bot/multi-account mastery farming when progress events are economically rewarded.
- HIGH: finance/casino profit or recovery framed as competence, enabling chasing/collusion/manipulation.
- MEDIUM: mastery/interest analytics converted into unrestricted advertising profiles.

Minimum conditions are recorded in the canonical spec. Any external deep-link, public personalized mastery, economy-linked mastery reward or finance-adjacent campaign requires separate QA.

## Experiment backlog created
1. visible improvement vs reward-only result;
2. user-chosen mastery thread vs global score;
3. reflection recap vs generic weekly recap;
4. contextual public artifact vs raw achievement share;
5. monetization after mastery comprehension vs before.

## Files planned
- `docs/planning/VISIBLE_MASTERY_SELF_EFFICACY_RETENTION_GROWTH_SPEC.md`
- `docs/planning/VISIBLE_MASTERY_SELF_EFFICACY_RETENTION_GROWTH_SPEC.ko.md`
- English/Korean changelog;
- English/Korean worklog.

## Git policy
Perform a final current-main check before writing the commit. If `main` moved, rebuild on the new tree. Update `main` only as a non-forced fast-forward. No documentation PR.