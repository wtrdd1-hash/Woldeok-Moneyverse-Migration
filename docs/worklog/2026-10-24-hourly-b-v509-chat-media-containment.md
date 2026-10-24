# Backend B v509 — Chat/support image media owner-ACL containment (P0, DRAFT / HOLD)

**Window:** 2026-10-24 16:38–16:52 KST. **Source main:** `49788d09494fed3e463651945b83386e87dd47bc` (verified at start, middle and before PR). **Branch:** `auto/hourly-b-chat-media-hold-v509-20261024-1640`. **Issue:** #1037. **No merge or deployment.**

## Authority, overlap, and risk
- miniPC Debian 13.6, Backend/Frontend/Bot/Nginx/Docker active; PostgreSQL status connected to `woldeok_moneyverse_dev` but **not used for tests or writes**. Production and development are not proven isolated (#1053); never run write tests on port 5433.
- Read AGENTS.md, README.md, both living project plans (English authoritative), recent QA, open PRs/branches and GitHub CI. Other work in flight: C #1135 support retry receipts (distinct support files), B #1140 blog cron, QA #1126 DB loopback, A #1143 shop wishlist. Do not duplicate or alter them.
- P0 #1037: `ChatUploadController` served chat/support image bytes by unowned random key and marked them `public, max-age=86400, immutable`. Support messages embed those URLs. Key entropy is not authorization; actual public edge leakage is **unverified**.

## Design decision and user-visible availability impact
- **Temporary containment, not a completed private evidence feature:** until a durable owner/recipient mapping, legacy-link inventory and verified retrieval contract exist, deny all legacy chat/support image media and uploads. This also temporarily disables **generic chat image attachments** and legacy image display; text-only chat/support endpoints remain untouched. The deliberate availability regression needs A/C/QA review before any release.
- NestJS `POST /api/v1/content/chat/upload`: preserve existing Session, Authenticated, Consent and CSRF guards; return HTTP 503 before a multipart interceptor, scan or storage write; no fabricated attachment success/`storageKey`.
- NestJS `GET /api/v1/content/chat/media/:key`: return uniform HTTP 404 without storage reads or bytes, set `Cache-Control: private, no-store` and `X-Content-Type-Options: nosniff`.
- Next.js `/app-api/v1/content/chat/upload` and `/app-api/v1/content/chat/media/:key`: same 503/404 fail-closed behavior before request-body buffering and private-API proxy, including HEAD; no-store. Normalize route parts exactly as `appGatewayPath` does to prevent whitespace bypass. Other `chat` and `support` routes still proxy normally.
- **No DB/API money contract or migrations changed.** Existing media objects are retained, not deleted. Already cached public copies cannot be retroactively revoked. Owner-scoped read/write, private object store and migration/legacy links remain P0 follow-up in #1037.

## RED → GREEN evidence
- Backend RED: two assertions failed against original implementation (successful upload despite no owner ACL; legacy key returned bytes/public cache). Frontend RED: two assertions failed (BFF proxied uploads/media); additional whitespace-normalization bypass reproduced RED.
- Backend GREEN: 5 controller assertions + 2 real Nest HTTP assertions (503 upload, 404 private/no-store media) = **7/7 PASS**.
- Frontend GREEN: app gateway **14/14 PASS**, including legacy GET/HEAD, upload POST, normalization bypass, and unchanged text-only chat/support routing.
- Changed-file ESLint PASS; `git diff --check` PASS. Full ESLint **PASS** (0 errors / 1,137 warnings) after renaming `module` test variable. Full TypeScript typecheck **PASS**. Backend and Frontend production builds **PASS**.
- Local root `pnpm test` **FAIL**: contract 38 PASS; DB package 15 PASS / 3 SKIP; Backend 1,316 PASS / 398 SKIP (no DB URL, no production-linked DB); Frontend 1,398 PASS / 5 FAIL. The 5 failures concern locale/SEO/login touch targets and were present in earlier QA/development cycles, not touched here. CI real PostgreSQL integration and authenticated end-to-end Test not yet proven.
- Production-only dependency audit **FAIL**: 2 High (body-parser, multer). QA/A already own overlapping remediation. Do not claim all release gates PASS.

## Release HOLD / next gates
- Official public Test SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production SHA `6a989b5ac0c6155587d43426d64f6def6b62c917` (read-only HTTP check at 16:51 KST). Neither is this branch.
- Await full CI, dependency audit, five frontend regressions, isolated PostgreSQL/security verification, legacy URL inventory and a proper owner-scoped retrieval/attachment flow. Preserve text-only functionality and coordinate image UX with A/C before merge.
- **PR must remain Draft.** No main merge, official Test exact-SHA deployment, Production promotion, service restart, Cron edit, database write or branch cleanup. GitOps release gate not satisfied.
