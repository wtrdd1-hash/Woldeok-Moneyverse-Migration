# Security hotfix candidate — boundary path normalisation (2026-11-27)
[한국어](2026-11-27-security-hotfix-boundary-paths.ko.md)

## Before work
- Base: 979c7d4270 (source of the currently recorded Production backend build). Purpose: smallest candidate carrying only the boundary-path fix from #3456 (d3bff728b4 path part, 3895bce01f, 61dd57b80b), so it can go through Test independently of the larger stack. Details of the finding are kept in the internal security record.
- No migration, no frontend change, no configuration change. Rollback = previous jar.

## In progress
- [x] Cherry-pick path-normalisation parts only (identity-header sanitizer from #3456 is not in this base and is not included).
- [x] RED on base / GREEN on candidate, full Spring suite, jar with source SHA, isolated sandbox probes.

## Finished
- Code fb50ff0c5c (test-only follow-up after the fix commit). Unit: boundary test 21/21 GREEN; the same test against the base filters 14 failures (RED). Spring full suite 865 / 0 failures / 0 errors / 0 skipped.
- Jar built with -PmoneyverseSourceSha; sandbox /api/version reports the exact SHA. Artifact sha256 c4215f6bab7229fd8c4c5b21c3d51ff523245f22e181b64c9acf093d86317e61.
- Isolated synthetic sandbox (no Production data): an unmodified base jar admits the anonymous probe; the candidate answers 401 for every probe variant and 302 for admin pages.
- Differential regression: anonymous GET of all 151 static routes on base jar vs candidate jar — identical status codes except the two build-identity endpoints (base jar built without a full SHA).
- Not verifiable in the clean sandbox for either jar: member session flows of this base depend on table privileges that only the deployed database carries (recorded internally). Member/financial regression belongs to the official Test runtime.
- Independent review: Gemini (one bounded run) on the filter code — one hardening accepted (included), other claims not reproducible. Codex pending quota reset.
- Status: CODE_READY / candidate registered for the designated Test publisher (G8 HOLD: publisher and common lease not verifiable from this agent). No Test or Production change by this agent.
