# v2026.11.17.8 — Canonical KDIC public-read operational promotion

**Status:** BEFORE / RELEASE CANDIDATE

## BEFORE — 2026-11-17 08:18 KST
- Owner explicitly ordered completion and Production promotion.
- Read current origin/main cd822aa098d16a6f8bbfa5e41cf721eb1594e767 and authoritative Project Plan, Integrated Planning Master, release policy, AGENTS.md and prior finance edge safety v2026.11.17.6.
- LIVE v2026.11.17.6 Nginx protected KDIC/legacy engagement paths with explicit 503; file SHA 5b5c6bfffb8d4b68c721b00010fa40b31f335c90cbfd5aafbe1f665eca2b4745; rollback baseline root-owned, independent.
- Test official database SQL function migration 335 repaired safely (PR #3224); Test API GET /api/v1/kdic/portal 200, unauthorized admin KDIC 401.
- Production Nest existing :4500 GET /api/v1/kdic/portal 200 with canonical public KDIC fund/institution data; fake user/admin tokens still 401 on admin KDIC routes.
- Scope ONLY read-only GET/HEAD /api/kdic/portal and /api/v1/kdic/portal on existing public 80 default server and internal 4400 gateway; proxy directly to already-running, DB-authoritative Production Nest. No full app/JAR rollout, financial commands, hidden admin reads or user WLD mutations. Keep every other v2026.11.17.6 503 route blocked.
- TDD: write failing deterministic renderer tests, then implement, verify shadow Nginx with actual Test backend and Production backend, apply guarded config with no restart only after exact SHA and status gate.
## MID — 2026-11-17 08:25 KST
- Rechecked latest main cd822aa098d16a6f8bbfa5e41cf721eb1594e767. Isolated code branch leaves Gemini SEC1/log/SEO code untouched.
- RED unittest failed because canonical renderer source was not yet present; GREEN Python unittest 4/4 PASS: exact aliases, two server scopes, topology precondition, refusal on repeated render, and unrelated paths unchanged.
- Started separate shadow Nginx listening on 127.0.0.1:4477 for existing Production Nest :4500 and 127.0.0.1:4478 for official Test Nest :3100. 16 HTTP method/path probes passed: both portal aliases GET and HEAD 200, POST 405, held KDIC other paths / engagement 503 and unrelated version 204. Real JSON fund+institution shape and Cache-Control private/no-store passed from both.
- Prepared root-owned private config backups and deterministic candidate. Current v2026.11.17.6 guard SHA256 5b5c6bfffb8d4b68c721b00010fa40b31f335c90cbfd5aafbe1f665eca2b4745; candidate SHA256 5993467abb935d12385810a1d3bb62827dc1b9592312c49ec31e1ce7478ff95b, two new exact location blocks per server, previous 503 guards retained for all other paths.
- First Production Nginx graceful reload: all 15 local/HTTPS status checks and POST 405 succeeded, but final JSON check used Python urllib default user-agent blocked 403 by external edge. Treating the last probe as failed triggered automatic rollback to exact original SHA, with nginx -t / service healthy; this was a verifier-client mismatch rather than observed API error.
- Corrected the content probe to curl, independently tested real JSON/no-store on both shadow ports, then rechecked original live SHA before a second guarded cutover.
## CLOSE — 2026-11-17 ~08:27 KST
- Second guarded atomic Nginx config update: syntax valid, two exact new markers, systemctl reload nginx, after settling verified internal 4400 and public HTTPS portal GET both aliases HTTP 200, held old KDIC admin and engagement routes HTTP 503, homepage/version HTTP 200, official Test public portal/version HTTP 200, POST to public portal HTTP 405.
- Public canonical JSON checked via curl plus JSON parser: success=true, real fund field nonempty, 2 institutions, HTTP 200 and Cache-Control private/no-store.
- Final Nginx config SHA256 5993467abb935d12385810a1d3bb62827dc1b9592312c49ec31e1ce7478ff95b; prior restricted rollback bytes preserved, Nginx active.
- No Production database writes, ledger or WLD balance changes, Java/Next restart or full Spring frontend/back-end promotion. Route-only operational promotion of existing Nest public read.
- Not certified: all KDIC data accuracy (e.g. independent fund deposits reconciliation), admin positive session/OTP/CSRF flows, ledger-based KDIC payments, attendance spin atomicity, global SEC1, full exact-SHA Production release. Keep other finance release holds active.

GitHub review / 검토 기록: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3225
