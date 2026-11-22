# Nov 18 violet-brand consistency implementation — v2026.11.23.3

Status: in progress | Owner: ChatGPT | Independent worktree: `fix/nov18-violet-brand-v2026.11.23.3`

## Before work
- User expressly requested actual correction of remaining non-violet brand accents after the 180-PNG visual audit. Approved global colors: background `#0C1020`, surface `#151D32`, primary violet `#9C83FF`, secondary blue `#64B7FF`; green/red/yellow are verified semantic states, not alternative domain brands.
- Read the current Project Plan and Integrated Planning Master, Nov 18 authority and prior visual QA; audited active MiniPC worktrees. `main` `9876c09888ec84034eec183cf1309c85df3d7447` remained clean. Existing `fix/nov18-global-style-contract-v2026.11.22.2304.1` worktree at `0bf9fc8426e1e8e3710053eff199e66aa6b85cf7` owns baseline shared style work. This child branch builds **on its immutable committed HEAD** in a *different* worktree; no edits to Gemini/FE-C worktrees.
- Scope: actual Spring-served primary CTA and non-semantic branding in member/bank/tools and shared CSS, plus focused tests. Preserve financial amount/status colors and business behavior. Historical 180 mockup PNGs stay archived; do not mistake them for functional pages.
- Mandatory gates: tests before implementation, branch push and PR; official isolated Test browser/backend/ledger verification and no-downtime production validation before any promotion. Do not change API, security, financial ledger, DB, server runtime, or current production environment as part of color work.

## In progress
- [x] Independent child worktree and conflict-free baseline
- [x] Failing regression test(s) for theme invariants
- [x] Scoped UI corrections with semantic-state exceptions
- [x] Source and Spring tests; compare production integration boundaries
- [x] Internal / GitHub updates, source self-review; PR handoff pending

## Checkpoint: implementation and evidence
- Nov18 bank branding and the primary legacy CTA contract updated without changing finance/status semantics. Separate native admin/member focus/active CSS uses a SHA-256 query version.
- Browser found a missing legacy Next stylesheet and a remote-only Material font; added native bank 4/2/1-column layouts and the existing local icon font. Screenshots are offline and cannot prove authenticated API success.
- RED prior to implementation: three brand tests, then one bank layout/font test; GREEN after fixes. Full H2 Spring JUnit669 PASS, zero failures/errors/skips, `bootJar` PASS. Additional real loopback Spring HTTP classpath-only 2/2 PASS; first attempted fixture lacked application class and was corrected. Chromium static preview 3 paths × 4 widths 12/12, no overflow.
- Midpoint main re-fetched `9876c09888`, parent remained `0bf9fc8426`; other agents' worktrees untouched.

## Finished
Source and QA candidate complete; GitHub PR/review integration and official Test/Production release still pending. No real member/financial action or deployment. See [QA](../qa/2026-11-23-nov18-violet-brand-qa-v2026.11.23.3.md) and [screenshots](../design/nov18-violet-v2026.11.23.3/README.md).
