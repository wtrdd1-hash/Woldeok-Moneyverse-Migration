# Security activity date window
Read-only enhancement. Filter latest 20 owner events by inclusive KST dates.

Goal: Signed-in members can filter their latest 20 owner-only security events by a Korea-time inclusive date range, optionally with category. This is NOT full-history search.

Contract: both from/to required or neither; canonical YYYY-MM-DD Gregorian dates, from<=to, <=366 calendar days. KST midnight UTC+09; end exclusive. Malformed/duplicate inputs rejected. Android rejects out-of-range success evidence. No database migrations, direct table grants, mutations, or financial writes.

TDD plan:
1. Backend RED tests: invalid ranges, owner SQL call, KST boundary, category combination. Implement parser/controller/repository and rerun.
2. Frontend RED tests: date controls, invalid range, backend mismatch, verified-empty. Implement page and range parser.
3. Android RED tests: duplicate/malformed inputs, backend mismatch. Implement app-api fail-closed guard.
4. Recheck main and English/Korean plans. Run focused tests, lint, typecheck, build, mobile contract, real PostgreSQL ACL and rollback where possible. Full-suite and official exact-SHA Test required for merge.
5. Commit to isolated branch and open Draft PR; write QA and release HOLD with SHA, branch counts and blockers.

Rollback: revert branch/PR only. No DB change or Production promotion.
