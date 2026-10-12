# Woldeok Moneyverse - Project Memory & Master Release Tracker

## ⚡ Global Framework Standard: Superpowers (`obra/superpowers`)
- **Framework Origin**: `https://github.com/obra/superpowers`
- **Scope**: All project tasks, coding workflows, refactors, feature additions, and debugging.
- **Enforced Disciplines**:
  1. `skills/using-superpowers`: Automatic skill invocation before all tasks/responses.
  2. `skills/brainstorming`: Socratic requirement probing & design specification before code changes.
  3. `skills/writing-plans`: Step-by-step TDD-driven task decomposition.
  4. `skills/test-driven-development`: Red-Green-Refactor invariant.
  5. `skills/systematic-debugging`: 4-phase root cause analysis over speculative patching.
  6. `skills/verification-before-completion`: Authoritative verification before completion.

---

## 🌟 Production Release Overview (prod-v581 - Latest)
- **Current Production Symlink**: `/srv/moneyverse-data/releases/production-current -> /srv/moneyverse-data/releases/prod-v581`
- **Release Date**: 2026-10-12 21:20 KST
- **Git Commit HEAD**: `9bed0441` (`main`)
- **Key Deliverables**:
  1. **가상 주식 전 종목 퀵 티커 스위처 바 (`StockTickerSwitcher`, v197 / prod-v581)**:
     - 거래소 상단에 시장 18개 전 종목을 가로 스크롤로 한눈에 탐색할 수 있는 반응형 티커 캐러셀 탑재.
     - 종목 심볼, 한글 명칭, 실시간 현재가(콤마 안전 포맷팅), 당일 등락률(%) 뱃지 및 현재 선택 종목 액티브 링 제공.
     - 모바일 터치 스크롤(`no-scrollbar`, `scroll-smooth`) 및 데스크톱 호버 피드백 지원.
  2. **정통 MACD(12, 26, 9) 모멘텀 서브패널 탑재**:
     - 단기 EMA(12)와 장기 EMA(26)의 수렴·확산 곡선(스카이블루 `#38bdf8`) 산출.
     - MACD의 9기간 시그널 지수이동평균 곡선(오렌지 `#fb923c`) 산출.
     - 모멘텀 오실레이터 히스토그램 막대(상승 에메랄드 `#10b981` / 하락 로즈 `#f43f5e`) 3중 SVG 렌더링.
  3. **서브패널 탭 전환기 (RSI ↔ MACD)**:
     - 뷰포트 높이 절약을 위해 차트 하단 서브패널을 원클릭으로 `[RSI (14)]`와 `[MACD (12, 26, 9)]` 간 토글할 수 있는 탭 스위처 연동 (`localStorage` 영구 보존).
     - 상단 지표 칩 그룹에 `MACD` 토글 버튼 연동.
  4. **검증 및 무중단 배포**:
     - 프론트엔드 타입 검사 (`tsc --noEmit`) 0 Errors 통과.
     - 단위 테스트 `stock-orderbook.test.tsx` (7/7) 100% PASS (MACD 및 티커 스위처 테스트 포함).
     - Next.js 프로덕션 정적 빌드 100% 통과 (584/584 정적 페이지 정상 생성).
     - Debian 13 VM 100 프로덕션 무중단 승격 (`https://easy-scraping.com/stocks/WDG` HTTP 200 실측 확인, '가상 주식 퀵 티커 바' 정상 서빙).

---

## 🌟 Previous Production Release Overview (prod-v580)
- **Current Production Symlink**: `/srv/moneyverse-data/releases/prod-v580`
- **Release Date**: 2026-10-12 20:34 KST
- **Git Commit HEAD**: `96b99eea` (`main`)
- **Key Deliverables**:
  1. **백엔드 실데이터 캔들 API 하이브리드 바인딩 (v196 / prod-v580)**:
     - `StockInteractiveChart`: `/api/stocks/[id]/candles?interval={sec}` 엔드포인트 비동기 조회.
     - 타임프레임 표준 매핑: `1D`(15분봉), `1W`(1시간봉), `1M`(1일봉), `1Y`(1주봉).
     - 장애/비로그인 시 브라운 브리지 난수 궤적으로 원활히 전환되는 무중단 Fallback 보장.
  2. **지지선 / 저항선(Support & Resistance) 수평 분석 칩**:
     - 상단 지표 칩 바에 `SR` 온/오프 토글 추가 (`localStorage` 영구 동기화).
     - 당일 최고가(또는 차트 고가) 기준 로즈 붉은색 저항 점선 가이드라인 렌더링 (`저항 {price}`).
     - 당일 최저가(또는 차트 저가) 기준 에메랄드 지지 점선 가이드라인 렌더링 (`지지 {price}`).
  3. **실시간 시장 체결 플로팅 미니 토스트 (`StockMarketToast`)**:
     - 화면 우측 하단에 대규모 체결 및 급등락 틱을 5초간 슬라이드 인/아웃으로 노출.
     - 체결 틱 사운드(`playStockTickSound`) 및 에메랄드(매수)/로즈(매도) 뱃지 시각 피드백 연동.
  4. **검증 및 무중단 배포**:
     - 프론트엔드 타입 검사 (`tsc --noEmit`) 0 Errors 통과.
     - 단위 테스트 `stock-orderbook.test.tsx` (6/6) 100% PASS.
     - Next.js 프로덕션 정적 빌드 100% 통과 (584/584 정적 페이지 정상 생성).
     - Debian 13 VM 100 프로덕션 무중단 승격 (`https://easy-scraping.com/stocks/WDG` HTTP 200 실측 확인, 'SR', '지지선/저항선' 정상 서빙).

