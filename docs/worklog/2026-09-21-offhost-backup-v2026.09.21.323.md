# Off-host immutable backup delivery — v2026.09.21.323

- Added an rclone-backed off-host delivery step for already encrypted Moneyverse backup archives.
- Existing remote objects are immutable (`rclone copyto --immutable`); corrections require a new timestamped archive.
- The local archive checksum is verified before transfer and the remote object is streamed back through SHA-256 after transfer.
- `OFFSITE_REMOTE` must name an rclone remote; local filesystem destinations are rejected.
- When `OFFSITE_REMOTE` is configured, the scheduled backup fails closed if off-host copy or remote verification fails. Without it, current host-local backup behavior remains unchanged so rollout can be configured independently.
- This code does not claim DR completion until a real off-host remote is configured and a restore drill from that copy passes.
