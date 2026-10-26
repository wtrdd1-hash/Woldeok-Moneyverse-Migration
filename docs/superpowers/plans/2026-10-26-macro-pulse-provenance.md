# Macro Pulse Provenance and Failure States Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Never present invented macroeconomic values as live authoritative data, even when the backend is reachable.

**Architecture:** NestJS marks its deterministic macro scenarios as SIMULATED_EDUCATIONAL. The React public component accepts only well-formed simulation responses, shows explicit provenance and refresh time, and displays an accessible retry state when the API is unavailable. No database, money, or market feed is claimed.

**Tech Stack:** NestJS, Next.js/React, TypeScript, Vitest, Jest.

- [ ] Add backend RED test for source mode, run and confirm failure.
- [ ] Add frontend RED tests for missing API, malformed API, simulated source and retry; run and confirm failure.
- [ ] Add explicit source marker to NestJS response and clarify OpenAPI description.
- [ ] Remove client synthetic fallback, validate response, add accessible unavailable/retry and real refresh cadence.
- [ ] Verify focused tests and exact SHA gates; check main/plan again mid-run and before any merge.
- [ ] Create Draft PR with release hold; no merge or production without all gates.
