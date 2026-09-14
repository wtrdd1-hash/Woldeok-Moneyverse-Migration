# 월덕 머니버스 — Living Project Plan

> **문서 상태:** Living specification / 현재 권위 통합기획서
> **최초 기준:** 2026-08-26
> **현재 통합 버전:** v2026.09.15.107
> **구현·증거 동기화:** 2026-09-15
> **영문 기준 문서:** [PROJECT_PLAN.md](PROJECT_PLAN.md)

과거 상세 변경은 Git 이력과 버전별 changelog/worklog에서 복구할 수 있다. 이 문서는 현재 구현을 위한 권위 계약이다. 다른 개발자나 AI가 과거 초안을 현재 사실로 추정하지 않고 이 문서만으로 기능 범위, 권위 경계, 데이터 흐름, 실패 상태, 보안, SEO, 사업성, QA, 릴리스 증거와 롤백 조건을 이해할 수 있어야 한다.

## 0. 유지관리·증거 원칙

1. 중요한 기획은 최신 외부 레퍼런스 조사 후 작성한다. 현재 공식 제품/플랫폼 문서, 정부·규제기관, OWASP·보안기관, 실제 런타임 증거를 우선하고 중요한 판단은 가능하면 독립 근거 2개 이상을 비교한다.
2. 계약을 바꾸기 전 최신 `main`, 영문 canonical, 한국어 대응본, QA/worklog, CI·배포 자동화, 런타임, 관련 코드·migration을 확인한다. 작업 중간과 통합 직전에 `main`을 다시 확인하고 문서 자동화에서 force-push하지 않는다.
3. 구현증거는 `IMPLEMENTED`, `PARTIAL`, `UNVERIFIED`, `REDESIGN_REQUIRED`로 분류한다. 기획서·과거 screenshot·issue 본문·오래된 테스트만으로 현재 런타임 완료를 주장하지 않는다.
4. CI·테스트·런타임 증거가 없으면 `verification unavailable`이다. 통과로 추정하지 않는다. CRITICAL/HIGH와 P0 승격 게이트는 fail-closed다.
5. 적용된 DB migration은 불변이다. 교정은 새 번호 migration으로 한다. 경제 이력은 append-only이며 잘못된 거래는 보정거래로 교정한다.
6. 실측되지 않은 사업수치는 `가설` 또는 `테스트 기준`으로 표시한다. WLD/WDX 활동을 실화폐 매출로 계산하지 않는다.
7. 실제 런타임 구현은 별도 흐름 `브랜치 → 정적/단위/통합/실DB/보안 테스트 → immutable candidate → isolated exact-SHA 테스트 → backend/API/DB/사용자흐름 QA → main 통합 → exact-main-SHA release evidence → 운영승격 → 운영 smoke/관측 → 필요 시 rollback`을 따른다.

## 1. 제품·시스템 불변 경계

월덕 머니버스는 웹과 Discord를 연결하는 커뮤니티형 가상경제·게임 플랫폼이다. 사용자는 인증, WLD 획득·소비, 작업·퀘스트·직업 성장, 수집·아이템, 가상 사업, 가상 은행·대출, 가상 주식, 커뮤니티·소셜, 확률형 게임 기능을 이용한다.

WLD, WDX/가상주식, 은행잔액, 대출, 카지노 플레이와 보상은 게임·시뮬레이션 내부 데이터다. 현금환전, 실제 증권, 실제 예금, 보장수익, 투자수익, 외부 경품, 실제 도박상품을 약속하지 않는다. 향후 실제 금전·금융·도박 가치와 연결하는 변경은 별도 제품·법률 재설계이며 본 기획의 기존 승인을 승계하지 않는다.

현재 기술 기준은 Next.js 프론트엔드, NestJS API, PostgreSQL 권위 데이터/경제/권한 경계, 민감 경로의 `SECURITY DEFINER` 함수, 최소권한 애플리케이션 DB role, append-only 이중분개 원장, 가치변경 요청 idempotency, post-commit outbox다.

### 1.1 경제 불변규칙

모든 가치변경은 actor·정책·eligibility·limit·idempotency를 검증하고 필요한 원장 posting, 파생잔액, audit/outbox를 원자적으로 기록한다. 차변·대변은 대사되고 허용되지 않는 음수잔액은 transaction 경계에서 막는다. 금액은 정수·문자열 안전계약으로 저장·전송하며 권위 WLD를 unsafe JavaScript `Number`로 변환하지 않는다. 교정은 원거래를 참조한 보정거래로 한다.

### 1.2 보안 기준

OWASP ASVS 5.0.0과 OWASP API Security Top 10을 검증 baseline으로 사용하되 인증·준수 완료를 의미하지 않는다. 필수 교차통제는 OAuth/OIDC `state`/`nonce`/PKCE/exact redirect, 안전한 세션 회전·폐기, recent reauth, CSRF, BOLA/IDOR negative test, output encoding/XSS 방어, SQLi/SSRF/path traversal/command injection 통제, 실제 파일형식 검증, rate/resource abuse control, DB least privilege, CORS/CSP/security header, secret 관리, dependency/supply-chain, container/Kubernetes hardening, 암호화된 독립복구 가능 백업, append-only audit, 개인정보 최소화·보유·삭제, secret-safe logging이다.

### 1.3 관리자 경계

현재 모델은 mandatory 2인 승인이 아닌 단일 `superadmin` + 보완통제다. 민감작업에는 `AdminSessionGuard`, recent `ReauthGuard`, TOTP/`SecondFactorGuard`, DB actor 재검증, least privilege, impact preview, 사유기록, 필요한 경우 idempotency, append-only audit를 적용한다. 최고관리자도 보호된 경제·감사 이력을 직접 재작성하지 않는다.

