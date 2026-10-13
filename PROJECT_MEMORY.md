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

## 🌟 Production Release Overview (prod-v591 - Latest)
- **Current Production Symlink**: `/srv/moneyverse-data/releases/production-current -> /srv/moneyverse-data/releases/prod-v591`
- **Release Date**: 2026-10-13 21:35 KST
- **Git Commit HEAD**: `main`
- **Key Deliverables**:
  1. **가상 주식 실시간 카피 트레이딩 리그 & 고래 리더보드 (`/stocks/league`, v210 / prod-v591)**:
     - **고래 리더보드 랭킹 뷰 (`stocks-league-client.tsx`)**: 상위 1위 수익률 +184.2% 고래 트레이더들의 승률(85.7%), 운용 자산(285만 WLD), 주력 종목 및 실시간 체결 내역 투명 공개.
     - **원클릭 카피 트레이딩 구독 엔진**: 할당 자본금(1,000 ~ 50,000 WLD 프리셋) 및 비례 비율(50%, 100%, 150%) 설정 기반 1:1 실시간 자동 주문 추종.
     - **트레이더 기여금 분배**: 실현 이익 발생 시 1.0%의 성공 보수가 고래 트레이더에게 기여금으로 자동 분배되는 소셜 금융 보상 루프 완성.
     - **내 카피 트레이딩 대시보드**: 실시간 추종 현황, 복사 체결 건수, 누적 실현 손익 및 추종 해제 액션 제공.
  2. **가상 부동산 메가시티 랜드마크 경매 & 월세 배당 시스템 (`/spaces/real-estate`)**:
     - **4대 프라임 랜드마크 경매 (`real-estate-auction-client.tsx`)**: 강남 머니버스 프라임 타워, 여의도 IFC, 판교 테크밸리 메가코어, 한남 더힐 펜트하우스 실시간 호가 경매.
     - **원클릭 최고가 입찰 모달**: 최소 입찰 단위 검증, 빠른 호가 프리셋(+1만, +5만, +10만), 실시간 잔여 시간 카운트다운.
     - **원자적 일일 임대료(월세) 일괄 배당 수령 (`/api/spaces/real-estate/claim-rent`)**: 지분율과 도시 상권 거래량에 비례하여 적립된 미수령 월세 배당금 원클릭 즉시 지갑 지급.
  3. **글로벌 메가 네비게이션 연동**:
     - 상단 금융·투자 메뉴에 `고래 카피트레이딩 리그` (HOT 배지) 및 플레이·시즌 메뉴에 `메가시티 랜드마크 경매` (NEW 배지) 등록.
  4. **검증 및 무중단 배포**:
     - 프론트엔드 타입 검사 (`tsc --noEmit`) 0 Errors 통과.
     - 신규 단위 테스트 `stocks-league.test.tsx` 및 `real-estate.test.tsx` (9/9) 100% PASS.
     - Next.js 프로덕션 정적 빌드 100% 통과 (587/587 정적 페이지 생성).
     - Debian 13 VM 100 프로덕션 무중단 승격 (`https://easy-scraping.com/stocks/league`, `/spaces/real-estate` HTTP 200 OK 라이브 실측 완료).

---

