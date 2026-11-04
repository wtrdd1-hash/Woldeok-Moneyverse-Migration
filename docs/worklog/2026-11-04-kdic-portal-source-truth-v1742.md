# v2026.11.04.1742 — KDIC public portal source-truth recovery

## START
Owner ordered real finance recovery and Production after Test. Integrated DOCS_INDEX, AGENTS, finance reset Nov 2, canonical finance integrity Nov 4 and release guide reviewed. Started isolated branch on latest origin/main ff9839bdea923157b5903e21afb63a82a54bfdc1. Found Production KDIC fund 0 WLD, 0 claims and receipts; public frontend falsifies 10,000,000 WLD on numeric zero and substitutes two invented institutions if API missing. Backend public controller omits institution IDs, deposits and premium rates that frontend expects. Fix canonical display contracts, retain fail-closed KDIC settlement until funded DB-owned function built, no money changes.

## MID — actual code changes and tests
- Public KDIC API now includes the institution id, verified source deposit amount and premium rate previously omitted but required by UI; preserves authenticated private/admin guards and no personal payout records leaked.
- Frontend removes fallback 10,000,000 WLD on real 0 (falsy), synthetic two institutions, false BIS 14.3%, invented status/guarantee wording. Strictly parses 0-or-positive safe-int money and validates institution count/sum and rate fields; unknown source stays unavailable, not a fake balance. Policy calculator fails closed for negative/fractional/overflow values and 0/0 returns 0% rather than NaN. Clarifies virtual policy estimates vs genuine payable KDIC compensation; no false "immediate guaranteed payout" text.
- Focused frontend 7/7, backend 7/7 tests PASS, backend/frontend TypeScript typechecks PASS. No DB schema, raw grant, member money, or cache writes.
- Official Test still has independent pre-existing KDIC SELECT ACL drift (public 500; Production 200); this read-only UI improvement never claims Test role permission resolved.

## END — candidate for CI and exact Test/Production
Main rechecked during work (ff9839bdea923157b5903e21afb63a82a54bfdc1). Follow PR CI and exact-merged Test/zero-downtime Production; do not label Production fixed until verified. KDIC real financial payouts still require funded canonical escrow and receipts #2366.
