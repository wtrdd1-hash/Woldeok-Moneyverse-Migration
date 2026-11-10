# 국고·사회보험 신규·변경 기획 기록 및 비교 인덱스
> **특별 기간:** 2026-11-10 ~ 2026-11-11 오전 6시 (한국시간)
> **기록 버전:** vTSI.2026.11.10.015 · **상태:** 초안 / 문서 기록 전용
> **기존 기준선:** [고정된 기존 기획](TREASURY_SOCIAL_INSURANCE_20261110_BASELINE.ko.md)
> **원본:** [English canonical](TREASURY_SOCIAL_INSURANCE_20261110_CHANGE_REGISTER.md)
> **최우선 기획:** [PROJECT_PLAN.md](PROJECT_PLAN.md) 및 [INTEGRATED_PLANNING_MASTER.md](INTEGRATED_PLANNING_MASTER.md)

## 최초 상태 — 이번 특별 기간에 새로 기록한 변경
| 분류 | 건수 | 의미 |
|---|---:|---|
| ADD 새 기능 기획 | 5 | 신규 제안 5건, 미구현 |
| MODIFY 기존 기획 수정 | 5 | QA 기반 기존 기획 수정 5건, 모두 제안 상태 |
| REMOVE 기존 기획 삭제 | 0 | 삭제 제안 없음 |
| DEFER 보류 | 0 | 보류 기록 없음 |
| 통합기획서 반영 완료 | 0 | 실제 병합·반영을 주장하지 않음 |

이는 **변경 내용을 누적하기 위한 양식**이며 기존 기획이 없다는 뜻이 아니다. 코드 구현, QA 통과, 운영 반영의 증거도 아니다.

## 기존 기획 ↔ 새 기획 비교 인덱스 (매시간 갱신)
| ID | A QA 수정 / B 신규 | 분류 | 기존 문서 절·불변 링크 | 기존 설계 내용 | 새로운 내용·상세 기획 링크 | 버전·한국시간 | 우선순위 | 상태 | 실제 통합 PR |
|---|---|---|---|---|---|---|---|---|---|
| TSI-20261110-009 | A QA 보완 | MODIFY | FIN1518-03·보험 기준 | 교차 기금 정산 출처 검증 불가 | 읽기 전용 정산 증빙 격리 (아래) | v2024 / 09:05 | P0 | PROPOSED | PR #3006 |
| TSI-20261110-008 | B 신규 | ADD | 불변 기준선 국고 예산·원장 | 교부금 예산 예약 절차 검증 불가 | 독립 교부금 예약·지급 승인 명세 | v2022 / 08:08 | P1 | PROPOSED | PR #3006 |
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
- **최초 기록:** 2026-11-10 06:09 KST; v2018 / vTSI.2026.11.10.009; 직전 A v2016 → 현재 B v2018 → 다음 A v2020. 기획 담당, 개발 B/C·QA 배정 대기. P1 / PROPOSED / 통합기획서 미반영.
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


