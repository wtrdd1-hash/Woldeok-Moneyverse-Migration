# v2026.09.13.14 — 포트폴리오 분석

- 최신 통합 런타임 체인 위에 회원 전용 `/stocks/portfolio` 분석 화면을 추가했습니다.
- 별도 보유 상태를 만들지 않고 권위 있는 `/api/v1/stocks/portfolio` 계약을 재사용합니다.
- 총 평가금액, 취득원가, 미실현 손익, 종목별 비중을 `BigInt`/정수 문자열 방식으로 계산합니다.
- JavaScript 안전 정수 범위를 넘는 금액, 구성비 계산, 빈 포트폴리오, 잘못된 권위 데이터에 대한 회귀 테스트를 추가했습니다.
- 가상 주식 도구 메뉴에 포트폴리오 진입점을 추가했습니다.
- DB migration, 원장/보유량/주가 변경, 추천 엔진, 경제 정책 쓰기는 추가하지 않았습니다.
- 기준선: Personal Dashboard PR #214 head `90fdeb47c5a5de95404a4e8778433db3080d0ad9`, `main` `e023c15927035d58b67b76d3765535adc1d2ded0` 반영 상태.
- CI와 exact-SHA isolated Test 검증 전에는 Production으로 승격하지 않습니다.
