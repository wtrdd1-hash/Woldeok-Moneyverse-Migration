# 개발 B v633 — 국고 수입·지출 원장 증빙 보호 (2026-10-29)

## 문제 및 변경

`TreasuryRepository.getRevenue()`와 `getExpenditure()`가 국고 원장 조회 실패를 무시하고 수입·지출이 0 WLD인 정상 응답을 반환하는 문제를 수정했다. 인증·동의·관리자 권한을 유지하며 두 API는 원장 조회 또는 해석 실패 시 각각 `TREASURY_REVENUE_EVIDENCE_UNAVAILABLE`, `TREASURY_EXPENDITURE_EVIDENCE_UNAVAILABLE`을 포함한 HTTP 503을 반환한다. 응답 캐시 방지를 위해 `Cache-Control: no-store`를 적용했다. 정상 조회 결과가 실제로 비어 있다면 기존 0 WLD 응답을 유지한다. DB 마이그레이션, 권한 추가, 금융 원장·잔액 변경은 없다.

## 검증

TDD에서 4건의 결함을 재현한 뒤 집중 테스트 10건을 통과했다. 독립 PostgreSQL 17 환경에서 읽기 전용 역할로 실제 수입 50 WLD와 지출 20 WLD를 조회하고 UPDATE 거부 및 SELECT 권한 회수 시 HTTP 503을 확인했다(2건 통과). 전체 Typecheck·테스트·Build·API 계약 180개·Lint(오류 0건, 기존 경고 1,091건)를 통과했다. Backend 전체 1,965 PASS/442 SKIP, Frontend 1,910 PASS, DB 패키지 46 PASS/4 SKIP, 계약 38 PASS다. 기존 `qs@6.16.0` Moderate 취약점 때문에 의존성 보안 감사는 실패했다.

## 보류 사항

관리자 화면은 API 실패 시 해당 섹션을 숨기므로 명시적 '조회 불가' 표시를 개발 C와 조율해야 한다. 운영 전체 스키마 및 인증 E2E, 공식 Test 동일 SHA 검증, GitOps 릴리스 게이트가 미완료다. PR은 Draft + hold로 유지하며 병합·Production 배포는 금지한다.