### TSI-20261110-008 — 국고 교부금 예산 예약·독립 지급 승인 (ADD; B v2022)
- **기록:** 2026-11-10 08:08 KST 최초 등록, v2022 / vTSI.2026.11.10.009. 이전 A v2020 → 현재 B v2022 → 다음 A v2024. 기획 담당, 개발 B(API·원장)/C(UI), 독립 QA 연계 예정. P1, PROPOSED, 미구현·통합기획서 미반영. 불변 기준선 edd709bc의 국고 예산·원장 개념과 TSI-001/003/005/007 QA 출처 기획을 참조하며 기존 QA 증빙 기능과 중복하지 않음.
- **목적·사용자:** 국고 담당자가 게임 내 프로그램·대상·회계기간·정수 WLD 금액으로 교부금 배정안을 만들고, 별도 승인자가 가용 예산과 지급 근거를 검토. 현실 법정 보조금이 아닌 가상경제 기능이며 주민등록번호 등 현실 개인정보 수집 금지.
- **화면·권한:** 관리자 > 국고 > 교부금 > 신규 배정, CTA 초안 저장/제출/독립 승인/취소/전표 증빙 보기. 수혜자는 자신의 배정 상태만 조회. DRAFT → SUBMITTED → RESERVED → APPROVED → DISBURSEMENT_PENDING → POSTED, 거절·취소·만료·검토실패는 별도 종료 상태. 생성자·승인자·지급 실행자 권한 분리, 최근 MFA 및 2인 승인. 가용·예약·집행 WLD와 감사 해시 표시.
- **제안 API(미구현):** POST /internal/treasury/grants {programId,period,beneficiaryId,amountWld,policyVersion,idempotencyKey}; POST /internal/treasury/grants/:id/submit {expectedRevision}; POST /internal/treasury/grants/:id/decision {decision,expectedRevision,nonce}; POST /internal/treasury/grants/:id/disburse {expectedRevision,idempotencyKey}; GET /internal/treasury/grants/:id. treasury.grants.create/review/disburse RBAC, 401/403/404/409/412/422/429/503 안전 차단. 수혜자 조회는 별도 검토된 소유자 범위 API.
- **DB·정합성 제안:** treasury_grant_programs(tenant_id,program_id 복합 PK,period,appropriation_account_id,policy_version), treasury_grant_allocations(tenant_id,grant_id 복합 PK,program_id 복합 FK,beneficiary_id,amount_wld BIGINT 양수 CHECK,status,revision,requester_id,reviewer_id,created_at), 추가 전용 treasury_grant_events(테넌트 복합 FK, 해시 체인). UNIQUE(tenant_id,program_id,beneficiary_id,period,request_key), INDEX(tenant_id,program_id,status,created_at), FORCE RLS. 가용+예약+집행=편성예산을 동일 스냅샷·잠금 하에서 유지하고 SERIALIZABLE 재시도 또는 행 잠금으로 초과 예약 방지. 기존 국고 잔액만 재원으로 사용하며 승인 시 신규 발행 금지.
- **트랜잭션·보안:** 예약·CAS revision·감사·Outbox를 원자적으로 기록. 중앙·보조원장 균형 분개, 지급 참조 UNIQUE, 멱등 재시도·작업자 펜싱. 취소/만료는 기존 분개 수정 없이 보상 분개로 예약 해제. 자기 승인·교차 테넌트·중복 수혜·정책 변경·초과예산 차단. 타임아웃·Outbox 실패는 PENDING_REVIEW, 성공 간주 금지; 대사 불일치 시 지급 차단.
- **운영·수용 기준(미실행):** 비공개 noindex/no-store, 320px·키보드·WCAG 2.2 AA, 영한 오류 동등성, 개인정보 없는 승인 지연·중복지급·대사 KPI. 추가형 마이그레이션·백필 사전 검증, treasury_grant_reservations_v1 기본 OFF, 읽기 전용 관찰→격리 Test exact-SHA→독립 QA→서명 승격. 롤백은 플래그 OFF와 불변 증빙 보존, 미결 예약 수동 처리. 동시 초과예산·멱등성·권한분리·RLS·Outbox 재실행·만료 경합·원장 균형·E2E 회귀를 통과해야 함. P0 기존 국고 대사·운영 출처 HOLD, P1 API/DB/UI, P2 경고 품질. 외부 독립 레퍼런스 신규 0건, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS. 운영 변경 없음.
- **비교 인덱스:** 불변 기준선 국고 예산·원장 → TSI-20261110-008 ADD → 통합기획서 반영 대기, Draft PR #3006.

