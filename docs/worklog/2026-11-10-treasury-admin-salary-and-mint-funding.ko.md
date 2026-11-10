# 국고 관리자 임금 지급, 조폐국 화폐발행 국고 충전 및 피구세 복지 격리 작업 일지

> **작업일자**: 2026-11-10  
> **상태**: 구현 및 프로덕션 DB 적용/검증 완료 (VERIFIED)  
> **관련 마이그레이션**: `packages/database/migrations/346-treasury-admin-salary-and-mint-topup.sql`  
> **관련 백엔드 모듈**: `backend/src/admin/treasury/`, `backend/src/auth/admin-channel-otp.service.ts`, `backend/src/scheduler/`

---

## 1. 추진 배경 및 사용자 요구사항
1. **국고 관리자 임금(Admin Salary) 지급 기능 신설**:
   - 운영진/관리자의 기여에 대해 국고(`VAULT_MAIN`)에서 복식부기(`TREASURY` → `USER_CASH`)로 안전하게 정기 임금을 지급하는 기능 요구.
   - 국고 30% 불가침 안전 비축금(Safe Reserve Invariant) 침범 방지 가드 필수.
2. **조폐국(Mint) 화폐발행 국고 직행 충전(Top-up) 기능 활성화**:
   - 비상 유동성 부족 또는 대규모 공공사업 집행 시, 조폐국에서 공식 승인된 통화정책 발행(`TREASURY_ISSUANCE`)을 통해 국고 잔액을 즉각 채우는 단일 트랜잭션 함수 구축.
3. **카지노 고액 베팅 도박 중독 방지 교정세(1%) 실시간 복지 금고 격리**:
   - 10만 WLD 이상 베팅 발생 시 1%를 일반 국고가 아닌 `VAULT_WELFARE`로 즉시 원천징수 직행 격리하는 트리거 연결.
4. **관리자 2FA 채널 OTP (텔레그램 & 디스코드) 인증 및 국민연금 스케줄러 등록**:
   - 6자리 일회용 코드를 텔레그램과 디스코드로 동시 푸시 발송하는 단일 소모성 인증 서비스 구축.
   - 국민연금 1시간 주기 자동 기초연금 지급 작업(`pension.hourly_payout_sweep`) 스케줄러 등록.

---

## 2. 세부 구현 내역

### 2.1 데이터베이스 계층 (`packages/database/migrations/346-treasury-admin-salary-and-mint-topup.sql`)
1. **`treasury_admin_salaries` 테이블 신설**:
   - 관리자 임금 지급 내역, 대상 관리자 ID, 지급 집행자 ID, 사유, 복식부기 전표 ID(`ledger_transaction_id`)를 불변 기록.
2. **`treasury_disburse_admin_salary(p_actor, p_target_admin, p_amount, p_reason)` 함수**:
   - 관리자 권한 및 수령인 역할 검증.
   - `VAULT_MAIN`의 30% 불가침 안전 비축금(`EX_INSUFFICIENT_SAFE_RESERVE`) 검증.
   - `economy_post_transaction`을 통한 정본 복식부기 전표 발행 및 감사 로그 기록.
3. **`admin_treasury_topup_from_mint_direct(p_actor, p_amount, p_reason, p_request_key)` 함수**:
   - 조폐국 승인 발령 주문(`monetary_policy_orders`) 자동 생성 후 `admin_monetary_mint_to_treasury`를 단일 트랜잭션으로 완결 집행.
4. **`trigger_casino_pigouvian_welfare_tax` 트리거**:
   - `virtual_casino_dice_plays`의 `stake_amount >= 100000` 감지 시 1%를 `VAULT_WELFARE`로 즉각 원천 분개.

### 2.2 백엔드 계층 (`backend/src/`)
- `AdminChannelOtpService`: 텔레그램/디스코드 푸시 발송 및 `timingSafeEqual` 1회용 소모 검증.
- `TreasuryRepository` & `TreasuryService`:
  - `disburseAdminSalary`: 관리자 임금 지급 비즈니스 로직 및 텔레그램 알림 디스패치.
  - `topupFromMintDirect`: 조폐국 직행 충전 비즈니스 로직 및 멱등키 검증.
- `AdminTreasuryController`:
  - `POST /api/v1/admin/treasury/salary/disburse`
  - `POST /api/v1/admin/treasury/mint-topup`
- `Scheduler`:
  - `pension.hourly_payout_sweep`: 매시간 20분마다 은퇴자 기초연금 자동 일괄 분개 집행.

---

## 3. 검증 결과 (Verification Results)
- **단위/통합 테스트**:
  - `treasury.service.test.ts`: 관리자 임금 및 조폐국 충전 위임 검증 포함 **20건 전수 통과**.
  - `admin-channel-otp.service.test.ts`: OTP 생성/발송/검증/1회용 파기 **3건 전수 통과**.
  - `national-pension` 모듈: 연금 적립, 티어링, 중도 해지, 일괄 지급 **71건 전수 통과**.
  - `scheduler`: 1시간 주기 연금 지급 배치 정합성 포함 **16건 전수 통과**.
- **DB DDL 적용**:
  - `woldeok-moneyverse-dev-db-1` 컨테이너 내 346 마이그레이션 정상 적용 완료.
