# Blog Vietnamese (vi) locale — candidate specification v2026.11.26.1625.1
**English canonical** | [한국어](2026-11-26-blog-vi-locale-candidate.ko.md)

Status: PLANNING (no code, no content). Owner decision v1517.1: prepare a candidate that meets the web's five-locale contract without generating or publishing article translations.

## Observed
- The site supports ko/en/ja/zh/vi (`frontend/src/lib/locale.ts`), but the blog uses its own `BlogLocale` (ko/en/ja/zh) in `app/blog/blog-seo.ts`; `/vi/blog` answers 404 on Production while the other four answer 200.
- `blog_verified_articles.locale` allows only ko-KR, en-US, ja-JP, zh-CN (CHECK constraint); country editions (`blog-country-editorial.ts`) carry per-language article bodies for the four locales.

## Candidate (web phase)
1. `BlogLocale` gains `vi`; hub and post chrome (labels, freshness notice, hreflang `vi-VN`, date format `vi-VN`) translated by a reviewed translation, not generated at runtime.
2. Article bodies: no Vietnamese body exists; a `vi` visitor sees the English edition with an explicit "Bài viết bằng tiếng Anh" notice and `hreflang`/canonical pointing to the English URL, never a machine-translated body presented as Vietnamese.
3. Database: no migration until a Vietnamese editorial source exists; then a new migration widens the locale CHECK to include `vi-VN` (never edit the existing constraint's migration).
4. Tests: `/vi/blog` 200 with Vietnamese chrome; post page shows the English-edition notice; sitemap/hreflang list only locales that have a body; existing four locales unchanged.

## Blockers
Reviewed Vietnamese UI strings (product copy is owner-controlled); decision whether a Vietnamese editorial source is planned.
