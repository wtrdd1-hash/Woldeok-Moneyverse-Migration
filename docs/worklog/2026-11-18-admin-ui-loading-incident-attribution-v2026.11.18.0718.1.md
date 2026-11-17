# v2026.11.18.0718.1 — P0 admin loading-screen incident: change and operator attribution

[Korean](2026-11-18-admin-ui-loading-incident-attribution-v2026.11.18.0718.1.ko.md) | Status: EVIDENCE DOCUMENTATION ONLY / INCIDENT OPEN / RELEASE HOLD.

## Before work — 2026-11-18 07:08 KST
- User screenshot: Chrome at https://easy-scraping.com/admin/ displays only “페이지를 불러오는 중입니다...” with no administrative UI.
- Read repository operating instructions, integrated planning master (English/Korean), development-status reference, front-end anti-clash spec and Spring migration detailed review. These explicitly retain Next.js/React as the presentation layer while moving backend duties to Spring; no blanket retirement of Next.js presentation is authorized by those drafts.
- MiniPC native MCP accessed Debian 13 host. Nginx, Docker and Spring Java listener are up; old named Next.js units are down; DEV DB connectivity exists. These observations do not establish that every production API or ledger is healthy.
- Work separated from simultaneous agents and existing recovery branch fix/p0-admin-ui-recovery-v2026.11.18.1. No application, DB, production or Nginx modification authorized for this attribution scope.

## In-progress evidence — 2026-11-18 07:08–07:18 KST
### Reproduction and exact broken component
- Public HTTPS /admin/ returned HTTP 200, 475-byte placeholder HTML without Next.js script references. Public root / had the same placeholder. Nginx admin access entries after 07:07 show 200 (380 logged body bytes); a 200 alone must not count as a working UI.
- Direct GET against localhost Spring :4550 on /admin/ and /_next/static/ reproduced the placeholder, not a JS application or a valid 404.
- Spring runtime JAR contained BOOT-INF/classes/static/index.html with that exact Korean placeholder, but no corresponding BOOT-INF/classes/static/admin or _next route assets. Spring boot log confirmed WelcomePageHandlerMapping to static/index.html at 03:15 and 03:36.
- A complete separately built Next.js admin file exists at /srv/moneyverse-data/frontend-static/admin/index.html (~214 KiB) with references to /_next/static assets, last generated around 03:13:48.
- Active Nginx prod_frontend upstream points to 127.0.0.1:4550, the Spring backend, rather than the prior Next.js presentation upstream at :4501. Main location / proxies to prod_frontend. Thus the functioning presentation artifact was not the artifact delivered to web users.

### Forensic chronology — KST; evidence source systemd journal sudo, process and file metadata
| KST | Recorded activity | Interpretation |
| --- | --- | --- |
| 2026-11-17 22:28:57 | Git commit 3715775c53 introduces the exact loading placeholder into Spring static/index.html; Git author wtrdd1-hash | Source change evidence, NOT production execution identity |
| 2026-11-18 02:41:15 | OS principal debian copies Spring JAR from mv-b-v1108-20261117-1130 worktree and restarts moneyverse-spring-backend | Earlier backend replacement |
| 02:42:42 | Nginx pre-patch backup 63,522 bytes / 1,477 lines | Earlier configuration baseline |
| 02:44:05–02:44:27 | debian SSH session from internal gateway copies /tmp/moneyverse_patched.conf into Nginx enabled site, validates and reloads | Large configuration replacement; later observed config 7,207 bytes / 195 lines |
| 03:11:18 | debian SSH session 3093 stops and disables moneyverse-frontend, v2208 recovery frontend and test-main-frontend; also pkill dist/index.js | Presentation services retired |
| 03:12:09 | Admin-log Next.js canary stopped/disabled | Removes another test presentation |
| 03:13:48 | Next.js static admin artifacts written in frontend-static | Working files available on disk but not delivered |
| 03:14:51 | Backend JAR copied from mv-b-v1108 worktree and Spring restarted; Spring starts :4550 at 03:15 | Placeholder-serving backend online |
| 03:20:34–03:21:01 | debian SSH session 3116 switches prod_frontend from :4501 to :4550 and reloads Nginx | Primary public routing cutover causing displayed placeholder |
| 03:21:01 | v1546 immutable frontend stopped and disabled | Eliminates presentation fallback |
| 03:36:05–03:36:19 | From separate b-v1118-migrator-guard worktree, further Spring restart, SEO upstream moved to :4550; Next/SEO service mask and unit relocation | Later changes reinforce backend-only routing |
| 07:07–07:09 | Repeated HTTP 200 /admin/ with placeholder; /admin/seo 503 with 404 in auth subrequest | Live impact observed |

