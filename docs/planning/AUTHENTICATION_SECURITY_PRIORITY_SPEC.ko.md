# 월덕 머니버스 — 인증 보안 및 구현 우선순위 명세

> 버전: v2026.09.12.31
> 상태: 구현 지향형 보안·제품 기획서
> 기준일: 2026-09-12
> 영문 기준 문서: [AUTHENTICATION_SECURITY_PRIORITY_SPEC.md](AUTHENTICATION_SECURITY_PRIORITY_SPEC.md)

## 0. 핵심 결정

Moneyverse는 계정·경제·커뮤니티 데이터를 다루는 실제 공개 서비스다. 따라서 미구현 기능은 화면의 화려함보다 **계정 무결성 → 개인정보 보호 → DB 최소권한 → 복구 가능성 → 핵심 제품 → 성장/수익화** 순서로 개발한다.

기존 OAuth/OIDC, 서버측 세션, 재인증, TOTP/관리자 2차 인증, PostgreSQL 보안 경계, append-only audit, Test 우선 배포 구조는 유지한다. 자체 이메일/비밀번호 로그인은 기존 인증 코어에 `local_email` provider를 추가하는 방식이며 별도의 세션 체계를 만들지 않는다.

## 1. 미구현 우선순위

### P0 — 출시/보안 차단 항목
1. 자체 회원가입·로그인·이메일 인증·비밀번호 복구
2. 인증/개인정보 DB 최소권한 경계와 direct access 차단
3. 사용자 보안센터: 활성 세션, 단일 세션 해제, 전체 세션 종료, 최근 보안 이벤트
4. credential stuffing·password spraying·brute force·가입봇·메일폭탄 방어
5. 개인정보 inventory, 보존기간, 삭제/익명화, 내보내기
6. 인증 전용 보안 로그·탐지·사고대응·백업복원 검증
7. 서비스 복구 후 실제 인증 화면 Runtime Product Reality Audit

P0가 끝나기 전 대규모 광고·추천 보상·고위험 경제 기능 확장은 하지 않는다.

### P0.5 — 공개 확장 전 필수
- 한국/미국 약관·개인정보·동의 버전 기록
- 계정 삭제/내보내기/복구/침해사고/identity linking 운영 runbook
- OWASP ASVS 5.0 기준 인증·세션·접근통제·입력검증·데이터보호 보안 검토
- 이메일 발송 도메인 SPF/DKIM/DMARC 및 피싱 방지 템플릿
- CAPTCHA는 위험신호에 따라 단계 적용하며 서버 rate limit을 대체하지 않음
- 2026-09-11 시행된 한국 개인정보 유출 예방·피해구제 강화 제도의 실제 적용범위 검토 (`legal/compliance review required`)

### P1 — 제품 완성
- 신규유저 온보딩·개인 대시보드
- 직업/숙련도와 실제 seed content
- Season 1 콘텐츠·보상·정산 end-to-end
- WDX 상세/포트폴리오/replay/시장무결성 UX
- 사업·상점·유저거래소·제작·클럽·개인공간 seed catalog와 관리자 config
- 카지노/확률 기능은 별도 법률·연령·배포채널 gate 후 진행

### P2 — 성장·수익
- 공개 SEO 콘텐츠와 Search Console 운영
- 허용된 공개 페이지의 contextual 광고
- 광고제거 구독·비-P2W 꾸미기
- anti-abuse가 검증된 후 referral/share loop

## 2. 계정/Identity 모델

권한의 기준은 예측 불가능하고 변경되지 않는 내부 `user_id`다. 이메일, 닉네임, Discord ID, URL의 user ID, 순차 증가 DB 키를 단독 권한판단 기준으로 사용하지 않는다.

지원 identity:
- `local_email`: 검증된 이메일 + 비밀번호
- 기존 OAuth/OIDC
- 향후 WebAuthn/passkey

OAuth 이메일과 로컬 이메일이 같다는 이유만으로 자동 계정병합하지 않는다. provider 연결/해제에는 기존 계정 로그인, 최근 재인증, provider 증명, 충돌 검사가 필요하다. 마지막 로그인 수단을 제거하려면 먼저 대체 수단을 등록해야 한다.

## 3. 개인정보 최소수집

기본 가입에서 수집하는 것은 검증 이메일, one-way password verifier, 필요한 표시명, locale, 약관/개인정보 버전, 보안상 꼭 필요한 최소 risk metadata뿐이다.

실명, 주민등록번호, 집주소, 전화번호, 정부 발급 ID, 정확한 위치, 금융계좌, 생년월일은 기본 수집하지 않는다. 연령처리가 필요하면 배포채널/법적 요구를 만족하는 최소정보 방식으로 별도 설계한다.

