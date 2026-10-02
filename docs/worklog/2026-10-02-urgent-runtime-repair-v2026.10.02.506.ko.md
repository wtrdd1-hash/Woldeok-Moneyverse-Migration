# v2026.10.02.506 — 긴급 런타임 복구 작업기록

상태: 진행 중
브랜치: `fix/urgent-runtime-v2026.10.02.506`
기준 권위: `origin/main=5a7c658b38853f564983d19f961c689a494dc4b6`
날짜: 2026-10-02 KST

## 시작 기록
- 시작 사유: v2026.10.02.505 전 사이트 감사의 P0 항목.
- 범위: 로그인 1:1 채팅 500 반복, frontend runtime cache EACCES, Test/Production exact-candidate 런타임 정합성.
- 가드레일: Production DB/세션 데이터 보존, 파괴적 Test DB 초기화 금지, Test 우선 검증, Production 무중단 승격, rollback target 유지.
- 채팅 원인 확정: `PostgresChatRepository.listConversations()`가 존재하지 않는 `public.user_profiles` / `avatar_key`를 JOIN하고 있으며 실제 운영 스키마는 `public.member_profiles.image_url`을 사용한다.
- 기존 Test DB는 저장소 migration 27개 누락 + 과거 extra migration 1개가 있어 exact candidate 검증에 그대로 사용할 수 없다. 기존 Test DB는 보존한다.

## TDD 기록
- 권위 `member_profiles.image_url`을 사용하는 채팅 peer avatar 회귀 테스트 추가.
- 현재 코드에서 RED 확인.
- 최소 repository query 수정 후 집중 테스트 GREEN 확인.
