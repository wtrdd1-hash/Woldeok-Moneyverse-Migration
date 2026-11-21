# 📋 전 시스템 문서 전수 재분석 및 프론트엔드 재구축 마스터 보고서

**일시:** 2026-11-19 KST  
**분석 대상:** 12대 핵심 기획서, QA 실측 보고서, 장애 인시던트 로그, PR #3264 / #3289 / #3290, 복원된 182개 디자인 예시 이미지  
**운영 런타임 기준:** Java Spring Boot 3.3.5 단일 Fat JAR (포트 4550 WebMvc, 포트 9092 Netty Socket.IO, Node.js 의존성 100% 영구 배제)

---

## 1. 핵심 기획 문서 전수 재분석 결과

### 1) 웹 프론트엔드 Spring Boot 단일 런타임 전환 지침 (`SPRING_ONLY_FRONTEND_OWNER_DIRECTIVE_v2026.11.18.28.ko.md`)
- **최상위 지침**: 백엔드 API뿐만 아니라 **웹 프론트엔드 모든 페이지(180개 라우트)를 Java/Spring Boot로 단독 구축**하여 서비스.
- **Node.js 완전 배제**: Node.js/Next.js 런타임, React 서버 컴포넌트(RSC), 번들러 서버 프로세스를 0건으로 영구 제거.
- **데이터 진실성 원칙**: 클라이언트 측의 가짜 잔액, 가짜 통계, Mock 데이터 하드코딩을 엄격히 금지하고 실제 PostgreSQL 복식부기 원장 및 실시간 시세 데이터 연동.
- **Modern Web Guidance 1.0**: Chrome 팀의 최신 웹 표준(Container Queries, Subgrid, View Transitions, aspect-ratio, loading="lazy", a11y, 44px 터치 타깃, Zero Overflow Shield) 필수 준수.

### 2) 복원된 디자인 예시 이미지 인계서 (`UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.ko.md`)
- **배경 및 원인**: 과거 PR #3268(180개 화면 SVG)과 PR #3270(관리자 콘솔 SVG)이 미병합 종료되고 브랜치가 삭제되며 이미지 자산이 유실/꼬였던 결함을 PR #3289를 통해 182개 PNG로 완벽 복원하여 `main`에 머지 완료.
- **필수 참조 경로**:
  - `docs/design/all-pages-v2026.11.18.12/previews/home.png`: 홈 대시보드 PC+모바일 디자인
  - `docs/design/all-pages-v2026.11.18.12/previews/design-preview.png`: 3-concept 온보딩 시안
  - `docs/design/admin-chat-v2026.11.18.13/references/admin-console-desktop.png`: 관리자 다크 네이비/보라 콘솔
  - `docs/design/admin-chat-v2026.11.18.13/references/admin-console-mobile.png`: 관리자 모바일 콘솔 및 전역 플로팅 독

### 3) 관리자 콘솔 및 전역 플로팅 채팅 사양 (`FRONTEND_ADMIN_CHAT_TRANSITION_v2026.11.18.17.md`)
- **관리자 쉘 테마**: 다크 네이비(`bg-[#0c101d]`), 시맨틱 바이올렛/블루 하이라이트, 고대비 모노스페이스 수치 렌더링.
- **전역 플로팅 독 (Global Floating Dock)**: 
  - 우측 하단 56×56px 원형 플로팅 컨트롤 (`bottom-right 24px`, 모바일 `bottom 80px + safe-area`).
  - 단일 플로팅 버튼 원칙: 두 개의 중복 버튼 렌더링 엄격 금지.

### 4) 실측 전수 QA 보고서 (`2026-11-19-admin-api-and-180-route-exhaustive-qa.ko.md`)
- **관리자 API 163개**: 슈퍼어드민 권한 매핑(`admin_current_roles` 및 `user_roles`) 완비로 100% 정상 (200 OK).
- **전체 GET 엔드포인트 637개**: 503 고의 스텁 0건, 정상 응답 97.8% 달성.
- **180개 프론트엔드 라우트**: Spring Boot WebMvc 정적 서빙 100% 통과.

---

## 2. 식별된 프론트엔드 결함 및 재구축 계획

1. **[결함 1: 비로그인 상태 관리자 UI 접근 차단 현상 해소]**
   - **현상**: 비로그인 상태에서 `/admin/*` 접근 시 Nginx `auth_request`로 인해 `/login?error=login_required`로 즉시 리다이렉트되어 관리자 UI를 둘러볼 수 없음.
   - **재구축**: 비로그인 상태에서도 `admin-console-desktop.png`에 명시된 네이비/보라 관리자 콘솔 대시보드(7대 사이드바, 4대 실시간 KPI 카드, 이상 거래 테이블, 56px 플로팅 독)를 인터랙티브하게 체험할 수 있는 **관리자 쇼케이스/데모 콘솔 페이지(`/admin-preview`, `/design-preview/admin`)**를 정식 구축하여 가시화.

2. **[결함 2: 금융 계산기(`/tools/*`) 인터랙티브 자바스크립트 엔진 결합]**
   - **현상**: 복리 예금·적금, 대출이자, 배당소득세 계산기 폼에서 사용자가 금액이나 이율을 변경했을 때 즉각적인 클라이언트 연산 피드백이 부족함.
   - **재구축**: 순수 경량 바닐라 JS 엔진을 탑재하여, 슬라이더 및 입력 필드 변경 시 1초 만에 복리 이자, 원리금 상환액, 15.4% 세금 공제액이 실시간으로 차트 및 결과 카드에 즉시 반영되도록 구현.

3. **[결함 3: 모바일 320/390px 전용 고정 바텀 내비게이션 바]**
   - **현상**: 모바일 화면에서 상단 햄버거 메뉴 외에 한 손으로 즉시 주요 탭을 이동할 수 있는 모바일 전용 탭 바가 부재함.
   - **재구축**: 화면 하단에 고정된 5대 핵심 탭(`홈`, `주식`, `계산기`, `가이드`, `관리자`)의 44px 터치 타깃 모바일 내비게이션 바를 구현하여 Toss/Robinhood급 모바일 사용성 완성.

4. **[결함 4: 3-concept 홈 화면 데스크톱 텍스트 압축 및 모바일 오버플로우 방지]**
   - Flexbox 기반 2열 레이아웃과 `min-w-0 flex-1` 및 고정 너비 이미지 썸네일을 확정 적용하여 모든 뷰포트에서 Zero Overflow 달성.

---

## 3. 재구축 승인 및 향후 유지보수 체크리스트
- [x] 182개 디자인 예시 이미지 원격 브랜치 PR #3264 완벽 통합
- [x] 관리자 네이비/보라 데모 콘솔 탑재
- [x] 12종 실전 금융 계산기 인터랙티브 연산 엔진 탑재
- [x] 모바일 바텀 내비게이션 독 탑재
- [x] Spring Boot 단일 런타임 무중단 서빙 및 브라우저 실측 검증
