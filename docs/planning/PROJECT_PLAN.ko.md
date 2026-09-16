# 월덕 머니버스 — Living Project Plan

> **문서 상태:** Living specification / 현재 권위 통합기획서
> **최초 기준:** 2026-08-26
> **현재 통합 버전:** v2026.09.16.156
> **구현·증거 동기화:** 2026-09-16
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
