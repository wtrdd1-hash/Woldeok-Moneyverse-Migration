# Release HOLD — A Bank Snapshot CSV Proof

**Candidate:** `auto/hourly-a-20261030-2354-bank-statement-proof` based on main bf8d0d48f810932b43783d8605dce53954c60cff. Candidate exact SHA in PR after commit.

**Targeted:** CSV UTF-8 BOM/CRLF and strict WLD/UTC/readOnly parser; Android bank snapshot response allowlist and private 503 on unverified upstream. 13 frontend/Android + 3 backend + 15 gateway contract tests PASS; real isolated PostgreSQL 311 migrations and synthetic rollback PASS; typecheck and builds PASS.

**Blocking:** full backend 126 FAIL; frontend 55 FAIL; full lint 1 ERROR; exact-head GitHub CI not yet proven; official Test not running candidate; authenticated E2E, independent backup restore and GitOps release gate not proven. Production process paths refer to deleted v1515 while release link points to v1935; Test treasury HTTP 200 unverified. P0 #1984 remains a blocker.

**Decision:** DO NOT MERGE or deploy. No Test/Production deployment, runtime restart, production DB/ledger writes, branch deletion or rollback. Feature is unshipped. Resume only after independent full PASS and official Test exact-SHA evidence.
