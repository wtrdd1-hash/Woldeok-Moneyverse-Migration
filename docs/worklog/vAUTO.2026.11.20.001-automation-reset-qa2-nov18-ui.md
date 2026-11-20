# vAUTO.2026.11.20.001 — Automation reset: two precision QA tasks + Nov 18 Spring web UI

**Status:** SCHEDULER CONFIGURATION VERIFIED; CODE / TEST / PRODUCTION NOT EXECUTED IN THIS CHANGE.
**Authority:** User request on 2026-11-20 KST; initial GitHub main `a9b1070d1091191c5fe2b68b2759f24762be780a`.
**English canonical** | [한국어](vAUTO.2026.11.20.001-automation-reset-qa2-nov18-ui.ko.md)

## Start — baseline and ownership
- Inspected the account's automation registry: **25 old tasks**, **five enabled**, **20 already disabled**. No existing task was deleted.
- Inspected mini-PC via `mcp____pc___moneyverse_get_system_status` and read-only Git commands. The specific legacy units `moneyverse-backend` and `moneyverse-frontend` reported inactive; nginx, Docker and MCP reported active; development PostgreSQL connectivity reported true. This alone does **not** establish production HTTP health or full Spring absence.
- Checked repository `AGENTS.md`, integrated plan and EN/KO living plan and 2026-11-18 design authority. Approved visual reference: `docs/design/all-pages-v2026.11.18.12/README.md`, 180 desktop/mobile concepts; `docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md`. User requested **browser website** Spring MVC + Thymeleaf, not Android.
- Existing root repository worktree had uncommitted shared static HTML/assets; do not overwrite. Gemini/other contributors' PRs and edits remain protected.

## Midpoint — old automations paused
- Disabled five previously active old automations, each with tool-confirmed `success=true`: planning `6aa8c76ce4dc8191ace5a76aa763e20b`, development A `6aa0f5d14cb08191970090d4b7e9961d`, development B `6aa0a07ac16c8191b5a6fef941c27e55`, development C `6aa4c62c4c548191861bf1a43b13825a`, and old QA `6aa4c43eba9c81918056bd5b597a9cee`.
- Previous 20 disabled tasks left unchanged. Historical prompts/results preserved. Pausing an automation does not undo any previously running task or deployed change.

## Final — three new, independently scoped, hourly tasks
| Role | Scheduler ID | KST hourly minute | Verification focus |
| --- | --- | --- | --- |
| QA 1: real API, Spring, DB | `6afff8b85b5c8191bdc055ca6e5aec12` | :15 | True HTTP request/response, auth, controller/DB/ledger evidence, security, fail-closed errors, non-destructive Test |
| QA 2: visual UI + E2E | `6afff8bb0a708191b7a219d351a4bfa3` | :35 | Real browser interaction, Nov 18 design screenshot comparisons, responsive, five locales, accessibility, network/UI data parity |
| Spring web UI implementation | `6afff8be38688191ae6cdd022c8aecb1` | :45 | Native Spring MVC/Thymeleaf PC/mobile, approved 180-screen design, true data binding, 5 locales, global support chat, gated Test→Production |

- Re-read automation registry after creation: **exactly three currently enabled tasks on the returned active list**, all three IDs and schedules matched; new tasks have first next-runs on 2026-11-20 17:15, 17:35 and 16:45 KST respectively.
- Scheduler prompts enforce mini-PC-first/GitHub fallback, latest main/design recheck before and during runs, skills, isolated branches/worktrees, owner boundaries, start/mid/final worklogs, EN/KO updates, no 3-second polling, exact-SHA integration, real HTTP/DB and visual QA. UI implementation and operating promotion are **scheduled future attempts, not completed work**.
- QA-only tasks report defects and evidence, avoiding conflicting source edits. Dev task cannot mark screens complete if mock responses, unusable routes, unverified authentication, missing back-end, or untested deployment. FAIL/BLOCKED must not be labeled PASS.
- This documentation PR changes only scheduler records/worklogs; there are no runtime code changes, CI Test proofs or Production release claims.

## Handoff
Next iterations must inventory the latest main/PRs and test real Spring runtime at the exact candidate SHA, especially legacy service status, login, admin/financial data, support/chat and responsiveness. Pass verified artifacts and P0/P1 failures between QA-1, QA-2 and UI implementation without simultaneous edits to the same files.
