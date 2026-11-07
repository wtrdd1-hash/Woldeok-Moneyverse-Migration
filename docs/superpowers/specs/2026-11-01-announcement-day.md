# Seoul publication-day discovery for public announcements — bounded design

## Intent and decision
The standing A mandate is one end-to-end P1 member-facing improvement. Add a precise publication-day filter to the **existing latest 20 published announcements** on web and Android, without pretending this searches all historical notices. Avoid concurrent board, gallery, treasury and member-private work.

## Contract
- Optional `day=YYYY-MM-DD` is a strict valid calendar date, years 2000–2099, interpreted in Asia/Seoul (UTC+09:00); invalid, duplicate or unexpected filtered parameters are HTTP 400.
- No parameter preserves the existing unfiltered public response and SEO canonical URL.
- Filtered backend response includes `publicationDay` echo; Android requires exact echo and independently verifies all rows are in the UTC half-open window, at most 20, with unique IDs. Stale/invalid 200 -> 503, not a fabricated filtered result.
- DB calls only existing `SECURITY DEFINER content_list_published_announcements(20)`; SQL predicates are bound parameters applied to its latest 20 rows; no direct table read, migration, grants or money writes. Preserve pinned-first order.
- Web GET date input, reset and truthful scope notice; invalid date gets explicit error; filtered pages noindex and no-store. Android filtered responses noindex and no-store, including errors.
- Real PostgreSQL read-only validation, no mutation; official Test exact SHA, CI, rollback and release gates required before merge/promotion.

## Risk and rollback
Filtering after the 20-row authorized window intentionally yields zero results for older dates even if historical notices exist; UI must say so. Rollback is a revert of feature commit; no DB migration or state change. Related Draft #2243/#2272 remain untouched; merge requires reconciliation.
