# 국고·사회보험 신규·변경 기획 기록 및 비교 인덱스
> **특별 기간:** 2026-11-10 ~ 2026-11-11 오전 6시 (한국시간)
> **기록 버전:** vTSI.2026.11.10.004 · **상태:** 초안 / 문서 기록 전용
> **기존 기준선:** [고정된 기존 기획](TREASURY_SOCIAL_INSURANCE_20261110_BASELINE.ko.md)
> **원본:** [English canonical](TREASURY_SOCIAL_INSURANCE_20261110_CHANGE_REGISTER.md)
> **최우선 기획:** [PROJECT_PLAN.md](PROJECT_PLAN.md) 및 [INTEGRATED_PLANNING_MASTER.md](INTEGRATED_PLANNING_MASTER.md)

## 최초 상태 — 이번 특별 기간에 새로 기록한 변경
| 분류 | 건수 | 의미 |
|---|---:|---|
| ADD 새 기능 기획 | 1 | 신규 제안 1건, 미구현 |
| MODIFY 기존 기획 수정 | 4 | QA 기반 기존 기획 수정 4건, 모두 제안 상태 |
| REMOVE 기존 기획 삭제 | 0 | 삭제 제안 없음 |
| DEFER 보류 | 0 | 보류 기록 없음 |
| 통합기획서 반영 완료 | 0 | 실제 병합·반영을 주장하지 않음 |

이는 **변경 내용을 누적하기 위한 양식**이며 기존 기획이 없다는 뜻이 아니다. 코드 구현, QA 통과, 운영 반영의 증거도 아니다.

## 기존 기획 ↔ 새 기획 비교 인덱스 (매시간 갱신)
| ID | A QA 수정 / B 신규 | 분류 | 기존 문서 절·불변 링크 | 기존 설계 내용 | 새로운 내용·상세 기획 링크 | 버전·한국시간 | 우선순위 | 상태 | 실제 통합 PR |
|---|---|---|---|---|---|---|---|---|---|
| TSI-20261110-007 | A QA 보완 | MODIFY | 기준 OPS1518-01/REL1518-04, TSI-005 | 브라우저 E2E·증빙 유효기간 검증 미확인 | QA 증빙 신선도 및 독립 승인 계약 | v2020 / 07:08 | P0 | PROPOSED / 통합 대기 | PR #3006 |
| TSI-20261110-001 | A QA 수정 | MODIFY | [기준 main 기획서 FIN1518-03](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/PROJECT_PLAN.md) | 국고 미연계 552건, 탐색 24건/정규 0건은 과거 QA 주장 | 동일 스냅샷·SQL 버전 기반 읽기 전용 대사 증거 게이트 제안 | v2008 / 01:05 | P0 | PROPOSED, 통합 대기 | PR #3006 |
| TSI-20261110-003 | A QA 수정 | MODIFY | 기준 PROJECT_PLAN.md OPS1518-01/REL1518-04/FIN1518-03, main edd709bc | 운영 SHA·원장 출처 미검증 | 운영 프로세스·DB·원장 출처 증빙 게이트 | v2012 / 03:05 | P0 | PROPOSED / 통합 대기 | PR #3006 |
| TSI-20261110-002 | B 신규 | ADD | [기준 NPS 문서](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/NATIONAL_PENSION_SERVICE_SPEC.md) | 국민연금 제안은 존재하나 보험 간 자격변경 증빙함은 검증되지 않음 | 건강보험·연금 공통 자격변경 증빙 접수함 신규 제안 | v2010 / 02:05 | P1 | PROPOSED, 통합 대기 | PR #3006 |

