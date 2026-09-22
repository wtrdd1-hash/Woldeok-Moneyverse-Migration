# 사진 업로드 step-up — v2026.09.22.333

## 상태
로컬 완료; CI 및 배포 대기.

## 범위
관리자 비공개 이미지 바이트 업로드는 private storage를 변경하지만 관리자 세션과 CSRF만 요구하고 최근 재인증은 요구하지 않았습니다. API 계약, operator 역할 검사, 저장소 검증, DB/ledger 경로를 변경하지 않고 `ReauthGuard`를 추가했습니다.

## 검증
- 컨트롤러 guard metadata focused Vitest 회귀 테스트.
- Backend TypeScript typecheck.
- `git diff --check`.
