# Nov18 violet brand / Spring UI source QA — v2026.11.23.3

**Status:** reviewed source candidate; **Test/Production promotion HOLD**. No API/DB/ledger/security changes.

## What actually changed
- Child of existing clean shared-style branch `0bf9fc8426` (separate Git worktree, no Gemini edits); latest main rechecked at `9876c09888`.
- `static/bank.html`: replaced non-semantic blue/teal/green hero, product icons, and example rate decoration with approved violet; removed a nonexistent Next CSS reference; added responsive native four/two/one-column bank cards and a non-claiming bank information label.
- `static/css/mv-theme-nov18.css`: scoped primary-action replacements for legacy cyan/emerald/blue links and buttons; no replacement of gain/loss/status text or ledger data. Self-hosted existing Material Symbols font prevents broken icon ligatures when Google Fonts is unavailable.
- `static/css/mv-brand-violet.css`, `templates/shared/chrome.html`: SHA-256-versioned brand action/focus and active-nav color contract for native member and administrator Thymeleaf pages.

## Evidence
1. TDD before change: 3/3 brand contract tests RED; after change: 3/3 GREEN. Responsive grid/self-hosted-font addition reproduced 1/3 RED, then 3/3 GREEN.
2. Full offline Spring H2 test + `bootJar`: **669 tests, 0 failures, 0 errors, 0 skipped**, built successfully. Source JAR QA only; not authenticated financial E2E.
3. Additional **real Spring Boot loopback HTTP** (`@SpringBootTest`, `RANDOM_PORT`, `test` H2, `moneyverse.frontend.classpath-only=true`): 2/2 GREEN after explicit application-class fixture correction. Served `/css/mv-theme-nov18.css`, `/css/mv-brand-violet.css` byte-identical to the reviewed classpath and `/bank.html` without missing legacy Next CSS. No external banking writes.
4. Local static HTTP + Playwright Chromium: bank/calculators/features at **320, 390, 768, 1440px = 12/12 HTTP 200**; 0 horizontal overflow. Bank grid **1/1/2/4 columns**. Bank icon, title/supporting rates/CTA computed violet `rgb(156,131,255)`; legacy calculator CTA is violet; tinted feature CTA is `rgba(156,131,255,.12)`. Existing self-hosted icon family loaded without network access to Google Fonts. Visual evidence [PC and mobile](../design/nov18-violet-v2026.11.23.3/README.md).
5. No member login, source-backed interest/rate validation, full 180-route rendering, full multi-language visual E2E, authenticated finance/ledger tests or official independent Test/Production promotion. Existing finance P0 and historical 180 mockup color mismatches remain separately tracked (draft #3368/#3369).

## Release / rollback boundary
- No runtime release was carried out. The old 180 PNGs remain immutable planning references. Candidate must be integrated after its parent shared-style branch, validated with exact reviewed Spring Test artifact, genuine backend/edge route, member/admin session and 5-language browser QA before zero-downtime production promotion. Revert this branch's CSS/HTML/template changes to roll back without touching financial data.
