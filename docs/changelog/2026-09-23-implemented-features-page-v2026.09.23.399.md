# v2026.09.23.399 — Current implemented features guide

- Updated the public `/guide` page to reflect the user-facing capabilities present in the current web/backend code.
- Added a “Currently Implemented Features” section covering core economy, markets, community, world/content, and account/safety surfaces without publishing API internals.
- Corrected stale “5 professions” copy to the current eight-career model.
- Replaced the obsolete career energy/cooldown claim with the server-enforced minimum task duration and per-task daily assignment limit.
- Added guide regression coverage for implemented-feature groups and route validity.
- Fixed a missing conditional-render closure in `spaces-view.tsx` that already existed on latest main and blocked typecheck/build.
