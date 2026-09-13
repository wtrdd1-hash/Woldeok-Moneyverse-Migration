# SEO, Advertising, and Legal-Notice Operations Audit

Baseline date: 2026-09-08
Last policy sync: 2026-09-13 (v2026.09.13.37)

## Operating rules

- Search indexing is allowed only for the canonical production deployment with `SEO_INDEXING_ENABLED=true`. Test and temporary hosts fail closed with the default `false`.
- Reviewed public-surface advertising defaults to enabled. Production builds use `ADS_ENABLED=true` and the approved publisher/slot unless an operator explicitly disables ads for an emergency policy/compliance hold. The isolated test build explicitly sets `ADS_ENABLED=false` and empty AdSense identifiers.
- Root `/ads.txt` declares publisher `pub-5220225531544323` as `DIRECT`.
- Ad placements are limited to reviewed public surfaces: home, announcements/list/detail, operator-reviewed public gallery content, and one bottom placement on the public community-board index. Individual board post/comment detail pages remain ad-free.
- Do not place ads on shop purchase flows, account, wallet, transfers, stocks, loans, casino, rewards, admin, status, terms, or privacy surfaces.
- WLD remains service-internal virtual data with no cash redemption, withdrawal, or physical-prize exchange.
- For EEA, UK, and Swiss visitors, the deployed Google Privacy & messaging flow or Google-certified CMP must match the privacy notice in actual operation.

## 2026-09-13 changes — v2026.09.13.37

- Changed reviewed public-content advertising from opt-in to default-on.
- Production release builds now keep the approved AdSense publisher and slot populated for automatic releases.
- Manual production dispatch defaults advertising to enabled while preserving an explicit emergency disable switch.
- The isolated test candidate remains explicitly ad-free, so staging/QA cannot generate real ad traffic.
- Updated regression coverage so missing ad flags mean enabled, while explicit `ADS_ENABLED=false` removes the AdSense loader/CSP origins.

## 2026-09-08 changes

- Changed Docker SEO/AdSense defaults to explicit opt-in (`false`) at that time.
- Changed AdSense runtime configuration to remain disabled without an explicit enable flag at that time.
- Removed advertising from the shop page to reduce adjacency risk around transaction/purchase UI.
- Aligned the privacy notice with the actual permitted public-content ad placements.
- Added a regression test for the opt-in behavior that is superseded by the 2026-09-13 default-on policy.
- Added deployment smoke checks for `/robots.txt`, `/sitemap.xml`, `/ads.txt`, and environment-specific indexing/ad expectations.

## Production verification checklist

1. Production: `APP_BASE_URL=https://easy-scraping.com`, `SEO_INDEXING_ENABLED=true`, `ADS_ENABLED=true` unless an emergency hold explicitly disables ads.
2. Test: `SEO_INDEXING_ENABLED=false`, `ADS_ENABLED=false`, empty AdSense publisher/slot build args.
3. Verify production `/robots.txt`, `/sitemap.xml`, and `/ads.txt` return HTTP 200.
4. Verify an allowlisted public page loads the reviewed AdSense script/configuration, while blocked/sensitive routes do not render an ad placement.
5. Review sitemap submission, indexing, and canonical status in Search Console.
6. Review ads.txt authorization and Policy Center warnings in AdSense.
7. Verify the Google Privacy & messaging/CMP prompt actually appears for applicable regions in a clean browser session.

> This is a technical and operational audit record, not legal advice. Reassess privacy, youth-protection, and game/gambling regulations whenever functionality or monetization changes.
