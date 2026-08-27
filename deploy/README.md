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

## Secrets

`bootstrap-env.sh` writes `~/moneyverse-migration/.env` once and never
overwrites a value that is already there.

| Kind | Where it comes from |
| --- | --- |
| `POSTGRES_PASSWORD`, `APP_DB_PASSWORD`, `INTERNAL_API_TOKEN` | Generated on the host from `/dev/urandom`. Nothing outside the host needs them, so nothing outside the host sees them. |
| `DISCORD_*`, `GOOGLE_*` client credentials | Copied from a container already running on the host, named by `ADOPT_FROM`. They never pass through the runner, the repository, or a shell history. |
| `*_REDIRECT_URI` | Derived from `APP_BASE_URL`. The API refuses to enable a provider whose redirect URI does not match that origin and the exact callback path, so a hand-written one is a silent disable. |

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
  BACKEND_IMAGE=ghcr.io/ridanit-ruma/wdmv/backend:latest \
  FRONTEND_IMAGE=ghcr.io/ridanit-ruma/wdmv/frontend:latest \
  GHCR_USER=<user> GHCR_TOKEN=<read:packages token> \
  bash ./roll.sh
```

`docker compose ps`, `logs`, and `exec` all work from that directory.
