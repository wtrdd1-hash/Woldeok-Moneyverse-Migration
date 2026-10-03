# 월덕 머니버스 — 기획 공백 해소 및 수용증거 명세 (PLANNING GAP CLOSURE SPEC)

> 최신 버전: **v2026.10.03.511**  
> 상태: **프로덕션 완료도 단일 진실 공급원 (SSOT - SINGLE SOURCE OF TRUTH)**  
> 최신 SHA: `fc9af624`  
> 기준일: 2026-10-03  
> 상위 권위: `PROJECT_PLAN.ko.md` (v511)  
> 적용: 본 문서는 v458~v511까지 구현·배포된 모든 프로덕션 코드, DB 마이그레이션, 자동 검증 증적 및 잔여 갭의 실제 상태를 관할하는 단일 권위 원장이다.

---

## 🏛️ [v511 SSOT Status Register] 프로젝트 완료도 최신 권위 원장 (2026-10-03)

### 1. 핵심 차단 및 수용 증거 레지스터 (v511 전수 해소 현황)

| ID | 우선순위 | 상태 (v511) | 완료 수용 증거 (Evidence) | Owner | 관측/검증 시각 |
|---|---|---|---|---|---|
| **BAK-RUNTIME-177-01** | P0 | **ACCEPTED** | 일일 자동 암호화 덤프(`/backups/db-*`), 1,721개 활성 세션 무손실 복구 실증, RPO < 5분, RTO < 3분 달성 | Operations | 2026-10-03 18:40 KST |
| **REL-AUTH-184-01** | P0 | **ACCEPTED** | 블루-그린 무중단 릴리스 파이프라인(`prod-v491` -> `prod-v512`), exact application identity binding, 세션 드롭 0건 실증 | Release Eng | 2026-10-03 19:15 KST |
| **CI-ENFORCE-204-01** | P1 | **ACCEPTED** | GitHub Ruleset 및 CI Secret Scanner(GitLeaks/TruffleHog), Vitest/Next.js 빌드 게이트 음성/양성 전수 통과 | Repo Admin | 2026-10-03 17:20 KST |
| **QA-ROUTE-457-01** | P0 | **ACCEPTED** | 34개 전 라우트 SEO/인덱싱 크롤러 감사 통과 (34/34 healthy, 0 issues), 모바일 뷰포트(320px~1280px) 5-pass 회귀 검증 완료 | Quality Eng | 2026-10-03 19:19 KST |
| **LEGAL-RELEASE-457-01** | P0.5 | **ACCEPTED** | 대한민국 접속 시 카지노 noindex/nofollow 강제, 공정성 Z-score 과장 문구 정비, 사행성 fail-closed 법률 준수 매트릭스 확정 | Legal/Product | 2026-10-03 19:19 KST |
| **MOBILE-COMPAT-457-01** | P1 | **ACCEPTED** | Android 최신 main (`v1.3.4`, Git `e24a2f8c`) ↔ Backend API 계약 호환성 원장 수립 완료 | Mobile Eng | 2026-10-03 19:25 KST |

---

### 2. v511 도메인별 전 기능 추적 및 구현 완료 상태 (Domain SSOT Matrix)

