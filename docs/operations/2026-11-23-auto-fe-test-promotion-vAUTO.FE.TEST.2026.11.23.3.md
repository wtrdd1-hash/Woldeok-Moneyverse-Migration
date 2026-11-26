> **v2026.11.27.PLAN-AUDIT.2:** [Current G2 frontend authority](../design/CURRENT_UI_DESIGN.md). Prior Spring-only frontend, previous visual baselines and unrestricted guest browsing are superseded. Preserve valid functional/security requirements. Administrator access is denied to guests and non-admins at server boundaries; old runtime/automation records are not current instructions.

# Frontend automation and isolated Test deployment — vAUTO.FE.TEST.2026.11.23.3

Status: five existing scheduled automations UPDATED and enabled, with QA2 expanded into Test deployment; configuration only. No new application build or deployment was executed in this turn. Production is strictly out of scope.

## Source of truth
Read latest integrated planning master first, then AGENTS, English PROJECT_PLAN with Korean translation, original Nov18 180 responsive visuals, EN/KO UI_UX_SINGLE_REFERENCE, and corrected Nov23 v2026.11.23.10 180 PNGs.
Crucial: corrected Nov23 v10 design is at immutable commit 39888c7d26bdf688737a77b93a7da29e230b4168 (PR #3400 CLOSED/UNMERGED), not necessarily on main. Fetch docs/design/game-ui-v2026.11.23.10/README.ko.md and previews at this exact SHA. Reconcile any newer owner-authorized design with integrated planning before code changes. PNG validity is not runtime acceptance.

## Five active hourly jobs, KST
| :05 FE A | 6afffac316ec81918ec3c109cb159e7a | Common Spring UI, login, OAuth, legal consent, original favicon, shared 5-locale shell |
| :15 QA1 | 6afff8b85b5c8191bdc055ca6e5aec12 | Real independent Test DB/API, auth/RBAC/CSRF and banking/stocks/ledger QA |
| :25 FE B | 6afffac5d67081919b596522611af3cf | Finance, game, bank, quests, tools, blogs, community |
| :45 FE C | 6afff8be38688191ae6cdd022c8aecb1 | Administrator, Socket.IO/support/chat, five-locale full UI |
| :55 QA2 + Test deployment owner | 6afff8bb0a708191b7a219d351a4bfa3 | Independent real-browser UI/E2E verification and sole gated Test publisher |

Automation provider rejected a sixth task with too_many_active_automations: plan allows five scheduled tasks. Therefore the existing QA2 job was safely rescheduled from :35 to :55, rather than deleting QA or FE work.

## Required workflow
1. MiniPC MCP, two GitHub repositories, current remote main, integrated master, worklogs, Gemini and concurrent FE PRs refreshed at start, midpoint and before publish. Isolated branch/worktree only, no edits to other agents' working state. Version plus start/middle/end and internal/GitHub EN/KO updates required.
2. FE A/B/C write real Java Spring MVC + Thymeleaf PC/mobile code matching corrected v10 layouts (navy #0C1020, violet #9C83FF, exact favicon, real data and 5 languages), test forms/actions/API and create fixed SHA PR/build evidence. Never directly switch shared Test deployment.
3. QA1 independently confirms real isolated Test PostgreSQL and backend/auth/finance/ledger correctness. QA2 independently checks real Chromium/Playwright DOM, screenshot comparison at 320/360/390/430/768/1024/1440/1920 widths, five languages, 200% zoom, keyboard, browser console/network, chat, roles, no false balance or mock success. Skips are BLOCKED, not PASS.
4. Sole publisher QA2 gets exclusive deployment lock; only completed immutable candidates, CI and appropriate QA1/QA2 PASS may enter separate-port Test staging. Confirm exact frontend/backend SHA, JAR hashes, Test-only DB identity, backup and rollback target.
5. Safe Test-only atomic promotion allowed for scoped improvement when changed-route end-to-end browser/API/security/nonregression tests and rollback gates PASS, even while full 180 pages remain OPEN. Never claim fully accepted or promote to Production. If a gate fails do not switch; if post-switch Test HTTPS smoke fails immediately restore previous Test candidate and prove recovered state. Test Nginx host-only changes require backup and nginx -t; never alter Production.
6. Record actual Test URL, exact artifact/frontend/backend SHA, version, browser screenshot and API/DB receipts, old/new route matrix, CI/PR and rollback or HOLD outcome. Do not say TEST_DEPLOYED unless real HTTPS test.easy-scraping.com confirms the new SHA.

## Pre-existing blockers
2026-11-23 independent Test QA PR #3409: 180 planned routes, 147 non-dynamic requests, 17 HTTP200, 16 login redirects, 114 HTTP403; 33 dynamic fixtures untested. Some 403 may be intentional permissions; classify them, do not blindly expose protected content. /terms /privacy /socket.io.min.js were 403, several page titles returned literal null or wrong language, /blog/test-article had home title. Positive OAuth/admin/finance Test E2E and full visual acceptance not proven.
Observed at setup: Test domain test.easy-scraping.com, frontend 127.0.0.1:55440, backend 127.0.0.1:55438, isolated Test DB 127.0.0.1:55436. Recheck each time, do not assume static. No Test fallback or writes to 4550 or 5433; no Production changes.

## Release statuses
TEST_DEPLOYED_SCOPED: actually switched and HTTPS/exact SHA verified for scoped changes. TEST_HOLD: no publish because checks incomplete/failed. TEST_ROLLED_BACK: failed new Test was reverted and old Test rechecked. FULL_TEST_ACCEPTED requires full 180-route and 240-browser acceptance plus security/finance/role evidence; never implied by scheduled execution.