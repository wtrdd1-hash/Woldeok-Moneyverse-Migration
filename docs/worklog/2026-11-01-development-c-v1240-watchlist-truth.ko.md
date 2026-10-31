# 개발 C v1240 — 관심 종목 원본 검증

## 작업 시작 (2026-11-01 00:41 KST)
- Debian 13.6 미니PC의 주요 서비스 7개 및 개발 PostgreSQL 연결 확인.
- 기준 main: `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`.
- AGENTS, README, 영문/국문 통합기획, PR/CI, QA 및 A/B/C 진행 작업 확인.
- P1: 관심종목 API 응답의 가격·식별자·시각을 검증하지 않아 잘못된 값이 화면 오류를 일으킬 수 있고, 등락률 정렬의 정수 절삭으로 순서가 잘못될 수 있음.
- 기존 인증 조회 API 유지, 비정상 응답은 확인 불가로 처리, 검증된 빈 목록만 0건으로 표시, 정확한 정수 연산으로 정렬. 원장/DB 변경 없음.

## 진행 중 (00:43 KST)
- TDD RED 확인: 신규 원본 검증 모듈이 아직 없어 테스트가 예상대로 실패. 검색어 정규화 및 미세 등락률 회귀 사례 추가.
- 독립 worktree 외 기존 작업 공간·DB·서비스 변경 없음.
- 행동 검증 RED 5건 실패 확인 후 GREEN 파서·정렬 5건 및 SSR 화면 3건 통과.
- UUID/ISO 시각/WLD 정수/중복 검증, 등락률 정확 비교, 0 기준가 확인 불가 처리, 검색어 정규화, 오류 재조회, 비색인 메타데이터 구현. 기존 인증 API와 SQL 변경 없음.
- 중간 main 재확인: `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834` 유지.

## 종료 (2026-11-01 00:56 KST, DRAFT / RELEASE HOLD)
- 코드 후보 `8e16d8c2fecac8ad675450a88a7ac18fcf5012ae`, GitHub 초안 PR #2228. 최종 문서 커밋 후 HEAD 기준 재검증 예정.
- 전체 Lint 오류 0·경고 1,016, Typecheck/Build/184개 app-api 계약 통과. Contract 41건, DB 62건(4건 SKIP), Backend 2,944건(517건 SKIP), Frontend 2,909건 통과. SKIP은 PASS로 계산하지 않음.
- 운영 의존성 감사 취약점 0건, 전체 의존성 감사 취약점 9건(낮음 1·보통 8)으로 FAIL. 전체 경로 QA 원장 파일 부재로 FAIL.
- 네트워크 차단 PostgreSQL 17.11 독립 컨테이너에서 마이그레이션 316건 통과, 사용자별 관심 종목 조회 VA1240/VB1240 분리, 앱 계정의 함수 실행 허용·원본 테이블 직접 SELECT 차단 확인. 검증 컨테이너 제거.
- 독립 Next.js HTTP는 인증 토큰이 없는 격리 환경에서 오류 페이지 HTTP 200을 반환해 실제 인증 E2E로 인정하지 않음. 공통 HTTP `index, follow` 헤더는 다른 C 초안 #2225가 담당하는 기존 결함.
- 공식 Test 버전 `bc8cd8a6...`, Production 백엔드 버전 `353c6d5d...`와 프론트 타임스탬프 `1793450413898` 불일치. Production 관심종목 엣지 색인 헤더 문제 확인. 공식 exact-SHA 인증 E2E/릴리스·복원 게이트 BLOCKED.
- 중간·병합 전 main 재확인: `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834` 유지. PR 병합·Test/Production 배포·GitOps·금융 원장·기존 브랜치 삭제 없음. 핵심 예약 5개 설정 변경 없음.
- 원격 CI classify/policy PASS, runtime-check/Test 후보 진행 중. 모든 게이트 PASS 전까지 Draft/HOLD 유지.
