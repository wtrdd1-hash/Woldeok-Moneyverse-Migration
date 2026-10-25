# Canonical Rate-Limit Client Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development and superpowers:verification-before-completion for this bounded fix.

**Goal:** Ensure one network peer cannot consume multiple independent authentication/sensitive request budgets merely by changing equivalent IP textual representations.

**Architecture:** Keep the existing trusted-edge choice (CF-Connecting-IP only when enabled; otherwise socket). Validate with `node:net.isIP`, normalize IPv6 using the WHATWG URL parser, collapse IPv4-mapped IPv6 to dotted IPv4, and reject ambiguous repeated CF identity headers. Never use X-Forwarded-For as identity.

**Tech Stack:** NestJS/TypeScript, Vitest, Node 24; no new dependencies or database migration.

**Spec:** `docs/worklog/2026-10-26-hourly-b-v548-rate-limit-ip-identity.md`.

## Tasks
- [ ] Add regression tests in `backend/src/security/rate-limit.test.ts` for canonical IPv6 and IPv4-mapped peer identities, ambiguous CF header arrays, and existing trusted-edge fallback.
- [ ] Run focused tests and record expected RED failures.
- [ ] Implement minimal normalization in `backend/src/security/rate-limit.ts` without changing rate budgets or proxy-trust configuration.
- [ ] Run focused GREEN tests, full backend/contract/security gates, lint, typecheck, build, and audit; record exact SHA and skips.
- [ ] Reconcile fresh main and plans, submit Draft PR only, keep Test/Production HOLD until all required gates pass.
