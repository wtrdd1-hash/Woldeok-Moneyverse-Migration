# A2325 공개 게시판 작성자 검색 — 배포 보류

**HOLD / PR #2393 Draft.** 기능·API 계약 SHA `a70db033e7f0a018e4ac5f23f0ecda2984ded39f`. 최종 문서 포함 SHA는 종료 커밋 이후 재확인.

Backend 전체 2,981 PASS/518 SKIP, Frontend 2,910 PASS, DB 62 PASS/4 SKIP, 빌드·타입검사·Android 계약 통과. 실개발 DB 읽기 검증 양성·음성 통과. 이는 공식 Test 인증 증거가 아님.

차단 사유: 개발 DB P0 #993 직접 권한, 공식 Test 후보 SHA 불일치, 인증 사용자 E2E·독립 복원·운영 실행코드 증빙 미완료, 최종 CI·GitOps/릴리스 게이트 미확인. Test `e39af10f6a876f56b40b7e5a070cdb3dcb61d699`, Production Backend `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, Frontend `1793450413898` (SHA 아님).

main 병합, Test/운영 배포, DB 변경, 서비스 재시작, 브랜치 삭제, 롤백 모두 0건. 변경은 읽기 전용 필터이며 스키마 롤백 불필요. 다른 개발 작업 보존.
