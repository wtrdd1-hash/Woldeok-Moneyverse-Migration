# Backend B v486 — public SEO status privacy (draft candidate)
- Reintroduced public aggregate-only crawler metrics and protected administrator-only detail endpoints after the prior v482 PR was closed unmerged.
- Public Next API fails closed on malformed/unavailable upstream responses instead of returning fabricated success metrics.
- New regression: nested stock/guide coverage objects expose only indexed/total counters, even when the backend source contains private diagnostic fields. Both backend and Next BFF project the nested allowlist.
- No schema/migration/ledger/production changes. Existing QA-owned wallet CSV lint defect prevents required CI success. Official real PostgreSQL, authenticated App API/E2E, isolated Test exact-SHA and release gate are NOT verified. Draft/HOLD.

## CI / release outcome
- Draft PR #1018; source SHA `0a5eb55beba463ce36abb98bab8ca022bac7b792` (before final documentation checkpoint).
- CI #39948177056 and Build Test Candidate #39948150178 both FAIL in runtime-check `pnpm lint`, existing QA-owned CSV regex line 19. Exact source SHA focused 7 backend + 11 frontend PASS; backend full 1310 PASS/397 DB skipped, frontend full 1380 PASS, contract 38 PASS, build/typecheck PASS.
- Real PostgreSQL integration, authenticated app E2E and isolated Test exact-SHA remain BLOCKED. No merge, no Production, no branch cleanup. All five core automations stay enabled.
