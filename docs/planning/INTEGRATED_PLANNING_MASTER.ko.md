# 월덕 머니버스 — 통합 기획 마스터

> 현재 원장 버전: v2026.10.05.530
> 구현 권위 계약: [PROJECT_PLAN.ko.md](PROJECT_PLAN.ko.md)
> 영문 원본: [INTEGRATED_PLANNING_MASTER.md](INTEGRATED_PLANNING_MASTER.md)

## 필수 회차 기록
모든 기획 재검토는 시작/중간 `origin/main` exact SHA, 권위 버전 드리프트, 검토한 세부명세와 release/work 기록, 심각도·근거·수용게이트가 있는 gap ID, 영/한 동기화, 구현/Test/Production 주장에 실제 증거가 있는지를 기록한다. 과거 결정은 삭제하지 않고 명시적으로 supersede한다.

## v2026.10.05.530 — 2026-10-05 — 긴급 전체 UI 재점검
- 최초 확인은 `origin/main=ca354411d88b461215a81557f686765cfedf00f0`; 브랜치 생성 전 필수 fetch에서 `921b467eac21645a51ba362b24cac7eaab89c081` 드리프트를 감지해 최신 SHA에서 v530 격리 브랜치를 만들었다. 중간 refetch도 `921b467e...`로 동일했다.
- 문서 거버넌스와 현행 plan/master/responsive/accessibility/update/runtime 권위를 다시 읽었고, 동시작업 dirty main 파일을 건드리지 않은 채 추적 Markdown 1,747개를 SHA-256 스캔으로 열거/읽었다.
- 최신 main UI 인벤토리는 웹 page 템플릿 142개, 관리자 25개다. 현재 Production/Test runtime identity가 최신 main과 달라 live 관측은 latest-main 수용 증거가 아니다.
- `EMERGENCY_FULL_UI_REAUDIT_SPEC.md` / `.ko.md`를 채택하고 현재 상태를 **BLOCKED — 긴급 UI 수정 필요**로 지정했다.
- P0: 제공 모바일 증거와 현재 비줄바꿈 소스 레이아웃이 `/admin/seo` 모바일 액션 행 잘림을 함께 입증한다. P1 gate는 touch-target triage, floating layer 본문 가림, account identities HTTP 500, heading/semantic 후속 점검이다.
- 전체 route 5회 완주, 인증 관리자 전수 포함, exact-SHA Test/backend health, 무중단 Production 승격 순서를 재확인했다.
- 점검/기획/문서 전용이며 런타임 수정, Test 수용, Production 승격을 주장하지 않는다.

## v2026.10.05.527 — 2026-10-05 — SEO 수요·키워드 포트폴리오 확장
- 시작/중간 `origin/main=5318213f1eca644c7f36df7d967a53092de0814c`; 기록된 중간 체크포인트에서 drift 없음. 전용 worktree/branch `docs/seo-demand-expansion-v2026.10.05.527`.
- 문서 거버넌스, PROJECT_PLAN, 통합마스터, 글로벌 SEO/성장 실행, search discovery, SEO intent activation, 현행 pSEO config/route, 아직 미병합 v525 search-to-user 기획을 읽기 전용 동시작업 입력으로 재검토했다.
- `SEO_DEMAND_KEYWORD_EXPANSION_SPEC.md` / `.ko.md` 추가: evidence state, keyword record, 국내/해외 cluster map, pSEO admission/retirement, 금융 freshness, locale, 내부링크 graph, 검색→사용자 전환, 측정계약.
- 25개 cluster에서 keyword discovery 후보 10,473개(한국어 6,207 + 영어 4,266)를 생성했다. 모두 실측/provider evidence와 독립 page-value gate 통과 전 HOLD이며 후보수는 발행목표가 아니다.
- 신규 독립 Crossref 조사: 40 lane, raw 200,000 -> 중복제거 111,313, 수집오류 0, stream SHA-256 `1629c7b24a688e84249d77eec2cd1ce2f8b906f91187fcbed413739aef54b523`. full compressed corpus, manifest, sample을 `docs/research/seo-demand-v2026.10.05.527/`에 버전 보존한다.
- 최신 Google/Naver/Bing 1차 검색가이드, Core Web Vitals, IndexNow/Schema.org 의미, 공식 금융도구 패턴을 별도 재검증했다. broad corpus 수량은 현재 1차자료 규칙을 대체하지 않는다.
- 기획/조사/문서 전용. runtime, Test, Production, 색인, 순위, traffic, revenue 완료를 주장하지 않는다.

## v2026.10.04.523 — 2026-10-04 — 중앙은행·조폐국·중앙국고 기관 분리
- 시작 `origin/main=c10e1582ccc0c058dff5c5356ad8b1893759f72c`; 중간 재확인에서 국고 영문/아키텍처 문서가 추가된 `origin/main=065ee42204a4238c5010897212c7fc2a6c848f64` 드리프트를 감지했다. 권위문서 편집 전 격리 브랜치를 최신 main으로 rebase해 동시 작업을 보존했다.
- 문서 거버넌스, 카탈로그, PROJECT_PLAN, 통합마스터, 국고 환원/재정 명세, AI Economy Controller, 통화유통속도 명세를 다시 읽고 통합했다.
- `CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md` / `.ko.md`를 추가하고 PROJECT_PLAN의 현재 경제기관 권위로 채택했다.
- 분리계약: 중앙은행은 통화정책 승인, 조폐국은 승인된 발행·폐기 실행, 중앙국고는 기존 WLD의 세입·예산·지출, Economy Core/Settlement Ledger는 복식정산·idempotency·대사·통화량 불변식을 담당한다.
- 일반 송금·세금·국고지출·사전재원 대출·국채 흐름은 총통화량을 바꾸지 않으며 canonical 조폐/폐기만 `M_total`을 변경한다.
- 기존 국고 보호준비금은 재정 유동성 준비금으로 명확히 재정의하며 신규통화 발행권한이 아니다. 재정 부족을 자동조폐로 전환하지 않는다.
- 초기 은행대출은 기존 WLD 완전 사전재원 방식으로 유지하고 현실 상업은행식 예금화폐 창출은 별도 승인 통화계층 설계 전까지 제외한다.
- AI는 진단·제안·허용된 저위험 bounded-auto에 한정하며 직접 조폐/폐기, 통화명령 승인, 국고부족의 통화화는 금지한다.
- 1차/공식 근거는 IMF 국고-중앙은행/TSA, ECB 발행·생산, Federal Reserve/BEP·US Mint 역할분리, 한국은행, Bank of England 통화창출 자료, EVE 공식 경제보고를 포함한다.
- 기획/문서 전용이다. 런타임·DB·Test·Production 구현/승격을 주장하지 않는다.

## v2026.10.04.522 — 2026-10-04 — 국고 세수 자동 사회 환원 파이프라인 & 4개 국어 번역 무결점 전면 통합
- 시작/최종 `origin/main=065ee422` (운영 배포본 `prod-v521` 무중단 승격 가동).
- **국고 세수 자동 사회 환원 파이프라인 권위 통합 (`TREASURY_AUTOMATED_SOCIAL_RECIRCULATION_SPEC.ko.md` / `.en.md`)**:
  - 국고 5대 금고(`VAULT_MAIN`, `VAULT_WELFARE`, `VAULT_EMERGENCY`, `VAULT_INFRA`, `VAULT_RESERVE`) 원장 체계 공식화.
  - 4대 사회 기능 자동 환원: 보편 기본소득 배당(`CITIZEN_DIVIDEND`, 40%), 정착/취약 복지 지원(`WELFARE_SUBSIDY`, 40%), 공공 인프라 펀딩(`COMMUNITY_FUNDING`, 30%), 룬스케이프형 역매수 영구소각(`MARKET_BUYBACK_BURN`, 10%), 거래정지 피해 전액 환급(`STOCK_HALT_SETTLEMENT`, 20%).
  - 10대 법정 세제율 원천징수 엔진: 장터 2%, 주식 1%, 사업 3%, B2B/소비 1~3%, 4구간 누진 부유세(0.05~0.5%).
  - 30% 불가침 안전 비축금 준칙(`Safe Reserve Invariant`: $\max(100{,}000\text{ WLD}, \text{Gross Assets} \times 30\%)$) 및 0 오차 회계 대사 검증.
  - `/admin/treasury` 긴급 제어 타워 Step-Up 2FA 모달 리팩터링 및 반응형 헤더 찌그러짐 원천 차단.
