# v2026.09.16.132 — 통합 기획 증거 델타

## 증거 스냅샷
- 시작/중간 main: `84603dd330e0d00e927fe810597bca9a201ff151` (`feat(stocks): combine search and sorting v2026.09.16.1 (#348)`).
- main 보호는 켜져 있지만 required status checks enforcement는 `off`, required context/check는 0개다. `REL-104-03`은 P1/CONFIRMED를 유지하며 branch protection 자체를 CI 게이트로 간주하지 않는다.
- exact-main-SHA `Build Test Candidate #590`은 성공했다. lint/typecheck/build/migration/test, secret/control-byte 검사, Prisma mutation 방지, dependency audit가 성공했고 immutable backend/frontend candidate image가 build/push됐다.
- 이는 Test Candidate 증거일 뿐이다. 동일 SHA Production release/runtime/smoke, backup/restore, rollback 증거는 이번 회차에서 확인되지 않았으므로 Production은 `UNVERIFIED`다.

## 최신 외부 기준
- Google Search Central(2026-09-08 갱신): structured-data 지원범위는 변할 수 있으므로 현재 지원 타입만 serializer allowlist에 둔다. index 대상은 crawler 접근 가능해야 하며 Rich Results Test → 제한 배포 → URL Inspection → sitemap 검증을 사용한다.
- OWASP API Security Top 10 2023은 현재 API 프로젝트 기준이며 주식 검색/거래에는 BOLA, Broken Authentication, Unrestricted Resource Consumption, BFLA, sensitive-business-flow abuse, unsafe upstream consumption을 적용한다.
- OWASP ASVS 5.0.0을 애플리케이션 보안 검증 기준으로 유지한다.
- Google Play 2026 수수료는 설치 cohort, 거래유형, 프로그램, billing path에 따라 달라진다. WLD/가상주식 활동을 실화폐 매출로 계산하지 않으며 유료 SKU에 단일 수수료 상수를 사용하지 않는다.

## STOCK-132-01 — P1 — IMPLEMENTED/PARTIAL — 조합 가능한 주식 탐색
`/stocks?q=<query>&sort=<default|change|price|available|name>`을 bookmark/share 가능한 view state로 사용한다. 검색은 non-default sort를 유지하고 정렬은 정규화된 q를 유지한다. 초기화는 q만 제거한다. invalid sort는 API/default 순서로 fallback하고 q는 80자로 제한한다. 검색결과 없음과 거래가능 종목 없음, API 오류를 구분한다. 결과 수는 `aria-live`로 전달하고 현재 정렬은 `aria-current`로 표현한다.

모바일은 wrap 가능한 컨트롤과 충분한 터치 높이를 유지하고 KO/EN 의미를 일치시킨다. offline에서는 거래를 허용하지 않으며 향후 cached discovery를 제공하더라도 stale 표시와 authoritative refresh 전 거래 CTA 비활성화를 요구한다.

기존 `/api/v1/stocks`, `/portfolio`, `/history`, `/sparklines`, `/market-events`, `/watchlist`가 권위 데이터다. 이번 검색/정렬은 ledger/holding/price/auth/DB schema를 변경하지 않는다. 가격·거래가능수량·등락률은 integer-string/BigInt-safe 비교를 사용하고 등락률은 부동소수점 대신 exact cross multiplication을 사용한다. 동일 값은 symbol로 deterministic tie-break한다.

향후 서버 pagination/search로 이동할 경우 normalized q, sort enum, stable secondary key, max page size, rate limit, snapshot/cursor 동시성 계약을 먼저 정의하고 client/server 공통 conformance vector를 통과해야 한다.

보안상 검색어는 bounded/normalized하고 SQL은 parameterized, HTML은 encoded 처리한다. raw 검색어를 KPI 목적으로 기본 로그하지 않는다. discovery parameter는 가격·수량·소유권·체결순서에 영향을 줄 수 없으며 거래 API는 별도 권한·idempotency·경제 불변식을 유지한다.

분석 이벤트는 `stock_discovery_view`, `stock_search_submit`, `stock_sort_change`, `stock_result_open`, `stock_trade_open`, `stock_trade_success`; 차원은 locale/sort/query_present/result_count_bucket/device class다. KPI는 discovery→detail CTR, trade-open, successful virtual trades/session, D1/D7/D30 stock-user retention, support incident, render latency다. WLD turnover는 현금 revenue가 아니다.

