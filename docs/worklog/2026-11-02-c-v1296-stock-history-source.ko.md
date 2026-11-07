# 개발 C v1296 — 회원 주식 거래 내역 원본 검증

**상태:** 작업 종료 — 부분 완료 / 초안 / 운영 보류. 2026-11-02 12:46 KST.
**기준:** origin/main a8541927c3a351d980454c66e95a3356c47e0722.
**브랜치:** auto/hourly-c-stock-history-source-v1296-20261102-1245.

## 작업 설계
기존 NestJS 인증 회원 GET /api/v1/stocks/history와 PostgreSQL stock_my_trades(actor, limit) 읽기만 재사용한다. 현재 웹/Android는 minGross가 없는 기본 조회에서 성공 응답의 거래 구조를 검증하지 않아 잘못된 가격이 BigInt 처리에서 오류를 일으키거나 잘못된 내역을 표시할 수 있다. 모든 조회에 엄격한 검증을 적용하고 실제 빈 내역과 장애를 구분한다. WLD 금액은 문자열/BigInt로 보존하고 데이터베이스·원장·권한을 수정하지 않는다.

## 시작
AGENTS, README, 영문·한국어 통합기획서, 최신 기획 v1648, 열린 PR, A/B, QA 확인. main의 README.ko.md는 없음. 작업은 독립 worktree에서 진행한다.

## 진행
RED 테스트 및 구현·검증 예정.

## 종료 — 2026-11-02 13:00 KST / PARTIAL / RELEASE BLOCKED
- Draft PR #2472 및 독립 worktree/브랜치 보존. 시작·중간·종료 main a8541927c3a351d980454c66e95a3356c47e0722 동일, 최신 기획 v1648 미병합. A/B/Gemini/QA와 예약 설정 변경 없음.
- 결함 재현 RED 6건, HTTP 보호 정책 RED 1건. 수정 후 집중 31건 + HTTP 정책 1건 통과.
- 코드 후보 d4eedfde8114c3a5ccaa11166934bc49793d6bec: 전체 빌드·타입검사 통과, Lint 오류 0/경고 1,027, Frontend 2,929 통과, Backend 2,978 통과/2 실패/518 건너뜀, DB 패키지 62 통과/5 건너뜀, API 계약 184개 통과, Bot 11건 통과(작업 폴더 의존성 연결 후).
- Backend 실패 2건은 미수정 main에서도 동일하게 재현된 프로필 인증 401/예상 200 문제. 릴리스 통과 아님. 루트 pnpm test 실패.
- 독립 PostgreSQL 17.11에서 322/322 마이그레이션과 실제 DB·주식 테스트 56건 통과. 앱 역할의 stock_my_trades 실행 허용, 원본 거래 테이블 SELECT/INSERT 차단 확인. 초기 컨테이너 SQL 볼륨 누락 실패 후 읽기 전용 마운트로 재실행 성공. 검증 컨테이너·임시 비밀번호 제거. 공유 DB 변경 없음.
- 독립 Next.js HTTP 응답의 /stocks/history, /en/stocks/history에서 비색인·비공개 캐시·참조정보 차단 헤더 확인. 인증 E2E 및 실제 모바일·스크린리더 실측을 대체하지 않음.
- 운영 의존성 High 이상 감사 통과, 전체 감사 취약점 9건(보통 8/낮음 1) 실패. 전체 경로 QA는 full-route-ledger.json 누락으로 실패. 공식 Test는 후보와 SHA 불일치(공개 Test/Production 510dbe6bf4d5c2a8089fc06b480776053da7a2e3); read-only 호스트 preflight에서 SHA 불일치 6건. 인증 E2E 미실행.
- 원격 CI 필수 runtime-check 마지막 확인 시 진행 중. 모든 필수 PASS 전 main 병합·Test 후보 설치·Production 배포·GitOps 변경 금지. 배포가 없으므로 롤백 불필요. 브랜치·PR·고유 변경 보존.


### 12:49 KST — 진행 중 / RED→GREEN
- main 기준 결함 재현 6건 실패: 웹에서 잘못된 거래 목록을 배열로 간주해 예외 발생, Android 기본 거래 내역의 잘못된 HTTP 200 응답을 그대로 전달.
- 수정 후 집중 테스트 31건 통과, 프론트 타입 검사 및 계약 빌드 통과. 전체 GET 응답 검증·장애 차단·접근 가능한 재조회 적용. 원장/DB/권한 변경 없음.
- 중간 fetch 기준 main 동일. A/B/QA와 변경 중복 없음. 전체 검증·Test·운영 승격은 보류.
