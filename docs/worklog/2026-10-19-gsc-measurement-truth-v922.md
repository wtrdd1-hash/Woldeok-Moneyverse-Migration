# v2026.10.19.922 — GSC Operator Measurement Truth Worklog

**START (2026-10-19 KST):** Owner approved SEO/customer acquisition source and live development. Authoritative PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, AGENTS, DOCUMENTATION_POLICY, v688 search evidence, v860 and v921 growth spec reviewed before change. Base exact main `a7be34de9fc12b380592dffd4bc29903ac69a502`. Isolated branch `fix/gsc-measurement-truth-v2026.10.19.922` with no file overlap with concurrent v921 PR #958. MiniPC MCP unavailable (timeout), GitHub fallback. No Test/Production release or financial data mutation.

**Root cause:** `frontend/src/app/admin/seo/gsc-analytics-card.tsx` initializes `source:'unconfigured'` with zero placeholders but renders them as **0 Google Search clicks/impressions, 0% CTR, 0th ranking**, even when provider key missing, request failed, or Search Console has never returned a verified result. This can falsely explain the owner's 2-week 'no customers'. The GSC connected source and actual search data must be distinct.

**Implementation scope:** pure tested source/presentation helper with `UNMEASURED` display for unconfigured/error/loading/stale; real numeric zeros only when provider reports; even with a successful provider response, CTR/rank undefined when impressions 0. Relabel Googlebot typo: the Search Analytics report concerns Google Search user impressions/clicks, not crawler hits. Add tests and CI. Backend credentials/API, account signup, Naver, WLD, finance, sitemap, Test/Production pointers remain untouched.

**MID:** pending test/code review.
**FINAL:** pending exact-head CI + release acceptance.