# API 관측성 관제 타워 상세 명세

[English canonical](API_OBSERVABILITY_CONTROL_TOWER_SPEC.md) | **한국어**

> 버전: v2026.09.27.468
> 상태: PLANNING / P0 릴리스 게이트 권위
> 적용 범위: 모든 release-candidate HTTP API, BFF/API gateway, 관리자 control-plane endpoint, 외부 integration endpoint, infrastructure probe, 별도 인벤토리하는 realtime transport
> Runtime/Test/Production 완료 주장: 이번 기획 회차에는 없음

## 1. 목적과 절대 원칙

관리자 API 헬스 화면은 화면용 숫자를 만들어 보여주는 페이지가 아니라 **증거 기반 운영 관제 타워**가 되어야 한다. 화면에 표시하는 endpoint 수, health, latency, success rate, availability, 폐기 상태는 모두 exact release SHA의 소스 인벤토리와 신선한 런타임 증거에서 파생해야 한다.

**데이터 없음은 정상 상태가 아니다. 오래된 데이터는 실시간이 아니다. 하드코딩 또는 랜덤 숫자는 텔레메트리가 아니다. 큐레이션 문서에서 빠진 endpoint가 자동으로 폐기된 것도 아니다.**

이 명세는 PROJECT_PLAN v397 기능/API 정합 계약, v442 전 경로 QA, v440 관리자 반응형 게이트, v441 서버 권위 control-state 규칙을 보강한다.

## 2. 시작 SHA에서 확인한 필수 보완 사항

아래는 v468 시작점 origin/main 8493d69e2283bf6526b52752ea2242b707160830 관측값이다. 앞으로 수정될 런타임이 이미 해결됐다는 뜻은 아니다.

| ID | 심각도 | 관측 내용 | 필수 조치 |
|---|---|---|---|
| OBS-468-01 | P0 | frontend 관리자 API-health 페이지가 14개 도메인 로컬 상수를 사용한다. 합계는 89개인데 화면 설명은 300+ API라고 한다. | 로컬 truth를 제거하고 exact-SHA 인벤토리와 실측 텔레메트리를 서버에서 받아 렌더링한다. |
| OBS-468-02 | P0 | backend 관리자 API-health controller도 고정 도메인 수, 고정 latency, 100% success와 HEALTHY를 반환한다. | 합성 상수를 제거하고 실제 측정값과 freshness/coverage 상태를 반환한다. |
| OBS-468-03 | P0 | 진단용 controller scan에서 HTTP decorator 333개, 고유 method/path 328개, 최상위 prefix 30개가 관측되어 dashboard 89개 denominator와 크게 다르다. | regex 진단 수치를 새 상수로 쓰지 말고 source/build metadata 기반 권위 manifest를 생성한다. |
| OBS-468-04 | P0 | 현재 소스에 casino route decorator가 남아 있는데 dashboard/catalog는 완전 제거됐다고 표현한다. | 소스·feature/legal policy·lifecycle을 대사한다. 소스에 실행 route가 있으면 decommissioned라고 표시할 수 없다. |
| OBS-468-05 | P0 | 관측한 API-health controller에는 session/auth/consent/CSRF guard는 있으나 명시적 관리자 guard가 보이지 않는다. | 운영 텔레메트리를 명시적인 관리자 control-plane 경계로 제한하고 음성 권한시험을 남긴다. |
| OBS-468-06 | P0 | frontend telemetry-pulse에 고정 경제값과 3초마다 랜덤으로 바뀌는 latency가 있고 소스 주석도 가상 텔레메트리라고 한다. | Production 가짜 텔레메트리를 금지한다. 실제 관측값 또는 Production 외부의 명확한 demo fixture만 허용한다. |
| OBS-468-07 | P1 | API_CATALOG_MASTER, 모바일 계약, backend 소스가 서로 다른 API 부분집합을 표현한다. | 각 문서 범위를 분리하고 generated manifest와 대사하며 어떤 부분집합도 모든 API denominator로 오용하지 않는다. |
| OBS-468-08 | P0 | API_CATALOG_MASTER는 internal backend 3001과 generic /api/v1 proxy를 적지만 CURRENT_RUNTIME_BASELINE은 Production backend/frontend 3000/3001, Test 3100/3101을 기록한다. | deployment identity/exposure를 runtime config와 generated edge/BFF inventory에서 파생하고 stale port 또는 검증되지 않은 public backend prefix를 hard-code하지 않는다. |

## 3. 전수 인벤토리 계약

### 3.1 소스 파생 manifest

모든 exact release candidate는 Test 배포 전에 machine-readable API manifest를 생성한다.

1. NestJS controller route: HTTP method, 정규화 route template, controller/method owner, source location.
2. Next.js route handler와 BFF/gateway route: app-api forwarding policy와 server-only proxy 경계.
3. 외부 integration/webhook endpoint와 exact-match public integration path.
4. infrastructure health/readiness/liveness probe.
5. Socket.IO/WebSocket 등 realtime transport는 REST로 가장하지 않고 namespace/event 별도 inventory로 관리.
6. client 동작에 영향을 주는 redirect/alias/app-safe alias.
7. feature-disabled, deprecated, compatibility, source-present-but-blocked endpoint. 실제 소스 제거 전에는 manifest에서 지우지 않는다.

