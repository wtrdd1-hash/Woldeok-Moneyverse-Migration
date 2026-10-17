# v2026.10.17.761 operational release and branch consolidation
START KST 2026-10-17 10:34:27
Main at START 4a7c1398c8611a514650d33db48bf5bbf6ac4594
Current public Test c2d4667b, Production 176ca04e.
Before work: read PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, DOCUMENTATION_POLICY, RELEASING and v753–v755 findings. Concurrent owned PR #912/#898 and historical drafts preserved until review; do not blindly cherry-pick old branch migrations.
Goal: repair latest Test schema and exact SHA; produce non-waived Production financial acceptance or bounded fail-closed remediation.
No invented WLD journal, production DB account update or forced grant.

## MID and TEST promotion
- Preserved authenticated Test data with full ownership and ACL into new Test DB, applied canonical SQL 273/274 and SHA256 checksum-verified 273 canonical files with 3 retained old Test lineage records. Account 60 and session 96 row fingerprints identical.
- Built Nest, Next production (590 static pages) and internal contract exact-main; private canary Test league and PvP GET 200, scheduler off.
- At 10:39 KST, initial public Test switch failed because private canary PORT=3150 override leaked into public Test (Nginx expected 3100); rollback actually restored v753 within a minute. Revised cutover file strips private PORT override. Public Test version 4a7c1398c8611a514650d33db48bf5bbf6ac4594 successful at 10:41 KST, public Test health, backend/frontend identities, authenticated-negatives and 11 anonymous responsive routes, finance check succeeded. Existing Test v753, original Test DB and database backups retained. Production remained v717.
- Deep Production forensics after Test published proved +4,410 WLD unjournaled since Oct11 from 98 NPS payout receipts ×45 WLD. A separate v762 P0 source/SQL remediation slice was implemented without changing Production.
