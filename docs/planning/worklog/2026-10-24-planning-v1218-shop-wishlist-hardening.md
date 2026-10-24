# Planning v1218 — F675-111 Wishlist Integrity (2026-10-24)

**Cycle:** Previous Feature Addition v1216 / Current Feature Improvement v1218 / Next Feature Addition v1220 (provisional).

**Authority:** main 49788d09494fed3e463651945b83386e87dd47bc, predecessor Draft #1120 207a0cef223eecbd0b5fe40804d90e89a8e73b71; v1223 QA FAILED/HOLD.

**Source:** AGENTS.md §4 idempotency lock, README, migrations 071/165, backend shop controller/repository, frontend Store 2.0, v1216 integrated English/Korean.

**Findings:** ON DELETE CASCADE catalogue FK erases saved-row visibility and REMOVE; mutable updated_at cursor can reorder rows across pages; 180-day receipt pruning without key fence enables replay after expiry. Design decisions and regression gates recorded in both integrated masters.

**P0/P1:** ENV1218-01 SEC1218-02 REL1218-03 SHOP1218-04 SHOP1218-05 SHOP1218-06 SHOP1218-07 SHOP1218-08 SHOP1218-09 SHOP1218-10 (P0 4/P1 6). All proposed, none implemented.

**External:** PostgreSQL https://www.postgresql.org/docs/current/ddl-constraints.html ; OWASP https://api-security.owasp.org/editions/2023/en/0x11-t10/ ; W3C https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ . Three independent publisher families consulted; zero new accepted records; cumulative deduplicated approved UNKNOWN / 10,000; BLOCKED.

**QA:** v1223 five frontend tests failed; full audit 2 CRITICAL/10 HIGH; prod audit 2 HIGH; shared Production/dev DB, broad ACL, wildcard bind, migration266 drift, release #1088, missing exact-SHA official Test finance E2E and isolated restore.

**Deployment:** docs-only Draft, feature OFF, no code/DB/WLD/Test/Production/feature-switch changes, no branch deletion or merge.
