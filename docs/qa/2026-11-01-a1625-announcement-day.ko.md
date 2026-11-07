# 개발 A 2026-11-01 16:25 — 공개 공지 한국시간 게시일 검색 QA

**판정: P1 코드 구현 / 대상 PASS / Frontend 전체 PASS / Backend 전체 2건 FAIL / 개발 PostgreSQL 조회 PASS / 운영 배포 HOLD.**

- 기준 main: 1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0. 분리 브랜치 auto/hourly-a-20261101-1625-announcement-day, Draft PR #2347.
- 최근 승인·공개 공지 최대 20건에서 한국시간 게시일로 검색. 웹·Nest 공개/App API·PostgreSQL 함수 조회 결과·Android API에 반영. 날짜 유효성, 검증 가능한 응답, 검색 결과 캐시 금지/색인 방지 및 접근성 테스트 추가. 전체 과거 공지 검색은 아님.
- Backend 대상 21 PASS, Frontend 기존 대상 5 PASS, 추가 페이지 테스트 3 PASS, 최종 Frontend 대상 8 PASS. Backend 전체 **2,974 PASS / 2 FAIL / 518 SKIP**(프로필 HTTP 200 예상/401 반환). Frontend 전체 **2,910 PASS**(NODE_ENV=test). 초기 NODE_ENV=production 실행에서 React.act 미제공으로 496건 실패했으며 해당 실행은 통과로 간주하지 않음.
- Typecheck, Backend/Frontend build, DB 단위테스트, 보안 대상 검사, Android API 계약 184개 PASS. Lint 오류 0/경고 1,022.
- 실제 개발 PostgreSQL 17.11에서 앱 역할로 읽기 전용 확인: 한국시간 2026-10-14 해당 1건/인접 날짜 0건. 공개 함수 EXECUTE 허용. 개발 DB public.announcements 직접 SELECT 권한은 **P0 최소 권한 위반**. 운영 DB 동일 여부는 미확인.
- 코드 SHA 601e0e0684786569cfc21f84d8a5b60c7c94c90f의 GitHub CI와 후보 이미지 빌드는 SUCCESS. 최종 테스트·문서 SHA는 별도 재검증 필요.
- 공식 Test bc8cd8a6…는 후보와 불일치. Production Backend 353c6d5d…, Frontend 1793450413898로 정확한 출처 증명 불가. 공식 Test 정확 SHA 인증 E2E, 독립 복원, ACL 및 GitOps 게이트 미충족 → **병합·운영 배포 금지**.
- 시작 브랜치 110개/열린 PR 101개, 종료 브랜치 113개/열린 Draft PR 104개(충돌 22개). 미통합 고유 커밋 브랜치 106개 보존, 선조·동일 6개도 소유 확인 전 보존. 삭제/병합/배포/운영 DB 변경/서비스 재시작/롤백 0건.
- 상세 로그: /srv/moneyverse-data/tasks/mv-a-20261101-1625-announcement-day/logs/.
