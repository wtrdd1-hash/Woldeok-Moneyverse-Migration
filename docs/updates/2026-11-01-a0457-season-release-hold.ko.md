# 릴리스 HOLD — A0457 시즌 참가비 검색

- **코드:** Draft PR #2259, 코드 SHA `b9b066790d1a31c95c31f17a6f19a66282ef6ec0`, 최신 main `f13bbce273ffc65e8576170992d82ea00c27a1c9`. 최종 문서 SHA는 PR 검사·댓글에 별도 기록.
- **로컬:** 전체 테스트·타입·Lint·빌드·보안 감사 PASS. DB 테스트 SKIP, 개발 DB 활성 이벤트 0건. 정확 SHA GitHub CI·이미지 빌드는 별도 확인 필요.
- **P0:** 개발 앱 역할의 이벤트 테이블 직접 SELECT 권한(#993), 운영 권한 미검증. Production Frontend 출처 SHA 미입증. 공식 Test/Production은 후보 버전이 아님.
- **배포:** 병합·Test/Production 배포·DB/원장 변경·재시작·롤백·브랜치 삭제 0건. C #2234 등 고유 변경 보존. PR 되돌리기로 기능 롤백 가능, DB 데이터 영향 없음.
- **필수 게이트:** 정확 SHA 격리 Test 인증/동의/DB/Android/E2E, 권한, 독립 백업 복원, CI, 이미지 다이제스트, 출처, GitOps, 롤백 검증 전 운영 승격 금지.
