# Local Development

## Runtime baseline

The current repository/runtime baseline is Node 24, pnpm 10, PostgreSQL 17.x and the workspace packages defined by `pnpm-workspace.yaml`.

Use the repository's declared Node engine rather than bypassing it. A Node 20 host may fail installation intentionally when `engines.node` requires Node 24.

## Workspace layout

```text
frontend/            Next.js App Router
backend/             NestJS API
packages/contract/   shared contracts / route map
packages/database/   database init + migrations
```

## Install

```bash
corepack enable
pnpm install --frozen-lockfile
```

## Core checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Backend/database tests require an isolated PostgreSQL database configured for the test runner. Never point destructive or migration tests at Production.

## Security checks

The repository contains scripts that reject committed secrets, raw control bytes and forbidden Prisma schema mutation patterns. Run the same checks CI runs before pushing significant changes.

## Development boundary

Local development may relax the internal API token guard for framework tests/developer use. Do not infer from that behavior that Production API exposure is intended.

## Money type rule

If a value is WLD, treat it as a canonical integer string. Convert to `BigInt` only for exact arithmetic. Do not normalize money through JavaScript `Number`.
