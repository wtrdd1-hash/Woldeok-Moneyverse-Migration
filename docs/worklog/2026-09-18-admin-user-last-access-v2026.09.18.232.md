# Admin user last-access worklog — v2026.09.18.232

Date: 2026-09-18
Branch: `feat/admin-user-last-access-v2026.09.18.232`
Runtime commit tested before documentation: `b82f6ca4554cbd81153c1a9aab840ac29556e673`
Base main: `70fcc164fc6b8265975738a9af92ba35345d102c`

## Scope and implementation
Production already had the access-summary read model and request activity logging. The UI exposed those timestamps only as tiny secondary text. This change promotes access time to a dedicated admin table field, adds full Asia/Seoul date-time rendering and adds recent-access sorting.

## Evidence
- Production DB read model exists and returns populated login/activity/admin-access summaries.
- Frontend user-directory regression: 3/3 passed.
- Frontend TypeScript check passed.
- Frontend production build passed after the workspace contract build.
- Exact runtime commit Test canary on port 3116 returned the same SHA from `/api/version`.
- Test backend on 3100 returned its build identity and the unauthenticated admin-users API returned 401, confirming the backend route and guard are active.
- Existing Test/Production services were not stopped for canary validation.

Production promotion is only complete after the merged exact main SHA passes the repository Test→Production gate and public post-promotion probes.
