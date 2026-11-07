# 개발 C v1289 — 회원 상점 원본 검증

- 시작: 2026-11-02 08:15 KST, 기준 `a8541927c3a351d980454c66e95a3356c47e0722`, 최신 main에서 독립 worktree 생성. 공유 checkout 변경 없음.
- 검토: AGENTS, 영문·한국어 README 및 통합기획서, 최신 PR/CI, QA v1457, 개발 A/B/C 중복 범위.
- 확인한 결함: 회원 상점 API JSON의 런타임 형태를 검증하지 않아 비정상 목록·금액·보유 정보로 페이지가 오류를 내거나 구매 버튼이 표시될 수 있고, `q[]` 쿼리로 서버 렌더링이 실패함.
- 목표: 검증되지 않은 응답은 구매/사용/정산 제어를 숨기고 조회 오류로 안내; 정상 빈 결과와 구분. DB·금융 원장 변경 금지.
- 상태: 시작 기록. 전체 검증/병합/배포 미실행, 운영 보류.

## 중간 기록 — 08:20 KST
- main 재조회 SHA 동일. 영문/한국어 통합기획서 SHA256 동일.
- 결함 재현 RED 5건 실패/1건 통과, 수정 후 집중 및 서버 렌더 통합 10건 통과.
- 검증되지 않은 가격·보유·체납 응답은 오류로 처리하고 구매/사용/정산 버튼 숨김. 검증된 빈 목록과 구분, 키보드/스크린리더 오류 및 재조회 제공. 반복·비문자 검색 매개변수 방어.
- 기존 NestJS/PostgreSQL 인증·원장 계약 재사용. DB/금융 쓰기 없음. 전체 게이트 미완료, 운영 보류.

## 실제 HTTP 추가 결함 — 08:30 KST
- 독립 Next.js 요청에서 회원 상점의 robots 메타는 noindex인데 실제 HTTP X-Robots-Tag가 index, follow로 반대되는 P1 개인정보·SEO 정책 결함 확인.
- HTTP 정책 회귀 RED 실패 후 직접·언어 접두사 5개 경로에 private no-store, noindex, no-referrer 적용. 집중 테스트 11/11 통과. 새 빌드 HTTP 재검증 예정.
- 이전 코드 SHA: Lint/Typecheck/Build PASS, Frontend 2,932 PASS, Backend 2,978 PASS/2 FAIL/518 SKIP, app-api 184 계약 PASS, 격리 PostgreSQL 322개 적용 및 상점 DB 26 PASS, 전체 보안 감사 취약점 9건, 전체 경로 QA 증빙 누락, 공식 인증 E2E BLOCKED.
- PostgreSQL 독립 검증 환경에서 초기 설정 오류 2건을 수정한 뒤 정상 검증했고 컨테이너 제거. 운영 DB 영향 없음. 배포 보류.
