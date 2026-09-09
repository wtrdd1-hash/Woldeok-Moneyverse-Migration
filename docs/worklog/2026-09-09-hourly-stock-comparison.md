# Hourly development — virtual stock comparison

## Selected product improvement

Implemented the existing Living Plan P1 **Stock comparison** capability as a member-facing comparison workspace. Members can select two or three listed virtual stocks and compare current price, signed change from the day's open, intraday range, and available shares without leaving the stock area.

## User benefit

The market previously required reading separate cards/dialogs to compare instruments. The new workspace keeps comparable metrics aligned in one table and exposes a persistent Market / Compare navigation across `/stocks/*`.

## References reviewed

- Next.js App Router layouts/pages: nested `layout.tsx` is the supported mechanism for shared UI across sibling routes.
- W3C/WAI table guidance: row/column header relationships should be conveyed with table headers and `scope`.
- WAI form-control guidance: checkbox text must be programmatically associated with its control.

## Files changed

- `frontend/src/app/stocks/layout.tsx`
- `frontend/src/app/stocks/compare/page.tsx`
- `frontend/src/app/stocks/stock-comparison.tsx`
- `frontend/src/app/stocks/stock-comparison-math.ts`
- `frontend/src/app/stocks/stock-comparison-math.test.ts`
- English/Korean changelog files for this feature.

## Safety and integrity

No database, migration, ledger, authorization, or economy policy changes. The page reads the existing `/api/v1/stocks` response after `requireMember()`. Authoritative WLD values remain strings; signed differences use `BigInt` rather than `Number`.

## Validation and promotion state

The branch is intentionally not merged or deployed until repository CI and the mandatory exact-SHA `wdmv-test` gate pass. The connected miniPC/cluster path was offline when this work began, so direct staging evidence is still required before Production promotion.

## Living Plan

No specification rewrite was required: this implements the already-documented P1 Stock comparison roadmap item without changing its intended contract.
