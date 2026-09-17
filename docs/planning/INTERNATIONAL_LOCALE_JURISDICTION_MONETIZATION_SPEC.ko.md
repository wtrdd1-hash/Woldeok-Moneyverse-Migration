# 월덕 머니버스 — 국제 언어·국가정책·수익화 명세

> 버전: v2026.09.17.177
> 상태: 구현 지향형 Living 제품 명세
> 기준일: 2026-09-17
> 영문 기준 문서: [INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md](INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md)
> 근거 매트릭스: [INTERNATIONAL_COMPLIANCE_REFERENCE_MATRIX.ko.md](INTERNATIONAL_COMPLIANCE_REFERENCE_MATRIX.ko.md)
> 상위 문서: `PROJECT_PLAN.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md`, `SEARCH_DISCOVERY_OPERATIONS_SPEC.md`, `MINOR_SAFETY_AGE_ASSURANCE_CONTENT_REMOVAL_SPEC.md`, `CASINO_GAME_SYSTEM_SPEC.md`

## 1. 목적

Moneyverse는 UI 언어, 사용자의 실제 국가/지역, 법적 관할, 앱스토어 국가, 결제경로, 검색 노출 locale을 같은 값으로 취급하지 않는다. 서로 연관될 수 있지만 각각 독립된 정책축이다.

이 문서는 다음을 하나의 정책 시스템으로 묶는다.

- 국가/주·지역/채널별 기능 허용;
- 연령·등급 자격;
- 카지노·확률 기능 제한;
- 구독·일회성 디지털 상품·스토어 결제 규칙;
- 개인정보·광고·아동/청소년 제한;
- 다국어 UI와 자연스러운 현지화;
- Google 다국어/다지역 검색 노출;
- 법적 근거, 출시 게이트, 긴급 비활성화.

국가별 해석이 필요한 사항은 계속 `legal review required`다. 법률/등급/스토어 근거가 없거나 오래된 경우 돈·확률·미성년자·맞춤형광고·규제 기능은 fail-closed한다.

## 2. 핵심 원칙: 언어 != 관할국가

`locale`은 언어, 표시형식, 문구, 검색 메타데이터와 사용자가 선택한 표현을 결정한다.

`jurisdiction`은 기능 합법성/자격, 연령, 등급, 결제경로, 소비자 고지, 개인정보/광고, 채널 허용을 결정한다.

한국 이용자가 영어 UI를 써도 한국 정책을 우회하지 못한다. 일본어를 쓰는 해외 이용자에게 일본 전용 상거래 정책을 자동 적용하지 않는다. 언어 선택으로 기능 제한을 우회할 수 없어야 한다.

- **언어:** 사용자가 직접 선택, 별도 저장, IP로 강제 변경 금지.
- **국가/지역:** 계정/상거래 설정과 법적으로 필요한 신뢰 가능한 거친 위치 신호를 사용. 고위험 기능은 변경 시 재검증 가능.
- **채널:** 웹, Google Play Android, Apple App Store iOS를 별도 결정.

## 3. 국가 기능정책 엔진

규제·결제 관련 기능은 UI 노출 전과 실제 mutation 직전에 서버가 버전형 정책을 다시 판정한다.

### 입력

```text
feature_code
country_code
subdivision_code
channel
age_band
account_status
locale
policy_version
app_version
store_region
billing_route
```

`locale`로 법적 자격을 추론하지 않는다. 카지노·결제 같은 고위험 기능에서 클라이언트가 보낸 국가/나이 값을 최종 권위로 신뢰하지 않는다.

### 결과

```text
ALLOW
ALLOW_WITH_CONTROLS
BLOCK
REVIEW_REQUIRED
TEMPORARILY_DISABLED
```

UI는 안정적인 reason code를 번역해 보여주고, 내부 법률메모나 위험신호는 노출하지 않는다.

### 필수 기능코드

`CORE_ACCOUNT`, `COMMUNITY_UGC`, `MARKETPLACE_WLD`, `SIMULATED_STOCKS`, `SIMULATED_BANKING`, `CASINO`, `CASH_BILLING`, `SUBSCRIPTION`, `PAID_COSMETIC`, `PAID_CONVENIENCE`, `WLD_CASH_PURCHASE`, `PAID_RANDOM_ITEM`, `CONTEXTUAL_ADS`, `PERSONALIZED_ADS`, `SPONSORED_CONTENT`.

전역 기본값:

