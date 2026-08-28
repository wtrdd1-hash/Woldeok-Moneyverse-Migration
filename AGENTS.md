# AGENTS.md

Working notes for anyone — human or agent — changing this repository.

This is the rebuild of Woldeok Moneyverse: a Korean community virtual economy,
moved from a single Express + EJS application onto Next.js and NestJS. It is
private, it is deployed, and members use it.

---

## Read this first

**The business logic is not in TypeScript.** It is in ~90 PostgreSQL
`SECURITY DEFINER` functions. The application connects as `moneyverse_app`, a
role that cannot `UPDATE` a balance, `DELETE` an audit row, or write an
identity. It can execute those functions and almost nothing else.

That boundary is the product's main security property, and most of the traps
below follow from it.

- A new read path needs a **function**, not a `GRANT`. Granting the role
  `SELECT` on a table would let one SQL injection read every member's
  positions; a function that takes `p_actor` restricts the rows itself. This
  has already gone wrong once — the stock read path shipped without functions
  and answered `42501` in production (migration 047 fixed it).
- Money is a canonical **integer string**, end to end. `numeric(38,0)` holds
  values `Number` cannot represent, and `Number('9' + '0'.repeat(37))` rounds
  silently. Group digits by walking the string (`lib/money.ts`); use `BigInt`
  for chart geometry.
- Every mutation carries an **idempotency key**. The functions return the
  original receipt for a repeat, which is what makes a double-submitted form
  charge once.

## Layout

| Path | What it is |
| --- | --- |
| `frontend/` | Next.js App Router + shadcn/ui. The only publicly reachable origin. |
| `backend/` | NestJS API. Reachable only from the compose network. |
| `packages/database/` | Numbered SQL migrations, `migrate.sh`, and the production checksum manifest. |
| `packages/contract/` | Types shared by both, and the route map. |
| `deploy/` | compose file, nginx config, host scripts. |
| `ops/` | Cloudflare inspection and publishing scripts. |
| `docs/` | Design docs and plans. Korean is fine here. |

### The request path

```
browser ──▶ Next  ──▶ NestJS ──▶ SECURITY DEFINER function ──▶ tables
             (server actions, route handlers)
```

The browser never talks to the API. That is what keeps the session a
same-origin `HttpOnly` cookie and CSRF a same-origin problem. `lib/api.ts` is
`server-only`; importing it from a client component is a build error, and it
needs to be — it reads `INTERNAL_API_TOKEN`.

The one exception is `/socket.io/`, the lobby handshake, which the browser
opens directly because it has to.

## Commands

Node 20+, pnpm 10+.

```bash
pnpm install
pnpm dev          # frontend and backend together
pnpm typecheck    # builds @moneyverse/contract first, then tsc across the workspace
pnpm lint
pnpm test
pnpm build
```

`pnpm typecheck` and `pnpm test` build `@moneyverse/contract` first on
purpose: its `dist` is what the dependents type against.

Tests that need a database run only when `DATABASE_URL` is set, and are
skipped otherwise. **A skipped test is never reported as a passing one** — say
which ones were skipped.

Stale `frontend/.next/types` will fail `tsc` with `Cannot find module` for a
page you deleted. `rm -rf frontend/.next` and run it again.

## Migrations

Numbered, immutable, applied once, checksummed.

- `migrate.sh` refuses to run a file whose sha256 differs from the one
  recorded in `schema_migrations`. **Never edit an applied migration.** Write
  the next number.
- `production-checksums.json` is a floor read from the live database, not a
  git snapshot. `packages/database/test/migration-parity.test.ts` enforces it:
  everything production applied must be present and byte-identical, and a new
  file must be numbered above the baseline.
- The deployment's `migrate` service runs on every `docker compose up`, so a
  new migration reaches the stack with the deploy — but only when the workflow
  ships it. See `deploy/README.md`.

## Conventions

**Everything written into this repository is in English.** Code comments,
commit messages, PR titles and bodies, test names, assertion messages. The one
exception is `docs/`, which may be Korean.

**Korean product copy is not yours to reword.** The strings a member reads
were carried over deliberately. Changing one is a product decision, not a
refactor.

**Comments say why, not what.** The codebase is written that way throughout —
every non-obvious choice carries the reason it was made, usually including the
alternative that was rejected. Match it.

**Commits are made only when asked**, and carry no `Co-Authored-By: Claude`
trailer, no `Claude-Session:` trailer, and no "Generated with Claude Code"
line. The repository's author is its owner.

**Route changes go through `packages/contract/src/route-map.ts`.** Every route
the original application served appears there exactly once, paired with what
serves it now, or with `replacement: null` **and a reason**. A route cannot
disappear quietly; the test fails if one tries.

**shadcn/ui is the component layer.** Reach for a registry component before
writing markup. Two registry files carry local patches for
`exactOptionalPropertyTypes` (`dropdown-menu.tsx`, `sonner.tsx`), each with a
comment saying so — re-adding those components will overwrite the patch.

## The public/private split matters

Public pages (`/`, `/announcements`, `/gallery`, `/status`, `/shop`,
`/terms`, `/privacy`) are statically generated or ISR, so a crawler receives
finished HTML. **Touching `cookies()` in a page opts it out of that**, and
because the masthead lives in the root layout, doing it there would opt out
every page at once.

That is why the viewer arrives after hydration through `/api/viewer` rather
than during render, and why anything per-member on a public page is fetched
by a small client component. Follow that pattern rather than making a public
page dynamic.

Member pages are `force-dynamic` and `noindex`. They carry one member's
balances; nothing about them may be cached.

## Deploying

Two deployments, one compose file, `STACK` telling them apart: `wdmv` is test
at test.easy-scraping.com, `wdmvp` is production at easy-scraping.com. They
share no database and no secret.

Neither deploys on a push. `gh workflow run deploy.yml -f environment=test`,
then production once test is confirmed. **[docs/RELEASING.md](docs/RELEASING.md)
is the procedure** — read it before deploying anything, and before changing
anything under `deploy/`.

## This machine

3.6 GB RAM, four threads. It freezes under a parallel build and recovery
costs whatever was in flight.

- Do not run several subagents at once.
- Prefer the narrowest command: `pnpm --filter @moneyverse/backend test` over
  a full `pnpm test` when only one workspace changed.
- Docker is not installed here. The scratch database is an SSH tunnel to the
  development host on `127.0.0.1:15439`; `packages/database/.env` points at
  it. It holds no real data.

## Verify before claiming

Run the command, read the output, then say what it said. "Tests pass" means a
test run in this session printed zero failures. `pnpm lint` in a pipeline can
have its exit status swallowed — check it on its own.
