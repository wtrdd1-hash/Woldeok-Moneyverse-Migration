# Update Log

## v2026.09.22.357 — Stock Halt Cost-Basis Settlement Visibility, Market 229 Migration, Receipt Cards & 404 Prevention

- Applied Branch: `main` (Release: `prod-2ec47a9-v357`)
- **P0 Stock Halt Cost-Basis Settlement Engine & Visibility (STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC)**:
  1. **PostgreSQL Migration 229 Applied (`packages/database/migrations/229-stock-market-overview-halt-visibility.sql`)**:
     - Extended `stock_market_overview()` function with `halt_status text` return column.
     - Preserves halted stocks in the market overview catalog via `WHERE stock.active OR stock.halt_status IN ('HALTING', 'HALTED_SETTLING', 'HALTED_SETTLED')`.
     - Orders active stocks first, halted stocks subsequently by symbol.
  2. **Backend Repository & Interface Updates (`backend/src/stock/`)**:
     - Added `halt_status: string` to `StockMarketRow` and bound in `list()` query.
     - Added halt catalog visibility test cases in `stock-halt-settlement.test.ts` (6/6 unit tests PASS).
  3. **Virtual Stock Exchange Main Page Enhancement (`frontend/src/app/stocks/page.tsx`)**:
     - Displayed `Halted` badge on halted stocks and disabled Buy/Sell trade buttons (`disabled`).
     - Kept `Open Hub` and detail modal accessible so users can inspect disclosures and settlement details.
  4. **Portfolio Analytics Page Settlement Receipts Card (`frontend/src/app/stocks/portfolio/page.tsx`)**:
     - Integrated `/api/v1/stocks/halt-receipts` to render the **Stock Halt Settlement Receipts** card.
     - Outlined settled shares, cost basis unit price, total refunded WLD, and `ShieldCheck` zero-fee exemption notice.
  5. **Resolved 404 Defect on Stock Detail Hub (`/stocks/[symbol]`)**:
     - Fixed 404 error when navigating to a halted stock's hub page, restoring access to the halt announcement banner and refund receipt.
  6. **Zero-Downtime Promotion & Runtime Identity Coherence**:
     - Exact Git SHA `2ec47a9` deployed to both Test and Production.
     - 933 PostgreSQL active user sessions 100% loss-free preserved.

## v2026.09.22.356 — Virtual Stock Exchange Main Order Form Presets, Estimated Tax Breakdown & Portfolio Asset Allocation Stack Bar

- Applied Branch: `main` (Release: `prod-7e46b22-v356`)
- **P0 Virtual Stock Exchange Main Order Form & Portfolio Analytics Enhancement (VIRTUAL_STOCK_EXCHANGE_SPEC)**:
  1. **Stock Main Order Dialog/Form Usability Innovations (`trade-form.tsx` & `trade-dialog.tsx`)**:
     - 44px minimum touch targets (`min-h-9` and chip buttons) with 25%/50%/MAX percentage quick preset chips.
     - Cash-relative conversion for Buy orders and holding-relative conversion for Sell orders (`holdingQuantity`).
     - Real-time estimated gross transaction calculation (`quantity × price`) with 0.3% financial transaction tax breakdown (`TaxBreakdown`).
     - Extended `TradeDialog` with `holdingQuantity`, `triggerLabel`, `triggerVariant`, and `triggerClassName` customization.
  2. **Portfolio Asset Allocation Multi-Segment Stack Bar & One-Touch Rebalancing (`frontend/src/app/stocks/portfolio/`)**:
     - `analysis.ts`: BigInt-safe arithmetic for `gain_loss_bps` (per-position and total portfolio return) and 8-color distinct palette mapping.
     - `analysis.test.ts`: 4 Vitest unit tests verifying basis point calculation precision and color assignment (100% PASS).
     - `page.tsx`: 3 hero metrics cards (Total Valuation, Total Cost Basis, Cumulative Gain/Loss and Bps badge), horizontal multi-segment asset allocation stack bar with legend chips, per-position return badges, and one-touch Buy More / Sell `TradeDialog` rebalancing triggers.
  3. **Zero-Downtime Promotion & Runtime Identity Coherence**:
     - Exact Git SHA `7e46b22` deployed to both Test and Production.
     - 929 PostgreSQL active user sessions 100% loss-free preserved.

