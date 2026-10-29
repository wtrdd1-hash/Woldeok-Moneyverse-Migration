# 2026-10-29 개발 A — 검증 도움말 게시일 표시 및 Android 캐시 보호

- Debian 13.6 미니PC·개발 PostgreSQL 직접 확인. 최신 main `b84d645a87e8fa0d544ca3ee17e785e737e477ea`에서 별도 브랜치·worktree 생성. AGENTS/README/영문·국문 통합기획서/QA v1365/PR/CI 확인.
- 승인된 PostgreSQL 도움말 읽기 함수가 반환하는 실제 `published_at`을 검색 결과·상세 화면에 한국어/영어와 KST로 표시. 비정상·누락 날짜는 표시하지 않으며 검토일로 오인시키지 않음. Android API는 원본 시각 유지, 상위 서버의 잘못된 공개 캐시 설정은 `private, no-store`로 덮어씀.
- TDD RED→GREEN: Frontend 35, Backend 3, DB 계약 5 PASS. 네트워크 차단 격리 PostgreSQL 17.11에서 migration 282, 정상·거부·만료 자료, 검색/상세 시각 일치, 최소권한 검증 PASS. 테스트 DB 제거. 기존 SQL·원장·권한·마이그레이션 변경 없음.
- 전체 Lint 오류 0건(기존 경고 1,091건). 최초 Typecheck는 테스트 모의 함수 인자 타입 오류로 실패 후 수정. 호스트 RAM·swap 과부하로 본 회차의 중복 로컬 빌드·검증 프로세스만 안전하게 종료. 전체 게이트는 정확 SHA GitHub CI 근거가 필요하며 성공으로 허위 기록하지 않음.
- 전체 감사: 원격 브랜치 132개, 열린 Draft PR 128개, Head 불일치·중복 0, 충돌 39, 과거 실패 85, 미통합 고유 브랜치 130개. 삭제 0. #1839의 검색·Android 캐시 수정과 중복되므로 병합 전 순차 재기반 필수.
- 공식 Test·Production 모두 앱 `b44ffd0a...`, 도움말 HTTP 404(기능 OFF). 본 후보 미배포. 금융 출처·체크섬·백업 복원·인증 E2E 게이트 미충족으로 병합·운영 승격 보류. 운영 DB·원장·롤백·예약·다른 개발자의 작업 변경 없음.
