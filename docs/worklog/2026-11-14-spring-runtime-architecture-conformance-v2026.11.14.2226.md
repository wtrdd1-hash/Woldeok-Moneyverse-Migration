# v2026.11.14.2226 — Spring runtime architecture conformance audit (EN)

**Status:** AUDIT ONLY / P0 RELEASE HOLD. **Date:** 2026-11-14 KST. **Authority:** owner directive, current production service and edge observations, integrated planning master, `AGENTS.md`, `SPRING_BOOT_MIGRATION_REPORT.md`, exact `origin/main` `af619b03c0`. This is not a code release or production promotion.

## Work record
- **Start (22:21 KST):** Inspected miniPC via project MCP before consulting GitHub. Recorded real process, database, and reverse proxy state.
- **Midpoint (22:23–22:25 KST):** Rechecked GitHub main and integrated planning authority; compared deployed frontend configuration, routing, and Spring source; performed read-only status checks only.
- **Completion:** Restricted internal evidence log was saved on the host. No source, API writes, database writes, service restarts, or release mutations occurred.

## Verified architecture facts
- Spring Boot 3.3.5 / Java 21 is running, but the original Node.js/NestJS API remains running. Next.js and PostgreSQL remain in service. This is a **hybrid migration**, not a complete replacement.
- The internal route-splitting gateway exists; the live frontend process configuration does **not yet use that gateway as its observed origin**. This requires routing convergence and release verification.
- The existing integration contract still places business invariants in PostgreSQL functions. The Spring implementation includes direct data-access writes and cannot be considered financially equivalent without independent ledger/permissions tests.
- Spring authorization boundaries and negative-case authentication gates require urgent owner-only review. Sensitive route and actor evidence is restricted to the internal host record; do not publish attack details before mitigation.
- The existing Spring migration report's full-cutover wording is **not supported by the current runtime**. Mark it as a historical/partial-transition claim pending correction, not evidence of full release acceptance.
- Local Spring unit test evidence does not establish parity across all original features, authorized user flows, financial invariants, or the external production edge.

## P0 remediation and acceptance criteria
1. Deny by default on new API boundaries. Prove authenticated user identity, role/ownership, operator step-up channel OTP, and cross-account negative cases, including edge routing. Keep sensitive evidence private.
2. Preserve canonical double-entry ledger transaction authority, transaction idempotency, and database ACL boundaries. Prove financial changes are atomic and cannot bypass reconciliation.
3. Establish one explicitly versioned BFF → internal gateway → Spring/legacy routing contract, with exact live process-environment assertions and immutable rollback.
4. Run isolated real-PostgreSQL authorization tests, authenticated E2E regression on official test stack, route parity, rollback/restore checks and zero-downtime promotion gates.
5. Correct overstated completion reports only after implementation evidence. Distinguish proposed, implemented, tested, and production-verified states.

**Result:** Desired final architecture **NOT YET VERIFIED / NOT COMPLETE**. No implementation or operation changes authorized by this audit. Keep release promotion on HOLD until P0 is verified.
