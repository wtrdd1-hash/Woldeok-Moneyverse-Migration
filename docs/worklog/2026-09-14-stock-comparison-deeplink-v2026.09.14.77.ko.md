# 작업 기록 — 종목 비교 딥링크 v2026.09.14.77

## 기준선 및 중복 검토
- 시작 시 앱 최신 main: `25844d21c862e06eed1018fb9ba897e4746c4ddd`.
- 가장 최신의 관련 주식 작업: PR #279 / `feat/stock-discussion-compose-v2026.09.14.76`, SHA `1bcd4d1577058780c2c858efc02d1f53ff626e70`.
- PR #279에는 PR #277 종목 상세 허브와 비교 진입 링크가 이미 포함되어 있어 최신 송신 경로와 비교 화면 수신 경로를 맞추기 위해 #279를 기준으로 시작했습니다.
- PR #278은 인증/이메일 인증 영역으로 이번 주식 비교 변경과 겹치지 않습니다.
- `feature/app-auth-simplify-v2026.09.13.48`은 main보다 오래됐고 최신 인증 작업과 겹치므로 이번 작업에 통합하지 않았습니다.
- 로컬의 수정 중인 `fix/mobile-profile-api-contract-v2026.09.14.75` 작업 트리는 건드리지 않고 보존했습니다.

## 사용자 효과
종목 상세에서 비교 화면으로 이동할 때 해당 종목 선택을 유지하여 다시 종목을 찾는 단계를 없애고 상세 → 비교 흐름을 자연스럽게 연결합니다.

## 범위
- 프론트엔드: 비교 쿼리 파싱, 현재 서버 종목 목록 기준 심볼 검증, 초기 선택, 회귀 테스트.
- 백엔드/API/DB 스키마 변경 없음.
- Living Project Plan 영문/한글 동기화.

## 릴리스 게이트
부모 주식 작업을 최신 main과 조정하고 이 후보 SHA의 CI 및 격리 Test exact-SHA 검증이 통과하기 전에는 main에 병합하지 않습니다.

## 검증
- `scripts/check-secrets.sh`: 통과.
- `pnpm test`: 통과 — contract 23, database 7, backend 852 통과 / DB 환경 필요 353건 skip, frontend 554 통과.
- `pnpm lint`: 오류 0건, 기존 `no-img-element` 경고 11건으로 통과.
- `pnpm typecheck`: 통과.
- `pnpm build`: 통과, `/stocks/compare` 및 `/stocks/[symbol]` 빌드 확인.
- migration parity 테스트: 통과. 이번 프론트엔드 변경은 신규 migration이 없습니다.
