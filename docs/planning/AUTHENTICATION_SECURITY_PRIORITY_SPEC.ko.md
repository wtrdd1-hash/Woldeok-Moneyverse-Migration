# 월덕 머니버스 — 인증 보안 및 구현 우선순위 명세

> 버전: v2026.09.12.29
> 상태: 구현 지향형 보안·제품 기획서
> 기준일: 2026-09-12
> 영문 기준 문서: [AUTHENTICATION_SECURITY_PRIORITY_SPEC.md](AUTHENTICATION_SECURITY_PRIORITY_SPEC.md)

## 1. 목적

실제 공개 서비스 기준으로 미구현 기능의 우선순위를 정하고, 기존 OAuth/OIDC·서버 세션·재인증·TOTP·PostgreSQL 보안 경계를 재사용하는 자체 이메일/비밀번호 회원가입·로그인 시스템을 설계한다.

## 2. 우선순위

### P0 — 계정·보안 기반
1. 자체 회원가입/로그인/이메일 인증/비밀번호 복구
2. 활성 세션 조회·다른 세션 종료·최근 보안 이벤트를 제공하는 보안센터
3. 인증/개인정보 DB 최소권한 경계
4. credential stuffing·brute force·password spraying·가입봇·계정열거 방지
5. 개인정보 최소수집·보존·삭제·내보내기 정책
6. 서비스 복구 후 실제 로그인 흐름 Runtime Reality Audit

### P0.5 — 공개 확장 전 필수
- 한국/미국 개인정보·약관 표시 정합성
- 약관/개인정보처리방침 버전 동의 기록
- 계정 삭제/내보내기/복구 운영 runbook
- 보안 모니터링·경보·사고대응·백업복구 검증
- CAPTCHA는 위험신호가 있을 때만 단계적으로 적용

### P1 — 제품 완성
- 개인 대시보드/온보딩 마무리
- Season 1 실제 콘텐츠/보상표
- 주식 상세/리플레이/포트폴리오 UX
- 사업/직업/상점/거래소 seed catalog 및 운영 콘솔
- 카지노는 별도 법률/스토어 gate 뒤에서만 진행

### P2 — 성장/수익화
- SEO 공개 콘텐츠/검색운영
- 허용된 공개 페이지의 contextual 광고
- 광고제거 구독·비-P2W 꾸미기
- anti-abuse 검증 이후 추천/공유 루프

## 3. 계정 모델

내부 기준 주체는 예측 불가능한 immutable `user_id` 하나로 한다. 이메일, 닉네임, Discord ID, 순차 증가 ID를 권한판단 기준으로 사용하지 않는다. `local_email`, OAuth/OIDC, 향후 passkey를 같은 내부 사용자에 연결한다. 같은 이메일 문자열이라는 이유만으로 OAuth 계정을 자동 병합하지 않는다.

## 4. 개인정보 최소수집

기본 가입은 이메일, 비밀번호 해시, 표시명(필요 시), locale, 약관/개인정보 동의 버전, 보안상 필요한 최소 메타데이터만 수집한다. 실명, 주민등록번호, 주소, 전화번호, 생년월일, 정부 ID, 금융계좌 등은 향후 별도 법적 필요성과 검토 없이 수집하지 않는다.

개인정보는 공개 프로필, analytics payload, 일반 로그, 오류 trace, URL, localStorage, 클라이언트 JWT claim에 복제하지 않는다.

## 5. 비밀번호

평문 저장·복호화 가능한 암호화 저장·로그 기록·관리자 조회를 금지한다. Argon2id를 기본으로 하고 최신 OWASP 권장 수준 이상을 운영급 서버에서 부하검증한다. 사용자별 고유 salt, 알고리즘/파라미터 버전을 저장하고 로그인 성공 시 필요하면 자동 rehash한다. pepper 사용 시 DB/Git이 아닌 secret manager에 둔다.

긴 passphrase와 Unicode를 허용하고 붙여넣기/비밀번호관리자를 막지 않는다. 임의의 대문자/특수문자 조합 규칙에 의존하지 않고 유출/취약 비밀번호 차단목록을 사용한다. 유출 징후가 없는데 주기적으로 강제 변경하지 않는다.

