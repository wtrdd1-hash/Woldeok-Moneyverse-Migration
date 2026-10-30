# Public NPS Overview Least-Privilege Read Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore the public pension overview read without granting `moneyverse_app` raw pension table access or enabling uncertified pension settlement.

**Architecture:** Add one read-only aggregate SECURITY DEFINER SQL function in forward-only migration 308, stacked after unmerged audit ACL migration 307. The Nest repository calls only that function and treats absent vault evidence as 503 rather than synthetic zero.

**Tech Stack:** PostgreSQL 17, NestJS, TypeScript, Vitest, Docker isolated PG.

- [x] Reproduce: add repository unit tests proving only the scoped function is queried and absent vault data fails closed; run RED.
- [x] Implement: new 308 migration with restricted EXECUTE and public aggregate only; replace two direct SELECTs in repository; run GREEN.
- [x] Verify: isolated PostgreSQL role ACL, data precision, no writes, missing vault, function grants; backend typecheck, focused tests, builds, lint, contract and security gates.
- [ ] Recheck latest main and plan; document exact SHA, dependent PR, release HOLD and missing Test/Production evidence.
