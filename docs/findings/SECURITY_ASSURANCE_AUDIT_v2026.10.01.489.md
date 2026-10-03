# Security Assurance Audit — v2026.10.01.489

**English canonical** | [한국어](SECURITY_ASSURANCE_AUDIT_v2026.10.01.489.ko.md)

Status: **AUDIT / REMEDIATION_REQUIRED**
Date: 2026-10-01 KST
Server repository baseline: `597c6029a8539d501e3c554582552cb761feab6c`
Android repository baseline: `e24a2f8c9390092b0ae7aeaa3286ca8d799d91b3`
Audit branch: `docs/security-audit-v2026.10.01.489`

This is defensive assurance evidence. It does not claim penetration testing of the public Internet, Test verification, Production remediation, or successful deployment.

## Authoritative reference baseline

- OWASP Top 10:2025 — https://owasp.org/Top10/2025/
- OWASP ASVS 5.0.0 — https://owasp.org/www-project-application-security-verification-standard/
- OWASP API Security Top 10:2023 — https://owasp.org/API-Security/
- NIST SP 800-63B-4 — https://csrc.nist.gov/pubs/sp/800/63/b/4/final
- NIST SP 800-218 SSDF 1.1 — https://csrc.nist.gov/pubs/sp/800/218/final
- PostgreSQL 17 function security — https://www.postgresql.org/docs/17/perm-functions.html
- GitHub Actions secure use — https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
- GitHub secret scanning / push protection — https://docs.github.com/en/code-security/secret-scanning
- Debian security / unattended upgrades — https://www.debian.org/doc/manuals/securing-debian-manual/
- Android App Links — https://developer.android.com/training/app-links
- OAuth 2.0 Security Best Current Practice, RFC 9700 — https://www.rfc-editor.org/rfc/rfc9700

The existing Moneyverse security master plans already cover the correct control families. The main gap found in this pass is implementation/operations drift from those plans.

## P1 — high-priority findings

### SEC-489-01 — PostgreSQL development container is published on all host interfaces

Runtime evidence on Debian 13 shows Docker publishing PostgreSQL 17.11 as `0.0.0.0:5433->5432` and `[::]:5433->5432`. Docker nftables contains the corresponding DNAT/accept path. Active localhost connections to port 5433 were observed.

Impact: any network that can route to the host may attempt to reach the database port. This audit did **not** establish public-Internet reachability, so it does not claim Internet exposure.

Required remediation:
- publish database ports to loopback only, or remove host publishing entirely and use a private container network;
- add an explicit host-input firewall allowlist;
- verify Test/Production database roles are non-owner, least privilege and separately credentialed;
- add a release/host check that fails on unexpected wildcard database listeners.

### SEC-489-02 — SSH permits root password login and broad forwarding

Effective `sshd -T` state includes `permitrootlogin yes`, `passwordauthentication yes`, `x11forwarding yes`, `allowtcpforwarding yes` and `maxauthtries 6`.

Impact: if SSH is reachable outside a tightly controlled management network, credential attack and post-login tunnelling impact are materially increased.

Required remediation:
- use key-only non-root administration;
- disable root password login and password authentication after access recovery is proven;
- disable X11 and restrict TCP forwarding unless a documented operator workflow requires them;
- add explicit management-source firewall restrictions and recovery access;
- validate lockout/recovery before applying to Production.

### SEC-489-03 — Native OAuth handoff uses an unverified custom URI bearer-code return

Android registers `woldeok-moneyverse://oauth/callback`. The server creates a short-lived, single-use opaque handoff code and the app exchanges it for a session. Replay/expiry protections are good, but the handoff code is not bound to the requesting app instance.

Impact: another installed app can claim the same private scheme and, if it receives the callback first, attempt to redeem the bearer handoff code.

Required remediation:
- prefer a verified HTTPS Android App Link with `android:autoVerify` and `assetlinks.json`;
- additionally bind mobile authorization to an app-generated PKCE-style verifier/challenge or equivalent one-time client proof;
- retain five-minute/single-use/hash-at-rest controls and add hostile-app interception/replay tests.

### SEC-489-04 — GitHub Actions are not consistently pinned to immutable commit SHAs

The server repository contains 20 action references in current workflows; 10 were observed using mutable major-version tags such as `actions/upload-artifact@v4`, `actions/download-artifact@v4` or `actions/checkout@v7`. The Android CI likewise uses mutable action tags. The Production credential export workflow is among the workflows with unpinned actions and can access deployment secrets.

Impact: compromise or unexpected movement of a referenced action tag expands CI/CD supply-chain risk.

Required remediation:
- pin every third-party action to a full commit SHA;
- use Dependabot/Renovate-style reviewed SHA updates;
- retain least-privilege workflow permissions;
- require protected environment approval for credential-bearing jobs;
- verify artifact provenance/attestation but do not treat attestation alone as a security guarantee.

### SEC-489-05 — Android release signing has hard-coded fallback passwords and debug uses release signing

`app/build.gradle.kts` falls back to literal passwords when signing environment variables are absent, and the debug build uses the release signing configuration. The referenced JKS was **not** found in the public repository, so this audit does not claim the signing key itself is exposed.

Impact: a leaked or copied keystore may be much easier to misuse if it retained the fallback password; debug workflows unnecessarily exercise the release signing identity.

