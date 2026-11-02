# C v1302 — START — 2026-11-02 16:31 KST
main: a8541927c3a351d980454c66e95a3356c47e0722
branch: auto/hourly-c-bond-owner-proof-v1302-20261102-1645
Source: latest main, AGENTS.md, README.md, README/README.ko.md, English/Korean PROJECT_PLAN.md, active PRs (A/B/C/Planning/QA), QA v1465/v1466 inspected. MiniPC Debian 13.6 7 services active, development DB connected.
P1 source proof: public /bonds mixes unverified member holdings and repo loans into public SSR; errors become false empty; Android app-api inherits public cache and exposes unvalidated owner rows. Existing Nest endpoints bind actor to session and use migration 312 SECURITY DEFINER owner reads. No new finance write or SQL grants. TDD, source parsing, private headers, accessibility, full gates, draft PR. Protect all other worktrees and main.
