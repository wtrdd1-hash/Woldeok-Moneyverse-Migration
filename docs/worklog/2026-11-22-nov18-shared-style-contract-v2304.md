# v2026.11.22.2304.1 — Spring Nov18 shared-style corrective implementation

[한국어](2026-11-22-nov18-shared-style-contract-v2304.ko.md) | [Owner-approved design](../planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md)

## START — 2026-11-22 23:04 KST
Owner requested actual UI correction after audit PR #3364. Re-read the English/Korean integrated project plan and master, design authority (180 concept images), document governance, latest GitHub main and active worktree/PR ownership. Exact base `86393ad8bc1c66ba5c8593aa3770e2310173fd29`. Root worktree remains on concurrent OAuth PR #3365; no files from that PR or FE-C's uncommitted worktree were changed. Dedicated branch: `fix/nov18-global-style-contract-v2026.11.22.2304.1` in an independent mini-PC worktree.

## MID — implementation and TDD
- New JUnit `Nov18SharedStyleContractTest`: RED 3/3 initially, then GREEN 3/3 after changes.
- Added missing shared-shell CSS link to 9 Spring static member pages: bank, board, guide, quests, shop, status, stocks, tools, wallet. The other 19 already linked this CSS. The 28 pages with a five-tab mobile dock now explicitly load the identical desktop/mobile shell resource. No duplicated invented navigation or scripted UI overlay.
- `mv-theme-nov18.css` is already loaded by all 59 static top-level HTML pages. Added targeted override to prevent legacy `bg-[#...]` Next body utilities from defeating the approved `#0C1020` background while preserving application content and API controls. Added keyboard focus visibility for existing shell elements.
- `mv-shell-nov18.css` now reserves mobile safe-area/inset for the real five-tab dock and floating chat, minimum 44px tap targets and bottom document padding. No new JavaScript or database/schema change.
- Offline Gradle full Spring test: 105 test XML suites, **665 tests / 0 failures / 0 errors / 0 skipped**. Source-only outcome, NOT real authenticated integration or screenshot acceptance.

## END / release boundary
Nine-member-page shell normalization and shared palette fixes are **IMPLEMENTED IN SOURCE**. 31 other legacy/static pages still do not contain the same dock/sidebar DOM, and other 22 server templates have independent layout contracts: not claimed fully unified. Preserved OAuth PR #3365 and FE/QA file ownership. No actual member/admin authenticated E2E, finance transactions, 180-page mobile/desktop image matching or official Test-to-Production receipt was established by the source test. **No Production promotion without those gates.** See isolated Test receipt in PR discussion after exact-SHA candidate verification.
