# v2026.10.30.2233 — Stock orderbook responsive header

Status: STARTED. Base: origin/main bf8d0d48f810; isolated task worktree.

- [x] Inspect authoritative docs index and AGENTS.md, reproduce screenshot root cause by reading header markup.
- [x] Add regression coverage and correct layout.
- [x] Run targeted checks and record evidence.
- [ ] Push branch and assess test / production promotion.

Root cause: the orderbook header uses a single nowrap flex row containing the title, two view controls, three badges and depth buttons; the title is squeezed and metrics collide at medium card widths.
Scope: frontend orderbook header only; do not mutate trades, pricing or ledger.

## Implementation checkpoint
- Title and controls separated into vertical header sections; controls wrap rather than squeeze the title. No trade, API, DB or pricing changes.
- Targeted vitest `stock-orderbook.test.tsx`: 10 passed / 0 failed on 2026-10-30 22:37 KST.
- No authenticated browser screenshot or official Test / Production environment validation yet.
