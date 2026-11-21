# UI Image Implementation Handoff — v2026.11.19.31

**Status:** RECOVERED DESIGN ASSETS / IMPLEMENTATION NOT CERTIFIED. **Canonical language:** English; Korean companion: [한국어](UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.ko.md). **Scope:** repository documentation only; no Spring frontend, legacy frontend, DB, Test, or Production changes.

## Root cause and provenance

- The Nov 18 designs were actually committed to [PR #3268](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3268) (180 PC/mobile combined SVG concepts) and [PR #3270](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3270) (two admin SVGs and isolated floating chat demo).
- Both PRs were closed **without merge** on Nov 19 KST; their remote **head branches were absent** when audited. Closure comments said integrated into unified Spring/main, but neither `origin/main` (`0590fac4e8a82bc986ba1b8c64f014d18daca9e9`) nor the checked local unified Spring checkout (`b988877285`) contained these visual asset paths. Historical PR links to deleted branches therefore were not a durable image handoff.
- Recovered original immutable Git PR heads `cf928183b38f8b01b70ab66780d3e2ad7c750930` (#3268) and `1c0408faecfaa22823577ce7abea6895b30a7611` (#3270) into this **separate documentation-only review branch**. Do not call these assets merged to main before the dedicated PR is accepted.
- Assets are **synthetic planning wireframes**, not pixel-accurate exports of any externally rendered ChatGPT conversation images, nor real screenshots or evidence of working functions. Review actual visual direction with the owner before treating them as final design.

## Exact implementation references

| Surface | Visual reference | Implementation mapping |
| --- | --- | --- |
| All 180 route concepts (PC + mobile together per PNG) | [180-route gallery](all-pages-v2026.11.18.12/README.md) (GitHub-readable, no executable offline gallery) | [Route→PNG table](all-pages-v2026.11.18.12/README.md); [EN specification](../planning/ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.md) / [KO](../planning/ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.ko.md) |
| Home | [Home desktop + mobile concept](all-pages-v2026.11.18.12/previews/home.png) | route `/`; compare live source and real data |
| Admin | [Administrator desktop](admin-chat-v2026.11.18.13/references/admin-console-desktop.png) and [mobile](admin-chat-v2026.11.18.13/references/admin-console-mobile.png) | [Isolated admin/chat preview](admin-chat-v2026.11.18.13/README.md); [EN specification](../planning/ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13.md) / [KO](../planning/ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13.ko.md) |
| All admin routes | [40 administrator route concepts](all-pages-v2026.11.18.12/README.md) | `/admin*` requires real verified admin role and access controls; do not simulate live balances or approval |

The original 180 route concepts correspond to **178 routes captured from the then-GitHub main plus 2 provisional branch-only concepts** (`/admin/logs/errors`, `/calculators`). Reconcile actual route inventory against the newest Spring implementation before coding. The current Spring-only owner directive (`SPRING_ONLY_FRONTEND_OWNER_DIRECTIVE_v2026.11.18.28.md`) supersedes older Next.js-first specifications: **implement the browser-facing frontend in Java Spring MVC + Thymeleaf (or approved Spring-native rendering), not by starting a Node.js/Next.js runtime.** Keep existing working functions and data truth.

## Handoff acceptance gates for Gemini / implementers

1. **Visual approval:** review the actual PNG per target route on desktop and mobile, capture mismatches to the owner-approved rendered concept; do not guess missing screens or imply a wireframe is production-fidelity artwork. Copy actual fonts/colors/spacing into a reviewed Spring-native design token specification, not a static PNG as the functioning page.
2. **Behavioral mapping:** for each route, map every interactive element (navigation, filters, forms, table, modal, chat, payment action, charts) to real authenticated Spring routes/APIs, source-of-truth states, permission boundary, error/empty/loading states and explicit acceptance test. An illustrative widget does not equal a working endpoint.
3. **Responsive/a11y/i18n:** test widths 320, 390, 768 and 1440 px; overflow, safe-area and 200% zoom; visible focus, keyboard/Escape, WCAG AA contrast, 44px targets; English default and Korean alternative. For floating support, preserve a single 56px launcher and do not allow real sends until server-side Spring identity, ownership, CSRF and false-success handling are fixed.
4. **Quality gates:** use a new isolated feature branch, compare actual browser screenshots to each approved concept, run Spring Java source/build, functional/negative/authenticated API E2E, security and database checks; verify official Test uses identical artifact SHA. Distinguish passed tests from untested routes. Require verified rollback and controlled zero-downtime promotion before any Production claim.
5. **Ownership:** coordinate with Gemini; avoid overlapping production/Main edits and keep a start/mid/end worklog plus internal and GitHub update notes. No automatic merge of this planning-only branch or promotion based only on image-file validation.

## Recovery integrity evidence

- PNG files: **180/180** present; **180 unique SHA-256 file digests**; all converted images preserve the source SVG dimensions after XML/viewBox verification. Combined PC+mobile designs are one PNG per route, not 360 separate image files.
- Admin PNGs: **2/2** converted and checked. Historical source ZIPs were integrity-checked before removal; CI-compliant main handoff intentionally contains no ZIP/HTML/JS/JSON artifacts. Route index: 180 unique paths in README; no missing PNG files. Metadata and routes are from the historical design PRs; they do not independently establish pixel accuracy or Spring functionality.
- Full browser visual comparison, authenticated API QA, Test deployment and Production deployment: **NOT PERFORMED** by this documentation recovery.

**Owner-facing decision:** recovered and provided accessible source images on a dedicated branch, but implementation is blocked until the owner approves the design fidelity and an implementation PR passes Spring/runtime gates. This branch must not be misrepresented as a finished frontend.
