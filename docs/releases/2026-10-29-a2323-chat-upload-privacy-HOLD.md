# Release HOLD — A2323 Chat Upload Privacy

Candidate branch `auto/hourly-a-chat-upload-privacy-20261029-2323`, base `62c6cd038951d65c94b709302bdaec6e75b080b6`. Candidate HEAD and CI evidence are in the Draft PR.

Targeted privacy regression and isolated PostgreSQL owner ACL PASS; full lint/test/API contract FAIL. Official Test and Production version `c2129625aa6629c616fb31ce790950618b8d92b2`, not candidate. No Test deployment, authenticated E2E, backup restore, main merge, GitOps promotion, DB migration, rollback, PR closure or branch deletion.

Promotion remains prohibited until exact SHA complete gates, official Test auth/user flow, security/finance review, independent restore, and GitOps release approval pass. Rollback is code-only because no schema/data mutation was made.
