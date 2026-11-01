# A 22:25 공개 공지 원본 검증 QA — 초안 / 운영 보류

- 기준 main `3d5e321c3d1221febff677469fecdfcb3cf42e7d`, 기능 SHA `982b1b28068acf32f5b9ee9c5c4dcc102ac22562`, Draft PR #2385. 적용된 마이그레이션 수정 없음.
- RED Backend 4 FAIL/2 PASS, Frontend 6 FAIL → GREEN Backend 6 PASS, Frontend 18 PASS.
- 전체 Backend 2,976 PASS/518 SKIP, Frontend 2,922 PASS, DB 62 PASS/4 SKIP. 타입·빌드 PASS(602쪽), lint 오류 0/경고 1,027. Android API 계약 184 PASS, SEO·접근성 22 PASS, 보안 14 PASS.
- 운영 의존성 알려진 취약점 0건. 전체 의존성 취약점 9건 FAIL(중간 8/낮음 1). 전체 경로 QA ledger 증거 부재 FAIL.
- 실제 개발 PostgreSQL app 역할 읽기 전용 조회 PASS, 공개 공지 1건, ROLLBACK. 개발 DB 직접 announcements SELECT·account_balances UPDATE·user_items DELETE 권한 P0 FAIL. 운영 DB에 동일 권한이 있다고 단정하지 않음.
- 공식 Test SHA `e39af10f...`, Production SHA `353c6d5d...`로 후보와 다름. 공식 Test 정확 SHA 인증 E2E·독립 외부 복원·GitOps 승인 BLOCKED.
- 원격 브랜치 144→145개, 열린 PR 131→132개, 비-main 고유 135개, 선조/동일 10개, 충돌 PR 28개. 삭제 0건, 미통합 작업 보호. 병합·배포 0건.
- 최종 SHA CI 재확인 전까지 **운영 보류**. 증거는 미니PC 격리 작업 디렉터리에 저장.
