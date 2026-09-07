# Public discoverability audit — 2026-09-08

## Strong baseline already present

- Production and test have separate indexing modes.
- `robots.ts` allows Production crawling and blocks private/auth/API areas.
- `sitemap.ts` publishes the canonical Production origin and includes the main public feature routes.
- Root metadata provides Korean title/description, OpenGraph/Twitter fields, Google verification support, and WebSite/Organization JSON-LD.
- The protected feature menu remains authorization-driven and should not be exposed merely to make the public site look larger.

## Gaps found

1. **Board detail content was not discoverable.** `/board` was in the sitemap, but both list and detail required a member session and each detail page explicitly emitted `noindex`. This made the most naturally renewable community content unavailable to crawlers and prospective users.
2. **Search Console meta verification was not wired into the image build.** `layout.tsx` read `SEARCH_CONSOLE_VERIFICATION`, but the frontend Docker build and Deploy workflow did not pass it, so the generated metadata could omit it even when an environment variable existed operationally.
3. **Current brand discoverability is weak.** Public searches combining the domain with `월덕 머니버스` or `Woldeok Moneyverse` did not surface a clear current-site result during this audit.
4. **The domain has prior-content residue on the web.** Recently crawled third-party pages still cite `easy-scraping.com` as a source for unrelated cloud/backend-development material. Search Console should therefore be used to inspect old indexed URLs, not only submit the new sitemap.
5. **The public home can feel quiet.** An empty operations-news area and an idle real-time lobby can make a healthy but low-traffic service look inactive. This is a content/engagement gap, not a reason to weaken feature authorization.

## Remediation in this stack

- Public read-only board list/thread/comment/image path with writes still member/consent/CSRF protected.
- Indexable per-thread metadata and canonical URLs.
- Search Console verification token wired into Production image builds only.
- CI coverage for Production vs test robots/sitemap boundaries.

## Follow-up after deployment

- Confirm the Production environment defines `SEARCH_CONSOLE_VERIFICATION` or use DNS domain-property verification in Search Console.
- Submit `https://easy-scraping.com/sitemap.xml` and inspect `/`, `/board`, and representative `/board/<id>` URLs.
- Review Search Console Pages/Indexing for legacy URLs from the domain's previous content and use appropriate 404/410 or redirects only where semantically valid.
- Publish real operations notes/changelog entries regularly and link them from the home page.
- Keep the public gallery, guide, announcements, and board mutually linked so crawlers and new visitors can discover substantial content without authentication.