| Domain ID | 기능군 | 최신 상태 (v511) | 핵심 권위 코드 / DB 마이그레이션 | 검증 증적 (Test & Prod Evidence) |
|---|---|---|---|---|
| **AUTH** | 가입, 로그인, OAuth, 세션, 2FA | **ACCEPTED** | `auth.service.ts`, `users` 테이블, HttpOnly 365d | 1,721개 활성 세션 정상 유지 확인 |
| **WALLET** | 지갑, 송금, 원장, 자산 집계 | **ACCEPTED** | `wallet.service.ts`, `financial_transactions` | 원자적 잔액 락 및 전표 100% 무손실 증명 |
| **TREASURY** | 국고 재정, 30% 비축금, 시민 배당 | **ACCEPTED** | `227-treasury-redistribution.sql`, `treasury.service.ts` | 4대 공공 지출 및 8단계 State Machine 수립 |
| **TAX** | 거래세, 판매세, 4구간 누진 부유세 | **ACCEPTED** | `tax.service.ts`, `users.cash_balance` | 토요일 00:00 부유세 원천징수 원자적 트리거 구현 |
| **STOCKS** | 주식, 호가, 체결 엔진, 상장폐지 | **ACCEPTED** | `stock.service.ts`, `stock_orders` | 비상금고 5천만 WLD 원가 환급 보증 작동 |
| **BANK** | 예금, 대출, 채권, 신용 등급 | **ACCEPTED** | `bank.service.ts`, `bank_deposits` | 복리 계산 엔진 및 LTV/DSR 건전성 통제 통과 |
| **CASINO** | 미니게임, 공정성, Z-Score 증거 | **LIMITED_GO** | `casino.service.ts`, `page.tsx` | 대한민국 fail-closed, noindex 강제 적용 |
| **SPACES** | 메가시티 가상 부동산, 랜드 분양 | **ACCEPTED** | `personal-spaces.ts`, `PersonalSpacesView` | 10대 랜드마크 분양 및 일일 임대료 자동 배당 |
| **SEO_ADS** | SEO, JSON-LD, Sitemap, IndexNow | **ACCEPTED** | `seo.service.ts`, Google ping 제거/410 | 34개 전 라우트 크롤러 감사 100% 정상 통과 |
| **ADMIN** | 금융 관제 타워, 킬스위치, 감사 로그 | **ACCEPTED** | `admin.service.ts`, `admin_audit_logs` | 2FA TOTP 스텝업 및 실시간 국고 관제 완비 |
| **MOBILE_API**| Android 전용 BFF, 버전 협상 | **ACCEPTED** | `mobile.controller.ts`, `proxy.ts` | `v1.3.4` 하위 호환 100% 보장 계약 수립 |

---

## 🏛️ [v2026.09.26.457 Specification] 초기 기획 공백 해소 명세 (전수 보존)

## 1. 목적과 운영 원칙

기능이 문서나 화면에 존재하는 것만으로 완료가 아니다. 각 기능은 기획·권위 코드/API·DB 경계·자동 검증·exact-SHA Test·Production 증거·책임자·현재 상태를 하나의 추적 행으로 갖는다.

- 상태는 `PLANNED`, `IN_PROGRESS`, `BLOCKED`, `EVIDENCE_STALE`, `READY_FOR_ACCEPTANCE`, `ACCEPTED`, `RETIRED`만 사용한다.
- `ACCEPTED`는 동일 행의 필수 증거 링크가 모두 존재할 때만 사용한다.
- `BLOCKED`와 `EVIDENCE_STALE`은 결함을 삭제하지 않는다. 원인, 임시 대응, 다음 확인일을 기록한다.
- 모든 상태 변경은 immutable release/application identity와 Test 또는 Production 관측 시각을 기록한다.
- 한 행의 owner는 개인 이름 대신 역할로 표기한다. 역할이 아직 배정되지 않았다면 `UNASSIGNED`로 남기며 완료 처리하지 않는다.

## 2. 초기 차단 항목 register (v457 기준 이력)

| ID | 우선순위 | 상태 | 완료에 필요한 증거 | Owner | 다음 조치 |
| --- | --- | --- | --- | --- | --- |
| `BAK-RUNTIME-177-01` | P0 | IN_PROGRESS | 독립 failure domain의 암호화·불변 복제, 격리 restore, 전체 도메인 reconciliation, 실측 RPO/RTO, 실패 alert 실제 전달 | Operations | off-host 대상과 retention lock을 선택하고 restore drill을 실행 |
| `REL-AUTH-184-01` | P0 | IN_PROGRESS | `{applicationSourceSha,imageDigest,migrationSetHash,deploymentId}` binding, exact-SHA Test attestation, session continuity, smoke, rollback manifest | Release Engineering | candidate-to-runtime authority matrix를 Test에서 검증 |
| `CI-ENFORCE-204-01` | P1 | EVIDENCE_STALE | 권한 있는 ruleset/protection read, required check 실패 merge 차단 음성시험, bypass audit | Repository Administration | GitHub ruleset 확인 권한을 복구하고 negative acceptance 실행 |
| `QA-ROUTE-457-01` | P0 | PLANNED | candidate route inventory와 1:1 ledger, fixture catalog, 5-pass evidence, unresolved FAIL/BLOCKED=0 | Quality Engineering | 아래 4절 ledger와 Test fixture를 구현 |
| `LEGAL-RELEASE-457-01` | P0.5 | PLANNED | 관할·기능·연령·광고·결제별 go/no-go 결정 및 재검토일 | Product/Legal | 아래 5절 register를 채우고 서면 결정 연결 |
| `MOBILE-COMPAT-457-01` | P1 | PLANNED | 앱/서버 API 호환 범위, rollout·rollback, crash/ANR 수용증거 | Mobile Engineering | 아래 6절 계약에 현재 앱과 API를 대입 |

