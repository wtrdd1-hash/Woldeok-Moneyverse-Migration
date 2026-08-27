# Foundation, Database and Backend Core — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the pnpm workspace, port the database layer byte-for-byte, and build the NestJS core (config, pool, session, CSRF, guards, problem+json errors, throttling, OpenAPI) so that a later plan can add domain modules on top of a working authentication round trip.

**Architecture:** A pnpm workspace with two applications (`frontend/`, `backend/`) and two shared packages (`packages/contract`, `packages/database`). All database writes go through PostgreSQL `SECURITY DEFINER` functions; the application role has no direct DML on money or audit tables. NestJS is internal-only — Next.js is the sole public origin in a later plan.

**Tech Stack:** Node 20+, pnpm 10, TypeScript 5.9, NestJS 11, Vitest 3 (+ `unplugin-swc` for Nest decorator metadata), `pg` 8, `zod` 4, ESLint 9 flat config, Prettier 3, GitHub Actions with a PostgreSQL 17 service.

**Spec:** `docs/superpowers/specs/2026-08-27-nextjs-nestjs-rebuild-design.md`

**Source of truth for porting:** the original repository at `/home/ruma/Woldeok-Moneyverse` (branch `refactor/ts-migration-security-ui-20260827`). Paths written as `ORIGINAL/...` below refer to it.

## Global Constraints

- **All repository writing is English** — code comments, commit messages, PR titles and bodies, test names, assertion messages. Documents under `docs/` may be Korean.
- **User-facing product copy is Korean and must stay byte-identical** to the original. Never translate, re-wrap or "improve" a string a user sees.
- **Never add a `Co-Authored-By: Claude` trailer, a `Claude-Session:` trailer, or "Generated with Claude Code" text** to any commit or PR body. Verify with `git log -1 --format=%B` before finishing a task.
- **Conventional Commits**: `feat|fix|docs|refactor|test|build|chore(scope): …`
- **Money is a branded string, never a number.** Columns are `bigint` / `numeric(38,0)`; `pg` returns strings; arithmetic goes through `BigInt()`. A money value that becomes a JavaScript `number` is a defect.
- **Every state-changing route is CSRF-protected without exception.** Add the protection in the same commit as the route.
- **`prisma migrate` is never run.** Schema ownership belongs to the numbered SQL files. Prisma is introspection and reads only.
- **Test doubles are deliberately partial.** Do not pad a double with stub methods to satisfy the compiler — that changes what the test proves. If typing reveals a double is missing something the code genuinely calls, report it as a finding.
- **A skipped test is never reported as a passing one.** Database-backed tests skip without `DATABASE_URL`; say so explicitly.
- **Machine limits:** RAM 3.6GB, 4 threads, 19GB free disk. Keep test workers at 2. There is no Docker, Podman or local PostgreSQL server on the development machine — only the `psql` 18.4 client. Database-backed tests run in CI, which does have a PostgreSQL service.
- **Control-character regexes:** when touching a file containing a control-character class, verify the bytes, not the text: `grep -nP '[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]' <files>` must produce no output.

---

### Task 1: Workspace skeleton and tooling

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc.json`, `.editorconfig`, `.npmrc`, `.nvmrc`
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: nothing
- Produces: workspace scripts `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`; the base TypeScript compiler options every package extends; the package name prefix `@moneyverse/`.

- [ ] **Step 1: Create the workspace manifest files**

`pnpm-workspace.yaml`:

```yaml
packages:
  - frontend
  - backend
  - packages/*
  - services/*
```

`package.json`:

```json
{
  "name": "woldeok-moneyverse",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "engines": { "node": ">=20" },
  "scripts": {
    "build": "pnpm -r --sequential build",
    "typecheck": "pnpm -r --sequential typecheck",
    "test": "pnpm -r --sequential test",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "@eslint/js": "^9.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.9.0",
    "typescript-eslint": "^8.0.0"
  }
}
```

`--sequential` matters: this machine has 3.6GB of RAM, and running two TypeScript builds concurrently is what makes it swap.

`.npmrc`:

```
engine-strict=true
```

`.nvmrc`:

```
20
```

`.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

`.prettierrc.json`:

```json
{
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

- [ ] **Step 2: Create the base TypeScript configuration**

`tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

`exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` are both carried over from the original project. They are what force the `…Like` structural interfaces to be honest about optionality.

- [ ] **Step 3: Create the ESLint flat configuration**

`eslint.config.mjs`:

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**', '**/generated/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);
```

`no-explicit-any` is an error, not a warning: the original repository finished its TypeScript migration with zero bare `any` and this project starts from that baseline.

- [ ] **Step 4: Install and verify the toolchain runs**

Run:

```bash
pnpm install
pnpm lint
```

Expected: `pnpm install` completes; `pnpm lint` exits 0 with no files to check yet.

- [ ] **Step 5: Write the CI workflow**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:17.5-alpine
        env:
          POSTGRES_USER: moneyverse_migrator
          POSTGRES_PASSWORD: ci_migrator_password
          POSTGRES_DB: woldeok_moneyverse_ci
        options: >-
          --health-cmd "pg_isready -U moneyverse_migrator -d woldeok_moneyverse_ci"
          --health-interval 5s --health-timeout 5s --health-retries 20
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm build

      - name: Apply database migrations
        env:
          PGHOST: localhost
          PGPORT: 5432
          PGUSER: moneyverse_migrator
          PGPASSWORD: ci_migrator_password
          PGDATABASE: woldeok_moneyverse_ci
          APP_DB_PASSWORD: ci_app_password
        run: packages/database/ci-apply.sh

      - name: Test
        env:
          DATABASE_URL: postgresql://moneyverse_app:ci_app_password@localhost:5432/woldeok_moneyverse_ci
        run: pnpm test

      - name: Reject prisma migrate
        run: |
          if grep -rn --include='*.json' --include='*.ts' --include='*.yml' \
               --include='*.sh' 'prisma migrate' . \
               --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=docs; then
            echo 'prisma migrate must never run: the numbered SQL files own the schema' >&2
            exit 1
          fi
```

The development machine has no container runtime and no PostgreSQL server, so CI is where database-backed tests actually execute. `packages/database/ci-apply.sh` is written in Task 3; until then this step fails, which is correct — CI is not expected to be green until Task 3 lands.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json eslint.config.mjs \
        .prettierrc.json .editorconfig .npmrc .nvmrc .github/workflows/ci.yml pnpm-lock.yaml
git commit -m "build: set up the pnpm workspace and shared toolchain"
git log -1 --format=%B | grep -iE 'claude|generated with' && echo 'FORBIDDEN TRAILER' && exit 1
```

---

### Task 2: Shared contract package with the money type

**Files:**
- Create: `packages/contract/package.json`, `packages/contract/tsconfig.json`, `packages/contract/vitest.config.ts`
- Create: `packages/contract/src/money.ts`, `packages/contract/src/index.ts`
- Test: `packages/contract/src/money.test.ts`

**Interfaces:**
- Consumes: `tsconfig.base.json` from Task 1
- Produces: package `@moneyverse/contract` exporting `WldAmount`, `isWldAmount(value: unknown): value is WldAmount`, `wldAmount(value: string, field: string): WldAmount`. Built to CommonJS at `dist/` with declarations, so both the CommonJS backend and the bundled frontend can import it.

- [ ] **Step 1: Create the package manifest and configuration**

`packages/contract/package.json`:

```json
{
  "name": "@moneyverse/contract",
  "version": "0.0.0",
  "private": true,
  "type": "commonjs",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.9.0",
    "vitest": "^3.0.0"
  }
}
```

`packages/contract/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts"]
}
```

`packages/contract/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    maxWorkers: 2,
    minWorkers: 1,
  },
});
```

- [ ] **Step 2: Write the failing test**

`packages/contract/src/money.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { isWldAmount, wldAmount } from './money';

describe('wldAmount', () => {
  it('accepts a canonical zero', () => {
    expect(wldAmount('0', 'balance')).toBe('0');
  });

  it('accepts the widest supported magnitude', () => {
    const thirtyEightDigits = `9${'0'.repeat(37)}`;
    expect(wldAmount(thirtyEightDigits, 'balance')).toBe(thirtyEightDigits);
  });

  it('accepts a negative amount', () => {
    expect(wldAmount('-42', 'delta')).toBe('-42');
  });

  it('rejects a leading zero', () => {
    expect(() => wldAmount('012', 'balance')).toThrow(TypeError);
  });

  it('rejects negative zero', () => {
    expect(() => wldAmount('-0', 'balance')).toThrow(TypeError);
  });

  it('rejects an explicit plus sign', () => {
    expect(() => wldAmount('+1', 'balance')).toThrow(TypeError);
  });

  it('rejects exponent notation', () => {
    expect(() => wldAmount('1e3', 'balance')).toThrow(TypeError);
  });

  it('rejects a value wider than the widest money column', () => {
    expect(() => wldAmount(`9${'0'.repeat(38)}`, 'balance')).toThrow(TypeError);
  });

  it('names the field in the error message', () => {
    expect(() => wldAmount('nonsense', 'transferAmount')).toThrow(/transferAmount/);
  });
});

