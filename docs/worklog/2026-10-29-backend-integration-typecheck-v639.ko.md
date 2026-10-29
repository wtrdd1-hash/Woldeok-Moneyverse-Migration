# Backend B v639 — 병합 이후 Backend 타입 오류 및 공개 국고 조회 복구 (초안 / 운영 보류)

## 작업 전 — 2026-10-29 19:33 KST
- miniPC Debian 13.6 시스템 상태·명령·파일 읽기 MCP를 호출함. 파일 읽기 응답은 비어 있어 셸로 보완함. 운영/공유 DB는 수정하지 않음.
- 시작 main `69c486777d023ee45a216528e7a0c8b7dd1d7ea7`. 별도 브랜치/worktree 사용. AGENTS, README, 영문·국문 기획서, QA v1371, 열린 PR/CI 확인.
- QA #1884 P1: Backend TypeScript 오류 5건 재현. undici는 코드 문제가 아니라 독립 환경의 의존성 미설치로 확인하여 잠금파일 기준 오프라인 설치함. A의 마이그레이션 P0, QA의 Lint, C의 프론트엔드 작업과 분리함.

## 작업 중
- 공개 국고 Controller 누락으로 HTTP 테스트 2건 RED, 캐시 헤더 검증 RED, Backend 타입 오류 5건 RED.
- 기존 공개 국고 조회를 복원하고 검증된 국고 총액·금고 최소 필드만 공개, 증빙 오류는 503, 캐시는 no-store. 블로그 중복 메서드와 예외 중복 import 제거. 금융 지급 로직·DB 권한·원장 변경 없음.
- 집중 회귀 18/18, Backend 타입검사/빌드, 변경 파일 Lint, Contract 41/41, 의존성 감사 PASS.
- 전체 Backend 2340 PASS/243 FAIL/492 SKIP, Database 52 PASS/1 FAIL/4 SKIP, Frontend 2514 PASS/53 FAIL. 기존 main의 마이그레이션 번호 충돌·프론트 JSX 구문 오류·API 문서 드리프트 등 릴리스 차단 지속. Bot 의존성 미설치. 실제 격리 PostgreSQL 및 공식 Test exact-SHA E2E 미검증.
- 별도 P0: 현재 main의 일일 퀘스트/펫 보상 API가 실제 원장 없이 성공 응답을 반환하는 문제가 회귀 테스트에서 확인됨. 이번 단일 P1 작업에는 포함하지 않고 별도 복구가 필요함.

## 작업 후
- 중간 main SHA 동일. 최종 커밋/원격 CI는 PR과 서버 종료 로그에 기록.
- 공개 API 계약: `GET /treasury/public-overview` 검증된 200 또는 503, `Cache-Control: no-store`. 신규 마이그레이션 없음.
- main 병합 없음, 공식 Test/Production 배포 없음, 다른 개발 환경 및 A/B/C/기획/QA 예약 변경 없음. 최종 상태 PARTIAL/BLOCKED, Production HOLD.
