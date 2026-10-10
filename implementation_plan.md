# [월덕 머니버스] 통합 구현 계획서 (현재: v181)

## 📜 누적 버전 히스토리 (Version Changelog & Diffs)
- **v181**: [QA 보고서 결함 전수 분석 및 잔여 이슈 5대 영역 완전 해결 (AI 뉴스 프롬프트·한자/영문 오타 후처리 자동 정제 엔진 장착, 텔레메트리 난수 제거 및 실측 RTT 핑 엔진 장착, 거버넌스 분기 동적 계산 및 감사 원장 명확화, 고착도·물타기 번역 개선)] (+55, -0)
- **v180**: [가상 주식 10종목·핵심 가이드 5종 IndexNow 검색 로봇 즉시 색인 요청 핑 전송(HTTP 200) & 검색 로봇(Googlebot 96회, Yeti 57회 등 일일 191회) 크롤링 실측 분석 완료] (+42, -0)
- **v179**: [은행 대출 리스크 0건 시 빈 상태 안내 분기 & 텔레메트리 지니계수/순자산 점유율 용어 일치 & 신규 회원 정착금 플랫폼 공식 정책(10,000 WLD + 복권 1장) 전역 통일] (+48, -0)
- **v178**: [글로벌 다국어(ko/en/ja/zh) 계산기 저장·바이럴 공유 모달 100% 현지화 & 경제 캘린더 실시간 동적 D-Day(발표완료/오늘) 구현 & 푸터 중국어 다듬기] (+39, -0)
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

---

## 🚀 [v178 Specification] 글로벌 다국어(ko/en/ja/zh) 전면 현지화 및 경제 캘린더 동적 D-Day 구현

### 1. 현황 및 개선 필요 사항
1. **[COPY-41 · P2] 글로벌 전용 경로(/en, /ja, /zh) 한글 잔존 해결**:
   - `CalculatorSaveAction` 모달 팝업 및 버튼 텍스트가 한국어로 고정되어 있어 글로벌 유저 진입 시 몰입도 저하.
   - `ViralShareCardDialog`의 타이틀, 설명, 탭, 버튼 텍스트 및 토스트 알림이 한국어로 고정.
   - `[locale]/tools/compound-interest-calculator`의 카드 이미지 생성 버튼 및 요약 지표에 ja/zh 분기 누락.
2. **[COPY-37 · P2] 경제 캘린더 D-Day 고정 표시 결함**:
   - `global-macro-pulse-ticker.tsx`의 FALLBACK_PULSE에 `dDay: 1`, `dDay: 3`이 고정되어 있어 날짜가 지나도 계속 D-1 등으로 표시되는 모순.
   - 현재 시각과 `scheduledDate`를 비교하여 `발표완료`, `D-Day 오늘`, `D-N`으로 실시간 동적 계산 필요.
3. **[COPY-30 · P3] 중국어 하단 메뉴 표현 개선**:
   - 푸터의 연봉 실수령액 계산기 중국어 번역을 직역(`年薪实到手计算器`)에서 표준 표현(`年薪税后收入计算器`)으로 개선.

### 2. 세부 개발 명세
1. **계산기 저장 액션 전역 다국어 현지화 (`calculator-save-action.tsx`)**:
   - `usePathname()`으로 `/en`, `/ja`, `/zh`, `/ko` 자동 감지.
   - 4개 언어 사전(`I18N`) 구축 및 버튼 라벨, 보관 뱃지, 모달 제목/설명/CTA/닫기 텍스트 100% 현지화.
2. **바이럴 공유 카드 모달 다국어 현지화 (`viral-share-card-dialog.tsx`)**:
   - 4개 국어 사전(`DIALOG_I18N`) 구축 및 모달 제목, 설명, 1:1/16:9 탭, 복사/다운로드/공유 버튼 및 토스트 알림 현지화.
3. **글로벌 복리 계산기 ja/zh 라벨 분기 (`compound-calculator-client.tsx`)**:
   - 카드 이미지 생성 버튼 및 요약 지표(`Future Value`/`予想資産`/`预期资产`) 4개 국어 매핑 완료.
4. **경제 캘린더 실시간 동적 D-Day 판정 엔진 (`global-macro-pulse-ticker.tsx`)**:
   - 이벤트 날짜와 현재 날짜 차이(`diffDays`)를 실시간 계산하여 `발표완료`(지난 일정 회색 뱃지), `D-Day 오늘`(펄스 뱃지), `D-N`으로 동적 표시.
5. **푸터 중국어 레이블 다듬기 (`site-footer.tsx`)**:
   - `年薪税后收入计算器`로 정돈.

### 3. 검증 계획
1. 로컬 TypeScript 정적 타입 검증 (`tsc --noEmit`) 0 Errors (통과 완료)
2. Git 커밋 및 origin/main 푸시
3. 원격 운영 서버(`prod-v564`) 무중단 승격 빌드 및 배포
4. 실제 다국어 URL(`/en`, `/ja`, `/zh`) 접속 및 렌더링 검증