describe('isWldAmount', () => {
  it('narrows a canonical integer string', () => {
    expect(isWldAmount('1234')).toBe(true);
  });

  it('rejects a number', () => {
    expect(isWldAmount(1234)).toBe(false);
  });

  it('rejects a non-integer string', () => {
    expect(isWldAmount('12.5')).toBe(false);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm --filter @moneyverse/contract test`
Expected: FAIL — cannot resolve `./money`.

- [ ] **Step 4: Port the implementation from the original**

`packages/contract/src/money.ts` — copied from `ORIGINAL/src/types/money.ts`, with the migration reference updated to the new path:

```ts
/**
 * Money in this application is an integer string, never a JavaScript number.
 * The database columns are bigint and numeric(38, 0); node-postgres returns
 * both as strings, and the services convert with BigInt(). Branding the type
 * makes it a compile error to put a number where an amount belongs.
 */
export type WldAmount = string & { readonly __wld: unique symbol };

// Canonical: no leading zeros, no plus sign, no exponent, no separators, no
// negative zero, and up to 38 digits — matching the widest money columns in
// use, numeric(38, 0) (see
// packages/database/migrations/018-economy-reconciliation-health.sql).
const CANONICAL_INTEGER = /^(0|-?[1-9][0-9]{0,37})$/;

export function isWldAmount(value: unknown): value is WldAmount {
  return typeof value === 'string' && CANONICAL_INTEGER.test(value);
}

export function wldAmount(value: string, field: string): WldAmount {
  if (!CANONICAL_INTEGER.test(value)) {
    throw new TypeError(`${field} must be a canonical integer string`);
  }
  // Invariant: CANONICAL_INTEGER has just matched `value`, so it is a
  // canonical integer string and safe to brand as WldAmount.
  return value as WldAmount;
}
```

`packages/contract/src/index.ts`:

```ts
export { isWldAmount, wldAmount } from './money';
export type { WldAmount } from './money';
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @moneyverse/contract test`
Expected: PASS — 12 tests.

- [ ] **Step 6: Verify the build emits declarations**

Run: `pnpm --filter @moneyverse/contract build && ls packages/contract/dist`
Expected: `index.js`, `index.d.ts`, `money.js`, `money.d.ts` present.

- [ ] **Step 7: Commit**

```bash
git add packages/contract
git commit -m "feat(contract): add the branded WldAmount money type"
```

---

### Task 3: Database package — migrations ported byte-for-byte

**Files:**
- Create: `packages/database/package.json`
- Create: `packages/database/init/000-create-app-role.sh`, `packages/database/init/001-economy-core.sql`
- Create: `packages/database/migrations/002-…-046-….sql` (42 files, copied)
- Create: `packages/database/migrate.sh`, `packages/database/ci-apply.sh`
- Create: `packages/database/compose.yml`, `packages/database/.env.example`, `packages/database/README.md`
- Create: `packages/database/prisma/schema.prisma`
- Test: `packages/database/test/migration-parity.test.ts`, `packages/database/vitest.config.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces: package `@moneyverse/database`; the applied schema and the 88 `SECURITY DEFINER` functions every backend repository calls; `ci-apply.sh` used by the CI workflow from Task 1.

- [ ] **Step 1: Copy the SQL byte-for-byte**

```bash
mkdir -p packages/database/init packages/database/migrations packages/database/prisma packages/database/test
cp /home/ruma/Woldeok-Moneyverse/test/db/init/* packages/database/init/
cp /home/ruma/Woldeok-Moneyverse/test/db/migrations/*.sql packages/database/migrations/
cp /home/ruma/Woldeok-Moneyverse/test/db/migrate.sh packages/database/migrate.sh
chmod +x packages/database/init/000-create-app-role.sh packages/database/migrate.sh
```

Do not reformat, renumber or edit any of these files. `migrate.sh` verifies a `sha256` per migration and refuses to run a changed one; an edit here is a production migration failure, and one file (`013-content-and-status.sql`) has a documented historical checksum pair that must keep matching.

- [ ] **Step 2: Write the failing parity test**

`packages/database/test/migration-parity.test.ts`:

```ts
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ORIGINAL_ROOT = process.env.ORIGINAL_REPO ?? '/home/ruma/Woldeok-Moneyverse';
const PORTED_ROOT = join(__dirname, '..');

function digestsOf(directory: string): Map<string, string> {
  const digests = new Map<string, string>();
  for (const name of readdirSync(directory).sort()) {
    if (!name.endsWith('.sql') && !name.endsWith('.sh')) continue;
    digests.set(name, createHash('sha256').update(readFileSync(join(directory, name))).digest('hex'));
  }
  return digests;
}

describe('migration parity with the original repository', () => {
  // 42, not 45: the numbering deliberately skips 041, 042 and 043. Numbers are
  // never reused, so the gap is expected and must not be "fixed".
  it('ports exactly 42 numbered migrations', () => {
    const ported = digestsOf(join(PORTED_ROOT, 'migrations'));
    expect(ported.size).toBe(42);
  });

  it('preserves the deliberate numbering gap at 041 through 043', () => {
    const numbers = [...digestsOf(join(PORTED_ROOT, 'migrations')).keys()].map((name) =>
      Number(name.slice(0, 3)),
    );
    expect(numbers).not.toContain(41);
    expect(numbers).not.toContain(42);
    expect(numbers).not.toContain(43);
    expect(Math.max(...numbers)).toBe(46);
  });

  it('ports the two init scripts', () => {
    const ported = digestsOf(join(PORTED_ROOT, 'init'));
    expect([...ported.keys()]).toEqual(['000-create-app-role.sh', '001-economy-core.sql']);
  });

  it.skipIf(!existsSyncSafe(ORIGINAL_ROOT))(
    'reproduces every original SQL file byte-for-byte',
    () => {
      for (const relative of ['init', 'migrations']) {
        const original = digestsOf(join(ORIGINAL_ROOT, 'test/db', relative));
        const ported = digestsOf(join(PORTED_ROOT, relative));
        expect(ported).toEqual(original);
      }
    },
  );

  it('pins every SECURITY DEFINER function search_path', () => {
    const offenders: string[] = [];
    for (const name of readdirSync(join(PORTED_ROOT, 'migrations')).sort()) {
      if (!name.endsWith('.sql')) continue;
      const sql = readFileSync(join(PORTED_ROOT, 'migrations', name), 'utf8');
      const definers = sql.match(/SECURITY DEFINER[\s\S]{0,200}?(?=AS \$)/g) ?? [];
      for (const definer of definers) {
        if (!/SET\s+search_path/i.test(definer)) offenders.push(name);
      }
    }
    expect(offenders).toEqual([]);
  });
});

function existsSyncSafe(path: string): boolean {
  try {
    readdirSync(path);
    return true;
  } catch {
    return false;
  }
}
```

The parity assertion skips when the original checkout is absent — it cannot run in CI, and a skipped test there is honest. The `search_path` assertion runs everywhere: an unpinned `SECURITY DEFINER` function is a privilege-escalation primitive, and all current migrations comply.

`packages/database/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['test/**/*.test.ts'], maxWorkers: 2, minWorkers: 1 },
});
```

`packages/database/package.json`:

```json
{
  "name": "@moneyverse/database",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "echo 'no build step: SQL is the artifact'",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "test": "vitest run",
    "introspect": "prisma db pull --schema prisma/schema.prisma"
  },
  "devDependencies": {
    "prisma": "^6.0.0",
    "typescript": "^5.9.0",
    "vitest": "^3.0.0"
  }
}
```

`packages/database/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "module": "CommonJS", "moduleResolution": "Node", "types": ["node"], "noEmit": true },
  "include": ["test/**/*.ts", "*.ts"]
}
```

- [ ] **Step 3: Run the test to verify it passes**

Run: `pnpm --filter @moneyverse/database test`
Expected: PASS — 5 tests, none skipped when run on this machine (the original checkout is present).

If the parity test fails, the copy was not byte-exact. Re-copy; do not adjust the test.

- [ ] **Step 4: Write the Prisma schema stub**

`packages/database/prisma/schema.prisma`:

```prisma
// GENERATED BY INTROSPECTION. Do not hand-edit the models below.
//
// This schema is produced by `prisma db pull` against a database whose
// structure is owned by the numbered SQL files in ../migrations. Prisma does
// not own the schema and `prisma migrate` must never be run against it:
// the migrations create SECURITY DEFINER functions and revoke table-level
// DML from the application role, neither of which Prisma models. A Prisma
// migration would drop both.
//
// Prisma Client is used for SELECT only, and only on tables where the
// moneyverse_app role holds a SELECT grant. Every write goes through
// `SELECT * FROM <function>(...)`.

generator client {
  provider = "prisma-client-js"
  output   = "../generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Introspection needs a live database, which this machine does not have. Run `pnpm --filter @moneyverse/database introspect` once a database is reachable — CI or a provisioned host — and commit the generated models in their own commit.

- [ ] **Step 5: Write the CI apply script**

`packages/database/ci-apply.sh`:

```bash
#!/bin/sh
# Creates the least-privileged application role and applies every numbered
# migration, in the same order and with the same checksum discipline as the
# production migrate.sh. Used by CI, which has a PostgreSQL service.
set -eu

: "${PGHOST:?PGHOST is required}"
: "${PGPORT:?PGPORT is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${PGDATABASE:?PGDATABASE is required}"
: "${APP_DB_PASSWORD:?APP_DB_PASSWORD is required}"

script_dir="$(cd "$(dirname "$0")" && pwd)"

POSTGRES_USER="$PGUSER" POSTGRES_DB="$PGDATABASE" APP_DB_PASSWORD="$APP_DB_PASSWORD" \
  sh "$script_dir/init/000-create-app-role.sh"

psql -X -v ON_ERROR_STOP=1 -f "$script_dir/init/001-economy-core.sql"

ln -sfn "$script_dir/migrations" /tmp/migrations
sh "$script_dir/migrate.sh"
```

`migrate.sh` reads from the absolute path `/migrations` because it runs inside a container in production. The symlink lets the same unmodified script run in CI — the alternative is editing `migrate.sh`, which would change its checksum discipline.

```bash
chmod +x packages/database/ci-apply.sh
```

- [ ] **Step 6: Write the local development compose file and README**

`packages/database/compose.yml` — adapted from `ORIGINAL/test/docker-compose.yml` for the new paths:

```yaml
name: woldeok-moneyverse-dev

services:
  db:
    image: postgres:17.5-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: moneyverse_migrator
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?required}
      POSTGRES_DB: ${DB_NAME:-woldeok_moneyverse_dev}
      APP_DB_PASSWORD: ${APP_DB_PASSWORD:?required}
    ports:
      - '5433:5432'
    volumes:
      - moneyverse-dev-db:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U moneyverse_migrator -d ${DB_NAME:-woldeok_moneyverse_dev}']
      interval: 5s
      timeout: 5s
      retries: 20

  migrate:
    image: postgres:17.5-alpine
    restart: 'no'
    environment:
      PGHOST: db
      PGPORT: 5432
      PGUSER: moneyverse_migrator
      PGPASSWORD: ${POSTGRES_PASSWORD:?required}
      PGDATABASE: ${DB_NAME:-woldeok_moneyverse_dev}
    volumes:
      - ./migrations:/migrations:ro
      - ./migrate.sh:/usr/local/bin/migrate.sh:ro
    entrypoint: ['/bin/sh', '/usr/local/bin/migrate.sh']
    depends_on:
      db:
        condition: service_healthy

volumes:
  moneyverse-dev-db:
```

`packages/database/.env.example`:

```
POSTGRES_PASSWORD=CHANGE_ME
APP_DB_PASSWORD=CHANGE_ME
DB_NAME=woldeok_moneyverse_dev
```

`packages/database/README.md`:

````markdown
# Database

The schema is owned by the numbered SQL files in `migrations/`. Prisma
introspects it and never migrates it.

## Why the functions matter

The application connects as `moneyverse_app`. That role has no `UPDATE` on
`account_balances`, no `DELETE` on `audit_logs`, and no DML at all on
`user_restrictions`, `minecraft_operations`, `admin_action_policies`,
`virtual_bank_loans`, `virtual_business_ownerships`,
`virtual_stock_corporate_actions` or `work_reward_policy`. It holds `EXECUTE`
on the `SECURITY DEFINER` functions instead.

A full application compromise therefore still cannot move money or rewrite the
audit trail. Do not grant the role table-level DML to make a query easier.

## Rules

- Add the next number. Never renumber, never edit an applied migration —
  `migrate.sh` compares a `sha256` and refuses a changed file.
- Every `SECURITY DEFINER` function pins `search_path`.
- Idempotency-key handling takes the lock *before* the replay check and
  verifies the replayed row belongs to the caller. Copy `shop_purchase`,
  `economy_claim_daily`, `economy_claim_work`, `021-work-reward.sql` or
  `044-member-board.sql`. If your version resembles none of them, you have
  misread one.

## Local development

Requires a container runtime, which the current development machine does not
have. Where one is available:

```bash
cp .env.example .env      # set real passwords
docker compose up -d
```

Without one, database-backed tests skip locally and run in CI, which has a
PostgreSQL service.
````

- [ ] **Step 7: Verify CI's database step works locally as far as it can**

Run: `sh -n packages/database/ci-apply.sh && sh -n packages/database/migrate.sh`
Expected: both exit 0 — shell syntax is valid. Execution needs a server, which this machine lacks; say so rather than claiming the scripts ran.

- [ ] **Step 8: Commit**

```bash
git add packages/database
git commit -m "feat(database): port the schema, migrations and role grants unchanged

The SQL is copied byte-for-byte from the original repository. A parity test
compares sha256 digests against that checkout, and a second test asserts every
SECURITY DEFINER function still pins search_path."
```

---

### Task 4: Backend scaffold with validated configuration

**Files:**
- Create: `backend/package.json`, `backend/tsconfig.json`, `backend/vitest.config.ts`, `backend/nest-cli.json`
- Create: `backend/src/main.ts`, `backend/src/app.module.ts`
- Create: `backend/src/core/core.module.ts`, `backend/src/core/config.ts`
- Create: `backend/src/health/health.module.ts`, `backend/src/health/health.controller.ts`
- Test: `backend/src/core/config.test.ts`

**Interfaces:**
- Consumes: `@moneyverse/contract` from Task 2
- Produces: `AppConfig` type and `loadConfig(env: NodeJS.ProcessEnv): AppConfig` with fields `port`, `baseUrl`, `databaseUrl`, `production`, `cookieSecure`, `adsEnabled`, `seoIndexingEnabled`, `trustProxyForwardedFor`, `internalToken`, `oauth.discord`, `oauth.google`, `discordInteractions`; the DI token `CONFIG`; `CoreModule` exporting it.

- [ ] **Step 1: Create the package manifest and configuration**

`backend/package.json`:

```json
{
  "name": "@moneyverse/backend",
  "version": "0.0.0",
  "private": true,
  "type": "commonjs",
  "scripts": {
    "build": "nest build",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "start": "node dist/main.js",
    "dev": "nest start --watch"
  },
  "dependencies": {
    "@moneyverse/contract": "workspace:*",
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/swagger": "^11.0.0",
    "@nestjs/throttler": "^6.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "pg": "^8.16.3",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/node": "^20.19.9",
    "@types/pg": "^8.15.4",
    "@types/supertest": "^6.0.0",
    "supertest": "^7.0.0",
    "typescript": "^5.9.0",
    "unplugin-swc": "^1.5.0",
    "vitest": "^3.0.0"
  }
}
```

`backend/tsconfig.json`:

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "types": ["node"],
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts"]
}
```

`backend/nest-cli.json`:

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true }
}
```

`backend/vitest.config.ts` — `unplugin-swc` is required, not optional. Vitest's default esbuild transform does not emit the `design:type` metadata Nest's dependency injection reads, so without it every constructor injection fails at runtime:

```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    include: ['src/**/*.test.ts'],
    globals: false,
    maxWorkers: 2,
    minWorkers: 1,
  },
});
```

- [ ] **Step 2: Write the failing configuration test**

`backend/src/core/config.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { loadConfig } from './config';

const MINIMAL = {
  APP_BASE_URL: 'http://127.0.0.1:3000',
  INTERNAL_API_TOKEN: 'x'.repeat(32),
} satisfies NodeJS.ProcessEnv;

describe('loadConfig', () => {
  it('defaults the port to 3000', () => {
    expect(loadConfig({ ...MINIMAL }).port).toBe(3000);
  });

  it('accepts plain HTTP for a loopback base URL', () => {
    expect(loadConfig({ ...MINIMAL }).baseUrl).toBe('http://127.0.0.1:3000/');
  });

  it('rejects plain HTTP for a non-loopback base URL', () => {
    expect(() => loadConfig({ ...MINIMAL, APP_BASE_URL: 'http://example.com' })).toThrow(
      /absolute HTTPS URL/,
    );
  });

  it('rejects a base URL carrying credentials', () => {
    expect(() => loadConfig({ ...MINIMAL, APP_BASE_URL: 'https://a:b@example.com' })).toThrow(
      /absolute HTTPS URL/,
    );
  });

  it('rejects a base URL carrying a query string', () => {
    expect(() => loadConfig({ ...MINIMAL, APP_BASE_URL: 'https://example.com/?a=1' })).toThrow(
      /absolute HTTPS URL/,
    );
  });

  it('requires an internal API token of at least 32 characters', () => {
    expect(() => loadConfig({ ...MINIMAL, INTERNAL_API_TOKEN: 'short' })).toThrow(
      /INTERNAL_API_TOKEN/,
    );
  });

  it('defaults cookieSecure to the production flag', () => {
    expect(loadConfig({ ...MINIMAL, NODE_ENV: 'production', APP_BASE_URL: 'https://example.com' }).cookieSecure).toBe(true);
    expect(loadConfig({ ...MINIMAL }).cookieSecure).toBe(false);
  });

  it('keeps SEO indexing opt-in', () => {
    expect(loadConfig({ ...MINIMAL }).seoIndexingEnabled).toBe(false);
    expect(loadConfig({ ...MINIMAL, SEO_INDEXING_ENABLED: 'true' }).seoIndexingEnabled).toBe(true);
  });

  it('keeps proxy header trust opt-in', () => {
    expect(loadConfig({ ...MINIMAL }).trustProxyForwardedFor).toBe(false);
  });

  it('disables an OAuth provider whose callback is not same-origin', () => {
    const config = loadConfig({
      ...MINIMAL,
      DISCORD_CLIENT_ID: 'id',
      DISCORD_CLIENT_SECRET: 'secret',
      DISCORD_REDIRECT_URI: 'https://elsewhere.example/auth/discord/callback',
    });
    expect(config.oauth.discord.enabled).toBe(false);
  });

  it('enables an OAuth provider with a complete same-origin configuration', () => {
    const config = loadConfig({
      ...MINIMAL,
      DISCORD_CLIENT_ID: 'id',
      DISCORD_CLIENT_SECRET: 'secret',
      DISCORD_REDIRECT_URI: 'http://127.0.0.1:3000/auth/discord/callback',
    });
    expect(config.oauth.discord.enabled).toBe(true);
  });

  it('keeps Discord interactions disabled in production', () => {
    const config = loadConfig({
      ...MINIMAL,
      NODE_ENV: 'production',
      APP_BASE_URL: 'https://example.com',
      DISCORD_INTERACTIONS_ENABLED: 'true',
      DISCORD_INTERACTIONS_PUBLIC_KEY: 'a'.repeat(64),
      DISCORD_INTERACTIONS_GUILD_ID: '1234567890123456',
      DISCORD_INTERACTIONS_ROLE_IDS: '1234567890123456',
    });
    expect(config.discordInteractions.enabled).toBe(false);
  });
});
```

The last three assertions encode security decisions from the original, not preferences. An OAuth provider whose callback points off-origin is a redirect the application does not control. Discord interactions stay off in production because the bundled rate limiter is process-local and the endpoint is public by Discord's design.

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm --filter @moneyverse/backend test`
Expected: FAIL — cannot resolve `./config`.

- [ ] **Step 4: Implement the configuration loader**

`backend/src/core/config.ts` — the URL, OAuth and Discord-interaction rules are ported from `ORIGINAL/src/config.ts`; `internalToken` is new and belongs to the Next-to-NestJS boundary:

