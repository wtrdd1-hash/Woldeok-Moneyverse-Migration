# 월덕 머니버스 — Living Project Plan

> **문서 상태:** Living specification / 현재 권위 통합기획서
> **최초 기준:** 2026-08-26
> **현재 통합 버전:** v2026.09.15.106
> **구현·증거 동기화:** 2026-09-15
> **영문 기준 문서:** [PROJECT_PLAN.md](PROJECT_PLAN.md)

과거 상세 변경은 Git 이력과 버전별 changelog/worklog에서 복구할 수 있다. 이 문서는 현재 구현을 위한 권위 계약이다. 다른 개발자나 AI가 과거 초안을 현재 사실로 추정하지 않고 이 문서만으로 기능 범위, 권위 경계, 데이터 흐름, 실패 상태, 보안, SEO, 사업성, QA, 배포·롤백 조건을 이해할 수 있어야 한다.

## 0. 유지관리·증거 원칙

1. 중요한 기획은 외부 레퍼런스 조사 후 작성한다. 최신 공식 제품/플랫폼 문서, OWASP·보안기관, 정부·규제기관 자료와 최신 실제 운영증거를 우선한다.
2. 계약을 바꾸기 전 최신 `main`, 영문 canonical, 한국어 대응본, 최신 QA/worklog, CI/배포 자동화, 런타임 증거, 관련 코드·migration을 확인한다.
3. 작업 중간과 통합 직전에 `main`을 다시 확인한다. 동시 변경을 보존하며 문서 자동화에서 `main` force-push를 사용하지 않는다.
4. 구현증거 상태는 `IMPLEMENTED`, `PARTIAL`, `UNVERIFIED`, `REDESIGN_REQUIRED`로 구분한다. 기획서나 과거 screenshot만으로 현재 런타임 완료를 주장하지 않는다.
5. CI·테스트·런타임 증거가 없으면 `verification unavailable`이다. 통과로 추정하지 않는다. 고위험 승격은 fail-closed다.
6. 적용된 DB migration은 불변이다. 수정은 새 번호 migration으로 한다. 경제 이력은 append-only이며 잘못된 거래는 보정거래로 교정한다.
7. 실측되지 않은 사업수치는 `가설` 또는 `테스트 기준`으로 표기한다. WLD 활동을 실화폐 매출로 계산하지 않는다.
8. 실제 런타임 구현은 별도 흐름 `브랜치 → 정적/단위/통합/실DB/보안 테스트 → immutable candidate → isolated exact-SHA 테스트서버 → backend/API/DB/사용자흐름 QA → main 통합 → exact-main-SHA release gate → 운영승격 → 운영 smoke/관측 → 필요 시 rollback`을 따른다.

## 1. 제품·시스템 불변 경계

월덕 머니버스는 웹과 Discord를 연결하는 커뮤니티형 가상경제·게임 플랫폼이다. 사용자는 인증, WLD 획득·소비, 작업·퀘스트·직업 성장, 수집·아이템, 가상 사업, 가상 은행·대출, 가상 주식, 커뮤니티·소셜, 확률형 게임 기능을 이용한다.

WLD, WDX/가상 주식, 은행잔액, 대출, 카지노 플레이, 보상 및 관련 수치는 **게임·시뮬레이션 내부 데이터**다. 현금환전, 실제 증권, 실제 예금, 보장수익, 외부 경품, 투자수익, 실제 도박상품을 약속하지 않는다. 향후 실제 금전·금융·도박 가치와 연결하는 변경은 별도 제품·법률 재설계이며 본 기획의 기존 승인을 승계하지 않는다.

현재 기술 기준은 Next.js 프론트엔드, NestJS API, PostgreSQL 권위 데이터/경제/권한 경계, 민감경로의 `SECURITY DEFINER` 함수, 최소권한 애플리케이션 DB role, append-only 이중분개 원장, 가치변경 요청의 idempotency, 외부전달의 post-commit outbox다.

### 1.1 경제 불변규칙

모든 가치변경은 actor·정책·eligibility·limit·idempotency를 검증하고 필요한 원장 posting, 파생잔액, 감사/outbox를 원자적으로 기록한다. 차변·대변은 대사되며 허용되지 않는 음수잔액은 transaction 경계에서 방지한다. 금액은 정수·문자열 안전계약으로 저장·전송하며 권위 WLD를 unsafe JavaScript `Number`로 변환하지 않는다. 오류교정은 원거래 참조 보정거래로 하며 과거 원장을 수정·삭제하지 않는다.

### 1.2 보안 기준

OWASP ASVS 5.0.0과 OWASP API Security Top 10을 검증 기준으로 사용하되 인증·준수 완료를 의미하지 않는다. 필수 교차통제는 OAuth/OIDC `state`/`nonce`/PKCE/exact redirect, 안전한 세션 회전·폐기, recent reauth, CSRF, BOLA/IDOR negative authorization, XSS/output encoding, SQLi/SSRF/path traversal/command injection 방어, 실제 파일형식 검증, rate/resource abuse control, DB least privilege, CORS/CSP/security header, secret 관리, dependency/supply-chain, container/Kubernetes hardening, 암호화된 복구가능 백업, append-only audit, 개인정보 최소화·보유·삭제, secret-safe logging이다.

### 1.3 관리자 경계

현재 모델은 mandatory 2인 승인이 아닌 **단일 `superadmin` + 보완통제**다. 민감작업에는 `AdminSessionGuard`, recent `ReauthGuard`, TOTP/`SecondFactorGuard`, DB actor 재검증, least privilege, impact preview, 사유기록, 필요한 경우 idempotency, append-only audit를 적용한다. 최고관리자도 보호된 경제·감사 이력을 직접 재작성하지 않는다. 조회전용 화면은 불필요한 step-up을 줄일 수 있으나 적절한 관리자 세션·권한은 필수다.

