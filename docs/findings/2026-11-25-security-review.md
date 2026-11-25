# Security Review - 2026-11-25

## Scope and method

This review examined the current `origin/main` baseline `9876c09888ec84034eec183cf1309c85df3d7447` in an isolated worktree. It traced local authentication, session and CSRF controls, internal API access, privileged financial routes, uploads, public exceptions, runtime headers, and production dependency advisories.

No authenticated mutation, financial action, data export, credential access, or destructive probe was performed. Findings below are limited to evidence-backed code or dependency conditions. This is not a claim that every runtime path or third-party service has been penetration-tested.

## Summary

- Confirmed findings: 2 Medium
- Critical findings: 0
- High findings: 0
- Deployment performed: none
- Immediate release gate: do not promote a frontend containing the affected Next.js version until the dependency issue is remediated and validated.

## Confirmed findings

### SEC-2026-11-25-01 - One-character local passwords are accepted

**Severity:** Medium
**Confidence:** High
**CWE:** CWE-521 (Weak Password Requirements)

**Evidence**

- `backend/src/auth/local-auth.controller.ts:77-85` accepts any non-empty password up to 128 Unicode code points except a short denylist.
- The registration, password-change, and password-reset paths all invoke the same `acceptablePassword` function at lines 206, 300, and 309.
- `backend/src/auth/local-auth-password-policy.test.ts:6-7` explicitly asserts that `"a"` and a single Korean character are accepted.

**Impact**

An account owner can choose a trivially guessable one-character password. The request-rate limiter reduces online guessing throughput, but it does not make a weak credential resistant to credential stuffing, reused-password attacks, or a determined online attack against a known email address.

**Remediation**

Require a minimum of 15 Unicode code points for password-only accounts, or at least 8 when a mandatory phishing-resistant second factor is enforced. Preserve the existing maximum, normalization, denylist, password hashing, generic login failure, and dummy-work behavior. Add negative tests for short ASCII, Korean, and emoji passwords, then verify register, reset, and password-change use the same policy.

### SEC-2026-11-25-02 - Frontend dependency is in seven unpatched Next.js security advisories

**Severity:** Medium
**Confidence:** High for affected dependency version; exploit preconditions vary by advisory
**Affected version:** `next@16.4.2`
**Patched version:** `next@16.4.5` or later

**Evidence**

A `pnpm audit --prod --json` run against the current lockfile reported seven Moderate advisories affecting `next@16.4.2`: The repository's existing Next.js advisory-floor test also passes at this version because it only excludes `16.4.0` and earlier; the floor has not yet been updated for these newer advisories.

- CVE-2026-119790 / GHSA-mfr8-8qww-v76h
- CVE-2026-119351 / GHSA-vc7v-qv4w-wrv8
- CVE-2026-119347 / GHSA-7qx7-33qx-rqx2
- CVE-2026-119346 / GHSA-f3mh-rxg3-f5g2
- CVE-2026-119348 / GHSA-pc58-hwjq-p385
- CVE-2026-119349 / GHSA-rhh4-g77r-r9qj
- CVE-2026-119350 / GHSA-vvgp-ww4w-46vf

The advisories cover cache disclosure or poisoning, image optimizer SVG rejection bypass, edge-route HttpOnly-cookie exposure, and self-hosted response handling. Some have configuration-specific prerequisites; this report does not claim every advisory is exploitable in the deployed topology. The dependency is nonetheless known-vulnerable and should not be released unchanged.

**Remediation**

Upgrade the frontend's `next` dependency and lockfile to `16.4.5` or later after reviewing the release notes. Rebuild the contract and frontend, run lint, typecheck, tests, build, and a Test-environment smoke check. Confirm the public image optimizer and route handlers cannot regress cache, cookie, or response behavior.

## Verified controls and non-findings

- Financial mutation routes reviewed in `backend/src/bank/bank.controller.ts` derive the actor from the server-resolved session and use the CSRF guard where required.
- The Nest API's production global guard requires an internal token unless a route explicitly opts out. Public opt-outs reviewed here were read-only public information or the signature-verified Discord interaction ingress; no missing-token financial write was confirmed.
- Uploaded image storage uses server-generated opaque keys, restrictive file modes, magic-byte checks, format dimension limits, and fixed extensions. No path traversal was confirmed.
- The application uses a host-prefixed, Secure, HttpOnly, SameSite=Lax session cookie in secure deployments.
- A static secret-pattern scan did not identify a committed credential in application source. This is not a substitute for a repository-wide secret scanner or rotation evidence.

## Environment and release observations

`docs/INFRASTRUCTURE.md` declares `test.easy-scraping.com` as the exact-SHA Test release gate. A non-authenticated `GET /health` probe on 2026-11-25 returned HTTP 404 from that Test public origin, while Production returned HTTP 200. This is a release-validation discrepancy, not proof of a security vulnerability: the Test frontend may intentionally not proxy that endpoint. Before any promotion, operators must verify the documented Test command and exact deployed SHA through the intended service path.

Historical material saying that the Test namespace was removed conflicts with the current infrastructure document. Treat the current infrastructure document and observed service state as the source to reconcile; do not treat a data-changing Test request as safe until isolation from Production is demonstrated.

## Validation record

- Code baseline: `9876c09888ec84034eec183cf1309c85df3d7447`
- `pnpm audit --prod --json`: 7 Moderate, 0 High, 0 Critical advisories
- Public probes: read-only `/health` requests only
- No local application test run was possible in this newly created audit worktree because dependencies were not installed. No skipped test is reported as a pass.
