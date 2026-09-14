# 내부 작업 로그 — v2026.09.15.103

## 목적

필수 순서인 `최신 외부 레퍼런스 → 최신 저장소/런타임/QA 현실 → 개발·QA·보안·SEO·수익성 상세기획 → 작업 중간 main 재확인 → 영/한 Living Project Plan 통합`으로 통합 기획 감사를 수행했다.

이번 회차는 문서/기획 전용이다. 런타임 코드, DB 동작, API 계약, Kubernetes/Flux manifest, secret, 운영 설정은 변경하지 않는다.

## 시작 저장소 상태

- 저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
- 시작 `main`: `bb46906b786dd92e731be996ad8fc3c72e94f352`
- 시작 시 최신 변경: `fix(v2026.09.15.102): restore work daily quota contract`
- v102는 작업 카탈로그의 일일 quota를 authoritative로 복구하고, 완료 기준 `taken_today`, 한도 초과 거부, 작업 보상 경로의 공통 동시성 보호를 복구한다.
- 기존 Living Project Plan은 PostgreSQL 경제 권위, append-only 원장, 최소권한, OAuth/session 통제, 민감 경로 광고 차단, exact-SHA 사전검증, 적용 migration 불변, fail-closed 승격 게이트를 이미 요구한다.

## 기획 전 외부 조사

### 검색/SEO

1. Google Search Central canonical: `https://developers.google.com/search/docs/crawling-indexing/canonicalization`
   - 판정: 결정적 canonical 정책과 중복 URL 통제에 직접 채택.
2. Google Core Web Vitals: `https://developers.google.com/search/docs/appearance/core-web-vitals`
   - 판정: 대표 공개 템플릿의 LCP <= 2.5초, INP < 200ms, CLS < 0.1 목표에 직접 채택.
3. Google Breadcrumb 구조화데이터: `https://developers.google.com/search/docs/appearance/structured-data/breadcrumb`
   - 판정: 실제 화면에 breadcrumb 의미가 존재하는 경우 직접 채택.
4. Naver Search Advisor:
   - `https://searchadvisor.naver.com/guide/seo-basic-intro`
   - `https://searchadvisor.naver.com/guide/request-feed`
   - `https://searchadvisor.naver.com/guide/markup-structure`
   - 판정: 국내 crawl/index/canonical/sitemap 기획에 직접 채택.

### 보안

1. OWASP API Security Top 10 2023 API1 BOLA/API2 Broken Authentication:
   - `https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/`
   - `https://api-security.owasp.org/editions/2023/en/0xa2-broken-authentication/`
   - 판정: endpoint/object authorization과 인증 negative test 요구사항에 직접 채택.
2. OWASP Top 10:2025 / ASVS:
   - `https://top10.owasp.org/2025/`
   - `https://owasp.org/www-project-application-security-verification-standard/`
   - 판정: 폭넓은 검증 기준으로 직접 채택하되 Moneyverse 고유 위협모델을 대체하지 않는다.

### 구독·소비자보호·수익성 참고

1. FTC 2026 구독/negative-option 집행·규칙개정:
   - `https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-cancellation-practices`
   - `https://www.ftc.gov/news-events/news/press-releases/2026/03/ftc-seeks-public-comment-response-advance-notice-proposed-rulemaking-regarding-negative-option`
   - 판정: 주요 조건 사전 명확화, informed consent, 해지 방해 금지를 제품 guardrail로 직접 채택. 제안 단계 규칙개정은 확정 규칙처럼 취급하지 않는다.
2. Apple 구독/결제복구:
   - `https://developer.apple.com/kr/app-store/subscriptions/`
   - `https://developer.apple.com/documentation/storekit/handling-subscriptions-billing`
   - 판정: 플랫폼 수익구조와 갱신/복구 참고. Apple 전용 수익배분율·기간을 실제 채택 전 Moneyverse의 확정가정으로 사용하지 않는다.