## 2. 현재 우선순위·릴리스 차단 등록부

우선순위는 `P0 데이터손실/보안/인증/권한/자산중복/경제악용/운영장애/DB무결성/승격증거` → `P1 주요 사용자 오류/핵심완성도` → `P1 상점/결제/수익화` → `P1 SEO/유입` → `P2 리텐션/성장` → `P2 UX/접근성` → `P3 장기확장`이다.

### BAK-106-01 — P0 — OPEN — 독립 백업 + 성공 restore 증거 부재

- 최초 근거: 2026-09-09 열린 GitHub issue #139가 2026-09-15에도 OPEN. 마지막 직접점검에서 지정 `/mnt/backup`(`/dev/sda1`)이 read-only였고, 별도매체에서 관찰된 최신 파일은 2026-09-07이며 Kubernetes 시대 최신 자동백업이 관찰되지 않았다. 응급 PostgreSQL custom-format dump는 SHA-256·`pg_restore -l`을 통과했지만 같은 시스템 디스크에 있었다.
- recovery worklog는 `moneyverse_recovery`가 복구/검사용 편의수단이며 암호화 독립매체 백업을 대체하지 않는다고 명시한다.
- 영향: host/storage 전체손실 시 identity/session/economy/ledger/audit/inventory/entitlement/object 데이터와 분쟁·복구 역량이 훼손될 수 있다.
- 규칙: 현재 독립복구 가능한 백업과 성공 restore 증거가 없으면 파괴적 또는 schema/data-changing 운영작업을 차단한다. 문서-only 변경은 제외한다.
- 종료조건: 9절의 독립백업 구조, full restore drill, 모니터링, machine-readable release evidence가 실제 구현·검증되고 최신상태여야 한다.

### AUTH-105-01 — P0 — OPEN / PUBLIC LOCAL-AUTH ROLLOUT HOLD

현재 코드·migration·모바일 계약에는 local email 가입/인증/로그인, Argon2id/email-hash/token-hash 처리가 존재하지만 현재 공개 web login/guide/privacy 근거는 OAuth 중심이다. 개인정보처리방침·policy version·동의·보유/삭제/credential 제거·SMTP/processor 사실·보안통제·token 링크 개인정보 보호·exact-SHA 테스트·rollback이 맞기 전 신규 local registration을 일반 홍보·공개하지 않는다. endpoint가 이미 존재한다면 정상 기존 identity를 파괴적으로 비활성화하지 말고 실제 노출상태를 먼저 확인한다.

### QA-104-01 — P0 — OPEN — 직업작업 quota 공개안내와 권위동작 불일치

공개 가이드는 직업작업을 무제한 반복하고 매번 WLD/EXP 전액 지급한다고 설명하지만 현 서버/DB 계약은 작업별 `daily_limit`, `taken_today`, 정확한 한도 허용, 초과 거부, member/task concurrency 보호를 사용한다. public/web/mobile/FAQ/schema 예시를 수정하고 `플레이 가능`과 `보상 가능`을 분리한다. 0/부분/정확한 한도/+1, 직업·작업 격리, double submit, idempotency, 서울 날짜경계, API/web/mobile parity를 검증한다. 문구를 맞추기 위해 quota 보호를 되돌리지 않는다.

### REL-104-02 — P0 — OPEN — Production-ready 자동화가 규범적 release evidence보다 적게 증명

현재 release workflow에는 exact SHA, test, public catalog, noindex 증거가 있으나 본 기획은 migration parity/checksum, authenticated synthetic smoke, least-privilege DB connectivity, 변경경제 invariant/reconciliation, 파괴적 변경의 backup/restore 증거, rollback target까지 요구한다. `production-ready` 전에 fail-closed machine-readable `release-evidence` 단계를 추가한다. synthetic identity/필수증거 부재는 `BLOCKED`이며 skip-pass가 아니다.

### AUTH-105-02 — P1 — TODO — app-auth 이메일 인증문서 stale

실제 verify-email은 originating prelogin cookie/CSRF 의존이 아니라 one-time bearer token을 사용하는 cross-browser/no-cookie 교환이다. 영·한 app-auth guide/schema/catalog/example을 동기화하고 same/cross-browser, invalid/expired/reused token, session rotation, 임의 CSRF, 구클라이언트 동작을 검증한다.

### REL-104-03 — P1 — TODO — 모든 runtime-code main 변경에 required check가 저장소 수준 강제되지 않음

protected/no-force main을 유지하고 `backend/`, `frontend/`, `packages/database/`, deploy manifest, security script에는 승인된 runtime-code 통합과 성공 check를 요구하는 최소권한 ruleset을 둔다. docs-only direct-main 자동화는 유지하되 runtime bypass가 되지 않도록 path/actor 예외를 최소화한다. sandbox에서 failing PR/direct push 거부와 승인 자동통합 성공을 검증한다.

## 3. 모든 기능의 필수 초상세 명세 템플릿

모든 기능/backlog는 구현근거와 함께 다음을 빠짐없이 기록한다: 목적·사용자문제, 대상 actor/권한, 구현상태, user story, 진입경로, 화면 구성/CTA, 상태변화, loading/empty/error/offline/timeout, 최초사용/재방문/comeback, 모바일/태블릿/데스크톱, keyboard/focus/label/contrast/reduced-motion, i18n, email/push/Discord, 데이터모델/소유권, 읽기/쓰기 권한, endpoint/method/request/response/error code, idempotency/rate/resource limit, service/business rule, table/index/constraint/transaction/concurrency, audit/metric/admin, feature flag/fallback, backup/recovery 영향, 보안·개인정보·악용, SEO/indexing, analytics/KPI, latency/cache/performance, 수익성·비용, 완료조건, unit/integration/E2E/실DB/security/regression, isolated-test 수용, 운영승격·모니터링·rollback.