개인정보를 공개 프로필, URL, 일반 analytics, 클라이언트 JWT claim, localStorage, 로그, exception, metrics label, 지원 스크린샷으로 복제하지 않는다.

필드별 `목적/수집경로/DB 위치/암호화·접근등급/처리자/보유기간/삭제·익명화/내보내기/책임자` inventory를 유지한다.

## 4. 비밀번호 정책

최종 NIST SP 800-63B-4(2025-08-01)를 기준으로 구현 직전 다시 확인한다. 일반 로컬 계정에서 비밀번호가 단일 factor로 동작할 수 있으므로 기본 최소길이는 **15자**로 계획한다. 최소 64자 이상을 지원하고, DoS 방지를 위한 128/256 code point 같은 기술적 최대치는 문서화하되 절대 자동 잘라내지 않는다.

- 공백·Unicode·긴 passphrase 허용
- Unicode normalization은 일관되게 적용하며 현재 NIST의 NFC 지침 우선 검토
- 대문자/소문자/숫자/특수문자 강제 조합 규칙에 의존하지 않음
- 유출 징후 없는 주기적 강제 변경 금지
- 전체 비밀번호를 common/compromised password blocklist와 비교
- 보안질문/KBA 금지
- hint 금지
- 붙여넣기/autofill/password manager 허용

## 5. 비밀번호 저장

평문·복호화 가능한 저장·로그·관리자 조회를 금지한다. 기본은 **Argon2id**다. 현재 OWASP Password Storage 기준(예: 19MiB, iteration 2, parallelism 1 이상)을 최소 출발점으로 보고 실제 Production급 장비에서 latency와 DoS 내성을 benchmark한다.

사용자별 CSPRNG salt, 알고리즘/파라미터 버전을 저장하고 로그인 성공 시 필요하면 자동 rehash한다. pepper를 사용하면 DB/Git이 아니라 별도 secret manager에 둔다. hash 노출도 보안사고로 취급한다.

## 6. 회원가입 상태머신

`START → VALIDATED → VERIFICATION_PENDING → VERIFIED → ACTIVE`

1. HTTPS로만 입력 수신
2. 비싼 hash 전에 DTO type/길이 제한
3. 이메일은 보수적으로 normalize하고 Gmail식 임의 alias 병합 금지
4. DB row/mail 생성 전 abuse/rate 체크
5. 계정 존재여부를 외부에 확정적으로 노출하지 않는 parameterized uniqueness check
6. 고entropy 1회용 verification token 생성, DB에는 hash/reference·만료·사용상태 저장
7. 민감정보 없는 인증메일 전송
8. 검증 성공 시 transaction으로 활성화
9. pre-auth session을 폐기/회전하고 정상 서버세션 발급
10. consent/security event 기록

활성화 전에 referral reward나 경제재화를 지급하지 않는다.

## 7. 로그인·계정열거 방지

존재하지 않는 이메일, 잘못된 비밀번호, 비활성 credential은 사용자에게 동일한 일반 오류계열을 사용한다. 세부 원인은 제한된 내부 telemetry에만 남긴다. retry header/rate behavior도 계정 존재 여부를 쉽게 드러내지 않게 한다.

로그인 성공 시 session ID 회전, `HttpOnly`, `Secure`, host-scoped cookie, 가능한 경우 `__Host-`, 명시적 SameSite 정책을 사용한다. session/refresh/auth token을 localStorage/sessionStorage에 저장하지 않는다. 세션의 실제 상태는 서버에서 관리한다.

## 8. SQL Injection 및 입력창 보안

SQL Injection은 출시 차단 결함으로 분류한다. OWASP Top 10:2025의 Injection 및 SQL Injection Prevention 원칙을 따른다.

- 이메일/닉네임/token/session/provider/IP-derived value/검색/관리자 filter 등 모든 값은 bind parameter 또는 검토된 고정 DB 함수 사용
- 문자열 연결 SQL 금지
- column/order처럼 parameterize할 수 없는 identifier는 내부 enum allowlist로만 매핑
- 클라이언트가 table/function명을 선택하게 하지 않음
- stored procedure 내부 dynamic SQL도 동일 규칙
- raw SQL/schema/table/bind/stacktrace를 사용자 오류로 반환하지 않음
- input validation은 필수지만 parameterization의 대체재가 아님

자동 테스트에는 quote/comment marker/Unicode edge/과도한 길이/JSON type confusion/잘못된 encoding을 포함한다. 목표는 “악성문자 제거”가 아니라 **SQL 구조가 사용자 입력과 무관하게 고정**되는 것이다.

