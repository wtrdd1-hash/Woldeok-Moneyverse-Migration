# Multer 2.3.0 security update — 2026-09-09

## Finding

The production dependency audit began failing after new upstream advisories were published for `multer`. `@nestjs/platform-express@11.2.3` pins `multer@2.2.0`, while the advisories classify crafted multipart requests as High-severity denial-of-service issues and identify `2.3.0` as the patched release.

The affected code is reachable in this service because profile and administrator photo upload endpoints use NestJS multipart handling before the application's image magic-byte/dimension validation runs.

## Remediation

- Added a root pnpm override requiring `multer >=2.3.0`.
- Regenerated the frozen lockfile; the resolved Multer version changed from `2.2.0` to `2.3.0`.
- No application API, schema, migration, economic rule, or production data was changed.

## Validation

- `pnpm install --frozen-lockfile`
- `pnpm audit --prod --audit-level=high`: no known vulnerabilities after the override
- lint/typecheck/backend upload-related tests are run before push; GitHub CI remains the required PostgreSQL-backed merge gate.

## Rollback

Revert this commit to restore the previous lockfile. Because the previous version has known remotely triggerable availability vulnerabilities, rollback should only be used to diagnose a compatibility regression and should be followed by an alternative patched Multer integration before production use.

## References

- GHSA-wc9g-mqfw-jrwm / CVE-2026-77078
- GHSA-535w-7cp7-47q4 / CVE-2026-82333
- GHSA-qfvm-cv95-jqjf (file-descriptor leak on aborted uploads; patched in Multer 2.3.0)
