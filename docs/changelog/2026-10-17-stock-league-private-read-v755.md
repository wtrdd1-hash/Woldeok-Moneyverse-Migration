# v2026.10.17.755 — Stock League scoped read privilege

Fix Test league GET 500 from app-role SELECT denied on private role/portfolio tables by SQL 274 SECURITY DEFINER read helpers, keeping original tables inaccessible. Real Test-copy read-only app-role SQL and local workspace tests pass. Production monetary gate remains BLOCKED. [Worklog](../worklog/2026-10-17-stock-league-test-private-read-v755.md).
