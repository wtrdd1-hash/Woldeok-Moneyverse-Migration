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

## 작업 종료
- **아직 완료 아님.** 운영 반영과 실제 인증 사용자 화면은 검증 후 기록.
