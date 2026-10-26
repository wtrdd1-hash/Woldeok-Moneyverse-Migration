# Gallery submission receipt validation — C v1066

## Source-backed defect and boundary
The member gallery upload sends image bytes to `/api/v1/photos/uploads`, then records a draft via `POST /api/v1/photos`. `MemberPhotoRepository.submit` returns `{photo_id, submitted_at, replayed}` from `member_submit_photo`. The current Next server action displays success for any truthy response object, even one missing a valid `photo_id`, and trusts a malformed upload `storageKey` until the second API call. This can tell a member that a photo is awaiting moderation without evidence of a persisted draft. Do not change publication authorization or the private storage boundary.

## Steps / acceptance
1. RED: add isolated server-action tests for valid/replayed receipts, malformed/null receipt, malformed storage key, failure and invalid input.
2. GREEN: validate upload key and persisted draft receipt shape before success and revalidation; fail closed with actionable retry text. Do not claim that an uncertain response means no draft was written.
3. Verify keyboard/mobile form and private noindex, API/DB contract, lint, typecheck, full frontend suite, production build, isolated PostgreSQL, security audit and remote CI. No writes to Production-connected DB.
4. Re-fetch main and living plan at checkpoints. Preserve other work. Open Draft PR; do not merge or deploy without all gates and exact-SHA Test.
