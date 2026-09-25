# Storage and Release Retention Specification

**English canonical** | [한국어](STORAGE_RELEASE_RETENTION_SPEC.ko.md)

> Version: v2026.09.25.438
> Status: PLANNING + observed runtime hygiene evidence

## Safety invariants
1. Resolve `production-current` and `test-current`, then inspect running backend/frontend process CWDs before deletion.
2. Any active symlink target or process CWD release root is protected even when its version is old.
3. PostgreSQL data, uploads, backups, active release roots and retain-until-classified QA data are never generic cleanup targets.
4. Broad volume deletion such as `docker system prune --volumes` is prohibited.

## Retention
- Keep the active release plus at least 10 recent rollback-capable immutable releases for Production.
- Keep the active release plus at least 10 recent rollback-capable immutable releases for Test.
- Incident, audit, legal, migration or rollback evidence may pin additional releases with an owner and expiry/review date.
- Release names alone are not sufficient authority; exact SHA/version/active-process evidence wins.

## Capacity policy
- <70% filesystem usage: normal.
- >=70%: warn and report top growth sources.
- >=80%: stop nonessential build/QA artifact growth and require cleanup/capacity action.
- >=90%: operations incident; block new artifact-heavy work until capacity is recovered.
- Track bytes and inode use before/after every cleanup.

## Automation acceptance
After a healthy promotion and session/version verification, a fail-closed retention job may prune stale releases. It must re-read active symlink/CWD protection, keep the retention window, refuse ambiguous identity, serialize destructive work, and emit an auditable list plus reclaimed bytes/inodes. Test the job on Test before Production use.

## Swap
Disk swap is governed by the v437 VM memory-continuity contract. Do not shrink/delete it merely to reclaim space; require guest/host memory, PSI, zram/swap usage and rollback evidence.
