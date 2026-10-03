# CI 복구 및 전 기능·전 페이지 QA 설계

**작성일:** 2026-10-03  
**상태:** 검토 대기

## 목표

현재 `main`의 CI 실패를 재현 가능한 코드 수정으로 해소하고, 정확한 후보 커밋이 Test 환경의 프런트엔드와 백엔드에 함께 배포된 뒤 전체 기능·전체 페이지 QA를 증거와 함께 수행한다.

## 현재 확인된 사실

- `origin/main`은 `6fc3adc20bf21c7a447c4693fa07625da014f336`이다.
- 이 커밋의 GitHub CI 실행 `37117319207`은 lint 오류로 실패했다. 오류는 `@typescript-eslint/consistent-type-imports` 및 `no-empty` 규칙에 집중되어 있다.
- Test API 버전은 `f61680c6d4b8b8df7598dbf3e29eb9e56f0a7464`, Production API 버전은 `7080738e656aca099d5c871278d178d69a984fcc`이다. 둘 다 현재 `main`과 일치하지 않는다.
- 두 환경의 `/frontend-version`은 Git SHA가 아닌 timestamp 형식 값을 반환한다. 따라서 프런트엔드와 백엔드가 동일 후보인지 증명할 수 없다.
- 현재 페이지 인벤토리는 `frontend/src/app/**/page.tsx` 기준 119개, API 계약은 `docs/mobile-api-contract.json` 기준 179개 endpoint다.
- QA 명세는 Test 후보 SHA, 5회 완주, 역할·동적 route·관리자 증거와 ledger 검증을 요구한다.
- QA fixture 카탈로그에는 역할 ID만 있고 실제 Test 계정·권한·시드 데이터는 제공되지 않는다.
- Mini PC(`192.168.100.190`) SSH는 2026-10-03 점검에서 timeout이었다. 원격 미커밋 변경은 접근 복구 전에는 병합하거나 추정하지 않는다.

## 범위

### 포함

1. 최신 `main`에서 CI lint 실패를 로컬과 GitHub에서 재현하고, 최소 변경으로 수정한다.
2. 수정 커밋의 테스트·타입 검사·빌드와 GitHub required check 통과를 확인한다.
3. Test에 정확한 후보 SHA를 배포하고, API와 프런트엔드가 같은 SHA를 보고하도록 배포 증거를 확보한다.
4. 고정된 인벤토리와 fixture로 공개·로그인·권한 제한·관리자·동적 route를 포함해 전체 페이지와 기능을 QA한다.
5. 결과를 QA ledger와 실패 목록에 기록하고, 실패는 재현 조건·영향·담당 영역·수정/재검증 상태를 남긴다.

### 제외

- 사용자 승인 없는 Production 배포, 데이터 삭제, 결제·카지노 등 파괴적 실제 거래.
- 접근 불가 Mini PC의 작업 트리 병합 또는 원격 변경 추정.
- 실제 Test 증거 없이 QA 완료 선언 또는 ledger를 인위적으로 채우는 행위.

## 설계 결정

### 1. CI 복구는 격리 브랜치에서 최소 수정한다

새 worktree와 브랜치에서 실패 로그의 파일·행을 정확히 식별한다. type-only import는 해당 규칙에 맞게 변경하고, 빈 catch/분기는 오류 처리 또는 의도 명시로 대체한다. 규칙을 완화하거나 광범위한 lint ignore를 추가하지 않는다.

수정 전에는 실패 명령을 재현하고, 수정 후에는 대상 테스트, lint, typecheck, build를 실행한다. 커밋을 push한 뒤 GitHub의 required check 통과를 확인한다.

### 2. Test 후보는 배포 가능한 단일 SHA로 식별한다

CI가 통과한 커밋을 Test 후보로 지정한다. 배포 뒤 `/api/version`과 `/frontend-version`이 모두 해당 Git SHA를 반환하도록 배포 계약을 점검한다. timestamp만 반환하는 프런트 버전 엔드포인트는 SHA 증거가 아니며, 이를 보완하기 전에는 전체 QA를 완료로 표기하지 않는다.

### 3. QA는 인벤토리 고정과 증거 기반으로 진행한다

후보 SHA에서 route/API 인벤토리를 생성해 hash를 기록한다. 페이지별 QA는 최소 다음을 포함한다.

- guest, member, restricted, owner, non-owner, admin의 권한 경계
- 정상·not-found·permission-denied 동적 route
- 관리자 페이지와 파괴적 액션의 Test-safe 시나리오
- API 계약의 성공·인증 실패·권한 거부·검증 오류 경로
- 데스크톱/모바일 viewport, 오류·빈 상태·로딩 상태

전체 인벤토리는 명세의 5회 완주 조건을 충족해야 하며, 각 pass의 결과와 증거 URL/스크린샷/로그를 ledger에 기록한다. 실패 항목은 차단 여부를 분류해 수정 후 같은 후보 또는 새 후보에서 재검증한다.

### 4. 접근·배포 차단은 명시적으로 분리한다

Test fixture 자격 증명, 시드 방법, 배포 권한 또는 Mini PC SSH가 없으면 해당 항목은 `BLOCKED`로 남긴다. 이는 코드 결함이나 완료와 혼동하지 않으며, 필요한 접근 주체와 요청 사항을 ledger에 기록한다.

## 실행 순서

1. 최신 `origin/main`에서 CI 실패 상세 로그와 로컬 lint를 대조한다.
2. 격리 worktree에서 최소 코드 수정과 회귀 테스트를 수행한다.
3. PR 또는 승인된 병합 절차로 `main`에 반영하고 GitHub required check를 확인한다.
4. 정확한 통과 SHA를 Test에 배포하고 API/프런트 버전 증거를 수집한다.
5. fixture와 Test-safe 시드를 고정한다.
6. route/API 인벤토리를 고정한 뒤 5회 QA를 실행하고 ledger를 검증한다.
7. 재현 가능한 실패만 수정·재검증해, 완료/잔여 BLOCKED를 분리 보고한다.

## 완료 기준

- 최신 후보 SHA의 required CI check가 모두 통과한다.
- Test의 API와 프런트엔드가 같은 후보 Git SHA를 증명한다.
- 전체 route/API 인벤토리, 5회 pass, 역할/동적/admin 증거가 QA ledger 검증을 통과한다.
- 발견된 결함은 수정과 재검증을 완료했거나, 외부 접근·승인이 필요한 BLOCKED 사유와 영향이 명확히 기록된다.
- Production에는 사용자 승인 없는 변경이 없다.

## 위험과 대응

| 위험 | 대응 |
| --- | --- |
| CI 오류가 문서의 오래된 결과와 다름 | 현재 실패 run과 로컬 실행 결과만 수정 근거로 사용 |
| Test가 후보 SHA와 다름 | QA 시작 전 배포 증거를 강제 |
| fixture/시드 부재 | 권한·동적·파괴적 시나리오는 BLOCKED 처리하고 자격 증명 요청 |
| Mini PC 접근 불가 | 원격 변경을 병합하지 않고 네트워크/SSH 복구를 별도 차단 사항으로 보고 |
| QA 범위 과대 | 자동 smoke와 수동 역할·동적 QA를 분리하되 ledger의 5-pass 기준은 유지 |