- `WLD_CASH_PURCHASE = BLOCK`;
- `PAID_RANDOM_ITEM = BLOCK`;
- 결제 배포로 `CASINO`가 자동 활성화되지 않음;
- 미성년자 및 법적근거 미확정 지역의 `PERSONALIZED_ADS` 기본 OFF.

## 4. 정책 데이터 모델

권장 엔터티:

```text
jurisdiction_policy_versions
jurisdiction_feature_rules
jurisdiction_age_rules
jurisdiction_rating_evidence
jurisdiction_store_rules
jurisdiction_privacy_rules
jurisdiction_ad_rules
jurisdiction_billing_rules
jurisdiction_consumer_notices
legal_review_records
policy_kill_switch_events
```

실제 거래/플레이/동의에 사용된 정책은 불변이다. 법령·스토어 정책 변경은 새 effective-dated 버전으로 만든다.

Git에는 공개 가능한 제품 결론과 evidence ID만 두고, 비공개 법률자문 원문은 공개 저장소에 넣지 않는다.

## 5. 초기 국가별 출시 매트릭스

이 표는 제품 기본값이며 각 국가가 이미 법적으로 승인됐다는 의미가 아니다.

| 국가/권역 | 핵심서비스 | 비-P2W 유료화 | 카지노 | 맞춤형광고 | 핵심 게이트 |
| --- | --- | --- | --- | --- | --- |
| 대한민국 `KR` | 현재 계정정책 범위 허용 | 판매자/환불/구독/결제 준비 전 REVIEW_REQUIRED | GRAC/등급 + 카지노 19+ 정책 + 법률/스토어 승인 전 BLOCK | 맥락광고 우선, 개인화 REVIEW_REQUIRED | 게임산업법/GRAC, 전자상거래법, PIPA/행태정보, 스토어정책 |
| 미국 `US` | COPPA/general-audience 정책으로 허용 | 결제/소비자보호 통과 후 ALLOW_WITH_CONTROLS | 주별 REVIEW_REQUIRED, Washington 기본 BLOCK | 연령/주 개인정보정책, 13세 미만 제외 | COPPA, 주별 규제, WA `thing of value`, 스토어결제 |
| 영국 `GB` | 허용 | ALLOW_WITH_CONTROLS | REVIEW_REQUIRED, 제품정책상 18+ | 미성년자/민감프로파일링 보수적 OFF | Gambling Commission 가상가치 경계, 소비자/개인정보 |
| 독일 `DE` | 통제조건부 | 통제조건부 | 청소년보호/등급·도박경계 현지검토 전 BLOCK | 미성년자 타게팅 BLOCK | JuSchG가 도박유사 메커니즘·구매압박을 이용위험/등급 요소로 고려 + EU 규칙 |
| 프랑스 `FR` | 통제조건부 | 통제조건부 | simulated-casino 현지분류 검토 전 BLOCK | 미성년자 타게팅 BLOCK | ANJ의 실제현금 온라인카지노 금지 경계 + EU 소비자/개인정보 |
| 스페인 `ES` | 통제조건부 | 통제조건부 | simulated-gambling/랜덤보상 현지검토 전 BLOCK | 미성년자 타게팅 BLOCK | DGOJ가 비디오게임·loot box와 도박의 경계를 지속 관찰 + EU 규칙 |
| 기타 EEA | 통제조건부 | 통제조건부 | 국가별 REVIEW_REQUIRED, 기본 BLOCK | 미성년자 타게팅 BLOCK | GDPR 국가별 13~16 동의연령, DSA, 소비자권리지침, 각국 도박/청소년보호법 |
| 호주 `AU` | 허용 | 통제조건부 | R18+ + 등급증거 없으면 BLOCK | 미성년자 보수적 OFF | simulated gambling R18+ 등급 |
| 일본 `JP` | 허용 | 통제조건부 | 별도 법률검토 전 BLOCK | 맥락광고 기본 | 유료 게임머니 도입 시 자금결제법 선불지급수단 검토, 소비자/개인정보 |
| 브라질 `BR` | 통제조건부 | REVIEW_REQUIRED | BLOCK | 미성년자 보수적 OFF | 아동 디지털보호·등급·개인정보·소비자 검토 |
| 캐나다/싱가포르/대만 | 국가검토 후 공개/핵심부터 | REVIEW_REQUIRED | BLOCK | REVIEW_REQUIRED | 현지 법률/스토어/개인정보/소비자 검토 |
| 중국 본토 | 기본 미출시 | BLOCK | BLOCK | BLOCK | 별도 현지 인허가/등록/게임·콘텐츠·데이터·결제 프로젝트 |

