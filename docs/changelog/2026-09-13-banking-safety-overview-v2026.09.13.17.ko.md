# Banking Safety Overview — v2026.09.13.17

## 사용자 이점
회원 전용 `/bank` 화면에서 금융 기능이 실제 금융상품이 아닌 게임 전용 가상 기능임을 명확히 표시하고, 현재 서버의 은행 상태를 기준으로 상환 중심의 안전한 다음 행동을 안내합니다.

## 런타임 변경
- 실제 금융상품처럼 보일 수 있는 문구를 virtual/simulated/game-only 기준으로 수정했습니다.
- 예금, 신용등급, 대출, 이자, 가상 채권에 대한 게임 전용 고지를 추가했습니다.
- 실행 중인 가상 대출이 있을 때 상환을 우선 검토하도록 안전한 다음 행동 카드를 추가했습니다.
- 최소 상환액을 현재 현금으로 충당할 수 있는지와 만기 정보를 표시합니다.
- 기존 banking standing API를 그대로 사용하며 WLD 정수 문자열/BigInt 정밀도를 유지합니다.

## v2026.09.13.15 재통합
이전 PR #217은 오래된 저장소 상태를 기준으로 만들어졌습니다. 해당 CI 실패는 Banking UI 코드 때문이 아니라 오래된 병합 기준선에서 migration 번호 `163`이 중복되고 `179`가 빠진 migration parity 문제였습니다. 이를 우회하기 위해 적용된 migration을 수정하지 않았습니다. 대신 최신 `main` 위로 런타임 변경을 다시 옮겨 현재 저장소의 migration 순서를 그대로 상속하도록 했습니다.

## 범위
프론트엔드 변경만 포함합니다. 새 API, DB migration, 원장 변경, 금리 변경, 잔액 변경, 대출 정책 변경, 채권 정산 변경은 없습니다.

## 기준선 및 동시 작업
- 기준 `main`: `a785869ebeb8f9e3a9b5dc017cad3498685df59a`.
- 후보 준비 직전에 열린 런타임 PR을 다시 확인했으며 `frontend/src/app/bank/page.tsx`를 더 최신으로 수정하는 PR은 없습니다.
- Portfolio Analysis #215, Event Calendar #195, Economy Scenario Lab #189, Casino spec #192는 독립 검증/명세 후보로 유지합니다.
- `kuber-infrastructure` `main`의 Test 후보는 아직 `cf73d089883f7d98d21b7b25b7d4083d9e37c02f`이며 이번 Banking 후보는 Test로 승격되지 않았습니다.

## 검증 및 배포 게이트
최종 정확한 후보 SHA에서 secret scan, lint, typecheck, production build, DB migration parity, 자동 테스트, dependency audit를 통과해야 합니다. 이후 immutable Test 이미지를 만들고 isolated `wdmv-test`에서 정확히 같은 후보 SHA가 실제 실행되는 것을 확인한 뒤에만 `main`/Production 승격을 고려합니다. 그 전까지 Production은 변경하지 않습니다.
