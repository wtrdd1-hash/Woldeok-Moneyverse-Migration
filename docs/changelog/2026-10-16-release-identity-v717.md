# v2026.10.16.717 — Host preflight service identity fix

[한국어](2026-10-16-release-identity-v717.ko.md) · [GitHub note](../updates/v2026.10.16.717-github.md)

Implementation branch adjusts `scripts/release/verify-host-runtime-identity.mjs` to select live manifest-versioned Production systemd units and their ordered effective EnvironmentFiles, rather than old v600 and static env. Two negative/positive tests added, total 10/10 pass; exact v712 Test/Prod preflights pass and wrong-version check blocks. Paired `docs/RELEASING.md` updated. No financial code, runtime, member data or Production deployment. v713 critical release hold remains.
