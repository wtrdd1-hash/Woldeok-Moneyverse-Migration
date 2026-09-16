# v2026.09.15.117 — 시간별 통합 기획 증거

## 기준선과 증거 상태
- 시작·중간 확인 `main`: `6e5fe4aa51364c96da5ef47cc427e7719ec6d1ff`. 이번 회차 동안 더 최신 애플리케이션/런타임 커밋은 확인되지 않았다.
- `PROJECT_PLAN.md`, `PROJECT_PLAN.ko.md`는 여전히 통합 버전 `v2026.09.15.110`을 선언한다. 따라서 v116 보안/App API/telemetry 델타가 두 권위 통합본에 아직 병합되지 않았다.
- 현재 main의 combined status와 PR-triggered workflow run 목록은 비어 있다. 이는 `verification unavailable`이며 CI green이 아니다.
- 연결된 GitHub App으로 branch-protection 읽기는 403이므로 이번 회차에서는 required-check 현재 상태에 대한 새로운 단정을 하지 않는다.
- 연결 표면에서 런타임/클러스터 증거를 얻을 수 없어 별도 증거가 없는 Test/Production 동작은 `UNVERIFIED`다.

## 최신 외부 레퍼런스 조사 — 2026-09-15
1. Google Search Central canonicalization: redirect, sitemap, `rel=canonical`, 내부링크, hreflang을 일관된 canonical 신호로 사용한다. **직접채택**.
2. Google structured-data 지침: 배포 전 검증, 소수 페이지 배포, live URL 검사, crawl 가능성 확인, 템플릿 변경 후 Search Console 모니터링. **직접채택**.
3. OWASP Top 10:2025 A07 Authentication Failures: 부적절한 인증과 session fixation을 핵심 위험으로 유지한다. local/OAuth/admin step-up/session/mobile-admin 검증에 **직접채택**.
4. Google Play 2026 현행 수수료 안내: recurring/non-recurring, 신규/기존 설치, 프로그램 자격 등에 따라 수수료 구조가 달라질 수 있고 billing fee가 추가될 수 있다. 고정 단일 비율이 아니라 **원가 입력값으로 직접채택**.
5. Apple 자동갱신 구독 지침: 지속 가치, upgrade/downgrade/crossgrade, win-back 및 paid-service/Small Business 자격에 따른 proceeds 차이를 unit economics에 **참고·직접반영**하되 실제 구현 시 storefront/세금/자격을 다시 검증한다.

## 최우선 신규 델타
### DOC-117-01 — P1 — BLOCKED — 권위 통합기획서가 현재 main/보안 계약보다 뒤처짐
**최초확인:** 2026-09-15. **최근재현:** 이번 회차.

**증거:** 두 통합기획서는 v110인데 current main에는 v114/v115 런타임 코드와 v116 기획 증거가 존재한다. 따라서 v110 기능 매트릭스만으로 abuse-security console, 영구정지+세션 폐기, IP/CIDR block/lift, Android/admin App API gate, request telemetry 현재 동작을 증명할 수 없다.

**영향:** 개발자/AI가 오래된 권위경계로 구현·QA·승격할 수 있다. 파괴적 관리자/보안 기능에서 특히 위험하므로 단순 편집부채가 아니라 release-governance 정확성 문제다.

**원인:** 연결된 GitHub 표면은 큰 파일 blob을 읽을 수 있지만 안전한 부분 in-place 수정 기능이 없다. 전체 교체는 완전한 UTF-8 파일 전체를 다시 전송해야 하며 불완전 payload로 기존 내용을 손상시킬 위험이 있어 파괴적 덮어쓰기를 하지 않는다.

**통합 설계:** 안전한 전체 파일 writer가 확보되면 영문 canonical과 한국어본을 같은 변경에서 승격한다. v110 모든 섹션을 보존하고 v111~v117 델타, SEC-116-01/OBS-116-01/API-116-01/DOC-117-01, 현재 구현상태와 최신 레퍼런스 판정을 병합한다. 두 blob을 다시 읽어 동일 버전·정책 집합을 확인하기 전에는 동기화 완료로 표시하지 않는다.

**QA:** 전/후 blob SHA, 섹션/라인 수 sanity, 무관 섹션 삭제 없음 diff, EN/KO heading/key parity, 링크, 동일 current version, PR #332 open 같은 오래된 주장 검색, v116 admin/telemetry 계약 존재 확인, write 직후 최신 main 재확인.

