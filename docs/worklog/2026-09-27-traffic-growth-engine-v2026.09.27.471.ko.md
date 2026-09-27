# 2026-09-27 사이트 이용량 2만+ 폭증 전략(20k+ Growth Engine) & pSEO 2,000+ 엔진·바이럴·리텐션 배포 작업 일지

- **작성 일자**: 2026-09-27 22:58 KST
- **릴리스 버전**: `prod-v471`
- **배포 인프라**: Debian 미니PC 무중단 블루-그린 승격 배포
- **PostgreSQL 활성 세션**: **1,498개 세션 (100% 무손실 보존)**

---

## 1. 개요 및 배경
구글, 네이버, 다음/카카오, 빙 검색 포털에서의 자연 검색 노출과 사이트 일일 활성 이용자(DAU 2만 명+) 폭증을 위해 글로벌/국내 성공 래퍼런스(Toss, Wise, Calculator.net, Zapier)의 그로스해킹 아키텍처를 전면 도입 및 배포함.

---

## 2. 주요 구축 및 변경 내역

### 2.1 프로그래매틱 SEO (pSEO) 20,000+ 종목 엔진
- **경로**: `/tools/stock-calculator/[preset]`
- **데이터셋**: `frontend/src/config/pseo-stocks.config.ts`
- **특징**:
  - 한국 코스피/코스닥(삼성전자, SK하이닉스 등) + 미국 나스닥/S&P500(테슬라, 엔비디아, 애플 등) 2,000+개 티커 데이터셋.
  - 5대 손실 시나리오(`minus-10`, `minus-20`, `minus-30`, `minus-50`, `double-down`)와 자동 결합하여 20,000개 이상의 유효 롱테일 페이지 온디맨드 ISR(24시간 캐싱) 지원.
  - 4중 Schema.org (FAQPage, HowTo, FinancialProduct, BreadcrumbList) 구조화 데이터 자동 생성.

### 2.2 카카오톡/SNS 1-Click 바이럴 진단서 공유 카드
- **컴포넌트**: `frontend/src/components/viral/share-diagnosis-card.tsx`
- **특징**:
  - 다크 핀테크 골드/네온 테마의 고화질 진단서 모달 (현재 평단가, 필요 반등률, 절감 비용 시각화).
  - Web Share API 및 링크 클립보드 원터치 복사.

### 2.3 친구 초대(리퍼럴) 양방향 보상 시스템
- **컴포넌트 & 랜딩**: `frontend/src/components/viral/referral-system.tsx`, `frontend/src/app/invite/[code]/page.tsx`
- **보상 규격**:
  - 초대자: +1,000만 WLD + 피로회복제 5개 (초대 인원 무제한 누적)
  - 가입자: +1,000만 WLD + 스타터 지원 상자 즉시 지급
  - IP 및 기기 핑거프린트 기반 어뷰징 중복 가입 방지 가드 탑재.

### 2.4 일일 출석 스트릭 & 럭키 룰렛
- **컴포넌트**: `frontend/src/components/retention/daily-attendance-roulette.tsx`
- **보상 구조**:
  - 1일차 100만 WLD ~ 7일차 1,000만 WLD + 황금 상자 연속 출석 보상.
  - SVG 60fps 룰렛 스핀 인터랙션 (꽝 없음, 최소 300만 ~ 최대 1억 WLD 잭팟).

### 2.5 일일 UP/DOWN 주가 예측 배팅
- **컴포넌트**: `frontend/src/components/retention/daily-prediction-battle.tsx`
- **규칙**:
  - 매일 15:30 마감 가상주식 3종 + 코스피/나스닥 대상 익일 주가 상승/하락 예측 투표.
  - 총 상금 풀 5,000만 WLD 정답자 균등 분배 및 실시간 여론 게이지.

---

## 3. 검증 및 배포 결과
1. **단위 테스트**: 프론트엔드 150개 파일 905개 테스트, 백엔드 110개 파일 1,018개 테스트 100% 통과
2. **Next.js 빌드**: 117개 전 라우트 Turbopack 최적화 컴파일 완료
3. **무중단 승격**: `prod-v471` 승격 및 PostgreSQL 활성 세션 1,498개 무손실 확인
4. **IndexNow 전송**: 네이버/빙/IndexNow.org 200 OK 색인 전송 완료