## 4. 전 기능 구현상태·제품계약 매트릭스

| 기능군 | 증거/상태 | UX·권위·데이터·API/DB 계약 | 보안·개인정보·악용 | SEO·성장·사업성 | 필수 QA/릴리스 게이트 |
|---|---|---|---|---|---|
| 회원가입/로그인/OAuth/로그아웃/세션 | `IMPLEMENTED/PARTIAL`; Nest auth/provider/local slice 문서근거 | provider linking, consent, session 발급/회전/폐기 서버 권위. client는 loading/provider error/consent/session-expired/offline을 구분하고 local state만으로 로그인 판정하지 않는다. local register/login은 prelogin+CSRF, verify-email은 one-time bearer token | credential stuffing/resource limit, OAuth state/nonce/PKCE/exact redirect, secure cookie, fixation rotation, logout invalidation, secret URL/log 금지, email 유사성만으로 local/OAuth merge 금지 | auth page noindex. verified session→meaningful activation→D1/D7/D30. local auth 가치는 D30 증가분에서 SMTP/compute/CS/fraud/privacy비용 차감 | guard/DTO, state replay, fixation/logout, provider collision, token expiry/replay/cross-browser, 429, secret scan, policy/privacy parity. AUTH-105-01이 일반공개 차단 |
| 프로필/계정/보안센터 | `PARTIAL` | profile/linked method/session list 서버 권위. 민감변경 recent reauth. 다른 세션 종료·복구 상태 명확화 | account/session ID BOLA, secret 없는 ATO 알림, privacy-minimal default, security audit | private/auth/noindex. ATO·지원비 감소와 신뢰가 가치 | other-user session denial, reauth expiry, terminate sessions, provider-loss recovery, 반응형/접근성 |
| 인벤토리/컬렉션/marketplace workbench | `PARTIAL`; holdings/curation slice 존재, live P2P settlement 미가정 | DB가 item/owner/provenance/entitlement/serial 권위. empty/error/offline에서 holdings 생성 금지. 향후 listing은 escrow/cancel/expiry/settlement/fee/reversal 정의 | BOLA/serial leakage, duplicate grant, multi-account wash trade/collusion, replay | holdings private/noindex, opt-in public-safe collection만 공개. WLD 소비는 sink이지 실매출 아님. acquire→use→curate→reuse | ownership concurrency, duplicate entitlement, unauthorized transfer, recovery, private URL leak, wash-trade |
| WLD 상점/catalog | `IMPLEMENTED/PARTIAL` public catalog/store | item/effective price/eligibility/limit/sale window/entitlement 서버 권위. 가격·통화·소유·중복·deadline·receipt 명확화, retry idempotent. 각 SKU는 ID/name/category/설명/대상/가치/WLD-vs-real/소모성/가격가설/promo/재고·기간/limit/binding/gift/refund/recovery/sink-source/P2W/KPI/admin lifecycle 기록 | client 가격 불신, duplicate grant/replay, fake/resetting scarcity, hidden personalized pricing, P2W/wealth/casino pressure 금지 | 실질 editorial collection만 index, purchase history private. WLD unit economics는 경제건전성/리텐션이며 real revenue 아님 | price tamper, 시간경계, 부족잔액, double click/concurrent purchase, entitlement repair/cache, admin deactivate/reactivate |
| 실결제 장바구니/결제/구독/광고제거 | `UNVERIFIED`; WLD shop으로 추정 금지 | 구현 전 provider, order/cart authority, tax, receipt/webhook signature, entitlement source, cancel/refund/renewal/billing recovery/idempotency 확정. 결제 전 반복조건 명확히, 해지 단순 | receipt/webhook forgery/replay, order BOLA, PCI/provider 경계, refund/chargeback fraud, signature secret | checkout/order/account noindex. displayed price에서 tax/platform/payment/refund/chargeback/content/CS/moderation/fraud/infra 차감 | sandbox, duplicate/out-of-order webhook, refund/regrant, renewal/cancel/grace/recovery, legal gate, SCALE/ITERATE/HOLD/KILL 사전정의 |
| 작업/퀘스트/직업/레벨/보상 | `PARTIAL + P0 content drift` | catalog/min duration/cooldown/daily quota/reward/EXP/receipt 서버·DB 권위. 남은 보상횟수/다음 unlock, playable vs reward-eligible 분리 | bot/macro, multi-account, replay, clock/reset, concurrent duplicate, ledger reconciliation | 수정된 guide는 game-system 학습목적으로 index 가능. TTFV/first verified job/D1/D7/reward inflation | QA-104-01 exact-SHA 실DB matrix가 차단조건 |
| 사업 | `UNVERIFIED/PARTIAL` | inventory/demand/sale price/cost/fee/tax/management/settlement 정의, 무위험 고정복리 금지, 모든 가치이동 ledger/idempotency | circular/multi-account demand farming, refund/replay, admin manipulation, precision | public 교육페이지 가능, private P&L noindex. nominal WLD profit보다 retention+sink/source | 실DB settlement/reconciliation/concurrency+abuse simulation |
| 은행/대출 | `UNVERIFIED/PARTIAL` | eligibility/source-of-funds/principal/interest-accrual/repayment/minimum/arrears/purpose/recovery 서버 권위. loan source가 uncontrolled mint가 아니어야 함 | double repayment, clock abuse, BOLA, multi-account, loss-chasing 금지, 실제 예금안전/수익보장 암시 금지 | 공개교육은 game/simulation 표시, private balance/debt noindex | accrual boundary, idempotent/concurrent repayment, insufficient funds, restart/recovery, ledger reconciliation |
| 가상주식/WDX/watchlist/portfolio/alerts/comparison | `PARTIAL`; detail/watch/compare/alert slice 근거 | public market read-model과 private holdings 분리. issuance/pricing/trading/settlement/market rule 서버 권위. URL에는 public symbol/compare state만 허용 | holdings BOLA, duplicate settlement, manipulation/collusion, alert spam/phishing, integer precision | substantial public-safe `/stocks/[symbol]`만 index, portfolio/watchlist/orders/alerts private/noindex. discovery→activation→D7 | other-user holdings, symbol validation, large integer, settlement replay/concurrency, alert cooldown, manipulation |
| 카지노/확률형 | `PARTIAL/high-risk` | 서버 outcome, 공개 probability/payout/limit, atomic settlement, 동일 idempotency key는 동일 receipt/outcome | RNG/result tamper, replay, limit bypass, bot/multi-account, loss chasing/youth risk. 현금환전/외부경품 금지 | gameplay/account history noindex, 승리약속 acquisition 금지. 별도 paid model 없으면 real revenue 0 | distribution sanity, deterministic replay, limit/max-loss, concurrency, ledger, 법률/제품검토 |
| 시즌/live event | `PARTIAL/기획+calendar slice` | start/end/grace/reward eligibility 서버 권위, preview는 콘텐츠일 뿐 권위시간 아님, catch-up/archive | bot/multi-account farming, collusion, deadline 조작/fake FOMO | substantial season/archive는 정확한 date/lastModified로 index 가능 | timezone boundary, late entry/catch-up, duplicate reward, archive transition, notification cooldown |
| 커뮤니티/post/comment/report/block | `PARTIAL` | authorship/edit/delete/moderation 서버 권위, deleted/locked/report/block feedback 명확화 | spam/bot/harassment/impersonation/doxxing/malicious link/stored XSS/BOLA/mod abuse | curated board index 가능, 개별 UGC는 품질규칙 전 기본 noindex, 미검토 detail 광고 금지 | other-user edit/delete, XSS/link, report spam, block, mod audit, 404/410/index removal |
| 친구/클럽/referral | `UNVERIFIED/PARTIAL` | invite lifecycle/member role/leave/kick/ban/visibility/attribution/reward maturity | invite spam, fake account/referral fraud, collusion, role escalation, private membership leakage. reward는 fraud-resistant milestone 후 cosmetic/prestige/convenience 중심 | public club은 explicit visibility만, private graph search/share 유출 금지 | multi-account/referral ring, invite replay, role escalation, privacy/block |
| 알림/email/push/Discord | `PARTIAL` | source event/preference-consent/cooldown/dedupe/delivery/canonical deep link 서버 권위. 민감 balance/debt/security state 미포함 | phishing/ATO imitation, webhook abuse, spam/token leakage | noindex. incremental healthy return에서 provider/opt-out/spam/privacy/support 비용 차감 | dedupe/cooldown, revoked/stale link, opt-out, provider outage/retry/outbox, secret-safe logs |
| 검색 | `UNVERIFIED` | public-safe read model, private/admin search 명시 auth, parsing/pagination/empty/timeout | injection, expensive-query DoS, enumeration, query-log PII | 결과페이지 기본 noindex, 의도적 curated landing만 예외 | auth, special char, pagination stability, complexity/rate, relevance regression |
| 업로드/gallery/file | `PARTIAL/spec-level unless code linked` | decode/type/magic-byte, size/dimension, generated name, isolated storage, authorized delivery, 필요시 EXIF strip | malware/polyglot/path traversal/decompression bomb/remote-fetch SSRF/BOLA/metadata | private media noindex, public은 permission/moderation 후 stable safe URL/alt/dimension | malformed/polyglot, oversize, unauthorized read, EXIF, storage failure/restore |
| 공개 home/guide/status/content | `IMPLEMENTED public slices` | public read model은 정직하게 fail, status measurement age, guide/help는 server contract와 일치 | secret/topology/stack trace/user state 금지, XSS/phishing | original/substantial이면 canonical/indexable. `/guide`는 QA-104-01과 local-auth wording 해결 전 acquisition HOLD | HTTP/status/meta/canonical/structured data/accessibility/CWV/content-contract |
| App API/mobile gateway | `PARTIAL/COVERAGE DOCUMENTED` | versioned `/app-api/v1`, stable wrapper/shape, one-time server-verified handoff, breaking은 compatibility/version bump | token/handoff replay, BOLA, resource abuse, PII/log masking | API noindex. mobile activation/D30에서 support/infra/fraud 비용 차감 | contract snapshot, old client, auth expiry, handoff one-time, error parity, AUTH-105-02 |
| 관리자/audit | `PARTIAL/implemented controls` | read/risky write 분리, high-risk는 current/proposed/target/impact/reason+reauth+TOTP+DB actor+idempotency/audit | privilege escalation/session theft/CSRF/BOLA/mass action/audit tamper, single-superadmin residual | private/noindex. 사고/operator/support 절감 | lower-role, stale reauth, invalid TOTP, impact preview, mass bounds, DB privilege/audit, compensation |
| 백업/복구 | `UNVERIFIED CURRENT EVIDENCE`; BAK-106-01 P0 | 9절 권위: 명시 RPO/RTO, 독립 암호화 backup, source/version/checksum, isolated restore, app/ledger/object 검증 | key theft/plaintext/shared failure domain/wrong-env/corrupt-WAL-gap/retention shadow | private/noindex. 직접매출 0, data-loss/downtime 회피 | 파괴적 DB change는 current independent restore 증거 전 차단. full fault-injected restore drill |
| 분석/실험 | `PARTIAL/SPECIFIED` | pseudonymous subject, analytics session≠auth secret, versioned schema/retention/experiment assignment/guardrail | PII/secret/reidentification/experiment abuse/sensitive profiling | safe campaign/content ID만 downstream cohort 연결 | schema validation, consent/deletion, deterministic assignment, outbound privacy scan |
| 광고/sponsorship | `IMPLEMENTED/PARTIAL reviewed public placement` | approved substantial public surface만, 운영 reviewed enable, test forced off, 제품 CTA로 위장 금지 | invalid traffic/click encouragement/youth/privacy targeting/tracker leakage/sponsor confusion | 광고가 thin page index 근거가 아님. `net ad contribution = revenue - churn/session/support/privacy/fraud` | route allowlist, test off, CLS/CWV, ad-exit, invalid traffic/policy/privacy |
| SEO backend | `PARTIAL` | configured-origin canonical, public `SeoMetadataReadModel`, dynamic sitemap shards/robots/redirect/structured data/updatedAt/image/crawler/GSC/Naver | private leakage, Host injection, cache poisoning, PII sitemap/JSON-LD, admin exposure | organic→signup→activation→D7/D30→net retained value, organic CAC | sitemap privacy, canonical injection, redirect loop, SSR, GSC/Naver, CWV |
| 장애/status/운영 | `PARTIAL` | public-safe status와 internal telemetry 분리, severity/start/update/resolve/impact/owner/rollback/postmortem | topology/secret 과노출, fake status, admin abuse, alert fatigue | trust/support/MTTR 기능, acquisition bait 아님 | dependency outage, stale status, alert route, rollback/restore drill, public-safe copy |

