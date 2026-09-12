# v2026.09.13.1 — 사업체 정산 부스트 런타임 재통합

- 오래된 브랜치 이력을 다시 병합하지 않고 확인된 Business Settlement V2 부스트 런타임 수정만 최신 `main` 위에 재통합했습니다.
- 적용된 178번 마이그레이션은 수정하지 않고 후속 `179-business-settlement-v2-boost-runtime-fix.sql`을 추가했습니다.
- 활성 부스트 경로의 잘못된 SQL 구문을 올바른 `COALESCE(...)`로 수정하면서 멱등성, 소유권, 일일 정산, 원장, 이벤트 불변조건을 유지합니다.
- 활성/부분 배율/만료 부스트에 대한 실제 PostgreSQL 회귀 테스트를 복원했습니다.
- 명시적 레거시 파일을 제외한 신규 마이그레이션에서 잘못된 SQL construct 스키마 수식을 거부하는 테스트를 추가했습니다.
- 기준 main: `04ca71e95a5d1e63b0a7ef834aa5bd1ecbdef827`; 브랜치: `integrate/business-settlement-boost-v2026.09.13.1`.
- CI와 isolated Test exact-SHA 검증 전에는 Production으로 승격하지 않습니다.
