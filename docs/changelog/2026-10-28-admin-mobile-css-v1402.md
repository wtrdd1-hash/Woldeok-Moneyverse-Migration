# v2026.10.28.1402 — Internal operations changelog

- [DONE] 2026-10-28 KST: separated and validated Test CSS candidate, then changed public Test route to persistent frontend (3389). Keep isolated Test API/backend at 3363; ensure noindex.
- [DONE] Switched production frontend Nginx 3354→3388 at 00:23:27 KST, preserving existing backend at 3343. The service uses stable release files and the same production API origin/internal-token configuration as the old frontend.
- [DONE] Verified five linked CSS files HTTP 200, 5 consecutive local regression tests, public prod/Test HTTP 200 routes, anonymous admin API 401, and no error-priority frontend journal entries at observation.
- [DONE] Both replacement frontends enabled for systemd restart and boot. Cleaned up only owned unused temporary services. Previous prod 3354 still running for rollback.
- [ROLLBACK] Use the tracked `ops/systemd/switch-nginx-server-ports.py` on the production `_` server block only with backend 3343 unchanged and frontend `3388 3354`; run `nginx -t` before reload. Do not replace the entire old Nginx file now that Test has advanced to 3389.
- [GAP] Session continuity with a signed-in test user, full authenticated administrator/mobile QA, exact Git SHA runtime provenance are not verified. This is a scoped emergency operational presentation repair, not a full-source application release.
