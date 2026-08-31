# Deploying the migration stack

Five containers on one host, built by Actions and pulled there, published to
the internet through the Cloudflare tunnel that already runs on that machine.

```
Cloudflare  →  cloudflared (wtrdd-edge network)  →  wdmv-edge (nginx)
                                                       ├─ /socket.io/ → wdmv-backend
                                                       └─ everything   → wdmv-frontend
                                                                             │
                                                            internal only ───┴→ wdmv-backend → wdmv-db
```

`wdmv-edge` is the only container on the tunnel's network. The API is never
published: the browser talks to Next, Next talks to the API over the compose
network, and that is what keeps the session a same-origin HttpOnly cookie and
CSRF a same-origin problem. The one exception is `/socket.io/`, which is the
lobby's own handshake and has to reach the API from the browser — it shares
the origin for exactly that reason.

## What the workflow does

`.github/workflows/deploy.yml` **runs only when someone asks it to.** There is
no push trigger: a commit on main is built and tested by `ci.yml` and stays
there until a person decides the host should take it.

```bash
gh workflow run deploy.yml            # or the Run workflow button in Actions
gh run watch                          # follow it
```

It runs CI, then:

1. builds both images and pushes them to GHCR, tagged with the commit **and**
   with `latest`;
2. ships `compose.yml`, `edge/default.conf`, the scripts, and the database
   migrations over SSH;
3. runs `roll.sh`, which fills in `.env`, records the exact image references
   it is deploying, pulls them, and rolls the stack with `--wait`.

Because the tag is the commit, a rollback is one edited line:

```bash
cd ~/moneyverse-migration
sed -i 's#/backend:.*#/backend:<older-sha>#;s#/frontend:.*#/frontend:<older-sha>#' .env
docker compose up -d --wait
```

## Updating the host to `latest` without the workflow

When a deploy has already published new images and you just want this host on
them:

```bash
ssh <host>
bash ~/moneyverse-migration/update.sh
```

Or, without the script:

```bash
cd ~/moneyverse-migration
sed -i '/^BACKEND_IMAGE=/d;/^FRONTEND_IMAGE=/d' .env   # drop the pinned commit
docker compose pull backend frontend
docker compose up -d --wait
```

Both forms move images only. They do not ship files, so `compose.yml`, the
nginx config and the SQL under `migrations/` stay as the last workflow run
left them. **A release that adds a database migration needs the workflow**,
which ships the migration alongside the image; `update.sh` alone would start
a backend expecting a column the database does not have. It prints the
newest migration the host holds so the difference is visible.

The host has to be logged in to pull a private package. Once is enough:

```bash
printf '%s' '<read:packages token>' | docker login ghcr.io -u <user> --password-stdin
```

## Backups

`backup.sh` and `restore.sh` are shipped to the host with everything else and
run there, by the deploy user, from a cron entry the operator installs once.
Nothing about a backup happens during a deploy.

```bash
bash backup.sh init-key     # once: the encryption key, kept outside this directory
bash backup.sh run          # dump + photo objects, encrypted, verified, expired
bash backup.sh verify       # what the release checklist asks for before production
bash restore.sh <file>      # into a NEW database, then compares it to the manifest
```

The dump runs inside the profile-gated `backup` service as
`moneyverse_backup`, a role holding `pg_read_all_data` and nothing else, and
is compressed and encrypted on the host so the key never enters a container.
The procedure, the retention policy and the restore rehearsal are in
[docs/BACKUP.md](../docs/BACKUP.md).

## Secrets

`bootstrap-env.sh` writes `~/moneyverse-migration/.env` once and never
overwrites a value that is already there.

