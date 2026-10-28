# v2026.10.28.1413 — Production blog runtime QA

Status: IN PROGRESS — read-only diagnosis, no content change or promotion.

## Before work
- Authority: AGENTS.md; integrated master; v1405 two-hour publishing; v1412 verified publication candidate; v1406 legacy withdrawal.
- Work partition: documentation-only QA branch; separate worktree; no overlapping application files modified.
- Prior host record: /home/debian/moneyverse-qa-records/blog-audit-20261028-135905.md.
- Perform read-only GET and mobile browser navigation only; no financial DB mutation.

## In progress
- [x] Compare current owner policy to latest main and release evidence.
- [x] Check running services and scheduler logs.
- [x] Inspect live blog API, new verified API, sitemap and post routes.
- [x] Measure article duplication, source evidence, country/topic mix.
- [x] Browser layout smoke at 320/375/768/1024px.
- [ ] Record detailed findings and root-cause candidates.
- [ ] Reconfirm main, finalize bilingual QA.
- [ ] Finish with release state and verification summary.

## Checkpoint
- 11 live posts all KR, 4 distinct titles, 4 test-titled posts, zero external source URLs in content, zero of 11 indexed in production sitemap.
- Legacy JSON 199-withdrawal record v1406 precedes 11 new public articles; creator unknown.
- Verified list API returns HTTP 500; old public list API HTTP 200.
- Production backend BLOG_TWO_HOUR_PUBLISHER_ENABLED is unset; scheduler done != publication.
- Listing mobile smoke passed all widths; article subcomponents and authenticated admin not attested.
