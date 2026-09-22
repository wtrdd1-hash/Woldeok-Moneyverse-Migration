# Woldeok Moneyverse 프로젝트 메모리 (PROJECT_MEMORY.md)

- **최종 갱신일:** 2026-09-22
- **관리 주체:** Woldeok Moneyverse Core Development & Operations
- **문서 상태:** 활성 (Active Memory)

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
   - 브랜치 네이밍 컨벤션:
     - 신규 기능: `feat/<기능명>-v<버전>` (예: `feat/chat-level-admin-v1.0.13`)
     - 버그 수정: `fix/<수정명>-v<버전>` (예: `fix/money-display-v1.0.12`)
     - 운영/배포: `ops/<작업명>-v<버전>`
2. **테스트 서버 구축 및 백엔드 작동 확인:**
   - 코드 변경 후 반드시 격리된 테스트 서버(`https://test.easy-scraping.com` 또는 로컬/카나리 테스트 인스턴스)에 먼저 배포하여 구동한다.
   - 필수 검증 게이트:
     - 백엔드 `/health` HTTP 200 응답
     - DB 마이그레이션 정합성 및 무결성 검증
     - API Catalog (엔드포인트 동작 확인)
     - 로그인 세션 유지 및 인증 플로우 검증
3. **무중단 운영 승격 (Zero-Downtime Promotion):**
   - 테스트 서버에서 백엔드 및 전체 기능 동작이 완전 검증된 이후에만 운영(`https://easy-scraping.com`)으로 승격한다.
   - 승격 방식: Blue-Green / Canary 전환, Nginx graceful reload, Systemd 프로세스 교체.
   - 단 하나의 정상 운영 프로세스도 새 인스턴스의 헬스체크 통과 전에 임의 중단하지 않는다.
   - 기존 회원의 PostgreSQL 로그인 세션 및 쿠키 연속성을 100% 보존한다.

---

## 3. 업데이트 내역서 및 다국어 표준 (Documentation & Changelog)

### 언어 우선순위 정책
- **기본 언어 (Primary):** **영어 (English)**
- **2번째 언어 (Secondary):** **한국어 (Korean)**
- 모든 문서 및 변경 로그는 두 언어를 상호 동기화하여 완벽하게 유지한다.

### 내역서 분리 운영
1. **내부용 업데이트 내역서 (미니PC 및 로컬 작업로그):**
   - 버전별 파일 생성:
     - 영문 로그: `/home/debian/v<버전>-log-en.txt`
     - 한글 로그: `/home/debian/v<버전>-log-ko.txt`
     - 영문 계획: `/home/debian/v<버전>-plan-en.txt`
     - 한글 계획: `/home/debian/v<버전>-plan-ko.txt`
2. **깃허브용 업데이트 내역서 (Public & Repository):**
   - `docs/UPDATE_LOG.md` (영문 정본)
   - `docs/UPDATE_LOG.ko.md` (한국어 정본)
   - `docs/updates/` 디렉터리 내 세부 릴리즈 문서
3. **버전 부여 및 깃허브 커밋/PR 명시:**
   - 작업 순서별로 정밀 버전을 부여한다 (`vYYYY.MM.DD.NNN` 형식 준수, 예: `v2026.09.20.301`).
   - 내부 업데이트 내역서에 버전을 명시한다.
   - 깃허브 커밋 메시지, PR 제목, 릴리즈 태그에 `"업데이트 버전 vYYYY.MM.DD.NNN - <요약>"` 형식으로 명확히 기록한다.

---

## 4. 기획서 운영 원칙 (Living Draft Policy)

- **기획서 초안 원칙:**
  - 깃허브 및 리포지토리에 등록된 기획서(예: `implementation_plan.md`, `docs/planning/*`)는 **초안(Draft)**이다.
  - 고정 불변의 확정 문서가 아니며, 비즈니스 요구사항과 운영 상황에 따라 **언제든 수정 및 갱신될 수 있다.**
