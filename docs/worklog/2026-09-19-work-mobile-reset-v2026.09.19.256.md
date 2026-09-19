# Internal Worklog — v2026.09.19.256

Scope: repair the /work mobile false “new version deployed” state and stale accelerated reset display.

Root cause:
- Production Nginx owns /api/version as the backend runtime identity.
- StaleTabNotice compared that backend SHA with the frontend NEXT_PUBLIC_BUILD_ID, so healthy mixed deployments were falsely marked stale.
- /work was server-rendered without live refresh, so DB day/week windows could advance while an open page kept old counters.
- game_day_key/game_week_key are synthetic persistence keys, not member-facing calendar dates.

Changes:
- Frontend identity moved to /frontend-version.
- Stale-tab detector and regression test now use the frontend-owned endpoint.
- /work refreshes visible tabs every 10 seconds, so 10-minute day and 70-minute week boundaries update without manual reload.
- Synthetic game day/week keys are no longer rendered next to the real reset timestamp.
- No backend, schema, ledger, reward-policy, or migration change.

Verification: stale-tab tests 5/5 passed; contract build, frontend typecheck, and Next production build passed.
Promotion: branch CI -> exact-SHA isolated Test -> frontend/backend identity + authenticated /work + backend health -> main -> exact merged SHA build -> zero-downtime Production -> post-deploy probes.
