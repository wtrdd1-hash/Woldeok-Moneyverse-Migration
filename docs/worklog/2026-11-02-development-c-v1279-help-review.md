# Development C v1279 — Verified Help Review Queue Source Integrity

## Before work (2026-11-02 01:15 KST)
- Canonical origin/main: 510dbe6bf4d5c2a8089fc06b480776053da7a2e3. Isolated branch auto/hourly-c-help-review-source-v1279-20261102-0115; shared main and other workers untouched.
- Reviewed AGENTS.md, README.md, README/README.ko.md, English/Korean living plans, active A/B/C/QA PRs and CI.
- P1 finding: admin/help/page.tsx trusts an unvalidated 200 queue and permission flags, maps arbitrary articles, and may show publish/retract actions on malformed or expired evidence. Existing Nest guard and DB SECURITY DEFINER queue remain the authority; feature flag defaults OFF.
- Scope: strict owner/admin queue read validation, verified-empty versus unavailable, expiration-safe publication controls, responsive keyboard/screen-reader retry, no new API/DB or WLD writes. The current GET /api/v1/admin/help/articles is the only authority.
- Checklist: [x] source investigation [ ] RED tests [ ] parser and UI [ ] focused verification [ ] full exact-SHA gates [ ] main recheck [ ] PR/release decision.
- Release rule: no merge or deployment without complete mandatory gates, official isolated Test and exact SHA proof.

## In progress (2026-11-02 01:19 KST)
- TDD RED: review-evidence.test.ts failed on missing parser (exit 1). GREEN: 20 parser tests PASS.
- Page integration regression initially failed due jsdom externalizing node:crypto; corrected test environment to Node; focused parser+page 23/23 PASS.
- Implemented bounded 50-row shape checks, UUIDs, exact string versions, digest/HTTPS/date/enum validation, duplicate rejection, evidence expiry and fail-closed UI. Backend remains the authenticated Nest controller and PostgreSQL SECURITY DEFINER queue; no schema or WLD changes.
- Midpoint fetch origin/main remains 510dbe6bf4d5c2a8089fc06b480776053da7a2e3.
- Checklist: [x] investigation [x] RED [x] parser and UI [x] focused regression [ ] full gates [ ] final main recheck [ ] PR decision.
