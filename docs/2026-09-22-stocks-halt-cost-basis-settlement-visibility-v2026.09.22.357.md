# Stock Halt Cost-Basis Settlement Visibility, Market 229 Migration, Receipt Cards & 404 Prevention (v2026.09.22.357)

- **Date**: 2026-09-22 19:25 KST
- **Release Version**: `v2026.09.22.357`
- **Release Directory**: `/srv/moneyverse-data/releases/prod-2ec47a9-v357`
- **Exact Git SHA**: `2ec47a970dc0e1513b49bed9cca50a582b2e8319` (Short: `2ec47a9`)
- **Preserved Active Sessions**: PostgreSQL 933 sessions 100% loss-free preserved
- **Applied Skills**: `admin-control-tower-craft`, `fintech-responsive-layout-engine`, `anti-ai-frontend-craftsmanship`

---

## 1. Overview & Background

This release fulfills the urgent P0 specifications defined in `STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC.ko.md` and `PROJECT_PLAN.ko.md`, restoring complete market catalog visibility and portfolio transparency for halted and cost-basis settled stocks.

Prior to this version:
1. `public.stock_market_overview()` strictly filtered `WHERE stock.active`, which completely omitted halted stocks (`active = false`) from `/api/v1/stocks`. Consequently, navigating to `/stocks/[symbol]` triggered a 404 Not Found error, blocking users from viewing the halt notice banner or their settlement receipts.
2. The portfolio page (`/stocks/portfolio`) only displayed active positions (`quantity > 0`). When a position was settled, it vanished without user-facing context, causing uncertainty regarding asset status.
3. The main exchange list (`/stocks`) lacked visual halt badges, allowing users to inadvertently attempt trading on halted equities.

This release applies database migration 229 and integrates comprehensive UI receipt cards across all relevant stock surfaces.

---

## 2. Key Implementations

### ① PostgreSQL Migration 229 (`packages/database/migrations/229-stock-market-overview-halt-visibility.sql`)
- **Function Return Signature Extension**:
  - Recreated `stock_market_overview()` to explicitly return `halt_status text`.
- **Inclusive Market Catalog Filter**:
  - `WHERE stock.active OR stock.halt_status IN ('HALTING', 'HALTED_SETTLING', 'HALTED_SETTLED')`.
  - Ensures halted stocks remain queryable, eliminating 404s on symbol hub pages.
- **Deterministic Ordering**:
  - Active stocks sort first, followed by halted equities, sorted alphabetically by symbol.

### ② Backend Repository & Type Updates (`backend/src/stock/`)
- Updated `StockMarketRow` interface with `halt_status: string`.
- Bound `coalesce(halt_status, 'ACTIVE') AS halt_status` in `list()` query.
- Enhanced `stock-halt-settlement.test.ts` with catalog visibility assertion (6/6 tests PASS).

### ③ Exchange Main Page Enhancements (`frontend/src/app/stocks/page.tsx`)
- **Halt Badge Indicator**:
  - Added distinct `Halted` (Rose/Destructive) badge next to ticker symbol in card headers.
- **Safety Trade Guards**:
  - Replaced Buy/Sell `TradeDialog` buttons with a disabled `Trading Halted` button on halted stocks.
  - Kept `Open Hub` and detail modal links active for regulatory and transparency inspection.

### ④ Portfolio Analytics Page Settlement Receipts Card (`frontend/src/app/stocks/portfolio/page.tsx`)
- **Parallel Fetching of `/api/v1/stocks/halt-receipts`**:
  - Directly loads caller's immutable refund settlement receipts.
- **`HaltReceiptsCard` FinTech Component**:
  - Highlights `ShieldCheck` zero-fee refund notice: "Authoritative server-side cost basis refund receipts. All holdings were automatically settled into WLD with zero fees or taxes."
  - Displays grid of receipts with stock symbol, name, settled shares, acquisition cost basis, total refunded WLD, settlement date, and deep link to symbol hub.
  - Renders gracefully even when user holds zero active equities.

### ⑤ Resolved 404 Defect on Stock Detail Hub (`/stocks/[symbol]`)
- Halted stocks now successfully load metadata, displaying the top alert banner and the individual cost-basis settlement receipt card seamlessly.

---

## 3. Unit Tests & Validation

- **Backend**: `backend/src/stock/stock-halt-settlement.test.ts` (6 tests PASS)
- **Frontend**:
  - `frontend/src/app/stocks/portfolio/analysis.test.ts` (4 tests PASS)
  - `frontend/src/app/stocks/[symbol]/stock-trading-console.test.ts` (6 tests PASS)
- **Total Invariants**: 16 unit test cases 100% PASS.

---

## 4. Zero-Downtime Promotion & Runtime Identity

1. **Build & Verification**:
   - Pulled SHA `2ec47a9` on Mini PC worktree.
   - Built Next.js Turbopack and NestJS production artifacts with exact SHA.
2. **Promotion (`/home/debian/stage_v357.sh`)**:
   - Zero-downtime symlink flip to `test-2ec47a9-v357` and `prod-2ec47a9-v357`.
   - Verified runtime identity coherence (`2ec47a9...`) on both test and production domains.
   - HTTP 200 OK verified across all key endpoints.
   - **PostgreSQL active user sessions verified at 933 intact (100% loss-free)**.
