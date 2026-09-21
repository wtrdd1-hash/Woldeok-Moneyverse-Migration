# User restriction step-up — v2026.09.22.332

Status: local validation passed; exact-SHA CI pending.

## Scope

- Reviewed current main and open integration/dependency PRs after abuse-security step-up landed.
- Selected the remaining member restriction mutation because it changes account access state but only required an admin session and CSRF.
- Added `ReauthGuard` without changing the route contract or database mutation path.
- Added a focused guard regression test.

## Gates

- Local focused test/typecheck/diff check: passed (1/1 focused test).
- Exact-SHA CI / isolated Test / production promotion: pending.
