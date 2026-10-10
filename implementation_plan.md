# [월덕 머니버스] 통합 구현 계획서 (현재: v177)

## 📜 누적 버전 히스토리 (Version Changelog & Diffs)
- **v177**: [QA 보고서 전수 분석 및 P1/P2 핵심 결함 쇄신 (가상 주식 10종목 마스터 동기화 404 해결, 복리 물타기 문구 분기, 용어사전 50개 동기화, 납세 영수증 안전 기본값, 대출 무이자 지원 및 최저이자 동적 판정, 오타/비문 쇄신)] (+54, -0)
- **v176**: [320px 극소 모바일 전 구간 UI 깨짐 원천 방지 & 고객센터 서류/이미지 고해상도 줌/팬 뷰어 탑재 & 국고 관제 헤더·금액 텍스트 쪼개짐 무결점 해결] (+95, -0)
- **v175**: [신규 방문자 온보딩 웰컴 혜택 UI(1만 WLD+복권) 강화 & 다국어/미수집 26개 페이지 전역 내부 링크(Internal Linking) 구축 & 글로벌 SEO 수집 실측] (+240, -0)
- **v174**: [SEO 7대 핵심 금융 계산기 Canonical 오염 결함 원천 해결 & Google/IndexNow 실시간 대량 재색인 핑 전송 & prod-v560 무중단 승격] (+110, -0)
- **v173**: [국고 국부펀드(ASWF) 복리 재투자 및 테일러 칙 연동 금리 조정 시뮬레이션 UI 고도화 & prod-v559 무중단 승격] (+130, -0)

---

## 🏛️ [v175 Specification] 신규 방문자 웰컴 혜택 UI 및 크롤링 극대화 내부 링크 구축 사양
(v175의 모든 텍스트, 요구사항, 아키텍처 다이어그램, 파일 목록이 100% 온전히 보존됨)

### 1. 현황 및 문제점 분석
1. **SEO 유입 지연 및 노출 부족**:
   - 봇 방문 총 362회 실측: 한국어(53.6%), 영어(2.8%), 중국어(2.5%), 일본어(1.9%).
   - 핵심 가상 주식 10개 중 9개 종목(DUCKS, COIN, SPACE 등), 가이드 18개 중 17개가 크롤러 미방문(`unindexed`) 상태.
   - 원인: 푸터 및 계산기 화면에 이들 페이지로 연결되는 링크가 없어 크롤러가 발견하지 못함(Crawl Budget 낭비).
2. **방문자 전환율(CRO) 부재**:
   - 계산기 유입 방문자가 계산만 하고 이탈함.
   - 비로그인 유저에게 "회원가입 시 10,000 WLD 정착금 + 1등 1,000만 WLD 메가 잭팟 복권 1장 100% 무료 증정" 혜택을 매력적으로 어필하는 배너 및 CTA 필요.

### 2. 세부 개발 명세
1. **신규 방문자 웰컴 혜택 배너 & CTA (`WelcomeOnboardingBanner`)**:
   - 위치: 상단 쉘(`SiteShell`) 및 계산기 하단
   - 타겟: 비로그인 유저(`!viewer?.signedIn`)
   - 혜택: "가입 즉시 10,000 WLD 정착 지원금 + 1등 1,000만 WLD 메가 잭팟 복권 1장 100% 무료 지급"
   - 인터랙션: 원클릭 로그인(`/login`) 연결, 오늘 하루 닫기(24시간 LocalStorage) 지원.
   - 디자인: `anti-ai-frontend-craftsmanship` (절제된 앰버/에메랄드 뱃지, 고대비 모노스페이스 수치, Lucide SVG).
