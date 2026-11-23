# 실제 Test 상태 API 읽기 권한 경계 결함

Observed against the real isolated Test backend f0336fded6068f884c87f88efedeb770fd3387d4: GET /api/v1/status returns503. StatusTruthService.publicStatus directly reads content_status_sources and content_status_snapshots. A READ ONLY catalog probe as moneyverse_app reported SELECT=false for both tables. This is the intended database boundary, not a request for wider grants.
Migration013 exposes SECURITY DEFINER content_public_status() while withholding raw table access. Repair must retain public/active filtering and DB freshness policy. That legacy function does not expose stale_after_seconds; a replacement contract must not invent that value or synthesize green status.
No table grant, migration, backend runtime or Production change was made in this Test-only frontend continuation. The defect remains OPEN. Existing CI coverage did not certify this Spring HTTP read under the actual app role.