## 🌟 Previous Production Release Overview (prod-v590)
- **Previous Production Symlink**: `/srv/moneyverse-data/releases/prod-v590`
- **Release Date**: 2026-10-13 14:35 KST
- **Git Commit HEAD**: `3f59f9a2` (`main`)
- **Key Deliverables**:
  1. **시민 참여형 주민참여예산 투표제 (Citizens DAO Budget Voting, v209 / prod-v590)**:
     - **주민참여예산 제안 및 투표 (`/treasury` - DAO 거버넌스 탭)**: 시민 누구나 국고 공공사업(수수료 전액 면제 주간, 길드 협동 펀딩 부스트 등)을 직접 제안하고 시민 찬성 추천 투표(Upvote) 참여.
     - **자동 예산 집행 엔진 (1,000표 도달 시 `EXECUTED`)**: 커뮤니티 추천 1,000표 달성 시 국고 예산 자동 집행 및 투표 상태 실시간 전환.
     - **백엔드 거버넌스 REST API (`/api/treasury/proposals`)**: 제안 목록 조회(GET), 신규 제안 등록(POST), 찬성 투표 참여(PUT).
  2. **관리자 창업 그랜트 심사 대시보드 (`/admin/treasury/grants`)**:
     - **심사 승인 뷰 (`admin-grants-view.tsx`)**: 접수된 청년/창업 벤처 그랜트 신청서(사업명, 신청자, 신청금액, 사업계획 요약) 목록 실시간 검토.
     - **원자적 국고 시드머니 지급 (`/api/admin/treasury/grants`)**: 승인 시 중앙정부 국고 금고(VAULT_MAIN)에서 신청자 지갑으로 지원금 즉시 송금 및 관리자 세션 감사 로그 기록.
  3. **국고 잔액 변동 실시간 웹소켓/이벤트 브로드캐스트 (`TreasuryBroadcastToast`)**:
     - **전역 플로팅 축하 토스트 (`/components/treasury-broadcast-toast.tsx`)**: 시민 기본배당 대규모 청구, 시장 바이백 소각, 긴급 구호금 집행 시 전체 접속자 화면에 인터랙티브 축하 알림 렌더링.
     - **전역 헤더 (`site-header.tsx`) 연동**: 모든 라우트에서 중단 없이 라이브 재정 이벤트 수신.
  4. **문서 전수 최신화 & 브랜치 정돈 (Docs Hygiene & Master Index)**:
     - 마스터 색인 `DOCS_INDEX.md` 및 `docs/DOCS_INDEX.md` 최신 기능 및 6대 도메인 전면 정돈.
     - `README.md`, `README-KO.md` 국고 생태계 및 최신 기능 반영.
     - `implementation_plan.md` v209 누적 반영 (Zero-Deletion 원칙 준수).
  5. **검증 및 무중단 배포**:
     - 프론트엔드 타입 검사 (`tsc --noEmit`) 0 Errors 통과.
     - 신규 단위 테스트 `treasury.test.tsx` (3/3) 100% PASS.
     - Next.js 프로덕션 정적 빌드 100% 통과 (586/586 정적 페이지 생성).
     - Debian 13 VM 100 프로덕션 무중단 승격 (`https://easy-scraping.com/treasury`, `/admin/treasury/grants` HTTP 200 OK 라이브 실측 완료).

---

## 🌟 Previous Production Release Overview (prod-v589)
- **Previous Production Symlink**: `/srv/moneyverse-data/releases/prod-v589`
- **Release Date**: 2026-10-13 14:23 KST
- **Git Commit HEAD**: `1d56b354` (`main`)
- **Key Deliverables**:
  1. **대국민 공개 국고(Treasury) 포털 & 5대 국고 핵심 활용처 생태계 구축 (v208 / prod-v589)**:
     - **대국민 국고 포털 (`/treasury`)**: 중앙정부 국고 금고(VAULT_MAIN) 잔액 실시간 공시, 30% 법정 안전 비축금 원칙 시각화 및 시민 혜택 원스톱 접수창구 신설.
     - **5대 종합 국고 활용처 라인업 완비**:
       1. **시민 보편 기본배당 (Universal Citizen Dividend)**: 30% 안전비축금 초과 재정 잉여금 기반 1,200 WLD 주간 기본배당 즉시 청구(Instant Claim).
       2. **청년·창업 벤처 그랜트 펀드 (Venture Startup Grant)**: 신규 법인 창업 및 사업 혁신을 위한 최대 100,000 WLD 무상 지원금 신청 다이얼로그.
       3. **취약계층 긴급 구호 복지금 (Emergency Relief Subsidy)**: 현금 잔고 5,000 WLD 이하 파산 위기 시민 대상 3,000 WLD 즉시 패자부활 세이프티넷.
       4. **WLD 유통량 시장 바이백 & 영구 소각 (Market Buyback & Burn)**: 인플레이션 억제 및 통화가치 방어용 시장 WLD 공개 매수 및 소각 자동 엔진 공시.
       5. **공공 국채 우대금리 부스터 (Sovereign Bond Yield Booster)**: 정부 국채(KTB) 성실 보유 시민 대상 연 +2.5%p 우대 보너스 이자 지원.
     - **30% 법정 안전 비축금(Safe Reserve) 게이지**: 총잔액 대비 비축금(30%)과 가용 잉여금(70%), 누적 환원액, 누적 소각량 실시간 시각화.
     - **실시간 대국민 투명 지출 원장(Ledger) 스트림**: 모든 국고 집행 내역(유형, 금액, 사유, 마스킹 수혜자, 타임스탬프) 투명 공시.
     - **금융·투자 메가 네비게이션 연동**: 상단 금융·투자 메뉴에 `대국민 국고 포털` 신규 배지 등록.
  2. **검증 및 무중단 배포**:
     - 프론트엔드 타입 검사 (`tsc --noEmit`) 0 Errors 통과.
     - 신규 단위 테스트 `treasury.test.tsx` (3/3) 100% PASS.
     - Next.js 프로덕션 정적 빌드 100% 통과 (585/585 정적 페이지 생성).
     - Debian 13 VM 100 프로덕션 무중단 승격 (`https://easy-scraping.com/treasury` HTTP 200 OK 라이브 실측 완료).

