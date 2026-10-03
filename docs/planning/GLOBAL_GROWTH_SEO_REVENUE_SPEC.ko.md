# Woldeok Moneyverse — 글로벌 성장·해외 SEO·광고수익 명세

> 버전: v2026.10.02.507
> 상태: PLANNING / 아키텍처 설계
> 일자: 2026-10-02
> 권위 채택: 2026-10-03 v2026.10.03.509에서 현재 기획 권위로 통합됨.
> 영문 정본: [GLOBAL_GROWTH_SEO_REVENUE_SPEC.md](GLOBAL_GROWTH_SEO_REVENUE_SPEC.md)
> 상위 권위: [PROJECT_PLAN.ko.md](PROJECT_PLAN.ko.md)
> v510 상세 실행 권위: [GLOBAL_GROWTH_EXECUTION_SPEC.ko.md](GLOBAL_GROWTH_EXECUTION_SPEC.ko.md)

## 1. 목표와 비타협 제약

Moneyverse는 **한국어 기본 글로벌 가상경제 서비스**로 해외 확장한다. 성공 기준은 생성 URL 개수가 아니다.

검색수요 -> 실제 유용한 공개 기능/콘텐츠 -> 두 번째 유용 행동 -> 가입 -> 활성화 -> 재방문 -> 자격 있는 페이지뷰 증가 -> 측정된 광고수익

현재 권위:

- 제품/공개 사이트 기본 locale은 한국어(ko)다.
- GeoIP는 최초 방문의 번역 추천·언어 선택 기본값에 사용할 수 있다. 색인 가능한 공개 페이지는 IP만으로 다른 언어 URL에 강제 이동시키지 않는다.
- 명시 locale URL/쿼리와 사용자가 저장한 언어 선택은 항상 GeoIP보다 우선한다.
- 언어는 법적 관할, 결제 국가, 연령정책, 기능 허용 여부를 결정하지 않는다.
- 사업자/세무/법무 권위가 확장되기 전까지 현금 수익화는 광고 전용이다.
- 비공개·경제거래·보안·관리자 화면은 SEO/광고 인벤토리가 아니다.
- 검색 성장은 얇은 대량 페이지, 무효 트래픽, 조작용 자동생성, 가짜 지표가 아니라 자격 있는 실제 사람과 people-first 가치를 최적화한다.

이 명세는 제품 기본 언어를 영어 neutral/default로 표현한 과거 문구를 supersede한다. 유지 문서의 영어 정본 + 한국어 필수 2차 언어 정책은 유지한다.

## 2. 현재 증거 기준과 권위 드리프트

시작 SHA 5a7c658b38853f564983d19f961c689a494dc4b6 기준:

- frontend/src/lib/locale.ts는 아직 DEFAULT_LOCALE = en이다.
- 소스 locale은 ko, en, ja, zh 중심이다.
- GeoIP는 대부분의 KR/JP/중화권 외 국가를 영어로 보낸다.
- frontend TS/TSX 565개 파일에 한글이 있고 51개 파일은 binary-English locale 패턴과 일치한다.
- backend GSC 분석에 Math.random() 기반 “realistic” 시계열이 남아 있다.
- frontend GSC fallback에는 고정 clicks/impressions/query 값이 있다.
- 따라서 생성/fallback GSC 숫자는 검색량 근거로 사용할 수 없다.
- Production/Test 런타임 identity가 현재 origin/main과 다르므로 v507은 구현 완료를 주장하지 않는다.

## 3. Locale 아키텍처: 한국어 기본 + GeoIP 보조 번역

### 3.1 사람 트래픽 우선순위

1. /en/..., /ja/..., /de/... 같은 명시 locale URL;
2. 통제된 언어전환 플로우의 명시 locale query;
3. 사용자가 저장한 언어;
4. 공개 색인 페이지에서는 GeoIP 기반 언어 추천/selector 기본값; 비색인 앱 온보딩에서는 게시 locale 자동 기본선택 허용;
5. 지원되는 Accept-Language 추천;
6. 한국어 fallback.

사용자가 직접 선택한 언어는 IP가 바뀌어도 덮어쓰지 않는다.

### 3.2 크롤러와 명시 언어 URL

GeoIP는 UX 초기화 신호이지 canonical 신호가 아니다.

