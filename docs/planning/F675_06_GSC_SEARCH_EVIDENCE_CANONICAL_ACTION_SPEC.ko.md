# F675-06 — Search Console 실제 검색 유입·색인·대표 URL 증거 센터 상세기획

> **v2026.10.15.688** · **PLANNING / AUTHORITY_DRIFT / 운영승격 BLOCKED** · 2026-10-15 KST
> [영문 기준 상세명세](F675_06_GSC_SEARCH_EVIDENCE_CANONICAL_ACTION_SPEC.md) · [작업기록](../worklog/2026-10-15-f67506-search-evidence-v688.ko.md).
> 상위 문서: [PROJECT_PLAN](PROJECT_PLAN.ko.md) → [통합기획 마스터](INTEGRATED_PLANNING_MASTER.ko.md) → [v675 전체 기능계획](INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.ko.md). 기존 SEO/GSC 관리자 화면·v685 수정 코드를 재사용하며 v397 API 일치, v530 전체 UI, v523/542/543 경제, v507/v527 SEO 원칙을 유지한다.
> 시작 `origin/main=44d0b46583a9a2836e0f2b41655b245cf6f1c262`. **이번에는 코드·실제 Google 데이터·Test·운영을 변경하거나 직접 조회하지 않았다.**

## 0. 관리자가 실제로 알고 싶은 것

“어떤 **검색어→페이지→국가→기기**에서 노출·클릭이 발생하는가? 내 URL이 제출만 됐나, Google이 크롤링했나, 실제 색인했나? Google이 다른 대표 URL을 선택한 이유는? 코드/콘텐츠 중 누가 무엇을 고쳐야 하는가?”에 답한다.

**기존 `/admin/seo`에 통합**, 기존 GSC 읽기·사이트맵/IndexNow·크롤러 관측 및 v685 수정 결과를 재사용한다. ‘또 하나의 SEO 대시보드’를 만들지 않는다. 일반 계산기·블로그·주식 페이지는 Google Indexing API로 즉시 색인될 수 없다. Google Indexing API의 지원 범위는 JobPosting/VideoObject+BroadcastEvent 라이브방송이다. 사이트맵 제출은 ‘URL을 알리는 힌트’일 뿐 검색 노출·색인·순위 상승을 보장하지 않는다.

**서로 독립된 네 가지 증거:**
1. **사이트 소스 상태:** 사이트맵 포함/대표 주소 선언/robots/noindex/리다이렉트/오류/미확인.
2. **제출 증거:** NOT_SUBMITTED / REQUESTED / ACCEPTED / PARTIAL / REJECTED / UNKNOWN. 검색엔진 공급자별로 별도.
3. **Google 색인본 상태:** INDEXED / NOT_INDEXED / GOOGLE_SELECTED_DIFFERENT_CANONICAL / INSPECTION_UNAVAILABLE / UNKNOWN. **Google URL Inspection** 결과의 확인 시각·속성·할당량 포함. 이 API는 현재 라이브 URL 검사 API가 아니다.
4. **실제 검색 성과:** FINAL / FRESH_INCOMPLETE / ZERO_OBSERVED / NO_ROWS / NOT_CONFIGURED / ERROR / STALE, 노출·클릭·CTR·평균위치와 속성·태평양 시간 날짜/집계 차원 명시. 크롤러 IP/방문 로그만으로 ‘색인됨’이라고 하지 않는다.

모든 자료에는 `source, property, queryDimensions, timeRangePT, collectedAtUTC, lastSuccessfulAtUTC, isPartial, lastError, sourceSha, reportRevision` 등의 출처를 붙인다. API에 **행이 누락된 것**을 Google이 **실제로 0을 확인한 것**으로 바꾸지 않는다.

## 1. 최신 메인 소스 상의 문제 S688-01~10