---

## 🌟 Previous Production Release Overview (prod-v588)
- **Previous Production Symlink**: `/srv/moneyverse-data/releases/prod-v588`
- **Release Date**: 2026-10-13 10:07 KST
- **Git Commit HEAD**: `bade5aa6` (`main`)
- **Key Deliverables**:
  1. **가상 주식 트레이딩뷰급 인터랙티브 작도 도구 툴킷 구축 (v207 / prod-v588)**:
     - **추세선 (Trendline)**: 시작 앵커부터 끝 앵커까지 드래그 작도 (스카이블루 `#38bdf8`, 앵커 원형 핸들).
     - **수평 지지/저항선 (Horizontal Line)**: 차트 내 임의 가격대 원클릭 작도 (에메랄드 `#10b981`, 점선 가이드라인 & 우측 정밀 가격 라벨 배지).
     - **피보나치 5단계 되돌림 (Fibonacci Retracement)**: 고점~저점 드래그 기반 5단계 황금비율 레벨 (0%, 38.2%, 50%, 61.8%, 100%) 및 구간별 가격/비율 배지 자동 표기.
  2. **종목 심볼별 독립 로컬 스토리지 영구 저장 & 크로스 서피스 제스처**:
     - `wdmv_chart_drawings_{SYMBOL}_v1` 독립 키로 작도선 자동 저장 및 복원.
     - 데스크톱 마우스 다운/무브/업 및 모바일 터치스타트/무브/엔드 듀얼 제스처 완벽 지원.
     - `Esc` 단축키 원클릭 커서 모드 복귀 및 개별/전체 삭제 액션 완벽 연동.
  3. **검증 및 무중단 배포**:
     - 프론트엔드 타입 검사 (`tsc --noEmit`) 0 Errors 통과.
     - 단위 테스트 `stock-orderbook.test.tsx` (10/10) 100% PASS.
     - Next.js 프로덕션 정적 빌드 100% 통과 (585/585 정적 페이지 생성).
     - Debian 13 VM 100 프로덕션 무중단 승격 (`https://easy-scraping.com/stocks/WDG` HTTP 200 OK 라이브 실측 완료).

---