## 2. 현재 우선순위·릴리스 차단 등록부

우선순위는 `P0 데이터손실/보안/인증/권한/자산중복/경제악용/운영장애/DB무결성/승격진실성` → `P1 주요 사용자 오류/핵심완성도` → `P1 상점/결제/수익화` → `P1 SEO/유입` → `P2 리텐션/성장` → `P2 UX/접근성` → `P3 장기확장`이다.

### BAK-106-01 — P0 — OPEN — 독립 백업 + 성공 restore 증거 부재

- 최초 근거: 2026-09-09 열린 GitHub issue #139가 2026-09-15에도 OPEN. 마지막 직접점검에서 `/mnt/backup`(`/dev/sda1`)이 read-only였고 별도매체 최신 관찰 파일은 2026-09-07이며 Kubernetes 시대 자동백업이 관찰되지 않았다. 응급 PostgreSQL custom-format dump는 SHA-256·`pg_restore -l`을 통과했지만 같은 시스템 디스크에 있었다.
- 영향: host/storage 전체손실 시 identity/session/economy/ledger/audit/inventory/entitlement/object와 분쟁복구 역량이 훼손될 수 있다.
- 규칙: 현재 독립복구 가능한 백업과 성공 restore 증거가 없으면 파괴적 또는 schema/data-changing 운영작업을 차단한다.
- 종료조건: 9절 구조, isolated full restore drill, 모니터링, machine-readable release evidence를 구현·검증한다.

### OPS-107-01 — P0 — OPEN — 오래된 서비스 상태 스냅샷이 정상으로 표시될 수 있음

- 최초·최근 재현: 2026-09-15 07:05 KST. 공개 `/status`는 `모든 서비스가 정상입니다.`라고 표시했지만 웹 서비스, 경제 API, 경제 원장 DB 세 항목의 관측시각이 모두 04:06 KST였다. 같은 페이지는 상태 수집 주기가 30초이고 이보다 오래된 기록은 `확인 중`으로 표시한다고 설명한다.
- 저장소 계약: `frontend/src/app/status/page.tsx`는 30초 revalidate를 사용하지만 API가 준 `state`를 그대로 신뢰한다. `frontend/src/lib/status.ts`는 상태 문자열 자체가 잘못된 경우에만 `unknown`으로 바꾼다. migration `013-content-and-status.sql`은 source별 `stale_after_seconds`를 갖고 `content_public_status()`가 최신 snapshot이 threshold보다 오래되면 `unknown`, `detail=NULL`, `observed_at=NULL`을 반환하도록 설계돼 있다. 초기 source는 180초를 사용하므로 UI의 literal 30초 stale 설명도 별도 계약불일치다.
- 확인된 영향: 공개 운영상태가 오래됐는데 정상처럼 보일 수 있다. 실제 장애·성능저하를 숨겨 MTTR, 지원비, 신뢰, 릴리스 판단을 악화시킬 수 있다. 종료 전에는 공개 `/status`를 운영 성공의 단독 증거로 사용하지 않는다.
- 원인: **미확정**. Production DB 함수/설정 drift, migration parity drift, 오래된 backend/image 경로, collector 실패와 비권위 read path 결합, cache 동작 등이 후보일 뿐이며 진단 없이 하나를 확정하지 않는다.
- read-only 진단 순서: (1) 운영 `/api/v1/status` raw body/header와 server clock 수집, (2) 배포된 backend/frontend exact SHA/digest와 migration checksum 확인, (3) `pg_get_functiondef(content_public_status)`와 `content_status_sources.stale_after_seconds` 조회, (4) latest snapshot timestamp와 DB `clock_timestamp()` read-only 비교, (5) collector last-attempt/last-success/schedule/log 확인, (6) isolated exact-SHA test에서 동일 검증.
- 권위설계: source별 freshness 계약은 서버 하나가 권위다. `수집 주기`와 `stale threshold`는 별도 필드다. 실제 서버 threshold가 30초가 아니라면 UI가 30초를 stale 기준처럼 hard-code하지 않는다. API/public read model은 public-safe `freshness`/`ageSeconds`/`staleAfterSeconds`를 서버 계산값으로 제공할 수 있으나 topology·credential은 노출하지 않는다.
- fail-closed: stale/missing source는 `unknown`; 필수 public source 중 하나라도 stale/unknown이면 전체상태는 `operational`이 될 수 없다. collector heartbeat가 stale이면 `모니터링 지연/확인 중`으로 구분하며 서비스 장애라고 단정하지도, 정상이라고 단정하지도 않는다. status API/DB 실패 시 오래된 green을 threshold 이후 재사용하지 않는다.
- cache: HTML/API/cache TTL이 healthy state를 stale threshold보다 오래 보존해서는 안 된다. freshness 만료 뒤 green assertion에 `stale-if-error`를 적용하지 않는다. cache key에는 private telemetry를 넣지 않는다.
- migration: 적용된 013은 수정하지 않는다. 운영 function/config가 틀리면 새 번호 migration 또는 검토된 config 경로로 교정한다. 단순 미적용이면 정상 migration/release 흐름으로 parity를 맞춘다.
- 필수 테스트: DB threshold `-1/0/+1초`, source별 threshold, snapshot 없음, future timestamp, collector 중단, stale latest row, DB clock/timezone, API cache, backend normalization, frontend SSR/headline, API unavailable, restart, mixed states, forged writer 거부, app role write 거부, 민감 detail 비노출.
- 테스트 수용: synthetic collector를 중단했을 때 승인 stale threshold 이내에 public API/UI가 `unknown/확인 중`, 전체 headline이 비정상 green이 아니며 freshness alert가 발화해야 한다. 새 trusted snapshot 이후에만 healthy로 회복한다. exact-SHA test와 운영 smoke에서 동일 증거를 남긴다.
- rollback: last-known-good immutable app/config로 되돌리되 public status는 fail-closed를 유지한다. DB 교정은 forward corrective migration으로 하며 green 화면 복구를 위해 과거 status history를 재작성하지 않는다.
- metric: `status_source_age_seconds`, `collector_last_success_age_seconds`, `public_status_unknown_count`, `status_api_errors`, `stale_operational_violation_count`. 마지막 값은 0이어야 한다.
- 사업성: 직접매출 0. 회피되는 outage duration, CS, 신뢰손실이 가치다. freshness가 지속적으로 진실할 때만 `SCALE`, false-green 가능성이 있으면 status 의존 자동승격을 `HOLD`한다.

