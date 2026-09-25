# Woldeok Moneyverse 프로젝트 메모리 (PROJECT_MEMORY.md)

- **최종 갱신일:** 2026-09-25
- **관리 주체:** Woldeok Moneyverse Core Development & Operations
- **문서 상태:** 활성 (Active Memory)
- **현재 프로덕션 릴리스:** `v2026.09.25.447` (`prod-2c77d4e-v446` / SHA `583778ae`)
- **PostgreSQL 활성 세션 상태:** **1,227개 (100% 무손실 보존 실측 확인)**

---

## 0. ⚠️ [CRITICAL RULE] 미니PC 원격 제어 및 파일 I/O 절대 원칙 (MCP 최우선 강제)

1. **Windows PowerShell 로컬 SSH / SCP / 인코딩 접두사 명령어 실행 전면 금지**:
   - 로컬 PowerShell에서 `$OutputEncoding = [Console]::InputEncoding = ...` 또는 `ssh -p ...`, `scp -P ...`를 직접 실행하여 미니PC에 접속하거나 파일을 복사하는 행위를 **절대 금지**한다. (로컬 네트워크 환경 충돌, 한글 인코딩 에러, 세션 동결 원천 차단)
2. **미니PC의 모든 명령어 실행 및 파일 I/O는 `easy-scraping` MCP 도구만 필수 사용**:
   - **미니PC 쉘 명령 실행**: `call_mcp_tool` -> `ServerName: "easy-scraping"`, `ToolName: "system_exec_command"` (service 재시작, git, journalctl, npm 등)
   - **미니PC 파일 읽기**: `call_mcp_tool` -> `ServerName: "easy-scraping"`, `ToolName: "fs_read_file"`
   - **미니PC 파일 쓰기/배포**: `call_mcp_tool` -> `ServerName: "easy-scraping"`, `ToolName: "fs_write_file"`
   - **미니PC 디렉터리 탐색**: `call_mcp_tool` -> `ServerName: "easy-scraping"`, `ToolName: "fs_list_dir"`
   - **PostgreSQL 쿼리**: `call_mcp_tool` -> `ServerName: "easy-scraping"`, `ToolName: "db_query_direct"`
   - 모든 미니PC 관련 작업은 위 MCP 도구를 호출하여 빠르고 안정적으로 실행한다.

---

## 1. 프로젝트 개요 및 저장소 (Repositories)

