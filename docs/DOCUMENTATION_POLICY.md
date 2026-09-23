# Documentation Governance Policy

**English canonical** | [한국어](DOCUMENTATION_POLICY.ko.md)

> Version: v2026.09.23.403
> Status: current documentation governance
> Repository: `wtrdd1-hash/Woldeok-Moneyverse-Migration`

## 1. Authority order

1. `docs/planning/PROJECT_PLAN.md` — implementation-facing authoritative plan.
2. `docs/planning/INTEGRATED_PLANNING_MASTER.md` — integrated planning-cycle ledger.
3. Current detailed specifications under `docs/planning/`.
4. Generated API contracts and runtime-facing reference documents.
5. `docs/updates/`, `docs/changelog/`, `docs/releases/`, and `docs/worklog/` — historical/change evidence, not authority over newer planning.
6. Findings/research are evidence inputs unless a planning document explicitly adopts them.

When documents conflict, the newest explicit superseding authority wins. Historical records are preserved rather than rewritten as current truth.

## 2. Language

English is canonical. Korean is the required second language for maintained product/planning/operations documentation. Paired files use `NAME.md` and `NAME.ko.md` and are updated in the same work unit.

## 3. Change workflow

All meaningful documentation changes use a dedicated branch. Direct documentation commits to `main` are prohibited except an explicitly authorized emergency repository repair.

Before editing: fetch latest `origin/main`, read the integrated master, project plan, relevant detailed specs, and current work/update records. Recheck `origin/main` before integration. Concurrent work must not be overwritten.

Documentation-only changes must not trigger a runtime release. A documentation commit changes repository history, not application source identity.

## 4. Required records

Every material documentation cycle has:
- a version;
- EN/KO authoritative change;
- delta or changelog entry;
- worklog;
- update note suitable for GitHub;
- start and mid-work `origin/main` SHA when planning authority changes;
- explicit statement of whether runtime/Test/Production evidence exists.

## 5. Directory rules

- `planning/`: current living plans, detailed specs, planning deltas and planning worklogs.
- `features/`: concise implemented/user-facing feature guides; not the primary planning authority.
- `architecture/`: stable architecture explanations.
- `operations/`: operator procedures and runtime contracts.
- `findings/`: audits, evidence corpora and research reviews.
- `updates/`: compact versioned update notices.
- `changelog/`: change history.
- `worklog/`: execution history and evidence.
- `releases/`: release records only when release evidence exists.
- Root-level `docs/` files are reserved for indexes, governance and cross-cutting integration references.

New dated one-off documents must not be added to the docs root when an existing directory fits.

## 6. Status vocabulary

Use explicit states: `DRAFT`, `PLANNING`, `BLOCKED`, `IMPLEMENTED`, `TEST_VERIFIED`, `PRODUCTION_VERIFIED`, `SUPERSEDED`, `HISTORICAL`.

Do not use “done”, “deployed”, or “Production” without evidence that identifies the exact candidate/runtime version and acceptance result.

## 7. Link and archive policy

Do not break existing links merely to make directories look cleaner. Prefer indexes and status metadata first. If a file must move, preserve a compatibility stub at the old path or update all inbound references in the same change.

Historical documents remain searchable. Archive status means “not current authority”, not deletion.

## 8. Superseded policy

`PROJECT-DOCUMENT-POLICY-KO.md` v1.0.0 is superseded by this policy because its direct-to-main documentation rule conflicts with current branch and release-governance requirements.