## 9. DB 개인정보 경계

권장 논리 테이블:
`users`, `user_private_profile`, `auth_local_credentials`, `auth_identities`, `auth_email_verifications`, `auth_password_resets`, `auth_sessions`, `auth_security_events`, `consent_acceptances`.

앱 runtime role에는 최소권한만 주고 credential/private table의 광범위 direct INSERT/UPDATE/DELETE를 피한다. 현재 구조와 맞는 경우 actor-scoped view와 검토된 `SECURITY DEFINER` 함수를 사용하며 함수 내부에서도 actor와 safe search_path를 재검증한다.

브라우저에는 DB credential을 절대 주지 않는다. 관리자 목록은 이메일 masking이 기본이고 예외적 원문 조회는 권한+재인증+사유+audit가 필요하다. password hash/reset token/MFA secret/session cookie를 관리자 UI에서 보는 기능은 존재하지 않는다.

## 10. 저장·백업·환경분리

전송은 TLS. DB/storage/disk 암호화와 필요 시 application-level envelope encryption을 사용한다. key/pepper는 PostgreSQL/Git과 분리한다.

백업도 Production과 동급 이상으로 보호한다. restore 시 DB grant가 약해지지 않는지, 과거 backup으로 복원한 경우 이미 삭제/익명화된 개인정보를 재적용하는 절차가 있는지 검증한다.

Production 개인정보를 개발/Test에 기본 복사하지 않는다. synthetic fixture를 사용하고 불가피한 경우 비가역 최소화 절차를 사용한다.

## 11. 비밀번호 복구·이메일 변경

reset 요청은 항상 일반 응답. token은 CSPRNG, 목적바인딩, 단기만료, 1회성, hash 저장. 성공 시 새 hash 저장, 다른 reset token 폐기, 다른 활성세션 기본 폐기, security event, 알림메일을 원자적으로 처리한다.

지원인력은 비밀번호를 읽거나 임의 설정하지 못한다.

이메일 변경은 로그인된 세션 + 최근 재인증 + 새 이메일 검증 + 기존 이메일 알림 + identity 충돌검사를 거친다. 새 이메일 검증 전 기존 주소를 제거하지 않는다.

## 12. 자동공격 방어

per-account, per-IP/network rate limit, password spraying 탐지, progressive backoff, compromised password 차단, 위험 로그인 알림, 필요 시 risk-based CAPTCHA, optional MFA/passkey, verification/reset mail rate budget을 계층적으로 사용한다.

공격자가 실패요청만으로 피해자의 계정을 영구잠금시키지 못해야 한다. 이 보안 rate limit은 일반 gameplay hardcap과 목적이 다르므로 unlimited-default 정책의 보호목적 예외이며 false positive/차단/우회/support 지표를 기록한다.

## 13. MFA·Passkey·재인증

일반 사용자 optional TOTP를 초기 안전버전에 포함하고, 이후 WebAuthn/passkey를 phishing-resistant 기본 경로로 확장한다. recovery code는 1회성 hash 저장이며 새 코드 생성 시 기존 세트를 폐기한다.

비밀번호/로그인이메일 변경, provider 연결/해제, MFA 해제, recovery code 재생성, 계정삭제/내보내기는 최근 재인증을 요구한다.

## 14. 세션·CSRF·XSS

세션 ID는 secret이면서 외부 입력이므로 format validation + parameterized lookup을 적용한다. login/권한상승 후 rotate, logout 서버 revoke, revoke-one/revoke-all, idle/absolute expiry, 의심 replay step-up/revoke를 지원한다.

Cookie 인증 mutation은 CSRF 보호를 사용하고 GET mutation은 금지한다. Auth 화면에는 광고/행태추적/불필요한 3rd-party script를 두지 않는다. CSP/output encoding을 적용하고 reset/login token이 referrer, analytics, log, screenshot으로 새지 않게 한다.

## 15. 개인정보 lifecycle·logging

상태 예시: `PENDING_EMAIL → ACTIVE → SECURITY_HOLD | USER_LOCKED | SUSPENDED`, 삭제는 `DELETION_PENDING → DELETED/ANONYMIZED`.

삭제는 append-only 경제원장/audit 무결성을 깨지 않으면서 유효한 보유근거가 없는 식별정보를 삭제/익명화한다. export는 actor-scoped이며 다른 사용자의 정보, credential hash, 보안secret, 내부 anti-abuse rule을 포함하지 않는다.

