# Moneyverse 개발 A — 2026-10-13 18:25 KST

상태: **PARTIAL / CI 진행 중 / 격리 Test BLOCKED**. 후보는 **미출시**이며 운영 릴리스 버전은 올리지 않았다.

## 브랜치·PR 감사
- 시작 main: `3f59f9a2f653aab42e18d801a8f44341f7c42bd8`.
- 비-main 브랜치 22개에서 신규 브랜치 생성 후 23개. 열린 PR은 15개에서 Draft #817 포함 16개.
- 시작 브랜치 전체를 main과 비교: 고유 커밋 20개 브랜치 보존. main과 동일한 `auto/hourly-a-ci-stock-typeonly-20261013-1525`, `auto/hourly-b-kdic-ledger-failclosed-20261013-1535` 2개는 열린 PR HEAD가 없으나 GitHub ref 삭제 도구 부재와 원격 명령 할당량 제한으로 삭제 대기. 실제 삭제 0개.
- Dependabot 12개는 각 고유 커밋 1개, PR #804~#815와 실패 CI가 있어 보존. #801 고유 63/behind 45, #802 고유 35, #816 고유 4개 모두 미검증 변경으로 보존.
- 개발 C 알림 관련 4개, 개발 A 복구 2개 브랜치의 미통합 변경도 보존. 개별 의미적 충돌의 전수 재현은 미완료.
- 과거 약 191개 ref 소실 관측은 별도 원인 조사 대상이며 코드 손실로 단정하지 않는다.

## 실제 런타임 개발
- P0 보안 수정: `safeFetch`가 리다이렉트 목적지 SSRF 검사는 수행하지만 다른 origin으로 Authorization/Cookie/API 키 또는 요청 본문을 전달할 수 있는 문제를 수정했다.
- `backend/src/security/ssrf-redirect-credentials.test.ts`: 인증 헤더 차단, 동일 origin 보존, 공개 GET 허용, POST 본문 차단, URL 내 사용자정보 차단 총 5개 회귀 시나리오 추가.
- `backend/src/security/ssrf-defense.ts`: URL 사용자정보 거부, 민감 헤더/본문/명시적 credentials가 있는 요청의 cross-origin 리다이렉트 거부. 기존 공개 리다이렉트 및 목적지 검증은 유지.
- 주식 호가창 type-only import와 CI 전용 PostgreSQL DB 이름 일치 수정은 기존 복구 브랜치에서 확인한 blob을 재사용. **적용된 마이그레이션 변경 없음**.
- 커밋: `91057a4`(테스트), `98834d8`(런타임), `65e219b`(CI 선행 복구). Draft PR #817.

## 검증·배포
- GitHub Actions #38376466503: 분류·정책 PASS, 런타임 검사는 진행 중이었음. **전체 CI 통과 아님**.
- 최종 HEAD 기준 lint/typecheck/build/unit/integration/실제 PostgreSQL/보안/접근성/SEO/app-api/E2E 및 isolated Test 필수.
- Debian13 원격 장치는 온라인이나 Desktop Commander 월간 사용량 제한으로 명령 실행 불가. miniPC 오프라인. 격리 Test backend/API/DB/auth/핵심 사용자 흐름 검증 불가.
- PR #817 Draft 유지. main 병합·Production 배포·rollback 실행 없음.

## 잔여 위험
- 기존 AI 뉴스 테스트, 자산 진단 기대값, DB 최소권한 실패를 최신 CI에서 재확인하고 복구해야 한다.
- 필수 게이트 PASS 후 최신 main 재동기화, exact-SHA Test 검증, PR 병합 및 안전한 운영 승격 순서 유지.
