# 월덕 머니버스 — Living Project Plan

> **문서 상태:** Living specification / 현재 권위 통합기획서
> **최초 기준:** 2026-08-26
> **현재 통합 버전:** v2026.09.15.110
> **구현·증거 동기화:** 2026-09-15
> **영문 기준 문서:** [PROJECT_PLAN.md](PROJECT_PLAN.md)

과거 상세 변경은 Git 이력과 버전별 changelog/worklog에서 복구할 수 있다. 이 문서는 현재 구현을 위한 권위 계약이다. 다른 개발자나 AI가 과거 초안을 현재 사실로 추정하지 않고 이 문서만으로 기능 범위, 권위 경계, 사용자 상태, API, 영속화, 보안, SEO, 사업성, QA, 릴리스 게이트와 롤백 조건을 이해할 수 있어야 한다.

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
