# 월덕 머니버스 — 검색 노출 운영 명세

> 버전: v2026.09.13.1
> 상태: 구현 지향형 Living SEO/검색 운영 명세
> 기준일: 2026-09-13
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`
> 영문 기준 문서: [SEARCH_DISCOVERY_OPERATIONS_SPEC.md](SEARCH_DISCOVERY_OPERATIONS_SPEC.md)

## 1. 목적

이 문서는 Moneyverse의 검색 성장 정책을 Google과 네이버에서 실제 운영 가능한 계약으로 구체화한다. URL 소유권, 수집/색인 규칙, canonical, 다국어, 사이트맵, JavaScript 렌더링, 페이지네이션/필터, 구조화 데이터, Core Web Vitals, Search Console/네이버 서치어드바이저 운영, 모니터링, 배포 게이트를 다룬다.

검색 유입을 위해 계정, 잔액, 개인 포트폴리오, 신고/모더레이션, 보안, 관리자, 결제, 테스트 환경 데이터를 노출해서는 안 된다.

## 2. 검색 표면 등록부

모든 라우트 계열은 다음 상태 중 하나를 가져야 한다.

- `INDEXABLE_PUBLIC`: 검색 노출 대상 공개 페이지
- `PUBLIC_NOINDEX`: 공개이지만 검색 결과로는 부적합한 페이지
- `AUTH_REQUIRED`: 인증 필요, 색인 제외
- `OPERATOR_ONLY`: 관리자/모더레이션/운영자 전용
- `TEST_ONLY`: Test/스테이징 전용, 항상 색인 제외

초기 정책:

| 라우트 계열 | 상태 | canonical 정책 |
|---|---|---|
| `/en/`, `/ko/` | INDEXABLE_PUBLIC | 자기 자신 |
| `/en/guide/*`, `/ko/guide/*` | INDEXABLE_PUBLIC | 언어별 self-canonical + 상호 hreflang |
| 가상기업/세계관 페이지 | INDEXABLE_PUBLIC | 안정적인 ticker slug |
| 공개 시즌/아카이브 | INDEXABLE_PUBLIC | 안정적인 season slug |
| 용어집/도움말/안전센터 | INDEXABLE_PUBLIC | 안정적인 콘텐츠 slug |
| 공개 커뮤니티 목록 | 조건부 INDEXABLE_PUBLIC | 모더레이션·품질 게이트 통과 시 |
| 검색/정렬/필터 결과 | 기본 PUBLIC_NOINDEX | 중복이면 적절한 허브로 canonical |
| 계정/지갑/개인 포트폴리오 | AUTH_REQUIRED | 공개 canonical 없음 |
| 로그인/보안/동의/결제 | PUBLIC_NOINDEX 또는 AUTH_REQUIRED | crawl 가능하면 noindex |
| 관리자/모더레이션 큐 | OPERATOR_ONLY | 인증 + noindex 방어계층 |
| `test.easy-scraping.com` | TEST_ONLY | noindex, 운영 canonical 오발행 금지 |

## 3. canonical URL 계약

모든 색인 대상 페이지는 다음을 지킨다.

1. 절대경로 기반 canonical URL을 정확히 1개 출력한다.
2. 대응 번역 페이지가 있으면 같은 언어 페이지를 canonical로 사용한다.
3. 이동·폐기된 URL은 서버 리디렉션을 사용한다.
4. `robots.txt`를 canonical 용도로 사용하지 않는다.
5. 사이트맵·내부링크·canonical 신호가 일치해야 한다.
6. 정렬/필터/추적용 query parameter가 경쟁 canonical 페이지를 만들지 않게 한다.
7. hydration 이후 JavaScript가 올바른 서버 canonical을 다른 값으로 덮어쓰지 않는다.

운영/Test 교차 canonical이나 대량 중복 색인을 만들 수 있는 canonical 충돌은 출시 차단 결함이다.

## 4. EN/KO 현지화와 hreflang

영문/한국어 대응 페이지는 다음과 같이 운영한다.

- `/en/...`은 자신을 canonical로 지정한다.
- `/ko/...`는 자신을 canonical로 지정한다.
- 양쪽 페이지에 `hreflang="en"`, `hreflang="ko"`를 상호 연결한다.
- `x-default`는 실제로 유용한 언어선택/중립 홈이 있을 때만 사용한다.
- title, description, H1, 본문 언어가 locale과 일치해야 한다.
- 검색 키워드 확보만을 위한 미완성 번역 페이지는 색인하지 않는다.

번역 동등성은 SEO가 아니라 제품 품질 요구사항이기도 하다.

## 5. 사이트맵 구조

사이트맵은 전체 애플리케이션 라우트를 무작정 탐색해서 만들지 않고 검색 표면 등록부를 기준으로 생성한다.

권장 구조:

- `/sitemap.xml` — sitemap index
- `/sitemaps/pages-en.xml`
- `/sitemaps/pages-ko.xml`
- `/sitemaps/guides-en.xml`
- `/sitemaps/guides-ko.xml`
- `/sitemaps/companies.xml`
- `/sitemaps/seasons.xml`

규칙:

- canonical이며 색인 가능하고 200인 URL만 포함한다.
- 운영 HTTPS 절대 URL만 사용한다.
- 인증/개인정보/noindex/Test URL은 넣지 않는다.
- `lastmod`는 실제 검색 대상 콘텐츠가 의미 있게 바뀌었을 때만 갱신한다.
- 프로토콜 한도에 도달하기 전에 분할한다.
- Google Search Console과 네이버 서치어드바이저에 sitemap index를 제출한다.
- 관리자 화면에서 사이트맵 생성 상태와 마지막 성공시각을 확인할 수 있게 한다.

## 6. robots.txt와 noindex

`robots.txt`는 수집 제어용이며 개인정보 보호나 확실한 색인 제거 수단이 아니다.

- 민감정보는 먼저 인증/권한으로 보호한다.
- 크롤링 가능하지만 검색 결과에는 나오면 안 되는 페이지는 `noindex` meta 또는 `X-Robots-Tag`를 사용한다.
- crawler가 noindex를 읽어야 하는 URL을 robots.txt로 막지 않는다.
- 공개 페이지 렌더링에 필요한 JS/CSS는 수집 가능하게 한다.
- 운영 robots.txt에는 운영 sitemap 위치를 명시한다.
- Test는 색인 차단 상태를 유지하고 운영 canonical을 잘못 출력하지 않는다.

## 7. JavaScript/Next.js 렌더링 계약

색인 대상 페이지의 핵심 정보는 client interaction 없이도 유용한 HTML로 제공하는 것을 기본으로 한다.

필수:

- 주요 title/H1/본문/링크는 가능한 한 초기 HTML에 존재한다.
- canonical/hreflang/meta는 서버에서 결정적으로 생성한다.
- 수집 가능한 링크는 JavaScript 호출 문자열이 아니라 실제 `<a href>` URL을 사용한다.
- 렌더링에 필요한 JS/CSS 리소스는 crawler가 접근할 수 있어야 한다.
- 오류/로딩 skeleton을 영구 200 색인 콘텐츠처럼 노출하지 않는다.
- hydration으로 검색에 필요한 본문이 사라지지 않게 한다.

페이지의 핵심 검색 가치가 CSR에서만 생성되는 구조는 별도 검토 대상으로 본다.

## 8. 페이지네이션·무한스크롤·faceted navigation

대규모 목록과 커뮤니티 아카이브는 수집 가능해야 하지만 무한한 중복 URL을 만들면 안 된다.

### 페이지네이션

- `?page=2` 같은 안정적 URL을 가진다.
- 각 페이지가 다른 목록 내용을 가지면 self-canonical을 사용한다.
- 이전/다음 페이지 URL을 실제 링크로 제공한다.
- 단순히 중복 방지를 이유로 2페이지 이후를 모두 1페이지로 canonical하지 않는다.

### 무한스크롤

UI가 무한스크롤이어도 underlying pagination URL 모델이 있어야 한다. scroll event 없이 페이지 URL 직접 접근 시 해당 구간이 정상적으로 로드되어야 한다.

### 필터/정렬

기본은 `PUBLIC_NOINDEX`다. 특정 조합이 독립된 검색 의도와 유지관리되는 고유 콘텐츠를 가질 때만 색인 후보가 된다. 업종·정렬·가격·태그·날짜 조합을 대량 색인해 thin/doorway 페이지를 만드는 것은 금지한다.

## 9. 구조화 데이터

구조화 데이터는 실제 화면에 보이는 콘텐츠를 정확히 설명해야 하며 특수 검색 노출을 보장한다고 가정하지 않는다.

후보:

- 유효한 경우 `WebSite`/사이트 정체성 정보
- 계층형 공개 콘텐츠의 `BreadcrumbList`
- 요구사항을 만족하는 가이드/편집 콘텐츠의 `Article`
- 기타 schema는 당시 Google/Naver 지원여부 확인 후 사용

FAQ 리치결과를 SEO 전략의 전제로 삼지 않는다. 네이버는 2026년 7월 FAQ 구조화 데이터 검색 노출 종료를 공지했으며, Google 역시 대부분의 사이트에서 FAQ rich result 노출을 크게 축소·제거해 왔다. FAQ 본문 자체는 사용자 도움말로 계속 제공할 수 있다.

## 10. 공개 콘텐츠 품질 계약

모든 색인 페이지는 독립적인 사용자 가치를 제공해야 한다.

- 명확한 검색 의도와 title/H1
- 중복 템플릿이 아닌 유지관리되는 고유 본문
- 필요한 경우 작성자/출처/기준일
- 실제 도움이 되는 내부링크
- WDX/WLD 등 금융 유사 페이지에는 virtual/simulated 고지
- keyword stuffing, doorway, cloaking, 대량 저품질 AI 페이지 금지
- 가짜 리뷰, 추천, 자격, 금융 수익주장 금지

프로그램형 페이지는 실제 entity/data 가치가 있고 단순 키워드 치환 템플릿을 넘는 경우에만 허용한다.

## 11. 성능과 Core Web Vitals

검색 페이지와 광고 페이지는 같은 성능 예산을 공유한다.

75 percentile 목표:

- LCP <= 2.5초
- INP < 200ms
- CLS < 0.1

광고 슬롯은 공간을 미리 확보해 CLS를 줄이고, 검색 랜딩의 핵심 콘텐츠보다 선택형 광고/분석 스크립트를 우선하지 않는다. 수익화 실험으로 사용자 경험이 유의미하게 악화되면 롤백하거나 재설계한다.

## 12. 검색 운영 대시보드

최소 지표:

- locale/콘텐츠 계열별 indexed valid page 수
- sitemap 제출 URL 대비 색인 URL
- excluded/noindex/duplicate/canonical 문제 수
- crawl error 및 404/soft-404 추세
- Core Web Vitals 통과율
- organic impressions/clicks/CTR/평균위치
- non-brand organic session
- EN/KO organic split
- organic landing → signup → activation 전환
- 상위 landing/query cluster
- canonical mismatch 비율
- hreflang parity 오류
- sitemap 생성 실패
- Test/비공개 URL 발견 건수

Google과 Naver 수치는 구분해서 볼 수 있어야 한다.

## 13. 배포 게이트

공개 routing/rendering/metadata에 영향을 주는 런타임 변경은 운영 전 Test에서 다음을 확인한다.

1. 대표 공개 URL HTTP status 정상
2. canonical이 절대경로·정확한 locale·정확한 환경을 가리킴
3. EN/KO hreflang 상호연결
4. sitemap에 private/admin/auth URL 없음
5. Test noindex 유지
6. sitemap XML 검증 및 허용 URL만 포함
7. robots.txt가 공개 렌더링 핵심 리소스를 막지 않음
8. title/H1/본문이 rendered HTML에 존재
9. 구조화 데이터가 화면 내용과 일치
10. 모바일 레이아웃/Core Web Vitals 점검
11. 삭제된 페이지가 잘못된 200 soft-404로 나오지 않음

문서-only 변경은 Test 배포가 필요 없고, 런타임 SEO 변경은 필요하다.

## 14. 분석 이벤트

권장 이벤트:

- `search_landing_view`
- `search_landing_primary_cta`
- `search_signup_start`
- `search_signup_complete`
- `search_activation_complete`
- `public_content_internal_link_click`
- `locale_switch_from_search`
- `search_zero_result_internal`
- `sitemap_generation_success` / `failure`
- `canonical_validation_failure`
- `hreflang_validation_failure`

검색 attribution을 이유로 개인 지갑/포트폴리오/주문 내용을 광고 시스템에 전송하지 않는다.

## 15. 조사 기록 — 2026-09-13

직접 채택:

- Google Search Central 2026-07 사이트맵 가이드: canonical/indexable 절대 URL, 사이트맵 크기 제한, sitemap index 운영
- Google 2026-07 canonical 가이드: robots.txt는 canonical 수단이 아니며 canonical 신호 일관성, hreflang에서 같은 언어 canonical 우선, JavaScript의 충돌 canonical 방지
- Google Core Web Vitals 최신 가이드: LCP 2.5초, INP 200ms, CLS 0.1 목표
- 네이버 서치어드바이저 최신 가이드: 사이트맵을 주요 URL feed로 제출, 선호 URL/canonical 사용, 렌더링 핵심 리소스 수집 허용, 실제 href 링크 사용, 지원되는 구조화 데이터 활용
- 네이버 2026-07 공지: FAQ 구조화 데이터 검색 노출 종료

참고만 함:

- 구조화 데이터 지원·특수 노출은 검색엔진 정책 변경에 따라 달라질 수 있으며 markup이 노출을 보장하지 않는다.

## 16. 실제 서비스 검증

이번 회차 외부 확인에서 `https://easy-scraping.com`은 530/fetch failure를 반환했다. 따라서 운영 UI와 실제 검색 상태는 **`runtime verification unavailable`**로 기록하며, 문서만 보고 정상 운영 상태를 추정하지 않는다.

## 17. 완료 조건

검색 노출 운영은 다음이 충족되어야 완료된 것으로 본다.

- 모든 route family에 indexability 상태가 있음
- canonical/hreflang/sitemap/robots 정책이 서로 일치
- EN/KO 공개 콘텐츠 동등성 확인
- Test/private/admin/account 경로 안전한 색인 제외
- pagination/facet이 무한한 index 공간을 만들지 않음
- 공개 페이지의 모바일·접근성·성능 acceptance criteria 통과
- Google Search Console 및 네이버 서치어드바이저 운영 점검 담당/절차 정의
- 검색 유입→가입→활성화 분석이 개인정보·경제정보를 광고 시스템으로 유출하지 않음
- 영문/한국어 명세 동기화 유지
