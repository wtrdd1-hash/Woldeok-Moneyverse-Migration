# v2026.09.20.293 — 프로필 획득 칭호 선택

- 최소 권한 `member_earned_titles` DB 조회와 `GET /profile/titles` API/App API 경로를 추가했습니다.
- 프로필 편집 화면은 모든 기본 칭호가 아니라 로그인한 회원이 실제로 획득한 칭호만 선택지로 보여 줍니다.
- 기존에 표시 중인 레거시 칭호는 교체 저장 과정에서 실수로 해제되지 않도록 유지합니다.
- 검증: backend/frontend typecheck, backend/frontend 전체 테스트, 모바일 API 계약 생성/검사, 병합 전 exact-SHA CI.