2. **전역 푸터 종합 에코시스템 내부 링크 그리드 (`SiteFooter`)**:
   - **실전 금융 계산기 (9종)**: 대출이자, 배당소득세, ISA, 연금저축, 은퇴설계, 연봉실수령액, 청년도약계좌, 복리, 주식 물타기
   - **가상 주식 거래소 10대 종목 (전수 링크)**: CHIPS, DUCKS, COIN, SPACE, CYBER, ROBOT, GOLD, ENERGY, BIO, GAME
   - **가상 경제 & 실전 가이드 (5종)**: 주식 실전 매매, 복리 예금, 직업 파밍, 경제 용어사전, 도파민 보상 가이드
   - **글로벌 다국어 허브 (4개 국어)**: 한국어, English, 简体中文, 日本語
3. **계산기 전역 추천 에코시스템 허브 (`ToolsEcosystemLinks`)**:
   - `/tools` 및 계산기 상세 하단에 관련 주식, 가이드, 타 계산기 딥링크 그리드 배치.

### 3. 검증 계획
1. TypeScript 타입 검증 (`tsc --noEmit`) 0 Errors
2. 로컬 빌드 무결성 확인
3. Git 커밋 및 origin/main 푸시
4. 원격 운영 서버(`prod-v561`) 무중단 승격 배포
5. 실제 HTML 렌더링 확인 (배너 노출 여부, 푸터 내부 링크 수 30개 이상 정상 확인)

---

## 🚀 [v176 Specification] 320px 극소 모바일 UI 깨짐 방지 및 고객센터 서류 뷰어 고도화

### 1. 현황 및 문제점 분석 (사용자 실측 피드백 4건 정밀 반영)
1. **[고객센터 서류 이미지 읽기 불가]**:
   - 채팅 버블 내 사업자등록증 등 텍스트 서류 이미지가 `object-cover`로 크롭되어 글자가 잘리고 찌그러짐.
   - 모바일 터치 환경에서 호버 버튼이 없어 확대 가능 여부를 알 수 없고, 모달 팝업 시에도 화면에 맞게 축소되어 스마트폰에서 깨알 글씨(등록번호, 대표자명 등) 판독 불가.
   - 서브헤더에서 제목(`sd`)과 뱃지(`답변완료`)가 flex-shrink 결함으로 겹쳐 보이는 오버랩 버그 발생.
2. **[320px 국고 거버넌스 및 ASWF 카드 헤더 글자 쪼개짐]**:
   - `swf-control-panel.tsx`에서 ⚖️, 📈 이모지와 제목 텍스트, 뱃지가 한 줄 강제 flex되어 글자가 한 글자씩 세로로 쪼개지고 뱃지와 겹침.
3. **[320px 국고 감사 원장 거래 금액 쪼개짐]**:
   - `treasury-view.tsx` 모바일 리스트에서 거래 사유 텍스트가 공간을 차지하면서 우측 수치가 `+232,03` / `3 WLD` 형태로 자릿수 단위로 줄바꿈 붕괴.
4. **[플로팅 고객센터 버튼 컨텐츠 가림]**:
   - 페이지 최하단 안전 여백 부재로 스크롤 시 플로팅 위젯 아이콘(헤드셋)이 마지막 감사 원장 수치를 가려버림.

### 2. 세부 개발 명세
1. **서류/이미지 전문 고해상도 뷰어 구축 (`ImageLightboxModal`)**:
   - 1x, 1.5x, 2x, 3x 돋보기 줌 및 축소, 100% 원본 크기 원클릭 리셋 기능 탑재.
   - 확대 상태에서 부드러운 스크롤 패닝 지원으로 스마트폰에서도 사업자등록증 전문 판독 보장.
   - "새창 원본 열기(`target="_blank"`)", "다운로드", ESC/외부클릭 닫기 지원.
2. **채팅 메시지 렌더러 썸네일 크롭 방지 & 모바일 상시 액션 바 (`ChatMessageRenderer`)**:
   - `object-contain` 적용으로 서류 여백 및 전체 내용 온전 보존.
   - 모바일/데스크톱 공통 상시 노출 조작 툴바: "🔍 원본 확대 및 돋보기 읽기", "새창 열기 ↗" 카드 마운트.
