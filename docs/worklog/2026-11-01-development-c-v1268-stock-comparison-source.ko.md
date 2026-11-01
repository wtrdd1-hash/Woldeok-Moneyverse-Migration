# 개발 C v1268 — 가상 주식 비교 데이터 출처 검증

## 시작 / 작업 전 — 2026-11-01 18:13 KST
- Debian 13.6 미니PC 주요 서비스 7개 및 개발 PostgreSQL 연결 확인. 공유 서비스 변경 금지.
- 기준 main `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`; 독립 worktree/브랜치 `auto/hourly-c-stock-compare-truth-v1268-20261101-1813`. 기존 체크아웃의 미커밋 `implementation_plan.md` 보존.
- AGENTS, README 영문/국문, 통합기획 영문 정본/국문 보조, 활성 PR/CI, 개발 A/B/QA 확인. 관심종목 #2228, 시장 사건 #2293, 커뮤니티 #2351, 기획 #2355와 중복 변경 금지.
- 확인된 P1: `/stocks/compare`가 `/api/v1/stocks` 응답을 런타임 검증 없이 BigInt에 전달하여 오류/허위 가격 범위를 표시할 수 있음. 기존 Nest API와 PostgreSQL `stock_market_overview()` 조회 계약 재사용.
- 제한된 설계: UUID/종목 코드/정확한 가격·수량 문자열/일중 고저가/중복/최대 건수 검증, 미확인과 정상 빈 결과 구분, 접근 가능한 재조회, 모바일/키보드/스크린리더 및 noindex 유지. 테스트 선행 후 최소 수정.
- 원장·DB·인증·Android·API 쓰기 변경 없음. 필수 게이트 모두 PASS 전 운영배포 금지.

## 진행 중
- [ ] TDD 및 페이지 회귀검증
- [ ] 빌드/린트/타입/테스트/보안/계약/격리 PostgreSQL/E2E 검증
- [ ] main·기획 재조회, PR 검토, SHA/검증 결과 기록

## 종료
- 미완료. 릴리스 보류.
