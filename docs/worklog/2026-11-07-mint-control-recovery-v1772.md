# v2026.11.07.1772 — National Mint control-tower defect and expansion planning (EN)

Status: PLANNING / BLOCKED. Start 2026-11-07 KST.
Repository: wtrdd1-hash/Woldeok-Moneyverse-Migration.
Branch: docs/mint-control-recovery-v1772-20261107.
Main at START: 0b5b2b1385d2a75614d39458dff94f7d3098ed03.
Related: issue #2878 (new screenshot malfunction report), #2366 (canonical finance settlement P0).

## START — evidence and concurrency boundaries

- Owner-supplied screenshot: National Mint displays policy DB queried, one approved order, immediately mintable, 20-second refresh, issue/burn/freeze buttons. Owner reports related controls do not function. Evidence type USER_REPORT_AND_SCREENSHOT, not an authenticated POST-response capture.
- MiniPC system status at 2026-11-07 23:44 KST: backend, frontend, Discord bot, MCP, Nginx and Docker reported active; development DB connection healthy. This is NOT a finance settlement pass.
- Read document governance, catalog, DOCS_INDEX, authoritative PROJECT_PLAN and INTEGRATED_PLANNING_MASTER, central-bank/mint/treasury core spec, finance issue #2366, Mint v1741 and live source.
- Source inspection: legacy Mint POST deliberately holds; independent policy/Mint path records policy allocation and certificates but lacks independently proven atomic canonical balanced WLD posting. BFF certificate reads catch upstream failures as empty arrays. UI green badge reports successful read, not fully certified financial action.
- Current shared worktree is 44-files dirty (including national-mint-panel.tsx, mint BFF routes and monetary.controller.ts). Other automation or Gemini may be editing it. This cycle uses a separate clean worktree, documentation-only: no source, SQL, wallet, database or deployment edits.
- Functional acceptance and Production validation are deliberately NOT claimed.

## MID — 2026-11-07 KST
Remote main rechecked: 0b5b2b1385d2a75614d39458dff94f7d3098ed03 (unchanged).
Wrote the canonical EN and matching KO detailed design (MINT-01..14), truth and settlement invariants, API proposal, admin/member UX, offline/CSRF/idempotency/funding failure states, test matrix and gated promotion plan. Updated paired living authorities and document catalogs/indexes. Did not touch dirty shared app source. No deployment.

## END — documentation handoff
Bilingual detailed plans, worklogs, changelogs, GitHub-facing and internal update notes prepared for independent documentation-only PR. App code/SQL/DB/user WLD/Test/Production untouched. Documentation syntax/link checks and final SHA review to be recorded in the PR. Financial functionality **not fixed or executed** by this planning cycle; #2878/#2366 remain open until separate tested implementation and actual promotion evidence.

## GitHub publication evidence
- First documentation commit 347d9bc32b0c958af8aee3af77e97f7135696cc0 pushed from isolated worktree; branch docs/mint-control-recovery-v1772-20261107.
- Draft review PR #2879: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/2879
- git diff --check, EN/KO 14 feature IDs, relative detailed-spec links and living-plan references PASS. This is not a backend/frontend or production test.
