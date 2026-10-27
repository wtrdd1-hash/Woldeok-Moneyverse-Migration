# v2026.10.28.1402 — Administrator mobile CSS production promotion

## Before work — 2026-10-28 00:03 KST

- Request: promote the already-merged v1401 administrator mobile CSS recovery to the live site, following the project's zero-downtime release rules.
- Starting `origin/main`: `656a89947f2261c12de20d4612e88f251ba6c6a6` (includes PRs #1593, #1594).
- Documents checked: `AGENTS.md`, `docs/DOCUMENTATION_POLICY.ko.md`, `docs/RELEASING.ko.md`, current integrated master, responsive guidelines, and v1401 incident worklog. Production continues to route frontend traffic to port 3354; isolated replacement at 3384 is active; Test frontend remains 3364.
- The live HTML previously referenced absent `07n3_vyoxfswp.css` (HTTP 500), while isolated replacement served `1o54v_05nxpad.css` (HTTP 200) and 5/5 expected linked stylesheets.
- Hard gates: preserve production users and sessions, verify test backend and exact candidate, keep old service and rollback path, inspect CSS assets before cutover. No financial DB or authentication changes.

## In progress

- [ ] Verify exact current Test/Production runtime and CSS asset parity.
- [ ] Resolve Test frontend missing asset generation through approved release process.
- [ ] Validate isolated Test backend and frontend, auth/session continuity, production candidate, release checks.
- [ ] Re-fetch `origin/main` and reconcile concurrent changes.
- [ ] Carry out zero-downtime cutover only after required gates pass; verify production and rollback readiness.


### Checkpoint 1 — 2026-10-28 00:14 KST

- Created isolated Test frontend copy without production `.env.local` and started its replacement at 3387 using existing Test environment/credentials without printing them; frontend `BUILD_ID` matches disk and API targets isolated Test backend 3363.
- Performed a Test-only atomic Nginx upstream change (3364 → 3387), first verifying an unchanged Nginx configuration checksum, taking a rollback backup, and passing `nginx -t` before reload. Production frontend upstream stays 3354.
- **Public Test after cutover:** all 5 referenced CSS bundles 200 `text/css`; `/`, `/status`, `/admin`, `/admin/blog`, `/health`, `/robots.txt` HTTP 200, unauthorized administrator API request HTTP 401, Test `X-Robots-Tag` noindex/nofollow. Old Test process on 3364 references deleted files and is excluded from traffic.
- The isolated production candidate on 3384 serves the same 5 CSS files correctly; production 3354 still has the missing CSS 500. No Production cutover so far.
- The isolated Test is currently a transient systemd unit. Signed-in session continuity and exact Git SHA-to-build provenance have **not** been established; these are required before production acceptance.
- Concurrent `origin/main` advanced from `656a8994` to `004be593` (blog engine v254); task must not overwrite the new main or concurrently running services.

## Finished

Pending actual action results. Code merge is not production deployment proof.
