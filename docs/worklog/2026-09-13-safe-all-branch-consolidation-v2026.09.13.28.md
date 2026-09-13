# Safe all-branch consolidation worklog — v2026.09.13.28

## Goal

Consolidate every branch that can be safely represented on one current-main candidate, while refusing destructive or semantically invalid merges. Preserve newer planning/documentation, reconcile stacked runtime work, keep database migration parity coherent, and stop before Production until exact-SHA Test evidence exists.

## Baseline and planning checks

- `main` at start and mid-work: `22f8b7a18cd778ddf6a754cc6d28dd0206847885`.
- `docs/planning/PROJECT_PLAN.md` / `.ko.md` were reviewed before integration and again mid-work.
- The Living Spec still requires current-main synchronization, immutable applied migrations, English-primary/Korean-parity documentation, isolated Test exact-SHA verification, and fail-closed Production promotion.
- All authorized Remote Desktop targets were offline; `@미니pc홍` could not be used for local/test-server execution in this run.

## Branch audit

The repository showed 59 refs during the final audit before creating the final candidate. Concurrent work added `integrate/all-branches-v2026.09.13.25`, `integrate/rehome-roadmap-p1-p2-v2026.09.13.26`, and `integrate/final-all-v2026.09.13.27` while this consolidation was in progress. Those branches were re-audited instead of being assumed newer/correct merely by version number.

### Covered by the consolidated stock/community-security chain

The merged source `feat/stock-tagged-community-discovery-v2026.09.13.10` already represented the earlier stacked work for account security, admin edit-state preservation, Business Settlement Boost, Trusted Client IP, stock-tagged community, and discovery. Matching `auto`, `feat`, `fix`, `integrate`, and `test-candidate` lower refs were therefore treated as covered/superseded instead of replayed.

### Selectively reconciled chains

- Banking / migration-parity / marketplace: runtime UI was preserved, while the stale source `179-local-email-auth.sql` was not replayed over the consolidated sequence.
- Local-auth verification email: SMTP sender, backend wiring, verification action/page, and tests were preserved; duplicate migration numbering was not copied.
- Conditional alerts / Personal Dashboard / Portfolio Analysis: runtime and `182-conditional-stock-alerts.sql` were transplanted while current planning/index files stayed authoritative.
- Event Calendar: runtime and historical records were preserved; navigation was manually reconciled so `/dashboard`, `/account/security`, and `/calendar` all remain present.

### Directly merged safe work

- Economy Scenario Lab replacement chain.
- Casino Game System documentation.
- AI Economy Controller English/Korean documentation package.

### Concurrent integration branches

`integrate/final-all-v2026.09.13.27` was audited but intentionally not merged wholesale. It contains the same local-email-auth SQL bytes under both `179-local-email-auth.sql` and `180-local-email-auth.sql`, while also retaining `179-business-settlement-v2-boost-runtime-fix.sql`. That creates a duplicate migration-number/content hazard. File spot-checks also showed many apparently large PR differences were history-only: current candidate and v27 often had identical blob SHAs for the same documents/runtime.

Older auth/document integration branches were not force-replayed where they diverged from current `main` and carried superseded states such as `163-local-email-auth.sql`. Their still-valid concepts are represented by current canonical documentation/runtime; their stale history is retained as repository history rather than used to regress the candidate.

## Integration commits / PRs used

- Integration PR #229: merged consolidated stock/community-security chain into isolated candidate.
- PR #230: audited; banking/marketplace runtime selectively reconciled because of migration conflict.
- PR #232: audited; local-auth verification runtime selectively reconciled.
- PR #236: audited; alerts/dashboard/portfolio runtime and migration 182 selectively reconciled.
- PR #244: Economy Scenario Lab merged.
- PR #245: Casino Game System spec merged.
- Event Calendar runtime/docs transplanted and navigation manually reconciled.
- PR #254: AI Economy Controller docs merged.
- Draft audit PR #252: concurrent v27 inspected; wholesale merge rejected because of duplicate local-auth migration.

## Final database migration sequence

1. `179-business-settlement-v2-boost-runtime-fix.sql`
2. `180-local-email-auth.sql`
3. `181-stock-tagged-community.sql`
4. `182-conditional-stock-alerts.sql`

No production-checksum migration was intentionally renamed or rewritten by this consolidation.

## Validation state

- `main`: unchanged.
- Production: unchanged.
- Final candidate: `integrate/final-safe-all-v2026.09.13.28`.
- GitHub CI: to be run on the final exact SHA after this worklog commit.
- Isolated Test: blocked because authorized remote hosts, including `@미니pc홍`, are offline.
- Backend/DB/API/UI exact-SHA Test smoke: not yet claimable.
- Production promotion: blocked until the required Test evidence exists.

## Cleanup

No source branch deletion is claimed. The available GitHub connector in this session does not provide remote-ref deletion, and the authorized remote hosts are offline. Superseded branch cleanup should happen only after the final candidate is validated and a deletion-capable authorized environment is available.
