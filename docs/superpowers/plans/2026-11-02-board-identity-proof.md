# Public board identity proof — implementation plan

**Problem:** The public stock discussion read model trusts PostgreSQL `post_id` strings and the Next/Android consumers trust untyped `posts` arrays. A stale or malformed successful response can generate invalid links or duplicate entries. This is a P1 user-facing integrity gap.

**Scope and design:** Preserve the existing latest-50 `SECURITY DEFINER` PostgreSQL read. Reject malformed or case-insensitive duplicate UUIDs at the Nest boundary. Validate the bounded JSON post list at both Next SSR and Android gateway before rendering/forwarding. Do not silently convert unverified data into a verified empty list. Preserve existing stock/title filters and cache policies. No migration, new grant, write path, or financial arithmetic.

**Task 1 (RED):** Extend `backend/src/board/stock-community.service.test.ts` with invalid UUID and case-variant duplicate rows. Add `frontend/src/lib/public-board-list-proof.test.ts` for missing/duplicate/invalid IDs, invalid count, timestamps and empty success. Add Android gateway test injecting invalid 200 payload. Verify failures.

**Task 2 (GREEN):** Implement strict backend post ID and duplicate proof, a shared browser/mobile JSON proof parser, wire SSR fail-closed and Android 503 on unverified 200. Preserve unfiltered valid payloads and stock query behavior. Verify focused tests.

**Task 3 (REVIEW/VERIFY):** Typecheck, lint, full unit/integration, real read-only PostgreSQL probe, API contract, build, supply-chain audit. Re-fetch `main` at mid/pre-PR; record exact SHA and CI. Keep PR Draft/HOLD and Production untouched until all gates pass.

**Rollback:** Revert candidate commit or leave Draft unmerged; no schema/data or deployment mutation.
