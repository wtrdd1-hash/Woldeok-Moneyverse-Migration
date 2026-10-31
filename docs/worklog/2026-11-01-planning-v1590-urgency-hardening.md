# Planning v1590 — F675-203 Feature Improvement (documentation only)

**Previous:** Feature Addition v1588. **Current:** Feature Improvement v1590. **Next:** Feature Addition v1592 (provisional). **DRAFT / RELEASE HOLD**.

## Source and findings
- Latest origin/main `f13bbce273ffc65e8576170992d82ea00c27a1c9` checked at start/mid; #2269 OPEN/UNMERGED; inherited v1588 proposal only, no deployment.
- Read AGENTS.md, README.md, both canonical plans, SQL 071/123, Nest shop controller/repository and Next inventory page. Latest QA v1430 #2271 is a Draft CI migration-target fix for B #2266, not a release gate pass.
- D1 P0: SECURITY DEFINER EXECUTE with caller-provided p_actor is not DB-verified session ownership; block new function grant pending threat-model review and two-owner negative tests.
- D2: 10,001 INTEGER rows max 21,476,983,953,647 units, below 2^53; split 10,001 real-row and 4,194,305-row numeric stress or deterministic transport-double oracles.
- D3: serialize PostgreSQL timestamptz as exact UTC 6-digit microseconds in SQL, not JavaScript Date.
- D4: bound response age, surface stale states, preserve 200 verified-empty vs 503 unavailable.
- Updated P0 4/P1 6; all OPEN; 10,000 independent reference gate newly approved 0, cumulative UNKNOWN/BLOCKED.

## Release boundary
No runtime/API/SQL/DB/WLD/ledger/Test/Production changes or main merge. Feature OFF. New feature tests proposed, not executed. Separate developer branch → security approval → exact-SHA isolated Test → authenticated QA/restore → operator GitOps promotion. Existing Gemini/A/B/C/QA branches unchanged.
