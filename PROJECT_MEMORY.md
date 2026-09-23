# Woldeok Moneyverse 프로젝트 메모리 (PROJECT_MEMORY.md)

- **최종 갱신일:** 2026-09-23
- **관리 주체:** Woldeok Moneyverse Core Development & Operations
- **문서 상태:** 활성 (Active Memory)
- **현재 프로덕션 릴리스:** `v2026.09.23.407` (`prod-v407` / SHA `fa7a18cf`)
- **PostgreSQL 활성 세션 상태:** **1,071개 (100% 무손실 보존)**

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

## 3. 📜 최신 릴리스 내역 (v2026.09.23.407)

- **최종 갱신일시**: 2026-09-23 22:56:00 KST
- **프로덕션 릴리스 버전**:  (릴리스 경로: )
- **Exact Git SHA**: 
- **PostgreSQL 활성 사용자 세션**: **1,071개 (100% 무손실 보존 실측 확인)**
- **완료 작업 요약**:
  1. **주식 캔들 차트 기술적 보조지표 고도화 ()**:
     - 5주기 이동평균선(MA5, ), 20주기 이동평균선(MA20, ), 볼린저 밴드(상/하한선 ±2σ, fill polygon) 렌더링 엔진 탑재.
     - 사용자 인터랙티브 오버레이 토글 툴바(MA5, MA20, 볼린저 밴드) 제공.
     -  19개 단위 테스트 100% PASS.
  2. **프론트엔드 최적화 빌드 & 프로덕션 배포**:
     - Next.js 16.3.4 Turbopack 프로덕션 빌드 완료.
     - 무중단 블루-그린 배포() 및 1,071개 활성 세션 보존 확인 완료.

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
