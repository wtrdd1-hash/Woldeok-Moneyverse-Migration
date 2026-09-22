# 1:1 개인 채팅 안전 제어, 한국어 IME 조합 보호 및 긴급 거버넌스 엔진 (v2026.09.22.353)

- **작성일자**: 2026-09-22 17:45 KST
- **릴리스 버전**: `v2026.09.22.353`
- **배포 릴리스 경로**: `/srv/moneyverse-data/releases/prod-dc011ee-v353`
- **Exact Git SHA**: `dc011eeebf581cc32d4127754f03010fdaf988f2` (단축: `dc011ee`)
- **보존 활성 세션**: PostgreSQL 929개 세션 100% 무손실 보존

---

## 1. 개요 및 배경

본 릴리스는 `PROJECT_PLAN.ko.md` 및 `ONE_TO_ONE_PRIVATE_CHAT_SPEC.ko.md`의 최우선 P0 긴급 과제인 **1:1 개인 채팅 안전 제어(회원 차단, 음소거, 신고 시스템)**와 **한국어 IME 입력기 글자 조합(`isComposing`) 오발송 방지 가드**를 전격 구현하고, PostgreSQL 마이그레이션 227번부터 프론트엔드 토스풍 인터랙션 모달까지 풀스택으로 완성하여 프로덕션에 무중단 배포한 릴리스입니다.

---

## 2. 4대 핵심 구현 내역

### ① PostgreSQL 마이그레이션 227 (`227-private-chat-safety-controls.sql`)
- **차단 테이블 (`private_chat_blocks`)**:
  - `blocker_id`와 `blocked_id`의 일방/상호 차단 관계 기록.
  - 자기 자신 차단 방지 제약조건 (`CHECK (blocker_id <> blocked_id)`).
  - 차단 해제 시 복구를 위한 유니크 인덱스 적용.
- **신고 테이블 (`private_chat_reports`)**:
  - 신고자, 피신고자, 대화방 ID, 4대 정책 사유(`SPAM_ABUSE`, `HARASSMENT_THREAT`, `FRAUD_FINANCIAL`, `PROHIBITED_CONTENT`), 상세 서술.
  - 신고 당시의 최근 10개 메시지 내역을 불변 증거로 보존하는 `evidence_snapshot` (JSONB) 필드 탑재.
- **저장 프로시저 5종 및 Fail-Closed 보안 가드**:
  - `private_chat_mute`: 대화방 알림 음소거 토글.
  - `private_chat_block` / `private_chat_unblock`: 사용자 차단 및 해제.
  - `private_chat_is_blocked`: 양방향 차단 여부 판별.
  - `private_chat_report`: 10개 메시지 자동 스냅샷 수집 및 신고 레코드 생성.
  - `private_chat_send` 보안 강화: 대화 상대방과 차단 관계(`private_chat_is_blocked`)인 경우 DB 레벨에서 즉각 `RAISE EXCEPTION 42501 (Blocked)`을 발생시켜 우회 메시지 전송을 원천 차단.

### ② 백엔드 NestJS 채팅 안전 제어 API (`backend/src/chat/`)
- **엔드포인트 4종 신설**:
  - `POST /api/v1/chat/conversations/:id/mute`: 알림 음소거 설정/해제.
  - `POST /api/v1/chat/users/:id/block`: 사용자 차단.
  - `DELETE /api/v1/chat/users/:id/block`: 사용자 차단 해제.
  - `POST /api/v1/chat/conversations/:id/report`: 4대 사유 기반 신고 및 증거 스냅샷 저장.
- **서비스 및 레포지토리 로직**:
  - 42501(차단됨) 예외 시 HTTP 403 Forbidden 반환.
  - 대화방 목록 조회 시 `is_peer_blocked` 플래그를 추가 반환하여 UI에 즉시 반영.
  - 감사 로그(`audit_logs`) 연동으로 차단 및 신고 이벤트를 영구 기록.

### ③ 프론트엔드 FinTech UX & 한국어 IME 조합 보호 (`frontend/src/app/chat/`)
- **적용 스킬**: `fintech-responsive-layout-engine`, `anti-ai-frontend-craftsmanship`
- **한국어 IME 조합 가드 (`isComposing`)**:
  - 한글 입력 중 엔터 키 입력 시 자모가 조합 중인 상태에서 빈 메시지나 불완전한 텍스트가 전송되는 현상을 `e.nativeEvent.isComposing` 감지로 완벽 차단.
- **토스/모바일 메신저 스타일 하이브리드 UI**:
  - 채팅방 헤더 우측 상단 3도트 더보기 메뉴(More Vertical) 제공.
  - 알림 음소거 토글 스위치, 빨간색 경고 스타일의 차단/해제 대화상자.
  - 라디오 버튼 선택 및 상세 사유 입력이 가능한 4대 사유 신고 모달.
  - 대화 상대방이 차단된 경우 하단 메시지 입력창 대신 명확한 "차단된 대화방" 경고 배너 및 차단 해제 바로가기 버튼 표시.
  - 최소 44px 터치 타깃 및 320px 모바일 완벽 대응 반응형 레이아웃.
- **대화방 목록 시각적 상태 표시**:
  - 음소거된 방에 `BellOff` 회색 아이콘 표시.
  - 차단된 방에 `차단됨` 배지 표시.

### ④ Vitest 단위 테스트 및 회귀 검증 (`chat-safety.test.ts`)
- `frontend/src/app/chat/chat-safety.test.ts` 테스트 스위트 4종 작성:
  1. `isComposing` 플래그 활성화 시 엔터 키 입력 전송 방지 검증.
  2. 차단 상태일 때 메시지 입력 폼 비활성화 및 배너 표시 검증.
  3. 4대 신고 사유 매핑 및 유효성 검증.
  4. 알림 음소거 토글 상태 관리 검증.
- 4개 테스트 케이스 100% 통과 (PASS).

---

## 3. 런타임 승격 배포 검증 결과

```bash
=== Staging Release v353 (dc011ee) ===
Full Commit SHA: dc011eeebf581cc32d4127754f03010fdaf988f2
Base Release: /srv/moneyverse-data/releases/prod-f609af8-v352
Building Next.js frontend with embedded commit SHA dc011ee...
Step 7: Pointing test-current symlink to test-dc011ee-v353...
Step 9: Verifying test environment...
runtime identity coherent: https://test.easy-scraping.com backend=dc011ee... frontend=dc011ee...
All test endpoints responded 200 OK!
Step 11: Updating production-current symlink to prod-dc011ee-v353...
Step 13: Verifying production environment...
runtime identity coherent: https://easy-scraping.com backend=dc011ee... frontend=dc011ee...
Checking production server endpoints...
All production endpoints responded 200 OK!
Step 14: Verifying active user sessions...
   929

=== Release v353 (dc011ee) Promotion Completed Successfully ===
```
