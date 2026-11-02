# v1626 Owner-authorized Legacy Finance Reset Implementation Plan

> For agentic workers: use systematic-debugging, TDD RED-GREEN-REFACTOR, isolated worktrees, verification-before-completion and restore-first release discipline.

**Goal:** Archive, quarantine and remove only historical financial *projection* rows that have no valid canonical double-entry source, reset unbacked nominal NPS/KDIC counters to zero, and keep independently funded future transaction paths distinct.

**Architecture:** Forward-only PostgreSQL migration 325 runs under moneyverse_migrator after SHA256-verified full DB backup, locks legacy source tables, refuses legitimate/current financial activity, writes row-by-row SHA256 archive, then clears only explicitly eligible legacy tables and revalidates member balance and ledger invariants before commit. Admin and member roles cannot edit/read the archive directly.

**Release:** Isolated Production DB full restore, SQL325 tests, CI migration parity, Test DB pre-snapshot and canary, Production exact-SHA zero-downtime cutover after DB proof. Do not force historical monetary issuances or transfers.

## Tasks

- [x] Collect main/current runtime and documents, legacy source tables, FKs, source epochs, backing balances and row counts.
- [x] Full Production read-only backup to separate disk, retain SHA256 and verify restore.
- [x] TDD RED: fail on missing finance-reset archive in cloned Production.
- [x] Implement archived reset SQL325 with supplied backup checksum and serializable transaction/negative checks.
- [x] TDD GREEN in **two independent cloned-production databases**: 1546 rows archived, 552/744/238 old source counters clear, NPS/KDIC model fund 0, member canonical funds and 891+ transactions/1829+ postings untouched.
- [x] Negative missing verified backup SHA test: reset aborts transaction. Correct SHA succeeds.
- [ ] Full GitHub CI on forward migration and English/Korean docs.
- [ ] Official Test snapshot/clone, database migration, controlled HTTP pages and verified exact release SHA.
- [ ] Production backup recheck, DB migration and verified readback, zero-downtime exact-source release, preserve rollback.
- [ ] If currency supply/funding remains 0, separate authorized genuine WLD issuance and funded payout capabilities; never report merely zeroing old history as all payouts operational.

**Boundary:** The archived legacy amounts may have represented gameplay obligations. They are retained with original IDs, payloads and per-row SHA256 hashes, and any claims require source-level audit. Canonical member accounts and posted money are not erased. Previously verified funded Treasury Core flows remain available for future independent funding.
