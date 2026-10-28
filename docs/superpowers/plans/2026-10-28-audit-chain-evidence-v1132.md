# C v1132 bounded implementation plan
1. Write Vitest cases for canonical audit verification history, empty list, UUID/date/count/status contradictions, duplicate rows and BigInt precision; run RED.
2. Implement strict pure `parseAuditVerificationHistory` in `frontend/src/app/admin/logs/integrity/verification-evidence.ts`; run GREEN.
3. Wire `page.tsx` to parse `unknown` API payload and render alert on missing/invalid history (never a success badge); keep empty valid list distinct. Include `robots: noindex` and existing responsive table/keyboard semantics.
4. Run focused and full frontend, backend unit/isolated PostgreSQL, lint, typecheck, builds, security and API contract. Publish exact SHA CI, preserve HOLD if any gate fails. Re-fetch main mid and before merge.
