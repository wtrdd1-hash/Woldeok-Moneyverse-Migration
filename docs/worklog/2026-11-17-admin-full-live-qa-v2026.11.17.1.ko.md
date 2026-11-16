# v2026.11.17.1 — 관리자 전체 기능 실제 환경 QA 기록
## 시작 전 (2026-11-17 KST)
- 범위: 현행 전체 관리자 화면, 실제 HTTP API, 인증/권한/오류, Next.js·NestJS·Spring Boot 경계와 보안 헤더 검증.
- 기준: origin/main 86777fb2d5 및 통합 기획·프로젝트 계획·운영 진실 자료.
- 격리: 기존 작업 공간을 건드리지 않는 별도 QA 브랜치·worktree 사용.
- 안전: 운영 금전 입출금/발행/초기화/삭제/OTP 남용/서비스 재시작/배포 금지. 인증 세션이 없으면 인증 후 동작 여부를 통과로 오판하지 않음.
- 예정: [ ] 운영 라우팅 [ ] 모든 페이지/API 목록 [ ] 실요청 [ ] 권한·보안 [ ] 오류·로그 [ ] 중간 본류 재검증 [ ] 결과와 미검증 사항 [ ] GitHub 기록.
## 진행 중
- 대기.
## 종료
- 대기. 운영 승격 없음.

### 중간 기록 1 — 운영 HTTP 실측
- 비로그인 운영 관리자 화면 38경로: 200 37건, 404 1건(/admin/logs/system). HTTP 200은 기능 통과가 아님. 다수 관리자 페이지 index,follow 헤더.
- 관리자 GET API 92경로: 200 24건, 401 4건, 403 1건, 404 58건, 503 5건. 404 모두를 실제 장애로 단정하지 않음.
- 인증 불일치: 운영 /api/v1/admin/security는 비로그인에 open 관리자 세션 및 admin 역할 반환, Spring/Nest 직접 경로는 401. /api/v1/admin/me도 운영 200, 두 원본 서버 401.
- 금융 불일치: 국고 overview/revenue/expenditure/transactions, 예보 원장, FX는 Spring에서 익명 200, Nest에서 401. 값의 실제 원장 출처 미확인.
- 운영 조폐국 status/orders 503. Test 백엔드 비활성, 국고 API 502, SWF BFF 500. 운영 금전 변경 없음.
- GitHub 기록에는 원시 잔고·개인정보·비밀정보 포함하지 않음.

### 중간 기록 2 — 실제 금융·소스 테스트
- 운영 DB READ ONLY: 거래 943, 전표 1950, 계좌 43, 국고 52, 잔액/원장 대사 불일치 0.
- Spring 보안 전면 허용/CSRF 비활성, KDIC 고정 정상진단 및 허위 지급 성공, SWF 오류 후 SUCCESS, 국고 거래내역 항상 빈값 확인.
- Nest 655 통과/112 건너뜀, Next 968 통과, Spring 22 통과. 실운영 금융 인증 E2E 통과를 뜻하지 않음.

## 종료 — 2026-11-17 KST
- 실제 페이지/API/원장 조회 및 코드 검증 완료. 실 관리자 OTP/금융 POST, Test 복구, 독립 백업 복원·무중단 승격은 미실시.
- 판정 P0 FAIL / RELEASE HOLD. 운영 돈·DB·배포·main 변경 없음.
- docs/findings/2026-11-17-admin-finance-live-qa-v2026.11.17.1.md 및 한국어 쌍, docs/updates/v2026.11.17.1-admin-finance-qa-* 기록.
