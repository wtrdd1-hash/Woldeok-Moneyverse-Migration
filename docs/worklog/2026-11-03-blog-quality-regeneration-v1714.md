# v2026.11.03.1714 — Verified blog quality-regeneration incident

## Start — 2026-11-03 KST
- **Status:** IN PROGRESS. User supplied repeated CRITICAL alerts for the dedicated v1419 publisher.
- Production journal evidence: 12:07:59 failed `ARTICLE_QUALITY_HOLD:REPETITIVE_SYNTHETIC_SENTENCES`; 12:46:36 recovered and published the 12:00 slot; 14:06:23 published the 14:00 slot; 16:09:33 failed `ARTICLE_QUALITY_HOLD:NUMERICAL_CLAIMS_NEED_INDEPENDENT_PROOF`. `moneyverse-verified-blog-v1419.service` failed with exit status 1 at 16:09:33. Other main services and DB connection are up.
- Root cause: the local model's generated sections can violate deterministic repetition/numerical evidence checks, and the generator exhausts eight sections without bounded targeted regeneration; no article is published for the rejected slot. This is not a systemd-only or Telegram-only issue.
- Authority: `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, v1405 blog contract and v1419/v1624 incident worklogs. Keep low-risk verified-only automatic publication, official primary sources, locale validation, DB idempotency and independent fail-closed quality QA; never auto-withdraw public articles. No financial/treasury data modifications or quality bypass.
- Branch: `fix/blog-quality-regeneration-v2026.11.03.1714` created from current `origin/main`; independent from active v1712 SEO branch.

## Plan / acceptance
- [x] Write RED regression tests for generated unsupported numbers and repeated model prose; preserve refusal when regeneration is exhausted.
- [x] Implement bounded content-specific regeneration with a single global attempt budget; never substitute fake sources or strip numerical evidence silently.
- [x] Run targeted tests, typecheck, backend build and appropriate isolated Test worker probes.
- [ ] Re-fetch `origin/main`, integrate without overwriting other agent changes, publish EN/KO internal and GitHub update records.
- [ ] Promote only after exact candidate Test health and worker validation; record Production result and remaining blockers explicitly.

## Midpoint — 2026-11-03 16:49 KST
- RED suite reproduced four missing behaviors (official citation URL year false positive, unsupported number persistence, repeated sentence persistence, failure-call budget); 2 additional baseline profile HTTP tests returned 401 instead of expected 200 in a broad first run and are unrelated to these modules; do not claim all backend tests pass.
- Implementation adds per-section deterministic early checks and up to two additional model calls across the whole article. A rejected section is discarded; reasons are sent to the local trusted model to regenerate. If exhaustion occurs, publication still fails closed and no DB receipt is forged. Numeric scanning excludes the exact official source URL but still scans prose/title/excerpt.
- Focused blog suite 26/26 PASS, backend TypeScript typecheck PASS, backend `nest build` PASS, changed-file ESLint 0 errors / one pre-existing unused `extractJson` warning.
- New isolated pinned worker candidate staged in `/srv/moneyverse-data/releases/blog-worker-v2026.11.03.1714-candidate` by hard-link copy followed by unlink-and-replace of exactly two compiled modules; original operational files verified unchanged. SHA256 manifest checked and compiled artifact import PASS.
- Isolated compiled-artifact Japanese economy canary: first draft fabricated an unsourced year; same section regenerated and the result passed independent deterministic gate (6 model invocations, 3,630-character article, official URL cited), with no DB write. Test site's `/api/health` HTTP 200; this is **not** an exact-source Test backend or authenticated/full financial QA certification.
- Existing v1419 Production timer independently succeeded on its 16:45 retry: 16:48:04 KST published previously missing 16:00 Japanese economy slot with its own DB receipt. This is **legacy retry recovery**, not proof new code has been deployed.
- Scope separated from parallel v1712 blog SEO and finance branches. No deployment/symlink switch yet.


## End
Pending; no release or recovery claim until independently evidenced.
