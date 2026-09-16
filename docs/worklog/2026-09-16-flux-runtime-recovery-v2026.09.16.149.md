# Flux Runtime Recovery v2026.09.16.149

## Objective
Adapt the existing v148 Flux recovery workflow to the current server network state, where the configured deployment SSH endpoint refuses connections but the active internal host uses SSH port 22.

## Evidence before change
- v148 recovery runs fail before Kubernetes access with `Connection refused` on the configured deployment endpoint.
- Existing production SSH secrets are present; the failure is endpoint reachability, not missing credentials.
- MCP LAN probing found no externally exposed Kubernetes API and only SSH port 22 on the likely current internal server host.
- The current deployment workflow must therefore avoid assuming that the historical `DEPLOY_PORT` is still correct.

## Plan
- [x] Confirm v148 failure mode from GitHub Actions logs.
- [x] Re-probe the current MCP LAN without assuming the old OS/port layout.
- [ ] Make SSH connection setup try the configured port first, then conservative fallback ports 22 and 2212 without printing host/key values.
- [ ] Keep strict known-host verification and public-key-only authentication.
- [ ] Re-run Flux recovery without controller restart first.
- [ ] If Flux source remains stale after a successful SSH/Kubernetes connection, re-run with controller restart enabled.
- [ ] Verify Test exact SHA before any Production application promotion.

## Safety
- No credential values are printed or persisted outside the Actions runner.
- No direct application image mutation is allowed.
- No database or Secret mutation is performed.
- Production application promotion stays blocked until Test converges and passes smoke checks.
