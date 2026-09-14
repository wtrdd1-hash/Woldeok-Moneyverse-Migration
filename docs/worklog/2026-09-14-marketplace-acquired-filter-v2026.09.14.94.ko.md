# 마켓플레이스 최근 획득 필터 — v2026.09.14.94

## 선택 기능과 사용자 이점

로그인 회원용 Marketplace holdings 작업대에 최근 획득 기간 필터를 추가해, 향후 제작/거래 준비 시 새로 얻은 재료와 아이템을 빠르게 찾을 수 있게 했습니다.

## 기준선과 중복 작업 검토

- 개발 전 `main`: `b24788ca82d2a25d83c23ad44153357a2068fad9`.
- 가장 최신의 겹치는 Marketplace 작업: PR #312 head `3b0690e51d8dfbb17f95670e168d945e298d86c7`.
- `feat/marketplace-acquired-filter-v2026.09.14.94` 브랜치는 해당 head에서 직접 생성해 quantity/effect/rarity/inventory-discovery 작업을 보존했습니다.
- PR #311은 #312 아래의 통합 Test 후보이며 Dependabot 브랜치는 이 기능 영역과 겹치지 않습니다.

## 범위

Frontend 전용 변경입니다. Marketplace query 정규화/필터링과 `/marketplace` UI만 확장했습니다. 기존 `/api/v1/shop/holdings`가 authoritative source로 유지되며 backend/API/DB 계약 및 migration 변경은 없습니다.

## 변경 파일

- `frontend/src/app/marketplace/marketplace.ts`
- `frontend/src/app/marketplace/marketplace.test.ts`
- `frontend/src/app/marketplace/page.tsx`
- 이번 버전의 영문/한글 changelog 및 worklog

## 검증

- 최근 7일/30일 필터의 결정적 회귀 테스트를 추가했습니다.
- 잘못된 날짜와 미래 획득 시각이 최근 필터에서 제외되는 테스트를 추가했습니다.
- 승인된 Remote Desktop 장비가 오프라인이므로 이번 회차에는 로컬/원격 장비 검증을 실행할 수 없습니다.
- 최종 SHA의 GitHub CI가 실행 검증 경로이며, 완료 전에는 PASS로 주장하지 않습니다.

## 배포 근거

Test/Production 배포 완료를 주장하지 않습니다. 격리 Test가 정확한 후보 SHA를 실제로 서비스하고 backend/database smoke가 통과하기 전까지 Production은 fail-closed입니다.

## 브랜치 정리

원격 ref 삭제 성공을 주장하지 않습니다. 현재 GitHub 연결은 branch 삭제 기능을 노출하지 않고 승인된 원격 장비도 오프라인입니다. 통합이 증명된 infra 브랜치는 삭제 가능한 경로가 복구될 때까지 cleanup blocker입니다.

## 남은 위험 / 다음 우선순위

최근 획득 필터는 authoritative holdings의 획득 시각을 표시/필터 목적으로만 사용하며 소유권 자체를 결정하지 않습니다. 다음 고가치 작업은 서버/DB authoritative contract가 준비되는 범위에서 R1 listing quote + escrow로 전진하거나, Living Plan의 다른 P0/P1 미구현 런타임 공백을 진행하는 것입니다.
