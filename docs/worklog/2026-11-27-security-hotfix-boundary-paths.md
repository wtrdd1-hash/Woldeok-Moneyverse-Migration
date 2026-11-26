# Security hotfix candidate — boundary path normalisation (2026-11-27)
[한국어](2026-11-27-security-hotfix-boundary-paths.ko.md)

## Before work
- Base: 979c7d4270 (source of the currently recorded Production backend build). Purpose: smallest candidate carrying only the boundary-path fix from #3456 (d3bff728b4 path part, 3895bce01f, 61dd57b80b), so it can go through Test independently of the larger stack. Details of the finding are kept in the internal security record.
- No migration, no frontend change, no configuration change. Rollback = previous jar.

## In progress
- [x] Cherry-pick path-normalisation parts only (identity-header sanitizer from #3456 is not in this base and is not included).
- [ ] RED on base / GREEN on candidate, full Spring suite, jar with source SHA, isolated sandbox probes.

## Finished
- (pending)
