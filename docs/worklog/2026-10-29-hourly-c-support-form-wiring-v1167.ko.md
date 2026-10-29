# 개발 C v1167 — 회원 문의 폼 연결 복구 (배포 보류)
## 시작 — 2026-10-29 19:45 KST
- 기준: origin/main 69c486777d023ee45a216528e7a0c8b7dd1d7ea7, 독립 브랜치/worktree.
- 원인: 문의 생성·답장 서버 액션은 (이전 상태, FormData)를 받는데, 실제 문의 페이지는 이를 일반 form action에 직접 연결하고 있음. 검증된 useActionState 기반 컴포넌트는 이미 존재하지만 페이지에서 사용하지 않음.
- Backend는 세션·동의·CSRF, PostgreSQL 회원 전용 조회 및 저장 영수증 검증을 이미 지원. UI-only 완료를 주장하지 않음.
- A #1885, B #1886, QA #1883 및 기존 C 미병합 작업과 파일 충돌 방지. SQL/공유 DB/금융 원장 수정 없음.
## 계획
- [x] 실패하는 페이지 연결 테스트 추가 (2 RED)
- [x] 기존 상태형 회원 문의 폼으로 연결 및 접근성·모바일·비색인 유지 (집중 17 PASS, NODE_ENV=test)
- [x] 최신 main 재확인, 집중/전체/보안/실DB/E2E 검증과 차단 사항 기록
- [x] 영문·국문 종료 기록 및 GitHub 갱신, 미통과 시 배포 보류
## 중간
- TDD RED 2건 재현, 기존 컴포넌트 연결 후 17/17 집중 테스트 통과. 미니PC NODE_ENV=production에서 React.act가 없어 테스트 2건 실패했으며 NODE_ENV=test로 재실행해 환경 원인을 확인. main fetch와 기획서 재확인. 전체 게이트 미실행/미인증.
## 종료 — 2026-10-29 19:53 KST / PARTIAL, RELEASE BLOCKED
- 실행 코드 후보 SHA: 597076da6271d33853da402e5f1287fcd1ec46e5. 마지막 기록 커밋은 문서만 변경함.
- 회원 문의 집중 Frontend 17 PASS, Backend 기존 계약 6 PASS / 미병합 정확 메시지 조회 계약 4 FAIL, Contract 41 PASS, 변경 파일 ESLint PASS.
- 독립 PostgreSQL 17.11에서 SQL 001~196 적용 성공. 합성 회원으로 문의 생성, 본인 조회, 최초 메시지, 답장, 멱등 재전송, 다른 회원의 목록 비노출과 앱 역할 직접 테이블 SELECT 거부 확인. 임시 컨테이너 제거. 전체 303개 마이그레이션이나 공식 Test 증거는 아님.
- Frontend 전체 100초 시간초과(기존 실패 다수), Backend 1659 PASS / 207 FAIL / 458 SKIP, DB parity 5 PASS / 1 FAIL, 전체 lint 2 오류, Typecheck/Build FAIL, app-api 181개 생성 문서 불일치, 전체 보안 감사 11건(낮음 3/보통 8), 운영 의존성 0건.
- GitHub Build Test Candidate #40860148939 실패(기존 lint 오류). 시작/중간/종료 main 69c486777 동일, 기획서 재확인. Test/Production c2129625...로 개발 SHA 미실행; 인증/DB/회원 공식 exact-SHA E2E BLOCKED.
- PR 생성, main 병합, GitOps, Test/Production 배포, 롤백 및 공유 DB 변경 없음. 미병합 브랜치 보존. 기존 문의 상태 필터 Backend 미지원 및 200건 초과 답장 조회 한계(#1832)는 해결했다고 주장하지 않음.
- 내부 근거: /srv/moneyverse-data/reports/Moneyverse-C-2026-10-29-1945.
