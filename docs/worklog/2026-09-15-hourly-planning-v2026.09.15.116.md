# v2026.09.15.116 — Hourly integrated planning evidence

## Baseline / evidence truth
- Start and mid-run `main`: `26c717895d7368d562052fd8d9d534f630d626f1` (merged #336/#337 lineage; v2026.09.15.114–115 implementation delta).
- Authoritative `PROJECT_PLAN.md` and `PROJECT_PLAN.ko.md` still declare integrated version `v2026.09.15.110`; therefore their implementation-state statements must be reconciled before being treated as current runtime truth.
- GitHub returned no combined statuses and no PR-triggered workflow runs for current main SHA. This is `verification unavailable`, never CI green.
- Runtime/cluster evidence was not available through the connected GitHub surface in this cycle; Production/Test behavior is therefore `UNVERIFIED` unless separately evidenced.

## Fresh external references reviewed
1. Naver Search Advisor (checked 2026-09-15): robots rules must be served at site root as text/plain; private data must not rely on robots for protection; sitemap may be declared in robots; JS/CSS resources required to render indexable pages should remain crawlable. DIRECT ADOPT.
2. Naver Search Advisor SEO guidance (checked 2026-09-15): unique page title/description, indexability diagnostics, sitemap submission and crawlable href links remain baseline. DIRECT ADOPT. Naver announced FAQ structured-result exposure ended 2026-07-08, so FAQ markup must not be justified by a Naver rich-result promise. REFERENCE/REMOVE PROMISE.
3. Google Search Central structured-data guidance (checked 2026-09-15): validate structured data, test deployed URLs as Google sees them, ensure pages are not blocked by robots/noindex/login, and keep sitemaps current. DIRECT ADOPT for public catalog/content release QA.
4. OWASP Top 10:2025 A07 Authentication Failures (checked 2026-09-15) explicitly retains session fixation and improper authentication as core risks. DIRECT ADOPT together with existing ASVS/API-security baselines.

## Current-main implementation delta requiring plan reconciliation
Current main adds/extends: server/game clock and gameplay client foundation; abuse-security repository/controller/UI; permanent account suspension with live-session revocation; idempotent IP/CIDR block/lift operations; optional Android-only App API gate and guarded admin App API group; request telemetry v2 with safe context fields; storage-separation foundation; mobile API contract refresh; step-up confirmation UI. These are `MAIN_INTEGRATED / RUNTIME_UNVERIFIED`, not Production-complete.

## P0/P1 QA and security backlog delta
### SEC-116-01 — P0 — MAIN_INTEGRATED / RUNTIME_UNVERIFIED — abuse-security authority and step-up gap
Purpose: prevent a newly exposed security console from becoming an account-lockout or perimeter-abuse primitive.
Evidence: main controller uses session/auth/consent/admin/admin-session guards and CSRF for writes; permanent suspension revokes sessions; address block/lift is idempotent. Current evidence does not prove Production route policy, second-factor/reauth enforcement at every destructive action, DB actor constraints, or exact-runtime audit behavior.
Attack scenarios: compromised admin session permanently suspends users; broad CIDR blocks legitimate users; self-block or control-plane block causes operator lockout; replay races duplicate changes; BOLA targets another block ID; reason text becomes stored-XSS/log injection; IPv4/IPv6 canonicalization bypasses duplicate/deny rules.
Design: destructive suspension/block/lift must require recent reauth + second factor at execution time, not only page entry; DB function independently validates privileged actor and prohibits self/last-admin destructive lockout; canonicalize network using PostgreSQL `inet/cidr`; define protected control-plane/admin allowlist policy; preview affected scope before CIDR commit; append immutable actor/target/network/reason/request-id/idempotency/result audit; never log secrets/cookies/auth/CSRF/body.
QA: privilege-negative tests; stale/missing step-up; CSRF; replay/same-key-different-payload; concurrent block/lift; IPv4/IPv6 canonical equivalence; `/0`, loopback/private/admin-control-plane policy; self/last-admin suspension; session revocation immediate across devices; stored-XSS reason rendering; DB app-role direct-write denial; rollback by audited lift/unsuspend policy rather than history deletion.
Production gate: exact-main-SHA Test proves FE→API→DB→audit→session-revocation behavior and emergency operator recovery. Any missing negative-test evidence blocks promotion.
Business: direct revenue 0; expected value is fraud/abuse/support/downtime loss avoided. KPI: unauthorized-action rate=0, security-action audit completeness=100%, false-positive block rate, appeal/reversal rate, admin recovery MTTR.

### OBS-116-01 — P1 — MAIN_INTEGRATED / RUNTIME_UNVERIFIED — request telemetry privacy/cardinality contract
Safe context currently includes trace/request IDs, client/app version, Android SDK, content/accept/language and selected response metadata. Treat every added field as an allowlist, never a generic header dump. Normalize/truncate versions/language, reject control characters, bound JSON size, define retention and access roles, and keep IP/user-agent handling under privacy retention policy. Do not persist query values, bodies, cookies, authorization, CSRF or verification tokens. Metrics must aggregate low-cardinality dimensions; raw trace/request IDs belong in logs/traces, not metric labels. QA includes malicious oversized headers, CRLF/control chars, Unicode, absent response.getHeader, 4xx/5xx, streaming responses, DB logging failure and assurance that telemetry failure cannot corrupt the business transaction.

### API-116-01 — P1 — Android-only/admin App API compatibility gate
An Android-only gate is an access-policy hint, not authentication. Client headers/version strings are attacker-controlled. Authorization remains server session/actor/role/consent/step-up based. Define minimum-supported app version as server configuration with explicit `426`/upgrade contract only where compatibility truly breaks; do not use User-Agent or client header as a security boundary. Admin mobile surfaces default off behind feature flag until parity tests prove CSRF/session semantics, reauth/MFA, least privilege, no secret exposure, and remote-disable fallback. Track version adoption, rejected-old-client rate, auth failures, admin action success/error and support burden.

## SEO/backend delta
- Public indexability is server-owned metadata: stable canonical URL, robots directive, sitemap membership and `lastModified` derive from one public SEO read model. Account/auth/admin/security/economy transaction/App API pages are forced `noindex` and excluded from sitemap.
- Public Next.js content must be server-renderable/crawlable without login and use real `<a href>` discovery links. Rendering-critical resources must not be accidentally disallowed.
- `robots.txt` is not an authorization control. Sensitive resources require authentication/authorization regardless of crawl directives.
- Release QA for each public template: HTTP status → canonical → robots → sitemap membership → title/description/H1 → structured-data validation → mobile rendering → cache invalidation after visibility/privacy change. Naver FAQ rich-result exposure must not be promised after its 2026-07-08 retirement notice.
- SEO KPI chain remains impressions → CTR → organic visit → signup → activation → D7/D30 → net revenue/contribution; SEO changes scale only if downstream quality/retention is not degraded.

## Economics / UX / operations delta
- Security/admin tooling is a cost-avoidance investment: measure fraud loss, moderation/security handling minutes per case, false-positive reversals, account-recovery/support tickets and incident MTTR before/after rollout.
- App API gating is not monetization. Its business case is reduced incompatible-client incidents/support cost; kill/iterate if upgrade rejection or admin-mobile errors materially increase support burden without measurable operational benefit.
- Request telemetry has an infra/privacy cost. Set per-request storage budget and retention tiers; sample or aggregate non-security high-volume events only after preserving security/audit evidence requirements. Scale observability only while incident detection/MTTR gains justify storage/query cost.

## Integration status
The two integrated plans were read before planning and main was re-checked mid-run. They remain stale at v2026.09.15.110 while main has advanced through v2026.09.15.115. The connector exposes each large plan as a truncated single content payload; whole-file replacement would risk destructive truncation. Direct EN/KO integration is therefore `BLOCKED_BY_SAFE_WRITE_CAPABILITY`, and this worklog is the non-destructive canonical delta for the next safe writer. Do not claim PROJECT_PLAN synchronization until both files are atomically reconciled from current main and their version/state are advanced together.
