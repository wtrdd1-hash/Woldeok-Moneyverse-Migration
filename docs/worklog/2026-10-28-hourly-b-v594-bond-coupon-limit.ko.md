# 개발 B v594 — 관리자 국채 쿠폰 지급 이력 조회 한도 검증 (초안 / 배포 보류)

- 시작 main: `656a89947f2261c12de20d4612e88f251ba6c6a6`; 독립 브랜치와 worktree에서 작업.
- 기존 `GET /api/v1/admin/bonds/coupon-logs`는 비정상·중복·과도한 `limit`을 DB로 전달할 수 있었음.
- 기본 20건, 허용 1~100건. 정규 십진 정수 외 입력은 HTTP 400. Repository 직접 호출도 안전 정수·범위를 검증하고 SQL 실행 전에 거부.
- 기존 관리자 인증/인가, 성공 응답, WLD 문자열 정밀도 및 SQL 바인딩 유지. 금융 원장·DB 마이그레이션·실서비스 데이터 변경 없음.
- RED 20건 확인 후 집중 테스트 22/22, HTTP 2/2, 격리 PostgreSQL 17.11 합성 검증 통과. HTTP 테스트의 인증 가드는 대역으로 대체되어 실제 로그인 E2E 아님.
- Typecheck, lint(오류 0), 기본 build, Backend 1712 PASS/430 SKIP, Frontend 1681 PASS, Bot 8 PASS, API 계약 180개 확인.
- 전체 필수 `pnpm test`는 기존 main의 마이그레이션 283 중복으로 실패. 전체 보안 감사 실패(낮음 2건, 보통 8건). 공식 Test exact-SHA, 인증된 E2E, GitOps 미검증이므로 main 병합·Production 배포 금지.
- 개발 A/C/Gemini/QA 브랜치·예약 변경 없음. 내부 로그: `mv-b-v594-logs`.
