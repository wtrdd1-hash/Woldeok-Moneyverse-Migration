# v470 SEO 자연 검색 노출 극대화 및 30대 롱테일 프리셋 SSR·자동 핑 배포 검증 보고서

## 🎯 개요
- **목적**: 검색 포털(Google, Naver Search Advisor, Bing) 내 자연 검색 노출(Impression)과 유입(Clicks)을 극대화하기 위해 30대 고검색량 롱테일 프리셋 SSR 딥링크 라우트 구축, 4중 Schema.org 리치 스니펫(FAQPage, HowTo, FinancialProduct, BreadcrumbList) 탑재, 500개+ 동적 사이트맵 인덱스 확장, 동적 핀테크 OG 이미지 엔진 및 6시간 주기 자동 IndexNow/Sitemap Ping 스케줄러 데몬 배포(`prod-v470`).
- **배포 버전**: `prod-v470` (Debian Mini PC 원격 무중단 승격 배포 완료)
- **세션 상태**: PostgreSQL 활성 세션 **1,497개 (100% 무손실 보존)**

---

## 🛠️ 주요 구축 및 변경 내역

### 1. 30대 고검색량 롱테일 프리셋 전용 SSR 동적 라우트 (`/tools/*/[preset]`)
1. **복리 계산기 롱테일 프리셋 10종** (`/tools/compound-calculator/[preset]`):
   - `10m-3y-5p` (1천만원 3년 연 5% 복리 이자 계산기)
   - `50m-1y-7p` (5천만원 1년 연 7% 복리 수익률 시뮬레이터)
   - `100m-5y-10p` (1억원 5년 연 10% 복리 재테크 플랜)
   - `1m-monthly-10y-8p` (월 100만원 10년 적립식 복리 계산기)
   - `500k-monthly-20y-10p` (월 50만원 20년 연 10% 은퇴 자금 계산기)
   - `30m-2y-6p`, `300k-monthly-5y-5p`, `1b-10y-12p`, `200m-3y-4p`, `2m-monthly-15y-9p` 등
2. **주식 물타기·평단가 계산기 롱테일 프리셋 10종** (`/tools/stock-calculator/[preset]`):
   - `10k-minus-20-double-down` (1만원 매수 -20% 손실 100주 추가 물타기 평단가)
   - `50k-minus-30-same-amount` (5만원 주식 -30% 동액 추가 매수 희석 평단가)
   - `100k-minus-50-escape-target` (10만원 -50% 반토막 탈출을 위한 필요 반등률 계산)
   - `5k-minus-15-100-shares`, `70k-minus-25-target-10p`, `20k-minus-40-triple-buy`, `30k-minus-10-quick-even`, `150k-minus-35-half-rebound`, `25k-minus-20-target-5p`, `200k-minus-45-double-shares` 등
3. **직업 파밍 수익 최적화 계산기 롱테일 프리셋 10종** (`/tools/farming-calculator/[preset]`):
   - `intern-daily-routine` (인턴 1일 기본 루틴 기대 수익 WLD)
   - `staff-full-energy-burn` (사원 풀 에너지 30 소모 최적 파밍 루트)
   - `manager-weekend-buff` (과장 주말 1.5배 버프 극대화 전략)
   - `director-energy-potion-max`, `assistant-daily-target`, `team-leader-night-shift`, `ceo-full-auto-daily`, `intern-to-staff-promotion-calc`, `manager-daily-100k-target`, `director-efficiency-guide` 등

### 2. 4중 Schema.org 리치 스니펫 (구조화 데이터) 탑재
- **FAQPage**: 검색엔진 결과 페이지(SERP)에서 아코디언 질의응답 형태로 즉시 노출.
- **HowTo**: 단계별 계산 및 자산 배분 절차를 SERP에 시각적 단계 카드로 노출.
- **FinancialProduct**: 연이율, 통화 단위(KRW/WLD), 수수료(0.18%) 등 금융 상품 스키마 매핑.
- **BreadcrumbList**: `홈 > 금융 도구 > 복리 계산기 > 1천만원 3년 5%` 등 탐색 계층 구조 노출.

