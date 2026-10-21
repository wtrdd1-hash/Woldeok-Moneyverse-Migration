# Country-native AI blog instant publication and post-review — implementation plan v1107

**v1108 final supersession:** Overdue reviews trigger notifications only; never automatically unpublish. [Current policy](../../planning/AI_BLOG_NO_AUTO_UNPUBLISH_ADDENDUM_v2026.10.22.1108.md).

**Status: PLANNING, not executed.** [한국어 개발 계획](2026-10-22-blog-country-auto-publish-v1107.ko.md). Authority: [EN product spec](../../planning/AI_BLOG_COUNTRY_AUTO_PUBLISH_SPEC_v2026.10.22.1107.md), [KO](../../planning/AI_BLOG_COUNTRY_AUTO_PUBLISH_SPEC_v2026.10.22.1107.ko.md), plus adopted `PROJECT_PLAN`, `INTEGRATED_PLANNING_MASTER` and v975 safety architecture. Use Superpowers isolation, systematic debugging, TDD RED/GREEN/refactor, review and verification. Re-fetch current main before and midway; coordinate Gemini branches; reserve migration number only when starting code. No production writes or legacy generator reactivation from this plan.

## Phase 1107.1 — Root cause, versioned country contract and safety prerequisites

- Inventory exact merged main and Production/Test identities, active legacy blog writer services, JSON 181-entry provenance and file ownership; preserve backup/checksum, do not chmod or overwrite. Tie evidence to issue #983.
- Design `CountryArticleIntent`, `NativeArticleRevision`, `SourceReceipt`, `RiskGateResult`, `PublicationReceipt`, `PostPublicationReview`, `WithdrawalReceipt` types within the existing shared contract (`packages/contract/src`) and scoped backend `blog-editorial` module. Distinguish ISO country from BCP47 locale and country of eligibility from language.
- RED tests: country/language mismatch; US IRA incorrectly labeled as KR ISA; missing claim source; existing 181 legacy duplicate and cross-country translated article; verify no user/private data in prompts. GREEN: only typed claims and human-visible flags, never automatically passing missing evidence.

## Phase 1107.2 — Per-country evidence and deterministic risk classification

- In `backend/src/blog-editorial/blog-evidence.service.ts` (new), fetch allowlisted primary sources with bound HTTPS host, IP/DNS/redirect/size/time and usage-policy protection. Persist original language, country, retrieved/as-of/effective dates, licence, text/hash and exact claim pointers with expiry.
- Extend existing `blog-claim-checker.ts` and `blog-duplicate-review.ts` using fixtures for KR/US/JP/CN, native search intent and similarity against old JSON; add `blog-risk-classifier.ts` with `GREEN`, `AMBER`, `RED` and policy-versioned reasons. The content generator cannot assign final risk class.
- RED tests: fake live interest rate passes; stale US retirement tax year allowed; translated Japanese NISA treated equivalent to KR ISA; invalid source URL, prompt injection, missing original language evidence; policy unknown incorrectly GREEN. Refactor to GREEN via independently evaluated rules.

## Phase 1107.3 — Immediate GREEN publisher and AMBER stop

- Add forward-only `packages/database/migrations/NEXT-blog-country-publication.sql` after reading latest migration ledger; actor-scoped SECURITY DEFINER functions, source/risk receipts, country-local edition records, immutable revisions, UNIQUE idempotency, PUBLIC revoke and app-role financial ACL unchanged.
- Add `backend/src/blog-editorial/blog-auto-publisher.service.ts`: `publishGreenIfEligible(draftId, gateReceiptId)` confirms current evidence hash and GREEN policy in DB, enqueues one transactional outbox and returns a publication receipt. The model has no grant to call this without operator-owned eligibility. Add `blog-publication-dispatcher.ts` with bounded single-leader lease and no auto-run in Test.
- RED tests: concurrent workers issue duplicate posts; draft changes after gate; AMBER tax/country-current-rate bypassed; crash after commit resurrects withdrawn post; legacy API 503 accidentally lifted. GREEN must publish source-verified low-risk copy without human preapproval after checks.

## Phase 1107.4 — Retrospective 24-hour review and safe removal

- Add `backend/src/blog-editorial/blog-post-review.service.ts` and `blog-withdrawal.service.ts` with `PUBLISHED_UNREVIEWED`, `REVIEW_DUE`, `REVIEWED`, `CORRECTION_REQUIRED`, `WITHDRAWN`. At 24h without a review, emit a deduplicated reviewer alert and preserve public visibility, public SEO metadata and the same publication receipt. **Do not auto-withdraw/noindex/delete on any review timeout, including missed scheduler leases/restarts.** Admin manual withdraw is immediate, actor-scoped and reason-audited.
- Propose scoped BFF endpoints for queue, review, corrections, withdraw, global/per-country kill switch. Revoked slug returns `410` or clear correction page with `noindex`; never erase immutable audit history or leak draft body. Expire public/Next/CDN cache and sitemap/outbox but acknowledge crawler de-index delay.
- RED tests: scheduler offline across due time must never auto-withdraw; one authorized human withdraw races with publish and loses; duplicate withdraw resurrects; admin client bypasses role/CSRF; withdrawn article remains sitemap/JSON-LD. Fix and test exact effects against PostgreSQL isolated instance, not just mocks.

## Phase 1107.5 — SEO locale projection, admin, calculators

- Extend `frontend/src/app/blog/blog-data.ts`, `blog-seo.ts`, per-country page composition and `frontend/src/app/sitemap-blog.xml/route.ts` without mutating legacy JSON. Native country-specific slug/canonical/H1/visible text, only editorially equivalent reciprocal hreflang and publication-state sitemap. `withdrawn` never appears in related post links.
- Extend existing `/admin/blog` UI (`frontend/src/app/admin/blog/admin-blog-client.tsx`) with per-country queue/monitoring, actual published time, 24h pending count, risk gate reasons and immediate withdraw. Require role guard, mobile 320/375/768/1024, a11y, source drill-down and no false publication/index count.
- Calculator bridge only uses validated existing functions; require currency/eligibility/year fixtures. Do not implement unmerged v931 calculation registry twice.
- Tests: four native intentional topics including topics not cross-hreflang equivalent, declined market, 410/private meta, canonical/hreflang consistency, BlogPosting dates and no unsupported language, correct calculator arguments, private meta AND X-Robots-Tag.

## Phase 1107.6–7 — release evidence and staged promotion

- Run contract build + backend/DB/frontend tests, lint, typechecks and Next build. Real PostgreSQL tests enforce PUBLIC/application ACL; check finance grants and balances unchanged. Test duplicate publication/withdrawal crash/retry/lease/clock and 24h **alert-only** overdue status with unchanged public visibility.
- New isolated branch, PR/CI and exact commit immutable formal Test. Test has no outbound SEO submission or live publishing; prove administrative auth/CSRF/session restart and full v530 mobile/login/admin routes; do not label skipped checks passing. Verify official Test noindex, Production v1106 indexing rules intact, version and code hash match, Nginx blue/green rollback and no duplicate writers. Production application promotion only upon applicable project-wide gates and explicit authorization, with EN/KO versioned start/mid/end and GitHub/internal updates.
