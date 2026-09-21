# Changelog — v2026.09.21.325 AI Scenario User Newspaper

- Date: 2026-09-21
- Type: planning/documentation only
- Authoritative spec: `docs/planning/AI_SCENARIO_USER_NEWSPAPER_SPEC.md`
- Korean counterpart: `docs/planning/AI_SCENARIO_USER_NEWSPAPER_SPEC.ko.md`

## Changes
- reconfirmed existing v2026.09.19.261 automatic AI stock-scenario planning;
- verified actual automatic-generation implementation in the AI-news service, scheduler path and `AI_NEWS_AUTO_*` runtime configuration;
- added consumer newspaper home/article/archive planning;
- added bounded publish gates, AI/game-only disclosure, correction/retraction, provenance/audit, SEO, accessibility and QA requirements;
- incorporated 2026 Reuters Institute, Google Search Central and Korean AI transparency/privacy references.

## Impact
Documentation only. No runtime code, database or deployment configuration is changed. Implementation requires a separate development branch, exact-SHA Test validation and zero-downtime Production promotion.
