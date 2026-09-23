# Woldeok Moneyverse 프로젝트 메모리 (PROJECT_MEMORY.md)

- **최종 갱신일:** 2026-09-23
- **관리 주체:** Woldeok Moneyverse Core Development & Operations
- **문서 상태:** 활성 (Active Memory)
- **현재 프로덕션 릴리스:** `v2026.09.23.397` (`prod-v397` / SHA `a65d4d41`)
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

## 3. 📜 최신 릴리스 내역 (v2026.09.23.397)

- **최종 갱신일시**: 2026-09-23 22:31:00 KST
- **프로덕션 릴리스 버전**: `v2026.09.23.397` (릴리스 경로: `/srv/moneyverse-data/releases/prod-v397`)
- **Exact Git SHA**: `a65d4d41`
- **PostgreSQL 활성 사용자 세션**: **1,071개 (100% 무손실 보존 실측 확인)**
- **완료 작업 요약**:
  1. **실시간 호가 틱 웹소켓 스트리밍 & 순간 플래시 펄스 애니메이션 (`stock-orderbook.tsx`)**:
     - `useQuote(stockId, ...)` 훅을 결합하여 소켓 브로드캐스트 도착 시 호가창 체결가 즉시 갱신.
     - 체결가 상승 시 에메랄드(`bg-emerald-500/25`), 하락 시 로즈(`bg-rose-500/25`)로 600ms 동안 순간 플래시 펄스 발광 애니메이션 탑재.
     - 5D/10D 호가 단계 및 매수/매도 압력 비율 바 실시간 유기적 재계산.
  2. **AI 뉴스 기반 시장 감성 지수 위젯 (`market-sentiment-gauge.tsx`)**:
     - 0~100점 시장 탐욕/공포(Greed & Fear) 핀테크 게이지 (Extreme Fear ~ Extreme Greed 5단계 레인지) 구현.
     - 활성 AI 뉴스 이벤트의 `direction`('up' | 'down')과 `strength`(1~3)를 합산하여 실시간 감성 지수 산출.
     - 10대 종목별 호재/악재 감성 태그 및 뉴스 요약 스트립 렌더링.
  3. **거래소 메인 및 상세 화면 통합 연동**:
     - `stock-trading-console.tsx`에 `stockId` prop 전달 및 `page.tsx`에 `MarketSentimentGauge` 렌더링 통합.
  4. **전체 단위 테스트 1,783개 100% PASS 및 무중단 블루-그린 승격**:
     - `@moneyverse/contract` (23 tests), `@moneyverse/database` (7 tests), `@moneyverse/backend` (996 tests), `@moneyverse/frontend` (757 tests) 전수 통과.
     - 1,071개 활성 세션 100% 무손실 보존 상태로 무중단 승격 완료.
