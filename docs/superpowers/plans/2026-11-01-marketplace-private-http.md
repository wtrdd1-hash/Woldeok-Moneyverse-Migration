# Marketplace Owner HTTP Privacy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep owner-specific marketplace and trade responses non-cacheable even when Nest guards reject a request.

**Architecture:** Apply narrow Nest module middleware before route guards; leave active listing/auction GET and black-market reads unchanged. No DB or ledger changes.

**Tech Stack:** NestJS, Express, Vitest, Supertest.

- [ ] Add HTTP integration tests for 401 owner endpoints, 403 consent, authenticated 200, HEAD, unaffected public GET.
- [ ] Run focused tests RED and record missing headers.
- [ ] Implement route/method-scoped privacy middleware in MarketplaceModule.
- [ ] Run focused tests GREEN, then lint, typecheck, build and repository tests.
- [ ] Recheck origin/main, PR overlap and CI; record blocked release gates and preserve Draft/HOLD.
