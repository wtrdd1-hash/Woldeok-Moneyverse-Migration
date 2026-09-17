# v2026.09.18.201 — 모바일 반응형 UI QA 및 가로 넘침 방지 강화

- 날짜: 2026-09-18
- 브랜치: `fix/ui-responsive-qa-v2026.09.18.201`
- 범위: 프론트엔드 UI만 변경; DB migration 및 backend/API contract 변경 없음

## 변경 사항

- 우측 모바일 메뉴를 고정 320px 대신 viewport 안에 들어오는 폭으로 변경했습니다.
- 모바일 하단 5개 탭을 동일 폭 grid로 바꾸고 라벨이 줄어들 수 있게 하면서 최소 44px 터치 높이를 유지했습니다.
- 은행 카드 헤더, 입출금 선택, 상환 액션, 대출 요약을 좁은 화면에서 세로 배치 또는 wrap하도록 수정했습니다.
- 은행 요약 카드는 480px 미만에서 1열로 전환하고 하단 액션은 wrap하도록 했습니다.
- 인벤토리 quick-slot 고정 최소 폭을 제거하고 active-cosmetics 프로필 행이 안전하게 줄어들도록 했습니다.
- 위 모바일 overflow 계약을 고정하는 회귀 테스트를 추가했습니다.

## Test 승격 전 검증

- `pnpm lint`: 오류 0건, 기존 `next/no-img-element` 경고 11건.
- `pnpm typecheck`: contract, database, backend, frontend workspace 모두 통과.
- Frontend 테스트: 70개 파일 / 619개 테스트 통과.
- Frontend Production build: 통과.
- Headless Chromium: 320/360/390px × 공개 경로 7개 = 21/21 HTTP 200, document-level 가로 overflow 0건.
- Gallery의 기존 Google 광고 품질 `sodar2.js` CSP 거부는 별도 이슈로 유지하며 이번 변경에서 CSP를 넓히지 않습니다.

## 릴리스 게이트

Production 전 exact-SHA Test backend/API/frontend smoke를 통과해야 합니다. Production 승격은 이전 release를 rollback anchor로 보존하고 현재 Debian systemd 권위에서 검증되지 않은 중간 릴리스 없이 진행합니다.
