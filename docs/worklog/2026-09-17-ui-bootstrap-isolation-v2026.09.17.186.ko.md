# 내부 작업내역 — v2026.09.17.186 UI Bootstrap 격리

- 날짜: 2026-09-17
- 브랜치: `fix/ui-bootstrap-collision-v2026.09.17.186`
- 정확한 기준: `17801cab463e9c93490b3f93f03c719f95896cb0`
- 범위: frontend 전역 스타일 격리 + 회귀 방지 테스트, backend/DB 변경 없음.

## 원인

v175 셸이 Bootstrap 5.3.8 전체 CSS를 전역 import했다. Bootstrap의 `.bg-primary`, `.text-primary`, `.border-primary` 같은 범용 utility는 `!important`를 사용하고 제품 Tailwind 의미 utility 이름과 충돌해 Bootstrap 기본 파란색/스타일이 제품 UI를 덮었다.

## 수정

- `frontend/src/app/layout.tsx`에서 Bootstrap 전역 import 제거.
- 다운로드한 vendor CSS는 `frontend/src/styles/vendor/`에 그대로 유지하고 외부 CDN은 추가하지 않음.
- `ui-style-isolation.test.ts`를 추가해 Bootstrap 전역 재도입과 제품 global style 순서 회귀를 방지.

## 로컬 QA

- Contract build PASS.
- 변경 runtime/test 파일 ESLint PASS.
- Frontend typecheck PASS.
- Frontend Vitest 69 files / 616 tests PASS.
- Next.js production build PASS.
- Isolated Test, main 병합, Production 승격/사후 smoke는 후속 릴리스 gate이며 이 사전 기록에서 완료로 주장하지 않음.