| Kind | Where it comes from |
| --- | --- |
| `POSTGRES_PASSWORD`, `APP_DB_PASSWORD`, `INTERNAL_API_TOKEN`, `BACKUP_DB_PASSWORD` | Generated on the host from `/dev/urandom`. Nothing outside the host needs them, so nothing outside the host sees them. |
| `BACKUP_ENCRYPTION_KEY` | **Not in `.env`.** `backup.sh init-key` writes `~/.moneyverse-backup-key`, and a copy belongs somewhere off this host. A key beside the ciphertext, or in the file compose loads into containers, is doing nothing — `backup.sh` refuses both. |
| `DISCORD_*`, `GOOGLE_*` client credentials | Copied from a container already running on the host, named by `ADOPT_FROM`. They never pass through the runner, the repository, or a shell history. |
| `*_REDIRECT_URI` | Derived from `APP_BASE_URL`. The API refuses to enable a provider whose redirect URI does not match that origin and the exact callback path, so a hand-written one is a silent disable. |
| `OAUTH_ALLOWED_REDIRECT_URIS` | Derived from `APP_BASE_URL` too, and the reason a second public host can work at all: both the API and the frontend match the browser's origin against this list before falling back to the canonical one. It was written by nothing until 2026-08-31, so the list was empty in every container and every sign-in used `APP_BASE_URL` — correct for one domain, and a silent fallback for any second one. Set it explicitly to add a host; `bootstrap-env.sh` will not overwrite a value that is there. |
| `DATABASE_POOL_MAX`, `DATABASE_POOL_IDLE_TIMEOUT_MS`, `DATABASE_POOL_CONNECT_TIMEOUT_MS` | Not written by `bootstrap-env.sh` and not normally needed. The API bounds its own pool at 10 connections with a 5-second wait for a free one; the ceiling is deliberately far below the cluster's 100 because the reconciler, the status collector and the nightly backup draw on the same budget. Set one here only to move a bound on a host that has outgrown it — out-of-range or unparseable values fall back to the default rather than being obeyed. |

The script reports which keys are set, never what they contain.

### Repository variables

| Name | Purpose |
| --- | --- |
| `APP_BASE_URL` | Public origin. Baked into the frontend image at build time. |
| `ADOPT_FROM` | Container to copy OAuth credentials from. |
| `SEO_INDEXING_ENABLED` | Optional. Absent means `false`, which is right for a test deployment. |

### Secrets used by the workflow

`DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_HOST`, `DEPLOY_USER`,
`DEPLOY_PORT`, and `GHCR_PULL_TOKEN`.

The host key is pinned rather than accepted on first use:
`StrictHostKeyChecking=no` would hand the deploy key to anything that can
answer at that address.

`GHCR_PULL_TOKEN` is a personal access token with `read:packages` and nothing
else. Publishing uses the workflow's own `GITHUB_TOKEN`; the host is outside
GitHub and cannot use that, so it holds its own read-only credential. It is
never written to disk on the host — `roll.sh` pipes it into `docker login`
and logs out on exit.

Capture the host key with the comment lines stripped — `ssh-keyscan` prints
`# host:port SSH-2.0-...` banners, and a `head -1` that grabs one of those
produces a `known_hosts` that matches nothing:

```bash
ssh-keyscan -p <port> -t ed25519 <host> | grep -v '^#'
```

## Indexing

`SEO_INDEXING_ENABLED` stays `false` here. With it unset `robots.txt`
disallows everything and `sitemap.xml` is empty. A test deployment that
indexes puts a second copy of the product's Korean copy into search results
under a hostname that is not the canonical one.

## Running it by hand

```bash
ssh <host>
cd ~/moneyverse-migration
APP_BASE_URL=https://migration.easy-scraping.com \
  ADOPT_FROM=woldeok-moneyverse-local-app-test-1 \
  BACKEND_IMAGE=ghcr.io/wtrdd1-hash/wdmv/backend:latest \
  FRONTEND_IMAGE=ghcr.io/wtrdd1-hash/wdmv/frontend:latest \
  GHCR_USER=<user> GHCR_TOKEN=<read:packages token> \
  bash ./roll.sh
```

`docker compose ps`, `logs`, and `exec` all work from that directory.