- **전 화면 4개 국어(KO, EN, JA, ZH) 번역 무결점 전수 쇄신**:
  - `i18n-dictionary.ts` 홈 마스터 사전 47종 신규 확장 및 역방향 인덱스 자동 연동.
  - 상단 공지 바(`notice-bar.tsx`), 메인 히어로, 4대 퀵 액션, 온보딩 2열 벤토 배너, 3단계 미니 칩, 6대 기능 뱃지, 3대 계산기 허브, 일일 리텐션 스테이션, 핫 종목 및 직업 마스터리 전 구역 4개 국어 100% 완벽 매핑.
- **초반 무자본 10만 WLD 시드머니 3분 공략 로드맵 & 60fps 비디오 시뮬레이터 (`/roadmap`)**:
  - 12개 실전 UI 씬 인터랙티브 모션 시뮬레이터 및 3단계 성장 로드맵 통합.
- **8대 전문 직업 2.0 & 실전 급여 파밍 가이드 (`/guide/career-mastery`)**:
  - 4단계 실습 시뮬레이터, 8대 직업 도감, 7대 승진 티어 및 라이선스 시스템 통합.
- **우측 하단 플로팅 위젯 글래스모피즘 분리**:
  - 고객센터 위젯과 온보딩 퀘스트 플로팅 위젯의 수직 분리 및 고대비 닫기 버튼 탑재.
- **검증 및 릴리스 상태**:
  - Vitest 1,048개 전수 테스트 100% ALL-PASS.
  - Next.js 16.3.8 Turbopack 163개 라우트 빌드 통과.
  - 원격 운영 호스트(`https://easy-scraping.com` / `prod-v521`) 무중단 배포 및 HTTP/2 200 OK 라이브 서비스 검증 완료.

## v2026.10.03.510 — 2026-10-03 — 글로벌 성장 실행설계·레퍼런스 심화
- 시작/중간 `origin/main=ac4dd484a90b266d945993d7bd8be57a74e8e1df`; 격리 문서 브랜치 `docs/global-growth-deep-plan-v2026.10.03.510`.
- v509 기획이 런타임에 이미 구현됐다고 가정하지 않고 exact-main의 locale/proxy/layout/GSC/sitemap/pSEO 코드를 다시 대조해 구체 P0/P1 구현 공백을 등록했다.
- `GLOBAL_GROWTH_EXECUTION_SPEC.md` / `.ko.md`를 추가해 locale context, 번역상태, 서버 SEO read model, pSEO 입장/퇴출, 해외기능 epic, 시장 readiness, 광고/동의, analytics, 관리자, 릴리스 QA를 구현준비형으로 세분화했다.
- 신규 Crossref 회차: 30개 질의군, raw 210,000건 -> v510 내부 중복제거 121,320건, 수집오류 0건, SHA-256 `f16c6deceb18fa96fdd7b1132b2fc58e13f908899d477c9ce252a897adae7704`. v507은 별도 corpus이며 검증되지 않은 교차 unique 합계는 주장하지 않는다.
- corpus와 별도로 국제 URL/hreflang, people-first/scaled-content 정책, canonical/sitemap/lastmod, 폐기된 Google sitemap ping, JS rendering, CWV, BCP 47/CLDR, WCAG 2.2, IndexNow, 동의/광고, 미성년/개인정보 공식자료를 재확인했다.
- 기획/문서 전용이며 런타임, DB, Test, Production 변경/승격을 주장하지 않는다.

## v2026.10.03.509 — 2026-10-03 — 최신 main 기준 글로벌 성장 권위 통합
- 사용자의 진행 승인으로 v507 written design을 검토대기 격리 기획 상태에서 현재 기획 권위 체계로 승격했다.
- 통합 브랜치: `docs/global-growth-seo-integration-v2026.10.03.509`; 시작/중간 `origin/main=ddec006e75ffcaf866c3c6d0a82edc2b96372917`.
- v507 이후 v508 main 변경과 v507 기획 변경 경로가 겹치지 않아 clean 적용됐으며 v508 보안/런타임 증거는 그대로 보존된다.
- PROJECT_PLAN은 한국어 기본 locale, 보조형 GeoIP, 해외 제품가치, 다국어 SEO/검색수요 provenance, 품질게이트 pSEO, 광고 전용 해외 경제성을 현재 기획 권위로 채택한다.
- v507 상세명세/조사기록은 출처 추적을 위해 기존 버전을 유지하고 v509가 권위 채택 사실을 기록한다.
- 문서 전용 통합이다. 런타임 코드, DB, Test, Production은 변경/승격하지 않았다. 구현은 별도 브랜치와 exact-SHA Test/백엔드 health 증거를 요구한다.

## v2026.10.02.507 — 2026-10-02 — 한국어 기본 글로벌 성장·해외 SEO·광고수익 설계
- origin/main 5a7c658b38853f564983d19f961c689a494dc4b6에서 격리 브랜치 docs/global-growth-seo-v2026.10.02.507로 진행한 문서/기획 전용 회차다.
- 영어를 제품 default로 보던 과거 문구를 supersede한다. 제품/공개 fallback은 한국어이며 공개 색인 페이지의 GeoIP는 해외 언어 추천/selector 신호로 사용한다. 비색인 앱 온보딩만 자동 첫 기본값으로 사용할 수 있고 명시 locale URL과 사용자 선택이 우선한다.
- 해외 utility/지식/온보딩/번역/시간대·이벤트/탐색/리텐션 기능을 SEO 페이지 확대보다 먼저 정의한다.
- 실제 사이트 검색성과와 시장 검색량 추정을 분리하고 생성/fallback GSC 숫자를 운영 의사결정에 금지한다.
- 고정 pSEO 페이지수 목표 대신 독립 intent/가치/출처 freshness/canonical/hreflang/internal link/중복검사/deindex 경로 게이트를 적용한다.
- 일반검색·Image·video·Discover, 국가/locale KPI, 광고 전용 시장 기여이익 모델을 추가한다.
- Crossref broad discovery corpus: raw 150,000 -> DOI/title 중복제거 121,810건, manifest SHA-256 4dc89e5af460f6bbbbea4ae68a923f9cab6b6c8a274eaff5787c77a05d95b729. 조사 후보 폭이지 수동검토 주장이 아니다.
- 상세 권위: GLOBAL_GROWTH_SEO_REVENUE_SPEC.ko.md. 런타임/Test/Production 완료를 주장하지 않는다.

## v2026.09.29.486 — 2026-09-29 — 엄격 14.5만 DB 레퍼런스 코퍼스 및 PostgreSQL 17 재검증
- 조사/기획/문서 전용 주기. 시작/중간/최종 `origin/main=64201629c5cdf931d49e48e8808fc0f882318b3b`; 격리 브랜치 `docs/db-reference-expansion-v2026.09.29.486`.
- Crossref 엄격 제목 탐색: **원시 145,898 -> 제목 적합 145,579 -> 고유 145,579건**; DOI 우선/제목 보조 중복 제거; 코퍼스 SHA-256 `d61e825f8f699ccfca9e1bc5ee13dd070d123440c680a8aa9d90c5a4d6a80216`. 유지된 모든 제목은 단어 `database` 또는 `data base`를 포함.
- 초기 v486 광역 탐색은 표본에서 일반 단어 오탐을 확인해 폐기했고 엄격 코퍼스를 v486 정식 탐색 증거로 채택.
- **DB486-01 / P0:** concurrent index/reindex 후 예상하지 않은 invalid index가 있으면 DB 승인 차단.
- **DB486-02 / P0:** nullable 비즈니스 키 고유성은 NULL distinct 의미를 명시.
- **DB486-03 / P1:** extended statistics는 측정된 상관 컬럼 추정 오류와 전/후 계획 증거가 있어야 함.
- **DB486-04 / P0(활성화 시):** 복제/CDC 슬롯에 소유자, 소비자, 지연/보존 WAL 관측, 용량 예산, 보존 상한 정책 필요.
- **DB486-05 / P0:** 물리/base backup은 `pg_verifybackup`과 실제 격리 복구를 모두 요구하며 검증만으로 충분하지 않음.
- **DB486-06 / P0:** 저영향 제약 검증은 단계화하고 락/스캔을 분류.
- **DB486-07 / P1:** RLS는 owner/BYPASSRLS/FORCE-RLS 테스트가 있는 조건부 추가 방어층이며 현재 제한 역할 기반 변경 경계를 대체하지 않음.
- 상세 권위/증거: `DATABASE_ARCHITECTURE_SPEC.md`, `planning/deltas/v2026.09.29.486.md`, `findings/MONEYVERSE_DATABASE_ARCHITECTURE_RESEARCH_REVIEW_v2026.09.29.486.md`.
- 전역 `PROJECT_PLAN.md`은 기존 authority-drift 규칙에 따라 v444 유지. 무관한 post-v444 제품 결정을 통합했다고 주장하지 않으며 런타임/Test/Production/마이그레이션/사용자 데이터 변경 없음.

