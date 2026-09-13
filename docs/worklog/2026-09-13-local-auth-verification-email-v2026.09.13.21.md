# v2026.09.13.21 — Local authentication verification email delivery

## Selected feature
First-party email/password registration: real verification-email delivery through the existing self-hosted SMTP service.

## User benefit
A member registering with `local_email` receives the verification link at the submitted mailbox instead of relying on a development-only raw token response.

## Baseline and overlap review
- Application `main` before development: `16b0385dafae809941b292e9f2bc992e4dcfacb3`.
- Existing local-auth implementation from merged PR #193 was inspected first.
- Recent auth/security branches were reviewed; no newer runtime branch superseded `backend/src/auth/local-auth.controller.ts` or provided SMTP delivery.
- Infrastructure already contains `apps/mail` running docker-mailserver, so no duplicate mail server is introduced.
- Living Project Plan was read before work and again mid-work.

## Runtime changes
- Add an SMTP verification-email sender using Node built-ins only; no new dependency or lockfile change.
- Support authenticated SMTP submission over implicit TLS by default, with non-TLS mode available only by explicit environment setting for isolated test SMTP.
- Wire successful new local registrations to send a verification link.
- Production fails closed when delivery is unavailable instead of claiming a verification message was sent.
- Development preserves the existing raw-token response fallback when SMTP is not configured.

## Configuration
Required runtime secret/environment keys:
- `SMTP_HOST`
- `SMTP_PORT` (default `465` when secure)
- `SMTP_SECURE` (`true` by default)
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM`

The production secret values must be provisioned through the existing encrypted/cluster secret path and must never be committed to Git.

## Validation
Added a local scripted SMTP regression test covering AUTH LOGIN, sender/recipient envelope, DATA delivery, and verification-link construction, plus fail-closed behavior when SMTP credentials are absent.

CI/Test/Production evidence is recorded on the pull request after the exact candidate SHA runs. No Test or Production success is claimed by this worklog.

## Remaining operational gate
The self-hosted mail server must have a valid submission account corresponding to `SMTP_USERNAME`, the backend secret must contain its password, and external delivery requires the production mail DNS/TLS/reputation path to be healthy. Actual mailbox receipt must be proven in isolated Test before Production promotion.
