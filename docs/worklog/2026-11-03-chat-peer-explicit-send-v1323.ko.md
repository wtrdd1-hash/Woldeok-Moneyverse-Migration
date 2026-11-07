# 개발 C v1323 — 쪽지 대화방 생성 전 명시적 사용자 행동

## 시작 — 2026-11-03 06:49 KST
- 기준 main: `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`; 독립 브랜치 사용.
- 미니PC Debian 13.6과 7개 서비스 및 개발 PostgreSQL 연결 확인.
- 문서/열린 PR/QA/A·B 기록 확인. 다른 에이전트의 미커밋 작업 보호.
- 결함: `GET /chat?peer=<uuid>` 렌더링 중 대화방 생성 POST가 실행되어 사용자의 명시적 발송 전에 데이터가 변경됨.
- 조치: 기존 회원별 인증된 POST 계약을 재사용하고, GET은 조회만 수행하며 사용자가 메시지를 직접 작성·발송할 때만 생성.
- 테스트 RED→GREEN 및 필수 게이트 확인 전 병합·운영 배포 금지.

## 중간 — 2026-11-03 06:53 KST
- RED: URL GET에서 대화방 생성 `mutate` 호출 1회 재현.
- GREEN: GET은 기존 검증된 대화만 선택, 새 상대는 사용자가 직접 대화방 열기 버튼을 눌러야 서버 액션 실행. Nest 세션/CSRF 및 PostgreSQL `private_chat_open` 기존 계약 사용. B #2389의 브라우저 전송 작업은 수정하지 않음.
- 신규 화면/클라이언트 폼/HTTP 비색인 테스트 합계 18건 통과. 호스트의 NODE_ENV=production 때문에 테스트는 명시적으로 NODE_ENV=test 실행.
- 전체 필수 게이트, 격리 DB, 실제 HTTP, CI 미완료로 운영 보류.


## 종료 — 2026-11-03 07:04 KST — PARTIAL / RELEASE BLOCKED
- 순서: v1323.0 시작 `0179578af1`, v1323.1 구현 `d35c6feb6a`, v1323.2 최종 증빙 커밋. Draft PR #2584.
- GET /chat?peer 경로에서 DB 생성 호출 제거. 사용자가 직접 대화방 열기 버튼을 제출할 때 기존 서버 액션이 세션·CSRF·Nest·PostgreSQL 함수를 사용. 기존 방 재사용 및 잘못된 입력/오류 차단. 모바일 버튼·스크린리더 오류·다국어 안내 포함. B #2389의 전송 코드는 수정하지 않음.
- 구현 SHA의 전체 Lint 0 오류(경고 1,027), Typecheck/Build PASS, Frontend 2,952 PASS, Backend 2,985 PASS/518 SKIP, 계약 41 PASS, DB 패키지 72 PASS/5 SKIP, app-api 184 엔드포인트 PASS.
- 격리 PostgreSQL 17.11: 초기 스키마+번호 002–328 마이그레이션 327개 PASS, 대화방 생성/조회/권한 및 신고 DB 테스트 6 PASS. 동시 테스트가 만든 별개 대화로 실패한 테스트 범위를 회원별로 수정한 후 재검증. 컨테이너 삭제, 공유 DB 미변경.
- 독립 HTTP: 합성 401 인증 서버에서 /chat 및 5개 언어 경로 모두 로그인으로 307 이동, 비공개/비색인/참조정보 차단 헤더 확인. 초기 토큰 미설정 500은 테스트 환경 수정으로 해결.
- 전체 의존성 취약점 9건(보통 8·낮음 1), 전체 경로 QA 증빙 파일 누락, 필수 원격 CI·공식 인증 E2E·공식 Test 정확 SHA·독립 복원 미완료. Test/Production 공개 버전이 후보와 다르고 Production /ko 500.
- 최종 커밋 후 정확 SHA 필수 게이트를 재실행하고 PR에 기록 예정. 병합·Test/운영 배포·GitOps 변경·브랜치 삭제 없음. 롤백 불필요. 다른 A/B/Gemini/QA 작업 보호.
