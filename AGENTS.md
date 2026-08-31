# AGENTS.md

Working notes for anyone — human or agent — changing this repository.

This is the rebuild of Woldeok Moneyverse, a Korean community virtual economy.
It is private, it is deployed, and members hold real balances in the production
stack. **A wrong migration here is not a broken build.**

Read this file to the end before your first change. It is long because the
mistakes it prevents are expensive, and every one of them has been made.

---

## 1. Orientation, and the one rule

Woldeok Moneyverse (월덕 머니버스) is a Korean community's virtual economy: a double-entry ledger, a wallet, a shop, a stock market, a bank, businesses, a casino, a member board, and a Minecraft server status feed. This repository is that application rebuilt on Next.js, NestJS and PostgreSQL.

The original was not Express. It was a single Node 20 ESM application with no framework at all — raw `node:http`, sequential `if` routing, 18 EJS views, browser TypeScript compiled to global scripts, a socket.io lobby, `pg` and `jose` (`docs/superpowers/specs/2026-08-27-nextjs-nestjs-rebuild-design.md:10`). That framing governs the scope of everything you do here. The rebuild replaced the HTTP, session and view layers. It did not move the economy, because the economy was never in Node.

The repository is private (`wtrdd1-hash/Woldeok-Moneyverse-Migration`). Two stacks are deployed, and members hold real balances in the production one. A wrong migration is not a broken build.

### The one rule

**The business logic is in PostgreSQL `SECURITY DEFINER` functions, not in TypeScript.** The application connects as `moneyverse_app`, created `NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT` in `packages/database/init/000-create-app-role.sh:4`. `init/001-economy-core.sql:45` gave that role broad prototype grants; the hardening migrations took nearly all of them back.

| Table | What `moneyverse_app` holds today | Set by |
| --- | --- | --- |
| `account_balances`, `accounts`, `ledger_transactions`, `ledger_postings`, `outbox_events`, `daily_rewards` | `SELECT` only. No `INSERT`, no `UPDATE`. | `005-economy-hardening.sql:8` revokes all, `:16` re-grants `SELECT` alone |
| `audit_logs` | Nothing. Not even `SELECT`. | `007-admin-hardening.sql:7`; no later migration grants it back |
| `users`, `identities`, `user_consents` | Nothing. | `006-auth-hardening.sql:129`, then `010-account-lifecycle.sql:44` revokes all |
| `virtual_stocks`, `virtual_stock_positions`, `virtual_stock_trades` | Nothing. | `023-virtual-stock-game.sql`, restated by `047` |
| `auth_sessions`, `oauth_challenges` | `SELECT, INSERT, UPDATE` — the session layer is the one place the application writes rows itself | `002-auth-and-api.sql:24` |

In place of table access it holds `EXECUTE` on the `SECURITY DEFINER` functions. `packages/database/README.md:64` records a measurement taken against the live database: 52 tables in `public`, 11 the role may `SELECT`, 3 it may `INSERT`, 3 `UPDATE`, 0 `DELETE`, 69 functions it may `EXECUTE`. Migrations have landed since. Re-measure rather than quote it.

Migrations never run as that role. `migrate.sh` runs as `moneyverse_migrator`, which owns the functions — that ownership is what makes `SECURITY DEFINER` mean anything. Three further roles exist for work that is not the web application: `moneyverse_minecraft_executor` (`017`), `moneyverse_reconciler` (`018`), `moneyverse_status_collector` (`050`). All three are `NOLOGIN` group roles that a separate `LOGIN` principal assumes. A migration never creates a `LOGIN` role and never contains a password.

**What the boundary buys.** A total compromise of the application — SQL injection, RCE, a leaked `DATABASE_URL` — still cannot move a balance, delete an audit row, forge an identity, or approve its holder as an administrator. The one function that moves money, `economy_post_transaction` (`packages/database/init/001-economy-core.sql:25`), refuses to commit unless debits equal credits, locks the affected accounts in `id` order to avoid deadlock, rejects a negative balance on any account not marked `allow_negative`, and writes the outbox event in the same transaction. None of that is a promise TypeScript keeps. The database refuses.

