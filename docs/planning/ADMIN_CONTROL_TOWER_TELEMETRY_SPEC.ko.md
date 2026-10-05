# 관리자 관제탑 실시간 운영 텔레메트리 및 경제 매트릭스 사양서

## 1. 개요 및 목적
- **목적**: Datadog, Stripe Dashboard, Toss Admin 수준의 종합 운영 지표 매트릭스 표(Comprehensive Operations & Economics Matrix)를 구축하여, 단일 관제탑 화면에서 플랫폼 유저 활동성, 통화량 건전성, 주식 시장 거래 심도, 5분위 자산 분배율을 실시간으로 직관적이고 정확하게 모니터링할 수 있도록 지원합니다.
- **적용 화면**:
  - 관리자 메인 관제탑 (`/admin`)
  - 회원 관리 및 부자 랭킹 디렉토리 (`/admin/users`)

---

## 2. 4대 핵심 매트릭스 지표 정의 및 산출 공식

### 2.1. 유저 코호트 & 리텐션 (User Cohort & Retention)
| 지표명 | 영문 표기 | 집계 기준 및 정의 | 수식 / 소스 | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| **1시간 활성 사용자** | HAU (Hourly Active Users) | 최근 60분 이내 `last_seen_at` 또는 `last_login_at` 활동 기록 보유 회원 | `now - last_seen <= 3,600,000ms` | 실시간 동시 접속자 수준 체감 지표 |
| **24시간 활성 사용자** | DAU (Daily Active Users) | 최근 24시간 이내 플랫폼 접속 및 활동 회원 | `now - last_seen <= 86,400,000ms` | 일간 순 활동자 수 |
| **7일 주간 활성 사용자** | WAU (Weekly Active Users) | 최근 7일(1주) 이내 접속 이력 회원 | `now - last_seen <= 604,800,000ms` | 주간 리텐션 기준선 |
| **30일 월간 활성 사용자** | MAU (Monthly Active Users) | 최근 30일 이내 플랫폼 방문 및 활동 회원 | `now - last_seen <= 2,592,000,000ms` | 핵심 월간 성장 지표 |
| **활동 고착도** | Stickiness Ratio | DAU / MAU 비율 (백분율) | `(DAU / MAU) * 100` | 글로벌 핀테크 표준 20% 이상 시 우수 |
| **금일 신규 가입자** | New Signups (24h) | 최근 24시간 이내 계정 생성 회원 | `now - created_at <= 86,400,000ms` | 신규 유입률 모니터링 |
| **휴면 계정** | Dormant Accounts | 마지막 활동 기록이 30일 초과된 유휴 회원 | `now - last_seen > 30일` 또는 기록 없음 | 리액티베이션 타깃 코호트 |

---

### 2.2. 통화량 및 유동성 지표 (Monetary Aggregates & Liquidity)
| 통화 분류 | 영문 표기 | 구성 항목 및 산출식 | 경제적 정의 |
| :--- | :--- | :--- | :--- |
| **M0 (협의 통화)** | Currency in Circulation | `∑(cash_balance)` | 유저들의 지갑 내 즉시 지출 가능한 순수 유동 현금 잔액 |
| **M1 (요구불 예금 포함)** | Narrow Money | `M0 + ∑(bank_balance)` | 중앙은행 및 시중은행 수시입출식 예금을 포함한 결제 통화량 |
| **국채 발행고** | Treasury Bonds | `∑(bond_balance)` | 유저가 보유한 만기 약정형 국채 잔액 |
| **주식 평가액** | Equity Evaluation | `∑(stock_eval)` | 전체 유저 보유 주식 잔고의 실시간 평가 합계 |
| **M2 (광의 통화)** | Broad Money | `M1 + 국채 + 주식평가액 (∑ total_net_worth)` | 가상 세계관 경제 내 유통되는 총 유동성 자산 규모 |
| **복식부기 건전성** | Ledger Integrity Health | `ReconciliationHealth.integrity.ok` 및 `balanceTotalDeltaAmount` | 발행 통화량과 계정 총액 간 대사 일치 여부 (오차 0건 검증) |

---

### 2.3. 가상 주식 시장 심도 및 거래 지표 (Market Depth & Trading)
| 시장 지표 | 영문 표기 | 산출 기준 | 운영 목적 |
| :--- | :--- | :--- | :--- |
| **총 상장 시가총액** | Total Market Capitalization | `∑(current_price * shares_outstanding)` | 전체 상장 종목의 자본 규모 합계 |
| **총 누적 체결 건수** | Cumulative Executed Trades | `∑(trades)` | 호가 매칭 엔진을 통해 완료된 체결 거래 총량 |
| **종목당 평균 체결량** | Average Trades per Stock | `총 체결 건수 / 상장 종목 수` | 종목 전반의 거래 활성도 분산도 검증 |
| **거래 활성 종목 수** | Active Trading Symbols | `active == true && !halt_status` | 정상 주문 접수 가능 종목 수 |
| **거래 정지 종목 수** | Halted / Circuit Symbols | `halt_status != null || !active` | 관리자 킬스위치 또는 시장 규제 발동 종목 |

---

### 2.4. 5분위 자산 분배율 (Quintile Wealth Distribution)
- **분위 분할 방식**: 전체 유저를 `total_net_worth` 내림차순 정렬 후 20%씩 균등 5분위 분할
  1. **5분위 (상위 20% 최상위층)**: 상위 0~20% 계층의 인원, 자산 합계, 평균 자산, 전체 자산 점유율(%)
  2. **4분위 (상위 20~40% 상위층)**: 상위 20~40% 계층
  3. **3분위 (중위 40~60% 중산층)**: 중간 40~60% 계층
  4. **2분위 (하위 20~40% 차상위층)**: 하위 20~40% 계층
  5. **1분위 (하위 20% 저소득층)**: 하위 0~20% 계층
- **5분위 배율 (Quintile Share Ratio)**: `5분위 평균 자산 / 1분위 평균 자산` (가상 세계 내 자산 양극화 및 인플레이션/디플레이션 정책 판단 근거)

---

## 3. UI/UX 및 기술 구현 표준
1. **고대비 모노스페이스 수치**: 금융 수치는 `font-mono tabular-nums`를 적용하여 폰트 폭 불일치로 인한 UI 흔들림 원천 차단.
2. **모바일 반응형 터치 규격**: 탭 전환 버튼 및 조작 요소는 `min-h-[44px] sm:min-h-9` 규격을 엄격히 준수하여 320px 모바일에서도 완벽한 터치 보장.
3. **가로 스크롤 테이블 래퍼**: `overflow-x-auto`를 기본 탑재하여 작은 모바일 뷰포트에서도 테이블 클리핑 없이 부드러운 가로 스크롤 제공.
4. **실제 데이터 바인딩**: 목(Mock) 데이터 없이 관리자 API의 `users`, `stocks`, `health`, `controls` 응답을 100% 실측 바인딩.
