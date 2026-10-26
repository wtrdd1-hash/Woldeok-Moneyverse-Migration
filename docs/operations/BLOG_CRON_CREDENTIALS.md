# Blog scheduler credential transport (candidate, not deployed)

The blog publisher's `POST /api/blog/generate` currently accepts a configured `INTERNAL_API_SECRET` or `CRON_SECRET` through `x-cron-secret` (and an authorized administrator session). A legacy miniPC user cron job passes a credential as a literal curl header argument; this is tracked in P1 issue #1137. No exposure is proven. The live cron job and server credential were **not changed** by this patch.

## Proposed rollout (requires security review and coordinated rotation)

1. Create a **new** unpredictable 32–128-character alphanumeric/underscore/hyphen credential using a secure local generator. Never paste the credential into shell history, a crontab, a process command, a PR, or a log. Provision it using an approved secret manager or protected input channel, not an inline command argument.
2. Store it outside the repository in an absolute regular file owned by the scheduler's effective user, mode `0600` or `0400`. The parent directory must not be writable by untrusted users. Configure the blog endpoint to expect the **same new credential**, following the service's approved secret rotation procedure.
3. Replace the existing scheduled curl command with a call to `scripts/security/run-blog-cron.sh`. Supply only `MONEYVERSE_BLOG_CRON_SECRET_FILE=/absolute/path/to/protected/file` in the scheduler environment. Preserve the existing 04:00 local schedule and redirect only nonsecret output to the existing log. Do not put the credential itself in the environment or cron entry.
4. Validate against an isolated Test instance at the exact reviewed SHA: missing/wrong credential rejects, valid credential produces one authorized response, no duplicate publication, no secret in process argv/logs, and rollback works. Verify backup and restore readiness before production.
5. After the caller and server are coordinated, revoke the old credential and independently verify it no longer authenticates. Never print the old or new value to prove rotation.

The runner fails closed for missing/unsafe credentials and sends a POST over a fixed HTTPS URL. It does **not** rotate credentials, modify the live cron schedule, or change the backend authentication contract. Its shell tests use only synthetic credentials and a fake curl; they do not publish any blog posts.

**Release status:** HOLD pending full CI, actual Test exact-SHA and authorized GitOps release gates. Production and shared databases must not be changed by this candidate.
