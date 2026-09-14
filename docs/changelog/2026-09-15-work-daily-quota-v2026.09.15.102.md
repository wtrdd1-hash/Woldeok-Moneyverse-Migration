# v2026.09.15.102 — Restore authoritative work daily quotas

## Summary

The work board and reward paths again use the database task catalogue as the authoritative daily-quota source.

## Changes

- `work_task_board()` now returns each task's real `daily_limit` instead of `0`.
- `taken_today` now counts completed/rewarded work for the current Seoul calendar day rather than merely-created assignments.
- `work_complete_task_v2()` allows completions through the configured daily amount and rejects only the next completion after the limit is filled.
- `work_verify_and_reward()` enforces the same quota for the assignment -> submit -> verify path.
- Direct and legacy completion paths share a per-member/per-task advisory lock so concurrent requests cannot bypass the limit.
- Administrator `work` feature-state controls remain an operational safety switch; member daily quota remains a separate database policy.

## Compatibility

The mobile/web API field names are unchanged: `daily_limit` and `taken_today` retain their existing schema and now carry the intended values.

## Validation

CI must run migrations against PostgreSQL and execute the work-board/quota database tests before merge. Production promotion remains gated by the isolated exact-SHA Test environment.

## Rollback

Do not edit applied migrations. If rollback is required after release, add a new migration that restores the prior function behavior while preserving receipts, assignments, ledger history, and job progression.