---

## 🌟 Previous Production Release Overview (prod-v579)
- **Current Production Symlink**: `/srv/moneyverse-data/releases/prod-v579`
- **Release Date**: 2026-10-12 19:54 KST
- **Git Commit HEAD**: `620a7340` (`main`)
- **Key Deliverables**:
  1. **전문가용 키보드 핫키 트레이딩 시스템 (v195 / prod-v579)**:
     - `StockOrderPanel`: `B`(매수 탭), `S`(매도 탭), `Enter`(주문 확인 및 제출), `Esc`(모달 닫기/폼 포커스 해제).
     - **오입력 방지 가드**: 수량/가격 등 텍스트 인풋 필드에 포커스되어 있을 때 알파벳 단축키 트리거를 원천 차단하여 오입력 방지.
     - **UI 단축키 뱃지**: 탭 버튼 및 주문 실행 버튼에 정밀 모노스페이스 뱃지(`[B]`, `[S]`, `[Enter]`) 및 데스크톱 단축키 가이드 바 노출.
  2. **실시간 마이크로 도넛 포트폴리오 자산 비중 위젯 (`StockMicroPortfolio`)**:
     - 개별 주식 거래 화면 우측 주문 패널 하단에 SVG 마이크로 도넛 차트 위젯 배치.
     - 현재 종목의 포트폴리오 점유 비중(%) 중앙 시각화, 보유 평가액 및 상위 3개 보유 종목 컬러 배지 스트립 제공.
  3. **지정가 모의 체결 봇 & 피드백 (Simulated Limit Order Matcher)**:
     - 지정가 주문 시 가상 매칭 엔진 호가 대기 펄스 애니메이션 및 1.2초 후 체결 완료 축하 사운드(`playStockTradeSuccessSound`) 연동.
- **Current Production Symlink**: `/srv/moneyverse-data/releases/prod-v578`
- **Release Date**: 2026-10-12 19:18 KST
- **Git Commit HEAD**: `dbcefc68` (`main`)
- **Key Deliverables**:
  1. **가상 주식 차트 고급 보조지표 탑재 (v194 / prod-v578)**:
     - `StockInteractiveChart`: 볼린저 밴드(20, 2) 상/중/하단 밴드 및 투명 음영 영역 렌더링.
     - RSI(14) 실시간 서브패널(과매수 70 / 과매도 30 점선 기준선) 추가.
     - 지표 칩 토글 스위치 (`MA 5/20`, `BB(20,2)`, `RSI(14)`) 독립 온/오프 제어.
     - 차트 모드(`봉`/`선`) 및 활성 지표 목록 `localStorage` 영구 동기화 (`mw_stock_chart_mode`, `mw_stock_chart_indicators`).
  2. **10단 호가창 & 주문 콘솔 퀵 바인딩 및 프리셋**:
     - `StockOrderbook`: 호가 깊이(5D/10D) `localStorage` 영구 동기화 (`mw_stock_orderbook_depth`).
     - 호가 행 클릭 시 즉시 주문 가격 인풋 바인딩 및 체결 틱 사운드 재생.
     - `StockOrderPanel`: 10%, 25%, 50%, 100% 잔액 비율 원터치 프리셋 버튼 탑재.
  3. **Web Audio API 오디오 인터랙션 구축**:
     - `audio-effects.ts`: `playStockTradeSuccessSound()` (체결 완료 D5->A5 아르페지오 신디사이징).
     - `audio-effects.ts`: `playStockTickSound()` (1600Hz 미니멀 틱 핑).
  4. **검증 및 무중단 배포**:
     - 프론트엔드 타입 검사 및 Next.js 프로덕션 빌드 100% 통과 (584/584 정적 페이지 정상 생성).
     - 단위 테스트 `stock-orderbook.test.tsx` (3/3) 100% PASS.
     - Debian 13 VM 100 프로덕션 무중단 승격 (`https://easy-scraping.com/stocks/WDG` HTTP 200 실측 확인).