| ID / 심각도 | 실제 검토 소스 | 왜 문제이고 무엇을 할 것인가 |
|---|---|---|
| **S688-01 P1** | `backend/src/seo/gsc-client.ts::fetchGscAnalyticsSnapshot`: 서버 UTC 기준 30일, `type=web, dataState=all` | Search Analytics 요청 날짜는 Google 태평양 시간(PT). 서버 UTC와 날짜 차이 및 미확정 최근 날짜를 FINAL과 구별 |
| **S688-02 P1** | 같은 함수가 결과에 없는 날짜를 `clicks=0,impressions=0,ctr=0,position=0`으로 채움 | 보고 지연·행 누락/데이터가 없는 기간을 무조건 관측 0으로 단정하지 않음. null/NO_ROWS/집계범위 별도 |
| **S688-03 P1** | 같은 함수가 날짜·검색어 상위 10개만 수집하며 `gsc-analytics-card.tsx`에 표시 | 검색어→실제 유입 페이지·국가·기기별 결과를 API 차원 및 허용 집계로 조회. 상위 10개를 전체 검색어라고 소개 금지 |
| **S688-04 P1** | `seo.service.ts::getGscAnalytics`는 연결 성공 1시간, 연결 없음 1시간, 실패 5분 캐시. `updatedAt`은 서비스 계정 키 기록 시각 | 인증키 수정 시각은 실데이터 수집 시각이 아님. lastFetchedAt·lastSuccessfulAt·Google 마지막 확정일·STALE 구분 |
| **S688-05 P0 진실성** | `seo-client-view.tsx`는 크롤러 미방문을 `미방문(Unindexed)`으로 표시하며 `stockCoverage.indexed`·`guideCoverage.indexed` 집계. `/admin/seo/page.tsx` 초기값도 unindexed | 우리 서버 방문 로그 ≠ 실제 Google 색인. 크롤링/HTTP 관측값으로 이름 변경, 색인은 실제 URL Inspection 확인만 |
| **S688-06 P0 진실성** | `/api/admin/seo/gsc-sitemap-submit/route.ts`는 서버 GSC 제출 실패 시에도 `success:true` 가능, 구형 Google/Bing ping 요청 및 `Promise.allSettled` fulfilled(null 포함)를 성공으로 취급 | 검색엔진별 실제 HTTP 수락·GSC 상태를 개별 기록, 백엔드 실패 시 fail-closed. ping 수행을 Google 색인 성공이라고 안내 금지 |
| **S688-07 P0 진실성** | `/api/admin/seo/indexing-submit/route.ts`는 일반 SEO/pSEO URL을 IndexNow/기존 ping으로 제출하면서 “Google Indexing API” 성공 메시지와 `success:true` 제공 | 실제 Google Indexing API를 호출하는 것이 아니며 일반 URL에는 Google API 지원 불가. 허위 제공자·즉시 색인 문구 제거 |
| **S688-08 P1** | `indexing-api-card.tsx`는 사이트맵 제출 기록에 URL 수 **564**를 고정 사용하고 580개 즉시 색인·우선순위 크롤링을 홍보하며 기록은 React 로컬 배열 | 실제 제출 건수/공급자 수락 내역·지속 가능한 서버 영수증 사용. ‘제출’과 ‘색인’ 오인 방지 |
| **S688-09 P0 접근권한 검증** | 별도 `gsc-sitemap-submit` Next 라우트는 요청 IP 기반 프로세스 메모리 제한과 `API_ORIGIN` 직접 호출, 파일 자체에 명시적 관리자 세션/CSRF 판정 없음. 기존 `/api/seo/gsc`는 `api/mutate` 사용 | 실제 미들웨어까지 대조한 후 관리자 역할·CSRF·속성 범위·분산 레이트리밋으로 통합. **취약점 악용이 실증됐다고 주장하지 않음** |
| **S688-10 P1** | 최신 v685 코드가 별도의 IndexNow 응답·크롤러 감사 가짜 성공을 수정했으나 위 독립 GSC 제출/색인 BFF 및 화면은 검토 소스에 남음 | v685에서 해결한 부분은 유지하고 중복 코드를 덮어쓰지 않음. v685가 모든 SEO 문제 해결이라고 주장하지 않음 |

GSC JSON 서비스 계정 키는 기존 제한된 DB 경로를 거쳐 저장·사용한다. **키 등록 성공 ≠ 속성 권한·신선한 유입 데이터·실제 색인 확인**이다. 이 단계에서 비밀키/실제 Google 속성은 조회하지 않았다.

## 2. 운영자·편집자 중심 8가지 검증 과제

