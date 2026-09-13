# 내부 작업기록 — 앱 API 심사 준비 v2026.09.13.46

## 기준선/기획 재확인
- 작업 시작 기준 `main`: `5b6efd1f0d2f70bda4cb7385c4efd533c7453c0c`.
- 작업 중간 재확인에서 `main`이 `d80c22da548c2f28fb41cf7d06f711dc81c6b00a` / 기획 v2026.09.13.45로 전진했음을 확인. 변경 파일은 문서 6개뿐이라 runtime/API/DB 충돌은 없었고 이번 작업 버전을 v2026.09.13.46으로 승격.
- 최신 수익화 기획서는 문서-only임을 작업 전에 재확인했고 API/인증/runtime 요구를 변경하지 않음.
- 작업 중 v2026.09.13.43 사용자 앱 API 감사 문서를 다시 확인함.

## 실제 운영에서 찾은 문제
- 자체 회원가입은 register/메일 발송까지 진행됐지만 인증 완료에서 PostgreSQL SQLSTATE 42702 발생.
- DB 로그로 `auth_complete_local_registration`의 `ON CONFLICT (user_id, consent_version_id)`가 정확한 원인임을 확인.
- 사업 정산의 42702 로그는 과거 기록이며 현재 운영 함수는 이미 컬럼을 완전 수식한 수정 정의임을 확인.
- 운영 route map에서 OAuth/미디어가 version-neutral인데 기존 앱 gateway가 일반 `/api/v1/*`로 변환해 404 가능성이 있음을 발견.

## 구현
- migration 183에서 자체 가입 완료 함수의 conflict target을 `user_consents_pkey` 제약조건 이름으로 변경.
- 실제 DB를 사용하는 LocalAuthRepository 회원가입 완료 회귀 테스트 추가.
- media/OAuth version-neutral 경로를 앱 BFF에서 명시적으로 매핑.
- 전체 앱 API EN/KO 상세 문서와 실제 운영 route inventory 추가.

## 병합 전 테스트
- 격리 PostgreSQL 0~183 migration: PASS.
- 실제 `moneyverse_app` 자체 가입 완료 DB 테스트: PASS.
- app gateway 단위 테스트: PASS.
- 변경 모듈 frontend/backend typecheck: PASS.