### AUTH-105-01 — P0 — OPEN / PUBLIC LOCAL-AUTH ROLLOUT HOLD

코드·migration·모바일 계약에는 local email 가입/인증/로그인과 Argon2id/email-hash/token-hash 처리가 있으나 현재 공개 web login/guide/privacy는 OAuth 중심이다. 개인정보처리방침·policy version·동의·보유/삭제/credential 제거·SMTP/processor 사실·token-link privacy·exact-SHA security QA·rollback이 맞기 전 신규 local registration을 일반 홍보·공개하지 않는다. endpoint가 이미 있으면 정상 기존 identity를 파괴적으로 비활성화하지 않는다.

### QA-104-01 — P0 — OPEN — 직업작업 quota 공개안내와 권위동작 불일치

운영 `/guide`는 여전히 직업작업을 일일 횟수 제한 없이 반복하고 매번 전액 WLD/EXP를 받는다고 설명한다. 현 서버/DB 계약은 작업별 `daily_limit`, `taken_today`, 정확한 한도 허용, 초과 거부, member/task concurrency 보호를 사용한다. public/web/mobile/FAQ/schema를 수정하고 `플레이 가능`과 `보상 가능`을 분리한다. 0/부분/정확한한도/+1, 직업·작업 격리, double submit, idempotency, 서울 날짜경계, web/mobile/API parity를 검증한다. 문구에 맞추려고 quota 보호를 되돌리지 않는다.

### REL-104-02 — P0 — OPEN — Production-ready 자동화가 규범적 release evidence보다 적게 증명

현재 release workflow는 exact test SHA, public shop catalog, test `noindex`를 확인하고 immutable image를 provenance/SBOM과 함께 만든 뒤 `production-ready` deployment를 발행한다. 그러나 migration parity/checksum, authenticated synthetic smoke, least-privilege DB 연결, 변경 경제 대사, 파괴적 변경의 current backup/restore, rollback target까지 모두 증명하지 않는다. fail-closed machine-readable `release-evidence`를 추가하고 필수증거가 없으면 `BLOCKED`로 둔다. OPS-107-01 종료 전 stale-green public status를 승격증거로 사용하지 않는다.

### AUTH-105-02 — P1 — TODO — app-auth 이메일 인증문서 stale

실제 verify-email은 originating prelogin cookie/CSRF 의존이 아니라 one-time bearer token 기반 cross-browser/no-cookie 교환이다. 영·한 app-auth guide/schema/catalog/example을 동기화하고 same/cross-browser, invalid/expired/reused token, session rotation, 임의 CSRF, 구클라이언트 동작을 검증한다.

### REL-104-03 — P1 — TODO — 모든 runtime-code main 변경에 required check가 저장소 수준 강제되는지 미확정

protected/no-force main을 유지하고 backend/frontend/database/deploy/security path에는 검토된 runtime-code 통합과 성공 check를 요구하는 최소권한 ruleset을 둔다. docs-only direct-main은 runtime bypass가 되지 않게 actor/path 예외를 최소화한다. v107에서는 connected integration이 branch-protection 세부 API에 접근하지 못했으므로 이미 강제된다고 주장하지 않는다.

## 3. 모든 기능의 필수 초상세 명세 템플릿

모든 기능/backlog는 목적·사용자문제, 대상 actor/권한, 구현상태·코드/문서 근거, user story, 진입경로, 화면/CTA, 상태변화, loading/empty/error/offline/timeout, 최초사용/재방문/comeback, 모바일/태블릿/데스크톱, keyboard/focus/label/contrast/reduced-motion, i18n, email/push/Discord, 데이터모델/소유권, read/write permission, endpoint/method/request/response/error code, idempotency/rate/resource limit, service/business rule, table/index/constraint/transaction/concurrency, audit/metric/admin, feature flag/fallback, backup/recovery 영향, 보안·개인정보·악용, SEO/indexing, analytics/KPI, performance/cache, 수익성·비용, 완료조건, unit/integration/E2E/실DB/security/regression, isolated-test 수용, 운영승격·모니터링·rollback을 기록한다.

## 4. 전 기능 구현상태·제품계약 매트릭스