## 5. 자체 이메일 인증 상세계약

| 단계 | endpoint/권위 | 필수 UX/state | 보안·오류·데이터 계약 |
|---|---|---|---|
| prelogin | `POST /app-api/v1/auth/prelogin-session` | 재개 가능한 pre-auth, retry 가능한 서비스오류 | secure prelogin cookie + memory CSRF, secret log 금지 |
| policy | `GET /app-api/v1/auth/policy` | 가입 전 current terms/privacy | server version authoritative, client hard-code 금지 |
| consent | `PUT /app-api/v1/auth/consent` | current terms/privacy/age 명시동의 | SessionGuard+CSRF, stale version 재검토, silent consent 금지 |
| register | `POST /app-api/v1/auth/local/register` | email/password/display name, typo 도움, pending verify, SMTP 장애 복구 | prelogin+CSRF/current consent, generic public semantics, common-password policy, normalized email/hash/Argon2id verifier/display name/hashed token, abuse budget |
| verify | `POST /app-api/v1/auth/local/verify-email` | cross-browser link 가능, 성공 signed-in | one-time short-lived bearer token 권위, SessionGuard/CSRF 의존 없음, raw token log 금지, consume 후 clean URL |
| login | `POST /app-api/v1/auth/local/login` | unknown email/wrong password 동일 공개 class, offline/429/5xx 구분 | prelogin+CSRF, nonexistent dummy password work, rate/resource control, session rotation |
| viewer/session | `GET /app-api/v1/auth/viewer`, `GET /app-api/v1/auth/session` | client는 server signed-in 결과만 신뢰, stale consent 재동의 | signed-in cookie authoritative |
| logout | `POST /app-api/v1/auth/logout` | offline에서 원격 logout 성공 가장 금지 | signed-in session+CSRF, server revoke/audit |

