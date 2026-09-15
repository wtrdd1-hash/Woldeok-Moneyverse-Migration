# v2026.09.15.123 — 주식시장 정렬

## 사용자 이점
회원은 등락률 상위, 높은 가격, 많은 거래 가능 수량, 이름순으로 종목을 빠르게 탐색할 수 있습니다. `?sort=`에 상태를 저장해 정렬 화면을 북마크하거나 공유할 수 있습니다.

## 구현 및 안전성
`frontend/src/app/stocks/page.tsx`를 수정하고 `stock-market-sort.ts`와 집중 테스트를 추가했습니다. API·DB·원장·권한·멱등성·마이그레이션·운영 데이터 경로는 변경하지 않았습니다. 등락률은 부동소수점 나눗셈 대신 `BigInt` 교차 곱으로 정확하게 비교합니다.

## 검증
Contract build PASS, frontend Vitest 66 files / 603 tests PASS, frontend typecheck PASS, Next.js production build PASS. push 이후 저장소 CI와 exact-SHA Test 배포는 계속 승격 필수 게이트입니다.
