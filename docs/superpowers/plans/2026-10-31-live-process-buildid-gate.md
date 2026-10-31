# Process Generation Freshness Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reject release evidence when an environment file or release artifact changed after the active systemd service started.

**Architecture:** Read only systemd MainPID/start time, `/proc/<MainPID>/cwd`, and on-disk artifact/environment modification times. Reject missing or stale evidence and PID changes; do not read live process environment. Existing manifest, public endpoint and treasury checks remain required.

**Tech Stack:** Node.js ESM, node:test, systemd, Linux procfs.

**Spec:** `docs/worklog/2026-10-31-hourly-b-v676-live-process-buildid.md`.

## Global Constraints
- No Production/Test mutation, no secrets in logs, no DB writes.
- No relaxation of existing release gates; no merge until exact-SHA verification.

## Review Focus
- Missing process start evidence must block.
- EnvironmentFile newer than process start must block.
- Manifest or build artifact newer than process start must block.
- PID changed while sampling must block.
- No process environment accessed or logged.

### Task 1: Process evidence regression
- [x] Add unit tests for live process start/artifact freshness snapshot.
- [x] Run tests and record RED.
- [x] Implement process start/artifact freshness evidence with PID consistency.
- [x] Run tests and record GREEN.

### Task 2: Release gate integration
- [x] Run release tests, lint, typecheck, build, backend/frontend suites, security/contract.
- [x] Re-fetch latest main and plan; record official Test status and release HOLD.
- [ ] Push Draft/HOLD PR with evidence; do not merge or deploy unless all gates pass.
