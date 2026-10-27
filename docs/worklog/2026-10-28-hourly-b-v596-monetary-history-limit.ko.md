# 개발 B v596 — 중앙은행 이력 조회 한도 검증 (2026-10-28, 배포 보류)

- 시작·중간 main SHA: `4f5efd1f48615f0112701feec25a9b0fc67d9719`. 독립 작업 브랜치: `auto/hourly-b-v596-20261028-0140`. AGENTS/README/영문·국문 기획서, QA v1329, 열린 PR, CI 확인.
- P1 결함: 관리자 통화정책·조폐국 이력 조회 API 6개가 `limit=2junk`, `1e2`, 중복 쿼리, 0 및 과도한 값을 엄격하게 거부하지 않음. 신규 테스트에서 수정 전 100건 RED 재현.
- 변경: 정확한 10진수 1~50만 허용, 미입력 시 20. 잘못된 입력은 SQL 실행 전 HTTP 400. 서비스 직접 호출도 같은 검증 적용. 기존 정상 API 경로·응답 유지. DB 마이그레이션·원장·WLD 변경 없음.
- 검증: 집중 112 PASS, 격리 PostgreSQL 17 2 PASS(앱 역할 SELECT-only 및 UPDATE 거부), 전체 Typecheck/Build PASS, Backend 1800 PASS/432 SKIP, Frontend 1681 PASS, API 계약 180개 PASS, Bot 8 PASS. 격리 컨테이너 제거. HTTP 테스트의 인증 가드는 테스트 대역.
- 차단: 기존 블로그 Lint 오류 2개, 마이그레이션 283 중복, 의존성 감사 취약점 10건(Moderate 8/Low 2), 공식 Test exact-SHA·인증 E2E·GitOps 미검증. **병합·Production 금지.**
- 통합 주의: PR #1608이 동일한 중앙은행 서비스 파일을 변경하므로 양쪽 변경사항 보존 필요. 개발 A/C/Gemini/QA 작업 및 예약 설정 변경 없음.
