# v2026.11.17.14 — 관리자 SEO 화면 긴급 경로 복구
GitHub 이슈: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3236

## 작업 전 — 2026-11-17 13:01 KST
- AGENTS.md, 통합 기획·프로젝트 마스터, 배포 절차, Spring 전환 및 검증 스킬 확인.
- 시작 main SHA dcc47a0b550492502b73421a45c681b9c482aa87. 타 작업자 파일과 main 미변경, 전용 작업 브랜치 분리.
- SEO 전용 Nginx upstream이 정상 Next 프런트엔드(4521)가 아닌 Spring API(4550)를 가리킴. 4550은 사용자 스크린샷과 똑같은 기본 문구를 반환. 4521에는 관리자 SEO UI 존재.
- 익명 SEO 관리자 엣지 401; 인증 우회 금지. /admin/stocks 및 /admin/settings의 404는 별도 이슈. Spring /health 200.

## 진행 중
- [ ] GitHub 변경 코드와 안전한 백업·복구 절차 기록.
- [ ] 분리된 테스트 Nginx에서 화면 및 인증 부정 테스트.
- [ ] main 중간 재확인, PR/검증/병합.
- [ ] 확인된 경우에만 Nginx 무중단 reload.
- [ ] 운영 검증 및 최종 기록.

## 작업 종료 — 2026-11-17 13:08 KST (SEO 업스트림 범위)
- PR #3237 main 병합 b8e6b6c5852db9484d0170a481a4c4bd0278a2b5, 정책 CI 통과.
- SEO Next 연결 :4550 → :4521 수정, Nginx 문법 검사 및 무중단 reload 통과, Spring/Next 기존 PID 유지.
- 롤백: /srv/moneyverse-data/ops-backups/p0-admin-seo-v2026.11.17.14/moneyverse.nginx.before.
- 공개 /, /admin, /health 200, SEO 화면 익명 401/no-store/noindex, HTTPS 401, Next 후보 SEO 화면 200, CSS 200; 잘못된 Spring 임시 문구 경로 복구.
- 남은 P0 RSC 탐색 503은 #3238/v2026.11.17.15에서 별도 처리. 로그인 사용자 긍정 E2E는 미검증.


### 중간 점검 — 2026-11-17 13:05 KST
- 전용 브랜치에서 Nginx 한 부분만 변경하는 복구 스크립트·분리 테스트 설정 작성; 운영 미변경.
- bash 문법 및 사전 검사 성공. 테스트 Nginx 문법 성공, /health 200, 관리자 SEO 두 경로 익명 401, 직접 렌더 테스트 200, 정적 CSS 운영 엣지 200.
- 기존 SEO 인증 서브요청 307 흔적 발견. 로그인 사용자 긍정 E2E는 미확인으로 남김.
- main dcc47a0b550492502b73421a45c681b9c482aa87 재확인. 후보 UI SHA 20daef3f6f254f6a0e5b085756a08d4d0d874c9c.
