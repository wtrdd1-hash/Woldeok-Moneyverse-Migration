# v2026.10.27.1401 — Administrator mobile presentation recovery

**Audience:** GitHub/public engineering release notes.

An administrator-page stylesheet mismatch was found during mobile QA. Production HTML referenced an old CSS chunk that the active process could not serve, despite a newer Tailwind bundle existing on disk. The current live process started before the frontend build output was replaced. This explains the oversized moon logo, browser-default menu bullets and overlapping navigation in the reported screenshot.

This change adds `scripts/release/verify-next-static-assets.mjs` and five Node regression tests. The guard fetches the live page and **every CSS file actually linked from its HTML**, checks HTTP success, `text/css` and nonempty styles, and asserts the expected compact-brand Tailwind utility. It must run against the candidate serving port before switching Nginx to a new release generation. A restored, isolated candidate on port 3384 passed all five stylesheet checks; the old production port 3354 failed on the deleted CSS path.

Application database schema, balances, administrator roles and authentication policies are unchanged. Production and Test rollout status must be recorded separately in the paired worklog: code committed to GitHub is not proof of a live promotion.
