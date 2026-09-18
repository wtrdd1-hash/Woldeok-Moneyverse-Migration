# v2026.09.18.213 — AdSense iframe CSP Test-gate repair

- Branch: `fix/ui-adsense-frame-csp-v2026.09.18.213`
- Base: `1457797823b4ba54fa373564ce30681d56b36100`
- Scope: frontend security header only; no backend/database change

## Fix
Real Test-edge Chromium reproduced frame CSP blocks for `ep2.adtrafficquality.google` and `www.google.com`. Ads-enabled `frame-src` now includes the adtrafficquality apex/wildcard and exact `www.google.com`. Ads-disabled mode remains `frame-src 'none'`.

## Gate
Exact merged SHA must be rebuilt for Test, verified with browser CSP/overflow checks and backend health, then promoted to Production through a separate frontend canary and atomic Nginx cutover.