**What it costs you.** A new read path needs a **function**, not a `GRANT`. Granting the role `SELECT` on a table would let one SQL injection read every member's positions and trade history; a function that takes `p_actor` restricts the rows itself, which is strictly stronger than trusting the caller to append `WHERE user_id = $1`. The same applies to an ORM: moving writes into one would require re-granting exactly the privileges that were deliberately taken away.

**This has already gone wrong once.** The stock read path shipped with no functions at all. `list()`, `adminList()`, `portfolio()` and `history()` queried `virtual_stocks`, `virtual_stock_positions` and `virtual_stock_trades` directly, and `023` had revoked all three from the role on purpose. In production every one of those reads answered `42501 permission denied`, taking `GET /api/v1/stocks`, `/api/v1/stocks/portfolio`, `/api/v1/stocks/history`, `/api/v1/admin/stocks` and the `/stocks` page down with them. Nothing caught it because the original's tests all used doubles, and a double does not inspect the SQL string. The first test run against a live database found it immediately.

`047-virtual-stock-read-functions.sql` fixed it by adding four read functions and granting `EXECUTE` — not by granting `SELECT`. Copy the shape of that fix:

- `stock_my_positions(p_actor)` enforces `WHERE user_id = p_actor` inside the function; `stock_admin_list(p_actor)` moved the operator check out of the route and into the function, so reaching the method by another path still gets nothing.
- 047 **re-states** the revoke it inherited, so the migration cannot later be misread as a relaxation.
- `backend/src/game.db.test.ts:90` asserts the three tables are *still* unreadable in the same file that asserts the functions work. If someone grants `SELECT` later to make a query easier, that is what notices.
- `docs/findings/stock-reads-lack-grants.md` is the full account, including the reproduction against the production database.

**It happened a second time, and the second time was quieter.** The work loop shipped complete in 066–070: a catalogue, an assignment function, a submission that enforces a minimum duration, a verification that mints the reward inside one transaction, and a dashboard reporting the caps. `work_task_catalog` is revoked from the role like everything else, and no function read it back — so there was no way to learn a task's id, `POST /api/v1/work/assignments` could not be called, and the whole loop was unreachable from a browser. Nothing failed; there was simply no screen, and the missing read is why there could not be one. `095-work-task-board.sql` is the same fix in the same shape.

The lesson is not "remember to add a read". It is that **a write path is not finished until something can name its arguments.** If a function takes an id, ask where a member gets that id from, and answer it in the same change.

One caution before you read a `42501` as a missing grant: it usually is not. Fifteen migrations raise it deliberately — `game_catalog_operator` answers `operator role required` — and those refusals are the security model working. Only PostgreSQL's own privilege check phrases the message as `permission denied for ...`. `isMissingGrant` in `backend/src/testing/database.ts:43` is that distinction. An earlier version of the tests asserted `code !== '42501'` outright, which failed on every correct role refusal.

### Layout

| Path | What it is |
| --- | --- |
| `frontend/` | Next.js App Router with shadcn/ui. Everything the browser loads except `/socket.io/`. |
| `backend/` | NestJS API. Reachable from the compose network, plus the two edge exceptions below. |
| `packages/contract/` | Types shared by both applications, and `src/route-map.ts`. Built before anything type-checks against it — its `dist` is what the dependents see. |
| `packages/database/` | `init/`, the numbered `migrations/`, `migrate.sh`, `production-checksums.json`, `verify/`, `test/migration-parity.test.ts`. The schema is owned here; Prisma introspects it and never migrates it. |
| `deploy/` | `compose.yml`, `edge/default.conf`, and the host scripts (`roll.sh`, `update.sh`, `seed.sh`, `backup.sh`, `restore.sh`). |
| `ops/` | Cloudflare tunnel and DNS scripts. They run on the deployment host, never here. |
| `docs/` | Design docs, `RELEASING.md`, `BACKUP.md`, `route-map.md`, `findings/`. Korean is allowed here and nowhere else in the repository. |
| `scripts/` | CI guards: `check-secrets.sh`, `check-control-bytes.sh`, `reject-prisma-migrate.sh`, `extract-original-routes.py`. |
| `.github/workflows/` | `ci.yml`, and `deploy.yml` which has no push trigger. |

Two things on disk are not part of the repository. `packages/minecraft-agent/`, `packages/minecraft-core/` and `packages/minecraft-executor/` contain only `dist/` and `node_modules/` and are untracked — the design document plans them, but no source for them is committed. The `services/*` glob in `pnpm-workspace.yaml` matches nothing today.

