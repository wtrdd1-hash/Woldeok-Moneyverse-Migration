# v2026.10.17.780 — Country locale and UI shell regression candidate
- Fix unexpected persistence of language-prefixed URL visits as manual locale preference.
- Correct header navigation fallback at tablet/desktop transition and desktop content max width under global overflow CSS.
- Add regression tests with source and response evidence.
- Status: candidate; review, CI, exact-source Test and Production acceptance tracked in [worklog](../worklog/2026-10-17-ui-geoip-locale-v780.md).
- Prevent prefix/query overrides from trapping manual language changes or automatic locale reset in the client locale provider.
- Preserve explicit URL locale across Next.js internal rewrite re-evaluation, verified with shadow Next HTTP SSR and a two-pass proxy regression.
