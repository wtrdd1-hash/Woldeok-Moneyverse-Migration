# Banking Safety Overview — v2026.09.13.15

## 사용자 이점
회원 전용 `/bank` 화면에서 금융 기능이 실제 금융상품이 아닌 게임 전용 가상 기능임을 명확히 표시하고, 현재 서버의 은행 상태를 기준으로 한 가지 안전한 다음 행동을 안내합니다.

## 런타임 변경
- 실제 금융상품처럼 보일 수 있는 문구를 virtual/simulated/game-only 기준으로 수정했습니다.
- 예금, 신용등급, 대출, 이자, 가상 채권에 대한 게임 전용 고지를 추가했습니다.
- 실행 중인 가상 대출이 있을 때 최소 상환액 충당 가능 여부와 만기 정보를 표시합니다.
- 기존 banking standing API를 그대로 사용하며 WLD 정수 문자열/BigInt 정밀도를 유지합니다.

## 범위
프론트엔드 변경만 포함합니다. 새 API, DB migration, 원장 변경, 금리 변경, 잔액 변경, 대출 정책 변경, 채권 정산 변경은 없습니다.

## 기준선 및 동시 작업
- 기준 main: `bb15881b87d421ff40f2436f062e936813fdbeec`.
- 오래된 `integrate/hourly-banking-v2026.09.12.20`은 현재 main보다 뒤에 있고 고유 커밋이 0개임을 확인했습니다.
- 최신 활성 런타임 후보인 Portfolio Analysis PR #215는 확인했으며 이번 `/bank` 파일과 겹치지 않습니다.

## 배포 게이트
최종 후보에서 secret scan, lint, typecheck, production build, tests, CI를 수행하고 exact SHA를 isolated `wdmv-test`에 배포해 `/bank` 인증 화면과 backend version 일치를 확인한 뒤에만 main/Production 승격을 고려합니다.

Production은 해당 검증 전까지 변경하지 않습니다.