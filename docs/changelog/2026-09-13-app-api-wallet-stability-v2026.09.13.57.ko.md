# v2026.09.13.57 — 앱 API 회원가입/지갑 안정성

- 자체 회원가입 완료 직후 USER_CASH/USER_BANK 지갑이 실제 조회 가능한지 PostgreSQL 통합 테스트에 포함.
- 지갑 금액 필드가 JSON number가 아닌 decimal string 계약임을 상세 명세에 고정.
- 신규 계정의 빈 recentTransactions 배열을 정상 상태로 명시.
- API 일부 실패가 앱 프로세스 종료로 전파되지 않도록 모바일 오류 격리 규칙 추가.
- v56의 앱 초기 read burst 완화와 함께 앱 API를 출시 최우선으로 검증.
