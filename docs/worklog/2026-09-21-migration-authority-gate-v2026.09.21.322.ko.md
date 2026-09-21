# 마이그레이션 권위 게이트 — v2026.09.21.322

- 브랜치: `auto/hourly-b-migration-authority-v2026.09.21.322`
- 기준: `2bb035b9a9337623a5478b1bbdb914fc83827c7e`
- P0: Production migration runner가 repository↔database 역방향 parity도 강제하도록 보강했습니다.
- 이제 `schema_migrations`에 현재 exact checkout에 없는 파일명이 있으면 `migrate.sh`가 fail-closed하며, 경로 형태의 비정상 migration 이름도 거부합니다.
- 격리 복구 훈련에서 발견된 `221-stock-halt-cost-basis-settlement.sql`처럼 DB가 repository보다 앞선 상태가 migration gate를 조용히 통과하던 release 구멍을 차단합니다.
- 기존 checksum 불변성과 제한적으로 문서화된 013→016 historical reconciliation은 변경하지 않았습니다.
- DB migration 기록을 삭제·이름변경·재작성하지 않았으며, 미확인 221 lineage는 별도 reconciliation blocker로 유지합니다.
