# QA — 공개 게시판 종목 토론 유형 검색 (2026-11-01)

**판정: 기능 후보 구현 / 전체 게이트 FAIL / 운영 HOLD.** 코드 SHA `e7c18f62`, PR #2280 초안.

대상 테스트 백엔드 22·프론트/Android 28 PASS. 프론트 전체 2905 PASS. 백엔드 전체 2955 PASS·2 FAIL·517 SKIP; 실패 2건은 기존 main에서도 재현된 프로필 인증 HTTP 오류이며 수리 PR #2265가 별도 담당. DB 단위 62 PASS/4 SKIP, 보안 정책 11 PASS, Android 계약 184 엔드포인트 PASS. 타입검사/빌드 PASS, Lint 오류 0·경고 1022.

개발 PostgreSQL 앱 역할로 공개 함수 읽기 1건, 분석 필터 0건, ROLLBACK. 양성 데이터·공식 Test 정확 SHA 인증 E2E는 미검증. 개발 DB 직접 SELECT/DELETE/UPDATE 권한 P0 위반. Test·Production 버전은 후보와 다름. 운영 변경·병합·브랜치 삭제 없음. 상세 영문 QA 및 worklog 참조.
