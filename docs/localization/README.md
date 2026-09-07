# Localization Maintenance Policy

The localized README files are **full project guides**, not marketing summaries.

## Supported guides

| Locale | File |
| --- | --- |
| 한국어 | `README/README.ko.md` |
| English | `README/README.en.md` |
| 简体中文 | `README/README.zh-CN.md` |
| 繁體中文 | `README/README.zh-TW.md` |
| 日本語 | `README/README.ja.md` |
| Español | `README/README.es.md` |
| Français | `README/README.fr.md` |
| Русский | `README/README.ru.md` |
| العربية | `README/README.ar.md` |
| हिन्दी | `README/README.hi.md` |

## Required parity sections

A localized guide should continue to cover all of the following when the main README changes materially:

1. service overview and virtual-data disclaimer;
2. real public Production screenshots and responsive behavior;
3. feature overview/table;
4. architecture and trust boundaries;
5. jobs/work and retry/idempotency behavior;
6. quests/events truthfulness;
7. casino odds, limits and server-authoritative results;
8. banking/credit/bond integrity rules;
9. stocks/businesses/shop summary;
10. canonical WLD integer-string precision rule;
11. security model and internal API boundary;
12. mobile/external-app gateway/BFF guidance;
13. Test → Production deployment flow;
14. backup/recovery policy;
15. development/runtime baseline;
16. links to detailed architecture/features/operations/releases.

## Facts that must remain synchronized

Do not translate these into different technical meanings:

- Job 2.0 current catalog: 8 careers × 3 active tasks = 24 active tasks.
- Core disclosed casino baseline: 95% RTP for the documented coin/dice core games.
- Casino exposure baseline: 10–200 WLD/play, 2,000 WLD daily stake, 1,000 WLD daily realized loss, unless a later policy release explicitly changes it.
- WLD is an exact canonical integer string across API boundaries.
- `INTERNAL_API_TOKEN` is server-to-server only and must not be embedded in browser/native clients.
- Production deployment is explicit; a normal push to `main` runs CI rather than automatically rolling Production.
- Production DB/member/ledger data and Docker volumes are not routine cleanup targets.

## Screenshot policy

Localized READMEs may reuse the same language-neutral Production screenshots from `docs/images/showcase/`. Do not create ten duplicate copies of the same PNG.

Only public/session-safe screenshots may be committed. Never commit member-private or administrator data simply to localize screenshot labels.

## Update checklist

When a release changes a fact represented in localized guides:

- update the root README;
- update all affected localized guides;
- update each localized changelog;
- update detailed feature/operations documentation where appropriate;
- run the relative-link checker;
- run secret/control-byte guards;
- verify the files on GitHub `main` after push.

A translation can use natural local terminology, but the security/economy behavior must remain semantically equivalent across languages.