### The request path

```
browser ──▶ edge (nginx) ──▶ Next ──▶ NestJS ──▶ SECURITY DEFINER function ──▶ tables
                             server actions, route handlers
```

The browser does not talk to the API. `frontend/src/lib/api.ts` is the only route from Next to it, and the file begins `import 'server-only'`: importing it from a client component is a build error, and it has to be, because the module reads `INTERNAL_API_TOKEN` out of the environment. A client bundle containing it would publish the credential that separates the API from the internet. The backend refuses to boot on a token shorter than 32 characters (`backend/src/core/config.ts:258`).

Keeping the API unpublished is what makes the session a same-origin `HttpOnly` cookie and CSRF a same-origin problem. `/api/` is not routed to the backend as a prefix at all. Exactly two paths reach it through the edge:

| Path | Called by | Why it must be routed |
| --- | --- | --- |
| `/socket.io/` | the browser | The lobby handshake carries the session cookie. A second hostname would mean either a cross-origin cookie or a second session, so it shares this origin. `Origin` must arrive unchanged — the lobby compares it to `APP_BASE_URL`. |
| `/api/v1/integrations/discord/interactions` | Discord | Discord POSTs from the outside. It is an exact-match `location`, not a prefix, so no other API path becomes reachable by sharing one. The handler verifies an Ed25519 signature over the exact request bytes before it parses anything, which is what makes a publicly reachable endpoint acceptable — nothing may rewrite the body. |

Next's own handlers under `frontend/src/app/api/` (`viewer`, `wallet/summary`, `shop/purchases`, `stocks/[id]/candles`) are Next, not NestJS. They serve the same origin and reach the API through `lib/api.ts` like everything else.

---

## 2. Commands, and what this machine cannot do

Node 20+, pnpm 10 (`packageManager` pins **pnpm@10.0.0** — settings still live in
`package.json`'s `pnpm` field, not in `pnpm-workspace.yaml`, which pnpm only
reads from 10.6).

```bash
pnpm install
pnpm dev          # frontend and backend together
pnpm lint         # run it ALONE; a pipe swallows the exit status
pnpm typecheck    # builds @moneyverse/contract first, then tsc across the workspace
pnpm test
pnpm build
```

`pnpm typecheck` and `pnpm test` build `@moneyverse/contract` first on purpose:
its `dist` is what the dependents type against.

**The development machine has no PostgreSQL and no Docker.** That single fact
governs how you report results:

- Database-backed tests run only when `DATABASE_URL` is set. `databaseUrl()` in
  `backend/src/testing/database.ts` falls back to reading
  `packages/database/.env`, which points at an SSH tunnel to a scratch host. If
  that tunnel is down the tests **error with `ECONNRESET` rather than skip** —
  that is not a code failure, and it is not a pass either.
- **CI is the only place SQL is ever executed.** A migration you wrote has not
  been parsed by a server until CI runs it.
- A skipped test is never reported as a passing one. Say which ones skipped.
- "Tests pass" means a run in this session printed zero failures, and you read
  the output.

Two mechanical traps:

- Stale `frontend/.next/types` fails `tsc` with `Cannot find module` for a page
  you deleted. `rm -rf frontend/.next` and run again.
- `next build` is the memory-heavy step. On a small host, build the workspaces
  separately and cap the heap:
  `NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @moneyverse/frontend build`.

---

## 3. Migrations, and why work here lands as a stack of pull requests

Numbered, immutable, applied once, checksummed.

- `migrate.sh` refuses to run a file whose sha256 differs from the one recorded
  in `schema_migrations`. **Never edit an applied migration.** Write the next
  number. There is exactly one hardcoded historical exception, for
  `013-content-and-status.sql`, and it must not become a pattern.
- `production-checksums.json` is a floor read from the live database, not a git
  snapshot.
- `packages/database/test/migration-parity.test.ts` enforces three rules:
  everything production applied is present and byte-identical; a new file is
  numbered above the baseline; and **the sequence is contiguous from 002** with
  no gap and no repeat.

That last rule decides how you organise your work.

> Two branches taken off `main` with reserved ranges — one holding 062–064, the
> other 065–066 — each fail the parity test on their own tree, because each is
> missing the other's numbers.

