# C v1264 — 주식 조건부 주문 표시의 출처 정합성 (한국어 보조)

## 작업 전 — 2026-11-01 15:40 KST
- 기준 main: `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`.
- 미니PC Debian 13 서비스 7개 정상, 개발 PostgreSQL 연결 확인.
- 브라우저 localStorage에 저장한 감시 규칙이 서버 거래·금융 원장 증빙 없이 체결 성공처럼 표시되는 P0 문제 확인.
- 기존 인증·CSRF·소유자 조회 검증이 있는 서버 가격 알림을 재사용하고 자동 매도는 지원하지 않음을 명시한다.
- A/B/QA 및 다른 C 작업과 겹치지 않도록 분리된 브랜치와 작업트리 사용. main·공유 DB·운영 환경은 변경하지 않는다.

## 진행 중
- 기존 화면에서 새 회귀 테스트 3건 실패(RED)를 확인하고 브라우저 전용 가짜 체결 UI를 제거함. 기존 회원별 서버 가격 알림 생성/조회로 연결. 전체 검증 진행 중.

## 종료 — 기능 커밋 `3c1454426b9ab42f95d57f7a1c1a503e06ffcb86`
- 회귀 테스트 RED 3건 확인, 기능 수정 후 집중 25건 PASS. 프론트 전체 2,906건 PASS, 백엔드 전체 2,963건 PASS/518 SKIP(단일 워커 최초 시간 초과 후 2워커 재검증). Lint 오류 0/경고 1,017, Typecheck, 프론트/백엔드 Build PASS.
- 계약 41건, DB 패키지 62건 PASS(4 SKIP), Android app-api 계약 184개 PASS, 백엔드 알림 집중 9건 PASS(실DB 1 SKIP).
- 외부 네트워크를 차단한 PostgreSQL 17.11에 002~317 마이그레이션 316개 적용 PASS. 회원별 알림 SQL 함수 EXECUTE 허용, 원본 알림 테이블 및 금융 원장 직접 INSERT 금지 확인. 임시 컨테이너 삭제.
- 운영 의존성 High 이상 감사 PASS. 전체 의존성 취약점 9건으로 FAIL. 전체 경로 QA 필수 원장 누락 FAIL. 독립 Next HTTP의 개인 알림 경로 X-Robots-Tag `index, follow` 확인으로 FAIL. 인증된 공식 Test E2E BLOCKED.
- 공식 Test SHA `bc8cd8a6c654af0336f550643f23049a58ee1d16`, Production SHA `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834` (후보 미배포). main 병합, 운영배포, DB 변경, GitOps 변경, 롤백, 브랜치 삭제 없음.
- Draft PR #2338 보존. 관련 공통 HTTP 헤더 PR #2225에 재현 결과 전달. 별도 가짜 주식 체결 알림 이슈 #2340 등록. 원격 CI 정책·분류·두 runtime-check PASS, 후보 빌드 작업은 최종 확인 시 진행 중. 최종 HEAD SHA·백업은 PR 최종 기록에 기재.
- 최종 판정 PARTIAL / RELEASE BLOCKED. 핵심 예약 5개 및 A/B/QA/Gemini 작업은 변경하지 않음.
