# Verified help whitespace-tolerant search (A1525)

## Problem and scope
Published-only help search uses literal case-insensitive substring matching. A member entering leading/trailing, repeated, tab or nonbreaking spaces can get a false empty result despite an approved article. Both web and Android must use the same canonical query while preserving the existing 100-code-point input cap and fail-closed publication/ACL boundary.

## Design choices
- Use a single pure helper in the shared contract to trim and collapse Unicode whitespace to ASCII spaces. Do not rewrite punctuation, case, Hangul composition or accents.
- Reject raw inputs longer than 100 Unicode code points before normalization, even if whitespace collapse would shorten them; no silent oversized-input acceptance.
- Normalize in the NestJS boundary for all callers, including Android app-api. The Next server action uses the same helper for immediate web feedback; SQL remains the existing immutable `help_public_search` SECURITY DEFINER function.
- Empty normalized query continues to mean approved-category browsing; unapproved, expired, retracted and direct table reads remain excluded.
- No new migration, financial DML, table grants, cacheable search URL or operational release.

## Execution plan
1. Add failing contract, NestJS and Next server-action tests for Unicode whitespace and oversized raw input (RED).
2. Add shared normalization helper and wire NestJS and Next (GREEN).
3. Add bounded user hint, Android gateway contract regression, and isolated real PostgreSQL fixture for canonical query and owner privilege boundary.
4. Run targeted and full test/build/lint/typecheck/security/app-api gates; check main again; open draft PR with exact SHA evidence. Hold integration and Production without official Test authenticated exact-SHA verification.
