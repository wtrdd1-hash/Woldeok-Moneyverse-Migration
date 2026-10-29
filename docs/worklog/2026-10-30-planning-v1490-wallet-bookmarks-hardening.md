# Planning v1490 — wallet bookmarks hardening (2026-10-30 KST)

- Previous Feature Addition v1488; Current Feature Improvement v1490; Next Feature Addition v1492 (provisional).
- Main authority: 62c6cd038951d65c94b709302bdaec6e75b080b6; AGENTS.md, README.md, PROJECT_PLAN.md English canonical and PROJECT_PLAN.ko.md verified start/mid. Predecessor Draft PR #1937 unmerged, existing issue #1936 retained. QA v1380 FAILED/P0.
- MiniPC Debian 13.6 services active; disk root/data 92%/97% at investigation. QA 304 unique SQL migration numbers, 293 applied, five checksum mismatches; historic 462 missing refs/346 nonancestors. SWF focused 6 FAIL/3 PASS. No Production leak or financial movement inferred.
- Source findings: wallet-activity-cursor.ts JS Date milliseconds vs PG microseconds; Android app-gateway.ts request allowlist lacks Idempotency-Key; wallet proxy noindex missing despite private no-store; current activity page lacks bookmark CTA. Separate issue #1935 handles existing wallet privacy response headers.
- Design: member generation-fenced keyset and immutable replay receipt, 24h retry/90d evidence, strict owner SQL, mobile headers, truthful UI, private SEO, 100 cap. Full EN/KO integrated specification, 4 P0 + 6 P1 handoff IDs. Proposed isolated PG 10,001/100/100/50/30 cases NOT RUN.
- External independent deduplicated classified evidence: newly approved 0, cumulative UNKNOWN/10,000; BLOCKED/IN PROGRESS. Runtime, SQL, shared DB, ledger, WLD, Test, Production and other developer branches unchanged. Draft / RELEASE HOLD.
