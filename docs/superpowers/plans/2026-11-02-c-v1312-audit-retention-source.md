# Audit Retention Evidence Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refuse contradictory privileged retention overview evidence before displaying a compliance status or exposing policy controls.

**Architecture:** Reuse existing NestJS admin audit retention endpoint and SECURITY DEFINER PostgreSQL function from migration 065; tighten the Next.js server-side runtime parser. No API/DB schema changes and no client-supplied identities.

**Tech Stack:** Next.js, TypeScript, Vitest, NestJS, PostgreSQL 17.

- [x] Write tests rejecting zero expired rows with non-null bounds, nonzero expired rows without bounds, and unmatched disposition/time.
- [x] Run focused tests and capture RED.
- [x] Implement minimal parser consistency checks, keep valid empty and populated evidence.
- [x] Run focused tests GREEN and page regression.
- [x] Reproduce real HTTP SEO regression, add failing edge test and fix exact route-specific headers.
- [x] Run initial gates and isolate blockers; final exact-SHA gates pending, record failures; re-fetch origin/main before PR and release decisions.
- [x] Commit implementation and EN/KO worklog, push Draft PR; hold merge/deploy unless every release gate passes.