### TSI-20261110-009 — 보험·국고 정산 증빙 격리 게이트 (A, MODIFY, P0)
- 최초 기록 2026-11-10 09:05 KST, vTSI.2026.11.10.011. 직전 B v2022 → 현재 A v2024 → 다음 B v2026. PROPOSED, 통합기획서 미반영·시험 미실행. 기획 담당; 향후 Dev B API/DB, Dev C 관리자 UI, QA 독립 재현, Dev A 통합. Draft PR #3006은 문서 기록 전용.
- 고정 기준 PROJECT_PLAN.md FIN1518-03 및 TSI-001/003/007의 국고 출처·배포 HOLD. 기존 보험↔국고 분개 출처 독립 검증 불가 → 향후 보험료 납부·환급·국고 지원 정산 전에 읽기 전용 증빙 게이트 추가 제안. 실제 보험 운영 결함을 새로 재현한 것이 아님. 근본원인·영향 사용자·현 구현 검증 불가. 과거 QA v1394 국고 실패를 보험 결함으로 단정하지 않음.
- QA 재현 계약: 환경, frontend/backend 불변 SHA, 마이그레이션 체크섬, 테넌트 가명, event ID, 정책 버전, cutoff, SQL 버전, 동일 snapshot ID, 중앙·보조원장 정수 WLD 차변/대변 기대·실제 분개. 스냅샷·범위 다르면 INCONCLUSIVE, VERIFIED 금지. 운영 데이터 변경 없음.
- 회원: 보험 > 부과 내역 > 검증 상태 보기(의료·소득 원문 비공개). 감사자: 정산 증빙 > 분개 비교 / 격리 / 독립 검토 요청 / 비식별 증거 내보내기. EVIDENCE_PENDING/VERIFIED/DISCREPANCY/INCONCLUSIVE/BLOCKED; 타임아웃은 보류. 강제 지급·발행·자동 환급 CTA 없음. noindex/no-store, 320px 키보드/WCAG 2.2 AA.
- 제안 API: GET /api/insurance/settlements/:id/evidence (본인 비식별); POST /internal/insurance/settlement-evidence-runs {scope,cutoff,snapshotId,queryVersion,idempotencyKey} → 202; GET /internal/insurance/settlement-evidence-runs/:id; POST /internal/insurance/settlement-evidence-runs/:id/quarantine {reason,expectedRevision}. insurance.settlement.audit 및 독립 treasury.reconcile.escalate RBAC, MFA·2인 승인·테넌트 RLS; 403/404/409/422/429/503 안전 차단.
- 제안 DB: 추가 전용 insurance_settlement_evidence_runs(tenant_id,run_id,source_event_id,ledger_snapshot_id,source_sha,policy_version,query_version,status,revision,created_at), insurance_settlement_evidence_findings(tenant_id,run_id,entry_id,finding_type,proof_hash). 테넌트 복합 PK/FK, UNIQUE(tenant_id,source_event_id,ledger_snapshot_id,query_version), UNIQUE(tenant_id,run_id,entry_id,finding_type), INDEX(tenant_id,status,created_at), FORCE RLS. REPEATABLE READ 증빙 스냅샷·균형 이중기장·불변 감사/Outbox·멱등 펜싱 재시도. 추가형 기본 OFF 마이그레이션, 과거 분개 변경 금지.
- 수용(미실행): 동일 스냅샷 해시·건수 재현, 중복 요청 1회, Outbox 유실·부분 분개·오래된 revision·테넌트 침범·동시 작업자 시 검증 성공/중복 지급 금지. 독립 심사·비식별 출력·롤백·복원·격리 Test 정확 SHA E2E 필요. P0 배포 출처/ACL/복원·정산 HOLD, P1 API/DB/UI, P2 비식별 불일치 KPI. 외부 독립 근거 신규 0건, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS. 통합 반영 대기.


