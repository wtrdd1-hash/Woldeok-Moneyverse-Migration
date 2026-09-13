# v2026.09.13.21 — 자체 인증 이메일 인증메일 실제 발송

## 선택 기능
자체 이메일/비밀번호 회원가입에서 기존 자체 SMTP 서버를 이용해 실제 인증메일을 발송하도록 연결합니다.

## 사용자 효과
`local_email`로 가입한 사용자는 개발용 인증 토큰 응답에 의존하지 않고 입력한 이메일 주소에서 인증 링크를 받을 수 있습니다.

## 기준선 및 중복 확인
- 개발 시작 전 애플리케이션 `main`: `16b0385dafae809941b292e9f2bc992e4dcfacb3`.
- 병합된 PR #193의 자체 로그인/회원가입 구현을 먼저 확인했습니다.
- 최근 인증/보안 브랜치를 확인했으며 `local-auth.controller.ts` 또는 SMTP 발송을 대체하는 더 최신 런타임 구현은 없었습니다.
- 인프라에는 이미 `apps/mail`의 docker-mailserver가 있으므로 메일 서버를 중복 구축하지 않습니다.
- Living Project Plan을 작업 전과 중간에 다시 읽었습니다.

## 런타임 변경
- Node 기본 모듈만 사용하는 SMTP 인증메일 발송기를 추가했습니다.
- 기본값은 TLS SMTP submission이며, 격리 테스트 SMTP를 위해 명시적으로 비TLS 모드도 사용할 수 있습니다.
- 신규 자체 회원가입이 정상 접수되면 인증 링크를 이메일로 발송합니다.
- 운영에서는 메일 전송 경로가 동작하지 않으면 성공한 것처럼 응답하지 않고 fail-closed 합니다.
- 개발 환경에서는 기존의 인증 토큰 응답 방식을 유지해 로컬 개발이 막히지 않도록 합니다.

## 필요한 비밀/환경 설정
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM`

실제 비밀번호 등 비밀값은 Git에 커밋하지 않고 기존 암호화/클러스터 Secret 경로로만 주입해야 합니다.

## 검증
로컬 스크립트 SMTP 서버를 사용하는 회귀 테스트를 추가해 AUTH LOGIN, 송신자/수신자 envelope, DATA 발송, 인증 링크 생성과 SMTP 미설정 시 fail-closed 동작을 검증하도록 했습니다.

정확한 후보 SHA의 CI/Test/Production 증거는 PR에서 별도로 기록합니다. 이 문서에서는 Test/운영 발송 성공을 주장하지 않습니다.

## 남은 운영 게이트
자체 메일 서버에 `SMTP_USERNAME`에 대응하는 submission 계정이 실제로 존재해야 하고 backend Secret에 해당 비밀번호가 있어야 합니다. 외부 메일함 실제 수신까지 격리 Test에서 확인한 후에만 Production 승격할 수 있습니다.
