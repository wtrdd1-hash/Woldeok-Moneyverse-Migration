# 2026-09-09 — Virtual stock comparison

- Added a signed-in `/stocks/compare` workspace for side-by-side comparison of two or three virtual stocks.
- Added shared navigation between the market and comparison workspace.
- Comparison uses authoritative server-returned integer-string values for current price, open change, intraday range, and available shares.
- WLD deltas use `BigInt`, preserving precision beyond JavaScript safe integers.
- Added programmatic checkbox labels and row/column table headers for assistive-technology context.
- This implements the first slice of the existing P1 **Stock comparison** roadmap item; no economy policy or database contract changed.
- Runtime promotion remains gated on exact-SHA staging verification before main/Production.
