# v2026.09.15.103 — 통합 기획·QA·SEO·보안·수익성 감사

## 범위

이번 회차는 문서/기획 전용 변경이다. 런타임, DB, API, 인프라, 보안 코드는 수정하지 않는다.

## 이번 회차에서 최신 확인한 외부 근거

- Google Search Central canonical, Core Web Vitals, Breadcrumb 구조화데이터 가이드(2026-09-15 재확인): https://developers.google.com/search/docs/crawling-indexing/canonicalization , https://developers.google.com/search/docs/appearance/core-web-vitals , https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Naver Search Advisor SEO, 검색로봇, sitemap/RSS, canonical/robots 가이드(2026-09-15 재확인): https://searchadvisor.naver.com/guide/seo-basic-intro , https://searchadvisor.naver.com/guide/request-feed , https://searchadvisor.naver.com/guide/markup-structure
- OWASP API Security Top 10 2023 BOLA/Broken Authentication 및 OWASP Top 10:2025 / ASVS 자료: https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/ , https://api-security.owasp.org/editions/2023/en/0xa2-broken-authentication/ , https://top10.owasp.org/2025/ , https://owasp.org/www-project-application-security-verification-standard/
- FTC 2026 자동갱신/구독 관련 집행·규칙개정 신호: https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-cancellation-practices , https://www.ftc.gov/news-events/news/press-releases/2026/03/ftc-seeks-public-comment-response-advance-notice-proposed-rulemaking-regarding-negative-option
- Apple 구독 수익구조·결제 복구 가이드: https://developer.apple.com/kr/app-store/subscriptions/ , https://developer.apple.com/documentation/storekit/handling-subscriptions-billing

## 저장소/런타임 증거

- 작업 시작 기준 `main` SHA는 `bb46906b786dd92e731be996ad8fc3c72e94f352`였다.
- 최신 런타임 변경 v2026.09.15.102는 `work_task_catalog.daily_limit`를 다시 authoritative 값으로 사용하고, `taken_today`를 실제 완료/보상 횟수로 계산하며, 설정된 한도를 모두 사용한 다음 요청부터 거부하도록 복구했다.
- 해당 SHA에 대해 연결된 GitHub 상태/워크플로 조회에서는 visible check/run이 확인되지 않았다. 이는 CI 실패가 아니라 `verification unavailable`로 기록한다.
- 공개 운영 상태 페이지는 최신 표시 시점 기준 웹, 경제 API, 원장 DB를 정상으로 표시했다.
- 그러나 운영 `/guide`는 아직 직업 작업을 일일 횟수 제한 없이 반복하고 매번 WLD/EXP를 전액 받을 수 있다고 설명한다. 이는 v102의 실제 DB quota 계약과 직접 충돌한다.

## 우선순위 변경

### P0 — 런타임/스펙/공개 가이드 quota 계약 드리프트

상태: TODO / 교정 및 재검증 전 운영 승격 차단.

- 공개 가이드: 무제한 반복 보상으로 안내.
- 현재 DB: 작업별 `daily_limit` authoritative 적용.
- 필요 수정: 공개 가이드/FAQ/SEO 문구, 모바일·웹 안내, API 예시, 생성 메타데이터를 모두 서버 authoritative `daily_limit`/`taken_today` 계약에 맞춘다. DB 작업 카탈로그에서 확정하지 않은 보편적 숫자를 하드코딩하지 않는다.
- QA 게이트: 남은 횟수, 한도 정확히 채우기, 초과 요청 거부, 직업 전환 격리, 동시 중복 요청, 서울 날짜 경계, 모바일/웹 스키마 일치에 대한 실DB 테스트와 공개 E2E 문구 검증.
- 롤백: 문서만 독립 롤백할 수 있으나 이미 적용된 DB migration은 수정하지 않는다. 경제 동작 롤백은 새 migration으로만 수행한다.

### P0 — 운영 승격 증거 게이트

상태: IN PROGRESS / 이번 회차에서는 증거 확인 불가.

