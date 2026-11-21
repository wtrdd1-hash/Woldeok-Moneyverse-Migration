# v2026.11.19.39.1 — Approved Moneyverse UI Reference Review (PC / Mobile)

**Status:** External reference research and **one production-frontend source implementation** (`/` only); not a 180-route conversion, not a Production release. English source; Korean worklog companion. Baseline `origin/main` `f488088bf50eb4659f59782dc0300a9c3bc74c69`. Existing owner decisions in [Spring-only directive](../planning/SPRING_ONLY_FRONTEND_OWNER_DIRECTIVE_v2026.11.18.28.md), [personal assets real-data spec](../planning/PERSONAL_ASSETS_REAL_DATA_UI_v2026.11.19.34.md), [180-screen concept](../planning/ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.md) and [UI image handoff](../design/UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.md) OVERRIDE any generic design examples.

## References actually inspected and practical takeaways

| ID | Reference | Specific useful pattern | Moneyverse implementation or gate |
| --- | --- | --- | --- |
| R01 | [Apple HIG — design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles/) | Task-first hierarchy, understandable navigation | Personal assets above financial-market tools; no public monitoring in member hero |
| R02 | [Apple HIG — Charts](https://developer.apple.com/design/human-interface-guidelines/charts) | Clear, explained chart labels and data relationships | Removed fake trend SVG; chart will be introduced only with user-scoped sourced history |
| R03 | [Apple HIG — Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) | Prioritize list structure and scanning | Separate financial table into independently scrollable region |
| R04 | [Android Material Design 3](https://m3.material.io/foundations/layout/applying-layout/window-size-classes) | Layout based on window size | Desktop sidebar at 1024+, mobile tabs under 1024 |
| R05 | [Material 3 navigation](https://m3.material.io/components/navigation-bar/overview) | Compact thumb-friendly navigation | Five-tab bottom bar with account routes in drawer |
| R06 | [IBM Carbon data table](https://carbondesignsystem.com/components/data-table/usage/) | Dense numeric tables with clear cells, sorting and state | Tabular WLD numbers; horizontal scroll confined to table; later add verified sort |
| R07 | [IBM Carbon accessibility — tables](https://carbondesignsystem.com/components/data-table/accessibility) | Keyboard/semantics/sorting indicators | Semantic table headers; no fake controls |
| R08 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Focus visibility, target size, zoom and not obscured | 44px target goal; visible focus and reduced motion; test responsive widths |
| R09 | [W3C target size explanation](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) | Small targets need spacing or enlargement | Increase controls to >=44 CSS px as project standard (stricter than normative AA minimum) |
| R10 | [Artkai Finly finance case study](https://artkai.io/works/finly-app) | Clear money overview + quick actions across device formats | Overview-first card hierarchy and conservative navy panels; no copied UI assets |
| R11 | [Behance stock platform concept](https://www.behance.net/gallery/208740383/Stock-Investment-Platform) | Desktop portfolio density differs from mobile | Fixed sidebar + compact mobile KPIs; do not borrow fictional values |
| R12 | [Dribbble AI finance management concept](https://dribbble.com/shots/26733522-AI-Finance-Expenses-Management-Appdesign) | Color semantics, balance vs actions separation | Purple primary brand, green/rose only for real signed returns |
| R13 | [Moneyverse approved home PNG](../design/all-pages-v2026.11.18.12/previews/home.png) | Exact desktop/sidebar + mobile/stacked concept | Home hero + account cards, quick actions, market, recent activity slots |
| R14 | [Moneyverse 180-route index](../design/all-pages-v2026.11.18.12/README.md) | Route-by-route desktop/mobile mapping | Subsequent integration must reconcile every Spring route and actual API |
| R15 | [Moneyverse admin PC/mobile concept handoff](../design/UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.md) | Admin as separate permissioned surface | No public `/admin-preview` home shortcut; never expose RBAC diagnostics to members |

**Design integrity:** Outside references are patterns, **not** owner-approved precise mockups. No third-party image assets are bundled, copied, or presented as implemented screens. Browser screenshots in `docs/design/mv39/` are of this isolated source in a fixture browser; no claim of Production data.

## UI contract implemented on `/`

- Spring Boot static `classpath:/static/index.html` plus `assets/mv39/*`; no Next/Node server on the delivery path. Original working routes `/stocks`, `/wallet`, `/quests`, `/shop`, `/board`, `/account`, `/support` remain linked but are **not migrated by this PR**.
- Exact dark semantic design: near-navy `#0C1020`, surface `#151D32`, primary `#9C83FF`, secondary `#64B7FF`; CSS-only ornamental realm badge, no fake graph. PC sticky left rail and responsive cards; mobile five bottom tabs, safe-area aware footer and separate drawer.
- Browser Auto preference; manual English, Korean, Japanese, Simplified Chinese, Vietnamese. English is canonical fallback, Korean the second defined language; `wdmv_locale_preference` and `wdmv_locale` support user override.
- Member data: session `/api/v1/auth/session` verified before wallet summary `/api/v1/wallet/summary`; preserve decimal strings without IEEE-754 truncation. Account change clears prior data; logout/expiry does not show another member's information.
- Market: public `/api/v1/stocks` uses `public.stock_market_overview()` at the Java source. Unknown price/change cannot be synthesized; empty/error is distinguishable from known numeric zero.
- Owner-scope block: do **not** call `/api/v1/stocks/portfolio` because Spring controller has a previously found fallback user/actor path. Show explicit unverified state instead of a fake holdings count.
- Board source-truth block: Spring `BoardService.listPosts()` returns fictional `post-wld-1`/`post-wld-2` whenever DB read fails **or zero real posts exist**; live localhost response confirmed fake data. Homepage MUST NOT render that endpoint until fixed to fail closed; show honest unavailable state and navigation only.
- Public homepage has no Treasury values, sample growth, fabricated user counts, server/DB/Netty details or admin-preview link. Admin remains separately authorized.

## Screen rollout map (NOT done in v39)

| Priority | Screen family | Planned next acceptance evidence |
| --- | --- | --- |
| P0 | `/wallet`, `/account`, `/stocks` portfolio | Server-verified owner actor, ledger reconciliation, 401/403/503 fail-closed, Test E2E |
| P0 | `/board` / community feed | Remove fabricated `post-wld-*`, verify DB-backed posts and safe public view |
| P0 | `/quests` / rewards | Verified event proof and durable ledger receipt before displaying earned WLD |
| P1 | Shop, game, market, finance, calculators | Route-by-route approved PNG comparison, real API mapping and state matrix |
| P1 | Admin screens | Server enforced RBAC, private/no-store, no fake system KPIs |
| P2 | Remaining 180-route family inventory | Explicit desktop + mobile comparison, i18n, accessibility/keyboard/zoom and API QA per screen |

Only **one** route has been changed by this branch. Never equate a route screenshot or green mocked session browser QA with authenticated Production functional certification.
