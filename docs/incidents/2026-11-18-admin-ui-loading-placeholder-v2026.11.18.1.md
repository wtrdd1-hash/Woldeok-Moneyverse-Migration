# INC-2026-11-18-P0 — Admin UI replaced by permanent loading placeholder

**Observed:** 2026-11-18 07:07 KST. **Severity:** P0 user-facing admin route. **Status:** Partial mitigated in Production at edge, full auth/site follow-up outstanding.

### Evidence and causal chain
1. Android Chrome screenshot displayed only `페이지를 불러오는 중입니다...` under `easy-scraping.com/admin/`.
2. Reproduced same 475-byte placeholder with HTTP 200 for `/admin/`, `/login` and `/`; Spring health and PostgreSQL were up. HTTP status alone hid the impact.
3. Nginx `prod_frontend` and `prod_spring` both pointed to Spring Boot port 4550. No Next.js live listener on previous ports. Frontend build and static assets were present on disk.
4. More recent standalone Next artifact had a stale `next` symlink; after bypass, it returned HTTP 500 on main routes. Last-known release bundle ran successfully with pinned bundled modules and private environment.
5. Standalone Next directly served an unauthorized admin data endpoint 200 and admin SSR identifiers, so naively setting `prod_frontend` to Next would create a critical data disclosure; all public admin views require an independent Spring session-role gate and APIs stay with Spring.

### Repair performed
A new persistent loopback-only Next runtime at 4524; Nginx admin-session gate and narrow UI routes; recent static fallback with old SEO legacy fallback preserved; no restart of Spring, DB or asset regeneration. Original site and SEO configs backed up. Isolated 8/8 tests and Production anonymous/API/asset smoke passed; browser signed-in verification NOT done.

### Unresolved risks and prevention
1. OAuth provider start and callback contracts still unavailable on deployed backend and Google OAuth in checked Spring source is a placeholder. Do not claim login repaired.
2. General frontend upstream remains Spring; homepage/member pages still render placeholder. Parallel Spring web work is active, so coordinate and verify exact artifact before broad cutover.
3. Reestablish tested UI/API upstream separation, enforce role-aware edge authorization, remove brittle pnpm symlinks from release artifacts, and require actual content/JS/CSS and signed-in E2E checks rather than HTTP200-only probes.
4. Make release validation fail when `/admin` is only a fallback page, when a browser asset 404s or when an unauthorized Next route can disclose admin records. Keep independent rollback and immutable build provenance.

Related PR #3252 and detailed [worklog](../worklog/2026-11-18-p0-admin-ui-recovery-v2026.11.18.1.md).
