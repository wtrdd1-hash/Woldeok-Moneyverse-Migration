# Verified Stock Execution Feed Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Only show real server-published stock executions in the stock page toast and recent execution panel.

**Architecture:** Reuse existing NestJS ledger-backed trade endpoint and `stock:trade` socket room, with a bounded, validated client-side event store. Never infer executions from quote changes or time. Empty/no-socket means no claimed executions.

**Tech Stack:** Next.js 16, React 19, Socket.IO, NestJS, PostgreSQL, Vitest.

- [ ] Task 1: Add failing tests in `frontend/src/app/stocks/[symbol]/stock-verified-executions.test.tsx` for no synthetic trade, verified trade, and accessible close.
- [ ] Task 2: Replace `stock-market-toast.tsx` timer/random fake fills with `useStockTrades(stockId)`; render only new valid real events and hide after five seconds.
- [ ] Task 3: Replace fabricated recent fills in `stock-orderbook.tsx` with actual `useStockTrades(stockId)`, and show truthful empty state. Do not claim fake depth is real.
- [ ] Task 4: Harden `use-market-prices.tsx` trade store against malformed/duplicate payloads and unstable empty-array snapshots; add tests.
- [ ] Task 5: Run focused RED/GREEN, lint/typecheck/full tests/security/build/real PG/CI, verify current main, log blockers, keep Draft until all gates pass.
