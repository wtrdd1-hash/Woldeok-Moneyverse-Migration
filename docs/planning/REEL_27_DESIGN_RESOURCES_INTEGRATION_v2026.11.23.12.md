# 27 design-resource references: Spring website implementation and governance plan — v2026.11.23.12

**English canonical** | [한국어](REEL_27_DESIGN_RESOURCES_INTEGRATION_v2026.11.23.12.ko.md)

> Status: **PLANNING; NOT IMPLEMENTED, TEST_VERIFIED or PRODUCTION_VERIFIED**. Date: 2026-11-23 KST. Start `origin/main`: `9876c09888ec84034eec183cf1309c85df3d7447`.
> Owner-provided reel: https://www.instagram.com/reel/DgB15siSolR/ (creator `jungtudio`). The official Instagram oEmbed **caption metadata** establishes nine categories and 27 resource names. **Reel frames, audio and comments were not played or validated.**
> Product authority: [current project plan](PROJECT_PLAN.md), [integrated master](INTEGRATED_PLANNING_MASTER.md), [approved Nov 18 design](NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md), and [native Spring implementation plan](../superpowers/plans/2026-11-21-native-frontend-rebuild.md). The [Nov 23 game-design 180-image branch](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/tree/feat/game-ui-180-single-master-20261123) is a separate **not-yet-approved design candidate**, not live-product authority.

## 1. Intent, exclusions and deliverables

The reel curates **27 external design sources**, not 27 mandatory runtime dependencies. Apply them as a controlled discovery-to-delivery pipeline: visual reference → asset-level license and security review → native implementation → screenshot and functional acceptance → gated deployment.

Planned outputs are (1) the discovery catalog, (2) an individual **approved asset** registry with licenses and file hashes, (3) shared Spring-native visual tokens/fragments, (4) approved original mockup ↔ actual browser comparison, (5) real-function member/admin pages, (6) responsive/a11y/performance/i18n regression, and (7) zero-downtime deployment evidence. **This change produces only the written plan and reference catalog.**

Non-negotiable:
- Implement web UI through the existing **Spring MVC + Thymeleaf** presentation runtime. A React library, Framer site builder or marketplace demo does not justify new Next.js/Node SSR, a second production web service, third-party iframe, or CDN execution.
- Preserve the approved Nov 18 navy/violet palette, actual logo/favicon bytes, member/admin chrome, mobile nav and the single global 56px support/chat launcher. A color-tool suggestion does not supersede approved CSS.
- English is the default locale, Korean second, then Japanese, Simplified Chinese and Vietnamese. Automatic detection, persistent user choice, translated asset alt text and ad disclosures must remain functional.
- No static balances, invented market charts, sample receipt, fake admin totals, fabricated successful transactions or demonstration account details in real screens. Bind only authenticated canonical backend/ledger data. Errors/unknown states may never become zeros or false success.
- Label sponsored placements clearly in all locales; never make marketing/mockup imagery resemble verified account data or factual performance.
- Do not overwrite design source images, another contributor's branch, or historical baselines.

## 2. The source-verified 27-resource matrix

`REFERENCE` means concept/inspiration only; `CANDIDATE` means specific files may be reviewed and later adopted; `HOLD` requires explicit runtime/license/security/performance review. **No actual item is approved merely because it is listed.**