## 런타임·QA 현실 확인

### 공개 런타임

- 운영 공개 홈은 접근 가능했고 WLD/보상을 서비스 내부 game-only 가상 데이터로 계속 표시한다.
- 운영 `/status`는 접근 가능했고 최신 표시 snapshot 기준 웹, 경제 API, 원장 DB를 정상으로 표시했다. Lobby는 동등한 수준으로 확인되지 않았다.
- 운영 `/guide`는 접근 가능했다.

### 발견한 P0 계약 드리프트

공개 가이드는 직업 작업을 일일 횟수 제한 없이 반복하고 매번 WLD/EXP를 전액 받을 수 있다고 설명한다. 현재 v102 DB 계약은 반대로 작업마다 authoritative `daily_limit`을 노출하고, `taken_today`는 실제 완료/보상 횟수를 계산하며, 설정된 한도를 채운 다음 완료 요청을 거부한다.

분류:
- 우선순위/심각도: P0 / HIGH 사용자 노출 경제계약 정확성 위험.
- 이번 감사 기준 최초 확인일: 2026-09-15.
- 최근 재현: 2026-09-15 운영 공개 `/guide`와 최신 `main` v102 계약 대조.
- 영향 사용자: 공개 가이드로 직업 작업을 학습하는 신규/기존 사용자, CS/운영팀, 검색 유입 사용자.
- 영향: 잘못된 보상 기대, 실제 quota에서 실패, 신뢰 저하, CS 증가, 오래된 무제한 보상 설명을 근거로 한 악용 시도.
- 원인: authoritative DB 계약 변경에 공개 사용자 안내가 동기화되지 않음.
- 수정대상: 공개 웹 콘텐츠, 모바일/웹 사용자 문구, 문서/SEO metadata. 이번 기획에서는 backend/DB를 다시 설계하지 않고 실제 계약을 검증 대상으로 둔다.
- migration: 문구 변경에는 없음. 적용된 DB migration은 불변이며 경제동작 롤백은 새 migration 필요.
- rollback: 공개 문구는 독립 revert 가능. 원장/경제 migration/history는 수정하지 않는다.
- 필요 QA: 실DB 0/부분/최대/초과 quota, 직업 전환 격리, 동시 완료, 서울 날짜 rollover, API schema parity, 웹/모바일 표시 parity, 공개 가이드 E2E/content assertion.
- 테스트서버 수용조건: exact candidate SHA에서 문구와 quota 동작이 동기화되고 DB smoke/E2E 통과.
- 운영승격: 기존 same-SHA fail-closed gate 이후만 허용.
- 모니터링: work completion 4xx/5xx 및 quota reject 비율, reward receipt, CS complaint, duplicate reward/replay signal.
- 상태: 공개/runtime 문구 수정은 TODO. backend quota 복구는 `main`에 존재하지만 이번 기획 회차에서 운영 인증한 것은 아니다.

### CI/test 증거

- 시작 SHA의 GitHub combined status 조회에서는 visible status가 없었다.
- commit workflow 조회에서도 visible workflow run이 없었다.
- 이를 CI 실패나 성공으로 추정하지 않고 `verification unavailable`로 기록한다.
- 인증 사용자 흐름, 격리 test exact-SHA, 테스트 DB migration 실행, 운영 경제 E2E는 이번 회차에서 독립 실행하지 않았다.

## 통합한 기획 결정

### 기능별 구현계약

모든 주요 기능군은 구현상태와 함께 UX, authority/ownership, API, DB/concurrency, 관측성/admin, 보안/개인정보/악용, SEO, 분석, 성능/cache, 수익성, QA, 배포/rollback 계약을 가진다.

### 보안

