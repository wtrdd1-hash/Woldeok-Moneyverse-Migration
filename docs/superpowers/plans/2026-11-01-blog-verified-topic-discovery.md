# Verified Editorial Topic Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let visitors and Android clients find verified published educational articles by economy, coding or computer subject without exposing withdrawn articles or inventing results.

**Architecture:** Reuse the existing PostgreSQL `blog_verified_public_list()` SECURITY DEFINER projection, capped at the latest 150 published rows; apply exact topic filtering in Nest after that bounded read. The Next blog hub marks verified editorial rows with their authenticated topic and offers an accessible topic filter without conflating seed articles. Android's gateway allows only public verified blog paths, rejects malformed queries, and fails closed on an ignored filter or malformed HTTP 200.

**Tech Stack:** NestJS, Next.js, TypeScript, Vitest, PostgreSQL 17.

**Spec:** docs/planning/PROJECT_PLAN.md and docs/planning/PROJECT_PLAN.ko.md (canonical/secondary), AGENTS.md, SQL migration 298 (immutable).

## Global Constraints
- No direct table grants, no changes to numbered migrations, no WLD/ledger mutations.
- The source is only the latest 150 published verified articles, not the complete archive; no full-archive count claim.
- Reject duplicate, unsupported and empty `topic`; keep no-filter responses backwards-compatible.
- Mobile public paths are allowlisted; never expose admin blog paths via gateway.
- Query-specific responses must not be cached/indexed; public canonical blog pages retain existing SEO.
- English code and docs, Korean second-language user labels.

## Review Focus
- Repeated topic query keys, lowercase/unknown/empty values, and other unsupported keys.
- Upstream 200 ignoring a requested filter or returning withdrawn articles.
- Misleading empty state when the source is unavailable.
- Cross-country topic labels and static posts without a verified publication receipt.
- DB app role bypass via direct SELECT rather than the approved SECURITY DEFINER function.

## Tasks
- [x] 1. Add backend RED tests for strict topic query validation and filtered, published-only, bounded rows; observe failure.
- [x] 2. Implement backend query and repository projection; GREEN.
- [x] 3. Add frontend RED tests for verified-topic identity and filtering; observe failure.
- [x] 4. Implement accessible topic selection on the public blog; GREEN.
- [x] 5. Add Android gateway RED tests for path allowlist, invalid/duplicate query, ignored filter and malformed 200; observe failure.
- [x] 6. Implement allowlisted app-api route and strict response verification; GREEN; update contract.
- [ ] 7. Run targeted/full tests, build/lint/typecheck, isolated DB read-only ACL, CI, exact SHA Test/Production gates. Record failures; HOLD until proven.
