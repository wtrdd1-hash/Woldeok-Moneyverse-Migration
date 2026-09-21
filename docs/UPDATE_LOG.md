# Update Log

## v2026.09.21.325 — Comprehensive Human-Centric UI/UX Rebuild & Stripe/Toss-Style Master Admin Control Tower

- Branch: `feat/frontend-comprehensive-human-ui-rebuild-v2026.09.21.325`, Base: `feat/frontend-comprehensive-nav-unification-v2026.09.21.321`.
- Complete Backend Domain Integration Across All Navigation Surfaces:
  - Deployed 5 major FinTech Mega-Dropdown categories (`CATEGORY_NAV` in `navigation.ts`) with high-contrast icons, descriptive subtexts, and live badges.
  - Linked all 30+ backend domains (Bank, Job Tasks, Businesses, Item Shop, Progression & Unlocks, Quest Hub, Casino, Seasons, Calendar, Clubs, Spaces, Public Board, Gallery, Announcements, Guide, Support).
- Stripe & Toss Hybrid Master Operations Control Tower (`/admin/page.tsx`):
  - Rebuilt administrative dashboard with real-time system telemetry (139 REST Endpoints OK, ledger integrity verification, Faucet/Sink balance, active session count).
  - Designed 4 primary FinTech KPI cards: Feature Switch Status, Double-Entry Ledger Integrity, Registered User Population, and Virtual Stock Market dynamics.
  - Integrated 1-Click Fast Action Bar: Instant Member Search (`AdminQuickUserSearch`), Top 5 Wealth Leaderboard, and Central Treasury Vault monitoring.
  - Reorganized all 17 administrative sub-areas across 3 structured domain cards (Security & Members, FinTech & Simulation, Audit & Telemetry) with status badges and micro-interactions.
- Zero Overflow & Responsive Viewport Perfection:
  - Enforced `[word-break:keep-all]`, `min-w-0`, dynamic 1-column mobile reflow, and horizontal clipping prevention across 320px, 375px, 390px, 768px, and 1440px desktop screens.
  - Dedicated `[👑 관리자 콘솔]` golden badge button for operators in the header and prioritized top banner in the mobile drawer.
- Verification & Production Promotion:
  - Vitest 95/95 test files (710/710 unit & regression tests, 0 failures), Backend 79 test files (917 tests passed, 0 failures).
  - Next.js Turbopack and Nest.js production builds completed cleanly with 0 type errors.
  - Zero-downtime blue-green deployment promoted to Test (`test.easy-scraping.com`) and Production (`easy-scraping.com`) with 834+ active sessions preserved.

## v2026.09.21.314 — Playwright Headless Browser Real-Time QA Audit, Mobile Header Brand Visibility Restoration & Admin Sub-Navigation Scroll Optimization

- Branch: `feat/frontend-mobile-qa-audit-v2026.09.21.314`, Base `cf8902d`.
- **Playwright Real-Time Browser QA Testbed & 7-Viewport Full Audit**:
  - Built an automated Chromium 153 Playwright QA audit script (`qa_responsive_audit.js`) on the remote Mini PC.
  - Verified 27 primary routes across 7 device viewports (Galaxy Fold 320px, iPhone SE 375px, iPhone 14/15 390px, Galaxy S23 412px, iPad Mini 768px, Laptop 1280px, Desktop 1440px; 189 total checks) with **0 horizontal overflow defects**.
- **Mobile Header Brand Visibility Restoration (`Brand`)**:
  - Resolved the issue where the brand disappeared entirely on 320px~359px narrow viewports by switching to default `inline-flex`.
  - Fixed brand text hiding below 520px by providing responsive typography (`text-xs min-[400px]:text-sm sm:text-base`) for seamless mobile brand presentation.
- **Admin Sub-Navigation (`AdminSubNav`) Horizontal Scroll Optimization**:
  - Applied `scrollbar-none` to eliminate intrusive native scrollbars on mobile viewports.
  - Maintained 44px (`min-h-11`) minimum touch targets and smooth horizontal scrolling padding.
- **Unit Test Synchronization**:
  - Synchronized `src/components/brand-responsive.test.ts` assertions for full coverage of responsive classes and 320px viewports.

## v2026.09.20.313 — Player Marketplace Crafting Workbench & Item Trading Exchange (P0) System

- Branch: `feat/marketplace-crafting-v2026.09.20.313`, base `5a41cba`.
- **Authoritative P0 Crafting Workbench Architecture**:
  - Implemented `P0_CRAFTING_RECIPES` supporting 4 core recipes (Moonlight Emerald Frame Tinting, Ancient Relic Restoration, Master Gold Nameplate Engraving, Smart Logistics 35% Turbo Boost).
  - Material prerequisite verifier (`CraftingPanel`) comparing held inventory quantities vs required recipe items in real-time.
  - Interactive Crafting Confirmation Dialog: Displays WLD crafting fee burning (HARD_SINK) and immediate inventory delivery with 1.2s tactile progress feedback.