| 사람 / 질문 | 필요한 증거 | 피해야 할 잘못된 결론 |
|---|---|---|
| 운영자: “검색 방문자가 0명인가요?” | 확정 날짜 클릭/노출·무행/오류/기간·속성 구분 | API 무행을 방문자 0으로 단정 |
| 계산기 콘텐츠 담당: “어떤 키워드가 어떤 도구로 왔나요?” | 실제 query+page+country+device, 클릭·CTR·평균위치 | 한글 키워드만 보고 랜딩을 임의 매칭 |
| 한영 SEO 담당: “어느 언어 주소가 대표인가요?” | 선언 URL vs Google 선택 vs 대체언어 상호참조 | 모든 언어를 영어/한국어 한 URL로 몰기 |
| 사이트맵 운영자: “580개가 색인됐나요?” | 제출/수락 영수증 vs Google 검사를 분리 | 프론트 성공 토스트를 색인 증거로 오해 |
| API 장애 담당: “왜 동기화가 안 되죠?” | 속성·401/403/429·키 권한/만료/최후 성공시각 | 재시도 폭주·토큰 노출·가짜 최신 값 |
| 기술 SEO 담당: “어느 파일을 고쳐야 하나요?” | 실제 404/noindex/redirect/canonical/hreflang과 코드 소유자 | 서버 봇 방문을 Google 색인으로 분류 |
| 유입이 적은 신규 사이트 담당 | 실제 데이터 없음 상태·다음 개선행동 | 10k 키워드 복제품 양산·검색 순위 보장 |
| 관리자 접근성·보안 담당 | 비밀 없는 필터·표·권한 제한 | 관리자 화면 색인/브라우저에 원본 GSC 비밀 |

이는 **사용자 연구 가설**이며 운영자 인터뷰·실제 클릭/노출 계정을 이 단계에서 확보하지 않았다. 향후 동의 기반 관리자/콘텐츠 담당자·접근성 테스터에 가상 데이터로 평가한다.

## 3. 관리자 UI 3개 구역 상세 설계

**A. 검색 증거 현황(기본):** 실제 액세스 권한이 있는 Search Console 속성 선택, 태평양 시간 날짜범위, 확정 FINAL·최근 FRESH_INCOMPLETE 구분, 최후 정상 수집·최후 확정일. 노출·클릭·CTR·평균위치는 Google 제공 집계 차원과 함께 표시. 데이터 없음과 0건을 분리한다. 검색어→페이지 테이블에 국가/기기 검색 필터·속성/기간/집계 명시. 모든 검색어가 API로 나오지 않는다는 한계를 보인다. CTR·평균위치를 이종 페이지의 단순 산술평균으로 재계산하지 않는다.

**B. URL 색인·대표주소 확인:** 실제 구글 속성에 속하는 공개 URL만 선택. 선언 canonical·Google 선택 canonical·Google 색인본 마지막 크롤링/robots/noindex, 내부 사이트맵 포함 및 hreflang 짝을 **별도 행**으로 표시. URL Inspection은 **Google이 보관한 버전** 기준이며, 현재 실서비스의 HTTP/HTML 크롤러 검사와 명확히 분리. 무조건 580개 동시 검사 금지, 할당량/수집일·미검사 URL 표시. 관리자/개인/Test URL은 대상에서 제외.

**C. 개선 조치 목록:** 근거와 수정 코드 담당자 연결. 공개 콘텐츠의 404/5xx/리다이렉트 문제, 부적합 canonical, 실수한 noindex, 사이트맵 비정규 URL, 상호 참조 안 되는 번역 hreflang, 가치 부족한 대량 프리셋, GSC 데이터 지연을 분류한다. **중요:** 비공개 관리자/Test 경로의 noindex를 “개선”이라며 제거하지 않는다. 제출을 반복한다고 색인이 강제되지 않으며 코드 수정은 별도 브랜치·테스트·롤백 단계 적용.

## 4. API / 데이터 모델 후보 (실제 구현 전)

기존 `/api/v1/seo/gsc/analytics` 및 `/api/seo/gsc`를 확장한다. 동일한 SEO 원천을 여러 플랫폼에 복제하지 않는다.

