# Release HOLD — A1325 Business Catalogue Budget Search (2026-11-01)

**Release decision: HOLD.** PR #2320 is Draft and labelled `hold`; no main merge, official Test deployment, Production promotion, database mutation or service restart. Feature code is isolated in `auto/hourly-a-20261101-1325-business-budget`.

The member budget filter is read-only and changes no ledger, idempotency keys, financial postings, schema or privileges. The code candidate must not be promoted without full exact-head CI PASS, verified immutable Test backend/frontend SHA, authenticated member and consent flow E2E, app-api/Android contract, actual PostgreSQL owner/negative privilege tests, security/a11y/SEO, backup/rollback provenance, ledger reconciliation and systemd/Nginx edge release identity.

**Known blockers:** DEV app-role direct financial/table DML and user reads remain overly broad (#993); official Test public SHA `bc8cd8a6...` and Production backend `353c6d5d...` differ from candidate; Production frontend executable identity and independent backup restore are not proven here. Existing C PR #2257 and #2318 overlap source files; preserve unique changes. Prior CI failed Next PageProps and was repaired; final SHA CI must be re-evaluated. Full suites may fail from host EPIPE and cannot be marked PASS.

**Rollback:** no runtime change, so no rollback performed. If later approved, keep the previous immutable systemd release, prove Test exact SHA and signed-in session continuity, use the documented zero-downtime cutover only after independent gate approval; otherwise retain current Production and Test. GitOps/Flux is a recovery/target authority, not proof of the live Debian systemd runtime.

**Evidence:** `docs/qa/2026-11-01-a1325-business-budget.md` and task directory `/srv/moneyverse-data/tasks/mv-a-20261101-1325-business-budget/`.
