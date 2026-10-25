# Configured ClamAV Fail-Closed Upload Scanning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development. Tests use RED/GREEN evidence.

**Goal:** Reject image uploads when a configured ClamAV daemon cannot verify the image, without misclassifying outages as malware.

**Architecture:** Keep built-in image validation and optional daemon autodiscovery. Once CLAMAV_HOST or CLAMAV_SOCKET explicitly configures a daemon, require a complete exact `stream: OK` reply or verified `stream: <name> FOUND`; reject malformed, timeout, refused, oversized, and missing-socket cases. Surface outages as HTTP 503 without false malicious-user alerts.

**Tech Stack:** NestJS, Node net sockets, Vitest.

- [x] Write scanner and controller regression tests: `backend/src/content/antivirus-scanner.service.test.ts`, `backend/src/content/chat-upload.controller.test.ts`.
- [x] Run RED: 4 failures from malformed, misleading FOUND/OK, unavailable TCP, controller HTTP mapping; then 1 missing Unix socket failure.
- [x] Implement exact ClamAV reply parsing, fail-closed configured daemon, and 503 error translation in `backend/src/content/antivirus-scanner.service.ts` and `backend/src/content/chat-upload.controller.ts`.
- [x] Run GREEN: 20/20 focused tests, including daemon timeout and real loopback TCP.
- [ ] Run full required repository gates; log exact output and SHA.
- [ ] Push Draft PR; keep release HOLD pending official exact-SHA Test and all gates.
