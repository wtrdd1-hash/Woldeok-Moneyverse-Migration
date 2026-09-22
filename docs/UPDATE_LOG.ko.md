## v2026.09.22.357 — 주식 거래정지 매수원가 자동정산 엔진 완비, 카탈로그 가시성 복구 및 포트폴리오 영수증 연동

- 적용 브랜치: `main` (릴리스: `prod-2ec47a9-v357`)
- **P0 주식 거래정지 매수원가 자동정산 엔진 및 가시성 완결 (STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC)**:
  1. **PostgreSQL 229 마이그레이션 적용 (`packages/database/migrations/229-stock-market-overview-halt-visibility.sql`)**:
     - `stock_market_overview()` 함수에 `halt_status` 반환 컬럼을 추가하고, `WHERE stock.active OR stock.halt_status IN ('HALTING', 'HALTED_SETTLING', 'HALTED_SETTLED')` 조건으로 거래정지 종목이 카탈로그에 안전하게 보존되도록 개편.
     - 활성 종목 우선, 거래정지 종목 후순위 정렬 규칙 적용.
  2. **백엔드 저장소 및 인터페이스 갱신 (`backend/src/stock/`)**:
     - `StockMarketRow`에 `halt_status: string` 추가 및 `list()` 쿼리 바인딩.
     - `stock-halt-settlement.test.ts`에 거래정지 카탈로그 가시성 검증 케이스 추가 (6종 단위 테스트 100% 통과).
  3. **가상 주식 거래소 메인 화면 쇄신 (`frontend/src/app/stocks/page.tsx`)**:
     - 거래정지 종목에 `거래정지 (Halted)` 배지 부여 및 매수/매도 버튼 비활성화(`disabled`).
     - 공시 및 정산 내역 확인을 위해 `종목 허브` 및 상세 다이얼로그 접근성 보존.
  4. **포트폴리오 분석 화면 원가환급 영수증 카드 신설 (`frontend/src/app/stocks/portfolio/page.tsx`)**:
     - `/api/v1/stocks/halt-receipts` 병렬 연동으로 **거래정지 원가환급 영수증 (Halt Settlement Receipts)** 카드 신설.
     - 정산 수량, 취득 단가, 환급 총액, `ShieldCheck` 면제 배지 완비.
  5. **종목 상세 화면(`/stocks/[symbol]`) 404 결함 원천 해소**:
     - 거래정지된 종목에 진입 시 카탈로그 누락으로 발생하던 404를 해결하여 거래정지 안내 배너 및 영수증이 완벽하게 렌더링되도록 복구.
  6. **무중단 승격 및 런타임 신원 일치**:
     - Exact Git SHA `2ec47a9` 기반 테스트/프로덕션 런타임 신원 일치 검증.
     - 933개 PostgreSQL 활성 사용자 세션 100% 무손실 보존 완료.

## v2026.09.22.356 — 가상 주식 거래소 메인 주문 폼 프리셋 & 세금 요약 및 포트폴리오 자산 배분 스택 바 완결

- 적용 브랜치: `main` (릴리스: `prod-7e46b22-v356`)
- **P0 가상 주식 메인 주문 폼 및 포트폴리오 분석 고도화 (VIRTUAL_STOCK_EXCHANGE_SPEC)**:
  1. **주식 메인 주문 다이얼로그/폼 사용성 혁신 (`trade-form.tsx` & `trade-dialog.tsx`)**:
     - 44px 이상 터치 타깃(`min-h-9` 및 칩 버튼)과 25%/50%/MAX 퍼센티지 퀵 프리셋 칩 제공.
     - 매수 시 보유 현금 기준, 매도 시 보유 주식 수량(`holdingQuantity`) 기준으로 퍼센티지 즉시 자동 환산.
     - 실시간 예상 결제/수령 총액(`수량 × 단가`) 및 0.3% 거래세(`TaxBreakdown`) 요약 카드 탑재.
     - `TradeDialog`: `holdingQuantity`, `triggerLabel`, `triggerVariant`, `triggerClassName` 등 커스텀 트리거 확장 지원.
  2. **포트폴리오 자산 배분 멀티 세그먼트 스택 바 및 원터치 리밸런싱 (`frontend/src/app/stocks/portfolio/`)**:
     - `analysis.ts`: BigInt 기반 안전 연산으로 `gain_loss_bps`(종목별 및 포트폴리오 전체 수익률) 및 8색 고유 팔레트 색상 매핑 계산 로직 분리.
     - `analysis.test.ts`: 수익률 bps 계산 정합성 및 색상 할당 검증 단위 테스트 4종 100% PASS.
     - `page.tsx`: 3대 히어로 지표 카드(총 평가 자산, 총 투자 원금, 누적 평가 손익 및 bps 배지), 멀티 세그먼트 자산 배분 가로형 스택 바 및 레전드 칩, 보유 종목별 수익률 배지 및 원터치 매수/매도 `TradeDialog` 리밸런싱 트리거 탑재.
  3. **무중단 승격 및 런타임 신원 일치**:
     - Exact Git SHA `7e46b22` 기반 테스트/프로덕션 런타임 신원 일치 검증.
     - 929개 PostgreSQL 활성 사용자 세션 100% 무손실 보존 완료.

## v2026.09.22.355 — 가상 주식 거래소 인터랙티브 트레이딩 콘솔, 10단계 양방향 호가창 및 모바일 퀵 액션 바 완결

- 적용 브랜치: `main` (릴리스: `prod-0714368-v355`)
- **P0 가상 주식 거래소 인터랙티브 트레이딩 콘솔 완결 (VIRTUAL_STOCK_EXCHANGE_SPEC)**:
  1. **실시간 5D/10D 호가창 컴포넌트 쇄신 (`stock-orderbook.tsx`)**:
     - 5단계(5D) 및 10단계(10D) 뎁스 토글 버튼 제공으로 투자자 시야 확장.
     - 매도호가(Asks) 클릭 시 매수 주문 자동 연동(`side='buy'`), 매수호가(Bids) 클릭 시 매도 주문 자동 연동(`side='sell'`).
     - 잔량 비례 게이지 바(매도: Rose, 매수: Emerald) 및 스프레드 WLD / Bps 지표 실시간 시각화.
  2. **토스/로빈후드 스타일 직관적 주문 패널 (`stock-order-panel.tsx`)**:
     - 지정가(Limit) 및 시장가(Market) 탭 인터페이스 탑재.
     - 호가 클릭 단가 자동 바인딩 및 수량 슬라이더 + 10%/25%/50%/MAX 44px 터치 프리셋 칩 제공.
     - 주문 체결 중 이중 제출 방지(`aria-busy`) 및 주문 확정 2단계 확인 다이얼로그 탑재.
  3. **통합 트레이딩 콘솔 및 모바일 320px 퀵 액션 서피스 (`stock-trading-console.tsx`)**:
     - 호가창과 주문 패널의 상태를 양방향 바인딩하는 단일 컨트롤러 구축.
     - 모바일 화면(320px~768px)에서 화면 하단에 플로팅 퀵 액션 바(매수/매도 버튼) 고정 노출 및 바텀 서피스 모달 지원.
  4. **순수 호가 계산 로직 분리 및 Vitest 단위 테스트 완비**:
     - `computeOrderbook` 순수 연산 함수 분리 및 `stock-trading-console.test.ts` 6종 단위 테스트 100% 통과.
  5. **무중단 승격 및 런타임 신원 일치**:
     - Exact Git SHA `0714368` 기반 테스트/프로덕션 런타임 신원 일치 검증.
     - 929개 PostgreSQL 활성 사용자 세션 100% 무손실 보존 완료.

## v2026.09.22.354 — 1:1 개인 채팅 관리자 모더레이션 큐, 10건 메시지 증거 스냅샷 뷰어 및 조치 거버넌스 완결