Verification token URL/page는 noindex/X-Robots, sitemap 제외, `Referrer-Policy: no-referrer` 또는 검증된 동등정책, 교환 전 광고·제3자 analytics·social widget·marketing pixel 금지, query 로그 redaction, GET preview/scanner가 token을 소비하지 않음, 교환 후 주소창/history에서 token 제거를 요구한다. 제품 analytics에는 pseudonymous coarse state만 기록하고 email/hash/password/verifier/token/cookie/CSRF/OAuth code/recovery secret은 금지한다.

## 6. SEO 구현계약

### 6.1 경로 정책

- `/`: `PUBLIC_INDEXABLE`, configured-origin canonical `/`, 고유 title/H1/meta, 사실일 때만 Organization/WebSite markup, OG/social, 안정적 image dimension, 실질 콘텐츠 내부링크.
- `/guide`: QA-104-01과 local-auth password wording이 정확해질 때까지 `PUBLIC_INDEXABLE_BUT_ACQUISITION_HOLD`. 실제 투자수익 키워드가 아닌 game-system beginner intent.
- `/status`: 진실한 서비스상태 정보일 때 public canonical 가능. 검색유입보다 안전·신뢰 우선.
- public news/season/collection/world guide: 독창적·실질적·유지관리되는 경우 안정 slug, author/review/update, breadcrumb, 의미 있는 `lastModified`로 index.
- `/stocks/[symbol]`: public-safe stock/world read model만 index. holdings/watch/orders/alerts/portfolio는 익명 HTML/JSON-LD/shared cache 금지.
- community: moderated/substantial board index만 index. 개별 UGC는 문서화된 품질규칙 전 기본 noindex. 삭제콘텐츠는 404/410+sitemap 제거.
- search/filter/sort/pagination/query: 큐레이션된 stable landing 외 canonical/noindex, doorway 생성 금지.
- login/signup/verify/recovery/account/security/wallet/transfer/private business/bank/loan/portfolio/watchlist/alerts/checkout/orders/subscription/admin/moderation/backup/recovery: `AUTH_REQUIRED` 또는 `PUBLIC_NOINDEX`, sitemap 제외.
- test/recovery origin: 전역 noindex, 실광고 없음, sitemap 제출/indexable 데이터 없음.