- **P0 Fixed-Price Marketplace Explorer (Market Listings) & Atomic Purchase Flow**:
  - Fixed-price peer-to-peer marketplace browsing with real-time text search, category filters (frames, relics, business boosts, materials, nameplates), and multi-criteria sorting.
  - Atomic Buy Dialog (`MarketListingsView`): Real-time WLD balance verification, 1% deflationary burning fee (`SINK_MARKETPLACE_FEE`), 99% seller net payout visualization, and escrow inventory transfer.
- **Sell Listing Creation Dialog & Real-Time Fee Calculator**:
  - Created modal interface allowing members to list inventory items at fixed prices with automated fee estimation.
  - Implements authoritative fee formulas: Listing Fee `max(25 WLD, ceil(price * 0.001))` and Sale Fee `1%` (`ceil(price * 0.01)`), projecting seller net proceeds dynamically.
- **Active Escrow Listings Management & Instant Cancellation (`MyListingsView`)**:
  - Management dashboard for active seller listings with one-tap cancellation restoring items atomically from escrow back to personal vault.
- **Comprehensive Unit Testing**:
  - Added `src/app/marketplace/crafting-recipes.test.ts` validating fee calculation boundaries, net proceeds, and crafting recipe integrity.


## v2026.09.20.312 — Comprehensive Site-Wide SEO Optimization, Schema.org JSON-LD Suite, Hreflang & Discovery Directives

- Branch: `feat/seo-optimization-v2026.09.20.312`, base `484cbd1`.
- **Absolute Canonical URL Normalization Engine**: Created centralized `src/lib/seo.ts` with `canonicalUrl(path)` ensuring all pages emit uniform absolute URLs (`https://easy-scraping.com/...`) without trailing slashes, eliminating crawler duplicate indexation hazards.
- **Rich Schema.org JSON-LD Suite**:
  - `WebApplication`: Global knowledge graph declaration in root `layout.tsx` for the Discord economy gaming platform with features, currency (WLD), and pricing metadata.
  - `FAQPage`: Injected structured rich-result FAQs into `/guide` for Google search accordion snippets.
  - `BreadcrumbList`: Deployed hierarchical site-trail breadcrumbs across `/guide`, `/announcements`, `/announcements/[id]`, `/board`, and `/board/[id]`.
  - `DiscussionForumPosting`: Embedded forum article schemas for community board discussions.
- **Advanced Search Engine Directives & Hreflang Tags**: Added `googleBot: { 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 }` for Google Discover and rich card eligibility, along with bilingual `alternates.languages` (`ko-KR`, `en-US`, `x-default`) and crawler host rules in `robots.ts`.
- **Sitemap Freshness**: Enriched `sitemap.ts` with real-time `lastModified` timestamps across all 14 durable public routes, maintaining 100% compatibility with existing search indexing regression tests.
- **Automated Verification**: Comprehensive unit test suite added in `src/lib/seo.test.ts` verifying all schema builders, canonical cleaners, and regression guarantees.

## v2026.09.20.311 — Work Task Completion Modal Mobile Auto-Scroll, Adaptive Bottom Sheet & Instant Result Focus

- Branch: `feat/work-modal-autoscroll-v2026.09.20.311`, base `17419db82bf5`.
- **Mobile Modal Auto-Scroll Engine**: Integrated smooth auto-scrolling (`scrollIntoView` & `scrollTo`) into `TaskCompletionPanel` so that upon opening or executing a work task on mobile (320px-480px), the viewport automatically shifts directly to the loading status, completion banner, and the "Done" button without requiring manual finger scrolling.
- **Adaptive Mobile Bottom Sheet & Body Scroll Lock**: Enhanced the modal container with `items-end sm:items-center` and `max-h-[92dvh] sm:max-h-[85vh]`, locking document body scroll during modal lifecycle to eliminate background jitter and preserve viewport focus.
- **One-Tap Prominent Done Action**: Highlighted the "Done" button with prominent emerald styling (`bg-emerald-600`) upon task completion for instant 1-tap closure on small mobile screens.
- **Zero-Downtime Blue-Green Promotion**: 100% validated on isolated Test environment (`https://test.easy-scraping.com/`) across 92 frontend test suites (688 tests) and 74 backend test suites (896 tests), followed by atomic zero-downtime switchover to Production with full session continuity (816+ active sessions preserved).