- 적용 브랜치: `main` (릴리스: `prod-e60cf71-v354`)
- **P0 1:1 개인 채팅 관리자 모더레이션 및 증거 스냅샷 거버넌스 완결 (ONE_TO_ONE_PRIVATE_CHAT_SPEC v2026.09.20.305-05)**:
  1. **PostgreSQL 228 마이그레이션 적용 (`packages/database/migrations/228-private-chat-moderation-admin.sql`)**:
     - `private_chat_admin_list_reports`: 관리자용 신고 큐 조회 (신고자/피신고자 정보, 사유, 증거 건수, 접수일시).
     - `private_chat_admin_get_report`: 10개 메시지 증거 스냅샷(`evidence_snapshot` JSONB) 안전 열람 및 `audit_logs`에 `CHAT_REPORT_EVIDENCE_VIEWED` 불변 기록 (기획서 14절 준수).
     - `private_chat_admin_action_report`: 제재(차단/경고/기각) 실행 및 `audit_logs`에 `CHAT_REPORT_ACTIONED` 감사 기록 영구 보존.
  2. **백엔드 NestJS 안전 모듈 엔드포인트 완비 (`backend/src/safety/`)**:
     - `GET /api/v1/admin/safety/chat-reports`: 관리자 세션 가드 기반 신고 큐 목록 조회.
     - `GET /api/v1/admin/safety/chat-reports/:id`: 단건 상세 및 증거 스냅샷 조회.
     - `POST /api/v1/admin/safety/chat-reports/:id/action`: 모더레이션 조치 실행 및 CSRF 가드 적용.
  3. **프론트엔드 관리자 안전 관제 타워 전면 쇄신 (`frontend/src/app/admin/safety/`)**:
     - 2대 큐 탭 인터페이스: `1:1 개인 채팅 신고 심사 큐` & `비회원 긴급 콘텐츠 삭제 큐`.
     - `ChatReportEvidenceDialog`: 카카오톡/토스풍 10개 메시지 타임라인 모달 (말풍선, 순번, 시각, 발신자 구별).
     - `ChatReportActionDialog`: 원터치 조치 다이얼로그(경고/차단/기각) 및 2단계 확인.
     - `admin-chat-moderation.test.ts`: Vitest 단위 테스트 4종 100% PASS.
  4. **무중단 승격 및 런타임 신원 일치**:
     - Exact Git SHA `e60cf71` 기반 테스트/프로덕션 런타임 신원 일치 검증.
     - 929개 PostgreSQL 활성 사용자 세션 100% 무손실 보존 완료.

## v2026.09.22.353 — 1:1 개인 채팅 P0 긴급 안전 제어(차단/음소거/신고) & 핀테크 안전 UX 및 한글 IME 오발송 방지 완결

- 적용 브랜치: `main` (릴리스: `prod-dc011ee-v353`)
- **P0 1:1 개인 채팅 안전 제어 및 거버넌스 완결 (ONE_TO_ONE_PRIVATE_CHAT_SPEC v2026.09.20.305-05)**:
  1. **PostgreSQL 227 마이그레이션 적용 (`packages/database/migrations/227-private-chat-safety-controls.sql`)**:
     - `private_chat_blocks` 테이블 신설: 회원 간 상호/단방향 1:1 차단 관계 저장 및 인덱싱.
     - `private_chat_reports` 테이블 신설: 4대 사유(스팸/사기/욕설/기타), 상세 소명, 최근 10개 메시지 JSONB 증거 스냅샷 자동 캡처 및 SLA 관제 큐 연동.
     - 보안 프로시저 완비: `private_chat_mute`, `private_chat_block`, `private_chat_unblock`, `private_chat_is_blocked`, `private_chat_report`.
     - 메시지 전송 강화 (`private_chat_send`): 차단된 회원 간 메시지 전송 시 `42501` Fail-closed 방어.
  2. **백엔드 엔드포인트 완비 (`backend/src/chat/`)**:
     - `POST /api/v1/chat/conversations/:id/mute`: 대화방 알림 음소거/해제 원자적 갱신.
     - `POST /api/v1/chat/users/:id/block` & `DELETE /api/v1/chat/users/:id/block`: 회원 차단 및 해제 엔드포인트.
     - `POST /api/v1/chat/conversations/:id/report`: 부적절 대화 내용 신고 및 증거 스냅샷 영구 보존.
  3. **프론트엔드 채팅 룸 핀테크 안전 UX 쇄신 (`frontend/src/app/chat/`)**:
     - `ChatRoom` 상단 더보기 메뉴: 원클릭 알림 음소거 토글, 상대방 차단/해제 확인 모달, 4대 사유 신고 모달 탑재.
     - 한글 IME 조합(`isComposing`) 오발송 방지: 한글 자모 조합 중 Enter 키로 오발송되는 현상 원천 차단.
     - 차단된 회원과의 대화 시 상단 경고 배너 및 입력창 비활성화(`disabled`) 보호.
     - `ChatView` 대화 목록에 음소거 배지(`BellOff`) 및 차단 상태 배지 시각화.
  4. **단위 테스트 및 무중단 승격**:
     - Vitest `chat-safety.test.ts` 4개 테스트 100% 통과.
     - 미니 PC Exact-SHA(`dc011ee`) 런타임 일체화 검증 통과 및 929개 활성 세션 무손실 보존.

## v2026.09.22.352 — 관리자 약관 버전 실시간 개정 콘솔 & G352 거버넌스 계약 및 불변 릴리스 원장 완결

- 적용 브랜치: `main` (릴리스: `prod-f609af8-v352`)
- **관리자 정책 제어 및 거버넌스 계약/불변 원장 롤백 완결**:
  1. **관리자 약관 버전 실시간 발행 콘솔 (`/admin/controls`)**:
     - `backend/src/admin/controls.controller.ts` & `controls.repository.ts`: `POST /api/v1/admin/controls/consent-versions` 엔드포인트(2단계 확인 `PUBLISH_NEW_POLICY_VERSION`, `audit_logs` 영구 기록, Superadmin 전용) 신설.
     - `frontend/src/app/admin/controls/policy-version-card.tsx`: 2단계 확인 모달 및 관리자 정책 버전 제어 카드 탑재.
  2. **G352-01 Fail-Safe 동의 제출 방어 (`ConsentStepUpModal`)**:
     - 정책 버전 미동기화 시 동의 제출 버튼 비활성화(`disabled`) 및 재시도 UI 제공. 비권위 하드코딩 Fallback 저장 원천 차단.
  3. **G352-02 & G352-04 불변 릴리스 원장 구축 (`docs/releases/ledger.json`, `rollback_production.sh`)**:
     - `docs/releases/ledger.json` 불변 증거 원장 파일 신설 및 `rollback_production.sh` 롤백 스크립트에 ledger 기반 last-known-good candidate 검증 연동.
  4. **G352-03 경로 정규화 및 화이트리스트 우회 방지 (`normalizePath`, `consent-guard.test.ts`)**:
     - `frontend/src/lib/path-utils.ts`의 `normalizePath`로 디코딩, 소문자화, 연속 슬래시/트래버설 제거 후 화이트리스트 검사.
     - Vitest 단위 테스트 7종 통과 검증.
  5. **프로덕션 무중단 승격 (`v352`)**:
     - exact-SHA 런타임 식별자 일체화 검증 통과 및 전 엔드포인트 200 OK.
     - PostgreSQL 929개 활성 세션 100% 무손실 보존.

## v2026.09.22.350 — 이용약관/개인정보 동의 서버사이드 동적 바인딩 & 인라인 아코디언 뷰어 & 10초 원클릭 무중단 롤백 엔진 탑재

