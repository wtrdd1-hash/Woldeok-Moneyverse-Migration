# Nov 18 violet-brand consistency implementation — v2026.11.23.3

Status: in progress | Owner: ChatGPT | Independent worktree: `fix/nov18-violet-brand-v2026.11.23.3`

## Before work
- User expressly requested actual correction of remaining non-violet brand accents after the 180-PNG visual audit. Approved global colors: background `#0C1020`, surface `#151D32`, primary violet `#9C83FF`, secondary blue `#64B7FF`; green/red/yellow are verified semantic states, not alternative domain brands.
- Read the current Project Plan and Integrated Planning Master, Nov 18 authority and prior visual QA; audited active MiniPC worktrees. `main` `9876c09888ec84034eec183cf1309c85df3d7447` remained clean. Existing `fix/nov18-global-style-contract-v2026.11.22.2304.1` worktree at `0bf9fc8426e1e8e3710053eff199e66aa6b85cf7` owns baseline shared style work. This child branch builds **on its immutable committed HEAD** in a *different* worktree; no edits to Gemini/FE-C worktrees.
- Scope: actual Spring-served primary CTA and non-semantic branding in member/bank/tools and shared CSS, plus focused tests. Preserve financial amount/status colors and business behavior. Historical 180 mockup PNGs stay archived; do not mistake them for functional pages.
- Mandatory gates: tests before implementation, branch push and PR; official isolated Test browser/backend/ledger verification and no-downtime production validation before any promotion. Do not change API, security, financial ledger, DB, server runtime, or current production environment as part of color work.

## In progress
- [x] Independent child worktree and conflict-free baseline
- [ ] Failing regression test(s) for theme invariants
- [ ] Scoped UI corrections with semantic-state exceptions
- [ ] Source and Spring tests; compare production integration boundaries
- [ ] Internal / GitHub updates, independent review, PR handoff

## Finished
Pending; not released.