**So migration work lands as a stack.** Each pull request's base is the previous
pull request's branch. Every layer then sees 002..N contiguous, CI passes per
PR, and merge order equals stack order equals number order. Renumbering an
unapplied file is the escape hatch when the stack is reordered.

**The merge trap.** Merging a stack bottom-up puts each PR into its base
*branch*, not into `main`. The chain assembles correctly and only the bottom PR
reaches `main`. This happened here: five PRs all showed MERGED while `main` was
still six commits and five migrations behind. Before you delete anything:

```bash
git log --oneline origin/main..<tip-branch>     # must be empty
git diff --diff-filter=A --name-only origin/main <branch>   # must be empty
```

**`packages/contract/src/route-map.ts` is pinned at 92 ORIGINAL routes.** It maps
the routes the pre-rebuild application served to what serves them now. A route
the original never had does not belong in it, and `MODULES` in
`route-map.test.ts` is a hardcoded set.

---

## 4. The economy core, and the invariants you must not break

- **`economy_post_transaction` is the only thing that moves money**, and
  `moneyverse_app` has no `EXECUTE` on it. Only migration-owned wrapper
  functions call it.
- Debits must equal credits. The function refuses otherwise, locks the affected
  accounts in `id` order to avoid deadlock, rejects a negative balance on any
  account not marked `allow_negative`, and writes the outbox event in the same
  transaction.
- `account_balances` is a denormalised derived value. **The ledger is the source
  of truth**; the reconciliation snapshot compares the two.
- **The ledger is append-only.** A wrong transaction is corrected by a new
  compensating transaction that references the original — never by an edit and
  never by a delete. `ledger_postings.amount` has `CHECK (amount > 0)`, so a
  reversal can only be expressed as mirrored directions on a new row.

### Idempotency — the template is migration 045

Every mutation carries a key. In this order, with no step moved:

```sql
-- 1. validate the inputs
PERFORM pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('moneyverse:<fn>:' || p_key::text, 0));   -- 2. lock the KEY, not the actor
-- 3. replay lookup
-- 4. owner check -> 28000 if the receipt belongs to someone else
-- 5. the real work
```

Locking the actor instead of the key lets two concurrent requests carrying the
same key both miss the replay branch. Taking the lock after the lookup does the
same. Both mistakes are in this repository's history.

### SQLSTATE vocabulary

| Code | Means | HTTP via `backend/src/core/pg-error.ts` |
| --- | --- | --- |
| `22023` | invalid request, unbalanced postings, insufficient balance | 409 |
| `23505` | already done, cooldown not elapsed | 409 |
| `55000` | feature disabled, append-only violation | 409 |
| `28000` | that receipt belongs to another user | 400 |
| `42501` | role refusal | 500 unless handled |

Introduce a new code and you update `pg-error.ts` in the same change.

A `42501` is usually **not** a missing grant. Fifteen migrations raise it
deliberately. Only PostgreSQL's own check phrases it `permission denied for ...`;
`isMissingGrant` in `backend/src/testing/database.ts` is that distinction.

### Money

`bigint`, carried as a **canonical integer string** end to end. `numeric(38,0)`
holds values `Number` cannot represent and `Number('9' + '0'.repeat(37))` rounds
silently. Group digits by walking the string (`lib/money.ts`); use `BigInt` for
chart geometry. **Never `Number()` a balance.**

### The function template — copy it exactly

```sql
REVOKE ALL PRIVILEGES ON TABLE public.<t> FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.<f>(...) RETURNS ...
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp        -- a parity test greps for this
AS $$ ... $$;

ALTER FUNCTION public.<f>(...) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.<f>(...) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.<f>(...) TO moneyverse_app;
```

PostgreSQL grants `EXECUTE` to `PUBLIC` by default, which is why the revoke is
mandatory and not decoration. A trigger function gets no grant.

### The audit trail — append-only, and closed

Migrations 062–065. Four things about it will bite you if you do not know them.

**`audit_logs` refuses `UPDATE` and `DELETE`, for its owner too.** A trigger
raises 55000. A migration that genuinely has to touch history writes
`ALTER TABLE public.audit_logs DISABLE TRIGGER audit_logs_immutable` and says
why, in the migration file, where a reviewer sees it. The same holds for
`audit_chain_verifications`, `audit_retention_policies` and
`audit_destruction_records`. **Retention is a record, not a `DELETE`** — the
end of a retention period appends a disposition row (065), it does not remove
rows.

