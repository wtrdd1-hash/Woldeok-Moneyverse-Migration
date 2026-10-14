# Moneyverse 전면 전략 재감사 및 방향성 제안 — v2026.10.14.601

> 상태: FINDINGS / 전략 제안, 아직 제품 기획의 승인된 권위 아님
> 작성: 2026-10-14 KST | 기준: `origin/main=e1517e994daf2516d411597b64c2aae30ab4e1b5`
> 독립 작업 브랜치: `docs/strategy-audit-v2026.10.14.601`
> 상위 권위: `docs/planning/PROJECT_PLAN.md` (v530), `INTEGRATED_PLANNING_MASTER.md`
> 이번 문서는 코드/DB/서비스를 변경하지 않는다.

## 1. 검사 범위와 증거 수준
- 저장소 전체 Markdown 1,888개를 읽기 전용으로 순회하여 SHA256 내용 해시·주제 검색·중복 그룹을 검사함; `docs/` 하위 1,801개. 콘텐츠가 모두 개별 수작업으로 전문가 검토된 것은 아니다.
- 코드 직접 확인: `frontend/src/app/sitemap.ts`, `robots.ts`, `frontend/src/app/api/admin/seo-audit/route.ts`, `frontend/src/app/api/admin/seo/indexing-submit/route.ts`, 계산기 JSON-LD, 상위 계획 문서.
- 운영 HTTP 스모크: `/robots.txt`, `/sitemap.xml`, `/tools/compound-calculator`, `/en/tools/compound-calculator`, `/api/health`에서 200 응답; Test `/api/health`에서 200 응답. 이는 UI/E2E/경제원장/검색 색인 인증이 아니다.
- 운영 사이트맵: 1,012 URL, 중복 loc 0, 언어 대체 링크 9,108개. URL 수는 색인 수·검색량을 의미하지 않음.
- 미확보: Search Console 실제 API/성능 내보내기, GA4 활성화/코호트, 네이버 서치어드바이저, 실제 AdSense 수익, 로그인 E2E, 운영 DB 원장 감사. 원인별 트래픽 기여도는 추정 불가.

## 2. 처음 목표와 지금의 차이
프로젝트 원래 추구한 핵심은 WLD로 이루어진 사용자 참여형 가상 경제·성장·커뮤니티이며, 현실 금융 계산기는 검색을 통해 처음 만나는 무료 유틸리티다. 현재 과잉 확장: 15 도메인 API, 국고/주식/채권/은행/기업/카지노/게임화/국제화/SEO/금융 계산기/자동 블로그 등 많은 개별 기능이 유저의 첫 가치와 일간 복귀 동기로 얼마나 연결되는지는 입증되지 않았다.
**추천 한 문장 포지셔닝:** '실제 금융을 이해하는 무료 계산기에서 시작해, 가상 경제에서 선택과 결과를 체험하고 성장하는 Moneyverse.'
실제 원화와 가상 WLD/주식은 화면·데이터·정책에서 확실히 구분한다.

## 3. 전략 선택지
A. 금융 계산기·SEO 포털 집중: 빠른 검색 의도, 간단한 이용 경험; 차별성과 재방문 취약.
B. 가상 경제 MMO 플랫폼 집중: 차별성과 잔존 잠재력; 유입/첫 복잡성/규제·운영 비용 고위험.
C. **추천: 금융 유틸리티 → 경제 선택 시뮬레이션 → 경제 세계 참여의 두 층 연결형**. 검색자가 계산 결과를 받은 뒤 동일 주제의 1회용 익명 가상경제 비교 체험 → 동의 기반 저장/가입 → WLD 경제 인생/직업/시장/국고로 진입. 검색 목적을 침해하는 강제가입/광고 유도는 금지.