## 6. 회원가입

`START → INPUT_VALIDATED → EMAIL_VERIFICATION_PENDING → EMAIL_VERIFIED → ACTIVATED`

모든 요청은 HTTPS 전용. 이메일 normalization은 보수적으로 하고 provider별 alias를 임의 병합하지 않는다. 이메일 검증 challenge는 충분한 entropy, 짧은 만료시간, 1회성으로 만들며 가능한 경우 DB에는 token hash만 저장한다. 성공 시 계정을 transaction으로 활성화하고 pre-auth session을 폐기/회전한 새 세션을 발급한다.

이미 존재하는 이메일 여부는 외부 응답만으로 확실히 알 수 없게 한다.

## 7. 로그인/세션

잘못된 이메일과 잘못된 비밀번호는 사용자에게 동일한 일반 오류를 보여준다. 내부 telemetry에서만 세부 원인을 구분한다.

성공 시 세션 ID를 회전하고 `HttpOnly`, `Secure`, host-scoped, 가능한 경우 `__Host-`, 명시적 `SameSite` cookie를 사용한다. auth token/JWT/refresh token을 localStorage/sessionStorage에 저장하지 않는다. 세션 의미는 서버측에서 관리한다.

## 8. SQL Injection 방지

이메일·닉네임·비밀번호·reset token·session ID·provider ID·관리자 검색값 등 모든 사용자 입력 SQL은 parameterized query/prepared statement 또는 고정 저장함수만 사용한다. 문자열 연결형 동적 SQL은 금지한다.

동적 컬럼명/정렬키처럼 bind parameter를 쓸 수 없는 값은 내부 enum→허용목록 매핑만 사용한다. DTO 길이/타입/예상외 필드 거부를 적용하지만 validation이 parameterization을 대체하지 않는다.

## 9. 개인정보 DB 보안

권장 논리 테이블: `users`, `user_private_profile`, `auth_local_credentials`, `auth_identities`, `auth_email_verifications`, `auth_password_resets`, `auth_sessions`, `auth_security_events`, `consent_acceptances`.

앱 runtime role에는 필요한 함수/view 실행권만 주고 민감 테이블에 광범위한 직접 INSERT/UPDATE/DELETE를 주지 않는다. 이메일은 private data로 취급한다. 관리자 목록에는 기본적으로 전체 이메일을 표시하지 않고 masking하며, 예외적 조회는 reason + reauth + audit를 요구한다.

## 10. 비밀번호 복구

reset token은 CSPRNG 기반, 단기만료, 1회성, 목적바인딩이며 가능한 경우 hash만 저장한다. 계정 존재 여부를 공개 응답으로 노출하지 않는다. 성공 시 기존 reset token과 다른 활성 세션을 기본적으로 폐기하고 보안 알림을 보낸다. 지원인력이 사용자 비밀번호를 읽거나 임의 설정하는 기능은 만들지 않는다.

## 11. 자동공격 방어

단일 영구 account lockout에 의존하지 않는다. IP/account/network/device-risk별 throttling, progressive delay, credential stuffing/spraying 탐지, 위험기반 challenge, MFA/passkey 권고, 필요한 경우 CAPTCHA를 계층적으로 사용한다. 공격자가 타인의 계정을 의도적으로 영구잠금시키지 못해야 한다.

## 12. MFA/Passkey

일반 사용자에게 선택형 TOTP를 P0/P0.5로 제공하고, P1에서 WebAuthn/passkey를 우선 인증수단으로 확장한다. recovery code는 1회성이고 hash 저장한다. 비밀번호/이메일 변경, provider 연결, MFA 해제, 계정삭제/내보내기 등 고위험 동작에는 최근 재인증을 요구한다.

## 13. CSRF/XSS/세션탈취

Cookie 인증 mutation은 SameSite만 믿지 않고 CSRF 방어를 둔다. GET mutation 금지. auth 페이지에는 불필요한 third-party script를 최소화한다. login/reset token이 analytics, referrer, log, screenshot/support 도구에 유출되지 않게 한다. 로그인/권한변경 후 세션 rotation, logout 서버측 revoke를 필수로 한다.

