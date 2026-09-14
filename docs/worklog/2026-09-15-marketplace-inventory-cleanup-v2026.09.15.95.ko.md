# Marketplace 인벤토리 정리 — v2026.09.15.95

## 선택 기능과 사용자 이점

회원용 Marketplace 보유품 작업대에 안전한 읽기 전용 기능 두 가지를 추가한다. `미장착` 상태 필터와 `오래된 획득순` 정렬을 통해 현재 장착하지 않은 오래된 보유품을 빠르게 찾을 수 있다. 플레이어 간 이전, 판매 등록, 에스크로, 구매, 제작 정산 등 경제 mutation은 추가하지 않는다.

## 정합 기준선

- 애플리케이션 저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`.
- 개발 기준선: 현재 `main` SHA `a194cc220c8d8d2c6c2bf38146c0c654515b22b8`.
- 가장 최신의 겹치는 Marketplace 작업: 병합된 PR #313 / head `40b630b4d2f5bb185e7cc2f86035f75178d643e0`, 현재 `main`의 merge commit `a194cc220c8d8d2c6c2bf38146c0c654515b22b8`에 포함됨.
- PR 생성 직전 열린 Marketplace PR 검색 결과: 겹치는 열린 PR 없음.
- 인프라 저장소 `main`: 이번 회차에서 `a5f2006e99da6bbcf933b0123e970d3a37f794d9`로 확인.

## 브랜치 감사 분류

애플리케이션의 비-main 브랜치는 보수적으로 유지한다. Dependabot 브랜치는 활성 의존성 후보로 보고, 기존 기능/통합 브랜치는 고유 커밋 및 검증 가치가 없다는 점이 증명되기 전까지 보존한다. 이번 회차에서는 원격 브랜치 삭제 성공을 주장하지 않는다.

인프라 브랜치도 고유 작업이 없고 열린 PR이 의존하지 않는다는 점이 증명된 경우에만 삭제 대상으로 본다. `fix/wdmv-test-candidate-race-v2026.09.14.89`는 이전 감사에서 정리 후보였지만, 이번에 사용한 GitHub 커넥터 경로에는 원격 ref 삭제 기능이 없었고 승인된 원격 장비도 연결되지 않아 실제 삭제하지 못했다.

## 변경 파일

- `frontend/src/app/marketplace/marketplace.ts`
- `frontend/src/app/marketplace/marketplace.test.ts`
- `frontend/src/app/marketplace/page.tsx`
- 영문 작업 로그
- 본 한글 작업 로그

## 범위

- Frontend: 기존 서버 렌더링 Marketplace 작업대에 `미장착` 필터와 `오래된 획득순` 정렬 추가.
- Backend/API: 변경 없음. 권위 데이터는 계속 `GET /api/v1/shop/holdings`를 사용.
- DB/migration: 변경 없음.
- 경제 mutation: 없음.

## 검증 의도

후보 게이트는 secret scan, lint, typecheck, production build, frontend tests, 필요 시 전체 unit/integration/database 검사, GitHub CI를 유지한다. 날짜 정렬은 잘못된 획득 시각을 항상 마지막으로 보내 데이터 오류가 결과 순서를 깨뜨리지 않도록 방어한다.

## Test 및 배포 증거

작성 시점에는 GitHub에서 브랜치와 코드/테스트 커밋까지 생성했다. 정확한 최종 branch SHA의 CI와 immutable Test 후보 증거를 확인하기 전에는 병합하지 않는다. 격리 Test가 동일한 SHA를 실제 서비스하는 것도 직접 확인해야 한다. 직접 증거 없이 Test나 Production 성공을 주장하지 않는다.

## Production 증거

이번 회차에는 없음. exact-SHA 격리 Test 검증 전까지 Production 승격은 fail-closed다.

## 브랜치 정리

이번 회차에 원격 ref를 삭제하지 않았다. 승인된 원격 장비가 연결되지 않았고 현재 사용 가능한 GitHub 커넥터 액션에 삭제 가능한 branch-ref mutation이 없어 정리 후보를 blocker로 남겼다.

## 남은 위험 / blocker

- exact-SHA 격리 Test reconcile이 과거 GitOps desired state보다 뒤처진 사례가 있어 다시 직접 확인해야 한다.
- 이번 기능은 인벤토리 탐색만 개선한다. Marketplace/Crafting의 가치 변경 런타임은 원자적 server/database 계약이 구현될 때까지 의도적으로 비활성 상태다.

## 다음 최우선 미구현 항목

검증된 Marketplace 읽기 전용 탐색 작업 이후 Living Project Plan과 활성 브랜치를 다시 평가한다. 더 최신 P0/P1 겹치는 구현이 나타나지 않는다면 다음 주요 런타임 공백은 권위 Clubs/Community discovery/member-directory/capability 구현이다.