다른 국가가 허용했다는 이유로 `REVIEW_REQUIRED/BLOCK`을 자동으로 `ALLOW`로 바꾸지 않는다.

## 6. 카지노 국제화 구조

카지노는 수익화 채널이 아닌 격리된 확률 엔터테인먼트다.

현금 유료화와 공존하기 전 목표구조는 전용 `CSP`(가칭)다.

- 현금 구매 불가;
- 양도/선물/마켓 등록 불가;
- WLD/WDX/유료아이템과 교환 불가;
- 광고 시청으로 지급 불가;
- 현금/암호화폐/상품권/실물/유료 entitlement/양도아이템으로 결과 전환 불가;
- VIP/유료상품으로 확률, 한도, 지급률, 재시도, 손실복구 상향 불가.

`현금화 없음`은 필수지만 전세계 충분조건으로 보지 않는다. 미국 워싱턴주처럼 무료 플레이 권리를 연장하는 크레딧 자체를 `thing of value`로 볼 수 있는 관할이 있기 때문이다.

한국/호주는 simulated gambling에 별도 등급·연령 게이트가 있다. 국가/주/채널을 알 수 없으면 카지노는 차단한다.

## 7. 국가·채널별 유료화

### 판매 후보

- 광고 제거 구독;
- 계정귀속 프로필/대시보드/방 꾸미기;
- 경쟁우위 없는 표현/아카이브 편의;
- 허용된 공개 콘텐츠의 명확한 스폰서십.

WLD/WDX 수익, 카지노 베팅재원, 확률/지급률, 랭킹, 대출조건, 시장체결, 비공개정보, 외부 양도가치를 판매하지 않는다.

### 결제 권위

서버 catalog가 `상품 + 국가 + 채널 + 통화 + 세금표시 + 유효기간`을 버전 관리한다. 클라이언트 금액·통화·entitlement는 권위값이 아니다.

카드정보는 가능하면 hosted/tokenized 결제를 사용하고 PAN/CVV를 Moneyverse가 저장하지 않는다. webhook은 서명검증·멱등성·replay-safe를 적용한다.

### Google Play

Play 배포 앱의 디지털 상품은 원칙적으로 Play Billing을 사용하고, 현재 스토어 정책상 허용된 지역 프로그램에 등록했을 때만 대체결제를 사용한다. 대한민국은 Google의 대체결제 API/거래보고 등 프로그램 요구를 충족하는 경우 Play와 함께 개발자 제공 결제를 제공할 수 있다. EEA/영국/미국 프로그램은 정책이 바뀔 수 있으므로 출시 시점 정책을 읽어야 한다.

### Apple App Store

앱 내부 디지털 기능은 기본적으로 IAP를 사용한다. 특정 storefront/program entitlement가 허용하는 외부결제 예외는 정책 데이터로 관리하고 코드에 일반화하지 않는다.

### Web

승인된 PSP를 사용할 수 있지만 웹 구매권한이 앱스토어 결제권한을 자동으로 만들지는 않는다. SKU별 entitlement portability를 따로 검토한다.

### 구독

모든 언어에서 결제 전 총 정기요금, 주기, 자동갱신, 무료체험 종료와 유료전환, 취소/환불, 적용일을 자연스러운 현지어로 보여준다.

대한민국은 정기결제 가격 인상·무료→유료 전환에 적용되는 사전 동의/고지를 구현하며 현행 시행령 기준 30일 전 기간을 정책화한다. EEA는 Consumer Rights Directive와 국가별 구현을 반영한다.

### 7.7 국가별 수익성 게이트

결제가 기술적으로 된다는 이유만으로 유료상품을 출시하지 않는다. 국가별 versioned unit-economics를 유지한다.

```text
순유료매출
= 총결제액
- 스토어/PSP 수수료
- 사업자 부담 VAT/판매세
- 환불
- chargeback/부정결제 손실
- 결제 고객지원비
- 추가 모더레이션/안전비
- 번역/현지화 비용
- 국가별 법률/등급/준수비용 배부
- 광고제거로 감소한 광고수익
```

`국가 + 채널 + 상품 + 가격버전 + 유입코호트`별 결제전환, ARPPU, churn, 환불/차지백, contribution margin, D30/D90 LTV, CAC/회수기간, payer당 지원문의량을 본다.

