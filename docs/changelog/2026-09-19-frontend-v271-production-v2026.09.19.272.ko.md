# v2026.09.19.272 — 프론트엔드 v271 운영 승격 증거

- 애플리케이션 SHA: `2cc746cb1474377458d591bc991eb745fe6eb39f`
- 원본 PR: #549 (`feat(frontend): start full-page rebuild v2026.09.19.271`)
- PR exact-head CI #1414 PASS
- main CI #1415 PASS
- Build Test Candidate #1119 PASS
- Build Production Release #1128 PASS
- isolated Test gate PASS: exact SHA, backend/database catalog 경로, `X-Robots-Tag: noindex` 확인.
- 공개 Test `/api/version`: `2cc746cb1474377458d591bc991eb745fe6eb39f`
- 공개 Production `/api/version`: `2cc746cb1474377458d591bc991eb745fe6eb39f`
- Test 릴리스: `/srv/moneyverse-data/releases/test-2cc746cb1474-v271`
- Production 릴리스: `/srv/moneyverse-data/releases/prod-2cc746cb1474-v271`
- Test/Production backend/frontend systemd 서비스 모두 active.
- `/`, `/login`, `/work`, `/quests`, `/casino`, `/wallet`, `/shop/catalog`, `/progression`, `/terms`, `/privacy`, `/status`, `/announcements`, `/robots.txt`, `/sitemap.xml`가 Test/Production 모두 HTTP 200.
- 공개 catalog Test/Production 각각 146개.
- Test noindex header PASS.
- Nginx 설정 검사 PASS.
- 현재 v271 frontend cache는 `debian:debian`; v271 서비스 시작 이후 반복 `/stocks` 요청을 포함해 새 EACCES/permission-denied/Unhandled/FATAL/panic 로그 없음.
- 사후 점검 시 failed systemd unit 없음.

이 문서는 v271 기준선의 운영 승격 완료를 증명한다. 70개 페이지의 최종 수동 디자인 작업 전체가 끝났다는 의미는 아니며, 해당 작업은 v271 기획 계약에 따라 계속 진행한다.
