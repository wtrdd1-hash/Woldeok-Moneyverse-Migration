# What this deployment actually is

> [!IMPORTANT]
>
> **Current runtime authority — 2026-09-16 / v2026.09.16.151**
>
> The public Production and Test origins are currently served by the authorized
> Debian 13 runtime at `192.168.100.190`, using systemd-managed release
> directories and local PostgreSQL containers. Both public origins, the
> application repository `main`, and the GitOps desired image/source references
> are converged on exact application SHA
> `3d87165f83bcb60903e85d4f3600fdf40074ef40`.
>
> The NixOS/Kubernetes node at `192.168.100.186` is **not the current public
> authority**: administrative SSH authorization could not be re-established with
> the configured deploy credential. The Production Flux `apps` Kustomization is
> therefore intentionally `suspend: true`. **Do not resume it or route Production
> traffic to the Kubernetes database** until cluster administrative access is
> restored and its database is reconciled against the current public Production
> PostgreSQL authority.
>
> The Kubernetes sections below describe the intended/previous GitOps target
> architecture. Where they conflict with this incident-state notice, this notice
> is authoritative until a later versioned runtime-convergence record supersedes it.

Read this before touching anything under `deploy/`, `.github/workflows/`, or any
document that describes releasing. It exists because the repository spent a week
describing a machine that no longer exists, and more than one change was made
against that description.

The Korean summary is at the end.

---

## The one-paragraph version

The **target architecture** is a single-node Kubernetes cluster on NixOS, reconciled by **Flux** from `wtrdd1-hash/kuber-infrastructure`. During the v2026.09.16.151 recovery, however, the verified public authority is the Debian 13 systemd runtime at `192.168.100.190`, with local PostgreSQL containers. This repository still builds immutable GHCR images and the GitOps repository now pins the same exact SHA as public Test/Production, but the Kubernetes Production `apps` Kustomization remains suspended. Treat Kubernetes as a recovery target, not the live Production authority, until the access and database-reconciliation gates above are cleared.

## Kubernetes recovery target (not current live authority)

|             |                                                                            |
| ----------- | -------------------------------------------------------------------------- |
| host        | `minipc`, NixOS 26.05                                                      |
| cluster     | kubeadm, Kubernetes v1.36.3, single node                                   |
| runtime     | containerd 2.3.3 — **not Docker**                                          |
| CNI         | Cilium                                                                     |
| ingress     | Traefik, LoadBalancer `192.168.100.201`                                    |
| public edge | Cloudflare Tunnel; nothing but mail ports is open inbound                  |
| storage     | `local-path` (default), reclaim `Retain`                                   |
| declared by | `ridanit-ruma/kuber-nixos-flakes` fork at `wtrdd1-hash/kuber-nixos-flakes` |

This table describes the Kubernetes recovery target recorded before the current incident. It is not evidence that those workloads are currently serving public traffic. The verified public runtime must be determined from public exact-SHA probes, the active systemd working directories, and the current database connection evidence described above.

## Where Production currently lives

| role                          | current authority                                                  |
| ----------------------------- | ------------------------------------------------------------------ |
| public Production URL         | `https://easy-scraping.com`                                        |
| public Test URL               | `https://test.easy-scraping.com`                                   |
| active host                   | Debian 13, `192.168.100.190`                                       |
| Production services           | `moneyverse-backend`, `moneyverse-frontend` via systemd            |
| Test services                 | `test-main-backend`, `test-main-frontend` via systemd              |
| Production database authority | local PostgreSQL used by the active backend at `127.0.0.1:5433`    |
| exact live application SHA    | `3d87165f83bcb60903e85d4f3600fdf40074ef40`                         |
| GitOps desired target         | `wtrdd1-hash/kuber-infrastructure` → `apps/wdmvp/`, same exact SHA |
| Kubernetes Production state   | `clusters/minipc/apps.yaml` → `suspend: true`                      |

The current public recovery topology has **separate Test and Production systemd services** on the Debian authority. `test.easy-scraping.com` is active and is the exact-SHA release gate before Production. The GitOps repository also declares a `wdmv-test` target. Historical notes saying Test was removed or returns 404 are obsolete as of v2026.09.16.151.

### Boot continuity rule — v2026.09.18.215

