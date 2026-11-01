# 개발 A 01:55 — 최근 공개 게시판 미답변 글 QA (2026-11-02)

**상태:** Draft / RELEASE HOLD. 영문 문서 원본의 한국어 대응본.

- 기준 main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, 독립 브랜치 `auto/hourly-a-20261102-0155-board-unanswered`.
- 기존 PostgreSQL `SECURITY DEFINER` 공개 조회 함수의 최근 최대 50건 결과에서 댓글 0개만 필터링. 제목/종목 검색과 조합. 신규 DB 마이그레이션, 금융 원장 및 권한 변경 없음.
- 웹: 라벨 있는 GET 체크박스, 범위 표시, 검색 결과 noindex 및 no-store, 오류와 실제 빈 결과 구분.
- Android API: `unanswered=1`만 허용, 중복/미지원 조건 거부, 백엔드 적용 증명과 댓글 수·UUID 검증 실패 시 503.
- TDD RED Backend 3건/Frontend 8건, GREEN Backend 대상 22 PASS/Frontend·Android 15 PASS. 전체 타입검사와 변경 파일 ESLint PASS.
- 실제 개발 PostgreSQL 17.11 앱 역할 READ ONLY: 함수 실행 가능, 공개 1건 중 미답변 1건, ROLLBACK. 복수 실제 데이터의 정렬/필터 검증은 미완료.
- 루트 전체 테스트 첫 실행은 생성된 API 계약 문서가 미커밋 상태여서 drift 검사에서 FAIL. 문서 커밋 후 재검증 필요.
- 정확 SHA 전체 CI, 공식 Test 인증 E2E, 독립 복원, P0 개발 DB 최소 권한 및 운영 출처 검증 미완료. 병합/배포 금지.
