# QA 전체 경로 증빙의 정확한 SHA 결속 — Backend B v677

**상태:** 코드 수정 후보, RELEASE HOLD. **범위:** QA·릴리스 증빙 검증만 수정. API·DB·금융 원장·운영 서비스 변경 없음.

## 재현된 P1 결함

기존 검증기는 5회 증빙 항목이 채워져 있으면 대장 자체에 기재한 `candidateSha`가 검증 대상 커밋과 다르거나 개별 `runtimeVersion`이 다른 버전이어도 통과할 수 있었다. 패키지 명령은 필수 inventory·ledger 경로를 전달하지 않았다. 단위 테스트 통과는 실제 로그인 상태의 경로 E2E 증빙이 아니다.

## 변경 계약

- 독립적으로 지정한 정확한 40자리 Git `expectedSha`와 대장 `candidateSha`를 대조하고, 모든 증빙 항목의 `runtimeVersion`을 동일 SHA에 결속한다. 형식 불량·불일치는 실패한다.
- CLI 기본 예상 SHA는 현재 체크아웃의 `git rev-parse HEAD`이다. 별도 Test 후보라면 `--expected-sha <40자리 SHA>`를 명시한다. 대장에 적힌 SHA를 독립 근거로 재사용하지 않는다.
- `pnpm qa:route-ledger:check`에 표준 inventory·ledger 파일 경로를 전달한다. 실제 ledger 파일이 없으면 계속 실패한다. 가짜 PASS를 생성하지 않는다.
- 저장소 전체 `pnpm test`에 QA 대장 회귀 테스트를 포함해 필수 CI 경로에서 검증한다.
- 서로 다른 SHA, 혼합 런타임, 잘못된 SHA, CLI 양성·음성 회귀 테스트를 추가했다. 합성 테스트는 실제 Test E2E가 아니다.

**사용:** 실제 `artifacts/qa/full-route-ledger.json`과 인벤토리를 수집한 후 `pnpm qa:route-ledger:check --expected-sha <검증한_SHA>` 실행.

**남은 차단:** 실제 인증 5회 전체 경로, 관리자·동적 페이지, Test의 frontend/backend/app-api/DB 정확 SHA, 전체 CI·보안·독립 복구·운영 스모크. 검증기는 스크린샷의 진위·서명·실제 실행 프로세스를 단독 인증하지 않는다. 모든 게이트 PASS 전 병합·Production 승격 금지.