### TSI-20261110-010 — 국고 회계기간 마감 및 이월 통제 (B, ADD, P1)
- **기록:** 2026-11-10 10:08 KST, v2026 / vTSI.2026.11.10.011. 이전 A v2024 → 현재 B v2026 → 다음 A v2028. 기획 담당, 개발 B(API/DB)·C(관리자 UI)·QA 검증 담당 배정 대기. PROPOSED, 통합기획서 미반영, 구현 검증 불가.
- **기존 대비:** 고정 기준선 edd709bc의 국고 회계 개념과 TSI-008 교부금 예약은 존재하나, 기간 마감·미집행 예약 이월의 독립 검증 절차는 확인되지 않음. 게임 가상화폐 WLD용 신규 설계이며 현실 법률 적용 주장이 아님. 확인 근거는 main 3a7c345와 PR #3006 브랜치 3be9017; 이번 회차 실제 QA 재현은 미수행.
- **화면/권한:** 관리자 국고 > 회계기간 > 대사 > 마감 미리보기 > 승인 요청 > 독립 승인 > 증빙 내보내기. OPEN → CLOSE_REQUESTED → RECONCILING → APPROVED → CLOSED; 불일치 BLOCKED, 시간초과 REVIEW_REQUIRED. 작성자와 승인자 분리, MFA, treasury.period.close 권한, 감사자 읽기 전용, 개인정보 제외.
- **제안 API:** POST /internal/treasury/fiscal-periods/:id/close-preview {snapshotId,queryVersion,idempotencyKey}; POST /internal/treasury/fiscal-periods/:id/close-request {expectedRevision}; POST /internal/treasury/fiscal-periods/:id/approve {expectedRevision,proofHash}; GET /internal/treasury/fiscal-periods/:id/close-proof. 401/403/404/409/412/422/429/503 실패 시 차단, 공개 변경 API 없음.
- **DB 설계:** fiscal_periods(tenant_id,period_id PK,기간,status,revision), fiscal_close_runs(tenant_id,run_id PK,period_id FK,snapshot_id,query_version,proof_hash,status,requested_by,approved_by), fiscal_carryovers(tenant_id,carryover_id PK,source_period_id,target_period_id,appropriation_id,amount_wld BIGINT CHECK >=0,ledger_txn_id UNIQUE), 변경 불가 fiscal_close_events. 테넌트 복합 FK/unique·RLS·상태 인덱스, 기간 잠금과 SERIALIZABLE 재시도, 정수 WLD 이중기장, 기존 잔액만 이월(발행 금지), outbox/멱등성 키, 보상 거래로만 정정.
- **수용 기준 미실행:** 중앙·보조원장 합계 일치, 미대사 교부금 존재 시 마감 차단, 동시 요청 1회 반영, 교부금 지급과 마감 경합 직렬화, 자기승인·교차 테넌트 거부, 스냅샷 불일치·시간초과 차단, 복구 시 감사 보존, 320px/키보드/WCAG 2.2 AA, 영·한 동등, 비공개 noindex/no-store, 개인정보 없는 오류율 지표. 기본 OFF 확장 마이그레이션, 읽기 전용 미리보기→격리 exact-SHA Test→독립 QA→승인 승격.
- **비교 인덱스:** 기존 회계기간 개념 → TSI-20261110-010 ADD → PROJECT_PLAN.md 미반영 / PR #3006 추적. P0 대사·배포 증거 HOLD, P1 마감 구현, P2 경보 조정. 외부 독립 근거 이번 회차 0건, 누적 UNKNOWN/10,000 BLOCKED. 운영 코드·DB·잔액 변경 없음.


### 2026-11-10 11:05 KST — A QA 증거 재검토, v2028 / vTSI.2026.11.10.012 (기능 변경 0건)
- **회차:** 이전 B v2026 → 현재 A v2028 → 다음 B v2030. ADD 0 / MODIFY 0 / REMOVE 0 / DEFER 0. 기존 TSI-001/003/005/007/009는 PROPOSED, 통합기획서 반영 대기. 증거 없는 신규 기능·결함을 만들지 않음.
- **최신 QA 근거:** 10:15 KST `/srv/moneyverse-data/tasks/Moneyverse-QA-v2026.11.10.1015-internal.md`. 운영·Test `/api/version`은 모두 `727881420a491bb129a1a97258ea8ae67f62bbf8`로 원격 main `3a7c34507aff858cce71efbb10410a4a2f7c9ef8`와 다름. 홈페이지·헬스 HTTP 200은 브라우저 E2E가 아님. 레거시 `moneyverse-release-v1068-backend` NRestarts=197788 및 자동 재시작, 실제 의존성 미확인. 브라우저·Playwright·승인된 테스트 계정 부재로 금융 인증 E2E BLOCKED. main exact-SHA CI PASS 미확인. 신규 국고·보험 결함 및 근본원인 입증 불가.
- **P0:** 독립 exact-SHA 격리 Test, 중앙·보조원장 동일 스냅샷 대사, 백업 복원, RBAC, QA 증빙 전까지 배포·금융 쓰기 HOLD. **P1:** 개발 A 런타임 SHA/레거시 의존성 비파괴 조사, 개발 B 거래·마이그레이션 증빙, QA 승인된 브라우저 신원으로 재검증. **P2:** 개인정보 비식별 경보·접근성 화면. 기존 TSI-007/009와 중복되므로 UI/API/DB/권한 변경 0건. 테스트 NOT RUN, 외부 독립 레퍼런스 10,000건 확보 실수량 UNKNOWN / BLOCKED·IN PROGRESS.
- **비교:** 불변 기준선 `edd709bcbe96f6f5ceca8372f244b632e8211242` → 기존 TSI-007/009 변경 없음 → 영어 통합기획서 반영 대기 / Draft PR #3006. 이번 회차는 QA 증거 기록만 수행하며 구현·배포·운영 데이터 변경·PASS 주장 없음. 푸시 전 원격 main/기획 브랜치 재확인.


