# Hourly A shop wishlist — worklog (2026-10-24 15:50 KST)

## Start
- Isolated branch: `auto/hourly-a-shop-wishlist-20261024-1550`; base main `49788d09494fed3e463651945b83386e87dd47bc`.
- Debian 13.6 and Backend/Frontend/MCP/Nginx/Docker active, DB connection name may point to Production: **no writes**.
- Remote branches at start: 41; open PRs: 38. Existing A #1139 work favorites, B #1140, C #1138 and planning #1120/#1125 inspected; preserve all.
- Scope: P1 F675-111 member-only shop wishlist, no purchase, no WLD mutation, feature OFF by default. Implement on new worktree only.
- Existing main migration 279; pending migration 280 exists in other unmerged PRs, so any 280 in this candidate is **colliding and must not merge** until canonical numbering resolved.
- Gates: existing frontend five failures and dependency audit hold; no Test/Production promotion without full exact-SHA evidence.

## Checklist
- [ ] RED→GREEN repository, API, gateway, frontend tests
- [ ] Additive SQL owner-only wishlist with ACL, replay, 50 cap and safe REMOVE
- [ ] Real isolated PostgreSQL checks and rollback
- [ ] Full test/lint/typecheck/build/security/CI
- [ ] QA release evidence, pre-integration main refresh, Draft PR
