# 국고 회계 증거·안전 조회 모델 상세 설계 — v2026.10.15.678

**상태:** P0 1차 구현 후보, 실제 지급 승인 아님. [English canonical](2026-10-15-treasury-finance-evidence-v678.md)

## 목적과 기존 계약
사용자는 국고 전체 기획을 상세화하고 코딩도 진행하도록 요청했다. v676 국고 전수 분석에서 운영 prod-v600의 시간당 SWF 합성수입, 국고 대사 `RECONCILED/0` 고정, 국고 보조원장과 Economy Core의 출처 분리, 과도한 DB 권한을 확인했다. 상위 PROJECT_PLAN/INTEGRATED_PLANNING_MASTER 및 v523/542의 **국고 재정 이전은 발행이 아니며, 모든 실제 지급은 복식원장**을 따른다. 기존 v675 그랜트 PR #857, v676 감사 PR #859와 파일 충돌 없이 작업한다.

## 선택한 첫 개발단계
기존 `getReconciliation`와 `getOverview.reconciliation`을 독립 **읽기 전용 국고 금고 대 국고 보조원장 차변·대변 이동** 검사로 변경한다. 금고별 현재 잔액과 `sum(balance_after - balance_before)`를 비교하고(금고별 절댓값 차이를 합산), 시각/ID로 정렬된 원장의 이전 행 잔액 연속성과 변동액 대 기록액을 검사한다. 합산상 다른 금고의 오차가 상쇄되어 정상 표시되는 일을 막는다.

판정은 `DISCREPANCY`(금고/보조원장 실제 차이 또는 행 연속성 결함), `UNVERIFIED`(내부 보조원장 일치하더라도 공식 Economy Core와 자금 출처·부채 연결이 확인되지 않음), `RECONCILED`(미래에 검증된 복식원장 연계 시에만 가능)로 한다. 이번 단계는 **정상 확정 판정을 만들지 않는다**. `journal_integrity_issues` 건수를 추가한다.

관리자 조회의 `available_wld`, `coverage_days`는 회계 권위가 없는 상태에서 0으로 내리고, 모바일 포함 UI에서 ‘대사 미검증(지급 보류 권고)’과 ‘금고/보조원장 불일치’를 구분한다. JS Number 대신 PostgreSQL NUMERIC/문자열을 쓴다. **지급 SQL의 직접 실행을 기술적으로 차단한 것은 아니므로 이를 안전 전환 완료로 주장하지 않는다.**

## 대안과 제외
- 기존 `RECONCILED/0` 유지: 허위 정상 노출이므로 폐기.
- 185M 금고 잔액을 Economy Core 계정(0 WLD)으로 강제 복사: 근거 없는 통화 발행 위험, 폐기.
- **선택:** 금고 내부 회계만 검사하고 정식 경제원장 연결 검증 전에는 `UNVERIFIED` 유지.

## 전체 개발 순서
G0 운영 SWF 자동합성 실행 통제(스냅샷/롤백/권한검증 포함), 운영 설정 변경은 별도 안전승격 증명과 함께 실행.
G1 **이번 코드:** 실잔액 대사 조회·타입·한국어 UI·테스트.
G2 별도 Test DB 복원: 초기 시드/회계 브리지, 연금·국채·세금·지급의 복식부기, 보호준비·부채, 승인·멱등·DB 권한 최소화.
G3 공개 국고 API의 가짜 지급기록·기본값 제거, 주민 예산 1인 1표 DB, 창업지원금 진정한 신청자 UUID·심사/실지급 분리.
G4 복지·기부·지원금·SWF/부채·조폐/소각 실제 원자적 지급 검증.
G5 별도 브랜치 CI, 동일 SHA Test·복원 DB·관리자/모바일·롤백·세션, 무중단 Production 승격. 하나라도 불합격이면 중단.

## 수용조건
- TDD: 정상 원장도 `UNVERIFIED`, 일치하지 않는 금고·원장 연속성→`DISCREPANCY`, 유입/유출 부호, 원장 누락·큰 정수·합산상 상쇄 경우 검사.
- Backend typecheck/build, UI 타입·테스트, 기본 503 안전 경계 회귀. 생산 DB 읽기 외 변경 없음.


## 참조 자료 및 적용 지점
- IMF, [Treasury Single Account: Concept, Design and Implementation Issues](https://www.imf.org/en/publications/wp/issues/2016/12/31/treasury-single-account-concept-design-and-implementation-issues-23927): 분리된 재정계좌의 잔액과 실제 가용현금을 통합 관리해야 한다. **통합계좌는 조폐 권한이 아님**.
- PostgreSQL, [17판 MVCC/일관성](https://www.postgresql.org/docs/17/applevel-consistency.html): 회계 동시성·가용재원 확정은 단일 SELECT보다 강한 쓰기측 트랜잭션·잠금 검증이 필요하다.
- PostgreSQL, [EXECUTE/PUBLIC 권한](https://www.postgresql.org/docs/18/ddl-priv.html): 기본 함수 실행 공개를 좁은 역할별 권한으로 바꾸며, 운영 전체 권한은 롤백 검증 후 점진 전환한다.
