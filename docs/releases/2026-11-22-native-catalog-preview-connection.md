# Protected native catalog connection receipt — 2026-11-22

## Current service state

The public frontend remains in owner-approved emergency maintenance. This is not a Production frontend cutover or whole-site acceptance.

The protected administrator preview now uses the current-main Spring presentation artifact and the canonical read-only catalog runtime. The existing API, session and financial authorities remain unchanged.

- Application source: f0336fded6068f884c87f88efedeb770fd3387d4.
- Operational source: b2eb6c181bf90e865120ce4eb962135f015665e7.
- Approved application CI:44932169050, all four required jobs successful.
- Exact source-bound JAR SHA256:8a1c75c685ad31805a772ff9af6a94e6f7fd2e57f66809412ac2e900b1d6f38c.
- Installed scope:ADMIN_PREVIEW_ONLY. Frontend loopback4830; catalog read loopback4832.
- Browser acceptance:PENDING. Boot enablement:false.
- Administrator preview:[protected shop screen](https://easy-scraping.com/_mv/nov18-rebuild-qa/admin-shop).

Connection details, private environment files, cookies and database credentials are not included here.

## Measured host checks

Both units passed packaged-source/JAR, effective process, working-directory and PID proof after installation. Presentation health/version returned200 at the selected source. Canonical database-backed catalog health/version returned200, databaseRequired:true, readOnly:true, wholeSiteAccepted:false.

The original final boundary checks were run during installation and independently repeated afterward:

| Host-origin request | Result |
| --- | --- |
| / and /status | 503, real maintenance document |
| Protected admin shop HTML, JS and catalog without a session | 401 |
| Unknown protected route | 404 |
| POST to protected catalog | 405 |
| Existing stocks API | 200 JSON, original admission retained |
| Existing auth/me and admin/me without session | 401 JSON, original admission retained |
| Test virtual-host external-admission fixture | 403 |

Automated public HTTPS probes from the host returned edge403. That is not a successful public application or authenticated browser test. Local browser control is currently disabled in Work settings; no browser profile, session cookie or active database session was extracted to bypass this limitation.

## Defects found and corrected

1. Root-owned executable releases now use the dedicated native release root. Shared application directories and rollback releases were not recursively modified.
2. Deployment environment keys now follow Spring canonical binding. The real generated systemEnvironment regression reproduced the sealed Hikari pool failure, then passed after the key correction. Read-only settings were preserved.
3. Nginx reload acknowledgment preceded worker route adoption. The real host access log recorded old-worker404 for the new catalog immediately after reload. A bounded readiness probe now retries only unmarked404 and requires the exact marked401 before unchanged final checks.
4. Completed inverse legitimately restarted the original frontend with a different PID. An explicit verified prior-inverse handoff preserves the immutable original receipt and proves the restored process and file identities. Evidence snapshots are revalidated before forward mutations.

The failed generations were retained after complete inverses using non-overwriting moves. No protected manifest was relabelled to make a gate pass. Interrupted frontend restoration required an explicit second inverse; it completed without errors before retry.

## Verification and remaining work

- Spring test+bootJar:662 tests, zero failures/errors/skips. Separate24 PostgreSQL-tagged tests were excluded locally, not counted as passes.
- Operations:77 canary +7 QA +4 maintenance Python tests passed.
- Native UI/money:351 Node tests passed.
- Security/control-byte scans and diff checks passed.
- Fresh focused reviews found no actionable findings.
- Operational head CI44987327884 was still running at this receipt; its Spring and policy jobs were successful, runtime-check pending.

Authenticated real catalog rendering, visual desktop/mobile approval, full administrator functionality, complete180-route functional QA, and exact-source Test/Production promotion remain OPEN. The global emergency-maintenance frontdoor has not been removed.