On the authorized Debian 13 Production host, a host boot/reboot must restore the Moneyverse runtime automatically. Keep these units enabled and verify that they are active after boot: `moneyverse-backend.service`, `moneyverse-frontend.service`, `moneyverse-discord-bot.service`, `moneyverse-economy-ai.service`, `moneyverse-mcp.service`, `docker.service`, `nginx.service`, and the repository GitHub Actions runner service. The Production PostgreSQL container bound at host port `5433` must keep Docker restart policy `unless-stopped`; short-lived QA database containers on `554xx` ports are not part of the Production boot contract.

The Discord bot is part of the boot contract, not an optional operator step. Its systemd unit is enabled for `multi-user.target` with automatic restart. After a boot or bot restart, verify the journal shows a successful bot login and an initial voice connection becoming ready in target voice channel `1536572442422550538`. The bot voice watchdog must continue to rejoin if the Discord voice connection is dropped.

Operator verification:

```bash
systemctl is-enabled moneyverse-backend.service moneyverse-frontend.service \
  moneyverse-discord-bot.service moneyverse-economy-ai.service \
  moneyverse-mcp.service docker.service
systemctl is-active moneyverse-backend.service moneyverse-frontend.service \
  moneyverse-discord-bot.service moneyverse-economy-ai.service \
  moneyverse-mcp.service docker.service nginx.service
journalctl -u moneyverse-discord-bot.service -n 80 --no-pager
docker inspect -f '{{.HostConfig.RestartPolicy.Name}} {{.State.Status}}' \
  woldeok-moneyverse-dev-db-1
```

On 2026-09-18 this contract was re-verified on the authorized Debian 13 host: all six core Moneyverse units plus Nginx and the GitHub Actions runner were enabled and active, the Production PostgreSQL container was running with `unless-stopped`, the public Production and Test origins answered HTTP 200, backend `/health` answered HTTP 200, and the Discord bot journal showed successful login plus voice-ready state for the configured target channel.

Other namespaces on the same node run unrelated services (`mail`, `economy`,
`launcher`, `discord`, `cloudflared`, `gpt-plugin`). Do not assume the cluster
is yours alone.

## Current release path while Kubernetes Production is suspended

```text
application repo main
  -> Build Test Candidate / immutable exact SHA
  -> exact-SHA Test on the active Debian authority
  -> public Test backend/API/SEO-boundary QA
  -> fresh Production DB backup
  -> same exact SHA on Debian Production systemd services
  -> public Production smoke + SEO checks
  -> Build Production Release publishes exact-SHA GHCR images
  -> GitOps Test/Production desired refs updated to the same SHA
  -> Runtime Drift Watch proves desired == public live

Kubernetes Production apps remain suspend=true.
Do not resume them until SSH administration and cluster-DB reconciliation pass.
```

The long-term target is to return to normal Flux-controlled Production after the NixOS access and database gates are restored. During the current recovery state, updating a GitOps image tag **does not authorize a Kubernetes rollout** and must not be treated as proof that the cluster is serving Production.

The full release safety contract is in [`operations/production-deployment.md`](operations/production-deployment.md).

### Images are private, and the cluster has its own credential

`ghcr.io/wtrdd1-hash/wdmv/*` are private packages. The node pulls them using a
`ghcr-pull` Secret in the `wdmvp` namespace, encrypted with sops for the cluster
age key and committed to `kuber-infrastructure`. Both Deployments reference it
through `imagePullSecrets`.

Nothing needs to be copied onto the node by hand. If you find instructions that
say to `docker save`/`scp`/`ctr images import` an image, they are obsolete: that
was the workaround used before the credential existed, and a release that
somebody forgot to import is what it produced.

## Traps this setup has already sprung

**A stuck rollout still reports `Available=True`.** When the kubelet cannot pull
the new image, the previous pod keeps serving and the Deployment stays
Available. The failure is only visible in the `Progressing` condition:

```bash
kubectl -n wdmvp get deploy wdmvp-frontend \
  -o jsonpath='{range .status.conditions[*]}{.type}={.status} {.reason}{"\n"}{end}'
```

`Progressing=False ProgressDeadlineExceeded` means the release never landed,
however healthy the site looks.

**Old image tags disappear from GHCR.** On 2026-09-09 every `-production` tag
older than the newest one returned 404 for its manifest while still being listed
as a package version — including the tags the running pods had been started
from. Assume you cannot roll back to an arbitrary old tag; check before relying
on one:

```bash
crane manifest ghcr.io/wtrdd1-hash/wdmv/backend:<sha>-production   # or a plain
                                                                  # registry GET
```

