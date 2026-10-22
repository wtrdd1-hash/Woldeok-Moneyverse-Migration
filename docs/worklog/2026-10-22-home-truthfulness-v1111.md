# Worklog — v2026.10.22.1111 truthful home UI for CI and release

**Start:** current wallet fix branch 0e63c159 based on origin/main 27a73acb, independent `fix/home-truthful-ui-ci-v2026.10.22.1111` worktree. Original GitHub CI #2881 frontend test failure 6: color palette, Bento hardcoded classes, old 4-action layout, missing heading, misleading sample member balance and unavailable market display.

**Mid:** replaced hardcoded 10,000 WLD under “my virtual assets” with authenticated WalletGlance, adjusted accessible hero heading, stock-data-unavailable wording, canonical calculator routes. Updated old source-assertion tests to current 3-action/Toss mobile design without weakening real financial truth assertions. Focused 14/14; first broad attempt without NODE_ENV=test yielded React.act errors due wrong mode, not app regressions; reran in official CI mode `NODE_ENV=test` and **all 1,356 frontend tests PASSED**. Frontend TS/lint pass, no money/ledger mutations.

**Next:** cherry-pick into independent wallet PR #987 after scoped source commit to restore common CI, then blog #986 exact main CI and optional isolated Test/zero-downtime Production acceptance. No production deployment by this source patch.
