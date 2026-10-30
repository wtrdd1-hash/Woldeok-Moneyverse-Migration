# v2026.10.30.2233 — Stock orderbook responsive header

Status: STARTED. Base: origin/main bf8d0d48f810; isolated task worktree.

- [x] Inspect authoritative docs index and AGENTS.md, reproduce screenshot root cause by reading header markup.
- [ ] Add regression coverage and correct layout.
- [ ] Run targeted checks and record evidence.
- [ ] Push branch and assess test / production promotion.

Root cause: the orderbook header uses a single nowrap flex row containing the title, two view controls, three badges and depth buttons; the title is squeezed and metrics collide at medium card widths.
Scope: frontend orderbook header only; do not mutate trades, pricing or ledger.
