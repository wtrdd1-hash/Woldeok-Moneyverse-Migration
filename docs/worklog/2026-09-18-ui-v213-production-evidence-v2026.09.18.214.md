# v213 Test and Production promotion worklog — v2026.09.18.214

v212 exposed the real Test-edge topology and a remaining AdSense iframe CSP issue. v213 fixed that issue, passed local/full QA, PR #467 and CI #1279, and was rebuilt from merged main SHA `24b85df1e0e5f922e461b1dcea82ec291bf54e48`.

Test Nginx was moved from v212 port 3114 to exact-main v213 port 3115 after direct smoke. Public Test responsive/CSP/browser checks passed and the Test backend PID/start time did not change.

Production exact-main v213 was built separately, started on canary 3202 against backend 3002, and passed direct smoke. Nginx atomically moved from the legacy 3201 frontend to 3202. Public browser checks passed 27/27. The persistent 3001 frontend service was then replaced with the same exact release while public traffic remained on canary, direct-smoked, and Nginx returned to 3001. Browser checks passed 27/27 again. The 3202 canary was stopped; legacy 3201 remains running only as rollback anchor. Production backend stayed unchanged throughout.
