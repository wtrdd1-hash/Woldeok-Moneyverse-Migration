# 종목별 조건부 알림 요약 — v2026.09.14.86

## 범위
- 기준선: 앱 main `460efaefa3faa0d5bee18bd3aa73760b409d5797` + 최신 관련 PR #290 head `c6fcaa1d50fb1c0e4f9653694b445031216219e2`.
- 사용자 효과: 종목 상세에서 해당 종목에 설정한 조건부 알림을 바로 확인하고, 종목 선택을 유지한 채 알림 관리 화면으로 이동할 수 있습니다.
- 런타임 범위: 프론트엔드만 변경하며 backend/API/DB 계약 변경은 없습니다.

## 동시 작업 확인
- 개발 전과 커밋 전에 최신 main 및 활성 PR head를 다시 확인했습니다.
- PR #290이 가장 최신의 겹치는 주식 알림 구현이라 그 위에 의도적으로 쌓았습니다.
- Dependabot PR은 별도 활성 의존성 작업으로 유지했습니다.
- Test 복구용 인프라 동시 작업은 별도로 확인했고 중복 구현하지 않았습니다.

## 검증
- `git diff --check`: PASS.
- `pnpm lint`: 오류 0, 기존 `no-img-element` 경고 11개.
- `pnpm typecheck`: PASS.
- frontend Vitest: 60 files / 578 tests PASS.
- frontend production build: PASS.

## 배포 상태
- 격리 Test exact-SHA 검증은 필수 게이트입니다. 공개 Test는 여전히 `2bb84e2b1272ee40c373aa9bd8ee89ab08b286ea`를 제공하지만 GitOps 선언은 `460efaefa3faa0d5bee18bd3aa73760b409d5797`입니다.
- 후보 SHA가 Test에서 실제 제공되고 검증되기 전에는 main 병합이나 Production 승격 완료를 주장하지 않습니다.
