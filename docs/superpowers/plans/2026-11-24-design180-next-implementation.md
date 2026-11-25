# DESIGN180 Next Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship PR #3443's DESIGN180 visual system and shell on all 180 Next routes, rebuild the highest-traffic family layouts, verify strictly on Test, then promote to Production.

**Architecture:** The token layer (`app/g1-tokens.css`, imported last with `html:root` specificity) already remaps every legacy colour on all 180 routes; swapping its values to DESIGN180 retheme every page in one switch. The shell (sidebar, top bar, dock) and `PageHeader` (used by 107 pages) are rebuilt to DESIGN180 structure. Family layouts are rebuilt route by route on existing loaders.

**Tech Stack:** Next.js 16.4.6 (webpack), React, Tailwind, shadcn/ui, vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-24-design180-next-implementation.md` (owner-approved 2026-11-24: "승인함 엄격한 테스트후 운영서버승격").

## Global Constraints

- Real API data only; unknown = "확인 불가"/unavailable, never 0 or a sample.
- Korean product strings kept verbatim; DESIGN180 English labels only translated where no Korean string exists.
- Rise red `#ff5d73`, fall blue `#4ba3ff`; green `#67d8b2` only for success/verified.
- No eyebrow labels, no hero banner, panels radius ≤ 8px, controls 6px, no decorative gradients/shadows.
- AGENTS.md §6 split (server-only `lib/api.ts`, static public pages, dynamic noindex member pages).
- Every commit carries the `Worker:` line; worklog updated.

## Rulings

- Ruling: inline execution (executing-plans), not subagents — tasks share the shell/token files and must land in order; cost if wrong: slower wall clock only.
- Ruling: open spec questions without an owner answer take the spec defaults (drop ledger strip, no Production Spring deploy, keep read-only guard) — owner approved the spec containing these defaults.
- Ruling: Production promotion of this frontend requires signed-in member/admin evidence (AGENTS.md §7). If no Test sign-in is available, promotion stops at that gate and the owner is asked once.

## File structure

- `app/g1-tokens.css` — values switched to DESIGN180; header comment updated. Test: `app/d180-tokens.test.ts`.
- `components/v10-nav.ts` — add `ADMIN_NAV` (DESIGN180 admin groups) and keep member nav labels.
- `components/game-sidebar.tsx` — DESIGN180 sidebar: brand + subtitle, group label, member or admin list, foot note.
- `components/game-topbar.tsx` — breadcrumb title, search, locale, notifications, avatar/login.
- `components/game-mobile-dock.tsx` — five tabs 홈·퀘스트·거래소·지갑·계정.
- `components/site-shell.tsx` — drop `LedgerStrip`.
- `components/page-header.tsx` — DESIGN180 page head (title, lead, actions right).
- `components/d180/stat-row.tsx`, `components/d180/state-box.tsx` — shared primitives with tests.
- `app/page.tsx` — DESIGN180 home on existing data.

## Tasks

### Task 1: DESIGN180 tokens
- [ ] Write `app/d180-tokens.test.ts` asserting canvas `#0c1020`, surface `#141b2e`, raised `#1b2440`, line `#2d3753`, brand `#a98aff`, rise `#ff5d73`, fall `#4ba3ff`, panel radius cap 8px.
- [ ] Run, expect FAIL (G1 values).
- [ ] Switch values in `g1-tokens.css`; run, expect PASS; full vitest; commit.

### Task 2: Shell (sidebar member/admin, top bar, dock, no strip)
- [ ] Tests: sidebar shows admin nav only for administrators on `/admin*`; member nav otherwise; dock has exactly five tabs; shell no longer renders 원장 상태.
- [ ] Run, expect FAIL; implement; PASS; full vitest; commit.

### Task 3: PageHeader DESIGN180
- [ ] Test: one h1, lead paragraph, actions slot right-aligned, no eyebrow text rendered.
- [ ] FAIL → implement → PASS; commit.

### Task 4: Primitives StatRow + StateBox
- [ ] Tests: StatRow renders label/value/note cells and "확인 불가" for null; StateBox renders the five states with one action.
- [ ] FAIL → implement → PASS; commit.

### Task 5: Home family layout
- [ ] Test: guest sees sign-in prompt in the balance cell, member sees WalletGlance; movers table keeps rise/fall classes; notices list dated.
- [ ] FAIL → implement → PASS; commit.

### Task 6: Strict verification on Test
- [ ] tsc, eslint (touched files), full vitest, Spring suite.
- [ ] Build (twice-safe), deploy Test release.
- [ ] Playwright: 180 routes at 1440 and 390; 320/768/1100 on 20 representative routes; zero JS errors, zero overflow, h1 = 1.
- [ ] Hallmark sloplint on rendered HTML of 13 representative routes.
- [ ] Security re-probe (headers, admin 401/redirect, cross-origin writes, traversal).
- [ ] Signed-in member/admin check (gate; see Rulings).

### Task 7: Production promotion
- [ ] Production build (ad preview off), stage release, swap `moneyverse-next-frontend-v20261124` release path, restart, verify 180 routes live, keep previous release for rollback; record in ops + worklog.