### Technical root cause and breadth
- Confirmed root cause for screenshot: production Nginx frontend routing switched to Spring Boot while Next.js UI processes were stopped; Spring shipped only a non-interactive index.html placeholder and not actual UI files/scripts.
- A separate earlier Nginx configuration overwrite at 02:44 shrank the site configuration from 1,477 to 195 lines. Other auth, SEO, finance and edge rules may be affected; no full regression matrix has been performed. Do not blindly restore the old config without security and current route review.
- Existing Spring migration planning requires preserving Next.js/React presentation, exact-source QA, session/CSRF/MFA safety and reversible test-backed cutover. Observed change contradicted that gate; test environment :3101 was refusing connections during later checks. No authenticated browser, Android, financial write or ledger reconciliation tests were run in this investigation.
- 03:36 Java shutdown log shows an additional NoClassDefFoundError in Logback; unrelated to the reproduced placeholder, not established as the UI root cause.

### Attribution: principal vs actor
- **Verified OS execution principal:** Linux account debian, audit login UID 1000, multiple password-authenticated SSH sessions originating from internal gateway 192.168.100.1. Session 3073 corresponds to 02:44 Nginx copy; 3093 to 03:11 service stops; 3116 to 03:21 Nginx reload/retirement.
- **Verified Git commit author identity:** wtrdd1-hash in commit 3715775c53, source placeholder creation. See https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/commit/3715775c53184d5bc2f5e5507141a10f92b8ab6f.
- **Worktree artifacts involved:** Spring JAR taken from tasks/mv-b-v1108-20261117-1130; later commands ran in agent-worktrees/b-v1118-migrator-guard-20261117. These are artifact and working-directory evidence, not conclusive human or AI-agent identity.
- **Explicit exculpatory scope:** the pre-existing B v1108 logs/end.md states “verification-only”, “No ... deployment”, and “Production HOLD”. Its artifact being reused later does not establish that the original B v1108 agent ordered or ran the cutover.
- The available miniPC MCP audit history did not associate these damaging direct-SSH operations with a uniquely identified GPT, Gemini, Codex or person. The internal gateway is shared. Therefore **actual individual or AI actor remains UNKNOWN**. Avoid unjustified blame or equating the Git author to the operational deployer.

## Finished attribution checkpoint — 2026-11-18 07:18 KST
- Classification: reproducible P0 frontend delivery incident; root cause of displayed fallback confirmed at reverse proxy + deployment resource boundary. Operational changes documented with precise timestamps and user/session IDs; human/AI operator unconfirmed.
- This is documentation only. No application code edits; no database, WLD, balances, systemd, Nginx reload, Test promotion, Git main merge or production changes. Existing repair task is independently owned.
- P0 follow-up gates for recovery owner: restore functioning Next.js presentation route while preserving Spring API ownership and security route policy; validate real HTML/JS/CSS, authenticated admin session and OTP/CSRF permissions, SEO redirects, mobile responsive UI, test exact SHA, representative API and ledger read contracts, rollback; do not declare success on HTTP 200 alone.
- Source-of-truth conflict: checked origin/main e96e8f81f4d6b99b221392a2b6fe46356361b145 (unchanged start/mid); a separate local main checkout was ahead by 11 commits. Worklog branch was based on exact origin/main, not those uncommitted concurrent worktrees.
