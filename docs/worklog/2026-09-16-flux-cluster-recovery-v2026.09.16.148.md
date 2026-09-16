# Flux cluster recovery — v2026.09.16.148

## Scope

Restore the existing NixOS single-node Kubernetes release control plane without bypassing GitOps safety. The public Test and Production runtimes report image identities different from the desired SHAs in `wtrdd1-hash/kuber-infrastructure`.

## Evidence before work

- Production host contract: NixOS 26.05, kubeadm Kubernetes, containerd, Flux.
- The development Debian host has no kubeconfig and no cluster SSH private key.
- Repository Actions secrets still include `DEPLOY_HOST`, `DEPLOY_PORT`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, and `GHCR_PULL_TOKEN`.
- Historical `k8s-prepull.yml` proves those secrets were used to SSH to the Kubernetes host and run passwordless `sudo`, `ctr`, and `kubectl`.
- `NEXT_PUBLIC_BUILD_ID` is built from the exact Git SHA in Test/Production image workflows, so the public `/api/version` mismatch is a real runtime drift signal.

## Plan

- [x] Record the recovery worklog before adding recovery automation.
- [ ] Add a manual, production-environment recovery workflow using the existing SSH secrets.
- [ ] Inspect Flux source and Kustomization status without printing credentials.
- [ ] Patch only the `flux-system` GitRepository source to `wtrdd1-hash/kuber-infrastructure` when needed.
- [ ] Force reconcile and verify source/controller health.
- [ ] Inspect Test and Production workload rollout conditions and running image tags.
- [ ] Verify public exact-SHA endpoints after convergence.
- [ ] Keep application Production promotion fail-closed until Test is verified.

## Safety constraints

No PVC/database/ledger deletion, no secret values in logs, no direct application data mutation, no forced Production application image change in the recovery workflow, and no disabling Flux reconciliation.