# AI Blog editorial implementation — v2026.10.20.976 (candidate, NOT deployed)

[한국어 작업기록](2026-10-20-ai-blog-editorial-foundation-v976.ko.md) | Authority: v975 detailed architecture / implementation plan, Integrated Planning Master, AGENTS.md and editorial legacy hold.

## v976.1 START — source and operational preflight

User approved v975 plan on 2026-10-20 KST. Started isolated `feat/blog-editorial-foundation-v2026.10.20.976` from then-current origin/main `18c40e59` (v975 planning PR #964 merged). On inspection, read-only public blog `/blog`, `/en/blog`, `/ja/blog`, `/zh/blog`, `/api/blog`, `/sitemap-blog.xml` all HTTP 200; legacy shared blog file remained **0444** with original 2026-10-16 mtime. No production services, original content, user accounts, DB/ledger, feature switch or historical AI hold were mutated. Existing 403/503 blog generator and legacy noindex remain unchanged. Source main later advanced to `27f76080` for nonoverlapping host-storage documents; rebase before submitting PR.

## v976.2 TDD — draft-only database foundation

New forward-only **278-blog-editorial-foundation.sql** contains five isolated PostgreSQL entities for topics, official-source *references*, immutable draft revisions, reject/change-request reviews and append-only audit. Operator-checked SECURITY DEFINER owner-only functions create or append those records, but **no app/public grants, no approval or publisher function**, and no public article read path. All five tables and four mutators deny `moneyverse_app`; `PUBLIC` EXECUTE revoked. Self-review, expired evidence, stale revision, idempotency-key payload changes and record mutation are blocked.

RED: database migration absent, three regression tests failed. GREEN: 3/3 migration source safety checks. Real disposable PostgreSQL 17.11 with `--network none` uses minimal users/operator-role fixture, new SQL, and a SQL E2E test; `scripts/test-blog-editorial-foundation.sh` reproducibly PASSES. A deliberate RED exposed a source idempotency metadata mismatch; matching URL+hash alone was insufficient. Code now also compares publisher/license/as-of/expiry before returning a retry receipt. Negative SQL checks: unprivileged actor, fake payload, insecure HTTP source, duplicate request, draft revision race, model-style self approval, forbidden `APPROVE`, immutable updates, app role table and function denials. E2E transaction ends in ROLLBACK; disposable container cleaned up. This is **not** full production-schema/database integration acceptance.

## v976.3 partial source claim checker (non-networking)

Pure `backend/src/blog-editorial/blog-claim-checker.ts` evaluates typed *externally verified* evidence references and financial numeric claims. Blocks missing/expired/unverified/wrong-country citations, stale/future quotes, invalid numbers, regulation year omission, unsupported simulations and guaranteed returns. Tests RED then 6/6 GREEN. **It does not fetch or cryptographically authenticate official sources**, and cannot approve or publish; verified status must come from the future secured provenance service.

## v976.4 partial draft duplicate review (non-AI)

`blog-duplicate-review.ts` screens normalized same-country/locale exact titles/slug and 3-gram body similarity as a **human review queue**, not semantic-certification or publication approval. Tests RED then 5/5 GREEN including an 80-entry synthetic legacy repetition fixture. Threshold 0.82 is provisional and not calibrated on full 171 legacy posts. Does not publish, delete, import or rewrite articles.

## v976.5 validation

- Isolated SQL engine: migration executes; permissions/idempotency/immutability cases PASS.
- `@moneyverse/database` Vitest 12 passed, **3 skipped** (no configured integration DB); 3/3 new safety guards PASS.
- `@moneyverse/backend` full Vitest **1,268 passed, 397 skipped** across 219 files; new 11 claim/duplicate tests passed.
- `@moneyverse/frontend` full Vitest **1,321 passed** across 251 files (unchanged public UI).
- Changed-file ESLint, backend TypeScript after contract build, backend Nest build, diff integrity PASS.
- Full live financial DB, step-up admin review, trusted source ingestion, dedup calibration, live GSC, exact-SHA Test with backend/session/5-pass authenticated UI, and Production upgrade **NOT verified**.

## v976.6 remaining stages and hard hold

Needs v975.3 official source fetch/integrity, v975.4 approved internal model draft job and 171 corpus calibration, v975.5 admin human approval and BFF/service auth, v975.6 durable idempotent publisher, v975.7 country-source-backed SEO, v975.8 scheduler/recovery, v975.9 calculator registry reconciliation with parallel v931, v975.10 full CI/Test/finance/zero-downtime gates. Never simply remove legacy generator 503, bypass finances or chmod JSON 0444. No new public articles until genuinely reviewed and released.

## v976.7 END

GitHub PR, CI SHA and merge status to be recorded in operator task end log after verified. This worklog is a stage-level candidate, not whole-product completion.