---

## 🚀 [v179 Specification] 은행 대출 빈 상태 처리, 텔레메트리 지니계수/점유율 용어 일치, 온보딩 지원금 정책 통일 사양

### 1. 현황 및 개선 필요 사항 (QA 잔여 항목)
1. **[COPY-14 · P2] 은행 리스크 대시보드 대출 0건 시 빈 상태 미처리**:
   - `bank-risk-dashboard.tsx`: 활성 대출이 0건일 때도 '대출 리스크 정상'으로 표시되어 실제 대출이 없어 평가 대상이 없는 것인지 우량 대출만 존재하는지 구분이 모호함.
   - `COPY-13 · P2`: 신용등급별 대출 잔액 목록에서 등급 번호(1등급~5등급)가 고정 번호로 어색하게 노출됨.
2. **[COPY-10 · P2] 관리자 텔레메트리 지표 테이블 용어 불일치**:
   - `admin-telemetry-metrics-table.tsx`: 상위 10% 순자산 항목의 행 라벨이 '지니 분배율'로 표기되어 지니계수(Gini Index)와 순자산 점유율(Net Asset Share)의 개념적 혼동을 유발함.
3. **[COPY-33 / COPY-18 · P2] 유저 락인 위젯 온보딩 지원금 불일치 및 과장 표현 제거**:
   - `user-conversion-lockin-widget.tsx`: 가입 혜택이 플랫폼 공식 기준(10,000 WLD + 복권 1장)과 다르게 5,000 WLD로 구버전 안내되거나, '3초 만에'/'1초 만에' 과장 표현이 잔존함.

### 2. 세부 개발 명세
1. **은행 리스크 대시보드 빈 상태 및 등급 라벨 개선 (`bank-risk-dashboard.tsx`)**:
   - `totalLoans === 0`일 때: `현재 활성 대출 잔액이 0건으로 리스크 평가 대상이 없습니다` 전용 빈 상태 안내 분기 추가.
   - 등급 라벨에서 불필요한 번호 접두사를 제거하고 등급명 중심(`우량 등급`, `일반 등급`, `주의 등급` 등)으로 시각적 가독성 개선.
2. **텔레메트리 지표 용어 일관성 확보 (`admin-telemetry-metrics-table.tsx`)**:
   - '지니 분배율' 행 라벨을 '상위 10% 순자산 점유율'로 정확히 명시하고 단위(%) 및 툴팁 설명 동기화.
3. **신규 가입 혜택 플랫폼 공식 정책 일관화 (`user-conversion-lockin-widget.tsx`)**:
   - 신규 가입 지원금을 '10,000 WLD + 1등 1,000만 WLD 복권 1장'으로 플랫폼 전역 통일.
   - '3초 만에', '1초 만에' 등 과장 표현을 정갈한 안내 문구로 쇄신.

### 3. 검증 계획
1. 로컬 TypeScript 정적 타입 검증 (`tsc --noEmit`) 0 Errors (확인 완료)
2. Git 커밋 및 origin/main 푸시
3. 원격 운영 서버(`prod-v565`) 무중단 승격 빌드 및 배포
4. 실제 프로덕션 `/admin/bank`, `/admin/users` 화면 HTTP 200 실측 검증

---

## 🚀 [v180 Specification] 가상 주식 10종목 및 가이드 5종 IndexNow 핑 전송 & 검색 봇 크롤링 실측 사양

### 1. 현황 및 개선 필요 사항
1. **신규 가상 주식 및 가이드 검색 로봇 즉시 발견 촉진**:
   - 가상 주식 10개 종목(`CHIMU314`, `CHIPS`, `DUCK`, `MYUY`, `SPACE`, `WDB`, `WDG`, `WDM`, `WDT`, `WFIN`)과 핵심 가이드 5종(`stock-trading`, `virtual-banking`, `career-mastery`, `glossary`, `dopamine-system`)을 검색엔진에 즉시 알려 빠른 인덱싱 유도 필요.
2. **크롤링 봇 유입 실측 분석**:
   - 내부 링크 보강 이후 Googlebot, Yeti, Bingbot 등의 실제 수집 활동 현황 및 페이지 방문 통계 검증.

### 2. 세부 실행 명세
1. **IndexNow 15개 URL 배치 핑 전송 (`https://api.indexnow.org/IndexNow`)**:
   - 10대 가상 주식 종목 상세 URL + 5대 핵심 가이드 URL 일괄 전송.
   - HTTP 200 OK 수신 완료.
2. **Nginx 액세스 로그 기반 봇 수집 통계 실측**:
   - Googlebot: 96건
   - Naver Yeti: 57건
   - Bingbot: 19건
   - YandexBot: 11건
   - Applebot: 7건
   - Baiduspider: 1건
   - 일일 총 191건 수집 확인 완료.

### 3. 검증 결과
1. IndexNow API HTTP 200 수신 완료 (`x-msedge-ref: Ref A: 1A153D991D6D4E128D156B702B1EE43C`)
2. Naver Yeti의 `/tools/stock-calculator/lly-minus-20` 실시간 JS 번들 풀 렌더링 수집 확인
3. Googlebot의 모바일/데스크톱 크롤러 활동 정상 확인

