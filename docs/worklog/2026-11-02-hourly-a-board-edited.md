# Development A — Recent public board edited-posts filter (2026-11-02)

## Before work (01:26–01:29 KST)
- Connected to miniPC Debian 13.6 using the dedicated system status and shell connectors. Backend, frontend, Discord bot, MCP, Nginx and Docker were active; DEV PostgreSQL connected.
- Read `AGENTS.md`, `README.md`, English canonical `docs/planning/PROJECT_PLAN.md`, Korean second-language plan, English integrated master, current QA v1451, recent worklogs, all open PRs and remote branches. Current main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`; all three plan hashes recorded in `evidence/plan-start.sha256`.
- 146 open Draft PRs, 29 marked conflicting; 164 tracked remote refs excluding main in the later complete audit (151 with unique commits, 13 merged/ancestor). Existing board feature PRs #2399, #2393, #2350 and #2337 touch overlapping files. No remote branches were deleted.
- New isolated branch `auto/hourly-a-20261102-0125-board-edited` from exact main; no edits to shared checkouts or another developer's branch.

## Design and implementation
- P1 read-only member-facing discovery: optional `editedOnly=1` on public board web and Android, combined with existing title and stock filters. Source scope is **only the latest 50 published public posts**, not the archive.
- Nest rejects unknown, duplicate, or non-`1` edited filters; PostgreSQL query uses `public.member_board_public_list_with_stock(50)` and a parameterized `updated_at IS NOT NULL AND updated_at > created_at` predicate. No new migrations, table grants, money, item, ledger, or user writes.
- Web GET checkbox, explicit bounded scope, invalid/unavailable/verified-empty states, query-specific noindex and no-cache. Android gateway independently validates bounded, unique, timestamp-proven, matching edited results and returns 503 instead of unverified HTTP 200; filtered success/errors/HEAD carry no-store/noindex/no-referrer.
- TDD: Backend RED two relevant failures then 22 focused PASS; Frontend/App API RED 13 failures then 13 PASS; extra 3 source-proof tests PASS. Tests added before production code.

## Midpoint (01:33 KST)
- Refetched main (unchanged) and recomputed canonical EN/KO/integrated plan SHA-256 (unchanged). Planning Draft #2402 head `c5812debab56dec968294ad0108c4ee5c36f308f`; it covers unrelated expiry-digest schedule truth and was left untouched.
- Actual DEV PostgreSQL 17.11 read-only as `moneyverse_app`: public function EXECUTE=true; one public post, zero edited; synthetic PostgreSQL read-only predicate 4 rows -> 2 edited. Direct board SELECT and balance UPDATE still granted in DEV (P0 least-privilege blocker). `ROLLBACK` used; no DB mutation.
- Official public Test `/api/version` reports `510dbe6...`, Production reports `353c6d5...`; neither is the candidate branch. QA v1451 documents additional P0 DB parity, financial ledger provenance, production artifact and backup blockers.

## End of run (01:49 KST and later)
- **Code commit** `1d6bf41a80ef78d4fe413d7421e36878fd07c553` (11 files, 316 additions/24 deletions including plan). Docs-inclusive final commit is recorded in Draft PR #2407.
- Full local backend **2,987 PASS/518 SKIP**, frontend **2,935 PASS**, database **62 PASS/5 SKIP**, Android API contract 184 endpoints/683 methods PASS; backend/Next optimized build PASS (602 static pages), typecheck PASS, lint 0 errors/1,027 warnings, policy tests 27 PASS, production audit 0 advisories, **all-dependency audit FAIL: 9 (8 moderate, 1 low)**. Extra focused source-proof/API tests PASS. No skipped test counted as passing.
- Remote non-main **164→165**; 152 unique/unmerged, 13 already in main. 149 open Draft PRs, 29 conflicting. Candidate vs 164 other branches: 68 conflicts/96 clean; #2399/#2393 overlap. No branch deleted.
- Official Test/Production candidate SHA E2E and independent external restore BLOCKED, P0 ACL/finance/provenance unresolved. **Draft/HOLD; no main merge, Test/Production deployment, DB mutation, service restart or rollback.** GitHub final CI status recorded in PR/evidence; no pending check is a PASS.
