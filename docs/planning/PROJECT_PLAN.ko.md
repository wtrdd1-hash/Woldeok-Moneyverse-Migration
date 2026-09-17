# 월덕 머니버스 — Living Project Plan

> **문서 상태:** Living specification / 현재 권위 통합기획서
> **최초 기준:** 2026-08-26
> **현재 통합 버전:** v2026.09.17.172
> **구현·증거 동기화:** 2026-09-17
> **영문 기준 문서:** [PROJECT_PLAN.md](PROJECT_PLAN.md)

과거 상세 변경은 Git 이력과 버전별 changelog/worklog에서 복구할 수 있다. 이 문서는 현재 구현을 위한 권위 계약이다. 다른 개발자나 AI가 과거 초안을 현재 사실로 추정하지 않고 이 문서만으로 기능 범위, 권위 경계, 사용자 상태, API, 영속화, 보안, SEO, 사업성, QA, 릴리스 게이트와 롤백 조건을 이해할 수 있어야 한다.

## 회차 변경 — v2026.09.17.172 (2026-09-17)

### 현재 소스코드 동기화

- **권위 저장소 기준:** 이번 재분석은 `main` `0eabcc19d8c970689533d6a006c12701a62190fc`(기획 v2026.09.17.171)를 기준으로 한다. v171의 CI/runtime 증거는 그대로 권위가 있으며 이번 회차는 구현 파일 경로 동기화를 추가한다. v171의 release-control 증거를 대체하거나 완화하지 않는다.
- **카지노 브라우저/런타임 복구 (`23ae3608`, #383):** `frontend/src/app/casino/actions.ts`의 `use server` 경계에서 동기 export가 노출되지 않도록 정리했고 client-safe 상태를 `casino-state.ts`로 분리했다. error boundary를 추가하고 casino forms/theme games/loading 경로를 수정했으며 `actions-boundary.test.ts`가 경계 계약의 회귀를 막는다.
- **카지노 플레이 계약 + 주사위 UX (`f6fd3120`, #384):** 프론트 action adapter가 포맷 문자열이 아니라 backend 정수 JSON 계약에 맞는 bounded stake를 전송한다. `casino-forms.tsx`와 `globals.css`에 서버 결과 기반 주사위 표현을 추가하되 RNG, 자격, 베팅 차감/지급, 원장, 멱등성 권위는 서버에 유지한다.
- **직업 일/주 초기화 수렴 (`03a8ae9c`, #388):** backend Work API가 `WorkDashboardResponseDto`를 통해 권위 `game_day_key`, `game_week_key`, `day_ends_at`, `week_ends_at`를 반환하며 `WorkRepository.dashboard()`는 `work_my_dashboard_v2`를 사용한다. `packages/database/migrations/203-work-reset-convergence.sql`이 가속 window와 reward-window 수렴의 DB 권위다. frontend Work 화면과 mobile API contract/schema 문서도 동일 reset 필드를 사용한다. 실DB 테스트는 정확한 가속 경계와 DB session timezone 독립성을 검증한다.
- **경제 AI 운영 활성화 (`e992d44d`, #389):** `ops/systemd/`에 재현 가능한 Debian/systemd service profile이 있고 EN/KO 런타임 운영 문서가 연결되어 있다. 이는 runtime configuration 증거이며 더 최신 application SHA가 승격됐다는 증거로 단독 사용하지 않는다.
- **관리자 내비게이션 수렴 (`7acc3c02`, #390):** 관리자 UI inventory에서 상단 메뉴에 보안·사업/시즌·작업/직업·Discord를, dashboard inventory에 문의·상점을 노출하고 최상위 관리자 영역 누락을 막는 회귀 계약을 추가했다. 메뉴 노출은 backend 권한 확대를 뜻하지 않는다.

### 기획 반영 결론

- Casino, Work reset, Economy AI 운영, 관리자 내비게이션 기획은 위 커밋과 실제 파일 경로를 현재 구현 증거 baseline으로 사용한다. 이후 기능 기획은 중복 개발을 제안하기 전에 이 경로를 먼저 확인한다.
- 상태는 증거 범위로 구분한다. `main` 구현 증거는 exact-SHA Test 또는 Production 증거와 같지 않으며 기존 isolated Test, DB/API/user-flow, authorization, monitoring, rollback gate를 계속 적용한다.
- v171의 P0 공통 pre-privilege classifier 문제는 미해결이다. v172는 문서 전용 변경이며 runtime 승격을 주장하거나 docs-only CI/DB/registry side-effect 결함이 해결됐다고 보지 않는다.

### v172 백로그/순서 및 수용조건

`P0 독립 암호화 backup + isolated restore/reconciliation` → `P0 stale-status false-green` → `P0 generic CI + candidate/release 공통 pre-privilege classifier` → `P0 docs-only runtime/DB/registry/GitOps side-effect 0` → `P0 단일 release authority와 runtime-id reconciliation` → `P1 Casino/Work/Admin/Economy-AI exact-SHA runtime 증거 검증` → `P1 auth/session/admin/casino/Work/DB authorization+ledger QA` → `P1 required-check enforcement` → core correctness → monetization → SEO/acquisition → retention/accessibility.

## 회차 변경 — v2026.09.17.171 (2026-09-17)

### 증거와 결정

- **저장소/CI/런타임 증거:** 회차 시작 및 중간 `main`은 문서 전용 `d398f6ef1a821496c92ef2916a1b0b36c964f4ec` (`docs: update Moneyverse plan v2026.09.17.170 (#401)`)이다. 브랜치 보호는 활성화되어 있으나 required status-check enforcement는 `off`이고 required context/check는 0개다. 이 docs-only SHA의 CI #1176은 완료 전 이미 runtime dependency 설치, lint/typecheck/application build를 수행하고 `Apply database migrations` 단계에 진입했다. 즉 generic CI도 release-input 분류 전에 runtime/DB 작업을 허용하는 결함이 재현됐다. 별도 Test 실측에서 2026-09-17 09:10 KST `GET /api/version`은 200과 runtime id `18c7a1324013099e47b2d6e22c5108c4d378139c`를 반환했고 `/api/health`, `/api/health/ready`는 404였다. Test는 `X-Robots-Tag: noindex, nofollow`, `robots.txt`의 `Disallow: /`, 빈 sitemap을 반환했다. repository head와 runtime id는 서로 다른 권위이며 상호 대체하지 않는다.
- **P0 `REL-DOCS-171-01` — OPEN / 최근 재현 2026-09-17:** v163-v170의 기존 최초/반복 증거를 유지하며 최신 재현은 `d398f6e...`의 CI #1176이다. 재현은 docs-only 병합 → CI 시작 → runtime dependency/build → migration 시작이다. 영향은 불필요한 DB 권한/비용, 잠재 schema side effect, 잘못된 release identity, 운영자 혼선이다. 원인은 generic CI와 release workflow가 동일한 필수 pre-privilege classifier를 공유하지 않는 것이다. 하나의 재사용 `classify-release-inputs` workflow가 generic CI와 candidate/release 모두를 선행 gate한다. `DOCS_ONLY_NO_RUNTIME_RELEASE`는 markdown/link/secret/static-policy 검사만 실행하고 DB URL, package write token, deployment credential, runtime network secret을 받지 않는다. `RUNTIME_RELEASE_REQUIRED`만 immutable 분류 증거 이후 stage-scoped 단기 credential을 발급한다. 오류/불명은 fail-closed한다. application DB migration은 필요 없고 rollback은 workflow wiring만 되돌린다.
- **런타임 권위/관측 계약:** 운영상 필요할 때만 하나의 내부 readiness 권위와 public-safe liveness를 명시하며 404인 `/api/health*`에 임의 의미를 부여하지 않는다. Release evidence는 `{repositoryHeadSha, applicationSourceSha, deployedRuntimeId, imageDigest, migrationSetHash, environment, observedAt}`를 저장하고 runtime version endpoint와 applicationSourceSha/imageDigest를 reconcile할 수 없으면 승격을 차단한다. Test probe는 status, latency, cache/security header, exact runtime id를 보존하며 stale status page는 direct evidence보다 우선하지 않는다.
- **SEO/SEO 백엔드:** Google Search Central 공식 changelog는 2026-09-08 업데이트가 현재 9월 최신 주요 문서 변경이다. Google은 template/code 변경 후 structured-data 유효성 모니터링과 Search Console/API 관측을 권고한다. 공개 route별 versioned server SEO read-model `{canonicalUrl,indexPolicy,title,description,h1,breadcrumbs,hreflang,updatedAt,imageMeta,structuredDataType,structuredDataVersion}`을 사용하고 rendered-visible content와 JSON-LD 일치를 검증하며 invalid-item 회귀 시 template rollout을 차단한다. Test/staging은 전역 `noindex,nofollow` + `Disallow: /` + 빈 sitemap을 유지한다. Production의 account/admin/transaction/private inventory/bank/casino-history는 noindex 및 sitemap 제외다.
- **보안:** OWASP API Security Top 10 2023을 최신 API-specific 기준으로, ASVS를 application verification baseline으로 유지한다. CI/release classification을 least-privilege supply-chain authorization으로 취급한다. Route inventory는 authn, capability, object ownership/BOLA, function authorization/BFLA, property/schema authorization, idempotency/replay, rate/resource/business-flow limit, SSRF/upstream trust, PII class, audit event를 계속 매핑한다. docs-only job이 DB/GHCR/GitOps mutation capability를 받으면 release-blocking이다.
- **수익성/사업성:** Google Play 현행 공식 수수료는 cohort/transaction/programme/billing-path에 따라 달라 단일 수수료를 가정하지 않는다. SKU unit economics는 `feePolicyVersion`, market, transaction timestamp, install cohort, transaction type, billing path, tax/refund reserve, direct ops cost를 유지한다. 실측 없는 conversion/ARPU/ARPDAU/ARPPU/churn/CAC/LTV는 `HYPOTHESIS`/`TEST TARGET`이다. Release-control 사업효과는 절감된 docs-only CI/DB minutes, registry bytes/storage, orphan-candidate cleanup, support/on-call 시간으로 측정하고 유지 corpus false-negative=0일 때만 scale한다.

### v171 백로그/순서 및 수용조건

`P0 독립 암호화 backup + isolated restore/reconciliation` → `P0 stale-status false-green` → `P0 generic CI + candidate/release 공통 pre-privilege classifier` → `P0 docs-only runtime/DB/registry/GitOps side-effect 0` → `P0 단일 release authority와 runtime-id reconciliation` → `P1 auth/session/admin/casino/Work/DB authorization+ledger QA` → `P1 required-check enforcement` → 핵심 correctness → monetization → SEO/acquisition → retention/accessibility. docs-only 수용조건은 `runtime_dependency_install=0`, `app_build=0`, `db_migration=0`, `registry_login/push=0`, `test_gitops_write=0`, `runtime_exact_sha_poll=0`, `production_mutation=0`이다. Runtime 구현은 별도 branch → CI → exact-SHA Test → API/DB/user-flow QA → main → Production → smoke/rollback 흐름을 유지한다.

## 회차 변경 — v2026.09.17.170 (2026-09-17)

### 근거와 결정

- **저장소/CI 근거:** 회차 시작 및 작업 중간 `main`은 `bd047d9a7b9bd4e3d2b1cde4badbe80b07ae7684` (`docs: integrate Moneyverse plan v2026.09.17.169`)이며 docs-only다. CI #1174는 성공했지만 `Build Test Candidate` #797도 성공했다. `verify / check`는 dependency install, lint, typecheck, app build와 `Apply database migrations`를 성공 수행했고 `build` job은 GHCR login 후 backend/frontend candidate를 모두 build+push했다. `dispatch-production-gate`는 skip됐다. 즉 v169 기획 통합 후에도 P0 privileged side-effect 결함이 재현됐다. workflow 성공을 runtime health 증거로 사용하지 않는다.
- **P0 `REL-DOCS-170-01` — OPEN / 최신 재현 2026-09-17:** docs-only가 계속 DB migration과 registry write surface에 도달한다. 수정은 privilege 이전 분류와 capability isolation이다. classifier/docs job에는 repository metadata read-only만 주고 immutable `RUNTIME_RELEASE_REQUIRED` 뒤에만 DB/GHCR/GitOps OIDC credential을 발급한다. docs-only 수용조건은 runtime install/build/migration/registry/GitOps/poll/production side effect 모두 0이다. rollback은 workflow wiring만 되돌리고 application data 또는 referenced image를 삭제하지 않는다. docs-only CI/DB minute, registry login/push, bytes/storage, orphan candidate, repository/application SHA divergence를 관측한다.
- **SEO 조사:** Google Search Central 공식 changelog는 2026-09-08 regional Search-experience 문서를 9월 최신 주요 변경으로 계속 표시한다. 2026-09-16 Deep Dive Europe 글은 행사/커뮤니티 자료로 ranking/indexing 계약 변경이 아니다. 2026-08-28 site-reputation update는 third-party/sponsored/affiliate/UGC governance에 계속 직접 적용한다. server-authoritative metadata/canonical/robots/sitemap/hreflang/structured-data/SSR/CWV와 moderation/thin-content index gate를 유지한다.
- **보안 조사:** OWASP API Security Project 최신 API-specific Top 10은 계속 2023이다. release eligibility는 least-privilege/supply-chain authorization boundary이며 BOLA, authentication, property/function authorization, resource limit, sensitive-business-flow abuse, SSRF, misconfiguration, API inventory, unsafe upstream consumption을 route-level release gate로 유지한다.
- **사업성:** Google Play 공식 수수료는 cohort/transaction/programme/billing-path별로 달라 단일 요율을 가정하지 않는다. SKU `feePolicyVersion`과 revenue/net revenue/margin/ARPU/ARPDAU/ARPPU/conversion/retention/churn/refund/CAC/LTV/fraud/infra/support 실측을 유지하고 미실측 값은 `가설/테스트 기준`으로 둔다. release-control 비용에는 docs-only CI/DB minute, pushed bytes/storage, cleanup/support burden을 포함한다.

### v170 백로그/수용 순서

`P0 독립 암호화 backup + isolated restore/reconciliation` → `P0 stale-status false-green` → `P0 privilege 이전 release classifier / docs-only DB+registry side-effect 0` → `P0 GitOps/public edge/systemd 단일 release authority` → `P1 auth/session/admin/casino/Work/DB authorization+ledger QA` → `P1 repository required-check enforcement` → core correctness → monetization → SEO/acquisition → retention/accessibility. runtime 구현은 별도 branch/test/release 흐름이며 이 기획 회차에서 runtime code를 배포하지 않는다.

## 회차 변경 — v2026.09.17.169 (2026-09-17)

### 근거와 결정

- **저장소/CI 근거:** 회차 시작 및 작업 중간 `main`은 `cafa12cbd1e9a36487966e3c72bda46b16f9aff7` (`docs: update Moneyverse plan v2026.09.17.168 (#399)`)이며 docs-only다. CI #1172는 성공했지만 `Build Test Candidate` #795도 성공했다. `verify / check`는 dependency install, lint, typecheck, app build와 `Apply database migrations`를 성공 수행했고, 이어 `build` job은 GHCR login 후 **backend/frontend candidate image를 모두 build+push 성공**했다. `dispatch-production-gate`와 `Auto Integrate and Promote` #128은 skip됐다. 즉 downstream promotion은 없었지만 v168 docs-only 수용계약은 DB migration, image build, registry write 경계에서 위반됐다. 이 workflow 증거로 Test/Production runtime 상태를 추정하지 않는다.
- **P0 `REL-DOCS-169-01` — OPEN / 최신 재현 2026-09-17:** docs-only가 단순 orchestration을 넘어 DB와 registry mutation surface를 실제 소비한다. 재현: docs-only v168 merge → CI #1172 success → Test Candidate #795 → migration success → GHCR login → backend/frontend candidate build+push success. 영향은 privileged credential 노출면 확대, registry/storage 비용, candidate identity 오염, 운영자 혼동과 supply-chain blast radius 증가다. 원인은 privileged runtime 작업보다 release eligibility 판정이 늦거나 candidate 생성 전 판정이 없는 control-plane ordering이다.
- **수정/권한경계:** `classify-release-inputs`만 push 직후 최초 실행을 허용하며 repository metadata read-only 외에는 package-registry write token, DB/network secret, GitOps credential을 받지 않는다. signed/immutable `RUNTIME_RELEASE_REQUIRED` 결과가 있어야만 OIDC 기반 단기 stage-scoped credential을 dependency/build DB, GHCR, GitOps 단계에 발급한다. `DOCS_ONLY_NO_RUNTIME_RELEASE`는 docs/static-policy check만 수행하고 `RELEASE_INPUT_CLASSIFICATION_ERROR`는 fail-closed다. candidate tag/digest는 docs-only `repositoryHeadSha`가 아니라 `applicationSourceSha`에 결합한다. unreferenced candidate GC는 어떤 release evidence도 참조하지 않음을 증명한 뒤에만 수행한다.
- **테스트/수용/롤백/관측:** docs-only acceptance를 `runtime_dependency_install=0`, `app_build=0`, `db_migration=0`, `registry_login=0`, `backend_image_build_push=0`, `frontend_image_build_push=0`, `test_gitops_write=0`, `exact_sha_poll=0`, `production_mutation=0`으로 고정한다. classifier/docs job에 privileged secret이 없고 OIDC audience/subject가 stage-scoped인지 negative test한다. rollback은 workflow wiring만 되돌리며 referenced image 삭제나 application data 변경을 금지한다. `docs_only_db_migration_total`, `docs_only_registry_login_total`, `docs_only_image_push_total`, pushed bytes/storage cost, orphan candidate, repository/application SHA divergence를 관측하고 docs-only privileged side effect가 하나라도 발생하면 release engineering alert를 낸다.
- **SEO 조사:** Google Search Central 최신 major-update 페이지는 2026-09-08 regional Search-experience 문서를 9월 최신 주요 변경으로 계속 표시한다. 2026-09-16 Search Central Live Deep Dive Europe는 행사/커뮤니티 자료라 ranking/indexing 계약 변경으로 채택하지 않는다. 2026-08-28 site-reputation update는 third-party/sponsor/affiliate/UGC governance에 계속 직접 적용한다. server-authoritative canonical/robots/sitemap/hreflang/structured-data/SSR/CWV 계약을 유지하고 공개 UGC/affiliate indexability는 domain authority 상속이 아니라 moderation/ownership/thin-content gate를 통과해야 한다.
- **보안 조사:** OWASP API Security Project의 최신 API-specific Top 10은 계속 2023이다. `REL-DOCS-169-01`을 API8/security misconfiguration 및 supply-chain least-privilege 문제와 연결한다. docs-only 변경은 DB/registry mutation capability를 얻어서는 안 된다. BOLA/BFLA/authentication/resource/sensitive-business-flow/SSRF/inventory 통제는 그대로 유지한다.
- **사업성:** Google Play 공식 fee table은 install cohort, recurring/non-recurring, programme, billing path별로 달라 SKU별 `feePolicyVersion`을 유지하고 미실측 conversion/ARPU/churn/CAC/LTV는 가설로 둔다. release-control 비용은 docs-only CI minute, DB minute, registry egress/storage, orphan-candidate cleanup/support time을 별도 측정한다. maintained corpus false-negative=0이고 runtime gate를 약화하지 않을 때만 classifier를 scale하며 runtime-relevant 변경을 skip할 수 있는 최적화는 kill한다.

### v169 백로그/수용 순서

`P0 독립 암호화 backup + isolated restore/reconciliation` → `P0 stale-status false-green` → `P0 privilege 이전 release classifier / docs-only DB+registry side-effect 0` → `P0 GitOps/public edge/systemd 단일 release authority` → `P1 auth/session/admin/casino/Work/DB authorization+ledger QA` → `P1 repository required-check enforcement` → core correctness → monetization → SEO/acquisition → retention/accessibility. runtime 구현은 별도 branch/test/release 흐름이며 이 기획 회차에서 runtime code를 배포하지 않는다.

## 회차 변경 — v2026.09.17.168 (2026-09-17)

### 근거와 결정

- **저장소/CI 근거:** 회차 시작 및 작업 중간 `main`은 `5a5dfdb4c6b83849f5eda7a6b7ef05fcb83b5b35` (`docs: integrate Moneyverse plan v2026.09.17.167`)이다. branch protection은 켜져 있지만 required-status-check enforcement는 `off`이고 required context/check도 없다. 이 커밋은 기획문서만 변경했는데도 push 직후 `Build Test Candidate` #794가 시작됐다. `verify / check` job은 container 초기화, 의존성 설치, lint/typecheck/build를 수행했고 test 단계 전에 **`Apply database migrations`를 성공 수행**했다. 즉 docs-only 변경이 runtime-input eligibility 판정 전에 DB를 사용하는 test-candidate setup까지 실행한다는 직접 증거다. 이 CI 증거만으로 Test/Production runtime 상태를 추정하지 않는다.
- **P0 `REL-DOCS-168-01` — OPEN / 최신 재현 2026-09-17:** 비런타임 변경이 migration/build surface를 불필요하게 실행해 CI/DB/registry/release 자원을 소비하고 release identity를 오인하게 만들 수 있으므로 P0이다. 재현: docs-only `5a5dfdb...` 통합 → `Build Test Candidate` #794 관찰 → job step 확인 → dependency install/build/`Apply database migrations`가 classification 전에 실행. 영향은 release engineering, test DB, CI capacity와 repository SHA를 application SHA로 해석하는 운영자다. 원인은 side effect 이전 runtime-input classifier가 실제 workflow에 구현되지 않은 것으로 한정한다.
- **구체 수정/마이그레이션/롤백:** dependency가 거의 없는 `classify-release-inputs` job을 release-control 최선행으로 둔다. merge-base→head metadata와 versioned `release-inputs.yml`을 읽고 `{repositoryHeadSha, applicationSourceSha, classification, matchedRuntimePaths, classifierVersion, evidenceCreatedAt}` 불변 증거를 생성해 dependency install, app build, migration container, candidate image/registry, Test GitOps write, exact-SHA poll, Production promotion 전체를 gate한다. `DOCS_ONLY_NO_RUNTIME_RELEASE`는 문서/static-policy 검사만 허용하며 DB credential을 받지 않는다. `RELEASE_INPUT_CLASSIFICATION_ERROR`는 fail-closed다. 이 control-plane 변경 자체의 application DB migration은 없다. rollback은 workflow/classifier wiring만 되돌리며 성공 release를 위조하거나 application data를 변경해서는 안 된다.
- **테스트/수용/관측:** unit corpus는 docs-only, FE/BE/shared, lockfile, migration, Docker/build, workflow/GitOps, runtime config/secret reference, mixed, rename/delete, symlink/submodule, merge commit, shallow history, path-normalization/executable-smuggling을 포함한다. docs-only integration acceptance는 `dependency_install_for_runtime=0`, `app_build=0`, `db_migration=0`, `image_build=0`, `registry_push=0`, `test_gitops_write=0`, `exact_sha_poll=0`, `production_mutation=0`이다. runtime 변경은 immutable candidate → isolated exact-SHA Test → real API/DB/user-flow QA → main → Production evidence/smoke를 그대로 거친다. classifier false-negative 또는 evidence 누락 시 promotion 차단. `docs_only_runtime_job_total`, `docs_only_db_migration_total`, `release_classifier_error_total`, CI minute/storage, repository/application SHA divergence를 관측하며 docs-only DB migration은 즉시 alert한다.
- **SEO 조사판정:** Google Search Central 최신 주요 문서 변경 페이지에서 2026-09-08 regional Search-experience 문서가 9월 최신 주요 update로 확인된다. 2026-09-16 Search Central Live Deep Dive Europe 글은 행사/커뮤니티 공지라 ranking/indexing 계약 변경으로 채택하지 않는다. 2026-08-28 site-reputation 정책은 third-party/sponsor/affiliate/UGC governance에 계속 적용한다. 따라서 서버 권위 canonical/robots/sitemap/structured-data/hreflang/SSR/CWV/UGC 계약은 이번 회차 변경하지 않으며 공개 SEO 변경은 행사 글이 아니라 Search Console/Naver 등 검증 증거를 요구한다.
- **보안 조사판정:** OWASP API Security Project는 API Security Top 10 **2023**을 최신판으로 계속 표시한다. BOLA, broken authentication/property/function authorization, resource consumption, sensitive-business-flow abuse, SSRF, misconfiguration, inventory, unsafe upstream consumption을 route inventory와 negative release test에 유지한다. release classifier 자체도 supply-chain authorization boundary이며 docs-only 분류 단계에는 privileged DB/runtime credential을 주지 않는다.
- **사업성:** Google Play 현행 공식 수수료표는 install cohort, recurring/non-recurring, programme, billing path별로 달라 단일 수수료를 가정하지 않는다. SKU별 `feePolicyVersion` 회계를 유지한다. 이번 회차에는 release-control 비용 KPI `docs_only_ci_cost`, `docs_only_db_minutes`, `docs_only_registry_bytes`, 운영/지원 시간을 추가한다. 이는 매출이 아니라 측정 비용이다. classifier false-negative=0을 유지하면서 docs-only CI/release 비용을 유의미하게 줄이면 scale, false-positive는 iterate, runtime-relevant 변경을 skip할 가능성이 있는 최적화는 kill한다.

### v168 백로그/수용 순서

`P0 독립 암호화 backup + isolated restore/reconciliation` → `P0 stale-status false-green` → `P0 side-effect 이전 release classifier / docs-only runtime+DB side-effect 0` → `P0 GitOps/public edge/systemd 단일 release authority` → `P1 auth/session/admin/casino/Work/DB authorization+ledger QA` → `P1 repository required-check enforcement` → core correctness → monetization → SEO/acquisition → retention/accessibility. runtime 구현은 별도 branch/test/release 흐름이며 이 기획 회차에서 runtime code를 배포하지 않는다.

## 회차 변경 — v2026.09.17.167 (2026-09-17)

### 근거와 결정

- **저장소/런타임 근거:** 회차 시작 및 중간 재확인 `main`은 `e9b5743c2305f0d5fc38f3c473d8a7c891561d3f` (`docs: integrate Moneyverse plan v2026.09.17.166`)이다. branch protection은 켜져 있지만 required-status-check enforcement는 `off`이고 required context/check도 없다. CI #1168은 성공했다. 그러나 docs-only SHA에서 `Build Test Candidate` #793도 성공했고 `Build Production Release` #914가 `test-gate`에 진입해 근거 수집 시점에도 실행 중이었다. `Auto Integrate and Promote` #125가 skip됐지만 candidate build와 Production release orchestration이 이미 시작됐으므로 zero-side-effect 계약을 충족한 것은 아니다. 승인된 Debian 장치의 public runtime probe는 DNS 해석 실패로 불가능했으므로 새 Test/Production runtime 상태를 추정하지 않는다.
- **P0 `REL-DOCS-167-01` — OPEN / 반복 재현:** docs-only repository head가 결정론적 runtime-input 분류 전에 Test/release 자원을 소비한다. 최신 재현일은 2026-09-17, SHA는 `e9b5743c...`이다. 재현은 docs-only 통합 → CI green → Test candidate #793 성공 → Production Release #914 `test-gate`다. 영향은 CI/registry/Test 자원 낭비, release identity 오판, 실제 릴리스 지연과 repository head/deployed application 혼동이다. 원인은 control-plane trigger/eligibility 순서로 한정되며 코드 검색에서 제안된 classifier는 아직 기획문서에서만 확인된다.
- **수정 계약:** candidate build, registry write, GitOps mutation, exact-SHA polling, promotion보다 앞서 단일 authoritative classifier를 둔다. merge-base→head diff와 rename/delete/submodule/symlink metadata, versioned `release-inputs.yml`을 입력받아 `{repositoryHeadSha, applicationSourceSha, classification, matchedRuntimePaths, classifierVersion, evidenceCreatedAt}`를 immutable evidence로 출력한다. 허용값은 `RUNTIME_RELEASE_REQUIRED`, `DOCS_ONLY_NO_RUNTIME_RELEASE`, `RELEASE_INPUT_CLASSIFICATION_ERROR`뿐이며 unknown/error는 fail-closed다. frontend/backend/shared runtime, lockfile, generated runtime artifact, DB migration, Docker/build, workflow/GitOps/deploy input, runtime config/secret reference는 runtime-relevant다.
- **마이그레이션/롤백/테스트:** DB migration 없음. rollback은 classifier/workflow wiring만 되돌린다. unit corpus는 docs-only, FE/BE/shared, lockfile, migration, container, workflow/GitOps, mixed, rename/delete, symlink/submodule, merge commit, shallow history, path-normalization trick을 포함한다. docs-only integration acceptance는 `image_build=0`, `registry_push=0`, `test_gitops_write=0`, `exact_sha_poll=0`, `production_mutation=0`이다. runtime 변경은 immutable candidate → isolated exact-SHA Test → API/DB/user-flow QA → main → Production evidence/smoke를 그대로 통과한다. 유지 corpus false-negative 0 전 promotion을 차단한다. `release_classifier_errors`, `docs_only_release_side_effect_total`, docs-only candidate minute/storage, application/repository SHA divergence를 관측한다.
- **SEO:** Google Search Central의 2026-09-17 infinite-scroll 문서 이전은 guidance 변경이 아니다. indexable community/market/collection/search는 안정적인 page/chunk URL과 crawlable link를 유지한다. 2026-08-28 site-reputation 변경은 sponsor/affiliate/third-party/UGC governance에 적용하고 2026-09-16 Search Central Live 게시물은 행사 정보라 ranking/indexing 정책 변경에서 제외한다. 공개 SEO read model `{canonicalUrl,indexPolicy,title,description,h1,breadcrumbs,localeAlternates,updatedAt,imageMeta,structuredDataVersion}`과 pagination metadata를 서버 권위로 유지하며 private/account/admin/transaction은 `noindex`+sitemap 제외, 404/410/redirect/`lastmod` 의미를 서버에서 일관되게 보장한다. KPI는 impression→click→signup→activation→D7/D30→revenue/LTV이고 crawl/index error와 CWV를 guardrail로 둔다.
- **광고/UX:** Google Publisher Tag release note상 2026-09-08부터 bfcache 복귀 시 actively viewed ad slot이 자동 refresh될 수 있고 `AutoRefreshConfig.backForwardCache`로 비활성화할 수 있다. provider impression/event identity로 광고 분석을 중복 제거하고 단순 page restore를 provider의 실제 새 impression 없이 신규 business impression으로 세지 않는다. 실험은 `광고매출 - 광고유발 이탈/리텐션 손실` 순효과로 판단하며 back-button/interstitial은 navigation을 가로채지 않는다.
- **보안:** OWASP ASVS 5.0.0과 API Security Top 10 2023을 유지한다. release classification을 supply-chain authorization boundary로 취급해 docs-path executable smuggling, ambiguous generated artifact, classifier failure를 배포차단한다. economy/admin/payment/reward/casino/referral route는 authn, capability/object authorization, idempotency, rate/business-flow limit, PII class, audit event, datastore inventory와 BOLA/BFLA/sensitive-business-flow negative test를 유지한다.
- **사업성:** Google Play 현행 수수료는 market/install cohort/transaction type/programme/billing path별로 달라 단일 요율을 쓰지 않는다. 실제결제 SKU는 `feePolicyVersion, market, transactionAt, installCohort, transactionType, billingPath, programme, grossPrice, tax, platformFee, paymentFee, refundReserve, directOpsCost`를 보존한다. revenue/net revenue/gross·contribution margin/ARPU/ARPDAU/ARPPU/conversion/renewal·churn/refund/CAC·LTV·payback/fraud/infra·support/D1·D7·D30을 분리 측정하고 미실측 값은 `HYPOTHESIS`/`TEST TARGET`이다. contribution margin과 retention/fairness/security guardrail을 함께 통과할 때만 scale한다.

### v167 백로그/수용 순서

`P0 독립 암호화 backup + isolated restore/reconciliation` → `P0 stale-status false-green` → `P0 release classifier / docs-only side-effect zero` → `P0 GitOps/public edge/systemd release authority 단일화` → `P1 auth/session/admin/casino/Work/DB authorization+ledger QA` → `P1 repository required-check enforcement` → 핵심 correctness → monetization → SEO/acquisition → retention/accessibility 순이다. 런타임 구현은 별도 branch/test/release 흐름으로 수행하며 이 기획 회차에서 runtime code를 배포하지 않는다.

## 0. 유지관리·증거·우선순위 원칙

1. 중요한 기획은 최신 외부 레퍼런스 조사 후 작성한다. 현재 공식 제품/플랫폼 문서, 정부·규제기관, OWASP·보안기관, 실제 런타임 증거를 우선하며 중요한 판단은 가능하면 독립 근거를 비교한다.
2. 계약 변경 전 최신 `main`, 영문·한국어 통합본, 최근 QA/worklog, CI·릴리스 자동화, 열린 incident/PR, 런타임, 관련 코드·migration을 읽는다. 작업 중간과 각 문서 통합 직전 `main`을 다시 확인한다. 문서 자동화는 force-push하지 않는다.
3. 구현 증거는 `IMPLEMENTED`, `PARTIAL`, `UNVERIFIED`, `REDESIGN_REQUIRED`로 표시한다. 기획서·issue·screenshot·성공한 build·오래된 테스트만으로 현재 Production 동작을 증명하지 않는다.
4. CI/Test/runtime 증거가 없으면 `verification unavailable`이다. P0/CRITICAL/HIGH 게이트는 fail-closed다.
5. 적용된 DB migration은 불변이다. 교정은 새 migration으로 한다. 경제 이력은 append-only이고 잘못된 거래는 보정거래로 교정한다.
6. 실측되지 않은 사업 수치는 `가설` 또는 `테스트 기준`으로 표시한다. WLD/WDX 활동은 게임경제 활동이며 실화폐 매출이 아니다.
7. 우선순위는 `P0 데이터손실/보안/인증/권한/자산중복/경제악용/장애/DB무결성/릴리스 진실성` → `P1 주요 정확성/핵심완성도` → `P1 상점/결제/수익화` → `P1 SEO/유입` → `P2 리텐션/성장` → `P2 UX/접근성` → `P3 장기확장`이다.
8. 실제 개발은 별도 흐름 `새 브랜치 → 정적/단위/통합/실DB/보안 테스트 → immutable candidate → isolated exact-SHA Test → backend/API/DB/사용자흐름 QA → main 통합 → exact-main-SHA 재검증 → Production evidence → GitOps 승격 → 운영 smoke/관측 → 필요 시 rollback`을 따른다.

## 1. 제품 및 비협상 경계

Woldeok Moneyverse는 웹+Discord 커뮤니티 가상경제/게임 플랫폼이다. 사용자는 인증하고, 직업·퀘스트를 진행하며, WLD를 획득·소비하고, 아이템을 수집·사용하고, 가상 사업·은행·대출·가상주식·소셜/커뮤니티·확률형 게임 시스템을 이용한다.

WLD, WDX/가상주식, 은행잔액, 대출, 카지노 플레이와 보상은 game/simulation-only 데이터다. 현금환전, 실제 증권·예금, 원금·수익보장, 실제 투자수익, 외부경품, 실제 도박을 약속하지 않는다. 향후 실화폐/실금융/실도박과 연결하려면 별도 법무·제품 재설계가 필요하다.

기술 기준은 Next.js frontend, NestJS API, PostgreSQL 권위 데이터/경제/권한, 민감 DB 경로의 보호된 `SECURITY DEFINER`, 최소권한 application role, append-only 복식부기 원장, 재시도 가능한 가치변경의 idempotency, commit 이후 외부전송을 위한 outbox 방식이다.

### 1.1 경제 불변조건

모든 가치변경은 actor, 권한, 정책, 자격, quota/limit, idempotency를 검증하고 필요한 ledger posting, derived balance, audit/outbox를 하나의 트랜잭션으로 기록한다. 차변/대변은 대사되고 금지된 음수잔액은 트랜잭션 경계에서 차단한다. 금액은 안전한 integer/string 계약을 사용하며 JavaScript `Number`에 의존하지 않는다. 재시도·중복·동시 요청은 중복 가치를 만들 수 없다. 교정은 원거래를 참조한 보정거래로 수행한다.

### 1.2 보안 기준

OWASP ASVS 5.0.0과 OWASP API Security Top 10을 검증 기준으로 사용하되 인증·보증 마크처럼 표현하지 않는다. 공통 통제에는 OAuth/OIDC `state`/`nonce`/PKCE/exact redirect, session rotate/revoke, 최근 재인증, CSRF, BOLA/IDOR negative test, XSS/output encoding, SQLi/SSRF/path traversal/command injection 방어, 업로드 decoded-type 검증, rate/resource/business-flow abuse 통제, DB 최소권한, CORS/CSP/security header, secret 관리, dependency/supply-chain 통제, container/Kubernetes hardening, 독립·암호화·복구검증 백업, append-only audit, 개인정보 최소수집/보존/삭제, secret-safe log를 포함한다.

### 1.3 관리자 경계

현재 모델은 필수 2인 승인제가 아니라 단일 `superadmin` + 보완통제다. 민감작업은 `AdminSessionGuard`, 최근 `ReauthGuard`, TOTP/`SecondFactorGuard`, DB actor 검증, 최소권한, 영향 미리보기, 사유, 필요한 경우 idempotency, append-only audit를 요구한다. superadmin도 보호된 경제/감사 이력을 직접 덮어쓰는 우회권한은 없다.

## 2. 현재 blocker 및 QA register

모든 이슈는 severity, 최초발견, 최근재현, 재현절차, 영향 사용자/기능, 실제 증거, 원인가설/확정원인, FE/BE/API/DB/infra 수정대상, 구체 설계, migration 필요성, rollback, unit/integration/E2E/실DB/security/regression test, Test 수용조건, Production 승격조건, monitoring, 상태, 담당순서를 기록한다. 반복 `BLOCKED`는 원인제거 작업으로 승격한다.

### BAK-106-01 — P0 — OPEN/BLOCKED — 독립백업 + 실제 restore 성공증거 없음

- 최초근거: GitHub issue #139, 2026-09-09. 2026-09-15 현재 OPEN. 마지막 직접 host 점검에서 `/mnt/backup`(`/dev/sda1`)은 read-only였고 별도매체 최신 관측 파일은 2026-09-07, Kubernetes 전환 이후 최신 자동백업은 확인되지 않았다. emergency PostgreSQL custom dump는 SHA-256과 `pg_restore -l`을 통과했지만 같은 host/system disk에 남아 있다.
- 영향: 전체 host/storage 손실 시 identity/session/economy/ledger/audit/inventory/entitlement/content 및 분쟁복구가 위협받는다.
- 증거공백: 승인된 원격 cluster 장비가 현재 모두 offline이라 media health 및 scheduled backup path를 새로 확인했다고 주장하지 않는다.
- 수정대상: backup medium/storage, Kubernetes/GitOps backup job, least-privilege backup identity, encryption/key separation, retention, monitoring, isolated restore, release evidence.
- migration: 백업인프라 복구 자체에는 DB migration이 필요하지 않으나, schema/data 변경 Production 작업은 독립 복구증거 전까지 차단한다.
- 테스트: corrupt/missing archive, wrong key, full disk, PITR 사용 시 WAL gap, wrong source/target, Production credential 거부, full isolated DB/object restore, migration parity, ledger/balance·entitlement/provenance 대사.
- 종료조건: 최신 독립백업 하나가 `VERIFIED_RESTORABLE`, 실제 RPO/RTO 증거, 모니터링 경보, release automation 연동까지 완료된다.
- 사업효과: 직접매출 0, 기대 데이터손실·다운타임·환불·CS·fraud·분쟁비용 회피.

### OPS-107-01 — P0 — OPEN — stale status가 수시간 false-green 유지

- 최초재현 2026-09-15 07:05 KST, 이번 회차 최신재현 약 08:08 KST. 공개 `/status`는 계속 모든 서비스 정상이라고 표시했지만 Web/economy API/ledger DB의 관측시각은 모두 04:06 KST였다. 페이지는 수집주기 30초이고 오래된 기록은 확인중으로 표시한다고 설명하므로 동일 stale snapshot이 4시간 이상 green으로 남았다.
- 저장소 계약: frontend는 revalidate하지만 API state를 신뢰하고, migration 013은 source별 `stale_after_seconds`와 stale row를 `unknown`으로 만드는 `content_public_status()`를 가진다. 초기 migration 값은 180초여서 UI의 고정 30초 설명 역시 권위 stale threshold가 아니다.
- 영향: 실제 장애나 monitoring failure를 숨겨 MTTR, support, release 오판, 신뢰손실을 키울 수 있다.
- 원인: 미확정. Production migration/function/config drift, 오래된 backend/image, collector failure+비권위 read path, cache가 후보다.
- read-only 진단: raw `/api/v1/status` body/header/server clock → frontend/backend SHA+digest → migration checksum → `pg_get_functiondef(content_public_status)` 및 `stale_after_seconds` → latest snapshot vs `clock_timestamp()` → collector attempt/success/schedule/log → isolated exact-SHA Test 재현.
- 설계: source freshness는 server authority, collection interval과 stale threshold는 분리한다. stale/missing required source는 `unknown`, overall은 `operational`이 될 수 없다. collector failure는 `monitoring delayed/checking`이며 임의 target outage나 healthy가 아니다. healthy cache는 freshness를 넘지 못하고 threshold 이후 green에 `stale-if-error`를 쓰지 않는다.
- migration 013은 수정하지 않고 새 migration/검토된 config path로 교정한다.
- QA: threshold -1/0/+1초, source별 threshold, no snapshot, future timestamp, collector stop, API/DB/cache failure, restart, mixed state, timezone, forged writer 거부, app-role write 거부, topology leak 방지.
- Test gate: synthetic collector 중단 후 설정 threshold 안에 API+UI가 checking으로 바뀌고 overall green이 내려가며 alert가 발생해야 한다. trusted fresh snapshot만 green을 복구한다.
- KPI: `status_source_age_seconds`, `collector_last_success_age_seconds`, `public_status_unknown_count`, `status_api_errors`, `stale_operational_violation_count=0`.

### REL-110-01 — P0 — BLOCKED — Test GitOps 선언은 전진했지만 실제 공개 runtime이 다른 candidate를 제공

- 최신근거: PR #332 candidate `b3f28185107a2f6f4a8bd389016de778df08b747`. CI와 immutable backend/frontend `-test` image build는 성공했다. Test infrastructure PR #67은 render check 후 merged되며 candidate label/image/Test source SHA/redeploy token을 갱신한 것으로 기록됐지만 공개 Test probe의 `/api/version`은 기대 SHA가 아니라 `1789391457242`를 반환했다. 따라서 application main merge와 Production promotion은 올바르게 중단됐다.
- 영향: build 성공·GitOps desired state와 실제 Test workload가 달라질 수 있다. 이를 같은 것으로 취급하면 다른 코드를 QA한 뒤 미검증 runtime을 운영으로 승격할 수 있다.
- 원인: 승인 cluster 장비가 offline이라 미확정. Flux source/reconcile lag/stall, Kustomization revision mismatch, Deployment/ReplicaSet rollout failure, old Pod/image digest, image pull/cache, Service/Ingress old endpoint, 잘못된 version metadata, routing/cache layer 등이 후보다.
- cluster 접근 복구 후 read-only 순서: Test GitRepository/OCI source revision → Flux Kustomization `Ready/Reconciling/Stalled`, `lastAppliedRevision`, `lastAttemptedRevision`, history/event → Deployment desired digest/env/label → ReplicaSet/Pod owner+digest+restart/image-pull event → Service endpoint → Ingress/router/cache → pod-local `/api/version` → public `/api/version`.
- 증거계약: `Git commit` ≠ `CI green` ≠ `image built` ≠ `GitOps desired-state merged` ≠ `Flux applied` ≠ `workload rollout` ≠ `Service candidate routing` ≠ `public exact-SHA`. 단계마다 timestamp/source/evidence ID를 가진다.
- 수정대상: infrastructure/GitOps reconciliation, candidate metadata/version endpoint, workload rollout, public route. 진단 자체는 DB/schema mutation이 아니다.
- rollback: Production은 변경되지 않아 Production rollback 불필요. Test 복구가 필요하면 last-known-good immutable Test digest로만 돌아가고 실패증거는 보존한다.
- QA: pod-local+public exact SHA, backend/frontend digest, DB migration checksum, least-privilege DB smoke, login/logout, Work quota UI/API, public catalog, noindex, log/resource, rollback readiness.
- 수용: 동일 candidate SHA/digest가 source commit → image provenance → GitOps applied revision → Deployment/Pod → public `/api/version`으로 연결되고 rollout 종료 후 반복 probe에서도 안정적이어야 한다.
- 상태/순서: cluster root-cause inspection에 `BLOCKED`; infra/Flux 증거 → routing/workload 교정 → exact-SHA Test QA → 그 뒤 application merge 판단.

### AUTH-105-01 — P0 — OPEN / PUBLIC LOCAL-AUTH ROLLOUT HOLD

- local email register/verify/login, Argon2id, normalized email hash/token hash가 코드·계약에 있지만 Production login/guide/privacy는 OAuth 중심이고 별도 Moneyverse password를 만들지 않는다고 설명한다.
- broad rollout 전 privacy notice/version+consent, 처리목적·항목·보유·삭제·credential removal, SMTP/provider 사실, verification-link privacy, account recovery, CS script를 맞춘다.
- credential stuffing/resource abuse, email enumeration, verifier/token log, OAuth/local collision, silent merge는 release blocker다. unknown email/wrong password는 같은 공개 오류군을 사용한다.
- signup/login/verify/recovery는 noindex/sitemap 제외, raw token은 analytics/referrer/log에 남기지 않는다.
- QA: register/verify/login/logout, invalid/expired/reused token, same/cross-browser, session rotate, rate/resource limits, provider collision, deletion, policy-version mismatch, rollback.

### QA-104-01 — P0 — IN PROGRESS, 미종료 — 직업작업 quota 표시/콘텐츠 계약

- Production `/guide`는 아직 직업작업을 일일 제한 없이 반복하며 매번 WLD/EXP 전액을 받는다고 설명하여 `daily_limit`/`taken_today` 권위 동작과 충돌한다.
- 진행상황: PR #332는 authoritative `taken_today / daily_limit` UI를 추가했고 candidate `b3f281...`는 CI 및 immutable Test image build를 통과했다.
- 미종료 이유: REL-110-01로 exact-SHA Test runtime proof가 실패했고 PR #332는 OPEN이며 Production guide 문구도 여전히 잘못됐다.
- 수정범위: Work UI, `/guide`, mobile/App API guide, FAQ/schema example, SEO snippet. `playable`과 `reward eligible`을 구분하고 오래된 문구에 맞추려고 server quota를 약화하지 않는다.
- QA: 0/partial/exact/+1, profession/task isolation, double-submit, idempotency, concurrency, Seoul day boundary, API/web/mobile parity, guide copy, accessibility, SEO metadata.
- 종료: exact-SHA isolated Test → current-main 통합 후 재검증 → Production copy/runtime smoke까지 완료한다.

### REL-104-02 — P0 — OPEN — Production-ready workflow가 규범 release evidence보다 좁음

현재 release path에는 exact-SHA/catalog/noindex check, immutable image, SBOM/provenance가 있으나 Production readiness에는 migration parity/checksum, least-privilege DB, authenticated synthetic flow, 변경기능 abuse/reconciliation, 파괴적 작업의 최신 backup/restore 증거, rollback target, REL-110-01 end-to-end candidate lineage가 필요하다. 누락·stale·wrong-revision evidence는 `BLOCKED`이며 skip-pass할 수 없다.

### AUTH-105-02 — P1 — TODO — verify-email 앱 문서 stale

현재 verify-email은 originating prelogin cookie/CSRF에 의존하지 않는 one-time bearer token cross-browser exchange다. EN/KO app-auth guide, endpoint catalog, schema/example, old-client behavior를 동기화하고 invalid/expired/reused token, arbitrary CSRF, same/cross-browser, session rotate를 시험한다.

### REL-104-03 — P1 — OPEN/CONFIRMED — required status check가 repository에서 강제되지 않음

최신 `main` branch metadata는 protection enabled지만 required-status-check enforcement `off`, contexts/checks empty다. 이제 단순 미확인이 아니라 확인된 상태다. GitHub 공식문서상 required check를 켜지 않으면 check 결과가 merge를 막지 않는다. docs-only direct-main 자동화가 필요하다면 매우 좁게 허용하되 `backend/`, `frontend/`, database/migration, deploy/security workflow는 검토된 통합과 기대 GitHub App/source의 필수 check를 요구한다. docs 예외가 runtime 우회가 되어서는 안 된다.

## 3. Candidate evidence state machine — 권위 릴리스 계약

후보는 다음 단계를 순서대로 통과한다. 뒤 단계가 앞 단계 증거를 대신하지 않는다.

1. `SOURCE_READY`: candidate SHA, base-main SHA, changed files, risk class 확정.
2. `CI_GREEN`: exact candidate의 필수 static/unit/integration/real-DB/security job 성공.
3. `IMAGE_BUILT`: immutable backend/frontend digest 및 적용 가능한 provenance/SBOM 생성.
4. `GITOPS_DECLARED`: Test GitOps desired state가 exact candidate/digest를 참조.
5. `TEST_APPLIED`: Flux source/Kustomization이 expected applied revision 및 healthy reconciliation을 보고.
6. `TEST_WORKLOAD_EXACT`: Deployment/ReplicaSet/Pod가 expected digest와 candidate metadata로 실행.
7. `TEST_PUBLIC_EXACT`: 공개 Test version endpoint가 stale route/cache 없이 expected SHA 반환.
8. `TEST_QA_GREEN`: 해당 exact runtime에 DB/API/auth/변경기능/security/noindex/log/resource/rollback QA 통과.
9. `MAIN_INTEGRATED`: 검토된 candidate가 current main에 통합. main이 이동했으면 compare/reconcile 선행.
10. `MAIN_EXACT_TEST_GREEN`: 통합된 exact main SHA를 immutable Test로 다시 배포하고 같은 gate 반복.
11. `PRODUCTION_READY`: machine-readable evidence에 모든 적용 gate, 필요한 backup/restore, rollback target 포함.
12. `PROD_DEPLOYED`: Production GitOps desired/applied/workload/public lineage가 승인된 exact main SHA/digest와 일치.
13. `PROD_SMOKE_GREEN`: HTTP/API/auth/변경 사용자흐름/log/resource/status-freshness smoke 통과 후 monitor/rollback 판단.

최소 evidence object는 `candidateSha`, `baseMainSha`, `riskClass`, `ciRunIds`, `imageDigests`, `provenanceIds`, `testGitOpsRevision`, `fluxAppliedRevision`, `testWorkloadDigests`, `testPublicVersion`, `migrationChecksum`, `dbSmoke`, `authSmoke`, `featureQa`, `securityQa`, 필요한 경우 `backupEvidenceId`, `rollbackTarget`, timestamp, operator/automation identity, expiry/freshness를 포함한다. 단계 불일치는 다음 단계로 정규화하지 않고 incident/QA blocker로 만든다.

## 4. 모든 기능의 필수 상세기획 템플릿

현재/계획 기능마다 목적·사용자문제, actor/role, 구현상태와 코드/문서근거, user story, 진입경로, 화면요소/CTA, state transition, loading/empty/error/offline/timeout, 최초/재방문/comeback, mobile/tablet/desktop, keyboard/focus/label/contrast/reduced-motion, i18n, email/push/Discord, data model/ownership, read/write permission, endpoint/method/request/response/error, idempotency/rate/resource/business-flow limit, service/business rule, table/index/constraint/transaction/concurrency, audit/metric/admin operation, feature flag/fallback, backup/recovery 영향, security/privacy/abuse, SEO/indexing, analytics/KPI, performance/cache, profitability/cost, 완료조건, unit/integration/E2E/실DB/security/regression, isolated Test 수용, Production promotion/monitoring/rollback을 기록한다.

## 5. 전체 기능 구현·제품 계약 매트릭스

| 기능군 | 증거/상태 | 권위·UX·API/DB 계약 | 보안/개인정보/악용 | SEO/성장/사업성 | 필수 QA/릴리스 게이트 |
|---|---|---|---|---|---|
| 가입/로그인/OAuth/logout/session | `IMPLEMENTED/PARTIAL` | server가 identity linking, consent, session issue/rotate/revoke 권위. local register/login은 prelogin+CSRF, verify-email은 one-time bearer token. | credential stuffing/resource budget, OAuth state/nonce/PKCE/exact redirect, secure cookie, fixation, logout, silent merge 금지. | auth noindex. verified session→activation→D1/D7/D30에서 SMTP/compute/CS/fraud/privacy 비용 차감. | provider collision, replay/fixation/logout, token expiry/reuse/cross-browser, 429, policy/privacy parity. AUTH-105-01이 broad rollout 차단. |
| profile/account/security center | `PARTIAL` | server가 profile/linked method/session 권위, 민감변경 최근 reauth. | account/session BOLA, secret 없는 ATO alert, 최소공개, audit. | private/auth/noindex, ATO/support 손실 절감. | other-user denial, reauth expiry, terminate sessions, provider-loss recovery, responsive/a11y. |
| inventory/collection/marketplace workbench | `PARTIAL`; live P2P 미증명 | DB가 item/owner/provenance/entitlement/serial 권위. 향후 listing은 escrow/cancel/expiry/settlement/fee/reversal 정의. | BOLA/serial leak, duplicate grant, wash trade/collusion, replay. | holdings private/noindex, opt-in public-safe collection만 공개. WLD spend는 sink이지 매출 아님. | ownership concurrency, duplicate entitlement, unauthorized transfer, recovery, private URL leak. |
| WLD shop/catalog | `IMPLEMENTED/PARTIAL` | server가 SKU/effective price/eligibility/limit/window/entitlement 권위. 각 SKU에 category/value/currency/consumability/test price/promo/window/limit/binding/gift/refund/recovery/sink/P2W/KPI/admin lifecycle 기록. | client price 불신, replay/duplicate, fake scarcity/reset timer, hidden personalized pricing, P2W/wealth/casino 압박 금지. | 충분한 editorial collection만 index, 구매이력 private. WLD는 경제/리텐션. | price tamper, time boundary, insufficient balance, concurrent purchase, entitlement repair/cache, admin lifecycle. |
| 실결제 cart/payment/subscription/ad removal | `UNVERIFIED` | provider 선정 후 server order/amount/tax/receipt-webhook/entitlement/refund/cancel/renewal/grace/idempotency 권위. | receipt/webhook replay/forgery, BOLA, chargeback, PCI/provider/secret 경계. | checkout/order/account noindex, 모든 fee/refund/CS/fraud/infra 차감. | provider sandbox, duplicate/out-of-order webhook, refund/regrant, renewal/cancel, legal/privacy, SCALE/ITERATE/HOLD/KILL. |
| jobs/quests/profession/level/rewards | `PARTIAL + P0 IN PROGRESS` | server/DB가 catalog/duration/cooldown/daily quota/reward/EXP/receipt/unlock 권위. UI는 `taken_today/daily_limit`, playable != reward eligible. | bot/macro/multi-account/replay/clock/concurrency, ledger 대사. | 수정된 guide만 game learning으로 index. TTFV/first job/D1/D7/inflation. | QA-104-01 + REL-110-01 exact-SHA. |
| business | `UNVERIFIED/PARTIAL` | inventory/demand/price/cost/fee/tax/management/settlement 정의, 무위험 고정복리 금지, ledger/idempotency. | circular farming, replay/refund, admin manipulation, precision. | public education 가능, private P&L noindex. | 실DB settlement/reconciliation/concurrency/abuse. |
| bank/loans | `UNVERIFIED/PARTIAL` | server가 eligibility/source/principal/interest/accrual/repayment/arrears/purpose/recovery 권위. | double repayment, clock, BOLA, multi-account/loss-chasing, 실제 예금/수익 오인 금지. | public은 simulation 교육, private balance/debt noindex. | accrual boundary, concurrent/idempotent repayment, restart/recovery, ledger. |
| virtual stocks/WDX/watchlist/portfolio/alerts/compare/search | `PARTIAL` | public market read-model과 private holdings 분리, server issuance/pricing/trade/settlement/rule 권위. | holdings BOLA, replay, manipulation/collusion, phishing alerts, integer precision. | public-safe symbol만 index, private holdings/order/alert noindex. | other-user denial, symbol, large integer, concurrency/replay, alert cooldown. |
| casino/probability | `PARTIAL/HIGH-RISK` | server outcome/probability/payout/limit/atomic settlement, 동일 idempotency는 동일 receipt/outcome. | RNG tamper/replay/limit bypass/bot/multi-account/loss chasing/youth. | gameplay/history noindex, 승리 acquisition 금지, 별도 승인 전 실매출 0. | distribution sanity, replay, limits, concurrency, ledger, legal/product review. |
| season/live event | `PARTIAL` | server start/end/grace/reward eligibility, preview는 time authority 아님, catch-up/archive. | reward farming/collusion/deadline manipulation/FOMO. | substantial season/archive만 truthful date/lastModified로 index. | timezone, late entry, duplicate reward, archive, notification cooldown. |
| community/post/comment/report/block | `PARTIAL` | server authorship/edit/delete/mod authority, deleted/locked/report/block 명시. | spam/bot/harassment/impersonation/doxxing/link/XSS/BOLA/mod abuse. | curated board 가능, individual UGC default noindex. | other-user mutation denial, XSS/link, report spam, block, mod audit, 404/410/index removal. |
| friend/club/referral | `UNVERIFIED/PARTIAL` | invite lifecycle/role/leave/kick/ban/visibility/attribution/reward maturity 정의. | invite spam/fake account/referral fraud/collusion/role escalation/private graph leak. | 명시적 public club만 공개, 보상은 cosmetic/prestige/convenience 우선. | referral ring, replay, role escalation, privacy/block. |
| notification/email/push/Discord | `PARTIAL` | server source event/preference/consent/cooldown/dedupe/delivery/deep link 권위. | phishing imitation/webhook abuse/spam/token leak, 민감잔액·부채·보안내용 금지. | noindex, healthy return에서 provider/optout/spam/privacy/support cost 차감. | dedupe/cooldown, stale link, optout, provider outage/outbox, safe logs. |
| search | `UNVERIFIED` | public-safe model만 public search, member/admin 별도 authz, pagination/no-result/timeout. | injection/expensive-query DoS/enumeration/query-log PII. | 일반 result noindex, 의도적 curated landing만 index. | authz, special chars, pagination stability, complexity/rate, relevance. |
| upload/gallery/file | `PARTIAL/spec-level unless linked code` | decode/type/magic, size/dimension, generated name, isolated storage, auth delivery, metadata strip. | malware/polyglot/path traversal/decompression bomb/SSRF/BOLA/EXIF. | private noindex, public은 permission/moderation 후. | malformed/polyglot/oversize/unauthorized/EXIF/storage/restore. |
| public home/guide/status/content | `PARTIAL + P0` | public read-model fail-honest, guide는 server contract와 일치, status freshness server-authoritative. | secret/topology/private state 금지, XSS/phishing, trusted status writer. | `/status` noindex, `/guide`는 quota/local-auth 문구 교정 전 acquisition HOLD. | HTTP/meta/a11y/CWV, guide contract, stale-status fail-closed. |
| App API/mobile gateway | `PARTIAL/COVERAGE DOCUMENTED` | versioned `/app-api/v1`, stable wrapper, breaking change는 compatibility/version 결정. | handoff/token replay, BOLA, resource abuse, PII/log mask. | API noindex, mobile activation/D30에서 support/infra/fraud 차감. | contract snapshot, old client, auth expiry, handoff one-time, error parity, AUTH-105-02. |
| admin/audit | `PARTIAL` | risky write에 current/proposed/target/impact/reason, reauth+TOTP+DB actor+idempotency/audit. | privilege escalation/session theft/CSRF/BOLA/mass action/audit tamper. | private/noindex, incident/operator/support 절감. | lower-role denial, stale reauth, invalid TOTP, mass bound, DB privilege/audit, compensation. |
| backup/recovery | `UNVERIFIED CURRENT EVIDENCE` | independent encrypted backup, source/version/checksum, isolated restore, app/ledger/object validation, measured RPO/RTO. | key theft/shared failure/wrong-env/corruption/WAL gap/shadow retention. | private/noindex, direct revenue 0. | BAK-106-01이 destructive work 차단, full fault-injected drill. |
| analytics/experiments | `PARTIAL/SPECIFIED` | pseudonymous subject, analytics session != auth secret, versioned event schema/retention/assignment/guardrail. | PII/secret leak, reidentification, experiment abuse/sensitive profiling. | safe campaign/content ID만, private SEO payload 금지. | schema/consent/deletion/deterministic assignment/outbound scan. |
| advertising/sponsorship | `IMPLEMENTED/PARTIAL reviewed placements` | 승인된 충분한 public surface만, Test ads off, ad/sponsor와 product action 분리. | invalid traffic/click encouragement/youth/privacy tracking/leak/confusion. | 광고 때문에 thin page 만들지 않음, churn/session/support/privacy/fraud 차감. | route allowlist, Test ads off, CLS/CWV, ad exit, invalid traffic/policy/privacy. |
| SEO backend | `PARTIAL` | configured-origin canonical, public metadata read model, sitemap, robots, redirect, structured data, updatedAt, images, crawler/GSC/Naver. | private leak, Host injection, cache poison, PII sitemap/JSON-LD. | organic→signup→activation→D7/D30→retained net value/CAC saving. | sitemap privacy, canonical injection, redirect loops, SSR, GSC/Naver, CWV. |
| incident/status/operations | `PARTIAL + OPS-107-01 P0` | public-safe status와 internal telemetry 분리, server freshness, collector heartbeat/snapshot age/incident/rollback/postmortem. | false green/forged writer/stale monitor/topology/admin abuse/alert fatigue. | trust/support/MTTR, `/status` noindex. | collector/source stop, cache/API/DB outage, mixed state, stale threshold, alert, exact-SHA smoke. |
| CI/Test/GitOps/Production promotion | `PARTIAL + REL-110-01 P0` | §3 state machine 권위, desired-state merge는 applied/runtime proof 아님. | stale candidate/supply-chain substitution/wrong image-routing/evidence replay. | 실패·rollback·support 비용 절감의 간접가치. | source→CI→image→Flux→Pod→public version lineage exact/fresh. |

## 6. Local first-party authentication 상세계약

| 단계 | endpoint | UX/state | 보안·오류·데이터 계약 |
|---|---|---|---|
| prelogin | `POST /app-api/v1/auth/prelogin-session` | pre-auth resume, retry 가능 | secure prelogin cookie + memory CSRF, secret log 금지 |
| policy | `GET /app-api/v1/auth/policy` | 가입 전 현재 terms/privacy | server version 권위 |
| consent | `PUT /app-api/v1/auth/consent` | 현재 policy/age 명시 동의 | SessionGuard+CSRF, stale version 재검토 |
| register | `POST /app-api/v1/auth/local/register` | email/password/display name → pending verification, SMTP 실패 복구가능 | prelogin+CSRF+current consent, password policy, normalized email/hash/Argon2id/hashed one-time token, abuse budget |
| verify | `POST /app-api/v1/auth/local/verify-email` | cross-browser 허용, 성공 시 sign-in | short-lived one-time bearer, originating cookie 불필요, raw token log 금지, 교환후 clean URL |
| login | `POST /app-api/v1/auth/local/login` | unknown/wrong password 동일 공개 오류군, offline/429/5xx 분리 | prelogin+CSRF, nonexistent dummy work, rate/resource control, session rotate |
| viewer/session | `GET /app-api/v1/auth/viewer`, `GET /app-api/v1/auth/session` | client는 server signed-in 상태만 신뢰 | signed-in cookie 권위 |
| logout | `POST /app-api/v1/auth/logout` | offline에서 원격 logout 성공처럼 표시 금지 | session+CSRF, server revoke/cookie 제거 |

Verification token surface는 noindex/sitemap 제외, `Referrer-Policy: no-referrer` 또는 동등통제, 교환 전 ads/third-party analytics/social pixel 금지, query log 마스킹, GET preview/scanner가 token을 소비하지 않으며 교환 후 token-free URL로 redirect한다. Product analytics에는 email/hash/password/verifier/token/cookie/CSRF/OAuth/recovery secret을 넣지 않는다.

## 7. SEO 및 SEO backend 계약

### 7.1 route policy

- `/`: `PUBLIC_INDEXABLE`, configured-origin self canonical, 고유 title/meta/H1, 사실인 structured data, OG/Twitter, 안정적 image dimension, 충분한 internal link.
- `/guide`: `PUBLIC_INDEXABLE_BUT_ACQUISITION_HOLD`; QA-104-01/AUTH-105-01 문구 교정 전 확대 금지. 실제 투자수익이 아닌 게임 초보 의도 타깃.
- `/status`: `PUBLIC_NOINDEX`, sitemap 제외. transient operational content이며 검색보다 진실성과 freshness 우선.
- news/season/collection/world guide: 독창적·충분·유지관리·public-safe일 때만 stable slug/meaningful lastModified로 index.
- `/stocks/[symbol]`: public-safe fictional market/world read model만 index, holdings/watch/order/alert/portfolio는 anonymous HTML/JSON-LD/shared cache에서 제외.
- UGC는 quality/moderation 기준 전 default noindex, 삭제 public content는 404/410 및 sitemap 제거.
- search/filter/sort/query variant는 의도적 curated landing이 아니면 canonical/noindex, doorway 금지.
- login/signup/verify/recovery/account/security/wallet/transfer/private bank/business/loan/portfolio/watchlist/alerts/checkout/orders/subscription/admin/moderation/backup/recovery는 auth-required 또는 public-noindex+sitemap 제외.
- Test/recovery origin은 global noindex, real ads off, sitemap submission 및 indexable user data 금지.

### 7.2 SEO backend

configured-origin `SeoMetadataReadModel`, Host injection 방어 canonical builder, URL/byte 제한을 지키는 dynamic sitemap index/shards, authoritative `lastModified`, robots generator, structured-data allowlist serializer, loop/conflict 검증 permanent 301/308 redirect map, image metadata/alt/dimension, locale/hreflang, crawler-log 분류, Search Console/Naver verification/status ingest, crawl/index/canonical/sitemap report, operator read dashboard/API를 구현·시험한다. HTML/meta/sitemap/redirect cache는 일관성을 유지하고 private identity/economy/security state는 public cache key나 structured data에 들어가지 않는다.

검색 제외는 crawl 가능한 response의 meta/header `noindex`로 제공하며 robots 차단을 noindex나 canonical 대체수단으로 사용하지 않는다. redirect/sitemap/`rel=canonical`/internal link/hreflang 신호를 일관되게 유지한다.

### 7.3 SEO 성능·사업성

impressions/clicks/CTR는 진단지표다. 사업 funnel은 `organic visit → qualified interest → signup → activation → D1/D7/D30 → retained contribution/real net revenue`. organic CAC에는 incremental organic D30 retained user당 콘텐츠·도구·SEO 운영비를 포함한다. 주요 공개 template 목표는 LCP ≤2.5s, INP <200ms, CLS <0.1이며 mobile/desktop 회귀시험한다.

## 8. 보안 위협·검증 register

| 위험 | Severity | 예방·탐지 | 필수 릴리스 행동 |
|---|---|---|---|
| BOLA/IDOR | HIGH | actor-scoped service/DB authz, client owner ID 불신, denial metric | 모든 object API에 other-user negative test, 실패 시 차단 |
| credential stuffing/session fixation | HIGH | generic error, rate/resource budget, rotate, secure cookie, reauth/logout, OAuth uniqueness | distributed invalid auth, fixation/logout/state/nonce/PKCE, 우회 시 차단 |
| resource/business-flow exhaustion | HIGH where costly | operation limit, timeout, pagination, third-party spend alert, bot signal | burst/concurrency/large-input/provider-cost test, 무제한 email/upload/search/reward 금지 |
| economy replay/duplicate/concurrency | HIGH | idempotency unique, transaction/lock, append-only ledger/reconciliation | parallel/retry/replay/precision/ledger mismatch 차단 |
| admin abuse | HIGH | session+reauth+TOTP+DB actor+least privilege+impact preview+audit | lower-role/stale reauth/TOTP/CSRF/mass/DB privilege 실패 차단 |
| upload/UGC | HIGH | decoded type, isolated storage, encoding/CSP, metadata minimization/moderation | polyglot/malformed/XSS/link/unauthorized delivery |
| analytics/ad/SEO leakage | MEDIUM/HIGH | outbound allowlist/minimization, URL/structured data에 token/balance/debt/security 금지 | payload/schema/sitemap/JSON-LD scan, HIGH leak 차단 |
| supply chain | MEDIUM/HIGH | immutable action/image ref, dependency audit, SBOM/provenance | workflow/dependency/provenance regression severity gate |
| candidate lineage mismatch | HIGH | §3 chain, image digest, Flux revision, Pod/public version probe | desired/applied/workload/public mismatch 시 merge/promotion 차단 |
| release evidence bypass | HIGH | immutable SHA, machine-readable fail-closed evidence, skip-pass 금지 | 각 prerequisite fault injection, Production-ready emission 차단 |
| backup/key compromise | HIGH | encryption/key separation/independent medium/least privilege/audit | unauthorized key/plaintext test, HIGH leak 차단 |
| wrong-environment restore | CRITICAL/HIGH | source/target identity, isolated DB/namespace, separate creds/outbound sink | wrong target/Production credential simulation, prod write 가능성 차단 |
| backup corruption/WAL gap | HIGH | checksum/manifest/full restore/WAL monitoring/reconciliation | corrupt/missing/wrong checksum fail-closed+alert |
| multi-account/referral/market manipulation | HIGH where economy affected | maturity/cap/provenance/anomaly/graph | referral ring/wash trade/collusion/duplicate/replay |
| stale/forged operational health | HIGH | trusted writer/server freshness/collector heartbeat/parity | false-green stale/stop/cache/API/DB/forged writer는 status-dependent release 차단 |

password/verifier/session cookie/OAuth code/client secret/bot token/DB password/backup key/raw verification·recovery token 및 unrestricted request body는 일반 log에 남기지 않는다. 보안 event는 pseudonymous ID와 안전한 classification을 사용한다.

## 9. 수익성·사업성 계약

어떤 기능도 gross revenue만으로 승인하지 않는다. 실결제/광고 기능마다 model, 유료전환경로, 표시·테스트가격, attach/paid conversion/repeat/renewal 가설, refund/churn/cancel, 실제 매출이 있을 때만 ARPU/ARPDAU/ARPPU, eCPM/fill/CTR, platform/payment/tax/refund/chargeback, infra/storage/CDN/notification/LLM, content/CS/moderation/fraud/security 비용, gross/contribution margin, CAC, LTV, LTV/CAC, payback, 낙관/기준/보수 민감도, D1/D7/D30, 신뢰·규제 비용, `SCALE/ITERATE/HOLD/KILL` 기준을 기록한다.

- WLD-only shop/casino/bank/stock은 실매출이 아니다.
- 광고 순기여 = 광고매출 - 광고유발 churn/session 감소 LTV 손실 - ad infra/privacy/support/fraud 비용.
- SEO는 impression이 아니라 incremental organic D30 retained user와 CAC 절감을 본다.
- security/QA/release/backup/status/GitOps는 사고·데이터손실·다운타임·환불·fraud·support 기대비용 회피로 본다. 실측 전 통화금액을 만들지 않는다.
- local auth는 incremental D30 retained contribution에서 SMTP/Argon2/DB/support/fraud/privacy/security 비용을 차감한다.
- status false-green은 HOLD/KILL 신호이며 `stale_operational_violation_count` 목표는 0이다.
- release lineage 실패는 engineering queue, rerun compute, operator time을 증가시킨다. candidate lead time, failed promotion attempt, rerun cost, escaped-defect avoidance를 측정한다.
- 향후 recurring billing은 결제 전 중요조건 공개, affirmative consent, 간단한 해지를 요구한다. provider 선정 전 fee는 가설이다.

## 10. 백업·재해복구

허용 가능한 identity/ledger/content 손실과 복구비용에 기반해 명시적 RPO/RTO를 승인하며 기획 자동화가 숫자를 임의로 만들지 않는다. RPO는 실제 최신 복구가능시점, RTO는 timed full drill로 측정한다. PostgreSQL identity/economy/ledger/audit, migration/schema/version/checksum, inventory/entitlement/content metadata, 필요한 object/photo storage, application/GitOps version을 백업한다. key/secret recovery는 별도 암호화 control plane을 사용한다.

primary host/storage/failure domain 또는 online credential을 공유하는 replica/recovery DB/snapshot/dump는 독립 DR이 아니다. `VERIFIED_RESTORABLE`은 clean isolated target → source identity → decrypt/key/checksum/manifest → full DB restore/PITR proof → migration parity → Production outbound가 꺼진 least-privilege app smoke → referential integrity → ledger/balance → inventory/entitlement/provenance → representative object restore → email/Discord/webhook/ads/indexing off → recoverable point/RTO 측정 → evidence/audit → controlled disposal/retention을 모두 요구한다.

파괴적/schema-changing 작업에는 current candidate SHA, backup ID/source/failure-domain, encryption/key, checksum/manifest, restore drill/time, RPO/RTO, migration parity, reconciliation, object sample, rollback target, operator identity, freshness가 필요하다. missing/stale/corrupt/wrong-key/wrong-env/WAL-gap/reconciliation-failed/untested는 `BLOCKED`다.

## 11. QA·Test·릴리스·관측·롤백

### 11.1 candidate sequence

§3 state machine을 그대로 사용한다. Test는 isolated namespace/DB, indexing off, real ads off다. Test/recovery는 Production email/Discord/webhook을 보내거나 Production data를 변경할 수 없다. CI 성공 또는 image build 성공은 applied/runtime proof를 대체하지 않는다.

### 11.2 monitoring

API 4xx/5xx, auth/ATO, DB pool/transaction, migration parity, ledger reconciliation, duplicate reward/quota denial, entitlement failure, outbox/provider, ad-induced exit/CWV, crawl/index error, backup freshness/restore, release evidence/rollback, Flux source/Kustomization applied revision, rollout replica/digest, public exact-SHA probe, collector heartbeat, status source age, stale-green violation을 관측한다. monitoring data가 없으면 healthy로 보지 않는다.

### 11.3 rollback

rollback은 알려진 immutable application/image/GitOps target과 호환 DB contract를 사용한다. 적용된 migration을 과거로 편집하지 않는다. DB rollback이 안전하지 않으면 backward-compatible schema를 쓰거나 forward corrective migration을 사용한다. cleanup 전 incident evidence를 보존한다.

## 12. UX·접근성·성장·운영

첫 방문은 복잡한 경제 전체보다 하나의 명확한 제품 약속과 game-only 경계를 먼저 설명한다. Activation은 `방문 → 이해 → sample/value → contextual signup → 첫 의미있는 verified action → 결과/보상 → 다음 목표`. D1은 선택 thread 복원, D3는 실제 변화 또는 정직한 no-change, D7은 하나의 progression/collection/project/learning loop 완결, D14는 자발적 breadth, D30은 durable history/identity/collection을 남긴다.

punitive streak, loss-threat FOMO, fake scarcity, 과도한 알림을 피하고 catch-up/comeback을 제공한다. 공유는 public-safe achievement/collection/project/season/learning을 우선한다. 공유 URL에는 session token, private holdings, balance, debt, casino, recovery/security state, PII를 넣지 않는다. referral reward는 fraud-resistant maturity 이후 cosmetic/prestige/convenience 중심이다.

모든 flow는 loading/empty/error/offline/timeout, keyboard/focus/label/contrast/reduced motion, mobile/tablet/desktop, EN/KO copy parity를 다룬다. 고위험 account/economy/admin action은 명시 확인과 anti-phishing UX를 사용한다. Admin/CS는 dispute/refund/report/abuse queue, feature flag, incident messaging, audit를 운영한다.

## 13. 외부 레퍼런스 적용판정 — v2026.09.15.110

- Flux Kustomization 최신 문서: **직접채택**. `Ready`, reconciliation condition/history, `lastAppliedRevision`, `lastAttemptedRevision`, applied origin revision을 Git commit/desired-state merge와 별개의 실제 배포증거로 취급한다.
- GitHub protected branch/status check 문서: **직접채택**. required check는 merge 차단을 강제할 수 있고 strict mode는 최신 base 반영을 요구할 수 있다. 현재 저장소 metadata는 required checks off이므로 REL-104-03은 OPEN이다.
- GitHub artifact attestation: **공급망 증거로 직접채택**. provenance/SBOM은 artifact가 어떻게 빌드됐는지 강화하지만 cluster가 실제 그 artifact를 제공한다는 증명은 아니다.
- OWASP API Security API4/API5/API6: **직접 보안기준**. resource/cost exhaustion, function authorization, 자동화된 sensitive business-flow abuse를 전 기능에 적용한다.
- Google Search Central canonical/noindex: **직접 SEO 채택**. 검색 제외는 crawl 가능한 noindex meta/header로 하고 robots 차단을 noindex/canonical 대체로 사용하지 않는다. canonical 신호는 일치시킨다.
- CISA backup/ransomware 및 PostgreSQL backup/PITR: **직접 복원력 참고**. 실제 full restore evidence가 최종 기준이다.
- 한국 개인정보보호위원회 최신 처리방침 자료: **직접 고지 설계**. local-auth/analytics 실제 처리와 공개 고지를 일치시킨다.
- FTC 2026 negative-option/subscription 집행·검토: **참고 + 제품 guardrail**. 중요 반복결제조건 사전고지, 명시동의, 간단한 해지를 요구하되 관할을 과장하지 않는다.

## 14. 현재 증거 snapshot — v2026.09.15.110

- 시작 application `main`은 `a0b4d656f7bad17ff9ee0acb976358df9466a750`였다. 첫 영문 v110 통합 후 `main`은 `9aeab1f8ad984ec6d081fb5ed9ee95d2defcf5c3`가 되었고 이는 문서-only self change다. 그 사이 외부 동시 main 이동은 확인되지 않았다.
- branch metadata는 `main` protection enabled, required status-check enforcement `off`, contexts/checks empty를 직접 보여준다. REL-104-03은 confirmed open이다.
- Production `/status`는 약 08:08 KST에도 04:06 KST snapshot으로 all-normal을 표시해 OPS-107-01 false-green이 4시간 이상 지속됐다.
- Production `/guide`는 unlimited profession-work/full-reward 문구 및 Discord/Google-only/no-separate-password 문구가 남아 있어 QA-104-01, AUTH-105-01은 OPEN이다.
- Production privacy는 OAuth 중심이며 local credential processing을 설명하지 않아 broad local-auth rollout HOLD를 유지한다.
- issue #139는 OPEN이고 Remote Desktop 승인장비는 모두 offline이라 새로운 backup-media/cluster 증거를 주장하지 않는다.
- PR #332는 OPEN/mergeable. head `b3f28185107a2f6f4a8bd389016de778df08b747`는 CI와 Test Candidate image build를 성공했다. 그러나 infrastructure desired-state 통합 후에도 public Test `/api/version`은 `1789391457242`를 반환해 exact-SHA staging이 실패했고 REL-110-01은 P0/BLOCKED다.
- 해당 candidate는 Production을 변경하지 않았으므로 Production rollback은 필요하지 않다.
- v110은 planning/docs only다. 이 회차에서는 runtime code, API, DB schema/data, migration, infrastructure, collector, backup medium, secret, branch rule을 변경하지 않는다.

### v2026.09.16.1 변경 — 조합 가능한 주식 탐색
`/stocks` 탐색은 URL 기반 `q` 검색과 `sort=change|price|available|name` 정렬을 함께 사용합니다. 한 조건을 바꿀 때 다른 조건을 유지해 결과 화면을 북마크·공유할 수 있어야 합니다. 경제 값은 정수 문자열 정밀도를 유지하고 잘못된 정렬 값은 API 기본순으로 돌아갑니다.

## 2026-09-16 — v2026.09.16.138 적응형 직업/일일 제한 통합

- Moneyverse Economy AI가 주직업 슬롯, 동시 활성 직업 수, 직업별 반복보상, 일일 작업/정상보상 보호한도를 정책 레지스트리에서 함께 분석·조절할 수 있도록 통합한다.
- 일반 일일 제한은 `null = 무제한`이 기본이다. finite cap은 다중 시간창 증거·시뮬레이션·인과평가·결정론적 가드레일을 통과한 한시적 보호조치로만 적용하며 자동 완화/무제한 복귀를 필수로 한다.
- AI는 기존 주직업을 임의 교체·박탈하거나 숙련도를 삭제하지 않는다. 슬롯 축소는 기존 사용자를 grandfathering하거나 별도 사람 승인 migration을 요구한다.
- 주식 가격, 상점 가격, 저위험 상품 생성과 동일하게 직업정책도 다중 에이전트가 후보를 만들 수 있지만 최종 집행권은 versioned deterministic policy gate에 있다.

## 2026-09-16 — v2026.09.16.139 전통 + AI 이중 경제 제어 통합

- 경제 자동화는 동일한 불변 snapshot을 사용하는 전통/결정론 기준 lane과 AI/학습 탐색 lane 두 개를 계속 운영한다.
- 전통 lane은 회계·대사·시장 매칭/가격범위·정책제약·안전의 권위이자 AI 장애 시 운영 fallback이다. AI는 행동 agent, 반사실, RL/MARL simulation, 수요/상품 가설, 적대 분석을 추가한다.
- 두 lane이 크게 충돌하면 평균으로 운영에 넣지 않고 `SHADOW`, `NO_OP`, 사람검토로 내린다. 합의하더라도 결정론 검증을 통과해야 자동적용 후보가 된다.
- 이번 연구에서 OpenAlex+Crossref를 합쳐 중복 제거된 **11,749건** 후보군과 machine-readable 목록, 영문/한국어 검토 문서를 `docs/findings/`에 추가한다. 후보군 규모는 탐색범위이며 운영판단은 핵심 원문·현재 런타임 데이터·적용 후 인과효과를 요구한다.

## 2026-09-16 — v2026.09.16.141 분야별 2중 경제 AI 런타임

- 경제 AI lane을 6개 전문분야와 분야별 독립 설정 가능한 A/B 2개 좌석으로 구현하고 독립판단 → 상호반박, 분야 충돌 시 abstain, 안전 중요 pair-veto를 적용한다.
- 기존 결정론 경제엔진은 항상 사용 가능한 classical lane으로 유지하며 AI 장애가 경제서비스 장애가 되지 않게 한다.
- exact proposal hash, expiry, 집계판정, 최종 12개 좌석 증거를 저장한 뒤 결정론 중재를 수행한다.
- 로컬 AI 모델/cache/dataset은 32GB 시스템 디스크가 아니라 100GB `/srv/moneyverse-data` 디스크에 저장한다.


## 2026-09-16 — v2026.09.16.152 런타임 권위·릴리스·Work clock·교차기능 통합

### 증거 스냅샷과 릴리스 권위

- **통합 시점 application main:** `d6cf13d4236bd1298010ae5f165b15899356a59d`. 저장소가 계속 변경되므로 merge 직전 다시 확인한다.
- `v2026.09.16.151` 런타임 증거는 Kubernetes/Flux가 현재 공개 권위라는 과거 가정을 대체한다. 현재 공개 Test/Production은 승인된 Debian 13 호스트의 분리된 systemd release와 로컬 PostgreSQL 권위 경로에서 서비스된다. NixOS/Kubernetes 노드는 **현재 Production 권위가 아니라 복구 대상**이다.
- 공개 Test/Production과 application/GitOps desired 참조는 application SHA `3d87165f83bcb60903e85d4f3600fdf40074ef40`로 수렴했다고 기록됐다. Production Flux `apps`는 cluster-admin 접근과 DB 대사가 독립적으로 증명될 때까지 suspend 상태를 유지한다.
- `REL-110-01 / P0`은 일반 exact-SHA divergence에서 **RECOVERY_IN_PROGRESS / AUTHORITY_SPLIT_CONTAINED**로 바꾼다. Kubernetes 접근, DB 대사, 통제된 Flux 복귀가 끝나기 전에는 DONE이 아니다.
- current-main `Build Production Release #878`은 확인 시점에 `in_progress`였다. 문서 commit, candidate build, GitOps 선언, 과거 runtime convergence는 더 최신 main SHA가 운영 중이라는 증거가 아니다. 승격 SHA의 exact-main Test, backend/API/DB/user-flow QA, Production smoke가 없으면 fail-closed한다.

### OPS-RUNTIME-152-01 — 이중 control-plane/권위 모호성

- **우선순위/severity/status:** P0 / CRITICAL 운영 무결성 / IN PROGRESS.
- **최초발견:** 2026-09-16 incident recovery, **최근재현:** current main의 v151 runtime-authority 기록.
- **영향:** Debian systemd와 suspend된 Kubernetes를 동시에 권위로 오인하면 deploy/rollback, DB write, backup/restore, 장애대응, version truth가 잘못된 control plane을 향할 수 있다.
- **확정원인:** 의도한 Flux/Kubernetes 제어면의 관리자 접근이 복구되지 않은 상태에서 Debian 호스트로 공개 서비스를 복구했고, 과거 문서는 런타임 권위 이동 뒤에도 Kubernetes를 권위로 설명했다.
- **수정설계:** 운영이 소유하는 machine-readable `runtime-authority.json`을 두고 `environment`, `authority_generation`, `runtime_type`, host/workload identity, `application_sha`, `db_authority_id`, `desired_gitops_sha`, `flux_suspended`, `verified_at`, `evidence_run`, `rollback_target`을 기록한다. release automation은 시작 시 generation을 고정하고 실행 중 바뀌면 권위 변경 작업을 거부한다.
- **DB/마이그레이션:** 권위 기록만을 위한 product-data migration은 하지 않는다. Kubernetes 재활성화 전에 현재 Debian PostgreSQL과 candidate cluster DB의 schema migration/checksum, ledger invariant, 핵심 row count, bounded reconciliation snapshot을 비교한다. 두 DB를 동시에 writable authority로 합치지 않고 하나의 source of truth를 정해 rehearsal된 단방향 migration/cutover를 수행한다.
- **롤백:** Debian이 권위인 동안 rollback은 마지막 verified Debian release와 호환 DB state로 한다. Flux unsuspend를 rollback shortcut으로 사용하지 않는다.
- **테스트/승격게이트:** exact-SHA Test, DB connectivity/schema, 비경제 probe read/write canary, ledger reconciliation, backup restore rehearsal, DNS/tunnel routing, process restart, stale GitOps negative test, authority-generation race test. 권위 모호성·dual writer·stale schema·rollback evidence 누락은 Production 차단이다.
- **모니터링:** public `/api/version`, systemd working directory/release SHA, DB authority fingerprint, GitOps desired SHA, Flux suspend, schema version, backup freshness, reconciliation drift. 둘 이상의 권위 신호가 5분 넘게 다르면 alert한다.

### OPS-FLUX-150-01 — privileged recovery 정리

- jump-host/SSH 복구는 incident 도구이며 영구 deployment backdoor가 아니다. private key, kubeconfig, DB credential, bearer/session secret을 repository/artifact/일반 로그에 남기지 않는다.
- 완료조건은 임시 authorized key/capability 제거, immutable operator/run audit, pinned host-key evidence, 명시적 Flux suspend/resume 결정, normal approval boundary 없이 workflow가 Production을 변경하지 못한다는 사후검증이다.
- controller restart 전후 source revision, last-applied/attempted revision, readiness/event를 저장한다. restart 성공만으로 root cause를 종료하지 않는다.
- 운영 API/자동화에도 OWASP ASVS 5.0 검증 원칙과 API Security 2023 access-control/resource-consumption 경계를 적용해 least privilege, bounded execution, explicit authorization, tamper-evident audit, fail-closed secret handling을 요구한다.

### WORK-CLOCK-149-01 — dashboard/write clock 수렴

- **우선순위/severity/status:** P1 정확성+경제무결성 영향 / HIGH / PR #370 FIX PENDING.
- settlement는 가속 Moneyverse server clock을 사용하지만 legacy `work_my_dashboard` read model은 실제 Asia/Seoul day/week window를 사용할 수 있어 화면의 `daily_paid`/`weekly_paid`와 실제 settlement quota window가 달라질 수 있다.
- migration 202에서 dashboard key를 settlement와 동일한 `server_game_day_key()` / `server_game_week_key()` 권위로 통일한다. 적용된 migration은 immutable이며 migration 번호 중복과 checksum 변경은 CI hard fail이다.
- QA: 경계 -1/0/+1초, 가속 day/week rollover, 동시 completion, idempotent retry, restart, timezone 설정, stale dashboard cache, API/UI parity, real PostgreSQL regression. 모든 시험 시각에서 settlement/dashboard key가 동일해야 통과한다.
- UX는 다음 reset을 server-authoritative time으로 표시하며 loading/error/offline에서 남은 quota를 추측하지 않는다. 접근성은 색상 없이 reset time/quota를 읽을 수 있어야 하고 모바일/데스크톱 의미는 동일하다.
- 사업 KPI는 매출이 아니라 work completion, quota-confusion CS, retry/error, D1/D7/D30 job retention이다. retention이 좋아도 reward authority 불일치는 허용하지 않는다.

### 현재 기능군 공통 구현 계약

- **인증/세션/보안센터:** session actor가 권위다. OAuth/OIDC에는 해당되는 state/nonce/PKCE, session rotation/revocation, 민감변경 recent reauth를 적용한다. profile/admin/stock/bank/business/community/telemetry object에는 BOLA/BFLA negative test가 필수다.
- **경제/인벤토리/상점/결제/구독:** 가치변경은 server-authoritative, integer-safe, transactional, idempotent다. client 표시가격은 settlement authority가 아니다. 실결제 SKU는 receipt/webhook 검증, entitlement reconciliation, refund/revoke/restore state machine, append-only audit가 필요하다. 미실측 conversion/ARPU/ARPPU/refund/churn/CAC/LTV는 `HYPOTHESIS`/`TEST TARGET`이다.
- **직업/퀘스트/레벨/보상:** reward와 quota는 server game clock, durable receipt/idempotency, append-only ledger를 사용하고 client timer는 표시 전용이다.
- **은행/대출/사업/가상주식:** simulated/game-only 표시를 강제한다. 이자, 대출자격, 주식체결, 사업정산, portfolio history는 DB/server 권위이며 실제 증권·예금·수익보장 표현을 금지한다.
- **카지노/확률형:** themed UI는 하나의 typed server action schema에 매핑한다. client RNG/animation은 payout을 결정하지 않는다. eligibility, bet debit, server RNG, payout, ledger, audit, idempotency를 원자적으로 처리하고 retry는 동일 receipt를 반환한다.
- **커뮤니티/친구/클럽/추천:** moderation/block/report, invite/referral anti-replay, rate limit이 필요하다. 추천보상은 server-side idempotent이며 fraud 관측이 가능해야 한다. multi-account signal 하나만으로 비공개 자동제재하지 않고 risk control/review와 조합한다.
- **알림/Discord/email/push:** 외부전송은 post-commit/outbox 기반이다. 전송실패가 이미 commit된 경제 transaction을 rollback시키지 않으며 retry는 bounded/deduplicated다.
- **검색/갤러리/upload/public content:** signature/content-type, size/dimension, generated storage name, 필요한 malware/content 검사, private-by-default ownership, safe download header를 적용한다. 공개 UGC는 publication과 별도의 moderation/index-policy 상태를 가진다.
- **관리자/audit/analytics:** raw telemetry와 aggregate analytics 권한을 분리한다. raw IP/session/user-agent는 recent reauth+purpose+audit를 요구하고 retention/minimization을 적용한다. 가치/정책 변경 admin mutation은 명시적 function authorization과 reason/idempotency가 필요하다.
- **backup/restore/운영:** backup 존재는 recovery 증거가 아니다. independent restore rehearsal, RPO/RTO, encrypted/off-host copy, schema/application compatibility, authority cutover를 검증한다. rehearsal되지 않은 restore는 `UNVERIFIED`다.

### SEO 및 SEO 백엔드

- 이번 회차 최신 Google Search 자료는 핵심 indexing 계약을 바꾸지 않았다. 2026-08-28 site reputation update는 third-party/sponsored/UGC governance에 계속 적용하며 host reputation을 빌리기 위한 제3자 section을 만들지 않는다.
- public SEO read-model은 stable canonical identity, slug/redirect history, `updatedAt/lastModified`, language, ownership/editorial/sponsor/index-policy, image metadata, structured-data input을 제공한다. private/account/admin/transaction/casino-history/payment-callback은 강제 `noindex` + sitemap 제외다.
- dynamic sitemap/robots는 publish/index 상태에서 결정론적으로 생성하고 search-engine limit 이전에 분할하며 stable `lastmod`를 제공하고 private object ID를 유출하지 않는다. 한국 시장 smoke에는 Naver robots 검증+sitemap discovery를 넣고 rendering/index policy 변경 배포 후 Google/Naver 대표 URL 검사를 수행한다.
- 공개 페이지는 SSR/ISR 또는 동등한 crawlable server output, stable canonical, 실제 번역본에만 hreflang, 명확한 title/H1, 필요한 breadcrumb/internal link, OG, image dimensions/alt, visible content와 일치하는 JSON-LD를 사용한다. filter/query 변형은 canonical/noindex 처리하고 삭제는 404/410, 영구이동은 one-hop permanent redirect를 사용한다.
- LCP/INP/CLS를 public template/device별 관측하고 robots/noindex/canonical regression, sitemap private leak, structured-data mismatch는 SEO release blocker다. KPI는 impressions→CTR→visit→signup→activation→D7/D30→payer/ad contribution이다.

### 수익화와 unit economics 게이트

- Google Play 수수료는 market/cohort/transaction에 따라 달라 하나의 고정 store rate를 쓰지 않는다. EEA/UK/US의 2026-06-30 구조에서 표준 자동갱신 subscription은 10%, 기타 new-install transaction은 20%, existing-install은 25%이며 Play Billing 적용 시 5% billing fee가 추가된다. 다른 시장은 실제 rollout 전 해당 기존/program 정책을 적용한다.
- 모든 실결제 SKU는 `market`, effective-date/install cohort, recurring 여부, billing path/program, gross price, platform/billing fee, tax 가정, refund/fraud loss, entitlement/support/infra cost, contribution margin을 모델링한다. discount가 contribution margin/fairness guardrail을 깨면 거부한다.
- 상점/결제/구독 SCALE은 기준 시나리오 contribution margin 양수, refund/fraud/support cost bounded, D7/D30·신뢰 악화 없음이 조건이다. conversion은 있으나 margin/retention 미달이면 ITERATE, 지속적 negative contribution 또는 P2W/dark-pattern/regulatory risk면 KILL한다.
- 광고는 incremental ad net revenue에서 광고 유발 session/retention 감소와 support/privacy cost를 뺀 순효과로 본다. SEO는 CAC 절감과 activation/LTV, 보안/QA/운영은 사고·fraud·refund·downtime·operator cost 회피효과로 평가한다.

### 릴리스/백로그 순서

`P0 runtime authority/exact-SHA truth → P0 independent backup+restore evidence → P0 false-green/status truth → HIGH privileged recovery cleanup → HIGH migration sequence+Work clock convergence → HIGH repository required-check enforcement → HIGH economy/admin/casino authorization+integrity → P1 core correctness → payment/shop unit economics → SEO acquisition → retention/growth → accessibility/장기확장`.

v152 통합은 문서만 변경한다. runtime code, product data/DB schema, Flux suspend, credential, Production을 변경하지 않는다. 실제 구현은 새 branch → tests/CI → exact-SHA Test → backend/API/DB/user-flow QA → main → Production promotion → smoke/rollback evidence 순서를 유지한다.


## 18. 시간별 통합 변경 — v2026.09.16.153

### 18.1 증거 스냅샷·릴리스 진실성

- 증거일: 2026-09-16. 시작 및 작업 중간 기준 `main`은 `9ca10bed71bf0175c146324ee9e6eca111f35ad8`로 동일했고 문서 브랜치 생성 전 source drift는 없었다.
- 해당 exact-main SHA의 `Build Production Release #880`은 확인 시점 `in_progress`였다. 따라서 current-main Production 검증은 `UNVERIFIED`다. 문서 merge, skipped auto-promotion, 진행 중 release는 운영 증거가 아니다.
- `REL-110/REL-133`은 exact Test workload SHA, public Test SHA, backend readiness, 권위 DB path/schema, Production SHA와 smoke evidence가 모두 일치할 때까지 P0다. timeout 연장이나 rerun만으로 incident를 종료하지 않는다.
- 열린 PR #370(`WORK-CLOCK-149-01`)은 새 main 기준 현재 non-mergeable이며 `HIGH / FIX_PENDING`을 유지한다. rebase/update 과정에서 적용 migration의 번호·내용 불변성을 지키고 실제 PostgreSQL 가속 day/week 경계 회귀시험을 다시 통과해야 한다.

### 18.2 구현 가능한 백로그 변경

1. `REL-EVIDENCE-153-01 / P0 / IN_PROGRESS`: 모든 release attempt는 성공/실패와 무관하게 release SHA, desired/applied revision, workload generation, image digest, pod-local/public version SHA, backend readiness, DB authority/schema checksum, 최초 실패계층, probe timestamp/latency, rollback target을 evidence bundle로 남긴다. secret/cookie/Authorization/DSN/private key는 금지한다. 수용조건은 실패 release 중 evidence 누락 0건, exact-SHA/DB assertion 불일치 상태 Production promotion 0건이다.
2. `WORK-CLOCK-149-01 / HIGH / FIX_PENDING`: dashboard와 settlement는 동일한 `server_game_day_key()`/`server_game_week_key()`를 사용한다. 경계 -1/0/+1초, 현실 10분 game-day rollover, 현실 70분 game-week rollover, 동시 completion, retry/idempotency, process restart, DB timezone 변경을 시험한다. rollback은 forward-only corrective migration이며 적용 migration을 수정하거나 renumber하지 않는다.
3. `SEO-153-01 / P1 / ADOPT`: Google Search Central의 현재 9월 8일 변경은 지역별 Search experience 문서를 추가했고 8월 28일 site reputation policy 변경은 계속 중요하다. WDX/가상주식을 실제 금융정보 provider처럼 표현해 finance surface 자격을 노리지 않는다. 공개 SEO read-model은 content owner/editorial control/sponsor/index policy를 유지하고 계정·거래·카지노내역·결제 callback·관리자 화면은 `noindex` 및 sitemap 제외를 유지한다. favicon QA는 안정적인 정사각형 URL과 homepage/favicon crawlability를 검사한다.
4. `MONETIZATION-153-01 / P1 / ADOPT`: Google Play에는 하나의 보편적 수수료율이 없다. unit economics는 market, effective-date/install cohort, recurring/non-recurring, billing path, enrolled program을 key로 한다. EEA/UK/US의 2026-06-30 이후 standard 기준은 auto-renewing subscription 10%, 기타 new-install 20%, existing-install 25%이며 해당 시 5% billing fee를 더한다. 나머지 시장은 새 구조가 실제 적용되기 전 현재 적용 프로그램 규칙을 사용한다. conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC, LTV는 측정 전 `가설/테스트 기준`이다.

### 18.3 교차영역 완료 게이트

P0/HIGH는 문서 반영만으로 `DONE`이 아니다. 실제 흐름은 branch → 정적/단위/통합/실DB/보안시험 → immutable candidate → isolated exact-SHA Test → backend/API/DB/사용자흐름 QA → main → exact-main 재시험 → Production 승격 → smoke/관측 → 필요 시 rollback이다. 매출·성장 작업은 데이터손실·권한·경제무결성·DB무결성·backup/restore·release-truth gate를 우회하지 않는다.

### 18.4 v153 worklog

외부 근거는 Google Search Central 2026년 9월 변경·8월 28일 site reputation policy, OWASP API Security Top 10/ASVS baseline, Google Play 현재 서비스 수수료 문서를 재확인했다. 저장소 근거는 최신 main, v152 영문/한국어 통합본, Actions 상태, 열린 PR #370을 재확인했다. 결론은 운영승격을 추정하지 않고 P0 release truth를 유지하며 exact release-evidence 수용조건을 추가하고, Work clock 수정은 mergeability/exact-SHA 실DB QA 전까지 blocked로 유지하며, 수익성은 market/cohort별 계산을 유지하는 것이다. 이번 기획 회차에서 runtime code, DB, Flux, Production은 변경하지 않았다.


## v2026.09.16.154 — 시간별 증거 갱신

### 릴리스/CI 증거 — REL-EVIDENCE-154-01 — P0 — IN PROGRESS
- 2026-09-16 확인 시 현재 `main`은 `83f00a978e8e1bed0c5b94a7b4cda81893f4c669` (`docs: integrate Moneyverse plan v2026.09.16.153 (#379)`)이다. 작업 중간 재확인도 동일 SHA여서 기획 중 main drift는 없었다.
- exact-main `Build Test Candidate #740`의 verification job은 lint, typecheck, build, migration, test, Prisma schema mutation 차단, production dependency audit를 통과했다. 관측 시점에는 backend candidate image가 완료되고 frontend candidate image가 빌드 중이었다. 이는 `CI verification green / candidate image build pending`이지 isolated Test 또는 Production 증거가 아니다.
- branch metadata는 protection enabled이나 required-status-check enforcement가 `off`이고 required context/check가 비어 있다. 따라서 `REL-104-03`은 runtime-sensitive path가 저장소 차원에서 강제되기 전까지 confirmed 상태를 유지한다.
- 수용조건은 fail-closed다. 이미지 빌드 완료만으로 `IMAGE_BUILT` 이후 상태로 승격하지 않는다. isolated Test에서 exact SHA/digest, backend/API/DB path, least-privilege DB, 변경기능 QA, noindex를 증명해야 한다. 실패/timeout 회차도 secret 없이 expected/observed evidence를 보존한다.

### Work clock 무결성 — WORK-CLOCK-149-01 — HIGH — FIX PENDING / REBASE REQUIRED
- PR #370은 head `8ff8314a4425f874508b3d8d966e95ae40450b2a`, 기록된 base `3d87165f83bcb60903e85d4f3600fdf40074ef40` 상태로 열려 있고 현재 main은 더 전진했다. 수정 목적은 `work_my_dashboard.daily_paid/weekly_paid`를 `server_game_day_key()` / `server_game_week_key()`와 일치시키고 real-PostgreSQL regression을 추가하는 것이다.
- 병합 전 current main과 rebase/reconcile하고 migration 번호 중복/적용 migration 불변성 및 real-DB 테스트를 다시 수행한 뒤 exact-head isolated Test를 요구한다. 이미 적용된 migration은 수정/rename하지 않고 새 forward migration으로 충돌을 해결한다.
- QA: game-day/week 경계 -1/0/+1초, 현실 10분 day·70분 week rollover, 동시 완료, duplicate/retry idempotency, process restart, DB timezone, stale read-model/cache, settlement 권위와 dashboard counter 동일성을 검증한다.

### SEO/SEO 백엔드 갱신
- 2026-09-08/09-14 Google Search Central 최신 글은 행사 공지이며 crawl/index 계약 변경이 아니다. 2026-08-28 site reputation policy 변경은 계속 적용해 sponsor/affiliate/UGC가 Moneyverse host 평판만 이용하는 구조를 제외한다.
- 공개 SEO read-model은 canonical URL, slug/redirect history, title/description/H1, index policy, content owner/editorial control/sponsor type, locale/hreflang, updatedAt/lastModified, image metadata, structured-data input을 권위 있게 공급한다. 계정/관리자/payment callback/private transaction/casino history는 sitemap 제외 + `noindex`다.
- Naver 공식 가이드는 robots.txt의 sitemap discovery, 페이지별 robots meta, 렌더링 필수 JS/resource crawlability를 요구한다. 따라서 release QA는 robots → sitemap → canonical → server-rendered content/resources → Google/Naver 대표 URL 검사를 수행한다.

### 보안 및 사업/경제성 갱신
- OWASP API Security Top 10을 API 위협 baseline, ASVS를 검증 baseline으로 유지한다. actor-scoped authorization, 민감 관리자 recent reauth, DB least privilege, BOLA/BFLA negative test, CSRF/XSS/SQLi/SSRF/upload 통제, resource/business-flow 제한, idempotency/replay 방지, append-only audit, secret-safe log는 P0/HIGH release gate다.
- Google Play 최신 수수료 문서는 단일 보편 수수료가 없음을 명시한다. EEA/UK/US는 2026-06-30부터 standard auto-renew subscription 10%, 기타 new-install 20%, existing-install 25%이고 Play Billing 적용 시 5% billing fee가 붙는다. AU/JP rollout은 2026-09-30, KR은 2026-12-31이므로 한국 unit economics에 미래 지역 요율을 조기 적용하지 않는다.
- SKU 가정키는 market × effective date/install cohort × transaction type × billing path × programme이며 gross → platform/billing fee → tax/refund/fraud → entitlement/infra/support → contribution margin으로 계산한다. conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC, LTV는 실측 전 `HYPOTHESIS`/`TEST TARGET`이다.

### v154 worklog
- 조사: Google Search Central 9월 최신 글 및 2026-08 site reputation update, Naver Search Advisor robots/meta/resource, OWASP API/ASVS, Google Play 수수료/rollout, GitHub main/branch protection/Actions/PR #370.
- 채택: exact-main CI 상태 분리, repository enforcement 결함, PR #370 rebase+real-DB gate, SEO crawler/resource 계약, 시장·시행일 기반 수수료 모델.
- 보류: 기획 자동화에서는 runtime/DB/Flux/Production을 변경하지 않았다. `Build Test Candidate #740`이 관측 시 실행 중이므로 Test/Production 통과를 주장하지 않는다.


## v2026.09.16.155 — 시간별 릴리스 진실성·외부근거 갱신

### REL-EVIDENCE-155-01 — P0 — IN PROGRESS
- 기획 시작/중간 권위 `main`은 `a4455ad342fbf66a128c1221c25b45ff4d20d6bf`이다. 이 exact SHA의 `Build Production Release #882`는 현재 `in_progress`이며 immutable SHA 결정은 통과했고 `Wait for exact SHA on isolated test and verify backend/database path` 단계가 실행 중이다. 이는 Test 또는 Production 성공 증거가 아니다.
- 반복 릴리스 게이트 실패는 원인 제거 작업으로 유지한다. test-gate는 성공/실패 모두 expected/observed `release_sha`, GitOps desired/applied revision, Deployment generation, ReplicaSet/Pod image digest, pod-local/public version, backend readiness, DB authority/schema checksum, 최초 불일치 계층, probe timestamp/latency, rollback target을 남겨야 한다. secret header/cookie/DSN/key/token은 evidence에서 금지한다.
- 수용조건: exact-SHA/DB assertion 하나라도 다르면 승격 0건, 실패/timeout에도 비밀 없는 완전한 evidence 보존, 복구 후 동일 candidate의 source→image→desired→applied→workload→public→DB lineage 증명, exact-main 재시험과 Production smoke 통과.

### SEO/SEO 백엔드 결정 갱신
- 2026-09-08/09-14 Google Search Central 글은 행사 공지이므로 crawl/index 계약을 변경하지 않는다. 2026-08-28 site reputation policy 변경은 sponsor/affiliate/UGC 거버넌스에 계속 직접 적용한다.
- favicon QA는 현재 Google 기준에 따라 Googlebot/Googlebot-Image가 홈페이지와 favicon을 수집할 수 있어야 하고, 안정적인 URL과 정사각형 자산(권장 48×48 초과)을 사용한다. public metadata/canonical/sitemap/structured data/private noindex 계약은 유지한다.
- Google European Search Dataset Licensing Program은 SEO 순위 우회수단이 아니므로, Moneyverse가 별도 자격과 독립 assurance/privacy 의무를 수용하는 경우가 아니면 제품 범위에서 제외한다.

### 보안·AI 경계 갱신
- OWASP API Security Top 10은 일반 API baseline, ASVS는 검증 baseline으로 유지한다. OWASP GenAI Security Project의 2026 LLM Top 10/Agent Control Standard는 계획된 economy-AI/agent lane에 한해 추가 적용한다. model/tool 권한, prompt/data provenance, bounded tool permission, output validation, model/dataset supply-chain, secret isolation, auditability, deterministic economy arbitration을 필수화한다. AI는 ledger/balance/entitlement를 직접 변경하거나 classical safety lane을 우회할 수 없다.
- AI 간 불일치, 모델 장애, 잘못된 출력, 만료 proposal, provenance 누락은 `NO_OP`/shadow/human review로 귀결하며 조용히 실경제 동작으로 승격하지 않는다.

### 수익성/사업성 갱신
- Google Play 현재 서비스 수수료는 market/cohort/program 의존적이다. EEA/UK/US 새 요율은 이미 시행 중이고 나머지 시장은 각 rollout 전까지 해당 기존/program 조건을 사용한다. SKU 모델은 market × effective-date/install-cohort × transaction-type × billing-path × programme 키를 유지한다.
- 실측하지 않은 conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC, LTV는 사실값으로 승격하지 않는다. release-control/backup/status 작업은 임의 매출이 아니라 회피된 downtime/fraud/refund/support/operator 비용으로 평가한다.

### v155 worklog
- 확인 근거: Google Search Central 9월 최신 글과 8월 site reputation 변경, Google favicon 가이드, Google European Search Dataset Licensing Program, OWASP API/ASVS 및 GenAI 2026 기준, Google Play 현재 수수료 문서, 최신 GitHub main/Actions.
- 이번 기획 통합은 runtime code, DB, Flux, Production을 변경하지 않는다. 우선순위는 P0 release truth → 독립 restore 증거 → false-green status → privileged recovery cleanup → migration/Work-clock 무결성 → repository enforcement → economy/admin/casino 권한 → core correctness → monetization → SEO/growth/accessibility 순서를 유지한다.


## v2026.09.16.156 — 카지노 런타임 장애·릴리스 호스트 위생 갱신

### CASINO-RUNTIME-156-01 — HIGH — FIX MERGED / PRODUCTION REVERIFY REQUIRED
- 2026-09-16 운영 증거: 카지노 조작 후 전체 오류 경계로 이동할 수 있었고 digest `3286936712@E352`는 `A "use server" file can only export async functions, found object.`에 대응했다. 원인 수정은 `main` `23ae36082b8a4875797314682efef8e99b8b9484` (#383)에 병합됐다. `CasinoPlayState`/`CASINO_IDLE`을 client-safe 모듈로 이동하고 `use server` 파일의 동기 재내보내기를 제거했으며 non-async runtime export를 차단하는 정적 회귀 테스트를 추가했다.
- 영향은 카지노 브라우저 플레이/복구 UX이며 정산 권위, 원장, 잔액, DB 스키마는 변경하지 않았다. 모호한 브라우저 실패 후 중복 베팅을 유도하지 않는다. 새 제출 전에 서버 권위 최근 게임 기록과 지갑을 읽어 확정 결과를 확인하고 replay는 멱등성으로 방어한다.
- QA: 병합 증거는 카지노 14/14, typecheck 통과, ESLint 오류 0/무관 경고 11, production build 통과다. current-main Build Test Candidate #749는 아직 실행 중이므로 exact-main Test/Production 검증 완료가 아니다. exact SHA Test, API/사용자 흐름, duplicate-submit/idempotency negative case, 공개 runtime SHA, Production smoke와 해당 server-action 오류 0건이 수용조건이다.

### OPS-CACHE-156-01 — HIGH — MITIGATED RUNTIME / PERMANENT FIX TODO
- 활성 Debian frontend는 `debian` 사용자로 실행되지만 `.next/cache/fetch-cache`에 root 소유 파일이 있어 반복 `EACCES`가 발생했다. 운영에서 `debian:debian`으로 소유권을 복구했으며 회원/원장/정산 데이터는 변경하지 않았다.
- 영구 수정: release assembly/service startup이 root 권한으로 writable runtime path를 생성하지 못하게 한다. pre-start에서 uid/gid와 cache/temp/upload writable path를 검증하고 immutable release 파일은 read-only, mutable cache는 명시적 runtime-owned directory로 분리한다. 불일치 시 트래픽 투입 전에 배포 실패 처리한다.
- 테스트/관측: clean-host install, upgrade, rollback, restart, cache rebuild를 검증하고 runtime path `EACCES` 0건을 요구한다. permission-denied/cache-write failure rate를 경보한다. 롤백은 마지막 verified release와 ownership manifest를 복구하며 `chmod -R 777`은 금지한다.

### 외부근거·사업성 결정 갱신
- Google Search Central 2026-09-08/09-14 글은 행사 공지이므로 crawl/index 정책을 변경하지 않는다. 2026-08-28 site reputation policy는 sponsor/affiliate/UGC 거버넌스에 계속 적용한다. favicon은 crawlable homepage/favicon, stable URL, square asset 계약을 유지한다.
- OWASP API Security Top 10은 일반 API baseline이며 계획된 economy-AI lane에는 v155에서 정한 OWASP GenAI 2026 통제를 추가 적용한다.
- Google Play 수수료는 market/cohort/program/effective-date별로 모델링한다. 아직 새 일정이 시행되지 않은 시장에 EEA/UK/US new-install 요율을 선적용하지 않는다. 실측하지 않은 사업 지표는 가설/테스트 기준이다.

### v156 worklog
- 확인: Google Search Central 9월 글과 8월 site-reputation 변경, favicon 가이드, OWASP API/GenAI 최신 기준, Google Play 현재 수수료 문서, 최신 GitHub main, 병합 #383, open #382/#381, exact-main Actions.
- 이번 자동화는 문서만 변경한다. runtime code/DB/Flux/Production 승격은 수행하지 않았다. 우선순위는 release truth/restore/status P0 이후 cache/recovery/migration/authorization HIGH, 그 다음 기능 확장이다.

## v2026.09.16.157 — 카지노 계약 정확성·릴리스 진실성 갱신

### CASINO-CONTRACT-157-01 — HIGH — FIX MERGED / EXACT-SHA REVERIFY REQUIRED
- 최초/최근 증거: 2026-09-16 병합 PR #384, 현재 `main` `f6fd312025dcb9c517edfa2ad4986de0db1df54d`. 포맷된 베팅액이 `wholeAmount()`에서 문자열이 되었으나 카지노 DTO는 의도적으로 JSON 정수만 허용해 10 WLD 같은 정상 베팅도 HTTP 400이 됐다. 병합 수정은 bounded stake를 JSON number로 전송하고 주사위 홀짝/숫자 서버결과 시각 단계를 추가했다. PR 증거는 frontend 609 tests, backend casino E2E 29 tests, typecheck/production build 통과, lint 오류 0(기존 image warning 11)이다.
- 사용자/UX 계약: 카지노 진입 → 게임 선택 → 베팅액 입력 → 명시적 플레이 CTA → 중복 CTA가 비활성화된 pending → 서버 권위 결과 → 지갑/최근 플레이 대사. 빈 값, 비정수, 서버 최소/최대 초과, 잔액부족, timeout, 4xx 검증, 401/403 인증, 409 멱등 충돌, 5xx를 서로 다른 복구 상태로 표시한다. 결과가 모호한 timeout/5xx에서는 최근 권위 플레이와 지갑을 대사하기 전 재베팅을 유도하지 않는다.
- API 계약: numeric JSON 변환은 어댑터 책임일 뿐 서버는 정수/범위/잔액/자격/세션/rate-limit/idempotency의 권위다. API를 의도적으로 versioning하지 않는 한 numeric string은 계속 거부한다. JavaScript safe-integer 범위를 넘는 금액을 `Number`로 변환하지 않으며, 카지노 허용 베팅 상한이 안전범위임을 증명하거나 string-safe money DTO를 versioned 계약으로 종단간 사용한다.
- DB/동시성: 정산은 actor/idempotency uniqueness, balance/ledger invariant, append-only audit를 포함한 하나의 transaction이다. 같은 idempotency key의 동시 중복 요청은 같은 권위 결과를 반환/복구하고, 서로 다른 동시 요청도 서버 잔액·한도 검사를 통해 음수잔액/중복지급을 막는다.
- 보안/악용: 카지노 플레이를 OWASP sensitive business flow로 취급한다. BOLA/BFLA, replay, 자동화/resource abuse, 결과/지급 위조, client odds/stake authority, 로그 누출을 차단한다. 비정상 요청속도, duplicate-key conflict, validation failure 급증, payout/ledger reconciliation mismatch를 탐지한다. 실제 현금·환전·도박수익 표현은 도입하지 않는다.
- 마이그레이션/롤백: 이 어댑터 수정에는 schema migration이 없다. 마지막 verified immutable frontend/backend pair로 rollback하며 계약 불일치가 재발하면 서버 DTO 검증을 약화하지 않고 casino play를 feature flag로 중지한다.
- QA: min-1/min/min+1/max-1/max/max+1, 포맷 입력, 소수/음수/0/초대형 정수, numeric string 직접 API negative, 잔액부족, 세션만료, double click, timeout retry, concurrent bets, 모든 dice 결과, keyboard/screen-reader pending/result 알림, mobile/tablet/desktop, wallet/recent-play 대사, real PostgreSQL ledger invariant를 검증한다.
- 운영승격: current-main CI만으로 부족하다. 캡처 시 exact-main `Build Production Release #888`은 `in_progress`였다. exact `f6fd312...` isolated Test lineage, backend/API/DB/casino QA, public exact SHA, Production smoke 후 예상 밖 casino HTTP-400 contract failure와 settlement reconciliation alert 0건이어야 DONE이다.
- KPI/사업성: 직접매출은 가정하지 않는다. play-start→accepted-play conversion, validation-error rate, ambiguous-result CS, D1/D7 casino return, fraud/reconciliation loss, support cost를 본다. 수익화는 별도 법률/제품 검토이며 정확성을 플레이 빈도 증가와 교환하지 않는다.

### REL-EVIDENCE-157-01 — P0 — IN PROGRESS
- exact current main의 `Build Production Release #888`은 캡처 시 실행 중이다. source commit → CI → immutable image digest → GitOps desired → applied revision → workload digest → pod-local version → public Test version → backend readiness → authoritative DB/schema → changed-feature QA → main exact retest → Production promotion/smoke를 서로 다른 증거 상태로 유지한다.
- 성공/실패 bundle은 expected/observed SHA/digest/revision, workload generation, 최초 불일치 계층, timestamp/latency, rollback target을 기록한다. secret/cookie/Authorization/DSN/private key는 금지한다. P0 증거가 누락·오류·stale이면 pass가 아니라 `BLOCKED`다.
- 저장소 보호도 미충족이다. 현재 `main` metadata는 protection enabled지만 required-status-check enforcement `off`, required contexts/checks 비어 있음이다. runtime 경로는 신뢰된 required checks와 reviewed integration을 저장소에서 강제하되 docs 자동화가 runtime bypass가 되지 않게 한다.

### SEO·보안·수익성 레퍼런스 결정
- Google Search Central 2026-09-08/09-14 글은 행사 공지라 crawl/index 계약을 바꾸지 않는다. 09-08 regional Search experience 문서는 참고용이며 Moneyverse 가상주식/WDX를 EEA finance carousel을 노린 실제 금융정보 provider처럼 표현하지 않는다. 2026-08-28 site-reputation 정책은 sponsor/affiliate/UGC 거버넌스에 계속 직접 적용한다.
- favicon QA는 현재 Google 기준인 crawlable homepage/favicon, stable URL, square asset, 권장 48×48 초과를 따른다. public SEO read-model/canonical/robots/sitemap/lastModified/structured-data/hreflang/SSR 또는 동등 server output/CWV와 private/account/admin/transaction noindex 계약을 유지한다.
- 보안 baseline은 OWASP ASVS 5.0.0 + API Security Top 10이다. 카지노에는 sensitive-business-flow/replay/resource-abuse 통제를 명시하고 인증/session/admin/economy/upload/SSRF/BOLA/BFLA/least-privilege/audit/backup gate는 fail-closed다.
- Google Play 수수료는 단일율이 아니다. unit economics key는 `market × effective-date/install-cohort × transaction-type × billing-path × programme`이다. EEA/UK/US는 2026-06-30부터 현재 standard 예시로 자동갱신 구독 10%, 기타 new-install 20%, 기타 existing-install 25%이며 Play Billing 적용 시 5% billing fee가 붙는다. 아직 rollout 전인 시장은 현재 적용 program 규칙을 사용한다. 실측하지 않은 conversion/ARPU/ARPDAU/ARPPU/churn/refund/CAC/LTV는 `HYPOTHESIS`/`TEST TARGET`이다.

### v157 worklog 및 구현 백로그
- 외부 조사: Google Search Central 9월 update/site-reputation/favicon/regional Search 문서, OWASP baseline, Google Play 현재 수수료. 런타임/코드 증거: current main, PR #384, Actions #888, branch protection.
- 개발순서: P0 exact-SHA/runtime/DB evidence → 독립 restore 가능한 backup → false-green status → HIGH casino contract exact-runtime 검증 → runtime writable-path ownership → privileged recovery → migration/Work-clock integrity → repository enforcement → economy/admin/casino authorization → core completeness → monetization → SEO/growth/accessibility.
- 기획 자동화는 문서만 변경했다. 구현은 `new branch → tests/CI → isolated exact-SHA Test → backend/API/DB/user-flow QA → main → exact-main retest → Production promotion → smoke/monitoring/rollback` 순서를 유지한다.


## v2026.09.16.157 — 카지노 계약 정확성·릴리스 진실성 갱신

### CASINO-CONTRACT-157-01 — HIGH — FIX MERGED / EXACT-SHA REVERIFY REQUIRED
- 최초/최근 증거: 2026-09-16 병합 PR #384, 현재 `main` `f6fd312025dcb9c517edfa2ad4986de0db1df54d`. 포맷된 베팅액이 `wholeAmount()`에서 문자열이 되었으나 카지노 DTO는 의도적으로 JSON 정수만 허용해 10 WLD 같은 정상 베팅도 HTTP 400이 됐다. 병합 수정은 bounded stake를 JSON number로 전송하고 주사위 홀짝/숫자 서버결과 시각 단계를 추가했다. PR 증거는 frontend 609 tests, backend casino E2E 29 tests, typecheck/production build 통과, lint 오류 0(기존 image warning 11)이다.
- 사용자/UX 계약: 카지노 진입 → 게임 선택 → 베팅액 입력 → 명시적 플레이 CTA → 중복 CTA가 비활성화된 pending → 서버 권위 결과 → 지갑/최근 플레이 대사. 빈 값, 비정수, 서버 최소/최대 초과, 잔액부족, timeout, 4xx 검증, 401/403 인증, 409 멱등 충돌, 5xx를 서로 다른 복구 상태로 표시한다. 결과가 모호한 timeout/5xx에서는 최근 권위 플레이와 지갑을 대사하기 전 재베팅을 유도하지 않는다.
- API 계약: numeric JSON 변환은 어댑터 책임일 뿐 서버는 정수/범위/잔액/자격/세션/rate-limit/idempotency의 권위다. API를 의도적으로 versioning하지 않는 한 numeric string은 계속 거부한다. JavaScript safe-integer 범위를 넘는 금액을 `Number`로 변환하지 않으며, 카지노 허용 베팅 상한이 안전범위임을 증명하거나 string-safe money DTO를 versioned 계약으로 종단간 사용한다.
- DB/동시성: 정산은 actor/idempotency uniqueness, balance/ledger invariant, append-only audit를 포함한 하나의 transaction이다. 같은 idempotency key의 동시 중복 요청은 같은 권위 결과를 반환/복구하고, 서로 다른 동시 요청도 서버 잔액·한도 검사를 통해 음수잔액/중복지급을 막는다.
- 보안/악용: 카지노 플레이를 OWASP sensitive business flow로 취급한다. BOLA/BFLA, replay, 자동화/resource abuse, 결과/지급 위조, client odds/stake authority, 로그 누출을 차단한다. 비정상 요청속도, duplicate-key conflict, validation failure 급증, payout/ledger reconciliation mismatch를 탐지한다. 실제 현금·환전·도박수익 표현은 도입하지 않는다.
- 마이그레이션/롤백: 이 어댑터 수정에는 schema migration이 없다. 마지막 verified immutable frontend/backend pair로 rollback하며 계약 불일치가 재발하면 서버 DTO 검증을 약화하지 않고 casino play를 feature flag로 중지한다.
- QA: min-1/min/min+1/max-1/max/max+1, 포맷 입력, 소수/음수/0/초대형 정수, numeric string 직접 API negative, 잔액부족, 세션만료, double click, timeout retry, concurrent bets, 모든 dice 결과, keyboard/screen-reader pending/result 알림, mobile/tablet/desktop, wallet/recent-play 대사, real PostgreSQL ledger invariant를 검증한다.
- 운영승격: current-main CI만으로 부족하다. 캡처 시 exact-main `Build Production Release #888`은 `in_progress`였다. exact `f6fd312...` isolated Test lineage, backend/API/DB/casino QA, public exact SHA, Production smoke 후 예상 밖 casino HTTP-400 contract failure와 settlement reconciliation alert 0건이어야 DONE이다.
- KPI/사업성: 직접매출은 가정하지 않는다. play-start→accepted-play conversion, validation-error rate, ambiguous-result CS, D1/D7 casino return, fraud/reconciliation loss, support cost를 본다. 수익화는 별도 법률/제품 검토이며 정확성을 플레이 빈도 증가와 교환하지 않는다.

### REL-EVIDENCE-157-01 — P0 — IN PROGRESS
- exact current main의 `Build Production Release #888`은 캡처 시 실행 중이다. source commit → CI → immutable image digest → GitOps desired → applied revision → workload digest → pod-local version → public Test version → backend readiness → authoritative DB/schema → changed-feature QA → main exact retest → Production promotion/smoke를 서로 다른 증거 상태로 유지한다.
- 성공/실패 bundle은 expected/observed SHA/digest/revision, workload generation, 최초 불일치 계층, timestamp/latency, rollback target을 기록한다. secret/cookie/Authorization/DSN/private key는 금지한다. P0 증거가 누락·오류·stale이면 pass가 아니라 `BLOCKED`다.
- 저장소 보호도 미충족이다. 현재 `main` metadata는 protection enabled지만 required-status-check enforcement `off`, required contexts/checks 비어 있음이다. runtime 경로는 신뢰된 required checks와 reviewed integration을 저장소에서 강제하되 docs 자동화가 runtime bypass가 되지 않게 한다.

### SEO·보안·수익성 레퍼런스 결정
- Google Search Central 2026-09-08/09-14 글은 행사 공지라 crawl/index 계약을 바꾸지 않는다. 09-08 regional Search experience 문서는 참고용이며 Moneyverse 가상주식/WDX를 EEA finance carousel을 노린 실제 금융정보 provider처럼 표현하지 않는다. 2026-08-28 site-reputation 정책은 sponsor/affiliate/UGC 거버넌스에 계속 직접 적용한다.
- favicon QA는 현재 Google 기준인 crawlable homepage/favicon, stable URL, square asset, 권장 48×48 초과를 따른다. public SEO read-model/canonical/robots/sitemap/lastModified/structured-data/hreflang/SSR 또는 동등 server output/CWV와 private/account/admin/transaction noindex 계약을 유지한다.
- 보안 baseline은 OWASP ASVS 5.0.0 + API Security Top 10이다. 카지노에는 sensitive-business-flow/replay/resource-abuse 통제를 명시하고 인증/session/admin/economy/upload/SSRF/BOLA/BFLA/least-privilege/audit/backup gate는 fail-closed다.
- Google Play 수수료는 단일율이 아니다. unit economics key는 `market × effective-date/install-cohort × transaction-type × billing-path × programme`이다. EEA/UK/US는 2026-06-30부터 현재 standard 예시로 자동갱신 구독 10%, 기타 new-install 20%, 기타 existing-install 25%이며 Play Billing 적용 시 5% billing fee가 붙는다. 아직 rollout 전인 시장은 현재 적용 program 규칙을 사용한다. 실측하지 않은 conversion/ARPU/ARPDAU/ARPPU/churn/refund/CAC/LTV는 `HYPOTHESIS`/`TEST TARGET`이다.

### v157 worklog 및 구현 백로그
- 외부 조사: Google Search Central 9월 update/site-reputation/favicon/regional Search 문서, OWASP baseline, Google Play 현재 수수료. 런타임/코드 증거: current main, PR #384, Actions #888, branch protection.
- 개발순서: P0 exact-SHA/runtime/DB evidence → 독립 restore 가능한 backup → false-green status → HIGH casino contract exact-runtime 검증 → runtime writable-path ownership → privileged recovery → migration/Work-clock integrity → repository enforcement → economy/admin/casino authorization → core completeness → monetization → SEO/growth/accessibility.
- 기획 자동화는 문서만 변경했다. 구현은 `new branch → tests/CI → isolated exact-SHA Test → backend/API/DB/user-flow QA → main → exact-main retest → Production promotion → smoke/monitoring/rollback` 순서를 유지한다.


## v2026.09.16.158 — 반복 릴리스 게이트 실패·크롤러 식별·한국 수수료 시행일 갱신

### REL-EVIDENCE-158-01 — P0 — BLOCKED / 원인 제거 필수
- 최초/최근 재현: isolated Test exact-SHA 게이트 실패가 반복됐고 최신 확정 재현은 2026-09-16 runtime 후보 `f6fd312025dcb9c517edfa2ad4986de0db1df54d`의 Production Release #888이다. immutable SHA 결정은 성공했지만 `https://test.easy-scraping.com/api/version`을 15초 간격 60회 확인한 뒤 13:10:08Z `isolated test never served exact SHA ...`로 종료됐고 Production build는 skipped됐다. 반복 BLOCKED이므로 단순 timeout이 아니라 원인 제거 백로그로 승격한다.
- 영향/severity: 카지노 계약 수정까지 포함한 모든 변경의 P0 승격 차단이다. source/PR test green은 Test Service가 해당 candidate를 실제 라우팅한다는 증거가 아니며, 원인을 제거하지 않은 승격은 stale code/wrong image/wrong DB/false-green 위험이 있다.
- 증거 설계: 매 시도마다 `{release_sha, candidate_backend_digest, candidate_frontend_digest, gitops_desired_revision, flux_applied_revision, deployment_generation, replicaset_uid, pod_uid, pod_image_digest, pod_local_version, service_endpoint_set, ingress_target, public_test_version, backend_ready, db_identity_hash, schema_migration_head, probe_at, latency_ms, first_mismatch_layer}`를 machine-readable로 보존한다. secret/cookie/Authorization/DSN/private key는 금지한다.
- 원인 결정 트리: candidate digest 없음=build/publish, desired stale=GitOps writer, desired!=applied=Flux reconcile/auth/source, applied 정상+workload stale=rollout/imagePull/deployment, Pod 정상+Service stale=selector/readiness, Service 정상+public stale=ingress/CDN/cache/routing, public SHA 정상+catalog/readiness/DB 실패=backend/DB authority 문제로 분류한다. 최종 timeout만 출력하지 말고 최초 실패 계층을 출력한다.
- 수정 백로그: Infra는 reconciliation 전후 probe와 immutable digest assertion, API는 build SHA+DB identity hash에 묶인 비밀 없는 version/readiness, DB는 credential 대신 least-privilege schema/migration-head assertion, observability는 계층별 convergence latency/mismatch counter, workflow는 실패 시에도 evidence bundle upload를 구현한다. evidence 형식 자체는 운영 evidence table을 택하지 않는 한 schema migration이 필요 없으며 우선 immutable workflow artifact/object storage를 사용한다.
- 롤백/fallback: SHA 비교를 약화하거나 timeout만 늘리는 것을 해결책으로 삼지 않는다. Production은 마지막 verified immutable frontend/backend pair를 유지한다. Test 수렴 전 위험 기능은 server-authoritative feature flag로 닫고 authorization/DTO validation/ledger constraint/DB identity 검사를 완화하지 않는다.
- 테스트: evidence serializer/redaction 단위시험, 각 mismatch 계층 synthetic workflow test, desired→applied 통합시험, cluster/service/ingress routing, real PostgreSQL DB identity/schema-head, stale-cache/wrong-selector negative, evidence secret 누출 보안시험, 실패/timeout에도 bundle 생성+Production build 미실행 회귀시험을 수행한다.
- Test 수용: candidate digest 실행, pod-local/public Test SHA=requested release, backend readiness/catalog=권위 Test DB 정상, Test `noindex`, 모든 계층에 fresh timestamp가 있어야 한다. Production 승격은 동일 candidate lineage+current-main exact retest+changed-feature QA+미해결 P0/HIGH gate 없음이 조건이다.

### CI-158-02 — HIGH — IN PROGRESS / 릴리스 증거 아님
- 현재 exact main은 문서 commit `88452f14ca344ee1d060b58b84953599bf657538`. Build Test Candidate #755의 `verify/check`는 secret rejection, lint, raw-control-byte 검사, typecheck, build, DB migration 적용, tests, Prisma schema mutation 차단, production dependency audit까지 성공했다. 캡처 시 backend candidate push는 성공했고 frontend candidate image build는 진행 중이다.
- `VERIFY_GREEN`, `BACKEND_IMAGE_BUILT`, `FRONTEND_IMAGE_PENDING`을 분리한다. 어느 것도 `TEST_APPLIED`, `TEST_PUBLIC_EXACT`, `DB_VERIFIED`, `CHANGED_FLOW_QA_GREEN`, `PRODUCTION_VERIFIED`를 의미하지 않는다. 상태 API/대시보드는 downstream 필수 상태가 없을 때 aggregate green을 만들지 않는다.

### SEO-CRAWLER-158-03 — P1 — 설계 갱신 / 구현 미검증
- 2026-09-16 Google Search Central 문서 변경 로그는 `GoogleProducer` HTTP User-Agent 문자열 갱신을 기록했다. 따라서 crawler 분류를 고정된 전체 UA 문자열에 의존시키지 않는다. crawler identity가 필요한 경우 Google의 공식 검증 방법을 따르며, 일반 익명 HTTP client와 다른 privileged/indexable content를 crawler에게만 제공하지 않는다.
- SEO backend crawler 관측에는 정규화 bot family, 제한 보존/마스킹된 raw UA, verification 결과, canonical URL, HTTP status, robots directive, canonical, render mode, cache status, latency를 저장한다. UA 매칭으로 인증/noindex를 우회하지 않는다. 알려진 crawler 검증의 체계적 실패 또는 rendering-critical asset 차단을 경보한다.
- 공개 페이지 QA는 canonical/robots/sitemap/lastModified/hreflang/structured data/server-rendered primary content/rendering resource/CWV 계약을 유지한다. 계정/관리자/payment callback/private transaction/private casino history는 sitemap 제외+`noindex`다.

### MONETIZATION-158-04 — P1 — 한국 시행일 기반 unit economics
- Google Play 현재 공식 문서상 new install-cohort 수수료 구조의 한국 rollout은 2026-12-31이다. 그 전까지 한국은 기존 규칙을 적용하며 예를 들어 자동갱신 구독은 15%, 15% tier 적격 개발자는 연 USD 1M까지 15%, 초과분 30%다. 한국 alternative billing은 프로그램 조건에 따라 해당 Play 수수료에서 4%p 감소한다. 2026년 9월 전망에 미래 KR 10%/20%/25% cohort 표를 이미 시행된 것처럼 사용하지 않는다.
- unit-economics engine은 모든 유료 SKU를 `market + transaction_at + install_cohort_if_applicable + recurring/nonrecurring + billing_path + enrolled_programme + tax/refund/fraud assumptions`로 계산하고 forecast에 사용한 fee-policy version/effective date를 저장한다. 실측 없는 attach rate/paid conversion/ARPU/ARPDAU/ARPPU/refund/churn/CAC/LTV는 `HYPOTHESIS`/`TEST TARGET`이다.
- guardrail: 해당 시장에서 아직 시행되지 않은 fee regime으로 contribution margin을 계산한 pricing experiment는 출시하지 않는다. KR rollout 시 낙관/기준/보수 시나리오를 재계산하고 매출 증가를 churn/refund/support/trust 비용과 비교한다.

### v158 worklog
- 최신 조사: Google Search Central 2026년 9월 변경/블로그, favicon/site-reputation 기준, Google Play 현재 수수료/rollout, OWASP/ASVS baseline을 재대조했다. 2026-09-16 crawler identity 운영 영향과 한국 수수료 시행일 guardrail을 채택했고 행사 공지는 SEO 알고리즘 변경으로 취급하지 않았다.
- runtime/QA/CI: main `88452f14...`, #888의 exact-Test SHA 실패와 Production build skip, #755 verify/check green 및 frontend candidate build 진행 상태를 확인했다. Production 성공을 추론하지 않는다.
- 개발 연결: P0 release evidence/root-cause 제거가 casino Production 재검증과 신규 기능보다 우선이다. 이번 자동화는 문서만 변경하며 runtime/DB/Flux/Production 승격은 수행하지 않는다.

## v2026.09.16.159 — 직업 일/주간 초기화 권위 수렴

### WORK-CLOCK-149-01 — HIGH — 구현 완료 / exact-SHA Test 필요
- 새 forward migration `203-work-reset-convergence.sql`로 남은 read-model 시간축 분리를 수정한다. 적용된 migration 202는 수정하거나 번호를 바꾸지 않는다.
- Work settlement, task board, reward preview, dashboard가 모두 `server_game_day_*` / `server_game_week_*` 권위를 공유한다. 게임 1일은 현실 600초이며 7게임일 주간은 현실 70분이다.
- `GET /api/v1/work`에 권위 있는 `game_day_key`, `game_week_key`, `day_ends_at`, `week_ends_at`을 추가하고 `/work`는 서버값으로 일/주간 지급 WLD, 잔여 한도, 정확한 다음 초기화 시각을 표시한다.
- task 일일, 회원 일일, 회원 주간 한도 도달 시 실행을 fail-closed한다. reward preview도 settlement와 동일한 현재 게임시간 창과 cap을 사용해 실제 정산에서 거절/감액될 금액을 미리 약속하지 않는다.
- 모바일 API 계약을 `v2026.09.16.159`로 올리고 TypeScript 컴파일러 내부 `__@...` 심볼 속성을 생성 계약에서 제외해 관련 없는 타입 그래프 변경이 공개 JSON 응답 스키마를 흔들지 않게 한다.
- isolated PostgreSQL에서 migration 203과 Work/clock 실DB 15개 테스트를 통과했다. 현실 10분 day, 70분 week rollover, timezone 독립성, task/global cap, 직업 전환, 멱등성/무결성, preview/지급/dashboard 일치를 검증했다. 로컬 DB package 7/7, backend 871, frontend 612, lint 오류 0, typecheck, production build도 통과했다.
- GitHub CI, exact-head Test 수렴, 권위 DB backup/migration, Production smoke 전에는 운영 완료로 선언하지 않는다. v158의 P0 release-evidence gate를 이 수정 때문에 완화하지 않는다.


## v2026.09.16.160 — 로컬 이중 모델 경제 AI 운영 활성화

### ECON-AI-160-01 — IMPLEMENTED / RUNTIME-CONFIG ACTIVATION
- 런타임 권위는 승인된 Debian 13 systemd/PostgreSQL 경로를 유지한다. 이번 작업은 최신 application `main`을 운영에 배포한 것이 아니다. 공개 Production은 이미 이중 경제 AI reviewer를 포함한 application SHA `be218f0403372689dbdf8af9bf8700264f39348f`를 계속 제공했고, 문서 통합만 application main `03a8ae9c5313d0915589691afc6fff022323c305` 위에 rebase했다.
- Production `economy_ai_policy_review`를 감사 가능한 `admin_set_feature_switch` 경로로 enabled 처리했다. 최초 provisional v159 라벨 뒤 동시 작업이 main의 v159를 먼저 사용해 v160으로 버전 정정을 남겼다. 정정 시 상태는 `enabled -> enabled`이며 기존 이력을 덮어쓰지 않고 별도 receipt/audit 사유를 추가했다.
- 로컬 inference는 `127.0.0.1:11434` localhost에만 바인딩하고 runtime/model은 `/srv/moneyverse-data/ai`에 둔다. A 좌석은 `llama3.2:3b`, B 좌석은 `gemma3:1b`이다. `qwen2.5:3b`는 confidence `0..1` 출력 계약을 위반해 운영 프로필에서 제외했다.
- 자원 경계는 병렬요청 1, 최대 상주모델 2, keep-alive 2분, `MemoryHigh=6G`, `MemoryMax=7G`, Ollama cloud 비활성화이며 제한된 시스템 디스크에는 모델 weight를 저장하지 않는다.
- 백엔드는 OpenAI-compatible 로컬 endpoint, 호출당 timeout 180초, concurrency 1, exact-result cache 300초, review TTL 120분을 사용한다. secret은 Git에 넣지 않고 비민감 service/config template만 저장한다.

### Test/Production 증거와 안전 계약
- 기존 economy reviewer 단위시험 10/10 통과. 선택한 두 모델 모두 `decision`, `0..1` confidence, rationale, risks 계약을 만족했다.
- 검증은 배포된 `test-be218f040337` application release와 권위 Test PostgreSQL을 사용했다. 공개 Test route도 `be218f...`를 반환하므로 current-main exact-SHA Test 수렴을 주장하지 않으며 `REL-EVIDENCE-158-01`은 종료하지 않는다.
- 격리 Test에서 실제 모델 호출과 Test PostgreSQL을 사용해 4개 routed domain/8개 seat call, append-only review 저장, scoreboard, exact-hash `dual_agree`, exact-only `ai_veto`, 변경 proposal `ai_missing_classical_fallback`, 모델 미설정 `unconfigured_classical_fallback`을 검증했다. application role의 직접 table read는 계속 거부됐다.
- 활성화 후 첫 Production reviewer 점검은 약 40ms 안에 `no_eligible_classical_proposal`로 끝나 model council, review row, 정책값 변경이 모두 없었다. Production backend/AI service는 active였고 공개 홈은 HTTP 200이었다.
- 결정론/classical 엔진이 회계와 정책 권위다. AI는 review append와 exact matching proposal veto만 가능하다. AI 증거가 누락·만료·불일치·장애·abstain이면 대체값을 만들지 않고 classical lane으로 fallback한다.
- rollback은 fail-safe다. 감사 함수로 switch를 `disabled`로 바꾸고 필요 시 backend AI runtime 변수를 복원/제거한 뒤 backend 재시작, 미사용 시 local inference 중지/비활성화 순서다. AI 가용성을 위해 결정론 검증·원장대사·exact-proposal matching을 약화하지 않는다.
- 모니터링은 feature switch, reviewer outcome, council decision mix, confidence, latency/token, service memory/restart, backend error, economy reconciliation을 본다. 모델 품질저하는 결정론 gate 우회 사유가 아니라 운영 incident다.


## v2026.09.16.161 — 관리자 내비게이션 완전성 및 현재 릴리스 증거

### ADMIN-NAV-161-01 — HIGH — MAIN 구현 / EXACT-SHA TEST 필요
- 증거: 현재 main `7acc3c02e4fc015d6800f2d5a7e51180f2dc02a5`는 PR #390을 통합했다. 원인은 독립 관리되던 두 관리자 목록의 drift다. `AdminSubNav`에는 보안·사업/시즌·작업/직업·Discord가, `ADMIN_AREAS`에는 문의·상점이 누락됐다. 운영도 같은 불완전한 상단 내비게이션을 제공했으므로 백엔드 미구현이 아니라 프론트 탐색/목록 결함이다.
- 사용자/권한 계약: 기존 관리자 권한 경계를 유지한다. 메뉴 노출은 권한 부여가 아니며 각 목적지는 서버에서 관리자 actor/session, 필요한 최근 재인증/2차 인증, function/object authorization, 특권·경제 변경 감사로그를 독립 검증한다. 숨은 URL을 접근통제로 사용하지 않는다.
- UX: `/admin` 대시보드와 상단 메뉴는 하나의 canonical area registry를 공유한다. Dashboard, Users, Security, Economy, Business/Season, Work/Jobs, Shop, Support, Discord 등 현재 등록된 1급 영역은 모두 도달 가능해야 하고 activity/delivery/integrity/AI-news/scenario는 부모 아래 유지한다. 모바일은 접근 가능한 overflow/menu, 데스크톱은 탭을 허용하되 목적지를 누락하지 않는다. 현재 위치, 키보드 포커스, 스크린리더 이름/상태, loading/error/403/404/stale-session 재인증 상태를 명시한다.
- 프론트/백엔드/API/DB: registry는 stable route id, 다국어 label, route, required capability, optional badge source를 가진다. badge API 장애가 메뉴를 숨기면 안 된다. 이번 수정에 DB migration은 없다. capability 판정은 backend 권위이며 client registry에 경제 권한 로직을 복제하지 않는다.
- 보안/악용: 비관리자 direct URL, stale admin session, 부족한 capability, mutation CSRF, BOLA/BFLA, audit actor 무결성을 negative test한다. 내비게이션 telemetry에는 secret/session/private payload를 기록하지 않는다. 관리자 경로는 `noindex` 및 sitemap 제외이며 crawler 신원으로 권한을 우회하지 않는다.
- QA 증거: 병합 업데이트는 local typecheck/build/lint 0 error(기존 image warning 11), frontend 68 files/611 tests, backend non-DB 871 tests를 기록하지만 로컬 DB 환경 부재로 DB 351 tests가 skip됐다. 따라서 registry completeness, route→capability, keyboard/mobile E2E, 403/reauth, DB-backed admin mutation, Test HTML 전체 top-level 목적지 검증이 승격 전 필수다.
- 수용/승격: exact `7acc3c02...` candidate의 DB 포함 CI, isolated Test 동일 SHA/digest, backend/database readiness/catalog, 권한 있는 Test admin의 모든 등록 영역 접근과 권한 비확대가 필요하다. Production smoke에서도 route inventory와 authorization negative를 반복한다. 실패 시 마지막 verified immutable pair로 롤백하거나 해당 관리자 surface만 닫으며 권한을 완화하지 않는다.
- 관측/사업성: `admin_nav_view`, `admin_area_open`, `admin_area_403`, `admin_reauth_required`, route-not-found, badge-failure를 제한된 pseudonymous actor 기준으로 집계한다. 직접 매출 기능이 아니라 운영비/사고대응 효율 기능이다. median time-to-area, navigation failure, admin task completion, support burden, incident-response time을 본다. completeness 100%와 오류/지원비 감소 시 SCALE, 접근성/탐색 마찰은 ITERATE, 권한 확대나 거짓 접근 신호가 생기면 KILL/ROLLBACK한다.

### REL-EVIDENCE-161-02 — P0 — IN PROGRESS
- 확인 시 `Build Production Release #904`는 exact main `7acc3c02e4fc015d6800f2d5a7e51180f2dc02a5`를 대상으로 실행 중이다. immutable SHA resolve는 성공했고 isolated Test exact-SHA/backend/database gate는 진행 중이다. Test/Production 성공으로 판정하지 않는다.
- v158의 candidate digest → GitOps desired/applied → workload generation/digest → Service/ingress → pod-local/public Test SHA → backend readiness → DB identity/schema head → changed-flow QA 증거계약을 그대로 적용한다. 누락 계층은 BLOCKED이고 실패 시 first-mismatch를 보존한다. branch protection의 required-status-check enforcement가 `off`, contexts/checks가 비어 있어 repository enforcement도 HIGH로 유지한다.

### SEO·보안·수익성 결정 — 2026-09-16 재검증
- Google Search Central의 2026-09-14 최신 블로그는 행사 공지이며 crawl/index 알고리즘 변경으로 채택하지 않는다. 9월 문서 변경 로그의 지역별 Search experience와 2026-09-16 `GoogleProducer` UA 변경은 운영계약에 반영한다. full UA 고정 매칭에 의존하지 않고 crawler 신원으로 auth/noindex를 우회하지 않는다. 2026-08-28 site-reputation 정책은 sponsor/affiliate/UGC에 유지하고 favicon은 crawlable homepage/file, stable URL, square asset 계약을 유지한다.
- OWASP API Security Top 10 최신 버전은 2023이며 ASVS를 구현 검증 baseline으로 유지한다. 관리자 내비게이션은 BFLA/BOLA, 인증/세션, CSRF, 감사통제를 적용한다. Economy AI는 OWASP GenAI 2026/Agent Control lane을 추가 적용하되 deterministic 경제 권위를 대체하지 않는다.
- Google Play 수수료는 단일률이 아니므로 market/effective date/install cohort(적용 시)/transaction type/billing path/programme별 unit economics를 유지한다. 실측되지 않은 conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC, LTV는 `HYPOTHESIS`/`TEST TARGET`이다.

### v161 worklog
- 최신 외부자료: Google Search Central 2026년 9월 blog/update/site-reputation/favicon, OWASP API Security/ASVS 및 GenAI 2026, Google Play 현행 수수료 문서. 행사 공지를 랭킹 변경으로 오인하지 않았다.
- 코드/QA/운영: 최신 main과 v160 EN/KO 문서를 재확인하고 #390 원인·로컬 검증, branch protection, Production Release #904를 대조했다. 통합 직전 main도 재확인한다.
- 작업순서: P0 release truth/evidence → 독립 restore 증거 → false-green 제거 → HIGH 관리자 exact-SHA/authorization QA → casino/runtime/cache/privileged recovery → migration integrity → repository enforcement → core correctness → monetization → SEO/growth/accessibility. 기획 자동화는 문서만 변경한다.


## 통합 증거 — v2026.09.17.162 Production exact-SHA 수렴

- 릴리스 권위: 완료 처리 전에 애플리케이션 `main`, 격리 Test, Production, GitOps Production desired state가 동일 immutable SHA로 수렴해야 한다.
- 검증 릴리스: `18c7a1324013099e47b2d6e22c5108c4d378139c`. Production release workflow `35113806254`와 인프라 reconcile `35117875121`이 성공했다.
- DB 게이트: `203-work-reset-convergence.sql` 적용 전에 Production 백업을 생성했고 migration은 immutable checksum과 함께 기록됐다.
- 현재 공개 edge 제약: Nginx는 아직 host systemd 서비스(Production `3000/3001`, Test `3100/3101`)를 사용한다. GitOps manifest 성공만으로 충분하지 않으며 host runtime과 공개 `/api/version`, catalog/status, SEO probe도 함께 수렴해야 한다.
- 승격 뒤 경제 제어: `economy_ai_policy_review`, `economy_auto_policy`는 enabled를 유지하고 로컬 A/B 추론 서비스는 결정론적 회계 권위를 대체하지 않는 advisory/veto lane으로 유지된다.


## v2026.09.17.163 — 문서 전용 main의 릴리스 자격과 게이트 정확성

### REL-DOCS-163-01 — P0 — OPEN / 근본원인 제거 필요
- 최초/최근 재현: 2026-09-17. 문서 전용 PR #393으로 `main`이 검증된 애플리케이션 SHA `18c7a1324013099e47b2d6e22c5108c4d378139c`에서 문서 커밋 `f3014e67a7cff37eb5c5eb4c92672a93609fbac4`로 전진한 뒤 Build Production Release #907이 `f3014e67...`을 immutable release SHA로 결정했다. 이후 약 15분간 격리 Test가 이 문서 SHA를 제공하기를 기다리다가 exact-SHA gate가 실패했고 Production build는 skip됐다. 이는 신규 CI/릴리스 오케스트레이션 결함이며 기존 `18c7a132...` Production 애플리케이션 런타임 증거를 무효화하지 않는다.
- 영향/severity: 비런타임 커밋만으로 릴리스 자동화가 영구 차단될 수 있고 문서 SHA를 애플리케이션 artifact identity로 잘못 모델링하므로 P0이다. 이를 이유로 exact-SHA 검사를 완화하는 것은 금지한다. 영향 영역은 CI/CD, Test 수렴, Production 승격, 릴리스 증거와 장애대응이며 이번 실패만으로 사용자 런타임 장애가 증명된 것은 아니다.
- 확정 원인 경계: 현재 릴리스 자격 판정이 head가 실제 애플리케이션/runtime build input을 바꾸는지 확인하기 전에 repository `main` head를 배포 identity로 사용한다. 문서 전용 커밋 때문에 이미 실행 중인 Test `/api/version`이 문서 SHA로 바뀌어야 할 정당한 이유는 없다. 즉 repository-history SHA와 deployable application-source SHA라는 서로 다른 identity domain을 비교하고 있다.
- 수정설계: 명시적 `release_source_sha`/`application_source_sha`를 도입한다. 현재 main 이하에서 frontend/backend/shared runtime package, lockfile, migration, container/build 설정 또는 release-relevant infrastructure를 마지막으로 변경한 커밋을 결정론적으로 계산한다. docs/planning/changelog 전용 커밋은 `repository_head_sha`로 추적하되 새 application candidate를 만들지 않는다. path-aware workflow trigger와 별개로 결정론적 eligibility job을 반드시 두고 결과는 `RUNTIME_RELEASE_REQUIRED`, `DOCS_ONLY_NO_RUNTIME_RELEASE`, `RELEASE_INPUT_CLASSIFICATION_ERROR` 중 하나로 한다. 분류 오류는 fail closed다.
- 증거/API/관측성: evidence에는 `repository_head_sha`, `application_source_sha`, changed-path 분류, frontend/backend candidate digest, GitOps desired/applied SHA, 이중 런타임 기간 host-systemd mirror SHA, public `/api/version`, DB migration head/checksum, workflow/run ID를 기록한다. `/api/version`은 애플리케이션 build identity이며 문서 identity가 아니다. dashboard는 docs-head 전진과 runtime freshness를 분리한다. 지표는 `release_docs_only_skip_total`, `release_input_classification_error_total`, `release_source_head_distance`, `test_exact_sha_wait_seconds`, `release_identity_mismatch_total`이다.
- 보안/공급망: path classifier 자체가 repository-controlled security code다. 애매한 경로, lockfile/build tool, migration, secret-reference/config template, container/deployment input 변경은 모두 runtime-relevant로 보고 fail closed한다. 실행 가능한 입력을 docs로 위장해 CI를 우회할 수 없어야 한다. provenance는 candidate digest를 `application_source_sha`에 결합한다. branch protection required-check 문제는 별도 HIGH backlog로 유지한다.
- 마이그레이션/롤백: workflow 수정 자체에는 DB migration이 필요 없다. 이전 workflow로의 롤백은 docs-head deadlock을 재도입하지 않을 때만 허용한다. Production은 마지막 검증 immutable application pair를 유지한다. `/api/version`을 문서 SHA에 맞추려고 의미 없는 rebuild/deploy를 하지 않으며 진짜 runtime release의 equality gate도 완화하지 않는다.
- 테스트: docs/changelog/planning-only, frontend-only, backend-only, shared package, lockfile, migration, Docker/build config, workflow/release config, GitOps config, mixed commit의 unit matrix; merge/multi-commit range, rename/delete, shallow-history fallback; classifier error fail-closed; docs-only main은 Test polling 없이 no-runtime-release evidence로 성공하는 integration; runtime commit은 exact application SHA/digest와 authoritative Test DB를 계속 요구하는 회귀; Test gate 실패 후 build/promotion skip 회귀를 수행한다.
- 수용조건: exact-main docs-only run이 빠르게 `DOCS_ONLY_NO_RUNTIME_RELEASE`로 끝나고 다음 runtime release 승인 전까지 public application SHA `18c7a132...`을 유지하며 완전한 evidence를 남긴다. 이후 synthetic/runtime PR은 여전히 exact `application_source_sha`를 Test → backend/API/DB/user-flow QA → GitOps/host mirror → Production smoke로 증명해야 한다.
- 사업/UX: 직접매출은 0이며 릴리스 차단, 운영자 시간, 불필요 rebuild/deploy, 허위 장애/지원 비용을 줄이는 비용절감 기능이다. test corpus 분류 정확도 100%, docs-only p95 <2분, runtime mutation 0이면 SCALE; 애매한 분류는 ITERATE; runtime-relevant path가 candidate/QA gate를 우회할 수 있으면 즉시 KILL/ROLLBACK한다.

### SEO/보안/수익성 갱신 — 2026-09-17
- Google Search Central의 최신 9월 자료는 새로운 ranking 계약이 아니라 문서/행사 갱신이며 2026-08-28 site-reputation 변경은 sponsor/affiliate/UGC 거버넌스에 계속 직접 적용한다. 공개 SEO 계약은 서버에서 읽을 수 있는 주요 콘텐츠, stable canonical, sitemap/robots 일관성, indexable list의 crawlable pagination, structured-data 검증, 다국어 hreflang, CWV 관측을 유지하고 private/admin/transaction 페이지는 sitemap 제외와 `noindex`를 강제한다.
- OWASP ASVS 5.0은 구현 검증 baseline, API Security Top 10은 API threat discovery baseline으로 유지한다. 새 release classifier는 공급망 보안 영역이므로 애매한 실행 입력은 fail closed하고 provenance가 digest와 application source identity를 결합해야 한다.
- Google Play 현행 수수료는 market/programme/install cohort/transaction type/billing path별로 달라진다. SKU unit economics는 versioned fee policy를 유지하며 실측되지 않은 conversion, ARPU/ARPDAU/ARPPU, churn, refund, CAC, LTV는 `HYPOTHESIS`/`TEST TARGET`이다. 이번 회차에 가격 가정 변경은 없다.

### v163 worklog
- 최신 레퍼런스: Google Search Central 9월 최신 업데이트/site-reputation, OWASP ASVS/API security, Google Play 현행 service-fee 문서를 재확인했다. 근거 없는 ranking·보안인증·매출 주장은 추가하지 않았다.
- 런타임/QA/CI: 시작 및 중간 main은 `f3014e67...`이다. 해당 docs-only exact head의 Build Production Release #907은 `Wait for exact SHA on isolated test and verify backend/database path`에서 실패했고 build는 skip됐다. 이 때문에 REL-DOCS-163-01을 추가하며 기존 `18c7a132...` Production exact-SHA 증거는 유지한다.
- 개발순서: 독립 restore 증거 → false-green 제거 → release identity/classifier 수정 및 dual-runtime 권위 제거 → HIGH auth/admin/casino/Work/DB integrity QA → repository required-check enforcement → 핵심 correctness → 수익화 → SEO/acquisition → retention/accessibility. 이번 기획 변경은 runtime code, DB/Flux, Production을 변경하지 않는다.


## v2026.09.17.164 — docs-head 반복 릴리스 실행 및 crawler/runtime 증거 강화

### REL-DOCS-164-01 — P0 — IN PROGRESS / EXACT MAIN 반복 재현
- 최초 발견: 2026-09-17 REL-DOCS-163-01. 최신 재현: 이번 회차 exact main `4f568afbce37d59612f483ed2c5bf60c6217bf68`. 문서 전용 v163 head인데도 `Build Test Candidate #806`(`35131802624`)이 성공했고, 이어 `Build Production Release #909`(`35132313855`)가 `test-gate`에 진입해 증거 마감 시점에도 exact Test SHA를 기다리고 있었다. CI #1160(`35131803817`)은 성공했다. 즉 현재 workflow에는 release-input classifier/eligibility 수정이 아직 구현되지 않았다는 반복 증거다.
- 재현절차: 변경 경로가 `docs/planning/**`뿐인 commit을 merge → Test candidate workflow가 runtime candidate를 만드는지 확인 → Production Release가 repository head를 application candidate로 해석해 exact-SHA Test polling에 들어가는지 확인한다.
- 영향: 릴리스 처리량, runner/registry 비용, 운영자 alert fatigue, Test 환경 churn, 잘못된 incident 분류, release evidence 무결성. 기존에 검증된 Production application runtime 자체가 장애라는 증거는 아니다.
- 확정 원인: orchestration 동작이 `repository_head_sha == application_source_sha`로 두 identity를 혼동한다. candidate 생성/exact-SHA gate 앞에 권위 있고 테스트된 changed-input classifier가 없다.
- 구현 백로그: (1) FE/BE/shared/lockfile/migration/container/build/deploy/security-config 입력을 버전 관리하는 `release-inputs.yml`; (2) merge-base→head의 rename/delete까지 diff해 `repository_head_sha`, `application_source_sha`, `classification`, `matched_runtime_paths`, `classifier_version`을 내는 결정론적 classifier job; (3) candidate build/Test GitOps/Production Release는 `RUNTIME_RELEASE_REQUIRED`일 때만 실행; (4) `DOCS_ONLY_NO_RUNTIME_RELEASE`는 signed/machine-readable evidence만 남기고 image build/Test mutation/Production promotion 없이 종료; (5) history 부족·unknown path·classifier error는 fail-closed; (6) 운영 UI/evidence에서 문서 freshness와 runtime freshness를 분리한다.
- Evidence/API schema: `releaseEvidence={repositoryHeadSha,applicationSourceSha,classification,classifierVersion,changedPathsHash,backendDigest?,frontendDigest?,testAppliedRevision?,testPublicSha?,productionPublicSha?,dbMigrationHead?,createdAt,workflowRunIds}`. runtime field null은 `DOCS_ONLY_NO_RUNTIME_RELEASE`에서만 허용하며 이유를 명시한다.
- 보안: classifier와 inventory는 supply-chain control이다. CODEOWNERS/review로 classifier/build/deploy workflow/inventory를 보호한다. `.github/workflows/**`, lockfile, Docker/container, migration, runtime config/secret reference, generated runtime artifact, 미분류 executable extension은 runtime-relevant다. docs처럼 보이는 파일명으로 실행 의미를 숨겨 우회할 수 없어야 한다. provenance는 mutable branch가 아니라 `application_source_sha`에 digest를 결합한다.
- migration/rollback: application DB migration 없음. workflow rollback은 runtime input을 계속 fail-closed하는 버전으로만 허용한다. `/api/version`을 docs SHA에 맞추기 위한 synthetic image rebuild/deploy는 금지한다. 실제 runtime candidate가 모든 gate를 통과할 때까지 Production은 마지막 검증 application pair를 유지한다.
- 필수 테스트: docs-only, FE, BE, shared, lockfile, SQL migration, Docker, CI workflow, GitOps, config, mixed, rename/delete, symlink, generated file, merge commit, multi-commit, shallow clone의 table-driven classifier; docs-only에서 registry push/GitOps write/Test polling이 모두 0인 integration fixture; runtime fixture의 exact SHA/digest/DB/user-flow gate; documentation-looking path에 runtime payload를 넣는 security negative fixture.
- Test 수용조건: docs-only p95 <2분, `candidate_images_built=0`, `test_gitops_mutations=0`, `production_mutations=0`, classification evidence 존재, CI 유지. runtime 변경은 exact-SHA/실DB gate를 보존한다. classifier ambiguity면 Production promotion을 차단한다.
- 관측: `release_classification_total{class}`, `release_classifier_error_total`, `docs_only_candidate_build_violation_total=0`, `docs_only_test_poll_violation_total=0`, `release_source_head_distance`, classification별 runner minutes/registry bytes. docs-only runtime mutation은 즉시 alert한다.
- 상태/작업순서: `P0 IN PROGRESS`; release/platform → input inventory security review → classifier unit/integration QA → isolated workflow dry-run → current-main docs-only proof → synthetic runtime proof → REL-DOCS-163/164 동시 종료. 반복 BLOCKED는 신규 기능보다 우선한다.
- 사업효과: 직접매출 0. 절감된 CI runner minute, registry/storage/network, 운영자 시간, release delay를 측정한다. classifier corpus 정확도 100%·bypass 0일 때 SCALE, false-positive는 ITERATE, false-negative/runtime bypass는 KILL/ROLLBACK한다.

### SEO/SEO 백엔드 증분 — crawlable infinite scroll 및 crawler-family 관측
- Google Search 공식 문서는 2026-09-17 infinite-scroll 지침을 현행 문서로 이전했으며 지침 자체는 변경되지 않았다고 밝혔다. indexable Moneyverse community/market/collection/public-search 목록은 사용자 scroll/click을 해야만 검색엔진이 다음 콘텐츠를 발견하는 구조를 금지한다. 각 chunk는 영구·안정 URL(예: bounded absolute `?page=N`), 결정론적 콘텐츠, 순차 crawlable `<a href>` 링크를 갖고 scroll로 주 콘텐츠가 바뀌면 History API로 URL을 갱신한다. 독립 검색가치가 없는 filter는 route policy에 따라 canonical/noindex하고 private/account/admin/transaction은 sitemap 제외+강제 `noindex`다.
- SEO backend는 `{canonicalUrl,page,pageSize,totalPages,prevUrl,nextUrl,updatedAt,indexPolicy}` pagination read-model을 소유하며 hydration 전 SSR HTML에 canonical/robots/breadcrumb/structured-data를 일관되게 출력한다. 범위 초과 page는 empty 200 soft-404가 아니라 canonical 404다. sitemap은 canonical indexable page만 포함하고 `lastModified`는 request 시간이 아니라 의미 있는 공개 콘텐츠 갱신시각을 사용한다.
- Google은 2026-09-16 `GoogleProducer` UA 문자열 변경과 crawler content-encoding 정보도 문서화했다. crawler 분석은 brittle full-UA equality가 아니라 검증된 crawler/fetcher family와 해당되는 공식 token/IP 검증을 사용한다. crawler 분류로 인증·권한·rate safety·`noindex`를 우회하거나 ranking용 primary content를 다르게 제공하지 않는다.
- SEO QA: 대표 pagination route의 JS-off/rendered HTML 및 Search Console URL Inspection, page>1 orphan 0, hydration 전후 canonical 안정성, page-1 alias 중복 0, 불가능 page 404, crawler log에 family/status/canonical/robots/render/cache/latency 기록. KPI는 organic impression→CTR→landing→signup→activation→D7/D30→revenue이며 crawl error/index exclusion/CWV를 guardrail로 둔다.

### 보안·수익성 재검증 — 2026-09-17
- OWASP ASVS 최신 stable은 5.0.0이고 API Security 최신 프로젝트판은 2023이다. API6 sensitive-business-flow abuse는 casino/reward/referral/market/release-control endpoint에 직접 적용한다. 2026 GenAI LLM Top 10/Agent Control Standard는 Economy-AI에 계속 적용하며 모델 출력은 advisory/bounded이고 ledger/balance/entitlement 권위가 될 수 없다.
- Google Play는 단일 보편 수수료가 아니다. 현재 공식표도 시장 rollout, recurring/non-recurring, new/existing install, programme, billing path를 구분한다. 상점/결제/구독 unit economics는 `market × transaction_at × install cohort(if applicable) × transaction type × billing path × programme`별 versioned fee policy를 유지하고 실측 없는 conversion/attach/ARPU/ARPDAU/ARPPU/refund/churn/CAC/LTV는 `가설`/`테스트 기준`이다.

### v164 worklog
- 외부조사 선행: Google Search Central 2026-09-17 infinite-scroll 이전 및 2026-09-16 crawler 변경, OWASP ASVS 5.0.0/API Security 2023/GenAI 2026, Google Play 현행 수수료표를 확인했다. 행사 공지를 ranking 변화로 취급하지 않았다.
- 저장소/runtime/QA: exact main `4f568afb...`, EN/KO v163, 현재 workflow를 읽었다. CI #1160과 Test Candidate #806은 성공했고 docs-only head의 Production Release #909가 exact-SHA test-gate에 진입해 release-identity 결함을 반복 재현했다. Production application 장애 증거로 해석하지 않았다.
- 통합 직전 main을 재확인한다. 우선순위는 독립 restore → stale-status false-green → release classifier/dual-runtime authority → HIGH auth/admin/casino/Work/DB integrity → required-check enforcement → core correctness → monetization → SEO/acquisition → retention/accessibility다. 이번 회차는 문서만 변경하며 runtime/DB/Flux/Production을 직접 변경하지 않는다.


## 19. v2026.09.17.165 증거 동기화 — 문서 전용 변경의 릴리스 부작용이 계속 발생

### 19.1 최신 증거와 적용 판정

- **저장소/런타임 증거(2026-09-17 04:02~04:06 KST):** `main=62c65827b76f6e7d57c66f5954194276aee16d2e`이며 기획문서 전용 커밋이다. main CI `1163`은 성공했지만 `Build Test Candidate #788`과 `Auto Integrate and Promote`는 여전히 `in_progress`였다. 이는 `REL-DOCS-164-01`의 새로운 독립 재현이다. 문서 전용 커밋이 candidate/promotion 자동화에 계속 진입하므로 상태는 **P0 / OPEN / REDESIGN_REQUIRED**이며 CI green을 Test/Production 성공으로 해석하지 않는다.
- **Google Search Central(2026-09-17):** infinite-scroll JavaScript 지침이 현행 문서로 이전됐고 지침 변경은 없었다. **직접채택:** 모든 indexable Moneyverse 목록은 안정적인 chunk/page URL과 crawlable 순차 링크를 제공하며 scroll-only 발견 구조를 금지한다. 2026-09-14 Search Central Live India 글은 행사 공지이므로 ranking/indexing 정책 변경 근거에서 **제외**한다. 2026-08-28 site-reputation 변경은 sponsor/affiliate/UGC 거버넌스에 계속 **직접채택**한다.
- **OWASP(2026-09-17 확인):** ASVS 최신 stable은 5.0.0, API Security Project의 API 전용 최신 Top 10은 2023이다. **직접채택:** ASVS를 검증 가능한 통제 baseline으로 사용하고 API1/BOLA, API2/인증, API5/BFLA, API6/민감 비즈니스 흐름 악용, API7/SSRF, API9/inventory를 해당 API의 필수 negative-test 계열로 둔다.
- **Google Play 수수료(2026-09-17 확인):** 단일 보편 수수료가 없고 EEA/UK/US는 2026-06-30 이후 new/existing install과 거래 유형을 구분하며 나머지 시장은 rollout 전 체계를 사용한다. 한국 alternative billing은 적용 Play 수수료에서 4%p 낮다. **직접채택:** SKU economics를 market/effective date/install cohort/transaction type/billing path/programme별 versioned policy로 계산하고 실측 없는 conversion, ARPU/ARPDAU/ARPPU, refund, churn, CAC, LTV는 `HYPOTHESIS`/`TEST TARGET`으로 유지한다.

### 19.2 REL-DOCS-165-01 — P0 — OPEN — release eligibility 증명 전에 candidate/promotion 부작용이 시작됨

- **최초발견:** 2026-09-16(`REL-DOCS-163-01`). **최근재현:** 2026-09-17 04:02 KST, docs-only `62c65827...`.
- **재현:** `docs/planning/PROJECT_PLAN.md`와 `.ko.md`만 변경한 커밋을 병합 → 정상 CI 확인 → 같은 repository head로 `Build Test Candidate`와 promotion orchestration이 시작되는지 확인한다.
- **영향:** release engineering, Test capacity, registry/storage, GitOps truth, Production promotion 신뢰성, incident triage, 개발 대기시간. 기획문서 전용 커밋은 사용자 런타임을 바꾸면 안 된다.
- **증거/원인:** runtime eligibility가 candidate/promotion workflow 생성의 권위 선행조건이 아니다. 현재 trigger topology는 deployable application input 변경 여부를 증명하기 전에 비용성/상태변경성 릴리스 작업을 예약할 수 있다. 애플리케이션 런타임 결함이 아니라 control-plane correctness 결함이다.
- **수정설계:** image/GitOps/poll/promotion 전에 required `classify-release-inputs` job을 둔다. merge-base→head diff, rename/delete metadata, versioned `release-inputs.yml`을 입력받아 `{repositoryHeadSha, applicationSourceSha, classification, matchedRuntimePaths, classifierVersion, generatedAt}` immutable evidence를 생성한다. `RUNTIME_RELEASE_REQUIRED`만 candidate를 해제한다. `DOCS_ONLY_NO_RUNTIME_RELEASE`는 registry push/Test GitOps write/exact-SHA poll/Production mutation 모두 0건으로 성공 종료한다. `RELEASE_INPUT_CLASSIFICATION_ERROR`는 fail-closed하며 반복 시 release engineering에 경보한다.
- **분류 안전성:** frontend/backend/shared runtime, lockfile, migration, Docker/container/build, artifact에 영향을 주는 reusable workflow, GitOps/deploy manifest, runtime config/schema, secret reference, generated runtime artifact, unknown executable은 runtime-relevant다. rename/delete, symlink/path trick, 대소문자 변경, merge commit, shallow-history fallback, docs+runtime 혼합 커밋을 명시적으로 시험한다. docs 경로에 executable payload를 숨겨도 우회할 수 없어야 한다.
- **마이그레이션:** business-data migration 없음. classifier schema/evidence format은 versioning하며 과거 release evidence는 immutable이다. 이 기획 자동화는 Production DB를 쓰지 않는다.
- **롤백:** classifier/workflow wiring은 unclassified commit의 자동 Production mutation을 다시 허용하지 않는 경우에만 last-known-good로 되돌린다. 그렇지 않으면 promotion을 동결하고 reviewed manual release selection을 요구한다.
- **테스트:** path-class unit corpus, rename/delete·mixed property test, docs-only/frontend/backend/shared/lockfile/migration/Docker/GitOps workflow integration, supply-chain bypass negative, concurrent main advance, rerun/cancel, merge-base 없음, malformed manifest, provenance 검증. docs-only 수용조건은 p95 분류 <2분과 모든 runtime side-effect counter=0. runtime 변경은 exact application SHA/digest가 isolated Test → authoritative backend/API/DB/user-flow QA → Production smoke/rollback gate를 그대로 통과해야 한다.
- **모니터링:** `release_classifier_total{classification}`, `release_classifier_errors_total`, `docs_only_candidate_started_total=0`, `docs_only_registry_push_total=0`, `docs_only_gitops_mutation_total=0`, `release_application_source_mismatch_total=0`, queue/compute minutes avoided. docs-only side effect 1건도 즉시 alert한다.
- **사업성:** 직접매출 0. 절감가치는 CI/registry/Test 비용, false-release/incident 확률, engineer wait time 감소다. 30일 false-negative 0·docs-only side-effect 0이면 **SCALE**, false-positive면 **ITERATE**, runtime input을 놓치는 classifier version은 **KILL/ROLLBACK**한다.

### 19.3 이번 회차 교차 기능 구현 계약

1. **SEO backend/목록 UX:** public community/market/collection/search는 서버 read-model에서 `{canonicalUrl,page,pageSize,totalPages,prevUrl,nextUrl,updatedAt,indexPolicy}`를 제공한다. hydration 전 SSR HTML에 canonical/robots/breadcrumb/structured-data와 crawlable `<a href>` pagination이 존재해야 한다. 범위 밖 page는 empty 200 soft-404가 아니라 404다. filter/sort/query variant는 독립 검색가치가 없으면 canonical parent 또는 `noindex,follow`다. sitemap은 canonical indexable URL과 의미 있는 `lastModified`만 포함한다. private/account/admin/transaction/casino-history는 강제 noindex+sitemap 제외다. cache key는 locale/canonical page/index policy를 포함하고 metadata cache가 content/version보다 오래 살아남지 못한다. JS-disabled/bot/mobile/desktop/hreflang/301·308/404·410/UGC moderation/CWV를 QA한다.
2. **보안/API inventory:** 모든 user/admin/economy endpoint registry row에 owner, authn, authorization capability, object ownership, request/response schema, idempotency, rate/resource limit, PII class, audit event, data store, feature flag, deprecation state를 기록한다. 구현 route가 inventory에 없으면 CI fail이다. casino/reward/referral/shop/payment/admin은 일반 rate limit 외 API6 abuse case가 필수이고 object-ID API는 BOLA, admin은 BFLA+recent reauth/2FA, remote-fetch/upload는 SSRF/content/path negative test를 요구한다. 각 통제에 residual risk와 deploy-block 여부를 기록한다.
3. **수익성/분석:** monetized SKU마다 `feePolicyVersion`, market, currency, gross price, tax assumption, platform/payment fee, refund/fraud, variable infra/support/content cost, net/contribution-margin 식을 저장한다. dashboard는 revenue/net revenue/gross margin/contribution margin/ARPU/ARPDAU/ARPPU/conversion/attach/repeat/renewal/churn/refund/CAC/LTV/payback/fraud loss/infra·support cost/D1·D7·D30을 분리한다. 실측 전 값은 hypothesis/test target이다. 광고 실험은 `ad revenue - incremental churn/session loss/support cost` 순효과로 평가하고 gross ad revenue가 늘어도 사전 guardrail을 넘게 retention/trust가 악화되면 kill한다.
4. **릴리스/운영:** P0 `BAK-106-01`, `OPS-107-01`, release classifier, dual-runtime authority를 신규기능보다 앞에 둔다. CI green은 restorable backup, fresh status telemetry, exact Test runtime, authoritative DB verification, Production smoke와 동치가 아니다. promotion evidence는 각 상태전이를 별도로 보존하고 rollback은 정확한 immutable application source SHA/digest와 DB compatibility boundary를 지목해야 한다.

### 19.4 Worklog / changelog v165

- 외부 조사 우선 수행: Google Search Central documentation updates/infinite-scroll/site-reputation, OWASP ASVS/API Security, Google Play service-fee policy.
- 그 다음 저장소 증거 대조: 최신 main, EN/KO 통합본, main CI와 release workflow. 신규 사실은 docs-only `62c65827...`에서도 CI green과 별개로 Test candidate/promotion 자동화가 시작됐다는 점이다.
- 기획 변경: P0 release classifier를 path taxonomy 수준에서 선행 control-plane gate + side-effect-zero 수용지표로 강화하고 SEO list read-model, API inventory/security, monetization measurement, release evidence 구현계약을 추가했다.
- 통합 직전 main을 다시 확인한다. main이 전진하면 rebase 후 두 통합본을 재확인하고 더 최신 증거를 덮어쓰지 않는다.
- 런타임 배포: **기획 자동화에서 수행하지 않음**. 구현은 별도 branch→tests/CI→exact-SHA Test→backend/API/DB/user-flow QA→main→Production promotion→smoke/rollback 흐름을 따른다.


## 2026-09-17 v166 증거/작업로그 — 릴리스 적격성 P0 지속 및 공개 검색 계약 강화

### 최신 증거와 판정
- **저장소/런타임 증거(2026-09-17):** 시작 기준 protected `main=c2a61cbee88db0f711925f4ebfe898a676ce4d0a`는 `docs: integrate Moneyverse plan v2026.09.17.165`인 문서 전용 커밋이다. 그런데 required status check enforcement는 여전히 `off`, contexts/checks는 비어 있고, 이 exact 문서 SHA에 대해 `Build Production Release #913`이 다시 시작되어 증거 수집 시 `in_progress`였다. 이는 배포 앱 변경 증거가 아니라 `REL-DOCS-*`의 신규 재현이다. **P0 / OPEN.**
- **원인 경계:** 신뢰 가능한 배포 적격성 분류보다 release orchestrator가 먼저 시작되어 repository head identity가 application release identity처럼 소비되고 있다. 수정 전까지 docs-only merge가 build/Test/promotion 자원을 소비하고 잘못된 release evidence를 만들 수 있다.
- **구체 수정:** 모든 candidate build/registry push/GitOps write/Test polling/promotion보다 `classify-release-inputs`를 먼저 실행한다. merge-base→head diff의 rename/delete/symlink/submodule 의미까지 판정하고 `{repositoryHeadSha, applicationSourceSha, classification, matchedRuntimePaths, classifierVersion, evidenceCreatedAt}`를 불변 증거로 남긴다. 결과는 `RUNTIME_RELEASE_REQUIRED`, `DOCS_ONLY_NO_RUNTIME_RELEASE`, fail-closed `RELEASE_INPUT_CLASSIFICATION_ERROR`만 허용한다. frontend/backend/shared 실행코드, package/lock, migration, Docker/build, runtime에 영향을 주는 workflow/GitOps, generated runtime artifact, runtime config/secret reference 및 영향 불명 executable은 runtime-relevant다.
- **재현/수용:** 알려진 application SHA 뒤 docs/planning-only commit을 merge한다. 수정 후 CI/docs validation은 가능하지만 registry push=0, Test GitOps mutation=0, exact-SHA runtime polling=0, Production mutation=0이어야 한다.
- **롤백/마이그레이션:** DB migration 없음. classifier/orchestrator 롤백은 release를 막는 fail-closed 상태로만 허용하며 unconditional promotion으로 복귀하지 않는다. workflow/classifier evidence ID는 감사용으로 보존한다.
- **테스트:** path table corpus, rename/delete, symlink/submodule/path-normalization trick, merge/multi-commit range, shallow-history failure, docs+runtime mixed, lockfile/migration/container/workflow/GitOps, generated artifact, 문서처럼 보이는 경로에 숨긴 executable payload. 공격자가 경로 선택으로 release를 우회할 수 없어야 한다.
- **모니터링/종료:** docs-only side effect=0, runtime false-negative=0, classifier error는 release 차단, docs-only 분류/evidence p95 <2분(`TEST TARGET`). `release_classification_total`, `docs_only_runtime_side_effect_total=0`, `classifier_error_total`, `release_application_source_mismatch_total=0`을 관측한다. Production 승격에는 exact application SHA/digest, authoritative Test DB/API/user-flow, GitOps/public-edge identity, Production smoke/rollback 증거가 별도로 필요하다.

### 공개 SEO/SEO 백엔드 계약 증분
- 2026-09-17 확인 기준 Google Search Central 업데이트 로그의 2026-09-08 변경은 지역별 Search experience 문서 추가다. 2026-09-16 Search Central Live 글은 행사/커뮤니티 공지이므로 ranking/indexing 계약 변경 근거에서 제외한다. Breadcrumb structured data는 계속 hierarchy signal로 사용 가능하며 Rich Results Test/URL Inspection 검증 후 확대한다.
- indexable 공개 route family(community, 공개 collection, 공개 market/catalog, 개인정보 정책상 허용된 공개 profile/content)는 서버 SEO read-model `{canonicalUrl,indexPolicy,title,description,h1,breadcrumbs,localeAlternates,updatedAt,imageMeta,structuredDataVersion}`을 사용한다. account/admin/transaction/private inventory·bank·casino history/personalized search는 `noindex`이며 sitemap에서 제외한다.
- 공개 entity는 canonical 1개만 가진다. slug 변경은 불변 redirect map을 쓰고 영구 method-preserving redirect는 308을 기본으로 한다. 의도적 영구 삭제는 410, 그 외 부재는 404. filter/sort/query variant는 별도 승인된 고유 검색의도/콘텐츠 landing contract가 없으면 base canonical/noindex다. sitemap `lastmod`는 실제 의미 있는 콘텐츠 변경시각이다.
- structured data는 visible SSR과 같은 authoritative read-model에서 직렬화한다. `BreadcrumbList` URL은 canonical이고 화면 hierarchy와 일치해야 한다. template validation 실패는 해당 SEO rollout을 막는다. crawler 식별은 관측용일 뿐 auth/authorization/rate/privacy/`noindex` 우회에 쓰지 않는다.
- SEO KPI chain은 `eligible/indexable URL → crawl/index health → impressions → CTR → organic session → signup → activation → D7/D30 → net revenue/LTV`다. 금전 효과는 관측 전 `HYPOTHESIS/TEST TARGET`; thin/duplicate/unsafe UGC index 증가, crawler error 악화, moderation/support economics 악화 시 iterate/kill한다.

### 보안/API inventory 증분
- OWASP API Security Project는 현재 API-specific 최신판을 2023으로 표시한다. 모든 구현 API route는 owner/domain, authn, capability, object ownership, request/response schema, idempotency, rate/resource/business-flow limit, PII class, audit event, datastore, feature flag, deprecation을 inventory에 등록하며 미등록 runtime route는 CI 실패다.
- 사용자 object에는 BOLA negative test, privileged admin에는 BFLA + recent reauth/2FA, casino/reward/referral/shop/payment/loan/market/recovery에는 sensitive-business-flow abuse test가 필수다. 예방은 서버 권한/트랜잭션 불변식/idempotency/quota, 탐지는 append-only audit/anomaly metric으로 구성한다. scanner green만으로 종료하지 않고 CRITICAL/HIGH 실패는 승격을 막는다.

### 수익성/unit economics 증분
- Google Play 현행 공식자료는 단일 보편 service fee가 없음을 명시한다. EEA/UK/US의 2026-06-30 이후 standard 예시는 자동갱신 구독 10% + 해당 시 5% billing fee, 기타 new-install 20% + 해당 fee, 기타 existing-install 25% + 해당 fee로 구분되고 다른 시장은 rollout 전 각 적용 모델을 따른다. 따라서 실제결제 SKU/구독은 `feePolicyVersion, market, transactionAt, installCohort, transactionType, billingPath, programme, grossPrice, tax, platformFee, paymentFee, refundReserve, directOpsCost`를 보존한 뒤 net revenue/contribution margin을 계산한다.
- SKU dashboard는 units, gross/net revenue, gross/contribution margin, attach/repeat/subscription conversion, renewal/churn/refund, ARPU/ARPDAU/ARPPU, CAC/LTV/LTV:CAC/payback, fraud loss, infra/support cost/user, D1/D7/D30을 분리한다. 미실측값은 `HYPOTHESIS` 또는 `TEST TARGET`이다. contribution margin과 retention/trust guardrail이 통과해야 scale하며 P2W/economy abuse, 유의한 refund/fraud/support 손실 또는 D7/D30 악화가 발생하면 kill한다.

### 개발 순서/상태
1. **P0:** 독립 암호화 backup + 격리 full restore/reconciliation 증거(`BAK-106-01`).
2. **P0:** stale public-status false-green 원인 제거와 freshness 회귀(`OPS-107-01`).
3. **P0:** release-input classifier 구현 및 docs-only runtime side effect=0 증명(`REL-DOCS-166-01`, OPEN, 최신 재현 Release #913).
4. **P0:** GitOps desired workload와 public edge/systemd runtime/public version·digest를 단일 release authority로 수렴.
5. **P1/HIGH:** auth/session/admin/casino/Work/DB authorization·idempotency·ledger/reconciliation 증거.
6. **P1:** protected-main required checks/ruleset을 실제 machine-enforced gate로 전환.
7. core correctness → shop/payment/subscription unit economics → SEO/acquisition → retention/growth → accessibility/장기확장. 런타임 구현은 별도 branch/test/exact-SHA/QA/promotion/smoke/rollback 흐름을 따른다.

**v166 사업효과:** release classifier의 직접매출은 0이며 CI/registry/Test/운영 낭비와 잘못된 application identity 승격·감사 위험 감소가 가치다. SEO는 acquisition/CAC 효율 투자, API/security/backup/status는 사고·다운타임·환불·fraud·support 기대손실 감소다. 관측되지 않은 금액은 실제값으로 단정하지 않는다.
