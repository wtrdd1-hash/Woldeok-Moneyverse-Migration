# Internal OAuth Nginx route snippets

`discord-oauth-node-bridge-v2026.11.17.4.conf` must be installed under `/etc/nginx/snippets/` and included **inside** the `server { listen 127.0.0.1:4400; ... }` block in `/etc/nginx/sites-enabled/moneyverse`. It is intentionally not a full server file.

Keep the old site file bytes as a rollback snapshot and check the current site file before editing (other agents may have changed it). Run `python3 -m unittest discover -s ops/nginx -p 'test_*.py' -v`, a separate-port Nginx canary, and `nginx -t` against the candidate config. After any approved `nginx -s reload`, check the *real* public OAuth redirect, fail-closed callback, and unchanged health/finance routes. On failure, restore both original files and reload only after syntax validation. Do not restart Node, Spring, Next or PostgreSQL for this route-only change.

Versioned EN and Korean incident evidence: `docs/worklog/2026-11-17-discord-oauth-gateway-v2026.11.17.4{,.ko}.md`.

`discord-oauth-canonical-start-v2026.11.17.4.conf` belongs **only in the public `server { listen 80 default_server; ... }` block**, and catches the two provider authorize start routes. On `www.easy-scraping.com`, it redirects to canonical **before** a host-only session is created; leave callback routes untouched. Independently validate on an isolated second-port Nginx canary, then syntax-test the full candidate and reload without stopping existing services.
