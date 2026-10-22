# Moneyverse A+B Finance / D Fictional Economy — Responsive Design System and Page Contracts

> v2026.10.22.1144 | PLANNING / DRAFT | English canonical · [한국어](MONEYVERSE_AB_D_DESIGN_SYSTEM_v2026.10.22.1144.ko.md)
> Authority: [PROJECT_PLAN](PROJECT_PLAN.md) → [INTEGRATED_PLANNING_MASTER](INTEGRATED_PLANNING_MASTER.md). This document is a proposed design delta, **not adopted authority or proof of runtime deployment**.
> Baseline checked 2026-10-22: main recent design commits 26a5ddbb and 5aeb207d; do not overwrite their header or active concurrent work without exact-file diff and owner coordination.

## Decision and boundaries
- **A (calm approachable finance) + B (dense precise data)** for homepage, calculators, real-world education, member banking, treasury/bonds, stocks and operator UI.
- **D (friendly playful economy)** only inside explicitly labeled fictional WLD play areas: quests, progression, jobs, shop, simulation/game. Shared accessibility, semantics and transaction-truth rules still apply.
- WLD is fictional, not KRW/USD, deposits or real securities; financial calculators and fictional WLD actions must never look interchangeable.
- Preserve existing Next.js route ownership, responsive guest-first navigation, calculators, guides, authenticated views and current server/ledger authority. No new features implied by visual mockups.

## Design tokens (proposed CSS custom properties)
| Token | Light | Dark | Use |
|---|---|---|---|
| --mv-bg | #F6F8FB | #0B1220 | app canvas |
| --mv-surface | #FFFFFF | #131E30 | cards / inputs |
| --mv-text | #12233D | #F0F5FF | core text |
| --mv-muted | #52627B | #B2C0D4 | secondary text |
| --mv-primary | #155EEF | #76A9FF | actions and links |
| --mv-primary-hover | #004BCB | #A4C8FF | hover |
| --mv-border | #DAE2ED | #304157 | outlines |
| --mv-success | #087F5B | #66D9AA | verified success |
| --mv-warning | #9A5B00 | #FFC875 | caution |
| --mv-danger | #B42318 | #FF968A | destructive/error |
| --mv-play | #6A52E8 | #B7A5FF | fictional economy accent |
| --mv-play-soft | #F3EFFF | #28203C | fictional play surface |
Typography: Inter/system + Noto Sans KR/JP/SC fallback; body 16px/1.55, caption 13px/1.45, H1 clamp(28px,3vw,42px), H2 24–30px. Currency/numbers tabular lining, locale-aware formatting; never JS float-transform canonical WLD integer strings.
Layout: 8px spacing grid (4/8/12/16/24/32/48/64), radii 12px inputs, 16px cards, 24px hero, shadow minimal; 1px visible border. Max content 1200px; reading prose 72ch. Breakpoints mobile 320–767, tablet 768–1199, desktop >=1200. Touch target >=44x44px where practicable. Avoid horizontal body overflow and sticky controls covering forms.

## Navigation and shared components
- Guest: single brand header, max 5 primary destinations, search for calculator, explicit sign-in; mobile compact header plus accessible menu, not duplicate overlapping nav. Existing guest-first three-action mobile navigation remains unless verified test data calls for change.
- Member: wallet entry, simulation distinction, status and session state; no fake sample balance in a member context.
- Components: AppShell, Header, Breadcrumb, PageHeading, TrustNotice, MetricCard, DataTable, CalculatorForm, ResultPanel, ProvenanceBlock, ReceiptStatus, EmptyState, ErrorState, Skeleton, ArticleCard, AdSlot, GameCard, AdminActionConfirm.
- Every action state: idle, pending, committed with server receipt, failed, uncertain, disabled. Loading must not remain forever; distinguish empty data from fetch error and insufficient permissions.
- AdSlot is explicitly labelled advertisement, visually separate, not between calculator submit/result or blocking ledger confirmation, never imitation of native CTAs.
- Prohibit fake guaranteed rewards, savings, tax accuracy, search engine ranking, live prices, interest and account status.