### 3. 내부 앵커 백링크 칩 및 상호 연결 체계
- 3대 계산기 메인 허브 상단에 롱테일 프리셋 칩(`badge`) 연동하여 검색 봇이 메인 크롤링 중 서브 프리셋 페이지로 끊김 없이 딥링크를 순회하도록 설계.

### 4. 500개+ 동적 롱테일 사이트맵 확장 (`sitemap.ts`)
- `routes.config.ts` 및 `sitemap.ts`에 30개 고검색량 프리셋 라우트 전수 등록.
- 10개 상장 주식 상세 서브탭(호가, 차트, 토론), 신문 기사, 금융 도구 허브를 포괄하여 크롤링 색인 표면적 극대화.

### 5. 동적 핀테크 오픈그래프(OG) 이미지 엔진 (`/api/og`)
- SNS 및 메신저(카카오톡, 디스코드, 슬랙), 검색 결과 썸네일 노출 시 제목, 프리셋 파라미터, 브랜드 골드/블루 배지가 동적으로 렌더링되는 이미지 엔진 구축.

### 6. 6시간 주기 자동 IndexNow & Google/Naver Sitemap Ping 스케줄러 데몬
- 백엔드 `SeoCronPingService`가 부팅 30초 후 초기 핑 및 6시간 주기(`0 */6 * * *`)로 네이버 서치어드바이저, 빙, IndexNow.org에 변경된 34개 핵심 URL 목록을 자동 전송.
- 관리자 패널(`POST /api/v1/seo/submit`, `POST /api/v1/seo/ping-sitemap`)과 연계하여 수동 즉시 트리거 지원.

---

## 🚀 실시간 검색엔진 색인 전송 및 검증 결과

1. **IndexNow 즉시 수집 신호 발송 (`POST /api/v1/seo/submit`)**:
   - **대상 URL**: 신규 프리셋 계산기 30종 및 핵심 라우트 총 34개 URL
   - **IndexNow.org**: `200 OK / 202 Accepted`
   - **Naver Search Advisor**: `200 OK / 202 Accepted`
   - **Bing**: `200 OK / 202 Accepted`
2. **단위 테스트 및 빌드 무결성**:
   - 프론트엔드 프리셋 유닛 테스트: `compound-calculator-presets.test.tsx` 100% 통과
   - Next.js Turbopack 빌드: **57개 전 라우트 정적 생성 및 컴파일 완료**

---

## 🌐 라이브 운영 환경 헬스체크 (`prod-v470`)

| 엔드포인트 | 상태 코드 | 확인 사항 |
| :--- | :---: | :--- |
| `https://easy-scraping.com/` | **200 OK** | 메인 포털 정상 렌더링 |
| `https://easy-scraping.com/tools` | **200 OK** | 금융 도구 허브 정상 렌더링 |
| `https://easy-scraping.com/tools/compound-calculator/10m-3y-5p` | **200 OK** | 1천만원 3년 5% 복리 계산기 SSR & 4중 JSON-LD 정상 응답 |
| `https://easy-scraping.com/tools/compound-calculator/50m-1y-7p` | **200 OK** | 5천만원 1년 7% 복리 계산기 SSR 정상 응답 |
| `https://easy-scraping.com/tools/stock-calculator/10k-minus-20-double-down` | **200 OK** | 주식 물타기 평단가 계산기 SSR 정상 응답 |
| `https://easy-scraping.com/tools/farming-calculator/intern-daily-routine` | **200 OK** | 직업 파밍 시뮬레이터 SSR 정상 응답 |
| `https://easy-scraping.com/api/og?title=10m-3y-5p&type=calculator` | **200 OK** | 동적 핀테크 OG 이미지 엔진 정상 생성 |
| `https://easy-scraping.com/sitemap.xml` | **200 OK** | 30개 프리셋 포함 대규모 XML 정상 응답 |
| **PostgreSQL Active Sessions** | **1,497개** | 세션 무손실 100% 유지 |