- `GET /api/v1/admin/seo/search-evidence?property&from&to&dimensions&searchType&dataState&cursor`: `rows, aggregate, appliedFilters, reportingTimezone=America/Los_Angeles, lastFinalizedDate, coverage(TOP_ROWS_ONLY/COMPLETE_FOR_REQUEST/UNKNOWN), aggregationType, fetchedAt, isPartial, nextCursor, error`. 검색어/페이지/국가/기기/일자 허용 차원을 검사하고 비용이 큰 조합·기간은 제한.
- `GET /api/v1/admin/seo/url-evidence?property&url`: 사이트 HTTP/로봇/메타·사이트맵·선언 canonical·Google 선택 canonical·마지막 색인본 크롤링·URL 소유자/예산·근거시점 각각 반환.
- `POST /api/v1/admin/seo/url-inspection-jobs`: 관리자 로그인·CSRF·역할/소유속성·공개 URL 허용검사·쿼터 예약·중복방지·작업ID와 오류. GET 요청 시 무한 URL 검사 금지.
- `GET /api/v1/admin/seo/submission-receipts`: 사이트맵 GSC 제출, IndexNow 수락/거절, 실제 보낸 URL 수와 시간/HTTP 결과. **indexed 속성을 전송 성공에서 파생시키지 않는다.**
- GSC 제출/자격증명 변경은 기존 승인된 백엔드 경로 재사용, `webmasters.readonly` 읽기 우선, 제출에는 명시적 `webmasters` 쓰기 스코프와 사용자 클릭 요구.

Google 공식 API의 Search Analytics 날짜는 **태평양 시간** 기준이다. `dataState=all`은 최근 미확정값 포함 가능, `final`을 기준으로 비교. API가 숨긴 검색어·날짜 행 누락은 ‘실측 0’과 다름. IndexNow 수락/Google 사이트맵 제출/Google 실제 색인/검색 노출·클릭은 서로 다른 상태다.

## 5. Google API 용량·신뢰성·비밀키

- Search Analytics `rowLimit` 1~25,000/요청(기본 1,000), `startRow` 페이지네이션. 검색 종류별 **일 최대 50,000개 행 노출 제한 및 익명처리 검색어 생략 가능**. 검색어 상위 10건이 전체 데이터가 아님. 날짜별 일일 적재·속성별 캐시와 Google 수집 지연을 고려.
- URL Inspection 공식 문서 기준 **속성당 2,000건/일·600건/분** 제한. 실제 프로젝트별 사용량 확인하고 내부 예약 상한은 더 작게(예: 초기 100건/일) 정한다. 429 때 백오프·중복 제거·공유 작업 큐, 프로세스별 임시 카운터만 쓰지 않는다. Google 색인본 조회이고 **실시간 URL 테스트/색인 제출 기능이 아님**.
- `property,dateRange,dimensions,dataState,searchType,aggregation`별 캐시 키 분리. 오류 때 마지막 성공 시각 및 STALE 표시. 서버/API 요청시각을 Google 데이터 확정시각으로 사용하지 않는다.
- GSC 접근은 소유 속성의 OAuth/서비스 계정 권한 검증. JSON 개인키와 토큰을 클라이언트 응답/로그/URL/분석으로 보내지 않고 범위 최소화·키 교체·권한 해제를 설계.
- 실서비스 URL 프로브가 필요하면 공개 호스트만, DNS/private IP·리다이렉트·SSRF/timeout/응답 크기 제한. 검색어 입력을 URL로 직접 임의 fetch하지 않는다.
- 관리자 BFF별 실제 미들웨어·세션·RBAC·CSRF·쿼터 권한을 검증한다. `private,no-store`, noindex/인증과 비공개 페이지 보호 필수. **robots.txt 단독 차단은 비밀보호나 noindex의 대체가 아니다.**
- v685의 IndexNow 실제 수락·감사 예외 처리는 유지. 별도 레거시 Google/Bing ping은 GSC 제출과 구별하며 Google 색인 성공 근거로 사용 금지.

## 6. 운영자용 한영 메시지 12개