---

## 🚀 [v181 Specification] QA 보고서 잔여 결함 전수 쇄신 및 실측 핑/정제 엔진 구축 사양

### 1. 현황 및 개선 필요 사항 (QA 잔여 항목 전수 분석)
1. **[COPY-04~09 · P2] AI 뉴스 본문 한자 오타/영문 혼입/기업명 불일치**:
   - `ai-news.service.ts` 프롬프트 및 LLM 출력물에 한자(`지속적成장`), 기업명 오타(`월deck`), 영어 어색한 직역(`influence됩니다`, `likewise benefiting...`), 쉼표 공백 누락(`수수료 급증,배당`) 등이 잔존.
   - 프롬프트 가이드라인 강화 및 생성/렌더링 양방향 자동 텍스트 정제(`cleanseAiNewsText`) 엔진 구축 필요.
2. **[COPY-11 · P3] 관리자 텔레메트리 용어 개선**:
   - `admin-comprehensive-telemetry-matrix.tsx`: `Stickiness (활동 고착도)`를 사용자 중심 용어인 `사용자 참여도 (DAU/MAU 리텐션)`로 명확화.
3. **[COPY-19 · P1] 텔레메트리 펄스 가짜 난수(Math.random) 지연시간 제거**:
   - `telemetry-pulse.tsx`: 15~22ms의 `Math.random()` 가짜 지연시간 대신, `/app-api/v1/game-clock`을 실측 왕복하는 실제 RTT(ms) 레이턴시 측정 및 네트워크 상태 감지 엔진 장착.
4. **[COPY-35 · P2] 납세 영수증 분기 고정 하드코딩 및 블록체인 용어 혼선 해결**:
   - `citizen-tax-receipt-card.tsx`: 고정된 `2026-Q4` 대신 `new Date()` 기반 동적 분기(`currentQuarter`) 계산 및 '블록체인 원장' -> '국고 회계 감사 원장'으로 정확한 용어 변경.
5. **[COPY-31 · P3] 푸터 중국어 물타기 계산기 링크 표현 개선**:
   - `site-footer.tsx`: `股票补仓平摊计算器`를 `股票加仓成本计算器`로 개선.

### 2. 세부 개발 명세
1. **AI 뉴스 한자/영문 오타 후처리 자동 정제 엔진 구축 (`cleanseAiNewsText`)**:
   - 프론트엔드 `sentences.ts` 및 백엔드 `ai-news.service.ts`에 정제 정규식 탑재:
     - `월deck/월dek` -> `월덱`
     - `지속적成장` -> `지속적인 성장`
     - `가볍게성 향상` -> `경량화 및 성능 향상`
     - `influence됩니다` -> `영향을 받습니다`
     - `WDT와 WFIN이 likewise benefiting...` -> `WDT와 WFIN도 디지털 금융 인프라 확장의 수혜를 입을 것으로 분석됩니다.`
     - `수수료 급증,배당` -> `수수료 급증, 배당`
   - `ScenarioCard` 렌더링 및 편집 폼 기본값에 100% 자동 적용.
   - 백엔드 `SYSTEM_PROMPT` 7번 규칙에 한국어 표준어 가이드라인 및 10대 가상 상장사 공식 국문명 명시.
2. **실측 HTTP 왕복 지연시간(RTT) 핑 엔진 장착 (`telemetry-pulse.tsx`)**:
   - `performance.now()` 기반 `/app-api/v1/game-clock` 핑 측정으로 실제 ms 단위 지연시간 계산.
   - 뱃지 `3s 갱신` -> `10s 실측 핑`으로 투명한 관제 정보 표기.
3. **텔레메트리 매트릭스 지표 명확화 (`admin-comprehensive-telemetry-matrix.tsx`)**:
   - `Stickiness (활동 고착도)` -> `사용자 참여도 (DAU/MAU 리텐션)` 변경 및 단위 테스트 동기화.
4. **시민 거버넌스 투표 분기 동적화 (`citizen-tax-receipt-card.tsx`)**:
   - `currentQuarter` 실시간 산출 및 '국고 회계 감사 원장에 기록되었습니다'로 정정.
5. **푸터 중국어 정돈 (`site-footer.tsx`)**:
   - `简体中文 股票加仓成本计算器`로 정비.

### 3. 검증 계획
1. TypeScript 프론트엔드 정적 타입 검증 (`pnpm run typecheck`) 0 Errors (통과 완료)
2. TypeScript 백엔드 정적 타입 검증 (`pnpm run typecheck`) 0 Errors (통과 완료)
3. Git 커밋 및 origin/main 푸시
4. 원격 운영 서버(`prod-v566`) 무중단 승격 빌드 및 배포
5. 실제 프로덕션 `/admin/market/ai-news`, `/admin/analytics`, `/wallet` 화면 HTTP 200 실측 검증
