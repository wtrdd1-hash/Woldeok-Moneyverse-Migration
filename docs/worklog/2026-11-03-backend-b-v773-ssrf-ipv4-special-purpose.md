# Backend B v773 — Special-purpose IPv4 SSRF fail-closed boundary

Date: 2026-11-03 KST. **P1 security hardening, Draft/HOLD; NOT released.**

## Proven defect and implementation

Starting main `846844bf0bd573f0c0f0654e27ccb44321847106` permitted direct `https://192.0.2.42/` in `assertSafeOutboundUrl` and did not classify RFC 5737 TEST-NET ranges as non-global. `isPrivateIp` was also permissive for 192.0.0/24 IETF protocol assignments and deprecated 192.88.99/24 6to4 relay anycast. These addresses are inappropriate destinations for a fail-closed SSRF egress policy. This is a classification gap; no successful exploit or Production exposure was established.

Updated `backend/src/security/ssrf-defense.ts` to reject 192.0.0/24, 192.0.2/24, 192.88.99/24, 198.51.100/24 and 203.0.113/24. The same classifier guards direct URLs, all DNS A/AAAA answers, redirects, and IPv4-mapped IPv6. Added regression coverage in `ssrf-defense.test.ts` and `ssrf-dns-pinning.test.ts` (direct, mapped, mixed DNS). Public IPv4 and mapped public IPv4 remain allowed. No API route/response/schema change, database migration, grant, audit/ledger, or account balance mutation.

Distinct from Draft PR #2588 (B v772 IPv6 transition ranges); both edit `ssrf-defense.ts`, so coordinate/rebase both patches before merge, never silently overwrite one.

## Fresh verification on this branch

- TDD RED: 3 new tests failed / 14 existing passed before implementation; direct reserved IP accepted, DNS mixed answer attempted transport.
- TDD GREEN: 17/17 SSRF focused tests PASS; after fast-forwarding to latest main, re-run 17/17 PASS.
- Security package: 66 PASS, 6 SKIP (DB integration requires isolated database).
- Workspace typecheck PASS; lint PASS (0 errors, 1,027 existing warnings); backend build PASS; frontend build PASS.
- Backend full: **2 FAIL, 2,986 PASS, 518 SKIP**; failures are existing `profile-private-response.http.test.ts` owner profile and settings 401 vs expected 200, unrelated to SSRF classifier.
- Frontend full: first attempt TIMEOUT 115s, retry **2,947 PASS**.
- Database package: **72 PASS, 5 SKIP**; contract: **41 PASS**.
- Full dependency audit: **FAIL, 9 vulnerabilities (8 moderate, 1 low)**; production dependency audit recorded separately.
- Real PostgreSQL integration, official Test exact-SHA auth/core-flow E2E, independent restore, required remote Runtime CI and GitOps release gate: **BLOCKED/NOT VERIFIED**. No release authorization.

Main changed during execution to `d22c36dbecad1fe136d3850715f1068a7d1df573` (QA dual-disk cache cleanup, non-overlapping files). Fast-forwarded the isolated branch before PR, re-read English/Korean plans (unchanged hashes), and re-ran focused regression tests. QA v1484 still reports Production locale 500s, DEV DB privilege overreach and Test/Production provenance issues; this patch does not resolve those P0 blockers.

**Disposition:** Draft PR only. No main merge, Test or Production deployment, shared database write, service restart, branch deletion, or other automation mutation. Hold until all required gates are independently green on exact candidate SHA and overlapping IPv6 PR is integrated safely.
