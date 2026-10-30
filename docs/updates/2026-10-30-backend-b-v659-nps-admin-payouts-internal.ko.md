# 개발 B v659 — 관리자 국민연금 지급내역 읽기 권한 개선

- 상태: 부분 구현 / 릴리스 보류. 시작 main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`.
- 결함: 관리자 지급내역 조회 API가 `national_pension_payout_logs`를 직접 SELECT하여, 마이그레이션 309의 권한 철회 이후 앱 계정에서 42501 오류가 발생할 구조.
- 수정: 신규 전진형 마이그레이션 310으로 관리자 계정의 활성 상태와 역할을 DB 내부에서 확인하는 `SECURITY DEFINER` 읽기 함수 추가. 기존 관리자 세션의 ID를 Controller → Service → Repository → SQL로 전달. 최대 100건, 기본 20건, 응답 구조 유지.
- 검증: TDD RED 2건, GREEN 집중 34건, 격리 PostgreSQL 17.11 권한/타인·비활성/정밀도/정렬/불변성 PASS. Lint·Typecheck·Build·계약 검증 통과. 전체 Backend 119건 실패 및 Frontend 전체 53건 실패 및 공식 Test 차단.
- 의존 PR: #1987 → #1992 → #1998 → v659. 선행 PR이 미병합 상태이므로 독립 병합 금지.
- 공유 DB, 원장, WLD, Test, Production, 다른 작업자 작업환경 및 기존 예약 변경 없음.
