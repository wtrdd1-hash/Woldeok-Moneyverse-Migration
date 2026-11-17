# v2026.11.18.3 — Owner-requested actual Spring SSR public canary promotion

**English canonical** · [한국어](2026-11-18-spring-web-public-canary-v2026.11.18.3.ko.md) · STARTED / RELEASE SCOPE LIMITED

## BEFORE — 2026-11-18 07:50 KST
- Owner explicitly requests immediate real Production promotion of all frontend to Spring. Scope remains 178 Next pages + 124 BFF routes. Do not misrepresent preview as full cutover; only safe route/feature-specific promotion may occur before outstanding G0–G6 gates.
- Authority: `origin/main` e96e8f81f4d6b99b221392a2b6fe46356361b145; latest integrated Living Project Plan / Integrated Planning Master and `AGENTS.md` / `docs/RELEASING.md` / `docs/operations/production-deployment.md`. Existing staged Spring candidate PR #3255 passed 141/141 local Java21 tests, still 0 canonical route parity and no accepted authenticated finance Test.
- Debian13 mini-PC: Spring :4550 production and separate Next admin :4524 are active; public edge default Spring upstream may return Next loading HTML. `test.easy-scraping.com/frontend-version` 502, `easy-scraping.com/frontend-version` 200 HTML loading. Official Test services inactive; not a valid exact-SHA whole-site Test.
- **Safety design:** new isolated Spring *public preview only* profile with H2 memory data (never connects to operational PostgreSQL), no live finance/Discord dependencies, and deny-all HTTP filter except read-only `/spring-web` preview pages and required CSS/health. Build immutable SHA artifact, test on isolated localhost and Test public edge, then conditionally expose only `/spring-web*` preview GET/HEAD via Nginx on Production. Leave `/`, `/admin`, `/api`, real account-deletion canonical path, socket and Next recovery unchanged. No production member data writes.
- Keep last-known-good Nginx config backup, source SHA + jar digest, exact rollback commands, verify Nginx syntax before atomic reload, Test HTTP/headers/language/assets then Production external smoke; revert routing immediately on discrepancy. All main/backend/source decisions rechecked before cutover.

## MIDPOINT
Pending.

## CLOSEOUT
Pending.

## MIDPOINT — 2026-11-18 07:53 KST
- Implemented an isolated `spring-web-preview` profile with H2 memory datasource, fixture schema and local socket on an ephemeral port, never operational PostgreSQL. Added fail-closed request filter which rejects all non-GET/HEAD and all paths except three preview pages, their two CSS resources and `/health`, including admin, API, wallet and writes.
- Added MockMvc allow/deny tests, versioned least-privilege systemd unit template and five exact-match + fallback Nginx preview routes. Cookie, authorization and internal actor token headers are stripped at the edge. Test source and official edge smoke to follow; production untouched.