```ts
const LOCAL_HTTP_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);
const DISCORD_PUBLIC_KEY = /^[0-9a-f]{64}$/i;
const DISCORD_SNOWFLAKE = /^\d{16,22}$/;

export interface OAuthProviderConfig {
  readonly enabled: boolean;
  readonly clientId?: string;
  readonly clientSecret?: string;
  readonly redirectUri?: string;
}

export interface DiscordInteractionsPolicy {
  readonly guilds: Record<string, { readonly requiredRoleIds: string[]; readonly roleMode: 'any' | 'all' }>;
}

export interface DiscordInteractionsConfig {
  readonly enabled: boolean;
  readonly publicKey?: string;
  readonly policy?: DiscordInteractionsPolicy;
  readonly rateLimit?: { readonly limit: number; readonly windowMs: number; readonly maxEntries: number };
}

export interface AppConfig {
  readonly port: number;
  readonly baseUrl: string;
  readonly databaseUrl: string | undefined;
  readonly production: boolean;
  readonly cookieSecure: boolean;
  readonly adsEnabled: boolean;
  readonly seoIndexingEnabled: boolean;
  readonly trustProxyForwardedFor: boolean;
  readonly internalToken: string;
  readonly oauth: { readonly discord: OAuthProviderConfig; readonly google: OAuthProviderConfig };
  readonly discordInteractions: DiscordInteractionsConfig;
}

export const CONFIG = Symbol('CONFIG');

function parseUrl(value: string, name: string): URL {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    if (url.username || url.password || url.search || url.hash) throw new Error();
    if (url.protocol === 'http:' && !LOCAL_HTTP_HOSTS.has(url.hostname)) throw new Error();
    return url;
  } catch {
    throw new Error(`${name} must be an absolute HTTPS URL (HTTP is allowed only for localhost)`);
  }
}

function oauthProvider(options: {
  readonly clientId: string | undefined;
  readonly clientSecret: string | undefined;
  readonly redirectUri: string | undefined;
  readonly name: string;
  readonly baseUrl: string;
  readonly callbackPath: string;
}): OAuthProviderConfig {
  const { clientId, clientSecret, redirectUri, name, baseUrl, callbackPath } = options;
  if (!clientId || !clientSecret || !redirectUri) return { enabled: false };
  const callbackUrl = parseUrl(redirectUri, `${name} redirect URI`);
  const applicationUrl = new URL(baseUrl);
  if (callbackUrl.origin !== applicationUrl.origin) return { enabled: false };
  if (callbackUrl.pathname !== callbackPath) return { enabled: false };
  return { enabled: true, clientId, clientSecret, redirectUri: callbackUrl.toString() };
}

function discordInteractions(env: NodeJS.ProcessEnv, production: boolean): DiscordInteractionsConfig {
  // The bundled limiter is intentionally single-process only. Keep the public
  // endpoint unavailable in production until a shared, atomic limiter is
  // provided and reviewed; test deployments may opt in with exact IDs.
  if (env.DISCORD_INTERACTIONS_ENABLED !== 'true' || production) return { enabled: false };

  const publicKey = env.DISCORD_INTERACTIONS_PUBLIC_KEY;
  const guildId = env.DISCORD_INTERACTIONS_GUILD_ID;
  const roleIds = String(env.DISCORD_INTERACTIONS_ROLE_IDS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const roleMode = env.DISCORD_INTERACTIONS_ROLE_MODE ?? 'any';

  if (
    publicKey === undefined ||
    !DISCORD_PUBLIC_KEY.test(publicKey) ||
    guildId === undefined ||
    !DISCORD_SNOWFLAKE.test(guildId) ||
    roleIds.length < 1 ||
    roleIds.length > 100 ||
    new Set(roleIds).size !== roleIds.length ||
    roleIds.some((roleId) => !DISCORD_SNOWFLAKE.test(roleId)) ||
    (roleMode !== 'any' && roleMode !== 'all')
  ) {
    return { enabled: false };
  }

  return {
    enabled: true,
    publicKey,
    policy: { guilds: { [guildId]: { requiredRoleIds: roleIds, roleMode } } },
    // Deliberately fixed. Production requires a separate shared limiter
    // rather than an environment switch that weakens limits.
    rateLimit: { limit: 5, windowMs: 10_000, maxEntries: 10_000 },
  };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const production = env.NODE_ENV === 'production';
  const baseUrl = parseUrl(env.APP_BASE_URL ?? 'http://127.0.0.1:3000', 'APP_BASE_URL').toString();

  const internalToken = env.INTERNAL_API_TOKEN ?? '';
  if (internalToken.length < 32) {
    throw new Error('INTERNAL_API_TOKEN must be at least 32 characters');
  }

  return {
    port: Number(env.PORT ?? 3000),
    baseUrl,
    databaseUrl: env.DATABASE_URL,
    production,
    cookieSecure: env.COOKIE_SECURE === undefined ? production : env.COOKIE_SECURE === 'true',
    adsEnabled: env.ADS_ENABLED === 'true',
    // Public indexing stays opt-in. A test URL or a newly connected domain
    // must not become searchable until its canonical host is reviewed.
    seoIndexingEnabled: env.SEO_INDEXING_ENABLED === 'true',
    // Enable only when the last reverse proxy removes client-supplied
    // X-Forwarded-For values and writes its own trusted value.
    trustProxyForwardedFor: env.TRUST_PROXY_X_FORWARDED_FOR === 'true',
    internalToken,
    oauth: {
      discord: oauthProvider({
        name: 'Discord',
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
        redirectUri: env.DISCORD_REDIRECT_URI,
        baseUrl,
        callbackPath: '/auth/discord/callback',
      }),
      google: oauthProvider({
        name: 'Google',
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectUri: env.GOOGLE_REDIRECT_URI,
        baseUrl,
        callbackPath: '/auth/google/callback',
      }),
    },
    discordInteractions: discordInteractions(env, production),
  };
}
```

The OAuth callback paths stay `/auth/{provider}/callback` here because that is the shape the redesigned public routes use (spec §4.6) — the provider path segment is what changes at the Next.js edge, not this contract.

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @moneyverse/backend test`
Expected: PASS — 12 tests.

- [ ] **Step 6: Wire the module graph and a health endpoint**

`backend/src/core/core.module.ts`:

```ts
import { Global, Module } from '@nestjs/common';
import { CONFIG, loadConfig } from './config';

@Global()
@Module({
  providers: [{ provide: CONFIG, useFactory: () => loadConfig(process.env) }],
  exports: [CONFIG],
})
export class CoreModule {}
```

`backend/src/health/health.controller.ts`:

```ts
import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
```

`backend/src/health/health.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({ controllers: [HealthController] })
export class HealthModule {}
```

`backend/src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { HealthModule } from './health/health.module';

@Module({ imports: [CoreModule, HealthModule] })
export class AppModule {}
```

`backend/src/main.ts`:

```ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadConfig } from './core/config';

async function bootstrap(): Promise<void> {
  const config = loadConfig(process.env);
  const app = await NestFactory.create(AppModule);
  await app.listen(config.port, process.env.HOST ?? '127.0.0.1');
}

void bootstrap();
```

The default bind address is loopback, not `0.0.0.0`. NestJS is an internal service; binding it to every interface by default is how an "internal" service becomes reachable.

- [ ] **Step 7: Verify the application boots**

Run:

```bash
INTERNAL_API_TOKEN=$(head -c 32 /dev/zero | tr '\0' 'x') pnpm --filter @moneyverse/backend build
```

Expected: build succeeds, `backend/dist/main.js` exists.

- [ ] **Step 8: Commit**

```bash
git add backend
git commit -m "feat(backend): scaffold the NestJS application with validated configuration

Ports the original config rules: a base URL must be HTTPS unless it is
loopback, an OAuth provider is enabled only with a complete same-origin
callback, and Discord interactions stay disabled in production because the
bundled rate limiter is process-local."
```

---

### Task 5: Database access layer

**Files:**
- Create: `backend/src/core/db.ts`, `backend/src/core/pool.provider.ts`
- Modify: `backend/src/core/core.module.ts`
- Test: `backend/src/core/db.test.ts`

**Interfaces:**
- Consumes: `CONFIG` from Task 4
- Produces: `Queryable` interface with `query<R>(text, values?)`; `queryRows<R>(db, text, values?): Promise<R[]>`; `queryOne<R>(db, text, values?): Promise<R | null>`; DI token `PG_POOL` resolving to `Pool | null`.

- [ ] **Step 1: Write the failing test**

`backend/src/core/db.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Queryable } from './db';
import { queryOne, queryRows } from './db';

function stubQueryable(rows: Record<string, unknown>[]): Queryable & { calls: unknown[][] } {
  const calls: unknown[][] = [];
  return {
    calls,
    async query(text: string, values?: readonly unknown[]) {
      calls.push([text, values]);
      return { rows: rows as never[] };
    },
  };
}

describe('queryRows', () => {
  it('returns every row', async () => {
    const db = stubQueryable([{ id: 'a' }, { id: 'b' }]);
    await expect(queryRows(db, 'SELECT 1')).resolves.toEqual([{ id: 'a' }, { id: 'b' }]);
  });

  it('passes an empty parameter list when none is given', async () => {
    const db = stubQueryable([]);
    await queryRows(db, 'SELECT 1');
    expect(db.calls[0]).toEqual(['SELECT 1', []]);
  });
});

describe('queryOne', () => {
  it('returns the first row', async () => {
    const db = stubQueryable([{ id: 'a' }, { id: 'b' }]);
    await expect(queryOne(db, 'SELECT 1')).resolves.toEqual({ id: 'a' });
  });

  it('returns null for an empty result rather than undefined', async () => {
    const db = stubQueryable([]);
    await expect(queryOne(db, 'SELECT 1')).resolves.toBeNull();
  });
});
```

`queryOne` returning `null` and never `undefined` matters: `exactOptionalPropertyTypes` is on, and callers distinguish "no row" from "not supplied".

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @moneyverse/backend test src/core/db.test.ts`
Expected: FAIL — cannot resolve `./db`.

- [ ] **Step 3: Port the implementation from the original**

`backend/src/core/db.ts` — copied from `ORIGINAL/src/types/db.ts`:

```ts
import type { QueryResultRow } from 'pg';

/**
 * The part of a pg `QueryResult` every consumer in this codebase actually
 * reads. No repository or service inspects `command`, `rowCount`, `oid`, or
 * `fields`, so `Queryable` only demands `rows` — a real pg `Pool`/`PoolClient`
 * still satisfies this structurally, since its `QueryResult` is a superset.
 */
export interface QueryResultLike<R extends QueryResultRow> {
  rows: R[];
}

/**
 * The subset of a pg Pool or PoolClient the repositories use. Narrowing to
 * this makes the test doubles typeable without importing pg into them.
 */
export interface Queryable {
  query<R extends QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<QueryResultLike<R>>;
}

/**
 * Row types are assertions about the schema, not proofs. Each repository
 * annotates its row interfaces with the migration that defines the columns.
 */
export async function queryRows<R extends QueryResultRow>(
  db: Queryable,
  text: string,
  values: readonly unknown[] = [],
): Promise<R[]> {
  const result = await db.query<R>(text, values);
  return result.rows;
}

export async function queryOne<R extends QueryResultRow>(
  db: Queryable,
  text: string,
  values: readonly unknown[] = [],
): Promise<R | null> {
  const rows = await queryRows<R>(db, text, values);
  return rows[0] ?? null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @moneyverse/backend test src/core/db.test.ts`
Expected: PASS — 4 tests.

- [ ] **Step 5: Add the pool provider**

`backend/src/core/pool.provider.ts`:

```ts
import type { Provider } from '@nestjs/common';
import { Pool } from 'pg';
import type { AppConfig } from './config';
import { CONFIG } from './config';

export const PG_POOL = Symbol('PG_POOL');

/**
 * Null when no DATABASE_URL is configured. Every service that depends on the
 * database checks for null and reports itself unavailable rather than
 * inventing data — the original application答s public pages stay readable with
 * the store offline, and its APIs answer 503.
 */
export const poolProvider: Provider = {
  provide: PG_POOL,
  inject: [CONFIG],
  useFactory: (config: AppConfig): Pool | null =>
    config.databaseUrl ? new Pool({ connectionString: config.databaseUrl }) : null,
};
```

Correct the stray character in that comment before saving: it should read "the original application's public pages". Comments are English; verify no non-ASCII slipped in with `grep -nP '[^\x00-\x7f]' backend/src/core/pool.provider.ts`, which must print nothing.

Modify `backend/src/core/core.module.ts` to register it:

```ts
import { Global, Module } from '@nestjs/common';
import { CONFIG, loadConfig } from './config';
import { PG_POOL, poolProvider } from './pool.provider';

@Global()
@Module({
  providers: [{ provide: CONFIG, useFactory: () => loadConfig(process.env) }, poolProvider],
  exports: [CONFIG, PG_POOL],
})
export class CoreModule {}
```

- [ ] **Step 6: Verify types and the ASCII check**

Run:

```bash
pnpm --filter @moneyverse/backend typecheck
grep -nP '[^\x00-\x7f]' backend/src/core/*.ts && echo 'NON-ASCII IN SOURCE' && exit 1
grep -nP '[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]' backend/src/core/*.ts && echo 'CONTROL BYTE' && exit 1
echo 'clean'
```

Expected: zero type errors, `clean` printed.

- [ ] **Step 7: Commit**

```bash
git add backend/src/core
git commit -m "feat(backend): add the pg query helpers and pool provider"
```

---

### Task 6: Session cryptography and repository

**Files:**
- Create: `backend/src/auth/crypto.ts`, `backend/src/auth/session.repository.ts`
- Test: `backend/src/auth/crypto.test.ts`, `backend/src/auth/session.repository.test.ts`

**Interfaces:**
- Consumes: `Queryable`, `queryOne` from Task 5
- Produces: `sha256(value: string): string`, `randomToken(): string`, `pkceChallenge(verifier: string): string`, `createOAuthChallenge(provider, redirectUri): OAuthChallenge`, `authorizationUrl(provider, challenge, clientId): string`; class `SessionRepository` with `create`, `get`, `rotateCsrf`, `verifyCsrf`, `currentConsentVersion`, `grantPreloginConsent`, `hasCurrentPreloginConsent`, `hasCurrentUserConsent`, `createChallenge`, `consumeChallenge`, `completeOAuthLogin`, `markReauthenticated`, `hasRecentReauthentication`, `revoke`; interfaces `Session`, `AuthSessionRow`, `CreatedSession`, `OAuthChallenge`.

- [ ] **Step 1: Write the failing crypto test**