### 6.2 SEO 백엔드 backlog

safe public `SeoMetadataReadModel`, Host header가 아닌 configured origin 기반 canonical builder, URL/byte limit을 지키는 sitemap index/shard, robots generator, JSON-LD schema allowlist serializer, loop/conflict 검증 301/308 redirect map, image metadata/alt/dimension service, locale/hreflang policy, crawler-log classification, Search Console/Naver verification·상태 수집, crawl/index/canonical/sitemap 오류 report, SEO operator read dashboard/API를 구현·검증한다. HTML/meta/sitemap/redirect cache invalidation을 함께 맞추고 private identity/economy/security state를 public cache key/structured data에 넣지 않는다.

### 6.3 SEO KPI·성능

impression/click/CTR은 진단값이다. 사업 funnel은 organic visit → qualified interest → signup → activation → D1/D7/D30 → retained contribution/실 net revenue다. `organic CAC = attributable content+SEO+tooling cost / incremental organic D30 retained users`. 대표 public template은 good CWV 기준 LCP ≤2.5s, INP <200ms, CLS <0.1을 목표로 mobile/desktop 회귀검증한다.

## 7. 보안 위협·검증 등록부

| 위험 | 심각도 | 필수 예방·탐지 | 필수 테스트/릴리스 동작 |
|---|---|---|---|
| BOLA/IDOR | HIGH | 모든 object read/write actor-scoped service/DB authz, client owner ID 불신, 안전한 denial metric | 모든 object API에 other-user ID negative test, 실패차단 |
| credential stuffing/session fixation | HIGH | generic error, rate/abuse signal, session rotate, secure cookie, recent reauth, logout invalidation, OAuth uniqueness | sequential/distributed invalid auth, fixation/logout/reauth/state/nonce/PKCE, unexplained bypass 차단 |
| 경제 replay/duplicate/concurrency | HIGH | idempotency unique, DB transaction/lock, append-only ledger/reconciliation | parallel/retry/replay, precision/ledger balance, 원인불명 mismatch 차단 |
| 관리자 악용 | HIGH | session+reauth+TOTP+DB actor+least privilege+impact preview+append-only audit | lower-role/stale reauth/invalid TOTP/CSRF/mass/DB privilege, 실패차단 |
| upload/UGC | HIGH | decoded type, isolated storage, encoding/CSP, metadata minimization, moderation/report/block | polyglot/malformed/XSS/link/unauthorized delivery |
| analytics/ad/SEO 유출 | MEDIUM/HIGH | outbound allowlist, minimization, token/balance/debt/security URL·structured data 금지 | payload/schema/sitemap/JSON-LD scan, HIGH leak 차단 |
| supply chain | MEDIUM/HIGH | 중요 action/dependency를 검토된 immutable version에 고정 가능한 범위, dependency audit/SBOM/provenance | workflow/dependency policy regression, unresolved high-risk는 release policy 적용 |
| release evidence 우회 | HIGH | immutable SHA, machine-readable fail-closed evidence, skip-pass 금지 | 각 전제 의도파손, `production-ready` 미발행 확인 |
| backup/key 침해 | HIGH | encryption, key separation, independent medium, least-privilege backup identity, access audit | unauthorized key/identity/plaintext artifact, HIGH leak 차단 |
| wrong-environment restore | CRITICAL/HIGH | source/target 식별, isolated namespace/DB, separate credential/outbound | wrong target/Production credential simulation, unintended Production write 가능하면 차단 |
| backup corruption/WAL gap | HIGH | checksum/manifest, version check, 정기 full restore, WAL monitoring, ledger/data reconciliation | corrupt/missing WAL/wrong checksum fail-closed+alert |
| multi-account/referral/market manipulation | 경제영향 시 HIGH | maturity/cap, provenance, anomaly/graph 검토, raw acquisition signal과 경제보상 분리 | referral ring/wash trade/collusion/duplicate reward/replay |

password/verifier/session cookie/OAuth code/client secret/bot token/DB password/backup key/raw verification·recovery token과 무제한 request body는 일반 로그에 기록하지 않는다. 보안 이벤트는 pseudonymous ID와 safe classification을 사용한다.

## 8. 수익성·사업성 계약

어떤 기능도 gross revenue만으로 승인하지 않는다. 실결제·광고 기능은 수익모델(subscription/일회성/소모성/비소모성/ad/sponsor/B2B2C/간접 retention·acquisition), 사용자 전환경로, 표시가격/테스트 가격, attach/paid conversion/repeat/renewal 가설, refund/churn/cancel, 실제 매출이 있을 때 ARPU/ARPDAU/ARPPU, 광고 eCPM/fill/CTR, platform/payment/tax/refund/chargeback, infra/storage/CDN/notification/LLM, content/CS/moderation/fraud/security 비용, gross/contribution margin, CAC, LTV, LTV/CAC, payback, 낙관/기준/보수 민감도, D1/D7/D30, 신뢰·규제비용, `SCALE/ITERATE/HOLD/KILL`을 기록한다.

