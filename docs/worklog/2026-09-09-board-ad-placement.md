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

## Deployment state

- Working branch: `fix/board-ad-20260909`.
- Dedicated test-server rollout: pending.
- `main` merge: pending until test-server verification.
- Production rollout: pending until test-server verification and `main` integration.