비밀번호/hash/token/session cookie/TOTP secret/recovery code/OAuth token/DB secret/전체 request body는 로그 금지. 안전한 opaque ID, event type/result/timestamp/trace ID와 제한된 risk metadata만 사용한다.

2026-09-11 한국 개인정보 유출 예방·피해구제 강화 제도가 시행되었으므로 prevention governance와 breach readiness를 실제 운영체계로 증빙할 수 있어야 한다. 다만 ISMS-P 등 개별 적용요건은 서비스 규모·법적 지위에 따라 별도 확인한다.

## 16. P0 API

- `POST /auth/register`
- `POST /auth/verify-email`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `POST /auth/password/forgot`
- `POST /auth/password/reset`
- `POST /auth/password/change`
- `POST /auth/email/change/start`
- `POST /auth/email/change/confirm`
- `GET /auth/sessions`
- `DELETE /auth/sessions/:sessionId`
- `GET /auth/security-events`

MFA/passkey는 별도 namespace. 모든 mutation은 중복/동시요청 시 idempotency/replay 동작을 명시한다.

## 17. UI/UX

회원가입은 필요한 필드만 제공하고 password manager/autofill/paste를 지원한다. 로그인은 자체로그인과 OAuth를 명확하게 제공하며 invalid credential은 일반 오류. 보안센터는 password, MFA/passkey, linked provider, active session, recent security events, export/delete로 구성한다.

offline, maintenance, throttled, verification-expired, token-used, security-hold, recovery-unavailable 상태를 별도로 설계하며 backend raw error를 화면에 출력하지 않는다.

## 18. 출시 전 필수 테스트

1. password normalize/hash/rehash/blocklist
2. 모든 auth/admin 검색값 SQL injection regression
3. runtime DB role의 credential direct read/write 실패 확인
4. account enumeration timing/response
5. credential stuffing/password spraying/rate-limit false positive
6. 가입·reset·verify mail bomb
7. 모든 cookie mutation CSRF
8. XSS/output encoding/CSP
9. session fixation/rotation/expiry/revoke-one/revoke-all/replay
10. reset/verify token 동시사용 single-consumption
11. session/security/export BOLA/IDOR
12. provider link/unlink takeover
13. backup restore 권한·삭제 재적용
14. 로그 redaction
15. Test exact-SHA E2E: register→verify→login→reauth→password change/reset→logout-all→provider link/unlink→delete/export

Production은 이 release-blocking test가 격리 Test 환경에서 모두 통과한 뒤에만 진행한다.

## 19. 완료 조건

NIST 기준 password policy, Argon2id+rehash, 모든 SQL parameterization, DB 최소권한 negative test, server-side secure session, localStorage token 금지, CSRF/XSS/session 공격 방어, email verification/recovery, enumeration 저항, 자동공격 방어, MFA/재인증, 세션 보안센터, 관리자 masking/audit, retention/delete/export/backup, incident response, EN/KO parity, Test exact-SHA QA와 rollback까지 완료되어야 자체 로그인이 “완성”이다.

## 20. 최신 근거

직접 채택:
- NIST SP 800-63B-4 최종본(2025-08-01): single-factor password 최소 15자, 64자 이상 지원, 임의 조합규칙/주기적 강제변경 금지, compromised/common blocklist
- 현재 OWASP Password Storage: Argon2id, unique salt, adaptive work factor
- 현재 OWASP Authentication/Session: generic error, 안전한 recovery, credential-stuffing 방어, session rotate/revoke, 고위험 재인증
- OWASP Top 10:2025 A05 Injection 및 SQL Injection Prevention: parameterized query를 기본 방어로 사용
- 개인정보보호위원회 2026-09-10 발표: 개인정보 유출 사전예방·피해구제 강화 제도 2026-09-11 시행

CAPTCHA/device risk는 보조 참고만 하며 authorization/DB/input 보안 경계로 신뢰하지 않는다.

## 21. 변경 기록

### v2026.09.12.31
- 미구현 기능 우선순위를 보안 P0 → 제품 P1 → 성장/수익 P2로 재정렬
- 자체 이메일/비밀번호를 기존 인증 코어의 provider로 정의
- NIST SP 800-63B-4 최종본 기준 15자 single-factor password 정책 명시
- SQL Injection을 release blocker로 지정하고 DB 최소권한 negative test 추가
- Production 데이터 Test 복사 금지, backup 삭제재적용, 세션보안센터, identity linking, mail abuse, incident readiness 추가
- 2026-09-11 시행 한국 개인정보 강화 제도의 적용성 검토 gate 추가

문서-only 변경이다. 실제 코드는 별도 개발 브랜치 → 격리 Test exact-SHA 보안검증 → Production 순서로 구현한다.