- WLD-only 상점·카지노·은행·주식 활동은 게임경제 활동이며 실매출이 아니다.
- 광고는 `net ad contribution = ad revenue - ad-induced churn/session 감소에 따른 LTV 손실 - ad infra/privacy/support/fraud cost`로 평가한다.
- SEO는 impression이 아니라 incremental organic D30 retained user와 organic CAC 절감으로 평가한다.
- 보안/QA/release/backup은 회피된 사고·데이터손실·다운타임·환불·fraud·CS 기대비용으로 평가하며 관측 전 통화금액을 꾸며내지 않는다.
- local auth는 incremental D30 retained contribution에서 SMTP/Argon2/DB/support/fraud/privacy/security 운영비를 뺀다.
- 향후 반복결제는 결제 전 주요조건을 명확히 고지하고 affirmative consent와 straightforward cancellation을 제공한다. provider가 정해지기 전 특정 플랫폼 수수료를 확정값으로 가정하지 않는다.

## 9. 백업·재해복구 계약 — v106 규범 추가

### 9.1 복구목표·데이터 범위

identity/ledger/content 손실허용도와 비용을 기준으로 명시적 RPO/RTO를 승인한다. 숫자를 기획 자동화가 임의 생성하지 않는다. RPO는 실제 restore 가능한 최신 시점으로, RTO는 timed full drill로 측정한다. 최소 대상은 authoritative PostgreSQL identity/economy/ledger/audit, migration/schema/version manifest/checksum, inventory/entitlement/content metadata, 필요한 object/photo store, 데이터를 해석할 application/GitOps version이다. key/secret recovery는 별도 암호화 control plane을 사용한다.

primary host/storage/failure domain 또는 online credential을 공유하는 recovery DB/read replica/snapshot/local dump는 복구 편의수단이지 충분한 독립 DR backup이 아니다.

### 9.2 백업 구조

독립/off-host failure domain, 전송·저장 암호화, key separation+key recovery test, least-privilege backup identity, 별도 restore credential, source env/DB/app/migration/tool/timestamp/backup ID/checksum/retention metadata, 용량감시, 보존·삭제·변조 통제를 요구한다. 승인 RPO/RTO에 따라 logical dump, physical base backup, continuous archiving/PITR 또는 조합을 선택한다. logical structure check는 full restore를 대체하지 않는다. PITR이면 필요한 WAL coverage와 recovery target 동작을 증명한다.

### 9.3 `VERIFIED_RESTORABLE` drill

다음을 모두 완료해야 검증된 백업이다: clean isolated target → source/backup identity → decrypt/key/checksum/manifest → full DB restore(PITR이면 target/WAL 포함) → migration/checksum parity → Production outbound를 끈 least-privilege app smoke → DB referential checks → ledger debit/credit 및 derived-balance reconciliation → inventory/entitlement/provenance → object/photo sample → notification/webhook/Discord/email/ads/index가 비운영임을 확인 → recoverable point와 restore duration 측정 → evidence/operator/audit 기록 → recovery copy의 통제된 폐기/보유.

파일 존재, checksum만, `pg_restore -l`만, recovery replica만으로는 성공 DR drill이 아니다.

### 9.4 파괴적/schema-changing 작업의 machine-readable release evidence

필수필드: candidate SHA, backup ID, source stack/DB ID, createdAt, independent failure-domain 분류, encryption/key 결과, checksum/manifest, restore drill ID/time/result, achieved RPO/RTO 상태, migration checksum parity, ledger/derived-balance reconciliation, 관련 object sample, rollback application/GitOps target, operator/audit ID, evidence freshness/expiry. missing/stale/corrupt/wrong-key/wrong-env/WAL-gap/reconciliation-failed/untested는 `BLOCKED`이며 skip-pass가 없다.

### 9.5 백업 보안·개인정보·SEO

backup/restore/admin artifact는 private/auth/noindex/sitemap 제외. public status에서 공개한다면 truthful high-level recovery-health category/timestamp 정도만 허용하고 path/provider ID/DB name/key/checksum/WAL/internal topology를 노출하지 않는다. restore 환경은 noindex/ad-free이며 Production side-effect credential을 사용하지 않는다. restore copy retention/disposal은 감사한다.

### 9.6 백업 QA·관측

stale/failed backup, checksum/manifest mismatch, decrypt/key failure, storage 부족, restore drill 실패, recovery refresh 실패, reconciliation 실패, PITR/WAL gap을 알림화한다. alert는 dedupe하고 사용자·경제 payload를 넣지 않는다. stale/missing/corrupt archive, wrong key, storage-full, wrong target, Production credential, WAL-gap을 fault-inject한다. last-known-good immutable app/GitOps rollback을 rehearsal하고 실제 recovery duration을 기록한다.

사업 KPI는 backup 성공/freshness, independent-copy coverage, verified restore 성공, achieved RPO/measured RTO, drill failure, storage/key/compute/operator cost, expected-loss avoided다. 직접매출은 0이다. 승인 복구목표를 합리적 비용으로 안정 충족하면 `SCALE`, copy는 있으나 proof/automation/cost가 약하면 `ITERATE`, proof 없으면 파괴적 변경 `HOLD`, 독립복구 불가 또는 secret/privacy 위험이 크면 해당 경로 `KILL`.

## 10. QA·테스트환경·배포·관측·롤백

모든 중요 이슈는 severity, 최초발견일, 최근재현일, 정확한 재현절차, 영향 사용자/기능, 실제증거, 원인가설/확정원인, frontend/backend/API/DB/infra 수정대상, 구체설계, migration 여부, rollback, unit/integration/E2E/실DB/security/regression, test acceptance, Production promotion, monitoring, 상태, 담당순서를 기록한다. 반복 `BLOCKED`는 원인제거 항목으로 승격한다. CRITICAL/HIGH가 기능추가보다 먼저다.

### 10.1 candidate/release 순서

