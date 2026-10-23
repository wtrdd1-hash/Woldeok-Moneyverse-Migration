# Backend B v486 — public SEO status privacy (draft candidate)
- Reintroduced public aggregate-only crawler metrics and protected administrator-only detail endpoints after the prior v482 PR was closed unmerged.
- Public Next API fails closed on malformed/unavailable upstream responses instead of returning fabricated success metrics.
- New regression: nested stock/guide coverage objects expose only indexed/total counters, even when the backend source contains private diagnostic fields. Both backend and Next BFF project the nested allowlist.
- No schema/migration/ledger/production changes. Existing QA-owned wallet CSV lint defect prevents required CI success. Official real PostgreSQL, authenticated App API/E2E, isolated Test exact-SHA and release gate are NOT verified. Draft/HOLD.