## v2026.09.27.468 — 2026-09-27 — 전 도메인 API 카탈로그 및 릴리스 로그 v459~v468 정합화
- 문서 전용 동기화 회차. 기준 `origin/main=ce06a79f6e453a9a7f1ee2979ec3bf3fe88ca5ae`.
- **DOC-468-01 / P1:** `docs/UPDATE_LOG.ko.md` 및 `docs/UPDATE_LOG.md`에 `v459` ~ `v468` 누적 릴리스 로그(도파민 전용 API, 사행성 카지노 폐기, 주식 종목 프리뷰, GSC 연동, P2P 경매 프록시 비딩, VIP 5종 아바타 프레임, 호가 Depth 프리셋 등) 전수 동기화 완료.
- **DOC-468-02 / P1:** `docs/API_CATALOG_MASTER.ko.md` 및 `docs/API_CATALOG_MASTER.md`에 신규 도메인 15(SEO & Search Console Intelligence: `sitemaps/ping`, `gsc/sync`, `gsc/analytics`, `gsc/credentials`, `crawl-audit`, `gsc/digest-report`), 도메인 16(Moneyverse Plus VIP: `status`, `subscribe`, `daily-bonus`, `theme`), 도메인 17(WebSocket Gateway: `auction:bid`, `auction:extended`, `auction:settled`) 및 도메인 8 경매장 확장 API 명세 100% 반영.
- **DOC-468-03 / P1:** `docs/INDEX*`, `docs/DOCUMENT_CATALOG*`의 관측 런타임/소스 이력을 최신 운영 배포본 `v2026.09.27.468` (`prod-v468`, 1,552개 활성 세션 보존)과 일치시킴.

## v2026.09.27.467 — 2026-09-27 — 문서 권위/인벤토리 정리
- 문서 전용 회차. 시작 및 1차 중간 `origin/main=b0c8f1e25dc15b28d44fd033fca510bce70f6960`. 최종 통합 전 재확인에서 동시 런타임 v2026.09.27.466 `origin/main=d64eaedccb7c094063b36fb5f46590ce19f51ab1`을 감지했고 변경 파일은 런타임/루트 실행계획에 한정되어, 동시 작업을 덮어쓰지 않도록 해당 최신 main에서 문서 브랜치를 다시 생성했다. 이번 회차에서 runtime, Test, Production 변경은 수행하지 않았다.
- **DOC-467-01 / P0 / AUTHORITY_DRIFT:** 구현 권위 `PROJECT_PLAN.md` 헤더는 v2026.09.25.444인데 저장소 소스/런타임 이력은 v465까지 진행됐다. v445~v466 결정이 권위 기획서에 실제 통합되기 전까지 제품 기획 완료로 간주하지 않으며, 숫자를 맞추기 위한 허위 버전 상승을 금지한다.
- **DOC-467-02 / P1:** `docs/INDEX*`, `docs/README*`, `DOCUMENT_CATALOG*`, `DOCUMENTATION_POLICY*`를 현재 권위 체계에 맞춰 정리했다. 과거 v402 전체 재검토본은 현재 권위가 아닌 역사 검토 스냅샷으로 명시했다.
- **DOC-467-03 / P1:** exact main tree 기준 `docs/` 파일 1,638개, Markdown 1,620개, docs 루트 날짜형 Markdown 18개, exact duplicate-content 31개 그룹을 확인했다. 대량 삭제/이동 대신 기존 경로와 Git 이력을 보존한다.
- **DOC-467-04 / P1:** Markdown 언어쌍 원시 인벤토리는 영문 경로 기준 한국어 쌍 없음 85개, 한국어 정규화 경로 기준 영문 쌍 없음 19개다. 과거/내부/API 레거시/제3언어를 포함하므로 전부 현행 parity 결함으로 간주하지 않고 신규 유지 문서부터 영문 canonical + 한국어 2차 언어를 강제한다.
- **DOC-467-05 / P1:** 루트 `implementation_plan.md`, `PROJECT_MEMORY.md`, `walkthrough.md`는 실행/역사 참조이며 `PROJECT_PLAN.md`이 명시적으로 채택하지 않는 한 제품 권위를 갖지 않는다.
- **DOC-467-06 / P1:** Android 앱 저장소 문서도 웹 권위 기획을 상위 기준으로 삼도록 별도 README/문서정책을 추가한다. 구 앱 가이드의 카지노/과거 런타임 가정은 역사 스냅샷으로 분류하고 삭제하지 않는다.
- 상세 감사: `docs/findings/DOCUMENTATION_AUDIT_v2026.09.27.467.ko.md`. `PROJECT_PLAN.md` 자체는 계속 v444이며 post-v444 제품 결정을 별도 기획 재검토로 실제 병합해야 한다.

## v2026.09.25.444 — 2026-09-25
- OpenAlex/Crossref 35,429건을 DOI 우선/제목 보조 중복 제거해 **고유 탐색 후보 33,341건**으로 추적했으며, 이는 전수 원문 수작업 검토 주장이 아니다.
- **M444-01..04 / P1:** 무료 핵심, 맥락형 공개광고, 광고제거/편의/표현 구독, 비P2W 코스메틱 직접 entitlement, 명확한 스폰서십을 계획하고, 프리미엄은 추가 가치를 제공하며 광고는 민감 화면에서 배제한다.
- **M444-05 / P0:** 유료 WLD, 유료 확률형 아이템, 유료 카지노 가치, P2W 경제력, 유료 우월 WDX 정보는 계속 금지한다.
- **M444-06..08 / P1:** 단위경제는 시행일/채널별로 계산하고, 구독 해지는 간단히 유지하며, 모든 변동·운영비 차감 후 기여이익을 수익성 권위로 삼는다.
- 근거는 `MONEYVERSE_MONETIZATION_REVENUE_RESEARCH_REVIEW_v2026.09.25.444.ko.md`와 기획 델타에 있다. 기획/문서 전용이며 runtime, Test, Production, 실제매출, 법적승인 완료를 주장하지 않는다.

## Moneyverse Arcade 기획 기록 — v2026.09.26.444
- 100,000건 arcade 탐색 corpus에서 18,578건 검증 후보를 만들었으며, 이는 구현·Test·Production 승인 주장이 아닌 조사 근거다.
- 제안된 Arcade는 비도박·비현금화·비양도 오락에 한정한다. 유료 입장, 현금화, 유료 랜덤 보상, 베팅, WLD 구매, 경제적 우위는 허용하지 않는다.
- 상세 범위와 안전 경계, 연령/동의, 접근성, 텔레메트리, 릴리스 게이트는 `MONEYVERSE_ARCADE_GAME_SPEC.ko.md`와 영문 대응본에 있다.

## v2026.09.25.443 — 2026-09-25
- 시작 및 기록된 중간 `origin/main=99b0eaa04bbd0b28005861c624690c56744e8a14`; 동시 agent 작업을 덮어쓰지 않도록 별도 worktree/branch `docs/db-architecture-research-v2026.09.25.443`를 사용했다.
- 탐색 근거: DB 아키텍처 10개 lane의 Crossref 원시 80,000건을 DOI 우선/정규화 제목 fallback으로 중복 제거해 **66,858건 후보**를 구성했다. broad search false positive는 Tier C 탐색 근거일 뿐 설계 권위로 자동 채택하지 않는다.
- 기존 DB 강점인 numbered SQL migration authority, immutable checksum/reverse parity, 제한된 app role, security-definer mutation 경계, exact integer money, idempotency, transactional outbox/ledger, 결정적 locking 패턴을 재확인했다.
- **G443-01 / P0:** generated exact-SHA schema fingerprint + Test/Production catalog drift 검증.
- **G443-02 / P0:** canonical table PK/constraint audit 및 typed-domain invariant.
- **G443-03 / P0:** PostgreSQL이 child-side FK index를 자동 생성하지 않으므로 referencing-FK index coverage gate와 측정된 예외.
- **G443-04 / P0:** lock/scan/rewrite 분류 및 old/new-runtime 호환성을 포함한 expand/backfill/validate/switch/contract 무중단 migration protocol.
- **G443-05 / P0:** business idempotency와 결정적 lock ordering을 유지하는 retryable serialization/deadlock transaction 전체 bounded retry.
- **G443-06 / P0:** append-only ledger 권위 + atomic balance projection + sampled/full reconciliation/rebuild 증거.
- **G443-07 / P0:** runtime app role non-owner/no-DDL 유지, migration ownership 분리, security-definer search-path/grant 검증 의무화.
- **G443-08..13 / P1:** 측정 기반 index lifecycle, 조건부 partitioning, typed-core/JSONB 경계, 명시적 delete semantics, DB maintenance/observability SLO, heavy-read 분리.
- **G443-14 / P0/P1:** 검증된 logical backup을 유지하고 더 강한 RPO/RTO는 문서 주장 대신 실제 WAL/PITR 및 immutable off-host restore 증거로 수용.
- 상세 권위: `DATABASE_ARCHITECTURE_SPEC.ko.md` / 영문 대응본 및 `docs/findings/` 조사검토/corpus. 조사/기획/문서 전용이며 runtime DB/Test/Production 완료를 주장하지 않는다.

