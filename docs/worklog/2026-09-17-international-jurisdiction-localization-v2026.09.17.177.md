# Worklog — v2026.09.17.177 international jurisdiction/localization research

## Scope

Research and planning only. No application, DB, Test or Production mutation.

## Work history

- Branch: `docs/international-jurisdiction-localization-v2026.09.17.177`
- Base main: `f7d2087f342a087bc568ffc4abcaac5540f62e5b`
- Superseded local attempt: `docs/casino-legal-safety-v2026.09.17.176` / `faa047fdb637df74b4327ef45c9585be1c15d8c5` (never pushed/merged; replaced after main took authoritative v176)
- Main rechecked after user expanded scope: `f7d2087f342a087bc568ffc4abcaac5540f62e5b`
- Reviewed existing casino, monetization, billing, minor-safety and search specs before editing.
- Used authority-first external research: Google Search Central, Korean law/GRAC/store rules, PIPC/FTC, EU Commission/DSA/GDPR consumer material, UK Gambling Commission, Washington statute/Ninth Circuit, FTC COPPA, Australian Classification, Japan FSA, Apple and Google Play billing/age policies.
- A raw reference-count target was not used as a quality metric; duplicated/SEO/secondary material was not allowed to become a release rule.

## Decisions

1. Separate locale and jurisdiction.
2. Add international feature-policy engine with fail-closed high-risk rules.
3. Expand locales with review-versioned translation assets.
4. Use Google-recommended separate locale URLs/hreflang/x-default and avoid automatic locale redirects.
5. Sell only non-P2W, casino-independent products.
6. Require CSP or equivalent provenance isolation before cash monetization coexists with casino.

## Validation / status

- Run `git diff --check` and relative Markdown-link validation.
- Repository environment does not expose a Prettier executable; `pnpm exec prettier --check` was unavailable (`Command "prettier" not found`).
- Docs-only; Test/Production promotion not applicable. The v176 backup/DR P0 remains OPEN.

## PR / CI evidence

- Initial commit: `af2f359f33a0a73da6b9d5a14d622fc20466058f`
- PR: #413
- GitHub Actions CI: run `35173516232` full PASS
- Status: docs-only, runtime Test/Production promotion N/A, PR merge pending
