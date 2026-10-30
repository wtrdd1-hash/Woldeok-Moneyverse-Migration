# A0546 — Public board stock-category filter QA (DRAFT / RELEASE HOLD)

Baseline `origin/main` at start/mid: `761a55a094fb9dd383d213e817305e68c79fa23c`. Independent `auto/hourly-a-20261031-0546-board-category-filter` worktree. English canonical; Korean companion file. This is a functional P1 change, not documentation-only.

- GET `/api/v1/board/public/stock-posts?category=analysis|question|journal|business|system` filters only the most recent 50 public posts returned by `member_board_public_list_with_stock(50)`; untagged posts are excluded when category is present. Existing stock and literal title filters remain composable. Duplicate/unknown category rejected with 400.
- `/board` has a labelled, keyboard-usable 44px category select. Empty form value is no filter. Query-specific pages and Android app-api responses have noindex/no-store. The app gateway rejects forged/unknown category and success-shaped mismatched upstream results (503), preserving the public 50-row limit.
- RED evidence: backend 3 failing new tests; frontend missing parser/invalid gateway; later upstream mismatch 200 instead of 503 and empty form false-invalid. GREEN: targeted backend 23 PASS, frontend 11 PASS; real PostgreSQL category test 1 PASS.
- Fresh isolated PostgreSQL 17.11: all 311 migrations applied; app role can EXECUTE the public list function but cannot SELECT `member_board_posts` or `member_board_stock_context`. Synthetic category, title, symbol and untagged checks PASS. Transaction ROLLBACK left 0 users and 0 ledger transactions. No applied migration changed.
- Typecheck PASS; Backend/Frontend build PASS; full ESLint 0 errors / 1,049 warnings; Backend full 2,786 PASS / 502 SKIP; Frontend full 2,780 PASS; Database 62 PASS / 4 SKIP; security 11 PASS; accessibility/SEO selected 21 PASS; app-api contract 184 endpoints PASS; prod dependency audit 0 known vulnerabilities.
- Official Test exact SHA, authenticated owner flow, independent backup restore and GitOps promotion NOT performed. P0 #1984 Production executable provenance and #993 DEV broad grants remain OPEN. Do not merge or deploy until all required release gates and official exact-SHA Test are evidenced.

Evidence: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-31-0546-board-category-filter/`.
