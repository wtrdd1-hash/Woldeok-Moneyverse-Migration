# App/Site/Economy Core 구현 계획

> **Agent 작업 필수:** 구현 시 superpowers:subagent-driven-development(권장) 또는 superpowers:executing-plans를 사용해 Task별로 실행한다. 모든 실행 step은 checkbox로 추적한다.

**목표:** 승인된 v497을 구현해 App Core와 Site Core public contract를 분리하고, 모든 금융변경을 하나의 Economy Core에 통합하며, 내부 service identity를 scoped workload identity로 교체하고 AI/자동화를 하나의 versioned Policy Registry로 제한한다.

**아키텍처:** App Core(`/app-api/v2`)와 Site Core(`/site-api/v1`)는 채널 BFF일 뿐 경제권위가 아니다. 모든 경제 write는 typed Economy Core command/read boundary를 거치며 최종 금액변경은 기존 PostgreSQL `SECURITY DEFINER` + append-only ledger를 유지한다. AI/classical automation은 snapshot을 읽고 proposal을 만들며 Economy Policy Registry + Policy Executor만 등록된 범위의 값을 적용한다.

**기술스택:** Debian 13, Next.js, NestJS, TypeScript, PostgreSQL, pnpm, Vitest, Kotlin/Android, Retrofit/OkHttp, JUnit, Git/GitHub.

**기준 Spec:** `docs/superpowers/specs/2026-10-01-app-site-economy-core-security-design.ko.md`

## 전역 제약