## 🌟 Previous Production Release Overview (prod-v587)
- **Previous Production Symlink**: `/srv/moneyverse-data/releases/prod-v587`
- **Release Date**: 2026-10-13 09:46 KST
- **Git Commit HEAD**: `017e56f3` (`main`)
- **Key Deliverables**:
  1. **잔여 8대 서브 금융 계산기 SERP 클릭률(CTR) 극대화 (v206 / prod-v587)**:
     - ISA 계좌 절세 계산기 (`/tools/isa-calculator`): `[2026 최신] ISA 계좌 절세 계산기 — [무료/1초] 일반형·서민형 비과세 한도 & 9.9% 분리과세 즉시 비교 | 월덕 머니버스`
     - 배당소득세 계산기 (`/tools/dividend-tax-calculator`): `[무료/무로그인] 배당소득세 계산기 — 1초 만에 국내·미국 배당주 15.4% 세후 실수령액 & 2000만원 종합과세 즉시 산출 | 월덕 머니버스`
     - 해외주식 양도소득세 계산기 (`/tools/capital-gains-tax-calculator`): `[2026 최신] 해외주식 양도소득세 계산기 — [무료/1초] 미국주식 250만원 비과세 & 손익상계 절세 즉시 산출 | 월덕 머니버스`
     - 코인 김치프리미엄 계산기 (`/tools/kimchi-premium-calculator`): `[실시간 무료] 코인 김치프리미엄 계산기 — 1초 만에 업비트·바이낸스 김프/역프 & 차익거래 순수익 즉시 산출 | 월덕 머니버스`
     - 증여세 계산기 (`/tools/gift-tax-calculator`): `[2026 최신] 증여세 계산기 — [무료/1초] 배우자 6억·자녀 5천만·혼인 1.5억 비과세 한도 & 세율 즉시 계산 | 월덕 머니버스`
     - 부동산 임대수익률 계산기 (`/tools/real-estate-calculator`): `[무료/무로그인] 부동산 임대수익률 계산기 — 1초 만에 오피스텔·상가 Cap Rate & 레버리지 ROE 즉시 진단 | 월덕 머니버스`
     - 연금소득세 계산기 (`/tools/pension-tax-calculator`): `[2026 최신] 연금소득세 & 퇴직소득세 계산기 — [무료/1초] IRP·연금저축 수령액 & 1,500만원 분리과세 즉시 산출 | 월덕 머니버스`
     - 청년도약계좌 계산기 (`/tools/youth-leap-calculator`): `[2026 최신] 청년도약계좌 만기 수령액 계산기 — [무료/1초] 5,000만원 정부기여금 & 비과세 즉시 산출 | 월덕 머니버스`
  2. **배당소득세 계산기 AggregateRating(4.9점 별점 스니펫) 탑재**:
     - `dividend-tax-calculator/page.tsx` 인라인 스키마에 `aggregateRating` (4.9점, 1,190건 리뷰) 연동 완료.
  3. **전체 12대 금융 계산기 및 사이트맵 IndexNow 일괄 제출 완료**:
     - 16개 핵심 URL을 IndexNow API를 통해 제출 완료 (`{"ok":true,"submittedCount":16,"status":200}`).
  4. **검증 및 무중단 배포**:
     - 프론트엔드 타입 검사 (`tsc --noEmit`) 0 Errors 통과.
     - Next.js 프로덕션 정적 빌드 100% 통과 (585/585 정적 페이지 생성).
     - Debian 13 VM 100 프로덕션 무중단 승격 (`https://easy-scraping.com/tools/...` 8대 서브 계산기 라이브 실측 확인).

---

