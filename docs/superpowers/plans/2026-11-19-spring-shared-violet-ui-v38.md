# Spring Native Shared Violet UI and Safe Support Dock — Implementation Plan v38

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or subagent-driven-development) to implement this plan task-by-task. Steps use checkboxes.

**Goal:** Implement the approved navy/violet design system on genuine Spring-rendered pages without touching the concurrent homepage or unsafe member-financial writes.

**Architecture:** Existing Spring MVC server returns authorized admin HTML via LiveAdminUsersPage.renderPage and calculator/tool Thymeleaf pages via mv28/layout. Add a shared CSS-only 56px circular support dock with accessible `details/summary`, and a responsive admin shell based on the admin reference. Keep role enforcement, real data/UNKNOWN/HTTP error codes unchanged.

**Tech Stack:** Java 21, Spring Boot 3.3, Thymeleaf, semantic HTML, scoped CSS, JUnit 5. No Node runtime.

**Spec:** `docs/planning/SPRING_ONLY_FRONTEND_OWNER_DIRECTIVE_v2026.11.18.28.md`; `https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/main/docs/planning/SPRING_HOME_VISUAL_IMPLEMENTATION_GATES_v2026.11.19.32.1.md`.

## Global Constraints
- No change to concurrent v37 Spring `static/index.html`, route `/`, finance, sessions/OTP, DB, Nginx or current public releases.
- English default/Korean option; actual data only; no status badges without source, no untrusted actor headers.
- One 56px global help dock per page, no chat send until P0 auth/receipt QA. WCAG keyboard/44px targets/mobile safe areas.
- Source-level acceptance does not authorize publishing unverified server-wide changes.

## Review Focus
- Member auth denied route must stay redirect/403 without inadvertently exposing admin UI.
- Missing backend records must preserve explicit 503 rather than showing empty success.
- Mobile 320px dock must not hide content/menus; 200% zoom + focus.
- Browser without JS must still reach support via semantic anchor.
- Any user-sourced name must remain HTML-escaped.

## Tasks
- [x] Write RED tests for admin shared shell and safe help semantics; run and inspect failures.
- [x] Implement Spring-native admin UI shell and site-wide help visual, preserving controller output and roles; rerun GREEN.
- [x] Write RED tests for Thymeleaf footer dock and mobile safe-area styles; implement shared style and update fragment; rerun GREEN.
- [x] Run focused tests, full Spring Java tests & bootJar, isolated Test if possible, visually verify browser and server output.
- [x] Reconfirm GitHub main and collaborators; write MID/END logs, bilingual planning/QA/changelog updates, commit in isolated branch, attempt clean PR if baseline available.
- [ ] Only scoped Production promotion if exact-SHA full security/browser/functional/rollback gates clear; otherwise record HOLD and keep services unchanged.

## Evidence gate note
- Full Java clean test bootJar 251/251 passed on local integrated baseline, 4 H2 random-port HTTP checks passed, as of 2026-11-19 ~14:33 KST.
- No Chrome/browser screenshot, authenticated positive finance/DM, exact official Test or rollback evidence. Production promotion is blocked; do not confuse user authorization with acceptance testing.
