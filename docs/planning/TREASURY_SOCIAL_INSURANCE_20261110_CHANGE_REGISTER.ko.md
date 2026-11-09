# 국고·사회보험 신규·변경 기획 기록 및 비교 인덱스
> **특별 기간:** 2026-11-10 ~ 2026-11-11 오전 6시 (한국시간)
> **기록 버전:** vTSI.2026.11.10.003 · **상태:** 초안 / 문서 기록 전용
> **기존 기준선:** [고정된 기존 기획](TREASURY_SOCIAL_INSURANCE_20261110_BASELINE.ko.md)
> **원본:** [English canonical](TREASURY_SOCIAL_INSURANCE_20261110_CHANGE_REGISTER.md)
> **최우선 기획:** [PROJECT_PLAN.md](PROJECT_PLAN.md) 및 [INTEGRATED_PLANNING_MASTER.md](INTEGRATED_PLANNING_MASTER.md)

## 최초 상태 — 이번 특별 기간에 새로 기록한 변경
| 분류 | 건수 | 의미 |
|---|---:|---|
| ADD 새 기능 기획 | 1 | 신규 제안 1건, 미구현 |
| MODIFY 기존 기획 수정 | 1 | 직전 A회차 국고 대사 보완안 |
| REMOVE 기존 기획 삭제 | 0 | 삭제 제안 없음 |
| DEFER 보류 | 0 | 보류 기록 없음 |
| 통합기획서 반영 완료 | 0 | 실제 병합·반영을 주장하지 않음 |

이는 **변경 내용을 누적하기 위한 양식**이며 기존 기획이 없다는 뜻이 아니다. 코드 구현, QA 통과, 운영 반영의 증거도 아니다.

## 기존 기획 ↔ 새 기획 비교 인덱스 (매시간 갱신)
| ID | A QA 수정 / B 신규 | 분류 | 기존 문서 절·불변 링크 | 기존 설계 내용 | 새로운 내용·상세 기획 링크 | 버전·한국시간 | 우선순위 | 상태 | 실제 통합 PR |
|---|---|---|---|---|---|---|---|---|---|
| TSI-20261110-001 | A QA 수정 | MODIFY | [기준 main 기획서 FIN1518-03](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/PROJECT_PLAN.md) | 국고 미연계 552건, 탐색 24건/정규 0건은 과거 QA 주장 | 동일 스냅샷·SQL 버전 기반 읽기 전용 대사 증거 게이트 제안 | v2008 / 01:05 | P0 | PROPOSED, 통합 대기 | PR #3006 |
| TSI-20261110-002 | B 신규 | ADD | [기준 NPS 문서](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/NATIONAL_PENSION_SERVICE_SPEC.md) | 국민연금 제안은 존재하나 보험 간 자격변경 증빙함은 검증되지 않음 | 건강보험·연금 공통 자격변경 증빙 접수함 신규 제안 | v2010 / 02:05 | P1 | PROPOSED, 통합 대기 | PR #3006 |

## 누적 상세 기록
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

## 2026-11-10 01:05 KST — A회차 QA 기반 보완, v2008 / vTSI.2026.11.10.003
**TSI-20261110-001 | MODIFY | P0 | PROPOSED | 통합기획서 미반영.** 기존 기준선: main `edd709bcbe96f6f5ceca8372f244b632e8211242`의 `PROJECT_PLAN.md` FIN1518-03. QA v1394 문서상 국고 미연계 552건, 탐색 24건 대 정규 0건 불일치, MINT/SWF 출처 미검증. 이번 회차에서 실운영 재현은 하지 않았으며 실제 원인·영향은 **검증 불가**이다.

**개정안:** 잔액을 자동 수정하거나 WLD를 발행하지 않고, 동일 DB 스냅샷·SQL 버전·계정 범위·마감시각으로 중앙/보조 원장과 거래 출처를 읽기 전용 대사한다. 관리자 국고 > 대사 화면에서 실행 ID, 근거 해시, `PENDING/MATCHED/DISCREPANCY/INCONCLUSIVE/BLOCKED`를 표시하고 비식별 근거 내보내기·동일 스냅샷 재실행·독립 담당자 이관 CTA를 제공한다. 공개 검색 제외, 320px·키보드 접근성 지원.

**제안 내부 API(미구현):** `POST /internal/treasury/reconciliation-runs`(범위·마감·SQL버전·멱등성 키 → 202 실행 ID), `GET /internal/treasury/reconciliation-runs/:id`(건수·해시·출처·페이지), `POST /internal/treasury/reconciliation-runs/:id/escalate`(감사 이벤트). RBAC `treasury.reconcile.read/escalate`, MFA, 독립 승인, 403/409/422/429/503 안전 차단.

**제안 DB(미구현):** 추가 전용 실행/발견 테이블, 테넌트 복합 FK, (테넌트·멱등성 키) UNIQUE, (테넌트·실행·원본항목·발견유형) UNIQUE, 상태·시각 인덱스, 정수 WLD, FORCE RLS, REPEATABLE READ, 원본 해시, 감사 Outbox, 작업자 펜싱·유한 재시도. 추가형 마이그레이션, 기능 OFF 롤백, 감사 보존. 경고는 같은 스냅샷에서 반복 재현된 차이만 승격하고 지문 중복을 억제한다.

**검증·수용:** 동일 스냅샷/SQL에서 결정적 결과, 552 및 24/0 근거 재현 또는 반증, 잔액 무변경, 부분 장애 시 MATCHED 금지, 동시 멱등성, 테넌트 격리·비식별·접근성·복구 시험. 모두 **미실행**. P0 원장 출처·운영 SHA·DB 권한·독립 복원, P1 API/관리자 UI/격리 PG, P2 오탐·처리시간 KPI. 개발 B(DB/API), C(UI), A(통합), QA(재현) 담당 제안이며 배정·승인되지 않았다. 원문 기준선은 불변, 영문 상세 항목과 동등하며 PR #3006에서 검토한다.

**비교 인덱스:** FIN1518-03(기존 QA 미연계/불일치) → TSI-20261110-001(동일 스냅샷 대사 근거 게이트) → 통합기획서 반영 대기. 누적 ADD 0 / MODIFY 1 / REMOVE 0 / DEFER 0 / INTEGRATED 0. 이전 B v2006 → 현재 A v2008 → 다음 B v2010. 외부 독립 레퍼런스 신규 승인 0, 누적 UNKNOWN/10,000 BLOCKED/IN PROGRESS.

## 2026-11-10 02:05 KST 회차 기록
- Previous A v2008 → Current B v2010 → Next A v2012. ADD 1, MODIFY 누적 1, REMOVE 0, DEFER 0, INTEGRATED 0. 기준선 불변; main edd709b 확인. PR #3006은 문서 추적만 수행하며 QA/구현/배포 완료를 뜻하지 않음.