| 기능군 | 증거/상태 | 권위·UX·API/DB 계약 | 보안·개인정보·악용 | SEO·성장·사업성 | 필수 QA/릴리스 게이트 |
|---|---|---|---|---|---|
| 회원가입/로그인/OAuth/로그아웃/세션 | `IMPLEMENTED/PARTIAL` | provider linking/consent/session issue·rotate·revoke 서버 권위. local register/login은 prelogin+CSRF, verify-email은 one-time bearer. loading/provider-error/consent/session-expired/offline 분리 | credential stuffing, resource limit, OAuth state/nonce/PKCE/exact redirect, secure cookie, fixation/logout, silent email merge 금지 | auth noindex. verified session→activation→D1/D7/D30에서 SMTP/compute/CS/fraud/privacy 비용 차감 | provider collision, replay/fixation/logout, token expiry/reuse/cross-browser, 429, policy/privacy parity. AUTH-105-01 차단 |
| 프로필/계정/보안센터 | `PARTIAL` | profile/linked method/session 서버 권위, 민감변경 recent reauth | account/session BOLA, secret 없는 ATO alert, privacy-minimal, audit | private/auth/noindex, ATO·지원비 절감 | other-user session denial, reauth expiry, terminate-other/all, provider-loss, 접근성 |
| 인벤토리/컬렉션/marketplace workbench | `PARTIAL`; live P2P settlement 미증명 | DB가 item/owner/provenance/entitlement/serial 권위, 향후 listing escrow/cancel/expiry/settlement/fee/reversal 정의 | BOLA/serial leak, duplicate grant, wash trade/collusion/replay | holdings private/noindex, explicit public-safe collection만 공개, WLD sink는 실매출 아님 | ownership concurrency, duplicate entitlement, unauthorized transfer, recovery, private URL leak, wash-trade |
| WLD 상점/catalog | `IMPLEMENTED/PARTIAL` | server-authoritative item/effective price/eligibility/limit/window/entitlement. SKU별 ID/category/value/currency/소모성/테스트가격/promo/window/limit/binding/gift/refund/recovery/sink-source/P2W/KPI/admin 기록 | client 가격 불신, duplicate/replay, fake scarcity, hidden personalized price, P2W·wealth·casino pressure 금지 | 실질 collection page만 index, purchase history private. 경제·리텐션 KPI이지 real revenue 아님 | price tamper, 시간경계, 부족잔액, concurrent purchase, entitlement repair/cache, admin lifecycle |
| 실결제 cart/payment/subscription/ad removal | `UNVERIFIED` | provider 선정 후 order/cart authority, tax, signed receipt/webhook, entitlement, refund/cancel/renewal/grace/idempotency·주요조건 UX 정의 | webhook/receipt forge·replay, BOLA, PCI/provider, chargeback fraud, secret | checkout/order/account noindex, 가격에서 모든 직접·간접비 차감 unit economics | sandbox, duplicate/out-of-order webhook, refund/regrant, renewal/cancel, legal/privacy, SCALE/ITERATE/HOLD/KILL |
| 작업/퀘스트/직업/레벨/보상 | `PARTIAL + P0 content drift` | catalog/duration/cooldown/daily quota/reward/EXP/receipt/unlock 서버·DB 권위, playable vs reward-eligible 분리 | bot/macro, multi-account, replay, clock/reset, concurrent duplicate, ledger | 수정 guide는 game learning으로 index 가능, TTFV/first verified job/D1/D7/inflation | QA-104-01 exact-SHA 실DB matrix 차단 |
| 사업 | `UNVERIFIED/PARTIAL` | inventory/demand/price/cost/fee/tax/management/settlement 정의, 무위험 고정복리 금지, ledger/idempotency | circular demand farming, replay/refund, admin, precision | public 교육 가능, private P&L noindex, retention+sustainable economy | 실DB settlement/reconciliation/concurrency+abuse |
| 은행/대출 | `UNVERIFIED/PARTIAL` | eligibility/source/principal/interest/accrual/repayment/arrears/purpose/recovery 서버 권위 | double repayment, clock/BOLA/multi-account/loss-chasing, 실제 예금·수익보장 암시 금지 | 공개는 simulation 명시, private balance/debt noindex | accrual boundary, concurrent/idempotent repayment, restart/recovery, ledger |
| 가상주식/WDX/watchlist/portfolio/alerts/compare | `PARTIAL` | public market read model과 private holdings 분리, issuance/pricing/trading/settlement 서버 권위 | holdings BOLA, duplicate settlement, manipulation/collusion, phishing alert, integer precision | substantial public-safe symbol만 index, portfolio/watch/orders/alerts noindex | other-user holdings, symbol, large integer, concurrency/replay, alert cooldown/manipulation |
| 카지노/확률형 | `PARTIAL/HIGH-RISK` | 서버 outcome/probability/payout/limit/atomic settlement, same idempotency→same receipt/outcome | RNG/result tamper, replay, limit bypass, bot/multi-account, loss chasing/youth | gameplay/account noindex, 승리 acquisition 금지, 별도 paid model 없으면 real revenue 0 | distribution sanity, replay, limits, concurrency, ledger, legal/product |
| 시즌/live event | `PARTIAL` | start/end/grace/reward 서버 권위, preview는 콘텐츠, catch-up/archive | bot/multi-account farming, collusion, deadline manipulation/fake FOMO | substantial archive만 정확한 date/lastModified로 index | timezone, late entry/catch-up, duplicate reward, archive, notification cooldown |
| 커뮤니티/post/comment/report/block | `PARTIAL` | authorship/edit/delete/mod 서버 권위, deleted/locked/report/block 상태 | spam/bot/harassment/impersonation/doxxing/link/XSS/BOLA/mod abuse | curated board index, 개별 UGC 기본 noindex | other-user mutation, XSS/link, report spam, block, mod audit, 404/410 |
| 친구/클럽/referral | `UNVERIFIED/PARTIAL` | invite lifecycle/role/leave/kick/ban/visibility/attribution/reward maturity | invite spam, fake account/referral fraud, collusion, role escalation/private graph | public club explicit visibility만, reward는 mature milestone 후 cosmetic/prestige/convenience | referral ring, invite replay, role escalation, privacy/block |
| 알림/email/push/Discord | `PARTIAL` | source event/preference-consent/cooldown/dedupe/delivery/canonical deep link 서버 권위 | phishing/ATO imitation, webhook abuse, spam/token leak, balance/debt/security 미포함 | noindex, healthy return에서 provider/opt-out/privacy/CS 비용 차감 | dedupe/cooldown, stale link, opt-out, provider outage/outbox, secret-safe log |
| 검색 | `UNVERIFIED` | public-safe model, member/admin search auth, pagination/no-result/timeout | injection, expensive-query DoS, enumeration, query-log PII | 결과 기본 noindex, curated landing만 예외 | authz, special char, pagination, complexity/rate, relevance |
| 업로드/gallery/file | `PARTIAL/spec-level unless linked code` | decode/type/magic, size/dimension, generated name, isolated storage, authorized delivery, metadata strip | malware/polyglot/path traversal/decompression bomb/remote SSRF/BOLA/EXIF | private noindex, public은 permission/moderation 후 | malformed/polyglot/oversize/unauthorized read/EXIF/storage/restore |
| 공개 home/guide/status/content | `PARTIAL + OPS-107-01 P0` | public read model fail-honest, guide는 server contract 일치, status freshness 서버 권위·stale green 금지 | secret/topology/stack/user state 금지, XSS/phishing, status writer trusted non-browser | `/status` public-noindex, `/guide`는 quota/local-auth copy 해결 전 acquisition HOLD | HTTP/meta/a11y/CWV + guide contract + stale-status synthetic/fail-closed |
| App API/mobile gateway | `PARTIAL/COVERAGE DOCUMENTED` | versioned `/app-api/v1`, stable wrapper, breaking compatibility/version bump | handoff/token replay, BOLA, rate/resource, PII/log | API noindex, mobile activation/D30에서 비용 차감 | snapshot, old client, auth expiry, handoff one-time, error parity, AUTH-105-02 |
| 관리자/audit | `PARTIAL` | high-risk current/proposed/target/impact/reason + reauth/TOTP/DB actor/idempotency/audit | privilege/session theft/CSRF/BOLA/mass/audit tamper | private/noindex, 사고/operator/support 절감 | lower-role, reauth, TOTP, mass, DB privilege/audit, compensation |
| 백업/복구 | `UNVERIFIED CURRENT EVIDENCE`; BAK-106-01 P0 | 9절: RPO/RTO, 독립 암호화 backup, source/version/checksum, isolated restore, app/ledger/object 검증 | key theft/plaintext/shared failure/wrong-env/corrupt-WAL/retention shadow | private/noindex, 직접매출0, expected-loss 회피 | 파괴적 DB 작업은 current independent restore 전 차단, fault-injected drill |
| 분석/실험 | `PARTIAL/SPECIFIED` | pseudonymous subject, analytics session≠auth, versioned schema/retention/assignment/guardrail | PII/secret/reidentification/experiment abuse/sensitive profiling | safe campaign/content ID만 cohort | schema/consent/deletion/deterministic/outbound privacy |
| 광고/sponsorship | `IMPLEMENTED/PARTIAL reviewed public` | substantial public surface만, test off, sponsor/ad를 product CTA처럼 위장 금지 | invalid traffic, click encouragement, youth/privacy targeting, tracker/sponsor confusion | thin index 근거 아님, net ad contribution에서 churn·지원·privacy 비용 차감 | route allowlist, test off, CLS/CWV, ad exit, policy/privacy |
| SEO backend | `PARTIAL` | configured-origin canonical, metadata read model, sitemap/robots/redirect/structured-data/updatedAt/image/crawler/GSC/Naver | private leakage, Host injection, cache poison, PII sitemap/JSON-LD | organic→signup→activation→D7/D30→retained net/CAC | sitemap privacy, canonical injection, redirect, SSR, GSC/Naver, CWV |
| 장애/status/운영 | `PARTIAL + OPS-107-01 P0` | public-safe status와 internal telemetry 분리, 서버 freshness 계산, collector heartbeat/snapshot age/incident/rollback/postmortem 명시 | forged green, stale monitor, topology leak, admin abuse, alert fatigue | trust/support/MTTR, acquisition bait 아님, `/status` noindex | collector/source stop, cache/API/DB outage, mixed states, stale boundary, alert, exact-SHA smoke, rollback/restore |

