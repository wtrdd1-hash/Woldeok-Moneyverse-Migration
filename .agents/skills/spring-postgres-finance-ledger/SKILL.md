---
name: spring-postgres-finance-ledger
description: Design or review Spring JDBC PostgreSQL access for wallet, treasury, mint, bonds, SWF, banking and other ledger-sensitive money operations. Use when migrating financial workflows or fixing money integrity; requires real database ACL and concurrency evidence.
---
# Spring plus canonical PostgreSQL finance core

## Non-negotiable boundaries
- Read `AGENTS.md` finance rules, the existing numbered migrations and latest financial integrity design before code. PostgreSQL `SECURITY DEFINER` functions, not Java entities, own authoritative transfers and ledger postings.
- Connect the application as a least-privilege app role. Never grant direct writes to accounts, balances, ledger, audit or identity tables; no JPA `save()` or bulk updates to bypass the function boundary.
- Never edit applied/checksummed migrations or reset live money data. Add reviewed forward-only migrations through the existing migration authority, retaining revoked permissions and a constrained `search_path`.

## Workflow
1. Trace exact Nest transaction call -> DB function -> postings -> outbox -> receipt -> client contract. Prove parity under one DB snapshot.
2. Use parameterized JDBC / `JdbcTemplate` function calls; pin exact numeric and microsecond timestamp wire formats. Validate actor identity and authorization in the database too.
3. Preserve idempotency keys, unique receipt semantics, debit-credit equality, lock ordering, timeouts, failure rollback and single active write owner during cutover.
4. Add real-PostgreSQL negative ACL tests and concurrent duplicate/retry tests; inspect function grants and search paths as the app role.

## Release gates
Block financial cutover for any unknown provenance, duplicate transfer, privilege expansion, ledger divergence, unverified backup/restore or missing exact-SHA Test result. Report evidence as VERIFIED / FAILED / UNKNOWN without inventing clean status.
