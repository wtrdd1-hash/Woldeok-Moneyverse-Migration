# v2026.09.19.271 — 전 페이지 프론트엔드 재설계 기준선

- 공통 theme 변경을 전체 재설계로 처리하지 않고 현재 70개 frontend page route를 직접 추적한다.
- 인간 제작/실제 출시 UI 1,000개 이상 레퍼런스 코퍼스 조건을 추가한다.
- 일반적인 AI 생성 UI 템플릿처럼 보이는 화면을 명시적 검수 실패 조건으로 추가한다.
- finance/member/community/gameplay/admin/utility 화면군을 분리해 서로 다른 화면에 동일 dashboard 구성을 반복하지 않는다.
- API/auth/ledger/accessibility/responsive 계약은 유지한다.
- contract build, typecheck, frontend 658 tests, lint, production build 통과.
- isolated Test visual/screenshot QA 전에는 완료 또는 운영승격으로 처리하지 않는다.
