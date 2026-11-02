# A 2026-11-02 18:25 — Public board text-only discovery

## BEFORE WORK — v1
- Authority: origin/main `a8541927c3a351d980454c66e95a3356c47e0722`, AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md (English canonical), docs/planning/PROJECT_PLAN.ko.md (Korean), docs/RELEASING.md.
- Scope: user-facing optional `media=text` filter for the **latest 50** public board posts, including existing stock and title search. Existing image-only Draft #2350 is a distinct filter and remains untouched. No migration or financial writes.
- Boundary: Nest validates and filters the existing SECURITY DEFINER `member_board_public_list_with_stock(50)` result; web shows truthful empty/unavailable; Android gateway checks filter provenance, post identity and no-image proof; no indexed filtered results.
- Preserve all other developer branches and existing main dirty `implementation_plan.md`; new isolated worktree only.
- Baseline branch/PR/CI audit: `evidence/start-audit.json` in host task directory. No merge/deploy authorized without exact-SHA gates.
- Plan: (1) RED tests for API, SQL and Android/web; (2) implementation; (3) targeted and broad gates; (4) re-fetch main/plans; (5) PR and HOLD record.

## IN PROGRESS — v2
- RED: backend 3 new failures / 19 existing pass; frontend 8 new failures. See host evidence/red-backend.log and red-frontend.log. Tests added before implementation.
- Next: implement only `media=text` on bounded existing public SQL function, source proof on Nest, web and Android; do not touch other worktrees.

## FINISHED — v3
- Pending verification; Production HOLD until all gates pass.
