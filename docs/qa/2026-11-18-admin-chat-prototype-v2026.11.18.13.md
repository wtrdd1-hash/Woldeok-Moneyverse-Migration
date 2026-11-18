# Administrator + Global Chat Isolated Prototype QA — v2026.11.18.13

Date: 2026-11-18 KST
Branch: feat/admin-chat-isolated-preview-v20261118-13
Source baseline: `0590fac4e8a82bc986ba1b8c64f014d18daca9e9` (GitHub main)
Parent design branch: `cf928183b38f8b01b70ab66780d3e2ad7c750930`
Status: PROTOTYPE SOURCE TESTS PASS; AUTHENTICATED BACKEND / BROWSER QA NOT RUN; PRODUCTION HOLD.

## Test evidence

| Check | Command / inspection | Result |
|---|---|---|
| TDD RED | Node initial `chat-core.test.mjs` before core implementation | FAIL as expected (module missing) |
| TDD GREEN | `node --test docs/design/admin-chat-v2026.11.18.13/preview/*.test.mjs` | 13 pass / 0 fail |
| JS syntax | `node --check` for both preview ES modules | PASS |
| Visual reference integrity | Python ElementTree parses two admin SVGs, verified viewBoxes | 2 pass |
| Local static HTTP preview | `python3 -m http.server` restricted to 127.0.0.1; curl `/`, `/app.mjs`, `/chat-core.mjs`, `/styles.css` | HTTP 200 for all four; server stopped after test |
| Demo boundary | Static tests forbid network calls, XHR/beacon, local/session storage, document.cookie, unsafe innerHTML | PASS |
| Route privacy | Unit tests redact path query, fragments, IDs into safe category | PASS |
| Cross-page draft | Unit tests preserve open/draft on navigation, isolate tab drafts, clear on sign-out | PASS |
| Mobile constraints | Static CSS/layout invariant and 56px geometry with 80px+ bottom offset | PASS by static contract; visual browser measurement NOT RUN |
| Production source scope | Verify branch diff excludes `frontend/`, `spring-backend/`, `backend/`, `packages/`, `ops/` | Confirmed 0 modifications in mini-PC worktree before commit |

## Explicitly unverified
- No actual browser rendering screenshots at all viewport sizes were captured.
- No Playwright/authenticated Chrome QA was run.
- No real Spring backend auth, money, ledger, chat, support, or real Test server was exercised or modified.
- No production installation/rollout; demo data and messages are not real.
- Spring identity-header and false-success risk must be fixed by the security workstream before any API integration.

## Release decision
**HOLD / NO DEPLOYMENT.** The independently implemented UI prototype is reviewable. Actual chat delivery, admin real data and page-wide production navigation are BLOCKED by server security and integration/visual QA gates.
