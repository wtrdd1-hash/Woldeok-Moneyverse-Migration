# Verified Wallet Movement Amount — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the actual WLD moved by owner-scoped cash↔bank transfers, rather than falsely displaying a zero-WLD movement when the owner's net cash+bank change is zero.

**Architecture:** Preserve the existing owner-scoped PostgreSQL ledger read and signed cash/bank deltas. Compute an exact, non-negative `movementAmount` at the Nest wallet boundary using BigInt, expose it to Android via existing app-api proxy, and render a verified amount (or an unavailable indicator) in both web wallet lists. No migrations or direct DB writes.

**Tech Stack:** NestJS, Next.js, TypeScript, PostgreSQL, Vitest.

**Spec:** docs/planning/F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.md; docs/planning/INTEGRATED_PLANNING_MASTER.md.

## Global Constraints
- English primary, Korean secondary; no financial ledger mutation or grant broadening.
- 38-digit WLD values must remain exact strings; no Number conversion.
- No false zero movement if the owner-scoped pocket proof is unavailable.
- Do not touch other developers' branches, migrations, PRs, deployments, or schedules.
- P0 app-role least privilege and official Test exact-SHA remain release blockers.

## Review Focus
- Zero-net bank deposit and withdrawal show the transferred amount, not zero.
- Nonzero net outflow shows positive magnitude and direction via debit/credit labels.
- Missing/malformed/mismatched pocket deltas fail closed, not fabricated.
- 38-digit values remain byte-exact; unknown neutral amount is not invented.
- Android forwards owner-only JSON with private/no-store, cookies and no cache validators.

## Tasks
- [x] Add failing backend tests for verified `movementAmount` on bank deposit/withdraw, outflow, neutral unavailable, and 38-digit values; confirm RED.
- [x] Add failing web display tests for wallet list and activity page; confirm RED.
- [x] Add failing Android wallet gateway privacy/amount forwarding regression; confirm RED.
- [x] Implement backend derived movement field without altering SQL ownership or migrations; GREEN.
- [x] Wire both wallet UI surfaces to validated movement amount and unknown indicator; GREEN.
- [x] Harden only wallet app-api response caching and prove amount preservation; GREEN.
- [x] Run focused tests, full lint/typecheck/build/unit/contract/security, real-PG read-only proof, GitHub CI, and exact-SHA Test if gates permit.
- [x] Record start/mid/end main SHA, branch/PR/CI counts, Test/Production/rollback and protected branch decisions; leave Draft/HOLD on any failed gate.
