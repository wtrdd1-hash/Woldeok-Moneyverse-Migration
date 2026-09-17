# v2026.09.17.177 — International jurisdiction, localization, casino and monetization planning

> Date: 2026-09-17
> Branch: `docs/international-jurisdiction-localization-v2026.09.17.177`
> Base `main`: `f7d2087f342a087bc568ffc4abcaac5540f62e5b`
> Runtime impact: none (documentation only)

## GitHub-facing changes

- Added an international `country × subdivision × channel × age × feature` policy architecture.
- Expanded product/public locales to English, Korean, Japanese, German, French, Spanish and Brazilian Portuguese with natural-translation review gates.
- Adopted Google multilingual SEO rules: separate locale URLs, self-canonical, reciprocal hreflang, useful x-default, locale sitemaps, no forced IP/language redirects.
- Added market/channel billing design for Web, Google Play and App Store without treating one store rule as globally portable.
- Integrated Korea, U.S., UK, EEA, Australia, Japan and Brazil baselines; additional markets fail closed pending review.
- Kept casino outside monetization and added CSP/paid-provenance isolation as the target before real-money monetization.

## Validation

Documentation parity, link/index presence, forbidden stale EN/KO-only wording replacement and `git diff --check` are required before PR.

## PR / CI evidence

- Initial commit: `af2f359f33a0a73da6b9d5a14d622fc20466058f`
- PR: #413
- GitHub Actions CI: run `35173516232` full PASS
- Status: docs-only, runtime Test/Production promotion N/A, PR merge pending
