# Backend B v617 — 국부펀드 수동 청산 금융 원장 안전 차단

- 기준 main: `35971c600f25869c96f1c666d4b9f58927202730`.
- 관리자 `POST /api/v1/admin/treasury/swf/liquidate`의 기존 내부 서비스가 정식 복식원장/멱등 영수증 없이 포트폴리오 평가액과 국고 금고 잔액을 직접 변경하던 경로를 소스 코드에서 제거했습니다.
- 수동 청산 호출은 실행 플래그와 관계없이 DB 연결 이전 HTTP 503 및 `SWF_LEDGER_SETTLEMENT_UNAVAILABLE`을 반환합니다. 읽기 전용 SWF 조회는 유지합니다.
- 이전 미병합·종료 Draft #1265의 안전 조치를 현재 main에서 복구하고, 실제 HTTP 503 테스트를 추가했습니다. 기존 브랜치는 삭제하지 않았습니다.
- RED 4건 → GREEN 5건. Backend 1,944 PASS/440 SKIPPED, Database 46 PASS/4 SKIPPED, OpenAPI 9 PASS, 보안 정책 23 PASS, API 계약 180개, Typecheck/Backend Build PASS, Lint 오류 0건(경고 1,099건).
- `qs@6.16.0` Moderate 취약점으로 의존성 감사 FAIL. 서버 디스크 98%, 공식 Test exact-SHA/인증 E2E/전체 프론트 빌드/운영 스키마 PostgreSQL 검증 미완료.
- 이번 수정은 국부펀드 수동 청산 기능의 정상 구현이 아니라 위험 경로 안전 차단입니다. 자동 복리 운용 및 프론트엔드 이용 불가 표시까지 완료됐다고 주장하지 않습니다.
- main 병합, Test/Production 배포, 금융 DB 수정, 기존 예약 중지·삭제 및 다른 개발자 작업 변경 없음. 전체 릴리스 게이트 BLOCKED.