## 누적 상세 기록
| TSI-20261110-006 | B 신규 | ADD | 기준 NPS 정책 edd709bc | 자격·급여 기능만 존재, 징수 전 산정 이의신청 미확인 | 가상 보험료 사전 산정·이의신청 잠금·독립 심사 | v2018 / 06:09 | P1 | PROPOSED / 통합 대기 | PR #3006 |
### TSI-20261110-001 — 국고 대사 증거 게이트 (A, MODIFY, P0)
- 최초 2026-11-10 01:05 KST / v2008 / vTSI.002. FIN1518-03과 과거 QA v1394의 미연계 552건·탐색 24건/정규 0건을 동일 스냅샷에서 재현할 수 있도록 읽기 전용 대사 실행/발견 테이블, 내부 API 3개, 관리자 비교 화면과 추가 전용 감사 이벤트를 제안. 실제 운영 재현·근본원인·통합 반영은 미검증. 원장 자동 수정·발행 금지. 개발 B DB/API, C 관리자 UI, QA 재현, A 통합 담당 제안; 확정 배정 아님.
### TSI-20261110-002 — 보험 간 자격변경 증빙 접수함 (B, ADD, P1)
- 최초 2026-11-10 02:05 KST / v2010 / vTSI.003. 기준선 9번 국민연금 문서의 가입/급여 개념과 달리 보험 간 자격변경 접수·독립 검토 이벤트 계약은 확인되지 않아 **신규 제안**으로 분리. 건강보험 구현과 운영 QA는 검증 불가. 현실 법정 보험료율을 게임에 적용했다고 주장하지 않음.
- **목적/사용자:** 회원·권한 있는 사업장이 가상 가입·상실·소득구간·사업장 변경을 증빙과 함께 신청하고 독립 관리자가 승인 유효일을 검토. 접수만으로 보험료 부과·원장 이체·급여 지급 금지.
- **화면·CTA·상태:** 회원 보험>자격>변경 신고, 사업장 소속 직원 목록>변경 제출, 관리자 보험>증빙 접수함>원본 비교/보완 요청/유효일 승인/거절. DRAFT→SUBMITTED→EVIDENCE_PENDING→IN_REVIEW→ACCEPTED/REJECTED, WITHDRAWN/EXPIRED/BLOCKED 별도. 320px·키보드·WCAG 2.2 AA, 비공개 noindex/no-store.
- **API/인가:** POST /api/insurance/eligibility-changes, GET /api/insurance/eligibility-changes/:id, POST /internal/insurance/eligibility-changes/:id/decision. 회원 본인 또는 사업장 소속 범위, 독립 insurance.eligibility.review + 최신 MFA, If-Match/CAS 및 멱등성 키. 403/404/409/412/422/429/503 안전 차단.
- **DB:** insurance_eligibility_change_requests 복합 PK(tenant_id,request_id), subject_id/fund_scope/change_type/effective_at/status/revision/source_digest/actor_id; 추가 전용 insurance_eligibility_change_events 복합 FK. (tenant_id,actor_id,idempotency_key) UNIQUE, 대상·상태·일자 인덱스, CHECK 상태 전이, FORCE RLS, 가산형 마이그레이션.
- **정합성/보안:** 직렬화 또는 순서 고정 잠금, revision CAS, 감사+Outbox 원자성, 소비 이벤트 중복 방지, 부과 시 자격 재검증. 민감한 의료·신원 증빙 최소 수집·암호화·접근 분리, 만료/철회 후 자동 승인 금지, 재시도 상한과 실패 큐. 정수 가상통화 원장 불변; 기존 토큰 재활성화 금지.
- **테스트·배포:** 상태/RBAC 단위, PostgreSQL RLS·동시 심사·중복 요청·시점 경계·Outbox 장애 통합, 모바일/a11y 및 접수→독립 검토→이벤트 E2E. 수용 기준: 멱등 결정 이벤트 1건, 접수만으로 잔액 변동 0, 권한 철회 심사 거절. 기능 플래그 insurance_eligibility_evidence_inbox_v1 기본 OFF, Test exact-SHA·독립 QA/보안·카나리·롤백 전 운영승격 금지. 상태 PROPOSED / 미구현·미검증 / canonical 통합 대기.
- **우선순위:** P0 국고 대사·운영 복구 게이트, P1 보험 코드 현황 조사 및 접수함 구현, P2 심사 지연·중복률 KPI. 외부 독립 레퍼런스 이번 회차 0건, 누적 UNKNOWN/10,000: BLOCKED/IN PROGRESS.

## 상세 항목 작성 양식
```md
### TSI-20261110-001 — 기능명
- 한국시간, 회차 A/B, 순차 기획 버전, 담당 작업:
- 상태: PROPOSED | REVIEWED | INTEGRATED | IMPLEMENTED | VERIFIED | BLOCKED
- 분류: ADD | MODIFY | REMOVE | DEFER
- 서비스·P0/P1/P2·현재 화면/기능, 실제 소스(main SHA, 파일, 절):
- QA 원본 증거(URL/계정 권한/재현/HTTP 응답) 또는 신규 필요성:
- 기존 기획(Before):
- 수정·신규 기획(After): 사용자 화면/상태/CTA/관리자 절차:
- API 권한·요청/응답·오류, DB 제약·마이그레이션·접근 경계:
- 이중기장/국고·발행량/멱등성/대사/개인정보/감사:
- QA 재검증·수용기준·롤백 조건:
- 영문/국문 통합기획서 반영 절·작업기록·PR·커밋:
- 실제 확인 상태: 증거 없으면 기획만 완료로 표시:
```

