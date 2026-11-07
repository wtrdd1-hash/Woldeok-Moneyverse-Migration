# Public board image-description discovery — implementation plan

Status: DRAFT / RELEASE HOLD. Base `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`. Non-interactive scope decision: add literal alt-text discovery to the existing bounded recent-public-board path; do not change money, identity, migrations, or other agents' work.

## Alternatives and contract
- Reject a new unbounded full-text search: it requires new SQL permissions/indexes and would misrepresent the latest-50 snapshot.
- Reuse `member_board_public_list_with_stock(50)` and filter only its already-public `image_alt_text` in PostgreSQL with parameterized `strpos(lower(...), lower($4))`; no wildcard expansion, no new grants, no migration.
- New optional `alt` query (1–80 trimmed characters, no controls or angle brackets), combinable with `stock` and `q`; invalid/duplicate/unknown parameters return 400. Backend returns `appliedImageAltQuery` proof only for alt-filtered requests. Public web and Android must reject missing/mismatched proof and rows without an image; no false-empty on upstream failure.
- Browser uses labelled accessible form control, explicit latest-50 scope and invalid/unavailable/verified-empty states. Filtered URLs noindex and no-store on Android. No private member data, account writes, or raw query logs.

## TDD and verification tasks
1. RED backend controller/service tests for `alt`, literal `%_`, combined queries, malformed inputs and SQL parameter binding; RED Next form parser and Android proof/noindex tests.
2. GREEN minimal backend, web and Android implementation; preserve existing title/stock search and all other routes.
3. Verify target tests, typecheck, lint, builds, contract, PostgreSQL read-only source function, CI, official Test exact SHA, security and release gate. Never merge or deploy without all PASS.
4. Re-fetch main at mid and pre-integration; record SHA, branch/PR audit, failures, held blockers, rollback and untouched branches in EN/KO QA and worklog.