- Googlebot/Bingbot/NaverBot 등을 IP로 언어 URL 간 강제 이동시키지 않는다.
- /en/guide/x는 접속 국가와 무관하게 영어 URL로 유지한다.
- 게시된 언어 URL은 self-canonical이다.
- hreflang은 실제 게시된 동일 의미 문서만 상호 연결한다.
- 유용한 중립 selector가 생기기 전에는 한국어 root를 명시 fallback인 x-default로 사용할 수 있다.
- DRAFT/STALE/혼합언어 번역은 noindex, sitemap/hreflang 제외다.

### 3.3 국가 -> locale 출시 레지스트리

| 웨이브 | 국가/시장 예시 | 선호 locale | 출시 조건 |
|---|---|---|---|
| 0 | KR | ko | 기본/현재 코어 |
| 1A | US, GB, CA-English, AU, NZ, IE | en | 영어 품질/SEO 게이트 |
| 1B | JP | ja | 일본어 parity + native review |
| 2A | DE, AT, 독일어권 CH | de | 번역 + 개인정보/광고 검토 |
| 2B | FR, 프랑스어권 BE/CH | fr | 번역 + 개인정보/광고 검토 |
| 2C | ES 및 검증된 스페인어 시장 | es | 번역 + 시장 검토 |
| 2D | BR | pt-BR | 번역 + 시장 검토 |
| 이후 | TW 등 검토된 번체중문 시장 | zh-TW | 수요/컴플라이언스 승인 |
| 출시 차단 | 중국 본토 상업 타기팅 | 없음 | 별도 유통/컴플라이언스 프로젝트 |

미매핑 국가는 지원 브라우저 언어가 있으면 사용하고 없으면 한국어다. Locale과 jurisdiction은 별개다.

## 4. 해외 사용자 기능 포트폴리오

### 4.1 공개 유틸리티

- 퍼센트 증감 계산기;
- 복리성장 교육 계산기;
- 손익분기 계산기;
- 기준일/출처가 있는 범용 환율·단위 변환기;
- 세계시간/시간대 변환기;
- Moneyverse WLD 수익 계획기;
- 가상 직업 수입 비교;
- 가상 사업 손익분기 시뮬레이터;
- 가상 아이템 가치 비교;
- 가상 WDX 시나리오 시뮬레이터;
- 가상경제 인플레이션/공급량 시뮬레이터;
- 퀘스트/보상 계획 계산기.

검색 방문자는 가입 전에도 핵심 결과를 얻는다. 기록 저장, preset, 소셜 비교, 계속 플레이는 로그인 기능으로 연결할 수 있다.

실제 증권 가격 가정, 세금/법률 결론, 투자추천, 수익 보장을 현재 사실처럼 제공하지 않는다.

### 4.2 지식/검색 레이어

- locale별 입문 가이드;
- 가상경제 용어집;
- 가상기업/섹터 세계관;
- WDX 설명/이벤트 아카이브;
- 직업/사업/수집/퀘스트 가이드;
- 안전/운영/계정 도움말;
- 지속 가치가 있는 변경/이벤트 해설;
- 품질·독창성·모더레이션 게이트를 통과한 공개 커뮤니티 가이드.

### 4.3 해외 재방문 기능

- 현지화 첫 세션 온보딩;
- locale 기반 날짜/시간/숫자/통화 표시;
- 국가와 독립적인 언어 선택;
- 라벨이 있는 선택적 UGC 번역;
- 언어/커뮤니티 탐색 필터;
- 시간대 대응 이벤트 캘린더;
- 부정행위 방지 자격이 있는 글로벌/국가/locale 리더보드;
- 현지화 주간 리캡/복귀 미션;
- 현지화 공유 카드/업적 요약;
- 계산기 preset/최근 가이드 저장;
- 충분한 집계량이 있을 때의 국가/locale 트렌드.

## 5. 검색수요 운영 시스템

### 5.1 증거 상태

LIVE_SEARCH_CONSOLE, LIVE_NAVER, KEYWORD_PLANNER_ESTIMATE, OTHER_PROVIDER_ESTIMATE, NO_DATA, NOT_CONNECTED, FETCH_ERROR.

- Search Console은 실제 사이트 노출/클릭/CTR/위치를 측정하며 시장 전체 검색량과 다르다.
- Keyword Planner 또는 명시 공급자는 시장 검색수요 추정치를 제공할 수 있다.
- 추정 검색량이 실제 GSC 성과를 덮어쓰지 않는다.
- synthetic fixture는 Test/dev에서만 SYNTHETIC_TEST_DATA로 표시한다.
- Production/admin은 생성 숫자를 live 성과처럼 보여주면 안 된다.

