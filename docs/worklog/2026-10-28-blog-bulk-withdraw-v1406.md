# Worklog — Production blog bulk withdrawal v2026.10.28.1406

**State:** PRODUCTION DATA CHANGED / PUBLIC VISIBILITY VERIFIED. No application build, code release, Test promotion, schema migration, or money/ledger change.

## Start (2026-10-28 01:09 KST) — v1406.0
Owner requested immediate deletion of currently existing blog posts. Checked the integrated plan and the blog v1107/v1108 owner policy; the latter permits owner-authorized withdrawal, requires audit retention, and does not allow automatic withdrawal solely for review delay. Current production serves legacy frontend/blog JSON, not the proposed audited DB publisher. Local worktree had unrelated in-progress work, so no source-tree edits were made there. Baseline GitHub origin/main at documentation branch creation: `4f5efd1f`.

## Inventory and protected operation (01:09–01:13 KST) — v1406.1
Actual shared runtime file: `/srv/moneyverse-data/shared/blog-posts.json`. Before operation: 199 entries; 17 explicitly PUBLISHED, 181 without status, 1 already WITHDRAWN; 6 publicly discoverable guides observed via live `/api/blog`. SHA256 before: `4c8664e85a803fbd1eb3d717e7e1763a4c8b77af706156b956c5ebf09e9fcfcb`.

A root-restricted byte-exact backup and a private per-slug audit were written in `/srv/moneyverse-data/ops/private/blog-withdraw-20261028-v1406/`. With a fresh pre-commit file hash check, 198 previously non-withdrawn entries were marked `WITHDRAWN`, given UTC withdrawal timestamps and owner-request reason; the 1 previously withdrawn entry was preserved. A temporary file was flushed/fsynced and atomically renamed with original owner/group/mode. Post-operation store: 199/199 WITHDRAWN, active 0. SHA256 after: `e1b6f8a634dbb37ed663356d857c6785f9643d5216f4ccf199bdd6833f362515`.

## Live verification (01:13 KST) — v1406.2
Public `https://easy-scraping.com/api/blog` and local `:3354/api/blog` both responded 200 with `count=0`. The Korean, US-English, Japanese, and Chinese blog hubs returned 200 but zero posts; two formerly reachable article URLs and two prior `country-guide-*` routes returned 404. Public `/sitemap-blog.xml` retained only the four country hub URLs, with no article URLs. Re-read the live shared store: 199 entries, 0 active. Google/Naver deindexing is **not** verified or instantaneous. Legacy routes currently return 404 rather than the future proposed 410.

## Documentation and coordination — v1406.3
Dedicated branch `ops/blog-bulk-withdraw-v1406-20261028` based on fetched `origin/main`; notes are evidence, not a code release or a bypass of any release gate. Legacy daily cron and possible other publishers were **not disabled**: the request was to remove existing posts, while owner previously requested future automatic publication. A subsequent publisher can create *new* articles; monitoring/revalidation is a separate task. Do not restore backup blindly, as that could overwrite legitimately later-created content.

## Completion
Public withdrawal verified in the active production origin and recorded locally. No production binary rollout or financial DML took place. Documentation branch and paired update/changelog notes record the result. Link to private operation audit is intentionally an on-host absolute path, not a Git asset.

**Mid/finish main recheck:** Fetched origin/main again before committing; SHA remained `4f5efd1f` (zero additional commits), and production shared file still had 199 entries / 0 active. No source integration performed.