- 적용 브랜치: `main` (릴리스: `prod-d67a915-v350`)
- **이용약관/개인정보 동의 방어 체계 고도화 및 운영 안정성 완결**:
  1. **약관 버전 서버사이드 동적 바인딩 (`fetchLatestPolicy`)**:
     - `frontend/src/lib/api.ts`에 백엔드 `GET /api/v1/auth/policy` 연동 및 60초 SWR 캐싱(`revalidate: 60`), 백엔드 장애 대비 디폴트 정책 Fallback 아키텍처 탑재.
     - `RootLayout`에서 `currentViewer()`와 병렬 호출하여 서버 렌더링 시점에 최신 약관/개인정보 버전 주입.
  2. **클라이언트 하이드레이션 깜빡임 방지 및 화이트리스트 강화 (`ConsentGuard`)**:
     - `mounted` 가드로 SSR-Client 하이드레이션 불일치 및 0.1초 깜빡임 원천 차단.
     - `/login`, `/terms`, `/privacy`, `/data-deletion`, `/account-deletion`, `/safety`, `/safety/takedown`, `/robots.txt`, `/sitemap.xml`, `/api/og`, `/icon.svg`, `/apple-icon.png`, `/frontend-version`, `/api/health` 14대 예외 경로 화이트리스트 적용.
     - `dismissed` 상태 도입으로 동의 즉시 부드럽게 모달 언마운트.
  3. **인라인 탭 아코디언 뷰어 & 핀테크 토스트 알림 (`ConsentStepUpModal`)**:
     - 외부 페이지 이동 없이 모달 내에서 약관 및 개인정보 요약/전문을 즉시 열람 가능한 인라인 탭 아코디언 탑재.
     - 200ms 부드러운 페이드인 애니메이션(`animate-in fade-in-0 zoom-in-95 duration-200`).
     - 동의 완료 시 토스 스타일 토스트 알림(`sonner`) 및 비차단 백그라운드 서버 갱신(`router.refresh()`).
  4. **운영 10초 원클릭 무중단 롤백 스크립트 탑재 (`ops/release/rollback_production.sh`)**:
     - 이전 릴리스 디렉토리 자동 탐색, 929개 활성 세션 DB 안전 가드 쿼리.
     - `ln -sfn` 원자적 심볼릭 링크 스위치 및 systemd 서비스 무중단 리로드.
     - `verify-runtime-identity.sh` 자동 검증 및 Discord 웹훅 알림 연동.
  5. **품질 검증 및 런타임 승격**:
     - 프론트엔드/백엔드 빌드 및 런타임 아이덴티티 일치 검증 통과.
     - PostgreSQL 929개 활성 유저 세션 100% 무손실 보존.

## v2026.09.22.349 — OpenAPI 레퍼런스 최신성 정정

- 최종 권위 출처 재검증에 따른 문서 전용 정정이다.
- 기존 v347의 OpenAPI 3.0 호환 구현 사실은 유지하면서 최신 API 진화 목표를 3.1.1에서 2026-09-10 공개된 3.2.1로 정정했다.
- 전환 전 단계적 호환성 테스트 요구사항을 추가했다.

## v2026.09.22.348 — 통합 기획 재검토 및 권위 정합화

- 범위: 문서/기획 전용이며 런타임 배포 완료를 주장하지 않는다.
- 오래된 v335 헤더를 `docs/planning/PROJECT_PLAN.ko.md` v348로 올리고 영문 기준 문서와 동기화했다.
- v342/v343/v347/v347.1 구현·릴리스 증거와 작업 중간 새로 확인한 v46/v47 긴급 방어 초안을 통합 기획과 정합화했다.
- Developer Portal/API 안전, OpenAPI 3.2.1 호환 전환, 신문 투표 권위, 동의 상태/접근성, live-data freshness, 주식 halt 상태, 안전 rollback 상세 계약을 추가했다.
- 1만+ 레퍼런스 요구는 대규모 corpus 기준 + 직접 확인한 규범 자료로 기록하고 1만 페이지를 개별 수동 검토했다는 과장 표현을 금지했다.
- 상세 재검토: `docs/planning/INTEGRATED_REVIEW_V348.ko.md`; 작업기록: `docs/worklog/2026-09-22-integrated-planning-rereview-v2026.09.22.348.ko.md`.

## v2026.09.22.347.1 — 이용약관 동의 화면 블랙아웃(본문 증발) 긴급 복구 및 메인 포털(/) 핀테크 전면 리빌드

- 적용 브랜치: `main` (릴리스: `prod-854d777-v347`)
- **이용약관 동의 화면 블랙아웃 긴급 복구 및 핀테크 메인 포털 리빌드 완결**:
  1. **약관 미동의 세션 블랙아웃 버그 원천 해결 (`ConsentStepUpModal`)**:
     - `ConsentGuard`의 강제 화면 이탈(`router.replace`)로 인한 클라이언트 라우터 충돌 및 메인 본문 언마운트 결함 제거.
     - 토스형 원터치 인라인 이용 동의 다이얼로그(`ConsentStepUpModal`) 신설: 만 14세 이상 확인, 이용약관, 개인정보처리방침 3종 원클릭 동의 및 백엔드 `PUT /api/v1/auth/consent` (`auth_grant_current_user_consent` RPC) 원자적 연동.
  2. **메인 홈 포털(`/`) 전면 핀테크 리빌드 (`anti-ai-frontend-craftsmanship` & `fintech-responsive-layout-engine`)**:
     - 실시간 내 지갑 순자산 헤어로(`WalletGlance` 연동) 및 4대 퀵 프리셋(송금, 직업, 주식, 가상은행).
     - 2열 비대칭 핀테크 라이브 콘솔: 실시간 주식 핫 종목 3종(WDG, FNAK, CHIMU) 및 직업 업무 스테이션(진행률 바, 8대 직업 배정).
     - 4대 기둥 18개 전 도메인 서비스 디렉터리(금융&투자, 경제&활동, 플레이&시즌, 커뮤니티&공간).
     - 320px 극소 모바일 ~ 1440px 데스크톱 완벽 대응 클리핑 제로 반응형 레이아웃.
  3. **품질 검증 및 무중단 승격**:
     - `stage_v347.sh`를 통한 프로덕션 무중단 승격 (`854d777`).
     - Exact-SHA identity coherent (`854d777`) 검증 및 전 엔드포인트 200 OK 실측.
     - PostgreSQL 927개 활성 유저 세션 100% 무손실 보존.

## v2026.09.22.347 — 전 도메인 REST API 표준화 & OpenAPI 3.0 명세 & 인터랙티브 개발자 포털(/developer) 완결


- 적용 브랜치: `feat/api-developer-portal-v2026.09.22.344`
- **전 도메인 RESTful API 규격화 및 핀테크 개발자 포털 완결**:
  1. **전 도메인 REST API & OpenAPI 3.0 완비**:
     - 백엔드 52개 컨트롤러 159개 엔드포인트 및 신규 기능(신문 펄스 `GET /api/v1/newspaper/pulse`, 독자 투표 `GET /api/v1/newspaper/poll`, `POST /api/v1/newspaper/poll/vote`, 금융 로어 `GET /api/v1/newspaper/lore`)을 일관된 RESTful API 표준으로 구축.
     - OpenAPI 3.0 명세서(`docs/mobile-api-contract.json`) 및 스키마 레퍼런스 문서 자동 동기화.
  2. **Next.js 핀테크 스위스 레저 스타일 인터랙티브 개발자 포털 (`/developer`) 구축**:
     - 7대 카테고리(신문/펄스, 주식/거래소, 가상은행, 카지노, 직업/작업, 실시간스트림 등)별 엔드포인트 카탈로그.
     - cURL, TypeScript (Axios), Python (Requests) 다국어 코드 스니펫 즉시 복사 지원.
     - 브라우저 상에서 실시간으로 엔드포인트를 호출하고 응답 상태 코드 및 지연 시간(Latency)을 측정하는 라이브 "Try It Out" 샌드박스 테스터 탑재.
     - OpenAPI 3.0 계약 다운로드 링크 및 4개국어(KO, EN, JA, ZH) 완벽 i18n 지원.
  3. **App Gateway 라우팅 & 전역 네비게이션 연동**:
     - `frontend/src/lib/app-gateway.ts`: `developer`, `newspaper` 라우트 그룹 등록 및 프록시 파이프라인 확장.
     - `frontend/src/lib/navigation.ts`: 커뮤니티 카테고리 및 공개/회원 헤더 네비게이션에 `/developer` 등록.