## 매시간 누적 기록
| 실행 한국시간 | A/B | 기획 버전 | 기존 기준선 확인 SHA | 추가/수정/삭제/보류 ID | main 변경 확인 | PR·증거 | 실제 결과 |
|---|---|---|---|---|---|---|---|
| 2026-11-10, 기록 초기화 | 설정 단계(교대 회차 아님) | vTSI.2026.11.10.001 | `edd709bcbe96f6f5ceca8372f244b632e8211242` | 0 / 0 / 0 / 0 | 재확인 완료 주장 없음 | 독립 브랜치 및 검토용 PR 예정 | 기존 문서 인덱스와 변경 대장 양식만 작성 |

## 11월 11일 오전 5시 5분 마감 취합란
- 기준선 보정:
- 새 기능 전체 목록:
- 기존 기능 수정 목록:
- 삭제·보류:
- 실제 통합기획서 반영 / PR 대기 / 차단:
- QA 연계 수정 및 미해결:
- Gemini·개발 A/B/C·QA 중복 검토:
- 최종 버전·문서·PR·잔여 위험:

## 문서 관리 원칙
기존 기록은 수정하여 지우지 않고 새 행·수정 이력으로 보존한다. 매 회차 기존 기획과 대조한 뒤 신규 기능과 기존 수정 사항을 구분한다. 영문과 한국어를 동등하게 관리한다. 초안은 승인·구현·운영 승격을 의미하지 않는다. 기획서는 상위 통합기획서에 리뷰 후 반영한다.

## 2026-11-10 01:05 KST — A회차 QA 기반 보완, v2008 / vTSI.2026.11.10.004
**TSI-20261110-001 | MODIFY | P0 | PROPOSED | 통합기획서 미반영.** 기존 기준선: main `edd709bcbe96f6f5ceca8372f244b632e8211242`의 `PROJECT_PLAN.md` FIN1518-03. QA v1394 문서상 국고 미연계 552건, 탐색 24건 대 정규 0건 불일치, MINT/SWF 출처 미검증. 이번 회차에서 실운영 재현은 하지 않았으며 실제 원인·영향은 **검증 불가**이다.

**개정안:** 잔액을 자동 수정하거나 WLD를 발행하지 않고, 동일 DB 스냅샷·SQL 버전·계정 범위·마감시각으로 중앙/보조 원장과 거래 출처를 읽기 전용 대사한다. 관리자 국고 > 대사 화면에서 실행 ID, 근거 해시, `PENDING/MATCHED/DISCREPANCY/INCONCLUSIVE/BLOCKED`를 표시하고 비식별 근거 내보내기·동일 스냅샷 재실행·독립 담당자 이관 CTA를 제공한다. 공개 검색 제외, 320px·키보드 접근성 지원.

**제안 내부 API(미구현):** `POST /internal/treasury/reconciliation-runs`(범위·마감·SQL버전·멱등성 키 → 202 실행 ID), `GET /internal/treasury/reconciliation-runs/:id`(건수·해시·출처·페이지), `POST /internal/treasury/reconciliation-runs/:id/escalate`(감사 이벤트). RBAC `treasury.reconcile.read/escalate`, MFA, 독립 승인, 403/409/422/429/503 안전 차단.

**제안 DB(미구현):** 추가 전용 실행/발견 테이블, 테넌트 복합 FK, (테넌트·멱등성 키) UNIQUE, (테넌트·실행·원본항목·발견유형) UNIQUE, 상태·시각 인덱스, 정수 WLD, FORCE RLS, REPEATABLE READ, 원본 해시, 감사 Outbox, 작업자 펜싱·유한 재시도. 추가형 마이그레이션, 기능 OFF 롤백, 감사 보존. 경고는 같은 스냅샷에서 반복 재현된 차이만 승격하고 지문 중복을 억제한다.

**검증·수용:** 동일 스냅샷/SQL에서 결정적 결과, 552 및 24/0 근거 재현 또는 반증, 잔액 무변경, 부분 장애 시 MATCHED 금지, 동시 멱등성, 테넌트 격리·비식별·접근성·복구 시험. 모두 **미실행**. P0 원장 출처·운영 SHA·DB 권한·독립 복원, P1 API/관리자 UI/격리 PG, P2 오탐·처리시간 KPI. 개발 B(DB/API), C(UI), A(통합), QA(재현) 담당 제안이며 배정·승인되지 않았다. 원문 기준선은 불변, 영문 상세 항목과 동등하며 PR #3006에서 검토한다.

**비교 인덱스:** FIN1518-03(기존 QA 미연계/불일치) → TSI-20261110-001(동일 스냅샷 대사 근거 게이트) → 통합기획서 반영 대기. 누적 ADD 0 / MODIFY 1 / REMOVE 0 / DEFER 0 / INTEGRATED 0. 이전 B v2006 → 현재 A v2008 → 다음 B v2010. 외부 독립 레퍼런스 신규 승인 0, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS.

