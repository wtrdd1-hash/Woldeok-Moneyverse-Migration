# 월덕 머니버스 — 글로벌 성장·국제 SEO·해외 서비스 실행 명세

> 버전: v2026.10.03.510
> 상태: PLANNING / 구현준비형 상세기획
> 일자: 2026-10-03
> 영문 정본: [GLOBAL_GROWTH_EXECUTION_SPEC.md](GLOBAL_GROWTH_EXECUTION_SPEC.md)
> 상위 권위: [PROJECT_PLAN.ko.md](PROJECT_PLAN.ko.md)
> 상위 설계: [GLOBAL_GROWTH_SEO_REVENUE_SPEC.ko.md](GLOBAL_GROWTH_SEO_REVENUE_SPEC.ko.md)
> 런타임 완료 주장: 없음

## 1. 목적과 권위

이 문서는 v507/v509 글로벌 성장 권위를 실제 개발 backlog로 내린다. 기존 상위 설계를 대체하지 않고, 구현 완료를 주장하기 전에 필요한 상태모델·데이터 계약·출시 게이트·QA·관측·수용조건을 구체화한다.

비타협 권위:
- 제품/공개 fallback locale은 한국어(`ko`)다.
- 명시 locale URL과 사용자가 직접 저장한 언어가 GeoIP·`Accept-Language`보다 우선한다.
- GeoIP는 추천/부트스트랩 신호이며 검색 canonical 결정수단이 아니다.
- locale, 법적 관할, 결제국가, 연령정책, 시간대, 동의지역은 서로 독립된 정책축이다.
- 검색 성장은 사람 우선·가치 게이트 방식이며 페이지 수 목표가 얇은 대량 콘텐츠를 정당화하지 않는다.
- 사업/세무/법률 권위가 명시적으로 바뀌기 전까지 현금수익은 광고 전용이다.
- 비공개·계정·보안·거래·운영자 화면은 공개 SEO/광고 인벤토리에서 제외한다.

## 2. exact-main 구현 공백 레지스터

검토 기준: `origin/main=ac4dd484a90b266d945993d7bd8be57a74e8e1df`.

| Gap | 심각도 | 현재 증거 | 목표 상태 |
|---|---|---|---|
| G510-LOC-01 | P0 권위 드리프트 | `frontend/src/lib/locale.ts`의 `DEFAULT_LOCALE='en'`, 미지원 언어도 영어 fallback | 런타임 fallback을 `ko`로 통일하고 숨은 영어 기본경로가 없음을 테스트 |
| G510-LOC-02 | P1 | GeoIP 추정 언어를 수동 선호와 같은 1년 `LOCALE_COOKIE`에 기록 | 추정 추천은 별도 단기 신호, 사용자의 명시 행동만 수동 선호에 기록 |
| G510-LOC-03 | P1 | CN/TW/HK/MO/SG를 단일 `zh` 및 Simplified SEO 태그로 취급 | 문자체계·시장 처리를 분리하고 번체를 간체로 묵시 대체하지 않음 |
| G510-LOC-04 | P1 VERIFY | prefix URL은 내부 rewrite지만 SSR layout/metadata는 cookie 중심 | 빈 cookie 첫 요청에서 URL locale, `html lang`, 화면언어, canonical, OG locale 일치 검증 |
| G510-LOC-05 | P1 | `/fr/*`, `/de/*` 같은 미지원 prefix를 영어로 redirect | 미게시 locale 동작을 명시하고 오해성 cross-language canonical 생성 금지 |
| G510-SEO-01 | P0 진실성 | backend GSC에 `Math.random()`, frontend fallback에 고정 클릭/노출 및 credential 성공값 | 운영은 `NOT_CONNECTED/FETCH_ERROR/NO_DATA/LIVE`; synthetic은 test 전용 및 명시표시 |
| G510-SEO-02 | P1 | 폐기된 Google 비인증 sitemap ping 호출, 실패를 200으로 바꿈 | ping 제거, robots/Search Console/API 사용, 실제 응답상태 보존 |
| G510-SEO-03 | P1 | sitemap이 모든 route에 locale alternates 기계적 생성 | 게시·200·품질승인된 실제 대응 locale에만 alternate 생성 |
| G510-SEO-04 | P1 | static sitemap `lastmod`가 고정 배포시각 | 실제 색인 콘텐츠의 의미있는 변경 권위에서 lastmod 생성 |
| G510-PSEO-01 | P1 | 200+ stock preset을 config 등록만으로 sitemap에 수록 | intent·계산/데이터·표본 QA·중복·퇴출 게이트 통과 후만 색인 |
| G510-I18N-01 | P1 | locale metadata는 번역됐지만 본문은 한국어가 큰 비중 | metadata-only가 아니라 visible primary-content parity를 색인 조건으로 함 |
| G510-OBS-01 | P1 | 관리자 SEO가 fallback/synthetic 값을 운영값처럼 표시 가능 | 모든 지표에 source/observedAt/freshness/status/artifactRef 부여 |
| G510-CONTENT-01 | P1 | 일부 공개 계산기 문구가 현실 세율·금융사실을 정적 상수처럼 표현 | 출처·시행일·시장·면책·법률검토 상태를 데이터화하고 stale 시 색인/기능 차단 |

