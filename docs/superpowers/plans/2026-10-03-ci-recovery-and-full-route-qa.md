# CI 복구 및 전 기능·전 페이지 QA 실행 계획

> **실행 방식:** 현재 세션에서 격리 worktree를 사용해 순차 실행한다.

**목표:** 최신 `main`의 lint 실패를 최소 변경으로 고치고, Test의 프런트엔드·백엔드가 같은 후보 SHA임을 검증한 다음 전체 route/API QA를 증거 기반으로 수행한다.

**전제:** 설계 문서 `docs/superpowers/specs/2026-10-03-ci-recovery-and-full-route-qa-design.md`가 승인되었다. Production 변경, 실제 금전 거래, 접근 불가 Mini PC의 변경 병합은 이 계획에 포함하지 않는다.

---

## 1. 실패 기준을 worktree에서 재현하고 수정 범위를 고정한다

**작업 위치**

- 새 격리 worktree, `origin/main` 기준 브랜치 `fix/ci-lint-recovery-20261003`
- `frontend/src/app/spaces/page.tsx`
- `frontend/src/app/spaces/real-estate/page.tsx`
- CI 로그가 가리키는 `TaxPreset`, `KimchiPremiumPreset`, `RealEstatePreset` import 보유 파일
- `frontend/src/components/personal-spaces-view.tsx`
- `frontend/src/components/viral-share-button.tsx`
- `frontend/src/components/viral-share-card-dialog.tsx`
- `frontend/src/components/viral/share-diagnosis-card.tsx`
- `frontend/src/lib/viral-share-card.test.ts`
- `frontend/src/lib/audio-effects.ts`
- `frontend/src/lib/personal-spaces.ts`
- `frontend/src/lib/savings-pot.ts`

**절차**

1. `git fetch origin --prune` 후 후보 base SHA와 `git status --short --branch`를 기록한다.
2. `pnpm lint`를 실행하고 GitHub run `37117319207`의 19개 error와 파일·행이 일치하는지 확인한다.
3. 오류가 확인된 import만 `import type` 또는 혼합 type import 문법으로 바꾼다. 런타임 값으로 사용되는 import는 변경하지 않는다.
4. 각 빈 `catch`/블록의 호출 의도를 확인한다. 실패를 의도적으로 무시해야만 하는 경우에는 빈 블록 대신 간단한 설명 주석을 둔 비어 있지 않은 블록 또는 안전한 명시 처리를 사용한다. 오류를 삼키면 안 되는 경로는 호출자에 오류가 전달되도록 한다.
5. 수정 전후 diff를 검토하여 lint rules, global ignore, 대량 auto-fix는 변경하지 않는다.

**검증**

```powershell
pnpm lint
git diff --check
```

**완료 조건:** lint error가 0이고, 원래 CI의 warnings를 새로운 error로 바꾸지 않았으며, 변경은 위 오류 파일에 한정된다.

---

## 2. 기능 회귀를 테스트·타입 검사·빌드로 차단한다

**작업 위치**

- 동일 격리 worktree
- 수정된 라이브러리와 UI 컴포넌트의 기존 `*.test.ts` / `*.test.tsx`

**절차**

1. import 변경으로 런타임 값이 제거되지 않았는지 TypeScript 검사로 확인한다.
2. `audio-effects`, personal spaces, savings pot, viral share 기능의 기존 단위 테스트를 먼저 실행한다.
3. 전체 monorepo test, typecheck, build를 실행한다.
4. 실패가 발생하면 실패 로그를 보존하고 원인 확인 → 최소 수정 → 같은 명령 재실행 순서로 처리한다.

**검증**

