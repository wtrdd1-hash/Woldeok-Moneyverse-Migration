# 릴리스 게이트 — 개발 A 10:25 검증 원문 주제 탐색

**보류 — main 병합, Test·Production 배포 없음.**

이번 변경은 읽기 전용 공개 원문 탐색으로 신규 마이그레이션·원장 쓰기가 없다. 실제 개발 PostgreSQL에서 함수 권한을 READ ONLY / ROLLBACK으로 확인했으나 운영 DB 최소 권한 인증은 아니다.

공식 Test 공개 버전 `bc8cd8a6c654af0336f550643f23049a58ee1d16`, Production API 버전 `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, Production Frontend는 불투명 빌드 ID `1793450413898`이다. 이번 후보가 배포됐다는 근거가 없으며 빌드 ID를 Git SHA로 간주하지 않는다.

정확 SHA CI, 격리 PostgreSQL, 인증 웹/API/Android E2E, 개인정보·접근성·SEO, 독립 백업 복원, 기존 P0 최소 권한 #993, GitOps 승인 및 롤백 자산이 모두 확인될 때까지 **운영 승격 금지**. 이번 회차 실제 운영 변경은 없으므로 실행 롤백도 없다. 향후 배포 시에는 검토된 전방 커밋으로 UI/API 허용목록을 되돌리고 기존 공개 원문 및 불변 SQL을 보존한다.

**후보 출처(10:42 KST):** 기능 SHA `2be277b59d893b9752ecac334f313fc09f13727d`, 브랜치 `auto/hourly-a-20261101-1025-blog-topic-discovery`, Draft/HOLD PR #2298, 기준 main `f13bbce273ffc65e8576170992d82ea00c27a1c9`. 기존 Frontend 실패 2건, 정확 SHA CI 진행 중. 종료 브랜치 71개·열린 PR 67개, 병합/삭제 0개. 공식 Test/Production 미배포. 후속 문서 SHA도 정확 SHA CI·Test 검증 없이 승격 금지.
