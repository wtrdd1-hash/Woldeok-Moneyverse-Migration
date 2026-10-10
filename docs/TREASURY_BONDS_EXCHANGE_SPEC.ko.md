# 월덱 기획재정국채(KTB) 발행·유통 거래소 및 확정 쿠폰 이자 지급 시스템 상세 기획서 (v1.0)

> **v542 금리·시간 계약 차단:** `1년물=현실 24시간`은 게임시간 표시일 뿐 검증된 연환산 계약이 아니다. APR 4.5%와 시간당 0.051% 표기는 현실 365일 기준 서로 맞지 않는다. 게임시간 비율·공식·정밀도·실제 원장·재원·Test 검증 전 확정 쿠폰/원금 100% 보장 표현은 미승인이다. 부족분 자동 조폐 금지.

## 1. 배경 및 목적 (Background & Objectives)
- **배경**:
  - 월덱 머니버스는 중앙은행(MCB)과 조폐국(MMB), 국고 복리 국부펀드(ASWF), 국가투자공사(WSHC) 산하 공기업 체계를 구축하였으나, 국가의 가장 정밀한 재정 자금 조달 및 시중 통화 흡수 수단인 **국채(Treasury Bonds)** 발행 및 유통 시스템이 부재함.
  - 유저들은 주식(고위험/변동성)이나 은행 예금(단순 이자) 외에, **국고 재원 검증과 지급능력 시뮬레이션을 전제로 하는 가상 채권 자산**에 투자하여 매 주기 확정 이자(Coupon Yield)를 수취하는 선진 금융 상품을 요구함.
- **목적**:
  - 대한민국 기획재정부 국채(KTB - Korea Treasury Bonds) 및 미국 재무부(TreasuryDirect) 표준을 벤치마킹하여 1년물(단기), 3년물(중기), 5년물(장기) 국채 발행 체계 구축.
  - 국가(중앙국고 `VAULT_MAIN`)는 국채를 발행하여 유저 및 시장으로부터 자금을 조달(재정 확충)하고, 유저는 정기 확정 쿠폰 이자(연 4.5%~6.5% 수준의 시간당 확정 분할 이자)를 수령.
  - 만기 도달 시 실제 국고의 지급가능재원 범위와 명시된 부족 대응절차에 따라 상환하며, 만기 전에도 유저 간 2차 채권 유통 시장(Secondary Bond Market)에서 채권을 자유롭게 장내 매매 가능.
  - 관리자(`886478189520637992`)에게 국채 발행 및 이자 지급 등 핵심 국가 재정 이벤트를 디스코드 1:1 DM으로 실시간 보고.

---

## 2. 벤치마킹 레퍼런스 (Global References & Standards)
1. **대한민국 국채법 (국채전문유통시장 - KRX KTB Market)**:
   - 국채 발행 한도 국회(의회) 승인, 표면금리(Coupon Rate) 결정 체계, 이자소득 비과세/분리과세 표준.
2. **미국 재무부 TreasuryDirect & T-Bills/Notes/Bonds**:
   - 단기 재무부 증권(T-Bills: 1년 이내), 중기 국채(T-Notes: 2~10년), 장기 국채(T-Bonds: 20~30년) 체계.
   - 반기/분기 단위 확정 이자(Fixed Coupon Rate) 및 복리 재투자(Automatic Reinvestment) 옵션.
3. **영국 국채 길트(Gilts) 및 싱가포르 정부채(SGS)**:
   - 무위험 프리미엄(Risk-Free Rate) 기준점 확립 및 금융 시장 전체 금리의 앵커(Anchor) 역할 수행.

---

## 3. 핵심 아키텍처 및 데이터 흐름 (Architecture & Data Flow)

```mermaid
flowchart TD
    subgraph State["국가 재정 당국 (Ministry of Economy & Finance)"]
        Admin["관리자 콘솔 (/admin/bonds)"] -->|국채 발행 승인| Treasury["중앙 국고 (VAULT_MAIN)"]
        Treasury -->|자금 조달 (Bond Proceeds)| TreasuryVault["국고 금고 확충"]
    end

    subgraph BondMarket["국채 발행 및 유통 플랫폼 (/bonds)"]
        KTB1["KTB-01Y (단기 1년물 / 표면금리 4.5%)"]
        KTB3["KTB-03Y (중기 3년물 / 표면금리 5.2%)"]
        KTB5["KTB-05Y (장기 5년물 / 표면금리 6.5%)"]
    end

    subgraph UserInteraction["유저 참여 (Investors)"]
        User["일반 유저"] -->|국채 청약/매수| BondMarket
        BondMarket -->|확정 쿠폰 이자 지급| UserWallet["유저 덕지갑 (Wallet)"]
        BondMarket -->|2차 장내 매매| Secondary["유저 간 2차 채권 호가 거래소"]
    end

    subgraph Automation["자동화 및 알림 엔진"]
        HourlyCycle["1시간 주기 복리 엔진 (AutoSwfService)"] -->|쿠폰 이자 자동 정산| UserWallet
        HourlyCycle -->|만기 원금 자동 상환| UserWallet
        HourlyCycle -->|디스코드 1:1 DM| DiscordAdmin["관리자 (886478189520637992)"]
    end
```

---

## 4. 3대 표준 국채 스펙 (Bond Product Specifications)

