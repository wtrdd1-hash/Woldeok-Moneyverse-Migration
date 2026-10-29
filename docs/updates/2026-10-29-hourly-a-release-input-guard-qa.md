# QA — P0 release-input documentation executable guard (2026-10-29)

- Baseline main: `54b182d2214a15974350701174175f589789613b`; isolated branch: `auto/hourly-a-release-input-20261029-2248`.
- RED: 3 adversarial cases incorrectly classified as `DOCS_ONLY` (executable docs extension, mode 100755, symlink).
- GREEN: release regression 94 PASS; security regression 17 PASS; changed-file ESLint PASS; Typecheck PASS; Backend Build PASS; Frontend Build PASS (1536 MiB heap).
- BLOCKED: full Lint (3 existing `stale-tab-notice.tsx` errors), full test (Android/mobile API contract drift), Backend 240 failures, Frontend timeout with failures, official exact-SHA Test auth/E2E and independent finance/DB attestation.
- Database unit 56 PASS/4 SKIP, no real-DB migration run; no SQL changed. Test/Production still on `c2129625aa6629c616fb31ce790950618b8d92b2`.
- Do not interpret targeted PASS or successful build as integration or Production release approval.
