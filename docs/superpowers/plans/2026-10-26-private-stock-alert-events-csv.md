# Private Stock Alert Event CSV — Bounded Design and Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development and verification-before-completion.

**Goal:** Let authenticated members download a truthful, private snapshot of their latest 100 triggered virtual-stock alerts, with Android API parity.

**Architecture:** NestJS session guard supplies actor to existing PostgreSQL SECURITY DEFINER `stock_alert_events_list(actor,100)`. Next.js BFF verifies session, validates the complete bounded JSON snapshot and emits CSV with formula and control-byte defenses; Android app-api proxies the authenticated JSON with explicit no-store/noindex. No schema or ledger mutation.

**Tech Stack:** NestJS, Next.js App Router, PostgreSQL 17, Vitest, pnpm 10.

**Constraints:** No direct app-role table DML; 100 rows maximum, truthful 'recent' scope, canonical integer strings for virtual WLD, no incomplete export success, owner only, no cache/index, no simulated trade receipt, avoid overlapping A/B/C/QA changes.

**Tasks:**
- [ ] 1. Add backend RED tests for session-derived actor, bounded 100, failure closure, then implement read-only snapshot GET.
- [ ] 2. Add frontend RED tests for complete CSV validation, spreadsheet injection, large WLD, duplicates and timestamps; implement pure serializer.
- [ ] 3. Add Next route RED tests for guest/unknown/503/private headers and success, then implement.
- [ ] 4. Add Android gateway RED tests for private cache/noindex and contract, then implement; add accessible link and bilingual text.
- [ ] 5. Isolated PostgreSQL owner/non-owner/ACL read-only rollback; full lint/typecheck/build/unit/contract/security/E2E and exact SHA CI/Test release gate.
- [ ] 6. Mid/pre-integration main+plan rechecks; QA, release EN/KO and worklog, PR only if safe. No merge/deploy without every gate PASS.

**Review focus:** missing auth, over-100 truncation, malicious spreadsheet values, timestamp/precision corruption, Android caching, Test SHA mismatch.
