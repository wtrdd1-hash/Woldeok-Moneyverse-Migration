# v2026.09.21.324 — Repository-Wide Security Master Plan

- Added `docs/planning/SECURITY_MASTER_PLAN.md` and its Korean counterpart.
- Established OWASP ASVS 5.0.0 as the primary application verification baseline, with OWASP Top 10:2025, API Security Top 10:2023, CWE 2025, CVSS v4.0, CISA KEV, NIST SSDF and SLSA as complementary inputs.
- Added threat-model and negative-test requirements across authentication, authorization, API, frontend, database, economy, stocks, banking, marketplace, community, 1:1 chat, uploads, admin, treasury, AI, mobile, WebSocket, CI/CD, supply chain, infrastructure, secrets, observability and backup/restore.
- Added explicit business-logic abuse coverage for double-spend, replay, race, escrow, settlement, privilege and treasury invariants.
- Added P0/P1/P2 vulnerability handling and release-blocking policy.
- Added a security Definition of Done and exact-SHA Test/Production security gates.
- Documentation only: no runtime, database, Test or Production change is claimed by this release.
