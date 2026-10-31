# C v1252 — Landmark auction and rent source integrity

## START — 2026-11-01 07:49 KST
- Base: origin/main f13bbce273ffc65e8576170992d82ea00c27a1c9.
- Debian 13.6 miniPC connected; seven core services active; development PostgreSQL reachable.
- Read AGENTS.md, README.md, README/README.ko.md, canonical PROJECT_PLAN.md and Korean parity, recent A/B/QA/planning PRs and open PRs. No overlapping active landmark-auction source-integrity PR found.
- P0 reproduced in source: Next GET /api/spaces/real-estate/auction returns invented auctions, ownership, yields and unclaimed rent as ok:true; authenticated POST mutates process memory and returns a fake bid success; claim-rent POST says 4,990 WLD was paid without a ledger transaction. Page renders fabricated ownership/yields. Existing space API has other mock land endpoints, not a verified auction/settlement contract.
- No financial write or migration is authorized. Design: fail closed at both Next endpoints; preserve authentication distinction, private/no-store/noindex/no-referrer, and show accessible unavailable state instead of false claims. This is protective functionality, not completion of actual auctions.
- Plan: TDD red; replace route contracts; replace page/client and misleading SEO; test focused and full suites; isolated PostgreSQL and HTTP where possible; record all blockers; keep draft HOLD until all release gates pass.
- Avoid main modifications, unrelated A/B/Gemini/QA worktrees, existing unique branches and reservations.

## MID
- Pending implementation and validation.

## END
- Pending final SHA and evidence.
