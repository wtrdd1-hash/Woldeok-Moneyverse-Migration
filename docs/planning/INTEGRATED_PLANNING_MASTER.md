# Woldeok Moneyverse — Integrated Planning Master

## v2026.10.19.924 — Plus membership/reward truth improvement (DRAFT)
Previous Addition v922 → Current Improvement v924 → Next Addition v926. Main e76c90fad32d0bbc5a80805c0ea8576f9ba3cfc9; QA v923 FAILED/Production HOLD. P0 VIP924-01 remove fabricated client/server claim success and hardcoded entitlement; VIP924-02 verify browser/BFF/API CSRF path (client omits token; Nest requires it); VIP924-03 only persisted entitlement/ledger+inventory receipts; VIP924-04 least-privilege dev DB `daily_rewards` direct DML observed; REL924-05 retain financial/migration/exact-SHA Test/restore gates. P1 VIP924-06..10 cover member UX, admin audit, mobile/a11y/SEO, privacy-safe analytics and 100-concurrent-request TDD/rollback. Existing `daily_rewards` is not proof of VIP chest storage. Full implementation contract in canonical `PROJECT_PLAN.md` v924. Proposed endpoints/tables are not implemented; no approved 10k/2k WLD economic policy. External 10,000 independent reference gate BLOCKED (new approved 0, cumulative unknown). Documentation only, no runtime/DB/Test/Production changes; coordinate v922 branch and PR #940 overlapping files.


## v2026.10.18.804 — Core immutable journal direct-DML privilege containment (candidate / Production HOLD)
- Source code and actual Production v717 dist use journal tables for reads, not direct app DML; nonetheless live app role has broad ledger INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER rights. Migration 277 revokes all journal table rights then regrants SELECT only, retaining existing SECURITY DEFINER role-scoped command boundary; applied twice to an isolated copy of actual Production schema+ACL with all direct write privileges denied. Other 3 financial tables and 19 unverifiable opening/projection balances +4,779,188 WLD remain P0, with v530 signed-in UI/backup/restore gates BLOCKED. [Release](../releases/v2026.10.18.804.md).


## v2026.10.17.802 — Production approval execution, immutable Test candidate STAGED / Production HOLD
- User authorized promotion. Exact-main `7098f236` build and immutable Test artifact with matching manifest/Next SHA staged (not activated); 56 release unit tests PASS. Active Test is still mixed source `bca8d54a` versus manifest/Next `50fb6395`. Repaired v717 missing runtime restart EnvironmentFile reference using process-matched root-only nonsecret overrides, without service restart. Financial read-only gate remains BLOCKED (5 direct application DML grants, 19 uncertain opening/projection differences +4,779,188 WLD). v530 authenticated route QA, exact candidate Test, session and backup restore not accepted, so no Production switch or financial waiver. [Release](../releases/v2026.10.17.802.md).


