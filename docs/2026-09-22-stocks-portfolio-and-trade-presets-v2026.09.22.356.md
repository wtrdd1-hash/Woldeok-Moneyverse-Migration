# Virtual Stock Exchange Main Order Form Presets, Estimated Tax Breakdown & Portfolio Asset Allocation Stack Bar (v2026.09.22.356)

- **Date**: 2026-09-22 19:00 KST
- **Release Version**: `v2026.09.22.356`
- **Release Directory**: `/srv/moneyverse-data/releases/prod-7e46b22-v356`
- **Exact Git SHA**: `7e46b22296ace8f9ecea55f5d649373927d66506` (Short: `7e46b22`)
- **Preserved Active Sessions**: PostgreSQL 929 sessions 100% loss-free preserved
- **Applied Skills**: `fintech-responsive-layout-engine`, `anti-ai-frontend-craftsmanship`, `admin-control-tower-craft`

---

## 1. Overview & Background

This release fulfills the urgent P0 specifications defined in `VIRTUAL_STOCK_EXCHANGE_SPEC.ko.md` and `PROJECT_PLAN.ko.md`, delivering ergonomic improvements to the universal stock trading modal and full asset allocation visualization on the Portfolio page (`/stocks/portfolio`).

Following the completion of the 10D interactive orderbook and trading console on stock detail pages in v355, this release focuses on:
1. Enhancing the shared `TradeDialog` and `TradeForm` with Toss/Robinhood-inspired touch-friendly quick percentage chips (25%, 50%, MAX) and real-time transaction fee / tax breakdowns.
2. Rebuilding the Portfolio analytics interface with an 8-color multi-segment horizontal stack bar for asset allocation, return basis point (`gain_loss_bps`) badges, and one-touch rebalancing trade triggers.

---

## 2. Key Implementations

### ① Universal Stock Order Form Usability Overhaul (`trade-form.tsx` & `trade-dialog.tsx`)
- **44px+ Touch Targets & Percentage Quick Preset Chips**:
  - `25%`, `50%`, `MAX` chips allow fast, error-free order sizing on both mobile and desktop.
  - Buy orders convert cash balances into max affordable shares.
  - Sell orders convert user's existing position (`holdingQuantity`) into target share counts.
- **Real-Time Gross & Tax Breakdown Card (`TaxBreakdown`)**:
  - Automatically calculates total gross value (`quantity × price`).
  - Displays the 0.3% transaction tax and net settlement estimate transparently.
- **`TradeDialog` Trigger Customization**:
  - Supports `holdingQuantity`, `triggerLabel`, `triggerVariant`, and `triggerClassName` props to enable contextual one-click trading throughout the app.

### ② Portfolio Analytics Logic & BigInt-Safe Arithmetic (`analysis.ts`)
- **Per-Position & Total Portfolio Return Rate in Basis Points**:
  - Uses BigInt arithmetic `(gainLoss * 10_000n) / costBasis` to avoid floating-point inaccuracies.
- **8-Color Distinct Palette Mapping**:
  - Maps positions sequentially across Emerald, Sky, Violet, Amber, Rose, Indigo, Teal, and Orange color themes.
- **Allocation Proportion Calculation**:
  - Accurately distributes percentage weights for multi-asset stack bar rendering.

### ③ Portfolio Analytics Interface Overhaul (`portfolio/page.tsx`)
- **3 Hero Metric Cards**:
  1. Total Valuation
  2. Total Cost Basis
  3. Cumulative Gain/Loss with color-coded Bps badge
- **Multi-Segment Asset Allocation Stack Bar**:
  - Proportional horizontal bar displaying holdings distribution.
  - Interactive tooltips with ticker name, value, and share of portfolio.
  - Legend chips with color indicators.
- **One-Touch Rebalancing Triggers**:
  - Each holding row features direct `Buy More` and `Sell` action buttons opening the enhanced `TradeDialog` for immediate rebalancing.

---

## 3. Unit Tests & Validation

- **Test Suite**: `frontend/src/app/stocks/portfolio/analysis.test.ts`
- **Verified Invariants**:
  1. Valuation and allocation percentage calculation accuracy.
  2. Positive return `gain_loss_bps` precision (+2000 bps).
  3. Negative loss `gain_loss_bps` precision (-2000 bps).
  4. 8-color palette cycling and empty portfolio defensive handling.
- **Results**: 4/4 tests PASS (100%). Total frontend test suite: 10/10 tests PASS.

---

## 4. Zero-Downtime Promotion & Runtime Identity

1. **Build & Staging**:
   - Committed and pushed to `origin/main` (`7e46b22`).
   - Pulled in Mini PC worktree and verified Turbopack Next.js production build.
2. **Promotion (`/home/debian/stage_v356.sh`)**:
   - Zero-downtime symlink transition to `test-7e46b22-v356` and `prod-7e46b22-v356`.
   - Verified runtime identity coherence on both `test.easy-scraping.com` and `easy-scraping.com` (backend=`7e46b22...`, frontend=`7e46b22...`).
   - Verified HTTP 200 OK across all public and authenticated endpoints.
   - **PostgreSQL active user sessions preserved at 929 sessions intact**.