`backend/src/auth/crypto.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { authorizationUrl, createOAuthChallenge, pkceChallenge, randomToken, sha256 } from './crypto';

describe('sha256', () => {
  it('produces a stable lowercase hex digest', () => {
    expect(sha256('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});

describe('randomToken', () => {
  it('produces a base64url token long enough for the session length checks', () => {
    const token = randomToken();
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('does not repeat', () => {
    expect(randomToken()).not.toBe(randomToken());
  });
});

describe('pkceChallenge', () => {
  it('is the base64url SHA-256 of the verifier', () => {
    expect(pkceChallenge('verifier')).toBe('OK6ofX_2h9L4qFcxYNTU7Ae4NNhO_2ZgqjnQCkVtCFo');
  });
});

describe('createOAuthChallenge', () => {
  it('hashes the state and nonce rather than storing them in the clear', () => {
    const challenge = createOAuthChallenge('discord', 'https://example.com/auth/discord/callback');
    expect(challenge.stateHash).toBe(sha256(challenge.state));
    expect(challenge.nonceHash).toBe(sha256(challenge.nonce));
  });

  it('derives the code challenge from the verifier', () => {
    const challenge = createOAuthChallenge('google', 'https://example.com/auth/google/callback');
    expect(challenge.codeChallenge).toBe(pkceChallenge(challenge.codeVerifier));
  });
});

describe('authorizationUrl', () => {
  it('requests S256 PKCE from Discord with the identify scope', () => {
    const challenge = createOAuthChallenge('discord', 'https://example.com/auth/discord/callback');
    const url = new URL(authorizationUrl('discord', challenge, 'client-id'));
    expect(url.origin + url.pathname).toBe('https://discord.com/oauth2/authorize');
    expect(url.searchParams.get('scope')).toBe('identify');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('nonce')).toBeNull();
  });

  it('sends a nonce to Google and requests openid profile', () => {
    const challenge = createOAuthChallenge('google', 'https://example.com/auth/google/callback');
    const url = new URL(authorizationUrl('google', challenge, 'client-id'));
    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url.searchParams.get('scope')).toBe('openid profile');
    expect(url.searchParams.get('nonce')).toBe(challenge.nonce);
  });
});
```

The `pkceChallenge('verifier')` expectation is a fixed vector: if the digest encoding ever silently changes from base64url to base64, this test is what catches it.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @moneyverse/backend test src/auth/crypto.test.ts`
Expected: FAIL — cannot resolve `./crypto`.

- [ ] **Step 3: Port the crypto module from the original**

`backend/src/auth/crypto.ts` — copied from `ORIGINAL/src/auth/oauth.ts`, reformatted to the project's Prettier width without changing behaviour:

```ts
import { createHash, randomBytes } from 'node:crypto';

export type OAuthProvider = 'discord' | 'google';

const base64url = (value: Buffer): string => value.toString('base64url');

export const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

export const randomToken = (): string => base64url(randomBytes(32));

export const pkceChallenge = (verifier: string): string =>
  createHash('sha256').update(verifier).digest('base64url');

export interface OAuthChallenge {
  readonly provider: OAuthProvider;
  readonly state: string;
  readonly stateHash: string;
  readonly codeVerifier: string;
  readonly codeChallenge: string;
  readonly nonce: string;
  readonly nonceHash: string;
  readonly redirectUri: string;
}

export function createOAuthChallenge(
  provider: OAuthProvider,
  redirectUri: string,
): OAuthChallenge {
  const state = randomToken();
  const verifier = randomToken();
  const nonce = randomToken();
  return {
    provider,
    state,
    stateHash: sha256(state),
    codeVerifier: verifier,
    codeChallenge: pkceChallenge(verifier),
    nonce,
    nonceHash: sha256(nonce),
    redirectUri,
  };
}

export function authorizationUrl(
  provider: OAuthProvider,
  challenge: OAuthChallenge,
  clientId: string,
): string {
  const endpoint =
    provider === 'discord'
      ? 'https://discord.com/oauth2/authorize'
      : 'https://accounts.google.com/o/oauth2/v2/auth';
  const scope = provider === 'discord' ? 'identify' : 'openid profile';
  const url = new URL(endpoint);
  const parameters = {
    client_id: clientId,
    response_type: 'code',
    redirect_uri: challenge.redirectUri,
    scope,
    state: challenge.state,
    code_challenge: challenge.codeChallenge,
    code_challenge_method: 'S256',
  };
  for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
  if (provider === 'google') url.searchParams.set('nonce', challenge.nonce);
  return url.toString();
}
```

- [ ] **Step 4: Run the crypto test to verify it passes**

Run: `pnpm --filter @moneyverse/backend test src/auth/crypto.test.ts`
Expected: PASS — 8 tests.

- [ ] **Step 5: Write the failing session repository test**

`backend/src/auth/session.repository.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Queryable } from '../core/db';
import { sha256 } from './crypto';
import { SessionRepository } from './session.repository';

interface RecordedQuery {
  readonly text: string;
  readonly values: readonly unknown[] | undefined;
}

function recordingPool(rowsFor: (text: string) => Record<string, unknown>[]): {
  pool: Queryable;
  queries: RecordedQuery[];
} {
  const queries: RecordedQuery[] = [];
  const pool: Queryable = {
    async query(text: string, values?: readonly unknown[]) {
      queries.push({ text, values });
      return { rows: rowsFor(text) as never[] };
    },
  };
  return { pool, queries };
}

describe('SessionRepository.create', () => {
  it('stores only hashes and returns the clear tokens once', async () => {
    const { pool, queries } = recordingPool(() => [
      { id: 'session-id', user_id: null, expires_at: new Date(0) },
    ]);
    const created = await new SessionRepository(pool).create();

    expect(created.token).not.toBe(created.csrfToken);
    const values = queries[0]?.values ?? [];
    expect(values).toContain(sha256(created.token));
    expect(values).toContain(sha256(created.csrfToken));
    expect(values).not.toContain(created.token);
    expect(values).not.toContain(created.csrfToken);
  });

  it('fails loudly when the insert returns no row', async () => {
    const { pool } = recordingPool(() => []);
    await expect(new SessionRepository(pool).create()).rejects.toThrow('session was not created');
  });
});

describe('SessionRepository.get', () => {
  it('rejects a token shorter than 32 characters without querying', async () => {
    const { pool, queries } = recordingPool(() => [{ id: 'x' }]);
    await expect(new SessionRepository(pool).get('short')).resolves.toBeNull();
    expect(queries).toHaveLength(0);
  });

  it('rejects a token longer than 512 characters without querying', async () => {
    const { pool, queries } = recordingPool(() => [{ id: 'x' }]);
    await expect(new SessionRepository(pool).get('x'.repeat(513))).resolves.toBeNull();
    expect(queries).toHaveLength(0);
  });

  it('rejects a non-string token without querying', async () => {
    const { pool, queries } = recordingPool(() => [{ id: 'x' }]);
    await expect(new SessionRepository(pool).get(42)).resolves.toBeNull();
    expect(queries).toHaveLength(0);
  });

  it('looks the session up by token hash, never by the token', async () => {
    const token = 'y'.repeat(64);
    const { pool, queries } = recordingPool(() => [{ id: 'session-id', user_id: null }]);
    await new SessionRepository(pool).get(token);
    expect(queries[0]?.values).toEqual([sha256(token)]);
  });

  it('excludes revoked and expired sessions in the query itself', async () => {
    const { pool, queries } = recordingPool(() => []);
    await new SessionRepository(pool).get('y'.repeat(64));
    expect(queries[0]?.text).toMatch(/revoked_at IS NULL/);
    expect(queries[0]?.text).toMatch(/expires_at>now\(\)/);
  });
});

describe('SessionRepository.verifyCsrf', () => {
  it('rejects a malformed CSRF token without querying', async () => {
    const { pool, queries } = recordingPool(() => [{ id: 'x' }]);
    await expect(new SessionRepository(pool).verifyCsrf('session-id', 'short')).resolves.toBe(false);
    expect(queries).toHaveLength(0);
  });

  it('compares the hash of the presented token', async () => {
    const csrfToken = 'z'.repeat(64);
    const { pool, queries } = recordingPool(() => [{ id: 'session-id' }]);
    await expect(new SessionRepository(pool).verifyCsrf('session-id', csrfToken)).resolves.toBe(true);
    expect(queries[0]?.values).toEqual(['session-id', sha256(csrfToken)]);
  });

  it('returns false when no row matches', async () => {
    const { pool } = recordingPool(() => []);
    await expect(
      new SessionRepository(pool).verifyCsrf('session-id', 'z'.repeat(64)),
    ).resolves.toBe(false);
  });
});

describe('SessionRepository.grantPreloginConsent', () => {
  const complete = {
    termsCompleted: true,
    privacyCompleted: true,
    ageConfirmed: true,
    termsVersion: '2026-01-01',
    privacyVersion: '2026-01-01',
  };

  it('requires every acknowledgement flag', async () => {
    const { pool } = recordingPool(() => [{ id: 'session-id' }]);
    const repository = new SessionRepository(pool);
    for (const missing of ['termsCompleted', 'privacyCompleted', 'ageConfirmed'] as const) {
      await expect(
        repository.grantPreloginConsent('session-id', { ...complete, [missing]: false }),
      ).rejects.toThrow(/acknowledgement and age confirmation/);
    }
  });

  it('requires both policy version strings', async () => {
    const { pool } = recordingPool(() => [{ id: 'session-id' }]);
    await expect(
      new SessionRepository(pool).grantPreloginConsent('session-id', {
        ...complete,
        termsVersion: undefined,
      }),
    ).rejects.toThrow(/policy version acknowledgement required/);
  });

  it('rejects a non-object acknowledgement', async () => {
    const { pool } = recordingPool(() => [{ id: 'session-id' }]);
    await expect(new SessionRepository(pool).grantPreloginConsent('session-id', null)).rejects.toThrow();
  });
});

describe('SessionRepository.hasCurrentUserConsent', () => {
  it('delegates to the database function rather than reimplementing the rule', async () => {
    const { pool, queries } = recordingPool(() => [{ has_current_consent: true }]);
    await expect(new SessionRepository(pool).hasCurrentUserConsent('session-id')).resolves.toBe(true);
    expect(queries[0]?.text).toContain('public.auth_session_has_current_consent');
  });

  it('is false when the function returns anything other than true', async () => {
    const { pool } = recordingPool(() => [{ has_current_consent: null }]);
    await expect(new SessionRepository(pool).hasCurrentUserConsent('session-id')).resolves.toBe(false);
  });
});

describe('SessionRepository.hasRecentReauthentication', () => {
  it('defaults the window to 900 seconds', async () => {
    const { pool, queries } = recordingPool(() => [{ recent: true }]);
    await new SessionRepository(pool).hasRecentReauthentication('session-id');
    expect(queries[0]?.values).toEqual(['session-id', 900]);
  });
});

