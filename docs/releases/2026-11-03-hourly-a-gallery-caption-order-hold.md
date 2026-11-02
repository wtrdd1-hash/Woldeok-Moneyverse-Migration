# RELEASE HOLD — A bounded gallery caption order

- Feature is a **Draft candidate only**, not an approved Production change.
- Exact candidate SHA has not passed the complete Backend suite (existing profile HTTP 401 x2) or full dependency audit (9 findings); official Test exact-SHA authenticated E2E and independent backup restore remain unverified. DEV PostgreSQL app-role P0 ledger/item privileges are unresolved; Production role unverified. Disk 97% used.
- Public Test `0c70a114da5f4cc5374bc4b80e0403a044f8546f`; Production `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`. Candidate is neither. **No merge to main, no Test/Production deployment, no DB migration, no service restart, no rollback executed.**
- Before any release: fix and rerun full backend/auth suite and security audit at exact SHA; verify DB ACL and independent restore; validate official isolated Test login, API, DB, Android and SEO; recheck latest main and PR conflicts; satisfy GitOps provenance, smoke and rollback gates.
- Rollback: leave Draft PR unmerged; if eventually approved, use reviewed GitOps revert only after verified rollback manifest. Preserve all unique unmerged branches; no deletions.
