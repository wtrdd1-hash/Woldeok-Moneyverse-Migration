# 주식 거래정지 매수원가 자동정산 엔진 완비, 카탈로그 가시성 복구 및 포트폴리오 영수증 연동 (v2026.09.22.357)

- **작성일자**: 2026-09-22 19:25 KST
- **릴리스 버전**: `v2026.09.22.357`
- **배포 릴리스 경로**: `/srv/moneyverse-data/releases/prod-2ec47a9-v357`
- **Exact Git SHA**: `2ec47a970dc0e1513b49bed9cca50a582b2e8319` (단축: `2ec47a9`)
- **보존 활성 세션**: PostgreSQL 933개 세션 100% 무손실 보존
- **적용 스킬**: `admin-control-tower-craft`, `fintech-responsive-layout-engine`, `anti-ai-frontend-craftsmanship`

---

## 1. 개요 및 배경

본 릴리스는 `STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC.ko.md` 및 `PROJECT_PLAN.ko.md` 상의 P0 필수 과업인 "거래정지 종목의 매수원가 권위 자동정산 및 사용자 투명성"을 완결한 릴리스입니다.

이전 버전에서는 백엔드의 정산 로직이 구축되었음에도 불구하고:
1. 데이터베이스 함수 `stock_market_overview()`가 `WHERE stock.active`로 필터링되어 있어 거래정지(`active = false`)된 종목이 카탈로그에서 완전히 사라져 종목 상세 페이지(`/stocks/[symbol]`) 진입 시 404가 발생하는 치명적인 결함이 존재했습니다.
2. 포트폴리오 화면(`/stocks/portfolio`)에서는 정산된 주식이 보유 목록에서 단순 제거되어, 사용자가 자신의 주식이 왜 사라졌는지, 얼마가 환급되었는지 알 수 없는 정보 단절이 발생했습니다.
3. 거래소 메인 화면(`/stocks`)에서 거래정지 상태에 대한 시각적 안내가 없어 사용자가 주문을 시도하다 오류를 겪을 위험이 있었습니다.

본 릴리스는 229 데이터베이스 마이그레이션과 프론트엔드 전반의 가시성 개선을 통해 이 모든 단절을 완벽하게 해소하였습니다.

---

## 2. 핵심 구현 내역

### ① PostgreSQL 229 마이그레이션 (`packages/database/migrations/229-stock-market-overview-halt-visibility.sql`)
- **`stock_market_overview()` 함수 반환 컬럼 확장**:
  - `halt_status text` 컬럼을 명시적으로 추가하여 실시간 거래정지 상태를 함께 반환.
- **카탈로그 필터링 정책 개편**:
  - `WHERE stock.active OR stock.halt_status IN ('HALTING', 'HALTED_SETTLING', 'HALTED_SETTLED')`
  - 거래정지 종목도 카탈로그 조회에 안전하게 포함되도록 허용하여 종목 허브 404 원천 차단.
- **정렬 규칙 최적화**:
  - 정상 거래 중인 활성 종목이 상단에 우선 노출되고, 정산 완료된 거래정지 종목은 목록 하단에 질서정연하게 배치.

### ② 백엔드 저장소 및 인터페이스 갱신 (`backend/src/stock/`)
- `StockMarketRow` 인터페이스에 `halt_status: string` 필드 추가.
- `PostgresStockRepository.list()` 쿼리에서 `coalesce(halt_status, 'ACTIVE') AS halt_status` 바인딩.
- `stock-halt-settlement.test.ts`에 카탈로그 가시성 및 쿼리 정합성 단위 테스트 추가 (6종 단위 테스트 100% PASS).

### ③ 가상 주식 거래소 메인 화면 쇄신 (`frontend/src/app/stocks/page.tsx`)
- **거래정지 배지 표기**:
  - 종목 카드 헤더 심볼 옆에 `거래정지 (Halted)` Rose/Red 배지를 명확히 부착.
- **안전 거래 가드 (Safety Guard)**:
  - 거래정지된 종목에 대해 매수/매도 `TradeDialog` 버튼을 숨기고 비활성화된 `거래정지 (정산완료)` 버튼 배치.
  - 불필요한 주문 실패 네트워크 트래픽을 원천 차단하고 `종목 허브` 링크를 통해 상세 정산 내역으로 유도.

### ④ 포트폴리오 분석 화면 원가환급 영수증 카드 신설 (`frontend/src/app/stocks/portfolio/page.tsx`)
- **`/api/v1/stocks/halt-receipts` 병렬 연동**:
  - 사용자가 보유했던 종목의 불변 원가환급 영수증을 즉시 조회.
- **`HaltReceiptsCard` 핀테크 컴포넌트 탑재**:
  - `ShieldCheck` 아이콘과 함께 "서버 권위 매수원가 100% 자동환급 (수수료/세금 전액 면제)" 명세 안내.
  - 종목명, 심볼, 정산 수량, 취득 단가 WLD, 최종 환급 총액 WLD, 정산 일시 및 종목 허브 딥링크 카드형 그리드 제공.
  - 활성 보유 주식이 0개인 상태에서도 영수증이 존재하면 안전하게 노출되도록 화면 분기 최적화.

### ⑤ 종목 상세 화면(`/stocks/[symbol]`) 404 결함 해소
- 거래정지된 종목으로 접근 시 정상적으로 종목 메타데이터가 로드되며, 상단에 거래정지 공시 배너와 개별 원가환급 영수증 카드가 완벽하게 렌더링되도록 복구 완료.

---

## 3. 단위 테스트 및 정합성 검증

- **백엔드 테스트**: `backend/src/stock/stock-halt-settlement.test.ts` (6 tests PASS)
- **프론트엔드 테스트**:
  - `frontend/src/app/stocks/portfolio/analysis.test.ts` (4 tests PASS)
  - `frontend/src/app/stocks/[symbol]/stock-trading-console.test.ts` (6 tests PASS)
- **전체 실행 결과**: 16개 테스트 케이스 100% PASS.

---

## 4. 무중단 릴리즈 승격 및 런타임 신원 일치

1. **Exact-SHA 빌드 및 스테이징**:
   - 로컬 및 미니 PC 커밋 `2ec47a9` 일체화.
   - Turbopack Next.js 및 NestJS 프로덕션 빌드 성공.
2. **무중단 승격 프로모션 (`/home/debian/stage_v357.sh`)**:
   - `test-2ec47a9-v357` 및 `prod-2ec47a9-v357` 무중단 전환.
   - 런타임 신원 검증:
     - `https://test.easy-scraping.com`: backend=`2ec47a9...`, frontend=`2ec47a9...`
     - `https://easy-scraping.com`: backend=`2ec47a9...`, frontend=`2ec47a9...`
   - 전체 엔드포인트 HTTP 200 OK 응답 확인.
   - **PostgreSQL 933개 활성 사용자 세션 100% 무손실 보존 실측 확인**.
