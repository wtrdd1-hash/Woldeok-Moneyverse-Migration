# v2026.10.06.537 — Administrator Mobile Analytics Remediation

- Corrected the reproduced narrow-screen action collision on `/admin/seo`: long controls now reflow to one column on compact mobile, two columns at the small breakpoint, and desktop flex without label compression.
- Corrected `/admin/analytics` category navigation so tabs keep intrinsic width inside a contained touch-scroll region rather than shrinking text into adjacent controls.
- Improved the cohort card title/status layout so long Korean/English headings and the `Clean Traffic` badge reflow instead of competing for one mobile row.
- Added a route-aware floating-utility boundary: onboarding quests and the consumer support launcher no longer mount on `/admin/**`, preventing them from covering administrator content.
- Added administrator responsive regression guards for the exact SEO, analytics-tab, and admin floating-widget failure modes.
- Exact-SHA Test of the first candidate exposed two additional defects on `/admin/seo`: primary actions still computed to 40px because `size="sm"` overrode the intended touch size, and non-deterministic first-render timestamps caused React hydration error #418.
- Hardened the follow-up by switching the four primary actions to the 44px default button size, serializing one server reference time into the client, fixing crawler-log timezone formatting, and removing the fabricated initial Indexing API success record.
- Local verification after the follow-up: focused 3 files / 20 tests PASS; repository typecheck PASS; targeted lint 0 errors (existing warnings retained). A fresh exact-SHA build/Test pass is required for the new candidate.
- Authenticated five-pass responsive QA, backend readiness and Production promotion remain release gates until separately recorded.
