# A 2026-11-01 19:25 KST — 공개 공지 고정 게시물만 보기

영문 `2026-11-01-a1925-announcement-pinned.md`가 원본입니다. 기준 main `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`에서 분리한 브랜치만 사용합니다. 최근 공개 공지 20건에서 고정 공지만 조회하며 DB 신규 권한·금융 원장 변경 없이 기존 `SECURITY DEFINER` 공개 조회를 재사용합니다. 기존 미통합 PR 및 다른 작업은 보존합니다. 전체 필수 검증, 공식 Test 정확 SHA, 보안·복원·GitOps 증거가 없으면 배포 금지입니다. 검증 결과는 종료 단계에서 기록합니다.

중간 점검: 대상 Backend 3건, Frontend/Android 4건 PASS, 양쪽 타입검사 PASS. 개발 PostgreSQL 읽기 전용 조회 PASS(공지 1건, 고정 0건). 기존 앱 계정 직접 테이블 권한 P0 확인. 공식 Test 및 운영 승격 HOLD.

종료: 기능 코드 SHA c2f74533089bcfa6c589636e68007a3b28e6366e, Draft/HOLD PR #2362. Backend 전체 2,965 PASS/2 FAIL/518 SKIP(기존 프로필 인증), Frontend 전체 2,907 PASS. Backend·Frontend 빌드/타입검사 PASS, lint 오류 0/경고 1,022, DB 단위 62 PASS/4 SKIP, Android 계약 184개 PASS. 시작 비-main 124개/PR 114개 → 종료 125개/PR 115개, 충돌 PR 22개. 브랜치 삭제·병합·운영 배포 0건. Test/Production SHA가 후보와 달라 공식 인증 E2E 및 운영 승격 BLOCKED.
