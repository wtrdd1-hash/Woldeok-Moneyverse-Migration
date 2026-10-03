# Moneyverse 글로벌 성장 / 국제 SEO 심화 조사보고서 — v2026.10.03.510

상태: RESEARCH / 기획 입력
일자: 2026-10-03
exact-main 기준: `ac4dd484a90b266d945993d7bd8be57a74e8e1df`
기획 산출물: [GLOBAL_GROWTH_EXECUTION_SPEC.ko.md](../planning/GLOBAL_GROWTH_EXECUTION_SPEC.ko.md)

## 1. 범위와 증거 원칙

이번 회차는 v507의 글로벌 성장 아키텍처를 국제화·검색·콘텐츠품질·리텐션·광고/개인정보·시장출시의 구현준비형 수준으로 확장한다.

증거는 exact 저장소/소스 관측, 최신 1차자료 구현규칙, 대규모 discovery corpus, 아직 실측하지 않은 사업 가설로 분리한다. discovery 건수를 수동 전문검토라고 표현하지 않으며 거시 광고시장 규모를 Moneyverse 트래픽/RPM 예측으로 사용하지 않는다.

## 2. exact-main 핵심 발견

최신 main은 v509 기획 권위와 아직 중요한 차이가 있다. 런타임 default/fallback은 영어이고, 여러 중국어권 시장을 하나의 `zh`로 처리하며, GeoIP 추정 locale이 장기 선호 cookie에 저장된다. 미지원 locale prefix는 영어로 redirect되고 첫 요청의 URL locale과 cookie 기반 SSR 언어가 실제로 일치하는지 render 검증이 필요하다.

SEO 진실성에도 공백이 있다. backend GSC analytics와 frontend fallback이 synthetic 검색실적을 만들고, backend는 폐기된 Google sitemap ping을 호출한다. sitemap alternate와 `lastmod`가 실제 게시/콘텐츠변경 권위보다 기계적이며 200+ pSEO stock preset이 새 품질게이트 없이 config만으로 진입한다.

## 3. 신규 v510 Crossref discovery corpus

출처: Crossref REST API. 기간: 2015-01-01 ~ 2026-10-03. 방법: 30개 질의군 × 7,000건, DOI 소문자 우선/정규화 제목 fallback 중복제거.

- raw 검색 레코드: **210,000건**;
- v510 내부 중복제거 후보: **121,320건**;
- API 수집 오류: **0건**;
- unique-manifest SHA-256: `f16c6deceb18fa96fdd7b1132b2fc58e13f908899d477c9ce252a897adae7704`.

질의군은 SEO, IR/ranking, query intent, multilingual IR, localization, 번역품질, crawl/index, canonical/sitemap, semantic/structured data, 웹성능, 접근성, 콘텐츠품질, spam detection, 검색 analytics, recommender, community retention, 광고측정, contextual ads, ad fraud, privacy/ads, geo-personalization, international marketing, cross-cultural UX, NLP/search, generative-AI search, knowledge graph, mobile web, conversion/retention, UGC trust/safety, privacy regulation을 포함한다.

이전 v507 corpus는 별도다: raw 150,000건, v507 내부 중복제거 121,810건, SHA-256 `4dc89e5af460f6bbbbea4ae68a923f9cab6b6c8a274eaff5787c77a05d95b729`.

두 회차 raw 조회는 합계 **360,000건**이지만 두 corpus 전체를 교차중복 제거하지 않았으므로 합산 unique 수는 주장하지 않는다.

## 4. 직접 채택한 최신 1차자료 규칙

Google 국제검색 지침에 맞춰 실제 대응페이지는 안정적인 언어별 URL과 hreflang을 사용하고, IP 의존 동작을 locale 발견수단으로 삼지 않는다. 따라서 Moneyverse는 명시 locale URL을 유지하고 GeoIP는 추천 신호로만 사용한다.

Google의 people-first/spam 지침에 따라 번역·생성·programmatic family는 독립 사용자 가치가 있을 때만 색인한다. canonical·내부링크·sitemap·redirect 신호를 정합화하고 `lastmod`는 실제 색인콘텐츠의 의미있는 변경을 반영한다. Google의 비인증 sitemap ping은 폐기됐으므로 현재 backend 호출은 제거대상이다.

공개 유입페이지는 crawler가 읽을 수 있는 서버출력에 주요 가치와 안정 metadata를 제공한다. Image·video·Discover·structured data는 추가 검색면이며 schema는 실제 화면내용과 일치해야 하고 노출을 보장하지 않는다.

Search Console은 실제 사이트 성과, Keyword Planner 등 명시 공급자는 시장수요 추정이다. live 성과가 없으면 없는 상태를 유지하며 생성값으로 대체하지 않는다.

## 5. 국제화와 접근성

BCP 47을 언어태그 계약으로, Unicode CLDR/UTS #35를 날짜·숫자·통화·복수형·시간대 데이터 기준으로 사용한다. HTML `lang`은 실제 주언어와 일치하고 다른 언어 구간은 language-of-parts를 사용한다. 국제 공개화면은 WCAG 2.2 AA를 프로젝트 접근성 기준선으로 유지한다.

번체/간체 및 향후 RTL locale은 단순 문자열 치환이 아니라 별도 현지화/제품 결정으로 관리한다.

## 6. 광고·개인정보·미성년

v510 국제 광고 기본은 contextual/non-personalized이며 시장별 정책이 허용할 때만 확대한다. 적용되는 EEA/UK/Swiss 동의흐름은 해당 certified CMP 경로를 사용하고, 미성년자 보호·회원국별 아동동의연령·미국 아동 개인정보 규칙을 하나의 전역 상수가 아니라 별도 정책입력으로 처리한다.

invalid traffic, 오인 배치, 보상형 상호작용, 가짜 광고/검색 telemetry는 승격차단이다. 따라서 하나의 전역 광고 switch보다 시장·연령·동의·페이지민감도를 포함한 서버 `AdPolicy`가 필요하다.

## 7. 채택 기획 결론

1. SEO 확대 전에 P0 진실성 복구: 한국어 런타임 기본값 + 가짜 없는 검색 telemetry.
2. 수동 언어선호와 추정 추천을 분리한다.
3. locale URL은 route-family별 준비상태에 따라 게시한다.
4. 하나의 서버 SEO read model이 canonical/robots/sitemap/hreflang/structured-data locale을 생성한다.
5. pSEO에는 입장, 표본 QA, owner/refresh SLA, 퇴출규칙이 필요하다.
6. 번역은 source-hash stale 상태를 가진 버전형 콘텐츠 lifecycle이다.
7. 해외 제품가치는 URL 양보다 utility/onboarding/knowledge/translation UX/timezone/discovery/retention/share 기능을 우선한다.
8. 시장출시는 readiness state machine과 locale 1개씩 확대하는 방식으로 운영한다.
9. 광고 확대는 개인정보/미성년/동의 + 실측 contribution으로 결정한다.
10. 런타임 구현은 별도 exact-SHA Test/Production 증거 회차다.

## 8. 1차자료 레지스트리

직접 확인한 Google Search Central/Search Console/Ads/AdSense, Naver Search Advisor, IndexNow, IETF BCP 47, Unicode CLDR, W3C 국제화/WCAG, EU DSA/개인정보, FTC 아동 개인정보 자료는 `GLOBAL_GROWTH_EXECUTION_SPEC.ko.md §18`에 유지한다.

이 문서는 조사/기획 근거이며 법률의견이나 특정 국가 출시승인을 의미하지 않는다.