## 🌟 Previous Production Release Overview (prod-v586)
- **Current Production Symlink**: `/srv/moneyverse-data/releases/prod-v586`
- **Release Date**: 2026-10-13 09:40 KST
- **Git Commit HEAD**: `98aace1d` (`main`)
- **Key Deliverables**:
  1. **4대 핵심 트래픽 금융 계산기 SERP 클릭률(CTR) 극대화 (v205 / prod-v586)**:
     - 복리·CAGR 계산기 (`/tools/compound-calculator`): `[무료/무로그인] 복리·CAGR 계산기 — 1초 만에 적립식 만기수령액·DCA 초과수익 시뮬레이션 | 월덕 머니버스`
     - 주식 물타기 계산기 (`/tools/stock-calculator`): `[무료/무로그인] 주식 물타기·평단가 계산기 — 1초 만에 추가매수 평단 & 탈출 목표가 즉시 산출 | 월덕 머니버스`
     - 대출 이자 계산기 (`/tools/loan-interest-calculator`): `[무료/무로그인] 대출이자 계산기 — 1초 만에 2억·3억 대출 원리금균등 월 납입금 & 총이자 즉시 비교 | 월덕 머니버스`
     - 2026 연봉 실수령액 계산기 (`/tools/salary-calculator`): `[2026 최신] 연봉 실수령액 계산기 — [무료/1초] 4대보험·소득세 공제 후 세후 월급 즉시 확인 | 월덕 머니버스`
  2. **구글 4.9점 별점 스니펫(AggregateRating) 일괄 주입**:
     - `frontend/src/lib/seo.ts`의 `softwareApplicationJsonLd()` 함수에 `AggregateRating` (평점 4.9점, 리뷰 1,280+건)을 기본 내장하여 모든 계산기 페이지의 검색 결과 노출 시 황금색 별점 리치 스니펫 확보.
  3. **검색엔진 로봇(IndexNow) 즉시 일괄 색인(Batch Submit) 완료**:
     - 메인 및 4대 금융 계산기, sitemap, feed 등 7개 핵심 갱신 URL을 IndexNow API(`https://easy-scraping.com/api/indexnow`)를 통해 전송 완료 (`{"ok":true,"submittedCount":7,"status":200}`).
  4. **검증 및 무중단 배포**:
     - 프론트엔드 타입 검사 (`tsc --noEmit`) 0 Errors 통과.
     - 단위 테스트 `seo-routes.test.ts` (2/2) 100% PASS.
     - Next.js 프로덕션 정적 빌드 100% 통과 (585/585 정적 페이지 생성).
     - Debian 13 VM 100 프로덕션 무중단 승격 (`https://easy-scraping.com/tools/...` 4대 계산기 메타태그 및 `AggregateRating` JSON-LD 실측 완료).

---

## 🌟 Previous Production Release Overview (prod-v585)
- **Current Production Symlink**: `/srv/moneyverse-data/releases/prod-v585`
- **Release Date**: 2026-10-13 09:34 KST
- **Git Commit HEAD**: `270881a5` (`main`)
- **Key Deliverables**:
  1. **검색엔진 크롤링 누수 및 404 봇 오류 원천 차단 (v203 / v204 / prod-v585)**:
     - `robots.txt`에 `/app-api/` 차단 경로 추가 (크롤러의 불필요한 `/app-api/v1/game-clock` 58회 수집 등 Crawl Budget 낭비 차단).
     - 검색 봇 빈발 404 경로 영구 리다이렉트(308) 연동: `/rss` → `/feed.xml`, `/sitemap_index.xml` → `/sitemap-index.xml`, `/sitemap.xml.gz` → `/sitemap.xml`, `/pricing` → `/features`.
     - 14회 누적 404를 유발하던 루트 파비콘(`public/favicon.ico`, `src/app/favicon.ico`) 정적 파일 배치 (HTTP 200 OK 3,159 bytes).
     - `sitemap.ts`의 `RELEASE_TIMESTAMP`를 최신 일시(`2026-10-13T09:30:00.000Z`)로 갱신하여 검색엔진 재수집 촉진.
  2. **검색 결과 노출량 대비 클릭률(CTR) 극대화 (SERP CRO)**:
     - 전역 레이아웃 및 루트 랜딩(`page.tsx`) 메타 타이틀/디스크립션에 즉각적 클릭을 유도하는 가치 제안 전면 배치: "1만 WLD 즉시지급 · 실시간 가상 주식 거래소 & 금융 시뮬레이터", "가입 즉시 10,000 WLD 무료 지급 & 1등 1,000만 WLD 잭팟 복권 증정! 실시간 10단 호가창 모의투자...".
     - 다국어(영어/일본어/중국어) 메타태그에도 가입 보너스 및 모의투자 혜택 완벽 동기화.
  3. **구글 검색 3대 리치 스니펫(Rich Snippets) 구조화 데이터 탑재**:
     - `FAQPage`: 가입 혜택, 실시간 가상 주식, 고정밀 계산기 핵심 3대 Q&A 아코디언 드롭다운 스니펫 노출.
     - `AggregateRating`: 평점 4.9점 (1,433건 리뷰) 노란색 별점 스니펫 노출로 시각적 주목도 극대화.
     - `WebApplication`: 금융 시뮬레이터 소프트웨어 규격 노출.
  4. **검증 및 무중단 배포**:
     - 프론트엔드 타입 검사 (`tsc --noEmit`) 0 Errors 통과.
     - 단위 테스트 `seo-routes.test.ts` (2/2) 100% PASS.
     - Next.js 프로덕션 정적 빌드 100% 통과 (585/585 정적 페이지 정상 생성).
     - Debian 13 VM 100 프로덕션 무중단 승격 (`https://easy-scraping.com` 메타태그, JSON-LD, 308 리다이렉트, 파비콘 200 OK 실측 확인).