## 5. 자체 이메일 인증 상세계약

| 단계 | endpoint/권위 | 필수 UX/state | 보안·오류·데이터 계약 |
|---|---|---|---|
| prelogin | `POST /app-api/v1/auth/prelogin-session` | 재개 가능한 pre-auth, retry 가능한 failure | secure prelogin cookie+memory CSRF, secret log 금지 |
| policy | `GET /app-api/v1/auth/policy` | 가입 전 current terms/privacy | server version 권위 |
| consent | `PUT /app-api/v1/auth/consent` | current terms/privacy/age 명시확인 | SessionGuard+CSRF, stale version 재검토 |
| register | `POST /app-api/v1/auth/local/register` | email/password/display name, pending verification, SMTP 장애복구 | prelogin+CSRF+current consent, common-password, normalized email/hash/Argon2id/hashed token, abuse budget |
| verify | `POST /app-api/v1/auth/local/verify-email` | cross-browser 허용, 성공 signed-in | short-lived one-time bearer, SessionGuard/CSRF 비의존, raw token log 금지, consume 후 clean URL |
| login | `POST /app-api/v1/auth/local/login` | unknown/wrong password 동일 공개 class, offline/429/5xx 분리 | prelogin+CSRF, nonexistent dummy work, rate/resource, session rotation |
| viewer/session | `GET /app-api/v1/auth/viewer`, `GET /app-api/v1/auth/session` | client는 server signed-in 결과만 신뢰 | signed-in cookie 권위 |
| logout | `POST /app-api/v1/auth/logout` | offline에서 원격 logout 성공 가장 금지 | signed-in session+CSRF, server revoke |

