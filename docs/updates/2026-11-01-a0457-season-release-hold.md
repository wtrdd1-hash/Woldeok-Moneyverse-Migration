# Release HOLD — A0457 Season Affordability

- **Code:** Draft PR #2259, source `b9b066790d1a31c95c31f17a6f19a66282ef6ec0`, latest main `f13bbce273ffc65e8576170992d82ea00c27a1c9`. Final documentation SHA recorded by PR checks/comments.
- **Local:** full test, typecheck, lint, build, audit PASS; database-backed tests SKIP and real DEV source has zero active rows. Candidate GitHub exact-SHA CI and image build must independently PASS.
- **P0:** DEV app-role direct event table SELECT violates intended least privilege (#993); Production ACL unverified. Existing Production frontend provenance not SHA-attested; official Test and Production are not candidate SHA.
- **Release:** no merge, Test/Production promotion, schema/data/WLD writes, restart, rollback, branch deletion. Preserve all unique unmerged branch commits, including C #2234 same-page change. Revert PR to roll back feature; no DB migration.
- **Gate:** exact candidate SHA isolated Test auth/consent/DB/Android/E2E, security ACL, independent backup restore, CI, image digest, provenance, GitOps, rollback verification required before any release.
