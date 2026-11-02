# Guest Takedown Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Bounded design
The existing public takedown form issues a case ID and a passcode; the backend already has a read-only, passcode-hashed PostgreSQL status function. Do not create a new endpoint or financial workflow. Add a separate guest status form to the same route. Send credentials only through a server action POST to the existing API; return only a validated status/date summary, never the passcode. Unknown/malformed backend payload must fail closed. 404 means invalid case or passcode; 5xx means source unavailable. Keep response private/no-store/noindex. No data in query strings, logs, or persistent browser storage.

## Tasks
- [ ] Write failing tests for response validation and 404/source distinction; run RED.
- [ ] Implement parser and server action with exact DTO constraints; run GREEN.
- [ ] Add accessible 320px status form, verified-only output, no fake success or promised SLA; test UI wiring.
- [ ] Enforce private HTTP headers on takedown route, including localized aliases; test route rules.
- [ ] Run focused and repository gates on exact HEAD, isolated PostgreSQL, Android contract, authenticated E2E where available; record all failures.
- [ ] Re-fetch main and plan; preserve other PRs; open draft PR only, merge/deploy only on all required PASS.
