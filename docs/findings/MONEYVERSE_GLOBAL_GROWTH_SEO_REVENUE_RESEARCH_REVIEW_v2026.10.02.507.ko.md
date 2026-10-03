# Moneyverse 글로벌 성장·SEO·광고수익 조사 검토 — v2026.10.02.507

상태: RESEARCH / 기획 입력
일자: 2026-10-02
시작/중간 origin/main: 5a7c658b38853f564983d19f961c689a494dc4b6
기획 권위: GLOBAL_GROWTH_SEO_REVENUE_SPEC.ko.md

## 1. 저장소·런타임 근거

현재 main:
- locale.ts 기본값은 en, 지원은 ko/en/ja/zh 중심;
- 대부분 국가 GeoIP는 영어로 향함;
- frontend TS/TSX 한글 포함 파일 565개;
- binary-English locale 패턴 51개;
- backend SEO에 Math.random 기반 realistic 시계열;
- frontend GSC fallback에 고정 clicks/impressions/query 값.

따라서 생성/fallback GSC 값은 실제 Search Console 근거로 인정하지 않는다.

이번 회차 관측 identity:
- Production API SHA 7080738e656aca099d5c871278d178d69a984fcc;
- Test API/frontend SHA f61680c6d4b8b8df7598dbf3e29eb9e56f0a7464;
- origin/main 5a7c658b38853f564983d19f961c689a494dc4b6.

서로 다르므로 배포 완료를 주장하지 않는다.

## 2. 10만+ broad discovery corpus

Crossref REST API 16개 SEO/IR/현지화/성능/분석 lane:
- raw 150,000;
- DOI 우선/제목 보조 중복제거 121,810;
- manifest SHA-256 4dc89e5af460f6bbbbea4ae68a923f9cab6b6c8a274eaff5787c77a05d95b729.

이는 조사 후보 폭이며 121,810건을 모두 수동 검토했거나 직접 SEO 근거라는 주장이 아니다.

## 3. 직접 채택 검색 근거

Search Console:
https://support.google.com/webmasters/answer/7576553

실제 사이트 clicks/impressions/CTR/position을 query/page/country/device 등으로 측정한다. 시장 전체 검색량과 구분한다.

Keyword Planner:
https://support.google.com/google-ads/answer/7337243

시장 키워드 수요 추정에는 Keyword Planner 또는 명시 공급자를 사용하고 provider/국가/언어/기간/기준일을 저장한다.

다국어 검색:
https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages
https://developers.google.com/search/docs/advanced/crawling/localized-versions

언어별 URL, 실제 동등페이지 hreflang, 명확한 visible language를 사용한다. 명시 언어 URL은 IP로 강제 전환하지 않는다. Moneyverse의 GeoIP는 공개 색인 페이지에서 언어 추천/selector에 쓰고, 비색인 앱 온보딩에서는 첫 기본값으로 사용할 수 있다.

Spam policy:
https://developers.google.com/search/docs/essentials/spam-policies

검색순위 조작 목적의 얇은 대량 생성은 금지한다. 고정 URL 개수 목표를 SEO 성공지표에서 제거한다.

Core Web Vitals:
https://developers.google.com/search/docs/appearance/core-web-vitals

목표: LCP 2.5초 이내, INP 200ms 미만, CLS 0.1 미만.

Images:
https://developers.google.com/search/docs/appearance/google-images

Video:
https://developers.google.com/search/docs/appearance/video

Discover:
https://developers.google.com/search/docs/appearance/google-discover

Structured data:
https://developers.google.com/search/docs/appearance/structured-data/sd-policies

일반검색 외 이미지/영상/Discover를 별도 획득면으로 관리하되, Discover는 보조 채널로 본다. structured data는 visible content와 일치해야 하며 rich result를 보장하지 않는다.

## 4. 광고 근거

AdSense Auto Ads experiments:
https://support.google.com/adsense/answer/9726342

광고량/형식을 가정으로 확대하지 않고 실험으로 비교한다. revenue lift만으로 채택하지 않고 UX/CWV/정책/invalid-traffic 가드레일을 함께 본다.

## 5. 시장 맥락

미국 IAB/PwC: 2025 인터넷 광고수익 약 USD 300B, 전년 대비 13.9% 성장.
https://www.iab.com/insights/internet-advertising-revenue-report-full-year-2025/

유럽 IAB Europe: 2025 디지털 광고시장 EUR 131B, 10.5% 성장.
https://iabeurope.eu/knowledge_hub/iab-europe-adex-benchmark-2025-report/

일본 Dentsu: 2025 인터넷 광고비 JPY 4,045.9B, 10.8% 성장, 전체 광고의 50.2%.
https://www.dentsu.co.jp/en/news/release/2026/0305-011006.html

이 수치는 해외 시장 테스트 근거일 뿐 Moneyverse RPM/수익 예측값이 아니다.

## 6. 채택 결론

1. 제품/공개 fallback은 한국어.
2. GeoIP는 추천/비색인 온보딩 기본값이며 canonical 신호가 아님.
3. 영어·일본어 우선, 이후 DE/FR/ES/pt-BR.
4. 검색량은 provenance가 있는 실제/추정 데이터만 사용.
5. pSEO는 페이지수가 아니라 독립 가치 게이트.
6. 해외 계산기·가상경제 도구·가이드/용어집/세계관·온보딩·시간대·UGC 번역·리텐션 기능 확대.
7. 일반검색·이미지·영상·Discover 분리 측정.
8. 현금수익은 광고 전용.
9. 실제 Page RPM/자격 자연검색 세션당 수익에서 증분 운영비를 차감해 시장 확대 판단.
10. written spec/implementation plan 검토 전 코드 구현 금지.
