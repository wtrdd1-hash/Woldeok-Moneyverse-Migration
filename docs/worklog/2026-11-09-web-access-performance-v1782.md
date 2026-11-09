# v2026.11.09.1782 — Public Access Latency Audit and Initial Hydration Improvement
**Status:** SOURCE CANDIDATE / PUBLIC NETWORK LATENCY NOT FIXED. [한국어](2026-11-09-web-access-performance-v1782.ko.md)

## Start
- 2026-11-09 KST; base `origin/main` `8db59f535dc425a86b6fd96ce7068f2a3411210e`, independent branch `fix/web-first-load-v2026.11.09.1782`.
- Read project `AGENTS.md`, both authoritative plans, documentation policy, infrastructure/release instructions and prior v1781 operations evidence. Blog work is parallel and excluded.
- User complaint: actual first connection is slow, not missing disk space. Origin-vs-edge tests were performed; no user or monetary data altered.

## Measured diagnosis
- Loopback Nginx with Production Host header: homepage TTFB 19–31 ms; /ko 19–26 ms; public stock API 7–9 ms; health 2 ms. CPU low, no measurable host memory pressure.
- Public HTTPS Cloudflare: home TTFB approximately 1.0–2.7 seconds and full download up to 5.9 seconds, sometimes longer on /ko and redirected blog paths. HTTPS handshake measured ~0.49–1.47 seconds.
- Cloudflare trace for host's Korean egress: `loc=KR`, `colo=LAX`. This is the Cloudflare-facing route observed from the **host**, not proven to represent all Korean visitors.
- Public `/_next/static/chunks/...` content-hash JS is already `cf-cache-status: HIT`, `max-age=31536000, immutable`. Nginx gzip is on; Cloudflare supports compressed responses (~22 KiB Brotli homepage vs ~122 KiB uncompressed).
- Production root HTML is `private, no-store` and the root layout consumes signed-in viewer, locale, and cookie context. Broad edge HTML caching or bypassing Cloudflare would risk cross-user cache contamination or weaken security: **not performed**.
- `/blog/` redirects to `/blog` then `/tools`, incurring two extra hops and occasionally a transfer timeout. Blog route ownership is under parallel v1778 activity; **not modified** by this work.

## Source-level response
- Optional watchlist promotion and first-trade onboarding prompts are code-split behind a browser idle callback (2s deadline, 1200ms fallback); both already had delayed, discretionary UI. Browser avoids fetching/hydrating those chunks on the critical first-load path.
- Essential consent guard, session keep-alive and stock push engine remain eager; no security, financial workflow, notification or API behavior removed.
- Source changes: `frontend/src/app/layout.tsx`, `frontend/src/components/deferred-engagement-prompts.tsx` and its behavior tests.
- Candidate production layout JS chunk size: 202,477 bytes (v1777 baseline) → 193,569 bytes (v1782 build), **8,908 bytes smaller (4.4%)**. Total application JS chunk inventory need not shrink because two optional lazy modules are retained as separate chunks; this is *initial-layout bundle size*, not an observed end-user latency gain.

## Checks and release boundary
- Isolated Vitest targeted 9/9 PASS (4 new idle-mount tests + 5 font/performance budget tests); **full frontend suite 3,027/3,027 PASS, 576/576 files**.
- Frontend TypeScript `tsc --noEmit`: PASS.
- Final candidate Next.js production build `pnpm --dir frontend build`: PASS after cancellation guard adjustment (599 generated static routes).
- Main rechecked at midpoint: `8db59f535dc425a86b6fd96ce7068f2a3411210e` (unchanged).
- Official exact-source Test deployment, whole-project CI, authenticated browser E2E, new Production release, and actual Cloudflare POP remediation: **NOT YET VERIFIED**. No statement that public 1–3 second CDN latency is fixed.
- Do not claim full production optimization until independent Test/Production exact SHA and real external latency/LCP checks pass. If CI/official Test gates fail, preserve current Production.

## Follow-up
- Cloudflare account/ISP routing must be investigated for the Korean-to-LAX edge selection. User-facing access from different KR networks and browser Web Vitals (LCP/INP) are needed; do not replace measured user data with local host timings.
- Preserve login/no-store privacy, existing CDN immutable asset cache and finance core. No direct editing of production Nginx or bypass of CDN security.
