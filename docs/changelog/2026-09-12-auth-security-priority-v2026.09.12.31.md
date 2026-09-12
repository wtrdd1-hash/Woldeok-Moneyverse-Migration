# Authentication Security & Implementation Priority v2026.09.12.31

## Summary

Added an implementation-oriented priority and first-party authentication security specification for Moneyverse.

## Changes

- Ranked unfinished work as P0 security/account foundation, P1 product completeness, P2 growth/revenue.
- Defined first-party `local_email` registration/login as a provider layered onto the existing OAuth/session core.
- Updated password requirements against final NIST SP 800-63B-4, including 15-character minimum for single-factor passwords, 64+ supported length, compromised-password blocklist, no arbitrary composition rules and no routine forced rotation.
- Selected Argon2id adaptive hashing with unique salts, versioned parameters and rehash support.
- Made SQL injection a release-blocking defect and required parameterized queries/fixed reviewed DB functions, identifier allowlists and automated injection regression tests.
- Added least-privilege private-data DB design, admin masking, negative permission tests, production-data separation and backup deletion-replay requirements.
- Added secure email verification/reset, enumeration resistance, credential-stuffing/spraying defenses, mail-bomb controls, session security center, revoke-all, MFA/reauthentication and identity-link safety.
- Added Korea September 11, 2026 privacy-regime review gate and breach-readiness requirements without assuming service-specific legal thresholds.

## Deployment

Documentation-only. No Test or Production deployment is required for this documentation version. Runtime implementation requires a separate development branch and isolated Test exact-SHA security validation before Production.