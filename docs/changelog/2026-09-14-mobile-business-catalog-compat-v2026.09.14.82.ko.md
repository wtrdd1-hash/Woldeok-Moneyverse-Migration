# v2026.09.14.82 — 모바일 사업 카탈로그 호환성 수정

- 사업 구매가격 모바일 호환 필드 `price`, `purchasePrice`를 추가합니다.
- 일일 순수익 모바일 호환 필드 `expectedProfit`, `dailyProfit`, `netProfit`, `profit`을 추가합니다.
- 기존 정식 API 필드 `purchaseCost`, `dailyRevenue`, `dailyOperatingCost`는 그대로 유지합니다.
- 일일 순수익은 서버 기준 값인 `dailyRevenue - dailyOperatingCost`로 계산합니다.
- 백엔드가 명시적으로 내려준 동일 필드는 덮어쓰지 않습니다.
- 회귀 테스트를 추가하고 모바일 API 계약 버전을 `v2026.09.14.82`로 올렸습니다.
