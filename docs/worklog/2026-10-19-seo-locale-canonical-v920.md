# v2026.10.19.920 — Verified Locale Indexing and Legacy Calculator Redirect Worklog

**Status:** IN_PROGRESS / implementation candidate / Production HOLD. [KO counterpart](2026-10-19-seo-locale-canonical-v920.ko.md).

## Start — 2026-10-19 KST
- User requested continuing implementation and Production promotion of approved SEO/zero-customer roadmap. Prior v910 PR #938 and v911 PR #942 already merged; detailed v860 planning PR #937 merged.
- GitHub `origin/main` exact start SHA: `c9462af98074306d67030a40037c00ac42e65493`. Independent feature branch: `fix/seo-locale-canonical-v2026.10.19.920`.
- Authority read before change: `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, v860 approved acquisition plan, `frontend/src/app/sitemap.ts`, `frontend/src/proxy.ts`, physical locale calculator route and existing sitemap tests. Other agents' workspaces/branches not touched.
- Local MiniPC Desktop Commander devices OFFLINE; PC-specific RPC times out. Fall back to GitHub connector as user instructed. No live host release identity, GSC provider metrics, Test application or financial gate newly verified in this session.
- Reproducible source issue: `sitemap.ts` advertises en/ja/zh alternatives for every nonlocalized public route, although most use locale prefix rewrites onto Korean-only metadata/H1; `/en|ja|zh/tools/compound-calculator` rewrites to Korean calculator layout and canonical; genuine localized equivalent exists at `/{locale}/tools/compound-interest-calculator`.
- Scope: nonfinancial SEO routes and metadata only. Add verified-alternate allowlist; redirect legacy localized compound-calculator root to corresponding genuinely translated route, with query retained; ensure translated global page returns reciprocal ko alternate; regression tests. No DB reset, financial mutation, operator access, new SEO submission or Production traffic change.
- Data reset permission cannot substitute for restoring immutable financial evidence, validating transactions, and permission gates. Production promotion requires exact-SHA CI, isolated Test, signed-in acceptance, backup/recovery, session continuity and verified rollback.

## Midpoint
Pending TDD tests, source fix and GitHub CI evidence.

## Final
Pending CI/Test, PR and verified release assessment.
