# v2026.11.03.1629 — Restore canonical HTTPS finance mutation Origin checks

**Status: SOURCE TESTED; RELEASE PENDING.** [한국어](2026-11-03-finance-proxy-v1629.ko.md)

- Production anonymous no-money probes to `/api/treasury/donate`, `/api/pension/funded/contribute`, `/withdraw` returned 403 for same-origin public HTTPS requests: wrong boundary because Next internal request URL is HTTP localhost.
- Shared strict Origin/Host validator recognizes only public HTTPS `easy-scraping.com` and `test.easy-scraping.com` with actual Host equal to browser Origin and loopback upstream. Arbitrary `X-Forwarded-Host` overrides are rejected, as are cross-site requests, forged ports and unrelated nonlocal upstreams.
- Keep existing same-origin API tests, Nest authenticated session, one-use CSRF, actor scoping, UUIDv4 replay identity, funded canonical balanced DB receipt verification. Monetary bulk payouts, Mint/CB and KDIC/enterprise legacy holds unchanged.
- TDD RED missing module, GREEN 35 route/origin tests, TypeScript and scoped lint pass. Production WLD transfers performed: **0**.
- [Worklog](../worklog/2026-11-03-finance-proxy-csrf-v1629.md).