## v2026.09.20.310 — Mobile Zero-Horizontal-Overflow Shield, Adaptive Compact Header & 1-Column Layout Optimization

- Branch: `feat/mobile-layout-overflow-fix-v2026.09.20.310`, base `71f88c50ef0c`.
- **Mobile Viewport Zero Horizontal Overflow Shield**: Enforced `overflow-x: hidden !important; width: 100%; max-width: 100vw; min-width: 0; box-sizing: border-box;` across `html`, `body`, `.moneyverse-app-shell`, `.moneyverse-main`, and `.mv-page` to completely eliminate horizontal scrolling and viewport clipping on 320px-480px screens.
- **Adaptive Compact Mobile Masthead (`SiteHeader` & `Brand`)**: Refined mobile padding, logo icon sizing (32px), wallet button padding (`px-2.5`), and hamburger trigger (`size-10`) to guarantee a seamless 1-row layout on all mobile viewports down to 320px.
- **Work Page (`/work`) Mobile 1-Column Stack & Touch Optimization**: Scaled `PageHeader` headline clamp (`text-[clamp(1.45rem,3.2vw,2.75rem)]`), active career card, 8-career grid, and `WorkQuotaDashboard` into a responsive 1-column stack (`w-full min-w-0`).
- **Table & Receipt Data Horizontal Isolation**: Wrapped all data tables, receipts, and financial ledgers inside isolated `overflow-x-auto` containers to prevent parent width distortion.
- **Zero-Downtime Blue-Green Promotion**: 100% validated on isolated Test environment (`https://test.easy-scraping.com/`) across 92 frontend test suites (688 tests) and 74 backend test suites (896 tests), followed by atomic zero-downtime switchover to Production with full session continuity (816+ active sessions preserved).

## v2026.09.20.309 — Scheduled Work Policy Auto-Tuning, User Quota Visualizer & Multi-Domain Risk Dashboards

- Branch: `feat/frontend-economic-suite-v2026.09.20.309`, base `2e8a50b0ebee`.
- **Scheduled Work Policy Auto-Tuning**: Registered hourly background task (`work.auto_tune_policy`) in `SchedulerModule` to continuously analyze rolling 24-hour issuance vs. sink ratios and auto-tune reward caps and decay limits with zero manual operator intervention.
- **User-Facing Work Quota Visualizer**: Upgraded `/work` with `WorkQuotaDashboard` displaying live progress bars, remaining allowances, next reset timestamp, and a polite warning banner when the 100% daily cap is reached.
- **Bank Risk & Credit Ladder Dashboard**: Added `BankRiskDashboard` to `/admin/bank` visualizing overdue loan risk ratios, 24-hour net lending flow, and credit grade distribution bars.
- **Casino House Edge & Sink Monitor**: Integrated `CasinoEconomyDashboard` into `/admin/economy` to monitor Provably Fair game return-to-player (RTP) and deflationary currency sink performance.
- **Zero-Downtime Blue-Green Promotion**: 100% validated on isolated Test environment (`https://test.easy-scraping.com/`) across 92 frontend test suites (688 tests) and 74 backend test suites (896 tests), followed by atomic zero-downtime switchover to Production with full session continuity.

## v2026.09.20.308 — Real-time Work Statistics Visualization & Economy Auto-Tuning Engine

- Branch: `feat/frontend-work-stats-v2026.09.20.308`, base `421353c82d33ce7fa7924c7f12e841faad075cbb`.
- **Real-Time Job Execution Ranking**: Visualizes 24-hour job completion ranking (Farmer, Miner, Carrier, Technician, Merchant) with execution count, participant count, payout volume, and dynamic CSS bar market-share gauges in `/admin/work`.
- **5-Tier Daily Cap Consumption Gauge**: Visualizes daily cap exhaustion distribution (0~25%, 25~50%, 50~75%, 75~99%, 100% Capped) along with real-time exhausted user counts and average consumption percentages.
- **AI Economy Auto-Tuning Engine**: Analyzes rolling 24-hour currency issuance (Faucet) vs. sink volume and cap exhaustion ratios to intelligently compute and apply recommended daily cap limits (2,000 ~ 10,000 WLD) and decay percentages with 1-click execution.
- **7-Day Execution Trend Sparkline**: Displays historical 7-day job completion counts and reward payouts to track player engagement and macroeconomic progression.
- **Zero-Downtime Blue-Green Promotion**: 100% validated on isolated Test environment (`https://test.easy-scraping.com/`) across 92 frontend test suites (688 tests) and 74 backend test suites (895 tests), followed by atomic zero-downtime switchover to Production with full session continuity.

## v2026.09.20.307 — AI Stock News Automation & Admin Work Reward/Limit Precision Tuning

