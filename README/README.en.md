# Woldeok Moneyverse — English

Woldeok Moneyverse is a **community virtual-economy and progression game platform**.

- Production: **https://easy-scraping.com**
- Test: **https://test.easy-scraping.com**
- Stack: Next.js · NestJS · PostgreSQL · Docker Compose · nginx

> WLD, virtual stocks, casino plays, jobs and rewards are in-service virtual data only. They are not real money, securities or gambling products.

## Features

- **Jobs & work**: eight careers, repeatable career tasks, WLD + proficiency EXP and levels
- **Quests & progression**: daily events, NPC/collection goals and long-term stages
- **Wallet & ledger**: auditable economy transactions
- **Shop, inventory & collections**: server-authoritative pricing, stock and discounts
- **Virtual stocks**: prices, charts, buying/selling and market events
- **Businesses**: virtual ownership and earnings loops
- **Banking & credit**: deposits, policy-backed interest, credit-grade loans and bonds
- **Casino minigames**: server-side coin/dice outcomes with themed UIs, self-limits and self-exclusion

## Gameplay balance

Casino outcomes and payouts are decided by the server/database, never by browser RNG. Current baseline policy:

- minimum stake: 10 WLD
- maximum stake: 200 WLD
- daily total stake: 2,000 WLD
- daily realized loss: 1,000 WLD
- baseline RTP: 95%

Members may set stricter personal stake/loss limits. A self-exclusion lock blocks both play and limit changes while active.

Deposit interest uses one server-side rate contract, does not mint a forced minimum 1 WLD, and resets its accrual clock when the deposit balance changes. New loans use the database credit-grade policy.

## Security model

```text
Browser → Cloudflare → nginx → Next.js → NestJS → PostgreSQL SECURITY DEFINER → tables
```

Key rules:

1. Production DB/volumes/user data are never deleted without explicit approval.
2. The application DB role cannot directly mutate core ledger/balance/game tables.
3. Economy writes use reviewed DB functions and idempotency keys.
4. Passwords, API tokens and secrets do not belong in repository documentation.
5. Deployments validate migration checksums, types, tests, builds and backups first.

## Responsive UI

Header/brand visibility is controlled with CSS breakpoints (`display:none` / display utilities). Elements remain in the DOM, so resizing a window naturally hides and restores the logo/navigation without remount logic.

## Development

Node.js 24+ and pnpm 10 are expected.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

The schema source of truth is the ordered SQL migration set under `packages/database/migrations/`. Prisma migrations are intentionally rejected.

## Deployment flow

```text
CI/security checks
  → container build
  → Test migrate/deploy/smoke
  → encrypted Production backup
  → Production migrate/deploy
  → public smoke + DB invariant verification
```

Commit-pinned images and pre-deploy rollback snapshots are used so a release can be reversed without rebuilding.
