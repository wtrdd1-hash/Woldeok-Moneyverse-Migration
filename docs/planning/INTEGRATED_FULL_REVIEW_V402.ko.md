# 월덕 머니버스 — 통합 기획 전면 재검토 v2026.09.23.402

> 상태: 전면 재검토 진행 / 1단계 권위·계약 감사
> 날짜: 2026-09-23
> 시작 기준: origin/main 7b705e1d37e97ccd05ba12042c3fd8d582e396d0
> 상위 기획 권위: INTEGRATED_PLANNING_MASTER v2026.09.23.401
> 영문 기준: [INTEGRATED_FULL_REVIEW_V402.md](INTEGRATED_FULL_REVIEW_V402.md)

## 0. 재검토 원칙

이번 회차는 전체 기획체계를 현재 저장소 증거, 런타임 계약, 최신 표준, 최근 사용자 결정과 다시 대조한다. 과거 절은 증거로 보존하지만 과거 상태 문구를 자동으로 현재 상태로 간주하지 않는다. 모든 P0/HIGH/P1 미해결 항목은 최신 증거로 재확인하거나 exact evidence로 종료하거나 stale historical evidence로 재분류한다.

기획 문서 변경만으로 런타임 구현·Test 완료·Production 승격을 주장하지 않는다.

## 1. 전수 인벤토리

1단계 기계적 전수검사에서 `docs/planning` 최상위 문서는 166개이며 영문 83개·한국어 83개다. EN/KO 짝 누락은 0건이고 최상위 기획 문서의 상대 Markdown 링크 깨짐도 0건이다.

현재 런타임 소스에는 backend controller 파일 58개, module 41개, service 27개, backend test/spec 153개가 있다. 단순 HTTP decorator 탐색은 361개를 찾았다. 이 숫자는 탐색 신호이며 generated API contract를 대체하지 않는다.

`frontend/src`에는 현재 554개 소스 파일이 있다.

## 2. 즉시 확인된 권위 gap

### G402-01 — P0 기획 권위 버전 드리프트

`PROJECT_PLAN.md/.ko.md`는 아직 현재 통합 버전을 v2026.09.23.397로 선언하지만 `INTEGRATED_PLANNING_MASTER`는 이미 v2026.09.23.401이다. PROJECT_PLAN은 구현 대면 권위 계약이라고 스스로 선언하므로 이 불일치는 단순 표기 문제가 아니다.

필수 수정:
- PROJECT_PLAN 권위 헤더를 v2026.09.23.402로 올린다.
- v398~v401 델타가 현재 권위에 포함됨을 기록한다.
- v397 이전 기록은 역사 증거로 보존하되 최신 정책을 덮어쓰지 못하게 한다.
- 향후 integrated master 버전 변경은 동일 기획 작업 단위에서 PROJECT_PLAN 권위 marker도 함께 갱신한다.

수용조건: PROJECT_PLAN 영/한과 INTEGRATED_PLANNING_MASTER 영/한이 동일 현재 버전과 동일 superseding review를 표시한다.
### G402-02 — P1 API 인벤토리 드리프트는 생성 증거가 필요

네이티브 앱 계약은 아직 v2026.09.23.388 기준 backend 57 controller / 총 335 endpoint / mobile contract 179 endpoint를 기록한다. 현재 소스 탐색은 controller 파일 58개와 HTTP method decorator 361개를 찾았다.

두 숫자는 동일 계산법이 아니므로 "361이 새 공식 endpoint 수"라고 확정하지 않는다. 결론은 기존 수치가 generator 재실행과 semantic diff 전까지 stale일 가능성이 있다는 것이다.

필수 수정:
- 의존성이 갖춰진 환경에서 `pnpm api:contract:check`를 다시 실행한다.
- method/path/auth/request/response/error/idempotency/resource-limit 인벤토리를 생성한다.
- 추가/삭제/행동변경을 분류한다.
- generated evidence로만 mobile contract 영/한을 갱신한다.
- 승인 API inventory에 없는 runtime route는 CI에서 실패시킨다.

현재 로컬 증거: 이 worktree에는 TypeScript toolchain/node_modules가 없어 `api:contract:check`가 `tsc: not found`로 실행 불가다. 이는 PASS가 아니라 BLOCKED 증거다.

### G402-03 — P1 현재 상태 원장과 역사 incident가 혼재

PROJECT_PLAN에는 과거 날짜의 P0/HIGH incident와 release gate가 다수 누적되어 있다. 역사 보존 자체는 맞지만 현재 상태를 한눈에 판정할 단일 active-status ledger가 없다.

다음 상태를 분리하는 현재 원장을 추가한다.
- 현재도 OPEN이며 최신 증거로 재현됨
- 코드 수정 완료지만 exact-SHA Test 대기
- Production 재검증 필요
- CLOSED
- 역사/stale 증거이며 재검증 필요

각 row는 gap ID, 최신 evidence SHA/date, status, workstream, acceptance gate, superseding version을 가진다. 과거 본문만으로 현재 상태를 결정하지 않는다.