| 역할 | 저장소 URL | 기술 스택 | 설명 |
| :--- | :--- | :--- | :--- |
| **웹서버 / 백엔드 / 마이그레이션** | [Woldeok-Moneyverse-Migration](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration) | Node.js, TypeScript, PostgreSQL (Prisma), Express/NestJS, Nginx | 핵심 비즈니스 로직, 경제/금융 엔진, API 게이트웨이, DB 마이그레이션 |
| **웹 / 프론트엔드 / 모바일 앱** | [woldeok-moneyverse-app](https://github.com/wtrdd1-hash/woldeok-moneyverse-app) | Next.js, React, TypeScript / Android Kotlin | 사용자 인터페이스, 웹 대시보드, 모바일 클라이언트 |

---

## 2. 개발 및 브랜치 워크플로우

1. **새로운 브랜치 필수 생성:**
   - 모든 코드 수정 및 기능 개발/버그 패치는 반드시 `main` 브랜치에서 새 브랜치를 분기하여 작업한다.
2. **테스트 서버 구축 및 백엔드 작동 확인:**
   - 코드 변경 후 반드시 격리된 테스트 서버(`https://test.easy-scraping.com`)에 먼저 배포하여 구동한다.
   - 필수 검증 게이트: 백엔드 `/health` HTTP 200 응답, DB 마이그레이션 정합성 검증, API Catalog.

---

## 3. 📜 최신 릴리스 내역 (v2026.09.25.447)

- **최종 갱신일시**: 2026-09-25 19:18:00 KST
- **프로덕션 릴리스 버전**: `v2026.09.25.447` (릴리스 경로: `/srv/moneyverse-data/releases/prod-2c77d4e-v446`)
- **Exact Git SHA**: `583778ae`
- **PostgreSQL 활성 사용자 세션**: **1,227개 (100% 무손실 보존 실측 확인)**
- **완료 작업 요약**:
  1. **개발자 포털(/developer) 및 API 센터 관리자 외 접근 전면 차단 (보안 강화)**:
     - `requireAdministrator()` 서버 사이드 세션 가드 강제 적용 (비로그인/일반 유저 307 리다이렉트 차단).
     - 검색엔진 크롤링 차단 `robots: { index: false, follow: false }` 메타데이터 적용.
     - 일반 공개 메뉴(`PUBLIC_NAV`, `COMMUNITY_DROPDOWN`, `HEADER_PUBLIC`, `HEADER_MEMBER`)에서 `/developer` 링크 전면 제거 및 관리자 전용 '운영' 메뉴(`HEADER_ADMIN`, `ADMIN_NAV`)로 완전 격리.
  2. **단위 테스트 & 프로덕션 무중단 배포**:
     - `developer-access.test.ts` (3/3 passed), `navigation.test.ts` (4/4 passed), 전체 787개 테스트 100% PASS.
     - 비인가 접근 차단(HTTP 307 Redirect) 및 1,227개 세션 무손실 상태로 프로덕션 승격 완료.

---

### 이전 릴리스 (v2026.09.24.409)

- **최종 갱신일시**: 2026-09-24 09:20:00 KST
- **프로덕션 릴리스 버전**: `v2026.09.24.409` (릴리스 경로: `/srv/moneyverse-data/releases/prod-v408`)
- **Exact Git SHA**: `ad25aafd`
- **PostgreSQL 활성 사용자 세션**: **1,211개 (100% 무손실 보존 실측 확인)**
- **완료 작업 요약**:
  1. **관리자 페이지 전수 접속 & UI 디자인 전면 재검토 및 고도화**:
     - 상점 관리(`AdminShopView`), 은행 관리(`AdminBankPage`, `BankRiskDashboard`), 국고 관리(`TreasuryView`), 가상 시장(`AdminMarketPage`)에 모바일 전용 반응형 카드 스택(`md:hidden`) 탑재.
     - 금융 수치 및 잔고/금액/이자율에 `font-mono tracking-tight` 고대비 타이포그래피 전수 적용.
     - 관리자 서브내비게이션(`AdminSubNav`) 활성 탭 자동 스크롤(Auto-scroll into view) 및 44px 터치 타겟 규격화.
  2. **단위 테스트 및 프로덕션 검증**:
     - `admin-mobile-responsive.test.ts` (7/7 passed), 프론트엔드 782개 테스트 100% PASS.
     - 22개 관리자 엔드포인트 전수 HTTP 200 정상 확인.
     - 무중단 블루-그린 배포(`prod-v408`) 완료.

---

### 이전 릴리스 (v2026.09.23.408)

- **최종 갱신일시**: 2026-09-23 23:05:00 KST
- **프로덕션 릴리스 버전**: `v2026.09.23.408`
- **Exact Git SHA**: `e7de9249`
- **PostgreSQL 활성 사용자 세션**: **1,117개 (100% 무손실 보존 실측 확인)**
- **완료 작업 요약**:
  1. **GitHub Actions 릴리스 경로 분류기(`classify-release.mjs`) 완비**:
     - 루트 마크다운 문서(`PROJECT_MEMORY.md`, `walkthrough.md`, `*.md`), 프로모션/스테이징 스크립트(`promote_*.sh`, `stage_*.sh`), scripts 도구 전수 매핑.
     - Windows 및 Linux 크로스 플랫폼 진입점 URL 비교 정규화.
     - 단위 테스트 13개 100% 통과 및 2,872개 전체 추적 파일 대상 미분류(UNKNOWN) 0건 달성.
  2. **GitHub Actions 파이프라인 전수 통과**:
     - `Build Test Candidate` (`35870973092`), `CI` (`35870971757`), `Cleanup Merged Branches` (`35870971741`), `Build Production Release` (`35871052488`) 모두 SUCCESS (All Green).
  3. **원격 호스트 동기화 및 만료 브랜치 70+개 전수 프루닝**:
     - `git fetch --prune origin`으로 이미 `main`에 병합 완료된 70여 개 원격 브랜치 완벽 정리 (잔여 병합 브랜치 0건).

---

### 이전 릴리스 (v2026.09.23.407)

- **최종 갱신일시**: 2026-09-23 22:56:00 KST
- **프로덕션 릴리스 버전**: `v2026.09.23.407`
- **Exact Git SHA**: `fa7a18cf`
- **PostgreSQL 활성 사용자 세션**: **1,071개 (100% 무손실 보존 실측 확인)**
- **완료 작업 요약**:
  1. **주식 캔들 차트 기술적 보조지표 고도화**:
     - 5주기 이동평균선(MA5), 20주기 이동평균선(MA20), 볼린저 밴드(상/하한선 ±2σ, fill polygon) 렌더링 엔진 탑재.
     - 사용자 인터랙티브 오버레이 토글 툴바(MA5, MA20, 볼린저 밴드) 제공.
     - 19개 단위 테스트 100% PASS.
  2. **프론트엔드 최적화 빌드 & 프로덕션 배포**:
     - Next.js 16.3.4 Turbopack 프로덕션 빌드 완료.
     - 무중단 블루-그린 배포 및 1,071개 활성 세션 보존 확인 완료.

---

### 이전 릴리스 (v2026.09.23.406)

- **최종 갱신일시**: 2026-09-23 22:49:00 KST
- **프로덕션 릴리스 버전**: `v2026.09.23.406` (릴리스 경로: `/srv/moneyverse-data/releases/prod-v406`)
- **Exact Git SHA**: `b7c1323d`
- **PostgreSQL 활성 사용자 세션**: **1,071개 (100% 무손실 보존 실측 확인)**
- **완료 작업 요약**:
  1. **깃허브 문서 전면 재검토 및 6대 도메인 결함 보완 명세화 (`v2026.09.23.406`)**:
     - 학술/핀테크 고신뢰 레퍼런스 기반 LOB 시퀀스 갭 복구, KRX 7단계 틱 사이즈, 2% 거래세 & 자동 아이템 소각(Item Sink), 1:1 채팅 UUID 멱등키 & 커서 페이지네이션, Aave Kink 이자율 & 20% 지급준비금, 7일 듀얼 키 롤링, 44px 모바일 터치 타겟 계약 공식 채택.
     - `INTEGRATED_PLANNING_MASTER.ko.md`, `PROJECT_PLAN.ko.md`, `docs/INDEX.ko.md`, `deltas/v2026.09.23.406.ko.md` 전수 동기화.
  2. **프론트엔드 기능 통합 및 빌드/타입스크립트 정합성 완비**:
     - 은행 목적별 저축 포켓(`saving-pockets-card.tsx`), 마켓플레이스 제작 액션(`crafting-actions.ts`), 시즌 보상 수령 배너(`season-reward-claim-banner.tsx`) 통합.
     - Next.js 16.3.4 Turbopack 프로덕션 빌드 100+ 라우트 100% 성공.
  3. **전체 단위 테스트 1,790개 100% PASS 및 무중단 블루-그린 승격**:
     - `@moneyverse/contract` (23 tests), `@moneyverse/database` (7 tests), `@moneyverse/backend` (996 tests), `@moneyverse/frontend` (764 tests) 전수 통과.
     - 1,071개 활성 세션 100% 무손실 보존 상태로 프로덕션(`v406`) 무중단 승격 완료.
