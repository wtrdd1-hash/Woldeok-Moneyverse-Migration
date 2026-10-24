# Enterprise admin mutation boundary — v517

Base: main c9a868b1. P1 security, no migration. Existing AdminEnterpriseController has class-level admin session but no method CSRF/recent reauth on SOE dividend harvest and state/dividend-rate updates. Browser-to-Next gateways lack origin/CSRF and show optimistic synthetic dividend logs.

1. RED: backend metadata test for both write methods requiring CsrfGuard and ReauthGuard. GREEN: import guards and add method decorators.
2. RED: Next route tests for cross-origin/missing origin, missing CSRF, correct session CSRF forwarding, refusal on backend non-success; GREEN: shared origin/token verifier, gateway wiring. No browser-trusted CSRF supplied to backend.
3. RED: UI regression for synthetic dividend logs; GREEN: remove fabricated entries and reload server-verified data after successful harvest, reject malformed backend receipts.
4. Focused tests, lint/typecheck/build and CI; log skipped/failed gates. Re-fetch main/plan before any merge. No merge/Production without all gates.

Do not modify existing applied migrations, other worker branches, operational DB or deployments. Existing #1105 SOE atomic ledger remittance is an unmerged draft; this PR does not claim ledger settlement correctness and must remain HOLD until integrated.