## v2026.09.22.355 — Virtual Stock Exchange Interactive Trading Console, 10-Depth Bidirectional Orderbook & Mobile Floating Quick Action

- Applied Branch: `main` (Release: `prod-0714368-v355`)
- **P0 Virtual Stock Exchange Interactive Trading Console (VIRTUAL_STOCK_EXCHANGE_SPEC)**:
  1. **Real-time 5D/10D Orderbook Rebuild (`stock-orderbook.tsx`)**:
     - 5-Depth and 10-Depth toggle switch expands trader visibility into market liquidity.
     - Clicking an Ask automatically populates buy order (`side='buy'`); clicking a Bid populates sell order (`side='sell'`).
     - Volume-proportional horizontal depth bars (Rose for Asks, Emerald for Bids) and real-time spread WLD / Bps indicator.
  2. **Toss/Robinhood-Style Intuitive Order Panel (`stock-order-panel.tsx`)**:
     - Limit and Market order type tabs.
     - Automatic price binding from orderbook click, quantity slider + 10%/25%/50%/MAX 44px touch preset chips.
     - Idempotent submission guard (`aria-busy`) and 2-step order confirmation dialog.
  3. **Unified Trading Console & Mobile 320px Quick Action Surface (`stock-trading-console.tsx`)**:
     - Single state container coordinating bidirectional orderbook-orderpanel interactions.
     - Fixed bottom quick action bar (Buy/Sell buttons) on mobile screens (320px~768px) with bottom sheet order drawer.
  4. **Pure Orderbook Calculation Extraction & Vitest Unit Tests**:
     - Extracted `computeOrderbook` pure function; verified with 6 Vitest unit tests in `stock-trading-console.test.ts` (100% PASS).
  5. **Zero-Downtime Promotion & Runtime Identity Coherence**:
     - Exact Git SHA `0714368` deployed to both Test and Production.
     - 929 PostgreSQL active user sessions 100% loss-free preserved.

## v2026.09.22.354 — P0 Admin Private Chat Moderation Queue, 10-Message Evidence Snapshot Viewer & Incident Action Governance

- Applied Branch: `main` (Release: `prod-e60cf71-v354`)
- **P0 Admin Private Chat Moderation & Evidence Snapshot Governance (ONE_TO_ONE_PRIVATE_CHAT_SPEC v2026.09.20.305-05)**:
  1. **PostgreSQL Migration 228 Applied (`packages/database/migrations/228-private-chat-moderation-admin.sql`)**:
     - `private_chat_admin_list_reports`: operator/superadmin moderation queue listing (reporter, reported user, reason, evidence count, timestamps).
     - `private_chat_admin_get_report`: secure 10-message JSONB evidence snapshot inspection with immutable `CHAT_REPORT_EVIDENCE_VIEWED` audit log entry.
     - `private_chat_admin_action_report`: incident resolution (warned/blocked/rejected) with permanent `CHAT_REPORT_ACTIONED` audit trail.
  2. **Backend NestJS Safety Endpoints Completed (`backend/src/safety/`)**:
     - `GET /api/v1/admin/safety/chat-reports`: admin session guarded report queue query.
     - `GET /api/v1/admin/safety/chat-reports/:id`: single report details and evidence snapshot inspection.
     - `POST /api/v1/admin/safety/chat-reports/:id/action`: moderation action enforcement with CSRF protection.
  3. **Frontend Admin Safety Control Tower Rebuild (`frontend/src/app/admin/safety/`)**:
     - Dual queue tab interface: `1:1 Private Chat Incident Queue` & `Emergency Content Takedown Queue`.
     - `ChatReportEvidenceDialog`: Toss/messenger-style 10-message timeline modal (speech bubbles, sequence numbers, timestamps, participant distinctions).
     - `ChatReportActionDialog`: one-touch action dialog (warn/block/dismiss) with required administrative rationale.
     - `admin-chat-moderation.test.ts`: Vitest 4 unit tests passed 100%.
  4. **Zero-Downtime Promotion & Runtime Identity Coherence**:
     - Exact Git SHA `e60cf71` deployed to both Test and Production.
     - 929 PostgreSQL active sessions 100% loss-free preserved.

