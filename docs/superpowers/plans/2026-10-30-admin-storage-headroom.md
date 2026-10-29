# Verified Admin Storage Headroom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show truthful operator-only ROOT/DATA disk and inode headroom from signed host evidence; fail closed on missing or stale evidence.

**Architecture:** Host-only collector signs a bounded JSON snapshot using a separately provisioned key. NestJS verifies signature, freshness, host identity and monotonic sequence; Next admin UI displays the verified two-mount read-only result. No SQL or public/Android endpoint is added.

**Tech Stack:** Node 20+, NestJS, Next.js, HMAC SHA-256, fs.statfs BigInt, Vitest.

**Spec:** Planning Draft #1949, improvement #1954, issue #1948; current release HOLD.

## Global Constraints
- No secrets in repo or responses; fixed ROOT/DATA mounts; never accept arbitrary path, shell command or user ID.
- Fail closed: stale/forged/invalid/container evidence => 503/UNKNOWN; no fake green status.
- Read-only, no DB schema changes, no money mutations, no automated cleanup.
- Host collector provisioning and complete release gates remain separate HOLD prerequisites.

## Review Focus
- `f_bavail` differs from `f_bfree` (reserved blocks must not count as operator headroom).
- Forged HMAC, changed boot identity, stale/future timestamp and malformed sizes.
- Container namespace masquerading as host; key must not be mounted into containers.
- Duplicate ROOT/DATA mount aliases and negative/overflow values.
- Unauthenticated or non-admin access and cache/indexing leakage.

## Tasks
- [ ] Write RED tests for signature, source, freshness, byte/inode math, severity and bad inputs.
- [ ] Implement fixed-path signed host collector and strict backend parser, then GREEN tests.
- [ ] Write RED controller authorization/privacy tests; implement admin-only read endpoint.
- [ ] Add Next admin page and link, fail-closed UI tests and no public/mobile exposure.
- [ ] Run exact-HEAD targeted/full gates; record all failures and no deployment.
