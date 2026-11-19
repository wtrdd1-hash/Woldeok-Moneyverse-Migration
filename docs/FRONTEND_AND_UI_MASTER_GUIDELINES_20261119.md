# 프론트엔드 및 UI 공식 통합 마스터 지침서 (v2026.11.19 기준)

> **기준일자:** 2026-11-18 ~ 2026-11-19 KST  
> **적용범위:** Moneyverse 단일 런타임 전 웹 페이지 (`index.html`, `/stocks`, `/admin-preview`, `/wallet`, `/board` 등)  
> **상태:** 공식 승인 및 운영 환경(`https://easy-scraping.com`) 100% 라이브 적용 완료

---

## 🏛️ 1. 아키텍처 및 런타임 절대 원칙 (Single Spring Runtime)

1. **Spring Boot 3.3.5 단일 런타임 원칙**:
   - 외부 Node.js / Next.js SSR 서버를 완전히 배제하고, Java Spring Boot 3.3.5 단일 런타임(포트 4550)에서 프론트엔드 정적 서빙과 백엔드 REST API를 통합 제공한다.
   - 정적 리소스 서빙 경로: `file:/srv/moneyverse-data/frontend-static/` 및 `classpath:/static/` (Spring `SpaWebMvcConfig.java`의 `addResourceHandlers("/**")`를 통해 제어).
   - Nginx는 모든 웹 트래픽(`location /`)을 Spring Boot 포트 `127.0.0.1:4550`으로 직접 프록시한다.

2. **실데이터 전수 바인딩 불변식 (Full Real-Data Binding Invariant - 2026-11-19 확립)**:
   - **가짜 목업(Mock) 및 하드코딩된 정적 수치 원천 배제**: 모든 화면의 시세, 지표, 계정 상태는 백엔드 PostgreSQL DB 및 REST API로부터 실시간으로 호출하여 바인딩한다.
   - **10대 상장사 실시간 시세 테이블**: `/api/v1/stocks`를 비동기 호출하여 실제 종목명, 현재가(`current_price`), 등락률(`pct`), 상태(`halt_status`)를 동적 렌더링.
   - **10초 주기 무깜빡임 실시간 폴링(`setInterval`)**: 시장 변동이 브라우저 화면에 실시간으로 끊김 없이 갱신되도록 처리.

---

## 🎨 2. 디자인 시스템 및 색상 체계 (Dark Navy & Violet Semantic)

공식 승인 디자인(`docs/design/all-pages-v2026.11.18.12/previews/home.png`)에 정의된 다크 네이비 기반의 프리미엄 금융/게임 경제 테마를 적용한다.

| 토큰명 | 색상 코드 (HEX/RGBA) | 용도 및 의미 |
| :--- | :--- | :--- |
| `--mv-bg` | `#0C1020` | 전체 배경 베이스 (심해 다크 네이비) |
| `--mv-surface` | `#151D32` | 카드, 사이드바, 헤더 서피스 배경 |
| `--mv-surface-light` | `#1E2945` | 호버 카드, 폼 컨트롤, 입력창 배경 |
| `--mv-border` | `rgba(168, 188, 216, 0.1)` | 기본 컴포넌트 경계선 |
| `--mv-border-active` | `rgba(156, 131, 255, 0.35)` | 활성 탭, 포커스 상태 강조 경계선 |
| `--mv-primary` | `#9C83FF` | 메인 브랜드 바이올렛 (버튼, 아이콘, 강조) |
| `--mv-primary-glow` | `rgba(156, 131, 255, 0.35)` | 버튼 호버 및 액티브 시 발광 효과 |
| `--mv-blue` | `#64B7FF` | 보조 하이라이트 스카이블루 (링크, 지수 포인트) |
| `--mv-green` | `#4ADE80` | 시세 상승(+), ACTIVE 상태 배지, 가용성 지표 |
| `--mv-rose` | `#FB7185` | 시세 하락(-), 로그아웃, 위험/경고 액션 |
| `--mv-text` | `#FFFFFF` | 헤더, 제목, 주요 가격 텍스트 |
| `--mv-muted` | `#A8BCD8` | 보조 설명, 라벨, 테이블 헤더 텍스트 |

---

## 📐 3. 반응형 뷰포트 레이아웃 규격 (Multi-Viewport Invariants)

| 뷰포트 구간 | 화면 폭 (px) | 레이아웃 특징 및 불변 규칙 |
| :--- | :--- | :--- |
| **데스크톱** | `1024px ~ 1280px+` | • 240px 좌측 고정 네비게이션 사이드바 (8개 탭: 홈, 대시보드, 지갑, 주식, 퀘스트, 상점, 커뮤니티, 관리자)<br>• 벤토 그리드(Bento Grid 2.0): 실시간 SVG 차트 카드 + 빠른 작업(Quick Actions)<br>• 10대 상장사 실시간 호가 테이블 + 12종 금융 계산기 그리드<br>• 56px 원형 플로팅 관제탑 독 (`.global-support-dock`) 우측 하단 고정 |
| **모바일 표준** | `390px ~ 430px` (iPhone 14/15) | • 좌측 사이드바 자동 은닉 (`display: none`)<br>• 상단 헤더: 메뉴 토글 + 대시보드 타이틀 + EN/KO + 사용자 캡슐<br>• 5개 카드 세로 스택 레이아웃<br>• **5-탭 하단 내비게이션 독** 고정 (홈, 주식, 계산기, 가이드, 관리자) |
| **극소 모바일** | `320px` (iPhone SE 등) | • **가로 스크롤 0건 (Zero Horizontal Overflow)** 강제 (`html, body { overflow-x: hidden !important; }`)<br>• 410px 광폭 테이블은 246px 폭의 `.table-scroll-wrapper` 내부에서만 가로 스크롤되도록 완벽 격리<br>• 하단 5-탭 독 폭 305px 내에서 44px 터치 타깃 온전 유지 |

