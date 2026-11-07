# Plan — Member Photo Owner Read Integrity
1. Reproduce a malformed `/photos/mine` response and an upstream public cache response with focused Vitest tests. Keep fixtures within migration 098 contract.
2. Implement a bounded pure validator in `frontend/src/app/gallery/submit/owner-submissions.ts`; reject malformed, duplicate, invalid date, unsafe image URLs and inconsistent publication states. Use it on the member page and show an accessible unavailable/retry link.
3. Force `private, no-store`, `noindex` and `no-referrer` for Android `photos/mine` responses at the final gateway handler; retain the backend session/consent and SECURITY DEFINER owner read.
4. Execute focused tests, full build/lint/typecheck, integration and isolated PostgreSQL as resources allow. Fetch main and planning mid-run and before any merge. PR remains draft/hold unless all gates pass.
