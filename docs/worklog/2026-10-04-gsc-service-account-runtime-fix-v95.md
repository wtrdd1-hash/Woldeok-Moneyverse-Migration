# GSC Service Account Runtime Fix — v95

**English canonical** | [한국어](2026-10-04-gsc-service-account-runtime-fix-v95.ko.md)

## Start record
- Date: 2026-10-04
- User-visible symptom: `/admin` Search Analytics still reports "key not registered / demo aggregation mode" after the user registered the Google Search Console service-account key.
- Working branch: `fix/gsc-service-account-20261004`
- Start `origin/main`: `12e575435dc53e7f864758f248e6acda00006070`
- Start branch HEAD: `12e575435dc53e7f864758f248e6acda00006070`
- Runtime authority: Debian 13, systemd + Nginx, isolated Test before Production promotion.
- Reviewed authority before mutation: `docs/planning/INTEGRATED_PLANNING_MASTER.md`, documentation governance/catalog/index, current runtime baseline, release guide, and root implementation plan.
- Planned scope: trace service-account persistence/read path, Search Console credential detection, API client/authentication path, admin UI status contract, environment/secret mounting, and Test/Production runtime configuration.
- Release gate: dedicated branch, exact-candidate tests/build, isolated Test backend/readiness + changed-flow verification, recheck latest `origin/main`, then zero-downtime Production promotion only from reconciled exact-main candidate.
- Secret handling: never commit, print, log, or copy service-account private-key material into repository documentation or Git history.

## Mid-work record
- Mid-work `origin/main` recheck: `12e575435dc53e7f864758f248e6acda00006070` (unchanged from start); Integrated Planning Master remains `v2026.10.04.523`.
- Root cause confirmed in source and Production runtime:
  1. Next route `POST /api/seo/gsc` parsed the JSON and returned a local success response without forwarding it to the backend.
  2. Backend stored a submitted key only in process memory, so any restart discarded it.
  3. Backend `getGscAnalytics()` never called Google; it generated deterministic demo metrics. Production returned exactly 4,671 clicks / 70,600 impressions / 6.62% CTR / 7.1 position while reporting `hasCredentials=false`, matching the user screenshot.
  4. Production and Test runtime environments have no `GSC_SERVICE_ACCOUNT_KEY`; therefore the previously pasted key is not recoverable from the configured runtime.
- Remediation in progress: real Google OAuth service-account JWT exchange, official Search Console Search Analytics queries, encrypted PostgreSQL persistence (migration 247), admin/session/CSRF guards, removal of all fabricated GSC fallback values, and UI-visible sync errors.
- Google first-party contract rechecked mid-work: service-account JWT uses RS256 with `https://oauth2.googleapis.com/token`; Search Analytics uses `POST https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query` with `webmasters.readonly`.


## Final record
Pending.
