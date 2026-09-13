# Worklog — Ads Default Enabled v2026.09.13.42

Date: 2026-09-13
Scope: advertising default policy, frontend runtime switch, release automation, regression coverage and planning/operations documentation
Deployment: isolated Test verification required before Production

## Inputs reviewed before implementation

- latest application `main` (`4683ee5b40567278f93f1e991fbfc23d4534362d` at the start);
- `docs/planning/PROJECT_PLAN.md` and Korean counterpart;
- `docs/operations/SEO_ADS_LEGAL_AUDIT.md` and Korean counterpart;
- `frontend/src/components/adsense-ad.tsx`;
- `frontend/src/components/public-advertisement.tsx`;
- current public ad placements in home/gallery/board/announcements;
- `frontend/src/lib/adsense.ts`, `frontend/next.config.ts`, `frontend/Dockerfile`;
- `.github/workflows/test-candidate.yml` and `.github/workflows/deploy.yml`;
- `docs/architecture/deployment-flow.md` and the live `wtrdd1-hash/kuber-infrastructure` GitOps source.

## Finding

The advertising implementation had not been removed. The live-release path was the problem: Production automation defaulted `enable_ads` to false, automatic `workflow_run` releases resolved `ADS_ENABLED=false`, and publisher/slot build args were blanked. The frontend library and CSP also treated a missing flag as disabled.

That combination meant a successful automatic Production release could intentionally produce an ad-free frontend even though reviewed AdSense components and placements existed.

## Implementation decision

Make reviewed advertising default-on while keeping two safety boundaries:

1. advertising remains limited to the existing reviewed public-content allowlist and stays blocked on sensitive/transaction/gameplay routes;
2. Test and emergency policy/compliance holds can explicitly set `ADS_ENABLED=false`.

The isolated Test candidate workflow remains explicitly ad-free so QA does not create real ad impressions or requests.

## Files changed

- `.github/workflows/deploy.yml`
- `frontend/Dockerfile`
- `frontend/src/lib/adsense.ts`
- `frontend/next.config.ts`
- `frontend/src/lib/adsense.test.ts`
- `frontend/src/security-headers.test.ts`
- `docs/planning/PROJECT_PLAN.md`
- `docs/planning/PROJECT_PLAN.ko.md`
- `docs/operations/SEO_ADS_LEGAL_AUDIT.md`
- `docs/operations/SEO_ADS_LEGAL_AUDIT.ko.md`
- English/Korean changelog and worklog for `v2026.09.13.42`.

## Initial validation evidence

Implementation SHA before these final documentation files: `2b984ae556cdead7f757d889dd9117b7eeb151cd`.

Test Candidate workflow run: `34747780450`.

The reusable verify job completed successfully with:

- committed-secret rejection;
- lint;
- raw-control-byte guard;
- typecheck;
- production build;
- PostgreSQL migrations;
- full tests;
- Prisma mutation guard;
- production dependency audit.

Backend Test candidate image build also completed before the final documentation pass; frontend candidate build followed in the same exact-SHA workflow. Because documentation changes create a new final SHA, the exact-SHA Test candidate and public test gate must be repeated on the final head before merge.

## Required mid-work recheck

Application `main` was re-read during the work and had not moved from `4683ee5b40567278f93f1e991fbfc23d4534362d` at that checkpoint.

The GitOps repository was also re-read. Its current `main` had already used project operation version `v2026.09.13.41` for an isolated Test promotion. To preserve sequential project versioning, the final advertising task version was advanced from the preliminary `v2026.09.13.37` draft to **v2026.09.13.42**.

## Test / Production release plan

1. Re-run CI and immutable Test image build for the final application SHA.
2. Promote that exact SHA to `kuber-infrastructure/staging/wdmv-test`.
3. Verify `https://test.easy-scraping.com/api/version` reports the exact SHA.
4. Verify the public backend/database smoke path and frontend/noindex behavior.
5. Recheck application `main` immediately before merge.
6. Merge the application PR only after Test evidence is green.
7. Build same-SHA Production images through the Production release workflow.
8. Promote/reconcile the same SHA through GitOps and verify Production health plus `/ads.txt` and reviewed ad configuration.

## Rollback

No database schema/data change exists. Emergency rollback is either explicit `ADS_ENABLED=false` or reverting the Production GitOps frontend image to the previous verified SHA.

## Remaining risk

Ad serving/no-fill is ultimately controlled by Google and regional consent/policy state. A technically enabled slot may therefore render no creative. That must not be treated as an application failure if the AdSense loader, publisher/slot configuration, CSP and ads.txt authorization are correct.