describe('SessionRepository.createChallenge', () => {
  it('rejects an unknown challenge purpose', async () => {
    const { pool } = recordingPool(() => []);
    const challenge = {
      provider: 'discord' as const,
      state: 's',
      stateHash: 'sh',
      codeVerifier: 'v',
      codeChallenge: 'c',
      nonce: 'n',
      nonceHash: 'nh',
      redirectUri: 'https://example.com/auth/discord/callback',
    };
    await expect(
      new SessionRepository(pool).createChallenge('session-id', challenge, 'elevate'),
    ).rejects.toThrow(TypeError);
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `pnpm --filter @moneyverse/backend test src/auth/session.repository.test.ts`
Expected: FAIL — cannot resolve `./session.repository`.

- [ ] **Step 7: Port the session repository from the original**

Copy `ORIGINAL/src/auth/session-repository.ts` to `backend/src/auth/session.repository.ts`. Apply exactly these changes and no others:

1. Import `Queryable` and `queryOne` from `../core/db` instead of `../types/db.js`.
2. Import `randomToken` and `sha256` from `./crypto` instead of `./oauth.js`.
3. Drop the `.js` suffixes from relative import specifiers — this project compiles to CommonJS, not `nodenext`, so the extensionless form is correct here. (In the original, rewriting those specifiers broke the build; that rule belongs to the original's module setting, not to this one.)
4. Re-import `OAuthChallenge` as a type from `./crypto`, replacing the original's comment about that module not yet being converted.
5. Add `@Injectable()` from `@nestjs/common` on the class, and keep the constructor taking `Queryable`.
6. Reformat to Prettier's 100-column width.

Keep every SQL string, every length check, every `interval '8 hours'`, and the snake_case row property names (`user_id`, `token_hash`, `csrf_hash`) exactly as they are. The row names come straight from `auth_sessions` and test doubles across the suite produce them under those names.

- [ ] **Step 8: Run the test to verify it passes**

Run: `pnpm --filter @moneyverse/backend test src/auth`
Expected: PASS — 8 crypto tests plus 15 repository tests.

- [ ] **Step 9: Commit**

```bash
git add backend/src/auth
git commit -m "feat(backend): port session cryptography and the session repository

Session and CSRF tokens are stored only as SHA-256 hashes; consent and
step-up reauthentication questions are delegated to the database functions
rather than reimplemented in TypeScript."
```

---

### Task 7: Session cookie handling

**Files:**
- Create: `backend/src/auth/cookies.ts`
- Test: `backend/src/auth/cookies.test.ts`

**Interfaces:**
- Consumes: `AppConfig` from Task 4
- Produces: `AUTH_COOKIE`, `HOST_PREFIXED_AUTH_COOKIE`, `SESSION_MAX_AGE`, `authCookieName(config)`, `parseCookies(header: string | undefined)`, `sessionToken(headers, config)`, `sessionCookie(token, config)`, `clearSessionCookie(config)`.

- [ ] **Step 1: Write the failing test**

`backend/src/auth/cookies.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  AUTH_COOKIE,
  HOST_PREFIXED_AUTH_COOKIE,
  authCookieName,
  clearSessionCookie,
  parseCookies,
  sessionCookie,
  sessionToken,
} from './cookies';

const SECURE = { cookieSecure: true } as const;
const INSECURE = { cookieSecure: false } as const;

describe('authCookieName', () => {
  it('uses the __Host- prefix only when the cookie will carry Secure', () => {
    expect(authCookieName(SECURE)).toBe(HOST_PREFIXED_AUTH_COOKIE);
    expect(authCookieName(INSECURE)).toBe(AUTH_COOKIE);
  });
});

describe('parseCookies', () => {
  it('parses multiple cookies', () => {
    expect(parseCookies('a=1; b=2')).toEqual({ a: '1', b: '2' });
  });

  it('decodes percent-encoded values', () => {
    expect(parseCookies('a=hello%20world')).toEqual({ a: 'hello world' });
  });

  it('ignores a malformed percent sequence instead of throwing', () => {
    expect(() => parseCookies('a=%E0%A4%A')).not.toThrow();
  });

  it('ignores a pair with no name', () => {
    expect(parseCookies('=value')).toEqual({});
  });

  it('returns an empty object for a missing header', () => {
    expect(parseCookies(undefined)).toEqual({});
  });
});

describe('sessionToken', () => {
  it('reads the prefixed name on a secure deployment', () => {
    const headers = { cookie: `${HOST_PREFIXED_AUTH_COOKIE}=token-value` };
    expect(sessionToken(headers, SECURE)).toBe('token-value');
  });

  it('falls back to the unprefixed name so a rename does not log everyone out', () => {
    const headers = { cookie: `${AUTH_COOKIE}=old-token` };
    expect(sessionToken(headers, SECURE)).toBe('old-token');
  });

  it('prefers the prefixed cookie when both are present', () => {
    const headers = {
      cookie: `${AUTH_COOKIE}=old-token; ${HOST_PREFIXED_AUTH_COOKIE}=new-token`,
    };
    expect(sessionToken(headers, SECURE)).toBe('new-token');
  });

  it('returns undefined with no cookie header', () => {
    expect(sessionToken({}, SECURE)).toBeUndefined();
  });
});

describe('sessionCookie', () => {
  it('is HttpOnly, SameSite=Lax and path-scoped to the whole site', () => {
    const header = sessionCookie('token-value', INSECURE);
    expect(header).toContain('HttpOnly');
    expect(header).toContain('SameSite=Lax');
    expect(header).toContain('Path=/');
    expect(header).toContain('Max-Age=28800');
  });

  it('adds Secure and the prefix together, never one without the other', () => {
    const header = sessionCookie('token-value', SECURE);
    expect(header.startsWith(`${HOST_PREFIXED_AUTH_COOKIE}=`)).toBe(true);
    expect(header).toContain('Secure');
  });

  it('omits Secure on a plain-HTTP deployment and drops the prefix with it', () => {
    const header = sessionCookie('token-value', INSECURE);
    expect(header.startsWith(`${AUTH_COOKIE}=`)).toBe(true);
    expect(header).not.toContain('Secure');
  });

  it('percent-encodes the token', () => {
    expect(sessionCookie('a b', INSECURE)).toContain('a%20b');
  });
});

describe('clearSessionCookie', () => {
  it('expires the cookie immediately under the matching name', () => {
    expect(clearSessionCookie(SECURE)).toContain(`${HOST_PREFIXED_AUTH_COOKIE}=`);
    expect(clearSessionCookie(SECURE)).toContain('Max-Age=0');
  });
});
```

The prefix-and-`Secure` pairing is the load-bearing assertion: a browser silently drops a `__Host-`-named cookie that lacks `Secure`, so setting one without the other logs every local developer out with no error message.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @moneyverse/backend test src/auth/cookies.test.ts`
Expected: FAIL — cannot resolve `./cookies`.

- [ ] **Step 3: Port the implementation**

`backend/src/auth/cookies.ts` — from `ORIGINAL/src/http/cookies.ts`, with `cookies(request)` replaced by `parseCookies(header)` so the module does not depend on `node:http` (NestJS controllers receive an Express request, and the socket.io handshake is header-shaped but is not an `IncomingMessage`):

```ts
export const AUTH_COOKIE = 'mv_session';
export const HOST_PREFIXED_AUTH_COOKIE = `__Host-${AUTH_COOKIE}`;
export const SESSION_MAX_AGE = 8 * 60 * 60;

interface CookieSecurity {
  readonly cookieSecure: boolean;
}

interface HeaderBearing {
  readonly cookie?: string | undefined;
}

/**
 * `__Host-` is only valid on a cookie that carries `Secure`, `Path=/`, and no
 * `Domain`. This cookie already satisfies the latter two unconditionally, so
 * `Secure` is the only variable — and `Secure` itself is only set when
 * `config.cookieSecure` is true. A browser silently drops a `__Host-`-named
 * cookie that lacks `Secure` instead of storing it, so applying the prefix
 * unconditionally would break every local run over plain HTTP. The prefix
 * therefore tracks `cookieSecure` exactly, both here and in `sessionToken()`.
 */
export function authCookieName(config: CookieSecurity): string {
  return config.cookieSecure ? HOST_PREFIXED_AUTH_COOKIE : AUTH_COOKIE;
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (const part of (header ?? '').split(';')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const key = part.slice(0, separator).trim();
    try {
      parsed[key] = decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      /* Ignore malformed cookies. */
    }
  }
  return parsed;
}

/**
 * Reads the session token, falling back to the pre-`__Host-` cookie name so
 * that sessions issued before the rename are not silently logged out on
 * deploy — a browser holding an old `mv_session` cookie will never send the
 * new `__Host-mv_session` name on its own. `sessionCookie()` and
 * `clearSessionCookie()` only ever *write* the current name; this is a
 * read-only compatibility shim.
 */
export function sessionToken(
  headers: HeaderBearing,
  config: CookieSecurity,
): string | undefined {
  const parsed = parseCookies(headers.cookie);
  return parsed[authCookieName(config)] ?? parsed[AUTH_COOKIE];
}

export function sessionCookie(token: string, config: CookieSecurity): string {
  const attributes = [
    `${authCookieName(config)}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE}`,
  ];
  if (config.cookieSecure) attributes.push('Secure');
  return attributes.join('; ');
}

export function clearSessionCookie(config: CookieSecurity): string {
  const attributes = [
    `${authCookieName(config)}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (config.cookieSecure) attributes.push('Secure');
  return attributes.join('; ');
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @moneyverse/backend test src/auth/cookies.test.ts`
Expected: PASS — 14 tests.

- [ ] **Step 5: Commit**

```bash
git add backend/src/auth/cookies.ts backend/src/auth/cookies.test.ts
git commit -m "feat(backend): port session cookie construction and parsing"
```

---

### Task 8: Request context and authorisation guards

**Files:**
- Create: `backend/src/auth/session.context.ts`, `backend/src/auth/admin-roles.repository.ts`
- Create: `backend/src/auth/guards/session.guard.ts`, `backend/src/auth/guards/authenticated.guard.ts`, `backend/src/auth/guards/consent.guard.ts`, `backend/src/auth/guards/csrf.guard.ts`, `backend/src/auth/guards/admin.guard.ts`, `backend/src/auth/guards/reauth.guard.ts`, `backend/src/auth/guards/internal-token.guard.ts`
- Create: `backend/src/auth/auth.module.ts`
- Test: `backend/src/auth/guards/guards.test.ts`

**Interfaces:**
- Consumes: `SessionRepository` (Task 6), `sessionToken` (Task 7), `CONFIG` and `PG_POOL` (Tasks 4–5)
- Produces: `RequestWithSession` (an Express request carrying `session?: AuthSessionRow` and `adminRoles?: string[]`); the seven guard classes above; `AdminRolesRepository.currentRoles(userId: string): Promise<string[]>`; `AuthModule` exporting `SessionRepository`, `AdminRolesRepository` and every guard.

- [ ] **Step 1: Write the failing guard test**

`backend/src/auth/guards/guards.test.ts`:

```ts
import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import type { RequestWithSession } from '../session.context';
import { AdminGuard } from './admin.guard';
import { AuthenticatedGuard } from './authenticated.guard';
import { ConsentGuard } from './consent.guard';
import { CsrfGuard } from './csrf.guard';
import { InternalTokenGuard } from './internal-token.guard';
import { ReauthGuard } from './reauth.guard';
import { SessionGuard } from './session.guard';

function contextFor(request: Partial<RequestWithSession>): ExecutionContext {
  const full = { headers: {}, method: 'GET', ...request } as RequestWithSession;
  return {
    switchToHttp: () => ({ getRequest: () => full }),
  } as unknown as ExecutionContext;
}

const CONFIG_INSECURE = { cookieSecure: false, internalToken: 'i'.repeat(32) };

describe('SessionGuard', () => {
  it('reports the store unavailable rather than unauthorised when there is no repository', async () => {
    const guard = new SessionGuard(null, CONFIG_INSECURE as never);
    await expect(guard.canActivate(contextFor({}))).rejects.toThrow(ServiceUnavailableException);
  });

  it('attaches the resolved session to the request', async () => {
    const session = { id: 'session-id', user_id: null };
    const sessions = { get: async () => session };
    const guard = new SessionGuard(sessions as never, CONFIG_INSECURE as never);
    const request = { headers: { cookie: 'mv_session=' + 'a'.repeat(64) } };
    const context = contextFor(request);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect((context.switchToHttp().getRequest() as RequestWithSession).session).toBe(session);
  });

  it('rejects when no session matches the token', async () => {
    const sessions = { get: async () => null };
    const guard = new SessionGuard(sessions as never, CONFIG_INSECURE as never);
    await expect(guard.canActivate(contextFor({}))).rejects.toThrow(UnauthorizedException);
  });
});

describe('AuthenticatedGuard', () => {
  it('rejects a pre-login session that has no user', () => {
    const guard = new AuthenticatedGuard();
    const context = contextFor({ session: { id: 'session-id', user_id: null } as never });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('accepts a session bound to a user', () => {
    const guard = new AuthenticatedGuard();
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    expect(guard.canActivate(context)).toBe(true);
  });
});

describe('ConsentGuard', () => {
  it('rejects with 428 when the current policy version is not accepted', async () => {
    const sessions = { hasCurrentUserConsent: async () => false };
    const guard = new ConsentGuard(sessions as never);
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(guard.canActivate(context)).rejects.toMatchObject({ status: 428 });
  });

  it('accepts when consent is current', async () => {
    const sessions = { hasCurrentUserConsent: async () => true };
    const guard = new ConsentGuard(sessions as never);
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});

describe('CsrfGuard', () => {
  it('lets a safe method through without a token', async () => {
    const guard = new CsrfGuard({ verifyCsrf: async () => false } as never);
    await expect(guard.canActivate(contextFor({ method: 'GET' }))).resolves.toBe(true);
  });

  it('rejects a state-changing request with no token header', async () => {
    const guard = new CsrfGuard({ verifyCsrf: async () => true } as never);
    const context = contextFor({ method: 'POST', session: { id: 'session-id' } as never });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('rejects a state-changing request whose token does not verify', async () => {
    const guard = new CsrfGuard({ verifyCsrf: async () => false } as never);
    const context = contextFor({
      method: 'POST',
      headers: { 'x-csrf-token': 'c'.repeat(64) },
      session: { id: 'session-id' } as never,
    });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('accepts a verified token', async () => {
    const guard = new CsrfGuard({ verifyCsrf: async () => true } as never);
    const context = contextFor({
      method: 'POST',
      headers: { 'x-csrf-token': 'c'.repeat(64) },
      session: { id: 'session-id' } as never,
    });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('protects %s', async (method) => {
    const guard = new CsrfGuard({ verifyCsrf: async () => true } as never);
    const context = contextFor({ method, session: { id: 'session-id' } as never });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});

describe('AdminGuard', () => {
  it('rejects a user with no roles', async () => {
    const guard = new AdminGuard({ currentRoles: async () => [] } as never);
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('attaches the roles it resolved', async () => {
    const guard = new AdminGuard({ currentRoles: async () => ['operator'] } as never);
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect((context.switchToHttp().getRequest() as RequestWithSession).adminRoles).toEqual(['operator']);
  });
});

describe('ReauthGuard', () => {
  it('rejects when the last reauthentication is older than the window', async () => {
    const guard = new ReauthGuard({ hasRecentReauthentication: async () => false } as never);
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(guard.canActivate(context)).rejects.toMatchObject({ status: 401 });
  });

  it('asks for the 900 second window', async () => {
    const seen: unknown[] = [];
    const sessions = {
      hasRecentReauthentication: async (id: string, seconds: number) => {
        seen.push([id, seconds]);
        return true;
      },
    };
    const guard = new ReauthGuard(sessions as never);
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(seen[0]).toEqual(['session-id', 900]);
  });
});

describe('an offline session store', () => {
  it.each([
    ['ConsentGuard', () => new ConsentGuard(null)],
    ['ReauthGuard', () => new ReauthGuard(null)],
  ])('makes %s report 503 rather than crash', async (_name, build) => {
    const context = contextFor({ session: { id: 'session-id', user_id: 'user-id' } as never });
    await expect(build().canActivate(context)).rejects.toThrow(ServiceUnavailableException);
  });

  it('makes CsrfGuard report 503 on a write but still allow a read', async () => {
    const guard = new CsrfGuard(null);
    await expect(guard.canActivate(contextFor({ method: 'GET' }))).resolves.toBe(true);
    await expect(guard.canActivate(contextFor({ method: 'POST' }))).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});

describe('InternalTokenGuard', () => {
  it('rejects a request without the shared token', () => {
    const guard = new InternalTokenGuard(CONFIG_INSECURE as never);
    expect(() => guard.canActivate(contextFor({}))).toThrow(UnauthorizedException);
  });

  it('rejects a token of the right length but the wrong value', () => {
    const guard = new InternalTokenGuard(CONFIG_INSECURE as never);
    const context = contextFor({ headers: { 'x-internal-token': 'j'.repeat(32) } });
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('accepts the configured token', () => {
    const guard = new InternalTokenGuard(CONFIG_INSECURE as never);
    const context = contextFor({ headers: { 'x-internal-token': 'i'.repeat(32) } });
    expect(guard.canActivate(context)).toBe(true);
  });
});
```

The `it.each` over all four state-changing verbs is the mechanical form of "state-changing routes are CSRF-protected without exception".

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @moneyverse/backend test src/auth/guards`
Expected: FAIL — cannot resolve the guard modules.

- [ ] **Step 3: Write the request context type and the admin roles repository**

`backend/src/auth/session.context.ts`:

```ts
import type { Request } from 'express';
import type { AuthSessionRow } from './session.repository';

export interface RequestWithSession extends Request {
  session?: AuthSessionRow;
  adminRoles?: string[];
}

/** Thrown state is attached by the guards; controllers read these directly. */
export function requireSession(request: RequestWithSession): AuthSessionRow {
  const session = request.session;
  if (!session) throw new Error('guard order defect: no session on the request');
  return session;
}

export function requireUserId(request: RequestWithSession): string {
  const userId = requireSession(request).user_id;
  if (!userId) throw new Error('guard order defect: session is not bound to a user');
  return userId;
}
```

`requireSession` and `requireUserId` throw plain `Error`, not an HTTP exception, on purpose. Reaching them without a session means a controller was decorated with the wrong guard order — a programming defect, not a client error, and it should surface as a 500 with a stack rather than a misleading 401.

`backend/src/auth/admin-roles.repository.ts`:

```ts
import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryRows } from '../core/db';
import { PG_POOL } from '../core/pool.provider';

/** Row returned by admin_current_roles (packages/database/migrations/007-admin-hardening.sql). */
interface AdminRoleRow {
  readonly role: string;
}

@Injectable()
export class AdminRolesRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable | null) {}

  async currentRoles(userId: string): Promise<string[]> {
    if (!this.pool) return [];
    const rows = await queryRows<AdminRoleRow>(
      this.pool,
      'SELECT role FROM public.admin_current_roles($1)',
      [userId],
    );
    return rows.map((row) => row.role);
  }
}
```

Confirm the exact column name and signature of `admin_current_roles` against `packages/database/migrations/` before finishing this step:

```bash
grep -n 'admin_current_roles' packages/database/migrations/*.sql | head
```

If the function returns a differently named column, match it — the row interface is an assertion about the schema, and this is the moment to check it.

- [ ] **Step 4: Write the guards**

`backend/src/auth/guards/session.guard.ts`:

```ts
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import type { AppConfig } from '../../core/config';
import { CONFIG } from '../../core/config';
import { sessionToken } from '../cookies';
import type { RequestWithSession } from '../session.context';
import { SessionRepository } from '../session.repository';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly sessions: SessionRepository | null,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.sessions) throw new ServiceUnavailableException('session store unavailable');
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const session = await this.sessions.get(sessionToken(request.headers, this.config));
    if (!session) throw new UnauthorizedException('login required');
    request.session = session;
    return true;
  }
}
```

`backend/src/auth/guards/authenticated.guard.ts`:

```ts
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { RequestWithSession } from '../session.context';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    if (!request.session?.user_id) throw new UnauthorizedException('login required');
    return true;
  }
}
```

`backend/src/auth/guards/consent.guard.ts`:

```ts
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { RequestWithSession } from '../session.context';
import { SessionRepository } from '../session.repository';

@Injectable()
export class ConsentGuard implements CanActivate {
  // Nullable for the same reason as SessionGuard: the provider factory yields
  // null when no DATABASE_URL is set, and Nest injects that regardless of
  // which guard ran first. Typing it non-null would turn an offline store
  // into a TypeError and a 500 instead of an honest 503.
  constructor(private readonly sessions: SessionRepository | null) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.sessions) throw new ServiceUnavailableException('session store unavailable');
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const sessionId = request.session?.id;
    if (!sessionId || !(await this.sessions.hasCurrentUserConsent(sessionId))) {
      // 428 Precondition Required: the request is well formed and the caller
      // is authenticated, but the current policy version has not been
      // accepted. A 403 would suggest the action is never permitted.
      throw new HttpException('current policy consent required', HttpStatus.PRECONDITION_REQUIRED);
    }
    return true;
  }
}
```

`backend/src/auth/guards/csrf.guard.ts`:

```ts
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { RequestWithSession } from '../session.context';
import { SessionRepository } from '../session.repository';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly sessions: SessionRepository | null) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    if (SAFE_METHODS.has(request.method)) return true;
    // Checked after the safe-method exit so a read still works with the store
    // offline, and before any token comparison so an unavailable store can
    // never be mistaken for a valid token.
    if (!this.sessions) throw new ServiceUnavailableException('session store unavailable');

    const presented = request.headers['x-csrf-token'];
    const sessionId = request.session?.id;
    if (typeof presented !== 'string' || !sessionId) {
      throw new ForbiddenException('csrf token required');
    }
    if (!(await this.sessions.verifyCsrf(sessionId, presented))) {
      throw new ForbiddenException('csrf token rejected');
    }
    return true;
  }
}
```

`backend/src/auth/guards/admin.guard.ts`:

```ts
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AdminRolesRepository } from '../admin-roles.repository';
import type { RequestWithSession } from '../session.context';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly adminRoles: AdminRolesRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const userId = request.session?.user_id;
    if (!userId) throw new ForbiddenException('administrator role required');
    const roles = await this.adminRoles.currentRoles(userId);
    if (roles.length === 0) throw new ForbiddenException('administrator role required');
    request.adminRoles = roles;
    return true;
  }
}
```

`backend/src/auth/guards/reauth.guard.ts`:

```ts
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import type { RequestWithSession } from '../session.context';
import { SessionRepository } from '../session.repository';

/**
 * Sensitive actions — account deletion, unlinking an identity — require the
 * caller to have proved control of an OAuth identity recently, not merely to
 * hold a live session. The window matches the original application: 900
 * seconds.
 */
const REAUTHENTICATION_WINDOW_SECONDS = 900;

@Injectable()
export class ReauthGuard implements CanActivate {
  constructor(private readonly sessions: SessionRepository | null) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.sessions) throw new ServiceUnavailableException('session store unavailable');
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const sessionId = request.session?.id;
    const recent =
      sessionId !== undefined &&
      (await this.sessions.hasRecentReauthentication(sessionId, REAUTHENTICATION_WINDOW_SECONDS));
    if (!recent) throw new UnauthorizedException('recent reauthentication required');
    return true;
  }
}
```

`backend/src/auth/guards/internal-token.guard.ts`:

```ts
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { AppConfig } from '../../core/config';
import { CONFIG } from '../../core/config';
import type { RequestWithSession } from '../session.context';

/**
 * Defence in depth for the Next-to-NestJS hop. The API is not published to
 * the internet at all; this guard is the second lock, not the first, and it
 * compares in constant time so the token cannot be recovered a byte at a
 * time.
 */
@Injectable()
export class InternalTokenGuard implements CanActivate {
  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const presented = request.headers['x-internal-token'];
    if (typeof presented !== 'string') throw new UnauthorizedException('internal token required');

    const expected = Buffer.from(this.config.internalToken, 'utf8');
    const actual = Buffer.from(presented, 'utf8');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      throw new UnauthorizedException('internal token rejected');
    }
    return true;
  }
}
```

`backend/src/auth/auth.module.ts`:

```ts
import { Module } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { AdminRolesRepository } from './admin-roles.repository';
import { AdminGuard } from './guards/admin.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { ConsentGuard } from './guards/consent.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { InternalTokenGuard } from './guards/internal-token.guard';
import { ReauthGuard } from './guards/reauth.guard';
import { SessionGuard } from './guards/session.guard';
import { SessionRepository } from './session.repository';