- 계획작성 기준 design commit: `2bbe31a11ec27c2e31a44afdad502cd60a0fe4fc`.
- 계획작성 시 최신 `origin/main`: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`.
- 영문 canonical, 한국어 pair 동기화를 유지한다.
- 매 Task 시작·통합 전 최신 main/PROJECT_PLAN/통합기획/Documentation Policy/관련 spec을 재확인한다.
- 다른 작업자가 version/migration 번호를 선점하면 최신 main에 rebase 후 다음 연속번호를 사용하고 적용된 migration은 수정하지 않는다.
- 모든 code 작업은 fresh branch/worktree에서 한다.
- 시작/중간/완료 기록과 exact main/base/candidate SHA를 남긴다.
- App/Site Core는 BFF이고 경제권위가 아니다.
- Economy Core만 경제변경 domain authority다.
- `economy_post_transaction`이 canonical WLD mover다.
- ledger/audit는 append-only다.
- App/Site/AI process에는 protected financial table direct write 권한이 없다.
- money는 exact string/integer, write는 idempotent, concurrency-safe.
- AI는 자기 limit을 변경하거나 policy-executor/ledger credential을 받을 수 없다.
- automatic policy family cooldown은 24h, 7d/30d drift는 마지막 human baseline에서 계산한다.
- tax/policy rate/macro credit buffer/WLD issuance-retirement는 human approval.
- 세금은 reversal 제외 100% `TREASURY_MAIN`.
- App API v1은 measured retirement criteria 전까지 호환 유지.
- Production은 exact-SHA, zero-downtime, session-preserving, rollback-capable.
- fresh verification 없이 성공을 주장하지 않는다.

## Review Focus

1. **main/migration 동시변경:** DB Task마다 migration 번호와 main 변경을 재확인.
2. **채널 identity 혼동:** App credential이 Site/admin 권한을 얻거나 Site가 App/policy-executor를 사칭하지 못함을 테스트.
3. **retry/concurrency replay:** App/Site duplicate request가 money를 두 번 적용하지 않음을 real-DB에서 증명.
4. **AI 작은 변경 누적 drift:** 합법적인 daily step 반복으로 7d/30d baseline budget을 넘지 못함을 테스트.
5. **호환성:** Site v1/App v2 도입 중 App v1과 기존 로그인 session이 계속 동작함을 테스트.

---

## 파일 책임 구조

영문 canonical 계획의 정확한 file map을 따른다. 핵심 신규 파일:
- `packages/contract/src/channel-api.ts`
- `frontend/src/lib/channel-gateway.ts`
- `frontend/src/lib/site-gateway.ts`
- `frontend/src/app/site-api/v1/[...path]/route.ts`
- `frontend/src/app/app-api/v2/[...path]/route.ts`
- `backend/src/economy/economy-command.*`
- `backend/src/auth/workload-identity.ts`
- `backend/src/auth/guards/workload-identity.guard.ts`
- `backend/src/economy/economy-policy-registry.*`
- `backend/src/economy/economy-policy-executor.service.*`
- planned forward migrations 242~245(실행 시 최신 main에 따라 재번호)
- Android `AppRouteManifest.kt` 및 App v2 contract 변경.

---

## Task 1: v497을 canonical 기획 권위에 통합

**핵심 파일:** PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, SECURITY_MASTER_PLAN, SECURITY_ASSURANCE_MASTER_PLAN, AI_ECONOMY_CONTROLLER_SPEC, mobile API contract, security-model, database-security, API catalog의 EN/KO pair.

- [ ] 최신 main과 관련 권위문서 변경을 재확인하고 실제 사용 version을 배정한다.
- [ ] `scripts/docs/verify-v497-authority-integration.mjs`를 먼저 작성해 pre-integration 상태에서 FAIL을 확인한다.
- [ ] App v2/Site v1, one Economy Core, tax 100% Treasury, AI direct write 금지, single Policy Registry, workload/user identity 분리, App v1 retirement 규칙을 authority에 반영한다.
- [ ] 과거 충돌방향은 superseded로 명시하되 historical migration/release는 수정하지 않는다.
- [ ] verifier, `git diff --check`, unfinished-marker 검사를 PASS시킨다.
- [ ] 작업기록/update/changelog를 남기고 별도 docs commit으로 완료한다.

---

## Task 2: App/Site canonical route manifest 추가

**신규:** `packages/contract/src/channel-api.ts`, test, `scripts/check-channel-api-contract.mjs`.

- [ ] duplicate channel+method+path, 잘못된 shared route, idempotency 누락, CSRF/integrity/admin auth 오류를 검출하는 failing test 작성.
- [ ] `ApiChannel`, `ApiAuthMode`, `ChannelRouteDefinition`, `CHANNEL_API_ROUTES`, `matchChannelRoute()` 구현.
- [ ] repository public route와 manifest drift를 검출하는 check script 추가.
- [ ] `pnpm --filter @moneyverse/contract test`, `pnpm api:channel:check`, typecheck PASS.
- [ ] commit.

---

## Task 3: Site Core v1과 App Core v2 도입, App v1 유지

**신규:** `channel-gateway.ts`, `site-gateway.ts`, Site v1 route, App v2 route와 tests.

- [ ] Site/App-v2 route tests를 먼저 작성해 FAIL 확인.
- [ ] transport-safe 공통 proxy만 `channel-gateway.ts`로 분리하고 v1 compatibility 변환은 App v1에 남긴다.
- [ ] 모든 new route가 manifest를 확인하고 spoofed internal header를 제거하도록 구현.
- [ ] App v1 기존 tests + App v2 + Site v1 + typecheck + channel check PASS.
- [ ] commit.

---

## Task 4: Web canonical caller를 native App API에서 Site Core로 이동

- [ ] production web code의 `/app-api/v1` reference를 검출하는 failing check 추가.
- [ ] feature family별로 `/site-api/v1`로 migration하고 App v1 response compatibility를 web에 복제하지 않는다.
- [ ] 각 family 변경 후 frontend test/typecheck/channel check.
- [ ] pre-existing session cookie가 Site Core에서도 같은 actor로 해석되는 regression test.
- [ ] web canonical source에서 App v1 leakage 0을 확인하고 commit.

---

## Task 5: 기존 economic command envelope를 Economy Core 경계로 확장

**신규:** `economy-command.types.ts`, `economy-command.service.ts`, tests, planned migration 242.

- [ ] latest main의 migration 번호 재확인. 242가 사용됐으면 다음 연속번호로 전체 계획기록을 갱신.
- [ ] caller service/actor context/expiry/channel/policy version/hash 검증 unit test 작성.
- [ ] real-DB에서 protected table direct write deny, immutable command, payload mismatch deny, concurrency single logical command, App/Site retry double-settlement 방지 test 작성.
- [ ] migration으로 기존 `economic_commands`를 확장하고 parallel command table은 만들지 않는다.
- [ ] 기존 206/207 함수는 legacy expand 단계 동안 유지하고 versioned wrapper 추가.
- [ ] TypeScript EconomyCommandService는 normalization/validation만 하고 money arithmetic을 하지 않는다.
- [ ] unit + real-DB tests PASS 후 commit.

---

## Task 6: scoped workload identity 도입

**신규:** `workload-identity.ts`, `workload-identity.guard.ts`; frontend server-only workload helper.

- [ ] expired/wrong audience/wrong scope/Test-vs-Prod/App-vs-Site/AI policy-apply 거부 tests 작성.
- [ ] workload token을 short-lived, audience/scope/environment-bound로 검증.
- [ ] expand 기간에는 legacy `x-internal-token`을 명시된 compatibility caller만 임시 수용하고 dual conflicting credential은 거부.
- [ ] frontend server-only caller가 App/Site distinct identity를 사용하고 browser output에 credential을 노출하지 않음을 test.
- [ ] 새 DB role은 Test deployment plumbing이 실제 지원할 때만 forward migration으로 생성. 준비가 안 됐으면 function-level containment를 유지하고 문서상 완료로 가장하지 않는다.
- [ ] security tests/typecheck PASS 후 commit.

---

## Task 7: Economy Policy Registry v2와 AI 수치한도 구현

**신규:** registry/executor service와 tests, planned migration 244.

- [ ] v497의 모든 initial numeric envelope를 test에 정확히 고정.
- [ ] 반복 +0.5% 요청이 per-step은 합법이어도 마지막 human baseline 기준 7d/30d budget을 넘으면 0이 되는 test.
- [ ] 24h cooldown, reconciliation fail, active security incident, stale policy version, concurrent apply, rollback target 누락 test.
- [ ] DB Registry v2를 expand migration으로 추가하고 기존 knobs는 즉시 삭제하지 않는다.
- [ ] baseline reset은 privileged/versioned function만 가능하고 AI가 변경할 수 없음.
- [ ] executor는 persisted registry/version/evidence를 기준으로 clamp/apply하며 model text가 미등록 key를 선택하지 못함.
- [ ] admin read model에 current/baseline/proposal/bounds/remaining drift/ownership/evidence/approval/version을 분리 표시.
- [ ] unit + DB tests PASS 후 commit.

---

## Task 8: 기존 Economy AI/Council을 proposal-only evidence로 전환

- [ ] AI agree가 PROPOSE_ONLY를 BOUNDED_AUTO로 승격시키지 못하는 failing test.
- [ ] AI 위험신호가 BOUNDED_AUTO를 review/frozen으로 낮출 수 있는 test.
- [ ] malformed/out-of-range/model timeout/simulated council label tests.
- [ ] model schema를 registered policy key + proposal/evidence 데이터만 반환하도록 수정.
- [ ] scheduler를 snapshot → proposal → AI evidence → Registry clamp → bounded apply/human queue 순으로 변경.
- [ ] AI absence가 legacy independent mutation을 우회허용하지 않게 함.
- [ ] AI/scheduler tests PASS 후 commit.

---

## Task 9: Stock AI와 Work auto-tuning을 Registry 아래로 통합

- [ ] raw model output이 market event를 직접 publish하지 못하는 stock tests.
- [ ] unknown symbol, ±2% 초과, absolute price write, provider outage test.
- [ ] AI news 자동경로를 proposal/evidence 저장으로 변경.
- [ ] Work auto-tune이 `admin_update_work_reward_policy`를 직접 호출하지 못하는 test.
- [ ] job reward ±0.5/±1.5/±3 bounds와 funding classification gate test.
- [ ] planned migration 245에서 old independent apply path를 shadow evidence 후 supersede하고 historical function은 audit/rollback 필요 시 보존.
- [ ] scheduler를 하나의 Registry executor 중심으로 정리.
- [ ] 통합 tests PASS 후 commit.

---

## Task 10: Android를 App Core v2로 이행하고 generic write를 deny-by-default

**별도 repo:** `wtrdd1-hash/woldeok-moneyverse-app`.

- [ ] 최신 app main에서 fresh branch 생성.
- [ ] canonical auth/wallet/bank/work/stock/business route가 App v2를 쓰는 failing MobileApiContractTest 작성.
- [ ] unknown generic write deny, GET manifest allow, site-api 거부, admin explicit classification을 검증하는 `AppRouteManifestTest` 작성.
- [ ] `AppRouteManifest.kt` 구현 및 universal write helper를 manifest deny-by-default로 변경.
- [ ] v1 compatibility interceptor는 explicit v1 fallback에만 적용하고 v2 financial field를 임의 생성하지 않는다.
- [ ] integrity-required write에 request binding hook 추가.
- [ ] `./gradlew testDebugUnitTest`, `./gradlew lintDebug` PASS.
- [ ] app branch push + exact SHA 기록, 아직 release하지 않음.

---

## Task 11: Security/real-DB/호환성/failure-mode Test 캠페인

- [ ] main repo full `api:contract:check`, `api:channel:check`, typecheck, lint, test, build PASS.
- [ ] real DB에서 direct write deny, forged actor, wrong workload scope, replay/concurrency, ledger balance, tax Treasury, reconciliation gate, AI bounds, v1/v2 shadow parity를 검증.
- [ ] prompt injection으로 permission escalation, direct balance, SQL, bound widening, arbitrary stock/URL 시도를 넣고 privileged action 0을 확인.
- [ ] browser/native/privileged 기존 session을 Test restart/cutover 전후 재로그인 없이 검증.
- [ ] App v1 + App v2 + Site v1 동시 동작과 v1 usage telemetry 확인.
- [ ] AI outage/App outage/Site outage/Economy overload/key rotation failure containment 검증.
- [ ] exact SHA, migration checksum, role/grant, key ID, test result, session continuity, reconciliation, rollback target 기록.

---

## Task 12: 무중단 rollout, legacy contract, 최종문서

- [ ] Production 직전 latest main/authority 재확인. 관련 변경 시 rebuild/retest.
- [ ] 먼저 expand 배포: App v1/v2, Site v1, legacy/new identity, old/new policy read compatibility 모두 지원.
- [ ] Site web → Android v2 → Economy command adapter → workload identity → low-risk Registry auto → Stock/Work proposal 순으로 단계 switch.
- [ ] 각 switch 후 exact SHA/기존 session/App v1 write/App v2 write/Site v1 write/reconciliation/no unexplained WLD delta 확인.
- [ ] legacy contract는 usage=0 또는 승인된 residual, all caller migration, rollback window 종료 등 증거가 있을 때만 수행.
- [ ] revoke/drop은 새 migration으로만 수행.
- [ ] full-site 모든 page/admin/responsive QA + Android tests.
- [ ] 최종 SHA/migrations/App version/session/WLD reconciliation/policy registry/workload identity/legacy state/rollback evidence 기록.
- [ ] 내부/GitHub update, EN/KO changelog/worklog commit/push.

---

## 프로그램 실행 순서

```text
1 권위 통합
→ 2 Channel Contract
→ 3 App v2 + Site v1 BFF
→ 4 Web migration
→ 5 Economy command
→ 6 Workload identity
→ 7 Policy Registry v2
→ 8 AI proposal-only
→ 9 Stock/Work consolidation
→ 10 Android App v2
→ 11 Exact-SHA Test
→ 12 Zero-downtime Production
```

Task 5는 public channel contract가 안정되기 전에 시작하지 않는다. Task 7~9의 자동집행은 Task 5 command identity, Task 6 service identity, reconciliation이 증명되기 전 enable하지 않는다.

## Branch/Version 전략

각 Task 시작 시:
1. latest main fetch;
2. 관련 파일 delta 확인;
3. next free project version 선택;
4. fresh branch/worktree;
5. canonical plan/spec 재확인;
6. TDD red→green;
7. internal/GitHub update/changelog/worklog;
8. push/review;
9. accepted work만 merge;
10. 안전 시 merged branch/worktree 정리.

v499+는 계획상 순서이며 예약번호가 아니다. Gemini/다른 worker가 선점하면 다음 free version을 사용한다.

## Plan Self-Review 결과

- v497 37개 설계섹션 모두 Task 1~12에 mapping된다.
- ChannelRouteDefinition → App/Site BFF → EconomyCommandEnvelope → PolicyRegistry → Executor → AI/Stock/Work proposal의 interface 흐름이 일관된다.
- main/migration drift, identity confusion, replay, AI cumulative drift, v1/session compatibility가 각각 구체적 test Task에 포함됐다.
- Economy Core는 우선 logical/internal boundary이며 근거 없는 microservice 분리를 강제하지 않는다.
- direct AI money/price/history write, protected BFF table write, applied migration 수정, shadow/Test 없는 destructive contract는 금지된다.