### TSI-20261110-011 — 가상 사회보험 기금 지급여력 스트레스 미리보기 (B, ADD, P1)
- **기록:** 2026-11-10 12:06 KST; v2030 / vTSI.2026.11.10.013. 이전 A v2028 → 현재 B v2030 → 다음 A v2032. 기획 담당, 개발 B API/DB·개발 C 관리자 UI·독립 QA 배정 대기. PROPOSED, 영어 통합기획서 미반영, 구현 검증 불가.
- **기존 대비/근거:** 불변 기준선 edd709bc의 국고·보험 항목, TSI-004 보험급여 심사, TSI-006 보험료 이의신청, TSI-008 교부금, TSI-010 회계기간 마감에는 **읽기 전용 기금 지급여력 스트레스 시나리오 증명**이 별도로 정의되지 않음. 최신 main 3a7c345, Draft PR #3006, 11:05 QA는 비인증 상태·버전만 확인하여 실제 지급여력 장애 주장은 하지 않음. 현실 건강보험/연금 법령이 아닌 게임 WLD 가상경제.
- **관리자 흐름:** 보험 > 기금 건전성 > 스트레스 미리보기에서 권한 있는 기금, 회계기간, 불변 원장 스냅샷, 가상 보험료/급여 정책 버전, 유리수 형태의 청구 증가 배율과 전망 기간 선택. '미리보기', '기준 시나리오 비교', '독립 검토 요청', '비식별 증명 내보내기'. DRAFT → QUEUED → CALCULATING → REVIEW_REQUIRED → REVIEWED; 증거 누락·오래된 스냅샷·음수 준비금은 BLOCKED/INCONCLUSIVE. 미리보기는 자금 이동·보험료율 변경·청구 승인을 하지 않음. 감사자 읽기 전용, 가입자별 정보 비노출.
- **제안 API(미구현):** POST /internal/insurance/funds/:id/stress-previews {snapshotId,policyVersion,horizonPeriods,scenarioNumerator,scenarioDenominator,idempotencyKey} → 202 runId; GET /internal/insurance/funds/:id/stress-previews/:runId → 서명된 집계 결과; POST /internal/insurance/funds/:id/stress-previews/:runId/review {expectedRevision,decision,nonce}. insurance.fund.simulate와 insurance.fund.review 권한 분리, 검토 시 최근 MFA, 자기 승인 금지. 401/403/404/409/412/422/429/503 차단, 외부 변경 API 없음.
- **DB 정규화:** insurance_fund_stress_runs(tenant_id,fund_id,run_id 복합 PK,ledger_snapshot_id,policy_version,horizon_periods CHECK 1..36,scenario_num BIGINT CHECK >=0,scenario_den BIGINT CHECK >0,opening_reserve_wld BIGINT,projected_inflow_wld BIGINT,projected_outflow_wld BIGINT,closing_reserve_wld BIGINT,revision,status,requested_by,reviewed_by,proof_hash,created_at), 변경 불가 insurance_fund_stress_events 테넌트 복합 FK. UNIQUE(tenant_id,fund_id,idempotency_key), index(tenant_id,fund_id,status,created_at), FORCE RLS. 정수 연산·오버플로 방어·결정적 반올림, 실수 화폐·개인정보 금지.
- **정합성/운영:** 중앙·보조원장 동일 불변 스냅샷의 잔액 일치가 전제. CPU/시간·테넌트별 호출 제한, 스냅샷+정책+시나리오 해시로 재현성 확보. 멱등 큐/outbox, fencing worker, 중복 효과 없는 재시도, 오래된 정책/원장은 INCONCLUSIVE. 작성자·검토자 분리, 비식별 불변 감사, 경고는 연속 2회 동일 증거와 최소 표본 기준으로 오탐 억제. 기능 플래그 기본 OFF, 추가형 마이그레이션, 롤백 시 감사 보존.
- **수용 기준(미실행):** 같은 입력의 같은 증명, 원장 불일치 차단, 테넌트 침범·자기승인·오래된 revision 거부, 오버플로·분모 0·중복 동시 요청·outbox 장애·오래된 정책·누락 스냅샷·음수 준비금 안전 처리, 금융 원장 쓰기 0건. 승인된 exact-SHA 격리 Test E2E, 320px·키보드·WCAG 2.2 AA·영한 UI 동등, 비공개 noindex/no-store. 지표는 비식별 처리 지연·불일치율·오탐률. P0 운영 출처/원장 대사 HOLD, P1 개발·독립 QA, P2 지표. 외부 독립 레퍼런스 신규 0건, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS.
- **비교 인덱스:** 기존 가상 보험기금 개념 → TSI-20261110-011 ADD → PROJECT_PLAN.md 미반영 / Draft PR #3006 추적. ADD 1 / MODIFY 0 / REMOVE 0 / DEFER 0. 운영 코드·DB·자금·배포 변경 없음.