초기 상품 수는 작게 유지한다: `AD_FREE_MONTHLY`, `AD_FREE_ANNUAL`, `PROFILE_THEME_PACK`, `DASHBOARD_THEME_PACK`, `ROOM_COSMETIC_PACK`. 가격은 국가/채널별 불변 price version과 스토어 price point를 사용하며 checkout에서 실시간 환율로 임의 계산하지 않는다.

리텐션과 contribution margin이 개선되면서 민원·환불·미성년자 위험·카지노 참여가 악화되지 않을 때만 확대한다. 준수증거 만료, 환불/차지백 급증, 오역/기만표현 발견, 상품이 경제·게임플레이 우위를 만들기 시작하면 offer를 중단한다.

## 8. 언어 확대와 URL

프로젝트 문서는 계속 **영어 원문 1순위 / 한국어 2순위**다. 사이트/앱 언어는 더 확대한다.

1차 대상:

```text
en      영어 기본
ko      한국어
ja      일본어
de      독일어
fr      프랑스어
es      스페인어
pt-BR   브라질 포르투갈어
```

후속: `zh-TW`, `it`, `nl`, 수요가 생길 때 `fr-CA`.

중국 본토 상용화가 승인되기 전 `zh-CN` 상업페이지 대량 색인을 만들지 않는다.

공개 URL 권장:

```text
/en/...
/ko/...
/ja/...
/de/...
/fr/...
/es/...
/pt-br/...
```

실제 내용이 국가별로 달라질 때만 `en-US`, `en-GB`, `en-AU` 같은 지역형 URL을 만든다. 키워드 확보용 동일복제 페이지를 만들지 않는다.

언어페이지는 self-canonical이며 진짜 대응 번역끼리 상호 `hreflang`을 낸다. 유용한 중립 언어/국가 선택기에 `x-default`를 연결한다.

IP/브라우저 언어로 강제 리디렉션하지 않는다. 사용자가 직접 선택하기 전에는 현재 URL을 유지하고 비차단 추천 배너만 제공할 수 있다.

## 9. 자연스러운 번역 품질 시스템

번역은 버전형 제품자산이다.

권장 엔터티:

```text
locale_catalog
translation_namespaces
translation_units
translation_versions
translation_reviews
translation_glossary_versions
localized_legal_documents
localized_seo_documents
```

각 번역은 `source_hash`, 대상 locale, 번역상태, 번역방식, 검수자, glossary version, legal/SEO review state를 가진다.

상태:

`DRAFT -> LINGUISTIC_REVIEW -> PRODUCT_REVIEW -> LEGAL_REVIEW(필요시) -> PUBLISHED -> STALE`

원칙:

- 이용약관/개인정보/결제/환불/해지/연령/등급/카지노 확률·안전/제재/보안 문구는 원시 기계번역을 운영에 게시하지 않는다.
- 공개 마케팅/가이드의 AI·기계번역 초안도 원어민 수준 검수 후에만 색인한다.
- title/description/H1은 직역이 아니라 해당 언어의 자연스러운 검색의도에 맞게 작성한다.
- `Moneyverse`, `WLD`, `WDX`, 상품코드는 glossary로 고정한다.
- 날짜/숫자/소수점/통화는 locale 표시를 사용하되 서버 금액은 정수/minor unit 권위값을 유지한다.
- 한 페이지의 주 언어는 하나로 유지한다. SEO 목적으로 좌우 병기 혼합페이지를 만들지 않는다.
- UGC 원문은 원어 그대로 두고 선택형 번역은 번역표시를 하며 기본적으로 별도 색인 사본을 만들지 않는다.

영문 원문이 바뀌어 `source_hash`가 달라지면 관련 번역을 `STALE`로 만든다. 법률/결제/카지노/안전 문구의 stale 번역은 오래된 문구로 fallback하지 않고 출시를 차단한다.

## 10. Google 다국어/다지역 SEO

Google Search Central 현행 가이드를 직접 적용한다.

1. 언어별 독립 URL;
2. 실제 대응 페이지 간 상호 `hreflang`;
3. 유용한 `x-default`;
4. locale별 self-canonical;
5. IP/`Accept-Language` 강제 리디렉션 금지;
6. 한 페이지의 본문·내비게이션 주 언어 명확화;
7. 게시/색인 가능한 번역만 locale sitemap 포함;
8. 실제 내용이 다를 때만 지역 변형;
9. 언어 선택 링크는 일반 crawlable `<a>`;
10. 미완성/얇은 자동번역은 `noindex` + sitemap 제외.

