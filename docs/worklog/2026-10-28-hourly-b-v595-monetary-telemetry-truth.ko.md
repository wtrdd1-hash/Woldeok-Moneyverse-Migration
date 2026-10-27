# 개발 B v595 — P1 중앙은행 통화 텔레메트리 증빙 무결성 (DRAFT / HOLD)

- 시작 main: 004be59307e389a4f293a0a0e71ee4144982936d. 독립 작업 브랜치 사용.
- 결함: DB 집계 조회 실패를 0건으로, 발행 동결 상태 조회 누락을 false로 보정하고, 미측정 은행 유동성·잠금액을 0으로, 실제 대사 없는 시간을 현재 시각으로 표시. 관리자 화면도 조회 실패 시 고정 WLD 3종과 '불변식 검증 일치'를 표시.
- 수정: 불완전한 조회는 HTTP 503, 실제 조회된 0만 정상 0으로 반환. 미측정 금액 및 대사 시각은 null. 관리자 화면은 조회 불가·미검증을 표시하고 텔레메트리 없을 때 발행 동결 버튼을 비활성화. 실패한 새로고침의 오래된 값 제거.
- API: GET /api/v1/admin/economy/monetary/telemetry, 인증·인가 유지. WLD 정밀도 문자열 유지. m_bank_liquidity/m_locked/last_reconciled_at은 nullable. DB 마이그레이션 및 원장/잔액 변경 없음.
- TDD: Backend RED 4건, Frontend RED 3건. Backend 단위 5건, HTTP 3건, Frontend 3건 PASS. 격리 PostgreSQL 17.11 합성 스키마 3건 PASS(읽기 전용, 42501, 조회권한 거부 503). 실제 운영 스키마와 공식 Test 인증 E2E는 별도.
- 기존 main 블로그 ESLint 2건(#1600), 전체 보안 감사 및 공식 Test exact-SHA/승인 GitOps 미통과 시 병합·Production 금지. 개발 A/C/Gemini/QA 브랜치와 예약 보호.