- **작업 전/작업 중간 검토 의무:**
  - 작업 시작 전 최신 기획서 내용을 반드시 재확인한다.
  - 구현 중간에도 설계 변경점이나 의문 사항이 발생하면 즉시 기획서를 대조하고 사용자 피드백을 수렴하여 업데이트한다.
- **문서 표준 유지:**
  - `docs/PROJECT-DOCUMENT-POLICY-KO.md` 문서 운영 정책을 철저히 준수한다.
  - 문서 전용 변경은 `main`에 직접 반영 가능하나, 코드/배포가 수반될 때는 정규 개발 워크플로우를 따른다.

---

## 5. 미니PC 원격 인프라 및 개발 환경

| 항목 | 세부 정보 |
| :--- | :--- |
| **호스트 주소** | `pve-direct.easy-scraping.com` |
| **SSH 포트** | `2222` |
| **접속 계정** | `debian` (일반 계정) / `root` (최고관리자) |
| **인증 비밀번호** | `Gasoo2647@` |
| **운영체제** | Debian GNU/Linux 13 (Trixie) amd64 |
| **데이터베이스** | PostgreSQL 17.11 (Docker Container `woldeok-moneyverse-dev-db-1`, Port 5433) |
| **핵심 서비스 (Systemd)** | - `moneyverse-backend.service` (API 서버)<br>- `moneyverse-frontend.service` (Next.js 웹)<br>- `moneyverse-mcp.service` (MCP Gateway)<br>- `moneyverse-discord-bot.service` (디스코드 봇)<br>- `nginx.service` (리버스 프록시 / SSL)<br>- `actions.runner.*` (GitHub Actions Self-hosted Runner) |
| **도메인** | - 운영: `https://easy-scraping.com`<br>- 테스트: `https://test.easy-scraping.com` |

---

## 6. MCP (Model Context Protocol) 연동 정보

- **설정 파일 위치:** `C:\Users\sds\.gemini\config\mcp_config.json`
- **MCP 게이트웨이 루트:** `https://mcp.easy-scraping.com`
- **SSE Transport 엔드포인트:** `https://mcp.easy-scraping.com/sse` (Antigravity 연동 완료)
- **Gemini Tools 전용 루트:** `https://gemini.easy-scraping.com`
- **Gemini 13종 함수 선언 스키마:** `https://gemini.easy-scraping.com/gemini-tools.json`
- **Gemini 함수 실행 엔드포인트:** `POST https://gemini.easy-scraping.com/api/gemini/call`
- **OpenAI Custom GPTs OpenAPI 스펙:** `https://gpt.easy-scraping.com/openapi.json`
- **제공 기능:** 시스템 상태 모니터링, Docker 제어, PostgreSQL 쿼리 실행, 파일 I/O, 경제/카지노 기능 스위치, 감사 로그 아카이빙

---

## 7. 🤖 AI 에이전트 다자간 동시 작업 및 충돌 방지 프로토콜 (Multi-Agent Co-working Protocol: Antigravity & Custom GPT)

본 프로젝트는 Antigravity와 OpenAI Custom GPT가 상호 협력하여 개발 및 운영을 수행합니다. 두 에이전트 간 코드 충돌, 커밋 덮어쓰기, 문서 파편화를 원천 차단하기 위해 아래 **5대 필수 협업 규격**을 강제 준수합니다.

### ① [작업 시작 전 (Pre-Flight)] 원격 저장소 및 문서 전수 점검
1. **GitHub 원격 최신화**: 모든 작업 착수 직전 반드시 `git fetch origin main` 및 `git status`를 실행하여 GPT 또는 다른 작업자의 신규 커밋 여부를 확인한다.
2. **원격 변경점 rebase 동기화**: 신규 커밋이 감지되면 즉시 `git pull --rebase origin main`을 실행하여 로컬 브랜치를 최신 상태로 일체화한 후 작업을 시작한다.
3. **통합 문서 전수 확인**: 작업 시작 전 `PROJECT_MEMORY.md`, `implementation_plan.md`, `docs/UPDATE_LOG.ko.md`, `AGENTS.md`를 열람하여 직전 에이전트가 완료한 작업 범위, 현재 아키텍처, 릴리스 버전을 정확히 인지한다.

