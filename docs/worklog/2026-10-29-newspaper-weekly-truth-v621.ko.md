# 개발 B v621 — 주간 경제 브리프 허위 통계 차단

- 시작 main: `35971c600f25869c96f1c666d4b9f58927202730`. 독립 브랜치에서 작업, 기존 A/C/Gemini/QA 작업 보호.
- P1 재현: DB가 없거나 오류가 발생해도 주간 경제 API가 12,450,000 WLD, 1.4% 인플레이션, 가상 거래량과 특정 회원 명예 순위를 정상 통계로 반환. 웹도 API 실패 시 동일한 예시 값을 표시.
- 실제 수정: `GET /api/v1/newspaper/weekly-brief`를 검증된 전체 통계 원천이 확보될 때까지 HTTP 503 / `NEWSPAPER_WEEKLY_BRIEF_UNVERIFIED`로 차단. 웹은 수치 대신 명시적인 검증 중 상태를 표시. 예시 값은 테스트 전용 fixture로 이동. 시장 이벤트 pulse 조회는 유지.
- RED: Backend 3건, 웹 1건 실제 결함 재현. GREEN: Backend 집중 8건, HTTP 2건, 웹 3건. Backend 전체 1,944 PASS / 440 SKIPPED, DB unit 46 PASS / 4 SKIPPED, 전체 typecheck, Backend build, lint 오류 0, API 계약 180개, 저장소 보안검사 PASS.
- 차단: qs Moderate 1건, 공식 Test exact-SHA·전체 Frontend 빌드·실제 PostgreSQL 전체 검증·인증 E2E 미완료. 데이터 디스크 98%, /tmp 96%. Production 금지.
- 원장·WLD·마이그레이션·서비스 재시작·DB 변경 없음. main 병합/배포/타 작업 브랜치 삭제 없음.
- PR 전체 상태 조회 결과, 2026-10-26 개발 C의 **종료·미병합 PR #1405**에 더 완성도 높은 검증된 잔액 스냅샷 구현이 존재함을 확인했습니다. 이번 v621은 해당 작업을 대체하지 않는 좁은 503 안전 차단안입니다. #1405의 고유 작업 복구/통합 검토 전 자동 병합 금지. 별도 투표 관련 종료 PR #1215도 보호하며 수정하지 않았습니다.
