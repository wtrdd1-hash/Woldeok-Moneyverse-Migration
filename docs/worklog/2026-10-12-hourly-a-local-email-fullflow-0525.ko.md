# 개발 A — 이메일 계정 인증 수단 전체 흐름 수정 (2026-10-12 05:25 KST)

상태: **후보 / 미병합 / 미배포**. 모든 필수 exact-SHA CI 및 격리 Test 통과 전 운영 승격 금지.

- 시작 main: `35245119f2edb575f5f0e9d2769e80954df3ab91`; 최초 비-main 브랜치 130개, 열린 PR #801/#802.
- 작업 브랜치: `auto/hourly-a-local-email-read-fix-20261012-0525`. 04:25 회차 테스트 전용 브랜치는 복구 근거로 보존.
- 사용자 문제: DB에서 조회한 local_email 인증 수단을 OAuth 전용 검증기가 거부해 계정 인증 수단 API 오류가 발생할 수 있음. OAuth 연결 선택지에도 이메일 로그인 수단이 포함될 수 있음.
- 백엔드: 조회 전용 응답에서 local_email 허용, OAuth 연결·변경 입력은 기존 discord/google 제한 유지.
- 프론트엔드: 활성화된 discord/google만 OAuth 계정 연결 선택지로 표시. 이메일 로그인 표시는 유지.
- 테스트: 이전 회차 백엔드 회귀 테스트를 재사용하고 프론트엔드 연결 선택지 회귀 테스트 추가.
- DB 마이그레이션·경제 원장·권한 경계·운영 비밀정보 변경 없음.
- 기존 후보 CI #38168002262는 PostgreSQL 마이그레이션 266이 없는 woldeok_moneyverse_dev를 참조해 실패. 적용된 마이그레이션은 변경하지 않음.
- 브랜치 정리: 130개 전체의 최신 고유 변경/CI/충돌 전수 판정은 GitHub 호출 한도로 미완료. 브랜치 삭제 0개, PR #801/#802 보존.
- 필수 게이트: build/lint/typecheck/unit/integration/실 PostgreSQL/security/accessibility/SEO/app-api/E2E/exact-SHA 격리 Test/Production smoke **아직 PASS 아님**.
- 병합·배포·롤백: 없음. 다음 조치: HEAD CI 확인, 비파괴적 CI DB 환경 장애 복구, 전체 게이트·격리 Test 검증 후 통합 판단.
