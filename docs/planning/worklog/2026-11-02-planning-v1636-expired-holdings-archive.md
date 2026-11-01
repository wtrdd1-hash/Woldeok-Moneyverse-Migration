# Planning v1636 — Owner Expired Holding Archive (F675-215)

**Status:** DRAFT / RELEASE HOLD. Previous Feature Improvement v1634 → Current Feature Addition v1636 → Next Feature Improvement v1638. Docs-only child of unmerged v1634 Draft #2428. GitHub handoff #2432.

**Start (2026-11-02 06:10 KST):** miniPC system status: backend/frontend/bot/mcp/nginx/docker active; dev database connected. skills__list empty, installed Superpowers using-superpowers, brainstorming, writing-plans, worktrees, verification read. Latest origin/main a8541927c3a351d980454c66e95a3356c47e0722; original checkout has unrelated modified implementation_plan.md, so use separate worktree rooted at v1634 HEAD 2137aef0cc687354a2446137cea08ccec90ee4e9. GitHub open PRs #2431 C, #2430 B, #2429 A, #2428 planning checked; no overlap.

**Mid (06:13 KST):** origin/main re-fetched unchanged. Reviewed AGENTS.md, README.md, EN/KO plan, migration 123 owner active filter, 071 one-row holdings, 104 restamp from prior verified planning, Nest holdings GET, /inventory failure-as-empty, app-api privacy matcher. Source-level gap only; no Production incident claim. Test and Production public /api/version both 510dbe6bf4d5c2a8089fc06b480776053da7a2e3, different from main; no actual process SHA/restore certification. Source spec and P0 4/P1 6 written in EN/KO canonical+integrated master; issue #2432 created.

**Proposed scope:** Owner-only read-only expired current holding view; not purchase history, recovery, refund or equipment. Per-page REPEATABLE READ is not cross-request MVCC continuity. Cursor owner binding, TTL, limit, verified-empty/error, privacy headers on Next/Android, accessibility, admin aggregates, default OFF, exact-SHA Test/rollback gate. Feature acceptance tests proposed, not executed.

**External reference gate:** newly independently verified/deduplicated/classified 0; cumulative approved UNKNOWN / 10,000. BLOCKED / IN PROGRESS.

**Completion:** See PR and final verification comment; no runtime/DB/financial/Test/Production mutation. RELEASE HOLD.

**Completion (06:15 KST):** Draft PR #2433 OPEN/HOLD, head SHA 353c4b87d67c17ce153711898d53327208028497. Exact eight-doc scope and two canonical plans x12 required markers PASS; git diff --check PASS. Local combined policy/release/security/backup/classifier 58/58 PASS, classifier independently 24/24 PASS, focused QA ledger 7/7 PASS. This does NOT certify feature acceptance. Remote CI final SHA pending. No main merge, Test/Production deployment or runtime/database/financial mutation.
