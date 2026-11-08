# 월덕 머니버스 — 운영 SEO 실측 감사 (SEO01)
[English canonical](MONEYVERSE_SEO_PRODUCTION_AUDIT_v2026.11.08.SEO01.md) | **한국어**
**상태:** 실측 감사 완료 / 개선 제안 / 미구현. 2026-11-08 KST. Google Search Console 색인·순위 인증 아님.

## 기준 및 증거
- 최신 `origin/main` SHA: `6a4f16fd32cd5ee34d1220cda5e25c8d1437e8d4` (시작·중간 원격 재확인). 현재 운영 프론트: `prod-v2026.11.08.1772-6a4f16fd32`, https://easy-scraping.com.
- 권위 순서에 따라 문서 거버넌스, `PROJECT_PLAN`, `INTEGRATED_PLANNING_MASTER`, SEO 사이트맵 표준, 최신 블로그 작업로그를 조회. 운영 HTTP/HTML과 코드만 읽고, DB·금융·기능 스위치·운영 배포 변경은 하지 않음.
- /sitemap.xml **1,017개**(파일 내부 중복 0), /tools 경로 **738개**; 사이트맵 인덱스 6개. 블로그 사이트맵은 검사 도중 새 글이 발행되어 **56개(허브 4+글 52) → 57개(허브 4+글 53)**.
- 블로그 글 **53개 전수 HTTP 표본**은 53/53 HTTP 200, 자기 canonical, H1 1개, index/follow. 실제 Google 색인 여부와 지난 30일 노출·클릭·CTR·평균 순위·Core Web Vitals은 **미검증/UNKNOWN**, 0으로 간주 금지.

## 발견된 문제와 대응 우선순위
1. **P0 — 고정 제목 재사용:** 게시글 53개 중 **50개가 11개 동일 제목 집단에 속함**. 한국어 컴퓨터 7건, 미국 코딩 7건, 미국 경제 6건, 일본어 코딩 6건, 일본어 컴퓨터 6건 등. 근본 원인은 `backend/src/blog-editorial/blog-original-author.ts`의 국가 4×주제 3 = **고정 제목 12개** (`countryTitles[slot.country][slot.topic]`). `blog-duplicate-review.ts`에 제목 중복 검토 기능이 존재하나 실제 발행에서 중복이 통과한 사실을 확인. 제목만 일괄 수정하는 것으로는 부족하며 소주제·검색 의도·근거·본문 유사도를 검토하고, 고유 제목·본문·H1 및 발행 차단/재시도 검증 필요.
2. **P0 — 테스트 글 공개:** `/blog/2026-10-29-kr-compound-97a4ea4f`의 제목에 '테스트 복리 전략'이 포함되어 있으면서 사이트맵 수록, HTTP 200, index/follow, 자기 canonical. 실제 테스트용이면 승인된 콘텐츠 정책에 따라 게시 철회·사이트맵 제거 및 적정 noindex/410 처리. 다른 사용자/금융 데이터 삭제 불가.
3. **P1 — robots와 사이트맵 불일치 2건:** `/account-deletion`, `/businesses/ventures`는 `/sitemap.xml` 및 `/sitemap-static.xml`에 수록되고 HTTP 200·index/follow이나, robots.txt의 `Disallow: /account`, `Disallow: /businesses`가 크롤을 차단함. 의도적으로 공개할 URL만 정확히 허용하거나 사이트맵/메타 계약을 통합.
4. **P1 — lastmod 신뢰도:** /sitemap.xml의 **1,017개 전부 2026-10-24**, /sitemap-static.xml의 **62개 전부 2026-10-11**; 사이트맵 인덱스에서는 5개 하위 사이트맵을 요청 당시 현재 시간으로 표시. `sitemap.ts`의 릴리스 날짜 기본값, `sitemap-index.xml/route.ts`의 요청 시각 `new Date()`을 정확한 실변경/검증된 릴리스 날짜로 교정해야 함. 블로그 개별 문서는 다양한 실제 수정일이 존재.
5. **P1 — 사이트맵 중복:** 일반 사이트맵과 정적 사이트맵이 59개 URL 중복 등록. 자동 페널티는 아니나 크롤러 제출 경로와 갱신 일자를 일관되게 정리.
6. **P1 — 메타 설명과 영문 제목:** 블로그 글 **51/53개 meta description 160자 초과**(대체로 약 290자). 그 자체가 순위 패널티는 아니며 간결하고 글별로 고유한 설명을 권고. `/en/blog` title에 'Woldeok Moneyverse'가 두 번 출력됨.
7. **P1 — 문서의 검색 의도/정보 가치:** 본문 중간 길이 약 3,943자(렌더링 article 텍스트); 길이가 품질을 증명하지는 않음. 독립 공식 출처·구체 문제 해결·코드 예시·내부 링크·국가별 검색어 대응 강화. /tools 738개 pSEO URL의 실질 콘텐츠 차별성은 **추가 검증 필요**(현 시점 '저품질 확정' 아님).
8. **P2 — 발행 안정성:** `moneyverse-verified-blog-v1419.timer`는 2시간 주기 및 재시도 설정. 22:07 시도는 숫자 근거 검증 실패로 종료, 22:46 동일 슬롯의 JP 코딩 글은 PUBLISHED 영수증 기록. 품질 검증 우회 금지.

## 개선 검수 기준
- **P0:** 신규 중복 제목 발행 0, 실제 테스트 콘텐츠 공개 0, 기존 글의 제목/본문 유사도 재검토와 검증된 발행 영수증.
- **P1:** 사이트맵·robots·실제 HTTP 메타 정합성 100%; 진실한 lastmod; 다국어 canonical/hreflang 검증; Google Search Console 권한 있는 실제 30일 색인·노출·클릭·검색어·CTR 측정; CWV p75 실측.
- **P1:** 고유 검색 의도를 기준으로 콘텐츠 기획, 출처·예제·계산기 내부링크 강화. YMYL 금융 정보는 정확성·출처 검증 후 공개.
- **작업 제한:** 이번 회차는 감사와 문서 기록뿐. 코드 수정은 별도 브랜치와 CI, 독립 Test 백엔드·엣지 검증, 무중단 운영승격 게이트 필수.

## 자료
- 라이브: https://easy-scraping.com/robots.txt · https://easy-scraping.com/sitemap-blog.xml · https://easy-scraping.com/sitemap-index.xml
- 코드: `backend/src/blog-editorial/blog-original-author.ts`, `frontend/src/app/sitemap.ts`, `frontend/src/app/sitemap-index.xml/route.ts`
- 외부: https://developers.google.com/search/docs/appearance/title-link
- 서버 실측 JSON: `/srv/moneyverse-data/tasks/seo-audit-20261108-2238/`의 4개 audit.json.
