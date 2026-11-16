# v2026.11.17.6 — Temporary financial source-truth edge protection

## BEFORE (2026-11-17 07:42 KST)
- Owner approved repair of unfinished critical admin/finance work.
- Source main cd822aa098d16a6f8bbfa5e41cf721eb1594e767 reviewed with authoritative Project Plan, Integrated Planning Master, security/deploy governance, latest PR #3221.
- Live public GET without cookies returned HTTP 200 at /api/admin/kdic/overview, /api/v1/admin/kdic/overview, /api/admin/kdic/ledger-integrity, /api/kdic/portal and at /api/engagement/streak even with caller-supplied X-User-Id.
- Current public Nginx site has Spring 4550 KDIC proxy and broad engagement regex, separate internal gateway on :4400; no safe authenticated positive path proven. Source PR #3221 is not live and the global SEC1 SecurityConfig is under concurrent modification.
- Narrow reversible ingress release-hold will mark untrusted KDIC and precisely matched fake engagement paths 503 until complete authenticated/ledger-backed release. Preserve all other locations and nonfin services. This is security mitigation NOT function-restoration.
## MID — 2026-11-17 07:50 KST
- Inspected existing root-owned public Nginx site checksum e53a8b478aec76e10943fd385fb4eaf3fc304d36b159555eb4e79ce2af03e43c.
- Created separate security branch and deterministic renderer. It refuses changed Nginx topology, duplicate scope, and accidental second application. Synthetic unittest: 4/4 PASS. Did not copy secrets or complete Nginx host configuration into Git.
- Existing host config preserved privately at /srv/moneyverse-data/reports/finance-edge-hold-v2026.11.17.6/nginx-before-moneyverse.conf (protected directory); rendered candidate kept adjacent. Scope: replace only public existing two KDIC prefix routes and add 4 prefixes + narrowly matched legacy engagement-route pattern to both 4400 and public default_server.
- Independently started shadow Nginx :4479: KDIC and known engagement paths 503; unrelated early-game/login/version mock 204; shadow stopped without touching live server.
- First host syntax test + graceful reload passed but immediate smoke saw old workers (200/500), so automated rollback to prior checksum and reload; no success was claimed.
## CLOSE — 2026-11-17 07:55 KST
- Revalidated exact unchanged original config hash, copied vetted candidate atomically to the site file, Nginx syntax and active config marker check PASS (exactly 2). Nginx systemd graceful reload executed; allowed 4 seconds for new workers and re-tested.
- Internal 4400 KDIC admin + legacy engagement routes 503; public local Nginx matching routes 503; baseline /api/version 200.
- Independent real HTTPS: /api/admin/kdic/overview, /api/v1/admin/kdic/ledger-integrity, /api/kdic/portal, /api/engagement/streak and /api/v1/engagement/dopamine/status all 503; homepage + /api/version 200; /api/v1/admin/security and /admin/seo anonymous 401; official Test homepage + /api/version 200 and admin security anonymous 401.
- Final live config SHA256: 5b5c6bfffb8d4b68c721b00010fa40b31f335c90cbfd5aafbe1f665eca2b4745. Root backup preserved with old checksum for immediate rollback. Nginx active, Spring active, frontend active, backup timer active and recent backup Result=success.
- No database, WLD, user balances, Spring JAR, Android, or frontend deploy. FINANCE FUNCTION RELEASE HOLD is a truthful intentional temporary 503, not functional restoration.
- Remove the edge safety guard only after exact-SHA official isolated Test, authenticated superadmin role and step-up OTP/CSRF E2E, journal-backed financial settlement and rollback/restore verification. Coordinate code integration with PR #3221 and parallel SEC1/log branches.