### 2026-11-10 13:05 KST — A QA 근거 재검토, v2032 / vTSI.2026.11.10.014 (기능 변경 0건)
- **회차:** 직전 B v2030 → 현재 A v2032 → 다음 B v2034. ADD 0 / MODIFY 0 / REMOVE 0 / DEFER 0. TSI-001~011 원문 및 사용자 철회 오해 정정은 그대로 보존한다. 정본 반영이나 실제 구현 완료로 간주하지 않는다.
- **실제 근거:** 13:02 KST 미니PC 조회에서 백엔드/프론트엔드/Discord/MCP/nginx/docker 활성, 개발용 PostgreSQL 연결. 운영 측 /api/version은 727881420a491bb129a1a97258ea8ae67f62bbf8, 독립 재조회한 원격 main은 3a7c34507aff858cce71efbb10410a4a2f7c9ef8로 다르지만 배포 결함 여부는 미검증. 12:14 QA 보고서는 운영/Test HTTP 200과 버전 일치를 확인했으나 브라우저 E2E, 인증 금융 흐름, 원장 대사, exact-SHA 격리 Test, 백업 복구, CI PASS를 검증하지 못했다. 구형 v1068 백엔드 활성화/재시작 반복 NRestarts=199155는 QA 보고값이며 의존성·영향은 미확인. 국고/보험의 신규 재현 결함 증거가 없어 허구의 수정 기획을 추가하지 않는다.
- **P0 HOLD:** 동일 스냅샷 중앙·보조원장 대사, 배포 SHA 출처, DB 권한, 복구 및 독립 QA 확인 전 금융 쓰기/운영 승격 금지. **P1:** 개발 A는 구형 서비스 의존성과 배포 SHA 확인, 개발 B는 읽기 전용 국고·보험 거래 출처 확인, QA는 승인된 브라우저 계정과 Test E2E 확보. **P2:** 관측 근거 확립 후 접근성·경고 오탐 억제 지표 검토.
- **변경 범위:** UI/API/DB/RBAC/마이그레이션 0건, 운영 코드·잔액·배포 변경 없음. 제안 테스트 실행하지 않음. 이번 회차 외부 독립 근거 0건, 누적 중복 제거 수량 UNKNOWN/10,000으로 BLOCKED. 불변 기준선 edd709bc 및 기존 비교 인덱스 유지. 다음 B는 신규 기능 선정 전에 정본 반영·실제 구현 중복을 검사한다.
- **근거:** 13:02 미니PC 상태, /srv/moneyverse-data/tasks/Moneyverse-QA-v2026.11.10.1214-internal.md, 원격 main 3a7c345, 추적 PR #3006. 영문과 동등한 QA 검토 기록이다.


