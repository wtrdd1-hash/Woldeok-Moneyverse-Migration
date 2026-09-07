# Project gap audit — 2026-09-07

Scope: current `main`, the two unmerged identity/operations branches, the test
and production stacks, PostgreSQL invariants, CI/CD, backups, mobile navigation,
content publication and the public economy surfaces.

## Closed in this change

1. **OAuth key rotation could fork one person into another user row (critical).**
   Identity lookup depended on deterministic ciphertext produced by a mutable
   encryption key. Migration 162 adds a provider-scoped, key-independent lookup
   hash while retaining encrypted storage and preserving a member-chosen name.
2. **The proposed account repair deleted referenced data (critical).** The old
   host script checked only cash and then deleted identities, balances, accounts,
   sessions and the user. It ignored photos, consent, progression, activity and
   work records and could overwrite the chosen name. Migration 163 now moves
   spendable balances through the double-entry ledger, merges supported current
   state, keeps immutable actor history, records an append-only merge event and
   refuses ownership types for which no safe generic policy exists.
3. **Backups existed only around deployments (high).** Each stack now installs
   a staggered ten-minute encrypted full-database and photo-store backup with a
   non-overlap lock, timestamps, result codes and bounded high-frequency
   retention. Production and test write to separate directories on the second
   physical disk.
4. **Deploy SSH reconnected for every step and amplified connection loss
   (high).** The workflow now retries one authenticated, pinned-host-key SSH
   control connection and reuses it for file transfer, rollout and reporting.
   This removes needless reconnects, but it cannot repair host or firewall
   policy that rejects every GitHub-hosted runner connection.
5. **A new ledger type had no member-facing label (medium).** Account merge
   transfers now appear as `계정 통합` instead of the generic activity label.
6. **Lint emitted two configuration-only warnings (low).** React version is
   explicit for the workspace, the obsolete Pages Router rule is disabled for
   this App Router project, and PostCSS exports a named configuration object.

## Verified healthy

- The production gallery returns both approved photo objects and their media
  paths in rendered HTML.
- The shop and wallet read the same canonical wallet overview. The latest
  reconciliation has zero unbalanced transactions, missing balances, balance
  mismatches and ledger/balance delta.
- Work assignment and reward caps are absent in migrations 157 and 159. Repeat
  decay remains an economic policy, not a daily usage limit.
- Production and test databases, image tags, secrets, ports and backup paths are
  separate. A test migration was applied only to `moneyverse_migration`.
- Production dependency audit reports no known vulnerability.

## Remaining work, ordered by risk

1. **GitHub-hosted deploy ingress is currently unavailable (high).** During the
   release, six fresh SSH attempts from the runner timed out before file
   transfer. CI and image publication work; deployment was completed locally on
   the host after the same gates. Restore runner access with a narrowly scoped
   firewall rule, VPN/overlay route or a locked-down self-hosted runner, then
   prove a test deployment before relying on automatic production delivery.
2. **No off-host backup copy (high).** Database volumes and encrypted backups
   are on different physical disks, but one machine loss still removes both.
   Set `BACKUP_COPY_TO` to storage mounted from another machine or object-storage
   gateway and perform a restore drill there. A second live database on the same
   PostgreSQL host is not disaster recovery and was deliberately not presented
   as one.
3. **Restore rehearsal is manual (high).** Every backup is decrypted, CRC-checked
   and compared to manifest figures, but a scheduled restore into an isolated
   PostgreSQL instance would also exercise role and schema recreation.
4. **Mobile browser coverage stops at component and responsive tests (medium).**
   Admin visibility, login/logout and token forwarding are covered in code, but
   CI has no Android Chrome/iOS WebKit end-to-end run against the deployed test
   origin. Add Playwright device projects and an operator test identity whose
   credentials never reach screenshots or artifacts.
5. **Nine intentional raw-image paths still produce performance warnings
   (medium).** Blob previews and unconstrained approved external URLs cannot use
   the default Next image loader safely. Same-origin media should move to a
   sized image component; external sources need an explicit reviewed allowlist.
6. **Backup failures are logged but not alerted (medium).** Add a separate
   watchdog that notifies the private operations channel only when the newest
   verified manifest exceeds one hour or a cron result is non-zero.
7. **GitHub-hosted action runtime deprecation warning (low).** CI currently
   succeeds because the runner forces the affected actions onto Node 24. Upgrade
   those action majors after reviewing their release notes and pinned behavior.

## Release gate

Do not merge or deploy the account continuity stack until CI has executed both
new migrations on PostgreSQL and the real-database account merge test. Before
production application, take and verify a fresh encrypted database/photo backup,
run each merge as a rolled-back dry run, apply it with a unique idempotency key,
then require reconciliation and identity/session checks to pass.