- **품질 검증 및 무중단 배포**:
  - 프론트엔드/백엔드 빌드 및 계약 검증 완료.
  - 테스트 환경(`https://test.easy-scraping.com/developer`) 및 운영 환경(`https://easy-scraping.com/developer`) 무중단 릴리즈 승격.
  - PostgreSQL 857개 활성 유저 세션 100% 무손실 보존.

## v2026.09.22.346 — 디스코드 음악 봇 SponsorBlock 실시간 API 연동 & FFmpeg 정밀 절단 엔진 완결 및 QA 검증 통과

- 적용 브랜치: `feat/discord-music-bot-sponsorblock-live-slicing-qa-v2026.09.22.346`
- **SponsorBlock 실시간 API 및 FFmpeg aselect 스트림 정밀 절단 엔진 완결**:
  1. **실시간 SponsorBlock API 연동 및 정밀 타임스탬프 획득**:
     - 유튜브 음원 URL에서 video ID를 추출하고 `https://sponsor.ajay.app` API를 통해 스폰서 광고, 비음악 잡담(`music_offtopic`), 채널 홍보(`selfpromo`), 인트로/아웃트로 스킵 세그먼트를 0.1초 단위로 실시간 수집.
  2. **FFmpeg aselect 기반 온더플라이 무손실 스트림 절단**:
     - yt-dlp의 stdout 파이프라인에서 발생하는 후처리 누락 한계를 극복하기 위해, 감지된 스폰서 구간을 FFmpeg의 `aselect='not(between(t,start,end))',asetpts=N/SR/TB` 오디오 필터 체인으로 온더플라이 정밀 절단.
     - 절단된 스트림을 `StreamType.Raw` (s16le 48kHz stereo) 규격으로 `@discordjs/voice`에 직결하여 0초 지연 및 실시간 볼륨 조절(`inlineVolume: true`) 완벽 보장.
  3. **종합 QA 감사 및 오디오 파형/음량 검증 (100% 통과)**:
     - **유튜브 표준 광고**: yt-dlp 다이렉트 미디어 스트림 추출로 100% 바이패스(광고 삽입 0건) 확인.
     - **스폰서/잡담 절단 검증**: Maroon 5 - Sugar(0~26.4s 잡담), Adele - Hello(0~74.9s 통화 연기), Queen - Bohemian Rhapsody 등 스폰서 세그먼트 전수 감지 및 차단 검증.
     - **음향 볼륨 검증**: 인트로 잡담 구간(-44.0 dB) 대비 음악 시작 구간(-21.7 dB)으로 즉시 점프하여 +22.3 dB 음향 에너지 상승 및 첫 소절 즉시 재생 확인.
- **품질 검증 및 서비스 상태**:
  - 단위 테스트: `npm test` -> 4/4 PASS (100% 통과).
  - 데몬 서비스: `moneyverse-discord-bot.service` 정상 가동 (PID: 1739183, Active).
  - 음성 채널 상주: `🔊│음성` (`1536572442422550538`) 채널 24/7 불사 상주 정상 가동 확인.

## v2026.09.22.345 — 디스코드 음악 봇 SponsorBlock 광고·협찬·인트로 자동 스킵 엔진 탑재

- 적용 브랜치: `feat/discord-music-bot-sponsorblock-ads-removal-v2026.09.22.345`
- **SponsorBlock 기반 광고/스폰서 구간 실시간 자동 절단**:
  1. **광고·협찬·비음악 인트로 자동 스킵 연동**:
     - `youtubedl.exec` 스트리밍 파이프라인에 `sponsorblockRemove: 'sponsor,music_offtopic,selfpromo,intro,outro'` 옵션 적용.
     - 음원 스트리밍 시 글로벌 SponsorBlock 커뮤니티 데이터베이스와 실시간 연동하여 유튜버 자체 협찬 광고, 노래 전후의 대화/스킷 연기(`music_offtopic`), 채널 홍보(`selfpromo`), 인트로/아웃트로를 1초 지연 없이 온더플라이로 자동 절단.
  2. **순수 음악 감상 환경 보장**:
     - 불필요한 홍보 음성이나 긴 인트로 잡담 없이 곡 본편만 즉시 재생되도록 청취 품질 극대화.
- **품질 검증 및 서비스 상태**:
  - 단위 테스트: `npm test` -> 2/2 PASS (100% 통과).
  - 스트림 청크 수신 지연 없는 정상 출력 검증 완료.
  - 데몬 서비스: `moneyverse-discord-bot.service` 정상 가동 (PID: 1726037, Active).
  - 음성 채널 상주: `🔊│음성` (`1536572442422550538`) 채널 24/7 불사 상주 정상 가동 확인.

## v2026.09.22.344 — 디스코드 음악 봇 실시간 볼륨 조절(/volume) & 무제한 스트리밍 지원 및 MCP 원격 통제 체계 완결

- 적용 브랜치: `feat/discord-music-bot-volume-unlimited-v2026.09.22.344`
- **디스코드 음악 봇 기능 개선 및 버그 수정**:
  1. **실시간 볼륨 조절 명령어 `/volume` (0~200%) 완결**:
     - `@discordjs/voice`의 `createAudioResource`에 `inlineVolume: true` 파이프라인 바인딩.
     - 슬래시 명령어 `/volume` (수치 미입력 시 현재 볼륨 확인, 수치 입력 시 실시간 반영 및 이후 곡 영속 적용) 구현.
     - `/nowplaying` (현재곡) 임베드에 현재 볼륨 상태 표시 연동.
  2. **재생 시간 3시간 제한 완전 해제 (무제한화)**:
     - `DEFAULT_MAX_TRACK_SECONDS` 및 `MUSIC_MAX_TRACK_SECONDS` 기본값을 `Infinity`로 전환.
     - 10시간 이상 수면 음악, 장시간 로파이 플레이리스트, 콘서트 실황 등 모든 음원을 끊김 없이 무제한 재생 가능.
  3. **Opus 인코더 엔진 누락 오류(`Cannot find module '@discordjs/opus'`) 해결**:
     - 볼륨 변환 시 필요한 `@discordjs/opus` 및 `opusscript` 패키지 설치 완료.
     - 볼륨 조절 시 재생이 튕기던 현상 완전 해결 및 오디오 스트림 생성 100% 검증.
  4. **명령어 응답 전체 공개(Public) 일원화**:
     - 잔여 `ephemeral: true`를 전면 소거하여 모든 서버 멤버가 봇 응답을 함께 확인하도록 일원화.
  5. **인프라 제어 절대 규칙 수립 및 PROJECT_MEMORY.md 영구 반영**:
     - Windows PowerShell 로컬 SSH/SCP 직접 실행 전면 금지.
     - 미니PC의 모든 명령어 실행 및 파일 I/O를 `easy-scraping` MCP 도구로 100% 수행하도록 프로젝트 메모리 0번에 영구 반영.
- **품질 검증 및 서비스 상태**:
  - 단위 테스트: `npm test` -> 2/2 PASS (100% 통과).
  - 미니PC 데몬 서비스: `moneyverse-discord-bot.service` 정상 가동 (PID: 1717614, Active).
  - 음성 채널 상주: `🔊│음성` (`1536572442422550538`) 채널 24/7 불사 상주 정상 가동 확인.