## v2026.09.25.442 — 2026-09-25
- 시작 `origin/main=a7fac4f4db2c4db3b9f8a4e159ad6ea5267540ec`; 최신 main에서 전용 브랜치 `docs/all-page-qa-v2026.09.25.442`를 생성했다.
- 작업 중간 `origin/main=a7fac4f4db2c4db3b9f8a4e159ad6ea5267540ec`; drift 없음. 기록 시점 `git diff --check` 통과.
- 문서 권위, v440/v441 반응형/관리자 계약, 현재 frontend route source, 과거 full-UI QA 기록과 관리자 runtime-QA 기록을 재검토했다.
- 현재 exact-source 스냅샷은 **frontend page 86개**, 그중 **`/admin/**` 22개**, **dynamic page 8개**이며 loading component 25개, error component 3개도 관측됐다. 따라서 과거 60-route sweep만으로 현재 full-route 완료를 증명할 수 없다.
- **G442-01 / P0:** exact release candidate의 모든 page가 필수 QA 범위다. sampling 또는 '변경된 route만' 수용 기준을 supersede한다.
- **G442-02 / P0:** 모든 관리자 page는 매 full-site pass의 기본 범위이며 관리자 검증을 선택적/후순위 단계로 미룰 수 없다.
- **G442-03 / P0:** source-generated route inventory와 QA ledger 및 최종 수용 증거가 1:1로 일치해야 한다. 누락/skipped route 또는 count mismatch는 Production 차단이다.
- **G442-04 / P0:** 모든 candidate는 최소 5회의 완전한 전 사이트 QA pass를 요구한다. 매 pass는 모든 page를 방문하고 누적 증거로 viewport, role, dynamic fixture, content-length, UI-state matrix를 커버한다.
- **G442-05 / P0:** dynamic page는 valid/invalid/not-found/permission fixture를 직접 확인하며 부모 list page 결과로 detail route를 대체할 수 없다.
- **G442-06 / P0:** route 수용은 실제 Test API/runtime data로 전체 page와 local tab/section/dialog/control을 확인해야 하며 screenshot-only, mock-only, source-only, historical evidence로 대체할 수 없다.
- **G442-07 / P0:** v440 반응형 matrix를 변경/admin page가 아니라 모든 page에 적용한다. clipping, body overflow, overlap, 접근 불가 control, 핵심정보 숨김, task 완료 불가는 승격 차단이다.
- 상세 권위: `FULL_ROUTE_UI_QA_SPEC.ko.md` / 영문 대응본 및 `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.ko.md` / 영문 대응본. 기획/문서 전용이며 현재 runtime이 이미 v442를 통과했다고 주장하지 않는다.

## v2026.09.25.441 — 2026-09-25
- 최신 main 재확인에서 동시 v440 통합을 감지해 이를 덮어쓰지 않고 `origin/main=5547e5b0c2eb76c60450e089cb415bd65c81026f` 위로 재기준화했다.
- v440은 모바일 overflow/nav/card reflow/slider mismatch/5회 QA를 이미 다룬다. v441은 빠진 control-state 의미 계약을 추가한다.
- **G441-01 / P0:** policy control은 하나의 server-derived canonical value envelope를 사용하고 frontend 숫자 fallback default를 금지한다.
- **G441-02 / P0:** missing/loading policy data를 권위 `0.0%`처럼 표시하지 않고 loading/unknown/blocked로 구분한다.
- **G441-03 / P0:** slider thumb, 화면 숫자, 접근성 값, API payload는 같은 값에서 파생하며 mutation 후 서버 응답으로 재정합한다.
- **G441-04 / P0:** AUTO 소유 policy control은 read-only 의미로 보이고 manual override는 명시적 권한/사유/버전 관리 흐름이다.
- **G441-05 / P1/P0 gate:** AI health, confidence/calibration, evidence sufficiency, council agreement, policy eligibility를 분리하며 정의되지 않은 “신뢰 %”는 운영 근거로 인정하지 않는다.
- **QA:** v440 viewport/5회 반복 외에도 실제 API hydration, auto/manual 전환, save/reread, refresh, rollback, error 상태를 검증한다.
- 기획/문서 전용이며 runtime/Test/Production 수정 완료를 주장하지 않는다.

## v2026.09.25.440 — 2026-09-25
- 시작 `origin/main=5394dd266e68c0a3ebfee616cdf7f0d906116b48`; 전용 브랜치 `docs/admin-mobile-responsive-v2026.09.25.440`.
- PROJECT_PLAN, 통합 마스터, 반응형/접근성 명세, 제품디자인/관리자/경제 기획과 제보된 경제 운영 모바일 화면을 재검토했다.
- **G440-01 / P0:** page-level horizontal overflow 또는 관리자 navigation/content 잘림은 기능 결함이며 릴리스 차단 사유다.
- **G440-02 / P0:** AI Council과 경제 metric/control card는 모바일 1열로 reflow하며 fixed-width overflow를 허용하지 않는다.
- **G440-03 / P0:** 금리 slider thumb, 표시 숫자, form state, submit payload, 서버 권위 저장값이 일치해야 한다. 불일치 시 save/apply를 차단한다.
- **G440-04 / P0:** 관리자 navigation은 모든 핵심 목적지를 발견 가능하게 유지해야 하며 affordance 없이 화면 밖 label을 숨기는 방식을 금지한다.
- **G440-05 / P0 QA:** 필수 viewport는 320/360/375/390/412/430 portrait + 대표 landscape + 768/1024 + desktop이며 200%와 적용 가능한 400% zoom/reflow를 포함한다.
- **G440-06 / P0 QA:** 반응형/관리자 route를 실질 수정할 때마다 viewport matrix, 전체 페이지 scroll, 모든 tab/section, long-content 상태, interactive control을 포함해 최소 5회의 완전 반복 QA를 수행한다.
- clipping, overlap, unreachable control, hidden CTA, body overflow, touch-target 실패, 의도치 않은 reset, control/value mismatch 중 하나라도 있으면 Test 수용 및 Production 승격을 차단한다.
- 상세 권위: `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.ko.md` / 영문 대응본. 기획/문서 전용이며 runtime 수정 완료를 주장하지 않는다.

## v2026.09.25.439 — 2026-09-25
- 시작 `origin/main=118a58ddc289839957caacd14650863e614f8fad`; 최신 main에서 전용 브랜치 `docs/session-continuity-v2026.09.25.439`를 생성했다.
- 현재 문서 권위 순서, PROJECT_PLAN, 통합 마스터, 인증/API 참고문서, 기존 v396 세션 연속성 계약을 재검토했다.
- **G439-01 / P0:** 아직 유효한 사용자는 앱/서비스/호스트 재시작, 배포, 프록시 reload, cutover, rollback, key rotation만을 이유로 로그아웃되면 안 된다.
- **G439-02 / P0:** 로그아웃 사유는 사용자 직접 로그아웃, 명시적 관리자/보안 폐기, compromise 대응, 계정 비활성/삭제, 정상 서버 권위 만료로 제한한다.
- **G439-03 / P0:** 세션 검증 권위와 키 재료는 런타임 교체 후에도 살아 있어야 하며 프로세스 메모리가 유일 권위가 될 수 없고 배포 hook이 shared session store를 비워서는 안 된다.
- **G439-04 / P0:** release/config/key 불일치 때문에 유효 세션을 guest로 조용히 강등하는 것은 정상 UX가 아니라 release failure다.
- **G439-05 / P0 승격 게이트:** 배포 전에 존재한 동일 authenticated session이 Test restart와 Production cutover를 통과해야 한다. 배포 유발 로그아웃 또는 release 기인 auth error spike는 승격 차단/rollback 조건이다.
- 수용 증거는 exact candidate SHA, runtime identity, shared-session health, privacy-safe continuity 식별자, safe CSRF mutation을 포함한 전후 authenticated request, auth-error 변화를 포함해야 한다. session count만 같아서는 부족하다.
- 영/한 동기화 필수. v439는 기획/문서 변경이며 Test/Production 런타임 변경을 주장하지 않는다.

