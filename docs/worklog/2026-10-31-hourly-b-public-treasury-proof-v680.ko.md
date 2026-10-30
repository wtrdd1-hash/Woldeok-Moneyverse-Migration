# Backend B v680 — 공개 국고 조회 원장 대사 증빙 검사

**상태: DRAFT / RELEASE HOLD.** 기준 main: `761a55a094fb9dd383d213e817305e68c79fa23c`.

공개 `GET /api/v1/treasury/public-overview`는 원장 대사 상태가 `UNVERIFIED`이거나 누락되어도 HTTP 200과 WLD 잔액을 반환했습니다. 또한 응답 생성 시각을 금융 증빙 시각처럼 표시할 수 있었습니다. PostgreSQL 접근 권한 오류도 HTTP 500으로 노출됐습니다.

수정 후 대사 상태 `RECONCILED`, 차액 0, 원장·금고·총액 일치, 유효한 미래가 아닌 검증 시각, 금고별 합계 일치를 모두 확인한 경우에만 공개 금액을 반환합니다. 그 외에는 HTTP 503 `PUBLIC_TREASURY_RECONCILIATION_PENDING` 및 `no-store`를 반환하며 WLD 금액은 제외합니다. 원시 SQL 오류는 테이블명을 노출하지 않는 503으로 처리하고 기존 명시적 503 오류는 유지합니다.

TDD에서 증빙 없는 200 반환 6건과 SQL 오류 500을 재현했습니다. 집중 HTTP 회귀 및 신규 PostgreSQL 17.11 격리 검증(마이그레이션 311개 적용)은 통과했습니다. DB 스키마, 권한, 금융 원장, 잔액, 프론트엔드 및 운영 서비스는 변경하지 않았습니다.

**이번 변경은 안전 차단이며 금융 증빙 기능의 완성이 아닙니다.** 실제 원장 인증 및 Next `/api/treasury/overview`의 Test/Production 아티팩트 일치(#1917/#1976)는 별도 미해결입니다. 전체 CI, 공식 Test exact-SHA 인증 E2E, 독립 복구 검증 전에는 main 병합과 Production 승격을 금지합니다.