---

## 👆 4. 터치 타깃 및 접근성 규격 (WCAG 2.1 AA Compliance)

- **최소 터치 타깃 불변식**: 모든 클릭 가능한 버튼, 탭, 아이콘 링크는 최소 **`44px x 44px`** 이상이어야 한다.
- **모바일 하단 내비게이션 바텀 독 실측 통과 규격**:
  - 고정 위치: `position: fixed; bottom: 0; left: 0; width: 100%; height: 58px; z-index: 50;`
  - 5개 기본 탭(홈, 주식, 계산기, 가이드, 관리자) 각 터치 타깃: **`56px x 46px`** (WCAG 44px 기준 통과).
- **Google Material Symbols 벡터 글리프 렌더링**:
  - `font-display: block; font-feature-settings: 'liga';`
  - 텍스트 리게이처가 글자로 깨지지 않도록 `<span class="material-symbols-outlined icon">아이콘명</span>` 표준 규격 준수.

---

## 🔢 5. 금융 수치 및 타이포그래피 불변식 (High-Contrast Monospace)

1. **가독성 및 숫자 떨림 방지**:
   - 모든 통화(WLD), 호가, 거래량, 수익률, 지수 수치에는 반드시 **`font-mono tabular-nums tracking-tight`** 속성을 적용한다.
2. **천 단위 구분 기호 의무화**:
   - `Number(value).toLocaleString('ko-KR')`를 적용하여 100조 WLD, 140,941,858 WLD 등 명확한 시각적 구분을 제공한다.
3. **색상 시맨틱 규칙**:
   - 전일 대비 상승: `+` 기호와 함께 초록색 (`#4ADE80`, `text-green font-bold`).
   - 전일 대비 하락: `-` 기호와 함께 로즈레드 (`#FB7185`, `text-rose font-bold`).
   - 변동 없음: `0.00%` (`var(--mv-muted)`).

---

## 🔐 6. 실시간 인증 상태 동적 하이드레이션 규격 (Dynamic Session Hydration)

1. **헤더 액션 컨테이너 (`#auth-action-container`)**:
   - **미인증 (게스트)**:
     - 보라색 그라디언트 `[->] 로그인` CTA 버튼 (`/login` 연결).
     - 검색 엔진 로봇 및 초기 렌더링을 위해 서버 정적 마크업으로 기본 제공.
   - **인증 완료 (로그인 회원)**:
     - `fetch('/api/v1/auth/session', { credentials: 'same-origin' })` 호출로 세션 쿠키 검증.
     - 사용자 미니 프로필 캡슐(`.user-session-capsule`)로 동적 전환:
       - 아바타 아이콘 (`account_circle`)
       - 회원 닉네임 (`displayName`, XSS 방지 `escapeHtml` 필수)
       - 관리자일 경우 `ADMIN` 인셋 배지 점등
       - 프로필 캡슐 클릭 시 `/account`로 원클릭 이동
       - 고대비 마이크로 상호작용 `로그아웃` 버튼 (`POST /api/v1/auth/logout` 후 새로고침)
2. **사이드바 인증 섹션 (`#sidebar-auth-section`)**:
   - 로그인 시 회원 닉네임, 등급(`CITIZEN`/`ADMIN`), 보유 WLD 잔액, 원클릭 로그아웃 버튼을 사이드바 하단에 표시.

---

## 🛡️ 7. 관리자 관제탑 및 보안 인가 규칙 (Fail-Closed Enforcement)

1. **비인가자 자동 리다이렉트 (Fail-Closed)**:
   - 비인가자가 `/admin` 등 민감 관리자 경로에 접근할 경우 `/login?error=login_required`로 즉시 리다이렉트한다.
2. **56px 플로팅 관제탑 독 (`.global-support-dock`)**:
   - 화면 우측 하단에 단일 56px 플로팅 버튼으로 고정 배치 (`headset_mic` 아이콘).
   - 클릭 시 관리자 관제탑(`/admin-preview`)으로 즉각 전환.
3. **보안 헤더 강제**:
   - 관리자 및 API 경로에 `X-Robots-Tag: noindex, nofollow, no-store` 및 `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` 헤더를 Spring WebMvc 필터(`securityAndSeoHeaderFilter`)에서 전역 강제.

---

## 📋 8. 검증 체크리스트 (QA Verification Checklist)

- [x] Java Spring Boot 3.3.5 단일 프로세스(포트 4550)에서 100% 서빙되는가? (Node.js 프로세스 0개)
- [x] 모든 시세 테이블과 통계 수치가 백엔드 실제 REST API(`/api/v1/stocks`)와 동적으로 바인딩되었는가?
- [x] 10초 주기 실시간 폴링이 무깜빡임(Flicker-Free)으로 동작하는가?
- [x] 로그인 시 헤더의 우측 상단이 로그인 버튼에서 사용자 닉네임/ADMIN 배지/로그아웃 버튼으로 실시간 전환되는가?
- [x] 모바일 뷰포트(390px, 320px)에서 가로 스크롤(오버플로우)이 0px인가?
- [x] 모바일 하단 5-탭 내비게이션의 모든 터치 타깃이 44px 이상(`56x46px`)을 만족하는가?
- [x] 모든 금융 수치에 모노스페이스 폰트(`tabular-nums`)와 천 단위 콤마가 적용되었는가?
