# Production Public Main Provenance Watch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps are independently verifiable.

**Goal:** Fail closed when public Production backend/frontend identity is not the current GitHub main SHA, including a self-consistent but unmerged release.

**Architecture:** A read-only Node verifier takes an independently obtained canonical main SHA, probes fixed public Production backend/frontend version endpoints without cookies, and returns stable machine-readable PASS/BLOCKED evidence. The existing scheduled read-only GitHub Actions inventory job obtains main from GitHub API, runs verifier and fails when identity is missing, stale, divergent or unmerged. It never triggers deployment or writes server state.

**Tech Stack:** Node 20+ ESM, node:test, GitHub Actions, gh CLI.

**Spec:** QA v1410 P0 release provenance and issue #2031; existing verify-host-runtime-identity.mjs is a separate host gate.

## Global Constraints
- Production API probes GET only, no credentials or member data.
- Never infer approval from matching public versions alone; compare both to independent main SHA.
- No database, WLD, Test, Production, merge or deployment mutation.
- A mismatch is a BLOCKED alert, not proof of malicious activity.

## Tasks
- [x] Write failing tests for valid SHA, unmerged matching backend/frontend, stale/missing/malformed version, HTTP errors, and independent disagreement.
- [x] Run RED; implement minimal pure verdict and read-only CLI; run GREEN.
- [x] Add a read-only step to existing auto-integrate-promote workflow using GitHub API main SHA, no new schedule, no write permissions, and no deployment permissions.
- [ ] Run focused test, lint, typecheck, full test/build, and remote CI; retain HOLD if any required gate incomplete.