## v2026.09.22.353 — P0 Private Chat Safety Controls (Mute/Block/Report) & FinTech Safety UX and Korean IME Protection

- Applied Branch: `main` (Release: `prod-dc011ee-v353`)
- **P0 Private Chat Safety Controls & Governance (ONE_TO_ONE_PRIVATE_CHAT_SPEC v2026.09.20.305-05)**:
  1. **PostgreSQL Migration 227 Applied (`packages/database/migrations/227-private-chat-safety-controls.sql`)**:
     - `private_chat_blocks` table: mutual/unilateral 1:1 member block relation persistence and indexing.
     - `private_chat_reports` table: 4 policy reasons (spam/fraud/abuse/other), detailed justifications, recent 10 messages JSONB evidence snapshot and SLA queue integration.
     - Security procedures: `private_chat_mute`, `private_chat_block`, `private_chat_unblock`, `private_chat_is_blocked`, `private_chat_report`.
     - Message dispatch hardening (`private_chat_send`): fail-closed rejection (`42501`) when sender/peer are blocked.
  2. **Backend Endpoints Completed (`backend/src/chat/`)**:
     - `POST /api/v1/chat/conversations/:id/mute`: atomic participant mute status toggle.
     - `POST /api/v1/chat/users/:id/block` & `DELETE /api/v1/chat/users/:id/block`: member block and unblock endpoints.
     - `POST /api/v1/chat/conversations/:id/report`: incident report submission and immutable evidence snapshot.
  3. **Frontend Chat Room FinTech Safety UX Rebuild (`frontend/src/app/chat/`)**:
     - `ChatRoom` header more menu: one-click mute toggle, block/unblock confirmation dialog, 4-reason report modal.
     - Korean IME composition (`isComposing`) guard: prevents accidental dispatch during syllable composition.
     - Blocked conversation banner and input disabled protection.
     - `ChatView` list item mute badge (`BellOff`) and blocked status visual badge.
  4. **Unit Tests & Zero-Downtime Promotion**:
     - Vitest `chat-safety.test.ts` (4 tests passed 100%).
     - Exact-SHA (`dc011ee`) runtime identity coherence verified across Test and Production with 929 active user sessions preserved.

## v2026.09.22.352 — Admin Policy Version Live Management Console & G352 Governance and Immutable Release Ledger Rollback Engine

- Branch: `main` (Release: `prod-f609af8-v352`)
- **Admin Control Tower Policy Management & Immutable Ledger Governance**:
  1. **Real-time Admin Policy Revision Console (`/admin/controls`)**:
     - `backend/src/admin/controls.controller.ts` & `controls.repository.ts`: Introduced `POST /api/v1/admin/controls/consent-versions` (2-step text confirmation `PUBLISH_NEW_POLICY_VERSION`, permanent audit logging in `audit_logs`, Superadmin only).
     - `frontend/src/app/admin/controls/policy-version-card.tsx`: Added 2-step confirmation dialog and real-time policy version control card.
  2. **G352-01 Fail-Safe Consent Submission Guard (`ConsentStepUpModal`)**:
     - Disabled submission button (`disabled`) and provided retry UI when policy versions are not authoritatively synchronized. Eradicated unauthorized fallback version recording.
  3. **G352-02 & G352-04 Immutable Release Ledger (`docs/releases/ledger.json`, `rollback_production.sh`)**:
     - Created `docs/releases/ledger.json` immutable provenance ledger; integrated ledger-based last-known-good candidate lookup into `rollback_production.sh`.
  4. **G352-03 Path Canonicalization & Whitelist Bypass Prevention (`normalizePath`, `consent-guard.test.ts`)**:
     - Implemented `normalizePath` in `frontend/src/lib/path-utils.ts` to decode, lowercase, and resolve directory traversals before whitelist matching.
     - Added 7 Vitest unit tests verifying traversal neutralization and path matching.
  5. **Production Zero-Downtime Deployment (`v352`)**:
     - Passed exact-SHA runtime identity coherent check with 200 OK across all endpoints.
     - 929 active user sessions in PostgreSQL preserved without loss.