## 3. Locale·국가·사용자선호 아키텍처

### 3.1 서버 권위 컨텍스트

모든 요청에서 `LocaleContext`를 해석한다.

`{urlLocale,savedLocale,recommendedLocale,effectiveLocale,jurisdiction,billingCountry,timeZone,currency,consentRegion,agePolicy,sourceSignals,policyVersion}`

규칙:
1. 유효한 명시 locale URL은 해당 URL의 콘텐츠 언어를 결정한다.
2. 명시 URL locale이 없으면 사용자가 직접 저장한 locale이 앱/UI 선호를 결정한다.
3. GeoIP와 `Accept-Language`는 `recommendedLocale`만 만들고 수동 선호로 자동 승격하지 않는다.
4. 최종 제품/공개 fallback은 한국어다.
5. 언어변경으로 관할·연령·결제·광고동의·규제기능 자격이 바뀌지 않는다.
6. crawler는 요청 URL의 일반 공개동작을 받으며 crawler 신원으로 데이터 접근을 우회하지 않는다.
7. 언어 추천만을 위해 raw IP를 저장하지 않는다. 명시 목적과 보존정책이 있을 때만 coarse country를 별도 기록한다.

### 3.2 URL 계약

- 한국어 canonical: prefix 없는 root/path, 예: `/tools`.
- `/ko/*`: 같은 한국어 canonical로 permanent redirect alias.
- 게시된 다른 locale: `/en/*`, `/ja/*`, 이후 `/de/*`, `/fr/*`, `/es/*`, `/pt-br/*`.
- `en-GB` 같은 지역 variant는 화면 내용/정책이 실질적으로 다를 때만 생성한다.
- locale prefix는 route family가 해당 locale에서 `PUBLISHED`일 때만 routable/indexable하다.
- 미지원/미게시 prefix를 영어로 조용히 바꾸지 않는다. 실제 replacement가 없으면 locale-not-available + 적절한 404/noindex를 사용한다.
- query-string 언어는 전환 UX에만 쓰고 canonical 공개 URL로 사용하지 않는다.

### 3.3 국제화 표준

BCP 47 태그와 CLDR 데이터를 날짜·숫자·통화·복수형·정렬·시간대에 사용한다. HTML `lang`은 실제 주언어와 일치해야 하며 UGC/인용문의 언어가 다르면 language-of-parts를 적용한다. RTL locale은 향후 별도 출시게이트로 다룬다.

## 4. 번역·현지화 생명주기

각 번역자산:
`{assetId,sourceLocale,sourceHash,targetLocale,status,method,translator,reviewer,glossaryVersion,legalReview,seoReview,updatedAt,publishedAt,staleAt}`

상태:
`SOURCE -> MACHINE_DRAFT|HUMAN_DRAFT -> PRODUCT_REVIEW -> NATIVE_REVIEW -> LEGAL_REVIEW(필요시) -> SEO_REVIEW -> PUBLISHED -> STALE|REVOKED`.