### ② [작업 진행 중 (Mid-Flight)] 실시간 원격 상태 및 잠금 확인
1. 다중 파일 수정이나 장기 구현 작업 도중에도 주기적으로 `git fetch origin main`을 확인하여 병행 작업과의 충돌 여부를 감지한다.
2. 기능별 모듈 단위로 작업을 분리하고, 다른 에이전트가 방금 수정한 파일에 대해 불필요한 포맷팅이나 임의 롤백을 절대 금지한다.

### ③ [작업 완료 후 (Post-Flight)] 통합 문서 동기화 및 원자적 푸시
1. **통합 문서 필수 기록**:
   - `PROJECT_MEMORY.md`: 본 문서의 '8. 현재 프로덕션 활성 배포 상태'를 갱신하여 최신 버전, Git SHA, 활성 세션 수, 완료 내역을 기록한다.
   - `docs/UPDATE_LOG.ko.md` & `docs/UPDATE_LOG.md`: 한국어 및 영어 변경 내역을 100% 동기화하여 작성한다.
   - `implementation_plan.md`: Zero-Deletion Invariant(`-0 lines`)를 준수하며 누적 버전을 기록한다.
2. **원자적 커밋 및 무충돌 푸시**:
   - 푸시 직전 `git pull --rebase origin main`으로 최종 무충돌 상태를 검증한 후 원격에 푸시한다.
   - 커밋 메시지는 정규 규칙(`feat(...)`, `fix(...)`, `docs(...)`)을 엄격히 준수한다.

---

## 8. 📊 현재 프로덕션 활성 배포 상태 (Current Active Deployment Status)

- **최종 갱신일시**: 2026-09-22 12:55:00 KST
- **현재 프로덕션 릴리스 버전**: `v2026.09.22.347` (릴리스 경로: `/srv/moneyverse-data/releases/prod-854d777-v347`)
- **Exact Git SHA**: `854d777d204b66164ac5043e9bd9be3a7bee4498` (단축: `854d777`)
- **PostgreSQL 활성 사용자 세션**: **927개 (100% 무손실 보존)**
- **최신 완료 작업 요약**:
  1. **전 도메인 RESTful API & OpenAPI 3.0 & 인터랙티브 개발자 포털 (`/developer`) 완결 (Custom GPT)**:
     - 52개 컨트롤러 159개 엔드포인트 REST 표준화 및 라이브 샌드박스 테스터 탑재.
     - 커밋: `039f2e9`
  2. **이용약관 미동의 세션 블랙아웃(본문 증발) 결함 긴급 복구 (Antigravity)**:
     - `ConsentGuard` 강제 리다이렉트 제거 및 토스형 원터치 인라인 동의 다이얼로그(`ConsentStepUpModal`) 신설.
     - 백엔드 `PUT /api/v1/auth/consent` 원자적 연동.
  3. **메인 홈 포털(`/`) 전면 핀테크 리빌드 (Antigravity)**:
     - `anti-ai-frontend-craftsmanship` 및 `fintech-responsive-layout-engine` 적용.
     - 실시간 순자산 헤어로(`WalletGlance`), 2열 비대칭 핀테크 라이브 콘솔(핫 주식 3종 및 직업 스테이션), 4대 기둥 18개 전 도메인 서비스 디렉터리, 320px~1440px 클리핑 제로 반응형 구현.
  4. **프로덕션 무중단 승격 (`v347`) 완결**:
     - `verify-runtime-identity.sh` 통과 (Backend & Frontend exact SHA 일치).
     - `/`, `/login`, `/stocks`, `/casino`, `/developer`, `/admin` 전 엔드포인트 200 OK 실측.

