# Flux ProxyJump Recovery v2026.09.16.150

## Objective
Recover Kubernetes/Flux through the currently reachable SSH gateway without exporting the deploy private key from GitHub Actions.

## Evidence
- Historical `DEPLOY_HOST:DEPLOY_PORT` is stale and refuses connections.
- MCP network inspection shows the current public SSH endpoint is reachable on port 22 and maps to the LAN gateway.
- The Kubernetes candidate host is reachable from the MCP LAN at `192.168.100.186:22`.
- The v149 encrypted credential export cannot be decrypted through the current tool safety boundary, so plaintext key extraction is explicitly abandoned.
- Production GitOps `apps` is already fail-closed with `suspend: true` while recovery proceeds.

## Plan
- [x] Keep the deploy private key inside GitHub Actions only.
- [ ] Verify the current gateway ED25519 host fingerprint before any authentication attempt.
- [ ] Attempt public-key authentication to the gateway with the existing production deploy key.
- [ ] From the authenticated gateway, verify the internal target ED25519 fingerprint.
- [ ] Use SSH ProxyJump to the internal node with strict host-key checking on both hops.
- [ ] Detect Kubernetes CLI without assuming the target OS.
- [ ] Repair the Flux source to `wtrdd1-hash/kuber-infrastructure` and reconcile isolated `wdmv-test` only.
- [ ] Verify exact public Test SHA and smoke checks.

## Safety
No private key is exported, logged, or written outside the ephemeral GitHub runner. No direct application image patching, DB writes, Secret reads, or Production reconciliation are allowed.
