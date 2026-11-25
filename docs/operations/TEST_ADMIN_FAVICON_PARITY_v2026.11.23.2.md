# Test Admin Authentication and Icon Parity — v2026.11.23.2

Date: 2026-11-23 KST. Change scope: test Nginx vhost only. Do not promote to production.

## Start and baseline
User requested same admin authority and favicon as production on `test.easy-scraping.com`. Baseline: production `/favicon.ico` 200, test `/favicon.ico` 403; production `/admin` 302 and test `/admin` 302 for an unauthenticated browser. On test the backend administrator API and OAuth authorize paths returned 403, and login form POST was blocked by the current GET/HEAD-only test location. The test root HTML references `/assets/mv39/favicon.ico` with the exact same SHA256 as production (7c17c9be67fb26d74879b5392423e736ed7079a3c00e5a203adcecddf35fa3d5).

## Change and checkpoint
Backed up Nginx test config on host (`/etc/nginx/sites-enabled/.moneyverse.before-test-icon-20261123-135019.bak`). Added test-vhost exact static `location = /favicon.ico` and `/apple-touch-icon.png` aliases to existing production icon artifacts. The directives serve static icons only, without changing prod vhost, admin permissions, login handlers or any API. `nginx -t` passed; reloaded Nginx. Public HTTPS `/favicon.ico` => 200 image/x-icon, `/apple-touch-icon.png` => 200 image/png. Test `/admin` and `/admin/users` => 302 login redirect; `/api/v1/admin/users` => 403 without a session. External OAuth authorize endpoints => 403. The source file SHA256 above is pinned to the same origin for both vhosts.

## Unresolved / must not misrepresent as completed
Admin RBAC parity is **not complete**. Test vhost UI mostly proxies to `127.0.0.1:4550`, while a separate test backend exists. Simply lifting the administrator POST/API restrictions could expose the production-backed upstream to write requests; therefore it was **not** done. Completing user-requested administrator testing requires independent test authentication/session plumbing, an isolated DB and verified non-production administrator privileges, followed by Google/Discord callback allowlists, negative-role tests, write-operation tests with synthetic users, and rollback. Never use admin credentials in repository documentation. This log does not authorize any production promotion.

## Rollback and finish
To revert icon aliases only, restore the dated Nginx backup, validate with `nginx -t` and reload; check external test and production paths. Keep this documentation in a separate PR for Gemini/GPT coordination. The observed favicon gap is fixed; admin privilege parity remains blocked pending test isolation and auth integration.