사이트맵 예:

```text
/sitemap.xml
/sitemaps/pages-en.xml
/sitemaps/pages-ko.xml
/sitemaps/pages-ja.xml
/sitemaps/pages-de.xml
/sitemaps/pages-fr.xml
/sitemaps/pages-es.xml
/sitemaps/pages-pt-br.xml
```

title, description, H1, breadcrumb, OG, 이미지 alt, visible structured-data 문구도 locale과 일치시킨다.

SEO KPI는 `locale + 국가 + 검색엔진 + landing family`별 impressions, valid indexed, CTR, signup, activation, D7/D30, 법적으로 연결 가능한 paid conversion/net revenue로 본다. 자동번역 페이지 수 자체를 KPI로 삼지 않는다.

## 11. API와 관리자 기능

공개/사용자 API:

```text
GET /public/locales
GET /public/countries
GET /public/policy/availability?country=&subdivision=&channel=
GET /me/feature-availability
GET /billing/catalog
GET /casino/availability
```

관리자에는 국가/주/채널/연령 정책 simulator, 번역 누락·stale dashboard, 법률/등급/스토어 증거 만료 dashboard, 국가/통화/채널별 billing catalog, hreflang/SEO parity 검사, 감사로그가 남는 긴급 feature kill switch를 둔다.

## 12. 개인정보·광고

국제 기본값은 맥락광고다. 개인화광고는 나이, 국가, 동의/법적근거, 광고사업자, 데이터 inventory가 모두 정책을 통과할 때만 켠다.

- 대한민국: PIPC 행태정보 정책/가이드를 실제 광고스택에 적용하기 전 별도 검토.
- EEA: DSA의 미성년자 대상 타게팅 광고 금지와 dark pattern 규칙을 적용. GDPR 동의연령은 회원국별 13~16 범위이므로 EU 전체 상수 하나로 만들지 않는다.
- 미국: 전용 COPPA 아동서비스가 준비되기 전 known-under-13 사용자는 받지 않는 general-audience 정책 유지.
- 민감특성 추론 광고는 전 지역 금지.
- 카지노 route는 광고 inventory 0.

## 13. QA

- 국가/주/채널 정책 경계;
- 연령 경계;
- unknown jurisdiction fail-closed;
- 언어변경으로 국가 기능제한이 바뀌지 않음;
- 국가변경으로 사용자 언어가 자동 덮어쓰기되지 않음;
- 법률/등급 증거 만료 시 고위험 기능 비활성화;
- 유료 entitlement→카지노 베팅재원 경로 0;
- 카지노 결과→유료/양도/외부가치 경로 0;
- 스토어별 billing/entitlement;
- 정기결제 가격변경/동의/취소/환불;
- locale fallback/missing key;
- source-hash stale 번역;
- 민감문구 human/legal review gate;
- hreflang 상호성/self-canonical/x-default;
- sitemap에 published/indexable 번역만 포함;
- bot/JS-disabled/mobile 렌더링;
- 배포 후 Search Console/Naver 관측.

## 14. 출시 순서

`국가정책 엔진` → `locale registry/EN-KO 기준 강화` → `JA/DE/FR/ES/PT-BR 번역 파이프라인` → `다국어 SEO URL/hreflang/sitemap` → `국가별 법률·개인정보·스토어 evidence` → `국가/채널별 비-P2W 결제` → `카지노 CSP/출처격리` → `Test exact-SHA 국가×언어×결제×카지노 매트릭스` → `국가별 법률/제품 승인` → `기능 flag로 한 국가/채널씩 운영 활성화`.

## 15. 이번 버전의 권위 외부자료

영문 기준 문서의 §15 링크목록을 권위 source index로 사용한다. 프로젝트 문서에는 법률자문 원문 대신 공개 가능한 제품 결론과 출처를 기록한다.

## 16. 버전 기록

### v2026.09.17.177

국가별 기능제한, 다국어 UI, 자연스러운 번역, Google 국제 SEO, 결제/구독, 카지노, 미성년자, 광고/개인정보를 하나의 국제 출시정책으로 통합했다.

이번 회차는 문서 전용이며 Test/Production 런타임은 변경하지 않는다.
