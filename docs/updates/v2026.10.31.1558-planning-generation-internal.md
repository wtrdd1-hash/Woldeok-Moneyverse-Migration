# Planning v1558 — Holding Generation and Precision Truth (2026-10-31)

Previous Feature Addition v1556 → Current Feature Improvement v1558 → Next Feature Addition v1560 (provisional).
Source authority main 30cbbe02f0c27a13630aedf4a39190972d890f02; Draft parent #2149; engineering issue #2148.
Evidence: migrations 071/072/074/103/104/165 show divergent acquired_at behavior; selected conditional PostgreSQL-owned generation epoch and AFTER ROW transition trigger, exact microsecond HMAC token and idempotency, post-lock worker verification. No runtime code, schema, WLD, ledger, Test or Production changes.
New read-only P0: public Test Treasury 200 exposes unverified 60M WLD; Production 503 UNVERIFIED (#2153). Historical QA v1411 is NOT feature acceptance. Official Test exact-SHA, audit, DB ACL/checksums, independent restore BLOCKED; RELEASE HOLD.
Backlog P0 4/P1 6; synthetic 10,001 holdings/2 owners/2 workers acceptance PROPOSED NOT RUN. External independent references new approved 0, cumulative verified/deduplicated/classified UNKNOWN/10,000, BLOCKED/IN PROGRESS.
Full design in existing English canonical and Korean integrated plans; separate feature planning files NOT created. GitHub PR/CI outcome to be recorded on completion.