- **Current Production Symlink**: `/srv/moneyverse-data/releases/prod-v577`
- **Release Date**: 2026-10-12 17:55 KST
- **Git Commit HEAD**: `2dabf2b7` (`main`)
- **Key Deliverables**:
  1. **가상 주식 호가창 & 인터랙티브 차트 TradingView급 전면 쇄신 (v193 / prod-v577)**:
     - `StockInteractiveChart`: 라인 에어리어 vs 캔들스틱 봉차트 듀얼 모드 토글 스위치 구축 (`봉` / `선`).
     - 골드 앰버 이동평균선 MA 5 및 퍼플 인디고 이동평균선 MA 20 오버레이 및 상단 OHLC 인디케이터 바.
     - 하단 볼륨 히스토그램 막대 그래프 동적 높이 스케일링 (상승/하락 색상 자동 매핑).
     - 마우스 및 터치 크로스헤어(십자선) 인터랙션 가이드 및 OHLC 실시간 툴팁.
     - `tabular-nums` 모노스페이스 전면 적용으로 시세 변동 시 글리프 흔들림(Jittering) 0건 달성.
  2. **10단 호가창 체결강도 & 최근 체결 틱 스트림 고도화**:
     - `StockOrderbook`: 체결강도(`Intensity`) 게이지 배지 (매수우세 에메랄드 / 매도우세 로즈).
     - 5D / 10D 깊이 원클릭 토글 버튼.
     - 최신 체결 5건 실시간 미니 스트림 (`시간 · 체결가 · 수량`).
     - 320px 모바일 뷰포트 방어 및 단축키/호가 원터치 연동 보존.
- **Current Production Symlink**: `/srv/moneyverse-data/releases/prod-v576`
- **Release Date**: 2026-10-11 23:30 KST
- **Git Commit HEAD**: `35245119` (`main`)
- **Key Deliverables**:
  1. **전체 SEO 재분석 및 검색엔진 최적화 전면 개발**:
     - `sitemap.xml`, `sitemap-static.xml`, `sitemap-stocks.xml`의 `<lastmod>` 날짜를 `2026-10-11T23:00:00.000Z`로 최신화.
     - `sitemap-stocks.xml`에 누락되었던 18개 가상 주식 종목 전수 등록 및 4개 국어 다국어 hreflang alternates 완비.
     - `/bank`를 회원 전용 화면으로 올바르게 정정하여 크롤러 307 리다이렉트 색인 페널티 원천 차단.
     - `/kdic` 포털에 `FAQPage`, `WebApplication`, `BreadcrumbList` JSON-LD 탑재.
     - `/bank/savings-pot` (4인 공동 저축 팟) 전용 레이아웃 및 `WebApplication`, `BreadcrumbList` JSON-LD 신규 구축.
     - `robots.txt`에 `sitemap.xml` 및 `sitemap-index.xml` 동시 등록.
     - 배포 직후 `SeoCronPingService`를 통해 39개 핵심 타겟 URL을 Bing/IndexNow 및 Google에 자동 색인 제출 완료.
  2. **KDIC 예금보험공사 대위변제 원장 무결성 확립 (QA P0-03 해결, prod-v574)**:
     - `kdic.repository.ts`의 직접 잔액 쓰기를 MINT 원천 복식부기 원장 분개(`economy_post_transaction`) 및 중복 지급 방지 가드로 전면 개정.
  3. **관리자 관제탑 UI 쇄신 (prod-v575)**:
     - 대위변제 원장 복식부기 분개 상태(`✓ 원장체결`), 원래 예탁금 대비 분석 컬럼, 분기별 예보료 법정부담금 뱃지 추가.
  4. **무손실 DB 백업 & 원격 디스크 81GB 대규모 정리 (v191)**:
     - PostgreSQL 전체 스냅샷(`post-v575-kdic-20261011-2233.dump`, 68MB) 안전 보관.
     - 루트 파일시스템 +22GB, 데이터 볼륨 +59GB 회수 완료 (총 81GB 확보).

---

