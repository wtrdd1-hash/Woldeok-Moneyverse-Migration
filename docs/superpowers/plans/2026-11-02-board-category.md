# Public Board Category Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans; tests RED before implementation.

**Goal:** Allow anonymous web and Android readers to filter the latest 50 public board posts by verified stock discussion category.

**Architecture:** Reuse existing PostgreSQL SECURITY DEFINER public list and append an exact category predicate after its 50-row boundary; no new migration or direct table grant. Nest validates the enum and echoes a filter marker; Next and Android reject legacy success-shaped responses missing that marker or returning mismatched/duplicate rows. Default unfiltered behavior stays unchanged.

**Tech Stack:** NestJS, Next.js, PostgreSQL 17, TypeScript, Vitest.

**Risk:** Production locale HTTP500, app-role ACL and official Test gates remain P0; this PR must remain Draft/HOLD. No production deployment.

- [x] Task 1 RED: Backend service/controller category and invalid/empty tests. GREEN: SQL category predicate, validation, source marker.
- [x] Task 2 RED: Next parsing/rendering and metadata tests. GREEN: accessible filter form, verified-only rendering, noindex.
- [x] Task 3 RED: Android gateway invalid/empty/mismatch/duplicate tests. GREEN: fail-closed proof and no-store.
- [ ] Task 4: Exact-SHA targeted/full suites, PostgreSQL read-only proof, security, lint, typecheck, build, CI; publish QA/release HOLD and PR.

**Rollback:** disable feature by reverting candidate branch/PR; no DB schema or ledger writes.
