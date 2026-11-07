# 개발 A QA — 2026-11-01 21:55 KST — 초안 / 배포 보류

- 범위: 최근 공개 공지 최대 20건의 본문 검색. 웹 `/announcements/body`, Nest 공개·Android API, Android 게이트웨이의 잘못된 검색 조건 및 미검증 HTTP 200 차단. 기존 SECURITY DEFINER 공개 조회만 사용하며 마이그레이션·원장 변경 없음.
- 기능 코드 SHA `f14c9b99b87a25b7cd73c0be338202267123565c`, 기준 main `3d5e321c3d1221febff677469fecdfcb3cf42e7d`, Draft PR #2380. 독립 작업 공간 및 증거: `/srv/moneyverse-data/tasks/mv-a-20261101-2125-announcement-body/`.
- TDD RED 재현 후 구현. 정확 코드 SHA Backend 전체 **2,974 통과 / 518 건너뜀**, Frontend 전체 **2,911 통과**, DB 단위 **62 통과 / 4 건너뜀**, Backend 대상 **4 통과**, Frontend 대상 **6 통과**, 타입 검사·양쪽 빌드·Android API 184개 계약·보안 10건 통과. Lint 오류 0, 경고 1,027. 건너뜀과 경고를 PASS로 취급하지 않음.
- 실제 개발 PostgreSQL: `moneyverse_app` 읽기 전용, 공개 조회 함수 실행 가능, 공개 공지 1건, 표본 검색 일치 0건, ROLLBACK. 실제 일치 데이터 양성 검증 미완료(단위 테스트는 통과). 개발 DB 직접 SELECT 권한 위반 P0 #993 잔존; 운영 DB 상태 미확인.
- 최종 CI runtime-check·이미지 빌드 진행 중. 공식 Test 정확 SHA 인증 E2E, 독립 백업 복원, 브라우저 접근성 종합 검증 및 GitOps 게이트는 BLOCKED/미확인.
- 종료 감사: 원격 브랜치 main 포함 142개(시작 139), 열린 PR 129개(시작 126), 충돌 28개, main에 포함되지 않은 원격 추적 브랜치 132개. 고유 변경 보호를 위해 삭제 0건. 병합·Test/Production 배포·DB 변경·재시작·롤백 없음.
- **main 병합 및 운영 배포 금지.** 미충족 게이트와 P0 해결 후 재검증 필요.
