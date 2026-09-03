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

## 2026-09-03 — Korean and English locale experience

- Created branch `codex/i18n-language-switcher-20260903`; no changes were made directly to `main`.
- Added Korean-default locale detection that selects English for visitors outside Korea, with browser language as a fallback when country data is unavailable.
- Added a persistent Korean/English language selector in the global masthead, designed as a compact Material-style globe menu with clear selection state and accessible touch targets.
- Made an explicit language selection override automatic detection for one year.
- Localized the global brand, navigation, session controls, footer, and primary public home-page marketing content.
- Added unit coverage for country and browser locale detection and for the language selector interaction.
- Google Stitch was requested, but no Stitch connector or installable Stitch plugin was available in this Codex environment; the implementation follows current Google international-site and Material interaction guidance directly.
- Verified the change with repository linting, workspace TypeScript checking, 23 contract tests, 6 migration tests, 696 backend tests, 438 frontend tests, and a successful production build with 17 static pages generated; 299 database-backed backend tests skipped because no test database URL was configured.
- Passed the control-byte and committed-secret checks. The production dependency audit found no high-severity vulnerability and reported two moderate-severity vulnerabilities.