## v2026.09.25.438 — 2026-09-25
- 시작/중간 `origin/main=328b4623f2f063eaaade74e38cb4d8f4f14561c2`; 기록된 중간 확인에서 main drift가 없었다.
- 정리 전 관측 저장공간 기준: root 99G/55G 사용(59%), data disk 197G/135G 사용(72%), data disk 사용 inode 약 490만 개.
- 삭제 전 활성 런타임 정체성을 재입증했다. Production backend/frontend CWD와 `production-current`는 모두 `prod-d058df3-v436`, Test는 모두 `test-d058df3-v436`으로 일치했다.
- **G438-01 / P0:** 활성 symlink target과 실행 프로세스 CWD release root는 삭제 보호한다.
- **G438-02 / P1:** 환경별 활성 + 최근 롤백 가능 불변 릴리스 최소 10개를 보존하고 더 긴 보존은 사유를 명시한다.
- **G438-03 / P1:** 용량 임계치는 70% 경고, 80% 비필수 artifact 증가 중단, 90% 이상 사고로 정하고 회수 bytes/inodes를 기록한다.
- **G438-04 / P1:** 일반 정리는 PostgreSQL, upload, backup, active release, retain-until-classified QA data를 제외하며 광범위 `docker system prune --volumes`는 계속 금지한다.
- **G438-05 / P1:** disk swap은 v437 memory-continuity 계약에 따르며 디스크 확보만을 이유로 축소하지 않는다.
- 상세 권위: `STORAGE_RELEASE_RETENTION_SPEC.ko.md` / 영문 대응본. 이번 회차는 런타임 저장공간 정리 증거를 포함하지만 application code release, DB migration, Test/Production 승격은 수행하지 않는다.

## v2026.09.25.437 — 2026-09-25
- Debian 13 Production VM 장애 증거에서 PostgreSQL이 03:31 KST부터 반복적인 `kvm_async_pf_task_wait_schedule` 스택과 함께 uninterruptible `D` 상태에 들어갔고 block 시간이 120초에서 1,087초까지 증가했다. 이전 부팅은 정상 shutdown 없이 끝났으며 10:46 부팅에서 system journal, Moneyverse 데이터 파일시스템 journal, PostgreSQL WAL 복구가 수행됐다.
- **G437-01 / P0 (하이퍼바이저 메모리 연속성):** Production VM 메모리는 공격적인 host overcommit/balloon 회수에 의존하지 않는다. 최소 보장 guest RAM, host reserve, balloon 하한, swap/PSI 임계치를 정의·관측하고 실측 steady-state 안전영역 아래로 자동 balloon-down 하는 것을 금지한다.
- **G437-02 / P0 (KVM async-PF/hung-task 탐지):** `kvm_async_pf`, hung task, guest scheduling stall, QEMU pause/reset, host OOM, storage latency, guest-agent 손실을 guest 내부뿐 아니라 가상화 host에서도 탐지한다. 로컬 애플리케이션 `/health` 하나만으로 정상 판정하지 않는다.
- **G437-03 / P0 (외부 watchdog 및 복구):** guest 밖 watchdog이 public edge, backend, DB transaction health, guest heartbeat를 함께 검사한다. 지속적인 VM-level 장애 시 alert -> 증거 보존 -> cooldown/fencing 정책에 따른 controlled restart/failover 순으로 처리하며 단일 애플리케이션 endpoint 실패만으로 VM을 재부팅하지 않는다.
- **G437-04 / P0 (DB crash safety):** PostgreSQL은 `fsync`/WAL crash recovery가 유지되는 durable storage를 사용하고 backup/restore 증거를 최신으로 유지한다. 자동 기동은 파일시스템과 DB 복구 완료 후에만 애플리케이션 트래픽을 받는다. DB가 recovery 또는 D-state일 때 auto-healer가 DB 의존 서비스를 반복 재시작하지 않는다.
- **G437-05 / P1 (host 관측성/증거):** Proxmox/QEMU task log, host kernel/OOM/PSI/I/O, VM guest journal, PostgreSQL, Nginx/API 가용성, release identity를 사고 단위로 연계 보존한다. 가능한 경우 자동 조치 전에 pre-crash 증거를 보존한다.
- **G437-06 / P1 (용량 게이트):** Production/Test/AI workload에 CPU/RAM/storage-I/O budget과 동시성 ceiling을 명시한다. 로컬 AI 추론, 빌드, 백업, QA가 Production과 자원경합할 수 있으면 직렬화하거나 resource limit을 적용한다.
- **수용 게이트:** Test fault-injection에서 memory pressure, guest pause/stall, DB crash recovery, host/guest health 불일치를 검증하고 ledger corruption 0, DB/session authority 생존 시 session continuity, 결정적 recovery ordering, bounded restart loop, 외부 alerting을 확인한다. host-level 관측성 또는 watchdog 책임 주체가 없으면 Production 승격을 차단한다.
- 시작 기준 `origin/main=4a4549f644972af972c47fb8f56bd9500766aa61`. 상세 권위: `docs/planning/INFRASTRUCTURE_STALL_RESILIENCE_SPEC.ko.md` / `.md`, delta `docs/planning/deltas/v2026.09.25.437.ko.md` / `.md`. 기획/문서만 변경하며 runtime 완화 구현, Test fault-injection, Production 변경 완료를 주장하지 않는다.

## v2026.09.24.433 — 2026-09-24
- v400/v401 경제 연구 권위를 다시 검증하면서 미러·번역본·추적 URL 변형·이미 채택된 표준을 다시 세지 않았다. 중복 제거된 31,289건 탐색 corpus는 광범위 기반으로 유지하고, v433은 건수 부풀리기 대신 품질/provenance 매핑을 강화한다.
- EVE Online 2026년 8월 MER, OSRS 시장개입 연구, Federal Reserve 정산/유동성 연구, PostgreSQL transaction isolation/locking, OWASP API Security, NIST SSDF, WCAG 2.2, OpenTelemetry semantic convention, GitHub deployment environment, Debian 13.7 릴리스 정보, Apple 플랫폼 정책 등 현재 1차/규범 근거를 재검증했다.
- **G433-01 / P0 (직업/경제):** 보상 직업은 서버 권위 시간 또는 독립 검증 가능한 완료 경계를 요구하며, 클릭 즉시 사용 가능한 WLD 생성은 금지한다.
- **G433-02 / P0 (원장/동시성):** 모든 잔액 mutation은 원자적 영속 transaction, 고유 business idempotency key, invariant 보존 동시성 제어와 제한형 transaction 전체 재시도를 요구한다.
- **G433-03 / P1 (경제):** 자동조절은 faucet/sink 단일 비율이 아니라 발행·소각·통화량·통화속도·가격지수·구매력·집중도·거래량 지표 묶음을 사용하고 변화율을 제한한다.
- **G433-04 / P1 (시장정책):** 거래세/item sink는 거래량을 줄이지 않으면서 고가품 가격을 올릴 수도 있으므로 인과·분배효과 검증을 필수화한다.
- **G433-05 / P1 (은행/국고):** 정산 속도는 유동성/위험 파라미터로 다루며 빠를수록 항상 안전하다고 가정하지 않는다.
- **G433-06 / P1 (관측성):** 경제정책 버전, 발행/소각, velocity, 세금, 국고 흐름, 중복 차단, retry, rollback을 metric/trace/log로 연계 추적한다.
- **G433-07 / P1 (접근성 정정):** WCAG 2.2 SC 2.5.8 AA 규범 최소는 정의된 예외가 있는 24x24 CSS pixel이다. Moneyverse 44x44는 더 강한 제품 목표로 유지하되 WCAG 규범 최소와 구분한다.
- **G433-08..10 / P1:** Test/Production 보호·직렬화 배포환경, 실제 호스트 증거 없이 Debian 13.6 관측값을 13.7로 바꾸지 않는 최신성 검증, 모바일 가상화폐/스토어 정책 경계를 추가했다.
- 시작/중간 main: `e15a6fdd941a8f78a1a27755f148072c738eddc1` (기록된 중간 체크포인트에서 drift 없음).
- 권위 상세명세: `docs/planning/deltas/v2026.09.24.433.ko.md` / 영문 대응본. 기획/문서 전용이며 런타임·Test·Production 완료를 주장하지 않는다.

