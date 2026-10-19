# v2026.10.19.930 — IndexNow category-scope correction (START)

- Base main: `85c86ac80e0ea6f07e869fe50b0f4fa240d48f2d` (v921 merged).
- MiniPC/Desktop Commander devices offline; **GitHub source-only**. No live GSC, test instance, database, or production access.
- Reviewed `PROJECT_MEMORY.md`, `AGENTS.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`, F675-06 SEO spec, current `indexing-submit` and `gsc-sitemap-submit` routes; PR #959 (v922) modifies GSC presentation, not this route.
- Bug: `targetCategory='pseo'` still includes 13 calculator URLs due to unconditional seed; `targetCategory='calculators'` may include presets, while `targetCategory='all'` includes both. An unrecognized category is silently treated as all. IndexNow only notifies compatible engines; no Google indexing guarantee.
- Planned fix: explicit category filtering, invalid-category 400, safe deduplication, scoped counts and negative tests. No automatic submissions or financial mutations.
- Status: START, pending code review, CI, exact-SHA Test, production financial and UI release gates.
