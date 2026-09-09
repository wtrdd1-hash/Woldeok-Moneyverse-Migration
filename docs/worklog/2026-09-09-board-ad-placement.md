# Community Board Advertising Placement — 2026-09-09

## Goal

Add the existing reviewed AdSense unit to the public community board without expanding advertising into individual user-generated post/comment detail pages or sensitive economy/gameplay surfaces.

## Implementation

- Added one `PublicAdvertisement` placement after the `/board` post-list section.
- Kept `/board/[postId]` ad-free, including post body, uploaded image, comments, author controls, and comment form.
- Reused the existing fail-closed `ADS_ENABLED` / publisher / slot configuration and the shared no-fill collapsing behavior.
- Updated the Living Plan, SEO/ads operations audit, and privacy notice so documented ad surfaces match runtime behavior.
- Added a regression test that fixes the board advertising boundary: exactly one placement on the index, none on post/comment detail pages.

## Policy boundary

Google states that publishers remain responsible for policy compliance on pages containing user-generated content. This release therefore does not monetize individual UGC detail pages and keeps the single board-index placement below the content list, separated from the post-creation controls.

References:
- https://support.google.com/adsense/answer/1355699?hl=en
- https://support.google.com/adsense/answer/23921?hl=en
- https://support.google.com/publisherpolicies/answer/11035030?hl=en

## Verification completed before test-server rollout

- Targeted board/AdSense/CSP tests: 12/12 passed.
- Frontend TypeScript check: passed.
- Repository ESLint: 0 errors, 11 `@next/next/no-img-element` warnings on existing image call sites.
- Repository `pnpm test`: passed (contract 23, database 6, backend 822, frontend 535; database-gated backend tests remain skipped when their isolated PostgreSQL harness is not provided).
- Repository `pnpm build`: passed, including Next.js production build.

## Test-server verification

- Synced the feature branch with current `origin/main` (`3e7c8a2`) without conflicts; integrated head: `9921411`.
- Re-ran repository lint, tests, and production build on the integrated head: passed with the same 11 existing image warnings and no lint errors.
- Built and ran exact commit `9921411` in an isolated `wdmv-test` Kubernetes verification stack with a mock board API; Production DB/API were not reused.
- `/board`: HTTP 200, sample public post rendered, approved AdSense loader and slot `2118692561` present, CSP admitted the AdSense origin.
- `/board/11111111-1111-4111-8111-111111111111`: HTTP 200, post/comment rendered, AdSense loader absent and ad slot absent.
- Test responses retained `X-Robots-Tag: noindex, nofollow`; the Traefik Host-header route for `test.easy-scraping.com` returned HTTP 200.

## Deployment state

- Working branch: `fix/board-ad-20260909`.
- Ephemeral dedicated test-server verification: passed on integrated commit `9921411`.
- `main` merge: pending final GitHub CI.
- Production rollout: pending `main` integration because the GitOps production-image workflow only builds immutable release images from `main`.
