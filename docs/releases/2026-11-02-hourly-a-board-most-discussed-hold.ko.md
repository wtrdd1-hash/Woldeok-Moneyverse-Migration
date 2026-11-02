# 2026-11-02 개발 A — 공개 게시판 댓글 많은 순 정렬 배포 보류

- 후보: PR #2480, auto/hourly-a-20261102-1425-board-most-discussed, 기준 main a8541927c3a351d980454c66e95a3356c47e0722.
- 최근 50건 읽기·웹/Android 검증·테스트·계약 문서만 변경. DB 마이그레이션·금융 원장·운영 서비스 변경 없음.
- 차단: Backend HTTP 테스트 2건 FAIL, 전체 의존성 취약점 9건, DEV DB 최소권한 P0 #993, 전체 경로 QA 파일 누락, 공식 Test 정확 SHA 불일치와 Treasury 공개 HTTP 200, 독립 복원/인증 E2E 미검증, 최종 CI/이미지 미인증.
- Test 공개 SHA 510dbe6bf4d5c2a8089fc06b480776053da7a2e3는 후보 코드 SHA 332ed850be73e06538cc133c1e2aa689e10c86b8와 다름.
- 롤백: DB 변경 없음, 기본 최신순 유지. 향후 승인된 배포에서 문제가 발생하면 검토된 후속 코드 변경으로 선택 기능만 제거. 실제 운영 롤백 미실행.
- 판정: main 병합, 공식 Test 승격, 서비스 재시작, 운영 DB 변경, Production 배포 금지.
