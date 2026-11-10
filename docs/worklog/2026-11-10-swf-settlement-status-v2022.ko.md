# v2026.11.10.2022 — 국고 ASWF 정산·실행 상태 사실성 점검

## 작업 전 (2026-11-10 09:42 KST)
- 사용자 제보: `/admin/treasury` ASWF에 `자동투자 실거래 정산 대기`, 평가액 20,000,001 WLD, 안전준비금 10,000,000 WLD, 환원·리밸런싱 비활성화.
- 접근: 지정된 `@미니pc홍` MCP의 Debian 호스트. 원본 checkout `main`은 다른 작업자가 수정 중(`ahead 2, behind 2`, 작업 파일 존재)이라 보존하고 별도 브랜치/워크트리 사용.
- 기준: `AGENTS.md`, 영어·한국어 통합 기획, `docs/TREASURY_AUTONOMOUS_SWF_SPEC.ko.md`, 2026-11-10 국고 정본 투자 계획, `docs/RELEASING.md`, 최근 SWF 마이그레이션 249/339/343 및 v1949 업데이트 기록 검토.
- 개발 DB 조회(읽기 전용): `treasury_swf_configs.is_enabled=true`, `safe_reserve_wld=10000000`, 포트폴리오 평가합계=20,000,001 WLD, 이벤트 278건. 수치는 정산된 실투자 증빙이 아니며 운영 DB 증빙을 대신하지 않음.
- 확인된 사실: 백엔드 `evaluateAndRebalance()`는 실거래 실행을 반환하지 않음(`executed:false`); SQL 343은 증빙 없는 평가액 환원을 거부함. UI는 정책 ON을 엔진 정상 가동/원장 연동 완료로 오인시키는 안내와 새로고침 시 원장 동기화 완료로 오인시키는 토스트를 표시함.

## 작업 중
- [x] 실제 유효 원장과 미정산 평가 구분을 테스트로 고정한다(RED).
- [x] 정책 허용과 실제 엔진 실행을 분리 표기하고 허위 정산·자동 운용 문구를 제거한다(GREEN).
- [x] 프론트 단위 테스트 3/3 PASS, ESLint PASS, 중간 `origin/main=3a7c34507aff858cce71efbb10410a4a2f7c9ef8` 재확인. TypeScript `tsc --noEmit` PASS, `git diff --check` PASS. 초기 기본 `NODE_ENV`가 production이라 React.act 테스트 환경 오류가 발생해 `NODE_ENV=test`로 수정 후 RED 1건 및 GREEN 3건을 검증.
- [x] 공식 Test 서비스는 active이나 Test/Production 버전 모두 `727881420a491bb129a1a97258ea8ae67f62bbf8`이며 후보 SHA가 아님을 읽기 전용 확인. 정확 SHA Test 미배포이므로 운영 승격 **보류**.

## 작업 종료 (2026-11-10 KST)
- 변경 파일 lint PASS; UI 단위 3/3 PASS; 타입 검사 PASS. backend 실거래 정산 구현, 금융 DB 테스트, 전체 CI/브라우저 E2E는 이번 변경에서 미수행·미검증.
- 메인 재확인: 시작 및 중간/종료 `origin/main=3a7c34507aff858cce71efbb10410a4a2f7c9ef8`. 원래 작업 트리의 다른 작업자 수정 파일은 건드리지 않음.
- 운영/국고 금융 쓰기: 0건. PROD 변경: 없음.
- 남은 작업: 정확 SHA 공식 Test 및 금융 증빙·운영 QA. 추후 결과를 추가 기록하며 검증 전 운영 승격 보류.
- 영어 정본/한국어 부본: `docs/updates/v2026.11.10.2022-swf-status-{internal,github}.md` 및 `.ko.md`, 변경 이력 2종.

- GitHub 초안 PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3013 (실제 정산/CI·공식 Test 검증까지 운영 승인 금지).
