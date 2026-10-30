# Offline Candidate Font Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove unpinned Google CSS/font binary responses from clean candidate image compilation while retaining Korean/English typography and self-hosting.

**Architecture:** Install pinned Fontsource packages from pnpm's immutable lockfile; import CSS in the root layout; preserve existing CSS variables in global CSS. No runtime remote font calls or manual font binary distribution.

**Tech Stack:** Next.js 16, pnpm 10, Fontsource, Vitest, Docker Alpine.

**Spec:** GitHub issue #2107, PR #2106 candidate-image failure.

## Global Constraints
- No financial, auth, SQL, permission, Test or Production changes.
- Preserve font-display swap and unicode-range sharding; avoid CJK preload explosion.
- Fail release if Docker build, exact SHA CI, or authenticated Test gate is not proven.

## Review Focus
- Offline build after npm dependencies installed.
- Korean glyphs remain available through unicode-range assets.
- No accidental font preload on every request.
- CSS family variables resolve to installed package names.
- CSS changes preserve SEO/meta and auth gates.

### Task 1: Deterministic font loader
- [x] Add regression tests that fail with `next/font/google` and missing local imports.
- [x] Run RED tests.
- [x] Install pinned packages and switch layout/CSS to local font CSS.
- [x] Run GREEN tests and verify asset paths.

### Task 2: Candidate release proof
- [ ] Build contract, typecheck, lint, unit tests.
- [ ] Build clean Alpine Docker candidate with no remote Google font dependency.
- [ ] Verify exact SHA CI, full test and official Test gate; HOLD if incomplete.
