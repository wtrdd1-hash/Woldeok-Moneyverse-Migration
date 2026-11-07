# 배포 보류 — 개발 A 04:25 자기신고 필터

- PR #2425, 기준 main `a8541927c3a351d980454c66e95a3356c47e0722`.
- Backend 2,987 PASS/518 SKIP, Frontend 2,938 PASS, DB 62 PASS/5 SKIP. 빌드·타입검사·린트·모바일 계약 통과, 전체 의존성 감사 9건 FAIL. 공식 Test 정확 SHA 불일치, 개발 DB 최소 권한 P0 실패, 독립 복원·인증 E2E 미완료로 배포 금지.
- Test/Production 공개 Backend/Frontend 버전 `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`는 후보 SHA와 다릅니다. 양쪽 Treasury HTTP 200은 배포 차단 요소입니다.
- 최초 CI 계약 문서 드리프트는 `d87f3ab6ed7f0336f2451f29fd4f6ac78cc851f4`에서 수정했고 새 CI는 확인 대기 중입니다.
- DB 마이그레이션·금융 원장·운영 변경 없음. main 미병합, Test 미승격, Production 미배포, 서비스 재시작·롤백·브랜치 삭제 없음.
- 추후 승인 시 새 불변 릴리스로 필터 UI/API를 되돌릴 수 있으며 SQL 롤백은 필요하지 않습니다. 선행 조건은 정확 SHA Test, 독립 복원 및 전체 보안 게이트 통과입니다.