## 4. 근거 기반 심각도
| ID | 심각도 | 근거 | 결정/수용 조건 |
|---|---|---|---|
| SEO-01 | P0 | `frontend/src/app/api/admin/seo-audit/route.ts`가 고정된 크롤러 시간, 색인율 99.4~100%, `HEALTHY`, schema `VALID`, `totalIndexedUrls=allUrls.length`를 생성 | 실측 provider 시각/표본/오류/권한을 포함한 'VERIFIED' 값만 표시. 나머지 `UNAVAILABLE`/DEMO로 명시; 검증 안 된 100%/99.4% 사용 금지 |
| SEO-02 | P0 | `.../api/admin/seo/indexing-submit/route.ts`가 `www.google.com/ping?sitemap=`에 대한 성공 여부를 단순 Promise fulfilled로 판단하고 'Google Indexing API' 성공이라 표기 | Google Search Console Sitemaps API로 대체; 제출·수신·처리·색인 상태를 구분. Google Indexing API는 적격 JobPosting/BroadcastEvent에만 사용 |
| SEO-03 | P0 | 다수 계산기 JSON-LD의 `AggregateRating` 고정 4.9+ 값, 사후 검증 불가 | 출처/실제 리뷰/노출되는 평점 검증 전 잘못된 평점 스키마 비활성화; Search Rich Results Test 및 페이지 텍스트 일치 검사 |
| SEO-04 | P1 | 현재 sitemap.ts는 1,012개 URL과 대규모 일괄 대체언어 링크를 생성하며 고정 릴리스 타임스탬프 사용 | URL마다 200, 색인 가능, 실제 번역/자기 canonical, 독립 가치, hreflang 상호성, 실제 수정일 검사. 저가치 프리셋 병합/noindex |
| SEO-05 | P1 | AI 자동 블로그·프리셋 대량 확대 문서/코드 | 원본 출처, 지역별 최신 세법·계산식, 편집 검토, 독창적 도구/결과 없는 글/페이지 대량 공개 중단 |
| PROD-01 | P0 | `PROJECT_PLAN.md`에는 긴급 관리자 UI 재검증 및 identity API 500 차단 기록 | 최신 운영 exact SHA에서 모바일/관리자 인증 E2E 5패스와 해당 API 재점검 |
| PROD-02 | P1 | 고급 금융/카지노/국고 기능과 초회 가치 사이의 경로 검증 없음 | 첫 유용 결과 시간, 2번째 행동, 저장, D1/D7을 이벤트로 측정 |
| GOV-01 | P0 | 카지노 제거 문서 vs enabled 스위치; 기획/운영 버전 별개, 기존 v600 조정 PR | 기능·법률·광고 안전성 확인 전 카지노를 성장/검색 핵심 진입점으로 광고하지 않음 |
| GOV-02 | P1 | 경제 AI·통화·국고가 복잡 | Mint/Treasury/settlement 분리, AI 제안-only, 권한·승인·멱등성·회계 불변식·킬스위치 검증 |

## 5. 국내·해외 검색 전략 구분
**국내 / KO**
- 1차 키워드 패밀리: 연봉 실수령·퇴직금, 대출/DSR·이자, 예금/복리, 주식 평균단가, ISA/연금, 증여세·양도세.
- 각 핵심 도구에 계산식, 가정, 2026 시행일, 정부/공공 출처, 개인정보 미수집, 사용 예, CSV/표, 공유 가능한 결과 URL 제공.
- Naver 수집/색인 보고서와 Google GSC를 **별도 측정**; Google 규칙을 네이버에 기계적으로 적용하지 않음.
- 세금 계산에는 확정 조언 대신 공식 자료/범위와 예시를 표시.

**해외 / EN 우선, 이후 JA·ZH 검증**
- 영어 초점: compound interest, DCA, FIRE/retirement, debt payoff, mortgage, net-worth tracking, salary/tax는 국가별 실제 제도 구분.
- 단순 KO 원문 기계번역만으로 지역별 금융 규칙 페이지를 발행하지 않음.
- locale 명시 URL, 자체 canonical, 실제 영어 결과/서식/통화, hreflang 상호성, GSC 국가별 데이터에 기반해 배포.
- EN의 유입·도구 재방문·결과 저장을 증명한 후 JA/ZH 확대. SEO 성장에 국가별 다른 키워드/법률/통화를 적용.

## 6. SEO 진단 분기와 KPI
- 우선 GSC 과거 90일의 `page×query×country×device` impressions/clicks/CTR/position 및 Page Indexing canonical/robots/discovered/crawled-not-indexed를 확보. GA4에 익명 `tool_view/result_completed/second_action/onboarding_started/signup/first_economy_action/d1/d7/d30` 이벤트.
- '노출 낮음'이면 URL 접근·색인·검색 의도/품질, '노출 높고 CTR 낮음'이면 제목/스니펫·검색 의도, '클릭 많고 가입 적음'이면 결과 가치와 CTA, '가입 많고 D7 낮음'이면 첫 경제 행동과 잔존 루프 조사.
- 우선 SEO 코호트 20~40개 *품질 검증 페이지*에서 측정 후 확대. 검색 순위/색인/광고 수익 보장 금지.
- 우선순위 판단 지표: 정확한 데이터 연결률 100%, 핵심 인덱싱 오류 P0=0, 첫 결과 완료율, 유용한 두 번째 행동 비율, 활성화율, D1/D7/D30, organic activated users, 광고 순공헌. **목표 수치는 실측 후 확정.**