### G402-04 — P1 명시적 TODO 재검증

권위 기획에는 `AUTH-105-02` verify-email 앱 문서 stale TODO와 `OPS-CACHE-156-01` permanent cache fix TODO 등이 아직 남아 있다. 현재 main과 다시 대조해 exact evidence로 종료하거나 현재 active-status ledger로 승격한다.
## 3. 최신 표준 재확인

이번 재검토에서 다시 확인한 현재 기준:
- OWASP ASVS latest stable: 5.0.0
- NIST SP 800-63-4 / SP 800-63B-4: 2025-07 final
- OpenAPI 최신 published specification: 3.2.1, 2026-09-10
- WCAG 2.2: W3C Recommendation 기준 유지, ISO/IEC 40500:2025 매핑
- W3C ACT Rules Format 1.1: 2026-02 Recommendation. 가능한 접근성 반복검사는 ACT 형식의 재현 가능한 rule evidence로 구조화한다.

표준 참조는 표준명·버전·발행/상태일·source URL을 하나의 provenance tuple로 관리한다. 새 버전이 나왔다고 자동 채택하지 않고 tooling compatibility와 conformance 증거를 요구한다.

## 4. 전면 재검토 도메인

전체 기획을 다음 12개 권위 lane으로 다시 검사한다.

1. 인증/세션/OAuth/security center/admin privilege
2. 경제/jobs/rewards/sinks/treasury/banking/business
3. 주식/시장 이벤트/AI 시나리오/casino
4. inventory/collection/crafting/marketplace/entitlement
5. community/1대1 채팅/friends/clubs/UGC/moderation
6. notification/search/public content/newspaper/SEO
7. native app/BFF/API contract 및 web/mobile parity
8. UI/UX/responsive/accessibility/i18n 및 사람 제작 route 검수
9. AI 시스템/model governance/fail-safe/결정론 권위
10. data/DB/migration/ledger/reconciliation/backup/restore
11. CI/CD/Test/Production lineage, 무중단, session continuity
12. analytics/experiments/monetization/privacy/compliance

각 lane은 구현증거, 기획충돌, 빠진 API/data contract, security negative test, QA 상태, release gate, rollback 계약을 기록한다.

## 5. 유지되는 전역 불변조건

명시적 최신 증거가 supersede하지 않는 한 다음 최근 결정은 유지한다.
- 일반 직업 참여·숙련도는 기본 무제한이지만 단위시간당 WLD 발행은 서버 권위 페이싱한다.
- Economy AI/ABM/RL은 advisory/shadow/bounded이며 결정론 원장 권위를 대체하지 않는다.
- 서버 기능은 같은 구현 작업 단위에서 완전한 API 계약을 가진다.
- 공개 client에는 내부 제어 endpoint, anti-abuse threshold, secret을 노출하지 않는다.
- 정상 재시작/업데이트/blue-green 전환으로 유효 로그인 세션을 강제 종료하지 않는다.
- 구현 변경은 branch → tests → exact-SHA Test → backend/API/DB/user-flow 확인 → main → 무중단 Production → smoke/rollback 순서를 따른다.
- 기획 완료와 런타임 구현 완료를 구분한다.

## 6. 1단계 완료조건

권위 버전 드리프트 수정, current-status ledger 생성, API contract drift를 generated proof 대기 상태로 명시, 영/한 동기화가 완료돼야 1단계를 통과한다. 이는 전체 도메인 재검토 종료가 아니라 이후 전면 감사를 위한 깨끗한 권위 기준선을 만드는 단계다.

## 7. 현재 active-status 원장 — v402 1단계

| ID | 심각도 | 현재 상태 | 최신 증거 | 수용 게이트 |
|---|---|---|---|---|
| G402-01 | P0 | OPEN / 이번 기획 브랜치에서 정정 | PROJECT_PLAN v397 vs master v401 | 권위 4문서가 모두 v402와 동일 superseding review 표시 |
| G402-02 | P1 | BLOCKED / generated proof 필요 | 소스 탐색 58 controller / 361 decorator, mobile spec 57/335/179, 로컬 contract check는 tsc/node_modules 부재로 blocked | 의존성 완비 환경 generated contract + semantic diff + 영/한 동기화 |
| G402-03 | P1 | OPEN | PROJECT_PLAN의 역사 P0/HIGH 기록과 현재 상태가 혼재 | current status ledger를 권위화하고 재검증 전 과거 기록을 historical로 취급 |
| G402-04 | P1 | REVALIDATE | AUTH-105-02, OPS-CACHE-156-01 명시 TODO 잔존 | current-main 코드/런타임 exact evidence로 각각 close 또는 reopen |

REL-DOCS, BAK, OPS status, Work-clock, casino, admin navigation 등 과거 ID는 v402가 임의로 OPEN/CLOSED 처리하지 않는다. 전체 재검토 완료 전 각 도메인 lane에서 현재 증거로 다시 판정한다.
