# Planning v1640 — F675-216 Verified Owner Inventory Status Support Inquiry
**GitHub handoff:** Draft PR #2444 OPEN/HOLD; developer issue #2442; no merge/deployment.
**Verification:** release/security/backup 171/171 PASS; release classifier 24/24 PASS; QA 22/23 PASS with one pre-existing warfare-copy assertion FAIL (#2391); four EN/KO pairs PASS; git diff --check PASS. New-feature acceptance NOT RUN.
**2026-11-02 08:00 KST | FEATURE ADDITION | DRAFT / RELEASE HOLD**

Previous Feature Improvement v1638 → Current Feature Addition v1640 → Next Feature Improvement v1642 (provisional). Parent Draft #2439; developer handoff issue #2442. Read AGENTS.md, README.md, English/Korean plans; origin/main a8541927c3a351d980454c66e95a3356c47e0722 checked at start and mid; miniPC Debian 13 services active and DEV PostgreSQL connected.

**Observed evidence:** current /inventory hides unavailable active reads as [], migration 123 excludes expired rows, migration 104 restamps expiry on quantity increases, and migration 196 generic support_create_thread replays by owner/key without validating subject/body equality. New design uses a dedicated owner-bound preview token, atomic current-row verification and payload-bound support case receipt; it is a proposal, not evidence of a Production defect. No runtime or DB change. Existing A/B/C/QA branches left untouched.

**Handoff:** P0 4 / P1 6 in paired canonical plans. Exact-SHA Test, finance/ACL/independent restore gates HOLD. External independently approved references newly 0; cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS. Verification and GitHub PR/issue evidence recorded separately after checks.
