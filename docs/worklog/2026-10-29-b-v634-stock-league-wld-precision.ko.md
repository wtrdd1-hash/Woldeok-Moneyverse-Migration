# 개발 B v634 — 주식 리그 WLD 금액 정밀도 보호 (2026-10-29)

시작 main `679cb5904f779a1b2067f10809fcca83e31dbe91`, 중간 main `95a8fdb85f6670cac9e52e16383711ac94924e93`. 독립 브랜치 `auto/hourly-b-v634-stock-league-safe-wld-20261029-1505`. AGENTS, README, 영문/국문 기획서, QA v1366, 열린 PR/CI 확인. 기존 B #1852와 QA 의존성 보안 #1687의 작업을 중복하지 않음.

**실제 결함:** PostgreSQL NUMERIC `9007199254740993` WLD가 JS `Number()` 변환으로 `9007199254740992`로 반올림되어 시즌·순위·고래·회원 구독 API에 잘못 표시됨. TDD RED 4건 재현 후, 9007199254740991.01이 9007199254740991로 반올림되는 추가 RED 1건도 확인(총 5건).

**실제 수정:** `StockLeagueRepository` WLD 필드에 BigInt 기반 정확한 십진수/범위 검증을 적용(.00 허용, 소수 금액 차단). 불완전·범위초과·소수 금액은 HTTP 503 / `STOCK_LEAGUE_WLD_PRECISION_UNAVAILABLE`로 실패 차단. 기존 회원 참가 정보의 정밀도 검증도 공통화. 인증·권한·금융원장·DB 스키마·마이그레이션 변경 없음. 정상 안전 정수의 기존 숫자 API 계약 유지.

**검증:** 집중 테스트 20 PASS, 실제 NestJS HTTP 2 PASS, 격리 PostgreSQL 17.11에서 범위 초과와 읽기 전용 역할 UPDATE 거부 1 PASS. 최종 코드 전체 Typecheck PASS, Backend 1,972 PASS/441 SKIPPED, Frontend 1,916 PASS, Database 46 PASS/4 SKIPPED, Contract 38 PASS. 전체 Lint 오류 0/기존 경고 1,091, Backend/Next.js Build PASS(609페이지), API 계약 PASS. 보안감사 FAIL: 기존 qs@6.16.0 Moderate 1건(QA #1687 담당). CI/공식 Test exact-SHA 미확인. 모든 게이트 PASS 전 PR 병합 및 Production 승격 금지.

**잔여:** 운영 전체 스키마·인증 사용자 흐름 E2E, 원장 자금출처·마이그레이션 원본·독립 백업 복원 검증 필요. 향후 큰 WLD 금액을 허용하려면 Web/Android와 합의된 문자열 기반 계약 전환 필요. 다른 개발자의 브랜치/예약/배포는 변경하지 않음.

**Frontend C 연계:** 현재 `stocks-league-client.tsx`에는 가상 구독 1건과 `defaultWhales` 5명이 남아 있으며 API 실패 시 허위 정보를 표시한다. 종료·미병합 C PR #1168의 수정이 최신 main에 없다. Backend 503만으로 사용자 화면이 안전하다고 주장할 수 없으므로 기존 이슈 #1169로 C와 조정하며 사용자 흐름 E2E는 BLOCKED로 유지한다.

**최종 보강:** 최초 후보의 분수형 NUMERIC 반올림 결함을 추가 발견하여 해당 exact-gate를 중단하고 안전한 십진수 변환으로 수정했다. 최종 SHA에서 필수 게이트를 다시 검증하며 이전 후보의 성공을 새 SHA 성공으로 간주하지 않는다.
