# v2026.11.17.4 Server log lifecycle implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement enforceable 7-day routine / 30-day important compressed server-log storage and secure administrator searchable history while retaining the existing 5-second real-time tail.

**Architecture:** Independent Python 3 stdlib service collects allowlisted Nginx and systemd events into redacted, class-segregated UTC hourly spool, verifies gzip-compressed closed segments, and expires events based on event timestamps. A read-only Spring adapter provides bounded historical queries for the authenticated superadmin admin console, with Next.js server actions and UI; no direct caller-chosen paths or SQL changes. Rollout remains opt-in (systemd timer and archive provisioned separately) and blocked for Production without actual Test + restore QA.

**Tech:** Python 3, systemd/journald, logrotate, gzip, Java/Spring Boot, Next.js/TypeScript, JUnit, unittest.

**Spec:** docs/planning/RUNTIME_LOG_RETENTION_ADMIN_CONSOLE_v2026.11.17.3.md

## Global constraints
- Existing security-hardening branch code is incorporated via committed base; do not touch its active worktree.
- Read-only historical query; logging must not leak tokens/PII or expose arbitrary paths, shell, regex queries.
- Do not modify currently live /etc/nginx, systemd or archived logs without official Test and rollback evidence. No SQL/ledger or financial audit record mutations.
- Event-time 7/30-day retention, separated classification, gzip fallback to zstd; fail-closed source status, explicit capacity/read limits.

## Deliverables and verification
- [x] **Collector lifecycle**: add `ops/logging/log_lifecycle.py`; TDD of severity classification, redaction, replay idempotency, hourly closed compression checksum, expired event filtering and source failure handling. `python3 -m unittest discover ops/logging/tests -v`.
- [x] **Read API**: Spring service/process adapter with absolute allowlisted executable, bounded criteria and reader timeout; secure `/history` route behind existing server-side superadmin gate, fail-closed on archive absent; JUnit controller negative/security and archive service unit tests.
- [x] **Admin history UI**: add dedicated history mode/filters for 7/30 days to existing viewer and server action; preserve current 5-second real-time polling and no-store/noindex; focused Vitest and typecheck.
- [x] **Operations**: deployable systemd service/timer template (opt-in only), minimal-permission storage setup, capacity monitoring and manual Test procedure; do not promote by editing live systemd or Nginx.
- [ ] **Verification and evidence**: full relevant focused tests, lint/typecheck/build if feasible, re-fetch `origin/main` at midpoint/pre-push, update worklog and bilingual changes; push separate branch and draft PR stacked on security-hardening base. Actual Test/Production only if trusted source, authentication and restore gates pass.