| 상태 | 한국어 | English |
|---|---|---|
| 연동 오류 | Search Console 연결을 확인할 수 없습니다. 마지막 정상 수집 시각을 표시합니다. | Search Console is unavailable. Showing the last successful fetch time. |
| 미연동 | 연결된 Search Console 속성이 없습니다. 권한을 먼저 확인하세요. | No Search Console property is connected. Check permissions first. |
| 무행 | 이 기간에 API가 제공한 행이 없습니다. 방문자 0명이라는 뜻은 아닙니다. | The API returned no rows. This does not prove zero visitors. |
| 잠정 자료 | 최근 데이터는 확정 전이므로 나중에 달라질 수 있습니다. | Recent data is preliminary and may change. |
| 사이트맵 수락 | 사이트맵 제출 요청이 수락됐습니다. 크롤링과 색인은 별도 확인해야 합니다. | The sitemap request was accepted. Crawling and indexing need verification. |
| 일반 URL 색인API 불가 | 일반 URL을 Google Indexing API로 즉시 색인할 수 없습니다. | Google's Indexing API does not support these general URLs. |
| 색인 확인 | Google 색인본에 색인 상태가 확인됐습니다. 검사 시각을 확인하세요. | Indexed status observed in Google's indexed version, as of this inspection. |
| 색인 미검사 | Google 색인 여부를 아직 검사하지 않았습니다. | Google index status has not yet been checked. |
| 다른 대표URL | Google이 다른 대표 URL을 선택했습니다. 두 주소와 근거를 비교하세요. | Google chose a different canonical. Compare both URLs and evidence. |
| 할당량 소진 | 검사 할당량이 소진됐습니다. 반복 신청 대신 가능한 시간에 다시 확인하세요. | Inspection quota is exhausted. Retry when budget allows. |
| 봇 방문 | 서버의 크롤러 방문 기록입니다. Google 색인 증거는 아닙니다. | This is a crawler visit, not Google indexing evidence. |
| 전송 불명 | 제출 결과를 확인하지 못했습니다. 재제출 전에 처리 영수증을 확인하세요. | Submission outcome is unknown. Check the receipt before retrying. |

읽기 쉬운 텍스트 상태·출처·기준시각을 제공하고 초록/빨강 색상만 사용하지 않는다. 키보드 필터·스크린리더 표 머리말, 모바일 320~430px·400% 확대, 날짜/시간대의 언어 지원. 실패·무행·중단된 권한에서도 가짜 초록 수치를 표시하지 않는다.

## 7. 효과 검증과 개인정보 기반 분석 원칙

향후 소유주/편집자/SEO 엔지니어 인터뷰에서 검색어→실제 랜딩페이지→조치 이해 가능 여부를 과제로 확인. 최소 트래픽/계정 연결 실패/구글 다른 canonical/401/403/429/크롤 지연/미확정 자료를 가상 테스트 픽스처로 구성. 이 단계의 **실사용 데이터·운영 계정·현황 통계는 UNKNOWN**.

익명 운영 이벤트: `seo_evidence_view`(속성 별칭·그룹핑·상태), `seo_url_inspection_requested`(할당량 구간), `seo_canonical_mismatch_reviewed`(유형), `seo_action_created`(유형·역할), `seo_submission_transport`(공급자·결과), `seo_api_error`(HTTP 상태 그룹). 검색어 원문·OAuth 키/서비스계정·개인 URL·사용자ID를 메트릭에 넣지 않는다.

질적 수용: 허위 ‘색인됨’ 0, 관리자/Test/비공개 URL 의도치 않은 색인 허용 0, 비밀유출 0, 크롤러 지표를 Google 데이터와 혼동 0, 생성된 개선 항목의 소유자·근거 100% 확인. 실제 검색 노출/클릭은 연결·권한 검증 후에만 기준값을 계산하고 개선 수치는 미측정 상태다.

## 8. D0~D7 단계별 개발·테스트

