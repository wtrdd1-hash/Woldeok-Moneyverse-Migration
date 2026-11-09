# v1946.2 — Owner override: unverified AI editorial visibility

**Authority:** 2026-11-09 explicit owner directive supersedes v1405 only as to public visibility and ad placements. This does NOT authorize falsifying original sources, verification receipts, fabricated financial metrics or financial transactions.

1. Do not require a human editor to publish. Separate `PUBLISHED` and `WITHDRAWN` from quality verification. Only explicitly published unverified text is public; draft, withdrawn and deleted data remain hidden.
2. Independently verified article remains in the existing DB/SECURITY DEFINER contract. A model draft not passing independent proof can publish to a separately labeled, blog-only, idempotent JSON store; never call `blog_publish_verified` with fake `quality: PASS`.
3. Each public unverified article must identify itself as AI-generated and unverified; safe rendering escapes HTML and malicious scripts. The one-shot worker must not awaken global economy schedules or allow public write endpoints.
4. The site enables blog ad slots per owner request. **AdSense external compliance warning:** Google explicitly prohibits its served ads on automatically generated content without manual curation/review. Owner requested configuration is not proof of eligibility; external rejection or account risk remains, and network serving cannot be promised.
5. Production promotion requires exact candidate tests, Test/verified API acceptance, canary native SSR and sitemap, Nginx rollback, independent existing finance health and evidence. Do not claim release until verified.