### TSI-20261110-012 — 사회보험 급여 중복지급 사전 점검 (B 신규, P1)
- **기록:** 2026-11-10 14:05 KST; v2034 / vTSI.2026.11.10.015. 이전 A v2032 → 현재 B v2034 → 다음 A v2036. PROPOSED / 정본 미반영 / 구현 미확인. 기존 TSI-001~011 원문 보존. 기획 전용; 개발 B API/DB, 개발 C UI, 독립 QA 미실시.
- **이전/근거:** 불변 기준선 edd709bc, 최신 원격 main 3a7c345, Draft PR #3006. 기존 TSI-004 급여 심사 및 TSI-011 지급여력 시뮬레이션만으로는 프로그램 간 **중복지급 사전 점검**이 입증되지 않는다. 운영 결함 재현이 아니라 미검증 신규 제안이며 실제 구현 중복 여부는 추가 코드 확인 필요.
- **회원·관리자 흐름:** 회원 > 급여 > 내 청구 상태에서 본인 결과·심사 사유·이의신청 CTA만 표시. 권한 있는 심사자 > 지급 대기 > 중복 사전 점검 > 마스킹된 증빙 > 별도 지급 승인 또는 독립 심사 보류. PENDING → PREFLIGHT_RUNNING → CLEAR/POSSIBLE_DUPLICATE → INDEPENDENT_REVIEW → RELEASED/BLOCKED. 증거 누락·스냅샷 만료는 INCONCLUSIVE이며 자동 거절 금지. 신청자·심사자·지급 승인자 직무 분리. 실제 한국 보험 법령이 아닌 가상 WLD 정책 버전·적용일 기준.
- **내부 API 제안(미구현):** POST /internal/insurance/claims/:id/duplicate-preflight {policyVersion,snapshotId,idempotencyKey,expectedRevision} → 202 runId; GET /internal/insurance/claims/:id/duplicate-preflight/:runId → 마스킹된 일치 사유·증거 해시; POST /internal/insurance/claims/:id/duplicate-resolution {runId,decision,reasonCode,expectedRevision} → 별도 심사자 및 최신 MFA 필수. 401/403/404/409/412/422/429/503 fail closed. 공개 타인 조회나 미리보기 지급 쓰기 없음.
- **정규화 DB 제안:** benefit_preflight_runs(tenant_id,run_id PK,claim_id FK,policy_version,snapshot_id,claim_revision,status,idempotency_key,created_by,created_at,proof_hash, UNIQUE(tenant_id,claim_id,idempotency_key)); benefit_match_evidence(tenant_id,run_id FK,match_id PK,matched_claim_digest,reason_code,window_start,window_end,source_event_digest) 원본 개인정보 미저장; benefit_resolution_events 불변 감사. tenant 복합 FK, FORCE RLS, tenant/claim/status 및 tenant/run 인덱스, 최소권한 SECURITY DEFINER. 파생 민감정보 보존·삭제 정책 보안 검토 필요.
- **정합성·복구:** 중앙/보조원장과 청구 이벤트의 동일 불변 스냅샷 사용. 동일 원장 거래 ID·청구 이벤트 해시는 지급 보류 후 사람 심사, 유사 일치는 참고용만. SERIALIZABLE 또는 revision fencing, 멱등성·outbox·재시도·불변 감사. 실제 지급은 별도 승인된 기존 원장 경로로만, 정수 WLD 이중기장·발행 금지. 오래된 증거·해시 불일치·큐 장애·부분 마이그레이션 시 INCONCLUSIVE/기능 OFF; 원장 취소는 별도 독립 승인 보상 거래만.
- **수용 기준(미실행):** 같은 입력의 결정적 해시, 중복·동시 요청 1회 효과, tenant 격리, 자기 승인 거부, 증빙 마스킹, 320px 키보드/WCAG 2.2 AA, 영한 동등, no-store/noindex, 이의신청, 20명 이상 집계 오탐 지표, 만료 증거 지급 차단, 미리보기 원장 쓰기 0. 기본 OFF·추가형 마이그레이션·격리 Test exact-SHA 검증 후 승인. P0 금융/출시 근거 HOLD, P1 보안·구현·QA, P2 집계 분석. 이번 회차 외부 독립 근거 0, 누적 UNKNOWN/10,000 BLOCKED.
- **비교:** 불변 기준선 급여 통제 → TSI-20261110-012 ADD → PROJECT_PLAN.md / INTEGRATED_PLANNING_MASTER.md 반영 대기; PR #3006은 추적용. 이번 회차 ADD 1/MODIFY 0/REMOVE 0/DEFER 0. 누적 건수는 전체 대장 검증 후 확정. 운영 코드·DB·잔액·배포 변경 없음.
