# Development A — Read-only verified storage headroom (2026-10-30 07:25 KST)

## Before work — v1 / STARTED
- Main at start: `62c6cd038951d65c94b709302bdaec6e75b080b6`; isolated branch `auto/hourly-a-storage-headroom-20261030-0725`.
- Source policy: `AGENTS.md`, `README.md`, `docs/RELEASING.md`, both `docs/planning/PROJECT_PLAN*`, planning Draft #1949/#1954, issue #1948 and QA v1382 evidence.
- Other workers' PRs and branches remain untouched; no applied migration edits, ledger changes, cleanup or Production changes.
- Read-only host check: Debian 13.6 services active, DB connected; DATA mount at 100% rounded, ~981 MiB available after worktree creation. This is a P0 capacity/release blocker; no deletion without ownership proof.
- Scope: implement an admin-only read-only signed host storage snapshot contract with fail-closed status, UI and negative tests. Do not expose storage details via public/Android routes. No DB migration required by planning v1492.
- Plan: (1) RED parser/attestation tests, (2) signed host collector and Nest guarded endpoint, (3) admin page and negative privacy tests, (4) targeted gates, (5) full gates if capacity permits, (6) PR/HOLD evidence.
- Release: HOLD until independently provisioned signed host collector, complete CI, exact-SHA Test/auth/DB proof and backup restore pass. No automatic cleanup or release.

## In progress — v2 / IMPLEMENTED CANDIDATE
- Implemented host-only fixed ROOT/DATA `statfs` collector with Ed25519 private-key signing (private key never shipped to backend), strict Nest public-key signature/freshness/namespace/boot/sequence verifier and generic 503 on missing evidence.
- Added Session/Authenticated/Consent/Admin/AdminSession guards, private no-store/noindex, existing global 429 tier, Next admin-only proxy and responsive bilingual operator page. Public/member/Android API has no storage route. DB schema, grants, ledger and migrations unchanged.
- TDD RED→GREEN: backend signature/overflow/alias/stale/replay 5 PASS; controller guards/privacy 2 PASS; privileged host collector 1 PASS; host-signed collector→backend verifier with forged signature 1 PASS; Next schema/precision 2 PASS; private gateway auth/forgery 2 PASS.
- Initial frontend typecheck failed on optional usedPercent narrowing; corrected and reran PASS. Backend typecheck PASS; changed ESLint PASS. Full gates pending.
- Current DATA capacity ~980 MiB unprivileged available (df rounds 100%). No cleanup or changes to other workers.
- Collector/key provisioning is intentionally not performed against Production or Test. Missing host evidence yields 503 and UNKNOWN; it is not an approved release gate.

## Finished — v3 / CANDIDATE ONLY
- Implementation checkpoint SHA `55cb5c1c3a91fc810184db815b17d78b535c79f2`, Draft PR #1956. Final head/CI recorded in PR after documentation commit.
- Backend verifier 5 PASS, guards 2 PASS, HTTP 3 PASS, actual host collector 1 PASS, host→backend tamper 1 PASS; Next data 2 PASS, proxy 2 PASS, page/a11y/SEO 2 PASS. Backend/Frontend Typecheck, backend build and changed ESLint PASS; DB unit 56 PASS/4 SKIP, security 11 PASS, production audit 0 known vulnerabilities.
- Full lint FAIL 3 existing errors; backend full 2,358 PASS/240 FAIL/493 SKIP; frontend full TIMEOUT 100s; app-api contract FAIL pre-existing NPC affinity drift. Frontend full build BLOCKED due DATA 100% capacity (<1 GiB). Exact SHA CI FAIL. Official Test E2E and Production not run.
- Dev PG read-only: 293 applied migrations vs 304 source; app direct audit_logs DML incl DELETE and users UPDATE. No DB/ledger mutation. Security #993 and capacity #1170 updated.
- Start/end remote branches 38→39; open PR 32→33; unique unmerged 35, fully behind 3, conflicts 2, duplicates/head mismatches 0. Deleted 0, merged 0, closed 0; preserve all other workers.
- English/Korean QA and Release HOLD: `docs/qa/2026-10-30-a0725-storage-headroom*`, `docs/releases/2026-10-30-a0725-storage-headroom-HOLD*`. No Test/Production/rollback changes; feature unavailable until approved host signing key and collector provisioned.
