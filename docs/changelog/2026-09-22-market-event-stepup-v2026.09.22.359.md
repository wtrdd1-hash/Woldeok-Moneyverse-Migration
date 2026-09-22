# v2026.09.22.359 — Market-event step-up authentication

## English canonical
- Require recent reauthentication when an administrator publishes or cancels a stock-market event.
- Preserve the existing admin session, CSRF, bounded event payload, database operator checks, and market-event API contract.
- Add controller guard regression coverage for both market-moving mutations.

## 한국어
- 관리자가 주식시장 이벤트를 게시하거나 취소할 때 최근 재인증을 요구합니다.
- 기존 관리자 세션, CSRF, 제한된 이벤트 payload, DB operator 검사 및 시장 이벤트 API 계약은 유지합니다.
- 두 시장 영향 mutation에 대한 controller guard 회귀 테스트를 추가했습니다.