## 2026-11-10 02:05 KST 회차 기록
- Previous A v2008 → Current B v2010 → Next A v2012. ADD 1, MODIFY 누적 1, REMOVE 0, DEFER 0, INTEGRATED 0. 기준선 불변; main edd709b 확인. PR #3006은 문서 추적만 수행하며 QA/구현/배포 완료를 뜻하지 않음.

### TSI-20261110-003 — 국고 배포·원장 출처 증빙 게이트
- 2026-11-10 03:05 KST / A 기능 개선 / v2012 / vTSI.004 / MODIFY / P0 / 담당 기획, 개발·QA 배정 미확정 / PROPOSED.
- **기존:** 기준 통합기획서 OPS1518-01·REL1518-04·FIN1518-03의 운영 SHA·정산 출처·독립 복원 HOLD. 기존 계획에는 실제 Nginx 프로세스와 국고 원장 출처를 하나의 불변 증거로 연결하는 관리자 검토 흐름이 부족.
- **QA 근거:** miniPC QA 2026-11-10 02:16 KST: 운영/Test HTTP 200, 양쪽 /api/version=a13a18cd70709a6f4df320d4d76ea834baae2331, main=edd709bcbe96f6f5ceca8372f244b632e8211242, 레거시 백엔드 재시작 192310, 브라우저 E2E BLOCKED. /srv/moneyverse 심볼릭 링크 대상 부재도 확인. 실제 서비스 장애·원장 훼손은 증명되지 않음. 근본원인 UNVERIFIED. 별도 PR #3007의 국고 발행·SWF 수정과 중복 구현 금지.
- **재현:** 요청 시각·호스트·health/version·Nginx upstream/PID/cwd/실행 SHA·릴리스 매니페스트·마이그레이션 체크섬·국고 이중기장 출처 해시·Test exact-SHA를 동일 실행 ID로 수집. 기대: 승인 릴리스/DB/원장 출처 일치. 실제: 버전 차이·링크 손상 관측, 실행 프로세스 매핑 미확인.
- **화면:** 관리자 국고 > 배포·원장 증빙, UNVERIFIED/INCONCLUSIVE/MATCHED/BLOCKED, 읽기 전용 증빙 수집·Test SHA 비교·에스컬레이션 CTA. 원장 조정·발행 버튼 없음. 320px, 키보드, WCAG 2.2 AA, noindex/no-store.
- **API(미구현):** POST /internal/treasury/provenance-runs (expectedSha,migrationSet,scope,idempotencyKey) → 202 runId; GET /internal/treasury/provenance-runs/:id → 증빙·출처·상태; POST /internal/treasury/provenance-runs/:id/escalate → 감사 ID. 서비스 전용 수집, RBAC treasury.provenance.read/escalate, MFA, 401/403/409/422/429/503, 요청 제한.
- **DB(제안):** 추가 전용 treasury_release_provenance_runs/events, 테넌트 복합 PK/FK, unique(tenant_id,idempotency_key), index(tenant_id,status,created_at), SHA256/상태 CHECK, FORCE RLS, 감사 outbox 원자성·작업자 펜싱. 읽기 전용 REPEATABLE READ로 중앙·보조원장/영수증 출처 비교, 정수 WLD, 불일치와 증빙 누락 분리, 금액·잔액 변경 금지.
- **보안·배포:** 기능 플래그 admin_treasury_release_provenance_v1 기본 OFF, 신규 승인 워크플로에서 UNKNOWN은 실패 차단. 2인 에스컬레이션, 해시별 경고 중복 억제, 비식별 감사, 추가형 마이그레이션·OFF 롤백(감사 보존), 운영 변경 없음.
- **수용 기준/테스트 미실행:** 격리 Test exact-SHA, 독립 백업 복원, 실제 PID→실행 SHA, 마이그레이션·원장 출처 증명, 깨진 링크/시간초과/중복 요청/테넌트 격리/동시성/읽기 전용 원장 불변/E2E. P0 운영 출처·정산 보류, P1 관리자 API/DB/UI, P2 경고 오탐률·증빙 지연 KPI. QA 독립 재검증 필요. 통합 기획서 반영 0건, PR #3006 기록용.
- **업무 분리:** QA 실제 재현, 개발 A 배포 출처, B API/DB, C 관리자 UI 제안; PR #3007~3009 런타임 변경 침범 금지.

### 회차 기록 / 03:05 KST
Previous B v2010 → Current A v2012 → Next B v2014. ADD 1 / MODIFY 2 / REMOVE 0 / DEFER 0 / INTEGRATED 0. QA/E2E 미검증.