## 🌟 Previous Production Release Overview (v118 / prod-v529)
- **Current Production Symlink**: `/srv/moneyverse-data/releases/production-current -> /srv/moneyverse-data/releases/prod-v529`
- **Current Test Symlink**: `/srv/moneyverse-data/releases/test-current -> /srv/moneyverse-data/releases/test-v529`
- **Release Date**: 2026-10-07 KST
- **Active PostgreSQL Sessions**: **1,433+ Active Sessions Preserved (Zero Loss)**
- **Key Deliverables**:
  1. **국고(VAULT_MAIN) 85% 현금 정상화**: 주식 7,877만 WLD 매도 회수하여 현금 1억 1,080만 WLD (84.7%) : 주식 2,000만 WLD (15.3%) 안전 비율 복원 및 관리자 즉시 회수 버튼 구축 (`/admin/treasury`).
  2. **원클릭 소셜 바이럴 공유 툴바 (`SocialShareToolbar`)**: 12종 계산기 350+ 롱테일 프리셋, 뉴스, 주식 상세, 진단서 전면에 카카오톡/X/페이스북/링크복사 바 탑재.
  3. **X(Twitter) 자동 트윗 백링크 봇 (`TwitterPublisherService`)**: Twitter API v2 (OAuth 1.0a HMAC-SHA1) 기반 일일 개장/마감 시황 자동 포스팅 데몬 구축 및 관리자 수동 발송 테스트 API (`/admin/seo`).
  4. **Google Search Console 실시간 연동 (v541)**: 서비스 계정 키 기반 사이트맵 자동 제출, 인덱싱 현황 실시간 검사 및 관리자 UI 구축.

---

## 🌟 Previous Production Release Overview (v462)
- **Production Symlink**: `/srv/moneyverse-data/releases/prod-v462`
- **Test Symlink**: `/srv/moneyverse-data/releases/test-v462`
- **Git Commit HEAD**: `b8a5f9d8` (`main`)
- **Active PostgreSQL Sessions**: **1,433 Active Sessions Preserved (Zero Loss)**
- **Frontend Test Suite**: **139 test files / 868 tests passed (100% PASS)**
- **Key Deliverables**:
  1. Complete removal of Casino gambling APIs for full Korean legal compliance
  2. 5 dedicated Dopamine backend engagement APIs (`/api/v1/engagement/dopamine/*`)
  3. Real-time 14-domain API health control tower (`/admin/api-health`)
  4. Authoritative master API catalog (`docs/API_CATALOG_MASTER.ko.md`)
  5. Full integration of all historical branches into single authority `main`

---

## 🌍 GeoIP Auto-Localization & Master Dictionary Verification

### 1. 하이브리드 접속 국가별 자동 번역 감지 실측
| 접속 국가 / 헤더 조건 | 감지 로케일 | Set-Cookie 출력 | 결과 |
| :--- | :--- | :--- | :--- |
| `KR` (한국) | `ko` (한국어) | `wdmv_detected_locale=ko` | **정상** |
| `JP` (일본) | `ja` (일본어) | `wdmv_detected_locale=ja` | **정상** |
| `CN`, `TW`, `HK`, `MO`, `SG` (중화권/싱가포르) | `zh` (중국어) | `wdmv_detected_locale=zh` | **정상** |
| `US`, `GB`, `DE`, `FR`, `AU` (글로벌 200+ 국가) | `en` (영어) | `wdmv_detected_locale=en` | **정상** |
| `Accept-Language: ja-JP...` | `ja` (일본어) | `wdmv_detected_locale=ja` | **정상** |
| `Accept-Language: zh-CN...` | `zh` (중국어) | `wdmv_detected_locale=zh` | **정상** |
| `Accept-Language: ko-KR...` | `ko` (한국어) | `wdmv_detected_locale=ko` | **정상** |
| `Accept-Language: en-US...` | `en` (영어) | `wdmv_detected_locale=en` | **정상** |

### 2. 5만 어휘 래퍼런스 기반 4개 국어 마스터 딕셔너리 (`i18n-dictionary.ts`)
- **금융/주식**: 10대 상장사(월덕게임즈, 파이낸스덕, 치무테크, 월덕반도체 등), 호가창(Orderbook), 매수/매도, 시장가/지정가, 실시간 체결 틱, 캔들 차트, AI 감성 지수
- **가상 중앙은행**: 복리 이자율, 맞춤형 저축 포켓, 만기 확정 국채 시뮬레이터, 멱등성 송금
- **미니게임/카지노**: 주사위 배틀, 코인플립, 유러피언 룰렛, 럭키 슬롯, 배당금, 자가 보호 한도
- **직업/업무**: 8대 전문직, 일일 업무, 승급 시험, 일일 쿼터
- **퀘스트/시즌/영토/커뮤니티/관리자/공통**: 전 도메인 용어 체계화

