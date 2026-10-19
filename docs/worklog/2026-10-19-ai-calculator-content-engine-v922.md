# v2026.10.19.922 — AI calculator demand & blog widget planning worklog

[한국어](2026-10-19-ai-calculator-content-engine-v922.ko.md)

## START — 2026-10-19 KST
- User request: design a detailed system that expands high-search-demand financial calculators using the internal AI and automatically produces related blog articles with embedded calculator widgets.
- Base authority rechecked before work: `origin/main=01c34e4b08f200066eca2c35d87788e3fdfd1361`.
- Concurrent-main change was detected and incorporated: the latest main already contains a dual-surface landing and a catalog of 19 financial calculators, so this plan must extend/reuse those routes rather than duplicate the older 12-calculator model.
- Authority reviewed: `docs/planning/PROJECT_PLAN.ko.md`, `docs/DEVELOPMENT_STATUS_AND_MASTER_REFERENCE.ko.md`, `docs/planning/F675_04_CALCULATOR_TO_LEARNING_OPTIONAL_GAME_SPEC.ko.md`, AI blog v719/v721 history, current calculator source, and latest v920/v921 updates.
- Research basis: Google Search Console performance metrics, Google Ads historical keyword metrics, NAVER API HUB search-trend data, Google people-first/YMYL guidance, and Google generative-AI/scaled-content guidance.
- Safety boundary: planning/docs only. No DB, WLD, runtime, feature switch, Test, Production or indexing submission changes.

## MID — 2026-10-19 KST
- Confirmed that the current blog inline calculator is a single compound-interest implementation even when an article links to another calculator.
- Confirmed that `POST /api/blog/generate` intentionally fails closed with `EDITORIAL_REVIEW_REQUIRED` because legacy generated finance content could contain unsourced or stale claims. v922 preserves this safety boundary.
- Wrote English and Korean specifications covering provider-grounded demand evidence, existing-tool gap analysis, formula/source versioning, golden tests, typed widget registry, source-grounded AI drafts, automated QA, editorial approval, SEO indexability and Search Console feedback.
- During the task main advanced again to `68f20881ce5e82b67c6b1f9aa6256617c56d77b5` with the v243 dual-surface implementation-plan update. The planning branch incorporated that change using two-parent merge commit `bc61e941345632b25f352577340f60d9695a15be`.

## END — 2026-10-19 KST
- Detailed plan: `docs/planning/AI_CALCULATOR_BLOG_WIDGET_GROWTH_ENGINE_SPEC_v2026.10.19.922.md` and Korean companion.
- Search-volume values remain provider observations; AI is prohibited from synthesizing missing demand metrics.
- New tools such as unemployment benefit, weekly holiday pay, national pension, VAT, inheritance tax and rent-vs-jeonse remain discovery seeds until demand and source-maintenance evidence pass.
- The first implementation cohort should validate the pipeline with three existing calculators before adding new indexable tools.
- Internal and GitHub update notes were added in English and Korean.
- No application/runtime, DB, WLD, feature switch, Test, Production or indexing-submission change was made.
