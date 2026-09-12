# Korean Documentation Parity — v2026.09.12.28

[English](2026-09-12-korean-documentation-parity-v2026.09.12.28.md) | [한국어](2026-09-12-korean-documentation-parity-v2026.09.12.28.ko.md) | [Documentation index](../INDEX.md)

Date: 2026-09-12  
Type: Documentation-only localization and navigation update

## Summary

This change establishes Korean counterparts and Korean-first navigation for the repository's current architecture, feature, operations, integration, audit, release and worklog documentation.

The repository documentation language order remains:

1. English — canonical source
2. Korean — maintained translation

## Added Korean counterparts

### Architecture
- `docs/architecture/system-overview.ko.md`
- `docs/architecture/request-flow.ko.md`
- `docs/architecture/database-security.ko.md`
- `docs/architecture/deployment-flow.ko.md`

### Features
- `docs/features/jobs-and-progression.ko.md`
- `docs/features/quests.ko.md`
- `docs/features/casino.ko.md`
- `docs/features/banking.ko.md`
- `docs/features/stocks.ko.md`
- `docs/features/businesses.ko.md`
- `docs/features/shop.ko.md`
- `docs/features/admin-control-center.ko.md`

### Operations / integration / maintenance
- `docs/INFRASTRUCTURE.ko.md`
- `docs/mobile-api.ko.md`
- `docs/operations/local-development.ko.md`
- `docs/operations/database-migrations.ko.md`
- `docs/operations/backup-and-recovery.ko.md`
- `docs/operations/production-deployment.ko.md`
- `docs/operations/security-model.ko.md`
- `docs/localization/README.ko.md`
- `docs/images/README.ko.md`
- `docs/as-casts.ko.md`
- `docs/UPDATE_LOG.ko.md`

### Findings, releases and historical worklogs
- Korean counterparts were added for the English-only project-gap and public-discoverability audits.
- Korean counterparts were added for the v2026.09.07, v2026.09.07.1, v2026.09.07.2 and v2026.09.08 public-board release records.
- Korean counterparts were added for key English-only historical worklogs and changelog entries.
- The early English-only foundation/backend implementation plan now has a Korean companion explaining its complete task structure and current-document precedence.

## Navigation

- `docs/INDEX.md` now pairs English sources with Korean links.
- `docs/INDEX.ko.md` is the Korean navigation hub and links directly to Korean counterparts.
- New Korean documents link back to their English source and the Korean index.
- Documents whose source is already Korean or bilingual are identified as such rather than duplicated unnecessarily.

## Important historical-document rule

Historical documents are translated without silently rewriting their historical claims. Where an old infrastructure statement conflicts with newer deployment documentation, the Korean version preserves that history and explicitly directs operators to re-check the current GitOps/runtime documents before acting.

## Runtime impact

None. This is a documentation-only change. No application code, API behavior, database schema/data, Kubernetes/Flux state or Production runtime is modified. Under the repository documentation policy, documentation-only changes are committed directly to `main` and do not require a Test/Production deployment cycle.