**The `context` key set is closed.** `audit_assert_context` (063) rejects an
unrecognised key with 22023 rather than dropping it, so adding a field means a
migration *and* the matching change in `backend/src/admin/audit-context.ts`.
Those two files are one unit. A typo in a caller is a loud failure, which is
the point: a silently unrecorded field is discovered during an incident.

**Secrets are refused, by key name.** `audit_first_sensitive_key` walks
metadata and context to any depth and refuses any write carrying a key that
matches `password|token|cookie|secret|session_id|api_key|…`. It is a coarse
net and will also refuse a harmless `tokenCount`; that is the intended
direction of error.

**`sequence` is a bigint and a chain position.** It crosses the wire as a
decimal string, like money. Cursor pagination keys on it because it is the
only total order the table has — an offset repeats or skips rows as the chain
grows under a reader.

Writing a row: `admin_record_audit_event` for an administrative action (the
actor must hold a role), `admin_record_console_access` for the fact that
someone reached a console route (an active account is enough, and the action
must be namespaced `admin.`). The second exists because the request most worth
recording — the one an authorization guard refused — comes from a caller with
no role.

---

## 5. Authorization: one superadmin, and the switches that turn things off

- **Two-person approval is gone.** One superadmin acts alone. It was the only
  compensating control over money and treasury actions, so the second
  authentication factor landed in the same pull request — do not separate them
  again.
- `admin_role` is an enum. **PostgreSQL cannot USE a value in the transaction
  that ADDs it**, which is why migration 056 adds `'superadmin'` and does
  nothing else with it.
- Guards: `AdminSessionGuard` on every admin route but `/admin/me`,
  `ReauthGuard` on entering the console and again before each high-risk write,
  `SecondFactorGuard` giving a spent code two minutes.
- TOTP secrets are sealed with `ADMIN_TOTP_ENCRYPTION_KEY`, which lives only in
  the environment, so a database read alone yields no usable factor.
  `bootstrap-env.sh` generates it with `put`, not `set_to` — **rotating it
  strands every enrolled administrator**, so a rotation has a re-enrolment
  behind it and is never something a redeploy does by accident.
- `feature_switches` holds `enabled | paused | safe_mode | disabled`.

**`feature_switch_state` fails closed.** An unregistered feature reads
`'disabled'`. That is deliberate: forgetting to seed a row ships a feature OFF
and visibly, rather than ON and silently. The cost is that adding a switch to an
already-live feature turns it off until its row exists — **seed the row first,
then add the gate.**

Three stage-3 features ship disabled with their activation preconditions on the
row: `casino`, `stock_corporate_action`, `economy_auto_policy`. The casino
additionally carries a trigger that refuses to leave `disabled` while no passing
distribution trial of at least 1,000,000 draws is on record.

---

## 6. The frontend, and the split that must not be broken

- `lib/api.ts` is `server-only`. Importing it from a client component is a build
  error, and it needs to be — it reads `INTERNAL_API_TOKEN`. The browser never
  talks to the API; the one exception is `/socket.io/`.
- Public pages (`/`, `/announcements`, `/gallery`, `/status`, `/shop`, `/terms`,
  `/privacy`) are static or ISR so a crawler receives finished HTML. **Touching
  `cookies()` in a page opts it out**, and because the masthead lives in the root
  layout, doing it there would opt out every page at once. That is why the
  viewer arrives after hydration through `/api/viewer`.
- Member pages are `force-dynamic` and `noindex`. They carry one member's
  balances; nothing about them may be cached.
- shadcn/ui is the component layer. Reach for a registry component before
  writing markup. Two registry files carry local patches for
  `exactOptionalPropertyTypes` — re-adding those components overwrites the patch.
- **Korean product copy is not yours to reword.** The strings a member reads were
  carried over deliberately. Changing one is a product decision, not a refactor.

---

## 7. Deploying: two stacks, one compose file

