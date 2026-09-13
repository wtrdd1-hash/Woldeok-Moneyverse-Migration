# 내부 작업내역 — v2026.09.13.48

## 요청
앱 자체 인증을 단순화하고 비밀번호 숫자형 최소 길이를 제거한다. 로그인/회원가입 API 사용법을 상세 문서화하고, 격리 Test에서 실제 API를 확인한 뒤 main 및 운영으로 승격한다.

## 구현
- 회원가입 정책을 기존 15~128자에서 `빈 값 금지 + 최대 128 code point`, 숫자형 최소 길이 없음으로 변경.
- 로그인 요청 검증에서도 숫자형 최소 길이 선언 제거.
- 짧은 비밀번호 정책에 맞춰 명백한 common password를 명시적으로 차단.
- 기존 Argon2id/NFC/session/CSRF/계정열거 방어 유지.
- `docs/app-auth-api-guide.md` 및 한국어 동등 문서 추가.
- 현재 인증 기획서와 모바일 연동 문서를 동기화.

## 배포 필수 확인
- 로컬 lint/typecheck/build/test;
- exact-SHA Test 배포;
- 메일/테스트 계정 조건이 허용하는 범위에서 Test 서버 prelogin/policy/consent/register/verify/login/viewer/logout 실제 호출;
- Test backend health/version 확인;
- Test 통과 후에만 main 통합;
- 운영 승격 후 exact-SHA/backend 확인.
