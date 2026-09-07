# Visual Asset Provenance

The `showcase/` images in this repository are documentation assets captured from the deployed Woldeok Moneyverse web service on **2026-09-07**.

## Current capture policy

- Source: `https://easy-scraping.com`
- Capture mode: clean public browser session with no authentication cookies
- Intended use: README/product documentation only
- Private member, admin and secret-bearing screens must not be committed
- Screenshots must not include access tokens, email inboxes, private identifiers or browser developer tools

## Responsive captures

- Desktop: 1440×900
- Tablet: 768×900
- Mobile: 390×844

The screenshots are evidence of the rendered UI at a point in time; feature contracts remain defined by source code, database migrations and the detailed docs.

When a major UI release changes navigation or a showcased surface, recapture the relevant images and note the update in the worklog/changelog.


## Committed showcase set

- `home-desktop.png` — Production home, 1440×900
- `guide-desktop.png` — public service guide, 1440×900
- `casino-desktop.png` — public casino surface, 1440×900
- `status-desktop.png` — public status surface, 1440×900
- `home-tablet.png` — responsive home, 768×900
- `home-mobile.png` — responsive home, 390×844
- `casino-mobile.png` — responsive casino surface, 390×844

Member-only pages that collapse to the same unauthenticated gate are deliberately not duplicated as separate feature screenshots.
