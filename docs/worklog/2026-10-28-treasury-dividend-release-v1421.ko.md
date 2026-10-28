# v2026.10.28.1421 — 국고 시민배당 운영승격 시도

## 시작
사용자 운영승격 명시 지시. 일반 DB 직접 권한은 허용된 것으로 판단해 이번 작업에서 권한 일괄 변경 생략. 원장 회계 대사/기존 거래 복원은 필수. 최신 main 및 통합 기획, v523/v542, AGENTS, Release Guide 검토. 별도 작업 브랜치 PR #1706, 공식 Test/블로그 별도 작업자 및 운영 서비스 보호.

## 중간
- GitHub 첫 CI SHA 52623008: lint/typecheck/build/마이그레이션 통과, DB 테스트 49 PASS / 1 FAIL. `economy_post_transaction`에 존재하지 않는 policy_version `treasury.v1420`을 넣어 foreign key 오류 발생.
- 격리 Docker PostgreSQL 17.11: schema 001과 순방향 SQL 마이그레이션 290개 실제 순차 적용 PASS. 기존 Test/Prod DB와 분리.
- 국고배당 함수 policy_version 인자를 `NULL`로 수정해, 정책 버전을 실제 등록한 것처럼 허위 참조하지 않도록 조치. 스키마 계약 테스트로 회귀 검증.
- 격리 DB 트랜잭션 배당: 시민 1명 +1,000, 정식 국고 계정 -1,000, 금고 -1,000, 복식분개 debit/credit 각 1,000, 지급감사 1건, 동일 요청키 재실행 영수증 동일. 변경 키 금액, 기존 3인자, 권한 없는 요청, 국고 0 WLD 지급 모두 거절. Synthetic fixture는 ROLLBACK. 실제 SQL E2E PASS.

## 승격 게이트
운영 DB 기준(이전 판독): `moneyverse_app` 일반 금융테이블 DML 권한 3곳 허용 상태, USER_CASH 18개 계정 +1,000 WLD씩 합계 18,000 WLD가 정식 복식원장 미반영, 정식 `TREASURY` 원장 계정 잔액 0. 사용자가 권한 유지를 승인해도 운영 원장 대사 실패는 해소되지 않는다. 이 이력에 가짜 분개나 재지급으로 맞추지 않음. 공식 Test 정확 SHA 및 금융 인증 흐름·백업 복원·재원 인증 전 Production 승격 성공 주장 금지.
