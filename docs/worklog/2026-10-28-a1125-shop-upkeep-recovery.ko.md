# 개발 A 11:25 — 상점 관리비 확인 기능 복구

- P0 대량 PR 종료 사고 #1663으로 미병합 종료된 PR #1636(커밋 `594b51ede1b921e43cc5b282113c1f7824d0b6a0`)의 기능을 최신 main `a28bed9aa40ff74d492824ae12892a7d52132fdd`에서 새 독립 브랜치 `auto/hourly-a-shop-upkeep-recovery-20261028-1125`로 복구했다.
- 회원 전용 `GET /api/v1/shop/holdings?status=attention`, 웹 상점 관리비 필터, Android app-api 비캐시 처리, 회귀테스트를 복구했다. 기존 PostgreSQL `shop_my_items_v2(actor)` 함수를 재사용하며 DB 마이그레이션, 금융 원장, 구매 및 정산 처리 변경은 없다.
- TDD: 새 main에 복구 테스트만 먼저 추가해 실패를 확인하고 구현 후 Backend 5건, Frontend 29건 집중 테스트가 통과했다. 게이트웨이 충돌 해결 시 최신 개인정보 `noindex`·`no-store` 정책과 상점 비캐시 정책을 모두 보존했다.
- AGENTS.md, README, 영문/국문 기획서, 통합기획서, QA, 열린 PR, CI 및 최신 main을 확인했다. 다른 개발자 작업공간은 수정하지 않았다.
- 변경 파일과 최종 SHA, CI, 브랜치·PR 개수, Test/Production 및 롤백 여부는 QA·Release 보고서와 서버 증거 `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-28-1125/`에 기록한다. 기존 미통합 커밋과 사고 복구 참조 352개는 보존한다.