const GUARDS = [
  SessionGuard,
  AuthenticatedGuard,
  ConsentGuard,
  CsrfGuard,
  AdminGuard,
  ReauthGuard,
  InternalTokenGuard,
];

@Module({
  providers: [
    {
      provide: SessionRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new SessionRepository(pool) : null),
    },
    AdminRolesRepository,
    ...GUARDS,
  ],
  exports: [SessionRepository, AdminRolesRepository, ...GUARDS],
})
export class AuthModule {}
```

Register `AuthModule` in `backend/src/app.module.ts` imports.

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @moneyverse/backend test src/auth/guards`
Expected: PASS — 23 tests.

- [ ] **Step 6: Typecheck and commit**

```bash
pnpm --filter @moneyverse/backend typecheck
git add backend/src/auth backend/src/app.module.ts
git commit -m "feat(backend): add session, consent, CSRF, admin and step-up guards

CsrfGuard covers every state-changing verb with no route-level opt-out, and
the test asserts that mechanically. InternalTokenGuard compares the shared
Next-to-NestJS token in constant time."
```

---

### Task 9: Problem+JSON exception filter

**Files:**
- Create: `backend/src/core/problem.filter.ts`
- Modify: `backend/src/main.ts`
- Test: `backend/src/core/problem.filter.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks beyond NestJS
- Produces: `ProblemFilter` implementing `ExceptionFilter`; response body shape `{ type: string; title: string; status: number; detail?: string; errors?: string[] }` served as `application/problem+json`.

- [ ] **Step 1: Write the failing test**

`backend/src/core/problem.filter.test.ts`:

```ts
import { BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ProblemFilter } from './problem.filter';

