# v2026.11.20.42.3.1 — Actual Production member homepage after visual repair

- [Actual public HTTPS mobile 390px, Korean auto locale, guest](live-home-390-ko.png)
- [Actual public HTTPS desktop 1440px, Korean auto locale, guest](live-home-1440-ko.png)

These are Chromium captures of the **real Production HTTPS user HOME** (not an image-only design mock), on 2026-11-20 KST after the corrected deploy. Real public SQL-backed market quotes were loaded via the existing Production Spring API; guest private wallet is not shown without verified session and stock-ticker values are public market data. The deployed member-home client refuses the legacy synthetic `post-wld-*` board IDs, so the community feed explicitly displays unavailable. No actual private member/session or administrator values are included. Images document visual state only, not all feature QA or an endorsement of invented legacy Treasury numbers.

Visually measured layout tests: widths 320/360/390/430/768/1024/1440, full-width first personal card with two compact secondary cards on small phones, two-column action layout, 44px tap targets, compact real market quote rows on small phones instead of overflowing 760px table, no floating support button over touch targets on widths <=1023. Separate real public market/visual checks 6/6 and repeated locale/mobile browser 30/30. Source/HTML+CSS+JS exact hashes documented in [QA](../../qa/2026-11-20-member-home-visual-incident-v42.3.1.md).
