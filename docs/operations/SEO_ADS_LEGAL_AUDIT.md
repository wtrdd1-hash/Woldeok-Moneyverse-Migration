# SEO, Advertising, and Legal-Notice Operations Audit

Baseline date: 2026-09-08

## Operating rules

- Search indexing is allowed only for the canonical production deployment with `SEO_INDEXING_ENABLED=true`. Test and temporary hosts fail closed with the default `false`.
- Advertising is enabled only for production deployments that explicitly set `ADS_ENABLED=true`. The Dockerfile default is also `false`, preventing accidentally built test images from serving ads.
- Root `/ads.txt` declares publisher `pub-5220225531544323` as `DIRECT`.
- Ad placements are limited to public informational surfaces: home, announcements/list/detail, and operator-reviewed public gallery content.
- Do not place ads on shop purchase flows, account, wallet, transfers, stocks, loans, casino, rewards, admin, status, terms, or privacy surfaces.
- WLD remains service-internal virtual data with no cash redemption, withdrawal, or physical-prize exchange.
- For EEA, UK, and Swiss visitors, the deployed Google Privacy & messaging flow or Google-certified CMP must match the privacy notice in actual operation.

## 2026-09-08 changes

- Changed Docker SEO/AdSense defaults to explicit opt-in (`false`).
- Changed AdSense runtime configuration to remain disabled without an explicit enable flag.
- Removed advertising from the shop page to reduce adjacency risk around transaction/purchase UI.
- Aligned the privacy notice with the actual permitted public-content ad placements.
- Added a regression test for the opt-in behavior.

## Production verification checklist

1. Production: `APP_BASE_URL=https://easy-scraping.com`, `SEO_INDEXING_ENABLED=true`.
2. Test: `SEO_INDEXING_ENABLED=false`, `ADS_ENABLED=false`.
3. Verify production `/robots.txt`, `/sitemap.xml`, and `/ads.txt` return HTTP 200.
4. Review sitemap submission, indexing, and canonical status in Search Console.
5. Review ads.txt authorization and Policy Center warnings in AdSense.
6. Verify the Google Privacy & messaging/CMP prompt actually appears for applicable regions in a clean browser session.

> This is a technical and operational audit record, not legal advice. Reassess privacy, youth-protection, and game/gambling regulations whenever functionality or monetization changes.
