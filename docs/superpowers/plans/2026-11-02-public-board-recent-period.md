# Recent Public Board Period Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Filter the existing latest-50 public board snapshot by a verified 24-hour, 7-day, or 30-day window on web and Android.

**Architecture:** Nest validates period and applies a bound SQL cutoff after the existing SECURITY DEFINER public list function. Next UI and Android App API consume an explicit verified source cutoff, never infer success from empty results.

**Tech Stack:** NestJS, PostgreSQL 17, Next.js, Vitest, TypeScript.

**Spec:** `docs/superpowers/specs/2026-11-02-public-board-recent-period.md`

## Global Constraints
- No migration, balance write, direct table grant, new route, or alteration to other development branches.
- Only latest 50 public rows; UTC period cutoff, validated source evidence, private/noindex filtered HTTP.
- TDD RED then GREEN, exact-SHA CI, official Test E2E and GitOps release gates; no production on HOLD.

## Tasks
- [x] Add failing Nest controller/service period validation and SQL binding tests; implement minimal period filter.
- [x] Add failing web period parser/SSR test; implement labelled selector and truthful metadata.
- [x] Add failing Android gateway stale/duplicate/invalid source tests; implement fail-closed validator and headers.
- [ ] Run target/full tests, lint, typecheck, build, real PostgreSQL read-only, security audit and contract parity.
- [ ] Re-fetch main, inspect open PR conflicts, record SHA/branch/QA/release, create Draft PR, HOLD on missing gates.
