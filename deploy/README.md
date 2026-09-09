# `deploy/` — data tools from the retired Docker host

**Nothing here deploys anything.** The release path is Flux reconciling
`wtrdd1-hash/kuber-infrastructure` onto a Kubernetes cluster; see
`../docs/INFRASTRUCTURE.md`.

The Compose control plane that used to live in this directory — `compose.yml`,
`roll.sh`, `update.sh`, `bootstrap-env.sh`, `edge/`, `install-backup-cron.sh`,
`backup-watchdog.sh` — was deleted on 2026-09-09, together with
`.github/workflows/k8s-prepull.yml`. The host it drove was reinstalled on
2026-09-07 and runs containerd, not Docker.

What is left is data and recovery work, kept because it is the only copy of that
logic. **Most of it does not run on the current host**, because it reaches the
database through `docker compose exec`:

| file | runs today? | what it does |
| --- | --- | --- |
| `backup.sh`, `backup-figures.sql` | no — needs Docker | encrypted dump, manifest, verification |
| `restore.sh` | no — needs Docker | restores into a *new* database and compares against the recorded figures |
| `recover-display-names.sh`, `recover-display-names-from-backup.sh` | no — needs Docker | targeted repair of display names |
| `merge-forked-account.sh` | no — needs Docker | merges a duplicated account |
| `seed.sh` | readable, not wired up | the seeding contract |

Backups themselves are taken by the `wdmvp-db-backup` CronJob in the cluster,
hourly at `:17`, defined in `kuber-infrastructure`. It does its own `pg_dump`
and does not use `backup.sh`.

> **Open gap.** There is no restore procedure that works on this cluster.
> Backups exist and nothing has been rehearsed against them. Porting
> `restore.sh` — into a Job that mounts the dump and restores into a scratch
> database — is worth doing before it is needed rather than after.

`../docs/BACKUP.md` documents these scripts and therefore also describes the
retired host. Read it for the *intent* of the backup design, not for commands to
run.