| | test | production |
| --- | --- | --- |
| address | `https://test.easy-scraping.com` | `https://easy-scraping.com` |
| `STACK` | `wdmv` | `wdmvp` |
| host directory | `~/moneyverse-migration` | `~/moneyverse-production` |
| database | `moneyverse_migration` | `moneyverse_production` |
| loopback port | 3021 | 3022 |
| image tag | `<sha>-test` | `<sha>-production` |
| search indexing | off | on |

**They share no database and no secret.** The public origin is baked into the
frontend image at **build** time, which is why one commit produces two images
and the environment is in the tag rather than being a hidden difference between
two images with the same name.

**Nothing deploys on a push.** A human dispatches it, test first, production
only after test is confirmed:

```bash
gh workflow run deploy.yml -f environment=test
gh workflow run deploy.yml --ref <branch> -f environment=test   # a branch, without touching main
```

`docs/RELEASING.md` is the procedure. Read it before changing anything under
`deploy/`.

The `migrate` service runs on every `docker compose up`, so a new migration
reaches the stack with the deploy — **and its checksum is frozen the moment it
lands.** Deploying before review means review can no longer change that file;
only a new numbered migration can correct it.

Secrets generated on the host by `bootstrap-env.sh` never leave it. OAuth client
credentials are copied host-locally from the container named by `ADOPT_FROM`,
which is a once-per-host act — the adoption is skipped once all four are present,
and still fatal when they are not, because the loop writes those keys empty when
it cannot fill them and the API then disables both login providers without
saying why.

---

## 8. Conventions

**Everything written into this repository is English.** Code comments, commit
messages, PR titles and bodies, test names, assertion messages. The one
exception is `docs/`, which may be Korean.

**Comments say why, not what** — including the alternative that was rejected. The
codebase is written that way throughout. Match it.

**Commits are made only when asked**, and carry no `Co-Authored-By: Claude`
trailer, no `Claude-Session:` trailer, and no "Generated with Claude Code" line.
The repository's author is its owner. Verify before you push:

```bash
git log <range> --format=%B | grep -niE "co-authored|claude-session|generated with"
```

**Route changes go through `packages/contract/src/route-map.ts`** — for routes the
original served. A route cannot disappear quietly; `replacement: null` needs a
reason and the test fails without one.

---

## 9. Traps this repository has already fallen into

| Trap | Symptom | What to do |
| --- | --- | --- |
| Editing an applied migration | `Refusing to run changed migration` | Write the next number. Never revise. |
| Two branches with reserved migration ranges | Parity test: "a gap or a repeated number" | Stack the PRs; each base is the previous branch. |
| Merging a stack into its own bases | All PRs MERGED, `main` unchanged | `git log origin/main..<tip>` before deleting branches. |
| Adding a new route to `ROUTE_MAP` | `expect(originalRoutes()).toHaveLength(92)` fails | New routes do not belong there. |
| New read path added by `GRANT` | One injection reads every member's rows | Write a function taking `p_actor`. |
| Missing `SET search_path` | Parity test fails | It is in the template for a reason. |
| `Number()` on a balance | Silent rounding, wrong money | Integer strings; `BigInt` for geometry. |
| `git add -A` at the repo root | `.claude/worktrees` staged as embedded repos | `.claude/` is gitignored and eslint-ignored; keep it that way. |
| Stale `.next/types` | `Cannot find module` for a deleted page | `rm -rf frontend/.next`. |
| "Tests passed" after a local run | The scratch DB tunnel was down; they errored | CI is the only place SQL runs. |
| A repository rename | Hardcoded `ghcr.io/<old-owner>/...` still pulls | Derive from `github.repository_owner`; grep for the old name. |
| Silencing a gate to make it green | The gate stops meaning anything | Fix the finding. `postcss` was pinned, not exempted. |
| `pg_catalog.greatest` / `least` / `coalesce` / `nullif` / `extract` | `function pg_catalog.greatest(...) does not exist`, or a syntax error at `FROM` | They are SQL constructs, not functions. Write them bare — `search_path` does not change what they mean. In a plpgsql body it fails at execution, not at deploy: 054 exists because three background jobs failed that way for weeks. |
| A plpgsql OUT parameter sharing a column name | 42702 at run time, from `ON CONFLICT (…)` or an unqualified reference | plpgsql substitutes parameters into the conflict target too. Rename the OUT parameter, or drop the target when the table has one constraint. |
