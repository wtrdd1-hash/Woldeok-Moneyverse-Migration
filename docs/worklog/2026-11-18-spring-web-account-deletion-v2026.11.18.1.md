# v2026.11.18.1 — Spring web account-deletion public page migration

**Status:** IN PROGRESS / RELEASE HOLD (source-only work)  
**Date:** 2026-11-18 KST · English canonical | [한국어](2026-11-18-spring-web-account-deletion-v2026.11.18.1.ko.md)

## BEFORE (recorded before code changes)
- Owner directed full web frontend and backend migration to Spring. This is one safe, noncanonical slice, not full migration.
- Initial merged `origin/main`: `e96e8f81f4d6b99b221392a2b6fe46356361b145` (2026-11-18 read). Read AGENTS, canonical planning master and project plan, documentation policy, Spring migration draft and QA findings.
- Isolated branch `feature/spring-web-account-deletion-v2026.11.18.1`, stacked on the existing Spring web foundation `feature/full-spring-web-foundation-v2026.11.17.2` (PR #3213). Avoids modification of PR #3249 (frontend resilience/logs).
- Existing Next `/account-deletion` page renders `DeletionRequestInfo`; copy must preserve deletion request method, data retention periods and security cautions exactly. The Next canonical route stays the sole live owner.
- Mini-PC via Desktop Commander: all listed devices are offline. No host-local Gradle, private Test, Nginx, live DB or production validation is possible from this connection.
- Scope: feature-flagged Spring MVC read-only preview `/spring-web/account-deletion`, bilingual EN/KO, responsive accessible HTML, noindex/private headers, controller tests and comparison checklist.
- Security constraints: no account operation, financial write, backend session change, secret, canonical redirect or runtime promotion.

## IN PROGRESS
- Independent preview controller and Thymeleaf template.
- Tests for bilingual HTML, strict headers, external-link safety, and disabled-by-default behavior.
- Recheck `origin/main` before marking completed and opening a stacked draft PR.

## FINISHED
- Pending code and verification evidence. **TEST and Production are not verified**.
