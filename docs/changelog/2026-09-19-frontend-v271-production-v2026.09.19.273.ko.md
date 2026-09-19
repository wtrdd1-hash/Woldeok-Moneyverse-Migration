# 프론트엔드 v271 운영 승격 — v2026.09.19.273

## 한국어

전 페이지 재설계 기준선 v2026.09.19.271을 병합 main SHA `2cc746cb1474377458d591bc991eb745fe6eb39f` 기준으로 exact-head 검증, isolated Test 확인, Production gate 성공 후 운영에 승격했습니다.

## 증거

- PR #549가 main에 병합되어 runtime SHA `2cc746cb1474377458d591bc991eb745fe6eb39f`가 됐습니다.
- 브랜치 exact-head Build Test Candidate run `35430452083` 성공.
- main Build Test Candidate run `35430740075` 성공: release 분류, policy, lint, typecheck, build, fresh DB migration, 전체 tests, Prisma mutation guard, dependency audit, immutable Test image 검증.
- public isolated Test host mirror를 `/srv/moneyverse-data/releases/test-2cc746cb1474-v271`로 전환했습니다.
- Test `/api/version` exact SHA, backend health, public catalog/DB path, noindex, 주요 UI 경로를 확인했습니다.
- Build Production Release run `35431039813`이 exact-SHA Test gate 후 성공하고 production-ready 신호를 발행했습니다.
- 운영 전 2026-09-19 14:55:49 KST의 암호화 DB/사진 백업 검증 성공본이 존재함을 확인했습니다.
- GitOps Auto Reconcile run `35431370208`이 exact SHA의 Test/Production manifest 및 public smoke 검증에 성공했습니다.
- Production host mirror를 `/srv/moneyverse-data/releases/prod-2cc746cb1474-v271`로 원자 전환했습니다.
- Test와 Production `/api/version` 모두 exact SHA `2cc746cb1474377458d591bc991eb745fe6eb39f`를 반환합니다.
- 운영 `/`, `/login`, `/stocks`, `/status`, `/work`, `/quests`, `/casino`, `/wallet`, `/shop/catalog`, `/progression`, `/terms`, `/privacy`, `/announcements`, `/robots.txt`, `/sitemap.xml` 모두 HTTP 200입니다.
- backend/frontend systemd 서비스 active, 새 frontend cache는 런타임 사용자 소유이며 v271 시작 후 EACCES 재발이 없습니다.
- 이전 v268 Test/Production immutable release는 rollback용으로 그대로 보존했습니다.

## 범위 주의

이번 승격은 v271의 페이지 단위 재설계 기준선과 레퍼런스/검수 계약을 운영에 반영한 것입니다. 70개 route 모두의 최종 수동 시각 디자인이 완료됐다는 의미는 아니며, route별 시각 보정은 v271 기획에 따라 계속 진행합니다.

## 롤백

필요 시 보존된 v268 immutable release로 Test/Production 코드 포인터와 release identity를 원자 복구할 수 있습니다. DB 이력은 되돌려 쓰지 않습니다.
