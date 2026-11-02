# A QA — Published announcement recency (2026-11-03)

**DRAFT / HOLD.** Baseline main f5c3fbedae1c3b3ec2374882b049aac43a655eb4; repair code SHA 81843c78ee18fa332cffdaacac61bf0d7e642cca. The exact final docs SHA and CI outcome will be added to PR #2561.

## Function
- Public web /announcements?recent=7d|30d, Nest /api/v1/announcements, Android /app-api/v1/content/announcements. Existing SECURITY DEFINER content_list_published_announcements(20) remains the only database read. This filters the latest 20 published notices, not the complete historical archive.
- Invalid or duplicate filters reject 400. Android refuses unverified upstream success as 503. Web rejects unverified results; filtered pages are noindex and Android responses no-store/noindex.
- No migration, new table privilege, ledger, payment, or member-data write. TDD red/green included null publication timestamp correction.

## Tests and blockers
- Initial feature SHA fee081bf157fba4e9b9af28e903c22a75d394e39: backend full 2,988 PASS / **2 FAIL** / 518 SKIP; frontend full 2,952 PASS. Known profile HTTP 200-vs-401 failures have separate repair PR #2265. Initial CI runtime-check failed: Next static metadata and generateMetadata exported together.
- Repair SHA 81843c78ee18fa332cffdaacac61bf0d7e642cca: fixed Next metadata export on separate repair branch. Backend/Frontend build PASS, targeted backend 14 PASS, targeted frontend 5 PASS, backend/frontend typechecks PASS, contract 41 PASS, DB unit 72 PASS / 5 SKIP. These are checkpoint results; exact final SHA gates and CI remain separately reportable.
- PostgreSQL 17.11 READ ONLY: published function exists, app EXECUTE=true, latest published snapshot 1, 7d=0, 30d=1. **P0 DEV ACL FAIL:** app role directly SELECTs/UPDATEs announcements, UPDATEs account_balances, DELETEs user_items. No Production DB ACL claim.
- Production-dependency audit 0 findings; full dependency audit **9 findings (1 low, 8 moderate), FAIL**.
- Accessibility 320px/200% and authenticated E2E were not independently exercised. Official exact-SHA Test, backup restore, release identity and rollback gates NOT RUN.
- Public Test SHA 0c70a114da5f4cc5374bc4b80e0403a044f8546f; Production SHA 305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b, both different from candidate.

## Git/release
- Feature and repair worktrees isolated; shared dirty checkout untouched. Announcement PRs #2380/#2377/#2362/#2359/#2347 touch overlapping files. No forced integration or deletion. No main merge, Test/Production deployment, DB write, restart or rollback. Revert code only if later approved; not rehearsed.