### TSI-20261110-004 — 가상 보험 급여 청구·독립 심사 (ADD; B v2014)
- 2026-11-10 04:05 KST 기록; vTSI.2026.11.10.005; P1; PROPOSED. 직전 A v2012 → 현재 B v2014 → 다음 A v2016. 기획 담당, 개발 B/C·QA 배정 대기.
- 기존: 불변 기준선 사회보험·국민연금 및 main edd709bcbe96f6f5ceca8372f244b632e8211242 통합기획서. TSI-002는 자격 증빙만 담당. 실제 청구 기능 구현·E2E는 검증 불가. 현실 국민건강보험 법정 급여·요율이 아닌 게임 가상경제 기능.
- 회원 보험 > 급여 > 청구하기: 게임 이벤트 참조, 보장기간, 양의 정수 WLD, 개인정보 안내, 접수증·증빙 보완·심사 전 철회. 관리자 보험 > 청구: 증빙 확인·보완 요청·한도 승인·거절·상급 심사. DRAFT→SUBMITTED→EVIDENCE_PENDING→IN_REVIEW→APPROVED/REJECTED, WITHDRAWN/EXPIRED/BLOCKED 종료. 실제 진단명·주민번호·의료문서 수집 금지. 승인은 지급 인가일 뿐 즉시 입금 아님.
- 제안 API(미구현): POST /api/insurance/benefit-claims {eventRef,coveragePeriod,amountWld,idempotencyKey}; GET /api/insurance/benefit-claims/:id; POST /internal/insurance/benefit-claims/:id/decision {decision,approvedWld,expectedRevision,nonce}. 소유자 범위 조회, 독립 심사 RBAC, 최신 MFA, 자기 승인 금지, 401/403/404/409/412/422/429/503 안전 차단. 지급은 별도 권한 필요.
- 제안 DB: insurance_benefit_claims(tenant_id,claim_id 복합 PK,subject_id,event_ref,period_start/end,amount_wld BIGINT >0,approved_wld 0~청구액,status,revision,source_digest,created_at), insurance_benefit_claim_events(테넌트 복합 FK, 불변 감사 이벤트). UNIQUE(tenant_id,subject_id,event_ref,period_start,period_end), UNIQUE(tenant_id,subject_id,idempotency_key), index(tenant_id,status,created_at), FORCE RLS, 최소권한 SECURITY DEFINER, 원자적 Outbox. 추가형 마이그레이션만, 기존 잔액 변경 없음.
- 정합성: CAS revision·작업자 펜싱, 지급 시 자격 재확인, 청구별 지급 참조 UNIQUE, 이중기장·멱등성. 장애는 UNKNOWN/PENDING_REVIEW, 자동 입금 금지; 취소는 상쇄 분개. 테넌트 격리, 속도 제한, 비식별 감사·경보 중복 억제.
- 모바일 320px, WCAG 2.2 AA, 한영 동등, noindex/no-store, 심사 지연·중복 거절·미검증 지급 시도 KPI. 미실행 테스트: 상태/RBAC, 격리 PostgreSQL 동시성·RLS·중복·Outbox 장애·자격 철회·이중 지급 차단, E2E 청구→심사→지급인가(원장 변화 0), 접근성·개인정보. 기본 OFF insurance_virtual_benefit_claims_v1, exact-SHA Test·독립 QA/보안 후 카나리, OFF 롤백 감사 보존.
- P0 운영 출처·국고 대사 HOLD; P1 API/DB/회원·관리자 UI; P2 비식별 KPI. 기준선 사회보험 → TSI-20261110-004 → 통합기획서 반영 대기 / Draft PR #3006. 외부 독립 레퍼런스 신규 검증 0, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS. 운영 변경 없음.

| 2026-11-10 04:05 | B 신규 기능 | v2014 / vTSI.2026.11.10.005 | edd709bcbe96f6f5ceca8372f244b632e8211242 | ADD 1 / MODIFY 0 / REMOVE 0 / DEFER 0 | 재확인 필요 | PR #3006 | PROPOSED, 통합 대기 |