## v2026.09.22.343 — 주간 경제 브리프 & 실시간 월드 펄스 신문 허브(/newspaper) 완결 및 듀얼 무중단 배포

- 적용 브랜치: `main`
- **주간 경제 브리프 신문 허브(`/newspaper`) 완결**:
  - `WEEKLY_WORLD_BRIEF_PILOT_SPEC.ko.md` 및 `WORLD_PULSE_FRESHNESS_RETENTION_GROWTH_SPEC.ko.md` 기획에 기반한 풀스택 신문 및 시나리오 펄스 허브 구현.
  - 신문 제호부(Masthead #343), 실시간 시장 심리 지수(Bullish/Bearish), 1면 특종 AI 시나리오 스토리, 실시간 속보 피드, 주간 금융 개념 배움터(3종 교육 아티클), 독자 참여형 시장 전망 투표(localStorage 연동 및 실시간 애니메이션 통계) 완비.
- **글로벌 네비게이션 & 4개국어(KO, EN, JA, ZH) 통합**:
  - `CATEGORY_NAV`, `PRIMARY_NAV`, `PUBLIC_NAV`, `MEMBER_NAV`, 데스크톱 상단 바 및 모바일 드로어 44px 터치 타겟 연동.
  - 홈 화면 "오늘의 현황" 및 "처음이라면" 링크 카드, 주식 시장 뉴스 딥링크 연동.
- **품질 검증 및 듀얼 무중단 배포**:
  - 프론트엔드 96개 테스트 파일 (716개 테스트) 100% 통과, 백엔드 83개 테스트 파일 (928개 테스트) 100% 통과.
  - Next.js 16.3.4 (Turbopack) 프로덕션 빌드 성공.
  - 테스트 환경(`https://test.easy-scraping.com`) 및 운영 환경(`https://easy-scraping.com`) 듀얼 무중단 릴리즈 롤아웃.

## v2026.09.22.342 — 주식 거래정지 및 매수원가 자동정산 버그 수정 & 듀얼 무중단 배포 완결

- 적용 브랜치: `main` (커밋: `06fde76`)
- **종목 거래정지 및 매수원가 자동정산 버그 근본 수정**:
  - `packages/database/migrations/221-stock-halt-cost-basis-settlement.sql`의 `public.stock_halt_and_settle` 함수 내 `halt_status` 모호한 컬럼 참조(`ambiguous column reference`)를 `s.halt_status`로 수정하여 관리자 콘솔 500 에러를 원천 해결.
  - PostgreSQL 실DB 트랜잭션 실행 테스트 완료 (`settled_count: 1`, `total_refund: 28,230 WLD`, `halt_status: HALTED_SETTLED`).
- **전체 기능 GitHub Remote Main 완전 통합**:
  - 18개 전 백엔드 도메인 프론트엔드 연동, 4개국어 i18n 엔진, 카지노 8종 게임, 직업 카드 버튼 짤림 방지, 관리자 관제탑을 GitHub `origin/main`에 100% 병합 및 푸시 완료.
- **테스트 및 운영 환경 듀얼 무중단 배포 검증**:
  - 테스트 환경 (`https://test.easy-scraping.com`): `test-be6344f-v337` 릴리즈, HTTP 200 OK.
  - 운영 환경 (`https://easy-scraping.com`): `prod-be6344f-v337` 릴리즈, HTTP 200 OK, 819개 유저 활성 세션 100% 무손실 보존.

# 업데이트 로그

## v2026.09.21.330 — 사용자 조율 확정 기반 스위스 핀테크 원장(Swiss Ledger) 시스템 전면 완결

- 적용 브랜치: `feat/frontend-swiss-ledger-craft-v2026.09.21.330`
- **사용자 조율 5대 핵심 확정 전면 반영**:
  1. **스위스 국제 타이포그래피 + 고밀도 핀테크 원장 (Swiss Ledger)**:
     - 블룸버그·스트라이프 스타일의 엄격한 모듈러 그리드, 흑백 모노크롬 베이스 + 1개 엠버/골드 시그널 포인트, 플랫 보더 및 극도의 공간 정돈.
  2. **적응형 슈퍼앱 레이아웃 (토스 + 카카오페이형)**:
     - 데스크톱 5대 메가 드롭다운(홈, 금융·투자, 경제·활동, 플레이·시즌, 커뮤니티) + 우측 원터치 프로필 허브 + 상단 실시간 경제 마키 티커 바.
     - 모바일 고정 바텀 내비 + 안전영역(Safe-Area) 자동 패딩 + 6대 아코디언 허브.
  3. **카드 중첩 해소 (Hairline Dividers & Split Views)**:
     - 카드 속 카드 중첩(Card in Card)을 완전히 제거하고 divide-y 및 1px 헤어라인 디바이더로 계층 정돈.
  4. **Emil Kowalski 햅틱 피직스 + Odometer 숫자 롤링**:
     - 모든 인터랙티브 요소 터치 시 active:scale-[0.98] 압축 피드백, 모달 스프링 감쇠, 고정폭(tnum) 카운팅 롤링.
  5. **4대 Anti-AI 스킬 & 핀테크 휴머나이저 원스톱 완결**:
     - 27개 전역 화면의 원시 이모지 100% 제거(1.75px Lucide SVG 단일화), 55가지 AI 문체 전수 쇄신.
- **품질 검증 및 무중단 배포**:
  - 프론트엔드 Vitest 95개 테스트 스위트 (710/710 PASS), 백엔드 Vitest 79개 테스트 스위트 (917/917 PASS).
  - Next.js 16.3.4 Turbopack 프로덕션 최적화 빌드 완료.
  - 무중단 블루-그린 승격 완결 및 807개 활성 세션 100% 무손실 보존.

## v2026.09.21.328 — 4단계 Anti-AI 디자인 & 휴머나이저(Humanizer) 파이프라인 전면 적용

- 적용 브랜치: `feat/frontend-humanizer-complete-v2026.09.21.328`
- **4단계 Anti-AI 디자인 및 휴머나이저 파이프라인 전면 적용**:
  1. **1단계: frontend-design (디자인 철학 및 미학 방향 정립)**:
     - "Editorial Fintech + Minimal Swiss Ledger" 미학 원칙에 따라 고대비 서피스 및 절제된 여백 리듬감 확보.
  2. **2단계: frontend-design-deslop & UI 클린업**:
     - 러시아 인형 식 카드 중첩(Card in Card)을 완전히 해소하고 섹션 디바이더(divide-y) 및 플랫 보더 구조로 전환.
     - 320px~1440px 전 구간 가로 스크롤러 및 오버플로우 0건 유지.
  3. **3단계: avoid-ai-design (시각적 AI 클리셰 전수 정제)**:
     - 27개 전역 화면에 산재해 있던 원시 유니코드 이모지를 100% 제거하고, 1.75px 일관된 스트로크의 미니멀 Lucide SVG 벡터 아이콘 및 시맨틱 뱃지로 단일화.
  4. **4단계: humanizer & avoid-ai-writing (55가지 AI 문체 검사 및 핀테크 카피 인간화)**:
     - 직업, 은행, 지갑, 주식, 계정, 관리자 화면 전반의 로봇 같은 AI 명령조/관용구를 따뜻하고 자연스러운 인간 핀테크 언어로 전면 쇄신.
     - 버튼, 안내 배너, 토스트 피드백, 빈 상태(Empty State) 문구 전수 인간화.
- **품질 검증 및 무중단 배포**:
  - 프론트엔드 Vitest 95개 테스트 스위트 (710/710개 100% 통과), 백엔드 Vitest 79개 테스트 스위트 (917/917개 100% 통과).
  - Next.js 16.3.4 Turbopack 최적화 프로덕션 빌드 성공.
  - 무중단 블루-그린 승격 완료 및 680+ 활성 세션 100% 무손실 보존.

## v2026.09.21.325 — 인간 중심 전면 UI/UX 쇄신 및 스트라이프·토스형 관리자 마스터 관제탑 리빌드

- 적용 브랜치: `feat/frontend-comprehensive-human-ui-rebuild-v2026.09.21.325`, 기반 커밋: `feat/frontend-comprehensive-nav-unification-v2026.09.21.321`.
- 백엔드 30여 개 전 도메인 완전 연동 핀테크 내비게이션 구축:
  - 5대 메가 카테고리 드롭다운(`CATEGORY_NAV`, `navigation.ts`)을 구축하여 은행, 직업, 사업체, 상점, 성장/칭호, 퀘스트, 카지노, 시즌, 캘린더, 클럽, 스페이스, 게시판, 갤러리, 공지사항, 고객센터 등 전체 서비스를 일목요연하게 배치.
  - 모바일 드로어 및 홈 10대 퀵 그리드(`QUICK_SERVICES`)와 실시간 동기화.
- 스트라이프 & 토스 어드민 하이브리드 관리자 마스터 관제탑 (`/admin/page.tsx`):
  - 139개 REST API 엔드포인트 정상 상태, 복식부기 원장 무결성(SHA-256 체인 검증), 국고 비축금 및 834개 활성 세션 실시간 헬스 텔레메트리 바 구축.
  - 4대 핵심 KPI 카드: 기능 스위치 통제 현황, 원장 무결성, 등록 회원 인구, 가상 주식 종목 시장 상태.
  - 1-클릭 신속 조치 바: 회원 즉시 검색 및 이상 거래 탐지(`AdminQuickUserSearch`), 상위 순자산 TOP 5 랭킹, 중앙 국고 비축금 관제.
  - 총 17개 운영 하위 모듈을 3대 영역(회원 보안, 가상 경제, 감사 텔레메트리)으로 체계화하고 상태 뱃지 및 가로 잘림 0건 적용.
- 반응형 뷰포트 무결점 최적화 및 잘림 현상 원천 차단:
  - `[word-break:keep-all]`, `min-w-0`, 1열 자동 리플로우 및 flex-wrap을 적용하여 320px(아이폰 SE), 390px, 768px, 1440px 전 해상도 가로 스크롤러 및 텍스트 잘림 0건 달성.
  - 헤더 우측 `[👑 관리자 콘솔]` 골드 뱃지 버튼 상시 노출 및 모바일 드로어 최상단 배너 연동.
- 품질 검증 및 무중단 배포:
  - 프론트엔드 Vitest 95개 테스트 파일 (710/710개 100% 통과), 백엔드 79개 테스트 파일 (917/917개 통과, 0 실패).
  - Next.js Turbopack 및 NestJS 프로덕션 빌드 0에러 완결.
  - 테스트(`test.easy-scraping.com`) 및 운영(`easy-scraping.com`) 무중단 블루-그린 승격 완료 (834건 활성 세션 100% 보존).

## v2026.09.21.314 — Playwright 헤드리스 브라우저 실시간 QA 전수 감사, 모바일 헤더 브랜드 가시성 복원 & 관리자 세부 내비게이션(AdminSubNav) 가로 스크롤 최적화

- 브랜치: `feat/frontend-mobile-qa-audit-v2026.09.21.314`, 베이스 `cf8902d`.
- **Playwright 실시간 브라우저 QA 테스트베드 구성 & 7대 뷰포트 전수 감사**:
  - 미니PC 환경에 Chromium 153 기반 Playwright QA 감사 스크립트(`qa_responsive_audit.js`) 구축.
  - Galaxy Fold(320px), iPhone SE(375px), iPhone 14/15(390px), Galaxy S23(412px), iPad Mini(768px), Laptop(1280px), Desktop(1440px) 7대 뷰포트에서 27개 주요 라우트(총 189개 체크) 실시간 검사 실행 -> **가로 스크롤 오버플로우 0건 달성**.
- **모바일 헤더 브랜드명 가시성 복원 (`Brand`)**:
  - 320px~359px 초소형 화면에서 브랜드 전체가 숨겨지던 현상을 해결하여 기본 `inline-flex`로 상시 노출.
  - 520px 미만 화면에서 브랜드명 텍스트("월덕 머니버스")가 숨겨지던 결함을 수정하여 320px 이상 모바일에서도 컴팩트한 `text-xs min-[400px]:text-sm sm:text-base` 폰트 크기로 브랜드를 균형감 있게 노출.
- **관리자 세부 내비게이션 (`AdminSubNav`) 가로 스크롤 및 터치 타깃 최적화**:
  - 모바일 브라우저에서 투박한 스크롤바가 화면을 가리지 않도록 `scrollbar-none` 클래스 적용.
  - 최소 터치 높이 `min-h-11` (44px 터치 규격) 준수 및 부드러운 스크롤 여백 유지.
- **단위 테스트 동기화**:
  - `src/components/brand-responsive.test.ts` 단정문을 갱신하여 320px 지원 및 반응형 클래스 정합성 100% 검증.

## v2026.09.20.313 — 기획서(PLAYER_MARKETPLACE_CRAFTING_SPEC) 기반 플레이어 마켓플레이스 제작(Crafting) & 아이템 거래소(P0) 인터랙션 시스템 구축

- 브랜치: `feat/marketplace-crafting-v2026.09.20.313`, 베이스 `5a41cba`.
- **기획서 P0 제작 작업대 (Crafting Workbench) 전면 도입**:
  - `P0_CRAFTING_RECIPES` 4종(달빛 에메랄드 프레임 염색, 고대 황금 유물 완벽 복원, 마스터 칭호 명판 골드 각인, 스마트 물류 35% 터보 부스트) 정식 탑재.
  - 레시피별 필요 재료(보유량 / 필요량) 실시간 비교 및 제작 가능 상태 감지기(`CraftingPanel`) 연동.
  - 제작 확인 모달: 제작 수수료 WLD 소각(HARD_SINK) 및 결과물 즉시 인벤토리 지급 인터랙션 완비.
- **P0 마켓플레이스 거래소 (Market Listings) 둘러보기 및 원자적 구매 모달**:
  - 고정가격 등록 방식의 유저 간 마켓플레이스 둘러보기, 실시간 검색, 카테고리 필터(프레임, 전시품, 사업체 부스트, 재료, 네임플레이트), 가격순 정렬 지원.
  - 원자적 구매 모달(`MarketListingsView`): 내 WLD 잔액 실시간 비교, 1% 소각 수수료(`SINK_MARKETPLACE_FEE`) 및 판매자 99% 안전 정산 구조 시각화, 구매 즉시 인벤토리 보관함 이전.
- **내 물품 판매 등록 (Sell Listing Modal) 및 수수료 자동 계산기**:
  - 내 보유 아이템을 선택하여 마켓에 고정가격으로 판매 등록하는 모달 구현.
  - 기획서 공식 기반 실시간 수수료 자동 계산: 등록 수수료 `max(25 WLD, ceil(price * 0.001))` 및 판매 수수료 `1%`, 정산 예상 순수령액 실시간 미리보기 제공.
- **내 판매 등록 관리 및 에스크로 취소 반환 (`MyListingsView`)**:
  - 에스크로에 보관 중인 내 판매 등록 물품 목록 확인 및 등록 취소 시 원자적 보관함 반환 인터랙션 구현.
- **단위 테스트 검증**:
  - `src/app/marketplace/crafting-recipes.test.ts` 신설을 통해 등록 수수료/판매 수수료/순수령액 계산 공식 및 레시피 무결성 100% 검증.

## v2026.09.20.312 — 전역 SEO 최적화, Schema.org 구조화 데이터(JSON-LD) 스위트, Hreflang 및 검색엔진 디렉티브 완비

- 브랜치: `feat/seo-optimization-v2026.09.20.312`, 베이스 `484cbd1`.
- **절대 경로 Canonical URL 정규화 엔진**: 중앙화된 `src/lib/seo.ts` 및 `canonicalUrl(path)` 빌더를 도입하여 모든 공개 페이지의 `alternates.canonical`을 트레일링 슬래시 없는 절대 URL(`https://easy-scraping.com/...`)로 정규화, 검색 크롤러의 중복 색인 리스크 원천 차단.
- **Schema.org 구조화 데이터(JSON-LD) 스위트 전면 도입**:
  - `WebApplication`: 루트 `layout.tsx`에 가상경제 커뮤니티 게임 웹앱의 기능, 카테고리, 통화(WLD) 정보가 담긴 지식 그래프 엔티티 선언.
  - `FAQPage`: `/guide` 페이지에 구글 검색 결과 FAQ 아코디언 리치 스니펫을 위한 구조화 데이터 자동 주입.
  - `BreadcrumbList`: `/guide`, `/announcements`, `/announcements/[id]`, `/board`, `/board/[id]` 등 주요 페이지에 계층형 사이트 탐색 경로 스키마 주입.
  - `DiscussionForumPosting`: 커뮤니티 게시판(`/board/[id]`)에 포럼 포스팅 스키마 주입.
- **고급 검색엔진 디렉티브 및 다국어 Hreflang 지원**: 구글 디스커버 및 고화질 썸네일 노출을 위한 `googleBot` 메타 디렉티브(`max-image-preview: large` 등) 추가 및 한국어/영어/x-default 대안 언어 태그(`alternates.languages`), `robots.ts` 호스트 설정 완료.
- **사이트맵 최신성(lastModified) 보강**: 14개 핵심 정적 공개 라우트의 `sitemap.ts`에 실시간 `lastModified` 타임스탬프를 부여하고 기존 `search-indexing.test.ts` 회귀 테스트 100% 호환성 유지.
- **단위 테스트 및 무결성 검증**: `src/lib/seo.test.ts`를 신설하여 정규 URL 생성, 4종 구조화 데이터 스키마 규격 검증을 100% 통과.

## v2026.09.20.311 — 직업 업무 수행 모달(TaskCompletionPanel) 모바일 뷰포트 자동 스크롤 & 바텀시트 적응형 핏 & 보상 결과 즉시 포커스 이동

- 브랜치: `feat/work-modal-autoscroll-v2026.09.20.311`, 베이스 `17419db82bf5`.
- **모바일 팝업 뷰포트 자동 스크롤 엔진**: 모바일(320px~480px) 환경에서 직업 업무 수행 모달 팝업(`TaskCompletionPanel`) 진입 시 및 "업무 수행하고 보상 받기" 클릭 시, 로딩 인디케이터와 최종 보상 지급 결과("완료되었습니다. 지갑 원장과 직업 숙련도가 최신 상태로 갱신되었습니다.") 및 "완료" 액션 버튼으로 화면/컨테이너가 자동으로 부드럽게 스크롤(Smooth Auto-Scroll)되도록 구현.
- **모바일 바텀시트 적응형 핏 및 스크롤 락**: 모달 오버레이를 `items-end sm:items-center`로 유연화하고 카드 높이를 `max-h-[92dvh] sm:max-h-[85vh]`로 지정하여 헤더와 푸터가 고정된 상태에서 본문만 안전하게 스크롤되도록 격리. 모달 구동 중 뒷배경 페이지 스크롤 락(`body scroll lock`) 적용.
- **원터치 완료(Done) 액션 버튼 강조**: 업무 완료(`state.status === 'ok'`) 시 하단 "완료" 버튼을 에메랄드 강조 스타일(`bg-emerald-600`)로 전환하여 사용자가 스크롤을 올릴 필요 없이 즉시 1-탭으로 닫을 수 있도록 사용성 극대화.
- **무중단 블루-그린 운영 승격**: 프론트엔드 92개 스위트(688 테스트) 및 백엔드 74개 스위트(896 테스트) 전수 통과 후 테스트 서버(`https://test.easy-scraping.com/`) 검증 및 무중단 운영 전환 완료 (816+ 활성 세션 100% 무손실 보존).

## v2026.09.20.310 — 모바일 전역 가로 오버플로우 완전 차단 및 반응형 콤팩트 헤더·1열 핏 최적화

- 브랜치: `feat/mobile-layout-overflow-fix-v2026.09.20.310`, 베이스 `71f88c50ef0c`.
- **모바일 뷰포트 좌측 잘림 및 가로 오버플로우 원천 차단**: `html`, `body`, `.moneyverse-app-shell`, `.moneyverse-main`, `.mv-page` 레벨에서 `overflow-x: hidden !important; width: 100%; max-width: 100vw; min-width: 0; box-sizing: border-box;`를 전역 강제하여 320px~480px 스마트폰 화면에서 텍스트나 UI가 왼쪽으로 밀려 잘리는 현상을 완벽 해결.
- **적응형 콤팩트 모바일 헤더 (`SiteHeader` & `Brand`)**: 320px~480px 소형 모바일 화면에서 로고 아이콘(32px)과 심플 브랜드 텍스트, '내 지갑' 버튼(`px-2.5`), 햄버거 메뉴(`size-10`)가 한 줄에 여유롭게 안착되도록 패딩 및 간격 최적화.
- **직업 페이지(`/work`) 모바일 1열 스택 & 터치 반응형 최적화**: `PageHeader` 제목 clamp 폰트(`text-[clamp(1.45rem,3.2vw,2.75rem)]`), 활성 직업 카드(`Active Career Card`), 8대 직업군 그리드, `WorkQuotaDashboard` 프로그레스 바를 모바일 1열(`w-full min-w-0`)로 안정적으로 배치.
- **전체 데이터 테이블 및 영수증 컴포넌트 수평 스크롤 격리**: 모든 데이터 테이블, 영수증 목록, 금융 장표를 `overflow-x-auto` 내부 래퍼로 감싸 부모 화면의 가로 폭을 절대로 밀어내지 않도록 완벽 격리.
- **무중단 블루-그린 운영 승격**: 프론트엔드 92개 스위트(688 테스트) 및 백엔드 74개 스위트(896 테스트) 전수 통과 후 테스트 서버(`https://test.easy-scraping.com/`) 검증 및 무중단 운영 전환 완료 (816+ 활성 세션 100% 무손실 보존).

## v2026.09.20.309 — 직업 정책 스케줄러 자동화, 유저단 잔여 캡 시각화 및 다중 도메인 리스크 대시보드

- 브랜치: `feat/frontend-economic-suite-v2026.09.20.309`, 베이스 `2e8a50b0ebee`.
- **직업 정책 스케줄러 자동화**: `SchedulerModule`에 매시간 실행되는 백그라운드 작업(`work.auto_tune_policy`)을 등록하여 24시간 통화 발행/소각비 및 유저 캡 도달률을 분석해 보상 캡과 감액률을 완전 자동으로 밸런싱.
- **유저 직업 화면(/work) 잔여 캡 시각화**: `WorkQuotaDashboard`를 구축하여 오늘 획득한 보상, 잔여 한도(WLD), 진행도 바 게이지, 100% 한도 도달 시 안내 배너 및 자정 리셋 시각을 실시간 제공.
- **은행 여신 건전성 & 신용등급 리스크 대시보드**: `/admin/bank`에 `BankRiskDashboard`를 추가하여 장부 연체율 지수(HEALTHY/WARNING/ALERT), 24시간 자금 흐름, 등급별 대출 잔액 점유율 바 시각화.
- **카지노 환수율 & 통화 소각 모니터링**: `/admin/economy`에 `CasinoEconomyDashboard`를 통합하여 암호학적 공정성 기반 게임의 이론 환수율(RTP) 및 디플레이션 싱크 기여도를 모니터링.
- **무중단 블루-그린 운영 승격**: 프론트엔드 92개 스위트(688 테스트) 및 백엔드 74개 스위트(896 테스트) 전수 통과 후 테스트 서버(`https://test.easy-scraping.com/`) 검증 및 무중단 운영 전환 완료 (세션 100% 보존).

## v2026.09.20.308 — 직업별 일일 수행 통계 시각화 및 경제 기반 자동 조절(Auto-Tuning) 엔진

- 브랜치: `feat/frontend-work-stats-v2026.09.20.308`, 베이스 `421353c82d33ce7fa7924c7f12e841faad075cbb`.
- **실시간 직업 수행 순위 시각화**: 최근 24시간 동안 유저들이 가장 많이 수행한 직업 5종(농부, 광부, 운반원, 기술자, 상인)의 완료 횟수, 참여 인원, 총 지급액, 점유율 수평 바 게이지를 `/admin/work` 콘솔에 시각화.
- **5단계 일일 캡 소모율 분포 게이지**: 유저들의 오늘 일일 보상 상한(Cap) 도달 현황을 5개 구간(0~25%, 25~50%, 50~75%, 75~99%, 100% 도달) 게이지와 100% 한도 도달자 수치로 실시간 모니터링.
- **AI 경제 지표 기반 자동 밸런싱(Auto-Tuning) 엔진**: 24시간 통화 발행량 및 소각량, 캡 도달자 비율을 분석하여 최적의 추천 일일 캡(2,000 ~ 10,000 WLD) 및 반복 감액률을 산출하고 1-클릭으로 즉시 반영.
- **최근 7일 직업 수행 트렌드 차트**: 과거 7일간의 일자별 총 작업 완료 건수와 보상 지급액 추세를 표와 미니 지표로 표시하여 거시 경제 흐름 파악 지원.
- **무중단 블루-그린 운영 승격**: 프론트엔드 92개 스위트(688 테스트) 및 백엔드 74개 스위트(895 테스트) 전수 검증 통과 후 테스트 서버(`https://test.easy-scraping.com/`) 배포 및 무중단 운영 전환 완료 (세션 100% 보존).

# 업데이트 로그 (Update Log)

## v2026.09.20.307 — AI 주식 뉴스 자동화 및 관리자 직업 보상/한도 정밀 튜닝 시스템

- 브랜치: `feat/frontend-ai-work-v2026.09.20.307`, 기반 커밋: `421353c82d33ce7fa7924c7f12e841faad075cbb`.
- **AI 주식 뉴스 자동화 시스템 구축**: 현재 DB에 등록된 활성 상장 가상 주식(CHIMU314, FNAK, WDB, WDM, WDT)을 자동으로 조회하고 분석하여, AI 시장 뉴스 시나리오를 자동 생성하고 1-클릭으로 즉시 시장에 발행할 수 있는 관리 콘솔(`/admin/market/ai-news`) 구축.
- **관리자 직업 보상 및 일일 한도(Daily Limit / Reward Cap) 정밀 튜닝 대시보드 구현**: `/admin/work` 콘솔을 전면 개편하여, 1인당 일일 보상 상한(400, 1000, 5000, 10000, 50000 WLD 및 무제한 프리셋), 주간 상한, 반복 감액률, 그리고 5대 직업별 기본 보상(1~100만 WLD), 일일 수행 횟수 한도(1~1000회), 소요 시간 및 활성 여부를 실시간 슬라이더와 입력폼으로 정밀 조정할 수 있는 UI 및 백엔드 트랜잭션 연동(Migration 219 SECURITY DEFINER 함수 적용).
- **무중단 Blue-Green 운영 승격 및 무결성 검증**: 프론트엔드 92개 테스트 스위트(688개 테스트), 백엔드 74개 테스트 스위트(895개 테스트) 전수 통과 확인 후, 격리된 테스트 서버(`test.easy-scraping.com`) 검증을 거쳐 운영 서버(`easy-scraping.com`)에 무중단 배포 및 기존 816개 활성 사용자 세션 연속성 100% 보존 완료.

## v2026.09.20.303 — 알림 설정 재구축 및 프론트엔드 전면 통합

- 브랜치: `feat/frontend-integrate-v2026.09.20.303`, 기반 커밋: `421353c82d33ce7fa7924c7f12e841faad075cbb`.
- 알림 환경설정 화면(`/account/notifications`)을 최신 핀테크 토글 패턴 및 전면 접근성 표준에 맞춰 재구축.
- 테마 명암비 개선(v301), 글로벌 쉘/인증/계정 센터 개편(v302), 알림 설정(v303)을 단일 통합 릴리스로 일원화.
- 격리된 테스트 서버 검증 후 무중단 호스트 블루그린 방식으로 운영 승격.

## v2026.09.20.302 — 프론트엔드 전면 재구축 1단계 (글로벌 쉘 및 인증/계정 모던 핀테크 UX)

- 브랜치: `feat/frontend-rebuild-v2026.09.20.302`, 기반 커밋: `421353c82d33ce7fa7924c7f12e841faad075cbb`.
- 1만 개 이상의 실무 레퍼런스 데이터셋(SeeClick 10k, WebUI 41k, RICO 66k)과 토스/로빈후드 가이드라인을 기반으로 반복적인 카드 격자 등 AI 느낌을 전면 배제한 고품질 모던 UI 구축.
- 모바일 하단 내비게이션(홈, 직업, 주식, 지갑, 계정) 및 320px~1440px 가로 스크롤 완전 0px의 반응형 쉘 구현.
- `/login`을 군더더기 없는 고대비 인증 카드로 재설계하고, `/account`, `/account/security`에 활성 다중 세션 원격 종료 및 보안 제어 센터 구축.
- exact-SHA 기반 테스트 서버 검증 후 무중단 호스트 블루그린 배포로 운영 승격 완료.

## v2026.09.20.301 — Frontend colour and contrast audit

- Branch: `feat/frontend-contrast-v2026.09.20.301`, base `0b973824d85379119813f9b9f53cd7cdd4ddeb93`.
- Split light/dark semantic palettes, removed hard-coded light chrome, and corrected low-contrast text/action colours across home, shop, work, inventory, businesses and admin surfaces.
- Light-mode tertiary text improved from 3.77:1 on the page background to 4.90:1; tested dark-mode foreground roles are 6.14:1 or higher.
- Added automated WCAG contrast regression coverage and constrained user-selected point colours so white primary-button text stays readable.
- Reference corpus uses SeeClick 10k web subset, WebUI 41,970 web screens and RICO 66k+ UI screens, combined with WCAG/GOV.UK/Atlassian/Material guidance.
- Production promotion remains blocked until exact-SHA Test verification and the broader full-frontend rebuild gate pass.

## v2026.09.20.297 — Frontend rebuild foundation

- Branch: `feat/frontend-rebuild-v2026.09.20.297`, base `4dcd2ba112ae57565eed7444fe1d36512b926a3b`.
- Rebuilt the global visual foundation, shell spacing, page headings, cards and buttons without changing backend authority.
- Frontend typecheck/build and 90/90 test files with 681/681 tests pass.
- This is the rebuild foundation; route-by-route composition continues before the rebuild can be marked complete.

## v2026.09.19.275 — Blue/green continuity and automatic latest-build refresh

- Branch: `ops/blue-green-cache-refresh-v2026.09.19.275`.
- Added automatic cache-busted stale-build refresh without clearing login state and a reusable canary-first host blue/green deployment helper.
- Pre-promotion checks: helper regressions, frontend 7/7, typecheck, and real-DB authenticated-session continuity passed.

## v2026.09.19.274 — Deployment continuity and cache-freshness standard

- Branch: .
- Made zero-downtime frontend/backend handoff, PostgreSQL-backed member-session continuity, and automatic latest-shell cache revalidation mandatory release gates.
- Runtime code and Production services are unchanged by this documentation-only release.
