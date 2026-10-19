# v2026.10.19.930 — IndexNow category-scope correction (START)

- Base main: `85c86ac80e0ea6f07e869fe50b0f4fa240d48f2d` (v921 merged).
- MiniPC/Desktop Commander devices offline; **GitHub source-only**. No live GSC, test instance, database, or production access.
- Reviewed `PROJECT_MEMORY.md`, `AGENTS.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`, F675-06 SEO spec, current `indexing-submit` and `gsc-sitemap-submit` routes; PR #959 (v922) modifies GSC presentation, not this route.
- Bug: `targetCategory='pseo'` still includes 13 calculator URLs due to unconditional seed; `targetCategory='calculators'` may include presets, while `targetCategory='all'` includes both. An unrecognized category is silently treated as all. IndexNow only notifies compatible engines; no Google indexing guarantee.
- Planned fix: explicit category filtering, invalid-category 400, safe deduplication, scoped counts and negative tests. No automatic submissions or financial mutations.
- Status: START, pending code review, CI, exact-SHA Test, production financial and UI release gates.

## MID / FINAL source checkpoint
- Scoped IndexNow API URL construction; pSEO selection now excludes the 13 unconditional calculator URLs. Unknown category returns 400 before submission. Existing authorization and Origin gates remain unchanged.
- Added 3 regression tests to the existing route test suite (unknown category, pure pSEO URLs, calculators excluding stock pSEO). **Tests not executed** because remote host is offline; CI will determine correctness.
- No automated indexing request was issued. Search engine acceptance is not an indexing guarantee.
- Production promotion remains BLOCKED until exact commit CI, isolated Test backend/frontend, financial ledger reconciliation, authenticated UI coverage, backup restore and session checks pass.