Verification token page는 noindex/sitemap 제외, `Referrer-Policy: no-referrer` 또는 검증된 동등정책, 교환 전 광고·제3자 analytics·social pixel 금지, query redaction, GET preview/scanner가 token을 소비하지 않음, 교환 후 address/history token 제거를 요구한다. analytics에는 email/hash/password/verifier/token/cookie/CSRF/OAuth/recovery secret을 넣지 않는다.

## 6. SEO 구현계약

### 6.1 경로 정책

- `/`: `PUBLIC_INDEXABLE`, configured-origin canonical, unique title/H1/meta, 사실인 structured data, OG/social, stable image dimension, 실질 internal link.
- `/guide`: QA-104-01과 local-auth password wording 해결 전 `PUBLIC_INDEXABLE_BUT_ACQUISITION_HOLD`; 실제 투자수익이 아닌 game-system beginner intent.
- `/status`: `PUBLIC_NOINDEX`. 신뢰·지원용 공개 접근은 허용하지만 transient 운영상태는 durable 검색콘텐츠가 아니다. robots/header noindex, sitemap 제외, freshness 진실성이 검색노출보다 우선.
- public news/season/collection/world guide: 독창적·실질적·유지관리·public-safe일 때만 stable slug, meaningful `lastModified`, breadcrumb, reviewed metadata로 index.
- `/stocks/[symbol]`: public-safe market/world read model만 index, holdings/watch/orders/alerts/portfolio는 익명 HTML/JSON-LD/shared cache 제외.
- 개별 UGC는 품질·moderation 규칙 전 기본 noindex, 삭제는 404/410+sitemap 제거.
- search/filter/sort/query는 의도적 curated landing 외 canonical/noindex, doorway 금지.
- login/signup/verify/recovery/account/security/wallet/transfer/private bank/business/loan/portfolio/watchlist/alerts/checkout/orders/subscription/admin/moderation/backup/recovery는 auth-required 또는 public-noindex, sitemap 제외.
- test/recovery origin은 전역 noindex, real ads off, sitemap 제출·indexable user data 금지.

### 6.2 SEO 백엔드 backlog

`SeoMetadataReadModel`, Host injection에 안전한 configured-origin canonical builder, authoritative `lastModified`와 URL/byte limit을 지키는 sitemap index/shard, robots generator, JSON-LD allowlist serializer, loop/conflict 검증 301/308 redirect map, image metadata/alt/dimension, locale/hreflang, crawler-log classification, Search Console/Naver 상태수집, crawl/index/canonical/sitemap report, SEO operator read dashboard/API를 구현·테스트한다. HTML/meta/sitemap/redirect cache를 일치시키고 private identity/economy/security state를 public cache key/structured data에 넣지 않는다.

### 6.3 SEO KPI·성능

impression/click/CTR은 진단값이다. 사업 funnel은 `organic visit → qualified interest → signup → activation → D1/D7/D30 → retained contribution/실 net revenue`; organic CAC는 incremental organic D30 retained user당 content/SEO/tooling 비용으로 본다. 대표 public template은 good CWV 목표(LCP ≤2.5s, INP <200ms, CLS <0.1)로 mobile/desktop 회귀검증한다.

## 7. 보안 위협·검증 등록부

| 위험 | 심각도 | 예방·탐지 | 필수 테스트/릴리스 동작 |
|---|---|---|---|
| BOLA/IDOR | HIGH | actor-scoped service/DB authz, client owner ID 불신, 안전한 denial metric | 모든 object API other-user negative test, 실패차단 |
| credential stuffing/session fixation | HIGH | generic auth error, rate/abuse, rotate, secure cookie, reauth/logout, OAuth uniqueness | distributed invalid auth, fixation/logout/state/nonce/PKCE, 원인불명 bypass 차단 |
| 경제 replay/duplicate/concurrency | HIGH | idempotency unique, DB transaction/lock, append-only ledger/reconciliation | parallel/retry/replay/precision/ledger, mismatch 차단 |
| 관리자 악용 | HIGH | session+reauth+TOTP+DB actor+least privilege+impact+audit | lower-role/reauth/TOTP/CSRF/mass/DB privilege, 실패차단 |
| upload/UGC | HIGH | decoded type, isolated storage, encoding/CSP, metadata minimization, moderation | polyglot/malformed/XSS/link/unauthorized |
| analytics/ad/SEO 유출 | MEDIUM/HIGH | outbound allowlist/minimize, URL/structured data에 token/balance/debt/security 금지 | payload/schema/sitemap/JSON-LD scan, HIGH leak 차단 |
| supply chain | MEDIUM/HIGH | 가능한 critical action immutable pin, dependency audit, SBOM/provenance | workflow/dependency regression, unresolved HIGH release policy |
| release-evidence 우회 | HIGH | immutable SHA, machine-readable fail-closed, skip-pass 금지 | prerequisite 의도파손 시 `production-ready` 미발행 |
| backup/key 침해 | HIGH | encryption, key separation, independent medium, least-privilege, audit | unauthorized key/plaintext, HIGH 차단 |
| wrong-environment restore | CRITICAL/HIGH | source/target 식별, isolated DB/namespace, separate credential/outbound | wrong target/Production credential simulation, prod write 가능 차단 |
| backup corruption/WAL gap | HIGH | checksum/manifest, version, full restore, WAL monitor, reconciliation | corrupt/missing WAL/wrong checksum fail+alert |
| multi-account/referral/market manipulation | 경제영향 시 HIGH | maturity/cap, provenance, anomaly/graph | referral ring/wash trade/collusion/duplicate/replay |
| stale/forged 운영상태 | HIGH | trusted status writer, server freshness, collector heartbeat, deployment/migration parity, browser 비권위 | stale boundary, collector stop, stale cache/API/DB, forged writer; false-green이면 status 의존 release 차단 |