## v2026.09.23.406 — 2026-09-23
- 최신 고신뢰 글로벌 학술 논문 및 핀테크·가상경제 레퍼런스를 전수 조사하여 기획 6대 도메인 결함 및 8대 Gap을 공식 보완 명세화했다.
- **주요 인용 레퍼런스**: Aave/Compound Kinked 점프 이자율 모델, LOB 웹소켓 단조 시퀀스 갭 복구(Binance/Coinbase), OSRS Grand Exchange 2% 거래세 & 자동 아이템 소각 메커니즘, RFC 6455 / Signal 프로토콜 멱등성 및 커서 페이지네이션, CNN 다요소 시장 감성 지수, OWASP ASVS 5.0 / NIST SP 800-63B-4 듀얼 키 롤링, Apple HIG 44px 최소 터치 타겟.
- **G406-01 / P0 (주식)**: 웹소켓 단절 시 틱 유실 방지를 위한 단조 시퀀스 ID 및 스냅샷+버퍼 델타 자동 재동기화 계약 명문화.
- **G406-02 / P1 (주식)**: 1원(CHIPS)부터 1,000만 원(SPACE)까지 극단 가격대를 포괄하는 KRX 준용 7단계 Tick Size Tier 규격 정의.
- **G406-03 / P1 (주식)**: AI 뉴스(40%) + 24시간 가격 모멘텀(30%) + 거래량 서지(20%) + 호가 압력(10%) 다요소 시장 감성 지수 수식 수립.
- **G406-04 / P0 (경제)**: 통화 발행량 누적 및 장비 가치 하락 방지를 위한 2% 마켓 거래세 징수 및 국고 연동 최저가 매물 자동 매입 소각(Automated GE Item Sink) 계약.
- **G406-05 / P0 (소셜)**: 1:1 개인 채팅의 클라이언트 UUID 멱등키 `(conversation_id, client_message_id)` 중복 전송 방지 및 커서 기반 페이지네이션 강제.
- **G406-06 / P0 (은행)**: 뱅크런 방지를 위한 Aave식 최적 이용률 $U_{\text{optimal}}=80\%$ 점프 금리 곡선 및 바젤 III 20% 법정지급준비금 동결 계약.
- **G406-07 / P1 (인증)**: 배포 및 시크릿 교체 시 세션 단절 없는 7일 Grace Period 듀얼 키 롤링 계약.
- **G406-08 / P1 (UX)**: 320px 극소 모바일 44px 터치 타겟 및 `pb-[calc(env(safe-area-inset-bottom)+5rem)]` 클리핑 방지 레이아웃 계약.
- 신규 권위 세부명세: `docs/planning/deltas/v2026.09.23.406.ko.md` / `v2026.09.23.406.md`. 영/한 동기화 완료.

## v2026.09.23.405 — 2026-09-23
- PR #702를 병합한 뒤(main `67e34d8df182403532e1541d16391f76edfafc57`) Debian 13 런타임 정리를 계속했다.
- Backend 설정과 active TCP 연결로 현재 DB 권위를 재입증했다: Production `127.0.0.1:5433/woldeok_moneyverse_dev`, Test `127.0.0.1:5585/woldeok_moneyverse_ci`.
- 운영 영향 없는 stale container object 4개만 제거했다: `mv-b280-pg`, `mv-ci315`, `mv-ci315b`, `wdmv-v127-fulltest-db`. Docker volume은 보존했다.
- `operations/RUNTIME_HYGIENE_INVENTORY.md` / `.ko.md`를 추가하고 남은 QA/recovery DB container는 owner/data/rollback 확인 전 유지 대상으로 분류했다.
- G405-01 / P1: Production PostgreSQL 5433과 QA PostgreSQL 55432/55433/55555/56555가 wildcard host bind인 것을 관측했다. firewall/network 도달성은 독립 검증하지 못했으므로 Internet 노출 확정이 아니라 bind-exposure 검토항목으로 기록한다.
- Production 5433은 live backend가 사용 중이므로 변경하지 않았다. QA bind 제한은 owner/workstream 확인 후 stop/recreate한다.
- Container 삭제와 volume 삭제는 별도 결정이며 이 호스트에서 광범위 volume prune을 사용하지 않는다.
- 런타임 정리/문서 업데이트이며 Production service restart, DB migration, release promotion은 수행하지 않았다.

## v2026.09.23.404 — 2026-09-23
- 승인 Debian 호스트의 실제 관측값을 기준으로 현재 인프라 문서를 다시 정리했다.
- 현재 관측 OS/runtime: Debian GNU/Linux 13.6 (trixie), Linux 6.12.94, systemd 257, Node 24.21.0, pnpm 10.0.0, Python 3.13.5, Nginx 1.26.3, Docker 29.8.0, Production PostgreSQL 17.11.
- 현재 공개 권위는 host Nginx 뒤 Debian 13 systemd release 디렉터리와 Docker PostgreSQL이다. Production backend/frontend는 3000/3001, Test는 3100/3101을 사용한다.
- 권위 `CURRENT_RUNTIME_BASELINE.md` / `.ko.md`를 추가하고 docs README/index에서 연결했다.
- deployment-flow와 release-guide 영/한을 현재 관측 상태와 TARGET/RECOVERY Kubernetes/Flux를 명확히 구분하도록 재작성했다.
- operations/production-deployment에서 GitOps desired state를 현재 공개 runtime 증거로 오해할 표현을 정정했다.
- Kubernetes/Flux는 접근·DB 대사·exact runtime identity·public routing을 명시적으로 재검증하기 전까지 target/recovery 아키텍처다.
- 여러 QA PostgreSQL 컨테이너가 관측됐지만 파괴적 정리는 수행하지 않았다. 컨테이너 정리는 owner/use/data/rollback 분류 후 수행한다.
- 기획/문서/런타임 관측 업데이트이며 runtime 변경이나 Production 승격은 수행하지 않았다.

## v2026.09.23.403 — 2026-09-23
- GitHub 문서를 역사 증거 삭제나 기존 경로 파손 없이 정리했다.
- 권위 `docs/README.md`, 간결한 `INDEX.md`, `DOCUMENTATION_POLICY.md`, `DOCUMENT_CATALOG.md`와 한국어 쌍 문서를 추가했다.
- planning, architecture, features, operations, findings, updates, changelog, worklog, releases에 문서군별 README 거버넌스를 추가했다.
- 문서 전용이면 `main`에 직접 반영하도록 했던 구형 한국어 단독 정책을 폐기했다. 의미 있는 문서 변경도 브랜치, latest-main 재확인, 영/한 정합, 버전 기록을 요구한다.
- 전수 인벤토리에서 docs 루트 날짜형 legacy Markdown 18개와 내용이 완전히 같은 그룹 31개를 찾았다. 이번 회차는 링크/이력 보호를 위해 경로를 유지하고 신규 루트 날짜형 기록을 금지한다.
- 역사 문서는 근거로 유지하되 현재 권위는 PROJECT_PLAN / INTEGRATED_PLANNING_MASTER / 채택 상세명세가 가진다.
- 문서 전용 커밋을 application release identity로 취급하거나 runtime 승격을 시작하면 안 된다.
- 기획/문서 전용이며 런타임·Test·Production 완료 주장은 없다.

