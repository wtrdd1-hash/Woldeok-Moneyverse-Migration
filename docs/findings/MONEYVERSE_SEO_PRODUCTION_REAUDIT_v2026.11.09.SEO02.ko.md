# 월덕 머니버스 운영 SEO 재감사 — SEO02

**버전:** v2026.11.09.002 (문서 전용 감사)  
**상태:** HTTP 표본은 PRODUCTION_VERIFIED / 개선 미완료 / GSC·CWV 미확인  
**관측:** 2026-11-09 01:05~01:10 KST  
**main 기준:** 5ac2dcfd84c6b2bc2bca7c8859b77f66070a1ced (시작·중간 재확인)  
**운영 주소:** https://easy-scraping.com  
**릴리스 포인터:** production-current → prod-v2026.11.08.1773-5ac2dcfd84  
**범위:** 운영 HTTP, 원격 서비스 및 빌드 실행파일, 정본 문서 읽기 전용 점검. 코드·DB·국고·운영 변경 및 배포 없음.

[영어 정본](MONEYVERSE_SEO_PRODUCTION_REAUDIT_v2026.11.09.SEO02.md) | [어제 SEO01 감사](MONEYVERSE_SEO_PRODUCTION_AUDIT_v2026.11.08.SEO01.ko.md)

## 감사 근거
docs/planning/PROJECT_PLAN.md, INTEGRATED_PLANNING_MASTER.md, docs/DOCUMENTATION_POLICY.md, 사이트맵 SEO 표준, SEO01 전날 결과, main 및 PR #2942, 운영 XML/HTML과 공개 블로그 글 53개 전수, 계산기 표본 12개를 확인. 서버 증거: /srv/moneyverse-data/tasks/seo-audit-20261109-0105/audit.json 및 summary.json. Google Search Console 인증 지표는 아님.

## 운영 실측 비교
| 항목 | 11월 9일 | 11월 8일 SEO01 |
| --- | ---: | ---: |
| 기본 사이트맵 항목/고유 URL | 1,034/1,034 | 1,017/1,017 |
| 정적 사이트맵 항목/고유 URL | 81/80 | 62/미확정 |
| 사이트맵 인덱스 하위 파일 | 6 | 6 |
| 블로그 사이트맵 | 57 (허브 4, 글 53) | 감사 종료시 57 |
| 블로그 페이지 HTTP 200 | 53/53 | 53/53 |
| 블로그 자기 canonical·H1 하나·index 허용 | 53/53 | 53/53 |
| 전체 53개 글의 고유 제목 | 14 | 14 |
| 중복 제목 글 | **50/53 (11개 중복군)** | **50/53** |
| description 160자 초과 글 | 51/53 | 51/53 |
| 기본/정적 사이트맵 간 중복 URL | 78 | 59 |
| 기본 사이트맵의 tools 계열 (허브 포함) | 743 | 전날 도구 경로 738 |

추가로 53개 글 모두 OG 제목·이미지, Twitter 카드, JSON-LD, hreflang을 반환했다. 이는 HTML 신호의 존재이지 검색엔진 채택 보장은 아니다. 계산기 12개 표본은 전부 HTTP 200, H1 하나, 자기 canonical, index 허용. 테스트 도메인 robots.txt는 전체 차단으로 확인했다.

## P0 — 기존 블로그 제목 중복 미해결
공개된 글 53개 중 **50개가 11개 제목 집단에 중복**된다. 예: 한국 컴퓨터 글 7개, 미국 코딩 글 7개, 일본 코딩 글 6개, 미국 경제 글 6개. 별개 canonical 페이지가 유사한 검색 의도를 반복적으로 겨냥한다. 본문 동일성·출처 원본성은 별도 검사 대상이다. 제목 중복 자체가 자동 검색 페널티임을 의미하지는 않는다.

PR #2942(v1773)는 소스에서 국가·주제별 제목 후보를 6개로 늘렸지만, 실제 예약 발행 서비스 moneyverse-verified-blog-v1419.service는 blog-worker-v2026.11.02.1624-pinned를 가리키는 별도 고정 작업 디렉터리에서 실행된다. 이 빌드의 blog-original-author.js에는 아직 국가·주제별 제목 **1개 고정맵**이 남아 있다. 즉 운영 웹 릴리스 v1773이 발행기 개선까지 포함해 실제 적용됐다고 볼 수 없다. 새 소스도 slotIndex 0~11을 후보 수 6으로 나눈 방식이므로 날짜를 넘는 전역 고유 제목 보장이 되지 않는다.