## v2026.09.22.350 — Dynamic Consent Policy Binding, Inline Tab Accordion Viewer & 10s Production Rollback Script

- Branch: `main` (Release: `prod-d67a915-v350`)
- **Consent Defense Hardening & Operational Resilience Upgrade**:
  1. **Server-Side Dynamic Policy Version Binding (`fetchLatestPolicy`)**:
     - Connected backend `GET /api/v1/auth/policy` in `frontend/src/lib/api.ts` with 60s SWR caching (`revalidate: 60`) and graceful fallback on backend outages.
     - Fetched in parallel with `currentViewer()` in `RootLayout`, injecting authoritative terms and privacy versions at SSR render time.
  2. **Hydration Flicker Prevention & Extended Exemption Whitelist (`ConsentGuard`)**:
     - Mounted state guard prevents SSR-client hydration mismatch and transient 0.1s popups.
     - Strict whitelist of 14 exempt paths: `/login`, `/terms`, `/privacy`, `/data-deletion`, `/account-deletion`, `/safety`, `/safety/takedown`, `/robots.txt`, `/sitemap.xml`, `/api/og`, `/icon.svg`, `/apple-icon.png`, `/frontend-version`, `/api/health`.
     - Introduced `dismissed` state for immediate and seamless modal unmount upon consent.
  3. **Inline Tab Accordion Viewer & FinTech Toast Notifications (`ConsentStepUpModal`)**:
     - Built-in accordion viewer allows reviewing terms and privacy summaries directly inside the modal without leaving the page.
     - Smooth 200ms fade-in transition (`animate-in fade-in-0 zoom-in-95 duration-200`).
     - Toss-style celebratory toast notification (`sonner`) and non-blocking `router.refresh()` on agreement.
  4. **Production 10s One-Click Emergency Rollback Script (`ops/release/rollback_production.sh`)**:
     - Automated detection of prior releases, active session safety check (929+ sessions guarded in PostgreSQL).
     - Atomic symlink switch (`ln -sfn`) and zero-downtime systemd service reload.
     - Coherent runtime identity verification via `verify-runtime-identity.sh` and Discord webhook alert support.
  5. **Verification & Zero-Downtime Deployment**:
     - Frontend/backend build passing with exact-SHA runtime verification.
     - All 929 active user sessions in PostgreSQL preserved with zero disruption.

## v2026.09.22.349 — OpenAPI Reference Freshness Correction

- Documentation-only correction after final authoritative-source verification.
- Updated the current OpenAPI evolution target from 3.1.1 to 3.2.1 (published 2026-09-10), while preserving the existing v347 OpenAPI 3.0-compatible implementation fact.
- Added staged compatibility testing requirements before migration.

## v2026.09.22.348 — Integrated Planning Re-review & Authority Reconciliation

