# 관리자 약관 버전 실시간 개정 콘솔 & G352 거버넌스 및 불변 릴리스 원장 롤백 엔진 (v2026.09.22.352)

- **작성일자**: 2026-09-22 17:00 KST
- **릴리스 버전**: `v2026.09.22.352`
- **배포 릴리스 경로**: `/srv/moneyverse-data/releases/prod-f609af8-v352`
- **Exact Git SHA**: `f609af8351a0fddc691afe15bb913b6855d6a32e` (단축: `f609af8`)
- **보존 활성 세션**: PostgreSQL 929개 세션 100% 무손실 보존

---

## 1. 개요 및 배경

본 릴리스는 직전 `v350`에서 구축된 동적 정책 바인딩과 비상 롤백 스크립트를 바탕으로, GPT의 v352 기획 권위 계약(G352-01 ~ G352-04)을 전격 구현하고, 관리자가 별도 소스코드 재배포 없이 웹 콘솔(`/admin/controls`)에서 직접 2단계 확인을 거쳐 약관 및 개인정보 정책을 실시간으로 발행할 수 있는 엔터프라이즈급 관리 인터페이스를 완성한 릴리스입니다.

---

## 2. 4대 핵심 구현 내역

### ① 관리자 약관 버전 실시간 발행 콘솔 (`/admin/controls`)
- **적용 스킬**: `admin-control-tower-craft`, `anti-ai-frontend-craftsmanship`
- **백엔드**:
  - `POST /api/v1/admin/controls/consent-versions` 엔드포인트 신설.
  - 2단계 확인 문구(`PUBLISH_NEW_POLICY_VERSION`) 검증 및 `audit_logs`에 사유, 관리자 ID, 신규 버전 영구 보존.
  - `Superadmin` 전용 권한 게이트 적용.
  - `GET /api/v1/admin/controls/consent-versions`로 최근 개정 이력 20건 조회 지원.
- **프론트엔드**:
  - `frontend/src/app/admin/controls/policy-version-card.tsx`: 현재 활성 버전 배지 표시 및 2단계 확인 모달 연동.
  - `actions.ts`: `publishConsentVersionAction` 서버 액션 탑재 및 `revalidatePath` 호출.

### ② G352-01 준수: Fail-Safe 동의 제출 방어 (`ConsentStepUpModal`)
- 정책 API(`GET /auth/policy`) 장애나 미동기화 상태 시, 임의의 하드코딩된 Fallback 값을 권위 동의 버전으로 오인하여 DB에 저장하지 않도록 차단.
- `termsVersion` 또는 `privacyVersion`이 유효하게 서버로부터 주입되지 않은 경우 동의 제출 버튼을 `비활성화(disabled)`하고 "최신 정책 동기화 중..." 상태 표시.
- 인라인 [정책 새로고침 시도] 버튼 제공으로 일시적 네트워크 단절 복구 지원.

### ③ G352-02 & G352-04 준수: docs/releases/ledger.json 불변 릴리스 원장 및 롤백 엔진 고도화
- 불변 증거 원장 파일 `docs/releases/ledger.json` 신설 (v347, v347.1, v350, v352 등록).
- `ops/release/rollback_production.sh`에서 `ledger.json`을 파싱하여 직전 `promoted` 상태의 verified candidate를 자동 선택하도록 고도화.
- Docker PostgreSQL 활성 세션(929+개) 실시간 안전 가드 쿼리 연동.

### ④ G352-03 준수: normalizePath 경로 정규화 및 화이트리스트 우회 방지 (`path-utils.ts`, `consent-guard.test.ts`)
- `frontend/src/lib/path-utils.ts`: URL 디코딩, 소문자화, 연속 슬래시 치환, 디렉터리 트래버설(`..`)을 정규화하는 `normalizePath` 유틸 구현.
- `ConsentGuard`의 화이트리스트 검사에 `normalizePath(pathname)` 적용.
- `frontend/src/components/consent-guard.test.ts`: Vitest 단위 테스트 7종(인코딩, 대소문자, 중복 슬래시, 트래버설 차단 등) 100% 통과.

---

## 3. 런타임 검증 결과

```bash
=== Staging Release v352 (f609af8) ===
Full Commit SHA: f609af8351a0fddc691afe15bb913b6855d6a32e
Base Release: /srv/moneyverse-data/releases/prod-d67a915-v350
Step 7: Pointing test-current symlink to test-f609af8-v352...
Step 9: Verifying test environment...
runtime identity coherent: https://test.easy-scraping.com backend=f609af8... frontend=f609af8...
All test endpoints responded 200 OK!
Step 11: Updating production-current symlink to prod-f609af8-v352...
Step 13: Verifying production environment...
runtime identity coherent: https://easy-scraping.com backend=f609af8... frontend=f609af8...
Checking production server endpoints...
All production endpoints responded 200 OK!
Step 14: Verifying active user sessions...
   929

=== Release v352 (f609af8) Promotion Completed Successfully ===
```
