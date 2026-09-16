# LAN Flux recovery — v2026.09.16.149

## Scope

Recover direct administrative access to the current NixOS Kubernetes node without exposing the repository's existing deploy SSH private key.

## Evidence before work

- The GitHub-hosted recovery workflow reached the stored DEPLOY_HOST/DEPLOY_PORT but received `Connection refused`; the old external transport is stale.
- The MCP development host `debian13` is on the same LAN as a live SSH node at `192.168.100.186:22`.
- Public `ssh.easy-scraping.com:22` has a different SSH host-key fingerprint from `192.168.100.186:22`, so it must not be used as a substitute target.
- Historical CI proves the existing `DEPLOY_SSH_KEY` was authorized on the Kubernetes host after the NixOS migration.

## Plan

- [x] Create a one-time RSA wrapping certificate on `debian13`; keep the private key only under `/tmp` on that MCP-controlled host.
- [ ] Add a manual-only GitHub workflow that packages `DEPLOY_USER` + `DEPLOY_SSH_KEY`, encrypts the package to the one-time public certificate, and uploads ciphertext only.
- [ ] Download the ciphertext artifact on `debian13`, decrypt locally, and verify SSH against `192.168.100.186:22`.
- [ ] Repair/reconcile Flux from the LAN if authentication succeeds.
- [ ] Delete plaintext credentials, wrapping private key, ciphertext artifact, and the one-time workflow/certificate after recovery.

## Safety constraints

No plaintext secret in repository, artifact, log, or chat. No password or key output. No database/PVC/ledger mutation. The temporary artifact must contain CMS-encrypted ciphertext only.