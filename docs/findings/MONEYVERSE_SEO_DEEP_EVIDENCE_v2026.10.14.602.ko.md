# SEO 운영 사이트맵·다국어 정합성 심층 증거 — v2026.10.14.602

> **상태:** FINDINGS / READ-ONLY / E2–E3. 운영 SEO 코드를 수정하거나 사이트맵을 등록·수정하지 않았다.
> 검사 시각: 2026-10-14 KST, `https://easy-scraping.com/sitemap.xml`, `origin/main=e1517e994daf2516d411597b64c2aae30ab4e1b5`; 페이지 표본 응답은 동적인 서비스 상황에 따라 바뀔 수 있음.
> 관련 문서: [전략 종합](MONEYVERSE_STRATEGY_DEEP_DIVE_v2026.10.14.602.ko.md).

## 1. 재현된 원시 관찰
| 항목 | 확인 | 해석 |
|---|---:|---|
| 사이트맵 HTTP 상태 | 200 | 공개 XML이 다운로드 가능 |
| `<url><loc>` | 1,012개 | **색인 수가 아닌 URL 제출 목록** |
| 고유 loc | 1,012개 | 동일 loc 중복 없음 |
| `xhtml:link[hreflang]` | 9,108개 | URL별 9개 언어 레이블 부착 |
| 중복 locale 접두 링크 | 1,026개 | `/en/en/`, `/ja/en/` 등 패턴. 잘못된 생성 규칙 강력 시사 |
| hreflang 대상이 동일 사이트맵 loc에 미등재 | 5,766개 | en/en-US 등 같은 실 URL의 레이블 중복 포함. XML이 반드시 모든 대상 URL을 담아야 한다는 단정은 하지 말 것; 권장 사항과 재검증 |
| 공개 페이지 대표 샘플 | 36개 중 HTTP 200 = 36개 | 200만으로 유효 콘텐츠/검색 적격성을 확정하지 않음 |
| KO/EN/JA/ZH 일반 계산기 | 전부 200, `<html lang>`은 해당 언어 | 일반 계산기 중 영어/일본어/중국어 URL에 KO 제목 및 KO canonical |
| KO/EN/JA/ZH 용어사전 /per | 200, 독립 canonical와 번역 제목 | 일부 경로만 다국어 구성 완성 |
| 중복 locale 샘플 | `/en/en/guide/glossary/per` HTTP 200, canonical `/en/guide/glossary/per` | 404가 아니라 정규화되는 비정규 경로이므로 크롤링/해석 혼동 가능 |

위 '5,766개 대상 loc 미등재'는 반드시 5,766개의 깨진 URL이 있다는 뜻이 아니다. 일부 대상 URL은 실제 HTTP 200이며 원본/대체 언어 간 XML 자기참조 처리만 누락된 것이다. 예컨대 en과 en-US 두 레이블이 같은 href를 가리킨다.

## 2. 서버 코드 원인
`frontend/src/app/sitemap.ts`에서 `addEntry(path)` 호출 시:
```ts
const enUrl = `${base}/en${cleanPath === '/' ? '' : cleanPath}`;
const jaUrl = `${base}/ja${cleanPath === '/' ? '' : cleanPath}`;
const zhUrl = `${base}/zh${cleanPath === '/' ? '' : cleanPath}`;
const koUrl = `${base}${cleanPath === '/' ? '' : cleanPath}`;
```
그런데 `addEntry('/en/guide/glossary')`와 `addEntry('/ja/guide/glossary')`도 호출하므로 `/en/en/guide/glossary` 및 교차 언어 접두어가 생성되는 구조다.

`RELEASE_TIMESTAMP = new Date('2026-10-13T09:30:00.000Z')`를 모든 sitemap URL `lastModified`에 사용한다. URL별 콘텐츠 수정일의 진실성을 확립해야 한다.

## 3. 실제 페이지 예시
| URL | 응답 | HTML lang | title | canonical |
|---|---|---|---|---|
| `/tools/compound-calculator` | 200 | ko | 한국어 | 원문 /tools/compound-calculator |
| `/en/tools/compound-calculator` | 200 | en | 한국어 복리 계산기 제목 | **한국어 /tools/compound-calculator** |
| `/ja/tools/compound-calculator` | 200 | ja | 한국어 복리 계산기 제목 | **한국어 /tools/compound-calculator** |
| `/zh/tools/compound-calculator` | 200 | zh | 한국어 복리 계산기 제목 | **한국어 /tools/compound-calculator** |
| `/en/tools/salary-calculator` | 200 | en | 한국어 연봉·4대보험 제목 | **한국어 /tools/salary-calculator** |
| `/en/tools/stock-calculator/chips-minus-20` | 200 | en | 한국어 가상 주식·물타기 제목 | **한국어 원본 프리셋** |
| `/en/guide/glossary/per` | 200 | en | 영어 PER 설명 | 해당 EN 페이지 |
| `/ja/guide/glossary/per` | 200 | ja | 일본어 PER 설명 | 해당 JA 페이지 |

이 데이터는 요청 시 HTML 헤더/본문에서 `title`, `canonical`, `html lang`을 정규식으로 추출한 **표본 관찰**이며, 전체 1,012개 URL이 동일 오류라고 확대 해석하지 않는다.

