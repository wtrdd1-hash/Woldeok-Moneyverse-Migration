# 작업내역 — v2026.09.15.105 인증 개인정보·로컬인증 정합성 감사

## 범위
문서-only 통합 기획 감사. 런타임 코드, API, DB, migration, Kubernetes/GitOps, branch protection, 보안 구현은 변경하지 않았다.

## 필수 순서와 증거

1. **외부 레퍼런스 선행 조사**
   - OWASP ASVS 5.0.0과 OWASP API Security Top 10 2023을 인증/세션/BOLA/자원소모 검증 기준으로 조사.
   - 개인정보보호위원회 2026 자료에서 실제 처리 목적·항목·보유기간·정보주체 권리 절차를 처리방침에 정확히 반영하는 원칙 확인.
   - Google Search Central 기술/indexing/canonical 가이드로 private/auth page와 noindex 정책 재검증.
   - FTC 2026 negative-option/구독 집행은 향후 실화폐 반복결제의 소비자보호 참고자료로만 사용.
2. **저장소/런타임 대조**
   - 시작 `main`: `1679fe33a8b276035c4a8fc0ab8e79d42cb2f07c`.
   - 작업 중간 재확인: 동일 SHA, 동시 main 변경 없음.
   - 운영 익명 `/login`은 Discord/Google 로그인만 노출.
   - 운영 `/guide`는 별도 비밀번호를 만들지 않는다고 설명하며, 기존 P0인 직업 무제한 전액보상 문구도 계속 존재.
   - 운영 개인정보처리방침은 OAuth 식별 처리를 설명하지만 자체 이메일/비밀번호 credential 및 이메일 인증 token 처리를 설명하지 않음.
   - 운영 공개 status는 최신 snapshot에서 web/economy API/ledger DB 정상이나 authenticated-flow QA 증거는 아님.
   - `main`에는 `LocalAuthController`, Argon2id 비밀번호 정책, `/app-api/v1/auth/local/register|verify-email|login`, local-auth migration, 모바일 API coverage가 존재.
3. **QA/CI 증거**
   - branch protection required-status-check enforcement는 계속 off/empty.
   - 시작 SHA legacy combined status entry는 없음.
   - 현재 문서 SHA의 Production Release workflow는 `test-gate`, `build`가 모두 skipped로 완료. 해당 workflow 조건은 성공한 `Build Test Candidate`의 main 실행 또는 수동 dispatch를 요구한다. 사용 가능한 증거만으로 upstream candidate가 조건을 충족하지 않은 정확한 원인을 단정하지 않으며 운영 승격 성공도 주장하지 않는다.
4. **계약 감사**
   - 현재 controller의 `POST /auth/local/verify-email`에는 `SessionGuard`/`CsrfGuard`가 없고 bearer verification token만으로 등록 완료가 가능해 migration 186/cross-browser 문서와 일치한다.
   - `docs/app-auth-api-guide.md`는 verify-email에 기존 prelogin cookie와 CSRF가 필요하다고 여전히 설명하므로 stale 상태다.

## 신규 이슈

### AUTH-105-01 — P0 — OPEN / public rollout HOLD
Local-email 구현·데이터 처리가 공개 개인정보/로그인/가이드 고지보다 앞서 있다. 일반 공개 전 rollout state, 최신 개인정보처리방침 버전/동의, 보유·삭제·복구 계약, exact-SHA 테스트, 보안·개인정보 QA를 릴리스 게이트로 추가했다.

### AUTH-105-02 — P1 — TODO
Canonical app-auth 연동문서를 현재 cross-browser single-use verification-token 계약에 맞춰 수정해야 한다. 모바일 schema/reference 문서도 일관성 검사를 추가해 새 클라이언트가 폐기된 cookie/CSRF 전제에 의존하지 않게 한다.

## 기존 차단항목

- `QA-104-01` P0 OPEN 유지.
- `REL-104-02` P0 OPEN 유지.
- `REL-104-03` P1 TODO 유지.

## 기획 결정

- Local auth 데이터 모델은 normalized email, email hash, Argon2id password verifier, display name, hashed one-time verification token, policy consent version, authenticated session state를 명시한다.
- Verification token은 단기 bearer secret으로 취급한다. token-bearing page는 token 소비 전 noindex, 광고/제3자 분석 미로딩, 강한 referrer policy, query-string 로그 금지, exchange 후 clean URL redirect를 사용한다.
- register/login/verify 경로에는 abuse budget과 429 동작을 요구한다. 숫자 threshold는 기획에서 임의로 만들지 않고 운영설정값을 구현·QA 전에 확정·기록한다.
- invalid credential/verification 오류는 계정/token enumeration을 줄이기 위해 generic public error를 유지한다.
- Local-email과 OAuth identity는 인증된 충돌안전 linking 규칙 없이 자동 병합하지 않는다.
- auth/verify/recovery URL은 sitemap/index에서 제외하고 privacy/terms는 공개 canonical 법적 콘텐츠로 유지한다.
- 사업가치는 activation/retention 및 provider 의존성 완화의 간접가치에서 SMTP/fraud/CS/security/privacy 운영비를 차감해 평가한다. 관측되지 않은 ARPU 상승값을 만들지 않는다.

## 추가 QA 수용조건

- prelogin/policy/consent/register/verify/viewer/session/login/logout 계약;
- 같은 브라우저/다른 브라우저 이메일 인증, 만료/재사용/잘못된 token, 링크 scanner/preview 상황;
- 중복 이메일/충돌안전, 잘못된 비밀번호와 존재하지 않는 계정의 동등한 공개오류, credential stuffing/rate limit;
- cookie rotation/logout invalidation, guarded mutation CSRF, verify-email의 의도된 bearer-token-only 경계;
- raw password/verifier/token/cookie/CSRF가 log/analytics/error telemetry에 없는지 검사;
- 등록 전 current policy version과 local-auth 개인정보 고지 표시;
- 탈퇴/credential 삭제/pending registration 정리 및 원장 보존;
- 모바일 API parity/구클라이언트 호환;
- public local-auth signup 활성화 전 exact-SHA isolated-test 증거.

## 통합 상태

v2026.09.15.105 영문/한국어 Living Plan, changelog, worklog를 준비했다. 최종 Git tree/ref 갱신 직전에 main을 다시 확인하며, ref 갱신은 non-force로 수행해 동시 변경이 있으면 덮어쓰지 않고 실패하도록 한다.
