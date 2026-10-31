# 개발 C v1237 — 클럽 목록 조회 근거·페이지 이동 보완 (P1)

## 시작
- 기준 main `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, 독립 브랜치 및 worktree 사용. A/B/QA/Gemini 작업 보호.
- 기존 클럽 API 장애를 실제 클럽 0건으로 표시하고 50건을 전체 클럽 수처럼 안내하는 문제 확인. 실제 결제 없는 클럽 창설 기능은 서버에서 차단되어 있음.

## 중간
- 기존 인증 GET `/api/v1/clubs` 및 PostgreSQL 읽기 경로 재사용. 응답 형식·중복 UUID·WLD와 무관한 경험치 BigInt 검증, 오류/빈 결과 구분, 검색·페이지 이동·재조회 접근성 개선.
- 클럽 창설 폼의 검증되지 않은 10,000 WLD 소각 약속 제거. Android App API 및 Next 클럽 경로에 비공개/비색인/캐시 금지 헤더 적용.
- TDD RED: 5건 + 보안 헤더 3건 실패 재현. GREEN: 집중 8건 통과. 전체 릴리스 검증은 진행 중.
- QA v1422의 운영 DB·원장 우회 P0 결함과 클럽 테이블 권한 문제는 별도 차단 요인으로 유지. 운영배포 금지.

## DB 실제 검증 추가
- 기존 Backend 클럽 목록 SQL은 `users` 테이블에 존재하지 않는 `display_name`을 조회했고, 앱 계정은 `users`/`identities` 직접 SELECT 권한이 없어 실제 조회가 실패할 구조였음.
- 순방향 마이그레이션 **318**에 `SECURITY DEFINER` 조회 함수를 추가하고, Backend를 해당 함수로 연결. 기존 Nest 인증과 요청 계약 유지.
- PostgreSQL 17.11 독립 DB에서 마이그레이션 **317/317 통과**, 실제 소유자 이름·가입 여부·정확한 경험치·검색/페이지 이동 검증. 앱 계정의 `users`/`identities` 직접 조회 권한은 계속 없음.
- **잔여 P0:** 기존 222번 마이그레이션의 클럽 테이블 직접 SELECT/INSERT/UPDATE/DELETE 권한은 여전히 존재. 신규 권한 완화 없이 읽기 기능만 개선했으며, 전체 운영 승격 금지.

## 종료
- 최종 테스트·SHA·CI·Test/Production 상태는 영문 정본과 PR 기록 참조. 모든 필수 PASS 전까지 Draft/HOLD.
