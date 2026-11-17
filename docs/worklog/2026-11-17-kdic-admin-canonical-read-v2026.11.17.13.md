# v2026.11.17.13 — Canonical KDIC admin safe-GET Production read recovery

## BEFORE (2026-11-17 ~09:24 KST)
Owner approved finishing incomplete features and Production promotion. Start by consulting living plan, integrated master, AGENTS, release gates; main refreshed.
Previous v2026.11.17.6 safely holds all unauthenticated/fake legacy Spring KDIC calls 503; v8 restores only public canonical KDIC portal, v9 restores authenticated engagement read.
Official Test canonical Nest routes /api/v1/admin/kdic/overview and /api/v1/admin/kdic/ledger-integrity returned 200 with isolated short-lived signed-in superadmin DB-backed session and 401 with a forged session, after Test schema migration 335 fix #3224. The Test session was deleted via Test DB migrator with residual 0. Production canonical Nest :4500 requires SessionGuard, ConsentGuard, AuthenticatedGuard, AdminGuard, AdminSessionGuard; unauthenticated these routes 401. No financial mutations or store-of-value POST approvals.
Scope: allow only exactly four KDIC admin GET/HEAD read aliases via canonical Nest backend in public Production and internal gateway :4400, preserving prefix 503 holds on all write paths. No code/JAR/db changes.
## MIDPOINT — 2026-11-17 09:25 KST
- Fetched current origin/main 381c749ba0ca86586107bbd99d647187dd40d553, reviewed concurrent OAuth/SEC1/engagement/KDIC branches.
- Verified Nginx old config SHA 2ff3ad42a87ef11162b106e14640e6945370e52034831272cffca3908e692c28 and preserved original at restricted /srv/moneyverse-data/reports/kdic-admin-read-v2026.11.17.13/nginx-before.conf.
- Deterministic renderer Python 4 tests PASS, no existing locations removed in diff. Four exact alias paths per server, GET/HEAD only; forwarded internal/client user-id headers stripped.
- Independent shadow Nginx 4493: four GETs 401 (real Nest guards), POSTs 405, payout/unrelated routes pass to unmodified shadow fallback 204. Normal Test site isolated and unchanged.

## FINISHED — 2026-11-17 ~09:26 KST
- Atomic candidate install after exact SHA compare; nginx -t PASS, two expected server scope markers, graceful systemctl reload; settled old workers 4 seconds.
- Real internal 4400, public localhost and public HTTPS: four KDIC admin GETs anonymous 401. Public KDIC payout/premiums POST and unverified WLD/engagement legacy paths 503. Public KDIC portal /api/kdic/portal 200, /api/version 200, signed-in engagement read anonymous 401, admin security and SEO anonymous 401, official Test version 200.
- New Nginx on-disk SHA256 6a89b4e4b73f58a09e2f9c224ca5708f7c32c9a82ebf2d711d18b57281eb9300; Nginx active. Rollback: only if current SHA unchanged, restore root-protected nginx-before.conf atomically, nginx -t, graceful reload and exact smoke.
- No Spring/Next service restart, financial DB/WLD/ledger mutation or change to unreviewed finance POSTs. Test positive superadmin reads and Test session zero residual were verified, but no real Production signed-in superadmin positive E2E was performed. Full Spring migration and financial settlement release gates remain HOLD.