| # | Group | Original resource and official website | Product application | Initial decision |
|---|---|---|---|---|
| 01 | Illustrations | [unDraw](https://undraw.co/) | Empty, help and onboarding states; violet recoloring | CANDIDATE |
| 02 | Illustrations | [Storyset](https://storyset.com/) | Tutorial diagrams with required attribution where applicable | CANDIDATE |
| 03 | Illustrations | [DrawKit](https://www.drawkit.com/) | Economic game/feature explanation art after pack license check | CANDIDATE |
| 04 | Typography | [Fontshare](https://www.fontshare.com/) | Evaluate display font, five-language glyph and numeral coverage | CANDIDATE |
| 05 | Typography | [Fonts In Use](https://fontsinuse.com/) | Editorial typography references; not a font redistribution source | REFERENCE |
| 06 | Typography | [TypePair](https://www.typepair.co/) | Heading/body font pairing research | REFERENCE |
| 07 | Icons | [Iconify](https://iconify.design/) | One consistent icon set; inspect each icon-set license | CANDIDATE |
| 08 | Icons | [Lordicon](https://lordicon.com/) | Limited optional status micro-animations, per-asset terms | CANDIDATE |
| 09 | Icons | [Icons8](https://icons8.com/) | Contextual secondary icons with attribution/plan review | CANDIDATE |
| 10 | UI | [21st.dev](https://21st.dev/) | Card/form/spacing patterns, **not automatic marketplace installs** | REFERENCE |
| 11 | UI | [Magic UI](https://magicui.design/) | Interaction and layout references; no React import into Thymeleaf | REFERENCE |
| 12 | UI | [React Bits](https://reactbits.dev/) | Transition/state patterns; MIT + Commons Clause requires review | REFERENCE |
| 13 | Motion | [Design Spells](https://designspells.com/) | Non-intrusive live-update and feedback reference | REFERENCE |
| 14 | Motion | [GSAP](https://gsap.com/) | Optional non-critical presentation motion only | HOLD |
| 15 | Motion | [Framer](https://www.framer.com/) | Prototyping and interaction reference, not a Spring replacement | REFERENCE |
| 16 | 3D | [ThreeUI](https://threeui.com/) | Optional public game-intro 3D visualization | HOLD |
| 17 | 3D | [GetLayers](https://www.getlayers.ai/) | Approved reusable layers and 3D scenes (terms review first) | HOLD |
| 18 | 3D | [Spline](https://spline.design/) | Optional public-marketing scene only; non-essential | HOLD |
| 19 | Media | [Unsplash](https://unsplash.com/) | Public landing and editorial imagery, not account/data evidence | CANDIDATE |
| 20 | Media | [Pexels](https://www.pexels.com/) | Editorial images and videos, rights review | CANDIDATE |
| 21 | Media | [Lummi](https://www.lummi.ai/) | Clearly conceptual non-factual visual art, rights review | CANDIDATE |
| 22 | Palette | [Coolors](https://coolors.co/) | Contrast and supporting violet tone proposals | REFERENCE |
| 23 | Palette | [Color Hunt](https://colorhunt.co/) | Trend research; must not override visual baseline | REFERENCE |
| 24 | Palette | [Realtime Colors](https://www.realtimecolors.com/) | Color-palette experiments and contrast previews | REFERENCE |
| 25 | Mockup | [Shots](https://shots.so/) | Presentation-only frames around authentic screenshots | REFERENCE |
| 26 | Mockup | [Mockuuups](https://mockuuups.studio/) | Desktop/mobile launch material | REFERENCE |
| 27 | Mockup | [Previewed](https://previewed.app/) | Clearly labeled release concept/production mockups | REFERENCE |

Verified **license exceptions** as of 2026-11-23: Storyset's free usage requires attribution ([terms](https://storyset.com/terms)); Iconify's icon sets have separate licenses ([reference](https://iconify.design/getting-started/)); 21st.dev does not grant blanket rights to all component examples ([terms](https://21st.dev/terms)); React Bits uses **MIT + Commons Clause**, not plain MIT ([upstream](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md)). Unsplash, Pexels and Lummi general commercial-use licenses do not automatically clear trademark, personality, model or redistribution risks for every file ([Unsplash](https://unsplash.com/license), [Pexels](https://www.pexels.com/license/), [Lummi](https://www.lummi.ai/license)). Confirm current item-specific rights/tiers for GSAP, Spline and GetLayers before adoption.

## 3. Design synthesis contract

1. **Design inheritance**: compare against approved Nov 18 PNGs and true production favicon/logo, then current Spring-rendered browser screenshots. The 180 new game-themed PNGs on an unmerged branch are concepts requiring explicit acceptance, never evidence of 180 implemented screens.
2. **Traceability**: each asset suggestion must map `existing UI defect → source → proposed file → license decision → implementation route → accepted screenshot`. No decorative asset-mixing without purpose.
3. **Tokens**: inherit the exact existing `--mv-bg`, `--mv-surface`, `--mv-primary`, `--mv-border` and other approved CSS. Palette services may generate comparison proposals but cannot alter production tokens automatically.
4. **Typography**: verify EN/KO/JA/ZH/VI coverage and fallback, 0/O and 1/l distinguishability, large currency strings, 200% zoom, wrapping, self-hosting rights and font swap behavior. Avoid surprise tracking calls to third-party font hosts.
5. **Icons**: never substitute official favicon/logo. Keep a single consistent navigation family, understandable accessible names, 24px-class icon artwork and ≥44px interactive targets.
6. **Image lifecycle**: capture author, source URL, file-specific license, original SHA256, local paths and derivative SHA256; remove unsafe SVG content/remote references, optimize WebP/AVIF where appropriate; preserve intrinsic dimensions, loading policy and five-language alt text. A screenshot of financial data never replaces actual values.
7. **Motion**: use in-place value transitions rather than modal spam/toasts when data refreshes. Proposed reference timings: 120–180ms hover, 180–250ms disclosure; no essential functionality depends on animation. Reduce/disable under `prefers-reduced-motion`; avoid tying effects to data-poll cadence.
8. **3D**: evaluate only nonessential public-marketing sections. Do not render opaque 3D embeds over consent, auth, wallet, transfers, finance trading, admin audit or support. Static image fallback on mobile, reduced-motion, lower-power or failure. No undisclosed third-party requests.
9. **Mockups**: mark concepts clearly; only real, traced screenshots count as QA evidence. Never present mockup frames as live-verified service, balance or ad performance.

## 4. Native Spring component and backend mapping

Source inventory seen on baseline: `spring-backend/src/main/resources/templates/shared/chrome.html`, `shared/admin-shell.html`, `templates/mv43/*`, `templates/mv46/*` and `spring-backend/src/main/resources/static/*`. Following paths are **proposed future implementation targets**, not files created by this task:

| Proposed file or area | Function | Proof required |
|---|---|---|
| `spring-backend/src/main/resources/static/assets/design-tokens.css` | Single approved token surface | Existing styles and Nov 18 pixel comparison |
| `spring-backend/src/main/resources/templates/shared/ui/{card,empty,alert,modal,form}.html` | Reusable native Thymeleaf fragments | HTML rendering, CSRF, accessibility unit tests |
| `spring-backend/src/main/resources/static/assets/ui-interactions.js` | Local focus, dialogs, menu, status refresh | Bundling/CSP and no external runtime |
| `spring-backend/src/main/resources/static/assets/approved/*` | Locally hosted approved optimized assets | Asset-license registry and hash parity |
| `spring-backend/src/test/.../Nov18DesignAsset*Test.java` | Route, role, template and asset regression | Names chosen only after inspecting current test conventions |
| `docs/design/asset-resources-v2026.11.23.12/source-catalog.json` | Discovery-only 27-link inventory | Not a runtime dependency nor an approval register |

Authentication and data contracts:
- Derive the server actor only from real authenticated session/DB role, never a browser-provided user/admin header. Exact route/method, CSRF, actor ownership, numeric units, UTC, cache semantics, idempotency, accepted receipts and reconnect behavior belong in an endpoint-specific contract ledger.
- Return monetary amounts as exact decimal strings and perform settlement in canonical DB-owned routines; do not derive ledger entries using browser floats.
- View models distinguish `LOADING`, `READY`, `EMPTY`, `STALE`, `ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, and `UNKNOWN`. Never misrepresent source failure as zero or success.
- Money transfer, card issuance, bank deposit/withdrawal, order placement, casino bets and admin writes need session authorization, approved step-up/CSRF, idempotency, audit, reconciliation and actual receipt. Until verified in isolated real-data Test, controls must not fake completion.
- Google/Discord/local login and legal terms/privacy agreement links must remain available. Any six-month or changed-terms reconsent behavior must follow the actual approved policy and stored server consent record; no invented enforcement.
- Sponsored areas display clear five-locale disclosure on desktop/mobile, including when dynamic content or reduced motion is active.

## 5. Feature and page-family adoption order

| Priority | Scope | Visual candidate | Functional acceptance |
|---|---|---|---|
| P0 | Public landing, login, signup, legal/error | unDraw, consistent approved icons, minimal transitions | Verified auth providers, consent/versioning, recovery, real notices, five locales |
| P0 | Member dashboard, assets, wallet, banking | Typography, in-place state icons, minimal motion | Real scoped balances, transactions, deposits/withdrawals, interest and receipts; failure/stale behavior |
| P0 | Stocks, charts, casino, economy | Truly data-driven chart states and understandable empty/error | Canonical quotes, trade/bet authorization, settlement, idempotency, timeouts |
| P0 | Admin, support, messaging | Consistent role-filtered nav and single launcher | RBAC, real support sends, audit, denied states, no duplicated floating prompts |
| P1 | Shop, content, articles, help | Licensed illustrations and editorial photos | Real catalog/posts/prices, locales, ads and asset attribution |
| P2 | Public promotion/game-intro | Optional GSAP/3D scenes | Static fallback, no tracking surprises, perf and rights sign-off |
| P2 | Release screenshots | Shots/Mockuuups/Previewed | No personal data; distinguish concept vs real QA evidence |

Proposed shared UI contracts: `AppShell`, `AdminShell`, `PageHeading`, `StatCard`, `BalanceCard`, `AccountRow`, `TransactionTable`, `DataEmpty`, `DataError`, `LoadingIndicator`, `ToastInline`, `ConfirmDialog`, `LocaleSelector`, `ThemeTokens`, `LegalConsent`, `AdDisclosure`, `SupportLauncher`. Each uses one implementation, typed state contract, keyboard specification and regression identity. These are **planned**, not claimed as existing.

## 6. Asset approvals, security and software supply chain

Keep two separate inventories:
- `source-catalog.json` = discovery directory of 27 design sources. **Not approval**.
- A future `approved-assets.json` = per-asset evidence fields `assetId, sourceName, sourceURL, author, licenseURL, licenseTextEvidence, commercialUse, attributionRequired, redistributionScope, releases, originalSHA256, transformedSHA256, reviewedBy, reviewedAt, routes, locales, alt, assetPath, dependencyVersion, SBOM, expiresAt, approvalStatus`.

Gate steps: direct official item URL → prove rights to use and distribute/modify, crediting and depiction of people/brands → store purchase evidence privately if applicable → original SHA256 → derivative link → scan SVG scripts/event attributes/remote href, sanitize → check font subsets and image optimization → render required attribution → two independent reviews → pinned local assets → verify actual browser request inventory and license display.

Explicitly forbid unreviewed remote `npx`, live user records/secrets uploaded to external design platforms, CDN dependencies/analytics without consent, unpinned scripts, replacing brand favicon with stock icons, font redistribution without rights, use of third-party product marks as an official brand, or bypassing financial authorization. Track SBOM, vulnerabilities and reproducible checksums before source dependencies are enabled.

## 7. Visual, functional, performance and accessibility QA targets

These are **future acceptance criteria, not measured successes**:
- Approved PNG ↔ actual Chromium screenshot at widths **320, 360, 390, 430, 768, 1024, 1440 and 1920**; portrait/landscape, 200% zoom, text enlargement and safe areas. Track each pixel difference with reviewer rationale; do not declare all 180 routes implemented merely because images exist.
- WCAG 2.2 AA, visible focus, keyboard Tab/Shift+Tab/Enter/Escape, explicit labels, no color-only meaning, ≥44px project target for touch controls, accessible ad labeling and reduced-motion fallback.
- p75 **LCP ≤2.5s, INP ≤200ms, CLS ≤0.1** on appropriately profiled real devices/network as proposed budgets; no mobile auto-playing 3D. Unmeasured ≠ passed.
- Live updates: order/dedup/reconnect/stale state, no full-layout jumps and no repeating intrusive notifications; data authority is the server, not animation timing.
- Real negative tests for authentication, CSRF, RBAC, IDOR, SVG XSS/CSP, external requests, terms consent, forged successful payment, precision, duplicated financial requests and real admin/member isolation.
- Test ladder: docs/catalog schema → specific asset approvals → lint/dependency checks → Spring JUnit/Thymeleaf → independent Test HTTPS → **5 locales × 8 breakpoints × success/failure/permission states × at least 5 browser runs for each implemented screen** → signed-in admin and two-member API/ledger verification → no-downtime rollback rehearsal.
- QA receipts capture actual URL, screenshots before/after, source SHA, immutable artifact checksum, Test identity, actual response and DB read snapshot, timestamp, operator. A screenshot-generator mockup never stands in for live proof.

## 8. Stage-by-stage execution and release gates

| Gate | Outputs | Exit criterion | Blocker |
|---|---|---|---|
| G0 — source intake | Caption provenance, 27-source catalog, versioned plan, start/mid/finish logs | All 27 items present with no duplicates | Video playback unavailable is explicit |
| G1 — baseline audit | Current favicon/Nov18 designs/CSS/route ledger map | Differences against actual Spring UI documented | No automatic 180-image branch promotion |
| G2 — pilot designs | Public home, member assets, admin examples | Owner-accepted screens clearly marked as concepts | No unapproved third-party runtime |
| G3 — shared web foundation | Tokens, approved icons, fragments, locales/alt text | Native Spring and unit/license/a11y tests | No concurrent branch overwrite |
| G4 — real backend | Session-bound data/rights/ledger and all failure paths | Real isolated authenticated Test E2E and receipts | P0 auth/money risks fail closed |
| G5 — visual/functional acceptance | Complete implemented-route coverage ledger | 8 widths × 5 locales × 5 passes with recorded behavior | Unimplemented routes are explicitly OPEN |
| G6 — production decision | External independent Test, security/load/recovery evidence | Exact source SHA, independent rollback, zero-downtime cutover | Any P0 gap -> HOLD |

**Truthful completion**: 27 links documented ≠ 27 licenses cleared ≠ design images accepted ≠ UI coded ≠ Test passed ≠ Production validated. This version addresses only the **G0 reference and planning deliverables**. No design PNGs were regenerated or installed; no Spring code, financial records, Test server or Production deployment is changed. Later execution requires its own version/branch, QA and GitHub/internal update.

## 9. Parallel contributor policy and artifacts

Do not edit other contributors' current `feat/game-ui-180-single-master-20261123`, `fix/public-ads-clear-disclosure-20261123` or `fix/game-ui-180-visual-functional-qa-20261123` worktrees/branches. Re-fetch main mid-task and before integration; reconcile conflicting design authority without overwriting merged or unmerged work. Store public references, **not unlicensed third-party files**.

[Task log](../worklog/2026-11-23-reel-27-design-resources-v12.md) · [GitHub update](../updates/v2026.11.23.12-reel-27-resources-github.md) · Internal update: local-only `docs/updates/v2026.11.23.12-reel-27-resources-internal.md` (excluded by repository policy) · [Discovery catalog](../design/asset-resources-v2026.11.23.12/source-catalog.json).

## 10. Source verification record

| Material | Verification | Scope |
|---|---|---|
| Instagram Reel `DgB15siSolR` | Official Instagram oEmbed title/caption | Nine sections and 27 names; not reel video/audio |
| unDraw / Storyset / DrawKit | [unDraw](https://undraw.co/license) · [Storyset](https://storyset.com/terms) · [DrawKit](https://www.drawkit.com/license) | Different attribution and redistribution conditions |
| Iconify / 21st.dev / React Bits | [Iconify](https://iconify.design/getting-started/) · [21st.dev](https://21st.dev/terms) · [React Bits](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md) | No blanket license across catalogs |
| Unsplash / Pexels / Lummi | [Unsplash](https://unsplash.com/license) · [Pexels](https://www.pexels.com/license/) · [Lummi](https://www.lummi.ai/license) | Item/image rights and limitations remain |
| GSAP / Spline / GetLayers | [GSAP](https://gsap.com/standard-license) · [Spline](https://spline.design/pricing) · [GetLayers](https://www.getlayers.ai/terms-of-use) | Current technical, commercial and reuse review required |
