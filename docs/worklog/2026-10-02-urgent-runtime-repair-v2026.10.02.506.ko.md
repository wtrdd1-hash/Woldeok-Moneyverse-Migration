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

## 중간 기록
- 기존 Test DB는 저장소 기준 27개 migration 누락 + 역사적 extra migration 1개로 stale 상태임을 확인하고 원본 DB를 그대로 보존했습니다.
- 별도 `woldeok_moneyverse_v506_test` DB를 생성해 권위 001 + 002~242 migration을 적용했습니다.
- fresh DB에서 최신 least-privilege 경계를 적용하자 기존 ChatRepository의 테이블 직접 접근이 42501로 거부되어 구조적 결함을 추가 확인했습니다.
- migration 243으로 chat 목록/history/sync/unread/archive SECURITY DEFINER 계약을 추가하고 private chat 테이블 직접 권한은 계속 차단했습니다.
- 실제 `moneyverse_app` 통합 사이클: direct table DENY, open/list/send/history/sync/unread/archive/unarchive PASS.
- fresh DB 전체 테스트 중 기존 migration 240~242가 PUBLIC SECURITY DEFINER 실행권 6개와 treasury 직접 DML 권한 4개를 남긴 보안 회귀를 발견했습니다.
- migration 244로 PUBLIC 실행권 및 application direct DML을 제거하고 시민 예산 투표를 SECURITY DEFINER 함수 경유로 변경했습니다.
- 검증: database package 7/7 PASS, backend typecheck PASS, backend 170 files / 1,639 tests PASS, casino E2E 29개 environment skip.
