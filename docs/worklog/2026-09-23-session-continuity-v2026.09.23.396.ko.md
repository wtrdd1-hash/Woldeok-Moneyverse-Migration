# 작업 기록 — v2026.09.23.396 세션 연속성 기획

## 기준
- 편집 전 remote main: `5762e7bc685dc8d75ce6e672a6cef1dcc9b03ee4`.
- main 최신 병합 update/release 기록: v393.
- 편집 전 권위 `PROJECT_PLAN`/통합 원장: v388.
- 전용 작업 브랜치: `docs/v2026.09.23.396-session-continuity`.

## 기획 결정
일반 배포·재시작·cutover 때문에 로그아웃이 발생하면 P0 릴리스 실패로 판정한다. 인증 연속성은 배포 인스턴스와 독립된 세션 저장, 호환 cookie/session schema, 안정적이거나 overlap 회전되는 암호키, 배포 전후 authenticated-session 실증으로 보장해야 한다.

## 증거 경계
이번 작업은 문서/기획 전용이며 runtime 코드, Test 서버, Production 서버, session store, signing-key 설정을 변경하지 않았다.
