# Test Domain External Access — v2026.11.23.1

- Date: 2026-11-23 (Asia/Seoul)
- Scope: Nginx vhost `test.easy-scraping.com`, not production promotion.
- Request: make the test domain accessible from external browsers for user QA.
- Baseline: external HTTPS `/` returned 403; loopback `/` returned 200. Nginx test vhost explicitly denied non-loopback clients and requests with Cloudflare headers.
- Change: removed only the test vhost's loopback-only ACL and Cloudflare-header reject conditions; preserved per-route methods, authentication, proxy routing and no-index behavior. Nginx backup saved on the host as `/etc/nginx/sites-enabled/.moneyverse.before-test-access-20261123-134810.bak` (the exact backup suffix may vary if the script is rerun).
- Validation: `nginx -t` passed; Nginx reloaded. External `https://test.easy-scraping.com/` returned 200, `/login` 200, `/register` 200, `/wallet` 302, `/admin` 302, unauthenticated `/api/v1/wallet` 403, `/favicon.ico` 403. POST `/` from loopback returned 405. `X-Robots-Tag: noindex, nofollow, noarchive` verified.
- Risk/limitations: this change **does not attest** full backend isolation, successful OAuth, or user-data-safe end-to-end QA. The Nginx test vhost contains numerous paths proxied to `127.0.0.1:4550` and requires a separate data-lineage and permissions review before write-capable tests. Some test services remain failed. Do not infer production-readiness or promote from this check.
- Rollback: restore the dated Nginx backup to `/etc/nginx/sites-enabled/moneyverse`, run `nginx -t`, reload Nginx, then verify external 403 / internal 200. Do not use a blanket nginx change affecting production.
- Collaboration: documentation-only branch; changes to Nginx were made directly on the remote host after a host-local backup, and this entry records the operational delta for Gemini/GPT coordination.
