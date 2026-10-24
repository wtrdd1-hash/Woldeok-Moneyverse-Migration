# Planning v1250 — F675-119 Reset, Identity and Receipt Integrity

- Previous: Feature Addition v1248. Current: Feature Improvement v1250. Next: Feature Addition v1252 provisional.
- Canonical main: `c9a868b1e622341e2daa8b936ddf0988eda9988e`; verified start and mid, and check again at finish. Source-of-truth: main AGENTS.md, README.md, PROJECT_PLAN.md English, PROJECT_PLAN.ko.md Korean. Prior Draft #1219 unmerged.
- Source inspection: dashboard robots already noindex; account_soft_delete marks users deleted and revokes sessions without physical DELETE, so FK CASCADE alone does not erase shortcut preferences; Android app gateway forwards DELETE bodies but not If-Match/Idempotency-Key headers. No production incident claimed.
- Corrections: persistent reset tombstone with monotonically increasing CAS version prevents ABA; atomic child delete+reinsert avoids immediate UNIQUE position conflicts; original request digest receipt and bounded replay, account switch fencing, soft-delete cleanup approval, owner-only APIs and mobile parity.
- P0: ENV1250-01 SEC1250-02 REL1250-03 DASH1250-04. P1: DASH1250-05 DASH1250-06 DASH1250-07 DASH1250-08 DASH1250-09 DASH1250-10.
- QA v1253 FAILED/HOLD: root 100%, shared Production/dev DB, excessive app DML and PUBLIC bank EXECUTE, migration266 checksum and 280 collision, exact-SHA Test E2E and isolated restore unverified.
- Independent external evidence: 0 newly approved, cumulative UNKNOWN/10,000, BLOCKED/IN PROGRESS. Docs only, feature OFF, no runtime/DB/WLD/Test/Production changes.
