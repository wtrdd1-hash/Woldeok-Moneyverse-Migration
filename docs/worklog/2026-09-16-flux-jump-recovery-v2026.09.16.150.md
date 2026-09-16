# Flux jump-host recovery v2026.09.16.150

## Objective
Restore authenticated access to the NixOS Kubernetes node without exporting the existing deployment private key outside GitHub Actions.

## Evidence before implementation
- Public Production is now serving the current application lineage through the Debian systemd fallback, while the GitOps Production manifest is stale.
- Public Test has advanced, but the NixOS cluster control plane is still unreachable from the current GitHub SSH endpoint.
- The NixOS node is reachable from `debian13` at `192.168.100.186:22` on the LAN.
- The existing `DEPLOY_SSH_KEY` remains inside GitHub Actions secrets and must not be printed or downloaded.

## Checklist
- [x] Re-read current `main`, Living Project Plan, runtime evidence, and recovery PR history.
- [x] Confirm the direct GitHub SSH recovery still fails closed.
- [ ] Derive only the existing deployment key's public key in GitHub Actions.
- [ ] Authorize that public key on the temporary Debian jump host.
- [ ] Use GitHub Actions -> Debian jump -> NixOS LAN SSH with strict host-key checks.
- [ ] Freeze Production Flux reconciliation while repairing the source and isolated Test.
- [ ] Verify exact-SHA Test backend/database and noindex boundary.
- [ ] Re-read current `main` before Production work.
- [ ] Promote Production only after the exact main SHA passes Test.
- [ ] Remove the temporary jump authorization and recovery workflow after convergence.

## Safety constraints
No plaintext private key in repository, artifacts, logs, or chat. No database/PVC/ledger deletion. Production stays fail-closed until Test evidence is exact-SHA and healthy.
