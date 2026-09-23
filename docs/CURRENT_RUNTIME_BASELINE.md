# Current Runtime Baseline

**English canonical** | [한국어](CURRENT_RUNTIME_BASELINE.ko.md)

> Version: v2026.09.23.404
> Observed: 2026-09-23
> Status: current observed runtime baseline
> Authority scope: currently observed Debian host/runtime facts. This document does not replace product planning.

## Current host

| Item | Current observed value |
|---|---|
| OS | Debian GNU/Linux 13.6 (trixie) |
| Kernel | Linux 6.12.94+deb13-amd64, x86_64 |
| Init/service manager | systemd 257 |
| Node.js | v24.21.0 |
| pnpm | 10.0.0 |
| Python | 3.13.5 |
| Nginx | 1.26.3 |
| Docker | 29.8.0 |
| Container runtime | Docker + containerd on the current Debian host |
| Production PostgreSQL | PostgreSQL 17.11 in Docker, host mapping 5433 -> 5432 |
| Local AI inference | Ollama-compatible service bound to localhost:11434 |

The authorized development/runtime device visible to this work session is `debian13`. The device named `minipc` is currently offline and is not used as runtime evidence for this snapshot.

## Current public runtime topology

The currently observed public authority is **Debian 13 + systemd services + Nginx + Docker-hosted PostgreSQL**.

Production:
- backend: `moneyverse-backend.service`, working directory `/srv/moneyverse-data/releases/production-current/backend`;
- frontend: `moneyverse-frontend.service`, working directory `/srv/moneyverse-data/releases/production-current/frontend`;
- Nginx routes Production backend/frontend to ports `3000/3001`.

Test:
- backend: `test-main-backend.service`, working directory `/srv/moneyverse-data/releases/test-current/backend`;
- frontend: `test-main-frontend.service`, working directory `/srv/moneyverse-data/releases/test-current/frontend`;
- Nginx routes Test backend/frontend to ports `3100/3101`.

Supporting active services observed: Discord bot, economy AI, MCP gateway, Nginx, Docker/containerd and the repository GitHub Actions runner.
## Current vs recovery/target architecture

| Layer | Current observed authority | Recovery/target state |
|---|---|---|
| Public app runtime | Debian 13 systemd release directories | Kubernetes/Flux may remain a future/recovery target |
| Public reverse proxy | Host Nginx | cluster ingress is not current public evidence |
| Production DB | Docker-hosted PostgreSQL 17.11 | Kubernetes DB must not be assumed authoritative without reconciliation evidence |
| Release verification | exact candidate on Test systemd + public version/backend/DB checks | GitOps declarations remain useful provenance but do not by themselves prove public runtime |
| Runtime identity | active systemd WorkingDirectory + public version + DB connection evidence | repository head or GitOps SHA alone is insufficient |

Any document that says “Production is Kubernetes/Flux” without explicitly marking it as target/recovery architecture is stale against this runtime snapshot.

## Service boot contract

These observed services are part of the current host baseline and should remain enabled where intentionally configured:
- `moneyverse-backend.service`
- `moneyverse-frontend.service`
- `test-main-backend.service`
- `test-main-frontend.service`
- `moneyverse-discord-bot.service`
- `moneyverse-economy-ai.service`
- `moneyverse-mcp.service`
- `docker.service`
- `nginx.service`
- repository GitHub Actions runner

Production and Test session continuity, DB authority, release identity and backup/restore evidence remain separate acceptance gates.

## Data and container hygiene

Multiple short-lived/QA PostgreSQL containers are currently present on the host in addition to the Production/Test databases. Their presence is not permission to delete them blindly. Cleanup requires classification by owner/workstream, current use, data value and rollback need.

Do not infer Production DB identity from a container name alone. Confirm the systemd environment/connection, bound port, database identity and application evidence before any cleanup or migration.

## Documentation rule

Current-runtime documents must label facts as one of:
- **OBSERVED CURRENT** — measured from the authorized host/runtime;
- **CONFIGURED CURRENT** — declared current configuration but not independently exercised in the same review;
- **TARGET/RECOVERY** — desired or recovery architecture not currently serving as public authority;
- **HISTORICAL** — past state retained only for incident/change evidence.

This baseline should be refreshed whenever OS, runtime stack, database major version, public routing or deployment authority changes.