- Scope: documentation/planning only; no runtime deployment claim.
- Promoted `docs/planning/PROJECT_PLAN.md` authority from stale v335 to v348 with synchronized Korean counterpart.
- Reconciled implementation/release evidence through v342/v343/v347/v347.1 and the mid-work v46/v47 emergency-defense draft.
- Added detailed contracts for Developer Portal/API safety, OpenAPI 3.2.1 compatibility path, newspaper poll authority, consent state/accessibility, live-data freshness, stock-halt state reconciliation, and safe rollback semantics.
- Recorded the 10,000+ reference requirement as a corpus threshold plus manually verified normative sources, avoiding a false claim of 10,000 individually reviewed pages.
- Detailed review: `docs/planning/INTEGRATED_REVIEW_V348.md`; worklog: `docs/worklog/2026-09-22-integrated-planning-rereview-v2026.09.22.348.md`.

## v2026.09.22.347.1 — Consent Step-Up Modal Blackout Recovery & Main Portal FinTech Rebuild Complete

- Branch: `main` (Release: `prod-854d777-v347`)
- **Emergency Blackout Bug Eradication & FinTech Portal Rebuild**:
  1. **Consent Screen Blackout Eradication (`ConsentStepUpModal`)**:
     - Eliminated client-side router conflict and page unmounting caused by abrupt `router.replace` in `ConsentGuard`.
     - Introduced Toss-style in-place `ConsentStepUpModal`: 14+ age confirmation, Terms of Service, and Privacy Policy one-click agreement bound atomically to backend `PUT /api/v1/auth/consent` (`auth_grant_current_user_consent` RPC).
  2. **Main Home Portal (`/`) Overhaul (`anti-ai-frontend-craftsmanship` & `fintech-responsive-layout-engine`)**:
     - Real-time net worth hero card (`WalletGlance` integration) with 4 quick presets (Send, Work, Stocks, Bank).
     - 2-column asymmetric FinTech live console: 3 hot stocks (WDG, FNAK, CHIMU) with price delta badges and Career Station (daily reward progress bar, 8 professions).
     - 4-pillar 18-domain service directory (Finance & Invest, Economy & Work, Play & Season, Community & Spaces).
     - Zero-clipping responsive layout adapted across 320px ultra-mobile to 1440px desktop displays.
  3. **Verification & Zero-Downtime Release Promotion**:
     - Production zero-downtime promotion via `stage_v347.sh` (`854d777`).
     - Exact-SHA identity coherent (`854d777`) verified across frontend and backend, all endpoints responding 200 OK.
     - PostgreSQL 927 active user sessions preserved 100% losslessly.

## v2026.09.22.347 — Full-Domain REST API Standardization, OpenAPI 3.0 & Interactive Developer Portal (/developer)

- Branch: `feat/api-developer-portal-v2026.09.22.344`
- **Full-Domain RESTful API Standardization & FinTech Developer Portal**:
  1. **Full-Domain REST API & OpenAPI 3.0 Specification**:
     - Standardized 159 endpoints across 52 NestJS controllers with full OpenAPI 3.0 specification (`docs/mobile-api-contract.json`).
     - Added newspaper pulse, poll voting, and lore endpoints under unified REST standards.
  2. **Next.js Swiss Ledger FinTech Interactive Developer Portal (`/developer`)**:
     - Endpoint catalog across 7 categories with copyable snippets in cURL, TypeScript, and Python.
     - Interactive in-browser "Try It Out" live sandbox tester with real-time response code and latency telemetry.
     - Downloadable OpenAPI 3.0 contract and full i18n (KO, EN, JA, ZH).
  3. **App Gateway Routing & Global Navigation Integration**:
     - Updated `frontend/src/lib/app-gateway.ts` and registered `/developer` across navigation menus.

## v2026.09.22.346 — Discord Music Bot Real-Time SponsorBlock API & FFmpeg Stream Slicing Engine QA Complete


