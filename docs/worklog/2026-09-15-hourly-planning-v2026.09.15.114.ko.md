# v2026.09.15.114 — 시간별 통합 기획 증거

## 기준선 및 작업 중 main 재확인
- 시작/중간 최신 main: `d3acd3490dd6d6401539fac6442d4a4f49cab144` (PR #332 병합: Work 권위 quota 가시화).
- 통합기획서는 아직 `v2026.09.15.110`이며 PR #332를 open/미병합으로 기술한다. 따라서 해당 상태는 현재 릴리스 진실로 사용하면 안 된다.
- merge commit에 대해 combined status가 반환되지 않았다. 이는 CI PASS가 아니라 `verification unavailable`이다.
- 복구/릴리스 관련 open issue #139(독립백업), #127(required checks), #126(구 deploy workflow 불일치), #129(supply-chain hardening)는 계속 유효하다.

## 최신 외부 레퍼런스
1. OWASP Top 10:2025: A01 접근제어, A03 공급망, A07 인증, A09 로깅/알림, A10 예외처리를 직접채택 기준으로 유지한다. session rotate/revoke, 민감 관리자 MFA, brute-force/credential-stuffing 방어, aud/iss/scope 검증, 예외시 fail-closed를 릴리스 게이트로 둔다.
2. 2026-09-15 현재 Google Play 서비스 수수료 공식자료를 수익성 참고자료로 사용한다. 향후 Android 실결제는 시장/신규·기존 설치/반복·비반복/프로그램/결제경로에 따라 수수료 가정이 달라질 수 있으므로 15% 또는 30%를 단일 상수로 고정하지 않는다.

## 기획 delta
### QA-104-01 Work quota
상태를 `IN PROGRESS / PR open`에서 `MAIN_INTEGRATED / Production unverified`로 전환한다. main UI는 서버 권위 `taken_today / daily_limit`를 표시한다. 그러나 exact-main-SHA Test, API/DB quota, concurrency/idempotency, 서울 일자 경계, guide/mobile 문구, 접근성, Production smoke 전에는 종료하지 않는다. Production의 무제한 full reward 안내가 남아 있으면 content/release blocker다.

### REL-110-01 candidate lineage
기존 후보 전용 장애를 영구 릴리스 불변조건으로 일반화한다. merge 자체는 Test/Production exact-SHA 증거가 아니다. `source SHA → CI → immutable image digest/provenance → GitOps desired revision → Flux applied revision → Deployment/Pod digest → Service/Ingress → public /api/version → exact-runtime QA`가 모두 연결돼야 한다. 불일치는 P0 fail-closed다. PR #335 routing fix가 존재하지만 이번 회차에 현재 public exact-SHA 증거는 없으므로 성공으로 기록하지 않는다.

### REL-104-03 required checks
P1 유지. 현재 main merge commit에 combined status가 없고 #127은 required checks 미강제를 기록하므로 merge 가능성을 검증 완료로 취급하지 않는다. runtime path는 expected GitHub App/source의 canonical CI check, strict/up-to-date semantics, force-push/delete 차단, 감사 가능한 emergency bypass가 완료조건이다. docs-only 자동화 예외가 runtime/deploy/security 우회로가 되어서는 안 된다.

### BAK-106-01 복구 사업성
P0 유지. 최신 독립 암호화 백업을 격리환경에 restore하고 ledger/balance/entitlement 대사를 통과하기 전 schema/data-changing Production 승격을 차단한다. KPI는 `backup_age`, `restore_last_success`, RPO/RTO, restore duration, reconciliation failure, backup alert delivery다. 직접매출이 아니라 기대 데이터손실·다운타임·환불·CS·fraud 손실 회피로 평가한다.

### 수익화/unit economics
향후 Android 실결제는 수수료율을 상수가 아니라 시장, 설치 cohort, 반복여부, 프로그램 자격, billing route, 세금, 환불의 입력변수로 둔다. SKU/구독별로 gross revenue → platform/billing fee → tax/refund allowance → infra/support/fraud direct cost → contribution margin을 계산한다. conversion/ARPPU/churn 미실측값은 `가설/테스트 기준`이다. contribution margin이 양수이면서 D7/D30, refund/fraud/support, 공정성 guardrail을 악화시키지 않을 때만 scale한다.

## SEO/backend delta
공개 페이지 indexability를 로그인 상태만으로 결정하지 않는다. 공개 read-model은 서버 렌더링 가능하고 안정적이어야 하며 account/auth/admin/transaction은 강제 noindex+sitemap 제외다. canonical/sitemap/lastModified는 서버 소유 metadata와 영구 redirect history에서 생성한다. exact deployed SHA QA에 HTTP 상태, canonical, robots, sitemap membership, structured data를 묶고 개인정보/공개범위 변경 뒤 stale cache가 모순된 index 상태를 유지하지 못하게 한다.

## 보안 delta
인증/session 릴리스 테스트에 로그인 session-ID rotation, logout/revoke, idle+absolute expiry, unknown-user/wrong-password 동일 오류, credential-stuffing throttling과 lockout DoS 방지, 민감 admin MFA/reauth, JWT/OIDC `iss`/`aud`/scope 검증, secret-safe auth log를 명시한다. 변경된 경로의 negative test가 없으면 Production 승격을 차단한다.

## 통합 상태
영문/한국어 통합기획서를 작업 전 읽었고 중간에 main을 재확인했다. 현재 통합기획서의 버전/상태는 최신 main보다 뒤처져 있다. GitHub connector가 대형 파일을 잘린 단일 payload로 반환하여 전체 교체 시 문서 손상 위험이 있으므로 이번 회차는 이 delta를 완전하게 기록하고 PROJECT_PLAN 직접 통합을 `BLOCKED_BY_SAFE_WRITE_CAPABILITY`로 표시한다. 동기화 완료라고 허위 기록하지 않는다. 다음 안전한 writer는 최신 main을 다시 읽은 뒤 이 delta를 두 통합본에 원자적으로 병합하고 버전을 올려야 한다.