3. **고객센터 서브헤더 오버랩 방지 & 버블 너비 확장 (`floating-support-chat-widget.tsx`)**:
   - 서브헤더 제목 `truncate text-xs min-w-0` 및 뱃지 `shrink-0 whitespace-nowrap` 분리로 320px 오버랩 영구 차단.
   - 모바일 메시지 버블 `max-w-[94%]` 확장.
4. **국고 거버넌스 & 국부펀드 헤더 반응형 레이아웃 쇄신 (`swf-control-panel.tsx`)**:
   - `flex-col sm:flex-row`, `break-keep`, `shrink-0` 적용으로 320px에서도 제목 줄바꿈 자연스럽게 유지.
   - 액션 버튼 모바일 `w-full` 스택 및 AUM 지표 `whitespace-nowrap tabular-nums` 보호.
5. **국고 회계 감사 원장 수치 보호 (`treasury-view.tsx`)**:
   - 거래 금액 영역에 `shrink-0 whitespace-nowrap tabular-nums text-right` 강제 적용.
6. **모바일 최하단 안전 여백 (`admin/treasury/page.tsx`)**:
   - 컨테이너에 `pb-32 sm:pb-12` 적용하여 플로팅 버튼/바텀 내비에 컨텐츠 가림 원천 차단.

### 3. 검증 계획
1. `tsc --noEmit` 정적 타입체크 100% 통과 (완료)
2. Git 커밋 및 origin/main 푸시
3. 원격 운영 서버(`prod-v562`) 무중단 승격 빌드 및 배포
4. 실제 Chrome 브라우저 320px 모바일 뷰포트에서 `admin/treasury` 및 고객센터 캡처 실측 검증

---

## 🚀 [v177 Specification] QA 보고서(2026-10-10) 전수 분석 및 P1/P2 핵심 결함 쇄신 사양

### 1. 현황 및 문제점 분석 (QA Reports 정밀 분석 결과)
1. **[QA10-06 · P1 / COPY-32] 가상 주식 10개 종목 링크 404 발생**:
   - `site-footer.tsx` 및 `tools-ecosystem-links.tsx`에 `DUCKS`, `COIN`, `CYBER`, `ROBOT`, `GOLD`, `ENERGY`, `BIO`, `GAME` 등 실존하지 않는 가짜 티커 심볼이 하드코딩되어 8개 링크가 404 에러 발생.
   - 실제 PostgreSQL DB(`virtual_stocks` 테이블) 마스터: `CHIMU314`(치무전자), `CHIPS`(치무 초전도), `DUCK`(덕덕 물산), `MYUY`(뮤야 엔터테인먼트), `SPACE`(월덱 우주항공), `WDB`(월덱 바이오), `WDG`(월덱 게임즈), `WDM`(월덱 모빌리티), `WDT`(월덱 테크), `WFIN`(월덱 파이낸셜).
2. **[QA10-03 · P1 / COPY-21] SEO 감사 화면 날짜 오류 및 네이버 봇 집계**:
   - 백엔드 `seo.service.ts`의 `recentLogs`는 `createdAt`을 반환하는데 프론트엔드 `admin-seo-audit-view.tsx`는 `latest.timestamp`를 참조하여 `Invalid Date` 출력.
   - 네이버 검색로봇(Yeti / Naver Yeti)이 개별 분기되어 정상 합산되지 않음.
3. **[QA10-10 · P2 / COPY-15] 복리 계산기 결과 카드에 물타기(목표 탈출가) 문구 노출**:
   - `calculator-retention-funnel.tsx`에서 주식 계산기용 문구(목표 탈출가, 평단가)가 복리 계산기에 공통 노출되어 사용자 혼란 유발.
4. **[QA10-12 · P2 / COPY-23] 용어사전 50개 불일치**:
   - 화면 제목은 "50대 투자 & 금융 용어사전"이나 실제 등록된 용어는 49개였음.