## v2026.10.17.801 — Secret-auction unjournaled WLD containment (main merged / Production HOLD)
- A new bid was accepted ahead of financial settlement; the legacy auction worker directly changed member/sink balances with no immutable ledger receipt. Pending certification of actor-scoped canonical Economy Core settlement, new bids now fail 503 before SQL and the old financial worker is nonexecuting. Historic read paths remain. [Release](../releases/v2026.10.17.801.md). Existing 19 unverifiable opening-balance projections, 5 direct app finance grants and v530 authenticated UI gate remain BLOCKED; [PR #928](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/928) merged main `bd6cf172` after runtime CI and Test candidate image build success. Not a restored auction feature or Production application release.


## v2026.10.17.796 — Marketplace appraisal fail-closed ledger candidate; Production HOLD
- Separate implementation branch replaces an invalid parameterized DO block and unjournaled balance writes with a scoped SECURITY DEFINER atomic journal and appraisal certificate. Disposable Test DB E2E and unit tests passed; official Test/Production and authenticated QA not yet accepted. Historic Production 19-account mismatch +4,779,188 WLD, broad app DML rights, and v530 UI/MFA five-pass remain independent release blockers. [Release](../releases/v2026.10.17.796.md).

## v2026.10.17.791 — Exact SHA of generated frontend artifact (main merged; Production HOLD)
- Read-only Test probe caught `frontend_artifact_sha_mismatch` on public Test SHA `4997cf2b`: physical Next BUILD_ID is a timestamp. Host stage release now refuses this mismatch before copying. [Release](../releases/v2026.10.17.791.md). PR #923 merged to main `92cb1582` with CI policy checks PASS. This does NOT certify current Test, v530 UI, or finance. New exact-built Test generation and signed-in continuity must precede a Production decision.


## v2026.10.17.790 — Financial readiness evidence completeness (main merged; Production HOLD)
- v737 read-only finance gate now rejects missing/invalid ledger counters, malformed app-grant responses and contradictory WLD totals rather than incorrectly returning READY. [Release](../releases/v2026.10.17.790.md). Read-only live snapshot still shows 5 directly app-writable protected tables and 19 uncertified projection differences; PR #921 merged to main `c619fc23` with CI success; no financial reconciliation approval, v530 UI approval or Test/Production promotion.


## v2026.10.16.742 — Administrator Discord DM operational alert routing (candidate)
- Curated DiscordAlertService system events now mirror to the authorized admin DM alongside channel messages; credentials, member raw data and logs are not forwarded. [Runbook](../operations/discord-administrator-direct-messages.md). Test/build green; CI/exact-SHA Test/Production and existing finance/UI release gates remain open.

## v2026.10.16.739 — SEO background submission fail-closed in Test
- During isolated v738 shadow Test backend startup the existing cron unexpectedly submitted 39 URLs to external indexing services. Shadow stopped, unit removed; official Test/Production unchanged. Fix: Test never schedules, production requires explicit indexing opt-in, destroy cancels startup and periodic timers. 4 targeted tests PASS; PR #899 merged main 38597632, exact-SHA private Test shadow (with external IP denied) passed after 36s with zero scheduled SEO executions. Production release stays BLOCKED by v530 UI and finance P0. [Release](../releases/v2026.10.16.739.md).


## v2026.10.16.737 — Read-only financial release control (AUTHORITY_DRIFT / BLOCKED)
- A new zero-mutation repeatable-read ledger/ACL gate detects direct application DML on 5 core tables and uncertified opening/ledger projection discrepancies. Production v717 read-only findings: 40 balances, 19 mismatches, +4,779,188 WLD unexplained opening or drift, 0 per-transaction debit/credit imbalance; **do not invent ledger corrections**. Scope is a release-control improvement only, not finance P0 or v530 release acceptance. [Report](../worklog/2026-10-16-financial-readiness-v737.md).

## v2026.10.16.736 — AI blog v735 exact-main Test acceptance, Production release hold (AUTHORITY_DRIFT)
- PR #895 merged SHA 9618a249; post-merge CI and exact-SHA Test v735.2 accepted. Immutable Production candidate staged but **NOT switched**. Public Production v717. [Release](../releases/v2026.10.16.735.md).
- Production app-role direct balance/ledger DML and v530 complete authenticated UI five-pass still BLOCK. Legacy v600 frontend restarted externally after stop; backing blog JSON remains read-only. Neither release authority nor financial risk is silently waived.

## v2026.10.16.735 — AI blog emergency containment and write failure guards (AUTHORITY_DRIFT)
- Four retired legacy frontend writers; public v717 preserved. New code fails closed on direct runtime blog persistence and propagates disk errors, with TDD. [Worklog](../worklog/2026-10-16-ai-blog-production-unblock-v735.md).
- Actual Production app role still has direct balance/ledger DML and v530 full authenticated UI five-pass remains blocked. This is NOT Production application acceptance.

## v2026.10.16.734 — Host release-identity preflight correction (CONTROL_PLANE only)
- PR #886 verifier merged into an isolated integration branch: manifest-derived current Production systemd generation, ordered service environment build IDs, strict identity fail-closed. Current Production v717 and Test v721.2 both return `ok=true`, `failures=[]`; release unit regressions 29/29 PASS. This does **not** establish runtime deployment, finance P0 acceptance or 166-page × 5 authenticated UI coverage. [Release](../releases/v2026.10.16.734.md).


## v2026.10.16.722 — AI blog editorial-containment release evidence (AUTHORITY_DRIFT)
- PR #891 v721 integrated `main=10d5dfdb`, exact-SHA Test v721.2 verified, blog-specific 135/135 browser passes, admin publication hold remains fail-closed. [Evidence](../releases/v2026.10.16.721.md) / [한국어](../releases/v2026.10.16.721.ko.md). This records release evidence and does not supersede the product-plan authority.
- Production v717 had one additional legacy AI article after v717 cutover; owner/write path unproven. Narrow shared-file read-only permission containment applied with backup and matching checksum. No app cutover. Existing v530 five complete all-route authenticated passes and Treasury/Economy Core finance/ledger P0 remain **BLOCKED**. No silent authority or Production acceptance.

## v2026.10.16.720 — v719 UI remediation Test acceptance and Production hold (AUTHORITY_DRIFT)
- Source PR #889 integrated main `0908c8d0` with identical Git tree to Test-built `bf538d0e` (tree `317d07e9`). [Release evidence](../releases/v2026.10.16.719.md) / [worklog](../worklog/2026-10-16-ui-v719-test-production-hold-v720.md).
- Exact-SHA v719.2 Test accepted 2026-10-16 16:51 KST, backend/frontend/host identity, health, auth-session restart continuity, protected negative POST 403 and noindex confirmed; synthetic Test session revoked and secret removed.
- This is **not** a v530 all-UI acceptance or a finance permission/ledger fix. Five complete authenticated 166-page/34-admin UI passes and Treasury/Economy Core DB/ledger P0 remain **BLOCKED**. Production remains v717, no runtime cutover authorized by this documentation.


## v2026.10.16.717 — Regional blog SEO and editorial publish hold
- Isolated #879 country blog integration, 24 region-authored articles, locale canonical/hreflang/sitemap, explicit 503 editorial hold on unsourced automatic publication. No finance/database changes. [Release](../releases/v2026.10.16.717.md). Final GitHub PR/main CI, isolated Test authenticated restart and Production Nginx blue/green 5/5 public smoke checks PASSED (2026-10-16 14:30 KST); exact source SHA 176ca04e. Old v712 retained for rollback; existing Treasury finance/ACL/ledger risk remains unresolved.


## v2026.10.16.715 — Documentation integration and Production hold
- #878 (v711 platform audit) and #881 (v713 remediation blueprint) merged after fresh required CI, with both merged source branches deleted. [Release/worklog](../releases/v2026.10.16.715.md). This is documentation-only; public Test and Production remain on v712 source SHA 142e36b5. Finance P0, protected authenticated workflows, exact-SHA Test, session continuity and rollback still BLOCK code promotion.


## v2026.10.16.701 — Server capacity and narrow PUBLIC privilege hardening
- **Production confirmed:** v701 emergency SQL applied on authoritative DB: SECURITY DEFINER PUBLIC EXECUTE 11→0 while app explicit 11 retained; Production API/sessions data unaffected. Direct balance/ledger DML remains open. [Live report](../releases/v2026.10.16.701.md).
- Staged isolated, fail-closed privilege script (PUBLIC executable security-definer functions only) with clone RED/GREEN/rollback acceptance, without changing application-owned 11 EXECUTE grants. Owned completed build caches reclaimed 2.44GiB while preserving required rollback releases. [Release](../releases/v2026.10.16.701.md) / [KO](../releases/v2026.10.16.701.ko.md). Treasury/bonds/FX/pension direct balance DML remains a separate mandatory ledger-first remediation.

## v2026.10.15.697 — Observed Production rollout and remaining finance risks
- Manual live Production blue-green release via Nginx and persistent systemd; canonical source tag prod-v2026.10.15.697, GitHub main PR #874 identical tree. [Release](../releases/v2026.10.15.697.md) / [KO](../releases/v2026.10.15.697.ko.md). No Production DB migration, finance least-privilege and full authenticated Production E2E remain open.

## v2026.10.15.696 — Actual Test promotion with financial release hold
- Public Test frontend/backend exact v695 SHA verified; authenticated QA session survived backend restart. v653 monetary/market fail-closed candidate was integrated in a new v696 branch without monetary migration. Production ACL and financial ledger correction remain absolute gates. [Release](../releases/v2026.10.15.696.md).

## v2026.10.15.695 — Integration candidate, release gates BLOCKED
- Isolated #850/#852 and v678 grant route build fix. No financial schema/money/deploy. [Release](../releases/v2026.10.15.695.md); exact-SHA Test, finance and session gates still blocked.

## v2026.10.15.695 — Branch reconciliation, Test/Production gates
- Candidate combines #850/#852 with only v678's Next.js grant route build remedy, without monetary operations/migrations. [Release](../releases/v2026.10.15.695.md) / [KO](../releases/v2026.10.15.695.ko.md).
- Local suites, typechecks and backend/Next production builds PASS. Exact-SHA Test/authoritative DB, Finance Core/ledger ACL, authentication continuity and public release identity still BLOCK Production. Other agents' 23 dirty worktree modifications remain isolated.


## v2026.10.15.688 — F675-06 Google search evidence/product governance (docs only)

- Start/mid `origin/main=44d0b46583a9a2836e0f2b41655b245cf6f1c262`, isolated `docs/gsc-evidence-center-v2026.10.15.688`, other agents' v687/treasury unaffected. [Worklog](../worklog/2026-10-15-f67506-search-evidence-v688.md).
- [Adopt paired detailed F675-06 planning](F675_06_GSC_SEARCH_EVIDENCE_CANONICAL_ACTION_SPEC.md) / [KO](F675_06_GSC_SEARCH_EVIDENCE_CANONICAL_ACTION_SPEC.ko.md): S688-01..10 exact source evidence, v685 transport fixes preserved, real query/page/country/device PT analytics and indexed-version URL Inspection, separate crawler vs Google submitted/crawled/indexed/clicked, 12 bilingual operator states, 16 official sources, D0–D7 quotas/auth/security/Test gates.
- No source implementation, GSC private live data, key access, real indexing requests or Test/Production change. v397/v530/v523/542/543 exact-SHA release blockers remain.


## v2026.10.15.686 — F675-05 first-session task truth (documentation only)

- Start/mid `origin/main=6946398986edba0ad84bc601e6d1076e442f6d05`, isolated branch `docs/first-session-truth-v2026.10.15.686`; v687 concurrent runtime audit kept separate. [EN worklog](../worklog/2026-10-15-f67505-first-session-v686.md).
- Adopt [F675-05 EN/KO First Action Truth](F675_05_FIRST_SESSION_NEXT_ACTION_TRUST_SPEC.md) / [한국어](F675_05_FIRST_SESSION_NEXT_ACTION_TRUST_SPEC.ko.md) as detailed v675 contract: O686-01..10 source truth of fake local WLD/trade success and static marketing, at-most-three actual available actions, verified settlement, v76/v82 user-authored optional return promise, nine user hypotheses, twelve bilingual messages, twelve source references, D0–D7 checks.
- v397/v530 and v523/542/543 economic, exact-SHA Test & rollback restrictions remain. No code/data/Test/Production change; present evidence is source-observed, not runtime-verified.


## v2026.10.15.685 — SEO action truth and administrator access (implementation candidate, NOT deployed)

- GitHub `origin/main=69bc8c14df236f57898b1b44ddc596be5144c30a` at start/middle. Isolated `fix/indexnow-auth-plan-parity-v2026.10.15.685`, no overlap with v683 treasury/v684 planning agents. [EN findings](../findings/MONEYVERSE_PLAN_SOURCE_GAP_REVIEW_v2026.10.15.685.md) / [KO findings](../findings/MONEYVERSE_PLAN_SOURCE_GAP_REVIEW_v2026.10.15.685.ko.md) and [evidence/worklog](../worklog/2026-10-15-seo-integrity-v685.md).
- v675 G675-05 SEO truth P0: candidate fixes false IndexNow receipts, foreign URL submission, false crawler-audit and daily digest/Discord success, and missing admin+CSRF guards. Unit tests, workspace checks and exact Test/Production distinctions in worklog.
- **This is NOT authority supersession**: v530 planning, v523/542/543 monetary integrity, unsolved crawl-versus-index provenance and exact-SHA Test/DB/auth/zero-downtime release gates remain. No balance, DB schema, Test/Production pointer or feature switch changed.

## v2026.10.15.681 — F675-04 useful calculator-to-learning journey (docs only)

- Start/middle `origin/main=8356146e157080704e157b3203e38599baec68ff`; isolated worktree `docs/calculator-learning-funnel-v2026.10.15.681`; final source in [worklog](../worklog/2026-10-15-f67504-calculator-learning-v681.md). No concurrent agent worktree overwritten.
- [Adopt EN/KO detailed calculator plan](F675_04_CALCULATOR_TO_LEARNING_OPTIONAL_GAME_SPEC.md) for v675 F675-04: current source C681-01..09 misleading local-only “alert active,” 10k WLD credit and cloud-save claims; existing real/fictional calculators, formula/source/jurisdiction and duplicate preset SEO. Eight research hypotheses, ten paired microcopy, 14 references, D0–D7 implementation/Test plan.
- Reuse /tools and /guide. Full guest answer and evidence before optional learning/share/game. No unsourced law or fictitious bonus as conversion. v397/v530 and v523/542/543/economy P0/actual Test blocked. **PLANNING** without runtime mutation.


## v2026.10.15.680 — F675-03 exact-money user receipts (planning only)

- Start/mid remote main `a37b733837cf82c3f45adb88242bd1b4f6df2cb9`; isolated worktree `docs/wld-activity-receipts-v2026.10.15.680`, final checkpoint in [worklog](../worklog/2026-10-15-f67503-wld-receipts-v680.md). Other contributors' treasury/ledger worktrees untouched.
- Adopt [F675-03 detailed plan](F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.md) / [한국어](F675_03_WLD_ACTIVITY_EXPLANATION_RECEIPTS_SPEC.ko.md): W680-01..08 source boundaries, eight user-task hypotheses, signed net-vs-pocket semantics (bank move net 0), owner-scoped API read model, immutable correction/settlement, big integer precision, realistic pagination/export and D0–D7 acceptance; 13 references.
- Keep v523/v542/v543 supply, DB grants and v530 UI/exact-SHA Test release hold. **Docs only**; no implemented UI, database function, migration, traffic/user evidence, new mint or runtime release.


## v2026.10.15.679 — F675-02 AI fictional-news product trust review (documentation only)

- Start and mid-work `origin/main=b70cedbce34ad43bffe593ffbd1ac8374edb5ffa`; final identity in [v679 worklog](../worklog/2026-10-15-f67502-ai-news-user-trust-v679.md). v678 already allocated to another agent, therefore separate version v679 and isolated worktree. No worker code or deployment pointers overwritten.
- [Adopted EN/KO F675-02 detailed design](F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.md): N679-01..08 evidence register, 7 user journey hypotheses, five actual clocks, independent generation/editorial/publication/event lifecycle, reader-visible archive/disclosure/corrections, static `pulse` honesty, secure fixed internal-model SSRF exception boundary, deterministic 8-stage Test plan and 13 source references.
- Existing v261/v325 bounded automatic impact authority and v530 UI / v523/542/543 ledger safety remain. The v660 incident is **historical**; v661 fix branch is concurrent **candidate only**; no current Production or complete model+market test accepted. No code/DB/Test/Production mutation.


## v2026.10.15.677 — F675-01 detailed user trust and reality contract (documentation only)

- Starting and mid-work `origin/main=a24a8ae9e0d14dbd63738f5bb7e4e857ca412c13`; final drift in [worklog](../worklog/2026-10-15-feature-truth-ux-v677.md). Dedicated v677 worktree avoids concurrent v675/v676 treasury worker conflicts.
- **Detailed design adopted:** [F675-01 feature reality/user trust](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.md) and [Korean](F675_01_FEATURE_REALITY_USER_TRUST_SPEC.ko.md). Four distinct state axes, six user-job hypotheses, sample copy, proposal-only APIs, real measured telemetry, admin /api-health extension, safe monetary unknown-outcome confirmation, seven implementation slices and 13 independently linked references.
- Observed from current Git source: static optimistic health fields/flagged live, stale refresh UI, and basic idle/ok/error action state. **No claim of live impact** or fabricated metrics; preserve existing v530 UI/ledger/security, exact SHA Test and zero-downtime release blocks. No runtime/DB/feature switch/Test/Production changes.


## v2026.10.15.675 — Integrated full-scope planning review (planning only)

- Start and mid-work main identity: `f2bf939e53482721ee8bbf1074bd7ebf1922b13e`; final checkpoint and any drift in [v675 worklog](../worklog/2026-10-15-integrated-planning-review-v675.md). Isolated docs branch; no concurrent worktree overwritten.
- Added EN/KO [full product/feature re-review](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.md), covering identity, UI/admin, WLD, jobs, stocks, banking/treasury, business/shop, community, newsroom/AI, public tools, SEO/l10n, ads, security/infrastructure and Android; 13 primary vendor/standard references.
- P0 G675-01..06 retain financial/authorization conservation, exact-SHA Test and authenticated UI, AI-news stale/failure safety, real action→API parity, truthful SEO and legally eligible advertising. F675-01..09 are **PLANNING enhancement candidates**, not verified implementations.
- `AUTHORITY_DRIFT` remains explicit: latest source/worklog/release does not supersede v530 UI acceptance or v523/542/543 economic invariants. This review adopts a prioritization/evidence contract **without declaring a new full-runtime acceptance baseline**.
- No code, runtime, DB, Test or Production modification; no claimed rankings, users or revenue lift. [Internal/GitHub updates](../updates/v2026.10.15.675-github.md).


## v2026.10.14.625 — WLD amount overflow protection (implementation candidate)

- Canonical integer WLD strings and BigInt arithmetic protect wallet notifications, configured fiat display, P2P/donation, burn receipts, and pension contribution/refund/payout. No holdings cap is introduced. See [English risk register](../findings/MONEYVERSE_WLD_OVERFLOW_HARDENING_v2026.10.14.625.md) and [Korean report](../findings/MONEYVERSE_WLD_OVERFLOW_HARDENING_v2026.10.14.625.ko.md).
- **P0 WLD-625-01:** direct pension/account/treasury UPDATE and treasury floor/clamping still require ledger-conservation redesign and independent database proofs. Further stock-league, auctions and other bigint/Number boundaries remain P1.
- Candidate branch only; full frontend regression and DB/security acceptance remain blocked. This does **not** supersede planning authority v530 or certify Test/Production. Worklog and internal/GitHub changelogs retain evidence.

## PostgreSQL Outbox retention optimization — v2026.10.14.622 (isolated candidate)

- Derived from the adopted v486 database architecture, not a replacement for v530 planning authority. PostgreSQL 17.11 DEV diagnosis: 957 MB DB, 213 MB Outbox, ~46,941 dead rows; expiry lookup scanned ~25,883 buffers in 36.158 ms.
- Forward-only migration 270 adds a concurrently built partial index (delivered_at, id) and per-table 5% autovacuum thresholds. Backend scheduler performs parameterized 2,000-row batches, up to 25 daily, retaining all undelivered records and the 7-day delivery retention rule.
- Isolated 260k-row synthetic Postgres Test passed SQL/index checks; backend build/typecheck and 1,165 non-DB tests passed; 391 DB-related tests skipped. This **does not** certify exact-SHA Test, Production readiness or release.
- Details: [English report](../findings/MONEYVERSE_DB_OPTIMIZATION_v2026.10.14.622.md) / [Korean](../findings/MONEYVERSE_DB_OPTIMIZATION_v2026.10.14.622.ko.md), [worklog](../worklog/2026-10-14-database-backend-optimization-v622.md).

## v2026.10.14.618 — Fullstack branch integration candidate (not authority adoption)

- Start/mid-work `origin/main=c56af867ad8f7556e53f895b0bb294c4bfc8a02d`. Isolated integration v618 contains the existing frontend fix and the distinct current SEO tools, planning, live SEO and functional acceptance audit branches. No concurrent worktrees overwritten.
- API contract drift from PR #824 CI corrected by regenerating mobile contract/EN-KO references. Release, authenticated runtime and Production claims remain gated by exact-SHA CI/Test, DB and session evidence. Details: [worklog](../worklog/2026-10-14-fullstack-branch-integration-v618.md).

## v2026.10.14.605 — Full-function verification evidence (no adoption or deployment)

- Exact source c56af867: typecheck/build passed; non-DB backend 1,162 pass/29 skipped; frontend corrected test env 1,134 pass/35 fail; static database 7 pass, bot 4 pass, QA 12 pass, lint 1,057 warnings; mobile API contract drift 3 files and Android SDK gate blocked. Anonymous Production GET 63 routes (61 initial 200, one 404, one transient disconnect), development DB ledger 831 transactions/0 unbalanced but missing migrations 237/269. [Full report](../findings/MONEYVERSE_FULL_FUNCTION_ACCEPTANCE_AUDIT_v2026.10.14.605.md).
- **BLOCKED**: no actual authenticated full-route E2E, exact-sha isolated Test or approved Production promotion. Existing security / economic integrity gaps remain open. This is an evidence ledger pointer; it does not override canonical product authority.


## Full-code security and correctness audit — v2026.10.14.603 (evidence only)

- Source-only risk register SEC-603-01–14: shared fallback authorization value (conditional P0), missing admin backup role enforcement, repeatable DAO voting, unauthenticated IndexNow, non-atomic JSON stores, fabricated treasury payment success, mock indexing telemetry and Android credential hint. Full [English audit](../findings/MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.md) and [Korean audit](../findings/MONEYVERSE_FULL_CODE_SECURITY_AUDIT_v2026.10.14.603.ko.md).
- Review main advanced from 062db65b to 6be44719 during the run and was isolated/fast-forwarded. These findings are NOT adopted feature specifications, do not supersede planning v530, and do NOT certify live exploitability, Test or Production. Resolution requires named owner, negative tests, independent exact-SHA Test acceptance and separately approved zero-downtime promotion.


## Runtime / planning authority reconciliation — v2026.10.14.600 (documentation only)

> Status: AUTHORITY_DRIFT. Planning authority remains v2026.10.05.530 until an explicit decision and its acceptance evidence supersede it. This record does **not** certify feature, Test, or Production acceptance.

- **Observed 2026-10-14 09:26 KST (Debian 13, $pc, read-only):** `production-current` points to `prod-v599`; `test-current` points to `test-v541-gsc-aa4b6387`. The running-system status reports frontend/backend/nginx active and development DB connectivity. This is **not** proof of exact-SHA Test promotion, user-facing feature health, or production database correctness.
- **Authority separation:** v599 is an observed deployment label, *not* the current planning version; master-document snapshots referring to v583/v590 are historical, not current deployment evidence.
- **Casino:** feature switch is observed `enabled` (last switch reason: reopened following inspection on 2026-09-11). The older development summary says casino APIs were removed. These are conflicting assertions: **no casino policy/availability is certified** until the current plan, route/controller existence, effective switch and legal/safety acceptance are reconciled. Do not enable, disable or advertise casino based on documentation alone.
- **Treasury:** the 30% protected reserve floor in v522 and the later 85% cash-liquidity *reported operational normalization* require a common denominator, scope, precedence and DB evidence. Neither authorizes an automatic rule change or WLD issuance.
- **API domains:** the published base API catalog enumerates 15 headings; an older integrated summary says 14. Use the catalog's **15 documented headings** as an inventory label, not as proof that 15 domains are implemented or healthy. Catalog v477 plus later addenda require generated-contract reconciliation.
- **Open gates:** revalidate `/admin/seo` overflow, `/app-api/v1/account/identities` prior HTTP 500, all-admin E2E coverage, TEST exact SHA and backend health, and an evidence-backed zero-downtime promotion. A status command is not acceptance.
- **Conflict/concurrency:** no runtime, migration, feature-switch, or Production/Test changes in this documentation cycle; re-fetch `origin/main` and reconcile concurrently authored changes before merge.
- **Evidence reference:** [v600 worklog](../worklog/2026-10-14-authority-runtime-reconciliation-v600.md) and [GitHub update](../updates/v2026.10.14.600-github.md).


> Current ledger version: v2026.10.05.530 (planning authority baseline)
> Canonical implementation contract: [PROJECT_PLAN.md](PROJECT_PLAN.md)
> Korean counterpart: [INTEGRATED_PLANNING_MASTER.ko.md](INTEGRATED_PLANNING_MASTER.ko.md)

## Mandatory cycle record
Every planning review records start/mid-work `origin/main` exact SHA, authority-version drift, reviewed detailed specs and release/work records, gap IDs with severity, evidence and acceptance gates, EN/KO parity, and whether any implementation/Test/Production claim is actually evidenced. Historical decisions are preserved and superseded explicitly rather than deleted.

## v2026.10.10.543 — 2026-10-10 — Emergency economy containment and immutable release provenance
- Started from `origin/main=545e8231f8b90b543ed9de0722adf98d63587820`; the mandatory mid-work recheck detected one concurrent commit at `origin/main=9e17095586c46e43ec1a68214658e512e457148a`. No SWF/release/authority paths overlapped, but the v543 branch was rebuilt on that exact main before continuing.
- Reconciled v523 money-supply/treasury conservation authority against current SWF source and classified startup/hourly mutation, source-free treasury inflows, synthetic growth/harvest and direct balance settlement as `AUTHORITY_DRIFT`.
- SWF execution is fail-closed behind `MONEYVERSE_SWF_EXECUTION_ENABLED=true`; the scheduler separately requires `MONEYVERSE_SWF_SCHEDULER_ENABLED=true`. Process startup no longer mutates the economy, and explicitly enabled cycles require an advisory lock plus minimum interval.
- Added `ops/release/stage-host-release.sh` to require a clean exact-SHA worktree, built artifacts, a new SHA-qualified destination, stripped Git metadata and `.moneyverse-release.json`; existing release paths cannot be overwritten.
- v543 is containment. Unsafe SWF formulas, non-canonical FX account SQL, migration-253 broad grants, pension/bond/repo/FX conservation and direct-table settlement remain v544 forward-migration/Economy Core remediation.
- The independent v530 full-UI BLOCKED gate remains active. No Production completion is claimed before GitHub CI and exact-SHA isolated Test both pass.
- Detail: `deltas/v2026.10.10.543.md`; worklog: `../worklog/2026-10-10-v543-emergency-containment.md`.

## v2026.10.10.542 — 2026-10-10 — Economy operator truth, treasury math and authority reconciliation

- Start/main checkpoint `545e8231f8b90b543ed9de0722adf98d63587820`, first mid-work recheck unchanged; isolated branch `fix/planning-economy-truth-v2026.10.10.542`. Debian remote monthly quota and Moneyverse MCP authentication block server checks.
- Re-read documentation policy, catalog, implementation-facing PROJECT_PLAN, v523 institutional authority, v522 recirculation, v530 emergency UI, v537 repair, v541 GSC, finance/lottery/bond/macro specs, Android governance and post-v530 source.
- Adopted `ECONOMY_INTEGRITY_AND_DOCUMENTATION_RECONCILIATION_SPEC.md` / `.ko.md` into the implementation plan, with E542-01..13 findings and exact evidence/acceptance boundaries.
- The admin lottery/Taylor UI now fails closed: no browser `Math.random` draw or pretend permanent burn/interest update; disabled operational controls and a clearly labelled illustrative rate preview. Added regression tests. **Branch implementation only.**
- Superseded unconditional 25M treasury anchoring, ambiguous hourly APR and additively misread allocation wording; supply remains governed by canonical Mint/retire authorization. WLD lotteries, rate writes, and claims of “zero default/guaranteed return” remain blocked pending economy, age/jurisdiction, funding, and Test evidence.
- v511 green status and post-v530 source revisions do not prove current runtime. Full-route five-pass UI, backend/API/DB, protected sessions, security/QA, CI and Production promotion are **NOT VERIFIED**. No Production mutation or release claimed.

### v2026.10.10.542 follow-up: E542-13 isolated CI migration compatibility

- Original exact-branch GitHub CI run `38044593310`: classify/policy, lint/typecheck/build passed; migration 266 failed because it hardcoded `woldeok_moneyverse_dev` while the **ephemeral** CI DB was `woldeok_moneyverse_ci`.
- Preserved immutable 266/checksum; set only CI Postgres container's fresh database and test DSNs to `woldeok_moneyverse_dev`. No Production DB change. Exact-head CI rerun pending; arbitrary database-name portability remains a separate blocked design.
- v542 findings expand through E542-13. New code changes remain in draft PR #801; no runtime promotion.

## v2026.10.05.530 — 2026-10-05 — Emergency full UI re-audit
- Initial check saw `origin/main=ca354411d88b461215a81557f686765cfedf00f0`; the mandatory pre-branch fetch detected drift to `921b467eac21645a51ba362b24cac7eaab89c081`, and the isolated v530 branch was created from that latest SHA. Mid-work refetch remained `921b467e...`.
- Re-read documentation governance and the current plan/master/responsive/accessibility/update/runtime authorities; 1,747 tracked Markdown files were also enumerated and read through a SHA-256 scan without changing concurrent dirty-main files.
- Latest-main UI inventory is 142 web page templates, including 25 administrator templates. Current Production/Test runtime identities differ from latest main, so live observations are not latest-main acceptance evidence.
- Adopted `EMERGENCY_FULL_UI_REAUDIT_SPEC.md` / `.ko.md`. Current state is **BLOCKED — URGENT UI REMEDIATION REQUIRED**.
- P0: `/admin/seo` mobile action-row clipping is supported by the supplied mobile evidence and current non-wrapping source layout. P1 gates cover touch-target triage, floating-layer occlusion, account identities HTTP 500 and heading/semantic follow-up.
- Reasserted the five-complete-pass full-route gate, authenticated all-admin inclusion, exact-SHA Test/backend health and zero-downtime Production promotion sequence.
- Audit/planning/docs only; no runtime remediation, Test acceptance or Production promotion is claimed.

## v2026.10.05.527 — 2026-10-05 — SEO demand and keyword portfolio expansion
- Start/mid-work `origin/main=5318213f1eca644c7f36df7d967a53092de0814c`; no drift at the recorded mid-work checkpoint. Dedicated worktree/branch `docs/seo-demand-expansion-v2026.10.05.527`.
- Re-read documentation governance, PROJECT_PLAN, integrated master, global SEO/growth execution, search discovery, SEO-intent activation, current pSEO configs/routes, and the unmerged v525 search-to-user planning branch as read-only concurrent input.
- Added `SEO_DEMAND_KEYWORD_EXPANSION_SPEC.md` / `.ko.md` as the demand/keyword portfolio authority: evidence states, keyword record, domestic/international cluster maps, pSEO admission/retirement, finance freshness, localization, internal-link graph, search-to-user conversion and measurement.
- Generated 10,473 discovery keyword candidates: 6,207 KO + 4,266 EN across 25 clusters. All are HOLD until measured/provider evidence and page-value gates pass; candidate count is not a publishing target.
- Fresh independent Crossref research: 40 lanes, 200,000 raw -> 111,313 deduplicated candidates, zero collection errors, stream SHA-256 `1629c7b24a688e84249d77eec2cd1ce2f8b906f91187fcbed413739aef54b523`. Full compressed corpus, manifest and sample are versioned under `docs/research/seo-demand-v2026.10.05.527/`.
- Revalidated current first-party Google/Naver/Bing search guidance, Core Web Vitals, IndexNow/Schema.org semantics, plus official finance-tool patterns. Broad-corpus quantity never substitutes for current primary-source rules.
- Planning/research/docs only. No runtime, Test, Production, indexing, ranking, traffic or revenue completion is claimed.

## v2026.10.04.523 — 2026-10-04 — Central Bank / Mint / Treasury institutional separation
- Start `origin/main=c10e1582ccc0c058dff5c5356ad8b1893759f72c`; mid-work recheck detected `origin/main=065ee42204a4238c5010897212c7fc2a6c848f64`, which added treasury English/architecture documentation. The isolated branch was rebased onto that latest main before authority edits, preserving concurrent work.
- Re-read documentation governance, catalog, PROJECT_PLAN, integrated master, current treasury redistribution/fiscal specifications, AI Economy Controller, and monetary-velocity specification before integration.
- Added `CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md` / `.ko.md` and adopted it into PROJECT_PLAN as current economic institutional authority.
- Separation contract: Central Bank owns monetary-policy approval; Mint is execution-only issuance/retirement; Central Treasury owns existing-WLD fiscal cash/tax/budget/expenditure; Economy Core/Settlement Ledger owns double-entry settlement, idempotency, reconciliation and supply invariants.
- Supply invariant: ordinary transfers, taxes, treasury expenditures, fully-funded loans and bond flows do not change total WLD. Only canonical mint/retire operations can change `M_total`.
- Existing treasury protected reserve is explicitly fiscal liquidity reserve, not authority to create money. Fiscal shortfall cannot auto-convert into currency issuance.
- Initial bank lending remains fully funded from existing WLD; commercial-bank deposit-money creation is deliberately excluded until a separate approved monetary-layer design exists.
- AI remains diagnostic/recommendation/bounded-auto for allowed low-risk keys only; direct mint/retire, monetary-order approval and fiscal-shortfall monetization are prohibited.
- Primary/first-party reference set includes IMF treasury-central-bank/TSA guidance, ECB issuance/production, Federal Reserve/BEP and U.S. Mint separation, Bank of Korea, Bank of England money-creation material and EVE first-party economic reporting.
- Planning/docs only. No runtime, DB, Test or Production implementation or promotion is claimed.

## v2026.10.04.522 — 2026-10-04 — Treasury Automated Social Recirculation Pipeline & 4-Language Translation Parity Integration
- Start/final `origin/main=065ee422` (production release `prod-v521` live and operational).
- **Treasury Automated Social Recirculation Authority Adoption (`TREASURY_AUTOMATED_SOCIAL_RECIRCULATION_SPEC.en.md` / `.ko.md`)**:
  - Officialized 5 System Vaults architecture: `VAULT_MAIN`, `VAULT_WELFARE`, `VAULT_EMERGENCY`, `VAULT_INFRA`, `VAULT_RESERVE`.
  - 4 Core Social Redistribution functions: Universal Citizen Dividend (`CITIZEN_DIVIDEND`, 40%), Settlement & Low-Income Subsidy (`WELFARE_SUBSIDY`, 40%), Public Community Infrastructure Funding (`COMMUNITY_FUNDING`, 30%), RuneScape-Style Deflationary Buyback & Burn (`MARKET_BUYBACK_BURN`, 10%), Trading Halt Full Refund (`STOCK_HALT_SETTLEMENT`, 20%).
  - Authoritative 10-Tier Tax Schedule: Marketplace 2%, Stocks 1%, Business 3%, B2B/Commerce 1~3%, Progressive Wealth Tax (0.05~0.5%).
  - Inviolable 30% Safe Reserve Floor rule: $\max(100{,}000\text{ WLD}, \text{Gross Assets} \times 30\%)$ preventing fiscal default, verified with 0-error reconciliation.
  - `/admin/treasury` Emergency Control Tower: Step-Up 2FA modal refactoring and responsive header layout fix preventing text clipping.
- **Flawless 4-Language Translation Parity (KO, EN, JA, ZH)**:
  - Extended master dictionary with 47 new `home.*` entries and reverse lookup mapping in `i18n-dictionary.ts`.
  - Full multi-language coverage across Notice Bar (`notice-bar.tsx`), Hero Balance Card, 4 Quick Actions, 2-Column Onboarding Bento, 3-Stage Mini Chips, 6 Core Feature Badges, Financial Tools Hub, Daily Retention Station, Hot Stock Highlights, and Career Mastery Cards.
- **Stage 1~3 Early-Game 100k Seed Roadmap & 60fps Video Simulator (`/roadmap`)**:
  - Integrated 12-scene interactive motion simulator and 3-stage progression guide.
- **8 Core Professions 2.0 & Career Farming Guide (`/guide/career-mastery`)**:
  - Integrated 4-step simulator, 8-career catalog, 7 promotion tiers, and certification bonus multipliers.
- **Floating Widget Stack Separation**:
  - Segregated support widget and onboarding quest floating launcher with high-contrast close button.
- **Verification and Release State**:
  - Vitest: 1,048 tests 100% ALL-PASS.
  - Next.js 16.3.8 Turbopack: 163 routes build cleanly with 0 TypeScript errors.
  - Production host (`https://easy-scraping.com` / `prod-v521`) verified operational with HTTP/2 200 OK.

## v2026.10.03.510 — 2026-10-03 — Global-growth execution design and reference expansion
- Start/mid-work `origin/main=ac4dd484a90b266d945993d7bd8be57a74e8e1df`; isolated docs branch `docs/global-growth-deep-plan-v2026.10.03.510`.
- Re-audited exact-main locale/proxy/layout/GSC/sitemap/pSEO source against the v509 authority and registered concrete P0/P1 implementation gaps instead of assuming the planning design already exists at runtime.
- Added `GLOBAL_GROWTH_EXECUTION_SPEC.md` / `.ko.md` as implementation-ready detail for locale context, translation state, server SEO read model, pSEO admission/retirement, overseas feature epics, market readiness, ads/consent, analytics, admin and release QA.
- New Crossref discovery cycle: 30 lanes, 210,000 raw records -> 121,320 within-v510 deduplicated candidates, 0 collection errors, SHA-256 `f16c6deceb18fa96fdd7b1132b2fc58e13f908899d477c9ce252a897adae7704`. v507 remains a separate corpus; no unverified cross-cycle unique total is claimed.
- Current official-source constraints were refreshed separately from the corpus, including international URLs/hreflang, people-first/scaled-content policy, canonical/sitemap/lastmod, retired Google sitemap ping, JavaScript rendering, Core Web Vitals, BCP 47/CLDR, WCAG 2.2, IndexNow, consent/ad policy and minor/privacy controls.
- Planning/docs-only cycle. No runtime, DB, Test or Production mutation/promotion is claimed.

## v2026.10.03.509 — 2026-10-03 — Global-growth authority integration onto latest main
- User approval advanced the v507 written design from review-ready isolated planning into the current planning authority chain.
- Integration branch: `docs/global-growth-seo-integration-v2026.10.03.509`; start and mid-work `origin/main=ddec006e75ffcaf866c3c6d0a82edc2b96372917`.
- The v507 global-growth commit applied cleanly because post-v507 v508 main changes and the v507 planning paths do not overlap; v508 security/runtime evidence remains intact.
- PROJECT_PLAN now treats Korean-default locale, assistive GeoIP, overseas product value, multilingual SEO/search-demand provenance, quality-gated pSEO and advertising-only international economics as current planning authority.
- The v507 detailed specifications/research keep their original version for provenance; v509 records their authority adoption rather than falsely relabeling the source research.
- Documentation-only integration. Runtime code, DB, Test and Production were not modified or promoted. Implementation requires a separate branch and exact-SHA Test/backend-health evidence.

## v2026.10.02.507 — 2026-10-02 — Korean-default global growth, international SEO and ad-revenue design
- Docs/planning-only cycle from start origin/main 5a7c658b38853f564983d19f961c689a494dc4b6 on isolated branch docs/global-growth-seo-v2026.10.02.507.
- Supersedes product-locale wording that treated English as the default: Korean is product/public fallback; GeoIP is an overseas language recommendation/chooser signal on indexable public pages and may be an automatic onboarding default only on non-indexable app surfaces. Explicit locale URLs and user choice win.
- Defines overseas utility, knowledge, onboarding, translation, timezone/event, international discovery and retention features as product value before SEO scale.
- Separates real site search performance from market search-volume estimates and prohibits generated/fallback GSC numbers from operational decisions.
- Replaces fixed pSEO page-count ambition with an admission gate for distinct intent, independent value, source freshness, canonical/hreflang/internal links, duplicate checks and a deindex/consolidation path.
- Adds text/Image/video/Discover acquisition, country/locale KPI segmentation and advertising-only market contribution economics.
- Broad Crossref discovery corpus: 150,000 raw -> 121,810 DOI/title-deduplicated candidates; manifest SHA-256 4dc89e5af460f6bbbbea4ae68a923f9cab6b6c8a274eaff5787c77a05d95b729. Discovery breadth is not manual review.
- Detailed authority: GLOBAL_GROWTH_SEO_REVENUE_SPEC.md. No runtime/Test/Production completion is claimed.

## v2026.09.29.486 — 2026-09-29 — Strict 145k Database Reference Corpus & PostgreSQL 17 Revalidation
- Research/planning/docs-only cycle. Start, mid-work, and final `origin/main=64201629c5cdf931d49e48e8808fc0f882318b3b`; isolated branch `docs/db-reference-expansion-v2026.09.29.486`.
- Crossref strict-title discovery: **145,898 raw -> 145,579 title-qualified -> 145,579 unique** records; DOI-first/title-fallback deduplication; corpus SHA-256 `d61e825f8f699ccfca9e1bc5ee13dd070d123440c680a8aa9d90c5a4d6a80216`. Every retained title contains whole-word `database` or `data base`.
- The earlier broad v486 exploratory corpus was rejected after sampling exposed generic-term false positives; the strict corpus is the accepted v486 discovery evidence.
- **DB486-01 / P0:** unexpected invalid indexes after concurrent index/reindex work block DB acceptance.
- **DB486-02 / P0:** nullable business-key uniqueness explicitly chooses NULL-distinct behavior.
- **DB486-03 / P1:** extended statistics require measured correlated-column estimator error and before/after plan evidence.
- **DB486-04 / P0 when enabled:** replication/CDC slots require ownership, consumer, lag/retained-WAL telemetry, capacity budget and bounded retention policy.
- **DB486-05 / P0:** physical/base backups require `pg_verifybackup` plus an actual disposable restore; verification alone is insufficient.
- **DB486-06 / P0:** low-impact constraint validation remains staged and lock/scan classified.
- **DB486-07 / P1:** RLS is conditional defense-in-depth with explicit owner/BYPASSRLS/FORCE-RLS testing, not a replacement for current restricted-role mutation boundaries.
- Detailed authority/evidence: `DATABASE_ARCHITECTURE_SPEC.md`, `planning/deltas/v2026.09.29.486.md`, and `findings/MONEYVERSE_DATABASE_ARCHITECTURE_RESEARCH_REVIEW_v2026.09.29.486.md`.
- Global `PROJECT_PLAN.md` intentionally remains v444 under the documented authority-drift rule; this cycle does not claim reconciliation of unrelated post-v444 product decisions. No runtime, Test, Production, migration, or user-data mutation is claimed.

## v2026.09.27.468 — 2026-09-27 — Full-Domain API Catalog & Release Logs v459~v468 Synchronization
- Documentation synchronization cycle. Base `origin/main=ce06a79f6e453a9a7f1ee2979ec3bf3fe88ca5ae`.
- **DOC-468-01 / P1:** Synchronized cumulative release logs from `v459` through `v468` into `docs/UPDATE_LOG.ko.md` and `docs/UPDATE_LOG.md` (dedicated dopamine APIs, casino decommissioning, stock preview SSR, GSC integration, P2P auction proxy bidding, VIP 5 neon avatar frames, orderbook depth fast increment presets).
- **DOC-468-02 / P1:** Expanded authoritative API catalogs `docs/API_CATALOG_MASTER.ko.md` and `docs/API_CATALOG_MASTER.md` with Domain 15 (SEO & Search Console Intelligence), Domain 16 (Moneyverse Plus VIP), Domain 17 (Real-Time WebSocket Gateway) and Domain 8 (Auction Proxy Bidding & Depth Chart).
- **DOC-468-03 / P1:** Aligned observed runtime/source repository history in `docs/INDEX*` and `docs/DOCUMENT_CATALOG*` with production release `v2026.09.27.468` (`prod-v468`, 1,552 active sessions preserved).

## v2026.09.27.467 — 2026-09-27 — Documentation authority and inventory organization
- Documentation-only cycle. Start and first mid-work `origin/main=b0c8f1e25dc15b28d44fd033fca510bce70f6960`. Final pre-integration recheck detected concurrent runtime v2026.09.27.466 at `origin/main=d64eaedccb7c094063b36fb5f46590ce19f51ab1`; changed files were runtime/root execution-plan only, so the documentation branch was recreated from that exact latest main rather than overwriting concurrent work. No runtime, Test, or Production mutation is claimed by this cycle.
- **DOC-467-01 / P0 / AUTHORITY_DRIFT:** the implementation-facing `PROJECT_PLAN.md` header remains v2026.09.25.444 while repository runtime/source history has advanced through v466. Product decisions from v445-v466 are not treated as integrated planning authority until they are actually reconciled; version-only renumbering is prohibited.
- **DOC-467-02 / P1:** refreshed `docs/INDEX*`, `docs/README*`, `DOCUMENT_CATALOG*` and `DOCUMENTATION_POLICY*` so navigation matches the authority order. The former v402 full re-review is explicitly historical rather than current authority.
- **DOC-467-03 / P1:** exact main-tree inventory found 1,638 files under `docs/`, including 1,620 Markdown files, 18 root-level dated Markdown files and 31 exact duplicate-content groups. This cycle preserves paths and Git history instead of mass deleting or moving evidence.
- **DOC-467-04 / P1:** raw Markdown pairing inventory found 85 English paths without Korean pairs and 19 Korean-normalized paths without English pairs. These include historical/internal/API legacy/third-language material, so they are triaged rather than all treated as maintained-parity defects. New maintained documentation remains English canonical with Korean second language.
- **DOC-467-05 / P1:** root `implementation_plan.md`, `PROJECT_MEMORY.md` and `walkthrough.md` are execution/history references and do not become product authority unless explicitly adopted by `PROJECT_PLAN.md`.
- **DOC-467-06 / P1:** the Android app repository receives its own docs landing/governance pair that defers product authority to this repository; stale casino/runtime assumptions in old app snapshots remain historical rather than silently current.
- Detailed audit: `docs/findings/DOCUMENTATION_AUDIT_v2026.09.27.467.md`. `PROJECT_PLAN.md` deliberately remains v444 until post-v444 product decisions are actually reconciled in a separate planning review.

## v2026.09.25.444 — 2026-09-25
- Traced 35,429 OpenAlex/Crossref records to **33,341 unique discovery candidates** with DOI-first/title-fallback deduplication; this is not a claim of manual full-text review.
- **M444-01..04 / P1:** the planned portfolio is free core, contextual public ads, ad-free/convenience/presentation subscriptions, direct non-P2W cosmetic entitlements, and disclosed sponsorship; premium value is incremental and ads remain outside sensitive surfaces.
- **M444-05 / P0:** paid WLD, paid randomized items, paid casino value, P2W economic power, and paid superior WDX information remain prohibited.
- **M444-06..08 / P1:** unit economics are effective-date/channel aware; cancellation remains straightforward; contribution margin after all variable and operating cost is the profitability authority.
- Evidence is in `MONEYVERSE_MONETIZATION_REVENUE_RESEARCH_REVIEW_v2026.09.25.444.md` and its planning delta. This is planning/docs only; no runtime, Test, Production, revenue, or legal-clearance claim is made.

## Moneyverse Arcade planning record — v2026.09.26.444
- A 100,000-record arcade discovery corpus produced 18,578 verified candidate records; it is research evidence, not a claim of implementation, Test, or Production approval.
- The proposed Arcade is bounded to non-gambling, non-cashable, non-transferable entertainment: no paid entry, cashout, random paid reward, wagering, WLD purchase, or economic advantage.
- Detailed scope, safety boundaries, age/consent, accessibility, telemetry, and release gates live in `MONEYVERSE_ARCADE_GAME_SPEC.md` and its Korean counterpart.

## v2026.09.25.443 — 2026-09-25
- Start and recorded mid-work `origin/main=99b0eaa04bbd0b28005861c624690c56744e8a14`; dedicated isolated worktree/branch `docs/db-architecture-research-v2026.09.25.443` avoids overlap with concurrent agents.
- Discovery evidence: 80,000 raw Crossref records across ten DB architecture lanes, deduplicated by DOI then normalized title to **66,858 candidate records**. Broad search false positives are explicitly Tier C discovery only, never automatic design authority.
- Revalidated existing DB strengths: numbered SQL migration authority, immutable checksum/reverse parity, restricted application role, security-definer mutation boundaries, exact integer money, idempotency, transactional outbox/ledger and deterministic locking patterns.
- **G443-01 / P0:** generated exact-SHA schema fingerprint plus Test/Production catalog-drift verification.
- **G443-02 / P0:** canonical-table PK/constraint audit and deliberate typed-domain invariants.
- **G443-03 / P0:** referencing-FK index coverage gate with measured exceptions because PostgreSQL does not auto-create child-side FK indexes.
- **G443-04 / P0:** expand/backfill/validate/switch/contract zero-downtime migration protocol with lock/scan/rewrite classification and old/new-runtime compatibility.
- **G443-05 / P0:** bounded whole-transaction retry for retryable serialization/deadlock failures while preserving business idempotency and deterministic lock ordering.
- **G443-06 / P0:** append-only ledger authority plus atomic balance projection and sampled/full reconciliation/rebuild evidence.
- **G443-07 / P0:** runtime app role remains non-owner/no-DDL; migration ownership is separated; security-definer search-path/grant checks are mandatory.
- **G443-08..13 / P1:** measured index lifecycle, conditional partitioning, typed-core/JSONB boundary, explicit delete semantics, DB maintenance/observability SLO and heavy-read separation.
- **G443-14 / P0/P1:** verified logical backup remains, while stronger RPO/RTO requires tested WAL/PITR and immutable off-host recovery rather than a documentation claim.
- Detailed authority: `DATABASE_ARCHITECTURE_SPEC.md` / `.ko.md` and research review/corpus under `docs/findings/`. Planning/research/docs only; no runtime DB/Test/Production completion claim.

## v2026.09.25.442 — 2026-09-25
- Start `origin/main=a7fac4f4db2c4db3b9f8a4e159ad6ea5267540ec`; dedicated branch `docs/all-page-qa-v2026.09.25.442` created from latest main.
- Mid-work `origin/main=a7fac4f4db2c4db3b9f8a4e159ad6ea5267540ec`; no drift. `git diff --check` passed at the recorded checkpoint.
- Re-reviewed documentation authority, v440/v441 responsive/admin contracts, current frontend route source, historical full-UI QA records and administrator runtime-QA records.
- Current exact-source snapshot contains **86 frontend pages**, including **22 `/admin/**` pages** and **8 dynamic pages**; 25 loading components and 3 error components were also observed. Historical 60-route sweeps therefore cannot prove current full-route completion.
- **G442-01 / P0:** every page in the exact release candidate is mandatory QA scope. Sampling or 'changed routes only' acceptance is superseded.
- **G442-02 / P0:** all administrator pages are baseline coverage in every full-site pass; administrator verification is not a separate optional or deferred phase.
- **G442-03 / P0:** source-generated route inventory must reconcile 1:1 with the QA ledger and final accepted evidence. Any missing/skipped route or count mismatch blocks Production.
- **G442-04 / P0:** every candidate requires at least five complete full-site QA passes; every pass visits every page and cumulative evidence covers viewport, role, dynamic fixture, content-length and UI-state matrices.
- **G442-05 / P0:** dynamic pages require direct valid/invalid/not-found/permission fixtures; parent-list coverage cannot substitute for detail-route checks.
- **G442-06 / P0:** route acceptance requires full-page traversal and local tabs/sections/dialogs/controls with real Test API/runtime data, not screenshot-only, mock-only, source-only or historical evidence.
- **G442-07 / P0:** v440 responsive matrix now applies to all pages, not only modified/admin pages. Any clipping, body overflow, overlap, inaccessible control, hidden critical content or task-completion loss blocks promotion.
- Detailed authority: `FULL_ROUTE_UI_QA_SPEC.md` / `.ko.md` plus `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.md` / `.ko.md`. Planning/docs only; no claim that current runtime already passed v442.

## v2026.09.25.441 — 2026-09-25
- Latest-main recheck detected concurrent v440 integration; work was rebased onto `origin/main=5547e5b0c2eb76c60450e089cb415bd65c81026f` rather than overwriting it.
- v440 already covers mobile overflow/navigation/card reflow/slider mismatch and five-pass responsive QA. v441 adds the missing semantic control-state contract.
- **G441-01 / P0:** policy controls must use one server-derived canonical value envelope; frontend numeric fallback defaults are prohibited.
- **G441-02 / P0:** missing/loading policy data cannot masquerade as authoritative `0.0%`; it must be loading/unknown/blocked.
- **G441-03 / P0:** slider thumb, visible number, accessible value and API payload must derive from the same value and reconcile to the server response after mutations.
- **G441-04 / P0:** AUTO-owned policy controls are visibly read-only; manual override is an explicit authorized/reasoned/versioned workflow.
- **G441-05 / P1/P0 gate:** AI health, confidence/calibration, evidence sufficiency, council agreement and policy eligibility are distinct. Undefined “trust %” labels are not acceptable operator evidence.
- **QA:** real API hydration, auto/manual transition, save/reread, refresh, rollback and error states are required in addition to v440 viewport/five-pass coverage.
- Planning/documentation only; no runtime/Test/Production remediation is claimed.

## v2026.09.25.440 — 2026-09-25
- Start `origin/main=5394dd266e68c0a3ebfee616cdf7f0d906116b48`; dedicated branch `docs/admin-mobile-responsive-v2026.09.25.440`.
- Reviewed PROJECT_PLAN, integrated master, responsive/accessibility spec, product-design/admin/economy planning and the reported Economy Operations mobile screenshots.
- **G440-01 / P0:** page-level horizontal overflow or clipped administrator navigation/content is a functional release blocker.
- **G440-02 / P0:** AI Council and economy metric/control cards must reflow to a one-column mobile layout without fixed-width overflow.
- **G440-03 / P0:** rate slider thumb, displayed numeric value, form state, submitted payload and server-authoritative saved value must agree. Mismatch blocks save/apply.
- **G440-04 / P0:** administrator navigation must preserve discoverability; hidden off-screen labels without overflow affordance are prohibited.
- **G440-05 / P0 QA:** required viewport matrix is 320/360/375/390/412/430 portrait + representative landscape + 768/1024 + desktop, with 200% and applicable 400% zoom/reflow.
- **G440-06 / P0 QA:** every materially changed responsive/admin route requires at least five complete repeated QA passes across the matrix, full-page scroll, every tab/section, long-content states and all interactive controls.
- Any clipping, overlap, unreachable control, hidden CTA, body overflow, touch-target failure, accidental reset or control/value mismatch blocks Test acceptance and Production promotion.
- Detailed authority: `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.md` / `.ko.md`. Planning/documentation only; no runtime fix is claimed.

## v2026.09.25.439 — 2026-09-25
- Start `origin/main=118a58ddc289839957caacd14650863e614f8fad`; dedicated branch `docs/session-continuity-v2026.09.25.439` created from latest main.
- Re-reviewed current authority order, PROJECT_PLAN, integrated master, authentication/API references, and existing v396 session-continuity contract.
- **G439-01 / P0:** valid users must not be logged out by application/service/host restart, deploy, proxy reload, cutover, rollback, or key rotation alone.
- **G439-02 / P0:** logout causes are restricted to user logout, explicit admin/security revocation, compromise response, account disable/delete, or normal server-authoritative expiry.
- **G439-03 / P0:** session validation authority and key material must survive runtime replacement; process memory cannot be the sole authority and deployment hooks may not truncate the shared store.
- **G439-04 / P0:** silent fallback from a valid authenticated session to guest because of release/config/key mismatch is a release failure, not a normal UX path.
- **G439-05 / P0 release gate:** exact pre-existing authenticated sessions must survive Test restart and Production cutover. Any deployment-caused logout or release-attributable auth error spike blocks promotion or requires rollback.
- Acceptance evidence requires exact candidate SHA, runtime identities, shared-session health, privacy-safe continuity identifiers, pre/post authenticated requests including safe CSRF mutation, and auth-error deltas. Session counts alone are insufficient.
- EN/KO parity required. Planning/documentation only; v439 does not claim Test or Production runtime changes.

## v2026.09.25.438 — 2026-09-25
- Start/mid-work `origin/main=328b4623f2f063eaaade74e38cb4d8f4f14561c2`; no main drift at the recorded mid-work checkpoint.
- Observed storage baseline before this cleanup: root 99G/55G used (59%); data disk 197G/135G used (72%); data disk had about 4.9M used inodes.
- Active runtime identity was re-proven before deletion: Production backend/frontend CWD and `production-current` all resolved to `prod-d058df3-v436`; Test equivalents resolved to `test-d058df3-v436`.
- **G438-01 / P0:** active symlink targets and running process CWD release roots are deletion-protected.
- **G438-02 / P1:** retain active + at least 10 recent rollback-capable immutable releases per environment and require explicit reason for longer retention.
- **G438-03 / P1:** capacity thresholds are 70% warn, 80% stop nonessential artifact growth, >=90% incident; record bytes/inodes reclaimed.
- **G438-04 / P1:** generic cleanup excludes PostgreSQL, uploads, backups, active releases and retain-until-classified QA data; broad `docker system prune --volumes` remains prohibited.
- **G438-05 / P1:** disk swap is governed by the v437 memory-continuity contract and is not reduced solely to free space.
- Detailed authority: `STORAGE_RELEASE_RETENTION_SPEC.md` / `.ko.md`. This cycle includes runtime storage hygiene evidence but no application code release, DB migration, Test promotion or Production promotion.

## v2026.09.25.437 — 2026-09-25
- Incident evidence from the Debian 13 Production VM showed PostgreSQL entering uninterruptible `D` state with repeated `kvm_async_pf_task_wait_schedule` stacks from 03:31 KST, increasing from 120s to 1,087s blocked time; the prior boot then ended without a clean shutdown and the 10:46 boot recovered system journal, the Moneyverse data filesystem journal, and PostgreSQL WAL.
- **G437-01 / P0 (Hypervisor memory continuity):** Production VM memory must not depend on aggressive host overcommit/balloon reclamation. Define and monitor a minimum guaranteed guest RAM floor, host reserve, balloon floor, swap/PSI thresholds, and forbid automatic balloon-down below the measured steady-state safety envelope.
- **G437-02 / P0 (KVM async-PF/hung-task detection):** detect `kvm_async_pf`, hung task, guest scheduling stalls, QEMU pause/reset, host OOM, storage latency and guest-agent loss at the virtualization host as well as inside the guest. A local application `/health` alone is not sufficient.
- **G437-03 / P0 (External watchdog and recovery):** an out-of-guest watchdog must probe public edge, backend, DB transaction health and guest heartbeat. On sustained VM-level failure it escalates through alert -> evidence capture -> controlled restart/failover according to a cooldown and fencing policy; it must never reboot merely because one application endpoint fails.
- **G437-04 / P0 (Database crash safety):** PostgreSQL remains on durable storage with `fsync`/WAL crash recovery intact, backups and restore evidence current, and restart automation waits for filesystem and database recovery before accepting application traffic. No auto-healer may repeatedly restart DB-dependent services while the DB is in recovery or D-state.
- **G437-05 / P1 (Host observability/evidence):** retain and correlate Proxmox/QEMU task logs, host kernel/OOM/PSI/I/O metrics, VM guest journal, PostgreSQL logs, Nginx/API availability and release identity across incidents. Preserve pre-crash evidence before automated remediation where possible.
- **G437-06 / P1 (Capacity gate):** Production/Test/AI workloads require explicit CPU/RAM/storage-I/O budgets and concurrency ceilings. Heavy local inference, builds, backups and QA must be serialized or resource-limited when they could contend with Production.
- **Acceptance gate:** Test fault-injection must cover memory pressure, guest pause/stall, database crash recovery and host/guest health disagreement; verify no ledger corruption, session continuity where the DB/session authority survives, deterministic recovery ordering, bounded restart loops and external alerting. Production promotion is blocked when host-level observability or watchdog ownership is absent.
- Start baseline `origin/main=4a4549f644972af972c47fb8f56bd9500766aa61`. Detailed authority: `docs/planning/INFRASTRUCTURE_STALL_RESILIENCE_SPEC.md` / `.ko.md` and delta `docs/planning/deltas/v2026.09.25.437.md` / `.ko.md`. Planning/docs only; no runtime mitigation, Test fault-injection or Production change is claimed.

## v2026.09.24.433 — 2026-09-24
- Revalidated the existing v400/v401 economy research authority without re-counting mirrors, translations, tracking-URL variants, or already-adopted standards. The 31,289-candidate deduplicated discovery corpus remains the broad base; v433 adds quality/provenance mapping rather than an inflated corpus claim.
- Rechecked current primary/normative evidence from the EVE Online August 2026 MER, OSRS market-intervention research, Federal Reserve settlement/liquidity research, PostgreSQL transaction isolation/locking, OWASP API Security, NIST SSDF, WCAG 2.2, OpenTelemetry semantic conventions, GitHub deployment environments, Debian 13.7 release information, and Apple platform policy.
- **G433-01 / P0 (Work/Economy):** paid work requires a server-authoritative duration or independently verifiable completion boundary; client click-to-instant-spendable-WLD is prohibited.
- **G433-02 / P0 (Ledger/Concurrency):** every balance mutation requires a durable atomic transaction, unique business idempotency key, and invariant-preserving concurrency control with bounded whole-transaction retry.
- **G433-03 / P1 (Economy):** automatic controls use a bounded multi-metric bundle—issuance, sinks, money supply, velocity, price indices, purchasing power, concentration and volume—not a single faucet/sink ratio.
- **G433-04 / P1 (Market policy):** taxes/item sinks require causal and distributional checks because intervention can raise luxury prices without reducing trade volume.
- **G433-05 / P1 (Banking/Treasury):** settlement speed is treated as a liquidity/risk parameter; faster is not assumed universally safer.
- **G433-06 / P1 (Observability):** economic policy versions, issuance/sinks, velocity, taxes, treasury flows, duplicate blocks, retries and rollbacks require correlated metrics/traces/logs.
- **G433-07 / P1 (Accessibility correction):** WCAG 2.2 SC 2.5.8 AA uses a 24x24 CSS-pixel minimum subject to defined exceptions; Moneyverse keeps 44x44 as a stronger product target, not as the WCAG normative floor.
- **G433-08..10 / P1:** protected serialized Test/Production deployment environments, Debian 13.7 freshness verification without rewriting observed 13.6 runtime absent host evidence, and mobile virtual-currency/store-policy boundaries.
- Start and mid-work main recheck: `e15a6fdd941a8f78a1a27755f148072c738eddc1` (no drift at the recorded mid-work checkpoint).
- Authoritative detail: `docs/planning/deltas/v2026.09.24.433.md` / `.ko.md`. Planning/docs only; no runtime, Test, or Production completion claim.

## v2026.09.23.406 — 2026-09-23
- Conducted exhaustive cross-reference research across academic papers, fintech architectures, and virtual economy mechanisms to formalize mitigation specs for 6 core planning domains and 8 critical gaps.
- **Key References**: Aave/Compound Kinked Jump Rate Model, LOB WebSocket Monotonic Sequence Gap Recovery (Binance/Coinbase), OSRS Grand Exchange 2% Tax & Automated Item Sink, RFC 6455 / Signal Protocol Idempotency & Cursor Pagination, CNN Multi-Factor Market Sentiment, OWASP ASVS 5.0 / NIST SP 800-63B-4 Dual-Key Rotation, Apple HIG 44px Minimum Touch Target.
- **G406-01 / P0 (Stocks)**: Monotonic sequence ID & snapshot + buffered delta resync contract for tick loss prevention.
- **G406-02 / P1 (Stocks)**: KRX standard 7-tier discrete tick size table spanning 1 WLD to 10M WLD.
- **G406-03 / P1 (Stocks)**: Multi-factor market sentiment index combining AI news (40%), price momentum (30%), volume surge (20%), and order pressure (10%).
- **G406-04 / P0 (Economy)**: 2% market transaction tax and Treasury-backed automated floor-price item buyback & permanent destruction (GE Item Sink).
- **G406-05 / P0 (Social)**: 1-on-1 direct messaging client-side UUID idempotency key `(conversation_id, client_message_id)` and mandatory cursor-based pagination.
- **G406-06 / P0 (Banking)**: Aave-style $U_{\text{optimal}}=80\%$ kinked interest rate curve and Basel III 20% statutory reserve buffer.
- **G406-07 / P1 (Auth)**: 7-day grace period dual-key overlap rotation ensuring zero session invalidation.
- **G406-08 / P1 (UX)**: 44px minimum touch target and `pb-[calc(env(safe-area-inset-bottom)+5rem)]` anti-clipping responsive layout contract.
- Authoritative spec: `docs/planning/deltas/v2026.09.23.406.ko.md` / `v2026.09.23.406.md`. English/Korean synced.

## v2026.09.23.405 — 2026-09-23
- Continued Debian 13 runtime hygiene work after merging PR #702 (main `67e34d8df182403532e1541d16391f76edfafc57`).
- Protected current DB authorities were re-proven from backend configuration and active TCP connections: Production `127.0.0.1:5433/woldeok_moneyverse_dev`, Test `127.0.0.1:5585/woldeok_moneyverse_ci`.
- Safely removed four stale container objects only: `mv-b280-pg`, `mv-ci315`, `mv-ci315b`, `wdmv-v127-fulltest-db`. Their Docker volumes were preserved.
- Added `operations/RUNTIME_HYGIENE_INVENTORY.md` / `.ko.md` and classified remaining QA/recovery DB containers as retain-until-owner/data/rollback confirmation.
- G405-01 / P1: observed wildcard host bindings for Production PostgreSQL 5433 and QA PostgreSQL ports 55432/55433/55555/56555. Firewall/network reachability was not independently verified, so this is a bind-exposure review item, not an Internet-exposure claim.
- Production 5433 remains untouched because the live backend is connected to it. QA bind tightening requires owner/workstream confirmation before stop/recreate.
- Explicit rule: container deletion and volume deletion are separate decisions; never use broad volume prune on this host.
- Runtime hygiene + documentation update only; no Production service restart, DB migration or release promotion performed.

## v2026.09.23.404 — 2026-09-23
- Re-baselined current infrastructure documentation from observed runtime facts on the authorized Debian host.
- Current observed OS/runtime: Debian GNU/Linux 13.6 (trixie), Linux 6.12.94, systemd 257, Node 24.21.0, pnpm 10.0.0, Python 3.13.5, Nginx 1.26.3, Docker 29.8.0, Production PostgreSQL 17.11.
- Current public authority is Debian 13 systemd release directories behind host Nginx, with Docker-hosted PostgreSQL. Production backend/frontend use 3000/3001; Test uses 3100/3101.
- Added canonical `CURRENT_RUNTIME_BASELINE.md` / `.ko.md` and linked it from docs README/index.
- Rewrote deployment-flow and release-guide EN/KO to distinguish OBSERVED CURRENT from TARGET/RECOVERY Kubernetes/Flux architecture.
- Corrected operations/production-deployment wording so GitOps desired state is not treated as current public-runtime proof.
- Kubernetes/Flux remains target/recovery architecture until access, DB reconciliation, exact runtime identity and public routing are explicitly reverified.
- Multiple QA PostgreSQL containers were observed; no destructive cleanup was performed. Container cleanup requires owner/use/data/rollback classification.
- Planning/docs/runtime-observation update only; no runtime mutation or Production promotion performed.

## v2026.09.23.403 — 2026-09-23
- Reorganized GitHub documentation without deleting historical evidence or breaking existing paths.
- Added canonical `docs/README.md`, concise `INDEX.md`, `DOCUMENTATION_POLICY.md`, and `DOCUMENT_CATALOG.md` with required Korean companions.
- Added README governance files for planning, architecture, features, operations, findings, updates, changelog, worklog and releases.
- Superseded the old Korean-only policy that allowed documentation-only direct commits to `main`; meaningful documentation changes now require a branch, current-main recheck, EN/KO parity and versioned records.
- Inventory found 18 legacy root-level dated Markdown files and 31 exact duplicate-content groups, mainly historical changelog/worklog/release copies. This cycle preserves paths for link/history compatibility and prohibits new root-level dated records.
- Historical documents remain evidence, while PROJECT_PLAN / INTEGRATED_PLANNING_MASTER / adopted detailed specs define current authority.
- Documentation-only commits must not be treated as application release identity or trigger runtime promotion.
- Planning/docs only; no runtime/Test/Production claim.

## v2026.09.23.402 — 2026-09-23
- Started a full planning re-review against current repository evidence, runtime-facing contracts, standards, and recent planning decisions.
- Mechanical inventory: 166 top-level planning files = 83 EN + 83 KO, missing EN/KO counterparts 0, broken relative links 0.
- G402-01 / P0: corrected authority drift where PROJECT_PLAN still declared v397 while this master had advanced to v401. v402 is now the shared current authority marker.
- G402-02 / P1: mobile API documentation remains at 57 controllers / 335 endpoints / 179 mobile endpoints while current source discovery finds 58 controller files and 361 HTTP decorators. These counts are not declared equivalent; generated contract diff is required. Local `pnpm api:contract:check` is BLOCKED because dependencies/tsc are absent.
- G402-03 / P1: created a current active-status ledger so historical incident narratives no longer silently define current status.
- G402-04 / P1: explicit TODOs such as AUTH-105-02 and OPS-CACHE-156-01 require current-main revalidation.
- Current standards rechecked: OWASP ASVS 5.0.0, NIST SP 800-63-4/63B-4 final, OpenAPI 3.2.1, WCAG 2.2 / ISO 40500:2025, W3C ACT Rules Format 1.1.
- Canonical review: `INTEGRATED_FULL_REVIEW_V402.md` / `.ko.md`. Phase 1 normalizes authority and establishes the 12-lane full review; it does not claim the domain audit is complete.

## v2026.09.23.401 — 2026-09-23
- Added explicit research-paper-to-policy mapping to the economy plan. The 31,289-record discovery corpus remains broad coverage; selected high-confidence papers now map to adopted insight, non-adopted assumptions, and validation KPIs.
- Core evidence: Axtell & Farmer (2025) ABM; Kaplan, Moll & Violante (2018) HANK; Kaplan & Violante (2018) heterogeneity; Zheng et al. AI Economist (2020/2021); Atashbar & Shi IMF RL work (2022/2023); Atashbar (2024); Hogan-Hennessy et al. virtual-market intervention (2022); Calvano et al. algorithmic pricing (2020); Meylahn & Schinkel (2026).
- Linked cohort affordability, ABM stress testing, RL shadow gates, sink causal evaluation, and algorithmic pricing ceilings/synchronization telemetry/human approval directly to the literature.
- New canonical document: `ECONOMY_RESEARCH_PAPER_MAP.md` / `ECONOMY_RESEARCH_PAPER_MAP.ko.md`.
- Literature cannot authorize Production parameters by itself; Moneyverse replay, telemetry, acceptance thresholds and rollback evidence remain mandatory.
- Planning/docs only; no runtime/Test/Production claim. EN/KO parity complete.

## v2026.09.23.400 — 2026-09-23
- Rechecked `origin/main=7b705e1d37e97ccd05ba12042c3fd8d582e396d0` and expanded the v399 monetary-velocity evidence base.
- Added 6,879 Crossref and 17,291 OpenAlex candidates to the prior 11,749-record corpus; DOI-first and normalized-title fallback deduplication produces **31,289 unique candidates**, a net increase of 19,540.
- Re-reviewed high-confidence evidence from 2026 EVE Monthly Economic Reports, the Old School RuneScape market-intervention study, Fed/IMF/ECB/BIS heterogeneous-agent and HANK research, and the 2025 AEA/JEL ABM review.
- G400-01 / P1: aggregate averages can hide cohort affordability and distributional effects. Added new/median/high-income/high-wealth cohort price and purchasing-power telemetry.
- G400-02 / P1: nominal sink growth does not guarantee healthy prices; category-level price, volume, scarcity and substitution effects are required.
- G400-03 / P1: added dormant-balance/reactivation shocks, seasonality separation, and data revision/source-version metadata to the economy simulation/dashboard contract.
- Added `MONEYVERSE_ECONOMY_REFERENCE_CORPUS_v2026.09.23.400.csv`, EN/KO research reviews, and v400 monetary-velocity specification updates. Planning/docs only; no runtime/Test/Production claim.
- EN/KO parity complete.

## v2026.09.23.399 — 2026-09-23
- Start baseline: `origin/main=4812a99b0a78da736e477d0a3a2f02ed4ea66283`; mid-work recheck: `origin/main=f0efc448a30a5b67071956b0faa6742a8427d2ea`. The two new main commits do not overlap the economy planning files, so this branch is rebased onto the latest main.
- Revalidated the existing 11,749-record deduplicated economy research corpus and added current 2026 EVE Monthly Economic Reports plus AI Economist/IMF policy-simulation literature to the review.
- G399-01 / P0: instant-complete/instant-settle work can create excessive WLD issuance per unit time even with repeat decay. Unlimited ordinary participation remains the product default, but every paid job requires a server-authoritative duration or verification boundary.
- G399-02 / P1: economy control must not rely on one faucet/sink ratio; money supply, price indices, wealth concentration, income distribution, and new-user core-basket affordability are co-equal signals.
- G399-03 / P1: automatic controls follow exploit stop → concentrated-source decay → job diversification → high-wealth prestige sinks → bounded issuance factor → temporary reward window, with versioning, reversibility, and auditability.
- New canonical detailed spec: `ECONOMY_MONETARY_VELOCITY_SPEC` EN/KO. This cycle does not claim runtime implementation, Test completion, or Production deployment.
- EN/KO parity complete.

## v2026.09.23.398 — 2026-09-23
- Start/mid-work baseline: `origin/main=4812a99b0a78da736e477d0a3a2f02ed4ea66283`.
- Reviewed current Jobs reward UI, `work_my_dashboard_v2`, game-clock repository, migration 203, `DEFAULT_LIMIT_POLICY`, `JOBS_PROFESSION_MASTERY_SPEC`, and prior WORK-128 quota contract.
- G398-01 / P1: current UI copy can claim midnight/UTC 00:00 while the authoritative accelerated Moneyverse game clock returns different `day_ends_at`/`week_ends_at`; this creates a user-visible contract contradiction even when settlement itself uses the server clock.
- G398-02 / P1: finite daily/weekly WLD caps are visible, while planning says ordinary Jobs participation is unlimited by default. Clarified that any finite cap is a versioned reward-issuance protection window, not a generic work/play ban, and requires policy reason/reevaluation metadata.
- Required canonical summary/API fields, unlimited=`null` semantics, server-authoritative boundary display, separate daily/weekly copy, concurrency/idempotency boundary tests, web/mobile parity and exact-SHA Test gating.
- Planning/docs only. No runtime fix, Test completion or Production deployment is claimed in this cycle.
- EN/KO parity complete.

## v2026.09.23.397 — 2026-09-23
- Baseline: `origin/main=0e46f1eac272c42aa929947b79c0b0d2ccbd5454`.
- Added P0 feature/API parity invariant: every server-backed or security-sensitive feature must implement its required API in the same workstream; UI-only delivery is incomplete unless explicitly client-only.
- Required complete API contracts covering method/path, authn/authz, schema, validation, errors, idempotency, rate/resource limits, concurrency, telemetry/audit, version/deprecation, persistence and failure semantics.
- Required web/mobile contract alignment, positive/negative authorization tests, contract/schema checks, idempotency/concurrency coverage where relevant, and exact-SHA client-to-API E2E verification.
- Production promotion is blocked when a feature is visible but lacks required backend/API implementation, tests or documentation.
- EN/KO parity complete. Planning/docs only; no historical full-API-completeness claim.

## v2026.09.23.396 — 2026-09-23
- Baseline: `origin/main=5762e7bc685dc8d75ce6e672a6cef1dcc9b03ee4`; latest merged release record on main is v393 while authoritative planning had remained v388, so this cycle restores planning authority without claiming runtime deployment.
- Added P0 authentication/session-continuity invariant: server/service restart, application update, blue-green cutover, proxy reload, or rollback must not log out otherwise-valid users merely because runtime generation changes.
- Required deployment-independent session authority, stable/overlapped signing/encryption keys, cookie/schema compatibility, pre/post authenticated continuity sampling, 401/403/session-store telemetry, and stop/rollback on deployment-caused logout.
- Explicitly prohibited blanket session-store truncation/global invalidation/key replacement without overlap as deployment mechanics; security/user/admin/expiry-driven revocation remains allowed.
- Acceptance requires automated restart/cutover regression evidence on Test before Production eligibility.
- EN/KO parity: complete. Planning/docs only; no new runtime deployment claim.

## v2026.09.23.388 — 2026-09-23
- Start/Integrated SHA: `bb832b69ee56b9ab247eda24b7b20f76ea44ffb4` (23 unmerged Step-Up PRs and PR #685 fully integrated into main).
- Reviewed: `PROJECT_PLAN` EN/KO, `docs/mobile-api-complete-spec` EN/KO, `AUTHENTICATION_SECURITY_PRIORITY_SPEC` EN/KO, `COMMUNITY_MARKET_INTEGRITY_SPEC` EN/KO, runtime migration 197 proof, backend tests (974 pass), frontend tests (3 pass), promotion and production session (1,061 active sessions) continuity empirical proof.
- G368-02 P0 closed: legacy admin TOTP wording completely reconciled with migration 197 and actual deployed runtime controls (`AdminSessionGuard`, `ReauthGuard` Step-Up 2FA, browser CSRF guards, DB role/actor checks, idempotency, append-only audit).
- G368-03 P1 closed: `docs/mobile-api-complete-spec.md` and KO spec updated to v2026.09.23.388, covering 4 new domains (16 endpoints) for a total of 57 controllers and 335 endpoints (179 mobile contract endpoints verified via `pnpm api:contract:check`).
- G368-04 P1 closed: shop Step-Up and 23 unmerged PRs cleanly integrated into `main`, verified via test/build suites, and promoted to Test and Production with zero downtime.
- G368-05 P1 closed: 1,061 active PostgreSQL user sessions 100% preserved through promotion, with zero Nginx errors and verified 200 OK responses on the notification BFF route and 401 on the protected chat API.
- EN/KO parity: complete.

## v2026.09.22.368 — 2026-09-22
- Start SHA: `3f42ad8c6b12c8e13693ff246935eebceab951e1`.
- Mid-work SHA: `3f42ad8c6b12c8e13693ff246935eebceab951e1` (stable).
- Authority drift: PROJECT_PLAN v352 vs main release evidence v360.
- Reviewed: PROJECT_PLAN EN/KO, INTEGRATED_REVIEW_V348 EN/KO, UPDATE_LOG EN/KO, v359/v360 release evidence, mobile complete API contract, current admin TOTP/runtime migration evidence, and remote admin-shop reauth candidate.
- G368-01 P1: authority/version drift; later release notes do not silently override planning acceptance.
- G368-02 P0: admin TOTP was retired by migration/runtime evidence but remains stated as a current control in authoritative/detailed planning; do not count it as deployed without new runtime+DB evidence.
- G368-03 P1: mobile/API contract mixes old v2026.09.14.2/52-controller/163-endpoint material with v359 57-controller/335-backend/179-mobile material; require exact-SHA semantic machine diff and EN/KO sync.
- G368-04 P1: `auto/hourly-b-shop-stepup-v2026.09.22.366` is unmerged WIP evidence; acceptance requires current-main rebase, negative reauth/role/CSRF tests, audit and concurrency/idempotency evidence, EN/KO sync and merged exact-SHA Test proof.
- G368-05 P1: v360 session-count/zero-downtime evidence is release-specific and does not by itself prove all auth/CSRF/reauth/critical-mutation continuity.
- External refresh: OWASP ASVS 5.0.0 latest stable; NIST SP 800-63B-4 final July 2025, with periodic reauthentication/session-timeout requirements.
- Decision: planning/docs only. No new implementation, Test or Production completion is claimed.

## v2026.09.26.443 — Korea legal/compliance audit
- Start/mid-work `origin/main=6f025ced5239fc6bc8b365c31ad0fd59acf84dbc`; no drift at checkpoint.
- Added `KR_LEGAL_COMPLIANCE_AUDIT.md` / `.ko.md`. Production backend/frontend were active and `production-current=prod-v453`; selected public pages rendered AdSense.
- **KR-LGL-443-01 / P0:** KR casino remains BLOCK without authentic GRAC/rating + 19+ + legal/channel evidence. Current source/Production bundle contains unsupported approval/regular-operation wording, so release policy and runtime claims conflict.
- **KR-LGL-443-02 / P0:** existing ad monetization requires documented business commencement, business-registration/tax status before expansion.
- **KR-LGL-443-03 / P0 before paid sales:** paid digital goods/subscription remain blocked until KR seller identity/reporting, transaction disclosure, withdrawal/refund/cancellation and minor-contract controls are complete.
- **KR-LGL-443-04..08 / P1:** age-assurance wording, AdSense/overseas-transfer governance, commercial-message consent, game-classification applicability and no-cash-exchange invariants require explicit evidence/gates.
- Planning/audit only: no Production mutation, deployment, DB migration, GRAC approval, business registration or tax status is claimed.

## v2026.09.30.487 — Advertising-only cash monetization
- Start/mid-work `origin/main=85508db432cd525570e26bc1820b9e637a8140fa`; no drift at the recorded checkpoint.
- User business-registration constraint: direct product sales are not permitted under the current guidance.
- **Current cash-revenue authority:** reviewed advertising only. Paid subscriptions/ad removal, digital goods/cosmetics, paid WLD/WDX, paid random items/casino value, user-paid marketplace fees, donations/memberships, paid API/B2B, affiliate/direct-sale revenue are BLOCKED until a future business-scope/tax/legal authority change explicitly re-opens them.
- **KRW 1,000,000/month ad target:** use observed Page RPM, not industry promises. `PV = 1,000,000 / PageRPM × 1,000`; scenario points are 500k PV at KRW 2k RPM, 200k at KRW 5k, 100k at KRW 10k, and 50k at KRW 20k.
- Growth authority: qualified human traffic, Search Console/index truth, audience-first calculators/guides, correct locale structure, relevant internal links and measured AdSense experiments. Self-clicks, click encouragement, incentivized ad viewing, traffic exchanges, bot impressions and low-quality purchased traffic are prohibited.
- New detailed authority: `AD_ONLY_ADVERTISING_REVENUE_SPEC.md`; PROJECT_PLAN and monetization/KR-compliance specs were updated with superseding v487 gates.
- Official evidence refresh used Google AdSense Page RPM/Auto Ads/Experiments/invalid-traffic/publisher-policy documentation and NTS platform-ad-income tax guidance. NTS one-person-media guidance is not treated as automatic classification of this website.
- Planning/docs only; no runtime, billing, AdSense-setting, Test, Production, tax-classification or revenue-result claim.