**Migrations are not run by the rollout.** On the Compose host, `docker compose
up` ran the `migrate` service. Nothing in the Kubernetes manifests does that
today. The schema and the image are advanced separately, and it is on the
person releasing to check that `public.schema_migrations` has reached what the
image expects:

```bash
kubectl -n wdmvp exec wdmvp-db-0 -- sh -c \
  'psql -U $POSTGRES_USER -d moneyverse_production -qAt \
   -c "select filename from public.schema_migrations order by filename desc limit 1;"'
```

**Only two paths reach the backend from outside.** The Ingress sends
`/api/v1/integrations/discord/interactions` and `/socket.io/` to
`wdmvp-backend`; everything else goes to `wdmvp-frontend`, which calls the
backend server-side through `API_ORIGIN=http://wdmvp-backend:3000`. This mirrors
the old nginx `edge` exactly. A browser hitting `/api/v1/...` and getting a
Next.js 404 is the design, not a fault.

## What `deploy/` still is

The Compose control plane is gone: `compose.yml`, `roll.sh`, `update.sh`,
`bootstrap-env.sh` and `edge/` were deleted on 2026-09-09, along with
`.github/workflows/k8s-prepull.yml`.

What remains are **data tools, not release tools**, and every one of them was
written for the Docker host:

| file                                                   | state                                                                |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| `backup.sh`, `restore.sh`, `backup-figures.sql`        | call `docker compose exec`. **They do not run on the current host.** |
| `recover-display-names*.sh`, `merge-forked-account.sh` | same                                                                 |
| `seed.sh`                                              | no Docker dependency; still readable as the seeding contract         |

`docs/BACKUP.md` documents those scripts and is therefore also describing the
retired host.

> **Open gap.** Backups are taken (the `wdmvp-db-backup` CronJob), but there is
> no restore procedure that works on this cluster. `restore.sh` has not been
> ported. Porting it is worth doing before it is needed.

> **Open gap.** Only `ghcr-pull` is declared in git. `wdmvp-app` (32 keys),
> `wdmvp-db-superuser` and `wdmvp-registry` were created by hand and are
> managed by nothing — `kubectl -n wdmvp get secret -o custom-columns=` > `NAME:.metadata.name,MANAGED:.metadata.labels.kustomize\.toolkit\.fluxcd\.io/name`
> shows `<none>` for all three. Delete the namespace and the application's
> entire environment is gone. They belong in `kuber-infrastructure` as sops
> files, the way `ghcr-pull` is.

> `wdmvp-registry` predates `ghcr-pull` and does the same job. Nothing in the
> manifests references it. It is left alone rather than deleted because it was
> not created by this work.

## Which repository to change

| you want to change                                     | repository                         |
| ------------------------------------------------------ | ---------------------------------- |
| application code, CI, image build                      | this one                           |
| what runs in the cluster, image tags, secrets, ingress | `wtrdd1-hash/kuber-infrastructure` |
| the machine itself: disks, network, firewall, k8s node | `wtrdd1-hash/kuber-nixos-flakes`   |

The two infrastructure repositories take **direct pushes to `main`**. Do not
open branches or pull requests there.

`ridanit-ruma/kuber-fluxcd` and `ridanit-ruma/kuber-nixos-flakes` are the public
upstreams those two were forked from. They are published for other people to
install from. **Never commit this cluster's configuration to them** — no
hostnames, no addresses, no disk serials, no keys.

---

## 한국어 요약

프로덕션은 **NixOS 단일 노드 쿠버네티스**이고, **Flux**가
`wtrdd1-hash/kuber-infrastructure`를 읽어 반영합니다. **호스트에 Docker가 없습니다.**
이 리포는 이미지를 빌드해 GHCR에 올리는 데서 끝나고, 배포는 저쪽 리포의 이미지
태그를 바꾸는 커밋입니다.

2026-09-07 이전 문서에 나오는 `STACK`, `~/moneyverse-production`, 루프백 포트,
`docker compose`는 전부 사라진 머신 이야기입니다.

특히 조심할 것:

- 이미지를 못 당겨도 Deployment는 `Available=True`로 보입니다. `Progressing` 조건을
  봐야 실패가 보입니다.
- 옛 이미지 태그가 레지스트리에서 사라집니다. 임의의 옛 태그로 롤백할 수 있다고
  가정하지 마세요.
- 롤아웃은 마이그레이션을 돌리지 않습니다. `schema_migrations`를 직접 확인하세요.
- 백업은 돌지만 **이 클러스터에서 동작하는 복구 절차가 없습니다.**
