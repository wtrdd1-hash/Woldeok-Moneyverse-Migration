# v2026.09.21.327 — Off-site restore checksum regression gate

## Status
- [x] Planned: protect the P1 off-site restore checksum fix with executable regression coverage.
- [x] In progress: exercise absolute-path sidecars and mismatched digests without touching production data.
- [x] Completed: add the test to the always-on CI policy lane.
- [ ] CI / deployment: pending exact-SHA GitHub CI; production promotion remains blocked by existing migration-authority/DR gates.

## Implementation
- Added `moneyverse-restore-drill.test.sh` with isolated rclone/docker/openssl fakes.
- Proves an off-site sidecar containing the source host absolute path validates the downloaded archive bytes.
- Proves a mismatched SHA-256 fails closed before decrypt/restore.
- Wired the regression into CI `policy`, so docs/control-plane classification cannot skip it.
