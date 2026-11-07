# 릴리스 게이트 — 개발 A 09:25 시장 이벤트 방향 필터

**DRAFT / 운영 배포 보류.** 배포 및 마이그레이션 없음. 별도 브랜치에서 공개 읽기 전용 `direction=up|down` 구현, 기존 무필터 API 유지. Frontend 전체 테스트 기존 관리자 세션 2건 실패, 최종 SHA CI, 격리 Test 인증 E2E, 개발 DB 최소 권한 P0, 독립 백업 복원 및 운영 실행 파일 출처 미검증으로 main 병합 금지. Test/Production은 후보 이전 버전. 롤백은 코드 revert 또는 링크 제거이며 DB/원장 복구는 불필요.

시작 원격 브랜치 64개/열린 PR 62개, Draft PR #2293 이후 종료 65개/63개. 브랜치 삭제·병합 0건, 고유 미통합 작업 보존. 최초 코드 SHA `0ec87cf3d55ab669699f6e7da4b0146c00a000d6`, 최종 기록 SHA는 PR 참조. 정확 SHA CI 진행 중.

v3 게이트: 필터된 빈 결과에도 `appliedDirection` 검증 필수, 무필터 기존 응답 유지. Backend 전체 2,962 PASS/517 SKIP, Frontend 최신 전체 EPIPE 중단 및 기존 2건 실패, 스레드 제한 Next 빌드 PASS, Lint 오류 0. 운영 HOLD 유지.

v4: Android API 계약·영문/국문 참조 재생성, 기존 이벤트 필드 보존 및 선택적 `appliedDirection` 반영. 필터 요청의 출처 증거 필수. 운영 HOLD 유지.
