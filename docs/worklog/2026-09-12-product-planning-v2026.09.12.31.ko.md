# 제품 기획 작업 로그 — v2026.09.12.31

## 범위

Moneyverse 미구현 기능의 우선순위를 정하고 실제 공개 서비스 수준의 자체 회원가입·로그인 보안을 기획했다.

## 확인한 기준

- 작업 시작 시 최신 `main`: `1b430f540d978751e67f1417ae5747e048f8bd74`
- Living Project Plan, Product Growth Plan, Detailed Product Design Spec, Season System Spec
- `backend/src/auth`의 기존 OAuth/OIDC·cookie/session·재인증·TOTP 기반
- 개인정보/수익화/SEO 최신 기획

작업 중 `main`은 `381a26a097dc3c5970a94ad43603f9653613684b`까지 갱신되었고 추가 변경은 한국어 앱 게이트웨이 문서 중심이었다. 이번 인증 명세와 직접 충돌은 확인되지 않았으며 merge 전 최신 main과 최종 동기화가 필요하다.

## 실제 서비스 확인

`https://easy-scraping.com`은 외부 확인 경로에서 530/fetch 실패 상태였다. Test endpoint도 독립적으로 정상 상태를 입증하지 못했다. 따라서 인증 Runtime Product Reality Audit는 **runtime verification unavailable**로 기록하고 정상 동작을 추측하지 않았다.

## 최신 근거

직접 채택:
- NIST SP 800-63B-4 최종본(2025-08-01)
- 최신 OWASP Password Storage / Authentication / Session Management
- OWASP Top 10:2025 A05 Injection 및 SQL Injection Prevention
- 개인정보보호위원회 최신 자료: 2026-09-11 개인정보 유출 사전예방·피해구제 강화 제도 시행

CAPTCHA/device risk는 보조 수단으로만 참고하며 권한/DB/개인정보 보안 경계로 신뢰하지 않는다.

## 결정

1. P0는 계정·개인정보 무결성이고 광고/신규 고위험 gameplay보다 우선한다.
2. 자체 로그인은 기존 인증/세션 체계의 `local_email` provider로 구현한다.
3. single-factor 비밀번호는 15자 이상, 64자 이상 지원, 임의 조합규칙/자동 잘라내기 금지.
4. Argon2id + 사용자별 salt + 버전/rehash를 사용한다.
5. SQL Injection은 release blocker이며 parameterized query와 negative/injection test를 필수화한다.
6. Production 개인정보는 기본적으로 Test/개발에 복사하지 않는다.
7. 계정복구, revoke-all, MFA/재인증, 삭제/내보내기, backup 삭제재적용까지 완료조건에 포함한다.
8. 보안 rate limit은 gameplay 하드캡이 아닌 보호목적 예외이며 false-positive를 측정한다.

## 문서

- `docs/planning/AUTHENTICATION_SECURITY_PRIORITY_SPEC.md`
- `docs/planning/AUTHENTICATION_SECURITY_PRIORITY_SPEC.ko.md`
- 대응 영문/한국어 changelog
- 대응 영문/한국어 worklog
- 문서 INDEX 항목

## 배포

문서-only 변경이다. 실제 구현은 별도 개발 브랜치 → 새 DB migration → auth/SQLi/BOLA/session/privacy negative tests → 격리 Test exact-SHA 검증 → Production 순서로만 진행한다.

## 다음 우선순위

1. 최소권한 DB schema/function + local credential repository
2. register/verify/login/recovery + Argon2id + generic error
3. session 보안센터/revoke-all + 일반사용자 TOTP
4. 공격 telemetry/rate policy + 로그 redaction test
5. Test 보안 QA와 실제 UI runtime audit 후 공개 활성화