## 4. 관리자/색인 소스 결함과 교정
| 파일 | 현 상태 | 계획 변경 |
|---|---|---|
| `frontend/src/app/api/admin/seo-audit/route.ts` | 고정 `indexedPercentage=99.4/99.8/100%`, `totalIndexedUrls=allUrls.length`, 고정 lastCrawlTime/latency, `VALID` schema | `source=GSC/NAVER/BING`, `fetched_at`, `property_id`, `coverage_status`, `error`; unavailable은 숫자 대신 분명하게 표시 |
| `frontend/src/app/api/admin/seo/indexing-submit/route.ts` | `www.google.com/ping?sitemap`, Promise fulfilled만으로 성공 판정, 문구는 'Google Indexing API' | 레거시 경로 폐기, GSC Sitemaps API 단일 진입, 제출 성공≠색인 성공 |
| `frontend/src/app/api/admin/seo/gsc-sitemap-submit/route.ts` | 실제 백엔드 GSC 호출 존재; 동시에 더 이상 유효하지 않은 Google ping 잔존; `success: true`는 전체 등록 여부와 혼동 가능 | 인증/HTTP status/실제 GSC 결과 기준의 단계형 상태, 실패 시 부분 성공 표시 |
| `backend/src/seo/gsc-client.ts` | OAuth2 service account JWT, GSC 검색 분석과 사이트맵 서비스 계약 구현 | 작동 여부는 실제 속성 권한/실측 응답으로 확인, 소스 존재≠실제 데이터 연결 |
| 계산기 JSON-LD | 일부 하드코딩 `AggregateRating` 4.9+ | 실제 사용자 평점·표시 가능·출처·가짜 리뷰 부재 검증 전 노출 보류 |
| `frontend/src/app/sitemap.ts` | 경로를 앞에 추가하는 9개 hreflang 생성 | locale-aware path registry, canonical/alternate self-consistency 검사, 중복 locale 접두 불허 |

Google은 sitemap ping endpoint 중단을 발표했으며 해당 ping은 이점이 없다. Google Indexing API는 적격 `JobPosting` 및 `BroadcastEvent`/VideoObject에 한정한다. 일반 계산기용 API가 아니다.

## 5. URL 별 자동 품질 검증 설계
- **Discovery:** 사이트맵/크롤링/라우트 목록을 현재 exact SHA로 수집.
- **Public eligibility:** 200+indexable+비인증+실제 내용을 가진 HTML만.
- **Canonical:** 공식 공개 URL로 자기 지시 또는 사유가 있는 병합, redirect/3xx 정규화 검증.
- **Locale:** 번역된 본문과 title/description/UI/수식/통화·단위·관할 모두 일치; locale 접두어 중복 불허; 각 명시 URL을 표준화.
- **Hreflang:** reciprocal, target 200, 자기 포함, 언어 코드/관할 충돌 금지. 해당 언어 페이지가 실제 존재할 때만 출력.
- **Metadata:** 콘텐츠 수정일 기준 lastmod, 공식 출처/원문/유효일, schema visible parity, 수치/평점 검수.
- **UX:** 실제 계산 인터랙션, 모바일 가로 넘침 0, 키보드 가능, 결과 텍스트 크롤러가 이해 가능한 범위.
- **Decision:** `KEEP_INDEX`, `IMPROVE`, `MERGE_301`, `NOINDEX`, `DEFER` (제출 버튼 성공에 근거해 결정 불가).
- **Safety:** Test exact SHA smoke + 백엔드 헬스 + noindex/redirect 회귀 + sitemap/robots/alternate diff; 운영 승격은 별도 승인.

## 6. GSC/네이버 데이터 확보 요구
- Google: `Search Analytics: query` 90일 / dimensions `date,page,query,country,device`, `Sitemaps: list`, `URL Inspection` 핵심 샘플; 속성/권한 오류는 `NO_DATA`로 표시.
- Naver: 웹마스터 사이트별 수집·색인 상태, 접근 실패/DNS/robots, 키워드 유입 및 신청 처리 상태를 구분.
- Bing: IndexNow submission logs·수집/색인 대비.
- 결과는 명확한 날짜, URL, property, sample size, 서버 코드 SHA, 부분/전체 성공 레벨로 남긴다. 익명화 불가능한 로그·토큰을 GitHub에 저장하지 않는다.

## 7. 검증 가능한 재현 절차 (읽기 전용)
```bash
curl -fLsS https://easy-scraping.com/sitemap.xml -o /tmp/mv-sitemap.xml
# Python ElementTree로 loc, xhtml:link href, 중복 locale 패턴,
# hreflang target vs loc 집합, 자기 지시/상호 참조를 비교한다.
curl -fLsS https://easy-scraping.com/en/tools/compound-calculator
# 응답 HTML title, canonical, lang, meta robots 확인
```
증거 수치와 표본은 2026-10-14 KST의 단일 관찰임. 검색 색인율/트래픽/순위는 직접 조사하지 못했다.

## 8. 감사 원시 데이터
- [사이트맵 요약 JSON](evidence/strategy-v602/sitemap-counts.json) · [36개 공개 페이지 샘플 JSON](evidence/strategy-v602/public-seo-sample-36.json). 암호/개인정보가 없는 공개 응답 메타데이터만 기록.

## 9. 공식 확인 출처
- Google Sitemap Ping deprecated: https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping
- Search Console Sitemaps API: https://developers.google.com/webmaster-tools/v1/sitemaps/submit
- Google Indexing API eligibility: https://developers.google.com/search/apis/indexing-api/v3/quickstart
- Google Sitemap lastmod & priority: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google hreflang versions: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google canonical versions: https://developers.google.com/search/docs/crawling-indexing/canonicalization
- Google review snippet: https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- Google scaled content policy: https://developers.google.com/search/docs/essentials/spam-policies
- Naver crawl reports: https://searchadvisor.naver.com/guide/report-crawl-refine