Manifest에는 releaseSha, generatedAt, generator version, manifest schema version, deterministic manifest hash를 기록한다. method + normalized route template + transport를 안정 route identity로 사용하고 dynamic ID/query/user value로 metric route를 증식시키지 않는다.

### 3.2 필수 분류

모든 discovered route는 access class 하나와 lifecycle state 하나를 갖는다.

Access class: PUBLIC, MEMBER, ADMIN, INTEGRATION, INTERNAL, PROBE.

Lifecycle: ACTIVE, FEATURE_DISABLED, DEPRECATED, SOURCE_PRESENT_BLOCKED, DECOMMISSIONED.

DECOMMISSIONED는 exact candidate에 해당 실행 route가 없고 compatibility/edge 경로로도 도달할 수 없을 때만 허용한다. feature flag가 거절을 반환하는 것은 FEATURE_DISABLED 또는 SOURCE_PRESENT_BLOCKED다.

### 3.3 1:1 전수 불변조건

**발견 manifest route = 분류 route = telemetry registry route = QA ledger route**

설명되지 않는 count 차이, duplicate route identity, 미분류 route, 활성인데 미계측인 route, 문서화되지 않은 edge alias는 P0 coverage 결함이다. 제품 도메인 묶음은 full manifest의 view일 뿐 전체 API denominator를 대체할 수 없다.

## 4. 텔레메트리 진실 모델

### 4.1 실제 트래픽 계측

활성 route마다 request/response count, 2xx/3xx/4xx/5xx, timeout/cancellation/abort, p50/p95/p99/max용 server-duration histogram, 지원 시 in-flight, rate-limit/rejection, dependency failure attribution, last observed/last success/last server failure, exact release SHA/service instance/environment, 비밀정보 없는 sampled correlation identity를 수집한다.

업무 validation 실패와 권한 거절은 서버 availability와 분리한다. 정상 4xx가 많다고 서버 장애로 계산하지 않고, 5xx/timeout을 전체 성공률 안에 숨기지 않는다.

### 4.2 Active probe

Synthetic probe는 실제 traffic과 분리된 증거 채널이다.

- Production probe는 read-only 또는 명시적으로 side-effect-free여야 한다.
- 금융, 계정, 모더레이션, 국고, 인벤토리, 주문 mutation을 green 표시 목적으로 실 Production 사용자/자산에 주기 실행하지 않는다.
- mutation coverage는 isolated Test에서 deterministic fixture, idempotency key, cleanup/reconciliation 증거로 수행한다.
- public/member/admin/integration 경로는 각자 올바른 인증 경계를 사용한다.

### 4.3 Dependency health

각 route가 실제 사용하는 PostgreSQL, cache/queue, 외부 identity provider, media/object storage, outbound integration 등 핵심 dependency를 별도 상태로 표시한다. 다른 정상 route가 dependency 장애를 가릴 수 없다.

## 5. Freshness와 false-green 방지

모든 집계와 endpoint row는 observation window와 lastUpdatedAt을 표시한다. 데이터 품질은 FRESH, STALE, NO_DATA, PARTIAL, UNKNOWN 중 하나다.

완전한 FRESH 데이터만 무조건 healthy aggregate에 포함할 수 있다. STALE, NO_DATA, PARTIAL, inventory mismatch를 frontend fallback으로 100%, 0 ms, OPERATIONAL로 바꾸는 것을 금지한다.

Dashboard에는 발견 route, active route, instrumented route, fresh observation route, disabled/deprecated/source-present-blocked route, unknown/uninstrumented route, manifest/telemetry coverage percentage를 최소 표시한다.

100% healthy는 exact candidate의 완전한 active inventory가 denominator이고 모든 route에 해당 window fresh evidence가 있을 때만 허용한다.

## 6. SLO 및 error budget 계약

활성 route는 versioned service tier를 가지며 availability SLO, latency objective, measurement window를 명시한다. threshold는 UI 상수가 아니라 정책/config다.

Production criterion 전 threshold 상태는 **TEST_TARGET -> BASELINED -> APPROVED_SLO** 순으로 올린다.

최소 5분, 1시간, 6시간, 24시간, rolling multi-day view를 지원한다. Burn-rate alert는 fast/slow window를 함께 사용한다. 인증, ledger, wallet, security, admin control 등 release-critical API는 service tier가 정의되지 않으면 Production eligible이 아니다.

## 7. 보안·개인정보·감사 경계

운영 텔레메트리는 권한 정보다.