QA는 모든 sort, equal-value tie-break, invalid sort, BigInt 경계, open<=0, query normalization, KO/EN, search→sort, sort→search, clear, direct URL, back/forward, empty/error, keyboard/focus/screen-reader, mobile wrap, concurrent quote update, XSS query, oversized query, repeated request, unauthorized/BOLA negative를 포함한다. Production 승격은 exact-main-SHA Test와 Production evidence/smoke가 모두 필요하다.

## SEO-132-01 — HIGH — REDESIGN_REQUIRED — 인증 페이지 `/stocks`가 `index:true`를 선언
`frontend/src/app/stocks/page.tsx`는 SEO title/description과 `robots: { index: true, follow: true }`를 내보내면서 곧바로 `requireMember()`를 실행한다. 비로그인 crawler는 메타데이터가 index 가능하다고 주장하는 실제 콘텐츠에 안정적으로 접근할 수 없다. login redirect/접근불가·thin index, query URL 중복, 오해를 부르는 snippet 위험이 있다.

정책은 둘 중 하나로 분리한다. 단기 권고는 인증 `/stocks`를 private UI로 확정하여 `noindex,nofollow`, sitemap/structured-data/canonical discovery에서 제외하고 q/sort URL도 index하지 않는 것이다. 향후 acquisition이 필요하면 별도 공개 read-only `/market/stocks`를 만들고 지연된 비개인화 게임시장 데이터, '실제 주식·투자상품 아님' 표시, SSR HTML, base public-market canonical을 사용한다. filter/query permutation은 noindex 또는 승인된 landing URL로 canonicalize한다.

crawler 응답에 portfolio/history/watchlist/account identifier/personal balance를 노출하지 않는다. 공개 structured data는 화면에 실제 표시되는 내용과 정확히 맞고 Google이 현재 지원하는 타입일 때만 사용하며 금융상품/투자상품으로 오인시키지 않는다.

SEO backend에는 route-level `SeoPolicy` (`PUBLIC_INDEXABLE | PUBLIC_NOINDEX | PRIVATE_NOINDEX`)를 만들고 metadata/robots/sitemap/structured-data serializer가 같은 정책을 소비하게 한다. sitemap은 `PUBLIC_INDEXABLE`만 허용하고 canonical generator는 private route를 거부한다. Search Console/Naver 수집기는 route policy별 crawl/index 오류를 저장하고 PRIVATE_NOINDEX가 sitemap/index report에 나타나면 경보한다.

QA는 anonymous crawler `/stocks`, HTML/meta, redirect chain, robots, sitemap 제외, `?q`/`?sort` canonical/noindex, personalized cache leakage, KO/EN parity를 검증한다. 공개 market route를 만들면 JS 없이 SSR, 적용 가능한 schema의 Rich Results Test, URL Inspection, CWV, crawler resource 접근성, parameter matrix를 추가한다. 주식 SEO 유입을 주장하는 Production release에서는 SEO-132-01을 차단 게이트로 둔다.

## 사업성/비용
주식 검색·정렬은 직접매출이 아니라 retention/activation 기능이다. incremental retention과 infra/support cost를 함께 본다. 향후 유료 cosmetic/subscription을 도입해도 가상시장 공정성과 비투자상품 고지를 유지하며 Google Play 비용은 `market × install cohort × recurring/non-recurring × program × billing path`로 계산한다. SEO/보안 수정은 신뢰·CS·사고·유입 낭비 감소 효과로 평가한다.

## 우선순위
`P0 release truth/backup/auth/economy integrity` → `SEO-132-01 HIGH` → `STOCK-132-01 회귀/성능 완성` → 수익화/성장 실험. 이번 기획 회차에서는 런타임 배포를 하지 않았다.

## 권위 통합기획 반영 상태
PR #348이 기본 v2026.09.16.1 stock-discovery delta를 `PROJECT_PLAN.md`와 `.ko.md` 양쪽에 이미 추가했지만 두 파일 header의 통합버전은 여전히 `v2026.09.15.110`이다. 현재 writer는 complete-file replacement만 지원하고 전체 read는 잘리므로 두 대형 파일을 무손실 교체할 수 없다. `DOC-117-01 = BLOCKED_BY_SAFE_WRITE_CAPABILITY`를 유지하며 안전한 patch/complete-read 경로가 생기기 전에는 v132 canonical 동기화 완료로 주장하지 않는다.