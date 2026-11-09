# v2026.11.10.2010 — 국채 청약 CSRF 오류 수정 작업 기록

## 작업 전
- 모바일 국채 매수 확정 시 'csrf token required' 발생. 실제 운영 릴리스와 origin/main의 국채 청약 BFF는 동일한 무토큰 api POST를 사용함.
- 기준: origin/main edd709bcbe96f6f5ceca8372f244b632e8211242. 다른 작업자의 미커밋 파일이나 v1949 국채 QA 브랜치는 변경하지 않음.
- AGENTS.md, GEMINI.md, DOCS_INDEX.md, 통합 기획·개발 마스터, RELEASING.md, v1949 실제 웹 QA 및 금융 CSRF 소스 확인.
- 금융 보안정책: 백엔드 CsrfGuard 유지, 웹 프록시에서 요청 출처를 먼저 검증, 로그인 세션에서 발급한 토큰만 사용.

## 작업 중
- 네 국채 변경 API(청약, 담보대출 신청, 상환, 롤오버)에서 공통 mutate 경로 사용 및 Same-Origin 검증과 private/no-store/noindex 설정.
- 변경 전 회귀 테스트 20/20 실패(RED), 변경 후 20/20 성공(GREEN).
- 금융·Origin 관련 확대 회귀 43/43, 공통 계약 빌드, 프론트 타입 검사, 대상 ESLint 0 오류/기존 경고 4, Next 전체 빌드 성공.
- 격리 프론트엔드 미리보기에서 위조 출처 요청 4개 모두 403 확인 후 미리보기 프로세스 종료.
- 중간 git fetch 결과 origin/main 변동 없음. 운영 원장·SQL·DB·실제 돈 이동 변경 0건.

## 종료 및 운영 상태
- 소스 결함 수정 및 회귀 증빙 완료. 공식 인증 Test 계정 기반 구매/잔액/국고 전표 E2E 미실행.
- v1949 QA에서 중복 청약 영수증, 만기·쿠폰 정산, 롤오버 DB 권한, Repo 503 보류를 확인함. 본 CSRF 패치로 해당 결함이 고쳐졌다고 주장하지 않음.
- 공식 Test 및 운영 승격: HOLD. 금융 원장/멱등성·승격 게이트가 통과해야 무중단 승격 가능.

## PR 이후 최종 기록
- 초안 PR #3009 생성: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3009
- GitHub CI 실행 #6001 진행 중(아직 성공으로 판정하지 않음).
- 공식 Test 백엔드/프론트 active이며 공개 /api/version 및 /frontend-version HTTP 200, 둘 다 기존 a13a18cd70709a6f4df320d4d76ea834baae2331 버전. **v2010 후보로 승격한 것이 아님**.
- 공식 Test/운영 서비스 교체 없음. 실제 회원 결제 및 재무 무결성 검증은 미완료.