Required remediation:
- remove password fallbacks and fail the release build when required signing secrets are absent;
- never use the release key for ordinary debug builds;
- rotate upload-key credentials if the real keystore ever used the published fallback;
- keep the keystore outside source and CI artifacts/logs.

## P2 — medium hardening/drift findings

### SEC-489-06 — Discord edge route is a prefix instead of the documented exact path

The documented boundary exposes only `/api/v1/integrations/discord/interactions`, but current Nginx uses `location /api/v1/integrations/discord/` in both Test and Production blocks. Today the controller contains only the signed interactions route, so no second endpoint was found exposed in this pass.

Required remediation: change to exact-match location and add a negative routing test proving sibling integration paths do not reach NestJS.

### SEC-489-07 — Default Nginx virtual host accepts arbitrary Host values

A local request with `Host: untrusted.invalid` returned HTTP 200 and the normal site. Current Production block uses `server_name _` as the default server.

Required remediation: explicitly name approved Production hosts and make a separate default server reject unknown Host values. Re-test OAuth redirects, canonical URLs, caches and Cloudflare/origin routing.

### SEC-489-08 — Production cookie security can be weakened by configuration

Production defaults to Secure cookies, but `COOKIE_SECURE=false` is accepted by configuration. This creates a fail-open deployment footgun against the documented Secure-cookie invariant.

Required remediation: reject Production startup when Secure cookies are disabled; keep plain HTTP cookies limited to explicit local development.

### SEC-489-09 — Major Moneyverse systemd units have little sandboxing

`systemd-analyze security` reports high exposure scores for primary Moneyverse services, and concrete settings show `NoNewPrivileges=no`, `ProtectSystem=no`, `ProtectHome=no`, `PrivateTmp=no`, broad capability bounds and other protections disabled on most units. The economy-AI unit is partially hardened and can be used as a pattern.

Required remediation: add tested per-service drop-ins using least writable paths, `NoNewPrivileges`, filesystem protection, private temporary space/devices, kernel/control-group protections, capability reduction and address-family restrictions where compatible.

### SEC-489-10 — Host security-update automation is absent and 57 packages are upgradeable

`unattended-upgrades.service` is not installed/enabled on the audited host; 57 packages were reported upgradeable. This count is **not** asserted to mean 57 security vulnerabilities.

Required remediation: establish a documented security-update cadence or controlled unattended security updates with reboot/release coordination and monitoring.

### SEC-489-11 — CSP retains `'unsafe-inline'`

The frontend has a useful CSP and other browser headers, but `script-src` and `style-src` retain `'unsafe-inline'`. This reduces XSS containment.

Required remediation: move security-sensitive pages toward nonce/hash-based policy and keep ads/third-party script surfaces separated from account/admin/value-moving routes.

### SEC-489-12 — HTTP throttling remains process-local

The HTTP tiered throttler is process-local and explicitly becomes weaker with multi-instance scale-out. Blue/green overlap can therefore split budgets.

Required remediation: move abuse-sensitive limits to an atomic shared store before horizontal scale-out; preserve endpoint-specific budgets and trusted client-IP handling.

### SEC-489-13 — Secret check is repository-snapshot only

`scripts/check-secrets.sh` passed and found no committed secret in the checked tree, but it intentionally does not prove all Git history is clean.

Required remediation: enable/verify GitHub secret scanning and push protection and add a history-aware scanner for release gates.

### SEC-489-14 — Android legal-document WebView enables JavaScript/DOM storage unnecessarily

The legal terms/privacy viewer loads first-party fixed URLs, has no JavaScript bridge in the reviewed code, and network cleartext is disabled. However it enables JavaScript and DOM storage with a general WebView client.

Required remediation: disable JavaScript/DOM storage when legal content does not require them, constrain navigation to the approved HTTPS host/path, and open non-first-party links externally.

## Positive controls confirmed

- Backend defaults to loopback binding and requires a production internal token outside narrow explicit exemptions.
- Internal token comparison uses constant-time comparison; browser client code does not receive the token.
- Request DTOs use global whitelist + forbid-non-whitelisted validation and bounded body parsers.
- Session cookies use HttpOnly, SameSite and `__Host-` semantics when Secure.
- CSRF, server-side session state, rotation/revocation and recent-auth controls are represented in current auth architecture.
- PostgreSQL migrations broadly use `SECURITY DEFINER` with pinned safe search paths, actor checks and explicit grants/revokes; migration 233 hardens PUBLIC function execution defaults.
- Server-side secret-floor scan passed for the current tree.
- Android disables cleartext traffic and backups, pins API host/HTTPS, stores session material in encrypted preferences, disables redirects and redacts credential headers from debug network logs.
- Current release pipeline already contains exact-SHA candidate concepts, SBOM/provenance generation and isolated-Test/Production gates in several workflows.

## Release posture

No runtime fix was applied in v489. No isolated Test or Production promotion was performed. P1 findings should be remediated in dedicated implementation branches, tested against isolated Test, and only then promoted with the existing zero-downtime release process.

## Final-main drift recheck

During the audit, `origin/main` moved first to `34dddce057df97ca745d5cf580b5eda12b1b6a8d` and then to `597c6029a8539d501e3c554582552cb761feab6c`. The audit branch merged both updates before finalization. The final runtime delta added/changed the floating support-chat widget and synthesized browser audio. The reviewed support mutations still obtain CSRF state, use idempotency keys, encode thread IDs in API paths, and render message bodies as React text rather than raw HTML. No additional P1 finding was introduced by that drift review.
