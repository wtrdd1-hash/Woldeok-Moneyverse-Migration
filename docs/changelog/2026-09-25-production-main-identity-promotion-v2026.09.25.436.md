# v2026.09.25.436 — Production exact-main identity promotion

## Summary
Test and Production were promoted from runtime identity `20985765d6316718ceb4b9e61b131475e6df9e96` to current application `main` identity `d058df3d29191e48c5ab9b12ec10014d015b5812` using the documented canary-first Debian 13 systemd/Nginx blue/green path.

## Change boundary
The compare range contains two commits and no final file changes: an assignment-settlement enforcement commit followed immediately by its revert. No net runtime feature change is introduced by this release. Exact-SHA rebuilding was still required because frontend release identity is baked at build time.

## Validation
- Exact-SHA contract/backend/frontend builds succeeded.
- Isolated Test exact backend/frontend identity and backend health succeeded.
- Test noindex boundary and representative route smoke succeeded.
- Production exact backend/frontend identity and backend health succeeded.
- Production representative route smoke succeeded.
- No new fatal/critical/unhandled/cache-permission journal findings were observed in the checked windows.
- Active non-revoked Production session rows: `1,054 -> 1,054`.

## Release state
- Test: `/srv/moneyverse-data/releases/test-d058df3-v436`
- Production: `/srv/moneyverse-data/releases/prod-d058df3-v436`
- Exact application SHA: `d058df3d29191e48c5ab9b12ec10014d015b5812`