### 5.2 기회 큐

- 노출 높음/CTR 낮음: title·검색의도·첫 문단 개선.
- 순위 5~20: 실제 유용성·내부링크·예시·미디어 보강.
- 상승 query: 지속수요 검증 후 발행.
- landing 누락: 독립 사용자 작업이 있을 때만 생성.
- cannibalization: 같은 의도 URL 통합.
- 국가-언어 gap: 이미 수요가 검증된 페이지 우선 번역.
- 유입 높음/활성화 낮음: SEO 페이지보다 제품 연결 개선.
- 활성화 높음/노출 낮음: 검색발견/내부링크 확대.
- 수익효율 landing: 품질/retention이 유지될 때 인접 콘텐츠 확장.

### 5.3 우선순위

Opportunity = 수요근거 × 순위/CTR gap × 제품연관성 × 독립가치 × 현지화준비도 × retention 잠재력 × 광고적합성 × 컴플라이언스 신뢰도.

결과는 P0/P1/P2/HOLD 우선순위이며 검색순위나 수익 보장이 아니다.

## 6. 최대 자격검색 유입을 위한 검색 아키텍처

### 6.1 검색면
Google/Naver 일반 검색, Google Images, video 결과, 보조 채널 Discover, 브랜드/비브랜드 query, locale/country query cluster를 별도 측정한다.

### 6.2 기술 계약

모든 indexable 페이지는 crawl-safe SSR/ISR, 안정적 self-canonical 하나, 주언어 일치, 실제 crawlable internal link/breadcrumb, 품질승인 sitemap, 의미 있는 lastmod, 실제 404/410/redirect, CLS 보호, p75 LCP 2.5초 이하/INP 200ms 미만/CLS 0.1 미만, Test/private/account/admin/transaction 색인 제외를 만족한다.

### 6.3 다국어 게시 게이트

본문/title/meta/H1/breadcrumb/alt/structured data/nav/CTA가 target locale에 맞고, self-canonical, reciprocal hreflang, PUBLISHED 상태, native/product review, 필요한 legal/safety review, 치명적인 혼합언어 fallback 없음이 모두 필요하다.

### 6.4 내부링크 그래프

tool -> 관련 guide -> 실제 Moneyverse 기능, guide -> glossary/company/event, company/event -> guide/tool, authority hub -> 검토된 child 구조를 사용한다. Orphan indexable page와 keyword footer link farm은 금지한다.

## 7. Programmatic SEO 허용 게이트

고정 “2만 페이지” 목표를 성공지표로 사용하지 않는다.

1. 독립 entity/task/query intent;
2. keyword 치환이 아닌 유지관리 데이터/계산;
3. 광고 전에 실제 유용 결과;
4. 시의성 데이터 출처/기준일;
5. 가짜 현재 가격·세율·법률결론 없음;
6. 투자권유/수익보장 없음;
7. canonical/internal link/sitemap 정확성;
8. 품질표본/중복/cannibalization 검증;
9. 측정 가능한 검색/engagement 목적;
10. 수요/품질 약화 시 deindex/통합 경로.

가치 없는 대량 번역/AI 생성은 SEO 전략이 아니다.

## 8. 이미지·영상·Discover 획득

이미지는 설명용 원본/제품 일러스트·차트, 서술적 filename/alt, 관련 본문 근처 배치, crawlable URL, responsive 최적화를 적용한다.

영상은 복잡한 고가치 도구/게임 시스템의 이해를 높일 때만 현지화 explainer를 만들고 관련 landing에 embed하며 정확한 title/description/thumbnail과 video Search Console 지표를 사용한다.

Discover는 보조 채널이며 정확한 비클릭베이트 제목, 큰 고품질 이미지, 우수한 page experience를 갖춘 실제 콘텐츠만 노린다.

## 9. 광고 전용 글로벌 수익 아키텍처

월 광고수익 = pageviews / 1,000 × 실제 관측 Page RPM

자연검색 1,000세션당 수익 = pages/session × 실제 페이지 수익률

필수 차원: country × locale × landing_family × device × source × consent_state.

