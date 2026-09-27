# Documentation Governance Policy

**English canonical** | [한국어](DOCUMENTATION_POLICY.ko.md)

> Version: v2026.09.27.467
> Status: current documentation governance
> Repository: `wtrdd1-hash/Woldeok-Moneyverse-Migration`

## 1. Authority order

1. `docs/planning/PROJECT_PLAN.md` — implementation-facing authoritative product/engineering plan.
2. `docs/planning/INTEGRATED_PLANNING_MASTER.md` — integrated planning-cycle ledger and authority-drift record.
3. Current detailed specifications under `docs/planning/` that are explicitly adopted by the two documents above.
4. Generated API contracts and runtime-facing reference documents tied to an exact source/runtime identity.
5. `docs/updates/`, `docs/changelog/`, `docs/releases/`, and `docs/worklog/` — historical/change evidence, not authority over newer planning.
6. Findings/research are evidence inputs unless a planning document explicitly adopts them.

When documents conflict, the newest explicit superseding authority wins. Historical records are preserved rather than rewritten as current truth.

## 2. Runtime/planning drift rule

A newer runtime commit, release note, root execution plan, or worklog does **not** silently become product authority. If runtime/source history advances beyond the implementation-facing plan, documentation must show an explicit **authority drift** state until the relevant product decisions are reconciled into `PROJECT_PLAN.md` and, when applicable, detailed planning specs.

Do not bump the product-plan version merely to match a runtime version. A version change is valid only when the plan actually integrates the decisions it claims to cover.

## 3. Language

English is canonical. Korean is the required second language for newly maintained product/planning/operations/governance documentation. Paired maintained files use `NAME.md` and `NAME.ko.md` and are updated in the same work unit.

Historical, internal-only, third-language, or compatibility files are not retroactively promoted to maintained authority merely to satisfy pairing counts. Any unpaired maintained document must be tracked as an explicit cleanup gap.

## 4. Change workflow

All meaningful documentation changes use a dedicated branch. Direct documentation commits to `main` are prohibited except an explicitly authorized emergency repository repair.

Before editing: fetch latest `origin/main`, read this policy, the document catalog, integrated master, project plan, relevant detailed specs, and current work/update records. Recheck `origin/main` mid-work and before integration. Concurrent work must not be overwritten.

Documentation-only changes must not trigger a runtime release. A documentation commit changes repository history, not application source identity.

## 5. Required records

Every material documentation cycle has:
- a version;
- EN/KO maintained changes where applicable;
- delta/changelog entry;
- worklog;
- GitHub-facing update note;
- internal update note when requested by project operations;
- start and mid-work `origin/main` SHA when planning/governance authority changes;
- explicit statement of whether runtime/Test/Production evidence exists.

## 6. Directory rules

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

## 7. Non-authoritative root and compatibility documents

Repository-root `implementation_plan.md`, `PROJECT_MEMORY.md`, `walkthrough.md`, old `README/` translation artifacts, and other execution/scratch/history documents are not product authority unless the current project plan explicitly adopts their content.

`docs/PROJECT-DOCUMENT-POLICY-KO.md` remains a compatibility/historical policy document and is superseded by this policy.

## 8. Status vocabulary

Use explicit states: `DRAFT`, `PLANNING`, `BLOCKED`, `IMPLEMENTED`, `TEST_VERIFIED`, `PRODUCTION_VERIFIED`, `SUPERSEDED`, `HISTORICAL`, `AUTHORITY_DRIFT`.

Do not use “done”, “deployed”, or “Production” without evidence that identifies the exact candidate/runtime version and acceptance result.

## 9. Link and archive policy

Do not break existing links merely to make directories look cleaner. Prefer indexes, status metadata and compatibility stubs first. If a file must move, preserve a compatibility stub at the old path or update all inbound references in the same change.

Historical documents remain searchable. Archive status means “not current authority”, not deletion.

## 10. Inventory and cleanup policy

Catalog counts are snapshots, not quality metrics. Exact duplicate-content groups, root-level dated records, language-pair gaps and stale authority references must be tracked, but cleanup must prioritize correctness and link stability over deleting files.

Before mass moves or deduplication, prove inbound-link coverage and preserve a compatibility path.
