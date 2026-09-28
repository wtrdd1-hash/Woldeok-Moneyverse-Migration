# CI secret-fixture repair worklog — v2026.09.28.479

**English canonical** | [한국어](2026-09-28-ci-secret-fixture-v2026.09.28.479.ko.md)

- Status: IN PROGRESS
- Scope: CI policy failure caused by a secret-like test fixture in backend/src/seo/seo.service.test.ts.
- Base origin/main: b6af50519fa460f26199899c441f2b4918eefe28.
- Branch: fix/v479-ci-secret-fixture.
- Runtime/Test/Production: no runtime behavior change is planned; only the test fixture representation may change.

## Before work

- Root cause evidence from PR #745 CI: scripts/check-secrets.sh flags the test fixture's PEM private-key delimiter in backend/src/seo/seo.service.test.ts.
- Source inspection confirms SeoService.saveGscCredentials validates client_email and stores raw JSON; the test does not require a cryptographically valid private key.
- Planned TDD cycle: reproduce scripts/check-secrets.sh failure (RED), replace only the secret-like test value with an explicit non-secret placeholder, rerun the scanner and focused SEO test, then run repository verification required for this non-runtime change.
