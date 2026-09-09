# Image rendering hardening and performance cleanup

Date: 2026-09-09
Branch: `fix/image-hardening-20260909`

## Scope

- Audit all production image rendering paths in frontend, gallery, board, announcements, profile, cosmetics, and admin content.
- Preserve the privacy boundary for external/member-supplied and viewer-bound image URLs.
- Remove avoidable raw `<img>` optimization warnings without routing protected images through the Next.js optimizer.
- Fix local preview object-URL lifetime handling.

## Changes

- Public same-origin gallery, announcement, and board images now use `next/image` with responsive `sizes` and stable fill containers.
- External HTTPS content images stay browser-direct by enabling `unoptimized`, preventing the Next.js server from fetching operator/member supplied remote URLs.
- Viewer-bound images (profile images, member draft submissions, admin review images, cosmetics) explicitly use `unoptimized` so optimizer requests cannot lose viewer cookies or become an SSRF proxy.
- Image elements consistently use async decoding and `no-referrer` where a third-party host may receive the request.
- Profile avatars now lazy-load by default and retain the existing on-error initial fallback.
- Admin announcement local file previews revoke prior `blob:` object URLs on replacement/unmount to prevent browser memory growth.
- The only remaining production raw `<img>` is the browser-local `blob:` preview; it has a scoped ESLint exception because sending that local-only URL through an optimizer is neither useful nor safe.

## Validation

- `eslint .`: passed with 0 errors and no image optimization warnings.
- Workspace typecheck: contract, database, backend, frontend all passed.
- Frontend Vitest: 51 files, 533 tests passed.
- Next.js production build: passed.
- `git diff --check`: passed.

## Deployment status

- [x] Changes implemented on isolated branch/worktree from current `origin/main`.
- [x] Local lint/typecheck/frontend tests/production build passed.
- [ ] Push branch and run CI/test deployment.
- [ ] Verify test site image routes and responsive rendering.
- [ ] Merge to `main` after test verification.
- [ ] Deploy and verify production.