```powershell
pnpm --filter @moneyverse/frontend test -- --runInBand
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

**완료 조건:** 모든 명령이 성공하고 새로운 테스트/타입/빌드 실패가 없다.

---

## 3. GitHub CI 후보를 만들고 required check를 검증한다

**작업 위치**

- 같은 브랜치와 GitHub PR
- `.github/workflows/**`는 변경하지 않는다(코드 수정의 검증 대상일 뿐이다).

**절차**

1. 검증 결과가 성공한 변경만 한 개 이상의 의미 있는 커밋으로 만든다.
2. 브랜치를 push하고 PR을 만든다. PR 설명에는 재현한 run, 수정 오류 종류, 로컬 검증 결과를 기록한다.
3. GitHub check-runs와 repository ruleset/required check 상태를 확인한다.
4. 실패한 required check가 있으면 실패 원인을 먼저 고치고 새 push로 재검증한다. CI가 green인 것만으로 권한 정책이 보장되었다고 가정하지 않는다.
5. 승인된 병합 절차로만 `main`에 반영한다. 병합 SHA를 Test 후보로 지정한다.

**검증**

```powershell
gh pr checks <PR번호> --watch
gh api repos/wtrdd1-hash/Woldeok-Moneyverse-Migration/commits/<후보SHA>/check-runs
git log -1 --format='%H %s' origin/main
```

**완료 조건:** 후보 SHA의 required check가 통과하고, 실제 `main`이 그 SHA를 포함한다.

---

## 4. Test 배포의 프런트엔드·백엔드 SHA 동치를 증명한다

**작업 위치**

- Test 배포 파이프라인 및 Test runtime endpoints
- 버전 응답을 구현한 backend/frontend 배포 코드(필요한 경우에만)

**절차**

1. 통과한 `main` SHA를 Test 배포 후보로 지정한다.
2. 배포가 허용된 경로를 통해 Test에만 배포한다. Production 배포 명령은 실행하지 않는다.
3. `/health`, `/api/version`, `/frontend-version`을 조회해 상태와 SHA를 보관한다.
4. `/frontend-version`이 timestamp 등 SHA가 아닌 값이면, 배포 metadata/빌드 주입값에서 검증 가능한 Git SHA를 노출하도록 별도 최소 수정과 CI를 수행한다. SHA 증명이 전에는 QA ledger를 완료 처리하지 않는다.
5. API와 프런트엔드가 같은 후보 SHA를 반환하고, 배포 시각·URL·응답 원문을 QA evidence로 기록한다.

**검증**

```powershell
Invoke-RestMethod https://test.woldeok.com/health
Invoke-RestMethod https://test.woldeok.com/api/version
Invoke-RestMethod https://test.woldeok.com/frontend-version
```

**완료 조건:** Test backend SHA = frontend SHA = 통과한 `main` 후보 SHA가 증명된다.

---

## 5. 전 기능·전 페이지 QA 입력을 고정한다

**작업 위치**

- `scripts/qa/fixtures/full-route-fixtures.v1.json`
- `docs/planning/FULL_ROUTE_UI_QA_SPEC.ko.md`
- QA inventory/ledger 생성·검증 스크립트

**절차**

1. 배포된 후보 SHA에서 route inventory와 API contract inventory를 생성하고 hash를 기록한다.
2. guest/member/restricted/owner/non-owner/admin fixture의 Test 계정, 권한, 시드 방법, dynamic route 값을 안전한 비밀 저장소 또는 승인된 운영 문서로 확보한다. 비밀 값을 Git에 커밋하지 않는다.
3. fixture가 없거나 권한이 부족한 항목은 `BLOCKED`로 기록하고 필요한 계정/시드/권한을 명시한다.
4. 파괴적 기능(삭제·결제·카지노·광고)은 Test-safe fixture 및 롤백/정리 절차를 먼저 검증한다.

**검증**

```powershell
rg --files frontend/src/app -g page.tsx
pnpm qa:full-route:verify --help
```

**완료 조건:** 후보 SHA, inventory hash, fixture 상태, 동적 route sample이 QA ledger 시작 전에 고정된다.

---

## 6. 5회 전수 UI/API QA와 재검증을 수행한다

**작업 위치**

- Test 환경만 사용
- `docs/planning/FULL_ROUTE_UI_QA_SPEC.ko.md`의 ledger 및 evidence 경로

**절차**

1. 공개 route와 API smoke pass를 실행한다.
2. 각 역할 fixture로 로그인·권한 경계·빈 상태·오류 상태를 실행한다.
3. 모든 동적 route를 valid/not-found/permission-denied 값으로 실행한다.
4. 관리자 22개 route와 관련 API를 admin fixture에서 실행하고, 파괴적 행위는 Test-safe 데이터를 사용한다.
5. desktop/mobile viewport를 포함해 전체 inventory를 총 5회 pass한다.
6. 각 pass마다 후보 SHA, route/API 결과, 화면/로그 증거 URI, 실패 재현 단계, 영향도를 ledger에 기록한다.
7. 결함은 우선순위별로 최소 수정 후 같은 증거 절차로 재검증한다. Test가 새 SHA로 바뀌면 inventory와 pass를 새 후보 기준으로 다시 시작한다.

**검증**

```powershell
pnpm qa:full-route:verify --candidate-sha <후보SHA> --ledger <ledger경로>
```

**완료 조건:** verifier가 통과하고, 모든 알려진 실패가 수정·재검증되었거나 외부 접근/승인이 필요한 BLOCKED로 분리된다.

---

## 7. 최종 보고와 운영 경계 확인

**절차**

1. 최종 보고에 후보 SHA, CI run/PR, Test version 증거, route/API 인벤토리 수, 5 pass 결과, 수정된 결함, BLOCKED를 기재한다.
2. Production version은 읽기 전용으로 재확인하되 Production 배포는 하지 않는다.
3. Mini PC SSH timeout은 별도 운영 차단 사항으로 남기며, 접근 복구 후에만 해당 작업 트리의 변경을 재평가한다.

**완료 조건:** 완료 주장에는 명령 출력/URL/ledger 검증 결과가 연결되고, 증거가 없는 항목은 완료로 표기하지 않는다.
