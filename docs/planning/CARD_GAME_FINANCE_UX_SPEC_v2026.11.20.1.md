# Card UX and Game-Finance Planning Addendum
Version: v2026.11.20.1 | Status: PLANNING | Documentation-only | English canonical

## Authority and evidence boundary
Follow docs/DOCUMENTATION_POLICY.md: PROJECT_PLAN then INTEGRATED_PLANNING_MASTER; this document is an additive proposal, not an automatic override. Baseline main SHA: 245489a1452a1f187af831f483c18ab2501a65c5. Approved visual direction: 2026-11-18 navy/violet desktop and mobile concepts, docs/planning/ALL_PAGES_RESPONSIVE_REDESIGN_v2026.11.18.12.md and docs/design/all-pages-v2026.11.18.12/README.md (180 routes; conceptual assets, synthetic values). Later Spring-only owner directive v2026.11.18.28 prevails over old Next.js runtime plans. Source reconnaissance: Spring MVC/Thymeleaf templates under spring-backend/src/main/resources/templates/mv28,mv29,mv30 and legacy static/_next captures; finance controllers include wallet, stocks, shop, support, admin. This is targeted source inspection, NOT a completed audit of all 5,123 Markdown files, 189 PNGs, 180 images, 210 Java files or 925 frontend TSX/JSX/CSS files.

## Product and game experience
Product identity: reliable live economic simulation with RPG progression, not an indiscriminate card gallery. Finance facts take precedence over visual fantasy. The home page is a bento hierarchy: prominent wallet/portfolio hero, compact action cards, contextual quest strip, market/activity cards, and announcements. A given card must answer: what is it, what changed, when was it last verified, what can I do, what happens on error?

### Component contract matrix
| Card | Mandatory fields | Actions | Unavailable behavior |
|---|---|---|---|
| Asset/Wallet | owner-bound balance, currency, as-of, provenance, change | details/history | UNKNOWN; never fabricated zero |
| Stock/FX | source, instrument, timestamp, delayed/live label, change | detail/trade only if authorized | stale/market closed; disable destructive CTA |
| Quest/XP | verified objective, progress numerator/denominator, receipt, reward eligibility | details/claim only after authoritative check | pending verification, not earned |
| Inventory/Item | name, rarity, quantity, equip status, effect and holding expiry separately, maintenance state | inspect/equip with ownership validation | UNKNOWN not permanent or paid |
| Shop/Auction | item, inventory, price, currency, state, fulfillment conditions | details/confirm guarded transaction | no fake success or purchase |
| Bank/Bond/Treasury | balance/interest/maturity, as-of and canonical ledger source | history/calc/action with confirmation | source stale banner, fail closed |
| Community/News | author, date, moderation and verification labels | detail/comment/report | hidden/deleted/nonverified status |
| Admin/Operations | source age, exact scope, actor authorization, audit trail, confidence | inspect; privileged actions require reauth | explicit STALE/UNAVAILABLE, not green |

### Visual anatomy and design tokens
Reusable slots: icon/media (optional), title, value with unit, state, as-of/source, supporting explanation, primary action, overflow actions. Do not nest links inside a whole-card interactive control; use semantic navigation versus action buttons. Adopt 11/18 palette: page #0C1020, card #151D32, primary text #E9F1FF, secondary #A8BCD8, violet #9C83FF, blue #64B7FF; reserved gold for rewards and green/red for verified gain/loss. Finance values use tabular numerals, stable reserved dimensions, locale-aware formats, exact integer WLD strings where required. Variants: hero, metric, action, progress, item, list-row, detail; do not render all cards the same size. Focus styles, text contrast, reduced motion, noncolor state indicators, accessible error text mandatory.

### Screen and language rules
Target 320,360,390,430,768,1024,1280,1440,1920px. Desktop uses asymmetric hero + supporting cards, mobile reprioritizes into 1-column sections; no horizontal clipping or horizontal scroll of primary content. Use container queries for component rearrangement, not screen-only breakpoints; reserve image/chart size to avoid CLS. English default and Korean second, preserve other currently supported locale choices. Browser language auto-detection with persistent manual override; expand for Korean/English and long localized strings; no hard-coded financial translations. Single global chat/support entry on every page with admin-specific permission boundary; never imply a read-only admin help dock can submit a ticket.

### Server-side implementation contract
Final web presentation: Spring Boot MVC + Thymeleaf templates and modern progressive CSS/JS, with all canonical APIs and proper session/CSRF/role/owner checks. Never confuse existing exported Next HTML with native Spring implementation. Keep user-private data no-store/noindex as appropriate; service unavailable and HTTP 401/403/404/409/503 are distinct. Do not silently route /tools to incomplete Spring candidate or remove its six legacy functions; preserve feature parity and verify positive finance receipts.

### P0-P2 acceptance gates
P0: route/feature inventory; API provenance/auth/security and real source truth; 11/18 fidelity; 320px overflow, keyboard/focus, status semantic errors; finance/ledger safety and test backend, independently verified rollback.
P1: shared card component library and consistent tokens; per-card loading/error/empty/stale states; chat and localization; desktop/mobile screenshot diff plus full representative user flows.
P2: subtle item rarity/microinteraction, quests/seasonal storytelling, personalization only after functional parity.
Evidence: unit/component tests, Spring integration/authenticated positive E2E, Test Nginx and Chrome at nine widths, screenshot comparisons to 11/18 conceptual PNGs, performance LCP<=2.5s/INP<=200ms/CLS<=0.1 measured at p75, no secret leakage, exact SHA and independent Production gate. No test or release has been executed in this documentation unit.

## External guidance reviewed 2026-11-20
- Google Chrome Modern Web Guidance cards: https://developer.chrome.com/docs/modern-web-guidance/guides/ui-components/card
- Google Chrome responsive component styling: https://developer.chrome.com/docs/modern-web-guidance/guides/css/css-layout
- Google web.dev Web Vitals: https://web.dev/articles/vitals
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Material Design cards: https://m3.material.io/components/cards/overview
Inspiration references are not evidence of site implementation and should not be copied blindly.

## Outstanding verification
Per-image pixel review for all 180 previews, full file audit, Android repository freshness, actual browser screenshots, card/API schema mapping, production health, and full regression remain OPEN. No main merge, runtime deployment, API/DB/ledger mutation or Production promotion in this planning-only unit.