`new branch → lint/type/unit/integration/real-DB/security → immutable candidate/SBOM/provenance(해당 시) → isolated exact-SHA → migration checksum/parity → backend/DB least-privilege smoke → authenticated synthetic flow → changed feature E2E/abuse → DB변경 시 restore/rollback 포함 release evidence → main 통합 → exact-main-SHA test gate → Production-ready → GitOps Production → HTTP/API/auth/user-flow/log/resource smoke → monitor/rollback`.

테스트 환경은 namespace/DB 분리, indexing off, real ads off를 유지한다. 증거가 없으면 pass가 아니다. test/recovery stack은 Production email/Discord/webhook을 보내거나 Production 데이터를 변경하지 않는다.

### 10.2 관측 guardrail

API 4xx/5xx class, auth failure/ATO, DB pool/transaction error, migration parity, ledger reconciliation, suspicious duplicate reward, quota denial, shop entitlement failure, alert/outbox/provider failure, ad-induced exit/CWV, crawl/index error, backup freshness/restore, deployment evidence, rollback availability를 본다. 로그에는 ID/class만 남기고 raw secret/private payload를 기록하지 않는다.

## 11. UX·활성화·리텐션·운영

첫 방문은 전체 경제를 한 번에 설명하기보다 하나의 명확한 가치와 game-only 경계를 먼저 이해시킨다. Activation은 방문 → 이해 → sample/value → contextual signup → 첫 의미 있는 검증행동 → 첫 결과/보상 → 다음 목표다. 신규 사용자가 market/business/bank/casino를 동시에 이해하도록 요구하지 않는다.

D1은 사용자가 선택한 exact thread를 복원하고, D3는 실제 변화 또는 정직한 no-change, D7은 일관된 progression/collection/project/learning loop를 해결하며, D14는 자발적 breadth, D30은 출석벌점이 아닌 durable history/identity/collection을 남긴다. 1~3분 quick check, 5~15분 meaningful session, 선택적 deep session을 지원한다. punitive streak, loss-threat FOMO, 과도한 알림을 피하고 catch-up/comeback을 제공한다.

공유는 public-safe achievement/collection/project/season/learning result 중심이다. 공유 URL에는 session token, private holdings, balance, debt, casino history, recovery/security state, PII를 넣지 않는다. referral은 raw signup 즉시 경제보상보다 fraud-resistant maturity 후 cosmetic/prestige/convenience를 우선한다.

관리자/CS 운영은 dispute/refund/report/abuse queue, feature flag, fallback/rollback, 안전한 incident message, audit를 정의한다. 고위험 account/economy action은 사칭·피싱을 줄이는 명확한 confirmation UX를 사용한다.

## 12. 외부 레퍼런스 판정 — 2026-09-15

- PostgreSQL 최신 `pg_verifybackup`: **직접채택**. compatible backup의 manifest/checksum 검증에 사용하되 PostgreSQL 자체가 실제 restored server의 모든 동작을 보장할 수 없다고 하므로 full restore test는 필수.
- PostgreSQL 최신 continuous archiving/PITR: **PITR 선택 시 직접채택**. WAL availability와 recovery target이 복구증거다.
- CISA StopRansomware: **resilience 지침으로 직접채택**. 독립/offline 가능한 암호화 백업과 정기 recovery availability/integrity test.
- NIST SP 1339(2026-06-17): **참고/운영원칙 채택**. backup을 change management, 정기 backup/test/recovery exercise와 연결한다. Moneyverse를 OT 시스템으로 정의하는 의미는 아니다.
- OWASP ASVS 5.0.0 / API Security Top 10: **검증 baseline으로 직접채택**. 인증/session/BOLA/resource/business-flow abuse에 적용.
- Google Search Central/Naver Search Advisor 최신 자료: **직접채택**. canonical/index/sitemap/crawl/public content 품질과 auth/noindex 경계.
- 개인정보보호위원회 최신 개인정보처리방침 자료: **고지설계 지침으로 직접채택**. 실제 authentication/analytics 처리의 목적·항목·보유·권리와 공개문서를 맞춘다.
- FTC 2026 subscription/negative-option 집행·검토: **참고+제품 guardrail**. 향후 실화폐 반복결제에서 주요조건 고지, 명시동의, 쉬운해지를 요구하되 모든 Moneyverse 거래에 특정 미국규칙이 자동 적용된다고 단정하지 않는다.

## 13. 현재 증거·통합 기록 — v2026.09.15.106

- v106 문서작업 시작·중간의 문서변경 전 `main`은 `e1dce34cf3e7544d3bb3fe53a80caf992945a213`였고 v106 commit 시작 전 외부 동시변경을 관찰하지 않았다.
- GitHub issue #139는 OPEN이며 마지막 직접증거는 read-only 지정 백업 SSD와 same-host emergency dump다.
- recovery worklog는 `moneyverse_recovery`가 암호화 별도매체 백업을 대체하지 않는다고 명시한다.
- 시작 SHA의 connected GitHub combined status에는 개별 status entry가 없고 사용 가능한 PR-triggered workflow 조회도 비어 있어 CI/test-server pass를 주장하지 않는다.
- 이번 회차에서 fresh 운영 `/status` 직접검증은 이용할 수 없었고 이전 snapshot을 현재 사실처럼 재사용하지 않았다. authorized remote device도 이용할 수 없어 새 host/Kubernetes/mount 점검을 주장하지 않는다.
- 신규 P0: `BAK-106-01`. 유지 P0: `AUTH-105-01`, `QA-104-01`, `REL-104-02`. 유지 P1: `AUTH-105-02`, `REL-104-03`.
- v106은 기획/문서만 변경하며 런타임 코드, DB schema/data, backup 장치, 인프라, secret, branch setting, 보안 구현을 변경하지 않는다.
