# v2026.10.31.1539 — 운영 백엔드와 동일 SHA 프론트 복구 후보

**상태: 격리 HTTP 미리보기 검증 완료 / 공식 Test 및 운영 절체 미실시.**

## 작업 전
사용자 지정 MCP 및 AGENTS, DOCS_INDEX, 문서 정책, PROJECT_PLAN, 통합기획서, RELEASING 확인. 다른 개발자 작업 트리와 로컬 main 변경 없음. 원격 main 761a55a 재확인. 기존 운영 백엔드 Git 커밋 95485a는 있으나 같은 SHA의 프론트 완성 산출물 백업은 검증되지 않았고 현재 프론트는 숫자형 빌드.

## 중간 및 실행
- 다른 작업자의 Next 빌드 종료와 메모리 여유 확인 후 별도 `/home/debian/moneyverse-task-records/prod-95485-recovery-v1538/repo`로 Git 95485a 정확 소스 격리.
- 패키지 오프라인 설치. 첫 빌드는 `@moneyverse/contract` 사전 빌드 누락으로 실패. 계약 패키지 빌드 후 정확한 95485a 40자리 SHA를 BUILD_ID와 NEXT_PUBLIC_BUILD_ID에 설정해 프론트 전체 Next 빌드 PASS. `.next/BUILD_ID` 일치 확인.
- 공개 서비스와 분리된 3893 포트에서 실행. 단순 HTTP 요청은 정상적인 HTTPS 308, 실제 운영 프록시 헤더 추가 시 홈·프론트 버전·관리자 국채·연금·로그인 GET 모두 HTTP 200, 버전은 백엔드와 같은 95485a. 미리보기 종료.
- 현재 백엔드 기준 Git SHA를 별도 `fix/prod-95485-recovery-v1538` 브랜치로 원격에 보존, main 변경 없음.

## 종료·미해결
- HTTP 200은 로그인된 관리자 기능 또는 금융 지급 검증이 아님. 실 금액 POST 시도 없음.
- 95485a 후보는 복구 비교용 과거 버전으로, PR #2131의 모바일 알림·국채 조회 수정과 PR #2143의 금융 권한 검사 개선을 포함하지 않음. 그대로 롤백하면 이전 문제가 재발할 수 있으므로 무조건 운영 승격 금지.
- 실제 공식 Test, 세션 유지, 금융 DB 및 무중단 blue-green 절체/롤백 검증이 남음. 운영 Nginx/systemd/릴리스 경로·원장·WLD 무변경. P0 #2144 지속.
