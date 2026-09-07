# 2026-09-07 Gameplay / UX / Economy Release Worklog

## Purpose

This worklog records the reasoning and verification behind the `v2026.09.07` stabilization release. It is intentionally more operational than the public release notes.

## Scope

- Google OAuth callback diagnosis/recovery logging
- public navigation/terms/privacy/status/updates organization
- quest event truthfulness and market-sale effect
- work/career integrity and modal UX
- casino result UI, history, self-limit wording and exposure balance
- banking interest/credit contract reconciliation
- WLD exact-integer handling
- database privilege boundaries
- runtime version/hardening reconciliation
- Test/Production deployment pipeline reconciliation
- multilingual README/release documentation

## Major findings

### Work
- legacy and current work catalogs could produce inconsistent active task counts on a fresh database;
- an old assignment path could bypass the active-career expectation;
- two level formulas could represent the same EXP differently;
- the generic legacy work reward acted as a parallel WLD faucet;
- a slow network response could make the completion modal appear stuck even after settlement.

### Casino
- a theme animation could visually show a jackpot after a losing server receipt;
- payout numbers were duplicated in frontend copy instead of reading server terms;
- recent game history incorrectly depended on a small generic wallet feed;
- member self-lock wording understated that it was actually a play lock/self-exclusion;
- platform exposure was too loose relative to the observed member cash/work-reward scale.

### Banking
- the displayed/manual deposit rate and automated rate had drifted;
- very small interest could be forced up to 1 WLD and repeatedly claimed;
- deposit timing allowed risk of applying elapsed time to a newly changed balance;
- a smart-loan path bypassed the established credit-grade loan policy.

### Deployment / source drift
- some tested runtime/security fixes had been applied directly to stacks but not yet preserved in `main`, so later deployments could revert them;
- CI runtime versions lagged Production;
- hardened Host behavior conflicted with the old local smoke test;
- a manual Production backup could accidentally default to the Test deployment directory;
- one Test migration checksum represented a draft while Production/source held the canonical form.

## Resolution strategy

1. prefer actual server/database state over stale documents;
2. preserve user data/ledger history;
3. convert discovered behavior into regression tests;
4. validate on a fresh PostgreSQL 17.11 database;
5. canary on Test;
6. take and verify a Production backup;
7. deploy Production;
8. push source to `main` so the next deployment cannot silently undo the fix;
9. run official GitHub Test/Production workflows and verify their commit-tagged images.

## Key migrations

- `165` market-sale starter discount
- `166` work-system integrity
- `167` close unintended public function execution
- `168` admin shop boundary
- `169` admin control-center money contract
- `170` gameplay history/event truth
- `171` casino balanced exposure
- `172` banking gameplay contract

## Final gameplay/economy baseline

### Work
- 8 careers × 3 current tasks = 24 active tasks
- one active career per member
- repeatable task rewards with one level formula
- timeout-safe idempotent completion UX

### Casino
- 95% baseline RTP on disclosed core games
- 10–200 WLD per play
- 2,000 WLD daily platform stake exposure
- 1,000 WLD daily realized-loss exposure
- member self-limits/self-exclusion can be stricter

### Banking
- one interest contract for display/settlement
- no forced 1-WLD minimum faucet
- balance changes reset accrual timing
- new loans use credit-grade policy

## Validation snapshot

- backend DB/application tests: **1,367 / 1,367 passed**
- frontend tests: **519 / 519 passed**
- lint: **0 errors**
- typecheck/build: passed
- secret/control-byte/Prisma mutation guards: passed
- Test canary: passed
- official GitHub Test deploy: passed
- official GitHub Production deploy: passed
- Production main routes: passed
- Production migration level: 172

## Data handling

No Production database volume, user account data, ledger history or existing loan/bond contract was deleted for this release.

## Remaining infrastructure risk

Host-local encrypted backups exist and are verified, but off-host disaster recovery should still be configured and restore-tested.