- Object ID API는 정상 권한과 다른 사용자 식별자의 거부 테스트를 모두 포함한다.
- 인증/session은 credential stuffing/rate limit, fixation/rotation, logout/invalidation, OAuth state/nonce/PKCE/exact redirect, recent reauth, CSRF, cookie, secret/log masking을 검증한다.
- 경제는 idempotency/replay/concurrency, duplicate reward, multi-account/collusion/manipulation, precision, 원장 대사, DB least privilege를 검증한다.
- Upload/UGC는 실제 타입 디코딩, 제한, 격리 저장, delivery authorization, metadata/privacy, moderation/report/block, 악성 링크/phishing을 검증한다.
- CRITICAL/HIGH 보안 실패는 운영 승격을 차단한다.

### SEO 백엔드

- 서버 authoritative deterministic canonical generator.
- public/indexable canonical URL만 포함하는 동적 sitemap, authoritative lastModified, sitemap 분할.
- account/admin/wallet/transaction/recovery/security/private holdings는 인증 + noindex/X-Robots, sitemap 제외. robots.txt는 기밀성 통제가 아니다.
- stable slug 변경은 영구 redirect map.
- 공개 핵심 콘텐츠 SSR/ISR 제공.
- filter/sort/search/query variant canonical/noindex 정책.
- 실제 breadcrumb와 일치하는 JSON-LD.
- 안전한 이미지 metadata/alt/dimension, EXIF/private filename 유출 방지.
- 다국어 canonical/hreflang 일관성.
- Search Console/Naver의 crawl/index/canonical/sitemap 상태를 organic visit → signup → activation → D7/D30 → revenue와 연결.

### 수익성

각 수익 또는 비용절감 기능은 가격, conversion/attach/repeat/renewal, refund/churn, 수수료/세금/환불, infra/storage/CDN/notification/LLM, 콘텐츠/CS/moderation/fraud, gross/contribution margin, CAC/LTV/payback, 낙관/기준/보수 민감도, D1/D7/D30 영향, trust/legal risk, SCALE/ITERATE/HOLD/KILL 기준을 실측 또는 가설/테스트 값으로 가진다.

광고는 raw impression이 아니라 광고유발 이탈/세션 감소/CS 부담을 뺀 순기여로 평가한다. 보안/QA/백업/SEO/admin 도구는 incident/fraud/refund/CS 회피 비용과 retained customer/organic value로 사업가치를 본다.

## 저장소 반영

이번 문서-only 회차에서 `main`에 다음을 반영했다.

1. `docs/changelog/2026-09-15-integrated-planning-audit-v2026.09.15.103.md`
2. `docs/changelog/2026-09-15-integrated-planning-audit-v2026.09.15.103.ko.md`
3. `docs/planning/PROJECT_PLAN.md`
4. `docs/planning/PROJECT_PLAN.ko.md`
5. 영문 worklog
6. 이 한국어 worklog

영문 canonical과 한국어 대응본의 v103 통합 계약을 같은 회차에 동기화했다.

## 작업 중간 main 동기화

기획 문서 write 전 `main`을 다시 확인했으며 여전히 `bb46906b786dd92e731be996ad8fc3c72e94f352`였다. 따라서 당시에는 외부 동시 변경을 rebase할 필요가 없었다. worklog 반영 후 최신 `main`을 마지막으로 다시 확인하여 최종 HEAD와 이후 동시 변경 유무를 기록한다.

## 배포 상태

- 이번 기획으로 인한 runtime/code/DB/API/infra 변경: 없음.
- 이번 기획으로 인한 테스트서버 배포: 수행하지 않음.
- 이번 기획으로 인한 운영배포: 수행하지 않음.
- Runtime verification: PARTIAL.
- CI/test exact-SHA verification: 이번 회차에서는 UNAVAILABLE.

## 롤백

v103 변경은 전부 문서-only이므로 동시 런타임 변경을 보존한 상태에서 v103 문서 commit을 정상 Git revert한다. `main` force-push는 하지 않는다. 이 기획 릴리스에는 DB rollback이 없다.