게시 규칙:
- 기계/AI 초안은 자동 색인하지 않는다.
- source hash가 바뀌면 종속 번역은 `STALE`.
- 약관·개인정보·환불·연령·안전·카지노 문구는 stale 번역으로 fallback 금지.
- 공개 editorial/tool 페이지는 목표언어의 primary content 검수 후 색인.
- UGC 번역은 선택형·번역표시·원문 접근을 보장하고 기본적으로 별도 색인 사본을 만들지 않는다.
- glossary는 Moneyverse, WLD/WDX, 가상회사명, 안전/법률 핵심용어를 고정한다.
- 독일어/프랑스어 장문, CJK 줄바꿈, plural, 날짜/숫자 표기, 긴 버튼/탭 overflow를 QA한다.
- 품질지표: missing-key, stale count, mixed-language 발견, 검수 반려율, 사용자 번역오류 신고율.

## 5. SEO 문서·route 권위

색인 URL마다 서버 권위 `SeoDocument`:
`{url,pageType,locale,title,description,h1,canonical,indexDirective,hreflangSet,structuredDataTypes,primaryImage,lastmod,contentHash,sourceUpdatedAt,qualityState,adEligibility,owner}`.

route registry:
`{routeFamily,publicState,authRequired,localeStates,canonicalPolicy,sitemapFamily,crawlPriority,structuredDataPolicy,ugcPolicy,adPolicy,retirementPolicy}`.

canonical, robots meta, sitemap, hreflang, structured-data locale 문자열은 이 read model만 직렬화한다. 클라이언트 코드가 별도 canonical/locale 권위를 만들지 않는다.

## 6. Sitemap·canonical·hreflang·제출 계약

sitemap 진입조건: Production host + HTTP 200 + canonical + indexable + 품질승인 + 게시 locale + 비공개 아님 + redirect alias 아님.

- URL당 canonical 권위 하나.
- reciprocal hreflang은 실제 게시 대응페이지만 포함하고 self 포함.
- 유용한 중립 selector 전까지 `x-default`는 한국어 fallback.
- `lastmod`는 색인콘텐츠가 의미있게 바뀔 때만 갱신한다.
- locale + landing family별 sitemap으로 관측하고 프로토콜 한도 전 분할.
- robots.txt에 sitemap index 노출.
- Google은 Search Console/Search Console API로 제출·관측하고 폐기된 unauthenticated sitemap ping 제거.
- IndexNow는 추가/수정/삭제된 canonical 공개 URL만 제출하며 429와 실제 응답을 보존.
- submission 성공은 “통지 수신”이지 “색인/상위노출 성공”이 아니다.

승격차단:
canonical split, hreflang 비상호성, alternate 404/redirect-only, private URL sitemap 포함, 가짜 lastmod, Production→Test URL, host/protocol 혼합, 화면과 불일치한 structured data.

## 7. 검색수요 증거 시스템

관측 레코드:
`{provider,property,market,language,query,landingFamily,metric,period,value,status,observedAt,expiresAt,artifactRef}`.

상태:
`LIVE_GSC, LIVE_NAVER, LIVE_INDEXNOW_RESULT, KEYWORD_PLANNER_ESTIMATE, OTHER_PROVIDER_ESTIMATE, SYNTHETIC_TEST_ONLY, NO_DATA, NOT_CONNECTED, FETCH_ERROR`.

운영 dashboard는 live 누락을 synthetic으로 대체하지 않는다. connector가 없으면 연결 안 됨을 그대로 보여준다.

기회큐:
- high impression/low CTR;
- position 5–20;
- 지속 상승 query;
- 한국어 검증 페이지의 해외 국가/언어 수요;
- 고유입/낮은 second action;
- 고활성/저노출;
- cannibalization/duplicate;
- stale/decline;
- image/video 기회;
- 내부검색 no-result 수요.

## 8. People-first 콘텐츠와 pSEO 입장·퇴출

키워드보다 먼저 실제 사용자 task를 정의한다. 주요 가치형은 calculator, simulator, data comparison, guide, glossary/entity, moderated discussion, media explainer다.

생성 페이지 입장조건:
1. 별도 intent/entity/task;
2. token 치환이 아닌 고유 데이터/계산;
3. 광고 전에도 유용한 주요 결과;
4. 시의성 데이터의 출처/시행일;
5. sibling과 title/H1/body near-duplicate 아님;
6. task 관련 내부링크;
7. 검색/제품가치 측정가능;
8. owner·refresh SLA;
9. 현실 금융/세금/법률/안전 문구의 검수;
10. deindex/consolidation 경로.

