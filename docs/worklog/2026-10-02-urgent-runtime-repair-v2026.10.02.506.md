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
