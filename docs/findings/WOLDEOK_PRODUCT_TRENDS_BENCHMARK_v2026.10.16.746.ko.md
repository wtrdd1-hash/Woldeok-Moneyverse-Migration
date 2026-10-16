# 월덕 머니버스 2026 경쟁 사례·검색·제품 품질 심층 재검토 — v2026.10.16.746

**상태: 조사·개선 제안 / 제품 기획 권한 변경 아님 / 구현·운영 승격 아님**
**검토일:** 2026-10-16 KST
**검토한 main:** `7db7150cd20a684e62a2c1d71c42dc6200929b91`
**영문 원본:** [English](WOLDEOK_PRODUCT_TRENDS_BENCHMARK_v2026.10.16.746.md)
**협업:** main에 병합된 [v745 전면 기획-코드 감사 PR #905](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/905)의 **경쟁 서비스·공식 레퍼런스·성장전략 보완**. v744/v745 파일을 수정하거나 덮어쓰지 않는다.

## 1. 종합 방향

머니버스는 **현금 환급되지 않는 가상 WLD를 쓰는 지속형 사회경제 시뮬레이션**이다. 실제 증권사, 실시간 투자뉴스 회사, 현금 보상 서비스가 아니다. 일자리와 검증된 보상 → 지갑·은행 → 가상 주식·사업 → 공동체와 경제정책이라는 기존 핵심 순환을 먼저 믿을 수 있게 해야 한다. 더 많은 기능을 무리하게 추가하는 것보다 **원장으로 확인되는 재화 흐름, 사용자가 이해할 수 있는 성장, 실질적으로 유용한 공개 학습도구, 가상임을 명확히 밝히는 AI 콘텐츠**를 차별화 근거로 삼는다.

**검증 구분:** 최신 main의 코드를 직접 확인한 내용, 미니PC 상태를 읽기 전용으로 검사한 내용, 과거 v713/v737/v743 감사 내용, 외부 유사 서비스에서 도출한 가설을 절대 혼용하지 않는다. 사용자 인터뷰, 실측 트래픽, GSC 자격증명, 운영 DB 거래, 전체 관리자 E2E, 모바일 실기기 검증은 이번 작업에서 실행하지 않았다.

## 2. 코드와 기획의 차이: 재검증 목록

| ID / 우선순위 | 관찰 및 근거 | 실질적인 보완 |
|---|---|---|
| T746-01 P0 | 별도 `production-current` 포인터는 v717, 오래된 `moneyverse-backend/frontend` 서비스의 실제 프로세스 작업 경로는 `prod-v600`. v745는 **별도 v717 서비스와 외부 공개 버전 v717**도 확인했다. 따라서 운영 방문자가 v600으로 연결된다는 주장은 성립하지 않는다. | Nginx 업스트림·리스닝 포트·스케줄러 주도권·백그라운드 중복실행을 프로세스별로 추적하고 배포 매니페스트와 정확히 일치시킨다. 충분한 이관·롤백 검증 전 임의 재시작 금지. |
| T746-02 P0 | v743의 가상화폐 초기잔액·원장 대조 미확정 문제와 재정 권한 경고, v523/542/543 원장 보전 정책. 과거 보고는 이번 작업의 운영 DB 재현 결과가 아니다. | 불변 초기장부 근거를 확보하고 독립적 원장·국고·통화량 대조, 최소권한 DB 역할, 멱등 정산을 복구된 격리 Test에서 검사한다. 수치를 맞춘다는 이유로 임의 발행·수정 금지. |
| T746-03 P1 | `frontend/src/app/[locale]/tools/compound-interest-calculator/compound-calculator-client.tsx`는 가입 보상 ‘Claim 10,000 WLD’, ‘risk-free’ 문구를 표시한다. 이 UI 문구 자체는 지급 원장 증빙이 아니다. | 실제 자격·지급 영수증과 연결되기 전 보상확정 문구 배제. 사용자는 가입하지 않아도 정확한 계산을 사용할 수 있어야 한다. |
| T746-04 P1 | `backend/src/seo/seo.service.ts`는 크롤러 건강상태를 기준으로 ‘indexed’ 수를 계산하고, `frontend/src/app/admin/analytics/analytics-client-view.tsx`는 이를 색인확정처럼 표시한다. | 발행 → 사이트맵 제출 → 크롤러 방문 → GSC URL 색인 확인 → 실제 노출·클릭을 분리한다. 확인 전에는 ‘미확인’. |
| T746-05 P1 | `backend/src/admin/treasury/treasury.repository.ts`에는 정적 `RECONCILED` 값 반환 경로가 남아 있다(검토 SHA 기준 약 506, 879행). | 실제 호출경로와 독립된 회계 근거 검증. 계산하지 않은 ‘정상 대조 완료’ 표시 제거. |
| T746-06 P1 | 미니PC `df -h /srv`: 99GB 중 약 86GB 사용, 8.9GB 여유, 사용률 91%. | 보관 릴리스·작업트리·로그·백업 용량 분석, 임계치 경보와 안전한 보관정책을 수립한다. DB WAL/운영 릴리스/검증되지 않은 백업 임의 삭제 금지. |
| T746-07 P1 | Android 별도 저장소 main `ee97ddfc5a93...`, v1.3.5 서명 관련 병합(2026-10-15). 웹과 Android 및 실운영은 각각 다른 코드 정체성. | 앱-API 계약 자동 대조, 서명 결과물·실기기 로그인, 세션/언어/딥링크/401/403/409와 지갑 거래영수증을 검증한다. |

## 3. 비교할 외부 제품·산업의 강점

**EVE Online — 게임 경제 투명성:** 2026년 10월 14일 게시된 9월 보고서를 포함하여 공식 월별 경제 보고서가 생산·파괴·통화량·물가 흐름을 날짜와 함께 공개한다. 머니버스에도 가상 WLD의 발행·소각·보상·시장 유동성·국고 흐름을 **실제 DB에서 재현 가능한 출처와 집계 기준**으로 제공하자. 데이터가 없으면 ‘집계불가’를 표시하며 임의 통계 생성은 금지한다. <https://www.eveonline.com/ko/news/467>

**Sim Companies — 배우면서 사업하는 게임:** 회사를 키우고 경제 구조를 배우는 무료 비즈니스 시뮬레이션을 전면에 내세운다. 머니버스는 직업 → 생산·사업 → 상품 판매 → 회계영수증 → 재투자의 전체 이야기와 커뮤니티 멘토링을 앞에 보여줘야 한다. 첫 접속에서 15개 메뉴를 모두 이해하도록 요구하면 안 된다. <https://www.simcompanies.com/search/>

**Google의 AI 검색 변화 — 원본 가치가 중요:** AI 개요와 AI 모드 노출에 별도 특별 마크업은 없으며, 유용한 본문·크롤링 가능성·출처가 중요하다. AI가 만든 대량 번역 글만 늘리는 전략은 품질과 유입 양쪽에서 불리할 수 있다. 계산기·용어해설·가상경제 분석·지역별 출처 기반 글이 더 유용하다. <https://developers.google.com/search/docs/appearance/ai-features?hl=ko>

**W3C·web.dev — 모바일에서 완성되는 서비스:** 실제 모바일 터치·글자 확대·키보드·화면 재배치·상태 알림까지 검증해야 한다. 코어 웹 바이탈 목표치는 p75 기준 LCP 2.5초 이하, INP 200ms 이하, CLS 0.1 이하이며 **목표일 뿐 머니버스 실측치가 아니다.** <https://www.w3.org/TR/wcag2mobile-22/> · <https://web.dev/articles/defining-core-web-vitals-thresholds?hl=en>

## 4. 분야별 최신 방향

### 4.1 AI 블로그·가상 주식 뉴스
생성, 편집 검토, 발행, 가상 시세 이벤트, 정정·철회, 만료 시점을 반드시 분리한다. 이용자가 AI 기사인지, 가상경제 사건인지, 실제 뉴스 참고인지 명확히 알도록 한다. 이미 발행한 글은 생성 서버 장애에도 보존하고, 가장 최근 **실제 발행 성공 시간**을 표시한다. 제목/글쓴이/원문 출처/최초발행/수정/이미지 권리/정정이력 및 `Article` 스키마를 원문 내용과 일치시킨다. 금융 관련 콘텐츠는 Google E-E-A-T/YMYL의 신뢰성 우선 원칙을 참고하되, 가상 시뮬레이션을 실제 투자상품처럼 포장하지 않는다.

**검증:** 4개 언어 각 5개 글을 샘플링하여 정확한 본문·메타·가상표시·발행시간·정정·이미지·출처 확인. Google 색인이나 Google News 게재는 약속하지 않는다.

### 4.2 한국·미국·일본·중국 현지화
언어와 지역을 분리하고 사용자가 직접 바꾸는 설정을 최우선으로 유지한다. 접속 IP 추측만으로 강제 리디렉션하면 검색엔진/여행 중 이용자가 페이지를 보지 못할 수 있다. `/ko`, `/en`, `/ja`, `/zh`의 URL은 각 언어에서 실제 의미 있는 본문, 자체 canonical, 상호 hreflang, 수동 전환 메뉴, 언어 저장 상태를 갖춰야 한다.

- **한국:** 한국 사용자가 쉽게 이해하는 게임·금융 용어, 국내 관련 출처.
- **미국/영어:** 미국 관련 금리·규칙은 실제 적용연도와 출처를 검토해 설명하되 한국 세금 공식을 미국에 재사용하지 않는다.
- **일본어:** 일본어 독자에게 자연스러운 경제·게임 설명과 원본 예시.
- **중국어 간체:** 지역별 정책의 적용대상을 확인한 독립 기획 콘텐츠. 미확인 서비스를 승인받은 것처럼 소개하지 않는다.

### 4.3 실제 작동 중심 UX
기존 F675-01~05를 활용한다. 화면 버튼마다 `UI → BFF → 백엔드 → SQL/작업자 → 영수증 → 화면 상태`를 매핑한다. 가입 전 방문자는 ‘계산해보기’, 가입자는 ‘검증된 첫 직업’, 관심 이용자는 ‘가상 시장 살펴보기’ 등 최대 3개의 **실행 가능한** 경로를 제시한다. **대기/완료/거절/처리결과확인필요**를 구별하며 거래결과가 불분명하면 자동 재결제·재전송하지 않는다.

### 4.4 보안·데이터 일관성
OWASP ASVS 5.0과 API Top 10에 맞춰 객체 접근권한, 관리자 기능권한, 자원 소모 제한, SSRF 격리, DB 역할 최소권한과 원장 트랜잭션 멱등성을 점검한다. 카지노·국고 자동정책 스위치가 활성화되어 있다는 이유로 정책·법률 적합 또는 재정 안전을 확정하지 않는다.

### 4.5 검색 성과의 진실
Google 공식 문서에서 사이트맵 제출은 크롤링이나 색인에 대한 보장이 아니다. 관리자 SEO 화면은 제출 성공, 크롤러 방문, URL 검사 결과, 실제 조회/클릭을 독립적으로 보여줘야 한다. 실제 방문자를 위한 웹페이지와 AI 검색 모두에 원본 유용성을 높이는 것이 핵심이다.

## 5. 개선 실행 순서와 통과 조건

| 단계 | 우선 작업 | ‘완료’로 인정할 근거 |
|---|---|---|
| 0 즉시 | 운영 공개경로/구형서비스·스케줄러 중복 조사, 저장공간 및 복구 수단 안전 확인 | 정확한 공개 트래픽의 릴리스 SHA, 작업자 1개 소유권, 변경 없이 안전한 용량 대책 |
| 1 P0 | 원장·초기 잔액·국고·DB 권한, 스키마 및 Test 환경 | 복구 Test 원장·권한 부정 테스트, 통화량 불변식, 멱등성·동시성·장애복구 PASS |
| 2 P0 | 전체 회원·관리자·모바일 기능 연결, 세션/접근성 | 최신 정확 SHA 기준 v530 5회 반복 E2E, 실패상태 검증, Android 실기기 |
| 3 P1 | 실제 지급·API 성공 표시, AI 편집·4개 지역 콘텐츠·GSC | 확인 가능한 영수증, 20개 글 품질, 페이지별 canonical/hreflang/출처, 검색 데이터 출처 표기 |
| 4 P2 | 첫 방문 개선과 가상경제 공개 보고서 | 검증된 첫 번째 행동 성공, 자발적 D1/D7 재방문, 성과 데이터와 동의 기반 분석 |

모든 항목에 담당자, 해당 브랜치/정확 SHA, `PLANNING / IMPLEMENTED / TEST_VERIFIED / PRODUCTION_VERIFIED / BLOCKED` 중 하나, 실패복구·롤백 근거를 부여한다. **이 문서 자체는 기획권한 변경, 기능 구현, 테스트 통과, 운영 승격이 아니다.** 기존 v713/F675 기획과 병행 중인 v744/v745 작업을 침범하지 않는다.

## 6. 공식 레퍼런스 및 내부 근거 18건

1. [Google 다국어·다지역 사이트](https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites)
2. [Google canonical 정책](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
3. [Google AI 검색 기능](https://developers.google.com/search/docs/appearance/ai-features?hl=ko)
4. [Google 유용한 원본 콘텐츠·E-E-A-T](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
5. [Google 생성형 AI 콘텐츠·대량 생산 정책](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content?hl=en)
6. [Google 뉴스·블로그 Article 스키마](https://developers.google.com/search/docs/appearance/structured-data/article)
7. [Google 사이트맵 제출의 한계](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ko)
8. [Google 재크롤링 요청·제한](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
9. [Google 커뮤니티 게시글 구조화 데이터](https://developers.google.com/search/docs/appearance/structured-data/discussion-forum?hl=en)
10. [web.dev CWV 실제 측정 기준](https://web.dev/articles/defining-core-web-vitals-thresholds?hl=en)
11. [W3C 모바일 접근성](https://www.w3.org/TR/wcag2mobile-22/)
12. [OWASP ASVS 5.0](https://github.com/OWASP/ASVS)
13. [OWASP API Security Top 10](https://api-security.owasp.org/editions/2023/en/0x11-t10/)
14. [EVE Online 2026년 9월 경제 보고서 목록](https://www.eveonline.com/ko/news/467)
15. [EVE Online 2026년 6월 경제 보고서 및 데이터](https://www.eveonline.com/news/view/monthly-economic-report-june-2026)
16. [Sim Companies 공식 소개](https://www.simcompanies.com/search/)
17. [GitHub 최신 v745 감사 PR](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/905)
18. 내부: `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/planning/INTEGRATED_PRODUCT_FEATURE_REVIEW_v2026.10.15.675.md`, `docs/planning/PLATFORM_REMEDIATION_MASTER_BLUEPRINT_v2026.10.16.713.md`.
