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

## Midpoint — 2026-10-19 KST
- Authored acceptance tests first: pure locale map and legacy redirect specificity, sitemap URLs with real translated equivalents, source proxy integration. MiniPC disconnected so a locally executed RED test is not claimed.
- Implemented `frontend/src/lib/seo-locale-alternates.ts`, `frontend/src/app/sitemap.ts`, `frontend/src/proxy.ts`, and reciprocal KO alternate on the physical localized calculator page. Existing Korean canonical paths preserved, no bulk 301 of presets or public route deletion.
- Google Search Central official [localized-page guidance](https://developers.google.com/search/docs/specialty/international/localized-versions) additionally requires equal self-referencing/bidirectional alternate sets in sitemap entries. Extended the helper and tests so translated glossary and localized compound entries repeat the entire group.
- First GitHub CI runtime lint failed due invalid escape syntax in new `search-indexing.test.ts` line 62, rather than a Production error. Fixed test to detect literal double-prefix URL fragments; new exact-head CI pending. Do not report red/green result for tests that have not run.
- Midpoint `main` SHA recheck `c9462af98074306d67030a40037c00ac42e65493`, unchanged. Second GitHub repository `woldeok-moneyverse-app` main `ee97ddfc5a93d7198d2d1ee94bb5a13c3b62ebcb` is the separate Android app and was not edited.
- Created [implementation PR #944](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/944). Main and public Production are distinct. Public website still served the old guaranteed WLD signup title during this cycle; v911 being merged is not evidence of production rollout.

## Final source record
Code and bilingual documentation are on PR #944. Verified home/tools reciprocal sitemap entries added. The first CI lint parse error was repaired; the final exact-commit CI still requires verification. MiniPC was unavailable, so authenticated Test, financial gate, Production SHA and zero-downtime deployment were not verified or executed. No database or member state was modified. Status: implementation candidate; Production HOLD.
