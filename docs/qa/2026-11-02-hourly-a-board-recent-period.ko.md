# 개발 A — 공개 게시판 작성 기간 필터 QA (2026-11-02)

영문 정본: `docs/qa/2026-11-02-hourly-a-board-recent-period.md`.

- 기준 main `a8541927c3a351d980454c66e95a3356c47e0722`; 복구 코드 `e887c8bd39e71d8dd54f4790ff8ea0ebce6b501d`.
- 최근 공개 게시글 최대 50건의 24시간/7일/30일 UTC 필터. 종목·제목 조건 결합, Nest/SQL/웹/Android 계약·검증·비공개 응답 처리 구현. 신규 마이그레이션·금융 쓰기·권한 확대 없음.
- 기존 제목 검색 안내 문구 회귀로 최초 후보 CI 실패 후 별도 복구 브랜치에서 수정. 복구 Backend 2,987 PASS/518 SKIP, Frontend 2,928 PASS, DB 62 PASS/5 SKIP, 계약 41 PASS, 빌드/타입/린트 오류 0 PASS. 린트 기존 경고 1,027.
- 운영 의존성 감사 PASS, 전체 의존성 감사 **9건 FAIL**. 개발 PostgreSQL 앱 역할의 잔액 UPDATE·아이템 DELETE 허용 **P0 FAIL**. 운영 DB 권한은 미검증.
- Test·Production 공개 버전은 `510dbe6bf4d5…`로 후보와 불일치. 정확 SHA 인증 E2E·독립 복원 **BLOCKED**.
- 비-main 217개(고유 미통합 203, main 포함 14), 열린 Draft PR 199개(충돌 29). 삭제 0. 기존 변경 보호.
- **Draft / 운영 보류**. CI/이미지 빌드 최종 SHA 결과 재확인 필요. main 병합·운영 배포·DB 변경·재시작·롤백 없음.
