# v2026.10.02.506 — Urgent runtime repair worklog

Status: IN PROGRESS
Branch: `fix/urgent-runtime-v2026.10.02.506`
Base authority: `origin/main=5a7c658b38853f564983d19f961c689a494dc4b6`
Date: 2026-10-02 KST

## Start record
- Trigger: P0 findings from v2026.10.02.505 full-site audit.
- Scope: authenticated direct-chat 500 loop, frontend runtime cache EACCES, Test/Production exact-candidate runtime alignment.
- Guardrails: preserve Production DB/session data; no destructive Test DB reset; Test-first validation; zero-downtime Production promotion; retain rollback targets.
- Root cause confirmed for chat: `PostgresChatRepository.listConversations()` joins nonexistent `public.user_profiles` / `avatar_key`; live Production schema uses `public.member_profiles.image_url`.
- Test DB is stale and not suitable as-is for exact candidate validation: 27 repository migrations missing and one historical extra migration recorded. Existing Test DB will be preserved.

## TDD record
- Added regression test for authoritative `member_profiles.image_url` chat peer avatar source.
- RED observed against current code.
- Minimal repository query correction applied; focused test GREEN.

## Mid record
- The existing Test DB was confirmed stale (27 repository migrations missing plus one historical extra migration) and was preserved unchanged.
- Created isolated `woldeok_moneyverse_v506_test` and applied authoritative init 001 plus migrations 002-242.
- Fresh least-privilege schema exposed the broader ChatRepository defect: direct private-chat table reads/writes were correctly denied with 42501.
- Migration 243 adds SECURITY DEFINER contracts for conversation list/history/sync/unread/archive while preserving direct table revocation.
- Real `moneyverse_app` lifecycle proof: direct table DENY; open/list/send/history/sync/unread/archive/unarchive PASS.
- Full fresh-DB tests exposed an unrelated security regression in existing migrations 240-242: six treasury SECURITY DEFINER functions executable by PUBLIC and four direct treasury DML grants.
- Migration 244 removes PUBLIC execution/direct application DML and routes citizen budget voting through a SECURITY DEFINER function.
- Verification: database package 7/7 PASS, backend typecheck PASS, backend 170 files / 1,639 tests PASS; 29 environment-gated casino E2E tests skipped.
