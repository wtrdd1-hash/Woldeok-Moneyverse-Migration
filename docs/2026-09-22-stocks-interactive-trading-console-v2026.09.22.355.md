# Virtual Stock Exchange Interactive Trading Console, 10-Depth Bidirectional Orderbook & Mobile Quick Action Surface (v2026.09.22.355)

- **Date**: 2026-09-22 18:50 KST
- **Release Version**: `v2026.09.22.355`
- **Release Directory**: `/srv/moneyverse-data/releases/prod-0714368-v355`
- **Exact Git SHA**: `07143686dda0322d6c7628b79e2d3a60657bb543` (short: `0714368`)
- **Preserved Active Sessions**: PostgreSQL 929 sessions 100% loss-free preserved
- **Applied Skills**: `fintech-responsive-layout-engine`, `anti-ai-frontend-craftsmanship`, `admin-control-tower-craft`

---

## 1. Overview & Context

This release fulfills the urgent P0 requirement outlined in `VIRTUAL_STOCK_EXCHANGE_SPEC` and `PROJECT_PLAN.ko.md` by overhauling the stock detail page (`/stocks/[symbol]`) into a real-time, interactive trading console modeled after Toss Securities and Robinhood.

Replacing the previously disconnected static cards, this release delivers a unified bidirectional orderbook-orderpanel architecture: clicking any price row in the orderbook instantly selects the price and triggers the corresponding buy/sell side, supplemented by a 5-Depth/10-Depth toggle switch, volume-proportional horizontal depth bars, a quantity slider with 44px touch chips (10%/25%/50%/MAX), and a sticky 320px mobile floating quick action bar.

---

## 2. Core Implementation Highlights

### ① Real-time 5D/10D Orderbook Rebuild (`stock-orderbook.tsx`)
- **5-Depth / 10-Depth Toggle Switch**:
  - Traders can seamlessly switch between 5 and 10 levels of market depth.
  - Pixel-perfect typography and zero-layout-shift transitions.
- **Bidirectional Interactive Binding (`onSelectPrice`)**:
  - Clicking an Ask row: automatically populates price and selects Buy mode (`side='buy'`).
  - Clicking a Bid row: automatically populates price and selects Sell mode (`side='sell'`).
- **Volume-Proportional Horizontal Gauge Bars**:
  - Asks depth bars rendered with Rose theme accents.
  - Bids depth bars rendered with Emerald theme accents.
- **Real-Time Spread & Basis Points (Bps)**:
  - Dynamically calculates the spread between Best Ask and Best Bid and renders basis points badge.

### ② Toss/Robinhood-Style Intuitive Order Panel (`stock-order-panel.tsx`)
- **Limit & Market Order Type Tabs**:
  - Limit orders dynamically bind selected prices from the orderbook.
  - Market orders lock to the current execution price.
- **Quantity Slider & 44px Touch Preset Chips**:
  - Quick percentage presets (`10%`, `25%`, `50%`, `MAX`) based on available cash or stock balances.
  - Compliant with iOS/FinTech minimum 44px touch target guidelines.
- **Idempotency Guard & 2-Step Confirmation Modal**:
  - Prevents double submissions during network flight using `aria-busy` and disabled states.
  - High-value order confirmation modal to prevent fat-finger mistakes.

### ③ Unified Trading Console Container (`stock-trading-console.tsx`)
- Desktop (1024px+): High-density 2-column layout positioning the orderbook side-by-side with the order panel.
- Mobile (320px~768px): Bottom-docked floating quick action bar with distinct Buy (Green) and Sell (Red) triggers opening a responsive order drawer.

### ④ Stock Page Layout Reorganization (`page.tsx`)
- Harmonized page structure:
  1. Top: Interactive Price Chart (1D/1W/1M/1Y).
  2. Center: `StockTradingConsole` (Orderbook + Order Panel).
  3. Secondary Grid: Market Snapshot and My Position authoritative cards.
  4. Bottom: Stock Alert Rules and Community Discussion boards.

---

## 3. Unit Testing & Verification (`stock-trading-console.test.ts`)

- **Pure Calculation Function**: Extracted and exported `computeOrderbook(currentPriceStr, depth)`.
- **Vitest 6 Unit Tests Passed 100%**:
  1. `depth=5`: Validates exactly 5 asks and 5 bids generated with correct step ordering.
  2. `depth=10`: Validates exactly 10 asks and 10 bids generated with correct step ordering.
  3. Price Coherence: Validates Asks > Current Price, Bids < Current Price, spread calculation, and basis points formatting.
  4. Formatted Strings: Validates comma-separated currency values (`1,234,567`).
  5. Price Floor Protection: Guarantees bid prices never fall below 1 WLD.
  6. Empty / Fallback Safety: Graceful fallback handling for empty or zero price strings.

---

## 4. Zero-Downtime Promotion & Runtime Identity

1. **Exact Git SHA**: `07143686dda0322d6c7628b79e2d3a60657bb543`
2. **Next.js Turbopack Production Build Success** (`pnpm build`).
3. **Zero-Downtime Release Promotion (`stage_v355.sh`)**:
   - Runtime identity verified on Test (`https://test.easy-scraping.com`) and Production (`https://easy-scraping.com`) via `verify-runtime-identity.sh`.
   - All critical endpoints returned HTTP 200 OK.
4. **PostgreSQL Active User Session Preservation**:
   - Verified via `SELECT count(*) FROM auth_sessions WHERE expires_at > now();` -> **929 active sessions 100% intact**.