5. **[QA10-07 · P1 / COPY-27/34] 지갑 납세 영수증 하드코딩 샘플 노출**:
   - 에러 시 `2500 WLD` 하드코딩 샘플값 및 '100% 원자적 분할 적립 완료' 표시로 납세 사실이 없는 유저에게 오해 유발.
6. **[QA10-14 · P2 / COPY-38/39] 대출 계산기 0% 무이자 지원 및 최저이자 동적 판정**:
   - 0% 입력 시 0.1% 강제 보정, 부동소수점 오차(66원/60원), 원금균등에 고정된 `(최저이자)` 하드코딩.
7. **[COPY-01, 02, 03, 12, 18, 40] UI 오타, 비문 및 접근성 결함**:
   - 상점 카탈로그 쉼표 오타, 관리자 전체 메뉴 비문, 총 청정 유저 모호성, UTC 자정 시간대 혼동, 1초 과장 수식, 주식 차트 기간 버튼 aria-pressed 누락.

### 2. 세부 개발 명세
1. **가상 주식 10종목 DB 마스터 동기화 (`site-footer.tsx`, `tools-ecosystem-links.tsx`)**:
   - DB에 실제 존재하는 10종목(`CHIMU314`, `CHIPS`, `DUCK`, `MYUY`, `SPACE`, `WDB`, `WDG`, `WDM`, `WDT`, `WFIN`)으로 푸터 및 허브 링크 전면 교체.
2. **SEO 감사 뷰 날짜 안전 파싱 & 네이버 봇 통합 (`admin-seo-audit-view.tsx`)**:
   - `latest.createdAt || latest.timestamp` 안전 파싱, 네이버 검색로봇(Yeti + Naver Yeti + naver) 통합 집계.
3. **복리 계산기 전용 시뮬레이션 전환 (`calculator-retention-funnel.tsx`)**:
   - `isCompound` 분기 도입, "만기 예상 자산", "저축 플랜 시뮬레이션" 문맥 적용.
4. **용어사전 50번째 용어 CAGR 추가 (`pseo-glossary.config.ts`)**:
   - `cagr-compound-annual-growth-rate` 용어 객체 추가로 50개 완벽 일치.
5. **납세 영수증 안전 기본값 적용 (`citizen-tax-receipt-card.tsx`)**:
   - fallback 값을 '0'으로 변경하고 납세 이력 유무에 따른 조건부 완료 문구 적용.
6. **대출 계산기 0% 무이자 지원 & 동적 최저이자 판정 (`loan-calculator-client.tsx`)**:
   - min="0", 0% 무이자 대출 분기 추가, 3가지 상환방식 중 실제 최소값에만 `(최저이자)` 동적 라벨 부여.
7. **오타/비문 쇄신 및 차트 접근성 강화**:
   - `admin/shop`: 상점 카탈로그 쉼표 정리
   - `admin-quick-jumper-modal`: 관리자 전체 관제 타워 네비게이터로 수정
   - `analytics-client-view`: '일반 회원 수 (관리자 제외)'로 명확화
   - `admin-work-stats`: '매일 00:00 UTC(한국 시간 09:00)'로 정확한 초기화 시각 명시
   - `calculator-save-action`: '1초' 과장 표현 제거 및 표준 문구화
   - `stock-interactive-chart`: 1D/1W/1M/1Y 버튼에 `role="group"`, `aria-pressed`, `aria-label` 적용

### 3. 검증 계획
1. 로컬 TypeScript 정적 타입 검증 (`tsc --noEmit`) 0 Errors (통과 완료)
2. Git 커밋 및 origin/main 푸시
3. 원격 운영 서버(`prod-v563`) 무중단 승격 빌드 및 배포
4. 실제 프로덕션 HTTP 상태 코드 실측 (`/stocks/DUCK`, `/stocks/SPACE` 등 10종목 200 OK 확인)
5. 종합 결과 및 해결 현황 보고