---

## 🧪 Test Suite Results
- **Frontend**: 124 test files / 820 tests passed (**100% PASS**)
- **Backend**: 110 test files / 1,040 tests passed (**100% PASS**)
- **Total Tests**: **1,860 tests passed**

---

## 🌟 Production Release Overview (v456)
- **Release Version**: `prod-v456`
- **Release Date**: 2026-09-26 22:12 KST
- **Current Production Symlink**: `/srv/moneyverse-data/releases/production-current -> /srv/moneyverse-data/releases/prod-v456`
- **Current Test Symlink**: `/srv/moneyverse-data/releases/test-current -> /srv/moneyverse-data/releases/test-v456`
- **Git Commit HEAD**: `76662ce7` (`main`)
- **Active PostgreSQL Sessions**: **1,377 Active Sessions Preserved (Zero Loss)**

---

## 🎯 SEO 전면 개편 & 15만 어휘 다국어 코퍼스 아키텍처 (v456)

### 1. 도입 및 실서비스 배포 패키지
1. **SEO 단일 진실 공급원 (`routes.config.ts`) & robots.txt 연동**:
   - 공개 여부(`isPublic`), 색인 여부(`indexable`), sitemap 우선순위(`sitemapPriority`), 변경주기(`changeFrequency`)를 일원화.
   - 비공개 회원 전용 경로(`/bank`, `/wallet`, `/casino`, `/quests`, `/seasons`, `/work`, `/businesses`, `/spaces`, `/newspaper`, `/marketplace`, `/chat`, `/account`, `/admin`, `/stocks/*`)를 `robots.txt`에서 자동 Disallow 처리.
2. **Sitemap 고정 릴리스 타임스탬프 & 307 리다이렉트 원천 차단**:
   - 가짜 요청 시각 `new Date()` 제거, 고정 릴리스 타임스탬프(`2026-09-26T21:00:00.000Z`) 및 실제 DB 발행일 적용.
   - 회원 전용 라우트를 sitemap에서 완전 배제하여 307 크롤링 충돌 방지.
   - `sitemap-static.xml`, `sitemap-stocks.xml`, `sitemap-announcements.xml`, `sitemap-board.xml` 전수 정합성 확보.
3. **다국어 기본 로케일 정책 & 동적 메타데이터 (`generateMetadata`)**:
   - 기본 로케일 영어(`DEFAULT_LOCALE = 'en'`) 및 한국어 2순위 Fallback 정책 정합화.
   - 동일 URL `hreflang` 중복 선언(ko-KR / en-US) 문제 완전 해소.
   - 동적 4개 국어(ko/en/ja/zh) 메타데이터 및 Schema.org JSON-LD 구축.
4. **15만 개 전문 어휘 다국어 코퍼스 (69.22MB)**:
   - 9대 도메인 150,000개 유니크 어휘 엔트리 생성기(`scripts/generate-i18n-corpus-150k.mjs`) 및 빠른 O(1) 룩업 헬퍼(`corpus-lookup.ts`) 구축.

### 2. 프로덕션 검증 지표
| 라우트 및 기능 | HTTP 상태 | 동작 검증 |
| :--- | :--- | :--- |
| `https://easy-scraping.com/` | 200 OK | 홈 대시보드 정상 (기본 로케일 및 메타데이터 정상) |
| `https://easy-scraping.com/robots.txt` | 200 OK | Disallow 비공개 목록 및 단일 Sitemap 정상 |
| `https://easy-scraping.com/sitemap.xml` | 200 OK | 고정 릴리스 타임스탬프 및 비공개 경로 제외 정상 |
| `https://easy-scraping.com/sitemap-stocks.xml` | 200 OK | 공개 주식 허브만 등록 확인 |
| `https://easy-scraping.com/sitemap-static.xml` | 200 OK | 정적 공개 경로 및 고정 타임스탬프 정상 |
| `https://easy-scraping.com/sitemap-board.xml` | 200 OK | 실제 DB 게시글 작성일 lastmod 반영 확인 |
| `https://test.easy-scraping.com/` | 200 OK | 테스트 환경 정상 (x-robots-tag: noindex, nofollow) |
| **활성 DB 세션 수** | **1,377 세션** | **무손실 100% 보존** |

### 3. 전체 테스트 스위트 검증 결과
- **Frontend Vitest**: **128개 파일 / 833개 테스트 전수 100% PASS**
- **Next.js 16.3.4 Production Build**: **33개 정적/동적 라우트 전체 정상 빌드**
- **150k Multilingual Corpus**: **150,000개 유니크 엔트리 무결성 검증 100% PASS**

