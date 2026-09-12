# Documentation Localization Worklog — v2026.09.12.28

[English](2026-09-12-documentation-localization-v2026.09.12.28.md) | [한국어](2026-09-12-documentation-localization-v2026.09.12.28.ko.md) | [Documentation index](../INDEX.md)

Date: 2026-09-12  
Scope: documentation only

## Request

Make the repository usable for a Korean reader who cannot rely on English documentation, while preserving the repository standard that English is the canonical first document and Korean is the maintained second document.

## Work performed

1. Audited the documentation index and the active architecture, feature, operations, localization, integration, audit, release and worklog directories.
2. Created Korean companions for English-only active documents.
3. Added Korean companions for important historical English-only release/worklog/audit documents.
4. Identified historical documents whose source is already Korean or bilingual and avoided pointless duplicate files.
5. Added `docs/INDEX.ko.md` as the Korean navigation hub.
6. Reworked `docs/INDEX.md` so paired documents expose English and Korean links together.
7. Added direct English-source/Korean-index navigation to newly created Korean documents.
8. Added a Korean companion for the early English-only foundation/backend implementation plan and marked it as historical so current runtime/deployment documentation takes precedence.
9. Recorded this documentation-only change as v2026.09.12.28.

## Validation approach

- File creation was performed directly on `main` under the repository's documentation-only policy.
- Paired paths use the `NAME.md` → `NAME.ko.md` convention where possible.
- Existing Korean-first or bilingual historical records remain single-source where a second file would add no translation value.
- Current planning documents were re-checked during the work because they are living specifications and new planning pairs were already being added concurrently.
- No runtime deployment status was changed or claimed by this documentation task.

## Historical documentation caveat

Older documents may describe retired deployment topology. Their Korean companion preserves the historical record instead of silently changing it. Operators must consult current `docs/architecture/deployment-flow.*`, `docs/operations/production-deployment.*`, `docs/INFRASTRUCTURE.*` and the GitOps repository before acting.

## Runtime / deployment status

Documentation only. No Test deployment and no Production deployment were required. No code, migration, database data, container image or Kubernetes/Flux resource was changed.