## 7. 경제 시뮬레이션 핵심 루프
- 0분: 검색 계산기로 실질적인 결과 즉시 제공.
- 1분: '이 조건으로 가상 경제 실험하기' 선택형 30~90초 미리보기(로그인/광고 강제 없음).
- 3분: 목표(내집/창업/투자/자산 독립) 선택 → 예산/직업/투자/리스크 시뮬레이션.
- 첫날: WLD 가상 경제 프로필과 1회 직업·소비·저축·투자, 원장 영수증/순자산 변화.
- 7일: 매일 똑같은 클릭 퀘스트 대신 경기변동/국고 사업/친구 협업/수요 충격으로 진짜 다른 결과.
- 30일: 직업 전문성, 사업/클럽/공공 프로젝트 목표, 사용자 협력과 성장 이력. 실물 투자·수익·현금화 암시 금지.

## 8. 기능 포트폴리오 결정
- **P0 유지·품질 강화:** 지갑/원장, 직업/퀘스트, 초보자 경제 체험, 은행 기본, 핵심 계산기, 로그인/복구, 관리 관제·보안, 모바일 UI.
- **P1 재설계 후 선택 제공:** 주식(모의), 사업, 국고/세금/공공 프로젝트, AI 설명 도우미(자동 발행 X), 친구/클럽, 알림·시즌.
- **P2 보류/게이트:** 고배율 파생, 카지노/확률형, 카피트레이딩, 과도한 국제 거시파생상품, 자동 생성 블로그/수백 개 중복 프리셋. 법률/브랜드/유저가치/안전 기준 통과 시에만 진행.
- 현존 기능 제거 지시가 아니다. 사용자 메인 동선·개발 우선순위에서 후순위/검증 대상으로 전환.

## 9. 수익화 원칙
- 현행 v487 '광고만 허용' 우선 권위를 준수. 상충하는 이전 유료 구독/장식 계획을 자동 복구하지 않는다.
- 유용한 공개 계산기·설명/가이드에서만 광고 실험하고 인증/거래/지갑/안전/관리자/카지노/사적 메시지에 광고 금지.
- RPM/eCPM/뷰어빌리티/무효트래픽/이탈/D7/페이지 사용성 기준을 측정하기 전 임의 수익 전망 금지.
- Google AdSense의 low-value content, 광고와 콘텐츠 혼동, 우발 클릭 및 Private Communication 금지 지침 준수.

## 10. 단계별 실행 게이트
- **0~7일 (P0 Truth Reset):** 가짜 SEO 대시보드/제출 성공 메시지/근거 없는 별점 감사; GSC/GA4/Naver 실제 증거 확보; 현재 Git main과 배포 exact SHA 일치/불일치 정리; 기존 UI 500 및 관리자 화면 재점검.
- **8~21일 (Search Quality):** 질 높은 상위 20~40개 도구/설명 페이지 선택, 누락/중복/언어/SEO 및 모바일 검수; 저가치 URL noindex/통합 후보를 Google 색인·로그 자료로 결정.
- **22~45일 (Activation):** 3개 계산기에서 익명 가상경제 시나리오 → 선택 가입 → 첫 원장 거래 → D7 실험. 개인정보·동의·무강제 정책.
- **46~90일 (Retention/Revenue):** 코호트 D7과 공헌이 입증된 경로 확대, 대규모 콘텐츠/지역 확장 중단 유지; KPI 충족 시 하나씩 추가.

## 11. 조사한 공식 레퍼런스
- Google Spam Policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google People-first: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Review snippets: https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- Google Indexing API limitations: https://developers.google.com/search/apis/indexing-api/v3/using-api
- Google sitemap discovery/limits: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Google sitemap submission: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google multilingual: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google Search Console + Analytics: https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console
- Google FAQ rich results: https://developers.google.com/search/blog/2023/08/howto-faq-changes
- Naver Search Advisor Crawl: https://searchadvisor.naver.com/guide/report-crawl-refine
- AdSense placement: https://support.google.com/adsense/answer/1346295
- Google Publisher Policies: https://support.google.com/adsense/answer/10502938
- 내부 연구 기준: `docs/findings/MONEYVERSE_SEO_DEMAND_KEYWORD_RESEARCH_REVIEW_v2026.10.05.527.md`, `docs/planning/GLOBAL_GROWTH_EXECUTION_SPEC.md`, `docs/planning/SEO_DEMAND_KEYWORD_EXPANSION_SPEC.md`, `docs/planning/AD_ONLY_ADVERTISING_REVENUE_SPEC.md`.

## 12. 의사결정 대기
이번 감사는 **추천/근거**이며 제품 전략 승인이나 코드 수정이 아니다. 제품 방향(C)을 승인하기 전 제시된 P0 위험을 먼저 바로잡고 실제 GSC·GA4·Naver 지표로 가설을 검증한다. 모든 구현은 별도 브랜치→정확한 SHA의 Test/UI/backend/DB/보안 검증→무중단 운영 승격을 요구한다.
