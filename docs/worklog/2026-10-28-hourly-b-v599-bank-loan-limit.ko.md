# 개발 B v599 — 관리자 은행 대출 목록 조회 제한 강화
2026-10-28 / PARTIAL · RELEASE HOLD

GET /api/v1/admin/bank?limit= 가 빈 값·공백·지수 표기·16진수·선행 0·범위 초과 등을 Number()로 변환하여 잘못된 조회를 허용할 수 있는 문제를 수정했다. 기본값은 50(Repository 기본값), 명시 입력은 정규 십진수 1~200만 허용한다. 잘못된 입력은 은행 개요·신용등급·대출 목록 SQL 조회 전에 HTTP 400으로 거부한다. 기존 관리자 인증/인가, 정상 응답 구조, WLD 문자열 정밀도와 DB 원장은 유지한다.

수정 전 HTTP 회귀 9건 실패를 확인하고 수정 후 집중 29/29 PASS. 격리 PostgreSQL 17.11에서 기존 264번 SQL 함수의 1~200 범위, 잘못된 값 SQLSTATE 22023, 비관리자 42501, 앱 계정 직접 SELECT 거부 및 큰 금액 정밀도를 합성 스키마로 확인했다. 운영 DB는 변경하지 않았다.

Backend 1,705 PASS/430 SKIP, Frontend 1,681 PASS, Typecheck/Build/계약 180건/변경 파일 Lint PASS. 전체 Lint는 기존 블로그 오류 2건, 전체 필수 테스트는 283 중복·285 누락으로 FAIL. 전체 보안 감사도 Root 11건 및 Bot Critical 1·High 5로 FAIL. 공식 Test exact-SHA 인증 E2E와 GitOps 게이트 미완료. Draft + hold, main 병합·Production 배포 금지.

기존 개발 A/C/Gemini/QA 브랜치 및 예약 설정은 변경하지 않았다.
