# 가상 주식 메인 주문 폼 프리셋 & 실시간 세금 계산 및 포트폴리오 자산 배분 스택 바 (v2026.09.22.356)

- **작성일자**: 2026-09-22 19:00 KST
- **릴리스 버전**: `v2026.09.22.356`
- **배포 릴리스 경로**: `/srv/moneyverse-data/releases/prod-7e46b22-v356`
- **Exact Git SHA**: `7e46b22296ace8f9ecea55f5d649373927d66506` (단축: `7e46b22`)
- **보존 활성 세션**: PostgreSQL 929개 세션 100% 무손실 보존
- **적용 스킬**: `fintech-responsive-layout-engine`, `anti-ai-frontend-craftsmanship`, `admin-control-tower-craft`

---

## 1. 개요 및 배경

본 릴리스는 `VIRTUAL_STOCK_EXCHANGE_SPEC.ko.md` 및 `PROJECT_PLAN.ko.md` 상의 P0 필수 과업인 주식 메인 주문 폼의 조작 편의성 혁신과 포트폴리오(`/stocks/portfolio`) 자산 배분 시각화를 완성한 릴리스입니다.

직전 v355에서 종목 상세 페이지(`/stocks/[symbol]`)의 10D 호가창 및 트레이딩 콘솔을 완료한 데 이어, 본 버전에서는:
1. 주식 메인 페이지 및 포트폴리오 곳곳에서 팝업되는 공통 주문 다이얼로그(`TradeDialog`, `TradeForm`)에 토스/로빈후드 스타일의 터치 친화적 퀵 프리셋과 실시간 세금 계산 카드를 구축하였으며,
2. 포트폴리오 분석 페이지(`/stocks/portfolio`)에 다채로운 8색 팔레트 기반 멀티 세그먼트 자산 배분 가로형 스택 바, 종목별 수익률 배지, 원터치 리밸런싱 주문 트리거를 완비하였습니다.

---

## 2. 핵심 구현 내역

### ① 주식 메인 주문 다이얼로그/폼 사용성 혁신 (`trade-form.tsx` & `trade-dialog.tsx`)
- **44px 이상 터치 타깃 및 퀵 퍼센티지 프리셋 칩**:
  - `25%`, `50%`, `MAX` 칩 버튼을 제공하여 모바일에서도 오타 없이 원터치로 주문 수량을 산출 가능.
  - 매수 주문 시: 현재 사용자의 보유 현금 잔액을 기준으로 최대 매수 가능 수량 환산.
  - 매도 주문 시: 해당 종목의 보유 주식 수량(`holdingQuantity`)을 기준으로 퍼센티지 환산.
- **실시간 거래 대금 및 세금 계산 카드 (`TaxBreakdown`)**:
  - 주문 수량과 단가 입력 시 예상 체결 총액(`quantity × price`) 실시간 계산.
  - 주식 거래세(0.3%) 및 실수령액/최종 결제액 명세 투명하게 시각화.
- **`TradeDialog` 커스텀 트리거 확장**:
  - `holdingQuantity`, `triggerLabel`, `triggerVariant`, `triggerClassName` 속성을 추가 지원하여 포트폴리오나 종목 목록 등 다양한 UI 환경에서 원터치 주문 모달을 자연스럽게 렌더링.

### ② 포트폴리오 분석 로직 및 BigInt 안전 연산 (`analysis.ts`)
- **종목별 및 전체 포트폴리오 수익률 Bps 산출**:
  - BigInt 연산 `(gainLoss * 10_000n) / costBasis`을 적용하여 대규모 통화 단위에서도 부동소수점 오차 없는 고정밀 베이시스 포인트(Bps) 산출.
- **8색 고유 컬러 팔레트 매핑**:
  - Emerald, Sky, Violet, Amber, Rose, Indigo, Teal, Orange 8색 팔레트를 모듈로 인덱싱하여 각 종목별로 시각적으로 구분되는 고유 테마 색상을 자동 할당.
- **자산 비중 계산**:
  - 총 평가 금액 대비 각 종목의 비중 백분율을 안전하게 도출하여 스택 바 렌더링 지원.

### ③ 포트폴리오 인터페이스 및 시각화 전면 개편 (`portfolio/page.tsx`)
- **3대 히어로 지표 카드**:
  1. 총 평가 자산 (Total Valuation)
  2. 총 투자 원금 (Total Cost Basis)
  3. 누적 평가 손익 (Cumulative Gain/Loss) 및 실시간 Bps 배지 (플러스 시 Green/Emerald, 마이너스 시 Red/Rose)
- **멀티 세그먼트 자산 배분 가로형 스택 바**:
  - 보유 종목들의 자산 비중에 비례하여 연속된 가로 바를 렌더링.
  - 각 세그먼트 호버 시 종목명, 평가액, 비중 툴팁 안내.
  - 하단에 색상 도트가 포함된 레전드 칩 제공.
- **원터치 리밸런싱 트리거**:
  - 보유 종목 테이블 각 행에 `추가 매수(Buy More)` 및 `익절/손절 매도(Sell)` `TradeDialog` 버튼을 직관적으로 배치하여 즉시 리밸런싱 주문 연동.

---

## 3. 단위 테스트 및 정합성 검증

- **테스트 파일**: `frontend/src/app/stocks/portfolio/analysis.test.ts`
- **검증 항목**:
  1. 포트폴리오 평가액 및 비중 계산 정합성
  2. 양수 수익률에 대한 `gain_loss_bps` 정확도 (+2000 bps)
  3. 음수 손실률에 대한 `gain_loss_bps` 정확도 (-2000 bps)
  4. 8색 팔레트 색상 분배 및 비어있는 포트폴리오 방어 로직
- **실행 결과**: 4개 테스트 케이스 100% PASS
- **기존 테스트 연동 검증**: `stock-trading-console.test.ts` 6개 테스트 포함 총 10개 프론트엔드 단위 테스트 100% PASS

---

## 4. 무중단 릴리즈 승격 및 런타임 신원 일치

1. **빌드 및 릴리즈 준비**:
   - 로컬 작업 브랜치 커밋 및 원격 `origin/main` 푸시 완료 (`7e46b22`).
   - 미니 PC 워크트리 pull 및 Next.js Turbopack 빌드 성공.
2. **무중단 승격 프로모션 (`/home/debian/stage_v356.sh`)**:
   - `test-7e46b22-v356` 및 `prod-7e46b22-v356` 무중단 심링크 전환.
   - 테스트 및 프로덕션 서비스 런타임 신원 일치 검증:
     - `https://test.easy-scraping.com`: backend=`7e46b22...`, frontend=`7e46b22...`
     - `https://easy-scraping.com`: backend=`7e46b22...`, frontend=`7e46b22...`
   - 전체 엔드포인트 HTTP 200 OK 응답 확인.
   - **PostgreSQL 929개 활성 사용자 세션 100% 무손실 보존 실측 확인**.
