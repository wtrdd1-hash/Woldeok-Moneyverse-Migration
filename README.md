# Woldeok Moneyverse

A rebuild of the Woldeok Moneyverse virtual economy on Next.js and NestJS.

| Workspace | What it is |
| --- | --- |
| `frontend/` | Next.js App Router application with shadcn/ui — the only publicly reachable origin |
| `backend/` | NestJS API, reachable only from the internal network |
| `packages/database/` | Numbered SQL migrations and the introspected Prisma schema |
| `packages/contract/` | Types shared by both applications |
| `services/minecraft-agent/` | Loopback-only HTTP agent that runs on the game host |
| `services/minecraft-executor/` | Host-local worker that claims approved operations by database lease |
| `deploy/` | nginx configuration, Compose files, container images |

## The one thing to know first

The business logic of this application does not live in TypeScript. It lives in
88 PostgreSQL `SECURITY DEFINER` functions. The application connects as a role
that cannot update balances, delete audit rows, or forge an identity — it can
only execute those functions. Every write goes through one.

That boundary is deliberate and load-bearing. Read
[the design document](docs/superpowers/specs/2026-08-27-nextjs-nestjs-rebuild-design.md)
before changing anything in the data layer.

## Development

Requires Node 20+ and pnpm 10+.

```bash
pnpm install
pnpm dev          # frontend and backend together
pnpm build
pnpm test
pnpm lint
```

Tests that need a database run only when `DATABASE_URL` is set. They are skipped
otherwise, and a skipped test is never reported as a passing one.