- 코드/DB 테스트가 존재한다는 이유만으로 운영 준비 완료로 보지 않는다.
- 운영 승격 전 CI 성공, 불변 test image, exact-SHA 테스트 배포, backend/DB smoke, 핵심 사용자 흐름 QA, migration parity/checksum, rollback 증빙이 필요하다.
- GitHub status가 보이지 않는 경우 pass/fail로 추정하지 않고 `verification unavailable`로 유지한다.

### P1 — SEO 백엔드 계약

- canonical URL 생성은 서버가 결정하며 결정적이어야 한다.
- 동적 sitemap은 공개/indexable 상태와 authoritative `updatedAt`를 가진 URL만 넣고 계정/관리자/지갑/거래/보안/복구 경로는 제외한다.
- 공개 콘텐츠는 클라이언트 JS만으로 발견되지 않도록 SSR/ISR로 핵심 본문을 제공한다. filter/query variant는 필요에 따라 canonical 또는 noindex 처리한다.
- Breadcrumb JSON-LD는 실제 breadcrumb UI 의미가 있는 페이지에만 사용하고 canonical URL과 일치시킨다.
- 검색 성과는 impressions/CTR뿐 아니라 organic visit → signup → activation → D7/D30 → revenue까지 연결한다.

### P1 — 보안 검증 매트릭스

- object ID를 받는 endpoint는 정상 권한과 타 사용자 object ID의 거부 케이스를 모두 테스트한다.
- 인증은 credential stuffing/rate limit, session rotation, logout/invalidation, OAuth state/nonce/PKCE/redirect URI, 재인증, CSRF, secret/log masking을 검증한다.
- 경제 흐름은 idempotency, replay, concurrency, 다계정/fraud, duplicate reward, 원장대사, 정밀도 계약을 테스트한다.
- 신규 공개 upload/UGC는 실제 디코딩 타입, 저장 격리, 권한, 악성/부적절 콘텐츠 대응, metadata 개인정보를 검증한다.

### P1 — 수익성/수익화 결정 게이트

- 구독/유료기능은 가격, attach/conversion, renewal/churn, refund, 플랫폼/결제 수수료, 세금, infra, CS, moderation/fraud 비용, gross margin, contribution margin, CAC, LTV, payback을 실측 또는 명시적 가설로 관리하기 전 확정 사업안으로 취급하지 않는다.
- 자동갱신의 주요 조건은 결제 전 명확히 표시하고, 해지를 어렵게 만드는 retention tactic은 금지한다.
- 광고는 raw impression이 아니라 광고매출에서 광고 유발 이탈, 세션 감소, CS 부담을 뺀 순기여로 평가한다.
- 보안/QA/SEO는 fraud/refund/incident/CS 비용 절감과 retained organic/customer value를 사업가치로 계산한다.

## 통합 기능 명세 규칙

인증/세션, 프로필/보안센터, 인벤토리/컬렉션, 상점/장바구니/결제/구독, 시즌/퀘스트/직업/성장, 사업/은행/대출, 가상주식/포트폴리오/알림, 카지노/확률형, 커뮤니티/댓글/신고/차단, 친구/클럽/추천, 알림, 검색, 업로드, 공개콘텐츠, 앱 API, 관리자/감사/백업, 분석/실험, 광고, SEO, 장애대응 등 모든 주요 기능은 구현상태와 함께 UX 상태, 권위/소유권, API 에러/멱등성/rate limit, DB 제약/트랜잭션/동시성, 보안/개인정보/악용, 관측성/관리자 운영, 분석 KPI, 성능/캐시, 수익성, QA 수용조건, 배포/롤백 계약을 가져야 한다.

## 런타임 검증

부분 가능. 운영 공개 홈/상태/가이드는 접근 가능했다. 인증 사용자 흐름, 격리 테스트 서버 exact-SHA, 세부 CI run, 실제 계정 기반 경제 E2E는 이번 문서-only 회차에서 독립 실행하지 못했다.
