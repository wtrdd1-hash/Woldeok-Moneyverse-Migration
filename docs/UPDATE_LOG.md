# Update Log

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