**검수 기준:** 실제 운영 워커와 검증된 후보 SHA 일치, 검색 의도별 고유 제목·H1·실질 본문, 출처 검증·중복 거절·재시도 및 발행 영수증을 확인한다. 기존 글은 제목만 대량 변경하거나 임의 삭제하지 말고 개별 본문 품질과 중복을 검수한다.

## P0 — 자동발행 안정성
타이머는 활성이나 2026-11-09 00:45 KST 실행 후 워커 서비스는 failed 상태였다. 00시 발행 슬롯에서 MODEL_SECTION_NOT_VERIFIED 검증 실패와 비정상 종료를 확인했다. 전날 22시 일본 코딩 슬롯은 재시도 끝에 PUBLISHED 영수증을 받았다. 이는 매 2시간 모든 슬롯의 안정적 발행을 뜻하지 않는다. 발행 빈도를 맞추려고 검증을 우회하면 안 되며, 동일 검수 소스 기반 워커 릴리스와 안전한 재시도·관측을 설계해야 한다.

## P1 — 사이트맵 lastmod·중복
기본 사이트맵 1,034건과 정적 사이트맵 81건이 모두 2026-11-08T00:00:00Z로 동일하다. 사이트맵 인덱스 6개 중 5개도 그 시각, 블로그 파일은 실제 게시글 최신 시각으로 표기한다. 과거보다 인덱스/정적 파일 시각 일관성은 개선됐지만, 획일적인 릴리스 날짜가 개별 URL의 실제 주요 수정일이라는 증거는 없다. URL별 의미 있는 변경 기록과 대조해야 한다. 정적 사이트맵 내부 URL 중복 1건, 기본/정적 중복 78건을 정리해야 한다. **자동 페널티 확정은 아니다.**

## P1 — 메타 제목·대규모 콘텐츠
/en/blog의 브랜드명 중복은 해소됐다. 반면 /treasury, /tools, /stocks, /businesses/ventures 페이지 제목에서 한국어 브랜드명이 두 번 나온다. /treasury·/enterprises·/pension은 canonical 및 구조화 데이터가 렌더링된다. 금융 계산기의 ‘2026 최신’ 법률·세금 수치와 조건은 최신 공식 근거, 국가, 기준일 확인이 필요하다. tools 계열 사이트맵 743개는 표본 12개 외 전체 본문 가치·중복성 검증이 필요하다. 대량 URL만으로 스팸 확정 금지.

## 개선된 사항
- robots.txt가 /account-deletion, /businesses/ventures 크롤을 명시적으로 허용하여 이전 경로 충돌 두 건 개선.
- /en/blog 제목에서 브랜드 반복 제거.
- 공개 글 53/53의 200·자기 canonical·단일 H1·index/follow 확인.
- 이번 53개 글 제목 표본에는 ‘테스트’라는 단어가 없었다. 다만 2026-10-29 기존 금융 글 URL 두 개가 공개 색인 허용 상태이며 개별 출처·내용 중복 검토는 필요하다.

## 미측정·작업 범위
**UNKNOWN:** 실제 구글 색인 페이지 수, 28/30일 검색 노출·클릭·CTR·검색어·순위, 네이버·빙 유입, Core Web Vitals p75, 광고 RPM. 공개 site: 검색이나 단순 HTTP 200은 검색엔진 실제 색인 근거가 될 수 없다.

**종합:** 기술 SEO 일부 개선, **콘텐츠 및 발행 운영 P0 미해결**. 이번은 문서/증거 기록 전용이며 코드·DB·테스트·운영 승격은 하지 않았다. 이후 수정은 신규 브랜치, 최신 main 및 제미나이 병렬 작업 재대조, CI, 격리 Test 프론트/백엔드/DB, SEO 회귀, 무중단 승격 기준을 따른다.

참고: [PR #2942](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/2942), [Google 제목 권장](https://developers.google.com/search/docs/appearance/title-link?hl=ko), [사이트맵 규격](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko), [확장 콘텐츠 스팸 정책](https://developers.google.com/search/docs/essentials/spam-policies?hl=ko).