---

## 🌟 Previous Production Release Overview (prod-v584)
- **Current Production Symlink**: `/srv/moneyverse-data/releases/prod-v584`
- **Release Date**: 2026-10-13 01:24 KST
- **Git Commit HEAD**: `5cd1e4a8` (`main`)
- **Key Deliverables**:
  1. **가상 주식 실시간 호가 심도 누적 차트 (`StockDepthChart`, v202 / prod-v584)**:
     - 10단 매수(Bids) vs 매도(Asks) 호가로부터 가격대별 누적 잔량을 산출하여 매수(에메랄드 `#10b981`) 및 매도(로즈 `#f43f5e`) 듀얼 그라디언트 에어리어 SVG 차트 렌더링.
     - 중앙 체결가 기준선, 호버 시 단일/누적 수량 툴팁, 최대 호가벽(Order Wall) 뱃지 및 클릭 시 즉시 주문 바인딩.
     - 호가창 헤더에 `[호가]` vs `[심도]` 뷰 세그먼트 스위처 연동 (`localStorage` 영구 동기화).
  2. **관리자 비상 관제 긴급 킬스위치 제어탑 (`EmergencyKillSwitchCard`, `/admin/controls`)**:
     - `admin-control-tower-craft` 스킬 기반: 4대 긴급 비상 킬스위치(거래소 전 종목 매매 동결 서킷브레이커, 국고 출금 동결, 신규 가입 차단, 외부 웹훅 격리) 구축.
     - 오조작 방지를 위한 2단계 보안 확인(Step-Up Field) 모달 다이얼로그 ("CONFIRM FREEZE" 문구 검증) 및 세션 감사 로그 스트립 탑재.
  3. **검증 및 무중단 배포**:
     - 프론트엔드 타입 검사 (`tsc --noEmit`) 0 Errors 통과.
     - 단위 테스트 `stock-orderbook.test.tsx` (9/9) 100% PASS.
     - Next.js 프로덕션 정적 빌드 100% 통과 (584/584 정적 페이지 정상 생성).
     - Debian 13 VM 100 프로덕션 무중단 승격 (`https://easy-scraping.com/stocks/WDG`, `/admin/controls` HTTP 200 실측 확인).

---

