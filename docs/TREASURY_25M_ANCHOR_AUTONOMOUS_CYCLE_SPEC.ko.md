# 머니버스 국고 2,500만 WLD 고정 앵커 & 자율 투자·회수·세금 순환 시스템 명세서 (v1.0)

> **v542 가정 변경:** 국고 잔액이 **항상 정확히 2,500만 WLD로 유지된다**는 문구는 보증·불변식이 아니다. 25M은 재원 조건이 충족될 때의 유동성 목표다. 재정 부족 시 지출 조정·기존 자산 회수·지급 유예/스트레스 상태로 처리하며 조폐 권한이 발생하지 않는다. 상세 경계는 v523/v542 우선.

## 1. 개요 및 배경

본 시스템은 월덕 머니버스(Woldeok Moneyverse)의 중앙 국고(`VAULT_MAIN`)를 **항상 25,000,000 WLD(2,500만 WLD)**로 정확히 수렴·고정 유지(Anchoring / Pegging)하고, 국고 자산의 무의미한 유휴 적체나 고갈을 방지하기 위한 **무인 자율 거시경제 순환 엔진(Autonomous Macroeconomic Engine)**이다.

초기 유저 유입 단계나 활동량이 적은 기간에도 경제 생태계가 정체되지 않고, 가상 우량 기업들의 영업 이익, 법인 거래 세수, 국부펀드(ASWF) 투자 포트폴리오의 평가 손익이 전자동으로 상호작용하여 국고 잔액이 늘지도 줄지도 않는 항등식을 완벽히 달성한다.

---

## 2. 글로벌 벤치마킹 및 금융 레퍼런스

### 1) 칠레 구리안정화기금 (Chile ESSF - Economic & Social Stabilization Fund)
- **원리**: 구리 가격 급등으로 국고 세수가 법정 기준선을 초과하면 초과액 전액을 국가안정기금으로 자동 이전하여 국채/글로벌 우량주에 분산 투자하고, 구리 가격 폭락이나 경기 침체로 국고가 기준선 미만으로 하락하면 기금에서 자동 인출하여 재정 결손을 메움.
- **적용**: 국고 잔액이 25,000,000 WLD를 초과하면 초과 잉여분을 100% 자동 투자하고, 25,000,000 WLD 미만으로 떨어지면 투자 자산에서 자동 회수(Liquidate / Harvest)하여 국고 잔액을 25,000,000 WLD로 복원.

### 2) 싱가포르 GIC / 테마섹(Temasek) 자산 리밸런싱 모델
- **원리**: 국가 자산 포트폴리오의 일정 비중을 상장 우량주(Equity)와 안전 채권(Bond)으로 다변화하고, 정기적으로 초과 수익을 국고 배당(NIRC: Net Investment Returns Contribution)으로 정부 예산에 편입.
- **적용**: 머니버스 4대 우량주(`WDX-TEC`, `WDX-FIN`, `WDX-BIO`, `WDX-RET`) 및 국채(Treasury Bonds)에 분산 투자하여 자산 가치를 보존하고 시세를 하방 지지.

### 3) 알래스카 영구기금 (Alaska Permanent Fund - APF)
- **원리**: 원금은 영구 보존(Inflation-Proofing)하고, 운용 수익의 일부를 전 주민에게 보편 기본소득 배당(Permanent Fund Dividend)으로 매년 균등 지급하여 지역 경제를 활성화.
- **적용**: 국고 잉여 투자 집행 시 일부(10~20%)를 최근 활동한 활성 시민들에게 실시간 보편 배당으로 환원하여 소비 진작.

---

## 3. 핵심 수학적 항등식 (Mathematical Invariant)

$$\Delta \text{Treasury}_{\text{Target}} = \text{Balance}(\text{VAULT\_MAIN}) - 25,000,000\text{ WLD}$$

### 시나리오 A: $\Delta \text{Treasury} > 0$ (국고 잉여: 2,500만 초과)
- **자동 투자 엔진 발동 (Autonomous Investment Cycle)**
- 잉여금 $S = \text{Balance} - 25,000,000$ 전액 집행:
  - $S \times 60\%$: 4대 섹터 WDX 대표주 시장 매수 (`WDX-TEC`, `WDX-FIN`, `WDX-BIO`, `WDX-RET`)
  - $S \times 30\%$: 국고 채권 안전 예치
  - $S \times 10\%$: 최근 활동 활성 시민 보편 기본소득 배당
- 결과: $\text{Balance}(\text{VAULT\_MAIN}) = 25,000,000\text{ WLD}$

### 시나리오 B: $\Delta \text{Treasury} < 0$ (국고 결손: 2,500만 미달)
- **자동 회수 & 자율 세수 징수 엔진 발동 (Autonomous Harvest & Tax Cycle)**
- 부족분 $D = 25,000,000 - \text{Balance}$:
  1. **1단계 (투자 자산 수익 실현/회수)**: 국부펀드가 보유한 평가이익 발생 주식 또는 보유 자산을 매각하여 국고로 회수 환원.
  2. **2단계 (자율 기업/시장 법인세 징수)**: 유저 부재 시에도 가상 상장 법인들의 매출 영업 이익 및 시장 유동성 풀에서 법인세 및 거래세를 징수하여 국고로 납입.
- 결과: $\text{Balance}(\text{VAULT\_MAIN}) = 25,000,000\text{ WLD}$

### 시나리오 C: $\Delta \text{Treasury} = 0$ (2,500만 완벽 유지)
- **균형 상태 (Steady-State Balanced Equilibrium)**
- 추가 이동 없이 포트폴리오 가치 및 시장 수익률 모니터링 수행.

---

## 4. 데이터베이스 및 스케줄러 아키텍처

- **테이블**: `public.system_treasury_vaults` (`code = 'VAULT_MAIN'`), `public.treasury_swf_configs`, `public.treasury_swf_portfolios`, `public.treasury_swf_events`
- **주기**: 매 1시간 주기 자동 스케줄러 실행 + 관리자 즉시 트리거 API (`POST /api/v1/admin/treasury/swf/rebalance`)
- **알림**: 디스코드 관리자(`886478189520637992`) 1:1 DM 및 감사 로그 채널로 투자/회수/세수 결과 즉시 보고.