| 채권 코드 | 명칭 | 만기 주기 (가상 시간) | 기준 표면금리 (연/시간 환산) | 최소 투자 단위 | 특성 및 목적 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **KTB-01Y** | 월덱 1년물 단기국채 | 24시간 (가상 1년) | 제안 연 4.5% (시간당 이율·게임시간 환산 검증 전 차단) | 10,000 WLD | 고유동성 단기 자금 운용, 초보 투자자 친화적 |
| **KTB-03Y** | 월덱 3년물 표준국채 | 72시간 (가상 3년) | 제안 연 5.2% (시간당 이율·게임시간 환산 검증 전 차단) | 50,000 WLD | 국가 기간망 확충 재원, 벤치마크 지표 채권 |
| **KTB-05Y** | 월덱 5년물 장기국채 | 120시간 (가상 5년) | 제안 연 6.5% (시간당 이율·게임시간 환산 검증 전 차단) | 100,000 WLD | 장기 안정 수익 보장, 연금형 포트폴리오 |

---

## 5. 데이터베이스 스키마 설계 (`packages/database/migrations/252-treasury-bonds-exchange-and-coupon-yields.sql`)

1. **`treasury_bonds` (국채 마스터 테이블)**:
   - `id`: UUID (PK)
   - `symbol`: TEXT UNIQUE (`KTB-01Y`, `KTB-03Y`, `KTB-05Y`)
   - `name`: TEXT
   - `maturity_hours`: INTEGER (만기 시간: 24, 72, 120)
   - `annual_coupon_rate_bps`: INTEGER (표면금리: 450 = 4.5%)
   - `hourly_coupon_rate_bps`: INTEGER (시간당 분할 금리: 5 = 0.05%)
   - `par_value_wld`: NUMERIC(20, 0) (액면가: 10,000 WLD)
   - `total_issued_units`: BIGINT (총 발행 좌수)
   - `available_units`: BIGINT (잔여 청약 좌수)
   - `total_funded_wld`: NUMERIC(20, 0) (총 조달 국고 자금)
   - `status`: TEXT (`OPEN_SUBSCRIPTION`, `TRADING`, `CLOSED`, `FROZEN`)
   - `description`: TEXT

2. **`treasury_bond_holdings` (유저 국채 보유 원장)**:
   - `id`: UUID (PK)
   - `user_id`: UUID (FK -> member_profiles.id)
   - `bond_id`: UUID (FK -> treasury_bonds.id)
   - `units`: BIGINT (보유 좌수)
   - `purchase_price_total_wld`: NUMERIC(20, 0)
   - `accrued_interest_wld`: NUMERIC(20, 0) (누적 수취 이자)
   - `purchased_at`: TIMESTAMPTZ
   - `maturity_at`: TIMESTAMPTZ (만기 일시)
   - `status`: TEXT (`HOLDING`, `MATURED`, `SOLD`)

3. **`treasury_bond_coupon_logs` (이자 지급 및 상환 감사 원장)**:
   - `id`: UUID (PK)
   - `holding_id`: UUID (FK -> treasury_bond_holdings.id)
   - `user_id`: UUID
   - `bond_id`: UUID
   - `event_type`: TEXT (`COUPON_INTEREST`, `MATURITY_REDEMPTION`, `EARLY_SELL`)
   - `amount_wld`: NUMERIC(20, 0)
   - `created_at`: TIMESTAMPTZ

4. **`treasury_bond_orders` (2차 장내 유통 매매 호가)**:
   - `id`: UUID (PK)
   - `seller_id`: UUID
   - `bond_id`: UUID
   - `units`: BIGINT
   - `unit_price_wld`: NUMERIC(20, 0)
   - `status`: TEXT (`ACTIVE`, `FILLED`, `CANCELLED`)
   - `created_at`: TIMESTAMPTZ

---

## 6. 백엔드 서비스 및 API 명세
- `GET /api/v1/bonds/markets`: 대국민 국채 종목 목록 및 금리/잔여좌수 실시간 조회.
- `GET /api/v1/bonds/my-holdings`: 내 보유 국채 목록, 누적 이자 수취액 및 만기 디데이 조회.
- `POST /api/v1/bonds/subscribe`: 국채 직접 청약 (덕지갑 출금 ➡️ 국채 보유 등록 ➡️ 중앙국고 입금).
- `POST /api/v1/bonds/claim-coupons`: 수동 쿠폰 이자 즉시 청구.
- `GET /api/v1/admin/bonds/overview`: 관리자 국채 발행 총액, 누적 이자 지급액, 조달 현황.
- `POST /api/v1/admin/bonds/issue`: 관리자 신규 국채 발행.
- `POST /api/v1/admin/bonds/distribute-coupons`: 관리자 전 유저 쿠폰 이자 일괄 지급 집행.
- `POST /api/v1/admin/bonds/freeze/:id`: 긴급 킬스위치 (거래/청약 동결).

---

## 7. 프론트엔드 UI/UX 설계
1. **대국민 국채 포털 (`/bonds`)**:
   - 상단: 국가 보증 AAA 무위험 국채 안내 배너 및 총 발행/이자 지급 지표.
   - 중앙: 1년/3년/5년물 3종 국채 청약 카드 (만기, 표면금리, 잔여 한도 바).
   - 하단 탭: [내 보유 채권 & 이자 수취 내역] / [2차 채권 유통 호가 마켓].
2. **관리자 국채 관제 타워 (`/admin/bonds`)**:
   - 국채 총 부채 및 조달 국고 텔레메트리, 표면금리 긴급 조정, 원클릭 이자 일괄 지급 트리거.
   - 디스코드 관리자(`886478189520637992`) DM 연동 상태 위젯.
3. **네비게이션 연동 (`navigation.ts`)**:
   - `CATEGORY_NAV` 금융·투자 카테고리에 **[국채 거래소 (KTB)]** (`/bonds`) 및 4개 국어 매핑 등록.
