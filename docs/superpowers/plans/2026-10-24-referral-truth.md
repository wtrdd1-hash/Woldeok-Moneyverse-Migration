# Referral Truth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove fabricated referral rewards, counters and verification while retaining truthful service sharing and registration navigation.

**Architecture:** No backend referral contract exists. Reuse actual `/register` and `/login` pages; never imply invite validation or reward crediting. Legacy `/invite/[code]` remains a safe, non-indexable entry point. No financial mutation.

**Tech Stack:** Next.js 16, React, Vitest, TypeScript, Tailwind.

**Spec:** User's standing P0/P1 Frontend/App/Integration directive and main source inspection.

## Global Constraints
- No new DB privileges, financial writes, migrations or fabricated API.
- Do not change any A/B/QA/Gemini branch, main or release gate.
- Accessibility 320px/keyboard/screen reader, noindex for unverified invite URLs.

## Tasks
- [x] Add tests rejecting fabricated default stats/rewards and unsupported route; run RED.
- [x] Implement service-sharing CTA with truthful copy, validated copy/share actions, and accessible labels.
- [x] Replace unverified invite landing with truthful service introduction, safe registration/login and noindex; run GREEN.
- [x] Run lint, typecheck, build, frontend/backend/contract/security and browser checks; record exact SHA and CI outcomes.
- [x] Re-fetch main, document results in English/Korean, open Draft PR, never merge without full PASS.

## Review Focus
- Malicious/oversized code in legacy URLs; copied link does not expose arbitrary code; no guaranteed WLD claim; failed clipboard does not report success; share cancel is not success.
