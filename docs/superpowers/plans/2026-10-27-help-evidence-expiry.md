# Verified Help: Evidence Expiry Truth (A / 2026-10-27 14:25)

Status: **candidate only, DRAFT/HOLD**. Base: main `584f01a9c8df3f9005a7e5aa6d13e4719914ae0c`. Depends on and preserves the unmerged verified-help work from PR #1533; never merge both PRs independently.

## Root cause and scope

The public SECURITY DEFINER functions stop returning an article when `reviewed_until` expires. However, the create-draft and publish idempotency branches previously returned the historical article UUID without rechecking evidence freshness. This can report a successful draft or publication even though the source is expired and the public read is empty. The administrator queue also offered the Publish action for an expired review.

## Plan and execution

1. Create a fresh isolated `auto/hourly-a-*` worktree from current main; reapply prior A-only candidate commits, leaving B/C/Gemini worktrees intact.
2. RED: add an isolated PostgreSQL 17 test that creates draft and published articles with near-expiry evidence, waits past the deadline, and asserts neither replay may claim success; add backend queue/HTTP regression.
3. GREEN: enforce review freshness before draft replay, check the currently published revision after locking the article before publish replay, and return SQLSTATE 22023 for expired evidence. Surface `evidenceExpired` in the administrator API, suppress Publish for expired reviews, and display a visible expiry warning in the web console.
4. Verify isolated PG bootstrap, unapplied migration 280, ACL, independent approval, immutability, positive/negative fixtures; then full unit, typecheck, lint, build, Android contract, bot, security, a11y/SEO where feasible. Never run migrations against the Production-linked 5433 database.
5. Record branch/SHA, checks, security failures, migration-280 collision, exact-SHA Test and GitOps release HOLD; create a Draft/hold PR only. Do not deploy, delete other branches, or mutate production balances.

## Rollback

Feature flag `VERIFIED_HELP_CENTER_V1` remains OFF. If the candidate is rejected, close only its Draft PR; no DB rollback or production change is required. The 280 SQL is unapplied on main and is not permitted to overwrite any applied migration.
