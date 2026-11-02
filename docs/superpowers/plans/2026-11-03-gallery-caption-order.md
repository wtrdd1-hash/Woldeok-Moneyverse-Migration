# Bounded Gallery Caption Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver bounded public gallery description ordering through PostgreSQL, Nest, web, and Android gateway.

**Architecture:** Sort only the rows emitted by the existing approved-gallery SECURITY DEFINER function, without new SQL migrations. Explicit query validation and fail-closed Android proof preserve the public-source contract.

**Tech Stack:** PostgreSQL 17, NestJS, Next.js 16, TypeScript, Vitest.

**Spec:** docs/superpowers/specs/2026-11-03-gallery-caption-order.md

## Tasks
- [ ] Record exact main, PR, branch, CI and QA baseline; create isolated branch/worktree and log start.
- [ ] RED: add backend controller/service/repository tests for sort validation, SQL scope and unchanged default; run failing tests.
- [ ] GREEN: implement Nest query validation, service and read-only SQL ordering; run targeted tests.
- [ ] RED: add web query parser and Android gateway contract tests for ordering, malformed/duplicate/unknown parameters, fail-closed response, SEO headers; run failing tests.
- [ ] GREEN: implement gallery GET selector, noindex metadata and Android response proof; run targeted tests.
- [ ] Verify real PostgreSQL read-only function + SQL ordering, contract, build, lint, typecheck, backend/frontend suites, security and SEO/a11y where available.
- [ ] Re-fetch latest main and plans mid/finish, compare other agents' PRs, record SHA/evidence, open Draft PR, keep HOLD unless all release gates pass.
