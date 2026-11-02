# A2056 — Public board exact-title discovery

## Before work
- Authority: `origin/main` `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b` (2026-11-02 20:56 KST), AGENTS.md, README.md, EN/KO living plans.
- Open PR audit: 253 open, 29 conflicting, 275 remote heads; existing board substring query supported, no exact-title PR discovered. Existing unrelated worktree is dirty; this branch is isolated.
- P1 product scope: allow an exact case-insensitive title match among the latest 50 publicly visible board posts, optionally scoped by stock. Do not claim archive-wide search.
- SQL remains the existing parameterized `SECURITY DEFINER` public list read model. No migration, ledger write, grant or session change.
- Strict request validation, provenance marker for exact results (including empty), Android fail-closed gateway, private noindex query results, web accessible selector.
- Rollback: omit `match=exact` or revert this isolated commit. Production release HOLD until all gates pass.

## In progress
- [ ] Add failing Backend/Frontend/App API tests first and record RED.
- [ ] Implement minimal backend, web and Android proxy parity and record GREEN.
- [ ] Recheck latest main/plan; test, typecheck, lint, build, DB read-only, CI; record evidence and blockers.

## Finished
- Pending verification; do not merge or deploy without exact-SHA official Test and GitOps gates.