## v2026.09.23.402 — 2026-09-23
- 현재 저장소 증거, 런타임 계약, 최신 표준, 최근 기획결정을 기준으로 기획 전면 재검토를 시작했다.
- 기계적 인벤토리: planning 최상위 166개 = 영문 83 + 한국어 83, 영/한 짝 누락 0, 상대링크 깨짐 0.
- G402-01 / P0: PROJECT_PLAN은 v397, 통합 마스터는 v401이던 권위 드리프트를 v402 공통 권위 marker로 정정했다.
- G402-02 / P1: 모바일 API 문서는 57 controller / 335 endpoint / mobile 179를 기록하지만 현재 소스 탐색은 58 controller 파일 / HTTP decorator 361개다. 동일 계산으로 단정하지 않고 generated contract diff를 요구한다. 로컬 `pnpm api:contract:check`는 dependencies/tsc 부재로 BLOCKED다.
- G402-03 / P1: 역사 incident 본문이 현재 상태를 자동 결정하지 않도록 current active-status ledger를 만들었다.
- G402-04 / P1: AUTH-105-02, OPS-CACHE-156-01 등 명시 TODO를 current-main으로 재검증한다.
- 최신 기준 재확인: OWASP ASVS 5.0.0, NIST SP 800-63-4/63B-4 final, OpenAPI 3.2.1, WCAG 2.2 / ISO 40500:2025, W3C ACT Rules Format 1.1.
- 권위 재검토 문서: `INTEGRATED_FULL_REVIEW_V402.md` / `.ko.md`. 1단계는 권위 정리와 12개 전면감사 lane 설정이며 전체 도메인 감사 완료를 주장하지 않는다.

## v2026.09.23.401 — 2026-09-23
- 경제 기획에 실제 핵심 논문-정책 연결을 추가했다. 대규모 31,289건 후보군과 별도로 고신뢰 논문을 채택근거·미채택가정·KPI까지 매핑한다.
- 핵심 근거: Axtell & Farmer (2025) ABM, Kaplan/Moll/Violante (2018) HANK, Kaplan & Violante (2018) heterogeneity, Zheng et al. AI Economist (2020/2021), Atashbar & Shi IMF RL (2022/2023), Atashbar (2024), Hogan-Hennessy et al. virtual-market intervention (2022), Calvano et al. algorithmic pricing (2020), Meylahn & Schinkel (2026).
- 코호트 구매력, ABM stress test, RL shadow gate, sink causal evaluation, 알고리즘 가격상한·동조 telemetry·사람 승인 규칙을 논문 근거와 직접 연결했다.
- 새 권위 문서: `ECONOMY_RESEARCH_PAPER_MAP.ko.md` / `ECONOMY_RESEARCH_PAPER_MAP.md`.
- 논문 인용만으로 Production 파라미터를 정할 수 없고 Moneyverse replay·telemetry·rollback 증거가 필요하다고 명시했다.
- 문서/기획 전용이며 런타임·Test·Production 완료를 주장하지 않는다. 영/한 동기화 완료.

## v2026.09.23.400 — 2026-09-23
- 기준 재확인: `origin/main=7b705e1d37e97ccd05ba12042c3fd8d582e396d0`; v399 경제 통화속도 기획을 바탕으로 추가 연구 확장을 수행했다.
- 기존 11,749건 후보군에 Crossref 6,879건과 OpenAlex 17,291건을 보완 수집했고 DOI 우선/정규화 제목 보조 중복 제거 후 **31,289건**으로 확장했다. 기존 대비 순증 19,540건이다.
- 신뢰도 높은 추가 근거로 2026 EVE Monthly Economic Report, Old School RuneScape 시장개입 실증연구, Fed/IMF/ECB/BIS heterogeneous-agent·HANK 자료, 2025 AEA/JEL ABM 리뷰를 재검토했다.
- G400-01 / P1: 전역 평균 지표만으로는 코호트별 구매력·분포효과를 놓친다. 신규·중간·고소득·고자산 코호트별 물가/구매력 관측을 추가했다.
- G400-02 / P1: sink가 총소각량을 늘려도 특정 희소·명예재 가격을 높일 수 있으므로 품목군별 가격·거래량·대체수요 검증을 추가했다.
- G400-03 / P1: 휴면잔액/복귀 고자산 유동성, 계절성, 데이터 사후정정과 source/version metadata를 경제 시뮬레이션·대시보드 계약에 추가했다.
- `MONEYVERSE_ECONOMY_REFERENCE_CORPUS_v2026.09.23.400.csv`, 연구검토 영/한, 경제 통화속도 명세 v400을 추가/갱신했다. 기획/문서 전용이며 런타임/Test/Production 완료를 주장하지 않는다.
- 영/한 동기화 완료.

## v2026.09.23.399 — 2026-09-23
- 시작 기준: `origin/main=4812a99b0a78da736e477d0a3a2f02ed4ea66283`; 중간 재확인: `origin/main=f0efc448a30a5b67071956b0faa6742a8427d2ea`. 두 신규 main 커밋은 경제 기획 문서와 비중첩이며 최신 main 위로 재기준화한다.
- 기존 경제 연구 후보군 CSV 11,749건을 재확인하고, 2026년 EVE Monthly Economic Report와 AI Economist/IMF 정책 시뮬레이션 문헌을 추가 검토했다.
- G399-01 / P0: 즉시 완료·즉시 정산 가능한 작업은 반복감쇠만으로도 단위시간당 WLD 발행속도가 과도해질 수 있다. 일반 플레이 무제한 원칙은 유지하되 모든 유상 작업에 서버 권위 시간 또는 검증 경계를 요구한다.
- G399-02 / P1: faucet/sink 비율만으로 경제를 제어하지 않고 통화량, 가격지수, 자산집중, 소득분포, 신규유저 핵심바스켓 구매력을 함께 본다.
- G399-03 / P1: 자동 제어는 악용차단 → 집중 발행원 감쇠 → 작업 다양화 → 고자산 명예 sink → 제한형 issuance factor → 임시 보상윈도우 순서로 적용하고 모두 버전관리·가역·감사 가능해야 한다.
- 신규 권위 세부명세: `ECONOMY_MONETARY_VELOCITY_SPEC` 영/한. 런타임 수정·Test 완료·Production 배포는 이번 회차에서 주장하지 않는다.
- 영/한 동기화 완료.

## v2026.09.23.398 — 2026-09-23
- 시작/중간 기준: `origin/main=4812a99b0a78da736e477d0a3a2f02ed4ea66283`.
- 현재 직업 보상 UI, `work_my_dashboard_v2`, game-clock repository, migration 203, `DEFAULT_LIMIT_POLICY`, `JOBS_PROFESSION_MASTERY_SPEC`, 기존 WORK-128 quota 계약을 재검토했다.
- G398-01 / P1: 현재 UI 문구는 자정/UTC 00:00을 말할 수 있지만 권위 가속 Moneyverse 게임 시계의 `day_ends_at`/`week_ends_at`은 다른 시각을 반환할 수 있어, 정산이 서버 시계를 쓰더라도 사용자 화면 계약이 서로 모순된다.
- G398-02 / P1: 화면에는 유한 일일/주간 WLD 한도가 보이지만 기획은 일반 직업 참여 기본 무제한을 선언한다. 유한 cap은 일반 작업/플레이 금지가 아니라 버전 관리형 보상 발행 보호 윈도우이며 사유/재평가 metadata가 필요하다고 명확히 했다.
- canonical summary/API 필드, unlimited=`null`, 서버 권위 초기화 경계 표시, 일일/주간 분리 문구, 동시성/멱등성 경계시험, 웹/모바일 정합, exact-SHA Test 게이트를 추가했다.
- 기획/문서 전용이며 이번 회차에서 런타임 수정·Test 완료·Production 배포를 주장하지 않는다.
- 영/한 동기화 완료.

## v2026.09.23.397 — 2026-09-23
- 기준: `origin/main=0e46f1eac272c42aa929947b79c0b0d2ccbd5454`.
- P0 기능/API 정합성 불변조건 추가: 서버 기반 또는 보안 민감 기능은 같은 작업 단위에서 필요한 API를 반드시 구현하고, 명시적 client-only 예외가 아니면 UI-only 구현을 미완성으로 판정한다.
- method/path, 인증·인가, schema, validation, error, idempotency, rate/resource limit, concurrency, telemetry/audit, version/deprecation, 영속화·실패 의미까지 포함한 완전한 API 계약을 요구한다.
- 웹/모바일 계약 정합, positive/negative authorization test, contract/schema check, 필요한 idempotency/concurrency 검증, exact-SHA client-to-API E2E를 필수화했다.
- UI에는 보이지만 필요한 backend/API 구현·테스트·문서가 빠진 기능은 Production 승격을 차단한다.
- 영/한 동기화 완료. 기획/문서 전용이며 과거 모든 기능의 API 완비를 주장하지 않는다.

