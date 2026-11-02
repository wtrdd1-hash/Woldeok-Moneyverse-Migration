# C v1308 — Owner work receipt source integrity

## Before work — 2026-11-02 20:46 KST
- Main baseline: `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`; independent branch/worktree only.
- miniPC Debian 13 reachable; seven services active, dev DB connected. Read AGENTS, README English/Korean, canonical and Korean planning; inspected QA v1470, active A/B/QA and PRs.
- Confirmed P1: `/work` passes unfiltered `GET /api/v1/work/receipts` response via unchecked cast; a malformed `receipts` object crashes `.map`/`.length`, and unverified monetary receipt rows can render as paid. Filtered mode already validates; do not duplicate existing Work HTTP privacy PR #2305.
- Scope: fail-closed unfiltered owner receipt validation and truthful UI error/empty states; no DB schema, WLD, API write or production changes.
- Plan: RED malformed response tests; reusable receipt parser; Next integration tests; focused and full gates, independent PG, CI; merge/deploy only on all PASS.

## In progress
- Awaiting RED tests and implementation.

## Finished
- Pending validation.
