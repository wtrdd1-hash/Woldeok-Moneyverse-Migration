# v2026.10.28.1402 — Administrator mobile CSS production promotion

## Before work — 2026-10-28 00:03 KST

- Request: promote the already-merged v1401 administrator mobile CSS recovery to the live site, following the project's zero-downtime release rules.
- Starting `origin/main`: `656a89947f2261c12de20d4612e88f251ba6c6a6` (includes PRs #1593, #1594).
- Documents checked: `AGENTS.md`, `docs/DOCUMENTATION_POLICY.ko.md`, `docs/RELEASING.ko.md`, current integrated master, responsive guidelines, and v1401 incident worklog. Production continues to route frontend traffic to port 3354; isolated replacement at 3384 is active; Test frontend remains 3364.
- The live HTML previously referenced absent `07n3_vyoxfswp.css` (HTTP 500), while isolated replacement served `1o54v_05nxpad.css` (HTTP 200) and 5/5 expected linked stylesheets.
- Hard gates: preserve production users and sessions, verify test backend and exact candidate, keep old service and rollback path, inspect CSS assets before cutover. No financial DB or authentication changes.

## In progress

- [x] Verify active frontend BUILD_ID parity and 5/5 HTML-linked CSS assets on each environment (Git source SHA provenance remains unverified).
- [x] Resolve missing Test CSS and switch public Test to persistent frontend 3389.
- [ ] Backend/frontend/anonymous authz/production candidate pass; signed-in session continuity and full UI/browser gates are NOT VERIFIED.
- [x] Re-fetch advanced `origin/main` and reconcile this documentation branch without touching others.
- [x] Per operator request, carry out scoped CSS-only emergency cutover, document remaining unverified gates explicitly, and retain rollback process.


### Checkpoint 1 — 2026-10-28 00:14 KST

- Created isolated Test frontend copy without production `.env.local` and started its replacement at 3387 using existing Test environment/credentials without printing them; frontend `BUILD_ID` matches disk and API targets isolated Test backend 3363.
- Performed a Test-only atomic Nginx upstream change (3364 → 3387), first verifying an unchanged Nginx configuration checksum, taking a rollback backup, and passing `nginx -t` before reload. Production frontend upstream stays 3354.
- **Public Test after cutover:** all 5 referenced CSS bundles 200 `text/css`; `/`, `/status`, `/admin`, `/admin/blog`, `/health`, `/robots.txt` HTTP 200, unauthorized administrator API request HTTP 401, Test `X-Robots-Tag` noindex/nofollow. Old Test process on 3364 references deleted files and is excluded from traffic.
- The isolated production candidate on 3384 serves the same 5 CSS files correctly; production 3354 still has the missing CSS 500. No Production cutover so far.
- The isolated Test is currently a transient systemd unit. Signed-in session continuity and exact Git SHA-to-build provenance have **not** been established; these are required before production acceptance.
- Concurrent `origin/main` advanced from `656a8994` to `004be593` (blog engine v254); task must not overwrite the new main or concurrently running services.

## Finished

### Outcome — operational CSS incident recovered in Production

- Public Test restored via two zero-downtime frontend transitions: 3364 → verified isolated 3387 → persistent 3389; existing test backend 3363 and noindex preserved.
- At **2026-10-28 00:23:27 KST**, Nginx frontend upstream for public Production atomically changed `3354 → 3388` after syntax checks and rollback configuration backup. Backends and data untouched. Public production/Test HTTP checks (home/status/admin/blog/health/robots) returned 200; unauthorized `/api/admin/seo/status` returned 401.
- Production now links to 5/5 available CSS assets (HTTP 200 `text/css`). Persistent frontend was restarted before cutover and passed 5 consecutive CSS preflights. New prod systemd service is enabled/active, as is persistent Test service. The three unused transient QA processes were stopped. The prior 3354 production frontend is deliberately active for quick rollback.
- Production and Test frontend BUILD_ID are both `1793093000629`, matching their runtime process environment and `.next/BUILD_ID`. No new `main` code build is asserted. This was the focused recovery of a broken SSR CSS/static asset deployment generation, not a full current-main application release.
- **Unverified/exception for emergency cutover:** Pre-existing signed-in session continuity was not directly verified; production/test configured internal token and API origin parity were checked and existing backends kept untouched, but this is not equivalent to a signed-in test. Full mobile browser, role-specific administrator flows and exact source Git SHA-to-build verification were not completed. Never mark those mandatory acceptance gates PASS.
- Host rollback evidence: Nginx config snapshots in protected tasks; for rollback change only the production server's frontend upstream 3388 → 3354 with the approved port-switch script and `nginx -t`, preserving Test 3389 mapping.
- See bilingual release and internal/public updates `docs/releases/v2026.10.28.1402*`, `docs/changelog/2026-10-28-admin-mobile-css-v1402*` and `docs/updates/2026-10-28-admin-mobile-css-v1402*`.