family 출시 표본:
- 최소 30 URL 또는 family의 10% 중 큰 값, 최대 200;
- 표본에서 canonical/hreflang/private-data 결함 0건;
- duplicate/near-duplicate triage 완료;
- locale 검수 없는 자동번역은 게시 안 함.

퇴출조건:
- source 만료/오류;
- 합칠 수 있는 중복;
- 충분한 관찰기간에도 qualified discovery와 downstream value 모두 없음;
- cannibalization 과다;
- 신뢰/규제 위험;
- owner/SLA 부재.

실제 replacement가 있을 때만 301/308, 아니면 404/410 + sitemap/hreflang 제거.

## 9. 해외 제품 기능 Epic

- **G510-F01 공개 utility:** percentage/compound/break-even/unit·currency/world-time + Moneyverse earning/business/item/WDX/economy simulator. 비회원도 핵심 결과 사용.
- **G510-F02 현지화 onboarding:** 언어 chooser, 첫 유용 행동, locale 예시, timezone·number format.
- **G510-F03 지식 그래프:** glossary, 가상회사/섹터, 직업, 사업, 컬렉션, 퀘스트, 이벤트, help를 entity 관계로 연결.
- **G510-F04 국제 탐색:** locale/language filter, 충분한 aggregate 데이터가 있을 때만 country/locale trend, 안전한 public profile/community hub.
- **G510-F05 번역 UX:** 선택형 UGC 번역, 번역표시, 원문 toggle, 번역오류 신고, glossary 적용.
- **G510-F06 timezone/event:** 현지 이벤트시각, DST-safe countdown, calendar export, “내 지역시간” 표시.
- **G510-F07 retention:** 저장 calculator/preset, 최근 guide, 주간 recap, comeback mission, locale-aware notification.
- **G510-F08 share/distribution:** localized share card/OG, 고품질 이미지, private state를 노출하지 않는 locale 보존 deep link.

## 10. 시장 준비도·출시 게이트

상태:
`DISCOVERY -> DESIGN -> TRANSLATION -> COMPLIANCE_REVIEW -> TEST -> LIMITED_LAUNCH -> SCALE|HOLD|ROLLBACK`.

필수축:
검색수요, 번역품질, locale UX, 법률/개인정보/광고, moderation capacity, 성능, 지원, analytics, ad-consent, 단위경제.

초기 웨이브:
- KR/ko: 기준선·권위 드리프트 복구 우선.
- EN: 한국어 기본 런타임 복구 + 영어 visible-content parity 뒤 US/GB/CA-English/AU/NZ/IE.
- JA/JP: native review, 일본어 typography/search intent, 시장정책 검토.
- DE/FR/ES + EEA: certified CMP/동의경로, 회원국별 아동동의연령 정책, DSA 미성년자 보호, native review.
- pt-BR/BR: 포르투갈어 현지화 + 브라질 개인정보/법률 증거.
- zh-TW/TW: 번체를 별도 locale로 판단하고 `zh-CN` 재사용 금지.
- 중국 본토: 일반 locale 확장이 아닌 별도 배포/규제 프로젝트.

거시 광고시장 크기만으로 SCALE하지 않는다. Moneyverse 실측 qualified traffic, retention, trust/performance, incremental contribution이 필요하다.

## 11. 광고·동의 아키텍처

국제 기본은 contextual/non-personalized. 시장 정책이 명시적으로 허용할 때만 개인화를 검토한다.

요청별:
`AdPolicy{market,ageBand,consentState,pageSensitivity,personalizationAllowed,adAllowed,vendorPolicyVersion}`.

하드 no-ad:
wallet, transfer, lending, order/checkout, account/security, private message, admin/operator, casino/chance, 민감 동의/법률 flow.

EEA/UK/Switzerland에서 개인화 광고는 적용되는 Google-certified CMP/TCF 및 유효 동의경로를 요구한다. 법적으로 금지되는 미성년자 profiling 광고는 허용하지 않는다. 동의 거부가 핵심서비스를 깨거나 analytics 성공값을 조작하면 안 된다.