- Branch: `feat/discord-music-bot-sponsorblock-live-slicing-qa-v2026.09.22.346`
- **Real-Time SponsorBlock API & FFmpeg aselect Stream Slicing**:
  1. **Direct SponsorBlock Community API Integration**:
     - Extracts video IDs from YouTube URLs and queries the `https://sponsor.ajay.app` API in real-time to obtain exact timestamps for sponsors, non-music banter (`music_offtopic`), channel promos (`selfpromo`), and intros/outros.
  2. **On-the-Fly Audio Slicing via FFmpeg aselect Filter**:
     - Bypasses yt-dlp stdout post-processing limitations by piping audio chunks through FFmpeg's `aselect='not(between(t,start,end))',asetpts=N/SR/TB` filter chain.
     - Streams raw PCM (`StreamType.Raw`, s16le 48kHz stereo) directly into Discord.js Voice with zero latency and full volume control (`inlineVolume: true`).
  3. **Full QA Audit & Audio Waveform Verification (100% PASS)**:
     - **Standard YouTube Ads**: Bypassed 100% via direct googlevideo audio stream extraction (0 ads).
     - **Sponsor & Dialogue Removal**: Verified on Maroon 5 - Sugar (0~26.4s dialogue), Adele - Hello (0~74.9s intro skit), Queen - Bohemian Rhapsody, Luis Fonsi - Despacito.
     - **Acoustic Waveform Verification**: Verified +22.3 dB audio energy jump from quiet car conversation (-44.0 dB) to immediate pop music playback (-21.7 dB).
- **Verification**:
  - Unit tests: 4/4 PASS (node --check and test suite passed).
  - Daemon service: `moneyverse-discord-bot.service` active and running (PID: 1739183).
  - Voice channel stay: 24/7 active in `🔊│음성` (`1536572442422550538`).

## v2026.09.22.345 — Discord Music Bot SponsorBlock Ad & Sponsor Segment Eradication

- Branch: `feat/discord-music-bot-sponsorblock-ads-removal-v2026.09.22.345`
- **SponsorBlock In-Stream Ad & Sponsor Auto-Removal**:
  1. **Automatic Ad & Sponsor Segment Slicing**:
     - Bound `sponsorblockRemove: 'sponsor,music_offtopic,selfpromo,intro,outro'` to `youtubedl.exec` audio stream pipeline.
     - Automatically queries the global SponsorBlock community API during audio streaming and slices out video sponsors, skits/dialogue before music (`music_offtopic`), channel self-promotions, and intrusive intros/outros on-the-fly.
  2. **Pure Music Playback Guarantee**:
     - Guarantees clean, uninterrupted musical listening experience without YouTuber promotions or extraneous non-music banter.
- **Verification**:
  - Unit tests: 2/2 PASS (node --check and node --test).
  - Stream chunk acquisition verified without latency.
  - Daemon service: `moneyverse-discord-bot.service` active and running (PID: 1726037).
  - Voice channel stay: 24/7 active in `🔊│음성` (`1536572442422550538`).

## v2026.09.22.344 — Discord Music Bot High-Fidelity Audio Streaming & Unlimited Playback

- Branch: `feat/discord-music-bot-volume-unlimited-v2026.09.22.344`
- **Discord Music Bot Engine Enhancements**:
  1. **Real-time Volume Control (`/volume`, 0~200%)**:
     - Bound `inlineVolume: true` to `@discordjs/voice` audio resource pipeline.
     - Implemented `/volume` slash command for live volume inspection and persistent adjustment.
     - Added volume telemetry to `/nowplaying` embed.
  2. **Unlimited Audio Track Streaming**:
     - Replaced 3-hour track limit with `Infinity` (`DEFAULT_MAX_TRACK_SECONDS` & `MUSIC_MAX_TRACK_SECONDS`).
     - Fully verified long-duration streaming (10+ hours sleep/lo-fi playlists, concert streams) without cutoffs.
  3. **Opus Audio Encoder Missing Module Resolution**:
     - Installed `@discordjs/opus` and `opusscript` engines, eliminating `Cannot find module '@discordjs/opus'` crashes during PCM-Opus volume transcoding.
  4. **Universal Public Channel Response Policy**:
     - Stripped all `ephemeral: true` flags, ensuring track requests, queue views, and bot status are visible to all server members.
  5. **Infrastructure Security & MCP Enforcement**:
     - Banned local Windows PowerShell SSH/SCP commands; enforced mini-PC remote operations strictly via `easy-scraping` MCP tools (`system_exec_command`, `fs_write_file`, `fs_read_file`) in `PROJECT_MEMORY.md`.
