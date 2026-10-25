# C v1058 — Verified Savings Challenge Planner (Implementation Plan)

**Source and scope:** Main's `/bank/savings-pot` is a browser-only fabricated four-member fund. No real group savings backend exists. Reuse existing authenticated `GET /api/v1/banking/standing` only; never invent deposits, returns, other members, or a ledger receipt.

1. **RED:** Replace legacy tests with assertions that the member route requires a session, handles missing/invalid bank standing without showing any amount, and exposes actual balance only after validation. Add client tests for 7/30-day goal planning, large integer WLD arithmetic, no false deposit or member names, and a real `/bank` CTA.
2. **GREEN:** Server page requires membership and reads existing banking standing, validates canonical nonnegative integer string balance. Client planner computes only local hypothetical daily savings needs; no state mutation, fabricated member names, bonuses, penalties, or simulated deposit claims. Distinguish bank balance from hypothetical goal, label as estimate.
3. **A11Y/SEO:** Native input labels, accessible live summary, minimum 44px interactive targets, mobile responsive layout, member-only `noindex,nofollow`, no fictional software JSON-LD or misleading public canonical.
4. **VERIFY:** Focused RED/GREEN, lint/typecheck/build/unit/integration/security/contract/real isolated PG/E2E exact HEAD. Preserve other PRs and core five automations. If full gates fail, Draft PR only and HOLD.