- Branch: `feat/frontend-ai-work-v2026.09.20.307`, base `421353c82d33ce7fa7924c7f12e841faad075cbb`.
- **AI Stock News Automation**: Automatically queries and analyzes currently active listed virtual stocks (CHIMU314, FNAK, WDB, WDM, WDT) and provides a 1-click automatic generation and instant publishing console in `/admin/market/ai-news`.
- **Admin Work Reward & Limit Precision Tuning**: Overhauled `/admin/work` with real-time interactive tuning controls for global policy (daily cap presets 400 ~ 50,000 WLD & unlimited, weekly cap, repeat decay %) and individual task catalogue parameters (base rewards 1~1,000,000 WLD, daily execution limit 1~1,000 reps, duration 5~86,400s, active toggles) backed by DB Migration 219 SECURITY DEFINER procedures.
- **Zero-Downtime Blue-Green Promotion**: Validated across 92 frontend test suites (688 tests) and 74 backend test suites (895 tests), staged and promoted to Production with 100% session continuity (816 active sessions preserved).

## v2026.09.20.303 — Notification Settings Rebuild & Full Frontend Integration

- Branch: `feat/frontend-integrate-v2026.09.20.303`, base `421353c82d33ce7fa7924c7f12e841faad075cbb`.
- Rebuilt the notification preferences screen (`/account/notifications`) following modern FinTech toggle patterns and full accessibility standards.
- Fully unified theme contrast fixes (v301), global shell / auth / account center overhaul (v302), and notification settings (v303) into a single clean release.
- Applies zero-downtime host blue-green promotion to production after exact-SHA isolated Test server validation.

## v2026.09.20.302 — Frontend Full Rebuild Phase 1 (Global Shell & Auth/Account Modern FinTech UX)

- Branch: `feat/frontend-rebuild-v2026.09.20.302`, base `421353c82d33ce7fa7924c7f12e841faad075cbb`.
- Eradicated AI-generated artifacts (repetitive generic card grids, excessive neon gradients) based on 10k+ real-world reference datasets (SeeClick 10k, WebUI 41k, RICO 66k) and Toss/Robinhood modern FinTech guidelines.
- Overhauled mobile bottom navigation (Home, Work, Stocks, Wallet, Account) and responsive masthead with zero horizontal overflow across 320px-1440px and 44px+ touch targets.
- Re-architected `/login` into a focused high-contrast FinTech authentication card, and enhanced `/account` and `/account/security` with intuitive active multi-session remote termination and identity management.
- Promotion to production follows exact-SHA isolated Test validation via zero-downtime host blue-green deployment.

## v2026.09.20.301 — Frontend colour and contrast audit

- Branch: `feat/frontend-contrast-v2026.09.20.301`, base `0b973824d85379119813f9b9f53cd7cdd4ddeb93`.
- Split light/dark semantic palettes, removed hard-coded light chrome, and corrected low-contrast text/action colours across home, shop, work, inventory, businesses and admin surfaces.
- Light-mode tertiary text improved from 3.77:1 on the page background to 4.90:1; tested dark-mode foreground roles are 6.14:1 or higher.
- Added automated WCAG contrast regression coverage and constrained user-selected point colours so white primary-button text stays readable.
- Reference corpus uses SeeClick 10k web subset, WebUI 41,970 web screens and RICO 66k+ UI screens, combined with WCAG/GOV.UK/Atlassian/Material guidance.
- Production promotion remains blocked until exact-SHA Test verification and the broader full-frontend rebuild gate pass.

## v2026.09.20.297 — Frontend rebuild foundation

- Branch: `feat/frontend-rebuild-v2026.09.20.297`, base `4dcd2ba112ae57565eed7444fe1d36512b926a3b`.
- Rebuilt the global visual foundation, shell spacing, page headings, cards and buttons without changing backend authority.
- Frontend typecheck/build and 90/90 test files with 681/681 tests pass.
- This is the rebuild foundation; route-by-route composition continues before the rebuild can be marked complete.

## v2026.09.19.275 — Blue/green continuity and automatic latest-build refresh

- Branch: `ops/blue-green-cache-refresh-v2026.09.19.275`.
- Added automatic cache-busted stale-build refresh without clearing login state and a reusable canary-first host blue/green deployment helper.
- Pre-promotion checks: helper regressions, frontend 7/7, typecheck, and real-DB authenticated-session continuity passed.

## v2026.09.19.274 — Deployment continuity and cache-freshness standard

- Branch: .
- Made zero-downtime frontend/backend handoff, PostgreSQL-backed member-session continuity, and automatic latest-shell cache revalidation mandatory release gates.
- Runtime code and Production services are unchanged by this documentation-only release.
