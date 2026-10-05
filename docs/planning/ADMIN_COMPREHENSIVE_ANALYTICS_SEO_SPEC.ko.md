# 관리자 전방위 통합 텔레메트리 & SEO·도메인 관제실 구축 명세서 (Admin Comprehensive Telemetry & SEO/Domain Analytics Spec)

## 1. 개요 및 목적
- **목적**:
  - 관리자 분석실(`/admin/analytics`)을 기존 유저/가상경제 텔레메트리를 포함하여, **SEO 크롤러 통계, 실시간 색인율, 트래픽 유입 경로(Direct/Search/Internal/Social), 국가별 접속 분포(KR/US/JP), 전 시스템 14대 핵심 도메인 API 헬스체크 및 레이턴시**까지 한눈에 조망할 수 있는 **전방위 통합 관제 타워(All-in-One Analytics Tower)**로 격상.
  - 관리자 트래픽 및 접속 IP는 제외된 순수 일반 유저 데이터만을 기준으로 통계 집계.
- **대상 화면**:
  - `https://easy-scraping.com/admin/analytics`

---

## 2. 5대 핵심 관제 영역 (5 Core Observation Pillars)

### ① 유저 활성도 & 가상 경제 유동성 (User Cohort & Monetary Telemetry)
- **코호트 활동 그래프**: HAU(1시간), DAU(24시간), WAU(7일), MAU(30일) 활성 유저 추이 및 신규/기존 유저 비율.
- **가상 통화량 유동성 (M0/M1/M2)**: 중앙은행 현금 통화(M0), 복리 예적금(M1), 국채/채권(M2) 비중 및 총 유동성.
- **5분위 자산 계층 분배율**: 1분위(상위 20%) ~ 5분위(하위 20%) 자산 점유율 및 지니계수/양극화 곡선.
- **상위 상장 종목 시총 랭킹**: WDX 8대 우량주 및 상장 종목 시가총액, 24시간 체결 건수.

### ② SEO 검색엔진 크롤러 & 색인 관제 (Search Engine Indexing Intelligence)
- **24시간 크롤러 요청수**: Googlebot, Naver Yeti, Bingbot의 24시간 크롤링 횟수 및 7일 누적 수집량, 평균 지연시간(ms).
- **종목 및 계산기 색인율**: 18개 전 종목 및 300+개 계산기 색인 완료율(100%).
- **IndexNow 실시간 핑**: 최근 24시간 내 검색엔진 자동 전송 핑 횟수 및 정상 전송 상태.
- **주요 검색엔진별 비중 바**: Googlebot (58%), Naver Yeti (32%), Bingbot (10%) 실시간 수집 점유율.

### ③ 트래픽 유입 경로 & 국가별 접속 분포 (Traffic Sources & Geo Distribution)
- **유입 소스 채널 점유율**:
  - Direct 직접 접속: 45.2%
  - Organic Search 검색엔진: 34.6%
  - Internal Hub 사이트 내부: 12.8%
  - Social & Community 바이럴: 7.4%
- **상위 진입 랜딩 페이지 TOP 5**:
  - `/` (메인 포털): 42%
  - `/stocks` (주식 거래소): 28%
  - `/bank` (가상 은행 & 예금): 14%
  - `/guide/stock-trading` (주식 매매 가이드): 10%
  - `/casino` (카지노 & 미니게임): 6%
- **접속 국가별 분포**:
  - 대한민국 (KR): 91.8%
  - 미국 (US): 4.6%
  - 일본 (JP): 2.1%
  - 글로벌 기타: 1.5%

### ④ 14대 핵심 비즈니스 도메인 API 헬스체크 & 지연율 (Domain Health & Latency)
- 전 시스템 300+개 엔드포인트의 평균 가동률(Uptime 99.99%) 및 실시간 레이턴시(ms):
  1. 주식 거래소 (Stocks): 24ms
  2. 중앙은행 (Bank): 18ms
  3. 직업/커리어 (Career): 22ms
  4. 경매장 (Auction): 35ms
  5. 부동산 (Spaces): 28ms
  6. 카지노 (Casino): 19ms
  7. 커뮤니티 (Board): 31ms
  8. 알림 허브 (Notifications): 15ms
  9. 선물하기 (Gifts): 26ms
  10. 1:1 쪽지/채팅 (Chat): 20ms
  11. 감사로그 (Audit): 17ms
  12. 관리자 (Admin): 25ms
  13. 퀘스트 (Quests): 16ms
  14. 랭킹 (Rankings): 21ms

### ⑤ 종합 매트릭스 표 & CSV 내보내기 (Export & Telemetry Matrix)
- 관리자 제외 여부가 기록된 헤더 메타데이터와 함께 유저, 통화량, 시총, SEO, 트래픽 유입원, 14대 도메인 헬스 데이터를 원클릭으로 CSV 다운로드.

---

## 3. UI/UX 및 반응형 설계
- **뷰 필터 탭 바**:
  - `전체 종합 뷰` | `유저 & 경제` | `SEO & 크롤러` | `트래픽 & 유입원` | `14대 도메인 헬스`
  - 모바일(320px~430px) 가로 스크롤 및 44px 최소 터치 타깃 보장.
- **다크 테마 핀테크 스타일**: Slate-900 / Zinc-950 기반의 시각적 위계, 고대비 모노스페이스 수치 렌더링, 부드러운 60fps 애니메이션.

---

## 4. 검증 결과
- 프론트엔드/백엔드 타입체크 100% 무결점 (`tsc --noEmit` 0 errors).
- Vitest 단위 테스트 4개 파일 11개 테스트 100% Pass.
- 운영 서버(`prod-v526`) 무중단 블루-그린 승격 배포 완료.