광고실험:
설정, traffic allocation, Page RPM, finalized revenue, viewability/coverage, LCP/INP/CLS, task completion, retention, 오클릭 불만, invalid-traffic 경고, rollback을 기록한다.

## 12. 성능·접근성·국제 UX 예산

공개 획득 template:
- p75 LCP <= 2.5s, INP < 200ms, CLS < 0.1(현장데이터 사용가능 시);
- 광고/미디어 삽입으로 layout shift 금지;
- primary content가 client-only fetch에 의존하지 않음;
- locale switch keyboard/screen reader 사용가능;
- 첫 응답의 `html lang`과 실제 주언어 일치;
- 다른 언어 UGC/인용문은 language-of-parts;
- sticky ad/consent/nav가 focus를 가리지 않음;
- WCAG 2.2 AA 프로젝트 기준의 keyboard/target-size 등 적용;
- 요구 viewport에서 긴 번역문구 잘림/overflow 0;
- text direction/font coverage/date/number/currency가 locale 정확.

## 13. Analytics·KPI event 계약

핵심 event:
`seo_landing_view, utility_started, utility_completed, second_useful_action, signup_started, signup_completed, activation_completed, guide_to_feature_click, language_suggested, language_selected, translation_requested, translation_error_reported, ad_eligible_view, consent_state_changed`.

dimension은 privacy-reviewed allowlist: locale, coarse market, landingFamily, deviceClass, sourceClass, experimentId. 사용자식별자를 포함할 수 있는 raw 검색어, analytics 목적 raw IP, 비공개 잔액·메시지내용을 로그하지 않는다.

KPI tree:
search -> qualified landing -> second useful action -> signup -> activation -> D1/D7/D30 -> qualified pageviews -> finalized ad revenue -> 귀속비용 차감 contribution.

모든 dashboard는 denominator, 기간, provenance, freshness, missing-data 상태를 표시한다.

## 14. 관리자 control plane

- locale registry/publish state;
- missing/stale translation/source-hash drift;
- hreflang/canonical/sitemap parity;
- indexability route registry;
- search evidence/connector health;
- pSEO family admission/sample/retirement;
- country/locale rollout readiness;
- ad eligibility/consent policy;
- CWV/render probe;
- URL retirement/redirect history;
- 감사로그가 남는 locale/page-family noindex/kill switch.

법률/안전 locale 게시, bulk indexability, 대량 redirect, ad-policy 변경은 four-eyes approval을 요구한다.

## 15. Test matrix와 승격차단

자동:
- 모든 게시 locale URL의 빈 cookie 첫 요청;
- explicit URL > saved preference > recommendation > 한국어 fallback;
- 추정 locale은 사용자 동작 없이 manual preference가 되지 않음;
- locale switch로 jurisdiction/age/payment/ad 자격 변화 없음;
- `html lang`, title, H1, body, canonical, OG locale, hreflang 일치;
- hreflang target의 expected 200 canonical;
- 미게시 locale sitemap/hreflang 제외;
- Test/private noindex;
- GSC disconnected/error에서 가짜 지표 0;
- deprecated Google sitemap ping 코드 0;
- IndexNow 실제 응답코드 유지;
- source 의미변경 때 lastmod 갱신, deploy-only에는 불필요 갱신 금지;
- pSEO duplicate/empty/invalid-data fixture 차단;
- structured data 화면내용 일치;
- UGC 번역 라벨 + 미검수 duplicate index 금지;
- 모든 locale/market/consent 조합에서 민감 route 광고 0.

수동:
native-language, 320/375/768/1024/1440+ 반응형, keyboard/screen-reader, slow network, crawler render comparison, consent, 시장별 법률문구.

private indexing, fabricated metric, canonical split, locale/jurisdiction 우회, 미승인 유료/규제 기능, material cloaking은 승격차단.

## 16. 구현 순서

