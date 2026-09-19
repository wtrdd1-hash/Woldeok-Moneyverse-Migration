# v2026.09.19.272 — Frontend v271 Production promotion evidence

- Application source SHA: `2cc746cb1474377458d591bc991eb745fe6eb39f`
- Source PR: #549 (`feat(frontend): start full-page rebuild v2026.09.19.271`)
- PR exact-head CI #1414: PASS
- Main CI #1415: PASS
- Build Test Candidate #1119: PASS
- Build Production Release #1128: PASS
- Isolated Test gate: PASS, including exact application SHA, backend/database catalog path and `X-Robots-Tag: noindex`.
- Public Test `/api/version`: `2cc746cb1474377458d591bc991eb745fe6eb39f`
- Public Production `/api/version`: `2cc746cb1474377458d591bc991eb745fe6eb39f`
- Host Test release: `/srv/moneyverse-data/releases/test-2cc746cb1474-v271`
- Host Production release: `/srv/moneyverse-data/releases/prod-2cc746cb1474-v271`
- Test/Production backend and frontend systemd services: active.
- Public smoke routes `/`, `/login`, `/work`, `/quests`, `/casino`, `/wallet`, `/shop/catalog`, `/progression`, `/terms`, `/privacy`, `/status`, `/announcements`, `/robots.txt`, `/sitemap.xml`: HTTP 200 in both environments.
- Public catalog: 146 items in Test and Production.
- Test noindex header: PASS.
- Nginx configuration test: PASS.
- Current v271 frontend runtime cache ownership: `debian:debian`; no new EACCES, permission-denied, unhandled, fatal or panic logs after the v271 service starts, including repeated `/stocks` requests.
- No failed systemd units observed during the post-promotion smoke check.

This evidence confirms the v271 baseline release was promoted to Production. It does not claim the larger page-by-page hand-tuned visual redesign program is finished; that work continues under the v271 planning contract.