password/verifier/session cookie/OAuth code/client secret/bot token/DB password/backup key/raw verification·recovery token과 무제한 request body는 일반 로그에 기록하지 않는다. 보안 이벤트는 pseudonymous ID와 safe classification을 사용한다.

## 8. 수익성·사업성 계약

어떤 기능도 gross revenue만으로 승인하지 않는다. 실결제·광고는 모델, 전환경로, 표시/테스트가격, attach/paid conversion/repeat/renewal 가설, refund/churn/cancel, 실제매출이 있을 때 ARPU/ARPDAU/ARPPU, eCPM/fill/CTR, platform/payment/tax/refund/chargeback, infra/storage/CDN/notification/LLM, content/CS/moderation/fraud/security, gross/contribution margin, CAC, LTV, LTV/CAC, payback, 낙관/기준/보수, D1/D7/D30, 신뢰·규제비용, `SCALE/ITERATE/HOLD/KILL`을 기록한다.

- WLD-only 상점·카지노·은행·주식은 게임경제 활동이며 실매출이 아니다.
- 광고는 `ad revenue - ad-induced churn/session에 따른 LTV 손실 - ad infra/privacy/support/fraud cost`의 순기여로 본다.
- SEO는 impression이 아니라 incremental organic D30 retained user와 CAC 절감으로 평가한다.
- 보안/QA/release/backup/status는 회피된 사고·데이터손실·다운타임·환불·fraud·지원 기대비용으로 평가하고 미측정 금액을 꾸며내지 않는다.
- local auth는 incremental D30 retained contribution에서 SMTP/Argon2/DB/support/fraud/privacy/security 비용을 뺀다.
- 운영상태의 가치는 MTTR·지원·신뢰손실 감소다. false-green board는 상태판이 없는 것보다 해로울 수 있으므로 `stale_operational_violation_count > 0`이면 수정 전 HOLD/KILL 신호다.
- 향후 반복결제는 결제 전 주요조건 고지, affirmative consent, straightforward cancellation을 제공한다. provider 확정 전 수수료는 가설이다.

## 9. 백업·재해복구 계약

### 9.1 복구목표·범위

identity/ledger/content 손실허용도와 비용으로 RPO/RTO를 승인하며 자동화가 숫자를 임의 생성하지 않는다. RPO는 실제 restore 가능한 최신점, RTO는 timed full drill로 측정한다. authoritative PostgreSQL identity/economy/ledger/audit, migration/schema/version manifest/checksum, inventory/entitlement/content, 필요한 object/photo store, application/GitOps version을 백업한다. key/secret recovery는 별도 암호화 control plane이다.

primary host/storage/failure domain 또는 online credential을 공유하는 recovery DB/read replica/snapshot/local dump는 독립 DR이 아니다.

### 9.2 구조와 `VERIFIED_RESTORABLE`

독립/off-host failure domain, transit/rest encryption, key separation+recovery test, least-privilege backup identity, 별도 restore credential, source env/DB/app/migration/tool/time/backup-ID/checksum/retention metadata, capacity monitor, controlled deletion/tamper resistance를 요구한다. 목표에 따라 logical dump, physical base backup, PITR 또는 조합을 사용한다.

검증은 `clean isolated target → identity → decrypt/key/checksum/manifest → full DB restore/PITR target → migration parity → Production outbound off least-privilege app smoke → referential checks → ledger/balance reconciliation → inventory/entitlement/provenance → object sample → email/Discord/webhook/ads/indexing off → recoverable point/RTO 측정 → evidence/audit → controlled disposal/retention`을 모두 완료해야 한다. 파일 존재, checksum, `pg_restore -l`, recovery replica만으로는 부족하다.

### 9.3 release evidence·보안·QA

파괴적/schema-changing 작업에는 candidate SHA, backup ID/source, failure-domain, encryption/key, checksum/manifest, restore drill, RPO/RTO, migration parity, ledger/balance, object sample, rollback target, operator/audit, evidence freshness를 요구한다. missing/stale/corrupt/wrong-key/wrong-env/WAL-gap/reconciliation-failed/untested는 `BLOCKED`다.

backup/recovery artifact는 private/auth/noindex/sitemap 제외. stale/failed backup, checksum/decrypt/capacity/restore/reconciliation/WAL failure를 alert하고 missing/corrupt archive, wrong key, storage full, wrong target, Production credential을 fault-inject한다. 직접매출은 0이며 KPI는 freshness, independent-copy, verified restore, measured RPO/RTO, drill failure, expected loss avoided다.

## 10. QA·테스트환경·배포·관측·롤백

모든 중요 이슈는 severity, 최초발견, 최근재현, 재현절차, 영향 사용자/기능, 증거, 원인가설/확정원인, FE/BE/API/DB/infra 대상, 구체설계, migration, rollback, unit/integration/E2E/실DB/security/regression, test acceptance, Production promotion, monitoring, 상태, 담당순서를 기록한다. 반복 BLOCKED는 원인제거 항목으로 승격하고 CRITICAL/HIGH가 기능보다 먼저다.

### 10.1 candidate/release 순서

`new branch → lint/type/unit/integration/real-DB/security → immutable candidate+SBOM/provenance(해당 시) → isolated exact-SHA → migration checksum/parity → backend/DB least-privilege smoke → authenticated synthetic → changed-feature E2E/abuse → 필요한 restore/rollback release evidence → main 통합 → exact-main-SHA test → Production-ready → GitOps Production → HTTP/API/auth/user-flow/log/resource/status-freshness smoke → monitor/rollback`.

Test는 namespace/DB 격리, indexing off, real ads off. 증거 없음은 pass가 아니다. test/recovery는 Production email/Discord/webhook을 보내거나 Production 데이터를 변경하지 않는다.

