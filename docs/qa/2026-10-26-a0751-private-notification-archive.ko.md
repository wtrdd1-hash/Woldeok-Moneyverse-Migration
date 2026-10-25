# QA A0751 — 본인 알림 보관 기록 (부분 구현 / 차단)

- 기준 main `1c5b84a1c45baafcca83f375a6f99698121e9bb5` 시작·중간·종료 동일. 브랜치 `auto/hourly-a-notification-archive-20261026-0751`. QA 기록 직전 구현 SHA `7fa8a9fe4b9f0b04c5f5fd9391c2e9330ae611b7`.
- 시작 원격 브랜치 237개, 열린 PR 233개. 보고 직전 238개/233개. 삭제 0건. 충돌 PR #1107/#1110/#1143 보존, 원격 최종 SHA 중복 0건. 모든 고유 커밋·트리·Patch-ID까지 증명하지 못해 기존 브랜치를 정리하지 않음.
- RED: 백엔드 3건 실패, 프론트 모듈 없음. GREEN: 백엔드 집중 3건, CSV 4건, Android 11건, 알림 화면 3건(프론트 묶음 18건) 통과.
- 앱 API 계약 180개 검증, Typecheck 통과, Lint 오류 0/경고 1128, Backend·Frontend Build 통과(처음에는 외부 node_modules 심볼릭 링크로 Turbopack 실패, 데이터 디스크 로컬 복사 후 해결).
- 계약 테스트 38 PASS, DB 패키지 15 PASS/3 SKIP, Backend 1316 PASS/398 SKIP, Frontend 1402 PASS/6 FAIL(SEO·다국어 3, 로그인 접근성 1, 계산기 가입 링크 1, 관리자 텔레메트리 1). 전체 테스트 FAIL.
- 운영 의존성 보안 High 2건 FAIL, 전체 Critical 2/High 10건 FAIL, Bot 8 PASS·보안 Critical 1/High 5건 FAIL.
- **실제 격리 PostgreSQL 차단:** 17.11 `wdmv_v761_test_acl` 적용 마이그레이션 281개, `public.in_app_notifications` 테이블 없음, `notification_%` 함수 0개. 읽기 전용 트랜잭션과 ROLLBACK 확인. 소유권·실제 회원 인증 E2E 통과 주장 불가.
- Debian 13.6 주요 서비스 ACTIVE. 루트 디스크 100%(가용 약 737MiB), 데이터 디스크 77%. 운영 DB 변경·서비스 재시작·브랜치 삭제 0건.
- 공식 Test 정확 SHA·회원 인증 E2E·백업 복원·GitOps 릴리스 게이트 미검증. **main 병합 및 Production 승격 금지**. 운영 롤백 대상 변경 없음. Draft/RELEASE HOLD.
