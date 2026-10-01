# v2026.10.01.497 App/Site/Economy Core Security Design Worklog

## Start record

- Date: 2026-10-01 KST.
- Task: extend approved v497 direction with explicit security boundaries for separate App Core and Site Core, one Economy Core, and bounded AI numeric policy changes.
- Base design branch: `docs/unified-macroeconomy-v2026.10.01.496@96620ea610e0a39841965010307797993f1566a2`.
- Latest checked `origin/main`: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`.
- Isolated worktree: `/home/debian/.worktrees-moneyverse/api-security-economy-core-v497`.
- Branch: `docs/api-security-economy-core-v2026.10.01.497`.
- Scope is architecture/research documentation only. No runtime, database, Test, or Production mutation is claimed.
- Read authority: AGENTS.md, Documentation Policy, Project Plan, Integrated Planning Master, Security Master Plan, Security Assurance Master Plan, database-security architecture, runtime security model, mobile API runtime contract, AI Economy Controller spec, and v496 macroeconomic design.
- External primary/current security refresh includes OWASP API Security 2023, OWASP MASVS, NIST SP 800-207/207A, RFC 9700, RFC 9449, RFC 8705, current PostgreSQL SECURITY DEFINER guidance, Google Play Integrity, NIST AI RMF/GAI profile, and OWASP LLM Excessive Agency.
- Reference corpus evidence from the preceding research pass: 149,691 deduplicated discovery records across economy, AI, safe control, BFF/API, security, banking, market integrity, causal policy evaluation, game economy, labour/business, and abuse detection. This is a discovery corpus, not a claim that every record was read in full.

## Mid-work record
- Mid-work `origin/main`: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`; no authority drift detected.
- Wrote the EN v497 App/Site/Economy Core security architecture and paired research review.
- Security design adds separate App/Site BFF boundaries, one Economy Core, two-channel workload+actor authorization, generated API inventory, request hashing/replay protection, mobile integrity binding, database-role containment, AI no-write boundary, policy registry and explicit numeric AI limits.
- Current official/source refresh included Microsoft/AWS BFF guidance, OWASP API Security/MASVS, NIST SP 800-207/207A, RFC 9700/9449/8705, PostgreSQL function-security guidance, Google Play Integrity, NIST AI RMF and OWASP LLM Excessive Agency.
- Research evidence records 118,490 newly collected Crossref unique records and 149,691 final unique discovery candidates after merge/deduplication.

## End-of-design record
- Final `origin/main`: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`; unchanged during work.
- EN/KO written-spec topology: H1 1/1, H2 37/37, H3 42/42, section sequence 1..37 matches.
- EN/KO research-review topology: H1 1/1, H2 6/6, H3 12/12.
- Core invariant checks cover App/Site split, one Economy Core, workload+actor separation, AI self-bound prohibition, direct balance/price/history write = zero, tax 100% Treasury and explicit AI numeric envelopes.
- This cycle remains research/architecture documentation only. Canonical Project Plan integration, runtime, database, Test and Production changes are not claimed.
