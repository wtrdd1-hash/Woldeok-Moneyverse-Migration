# 국고 세금 재순환 및 공공 재정 지출·환원 상세 기획서 (TREASURY REDISTRIBUTION SPEC)

> 버전: v2026.10.01.483  
> 상태: 프로덕션 구현 및 운영 적용 명세  
> 기준일: 2026-10-01  
> 연계 문서: `docs/planning/ADMIN_TREASURY_MANAGEMENT_SPEC.ko.md`, `packages/database/migrations/224-admin-treasury-management.sql`

---

## 1. 배경 및 문제 정의

1. **세금 징수와 지출의 불균형 해소**:
   - 현재 월덕 머니버스 경제 시스템은 마켓플레이스 판매세(2%), 송금세, 주식 거래세(1%), 법인 소득세 등을 통해 중앙 국고(`VAULT_MAIN`)로 지속적인 세금 수입을 거두고 있습니다.
   - 그러나 거둬들인 국고가 사용자 및 가상경제 생태계로 환원되지 않고 금고에만 묶여 있을 경우, 통화 유통속도(Velocity of Money)가 급감하고 유저들의 체감 경제 활동 의욕이 저하되는 심각한 디플레이션 함정이 발생합니다.
2. **목표**:
   - "세금을 걷었으면 다시 공공의 이익과 시민의 후생으로 환원한다"는 건전한 재정 민주주의 원칙에 따라, 4대 공공 재정 지출 체계를 수립하고 이를 원자적 데이터베이스 트랜잭션 및 관리자 관제 타워 UI로 구현합니다.

---

## 2. 4대 복합 재정 지출 체계

| 지출 구분 (tx_type) | 수혜 대상 | 집행 방식 | 주요 목적 |
|---|---|---|---|
| **CITIZEN_DIVIDEND** (시민 보편 배당) | 최근 7일 활동 시민 전원 | 1인당 정액 균등 자동 입금 | 국고 잉여 세수 환원, 기본소득 보장, 접속 동기 부여 |
| **COMMUNITY_FUNDING** (공공 프로젝트) | 공공 프로젝트 제안자/에스크로 | 사업 단위 승인 집행 | 도시 인프라 확충, 커뮤니티 콘텐츠 활성화 |
| **WELFARE_SUBSIDY** (취약계층 복지) | 순자산 하위 30% 및 신규 시민 | 복지 심사 기반 보조금 | 빈부격차 완화, 신규 유입자 안착 및 파산 방지 |
| **MARKET_STIMULUS** (경기부양 유동성) | 시장 안정화 마켓 메이킹 | 긴급 유동성 투입 | 시장 거래 침체 극복, 금융 충격 완화 |

---

## 3. 재정 건전성 및 30% 안전 비축금 원칙 (Safe Reserve Invariant)

1. **30% 보호 비축금 (Protected Reserve)**:
   - 중앙 국고(`VAULT_MAIN`) 잔액의 **30%는 어떠한 경우에도 지출/환원할 수 없는 불가침 최소 준비금**으로 잠깁니다.
   - 허용 최대 지출액: `Max_Expenditure = Floor(Current_Balance * 0.7)`
   - 지출 요청 시 잔액이 부족하거나 30% 한도선을 침범할 경우, 데이터베이스 레벨에서 `EX_INSUFFICIENT_SAFE_RESERVE` 예외를 발생시키고 트랜잭션을 롤백합니다.
2. **비상 금고(`VAULT_EMERGENCY`)의 분리**:
   - 주식 거래정지 원가 환급용 5천만 WLD 비축금은 일반 재정 지출 대상에서 원천 배제됩니다.

---

## 4. 데이터베이스 및 원장 모델

### 4.1 신규 테이블: `treasury_disbursements`
```sql
CREATE TABLE public.treasury_disbursements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disbursement_type text NOT NULL, -- 'CITIZEN_DIVIDEND', 'COMMUNITY_FUNDING', 'WELFARE_SUBSIDY', 'MARKET_STIMULUS'
  total_amount_wld text NOT NULL,
  beneficiary_count integer NOT NULL DEFAULT 1,
  amount_per_beneficiary_wld text,
  admin_id uuid REFERENCES public.users(id),
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
```

### 4.2 원자적 프로시저: `treasury_disburse_citizen_dividend`
- 관리자 권한(`operator` 이상) 확인.
- 30% 비축금 침범 여부 엄격 검증.
- 최근 활동 시민 수 집계 후 각 유저의 `cash_balance`에 1인당 배당액 원자적 가산.
- `system_treasury_vaults` 잔액 차감.
- `system_treasury_ledger`에 `CITIZEN_DIVIDEND` 분개 기록.
- `treasury_disbursements`에 집행 감사 증거 생성.

---

## 5. 관리자 및 사용자 서피스 사양

1. **관리자 관제 타워 (`/admin/treasury`)**:
   - 지출 탭(`Expenditure`)에 **"국고 환원금 집행(배당/지원금)"** 다이얼로그 연동.
   - 실시간 가용 예산(전체 잔액 - 30% 비축금) 시각화.
   - 최근 24시간 / 7일 / 30일 국고 지출 실시간 통계 집계.
2. **사용자 화면 (`/wallet`, `/`)**:
   - 지갑 수령 내역에 '🏛️ 국고 환원 지원금 (시민 배당)' 표기.
   - 경제 투명성 대시보드를 통해 국고 총액과 시민 환원 누적액 공개.
