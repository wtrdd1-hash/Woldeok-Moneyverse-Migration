# Woldeok Moneyverse

A rebuild of the Woldeok Moneyverse community virtual economy on Next.js and
NestJS, deployed at
[migration.easy-scraping.com](https://migration.easy-scraping.com).

| Workspace | What it is |
| --- | --- |
| `frontend/` | Next.js App Router application with shadcn/ui — the only publicly reachable origin |
| `backend/` | NestJS API, reachable only from the internal network |
| `packages/database/` | Numbered SQL migrations and the production checksum manifest |
| `packages/contract/` | Types shared by both applications, and the route map |
| `deploy/` | nginx configuration, Compose file, host scripts |
| `ops/` | Cloudflare DNS and tunnel scripts |

## The one thing to know first

The business logic of this application does not live in TypeScript. It lives
in PostgreSQL `SECURITY DEFINER` functions. The application connects as a role
that cannot update balances, delete audit rows, or forge an identity — it can
only execute those functions. Every write goes through one.

That boundary is deliberate and load-bearing. Read
[the design document](docs/superpowers/specs/2026-08-27-nextjs-nestjs-rebuild-design.md)
before changing anything in the data layer, and
[AGENTS.md](AGENTS.md) before changing anything at all.

```
browser ──▶ Next.js ──▶ NestJS ──▶ SECURITY DEFINER function ──▶ tables
```

The browser never talks to the API directly. That is what keeps the session a
same-origin `HttpOnly` cookie and CSRF a same-origin problem. The lobby's
`/socket.io/` handshake is the single deliberate exception.

## Development

Requires Node 20+ and pnpm 10+.

```bash
pnpm install
pnpm dev          # frontend and backend together
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Tests that need a database run only when `DATABASE_URL` is set. They are
skipped otherwise, and a skipped test is never reported as a passing one.

## Deploying

Two deployments from one compose file, and neither runs on a push:

| | Test | Production |
| --- | --- | --- |
| | `test.easy-scraping.com` | `easy-scraping.com` |

```bash
gh workflow run deploy.yml -f environment=test          # then, once confirmed:
gh workflow run deploy.yml -f environment=production
```

They share no database and no secret. **[docs/RELEASING.md](docs/RELEASING.md)
is the procedure**, including rollback and what to do when a release carries a
migration. [deploy/README.md](deploy/README.md) describes the stack itself.
