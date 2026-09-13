# 변경내역 — 앱 API 심사 준비 v2026.09.13.46

날짜: 2026-09-13
영어 원문: [2026-09-13-app-api-review-v2026.09.13.46.md](2026-09-13-app-api-review-v2026.09.13.46.md)

## 수정
- 자체 이메일 회원가입 완료 단계의 `user_consents` conflict target에서 발생하던 PostgreSQL SQLSTATE 42702 수정.
- `/app-api/v1/media/*`를 backend version-neutral `/media/*`로 연결.
- 앱 OAuth 시작/callback을 backend version-neutral `/auth/:provider/*`로 연결.

## 검증
- 격리된 새 PostgreSQL에서 0~183 migration 전체 적용 성공.
- 실제 `moneyverse_app` 권한의 자체 회원가입 완료 회귀 테스트 성공.
- 운영 runtime route map과 앱 BFF 범위를 다시 대조.

## 문서
- `docs/mobile-api-reference.md` 및 한국어 2차 문서에 세션/CSRF/인증/이미지 업로드/전체 앱 route 사용법 기록.
