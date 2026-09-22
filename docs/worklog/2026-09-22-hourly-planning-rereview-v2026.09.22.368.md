# Planning changelog — v2026.09.22.368

- Reconciled authoritative planning v352 against stable `origin/main=3f42ad8c...` and release evidence through v360.
- Added G368-01 for authority/version drift and preserved later implementation history without treating it as silent plan authority.
- Added G368-02 P0: retired administrator TOTP/SecondFactor wording must not be counted as an active deployed control; current-control claims must follow runtime/DB evidence.
- Added G368-03: mobile/API contract version and mixed endpoint-count drift require exact-SHA semantic machine diff, not count-only synchronization.
- Added G368-04: unmerged admin-shop recent-reauth branch is WIP candidate evidence with explicit negative-security/audit/concurrency acceptance gates.
- Added G368-05: active-session counts and zero-downtime release wording have bounded evidentiary scope.
- Revalidated OWASP ASVS 5.0.0 and NIST SP 800-63B-4 final status. Planning/docs only; no implementation or deployment claim.
