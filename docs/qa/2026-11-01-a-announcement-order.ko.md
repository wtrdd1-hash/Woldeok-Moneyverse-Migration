# 개발 A — 공개 공지사항 정렬 QA (2026-11-01)

**상태: DRAFT / 운영 배포 보류.** 본 기록은 후보 검증이며 공식 Test 인증이 아닙니다.

- 기준 main `3d5e321c3d1221febff677469fecdfcb3cf42e7d`, 기능 SHA `f636d193bb6a3d641b2a1734fdbaa6873444e842`; 격리 브랜치 `auto/hourly-a-20261101-2055-announcement-order` 및 별도 worktree에서만 작업했습니다.
- 시작 감사: 열린 PR 122개(초안 121개, 충돌 27개), 원격 추적 ref 136개(main 포함), 고유 미통합 비-main 브랜치 125개·고유 커밋 없는 브랜치 10개. 종료 감사: 열린 PR 125개(초안 124개, 충돌 27개), 실제 원격 브랜치 138개(main 포함), 고유 미통합 128개·고유 커밋 없음 9개. 원격 추적에 남은 오래된 ref 1개는 실제 원격 집계에서 제외했습니다. 다른 작업을 보호해 삭제 0건입니다.
- Draft PR #2377을 `hold` 상태로 생성했습니다. AGENTS.md, README.md, 영문 PROJECT_PLAN.md·INTEGRATED_PLANNING_MASTER.md, 한국어 PROJECT_PLAN.ko.md, QA·개발 기록을 검토했습니다. 병행 기획자가 관리하는 통합기획서는 수정하지 않았습니다.
- 기존 `SECURITY DEFINER` 함수가 반환한 **고정 공지 우선 최대 20건**만 최신순·오래된순으로 재정렬합니다. 전체 과거 공지 검색이 아닙니다. 웹·Nest·Android app-api에 입력 검증, 접근성 있는 정렬 폼, 비색인·캐시 금지, 검증 불가능한 HTTP 200 차단을 적용했습니다.
- 대상 테스트: Backend 10건 PASS, Frontend/Android 5건 PASS. 운영 의존성 보안 감사 EXIT 0, 알려진 취약점 0건(Node url.parse 경고). 전체 Typecheck PASS, 최종 Backend Typecheck PASS. 전체 Lint 종료코드 0·오류 0·경고 1027, 변경 파일 Lint 종료코드 0·오류 0·기존 경고 1. 최초 Build는 1024MB Node heap OOM으로 실패했으나 2560MB 재실행에서 Next Build 및 602개 정적 페이지 생성 PASS입니다.
- Backend 최초 전체: 2973 PASS / 2 FAIL / 518 SKIP. `NODE_ENV=test` 누락으로 프로필 인증 HTTP 200 기대값 대비 401이 반환됐으며, 올바른 환경에서 해당 테스트 8건은 모두 PASS했습니다. 올바른 `NODE_ENV=test`로 재실행한 Backend 전체 **2976 PASS / 0 FAIL / 518 SKIP**을 확인했습니다. SKIP 518건은 PASS가 아닙니다. Frontend 최초 전체 실행은 `NODE_ENV=test` 누락으로 2380 PASS/496 FAIL이 발생한 잘못된 실행 환경입니다. 유효한 품질 판정이 아니며, 올바른 `NODE_ENV=test`로 재실행한 Frontend 전체 **2909 PASS / 0 FAIL(557개 파일)**을 확인했습니다.
- 개발 PostgreSQL 17.11에서 moneyverse_app 역할로 READ ONLY/ROLLBACK 검증: 함수 EXECUTE 허용, 실제 공개 공지 1건. 다중 데이터 정렬 양성 검증 미완료. 개발 DB 함수는 SECURITY DEFINER=true이나 소유자가 AGENTS.md의 `moneyverse_migrator`와 달리 `postgres`인 출처 차이도 확인했습니다(운영 DB 단정 금지). 개발 DB의 announcements SELECT 및 account_balances UPDATE 직접 권한 허용은 기존 P0 #993 문제이며 운영 DB 상태를 의미하지 않습니다.
- 21:09 KST 공개 버전은 Test `e39af10f6a876f56b40b7e5a070cdb3dcb61d699`, Production `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`로 후보와 다릅니다. 정확 SHA 공식 Test 인증 E2E·독립 백업 복원·GitOps 릴리스·운영 출처 검증 미완료. main 병합, DB 변경, 서비스 재시작, Test/Production 배포, 롤백, 브랜치 삭제 모두 0건입니다.

**결론: 부분 구현 및 대상 테스트 PASS, 전체 릴리스 게이트 FAIL/BLOCKED → 운영 HOLD.** 세부 근거와 향후 재검증 조건은 영어 정본 `2026-11-01-a-announcement-order.md`를 따릅니다.
