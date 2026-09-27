# 📚 월덕 머니버스(Woldeok Moneyverse) 공식 마스터 문서 인덱스

[English canonical](INDEX.md) | **한국어**

> **문서 거버넌스**: [DOCUMENTATION_POLICY.ko.md](DOCUMENTATION_POLICY.ko.md)  
> **공식 구현 권위 릴리스**: **v2026.09.27.473** (최신 main 기준 동기화 완료)  
> **상태**: **AUTHORITY_SYNCHRONIZED (권위 기획·런타임 100% 일치)**

---

## 🚀 10대 도메인별 마스터 문서 맵 (Master Directory)

### 01. 📱 마스터 스펙 & 유저 가이드
1. **[통합 앱 명세서 및 상세 유저 가이드](APP_SPEC_AND_USER_GUIDE.ko.md)**: 3대 금융 계산기, 30대 프리셋, pSEO 2만+ 엔진, 바이럴 진단서, 출석 룰렛, 주가 예측 배팅 전 도메인 엔드투엔드 가이드
2. **[현재 런타임 베이스라인](CURRENT_RUNTIME_BASELINE.ko.md)**: Debian 13, PostgreSQL 16, NestJS, Next.js 16 Turbopack 인프라 환경
3. **[문서 거버넌스 정책](DOCUMENTATION_POLICY.ko.md)**: Single Source of Truth(SSOT), 버전 관리 및 보존 규칙
4. **[문서 카탈로그 원장](DOCUMENT_CATALOG.ko.md)**: 전체 문서 인벤토리 및 최신성 검증표

### 02. 🎨 2026 차세대 디자인 시스템 & UI/UX 가이드
1. **[2026 차세대 핀테크 디자인 시스템 공식 지침서](DESIGN_SYSTEM_GUIDELINES.ko.md)**: Linear/Stripe/Apple 20만+ 래퍼런스 분석 기반 표면 Inset Border, 비대칭 벤토 그리드 2.0, Geist Mono Tabular 규격
2. **[2026 반응형 디자인 기준 공식 지침서](RESPONSIVE_DESIGN_GUIDELINES.ko.md)**: 320px~1920px 5대 뷰포트 매트릭스, 횡스크롤 0건(Zero Overflow), 44px 터치 타깃 보장 지침서
3. **[UI/UX 프론트엔드 크래프트맨십 원칙](planning/PRODUCT_DESIGN_SPEC.ko.md)**: 320px~1920px 무결점 반응형 레이아웃 및 44px 터치 타깃 가이드

### 03. 🌐 트래픽 성장 & 프로그래매틱 SEO (pSEO) 엔진
1. **[pSEO 20,000+ 엔진 및 바이럴 그로스 아키텍처](planning/PRODUCT_GROWTH_PLAN.ko.md)**: 2,000+ 국내/해외 종목 온디맨드 ISR, 카카오톡 1초 진단서 공유, 친구 초대(리퍼럴) 양방향 보상 규격
2. **[단일 진실 공급원 라우트 레지스트리](../frontend/src/config/routes.config.ts)**: 500+개 공개 라우트 및 사이트맵 색인 매트릭스

### 04. 📈 가상 주식 거래소 & 시장 역학
1. **[주식 포트폴리오 & 실시간 호가창 사양서](2026-09-22-stocks-portfolio-and-trade-presets.ko.md)**: 10-Depth 오더북, 웹소켓 틱 플래시 펄스, 시장 감성 게이지
2. **[주식 거래정지 매수원가 자동정산 거버넌스](2026-09-22-stocks-halt-cost-basis-settlement-visibility-v2026.09.22.357.ko.md)**: 100% 매수원가 환급 원장 보증

### 05. 🏦 가상 금융 & 은행 & 국채
1. **[가상 복리 예적금 및 세이빙 포켓](features/README.ko.md)**: 월복리/일복리 계산 엔진 및 긴급 출금 금고
2. **[가상 국채 만기 시뮬레이터](features/README.ko.md)**: 기간별 확정 이율 및 인플레이션 헤지 상품

### 06. 💼 직업 & 사업체 & 경제 거버넌스
1. **[직업 숙련도 & 일일 파밍 루틴 사양서](planning/JOBS_PROFESSION_MASTERY_SPEC.ko.md)**: 5대 직업, 에너지 효율, 주말 피버 버프
2. **[통화 유통속도 & 인플레이션 자동 정책](planning/ECONOMY_MONETARY_VELOCITY_SPEC.ko.md)**: AI Council 교차 심의 및 M2 통화량 제어

### 07. 🛡️ 안전 & 법령 준수 & 아동 보호
1. **[미성년자 안전 & TAKE IT DOWN 긴급 삭제](planning/SECURITY_ASSURANCE_MASTER_PLAN.ko.md)**: 24시간 비회원 긴급 삭제 접수 큐 및 14세 미만 보호
2. **[한국 금융 법령 준수 아키텍처](worklog/2026-09-26-kr-legal-compliance-v443.md)**: 사행성 배제 및 가상 머니 시뮬레이터 규정 준수

### 08. 🏛️ 관리자 통제 & 불변 감사 추적
1. **[관리자 통제 타워 & 정책 버전 관리](2026-09-22-admin-policy-version-management-and-release-ledger-v2026.09.22.352.ko.md)**: 300초 세션 로테이션 및 Step-Up 2FA
2. **[1:1 비공개 쪽지 신고 & 증거 보관 거버넌스](2026-09-22-admin-private-chat-moderation-queue-and-evidence-governance-v2026.09.22.354.ko.md)**: 모더레이션 큐

### 09. 🔌 API 카탈로그 & OpenAPI 계약
1. **[REST API 마스터 카탈로그](API_CATALOG_MASTER.ko.md)**: 14대 도메인 300+개 공식 API 엔드포인트
2. **[모바일 API 통합 명세서](mobile-api-complete-spec.ko.md)**: iOS/Android 앱 연동을 위한 계약

### 10. 📜 릴리스 로그 & 공식 작업 일지
1. **[공식 릴리스 변경 로그](UPDATE_LOG.ko.md)**: v469 ~ v473 전 릴리스 변경 이력
2. **[작업 일지 디렉터리](worklog/README.ko.md)**: 일자별 기술 의사결정 및 배포 원장