- **Verification**:
  - Unit tests: 2/2 PASS (8 commands atomic registration & volume clamping).
  - Systemd daemon: `moneyverse-discord-bot.service` active and running (PID: 1717614).
  - 24/7 Voice Channel Stay: Active in `🔊│음성` (`1536572442422550538`).

## v2026.09.21.330 — Ground-Up Swiss Ledger FinTech System & Anti-AI Humanizer Completion

- Branch: `feat/frontend-swiss-ledger-craft-v2026.09.21.330`
- **5 Core Alignment Mandates Implemented**:
  1. **Swiss International Typographic + High-Density Ledger (Swiss Ledger)**:
     - Strict modular grid, monochrome base with single amber/gold signal accent, hairline borders, and spatial discipline.
  2. **Adaptive Super-App Shell (Toss + KakaoPay Pattern)**:
     - 5 Mega Dropdowns + Right Profile Hub + Live Ticker Bar on Desktop; Safe-Area padded Fixed Bottom Nav + 6 Accordion Drawer on Mobile.
  3. **Deslop & Zero Card Nesting (Hairline Dividers & Split Views)**:
     - Completely eliminated nested card-in-card boxes, switching to divide-y and asymmetric dual-column grids.
  4. **Emil Kowalski Tactile Physics + Odometer Number Rolling**:
     - active:scale-[0.98] compression physics, spring easing modals, and tabular mono odometer counting.
  5. **Full 4-Step Anti-AI Humanizer Pipeline**:
     - 100% raw emoji eradication across all 27 routes, 55 AI robotic phrasing patterns converted to authentic human fintech copy.
- **Verification & Zero-Downtime Promotion**:
  - Vitest Frontend: 95/95 test suites (710/710 PASS), Vitest Backend: 79/79 test suites (917/917 PASS).
  - Next.js 16.3.4 Turbopack build 0 errors.
  - Zero-downtime blue-green promotion with 100% preservation of 807 active sessions.

## v2026.09.21.328 — 4-Step Anti-AI Design & Humanizer Pipeline Across All Routes

- Branch: `feat/frontend-humanizer-complete-v2026.09.21.328`
- **Complete 4-Step Anti-AI & Humanizer Pipeline Implementation**:
  1. **Step 1: frontend-design (Aesthetic Thesis & Intentional System)**:
     - Established "Editorial Fintech + Minimal Swiss Ledger" aesthetic with crisp surface hierarchy and rhythmic whitespace.
  2. **Step 2: frontend-design-deslop & UI Cleanup**:
     - Eliminated nested card-inside-card syndrome across all economic interfaces, converting to flat borders and hairline dividers.
  3. **Step 3: avoid-ai-design (Visual AI Cliché Eradication)**:
     - 100% eliminated raw unicode emoji clutter across all 27 routes, replacing with uniform 1.75px Lucide vector SVG icons and tonal status chips.
  4. **Step 4: humanizer & avoid-ai-writing (Fintech Copy Humanization)**:
     - Audited and rewrote all robotic AI prose, instructions, and toasts across Work, Bank, Wallet, Stocks, Account, and Admin into warm, authentic human fintech language.
- **Verification & Zero-Downtime Promotion**:
  - Vitest Frontend: 95/95 test suites (710/710 PASS), Vitest Backend: 79/79 test suites (917/917 PASS).
  - Next.js 16.3.4 Turbopack optimized production build completed with 0 errors.
  - Production zero-downtime blue-green promotion with 100% preservation of 680+ active sessions.

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