- **Phase A 진실성 복구:** 한국어 default, 선호/추천 분리, GSC 가짜데이터 제거, Google ping 제거, truthful SEO status.
- **Phase B SEO 권위:** SeoDocument/route registry, published-locale sitemap/hreflang, render probe, lastmod authority.
- **Phase C 현지화 플랫폼:** BCP47/CLDR registry, 번역 lifecycle, stale detection, admin QA.
- **Phase D 첫 해외 가치:** EN/JA 검증 utility + onboarding + knowledge + timezone/event.
- **Phase E 검색운영:** evidence warehouse, opportunity queue, pSEO admission/retirement, image/video workflow.
- **Phase F 준수 수익화:** market consent/ad policy, 실측 experiment, contribution dashboard.
- **Phase G 추가 locale:** readiness gate 통과한 언어를 한 번에 하나씩.

각 runtime phase는 당시 최신 main에서 새 브랜치, exact-SHA Test 배포, backend/frontend health 및 필수 QA 후 무중단 Production 승격을 따른다.

## 17. 완료 정의

v510 기획 완료 조건은 현재 코드 gap, 목표 데이터모델, 해외 기능 epic, 검색/콘텐츠 게이트, 시장 readiness, 광고/동의, analytics, 관리자도구, QA, 단계별 구현이 EN/KO에 명시되고 현재 기획 권위에서 연결되는 것이다.

런타임 완료는 별도 주장이고 exact 구현/Test/Production 증거가 필요하다.

## 18. v510에서 직접 확인한 1차자료 레지스트리

검색/국제:
- Google localized versions: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google multi-regional/multilingual: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Google locale-adaptive: https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google canonical: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google sitemap ping deprecation: https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping
- Google JavaScript SEO: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google structured data: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google Images: https://developers.google.com/search/docs/appearance/google-images
- Google Video: https://developers.google.com/search/docs/appearance/video
- Google Discover: https://developers.google.com/search/docs/appearance/google-discover
- Google Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- Google Search Console start: https://developers.google.com/search/docs/monitor-debug/search-console-start
- Google Keyword Planner: https://support.google.com/google-ads/answer/7337243
- Naver robots: https://searchadvisor.naver.com/guide/seo-basic-robots
- Naver markup/robots meta: https://searchadvisor.naver.com/guide/markup-structure
- IndexNow: https://www.indexnow.org/documentation

국제화/접근성:
- IETF BCP 47 / RFC 5646: https://www.rfc-editor.org/info/rfc5646/
- Unicode CLDR / UTS #35: https://www.unicode.org/reports/tr35/
- W3C language declaration: https://www.w3.org/International/questions/qa-html-language-declarations.html
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

광고/개인정보/미성년:
- AdSense certified CMP: https://support.google.com/adsense/answer/13554116
- AdSense personalized/non-personalized ads: https://support.google.com/adsense/answer/9007336
- AdSense invalid traffic: https://support.google.com/adsense/answer/1348752
- EU Digital Services Act: https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng
- EC 개인 데이터/아동 안내: https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en
- FTC COPPA rule materials: https://www.ftc.gov/legal-library/browse/federal-register-notices/16-cfr-part-312-coppa-final-rule-amendments

이 자료들은 구현 제약의 근거이며 순위·트래픽·광고 RPM·특정 국가의 법률승인을 보장하지 않는다.

## 19. 레퍼런스 corpus 증거

v510 심화기획은 SEO/IR, 다국어/현지화, 번역품질, crawl/index/canonical, structured data, 성능/접근성, 콘텐츠품질/spam, analytics/recommender/retention, 광고/fraud/privacy, 국제마케팅/cross-cultural UX, NLP/generative search, knowledge graph, mobile/conversion, UGC safety, privacy regulation을 포함한 30개 질의군으로 신규 독립 Crossref discovery corpus를 수집했다.

- raw 레코드: **210,000건**;
- v510 내부 DOI 우선/제목 fallback 중복제거 후보: **121,320건**;
- 수집 오류: **0건**;
- manifest SHA-256: `f16c6deceb18fa96fdd7b1132b2fc58e13f908899d477c9ce252a897adae7704`.

이전 v507 corpus는 별도이며 raw 150,000건 / 회차 내부 중복제거 121,810건이다. 두 회차 raw 조회는 360,000건이지만 전체 교차중복 제거를 하지 않았으므로 합산 unique 수는 주장하지 않는다.

상세 근거와 exact-main 발견: [v510 심화 조사보고서](../findings/MONEYVERSE_GLOBAL_GROWTH_DEEP_RESEARCH_REVIEW_v2026.10.03.510.ko.md).