| 월 총 광고수익 목표 | Page RPM 5,000원 | Page RPM 10,000원 | Page RPM 20,000원 |
|---:|---:|---:|---:|
| 100만 원 | 20만 PV | 10만 PV | 5만 PV |
| 500만 원 | 100만 PV | 50만 PV | 25만 PV |
| 1,000만 원 | 200만 PV | 100만 PV | 50만 PV |

이는 산술 시나리오이며 예측이 아니다. 실제 RPM, fill, 무효트래픽 조정, 세금, 운영비가 실현 이익을 결정한다.

증분 기여 = 증분 광고수익 - 번역 - 콘텐츠 - 모더레이션 - 인프라 - 개인정보/컴플라이언스 - 지원 비용.

wallet/transfer/lending/order/private account/security/admin/casino/chance 등 민감면 광고 차단은 유지한다.

## 10. 시장 출시 전략

Phase 0: 검색 데이터 provenance 수정, / 한국어, 혼합언어/canonical 수정, 실제 query/page/country/device baseline, route별 index/ad 분류.

Phase 1: 영어+일본어 고가치 tool/guide부터 번역, onboarding/utility/knowledge parity, native search intent metadata, 국가별 discovery/event-time 표시, 실제 검색/광고경제 비교.

Phase 2: 독일어·프랑스어·스페인어·브라질 포르투갈어를 개인정보/광고/번역 게이트 후 한 locale씩 출시.

Phase 3: 잘되는 tool/guide/entity cluster, 이미지/영상, internal hub를 확장하고 약한/중복 페이지는 통합/noindex한다.

## 11. KPI 트리

검색: submitted/indexed, impressions/clicks/CTR, qualified query 수, non-brand 비중, top3/top10/top20 진단, image/video/Discover, country/locale coverage, orphan/canonical/hreflang 오류.

제품: landing -> 2번째 유용 페이지, signup, 첫 activation, D1/D7/D30, saved tool/preset, 반복 복귀.

수익: finalized/estimated 분리, Page RPM/ad RPM, 자연검색 1,000세션당 수익, qualified session당 pages, country/locale/content/device 수익, invalid traffic/정책 경고.

가드레일: LCP/INP/CLS, 번역 품질 실패, 고객불만/모더레이션 비용, consent/광고정책 사고, manual action, thin/duplicate 비율.

## 12. 해외 성장 실험 backlog

1. 검색 explicit URL을 보존한 비검색 신규 방문 IP 보조 locale.
2. 고노출/저CTR title/intro 개선.
3. tool result -> guide -> signup.
4. 현지화 onboarding.
5. 사이트 전체보다 고가치 계산기 EN/JA 우선.
6. 큰 원본 설명 이미지.
7. 복잡한 tool의 explainer video.
8. private data 없는 content-family별 “Moneyverse에서 계속하기”.
9. 순위 5~20 internal hub 강화.
10. CWV/작업완료/invalid-traffic 가드레일 광고 실험.

## 13. Release/QA 게이트

exact SHA Test, locale 우선순위, crawler GeoIP 강제이동 없음, locale과 jurisdiction 분리, 번역완료/혼합언어 검사, canonical/hreflang/sitemap, GSC/Naver 오류시 가짜 성공 데이터 없음, pSEO 품질표본, image/video metadata 정확성, 광고 route fail-closed, responsive/a11y/CWV, Test noindex, zero-downtime 승격/rollback이 필요하다.

## 14. 조사 근거

2026-10-02 broad discovery corpus:

- Crossref REST API;
- SEO/IR/localization/performance/analytics 16개 lane;
- raw 150,000건;
- DOI-first/title-fallback dedup 121,810건;
- manifest SHA-256 4dc89e5af460f6bbbbea4ae68a923f9cab6b6c8a274eaff5787c77a05d95b729.

이는 조사 후보 폭이며 전부를 수동 검토했거나 모두 직접 SEO 근거라는 뜻이 아니다. 실제 구현 규칙은 최신 1차 공식 자료를 우선한다.

## 15. 이 설계의 완료 정의

한국어 default+GeoIP 보조, 해외 기능/시장 wave, synthetic 운영 검색데이터 금지, thin scaled expansion 차단, text/image/video/Discover 획득, 실제 관측 광고경제, EN/KO 상위기획 연결, 런타임 완료 허위 주장 금지가 모두 명확해야 한다.

이 문서 검토 후 별도 구현계획을 승인해야 코드 구현을 시작한다.
