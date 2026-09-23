# Woldeok Moneyverse 프로젝트 메모리 (PROJECT_MEMORY.md)

- **최종 갱신일:** 2026-09-23
- **관리 주체:** Woldeok Moneyverse Core Development & Operations
- **문서 상태:** 활성 (Active Memory)
- **현재 프로덕션 릴리스:** `v2026.09.23.395` (`prod-1767bed1-v395`)
- **PostgreSQL 활성 세션 상태:** **1,069개 (100% 무손실 보존)**

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

## 3. 📜 최신 릴리스 내역 (v2026.09.23.395)

- **최종 갱신일시**: 2026-09-23 11:41:00 KST
- **프로덕션 릴리스 버전**: `v2026.09.23.395` (릴리스 경로: `/srv/moneyverse-data/releases/prod-1767bed1-v395`)
- **Exact Git SHA**: `1767bed1`
- **PostgreSQL 활성 사용자 세션**: **1,069개 (100% 무손실 보존 실측 확인)**
- **완료 작업 요약**:
  1. **AI 위원회 (AI Council) 스코어보드 UI 한글화 및 Rationale 시각화**:
     - `ai-status-card.tsx` 내 영문 도메인(`integrity`, `welfare`)을 한국어(`데이터 무결성`, `복지/소비`)로 100% 매핑.
     - 원시 문자열 형태의 의결 로그(`council decision=agree;agree=jobs,welfare;...`)를 직관적인 판정 배지(만장일치 합의, 거부-VETO, 보류) 및 합의/거부/이견 도메인 태그 카드로 시각화하는 `CouncilRationaleBanner` 탑재.
     - `exactOptionalPropertyTypes` 및 환경 독립적 KST 명시적 타임스탬프 포맷터 완비.
  2. **AI Council Decision Rules 및 프롬프트 개선**:
     - `backend/src/economy/economy-ai-review.ts`의 `SYSTEM_PROMPT` 보강으로 불필요한 `abstain`(보류) 남발 방지 및 명확한 `AGREE` / `VETO` 의결 판정 유도.
  3. **가상 주식 10개 종목 확장 및 10원~1,000만 원 랜덤 가격 시딩**:
     - `CHIPS`(53원), `WDG`(481원), `WDT`(2,169원), `WDM`(8,605원), `WDB`(69,994원), `MYUY`(266,654원), `WFIN`(667,623원), `DUCK`(1,613,562원), `CHIMU314`(5,221,236원), `SPACE`(8,991,585원) 확장 및 실시간 틱 연동 완료.
  4. **AI 뉴스 5분 주기 무인 백그라운드 스케줄러 상시 가동**:
     - 로컬 Ollama AI(`llama3.2:3b`)와 연동된 완전 자동 기사 발행 파이프라인 데몬 가동.
  5. **전체 단위 테스트 1,760개 전수 100% PASS 및 무중단 블루-그린 승격**:
     - `@moneyverse/contract` (23 tests), `@moneyverse/database` (7 tests), `@moneyverse/backend` (977 tests), `@moneyverse/frontend` (756 tests) 전수 통과.
     - 1,069개 활성 세션 100% 보존 상태로 무중단 승격 완료.