## v2026.09.23.396 — 2026-09-23
- 기준: `origin/main=5762e7bc685dc8d75ce6e672a6cef1dcc9b03ee4`. main 최신 병합 릴리스 기록은 v393까지 진행됐지만 권위 기획은 v388이므로 이번 회차에서 런타임 배포 완료를 새로 주장하지 않고 기획 권위를 갱신한다.
- P0 인증/세션 연속성 불변조건 추가: 서버·서비스 재시작, 애플리케이션 업데이트, 블루-그린 전환, 프록시 reload, 롤백 때문에 아직 유효한 사용자를 로그아웃시키면 안 된다.
- 배포 인스턴스 독립 세션 권위, 서명/암호화 키 overlap, cookie/schema 호환성, 배포 전후 authenticated continuity 표본, 401/403/session-store telemetry, 배포 유발 로그아웃 시 중단/롤백을 필수화했다.
- 배포 수단으로 session store truncate/global invalidation/overlap 없는 키 일괄 교체를 금지한다. 보안·사용자·관리자·만료에 의한 정상 세션 폐기는 유지한다.
- Production 승격 전에 Test restart/cutover 자동 회귀시험 증거를 요구한다.
- 영/한 동기화 완료. 기획/문서 전용이며 새 런타임 배포 완료를 주장하지 않는다.

## v2026.09.23.388 — 2026-09-23
- 시작/통합 SHA: `bb832b69ee56b9ab247eda24b7b20f76ea44ffb4` (23개 미병합 PR 및 PR #685 메인 병합 완료).
- 검토: `PROJECT_PLAN` 영/한, `docs/mobile-api-complete-spec` 영/한, `AUTHENTICATION_SECURITY_PRIORITY_SPEC` 영/한, `COMMUNITY_MARKET_INTEGRITY_SPEC` 영/한, 런타임 마이그레이션 197 실증 증거, 백엔드 테스트(974 pass), 프론트엔드 테스트(3 pass), 배포 및 운영 세션(1,061개) 연속성 실측 데이터.
- G368-02 P0 종결 (Closed): 관리자 구형 TOTP 문구를 마이그레이션 197 및 실제 배포 통제인 `AdminSessionGuard`, `ReauthGuard`(Step-Up 2FA), 브라우저 CSRF 가드, DB role/actor 검사, 멱등성 및 append-only audit로 완전 정합화 완료.
- G368-03 P1 종결 (Closed): `docs/mobile-api-complete-spec.ko.md` 및 영문 문서를 v2026.09.23.388로 최신화하고, 신규 4대 도메인 16개 엔드포인트를 포함하여 57개 컨트롤러, 335개 엔드포인트(모바일 계약 179개) 전수 정합화 완료.
- G368-04 P1 종결 (Closed): 상점 Step-Up 및 23개 PR을 `main`에 정합 병합하고, 테스트 및 빌드 검증을 거쳐 테스트/운영 서버에 무중단 승격 완료.
- G368-05 P1 종결 (Closed): 운영 서버 승격 중 1,061개 PostgreSQL 활성 사용자 세션 100% 무손실 보존 및 BFF 알림/채팅 엔드포인트 정상 응답 실측 증명 완료.
- 영/한 동기화: 완료.

## v2026.09.22.368 — 2026-09-22
- 시작 SHA: `3f42ad8c6b12c8e13693ff246935eebceab951e1`.
- 중간 SHA: `3f42ad8c6b12c8e13693ff246935eebceab951e1`(안정).
- 권위 드리프트: PROJECT_PLAN v352 대 main release 증거 v360.
- 검토: PROJECT_PLAN 영/한, INTEGRATED_REVIEW_V348 영/한, UPDATE_LOG 영/한, v359/v360 release 증거, mobile complete API 계약, 현재 관리자 TOTP/runtime migration 증거, 원격 admin-shop reauth 후보.
- G368-01 P1: 권위/버전 드리프트. 후속 release note는 기획 수용조건을 묵시적으로 덮어쓰지 않는다.
- G368-02 P0: migration/runtime 증거상 관리자 TOTP가 폐기됐지만 권위/세부기획에는 현재 통제로 남아 있다. 새 runtime+DB 증거 없이는 배포 통제로 계산하지 않는다.
- G368-03 P1: mobile/API 계약에 과거 v2026.09.14.2/52-controller/163-endpoint 내용과 v359의 57-controller/335-backend/179-mobile 내용이 혼재한다. exact-SHA semantic machine diff와 영/한 동기화를 요구한다.
- G368-04 P1: `auto/hourly-b-shop-stepup-v2026.09.22.366`은 미병합 WIP 증거다. 최신 main rebase, reauth/role/CSRF 음성시험, 감사·동시성/멱등성 증거, 영/한 기록, merged exact-SHA Test 증거가 있어야 수용한다.
- G368-05 P1: v360 session 수/무중단 증거는 해당 release 범위이며 모든 auth/CSRF/reauth/중요 mutation 연속성을 단독으로 증명하지 않는다.
- 외부 재확인: OWASP ASVS 5.0.0 latest stable, NIST SP 800-63B-4 2025-07 final 및 주기적 재인증/session-timeout 요구.
- 판단: 기획/문서 전용. 새 구현·Test·Production 완료를 주장하지 않는다.

## v2026.09.26.443 — 대한민국 법령/준수 감사
- 시작/중간 `origin/main=6f025ced5239fc6bc8b365c31ad0fd59acf84dbc`; 중간 drift 없음.
- `KR_LEGAL_COMPLIANCE_AUDIT.md` / `.ko.md` 추가. 운영 backend/frontend active, `production-current=prod-v453`, 선택 공개페이지에서 AdSense 실제 렌더 확인.
- **KR-LGL-443-01 / P0:** 실제 GRAC/등급 + 19+ + 법률/채널 증거 전 대한민국 카지노 BLOCK 유지. 현재 소스/운영 번들의 승인/정규가동성 문구는 권위 정책과 충돌한다.
- **KR-LGL-443-02 / P0:** 현재 광고 수익화 확대 전 실제 사업개시일·사업자등록·세무상태 증거 필요.
- **KR-LGL-443-03 / 실결제 전 P0:** 판매자 신원/신고, 거래조건, 청약철회/환불/해지, 미성년자 계약 통제 전 유료상품/구독 BLOCK.
- **KR-LGL-443-04..08 / P1:** 연령확인 표현, AdSense/국외이전, 광고성 메시지 동의, 게임 등급 적용성, 비환전 경계를 증거 기반 게이트로 관리.
- 기획/감사만 수행. 운영 변경·배포·DB migration·GRAC 승인·사업자등록·세무상태 완료를 주장하지 않는다.

## v2026.09.30.487 — 광고 전용 현금 수익화
- 시작/중간 `origin/main=85508db432cd525570e26bc1820b9e637a8140fa`; 기록한 체크포인트에서 drift 없음.
- 사용자 사업자등록 제약: 현재 안내 범위에서 상품 직접판매를 허용하지 않는다.
- **현행 현금수익 권위:** 검토된 광고수익만 허용한다. 유료 구독/광고제거, 디지털 상품/코스메틱, 유료 WLD/WDX, 유료 확률형/카지노 가치, 사용자 유료 마켓수수료, 후원/멤버십, 유료 API/B2B, 제휴/직접판매는 향후 사업범위·세무·법률 권위 변경이 명시적으로 해제하기 전까지 BLOCKED다.
- **월 광고수익 100만 원 목표:** 업계 평균 약속이 아니라 실측 Page RPM을 사용한다. `PV = 1,000,000 / PageRPM × 1,000`; 시나리오는 RPM 2천원=50만 PV, 5천원=20만 PV, 1만원=10만 PV, 2만원=5만 PV다.
- 성장 권위: 정상 인간 트래픽, Search Console/색인 진실성, audience-first 계산기·가이드, 올바른 locale 구조, 관련 내부링크, 실측 AdSense 실험. 자가클릭·클릭유도·보상형 광고조회·traffic exchange·봇 impression·저품질 유료트래픽은 금지한다.
- 신규 상세 권위: `AD_ONLY_ADVERTISING_REVENUE_SPEC.ko.md`; PROJECT_PLAN과 수익화/한국 준수 명세에 v487 상위 대체 게이트를 반영했다.
- Google AdSense Page RPM/Auto Ads/Experiments/invalid traffic/publisher policy와 국세청 플랫폼 광고수익 세무 안내를 재확인했다. 국세청 1인 미디어 안내를 이 웹사이트의 자동 업종분류 근거로 사용하지 않는다.
- 기획/문서 전용이며 런타임, 결제, AdSense 설정, Test, Production, 세무분류 확정, 실제 수익달성을 주장하지 않는다.