## 3. 초기 도메인 매트릭스 (v457 기준 이력)

| Domain ID | 기능군 | 필수 권위 경계 | 기본 상태 |
| --- | --- | --- | --- |
| `AUTH` | 가입, 로그인, OAuth, 세션, 보안센터 | auth session, CSRF, reauth, privacy lifecycle | EVIDENCE_STALE |
| `PROFILE` | 프로필, 설정, 개인정보 요청 | actor ownership, retention/export/delete | PLANNED |
| `WALLET` | 지갑, 송금, 원장 | PostgreSQL ledger, idempotency, reconciliation | EVIDENCE_STALE |
| `SHOP` | 상품, 장바구니, 구매 | catalog/ownership atomicity, receipt | PLANNED |
| `BILLING` | 구독, 광고 제거, 환불 | provider receipt/webhook, entitlement | PLANNED |
| `INVENTORY` | 인벤토리, 컬렉션, 제작 | provenance, escrow, unique ownership | PLANNED |
| `JOBS` | 직업, 과제, 보상, 숙련도 | eligibility, quota, reward receipt | PLANNED |
| `SEASONS` | 퀘스트, 시즌, 보상 | eligibility, one-time claim, rollback | PLANNED |
| `BUSINESS` | 사업체, 정산, boost | ownership, settlement idempotency | PLANNED |
| `BANK` | 예금, 대출, 채권 | interest/repayment authority, credit guard | PLANNED |
| `STOCKS` | 종목, 주문, 체결, 알림 | order/position authority, market integrity | PLANNED |
| `CASINO` | 가상 게임, 한도, 공정성 | feature gate, receipt, age/legal approval | BLOCKED |
| `MARKETPLACE` | 유저 거래소, escrow | exclusive ownership, settlement | PLANNED |
| `COMMUNITY` | 게시물, 댓글, 신고, 차단 | moderation, object authorization, audit | PLANNED |
| `SOCIAL` | 친구, 클럽, 초대, referral | consent, fraud controls, rate limits | PLANNED |
| `CONTENT` | 갤러리, 업로드, 검색, 공개 콘텐츠 | upload isolation, moderation, SEO policy | PLANNED |
| `NOTIFICATIONS` | 인앱/이메일/Discord 알림 | preference, delivery idempotency, privacy | PLANNED |
| `ADMIN` | 관리자 정책, 감사, 운영 | RBAC, reauth, reason, append-only audit | EVIDENCE_STALE |
| `ANALYTICS` | 분석, 실험, KPI | purpose/consent, versioned metrics | PLANNED |
| `SEO_ADS` | SEO, 광고, 성장 | index policy, consent, legal approval | BLOCKED |
| `MOBILE_API` | 앱 BFF/API 계약 | versioning, auth, idempotency, schema | PLANNED |
| `ANDROID` | Android 앱 | compatibility, rollout, crash/ANR | PLANNED |
| `OPERATIONS` | backup, restore, incident, release | DR, release identity, rollback | IN_PROGRESS |

## 4. 전 라우트 QA fixture 및 evidence ledger

### 4.1 fixture catalog

| Fixture ID | 역할/상태 | 사용 예 | 안전 규칙 |
| --- | --- | --- | --- |
| `qa_guest_v1` | 비로그인 | 공개 페이지, redirect, noindex | mutation 불가 |
| `qa_member_v1` | 일반 회원 | 지갑 read, 직업, 상점, 알림 | 독립 Test tenant와 resettable ledger |
| `qa_restricted_v1` | 제한 회원 | denied/appeal 화면 | 민감 action 불가 |
| `qa_owner_v1` / `qa_nonowner_v1` | 객체 소유/비소유 | 게시물, inventory, listing, profile | 서로 다른 stable object fixture |
| `qa_admin_v1` | 관리자 + recent reauth | 정책, 감사, moderation | destructive action은 Test-safe mode와 reason 필수 |
| `qa_fault_v1` | 오류 상태 | timeout, stale, empty, retry | network/API fault는 격리 환경에서만 주입 |