### TSI-20261110-005 — QA 연계 레거시 백엔드 재시작 및 국고·보험 증빙 게이트 개선(MODIFY; A v2016)
- **최초 기록:** 2026-11-10 05:05 KST; v2016 / vTSI.2026.11.10.006; 기획 담당, 향후 Dev A 운영 원인조사·Dev B API/DB·QA 재검증; **PROPOSED / 통합기획서 미반영**. 이전 B v2014 → 현재 A v2016 → 다음 B v2018.
- **기존/근거:** 불변 기준 main `edd709bcbe96f6f5ceca8372f244b632e8211242`, PROJECT_PLAN.md OPS1518-01 / REL1518-04 / FIN1518-03. TSI-003은 배포-원장 출처 검증으로 레거시 서비스 재시작 수명주기와 별개. 2026-11-10 04:15 QA 기록 `/srv/moneyverse-data/tasks/Moneyverse-QA-v2026.11.10.0415-internal.md`: 레거시 `moneyverse-release-v1068-backend` activating/exit-code, 누적 재시작 193670회(직전 192959 대비 +711), 운영·Test HTTP 200, /api/version a13a18cd 대 main edd709bc, 브라우저 E2E 차단. 실제 근본원인·금융 쓰기 경로·사용자 영향은 **검증 불가**이며 금전 손실을 뜻하지 않음.
- **변경:** 관리자 > 운영 > 국고·보험 배포 증빙에서 서비스 상태, 재시작 증감/시간창, 실행 파일·작업 디렉터리·의존성, Nginx 업스트림, 실제 프로세스/빌드 SHA, 원장 쓰기 경로, 증빙 신선도를 조회. CTA `증빙 수집`/`업스트림 비교`/`독립 에스컬레이션`; 서비스 재시작·비활성화·입출금 버튼 없음. `UNKNOWN/CAPTURING/STABLE_VERIFIED/DEGRADED/INCONCLUSIVE/BLOCKED`; 출처 불명은 정상으로 판정하지 않음.
- **미구현 내부 API:** POST /internal/ops/treasury-service-evidence-runs {environment,windowStart,windowEnd,idempotencyKey}; GET /internal/ops/treasury-service-evidence-runs/:id; POST /internal/ops/treasury-service-evidence-runs/:id/escalate {expectedRevision,reason}. 허용된 서비스/업스트림만 조회, 임의 셸 인수 금지; `ops.provenance.read/escalate` 권한 및 에스컬레이션 최신 MFA, 401/403/409/412/422/429/503 안전 차단.
- **DB 제안:** 추가 전용 ops_service_evidence_runs(tenant_id+run_id 복합 PK, 환경, 기간, 허용 서비스명, 재시작 시작/끝 BIGINT >=0, 실행파일·업스트림 해시, 상태, revision, 생성시각), ops_service_evidence_events(테넌트 복합 FK, 이벤트 UNIQUE, 불변 해시). UNIQUE(tenant_id,environment,idempotency_key), 상태·서비스·시간 인덱스, FORCE RLS, 감사 Outbox, 추가형 마이그레이션. 재부팅/카운터 초기화는 INCONCLUSIVE; 원장/서비스 직접 수정 없음.
- **금융 안전:** 서명 배포 매니페스트와 실제 업스트림·프로세스로 쓰기 경로 확인. 레거시가 금융 쓰기 경로 밖이면 영향 없음의 증거를 보존하며 P0 사고로 단정하지 않음. 쓰기 경로에 있다면 독립 운영자 검토와 운영승격 HOLD; 미검증 프로세스로 자동 전환 금지. 이중기장·멱등성·대사 유지.
- **미실행 수용 테스트:** 격리 환경 재시작·재부팅·카운터 리셋·의존성 장애·업스트림 전환·버전 불일치, API RBAC/RLS/테넌트 격리·동시성 CAS·중복 요청·Outbox 실패·비식별화·원장 변경 0건, 320px·WCAG 2.2 AA·한영 동등·noindex/no-store. 기능 플래그 `ops_treasury_service_evidence_v1` 기본 OFF; Test exact-SHA, 승인된 브라우저 E2E 및 독립 QA 후 카나리, 롤백은 수집/UI OFF·불변 감사 보존. P0 금융 쓰기 경로·원장 대사, P1 재시작 원인·증빙 수집기·브라우저 QA, P2 경보 오탐률/조사시간.
- **연결:** 기준선 OPS1518-01/REL1518-04 → TSI-20261110-005 → 통합기획서 반영 대기 / Draft PR #3006. 신규 외부 독립 레퍼런스 검증 0건, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS.
| 2026-11-10 05:05 | A QA 기능 보완 | v2016 / vTSI.2026.11.10.006 | edd709bcbe96f6f5ceca8372f244b632e8211242 | ADD 0 / MODIFY 1 / REMOVE 0 / DEFER 0 | 시작 시 main 동일 | QA 04:15 / PR #3006 | TSI-005 제안, 통합 대기, 테스트 미실행 |


