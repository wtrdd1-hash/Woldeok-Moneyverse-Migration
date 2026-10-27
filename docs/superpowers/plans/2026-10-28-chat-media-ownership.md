# Chat Media Ownership and Recipient Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent an authenticated but unauthorized member from downloading another member's chat media by knowing the storage key.

**Architecture:** Register scanned image keys with their uploading member in a private PostgreSQL table using a SECURITY DEFINER function. Permit reads only to the uploader or verified participants of a message authored by that uploader and containing the exact media URL; support admins can view support-thread attachments only with an active admin role. All unregistered legacy keys fail closed. Backend checks DB before reading bytes. Frontend/Android keep same URL contract and no-store response policy.

**Tech Stack:** NestJS, PostgreSQL 17, Vitest, Next.js.

## Tasks
- [ ] Write failing HTTP/controller tests for owner and recipient authorization; run RED.
- [ ] Add migration 286 registry and owner/recipient function, revoke PUBLIC/table privileges; add isolated PostgreSQL tests.
- [ ] Add repository and backend controller wiring, fail closed, cleanup file on DB registration failure; run GREEN.
- [ ] Add web/Android contract regression, verify no-store, noindex, accessibility and error behavior.
- [ ] Recheck latest main and candidate SHA, run all feasible gates and hold merge/deploy on any failure.

## Safety and rollback
- No writes to shared dev/Production DB. Forward-only migration is additive; roll back application deployment, preserve registered metadata for later safe cleanup. Never edit an applied migration.
- Pending QA #1610 resolves migration numbering; do not overwrite it. Reserve 286 provisionally and recheck before any integration.