## 14. 이메일 변경

활성세션 + 최근 재인증 + 새 이메일 검증 + 기존 이메일 알림 + identity 충돌 검사를 거쳐야 한다. 새 이메일 확인 전에 기존 verified 주소를 즉시 제거하지 않는다.

## 15. 계정 상태/개인정보 lifecycle

`PENDING_EMAIL → ACTIVE → SECURITY_HOLD | USER_LOCKED | SUSPENDED`, 개인정보 삭제는 `DELETION_PENDING → DELETED/ANONYMIZED`로 별도 관리한다. 보안 hold와 커뮤니티 제재를 혼동하지 않는다.

계정삭제 시 원장/audit 무결성을 깨지 말고 법적·보안상 필요한 비식별 거래기록만 남긴다. 각 필드의 보유목적/근거/기간/삭제·익명화 방법을 문서화하고 backup 만료와 restore 시 삭제재적용 절차도 둔다.

## 16. 로깅

비밀번호, hash, reset/verify token, session cookie, TOTP secret, recovery code, OAuth token, DB secret, 전체 request body를 로그에 남기지 않는다. 안전한 user/session reference, event type, result, timestamp, trace ID 등만 구조화한다.

## 17. P0 API

`POST /auth/register`, `/auth/verify-email`, `/auth/login`, `/auth/logout`, `/auth/logout-all`, `/auth/password/forgot`, `/auth/password/reset`, `/auth/password/change`, `/auth/email/change/start`, `/auth/email/change/confirm`, `GET /auth/sessions`, `DELETE /auth/sessions/:sessionId`, `GET /auth/security-events`.

## 18. UI

회원가입: 이메일/비밀번호/필수 동의만 최소 제공. 요구조건 사전표시, password manager/autofill 지원. 로그인: OAuth와 자체 로그인을 명확히 분리하되 우열 없이 제공. auth 화면에는 광고 금지. 보안센터에서 세션, 비밀번호, MFA/passkey, 연결 provider, 최근 보안이벤트, 계정 내보내기/삭제를 제공하며 민감값은 masking한다.

## 19. 필수 테스트

hash/rehash, token expiry, 모든 auth 입력 SQL injection, enumeration timing/response, brute force/credential stuffing, CSRF, session fixation/rotation/revoke, reset 동시사용, verification replay, session/security endpoint BOLA, XSS/output encoding, DB role negative test, backup/restore 보안, 테스트서버 exact-SHA E2E 회원가입→인증→로그인→복구→logout-all을 필수로 한다.

## 20. 완료 조건

Argon2id, parameterized SQL, localStorage token 금지, 안전한 server-side session, CSRF/XSS/session fixation 방어, enumeration 저항, 1회성 email/reset token, 자동공격 방어, MFA/재인증, 최소권한 DB, 관리자 masking/audit, 개인정보 retention/delete/export, session revoke, EN/KO parity, test-server exact-SHA 보안검증이 모두 통과해야 완료다.

## 21. 최신 근거

현재 OWASP는 SQL 문자열 연결 대신 parameterized query, Argon2id 같은 adaptive password hashing, 안전한 server-side session, generic auth error, 고위험 재인증, layered credential-stuffing 방어를 권고한다. NIST Digital Identity 최신 지침과 한국 개인정보보호위원회 안전조치·접근통제·보유/파기 원칙을 구현 직전에 다시 확인한다.

## 22. 변경 기록

### v2026.09.12.29
- 미구현 우선순위에서 계정/보안을 P0로 지정
- 자체 이메일/비밀번호 회원가입·로그인·복구·보안센터 명세화
- SQL Injection, 세션탈취, CSRF/XSS, 계정열거, credential stuffing 방어 추가
- 개인정보 최소수집·DB 최소권한·관리자 masking·audit·삭제/내보내기 설계
- 실제 구현은 별도 개발 브랜치와 테스트서버 exact-SHA 검증 필수

문서-only 변경이며 이 버전 자체는 테스트서버 배포가 필요하지 않다.