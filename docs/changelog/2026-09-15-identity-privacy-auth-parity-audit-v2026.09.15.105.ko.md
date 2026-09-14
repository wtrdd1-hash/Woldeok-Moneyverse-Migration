# v2026.09.15.105 — 인증 개인정보·로컬인증 정합성 감사

> 날짜: 2026-09-15
> 범위: 문서/통합기획만 변경. 런타임/API/DB/인프라/보안코드는 변경하지 않음.

## 외부 레퍼런스 적용판정

- OWASP ASVS 5.0.0(2025-05-30): 인증·세션 기술통제 검증 기준으로 **직접채택**.
- OWASP API Security Top 10 2023: Broken Authentication, BOLA, 자원소모, 민감 비즈니스 흐름 악용 테스트에 **직접채택**.
- 개인정보보호위원회 2026 개인정보 처리방침 관련 안내/표준안: 실제 서비스와 처리 목적·항목·보유기간·정보주체 권리 절차를 맞추는 기준으로 **직접채택**.
- Google Search Central 기술/indexing 가이드: 인증/검증 URL을 로그인·noindex로 검색에서 제외하고 robots.txt를 기밀성 통제로 사용하지 않는 원칙을 **직접채택**.
- FTC 2026 구독 집행/검토: 향후 실화폐 반복결제에만 **참고**. 현재 WLD 경제에서 실결제를 추정하지 않음.

## 발견사항과 결정

- **P0 AUTH-105-01** 추가: `main`에는 자체 이메일/비밀번호 가입, 이메일 인증, Argon2id credential, 모바일 App API 계약이 존재하지만 운영 `/login`, `/guide`, 현재 공개 개인정보처리방침은 소비자 로그인 모델을 Discord/Google OAuth 중심으로 설명하고 있다. 개인정보 처리항목·동의버전·보유/삭제/복구·채널 UX·QA 증거가 동기화되기 전 public local-auth 확대를 차단한다. 운영 mutation endpoint는 파괴적 테스트하지 않았으므로 실제 운영 노출 여부를 추정하지 않고 `runtime unverified`로 기록한다.
- **P1 AUTH-105-02** 추가: `docs/app-auth-api-guide.md`는 아직 `verify-email`에 원래 prelogin cookie와 CSRF가 필요하다고 설명하지만, 최신 controller/migration 계약은 single-use cross-browser bearer token으로 cookie/CSRF 없이 인증 완료하도록 의도적으로 변경됐다. 다음 모바일 릴리스 전에 canonical 인증문서를 동기화한다.
- **P0 QA-104-01** OPEN 유지: 운영 `/guide`가 서버 권위 작업별 일일 quota와 달리 무제한 전액 직업보상을 계속 설명한다.
- **P0 REL-104-02** OPEN, **P1 REL-104-03** TODO 유지. 현재 SHA의 legacy combined status entry는 비어 있고 이 문서 SHA의 Production Release workflow는 `skipped` 완료되어 운영 승격 성공을 주장하지 않는다.

## 통합기획 변경

- 로컬 인증 endpoint, 개인정보/데이터 생애주기, verification-token URL 처리, credential stuffing/account enumeration 방어, SEO/noindex, 분석/KPI, 비용효율, QA, rollout/rollback 게이트를 구체화했다.
- 이메일 인증 token URL은 token 소비 전 광고/제3자 분석을 로드하지 않고, noindex 검증화면·강한 Referrer-Policy·즉시 token exchange·clean URL redirect를 사용하도록 기획했다.
- 새로운 인증 개인정보 항목은 공개 개인정보처리방침 버전과 동의 흐름이 실제 처리를 설명하기 전 일반 사용자에게 확대하지 않는 릴리스 규칙을 추가했다.

## 저장소 반영

- `docs/planning/PROJECT_PLAN.md`, `PROJECT_PLAN.ko.md`를 같은 버전으로 갱신.
- 영문/한국어 changelog와 worklog 추가.
- 런타임 코드, DB migration, API 구현, 인프라, branch protection, 보안 구현은 이번 기획 회차에서 변경하지 않음.
