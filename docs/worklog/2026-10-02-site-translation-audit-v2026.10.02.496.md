# v2026.10.02.496 — Site Translation Audit Worklog

**Status:** AUDIT COMPLETE / FIX NOT IMPLEMENTED
**Branch:** `audit/translation-v2026.10.02.496`
**Start and mid-work origin/main:** `a36c63f4cfa35702499b461f7cc00dfd9ae25d36`
**Production application SHA:** `7080738e656aca099d5c871278d178d69a984fcc`

## Start record
Reviewed documentation governance, the authoritative project plan, integrated planning master, localization policy, and current main before auditing the site translation path.

## Findings
- Current main defines `DEFAULT_LOCALE='ko'`, while project authority requires English primary and Korean secondary.
- Current main supports only `ko/en/ja/zh`; the authoritative P0/P1 plan requires `en/ko/ja/de/fr/es/pt-BR`.
- GeoIP currently participates in locale selection, conflicting with the authority rule `locale != jurisdiction`.
- `TranslatedText` is binary English/Korean; Japanese and Chinese fall back to Korean on those surfaces.
- Two master dictionaries exist, but one has no runtime import and the other has only one non-test consumer.
- 523 frontend source files contain hard-coded Korean text; 55 files use binary `isEn` branches.
- Production returns HTTP 200 for /en, /ja and /zh, but Korean titles/text remain on localized pages.
- Production returns 404 for /fr, /de, /es and /pt-BR.
- Production sitemap advertises locale paths for en/ja/zh only; planned locales are absent.

## Verification
Targeted locale/dictionary/language-switcher/search-indexing tests: 13/13 passed. The tests currently encode the four-locale/Korean-default behavior, so passing does not establish conformance with the authoritative plan.

No application code, database, Test runtime, or Production runtime was changed in this audit.