## Page-by-page specification and acceptance
| Page / route family | Layout priority | Required interactions, data & failure states |
|---|---|---|
| Home `/` | Short hero, calculator search, six curated tool links, optional real market educational panels, latest verified articles | Guest first; no made-up WLD balance or fabricated market freshness; empty feed label |
| Tools hub `/tools` | Intent tabs Save/Borrow/Stocks/Taxes/Retirement, searchable cards; locale badges | Existing canonical routes, no duplicate SEO thin pages; tool link works on 320px |
| Tool detail `/tools/*` | H1+jurisdiction/year, labeled inputs, immediate **full** result, breakdown, assumptions, reference sources, related reading; ad below primary result | No login wall before result; numeric errors inline; local save distinguished from server saved; verified correction links; illustrative tax disclaimers |
| Blog `/blog`, articles | Topic/country selector, editorial freshness/source chips, headline/hierarchy, readable article content, related tool | KR/US/JP/CN original articles; GREEN after verified checks may auto-publish, AMBER preapproved, RED blocked; overdue review alerts only, **never automatic unpublish/noindex** |
| Guide/glossary | Focused reading width, contents anchors, diagrams, canonical related calculator | Keyboard TOC, deep links; educational claims dated |
| Wallet `/wallet`, `/wallet/activity` | Actual balance, cash/bank pockets, ordered transaction rows, receipt details | Server-authenticated ledger; zero-value pocket transfer explained; owner-only, no fabricated success |
| Bank/deposits/loans | Account balances, product cards, fees/rates and duration, action confirmation | Quotes versus applied rates separated; submission receipt or outcome unknown; stale/disabled/switch states |
| Treasury/bonds/pension | Verified treasury figures, liquidity/reserve details, quotes, maturity/interest schedule | Read-only versus enabled action; actor status and immutable transaction receipt |
| Stocks/portfolio | Instrument identity, fictional market tag, chart time range, orderbook, order input, fills | Quote freshness, sample/live distinction, market halt, pending/partial/rejected fill, cost basis and fees |
| Fictional economy jobs/quests/progression | D style: playful pastel accent, progress rail, goal cards and celebratory verified receipt | Rewards only after ledger commit; capped animation; no forced streak or guaranteed WLD bonus |
| Fictional shop/businesses/casino | D accent selectively, product/inventory cards, game status and clearly labeled odds/limits if relevant | Explicit virtual-only label, eligibility, idempotency, rejected/degraded states; never visually mimic real bank |
| Account/auth/notifications | Accessible forms, plain privacy language, session status, preference controls | Auth validation, re-auth for sensitive actions, clear local/server states |
| Admin dashboard `/admin/*` | B-heavy dense metrics, filterable 2-level tables, audit trace, emergency controls visually separated | Actor/role gates, review dual control, confirmation with risk/reason, server receipts, no direct ledger override; all admin routes 320px |
| Admin SEO/blog | Publication queues, country and status filters, source receipts, review SLA warnings | No automated unpublishing on overdue; separate manual withdraw privilege, logged decision; GSC indexing ≠ crawler visit ≠ impressions |
| Corrections `/tools/corrections` and account reports (planned) | Public verified notices; member issue status | Only server-backed ticket ID; no private financial inputs published; planned route not claimed implemented |

## Responsive specification
- 320–399px: one column, one sticky action only if it cannot obscure legal disclosure, compact tables as key/value detail + accessible horizontal scoped table when needed.
- 400–767px: one column, no icon-only unlabeled calculator navigation, thumb-friendly controls.
- 768–1199px: 2-column editorial/tools, 1-column form+result if width constrains precision.
- >=1200px: max 1200px content, 12-column grid; results may stick beside inputs, never disconnected.
- Test EN (default) and KO second, then JA/ZH country pages, including text expansion, RTL only where supported, numeric/decimal and date region formatting.

## Accessibility, performance and release acceptance
WCAG 2.2 AA; text contrast >=4.5:1, large text >=3:1, visible focus, keyboard-first forms, aria-live polite for confirmed asynchronous changes, reduced motion, correct semantic tables and explicit error association. LCP <=2.5s, CLS <=0.1, INP <=200ms at p75 as goals, measured not promised. Content-first SSR, images with reserved dimensions; avoid decorative large hero delaying calculator.
Five complete responsive QA passes on authenticated and guest public screens incl admin at 320, 375, 390, 768, 1024, 1440. Validate positive/negative network, slow/offline, locale, contrast, keyboard, SR, save/retry/idempotency. Keep finance ACL/migrations, exact SHA CI, official Test backend and full authenticated E2E and zero-downtime rollback gates as required by master plan.
Prioritize P0 truthful status and broken UI; P1 shared tokens/header/forms plus tools; P2 account/bank/stocks; P3 D-mode gameplay plus article polish and admin. Separate design PR from source implementation PR. No current Production claim.

## References & evidence status
Existing project documents: `PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, F675-04 calculator journey, admin control center, DOCS_INDEX. Inspiration (visual patterns only, not copied assets): Mercury Banking, Stripe Dashboard, Linear, Revolut. External reference inspiration does not override product truth or accessibility acceptance.