- Admin API-health route는 일반 session/auth/consent 외에 명시적 관리자 권한과 프로젝트의 admin console-session 경계를 요구한다.
- 민감 보안 drill-down은 기존 정책에 따라 최근 reauth/step-up을 요구할 수 있다.
- guest, 일반 member, 만료 admin session, 낮은 role, mutation의 CSRF 실패를 음성시험한다.
- metric/log/trace에 password, session cookie, CSRF token, OAuth secret, internal API token, authorization header, 전체 request body를 저장하지 않는다.
- raw dynamic ID 대신 route template을 사용하고 user ID/IP/임의 query string을 metric label로 쓰지 않는다.
- error exemplar는 sanitize하고 retention/audit 정책을 따른다.
- observability path에는 보호 경제 table 직접 write 권한을 부여하지 않는다.

## 8. 관리자 관제 UX

Overview만 보고 무엇이 존재하는지, 무엇이 실제 관측되는지, 무엇이 실패/저하 중인지, release 사이 무엇이 바뀌었는지 답할 수 있어야 한다.

Drill-down에는 method, route template, access class, lifecycle, owning module, SLO tier, request volume, p50/p95/p99, server error rate, timeout rate, last success/failure, freshness, dependency state, current release SHA, 가능한 경우 sanitize trace/error exemplar를 포함한다.

Domain/module, method, access class, lifecycle, health/data-quality, release filter를 제공한다. Worst error budget, highest p99, highest 5xx/timeout, unknown coverage를 우선 정렬할 수 있어야 한다.

v440/v442 반응형 계약을 적용해 page clipping을 금지하고 모바일에서도 핵심값·control을 유지하며 넓은 표는 의도적 local scroll 또는 card reflow를 사용한다.

## 9. 알림 및 incident workflow

Critical route error-budget burn, 지속 p95/p99 regression, 5xx/timeout 급증, dependency failure, telemetry ingestion 중단/stale/no-data, manifest-registry drift, 예상하지 않은 route 추가/삭제/access-class 변화, source-present route의 잘못된 decommissioned 표기, admin/integration 권한 regression을 alert 대상으로 한다.

Alert에는 environment, release SHA, route/group, first/last occurrence, window, current value, threshold/policy version, evidence link, ack/resolution state를 기록한다. 같은 root cause는 가능한 경우 incident/correlation identity로 묶는다.

## 10. Retention·cardinality·비용 통제

Metric label은 route template, method, service, environment, release, coarse result class처럼 bounded dimension만 사용한다. user ID, raw URL, 자유형 error, request payload는 금지한다.

고트래픽 trace는 sample할 수 있지만 error/security 실패는 incident 분석에 필요한 정책 기간을 유지한다. Sampling/aggregation/retention 설정도 versioning하고 공개해 exemplar 없음의 의미를 알 수 있게 한다.

## 11. Test·릴리스 수용 기준

health 200 또는 overview 녹색만으로 승격할 수 없다.

1. exact-candidate route manifest 생성·hash.
2. discovered route 100% access/lifecycle 분류.
3. active route와 telemetry registry 1:1 대사.
4. fresh passive telemetry와 안전 active probe.
5. 특히 admin/integration route-class 음성 권한시험.
6. isolated Test mutation API의 deterministic fixture와 관련 idempotency/concurrency/error path.
7. dependency failure, telemetry stale/no-data, controlled 5xx를 주입해 false green이 아니라 degraded/unknown인지 확인.
8. deploy SHA, manifest SHA, runtime identity 일치.
9. v440/v442 관리자 반응형/전 경로 QA.
10. merge/promotion 전 최신 planning authority와 origin/main 재확인.

구현 후 Production 승격은 exact merged SHA와 무중단 release 절차를 사용한다. 승격 후 기존 인증 세션, 핵심 read, 새 SHA metric 유입, coverage regression, fatal/5xx spike를 확인하고 실패하면 rollback한다.

## 12. 작업 순서

- v468-01 — exact-source API/realtime/BFF manifest generator와 drift report, 전 route 분류.
- v468-02 — bounded-label metric, histogram, freshness/data-quality, dependency attribution, synthetic/random Production telemetry 제거.
- v468-03 — telemetry 관리자 권한 강화와 음성 security test.
- v468-04 — server-derived overview, endpoint drill-down, filter, release compare, alert evidence.
- v468-05 — API_CATALOG_MASTER, mobile contract, BFF allowlist, decommissioned/disabled 문구를 generated exact-SHA manifest와 대사.
- v468-06 — exact candidate isolated Test 및 coverage/failure-injection/authorization/mutation/responsive/full-route QA.
- v468-07 — 최신 origin/main과 기획 권위 재확인, 동시 변경 reconcile, 영향 검증 반복.
- v468-08 — blocker가 모두 닫힌 경우에만 exact merged SHA 무중단 Production 승격, session/identity/health/error-rate/telemetry-flow 후검증.

## 13. 필수 수용 증거

Release record에는 exact source/merged/runtime SHA, manifest schema/generator version/count/hash, access/lifecycle/coverage/data-quality count, SLO policy/window, Test identity와 fixture ID, authorization negative, failure-injection/stale/no-data, responsive/full-route QA, 승격 전후 session continuity, alert/rollback 판단과 미해결 exception을 남긴다.

해당 exact-SHA 증거가 없으면 TEST_VERIFIED 또는 PRODUCTION_VERIFIED로 상태를 올릴 수 없다.