### TSI-20261110-006 — 가상 연금·건강보험료 사전 산정 및 이의신청 징수 잠금 (ADD; B v2018)
- **최초 기록:** 2026-11-10 06:09 KST; v2018 / vTSI.2026.11.10.008; 직전 A v2016 → 현재 B v2018 → 다음 A v2020. 기획 담당, 개발 B/C·QA 배정 대기. P1 / PROPOSED / 통합기획서 미반영.
- **기존 대비:** 불변 기준 main edd709bcbe96f6f5ceca8372f244b632e8211242의 docs/NATIONAL_PENSION_SERVICE_SPEC.md 및 PROJECT_PLAN.md. TSI-002는 자격 증빙, TSI-004는 가상 보험급여 청구이며, 징수 전 보험료 산정 내역 확인과 이의신청 잠금은 별도 미정의 기능이다. 실제 구현·운영 E2E는 검증 불가. 요율은 현실 법정 요율이 아닌 버전별 게임 정책값이다.
- **회원·관리자 흐름:** 보험 > 보험료 > 산정 미리보기에서 정책 버전, 가상 소득구간, 대상 기간, 정수 WLD 산정액, 상하한·지원액·납기 확인; 징수 전 '정정 요청'. 사업장은 권한 있는 직원의 집계만 열람. 관리자 > 보험 > 산정 관리에서 '근거 비교', '징수 잠금', '조정 승인', '이의신청 거절'. PREVIEWED→ASSESSED→DISPUTED→REVIEWING→CONFIRMED/ADJUSTED, 종료 CANCELLED/BLOCKED. 이의신청은 해당 산정건만 징수 차단하며 미리보기·심사 자체는 원장 차감 금지.
- **제안 API(미구현):** POST /api/insurance/contribution-previews {fund,period,eligibilityEventId,policyVersion,idempotencyKey}; GET /api/insurance/contribution-previews/:id; POST /api/insurance/assessments/:id/disputes {reason,sourceRef,expectedRevision,idempotencyKey}; POST /internal/insurance/assessments/:id/decision {decision,approvedAmount,policyVersion,expectedRevision,nonce}. 회원 소유 범위 제한, 독립 insurance.assessment.review 권한·최근 MFA, 자기 승인 금지. 401/403/404/409/412/422/429/503 안전 차단.
- **DB 제안:** insurance_contribution_assessments(tenant_id,assessment_id 복합 PK, subject_id,fund,period_start,period_end,eligibility_event_id,policy_version,amount_wld BIGINT CHECK >=0,revision,status,source_digest,created_at), 불변 insurance_assessment_events(테넌트 복합 FK). UNIQUE(tenant_id,subject_id,fund,period_start,period_end,policy_version), UNIQUE(tenant_id,subject_id,idempotency_key), (tenant_id,status,period_end) 인덱스, FORCE RLS. 정책 테이블은 적용기간 겹침 금지, 정수 분수 요율과 반올림 규칙·가상경제 표기를 명시. 추가형 마이그레이션만 허용.
- **금융·보안:** 산정은 출금 아님. 후속 징수 시 자격·이의신청·정책 서명 스냅샷·잔액 재확인, 이중기장·UNIQUE 징수 참조·SERIALIZABLE/순서화 잠금·멱등성·트랜잭션 Outbox 필수. 실패 시 PENDING_RETRY/INCONCLUSIVE, 자동 납부 성공 처리 금지; 취소는 보상 분개만. WLD 발행·잔액 직접 수정 금지. 테넌트 격리, 사업장 임의 조회 금지, 비식별 불변 감사, 재시도 제한·중복 경고 억제.
- **품질·출시:** 320px/WCAG 2.2 AA, 영한 동등, 비공개 noindex/no-store; 이의신청률·산정 오류율·중복 징수 방지·심사 지연 KPI. 테스트 미실행: 요율 경계·적용일·정수 반올림·상태 전이, 격리 PostgreSQL RLS/CAS/동시성·중복·Outbox 장애·이의신청/징수 경합·E2E(원장 변경 0건). 플래그 insurance_contribution_assessment_v1 기본 OFF; Test exact-SHA 및 독립 QA/보안 검증 뒤 점진 배포, 롤백은 OFF·감사 보존.
- **백로그·이력:** P0 운영 출처·원장 대사 HOLD; P1 독립 구현과 런타임 확인; P2 개인정보 보호 KPI. 기준 NPS 정책 개념 → TSI-20261110-006 → 통합기획서 반영 대기, Draft PR #3006 기록 전용. 외부 독립 레퍼런스 신규 0건, 누적 UNKNOWN/10,000건 BLOCKED/IN PROGRESS. 운영 변경 없음.
| 2026-11-10 06:09 | B 신규 기능 | v2018 / vTSI.2026.11.10.007 | edd709bcbe96f6f5ceca8372f244b632e8211242 | ADD 1 / MODIFY 0 / REMOVE 0 / DEFER 0 | 시작·중간 main 동일 | PR #3006 | PROPOSED, 통합 대기, 테스트 미실행 |