| 단계 | 구현 후보 (별도 승인 코드 PR) | 수용 기준 |
|---|---|---|
| **D0** | GSC/SEO Backend·Next BFF, 사이트맵/robots/canonical/hreflang, v685 수정과 전체 URL 소유자 최신 재조사 | 중복 SEO 센터 금지, 정확한 main SHA와 의도된 비공개 URL 확인 |
| **D1 P0** | 별도 레거시 indexing-submit/gsc-sitemap-submit 거짓 Google API·ping·색인 성공·564 고정 수치 수정 | 백엔드 오류/ping 응답 null/404일 때 성공 불가, 실제 공급자별 영수증 |
| **D2** | 태평양 날짜·최종/잠정 구분, 누락 행 null, 검색어·페이지·국가·기기 읽기 모델 | PT 자정/미확정·무행/익명 검색어·집계 CTR 테스트 |
| **D3** | 실제 Google URL Inspection 색인본 읽기·예산 공유 큐·중복제거 | 401/403/429·오류 때 가짜 최신 없음, URL Inspection ≠ 라이브 URL 표시 |
| **D4** | canonical·사이트맵·robots/noindex·hreflang·SEO 개선조치 소유자 | 관리자/Test noindex 유지, 다국어 교차검사, 자동 강제 색인 없음 |
| **D5** | 관리자 보안/권한·키 회전·BFF CSRF/분산쿼터·캐시/SSRF | 타인 속성 차단, 비밀키/개인정보 로깅 0, private IP 경로 차단 |
| **D6** | 하나의 /admin/seo 화면에 상태/조치·한영 접근성 통합 | 12개 메시지, 320/390px·400% 확대·키보드/스크린리더 |
| **D7** | 단위/부정권한/계약/실제 제한된 비운영 GSC 속성 통합, 동일 SHA 격리 Test·관리자 전체 UI 5회·세션/롤백 | v397/v530 API·UI, v523/542/543 경제/DB, 실제 SHA·보안·쿼터 미수용 시 **운영 HOLD**, 승인 후 별도 무중단 승격 |

부정 테스트: 연결 없는 속성, 키 만료·타인 속성, UTC/PT 날짜 차이, 빈 행 vs 실측 0, 10개 상위 행/5만 한계, Google Indexing API 잘못된 URL, ping fulfilled(null/404), 사이트맵 HTTP 200인데 색인 안 됨, Google 다른 canonical, hreflang 누락, robots 차단+noindex, 관리자 URL이 사이트맵에 들어감, Googlebot 방문과 미색인, 429/중복요청, localhost로 향하는 SSRF 리다이렉트, 서버 인스턴스 2개, 400% 화면 확대.

## 9. 2026-10-15 공식자료 16개

| ID | 레퍼런스 | 설계에 반영 |
|---|---|---|
| R688-01 | [Google Search Analytics query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) | 검색 차원·집계/PT 날짜/잠정상태 |
| R688-02 | [Google API 전체 데이터 추출](https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data) | 하루 상위·2만5천 건 페이징/5만 한계 |
| R688-03 | [Google URL Inspection](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect) | Google 색인본/속성 검사 전용 |
| R688-04 | [Google URL Inspection 결과 구조](https://developers.google.com/webmaster-tools/v1/urlInspection.index/UrlInspectionResult) | 크롤시각·Google/선언 canonical |
| R688-05 | [Google API 사용량 한도](https://developers.google.com/webmaster-tools/limits) | 검사 할당량·쿼터 |
| R688-06 | [Google Sitemaps list](https://developers.google.com/webmaster-tools/v1/sitemaps/list) | 실제 제출된 사이트맵 |
| R688-07 | [Google Sitemaps submit](https://developers.google.com/webmaster-tools/v1/sitemaps/submit) | 쓰기권한 필요, 색인과 다름 |
| R688-08 | [Google 사이트맵 제출](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) | 제출 ≠ 색인 보장 |
| R688-09 | [Google canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization) | Google 선택 대표 URL 다를 수 있음 |
| R688-10 | [Google 다국어 페이지](https://developers.google.com/search/docs/specialty/international/localized-versions) | 번역·hreflang 교차와 x-default |
| R688-11 | [Google noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing) | robots 차단 시 noindex 읽을 수 없음 |
| R688-12 | [Google Indexing API](https://developers.google.com/search/apis/indexing-api/v3/quickstart) | 구인·라이브 이벤트만 |
| R688-13 | [Google GSC OAuth](https://developers.google.com/webmaster-tools/v1/how-tos/authorizing) | 인증·최소 스코프 |
| R688-14 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | 접근가능한 표·상태/오류 |
| R688-15 | [Google 크롤/색인 FAQ](https://developers.google.com/search/help/crawling-index-faq) | 색인 지연/순위 비보장 |
| R688-16 | [Google robots.txt 안내](https://developers.google.com/search/docs/crawling-indexing/robots/intro) | robots는 비밀보호 수단 아님 |

모든 출처는 설계 참고자료이지 실제 현재 사이트의 GSC 유입·색인 상태를 측정했다는 증거가 아니다.

**v688은 상세기획/문서만 완료 대상**이다. Google API 검사·관리자 코드/DB·Test·운영 적용은 독립된 검증 가능한 개발 브랜치에서 수행해야 한다.
