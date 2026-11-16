# Discord OAuth gateway remediation — v2026.11.17.4

**Date:** 2026-11-17 KST
**Type:** P0 authentication incident / isolated runtime configuration change
**Source authority:** origin/main `2c1ea4cd7734e67f6047c68eb4ec884940ac7a09` (recheck before promotion).
**Scope:** internal Nginx 4400 gateway routes only; no data, financial, OAuth credential or application binary changes.

## Start / reproduction
- Public Nginx and both production Next ports 4501/4521 redirect `GET /auth/discord/authorize` to `/login?error=oauth_login` rather than the provider.
- The frontend `api.ts` sends OAuth authorize and callback to `API_GATEWAY_ORIGIN=http://127.0.0.1:4400`.
- At 4400, `GET /auth/discord/authorize` returns 404; at Node 4500 the same unauthenticated request returns protected 401; at Spring 4550 it returns 404.
- The gateway `location /` falls back to Spring while the canonical OAuth routes remain on the Node backend. Pre-login uses a separate `/api/v1/auth/prelogin-session` route and must not be changed accidentally.
- `moneyverse-backend` legacy unit inactive does not mean the current Node backend is down: `moneyverse-release-v1546-backend` and `moneyverse-spring-backend` are active.

## Patch / routing boundary
- Narrow regex in `ops/nginx/discord-oauth-node-bridge-v2026.11.17.4.conf`: only `/auth/{discord,google}/{authorize,callback}` to `prod_node`, retaining the original path, headers, cookies, and server-side session exchange.
- Keep Spring routes/default, login/prelogin, local identity, finance, admin, socket and other domain APIs unchanged. Never log OAuth query tokens or response cookies.
- Production target include belongs inside the **internal 4400 server**, not the public frontend server.

## Verification and gates
- TDD red: no versioned route snippet existed. Green: 2 Python route/safety checks pass.
- Isolated port 4441 canary Nginx syntax PASS; four OAuth paths return the Node 401 unauthenticated response rather than Spring 404; `/api/v1/auth/prelogin-session` remains Spring 405 on GET; `/health` returns 200; unmatched OAuth path stays with Spring.
- Before promotion: recheck main and planning, record current Nginx SHA, syntax-test resulting full config, preserve exact rollback bytes and preserve existing active service processes.
- After promotion: Nginx reload only, public-origin authorize must redirect to Discord OAuth endpoint, wrong/missing callback challenge must fail closed, other routes must remain healthy, and rollback must remain available.
- Real interactive Discord account sign-in cannot be certified without an actual user's provider consent; do not claim that from an authorization redirect alone.

## Canonical OAuth start on www (additional host-only cookie guard)
- Independently found www `authorize` correctly registers `https://www.easy-scraping.com/auth/discord/callback`, while existing frontend success redirect uses canonical `https://easy-scraping.com`. A host-only cookie minted on www would not accompany the cross-host success navigation.
- The public-only `ops/nginx/discord-oauth-canonical-start-v2026.11.17.4.conf` redirects **www OAuth starts only** to the canonical authorize path **before** minting any cookie. Callback paths are deliberately not rewritten; the backend remains the only verifier of state and PKCE.
- New TDD RED->GREEN regression; whole Nginx Python suite **9/9 PASS**. Separate Nginx canary on 4442 syntax PASS; www Discord/Google authorize returns 307 to canonical with zero `set-cookie`; canonical authorize delegates to Discord/Google and issues one cookie; www `/login` preserved; `client=mobile` query preserved; arbitrary host cannot inject a new redirect destination.

## Status
- Candidate prepared; operations evidence at `/srv/moneyverse-data/tasks/discord-login-v2026.11.17.4/`.
