# 개발 C v1310 — 회원 프로필 원본 검증 (한국어 보조)

상태: 초안 / 배포 보류. main 병합, 공식 Test 및 Production 변경 없음.

## 시작 (2026-11-02 21:39 KST)
- Debian 13.6 미니PC, 핵심 서비스 7개, 개발 PostgreSQL 정상. 기준 main `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`.
- AGENTS, 영문/국문 README와 기획서, 활성 PR·QA·A/B/C 확인. 다른 개발자의 변경 중인 기본 작업 폴더를 건드리지 않고 독립 worktree 생성.
- 타인 프로필 화면은 API 타입 단언을 그대로 신뢰했고 Android 게이트웨이는 검증되지 않은 프로필 및 캐시 헤더를 전달할 수 있었음.

## 중간 (2026-11-02 21:44 KST)
- 실패 재현 후 집중 테스트 17/17 통과. 가입일, 이름, 이미지, 직업, 레벨, 정확한 큰 정수 작업 횟수, 공개 범위 및 칭호를 검증하고 미승인 필드를 제거.
- 웹 오류 안내·재조회·접근성 개선, Android 응답의 비공개 캐시·비색인·참조 차단 및 오류 본문 정화 적용.
- 중간 main 재확인 결과 변경 없음. Typecheck·Build 통과. 최초 Lint의 신규 테스트 정밀도 리터럴 오류 수정.

## 종료 조건
- 최종 SHA 전체 테스트, 실제 PostgreSQL, CI, 공식 Test, E2E 증빙을 확인하기 전에는 성공·병합·운영 배포로 표시하지 않음.
- 금융 원장·DB 스키마 변경 없음. A/B/Gemini/QA와 예약 5개 유지. 결과는 독립 브랜치와 Draft PR에 보존.

## 실제 HTTP 결함 재현 및 보완 (2026-11-02 22:02 KST)
- 독립 Next.js 서버에서 회원 프로필 기본·영어·Android API 경로의 `X-Robots-Tag: index, follow`를 확인. 전역 next.config 헤더가 페이지·API의 비색인 설정을 덮어쓴 원인임. `/frontend-version`은 Git SHA가 아닌 타임스탬프이므로 정확한 SHA 증빙이 아님.
- 기본/다국어/Android/API 8개 경로에 비색인·비공개 캐시·참조정보 차단 규칙을 명시. 실패 재현 8건, 수정 후 헤더·보안 테스트 16/16 통과. 실제 HTTP 재검증 필요.
- 최초 커밋 기준 프론트 2,955 PASS, 백엔드 2,983 PASS/518 SKIP, 독립 PostgreSQL 17.11 마이그레이션 323개 및 프로필 DB 24건 PASS. Lint 오류 0/경고 1,027, Typecheck·Build·API 계약 184개 PASS. 전체 의존성 감사 9건 및 QA 증빙 누락, 공식 인증 E2E·Test 정확 SHA는 배포 차단.
