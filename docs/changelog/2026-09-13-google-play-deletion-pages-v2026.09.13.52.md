# Google Play deletion pages — v2026.09.13.52

Korean counterpart: `docs/changelog/2026-09-13-google-play-deletion-pages-v2026.09.13.52.ko.md`

## Summary

Added two public, unauthenticated deletion-guidance URLs required for Google Play account/data deletion disclosure:

- `/account-deletion` — account and associated-data deletion request instructions.
- `/data-deletion` — personal-data deletion request instructions while retaining the account where applicable.

Both pages identify the app/operator, provide visible request steps, offer a fallback email path when login is unavailable, and disclose deletion/retention windows consistent with the current privacy policy.

## Policy alignment

The pages reflect the existing privacy-policy periods: OAuth/profile identifiers within 30 days after withdrawal, profile/gallery files within 30 days after a request, de-identified economy reconciliation records for up to one year, consent evidence for three years, ordinary access/authentication logs for 90 days, and admin/economy audit records for up to one year.

## Release gate

This branch must pass frontend typecheck/tests and the repository release pipeline. Production promotion is permitted only after the exact SHA is live on the isolated test environment and the configured backend/database smoke gate succeeds.
