# 주식 거래 UI 고도화 & AI Council 정책 모니터링 통합 구현 계획서 (현재: v2)

## 📜 누적 버전 히스토리 (Version Changelog & Diffs)
- **v1**: 10개 종목 포트폴리오 도넛 차트, 10-Depth 호가창, AI Council 시나리오 심의 시뮬레이터 수립 (+104, -0)
- **v2**: 실시간 호가 틱 웹소켓 스트리밍 플래시 펄스 및 AI 뉴스 기반 시장 감성 지수(Greed & Fear) 게이지 위젯 누적 (+98, -0)

---

## 🏛️ [v1 Specification] 1차 기획 및 사양 (전수 보존)

### 1. 🎯 목표 및 배경
1. **주식 거래 UI 고도화**:
   - 10개 확장 가상 주식(CHIPS ~ SPACE)에 대한 5D/10D 호가창 비주얼라이저(매수/매도 압력 게이지, 스프레드 bps) 강화.
   - 포트폴리오 분석 페이지(`/stocks/portfolio`)에 10개 종목 자산 배분 도넛 차트, 종목별 손익 시각화 바 및 리스크/기대수익 지표 컴포넌트 탑재.
   - 주식 메인 허브(`/stocks`) 10개 종목 시세/호가 요약 렌더링 개선.
2. **AI Council 정책 반영 모니터링 & 시뮬레이터**:
   - 관리자 시나리오 랩(`/admin/economy/scenario-lab`)에 'AI Council 즉각 심의 시뮬레이터' 구축.
   - 인플레이션/디플레이션/통화 쇼크 시뮬레이션 시 듀얼 로컬 AI(Llama 3.2 3B & Gemma 3 1B) 위원회가 4대 도메인별 교차 심의 결과를 실시간으로 산출하고 정책 파라미터 조정안을 검증.
3. **무중단 배포 및 활성 세션 보존**:
   - 전체 1,760개 이상 단위/통합 테스트 100% PASS 검증 후 1,069개 PostgreSQL 활성 세션 100% 무손실 상태로 무중단 블루-그린 승격 (`v396`).

---

## 🚀 [v2 Specification] 2차 실시간 호가 틱 및 AI 뉴스 시장 감성 지수 위젯 사양 (누적 추가)

### 1. 실시간 호가 틱 웹소켓 스트리밍 & 플래시 펄스 애니메이션 (`stock-orderbook.tsx`)
- **웹소켓 연동**: `useQuote(stockId, { price: currentPrice, open: currentPrice })`를 결합하여 소켓 브로드캐스트 도착 시 호가창 가격 즉시 갱신.
- **플래시 펄스 인터랙션**:
  - 체결가 상승 시: `bg-emerald-500/20 text-emerald-400 border-emerald-500/40` 600ms 하이라이트 발광.
  - 체결가 하락 시: `bg-rose-500/20 text-rose-400 border-rose-500/40` 600ms 하이라이트 발광.
  - 5D/10D 호가 각 단계별 가격/잔량 및 매수/매도 압력 비율 바 실시간 유기적 재계산.

### 2. AI 뉴스 기반 시장 감성 지수 위젯 (`market-sentiment-gauge.tsx`)
- **시장 탐욕/공포 (Greed & Fear) 지수 알고리즘**:
  - 활성 AI 뉴스 이벤트(`MarketEvent[]`)의 호재(`direction === 'up'`)와 악재(`direction === 'down'`)의 가중치(`strength` 1~3)를 합산하여 0~100점 감성 점수 도출.
  - 0~25: 극단적 공포(Extreme Fear, Rose) / 26~45: 공포(Fear, Amber) / 46~55: 중립(Neutral, Zinc) / 56~75: 탐욕(Greed, Emerald) / 76~100: 극단적 탐욕(Extreme Greed, Cyan).
- **10대 종목별 감성 분포 바 & 뉴스 인사이트 요약 스트립**:
  - 10개 종목별 호재/악재 뉴스 수치 및 시장 센티멘트 시각화.
  - 거래소 메인 페이지(`/stocks`)에 핀테크 카드 형태로 배치.

---

## 📋 [Integrated Final Spec & Action Plan] 최종 통합 구현 명세

### Proposed Changes (파일별 상세 변경점)
1. **[NEW] `frontend/src/app/stocks/market-sentiment-gauge.tsx`**:
   - 0~100점 시장 탐욕/공포 게이지, 10개 종목별 감성 바, 최신 AI 뉴스 센티멘트 요약 컴포넌트.
2. **[MODIFY] `frontend/src/app/stocks/[symbol]/stock-orderbook.tsx`**:
   - `stockId` prop 추가, `useQuote` 훅 결합, 가격 변동 감지 및 600ms 플래시 펄스 애니메이션 구현.
3. **[MODIFY] `frontend/src/app/stocks/[symbol]/page.tsx`**:
   - `StockOrderbook` 호출부에 `stockId={stock.id}` 전달.
4. **[MODIFY] `frontend/src/app/stocks/page.tsx`**:
   - 거래소 메인에 `MarketSentimentGauge` 위젯 통합 렌더링.

### Verification Plan
- 프론트엔드/백엔드 전체 단위 테스트 실행 (`pnpm test`).
- Turbopack 프로덕션 빌드 (`pnpm build`).
- 블루-그린 무중단 배포 (`stage_v397.sh`, `promote_v397.sh`) 및 1,068개 세션 무손실 상태 확인.