### 10.2 관측 guardrail

API 4xx/5xx, auth/ATO, DB pool/transaction, migration parity, ledger reconciliation, duplicate reward/quota, entitlement, outbox/provider, ad-exit/CWV, crawl/index, backup freshness/restore, deployment/rollback과 함께 **collector heartbeat, source snapshot age, stale-green violation**을 관측한다. 모니터링 데이터 부재를 정상으로 간주하지 않는다.

## 11. UX·활성화·리텐션·운영

첫 방문은 하나의 가치와 game-only 경계를 먼저 설명한다. Activation은 방문→이해→sample/value→contextual signup→첫 의미 있는 검증행동→결과/보상→다음 목표다. D1 exact thread, D3 real change/no-change, D7 coherent progression/collection/project/learning, D14 optional breadth, D30 durable history/identity/collection을 목표로 한다. punitive streak, loss-threat FOMO, 과도한 알림을 피하고 catch-up/comeback을 제공한다.

공유는 public-safe achievement/collection/project/season/learning result 중심이며 URL에는 token/private holdings/balance/debt/casino/recovery/security/PII를 넣지 않는다. referral은 fraud-resistant maturity 후 cosmetic/prestige/convenience를 우선한다.

관리자/CS는 dispute/refund/report/abuse queue, feature flag, fallback/rollback, 안전한 incident message, audit를 정의한다. 고위험 account/economy action은 명확한 confirmation과 anti-phishing UX를 사용한다. status/incident UX는 증거 부재를 green health로 바꾸지 않는다.

## 12. 외부 레퍼런스 판정 — 2026-09-15 v107 갱신

- Kubernetes 최신 liveness/readiness/startup probe 문서: **운영원칙 직접채택**. readiness는 서비스 가능 여부를 계속 평가하며 unavailable/unready를 healthy로 간주하지 않는다. Moneyverse public status는 별도 사용자 기능이지만 freshness는 같은 fail-honest 원칙을 따른다.
- Google Cloud Monitoring missing-data/metric-absence 문서: **관측원칙 직접채택**. fresh monitoring data 부재를 명시적으로 모델링한다. collector/source absence를 자동 healthy로 바꾸지 않는다.
- OWASP API Security Top 10, 특히 API4 Unrestricted Resource Consumption: **보안 baseline 직접채택**. auth/provider/resource budget, expensive query와 status/monitor abuse에 적용한다.
- PostgreSQL 최신 `pg_verifybackup`·continuous archiving/PITR: **해당 시 직접채택**. manifest/checksum/WAL evidence와 full restore를 요구한다.
- CISA StopRansomware: **복원력 지침 직접채택**. 독립/offline 가능한 암호화 backup과 정기 recovery test.
- Google Search Central/Naver Search Advisor: **직접채택**. canonical/index/sitemap/noindex/public content 품질. `/status`는 transient 운영콘텐츠이므로 public-noindex 유지.
- 개인정보보호위원회 현재 개인정보처리방침 자료: **고지설계 지침 직접채택**. 실제 auth/analytics 처리와 public policy를 일치시킨다.
- FTC 2026 subscription 집행·rulemaking: **참고+제품 guardrail**. 향후 반복결제에서 주요조건 고지, 명시동의, 쉬운해지를 요구하되 특정 미국규칙이 모든 거래에 자동 적용된다고 단정하지 않는다.

## 13. 현재 증거·통합 기록 — v2026.09.15.107

- 시작·중간 `main`: `2201b812716d78303388bb838258220a5033d694`. v107 쓰기 전 외부 동시 commit을 관찰하지 않았다.
- Fresh Production runtime 확인 가능. 2026-09-15 07:05 KST `/status`는 모든 서비스 정상이라고 표시했으나 웹/API/원장 DB 세 source가 모두 04:06 KST snapshot이고 페이지는 30초 수집주기·오래된 기록 `확인 중`을 명시했다. 이에 `OPS-107-01`을 신규 P0로 등록했다.
- 저장소 코드는 frontend가 API state를 신뢰하고 migration 013 `content_public_status()`는 `stale_after_seconds` 초과 snapshot을 `unknown`으로 바꾸도록 설계돼 있다. 따라서 현재 runtime이 repository freshness 계약을 위반하고 있으며 Production DB/deploy/collector를 확인하기 전 원인은 미확정이다.
- Fresh `/guide`는 직업작업 unlimited full reward와 `Discord 또는 Google`/별도 비밀번호 없음 문구를 계속 포함해 `QA-104-01`, `AUTH-105-01`이 OPEN이다.
- Fresh `/privacy`는 public version 2026-09-02 기준 OAuth 중심이며 local email/password credential 처리를 설명하지 않아 `AUTH-105-01` rollout block을 유지한다.
- issue #139는 OPEN이고 더 최신 backup host 직접증거가 없어 `BAK-106-01` P0 유지.
- 시작 SHA의 connected combined status와 사용 가능한 PR-triggered workflow run 조회는 비어 있어 CI/test-server pass를 주장하지 않는다. branch-protection API는 integration 403이라 `REL-104-03`이 해결됐다고 가정하지 않는다.
- `deploy.yml`은 현재 immutable action SHA와 SBOM/provenance build를 사용하지만 test gate는 exact SHA+public catalog+test noindex까지만 직접 증명하므로 `REL-104-02`는 OPEN이다.
- 신규 P0: `OPS-107-01`. 유지 P0: `BAK-106-01`, `AUTH-105-01`, `QA-104-01`, `REL-104-02`. 유지 P1: `AUTH-105-02`, `REL-104-03`.
- v107은 기획/문서만 변경한다. 런타임 코드, DB schema/data, collector, backup medium, 인프라, secret, branch rule, 보안 구현은 변경하지 않는다.