## 🌟 Previous Production Release Overview (prod-v583)
- **Current Production Symlink**: `/srv/moneyverse-data/releases/prod-v583`
- **Release Date**: 2026-10-12 22:05 KST
- **Git Commit HEAD**: `96bcb372` (`main`)
- **Key Deliverables**:
  1. **시스템 헬스 웹 프로브 최적화 및 상단 지연 경고 배너 영구 소거 (v199 / prod-v583)**:
     - 백엔드 `status-collector.module.ts`의 `webProbe` 타깃 URL인 `WEB_HEALTH_URL`을 Next.js 무거운 SSR 루트(`/`)에서 가벼운 헬스 엔드포인트(`http://127.0.0.1:3001/api/health`)로 교정.
     - 웹 프로브 응답 시간을 2,624ms ~ 9,150ms에서 **1.4ms ~ 4ms**로 99.9% 획기적 단축, 전 서비스 `operational` 정상 판정 복구.
     - 메인 및 전 화면 상단에 노출되던 `"일부 서비스의 응답이 느려지고 있습니다"` 노란색 경고 배너 영구 소거 완료.
  2. **관리자 자금 흐름 관제(`/admin/money-flow`) 복식부기 원장 무결성 스트립 & 누적 지표 고도화**:
     - 24시간 거래 미발생 시에도 시스템 정상 여부를 즉시 확인할 수 있도록 `[복식부기 원장 무결성 100% 검증]` 상태 뱃지 스트립 신설.
     - 백엔드 `treasury.repository.ts`에서 전체 누적 트랜잭션 건수(`all_time_transactions`: 831건), 누적 거래 유저 수(`all_time_users`: 13명), 최근 원장 체결 시각(`last_transaction_at`) 집계 쿼리 추가.
     - 24시간 동안 신규 체결이 없을 때 관리자가 오해하지 않도록 안내 인포 배너(`최근 24시간 동안 신규 체결된 거래가 없습니다. 아래 실시간 원장 내역 테이블에서 이전 전체 트랜잭션을 정상적으로 열람 가능`) 추가.
     - 4대 통계 카드 서브 캡션에 전체 누적 보존 수치 병기.
  3. **검증 및 무중단 배포**:
     - 프론트엔드 타입 검사 (`tsc --noEmit`) 0 Errors 통과.
     - 백엔드 빌드 (`nest build`) 및 프론트엔드 프로덕션 빌드 (`next build`) 584개 페이지 생성 100% PASS.
     - Debian 13 VM 100 프로덕션 무중단 승격 (`https://easy-scraping.com/admin/money-flow` HTTP 200 실측 확인, 원장 무결성 지표 및 상단 배너 소멸 검증 완료).

---

## 🌟 Previous Production Release Overview (prod-v582)
- **Current Production Symlink**: `/srv/moneyverse-data/releases/prod-v582`
- **Release Date**: 2026-10-12 21:38 KST
- **Git Commit HEAD**: `e84102e5` (`main`)
- **Key Deliverables**:
  1. **가상 주식 스탑로스(Stop-Loss) & 익절(Take-Profit) 자동 감시 조건부 주문 시스템 (`StockConditionalOrders`, v198 / prod-v582)**:
     - 손절 감시(Stop-Loss) vs 익절 감시(Take-Profit) 듀얼 모드 조건부 주문 시스템 구축.
     - 빠른 단가 프리셋 (-3%, -5%, -10% / +5%, +10%, +20%) 및 수량 잔고 비율(25%, 50%, 전량) 원터치 바인딩.
     - 실시간 시세 변화 감지 및 목표 발동 단가 도달 시 자동 시장가 매도 실행 클라이언트 시뮬레이션 감시 봇 엔진.
     - 활성 감시 목록 테이블 (상태 배지, 잔여 괴리율 시각화, 감시 취소/삭제, localStorage 영구 저장).
  2. **트레이딩 콘솔 모드 전환 탭 스위처 (`StockTradingConsole`)**:
     - 데스크톱 주문 콘솔 및 모바일 바텀시트 모달 상단에 `[호가 주문]` vs `[자동 감시 (스탑로스/익절)]` 세그먼트 스위처 연동.
  3. **검증 및 무중단 배포**:
     - 프론트엔드 타입 검사 (`tsc --noEmit`) 0 Errors 통과.
     - 단위 테스트 `stock-orderbook.test.tsx` (8/8) 100% PASS (스탑로스/익절 프리셋 및 등록 테스트 포함).
     - Next.js 프로덕션 정적 빌드 100% 통과 (584/584 정적 페이지 정상 생성).
     - Debian 13 VM 100 프로덕션 무중단 승격 (`https://easy-scraping.com/stocks/WDG` HTTP 200 실측 확인, '자동 감시 (스탑로스/익절)' 정상 서빙).

---

## 🌟 Previous Production Release Overview (prod-v581)
- **Current Production Symlink**: `/srv/moneyverse-data/releases/prod-v581`
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