function hostFor(): { host: ArgumentsHost; status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn>; type: ReturnType<typeof vi.fn> } {
  const json = vi.fn();
  const type = vi.fn().mockReturnThis();
  const status = vi.fn().mockReturnValue({ json, type });
  const response = { status, type, json };
  const host = {
    switchToHttp: () => ({ getResponse: () => response, getRequest: () => ({ url: '/api/v1/things' }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json, type };
}

describe('ProblemFilter', () => {
  it('maps a NotFoundException to a 404 problem document', () => {
    const { host, status, json } = hostFor();
    new ProblemFilter(false).catch(new NotFoundException('no such thing'), host);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 404, title: 'Not Found', detail: 'no such thing' }),
    );
  });

  it('serves the problem+json media type', () => {
    const { host, type } = hostFor();
    new ProblemFilter(false).catch(new NotFoundException(), host);
    expect(type).toHaveBeenCalledWith('application/problem+json');
  });

  it('collects validation messages into an errors array', () => {
    const { host, json } = hostFor();
    const exception = new BadRequestException({
      message: ['amount must be a positive integer', 'recipientId must be a UUID'],
      error: 'Bad Request',
      statusCode: 400,
    });
    new ProblemFilter(false).catch(exception, host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        errors: ['amount must be a positive integer', 'recipientId must be a UUID'],
      }),
    );
  });

  it('answers 500 with a fixed detail for an unrecognised error', () => {
    const { host, status, json } = hostFor();
    new ProblemFilter(true).catch(new Error('connection string parse failure'), host);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 500, detail: 'internal server error' }),
    );
  });

  it('never leaks an internal message in production', () => {
    const { host, json } = hostFor();
    new ProblemFilter(true).catch(new Error('password=hunter2'), host);
    expect(JSON.stringify(json.mock.calls[0])).not.toContain('hunter2');
  });

  it('preserves a deliberate HttpException status such as 428', () => {
    const { host, status } = hostFor();
    new ProblemFilter(false).catch(
      new HttpException('consent required', HttpStatus.PRECONDITION_REQUIRED),
      host,
    );
    expect(status).toHaveBeenCalledWith(428);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @moneyverse/backend test src/core/problem.filter.test.ts`
Expected: FAIL — cannot resolve `./problem.filter`.

- [ ] **Step 3: Implement the filter**

`backend/src/core/problem.filter.ts`:

```ts
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

export interface ProblemDocument {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly errors?: string[];
}

function titleFor(status: number): string {
  return HttpStatus[status] === undefined
    ? 'Error'
    : String(HttpStatus[status])
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * RFC 9457 problem documents for every error. `production` decides whether an
 * unrecognised throw may describe itself: outside production the message is
 * useful during development, in production it is a leak — connection strings
 * and query text routinely appear in driver errors.
 */
@Catch()
export class ProblemFilter implements ExceptionFilter {
  constructor(private readonly production: boolean) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const detail = typeof payload === 'string' ? payload : this.detailOf(payload);
      const errors = this.errorsOf(payload);
      const problem: ProblemDocument = {
        type: 'about:blank',
        title: titleFor(status),
        status,
        ...(detail === undefined ? {} : { detail }),
        ...(errors === undefined ? {} : { errors }),
      };
      response.status(status).type('application/problem+json').json(problem);
      return;
    }

    const problem: ProblemDocument = {
      type: 'about:blank',
      title: titleFor(HttpStatus.INTERNAL_SERVER_ERROR),
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail:
        this.production || !(exception instanceof Error)
          ? 'internal server error'
          : exception.message,
    };
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .type('application/problem+json')
      .json(problem);
  }

  private detailOf(payload: unknown): string | undefined {
    if (!isRecord(payload)) return undefined;
    const message = payload.message;
    if (typeof message === 'string') return message;
    if (typeof payload.error === 'string') return payload.error;
    return undefined;
  }

  private errorsOf(payload: unknown): string[] | undefined {
    if (!isRecord(payload)) return undefined;
    const message = payload.message;
    if (!Array.isArray(message)) return undefined;
    return message.filter((entry): entry is string => typeof entry === 'string');
  }
}
```

Note the fifth test: `new ProblemFilter(true)` must never place `exception.message` in the document. Run that test and read the assertion output rather than assuming.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @moneyverse/backend test src/core/problem.filter.test.ts`
Expected: PASS — 6 tests.

- [ ] **Step 5: Register the filter and the validation pipe**

Modify `backend/src/main.ts`:

```ts
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadConfig } from './core/config';
import { ProblemFilter } from './core/problem.filter';

async function bootstrap(): Promise<void> {
  const config = loadConfig(process.env);
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new ProblemFilter(config.production));

  await app.listen(config.port, process.env.HOST ?? '127.0.0.1');
}

void bootstrap();
```

`enableImplicitConversion` stays off. With it on, `class-transformer` coerces a numeric string into a `number` — precisely the conversion that destroys a money value above 2^53.

- [ ] **Step 6: Commit**

```bash
git add backend/src/core/problem.filter.ts backend/src/core/problem.filter.test.ts backend/src/main.ts
git commit -m "feat(backend): answer every error with an RFC 9457 problem document

Implicit type conversion stays disabled in the validation pipe: coercing a
numeric string to a number is what silently destroys a money value above
2^53."
```

---

### Task 10: Rate limiting tiers and HTTP server timeouts

**Files:**
- Create: `backend/src/security/rate-limit.ts`
- Modify: `backend/src/app.module.ts`, `backend/src/main.ts`
- Test: `backend/src/security/rate-limit.test.ts`

**Interfaces:**
- Consumes: `AppConfig` from Task 4
- Produces: `requestClientKey(request, options): string`; `tierFor(pathname: string, method: string): { name: 'auth' | 'sensitive' | 'read'; limit: number }`; throttler configuration registered on `AppModule`.

- [ ] **Step 1: Write the failing test**

`backend/src/security/rate-limit.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { requestClientKey, tierFor } from './rate-limit';

describe('tierFor', () => {
  it('gives a versioned auth route the tightest tier', () => {
    expect(tierFor('/api/v1/auth/discord/authorize', 'GET')).toEqual({ name: 'auth', limit: 20 });
  });

  it('gives an unversioned auth route the tightest tier too', () => {
    expect(tierFor('/auth/discord/callback', 'GET')).toEqual({ name: 'auth', limit: 20 });
  });

  it('does not mistake a route merely containing the word auth for an auth route', () => {
    expect(tierFor('/api/v1/authors', 'GET').name).toBe('read');
  });

  it('gives a write to the API the sensitive tier', () => {
    expect(tierFor('/api/v1/wallet/transfers', 'POST')).toEqual({ name: 'sensitive', limit: 60 });
  });

  it('treats every non-GET API verb as sensitive', () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      expect(tierFor('/api/v1/things/1', method).name).toBe('sensitive');
    }
  });

  it('gives an API read the read tier', () => {
    expect(tierFor('/api/v1/wallet', 'GET')).toEqual({ name: 'read', limit: 240 });
  });

  it('gives a non-API page the read tier', () => {
    expect(tierFor('/health', 'GET')).toEqual({ name: 'read', limit: 240 });
  });
});

describe('requestClientKey', () => {
  it('uses the socket address when the proxy header is not trusted', () => {
    const request = {
      headers: { 'x-forwarded-for': '203.0.113.9' },
      socket: { remoteAddress: '10.0.0.4' },
    };
    expect(requestClientKey(request, { trustForwardedFor: false })).toBe('10.0.0.4');
  });

  it('uses the first forwarded address only when the header is trusted', () => {
    const request = {
      headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' },
      socket: { remoteAddress: '10.0.0.4' },
    };
    expect(requestClientKey(request, { trustForwardedFor: true })).toBe('203.0.113.9');
  });

  it('falls back to the socket address when a trusted header is absent', () => {
    const request = { headers: {}, socket: { remoteAddress: '10.0.0.4' } };
    expect(requestClientKey(request, { trustForwardedFor: true })).toBe('10.0.0.4');
  });

  it('returns a stable placeholder when no address is available', () => {
    const request = { headers: {}, socket: {} };
    expect(requestClientKey(request, { trustForwardedFor: false })).toBe('unknown');
  });
});
```

The first assertion is the security-relevant one: with `trustForwardedFor` false, a client-supplied `X-Forwarded-For` must be ignored entirely. Honouring it without a proxy that rewrites the header lets any client forge a fresh identity per request and evade rate limiting completely.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @moneyverse/backend test src/security/rate-limit.test.ts`
Expected: FAIL — cannot resolve `./rate-limit`.

- [ ] **Step 3: Implement the tier and key functions**

`backend/src/security/rate-limit.ts`:

```ts
export interface ClientKeyOptions {
  readonly trustForwardedFor: boolean;
}

export interface KeyableRequest {
  readonly headers: Record<string, string | string[] | undefined>;
  readonly socket: { readonly remoteAddress?: string | undefined };
}

export type RateLimitTierName = 'auth' | 'sensitive' | 'read';

export interface RateLimitTier {
  readonly name: RateLimitTierName;
  readonly limit: number;
}

/**
 * Per-minute request budgets, carried over from the original application.
 * `auth` is tightest because those routes reach the OAuth providers and the
 * session table; `sensitive` covers every API write; `read` is everything
 * else.
 */
const AUTH_LIMIT = 20;
const SENSITIVE_LIMIT = 60;
const READ_LIMIT = 240;

/**
 * The backend mounts everything under a global `/api` prefix with URI
 * versioning, so an auth route reaches this function as `/api/v1/auth/...`,
 * not `/auth/...`. Both forms are matched: the unversioned form is what the
 * Next.js edge presents publicly, and keeping it here means the two cannot
 * drift into disagreeing about which requests are expensive.
 */
const AUTH_PATH = /^(?:\/api\/v\d+)?\/auth\//;

export function tierFor(pathname: string, method: string): RateLimitTier {
  if (AUTH_PATH.test(pathname)) return { name: 'auth', limit: AUTH_LIMIT };
  if (pathname.startsWith('/api/') && method !== 'GET') {
    return { name: 'sensitive', limit: SENSITIVE_LIMIT };
  }
  return { name: 'read', limit: READ_LIMIT };
}

/**
 * Enabling `trustForwardedFor` without a reverse proxy that strips and
 * rewrites `X-Forwarded-For` lets a client forge the header and evade rate
 * limiting entirely, so the default is false and the header is ignored
 * outright rather than merely deprioritised.
 */
export function requestClientKey(request: KeyableRequest, options: ClientKeyOptions): string {
  if (options.trustForwardedFor) {
    const forwarded = request.headers['x-forwarded-for'];
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const first = raw?.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.socket.remoteAddress ?? 'unknown';
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @moneyverse/backend test src/security/rate-limit.test.ts`
Expected: PASS — 11 tests.

- [ ] **Step 5: Register throttling and the server timeouts**

Modify `backend/src/app.module.ts` to add the throttler:

```ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    HealthModule,
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'auth', ttl: 60_000, limit: 20 },
        { name: 'sensitive', ttl: 60_000, limit: 60 },
        { name: 'read', ttl: 60_000, limit: 240 },
      ],
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
```

The limiter is process-local, exactly as in the original. That is correct for the single-instance deployment and becomes N times weaker on any scale-out. It is a known limitation, tracked rather than overlooked, and a shared atomic limiter is a separate piece of work.

Add this exported function to `backend/src/main.ts`:

```ts
import type { Server } from 'node:http';

/**
 * Slowloris protection. With none of these set, Node falls back to its own
 * defaults — headersTimeout 60s, requestTimeout 5 minutes, no connection cap
 * — and a client that trickles bytes, or none, can hold a socket open for
 * that whole window while contributing nothing.
 *
 * Exported so the values can be asserted without booting the application. In
 * the original these were constructor-only options on `http.createServer`;
 * on an already-created server they are writable properties, which is why
 * assignment is correct here.
 */
export function applyServerTimeouts(server: Server): void {
  // Every route reads at most a few KB of headers, which arrives in well
  // under a second even on a poor mobile link. 8s leaves an order of
  // magnitude of headroom while bounding a header-drip attacker to
  // single-digit seconds rather than Node's 60s default.
  server.headersTimeout = 8_000;
  // Covers the body too, so it must fit the largest request the application
  // accepts — the 8MB image upload. 20s covers that on a ~3.3Mbps link and
  // is a fraction of Node's 5-minute default. Must stay >= headersTimeout or
  // it can fire before headers finish parsing.
  server.requestTimeout = 20_000;
  // Node enforces both through a periodic sweep that defaults to 30s, so
  // without this a connection past its 8s headersTimeout could still sit
  // open for ~30s more — most of the protection above given back as sweep
  // latency. 2s bounds that to headersTimeout + ~2s.
  server.connectionsCheckingInterval = 2_000;
  // A hard ceiling on concurrent sockets for the whole listener, well above
  // expected legitimate load, to bound worst-case memory and file-descriptor
  // use during a connection flood.
  server.maxConnections = 1000;
}
```

Call it from `bootstrap()` after `NestFactory.create` and before `app.listen`:

```ts
  applyServerTimeouts(app.getHttpServer() as Server);
```

Assert the values rather than trusting the type definitions:

```ts
// backend/src/main.test.ts
import { describe, expect, it } from 'vitest';
import { applyServerTimeouts } from './main';

describe('applyServerTimeouts', () => {
  it('bounds header, request and sweep timings', () => {
    const server = {} as {
      headersTimeout?: number;
      requestTimeout?: number;
      connectionsCheckingInterval?: number;
      maxConnections?: number;
    };
    applyServerTimeouts(server as never);
    expect(server.headersTimeout).toBe(8_000);
    expect(server.requestTimeout).toBe(20_000);
    expect(server.connectionsCheckingInterval).toBe(2_000);
    expect(server.maxConnections).toBe(1000);
  });

  it('keeps requestTimeout at least as large as headersTimeout', () => {
    const server = {} as { headersTimeout?: number; requestTimeout?: number };
    applyServerTimeouts(server as never);
    expect(server.requestTimeout).toBeGreaterThanOrEqual(server.headersTimeout ?? 0);
  });
});
```

- [ ] **Step 6: Run the full backend suite**

Run: `pnpm --filter @moneyverse/backend test`
Expected: PASS — every test from Tasks 4 through 10.

- [ ] **Step 7: Commit**

```bash
git add backend/src/security backend/src/app.module.ts backend/src/main.ts backend/src/main.test.ts
git commit -m "feat(backend): add rate limit tiers and slowloris timeouts

A client-supplied X-Forwarded-For is ignored outright unless the deployment
declares a proxy that rewrites it; honouring it otherwise lets any client
forge a fresh rate-limit identity per request."
```

---

### Task 11: OpenAPI document

**Files:**
- Create: `backend/src/openapi.ts`
- Modify: `backend/src/main.ts`
- Test: `backend/src/openapi.test.ts`

**Interfaces:**
- Consumes: `AppModule` from Tasks 4–10
- Produces: `buildOpenApiDocument(app: INestApplication): OpenAPIObject`; `mountOpenApi(app: INestApplication, production: boolean): void` which mounts Swagger UI at `/docs` outside production and mounts nothing in production.

- [ ] **Step 1: Write the failing test**

`backend/src/openapi.test.ts`:

```ts
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { buildOpenApiDocument } from './openapi';

describe('buildOpenApiDocument', () => {
  it('describes the health endpoint', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    const document = buildOpenApiDocument(app);
    expect(document.paths['/health']?.get).toBeDefined();
    expect(document.info.title).toBe('Woldeok Moneyverse API');

    await app.close();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @moneyverse/backend test src/openapi.test.ts`
Expected: FAIL — cannot resolve `./openapi`.

- [ ] **Step 3: Implement the document builder**

`backend/src/openapi.ts`:

```ts
import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Woldeok Moneyverse API')
    .setDescription(
      'Internal API. Not reachable from the public internet: the Next.js ' +
        'application is the only public origin and calls this service over ' +
        'the internal network.',
    )
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-internal-token', in: 'header' }, 'internal-token')
    .addApiKey({ type: 'apiKey', name: 'x-csrf-token', in: 'header' }, 'csrf-token')
    .build();
  return SwaggerModule.createDocument(app, config);
}

/**
 * The document describes every guard, parameter and error shape of an
 * internal service. Publishing it in production would hand an attacker a map
 * for free, so production mounts nothing at all rather than mounting behind
 * a check that could later be loosened.
 */
export function mountOpenApi(app: INestApplication, production: boolean): void {
  if (production) return;
  SwaggerModule.setup('docs', app, buildOpenApiDocument(app));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @moneyverse/backend test src/openapi.test.ts`
Expected: PASS — 1 test.

- [ ] **Step 5: Mount it and add the API prefix**

In `backend/src/main.ts`, after the global filter and before `applyServerTimeouts`:

```ts
  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  mountOpenApi(app, config.production);
```

Import `VersioningType` from `@nestjs/common` and `mountOpenApi` from `./openapi`. `/health` is excluded from the prefix so a container probe keeps the short path it has always had.

Update the health test expectation in `backend/src/openapi.test.ts` only if the path in the generated document changes — run the test and read the actual document rather than guessing which form the exclusion produces.

- [ ] **Step 6: Verify the whole workspace**

Run:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Expected: all four succeed. Database-backed tests are skipped on this machine; state that plainly rather than describing them as passing.

- [ ] **Step 7: Commit**

```bash
git add backend/src/openapi.ts backend/src/openapi.test.ts backend/src/main.ts
git commit -m "feat(backend): generate an OpenAPI document and serve it outside production"
```

---

### Task 12: Route map — the porting safety net

**Files:**
- Create: `packages/contract/src/route-map.ts`
- Modify: `packages/contract/src/index.ts`
- Test: `packages/contract/src/route-map.test.ts`
- Create: `docs/route-map.md`

**Interfaces:**
- Consumes: `@moneyverse/contract` from Task 2
- Produces: `ROUTE_MAP: readonly RouteMapping[]` where `RouteMapping = { original: string; replacement: string | null; reason?: string; module: string }`; `originalRoutes(): string[]`; `replacementFor(original: string): string | null`.

This task creates the mechanism and populates it with the original route inventory. Later plans fill in `replacement` values as each domain module lands, and the coverage test tightens with them.

- [ ] **Step 1: Verify the inventory this map is built from**

The map in Step 4 is already complete. This step proves it was derived from the real snapshot rather than from memory:

```bash
python3 - <<'EOF' > /tmp/original-routes.txt
import json
routes = json.load(open('/home/ruma/Woldeok-Moneyverse/test/route-surface.snapshot.json'))
for route in routes:
    if 'definitely-not-a-route' in route or route.startswith('GET /assets/'):
        continue
    print(route)
EOF
wc -l /tmp/original-routes.txt
```

Expected: 82 lines. The 27 `/assets/*` entries are dropped deliberately — Next.js emits its own hashed asset URLs and those paths have no successor. The 4 negative probes are not routes.

Keep this file: Step 5 diffs the map against it.

- [ ] **Step 2: Write the failing test**

`packages/contract/src/route-map.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ROUTE_MAP, originalRoutes, replacementFor } from './route-map';

describe('ROUTE_MAP', () => {
  it('covers every application route of the original', () => {
    expect(originalRoutes()).toHaveLength(82);
  });

  it('has no duplicate original routes', () => {
    const seen = originalRoutes();
    expect(new Set(seen).size).toBe(seen.length);
  });

  it('states a reason for every route that has no replacement', () => {
    const dropped = ROUTE_MAP.filter((mapping) => mapping.replacement === null);
    for (const mapping of dropped) {
      expect(mapping.reason, `${mapping.original} was dropped without a reason`).toBeTruthy();
    }
  });

  it('assigns every route to a module', () => {
    for (const mapping of ROUTE_MAP) {
      expect(mapping.module, `${mapping.original} has no module`).toBeTruthy();
    }
  });

  it('writes every replacement as "METHOD /path"', () => {
    for (const mapping of ROUTE_MAP) {
      if (mapping.replacement === null) continue;
      expect(mapping.replacement).toMatch(/^(GET|POST|PUT|PATCH|DELETE) \//);
    }
  });

  it('resolves a known route', () => {
    expect(replacementFor('POST /api/v1/wallet/transfers')).toBe('POST /api/v1/wallet/transfers');
  });

  it('returns null for a route that is not in the map', () => {
    expect(replacementFor('GET /nope')).toBeNull();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm --filter @moneyverse/contract test src/route-map.test.ts`
Expected: FAIL — cannot resolve `./route-map`.

- [ ] **Step 4: Write the route map**

`packages/contract/src/route-map.ts` — the complete map. Every one of the 82 rows is given; the order matches the original snapshot file so the `original` column can be diffed against it mechanically.

```ts
/**
 * The porting safety net.
 *
 * The original application's route surface was pinned by a snapshot test.
 * This rebuild redesigns the API, so that snapshot cannot be carried over —
 * this map replaces it. Every application route of the original appears here
 * exactly once, paired with the route that now serves it, or with `null` and
 * a reason if it was deliberately dropped.
 *
 * `replacement: null` with no `reason` fails the test. That is the point:
 * a route cannot disappear quietly.
 *
 * The original's 27 `/assets/*` entries are absent by design — Next.js emits
 * hashed asset URLs and those paths have no successor — as are the 4
 * negative probes, which were never routes.
 *
 * A `module` of `frontend` means the path is served by a Next.js page or
 * route handler rather than by the API. Those rows still belong here: the
 * public surface is what must survive the port, regardless of which process
 * answers.
 */
export interface RouteMapping {
  readonly original: string;
  readonly replacement: string | null;
  readonly reason?: string;
  readonly module: string;
}

export const ROUTE_MAP: readonly RouteMapping[] = [
  { original: 'GET /robots.txt', replacement: 'GET /robots.txt', module: 'frontend' },
  { original: 'GET /health', replacement: 'GET /health', module: 'health' },
  { original: 'GET /login', replacement: 'GET /login', module: 'frontend' },
  { original: 'GET /login/providers', replacement: 'GET /login/providers', module: 'frontend' },
  {
    original: 'POST /api/prelogin-consent',
    replacement: 'PUT /api/v1/auth/consent',
    module: 'auth',
  },
  { original: 'POST /auth/logout', replacement: 'POST /api/v1/auth/logout', module: 'auth' },
  {
    original: 'GET /auth/discord/start',
    replacement: 'GET /auth/discord/authorize',
    module: 'auth',
  },
  {
    original: 'GET /auth/discord/callback',
    replacement: 'GET /auth/discord/callback',
    module: 'auth',
  },
  { original: 'GET /account', replacement: 'GET /account', module: 'frontend' },
  {
    original: 'GET /api/v1/account/identities',
    replacement: 'GET /api/v1/account/identities',
    module: 'account',
  },
  {
    original: 'POST /api/v1/account/delete',
    replacement: 'DELETE /api/v1/account',
    module: 'account',
  },
  {
    original: 'POST /api/v1/account/identities/00000000-0000-4000-8000-000000000000/unlink',
    replacement: 'DELETE /api/v1/account/identities/{id}',
    module: 'account',
  },
  {
    original: 'POST /api/v1/account/link/discord/start',
    replacement: 'POST /api/v1/account/identities/discord/link',
    module: 'account',
  },
  {
    original: 'POST /api/v1/account/reauth/discord/start',
    replacement: 'POST /api/v1/auth/discord/reauthentication',
    module: 'auth',
  },
  { original: 'GET /wallet', replacement: 'GET /wallet', module: 'frontend' },
  { original: 'GET /api/v1/wallet', replacement: 'GET /api/v1/wallet', module: 'wallet' },
  {
    original: 'POST /api/v1/wallet/transfers',
    replacement: 'POST /api/v1/wallet/transfers',
    module: 'wallet',
  },
  {
    original: 'POST /api/v1/bank/deposit',
    replacement: 'POST /api/v1/bank/movements',
    module: 'wallet',
  },
  { original: 'GET /api/v1/bank/loans', replacement: 'GET /api/v1/bank/loans', module: 'wallet' },
  { original: 'POST /api/v1/bank/loans', replacement: 'POST /api/v1/bank/loans', module: 'wallet' },
  {
    original: 'POST /api/v1/bank/loans/00000000-0000-4000-8000-000000000000/repay',
    replacement: 'POST /api/v1/bank/loans/{id}/repayments',
    module: 'wallet',
  },
  { original: 'GET /stocks', replacement: 'GET /stocks', module: 'frontend' },
  { original: 'GET /api/v1/stocks', replacement: 'GET /api/v1/stocks', module: 'stock' },
  {
    original: 'GET /api/v1/stocks/portfolio',
    replacement: 'GET /api/v1/stocks/portfolio',
    module: 'stock',
  },
  {
    original: 'GET /api/v1/stocks/history',
    replacement: 'GET /api/v1/stocks/history',
    module: 'stock',
  },
  {
    original: 'POST /api/v1/stocks/trade',
    replacement: 'POST /api/v1/stocks/{id}/orders',
    module: 'stock',
  },
  {
    original: 'GET /api/v1/stocks/00000000-0000-4000-8000-000000000000/prices',
    replacement: 'GET /api/v1/stocks/{id}/prices',
    module: 'stock',
  },
  { original: 'GET /businesses', replacement: 'GET /businesses', module: 'frontend' },
  {
    original: 'GET /api/v1/businesses',
    replacement: 'GET /api/v1/business-types',
    module: 'business',
  },
  {
    original: 'GET /api/v1/businesses/mine',
    replacement: 'GET /api/v1/businesses',
    module: 'business',
  },
  {
    original: 'POST /api/v1/businesses/purchase',
    replacement: 'POST /api/v1/business-types/{id}/purchases',
    module: 'business',
  },
  {
    original: 'POST /api/v1/businesses/00000000-0000-4000-8000-000000000000/settle',
    replacement: 'POST /api/v1/businesses/{id}/settlements',
    module: 'business',
  },
  { original: 'GET /seasons', replacement: 'GET /seasons', module: 'frontend' },
  {
    original: 'GET /api/v1/seasons/events',
    replacement: 'GET /api/v1/seasons/events',
    module: 'season',
  },
  {
    original: 'POST /api/v1/seasons/events/consume',
    replacement: 'POST /api/v1/seasons/events/{id}/consumptions',
    module: 'season',
  },
  {
    original: 'GET /api/v1/seasons/events/00000000-0000-4000-8000-000000000000/leaderboard',
    replacement: 'GET /api/v1/seasons/events/{id}/leaderboard',
    module: 'season',
  },
  { original: 'GET /shop', replacement: 'GET /shop', module: 'frontend' },
  { original: 'GET /api/v1/shop', replacement: 'GET /api/v1/shop/items', module: 'shop' },
  {
    original: 'GET /api/v1/shop/purchases',
    replacement: 'GET /api/v1/shop/purchases',
    module: 'shop',
  },
  {
    original: 'POST /api/v1/shop/purchases',
    replacement: 'POST /api/v1/shop/items/{id}/purchases',
    module: 'shop',
  },
  { original: 'GET /board', replacement: 'GET /board', module: 'frontend' },
  {
    original: 'POST /api/v1/board/posts',
    replacement: 'POST /api/v1/board/posts',
    module: 'board',
  },
  {
    original: 'DELETE /api/v1/board/posts/00000000-0000-4000-8000-000000000000',
    replacement: 'DELETE /api/v1/board/posts/{id}',
    module: 'board',
  },
  { original: 'GET /', replacement: 'GET /', module: 'frontend' },
  { original: 'GET /announcements', replacement: 'GET /announcements', module: 'frontend' },
  { original: 'GET /gallery', replacement: 'GET /gallery', module: 'frontend' },
  { original: 'GET /status', replacement: 'GET /status', module: 'frontend' },
  { original: 'GET /terms', replacement: 'GET /terms', module: 'frontend' },
  { original: 'GET /privacy', replacement: 'GET /privacy', module: 'frontend' },
  {
    original: 'GET /api/v1/announcements',
    replacement: 'GET /api/v1/announcements',
    module: 'content',
  },
  { original: 'GET /api/v1/gallery', replacement: 'GET /api/v1/photos', module: 'content' },
  { original: 'GET /api/v1/status', replacement: 'GET /api/v1/status', module: 'content' },
  {
    original: 'GET /api/v1/privacy/requests',
    replacement: 'GET /api/v1/privacy/requests',
    module: 'privacy',
  },
  {
    original: 'POST /api/v1/privacy/requests',
    replacement: 'POST /api/v1/privacy/requests',
    module: 'privacy',
  },
  { original: 'GET /admin', replacement: 'GET /admin', module: 'frontend' },
  { original: 'GET /admin/content', replacement: 'GET /admin/content', module: 'frontend' },
  { original: 'GET /admin/minecraft', replacement: 'GET /admin/minecraft', module: 'frontend' },
  { original: 'GET /api/v1/admin/me', replacement: 'GET /api/v1/admin/me', module: 'admin' },
  { original: 'GET /api/v1/admin/users', replacement: 'GET /api/v1/admin/users', module: 'admin' },
  {
    original: 'POST /api/v1/admin/users/00000000-0000-4000-8000-000000000000/restriction',
    replacement: 'PUT /api/v1/admin/users/{id}/restriction',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/approvals',
    replacement: 'GET /api/v1/admin/approvals',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/approvals',
    replacement: 'POST /api/v1/admin/approvals',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/approvals/00000000-0000-4000-8000-000000000000/decision',
    replacement: 'POST /api/v1/admin/approvals/{id}/decisions',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/audit-events',
    replacement: 'GET /api/v1/admin/audit-events',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/discord-outbox-events',
    replacement: 'GET /api/v1/admin/discord-outbox-events',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/economy/reconciliation/latest',
    replacement: 'GET /api/v1/admin/economy/reconciliations/latest',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/stocks',
    replacement: 'GET /api/v1/admin/stocks',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/stocks',
    replacement: 'POST /api/v1/admin/stocks',
    module: 'admin',
  },
  {
    original: 'PATCH /api/v1/admin/stocks/00000000-0000-4000-8000-000000000000',
    replacement: 'PATCH /api/v1/admin/stocks/{id}',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/stocks/00000000-0000-4000-8000-000000000000/corporate-actions',
    replacement: 'POST /api/v1/admin/stocks/{id}/corporate-actions',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/businesses',
    replacement: 'GET /api/v1/admin/business-types',
    module: 'admin',
  },
  {
    original: 'PATCH /api/v1/admin/businesses/00000000-0000-4000-8000-000000000000',
    replacement: 'PATCH /api/v1/admin/business-types/{id}',
    module: 'admin',
  },
  {
    original: 'GET /api/v1/admin/season-events',
    replacement: 'GET /api/v1/admin/season-events',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/season-events',
    replacement: 'POST /api/v1/admin/season-events',
    module: 'admin',
  },
  {
    original: 'PATCH /api/v1/admin/season-events/00000000-0000-4000-8000-000000000000',
    replacement: 'PATCH /api/v1/admin/season-events/{id}',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/photos/upload',
    replacement: 'POST /api/v1/admin/photos',
    module: 'admin',
  },
  {
    original: 'POST /api/v1/admin/content/announcements',
    replacement: 'POST /api/v1/admin/announcements',
    module: 'content',
  },
  {
    original: 'POST /api/v1/admin/content/announcements/00000000-0000-4000-8000-000000000000/publication',
    replacement: 'PUT /api/v1/admin/announcements/{id}/publication',
    module: 'content',
  },
  {
    original: 'POST /api/v1/admin/content/photos',
    replacement: 'POST /api/v1/admin/photos/metadata',
    module: 'content',
  },
  {
    original: 'POST /api/v1/admin/content/photos/00000000-0000-4000-8000-000000000000/publication',
    replacement: 'PUT /api/v1/admin/photos/{id}/publication',
    module: 'content',
  },
  {
    original: 'POST /api/v1/admin/minecraft/operations',
    replacement: 'POST /api/v1/admin/minecraft/operations',
    module: 'minecraft',
  },
  {
    original: 'GET /api/v1/admin/minecraft/operations/00000000-0000-4000-8000-000000000000',
    replacement: 'GET /api/v1/admin/minecraft/operations/{id}',
    module: 'minecraft',
  },
];

export function originalRoutes(): string[] {
  return ROUTE_MAP.map((mapping) => mapping.original);
}

export function replacementFor(original: string): string | null {
  return ROUTE_MAP.find((mapping) => mapping.original === original)?.replacement ?? null;
}
```

Three conventions produced the `replacement` column, and later plans must follow the same ones:

1. **An action becomes a sub-resource collection.** `/repay` becomes `/repayments`, `/settle` becomes `/settlements`, `/consume` becomes `/consumptions`, `/decision` becomes `/decisions`. The verb moves into the HTTP method.
2. **A resource whose identifier the action needs takes it in the path.** `POST /api/v1/stocks/trade` with `{stockId}` in the body becomes `POST /api/v1/stocks/{id}/orders`; the same reasoning moves `shop/purchases` and `businesses/purchase` under their item.
3. **Idempotent replacement uses `PUT`, removal uses `DELETE`.** Setting a publication state or a user restriction is a `PUT`; unlinking an identity or deleting an account is a `DELETE`, not a `POST` to an `/unlink` or `/delete` path.

One naming collision is resolved deliberately: the original served the business *catalogue* at `/api/v1/businesses` and the caller's own holdings at `/api/v1/businesses/mine`. Those are two different resources, so the catalogue becomes `/api/v1/business-types` and the holdings take the plain `/api/v1/businesses`. The admin routes follow suit.

Add the export to `packages/contract/src/index.ts`:

```ts
export { ROUTE_MAP, originalRoutes, replacementFor } from './route-map';
export type { RouteMapping } from './route-map';
export { isWldAmount, wldAmount } from './money';
export type { WldAmount } from './money';
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @moneyverse/contract test`
Expected: PASS — 12 money tests plus 7 route-map tests.

Then diff the map's `original` column against the inventory from Step 1. The test counts rows; only this proves they are the *same* rows:

```bash
pnpm --filter @moneyverse/contract build
node -e "const { originalRoutes } = require('./packages/contract/dist/route-map.js'); \
  console.log(originalRoutes().join('\n'));" > /tmp/mapped-routes.txt
sort /tmp/original-routes.txt -o /tmp/original-routes.txt
sort /tmp/mapped-routes.txt -o /tmp/mapped-routes.txt
diff /tmp/original-routes.txt /tmp/mapped-routes.txt && echo 'route inventory matches'
```

Expected: `route inventory matches`. Any diff line is a route that was invented or lost — fix the map, never the expected count.

- [ ] **Step 6: Write the human-readable map**

Generate `docs/route-map.md` from the data so the two cannot drift:

```bash
node -e "
const { ROUTE_MAP } = require('./packages/contract/dist/route-map.js');
const rows = ROUTE_MAP.map(m =>
  '| \`' + m.original + '\` | ' + (m.replacement ? '\`' + m.replacement + '\`' : '— (' + m.reason + ')') + ' | ' + m.module + ' |'
).join('\n');
console.log('# 라우트 대조표\n\n원본 애플리케이션 라우트 82개와 이 저장소에서 그것을 대신하는 경로.\n이 문서는 \`packages/contract/src/route-map.ts\`에서 생성된다. 직접 편집하지 않는다.\n\n| 원본 | 새 경로 | 모듈 |\n|---|---|---|\n' + rows);
" > docs/route-map.md
```

Build the contract package first so `dist/route-map.js` exists.

- [ ] **Step 7: Commit**

```bash
pnpm --filter @moneyverse/contract build
git add packages/contract docs/route-map.md
git commit -m "feat(contract): add the route map that proves the port is complete

The original pinned its route surface with a snapshot test. This rebuild
redesigns the API, so the snapshot cannot carry over; this map replaces it.
Every one of the 82 application routes appears exactly once, and a route
with no replacement must state why."
```

---

## What this plan deliberately leaves for later plans

- **Domain modules** — wallet, stock, business, season, shop, board, content, account, privacy, admin, minecraft, discord. Plan 2.
- **OAuth flow endpoints** — the authorize/callback controllers that use `createOAuthChallenge` and `SessionRepository.completeOAuthLogin`. Plan 2, with the auth module.
- **Socket.IO lobby gateway** and its connection caps. Plan 3.
- **The entire frontend** — Next.js, shadcn, theme tokens, fonts, the posting strip, every page. Plans 3 through 6.
- **Sidecar services and deployment.** Plan 7.
- **Prisma introspection** — needs a live database. Run it and commit the generated models when one is reachable.
