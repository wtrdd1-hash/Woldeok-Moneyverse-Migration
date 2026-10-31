# Release HOLD — A 2026-10-31 09:25 KST

Candidate branch `auto/hourly-a-20261031-0925-season-cost-sort` is a DRAFT only. Do not merge or promote based on targeted tests. Required exact-SHA full CI, Docker candidate image, authenticated official Test E2E, app-role ACL and full migration parity, backup restore, rollback image provenance, production GitOps gate and smoke/login/version/DB proof are not all satisfied. Existing P0 #993 app-role privileges and #1984 production executable provenance remain open. No Test/Production deployment, production database modification, service restart, or rollback was executed.

Rollback plan: feature remains unmerged; discard candidate branch without changing live infrastructure. After a future approved release, revert the new GET sorting and UI links via a new reviewed PR; no schema rollback is required.