**게이트:** runtime 개발은 별도 정상 흐름을 따를 수 있으나 변경된 admin/App API/telemetry 정책에 의존하는 release 결정은 통합 완료 전 최신 evidence delta도 함께 읽어야 한다. 기획 자동화는 통합본 동기화를 허위로 선언하지 않는다.

## 기능별 추가 계약
### 관리자 / abuse security
`SEC-116-01` P0 runtime-unverified 유지. 영구정지와 network block/lift는 실행 시 recent reauth+2차요소, 독립 DB actor 권한검사, self/last-admin/control-plane lockout 방지, canonical `inet/cidr`, 영향 preview, idempotency, 불변 audit, 다중 세션 즉시 폐기를 요구한다. Admin-mobile은 parity/security QA 전 기본 off feature flag다. client platform/version header는 권한 경계가 아니다.

### Request telemetry
`OBS-116-01` 유지. allowlist+길이 제한, CRLF/control/oversize 방어, Authorization/cookie/CSRF/body/query token 금지, request/trace ID를 metric label에 사용 금지, 보존기간/접근권한 명시, telemetry 실패가 본 거래를 rollback/오염시키지 않아야 한다.

### 인증/세션
Local/OAuth는 generic invalid-credential 오류, rate/resource budget, session rotation, logout revoke, exact redirect/state/nonce/PKCE, email 기반 silent merge 금지, 민감행동 recent reauth를 유지한다. verification/recovery URL은 noindex+sitemap 제외이며 analytics/referrer/log에 secret이 없어야 한다.

### SEO / 공개 콘텐츠
- 하나의 server-owned SEO read model이 공개여부, configured-origin canonical, robots, sitemap, `lastModified`, hreflang, structured-data allowlist를 결정한다.
- filter/sort/query 중복은 durable 대표 URL로 canonical하거나 noindex하며 doorway/thin variant를 만들지 않는다.
- 공개 structured data는 템플릿 변경 후 검증하며 개인 계정/경제/보안 필드를 포함하지 않는다.
- auth/account/security/wallet/holdings/loans/orders/admin/moderation/backup/recovery/App API는 private/noindex/sitemap 제외를 유지한다.
- SEO 사업 KPI는 organic visit → signup → activation → D7/D30 → retained contribution/CAC saving이며 impression/CTR만으로 확대하지 않는다.

### 수익화 / unit economics
고정 `15%` 또는 `30%` 플랫폼 수수료 가정을 금지한다. 실제결제 SKU/구독 시나리오마다 storefront/market, 해당 시 신규·기존 설치 분류, recurring/non-recurring, 프로그램 자격, billing/payment fee, 세금, 환불/chargeback, net proceeds, 콘텐츠/CS/moderation/fraud/infra 비용과 민감도를 기록한다. Apple은 해당 시 paid-service 1년 전/후 proceeds와 Small Business 자격을 별도 모델링한다. 미확인 자격/traffic mix는 `가설`/`테스트 기준`이다.

구독 SCALE은 gross receipts가 아니라 churn/refund/support 이후 incremental retained contribution이 양수이고 guardrail을 만족할 때만 한다. Win-back/promotion은 숨은 자동갱신, 오해 유발 희소성, 카지노/부 압박 없이 자격 있는 이탈 구독자에게만 시험한다. Guardrail: D1/D7/D30, cancel/renew/refund, support, payment failure, fraud/chargeback, trust/privacy complaint.

## QA/우선순위 유지
P0: `BAK-106-01`, `OPS-107-01`, `REL-110-01`, `AUTH-105-01`, `QA-104-01`, `REL-104-02`, `SEC-116-01`. P1: `AUTH-105-02`, `REL-104-03`, `OBS-116-01`, `API-116-01`, SEO backend, monetization provider economics, `DOC-117-01`.

## 통합 상태
최신 외부조사 → 최신 main/통합본/QA 증거 대조 → 보안/SEO/사업성/QA 상세기획 → 중간 main 재확인 순서를 수행했다. 두 대형 권위 통합본은 읽고 stale 상태를 확인했으나 연결 write 표면에서 안전한 전체 교체가 불가능해 이번 회차도 `PROJECT_PLAN` 동기화를 허위로 선언하지 않고 비파괴 v117 델타를 기록한다. 런타임 코드/API/DB/migration/인프라/secret/branch rule은 변경하지 않는다.