# 관리자 1:1 개인 채팅 신고 심사 큐, 10건 증거 스냅샷 뷰어 및 조치 거버넌스 엔진 (v2026.09.22.354)

- **작성일자**: 2026-09-22 18:02 KST
- **릴리스 버전**: `v2026.09.22.354`
- **배포 릴리스 경로**: `/srv/moneyverse-data/releases/prod-e60cf71-v354`
- **Exact Git SHA**: `e60cf71ed4088c5839e5e79474f83bf7d09cc2ad` (단축: `e60cf71`)
- **보존 활성 세션**: PostgreSQL 929개 세션 100% 무손실 보존

---

## 1. 개요 및 배경

본 릴리스는 직전 `v353`의 1:1 개인 채팅 안전 제어(차단/음소거/신고) 기능을 바탕으로, `ONE_TO_ONE_PRIVATE_CHAT_SPEC.ko.md` 14절(신고·moderation) 및 23절(운영·관리자 지표), `PROJECT_PLAN.ko.md` P0 긴급 거버넌스 계약을 전격 구현한 릴리스입니다. 관리자가 `/admin/safety` 콘솔에서 접수된 신고를 실시간으로 심사하고, 신고 시점의 10개 메시지 불변 증거 스냅샷(`evidence_snapshot` JSONB)을 안전하게 열람하며, 적법한 제재(경고/차단/기각)를 확정하고 영구 감사 로그를 남길 수 있는 전 과정이 완성되었습니다.

---

## 2. 4대 핵심 구현 내역

### ① PostgreSQL 마이그레이션 228 (`228-private-chat-moderation-admin.sql`)
- **관리자 신고 큐 목록 함수 (`private_chat_admin_list_reports`)**:
  - `operator` 또는 `superadmin` 역할 보유자만 실행 가능한 `SECURITY DEFINER` 함수.
  - 신고자/피신고자 닉네임, 계정 ID, 4대 사유, 상세 서술, 캡처된 증거 메시지 건수, 처리 상태, 일시를 페이징 반환.
- **증거 스냅샷 안전 열람 함수 (`private_chat_admin_get_report`)**:
  - 신고 당시 보존된 10개 메시지 JSONB 전문을 반환.
  - 기획서 14절의 엄격한 감사 원칙 준수: 열람 실행 시 `public.audit_logs`에 `CHAT_REPORT_EVIDENCE_VIEWED` 불변 레코드를 자동 기록(열람 관리자, 피신고자, 대화방 ID, 증거 건수 보존).
- **조치 확정 및 제재 함수 (`private_chat_admin_action_report`)**:
  - `ACTIONED_BLOCKED`, `ACTIONED_WARNED`, `REJECTED` 3대 상태 전이 검증.
  - 상태 갱신 및 `public.audit_logs`에 `CHAT_REPORT_ACTIONED` 감사 원장(이전 상태, 변경 상태, 관리자 메모, 대화방 ID) 영구 기록.
- **최소 권한 원칙(Least-Privilege)**:
  - 소유권 `moneyverse_migrator`, 실행 권한 `moneyverse_app`에만 한정 부여.

### ② 백엔드 NestJS 안전 모듈 API 확장 (`backend/src/safety/`)
- **엔드포인트 3종**:
  - `GET /api/v1/admin/safety/chat-reports`: 관리자 세션 가드 기반 신고 큐 목록 조회.
  - `GET /api/v1/admin/safety/chat-reports/:id`: 특정 신고 건 및 증거 스냅샷 조회.
  - `POST /api/v1/admin/safety/chat-reports/:id/action`: 모더레이션 조치 실행 및 CSRF 보호.
- **서비스 및 레포지토리**:
  - `AdminChatReportActionSchema`, `AdminChatReportQuerySchema` Zod 스키마 검증.
  - `exactOptionalPropertyTypes` 엄격 호환성 준수.

### ③ 프론트엔드 관리자 안전 관제 타워 전면 쇄신 (`frontend/src/app/admin/safety/`)
- **적용 스킬**: `admin-control-tower-craft`, `anti-ai-frontend-craftsmanship`, `fintech-responsive-layout-engine`
- **2대 큐 탭 인터페이스**:
  - 탭 1: `1:1 개인 채팅 신고 심사 큐` (긴급 P0)
  - 탭 2: `비회원 긴급 콘텐츠 삭제 큐` (TAKE IT DOWN Act)
- **증거 스냅샷 타임라인 뷰어 모달 (`ChatReportEvidenceDialog`)**:
  - 신고 당시 보존된 10개 메시지를 카카오톡/토스풍 좌우 말풍선으로 시각화.
  - 피신고자(빨간색 강조)와 신고자 말풍선 구별, 메시지별 고유 순번(`#1`), 발신 시각 표시.
  - 서버 액션 브릿지(`getChatReportDetailAction`)를 통해 `server-only` 모듈 번들링 에러 원천 차단.
- **원터치 조치 다이얼로그 (`ChatReportActionDialog`)**:
  - 경고 발송, 피신고자 계정 제재/차단, 무혐의 기각 라디오 그룹.
  - 조치 사유 메모(2~500자) 필수 입력 및 인라인 2단계 확인.
  - 320px 모바일 및 44px 이상 터치 타깃 완벽 준수.

### ④ Vitest 단위 테스트 4종 100% 통과 (`admin-chat-moderation.test.ts`)
1. 조치 유효 상태 검증 (`ACTIONED_BLOCKED`, `ACTIONED_WARNED`, `REJECTED`).
2. 4대 신고 사유 카테고리 매핑 검증.
3. 증거 스냅샷 메시지 순번 정렬 및 피신고자 발신 식별 검증.
4. 조치 시 관리자 감사 사유 메모 유효성(최소/최대 길이) 검증.

---

## 3. 런타임 승격 배포 검증 결과

```bash
=== Staging Release v354 (e60cf71) ===
Full Commit SHA: e60cf71ed4088c5839e5e79474f83bf7d09cc2ad
Base Release: /srv/moneyverse-data/releases/prod-dc011ee-v353
Step 7: Pointing test-current symlink to test-e60cf71-v354...
Step 8: Restarting test services...
Step 9: Verifying test environment...
runtime identity coherent: https://test.easy-scraping.com backend=e60cf71... frontend=e60cf71...
Checking test server endpoints...
All test endpoints responded 200 OK!
Step 11: Updating production-current symlink to prod-e60cf71-v354...
Step 12: Zero-downtime reloading production services...
Step 13: Verifying production environment...
runtime identity coherent: https://easy-scraping.com backend=e60cf71... frontend=e60cf71...
Checking production server endpoints...
All production endpoints responded 200 OK!
Step 14: Verifying active user sessions...
   929

=== Release v354 (e60cf71) Promotion Completed Successfully ===
```