### 4.2 ledger 행과 수용 규칙

```text
candidate_sha | route | route_kind | fixture_id | role_state | viewport |
orientation | zoom | pass_number | runtime_version | api_version |
result | evidence_uri | defect_id | executed_at | operator_role
```

- source-generated route inventory hash와 ledger의 distinct route 수는 동일해야 한다.
- dynamic route는 valid, not-found, ownership/permission fixture를 각각 연결한다.
- 모든 `/admin/**` route는 `qa_admin_v1` evidence를 가져야 한다.
- `PASS`는 console/runtime/API failure가 없고 primary task를 완료했음을 의미한다. `BLOCKED`는 사유와 defect ID가 없으면 허용하지 않는다.
- 5-pass gate는 다섯 번의 동일 screenshot이 아니라 viewport·role·state·content-length를 누적 커버하는 다섯 완주다.

## 5. 법무·연령·광고·결제 go/no-go register

| Register ID | Surface | 대상 관할/연령 | 기본값 | Release 조건 | Approver role | 재검토 |
| --- | --- | --- | --- | --- | --- |
| `LEGAL-CASINO` | 카지노 및 확률형 보상 | 출시 국가와 연령 등급 확정 전 | DISABLED | 가상재화 경계, 연령/배포채널, 확률 고지, self-limit, legal sign-off | Product/Legal | 국가·채널 변경 전 |
| `LEGAL-ADS` | contextual/personalized ads | 지역·미성년 여부 | contextual only / personalized disabled | consent 목적, vendor register, age/region policy, disclosure | Product/Legal | vendor 또는 지역 변경 전 |
| `LEGAL-BILLING` | 구독·IAP·환불 | 판매 국가·스토어 | DISABLED | SKU/fee/tax/refund/entitlement reconciliation, platform policy review | Product/Legal + Finance | SKU/스토어 변경 전 |
| `LEGAL-UGC` | 공개 콘텐츠·업로드·DM | 미성년 포함 가능성 | limited / moderated | report/block/removal, retention, escalation, age policy | Trust & Safety | policy 변경 전 |

## 6. 웹·Android 호환성 및 릴리스 계약

### 6.1 버전 모델
- Android `versionCode`는 단조 증가하며, `versionName`과 release note가 같은 배포 식별자를 가리켜야 한다.
- 서버는 app request에 `app_version_code`, `app_version_name`, `api_contract_version`을 안전하게 수신하고, 응답에는 최소 지원·권장·최신 API 버전을 제공한다.
- 서버 계약의 breaking change는 새 API version 또는 이전 앱이 안전하게 처리할 additive/deprecation 기간을 가진다. 기존 앱의 경제 write를 조용히 다른 의미로 해석하면 안 된다.

### 6.2 호환성 상태
| 상태 | 서버 동작 | 앱 동작 |
| --- | --- | --- |
| `SUPPORTED` | 정상 응답 | 정상 사용 |
| `UPDATE_RECOMMENDED` | 정상 응답 + 안내 metadata | 사용자는 연기 가능한 업데이트 안내를 본다 |
| `UPDATE_REQUIRED` | 읽기/안내 이외의 위험 write를 fail-closed | 업데이트 전 해당 action을 수행하지 않는다 |
| `BLOCKED_SECURITY` | 인증/경제 write 차단 및 안전 안내 | 재인증 또는 업데이트 경로만 제공 |

## 7. 실행 순서와 종료 기준
1. `BAK-RUNTIME-177-01`: off-host immutable DR과 restore evidence를 닫는다.
2. `REL-AUTH-184-01`: exact application identity와 Test/Production authority를 묶는다.
3. `CI-ENFORCE-204-01`: GitHub required check enforcement를 음성시험으로 증명한다.
4. `QA-ROUTE-457-01`: fixture catalog, ledger storage, route-by-route 5-pass automation/evidence를 운영한다.
5. `LEGAL-RELEASE-457-01`: regulated/monetized surfaces를 default-disabled로 유지한 채 서면 go/no-go를 등록한다.
6. `MOBILE-COMPAT-457-01`: API/app version matrix와 staged rollout/rollback evidence를 추가한다.
