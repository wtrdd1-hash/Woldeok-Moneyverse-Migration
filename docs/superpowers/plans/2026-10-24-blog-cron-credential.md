# Blog Cron Credential Hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove literal credentials from scheduled curl process arguments and eliminate insecure scheduler fallback without altering live Production cron.

**Architecture:** Add a fail-closed shell runner that reads a strictly permissioned on-host HTTP header file through curl's `--header @file` option. Preserve endpoint and schedule via documented operator-only rollout; never commit or print the credential. Refuse missing/invalid file and prevent a request.

**Tech Stack:** POSIX shell, curl, Node.js test runner, NestJS scheduler.

**Spec:** GitHub Issue #1137.

## Global Constraints
- No live cron changes, credential rotations, DB writes, or Production release in this development task.
- Work on independent branch from latest main; all required CI and exact-SHA Test must pass before merge.

## Tasks
- [ ] Add no-network test proving missing/weak/symlink/malformed header files fail before curl and valid file sends only a path in argv.
- [ ] Execute test and capture RED.
- [ ] Implement minimal fail-closed shell runner; re-run test GREEN.
- [ ] Add regression for backend scheduler's hardcoded credential fallback; remove fallback.
- [ ] Run full repository gates and document blockers.
- [ ] Commit, push and open Draft PR without Production changes.

## Implementation checkpoint
- [x] RED test confirmed 6 failures.
- [x] GREEN test confirmed 6 passes.
- [x] Scheduler hardcoded fallback removed; missing credential skips before network call.
- [ ] Full CI, exact-SHA Test, security review, and approved rotation pending.
