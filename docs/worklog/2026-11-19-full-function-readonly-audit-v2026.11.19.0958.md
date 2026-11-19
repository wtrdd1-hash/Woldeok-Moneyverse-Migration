# v2026.11.19.0958 — Full-function read-only runtime audit (AUDIT FINISHED)

## Before work — 2026-11-19 09:58 KST
- Owner request: verify all functions, failure modes, and preserve evidence. No assumption that HTTP 200 means a working feature.
- Connected through the established `@pc` Debian MCP gateway. The older Desktop Commander device registration is offline, but the live `@pc` endpoint is operational.
- Read documentation priority: `docs/planning/PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, `DOCUMENTATION_POLICY.md`, runtime baseline, AGENTS.md, QA board, and relevant Spring review skills.
- Starting GitHub `origin/main`: `0590fac4e8a82bc986ba1b8c64f014d18daca9e9`. The independent Debian local `main` initially reported `45cfa7a898` (56 commits ahead of remote). Later during work, its head moved to `b988877285`; no shared-main edits or merges were performed by this audit.
- Evidence work directory: `/srv/moneyverse-data/tasks/gpt-full-function-qa-20261119-0958/` on the authorized host. Raw test matrices stay there until reviewed. Never upload secrets, session cookies, user records, or database privilege exploitation instructions.
- Safety controls: GET-only public/internal HTTP checks, strictly read-only database SQL, no authenticated impersonation or internal override token, no live finance POST, no schema change, no service restarts, no promotion.

## In progress — first observations
- Found conflicting classifications: local QA board calls 180 routes `VERIFIED_PASS`, while the current integrated master expressly holds overall release and reports 5 native production UI verifications and 175 uncertified pages.
- Public HTTPS route matrix: 180 source entries; 103 HTTP 200 without semantic certification, 40 auth redirects/denials, 30 dynamic paths lacking valid fixtures, five 200 homepage fallbacks, two other responses (405/406). Both a fabricated route and `/quest` returned homepage content in direct Spring samples.
- Spring OpenAPI enumerates 960 distinct paths, including 637 GET operations. Unauthenticated local GET scan: 282 HTTP 200, 307 expected authorization denials, 47 unresolved path-variable fixtures, one HTTP 406; no HTTP 5xx in this specific scan. This is not a positive authenticated API pass.
- Frontend samples contain Next/React hydration and `/_next/` static asset references; one referenced stylesheet was HTTP 404 directly from Spring. Spring-serving old HTML does not demonstrate full native migration or working interactions.
- Android source uses `/app-api/v1/` on the release production host; this prefix is absent from Spring OpenAPI GET enumeration. Sample `/app-api/v1/stocks` was HTTP 404 on direct Spring and public HTTPS checks.
- Finance SQL read-only observations: 943 transactions, 1,950 postings, debit/credit sums equal, 0 unbalanced transactions, 0 nonpositive postings, 0 transactions without postings. These checks are insufficient for all balances, settlement or idempotency.
- Critical security review: the actual application role has unexpected direct table-write grants inconsistent with the least-privilege finance design. Detailed ACL evidence remains in the restricted host-side report; remediation requires separate reviewed migration and production-safe testing.
- Spring-integrated Discord4J logs show gateway connect, 11 guild commands registered, and a successful voice channel join after a restart; actual audio playback/long-term voice continuity not proven. Previous shutdown contained voice close errors.
- Service and deployment identity are not equivalent to Git HEAD. The active Java service started at 09:51 KST; local source `main` changed during this audit.

## Checkpoint, gates, and status
- [x] Before-work evidence and documentation priority
- [x] Public 180-path HTTP audit with honest classification
- [x] All 637 OpenAPI GETs enumerated; 590 called without credentials
- [x] Read-only finance-ledger invariants, role privilege inspection
- [x] Spring/Next and Android contract mismatch observations
- [x] Discord startup/voice log observations
- [ ] Authenticated member/admin positive E2E and real button interactions
- [ ] End-to-end Android emulator/device sessions
- [ ] Sandbox-backed finance transfer/rollback/idempotency, Discord playback
- [ ] Full Test/Production identical SHA and independent restore evidence

**Decision:** FULL FUNCTION QA `NOT CERTIFIED`; production promotion `BLOCKED` pending complete security, runtime, functional and rollback gates. This is a documentation-only task branch; it does not alter deployed systems.

## Finished — 2026-11-19 10:17 KST
- Published two raw CSV matrices, bilingual QA reports, bilingual worklogs, bilingual GitHub updates and bilingual changelogs to this isolated task branch.
- Final measured totals: web 180 = 103/40/30/5/2; GET 637 = 282/307/47/1. Debit and credit each total 450,856,461; zero unbalanced transactions. Confidential evidence remains host-only with 0700 directory/0600 file permissions.
- GitHub `origin/main` stayed `0590fac4e8a82bc986ba1b8c64f014d18daca9e9` at initial, intermediate and final checks. The independent Debian local shared `main` moved from `45cfa7a898` to `b988877285` during concurrent work; this task did not change that branch.
- Spring process PID 1111664 still has its 09:51 KST startup provenance. No inference that the new local source commit was promoted to Production.
- **Final status: evidence documentation complete; full functional acceptance NOT CERTIFIED; financial/security/Android/identity gaps block whole-system promotion.** No application code, TEST/Production rollout, DB mutation, or service restart performed by this audit.
- Remediation must use independent task branches and exact-SHA isolated Test with real positive and negative functional evidence before any reviewed release.

- Opened draft evidence-review [PR #3290](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3290); unmerged and not deployed.
