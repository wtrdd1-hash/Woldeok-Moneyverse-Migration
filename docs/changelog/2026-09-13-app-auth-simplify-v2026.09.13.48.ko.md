# v2026.09.13.48 — 앱 인증 단순화 및 API 상세 문서

- 제품 결정에 따라 자체 회원가입 비밀번호의 숫자형 최소 글자 수 제한을 제거했다.
- 빈 비밀번호 거부와 128 code point 기술적 최대치는 유지한다.
- 짧은 비밀번호 정책에 맞춰 명백한 common password 차단 목록을 보강했다.
- Argon2id 저장, NFC 정규화, 일반화된 로그인 실패 응답, 기존 인증 rate limit은 유지한다.
- prelogin, 동의, 회원가입, 이메일 인증, 로그인, viewer/session 확인, 로그아웃, OAuth 시작점을 설명하는 영어/한국어 인증 전용 상세 API 문서를 추가했다.
- 현재 기획서와 모바일 API/UI 문서를 동기화했다. 과거 changelog/worklog 기록은 수정하지 않았다.
- 배포 순서: 기능 브랜치 -> 격리 Test exact-SHA 검증 -> main -> Production.
