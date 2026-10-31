# Release HOLD — A 2026-11-01 02:25 KST

Public announcement title search is a Draft PR candidate only. No merge, official Test deployment, Production promotion, DB migration, service restart or rollback was performed.

Blocking gates: final SHA full CI and candidate image build, official Test exact SHA authenticated flow, independent backup restore, and P0 least-privilege anomaly on development DB (`moneyverse_app` direct SELECT on `public.announcements`). Existing Finance P0 and Production provenance remain separate release blockers. Production promotion is prohibited without documented GitOps release gate PASS.

Rollback plan if ever deployed: use verified previous immutable image digest and GitOps manifest revision only after rollback rehearsal; feature itself has no schema/data write and can be disabled by reverting the candidate. No rollback action authorized in this cycle.
