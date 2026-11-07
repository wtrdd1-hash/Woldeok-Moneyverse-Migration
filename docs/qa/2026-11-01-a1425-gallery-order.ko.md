# 개발 A 14:25 — 갤러리 최근 24장 정렬 QA (2026-11-01)

상태: 독립 브랜치 P1 구현, **운영 배포 보류**. 기준 main `9052076301bf1975422731ab50a8b7770dbbe951`.

- 기존 `SECURITY DEFINER` 공개 사진 조회 함수가 반환하는 최근 승인 사진 최대 24장 안에서만 최신순/오래된순 정렬. 전체 과거 사진 정렬 아님. 중복·잘못된 파라미터 400, Android 검증 불가 200 응답 503, 정렬 결과 캐시 금지·색인 방지.
- TDD: Backend 3건 RED → 3건 PASS, Web 3건 RED → 3건 PASS, Android 3건 RED → 4건 PASS.
- Frontend 전체 2,909 PASS (NODE_ENV=test), Backend 전체 2,964 PASS/2 FAIL/518 SKIP (기존 프로필 인증 HTTP 401, 수리 PR #2265), DB 62 PASS/4 SKIP. 최초 Frontend 실행은 NODE_ENV 미설정으로 496건 실패해 무효로 기록.
- 타입검사 PASS, Lint 오류 0/기존 경고 1,022, Backend·Frontend 빌드 PASS, Android API 계약 184개 PASS. 최초 Next 빌드의 PageProps 오류는 수정 후 재빌드 PASS.
- 실제 개발 PostgreSQL 읽기 전용·ROLLBACK: 함수 실행 권한 true, photos 직접 SELECT false, 공개 사진 2건. **기존 P0 위반:** account_balances UPDATE true, user_items DELETE true. 운영 DB 권한은 미확인.
- 공식 Test 정확 SHA 인증 E2E, 실제 DB 통합, 보안·접근성 브라우저 E2E, 독립 백업 복원, GitOps 배포 근거 미완료. 병합·운영배포 금지. 금융·스키마 변경 없음. 롤백은 코드 커밋 되돌리기.

**추적 기록:** 기능 SHA `ebef822c9e6c5685f6643f896f9d62b9768a6844`, 변경 18개 파일. 시작·중간·종료 main 동일. 비-main 98개(고유 미병합 93/선조·동일 5), 열린 Draft PR 91개(충돌 22/병합 가능 69). 삭제 0개, 기존 변경 보호. 보안 스크립트 17 PASS, SEO·명도 대비·사이트맵 12 PASS, 운영 의존성 알려진 취약점 0. 공식 브라우저 인증 E2E를 대체하지 않음. 최종 문서 SHA 및 CI는 Draft #2331 기록.
