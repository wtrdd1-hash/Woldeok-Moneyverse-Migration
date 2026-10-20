# Host storage cleanup worklog — v2026.10.20.981

**Status: HOST MAINTENANCE VERIFIED / GITHUB DOCUMENTATION CANDIDATE.** [한국어](2026-10-20-host-storage-cleanup-v981.ko.md).

## Before work
- Read AGENTS.md, documentation policy/catalog, integrated planning master, retention policy, dual-disk specification and historical v781/v782 worklogs.
- Original and mid-work origin/main: 18c40e59beb975571ed39cd6bd664770c541fba3; isolated docs/host-storage-cleanup-v981 worktree on data disk. No other collaborator's worktree was changed.
- Root /dev/sdb1 (100 GB nominal), data /dev/sda1 (200 GB nominal). Initial observed usage was root 64%, data 23%; check linked Production and Test releases and running process CWDs.
- Preflight evidence in /srv/moneyverse-data/build-workspaces/host-storage-cleanup-v2026.10.20.981/00-preflight.txt.

## Mid-work verified actions
- [x] Check file-system identity, symlinks/mounts, absence of active Gradle builds, latest file dates and active process CWD before deletion.
- [x] Remove only these **regenerable, inactive directories**, root filesystem only:
  - /root/.gradle/caches/9.5.0 — 982,855,680 allocated bytes; no new files after October 12.
  - /root/.npm/_cacache — 255,401,984 allocated bytes; no new files after October 12.
  - /home/debian/automation-moneyverse/c262/frontend/.next — 267,317,248 allocated bytes; last built September 19.
- [x] Explicitly keep the Debian npm cache modified October 17, recent Next builds, all Git worktree roots, source, Android/AVD, DB/WAL, backup, swap, Docker volumes, and all immutable release generations.
- [x] Record step-by-step activity in 01-progress.json; do not change Production/Test symlinks, services or application code.

## Finish — measured facts
| Root filesystem measurement | Before removal | After removal |
|---|---:|---:|
| Used (bytes) | 63,963,516,928 | 62,457,942,016 |
| Available (bytes) | 36,896,579,584 | 38,402,154,496 |
| Used inodes | 2,105,386 | 2,078,556 |
| Usage (df rounded) | 64% | 62% |

Net **1,505,574,912 bytes (1.51 decimal GB / 1.40 GiB)** reclaimed and **26,830** fewer used inodes. Data filesystem stayed at 23%. All six services (backend/frontend/bot/MCP/Nginx/Docker) active; PostgreSQL pg_isready accepts connections; localhost homepage HTTP 200. Production target unchanged at prod-v2026.10.19.920-01c34e4b; Test target unchanged at test-v2026.10.18.805-e54e6843df27. No service restart or application Test/Production release.

Evidence: 00-preflight.txt SHA-256 a5c3382a67fe750f65806af20e743a85330bf67a05bc6b9d2721809551b94cff; 01-progress.json b81d3638c2b6311fc42c98aa9c12462d67af08657c8e13b3ebb69e4095f77a24; 02-result.json a362e030cb6cee963aebaddd788e61f621bd140a64592f18c5c19eaff5707350. Files remain on the host data disk and are not uploaded to GitHub.

## Release governance
**Documentation-only GitHub update.** No app source, DB rows, schema, financial accounts, feature switches, release pointers or deployment changed. Previously established financial/authenticated-UI release gates remain independent. This maintenance is not a new application release.
