# Update Log

This file records incremental project changes so concurrent work can avoid overlapping edits.

## 2026-09-03 — Guide onboarding refresh

- Created branch `codex/guide-onboarding-20260903`; no changes will be pushed directly to `main`.
- Reviewed the existing `/guide` page, guide data, tests, shared page components, and repository instructions.
- Reserved the guide refresh scope: `frontend/src/app/guide/`, new guide-only public image assets, and this log.
- Generated and added `frontend/public/images/guide/newcomer-adventure.png`, a text-free illustrated path through quests, the wallet, the shop, and rewards for the guide hero.
- Added `frontend/public/images/guide/first-reward-loop.png` as a supporting illustration for the quest-to-reward loop.
- Expanded the guide data with a four-step quick start, three beginner guardrails, and FAQ answers for consent renewal and returning after losing one's place.
- Rebuilt `/guide` as a visual onboarding journey with an illustrated hero, direct start actions, a compact quick-start route, six connected checkpoints, a reward-loop explainer, beginner tips, a first-day checklist, expanded FAQs, and a final call to action.
- Added guide-data coverage for the four quick-start steps and three beginner tips.
- Verified formatting, lint, workspace type checking, 23 contract tests, 6 migration tests, 696 backend tests, 433 frontend tests, a production frontend build, and a local HTTP 200 render of `/guide`; 299 database-backed backend tests skipped because no test database URL was configured.
