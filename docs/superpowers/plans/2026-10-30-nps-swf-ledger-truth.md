# NPS/SWF Ledger Truth Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for independently testable tasks; enforce RED-GREEN-REFACTOR.

**Goal:** Reject every uncertified SWF settlement attempt and remove misleading pension asset/rate presentation without minting or moving WLD.

**Architecture:** Backend SWF write entrypoints are fail-closed before database access; NestJS controller and Next.js BFF return explicit 503. UI keeps verified administrative reads but disables financial execution. NPS public rendering distinguishes API unavailable from authentic zero balances; annual rate remains unverified until source/math reconciled.

**Tech Stack:** NestJS, Next.js, PostgreSQL (no migration in this patch), Vitest, TypeScript, systemd Test runtime.

- [ ] Reproduce failures: backend SWF containment and Next.js pension evidence.
- [ ] Add/update tests for no DB touches even when runtime flags are true, correct SWF 503 codes and immutable events; ensure RED.
- [ ] Make SWF service/administrative boundaries fail-closed and disable unverified scheduler and UI execution control; ensure GREEN.
- [ ] Integrate or independently verify the existing P1 NPS rate-truth candidate and add degraded API tests; ensure RED/GREEN.
- [ ] Run focused suites and gate checks: typecheck, frontend build, isolated Test HTTP and backend health; no production finance mutation.
- [ ] Fetch newest main, reconcile branch, maintain two-language changelogs, push PR, promote only after verified release gates.
