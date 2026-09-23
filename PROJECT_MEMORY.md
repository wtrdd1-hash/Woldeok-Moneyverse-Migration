# Woldeok Moneyverse 프로젝트 메모리 (PROJECT_MEMORY.md)

- **최종 갱신일:** 2026-09-23
- **관리 주체:** Woldeok Moneyverse Core Development & Operations
- **문서 상태:** 활성 (Active Memory)
- **현재 프로덕션 릴리스:** `v2026.09.23.396` (`prod-b7d4a78e-v396`)
- **PostgreSQL 활성 세션 상태:** **1,068개 (100% 무손실 보존)**

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

## 3. 📜 최신 릴리스 내역 (v2026.09.23.396)

- **최종 갱신일시**: 2026-09-23 11:58:00 KST
- **프로덕션 릴리스 버전**: `v2026.09.23.396` (릴리스 경로: `/srv/moneyverse-data/releases/prod-b7d4a78e-v396`)
- **Exact Git SHA**: `b7d4a78e`
- **PostgreSQL 활성 사용자 세션**: **1,068개 (100% 무손실 보존 실측 확인)**
- **완료 작업 요약**:
  1. **주식 포트폴리오 분석 UI 고도화 & 반응형 SVG 도넛 차트 탑재**:
     - `PortfolioDonutChart` 신설: 10개 종목 자산 구성 비중을 원형 도넛 차트로 실시간 렌더링.
     - 다중 세그먼트 스택 바 및 종목별 비중/평가액/원터치 리밸런싱 주문 연동 완비.
  2. **10-Depth 실시간 호가창 뎁스 뷰 고도화 (`stock-orderbook.tsx`)**:
     - 누적 볼륨(Cumulative Depth) 계산 및 매수/매도 호가 압력 게이지(Order Pressure Ratio) 시각화.
     - 1원~1,000만 원 가격대 종목(CHIPS 53원 ~ SPACE 8,991,585원)의 틱 사이즈 단위 보정 및 정밀 WLD 포맷팅 적용.
  3. **관리자 AI Council 가상 심의 시뮬레이터 (`scenario-lab/page.tsx`)**:
     - 발행/소각/통화량 충격 파라미터 입력 시 듀얼 로컬 AI(Llama 3.2 3B & Gemma 3 1B)의 4대 도메인(무결성·거시·직업·복지) 관점 교차 의결 판정(Agree/Veto/Abstain) 및 권고안을 실시간 산출하는 시뮬레이터 카드 탑재.
  4. **전체 단위 테스트 1,775개 100% PASS 및 무중단 블루-그린 승격**:
     - `@moneyverse/contract` (23 tests), `@moneyverse/database` (7 tests), `@moneyverse/backend` (989 tests), `@moneyverse/frontend` (756 tests) 전수 통과.
     - 1,068개 활성 세션 100% 보존 상태로 무중단 승격 완료.
