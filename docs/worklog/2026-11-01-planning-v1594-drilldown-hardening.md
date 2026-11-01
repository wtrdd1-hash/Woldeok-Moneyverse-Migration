# Planning v1594 — F675-204 Feature Improvement (documentation only)

**Previous:** Feature Addition v1592. **Current:** Feature Improvement v1594. **Next:** Feature Addition v1596 (provisional). **Draft #PENDING / RELEASE HOLD**.

## Evidence and design decisions
- Latest `origin/main=f13bbce273ffc65e8576170992d82ea00c27a1c9` verified at start/mid; #2283 OPEN/UNMERGED, not deployed. Read AGENTS, README, EN/KO canonical plans, SQL 071/123, Nest controller/repository, Next inventory, QA #2285. miniPC Debian 13 services active, dev DB connected, MCP cgroup 954/1027 tasks.
- D1: full-band fingerprint detects state differences, **not** intermediate ABA mutations; do not promise any mutation always yields 409. A revision scheme requires separate audited write-path scope.
- D2: deterministic ordered JSONB row serialization (UUID, exact UTC microseconds, decimal quantity, code/name/category) plus PG17 SHA-256, one SQL statement per page, algorithm version in AEAD.
- D3: 120s sliding inactivity token renewed per successful page, 30min absolute ceiling; original asOf/digest immutable, 20 default/50 max, 30 requests/min; stale label and restart on 409/410.
- D4: proposed 20,000 matching rows/band, 4MiB canonical bytes, 2s SQL timeout; 503 on overrun, no partial verified-empty; measure before implementation.
- QA #2285 documents AGENTS.md Debian 13 vs NixOS/Kubernetes guidance contradiction; separate docs-owner handoff, no conflicting runtime edits. Test/Production public versions differ from main; exact-SHA Test, DB ACL, finance and restore remain RELEASE HOLD.
- Updated 4 P0 + 6 P1 in issue #2282; external independent reference gate 0 newly approved, cumulative UNKNOWN/10,000, BLOCKED/IN PROGRESS.

## Boundaries
No new SQL/API/Next/Android/runtime code, migration, DB, item, WLD, ledger, Test or Production mutation. Feature flag OFF; proposed PG17 acceptance suite **not executed**. Separate B/A/C/QA development branches and exact-SHA official Test + independent restore + operator approval required before release.
