# 개발 B 작업 기록 — v2026.09.23.391

Base: `d7d2f030d23ec083bf7ba3d86d798347e7636b68`
Branch: `auto/hourly-b-business-boost-idempotency-v2026.09.23.391`

선택한 결함: `POST /businesses/:id/boost`가 멱등성 경계 없이 인벤토리 entitlement 1개를 소비했습니다. timeout 뒤 재시도하면 두 번째 아이템을 소비하고 부스트를 다시 연장/교체할 수 있었습니다.

구현: API DTO에서 UUID를 필수화하고 service/repository를 통해 PostgreSQL까지 전달합니다. migration 230은 비공개 command receipt와 직렬화된 payload-bound replay를 갖는 4-인자 `business_apply_boost`를 추가하며 기존 함수의 앱 실행 권한을 회수합니다.

검증: focused Vitest 1/1 PASS, backend TypeScript PASS, backend build PASS, 변경 파일 ESLint PASS, `git diff --check` PASS. 대표 선행 객체를 구성한 격리 PostgreSQL 16에서 migration 230 적용도 PASS했습니다. 전체 fresh-schema migration은 기존 migration 029의 role/table permission 설정 불일치에서 먼저 중단됐으므로 전체 real-PostgreSQL suite 성공으로 주장하지 않습니다.
