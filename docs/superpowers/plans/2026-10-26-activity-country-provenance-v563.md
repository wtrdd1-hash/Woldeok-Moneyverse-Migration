# B v563 — Request activity country provenance

## Problem and boundary

`requestActivityTrail` accepted `CF-IPCountry` and `X-Vercel-IP-Country` regardless of whether the deployment trusts a rewriting proxy. A direct caller could therefore fabricate a country in the request-activity audit trail. The deployment's trusted proxy contract for client IPs accepts only Cloudflare's rewritten header when `trustProxyForwardedFor` is enabled. Reuse that trust decision for the country field.

## Scope and implementation

1. Add failing middleware tests for untrusted Cloudflare country and for Vercel country on the Cloudflare edge.
2. Record the country only when `trustProxyForwardedFor` is true and a single `cf-ipcountry` header contains exactly two ASCII letters. Otherwise record `null`; never fall back to the visitor-controlled Vercel header.
3. Preserve route, actor, status, IP, response metadata, database schema, financial ledger and public API behavior. This is audit metadata provenance, not a geo-blocking policy.
4. Verify focused tests, full backend tests, workspace lint/typecheck/test/build, security checks and CI. No merge or deployment without exact-SHA official Test and release gates.

## Review considerations

- This does not authenticate a proxy by itself; it relies on the existing deployment trust configuration and edge header overwrite policy.
- Country may be absent on untrusted/direct traffic. This is intentional rather than recording a forged location.
- Existing trusted Cloudflare country case remains covered by the original middleware test.