### TSI-20261110-007 — 국고·보험 QA 증빙 유효기간 및 E2E 독립 확인 게이트 (MODIFY; A v2020)
- **최초 기록:** 2026-11-10 07:08 KST, v2020 / vTSI.2026.11.10.008, 기획 담당; QA 재현·개발 A 런타임·개발 B 감사 API·개발 C 관리자 화면은 담당 협의 대기. 상태 PROPOSED, 미구현, 통합기획서 미반영.
- **기존 기준:** 불변 main edd709bc의 OPS1518-01/REL1518-04와 TSI-003/005에는 운영 출처·서비스 증빙이 있으나 승인된 브라우저 E2E, 테스트 계정 권한, 증빙 유효기간과 금융 쓰기 경로를 하나의 승인 게이트로 연결하는 명세는 불완전.
- **QA 근거:** 2026-11-10 06:13 내부 QA: 운영·Test 홈페이지/헬스/버전 HTTP 200, 양쪽 /api/version=a13a18cd로 main edd709bc와 다름. 레거시 재시작 누적 195020회, 자동 재시작, prod-v600 링크 대상 없음. 브라우저 실행 파일·Playwright·승인된 테스트 계정 부재로 E2E BLOCKED. 04:15 기록 193670회 대비 +1350회이나 카운터 리셋·측정 조건 불명. 고객 손실·금융 원장 손상·근본원인은 검증 불가.
- **변경·재현:** 국고/보험 릴리스별 호스트·UTC 시각·환경·main/릴리스/실행 SHA·업스트림 PID/실행 파일 해시·DB 마이그레이션 체크섬·테스트 계정 승인 참조(비밀 제외)·브라우저 실행 ID·마스킹된 E2E 증거 해시·QA 결함 ID·원장 읽기 전용 출처·증빙 만료를 수집. 브라우저 부재는 FAIL이 아닌 BLOCKED로 기록, HTTP 200만으로 PASS 금지.
- **관리자 UX:** 운영 > 국고/보험 > QA 증빙, NOT_RUN/BLOCKED/FAIL/INCONCLUSIVE/PASS, 만료 배지와 시각; 읽기 전용 수집·승인된 E2E 첨부·실행 SHA 비교·상급 보고 CTA. 권한자만 독립 확인, 자기 승인 금지. 모바일 320px, 키보드, WCAG 2.2 AA, 한영 동등, 비공개 noindex.
- **제안 API(미구현):** POST /internal/ops/financial-qa-evidence-runs {scope,environment,expectedSha,idempotencyKey} -> 202; GET /internal/ops/financial-qa-evidence-runs/:id; POST /internal/ops/financial-qa-evidence-runs/:id/attest {revision,reviewerId,evidenceDigest,decision}, If-Match/MFA/직무분리. 401/403/409/412/422/429/503 구분, 누락·만료 시 안전 차단.
- **DB 제안:** ops_financial_qa_runs(tenant_id,run_id 복합 PK, 범위/환경/기대·관측 SHA/상태/만료/개정/시각, unique(tenant_id,idempotency_key)), ops_financial_qa_events(tenant_id,run_id,event_seq 복합 FK, 행위자·증빙 해시·시각). CHECK·상태/만료 인덱스·FORCE RLS·추가 전용 감사·원자적 Outbox. 금융 원장 쓰기 없음.
- **안전·배포:** ops_financial_qa_attestation_v1 기본 OFF; 별도 승인 전 기존 금융 거래 흐름 변경 금지. 독립 실행 SHA·격리 Test exact-SHA·PostgreSQL RLS·2인 운영승격 확인 필수. 증빙 미확보 시 운영승격 HOLD(기존 거래 자동 중단 금지). 롤백은 플래그/UI만, 원장·감사 삭제 금지.
- **수용기준(미실행):** 브라우저 부재 BLOCKED, SHA 불일치 INCONCLUSIVE/HOLD, 만료·위조 거부, 테넌트 간·자기 승인 거부, 멱등 재시도·Outbox 장애 복구, 승인된 브라우저 E2E·독립 백업 복원. P0 운영 출처/원장 대사, P1 E2E 실행기/API/화면, P2 경고 중복 억제·증빙 신선도 KPI. 외부 독립 레퍼런스 신규 0건, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS.
- **비교:** 기준 OPS1518-01/REL1518-04 + TSI-005 → TSI-20261110-007 → 통합기획서 반영 대기, Draft PR #3006. 구현·QA 검증 완료 아님.
| 2026-11-10 07:08 | A QA 기능 개선 | v2020 / vTSI.2026.11.10.008 | edd709bcbe96f6f5ceca8372f244b632e8211242 | ADD 0 / MODIFY 1 / REMOVE 0 / DEFER 0 | QA 06:13, 시작 main 동일 | PR #3006 | PROPOSED / 통합 대기, 다음 B v2022 |
