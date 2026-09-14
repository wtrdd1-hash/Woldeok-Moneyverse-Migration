# 작업 기록 — 통합 릴리스 거버넌스·기능 근거 감사

> 버전: v2026.09.15.104
> 날짜: 2026-09-15
> 런타임 변경: 없음

## 작업 순서

1. 기획 전에 Google Search Central, Naver Search Advisor, OWASP ASVS/API Security, FTC 소비자보호 최신 공식 레퍼런스를 조사했다.
2. 최신 `main`, `PROJECT_PLAN.md`, `PROJECT_PLAN.ko.md`, workflow 설정과 구현 근거를 읽었다.
3. 운영 public home, `/guide`, `/status`를 사용자·운영 관점에서 감사했다.
4. 운영 `/guide`의 직업작업 무제한 전액보상 문구를 다시 재현했다.
5. 규범적 운영승격 요구와 실제 CI/candidate/Production workflow를 비교했다.
6. 현재 Production gate가 exact test SHA, non-empty public shop catalog, root noindex를 직접 증명하지만 isolated test DB migration parity/checksum, authenticated 핵심흐름 QA, rollback 준비 등 문서상 전체 증거를 직접 강제하지 않는 공백을 발견했다.
7. `main` branch protection의 required-status-check enforcement가 현재 off/empty임을 확인해 Production gate와 별도 이슈로 기록했다.
8. 문서 쓰기 직전 `main`을 중간 재확인했고 `3bfa41ce6c251b707254c09f7c3504d1e5245d28`로 동일했다.
9. 영문 canonical과 한국어 Living Plan에 v104 상세 계약을 반영했다.
10. 영/한 changelog와 영/한 worklog를 추가했다. 런타임 branch/API/DB/migration/인프라는 수정하지 않았다.

## main 근거

- 시작/중간 SHA: `3bfa41ce6c251b707254c09f7c3504d1e5245d28`.
- CI는 secret/control-byte, clean lint/typecheck/build, PostgreSQL migration/application test, high-severity production dependency audit를 포함한다.
- Test Candidate는 CI를 호출하고 SBOM/provenance가 있는 immutable `${SHA}-test` image를 발행하며 test frontend의 indexing/ads를 끈다.
- Production Release는 exact test SHA를 기다리고 public catalog와 root noindex를 검증한 뒤 `production-ready`를 발행한다.
- 이번 회차에서 관측한 branch metadata 기준 main은 protected지만 required status check가 강제되지 않는다.
- 시작 SHA legacy combined status는 `pending`이지만 individual status 0개였고 조회 가능한 PR-triggered workflow run도 없었다. CI 실패로 단정하지 않고 verification unavailable로 기록했다.

## 런타임 근거

- 운영 public home, guide, status 접근 가능.
- public status는 최신 snapshot 기준 web/economy API/ledger DB 정상으로 표시.
- `/guide`는 직업 작업이 일일 제한 없이 반복 가능하고 매번 전액 WLD/EXP를 준다고 계속 설명해 authoritative daily-limit 구현 문서와 충돌.
- 인증된 경제/사용자 흐름을 이번 문서 회차에서 독립 실행하지 않아 runtime verification은 부분 가능.

## 외부 근거 적용

- Google Search Central: canonical, crawlable content, sitemap/lastModified, duplicate URL 정책 직접채택.
- Naver Search Advisor: 사용자에게 도움되는 SEO, 고유 title/description, crawlable resource, sitemap/feed/index 관측 직접채택.
- OWASP ASVS 5.0.0: 기술통제 검증 baseline으로 직접채택.
- OWASP API1:2023 BOLA/현행 인증 guidance: 서버 object authorization, negative test, session/auth test에 직접채택.
- FTC 2026 구독/negative-option 집행·정책: 향후 실제 반복결제의 소비자보호 참고선과 제품 guardrail로 사용하며 모든 Moneyverse 흐름에 자동 적용되는 법으로 단정하지 않음.

## 기획 변경

### P0

- `QA-104-01`: 직업 quota 공개문구/런타임 계약 drift OPEN 유지.
- `REL-104-02`: release automation evidence gap. `production-ready` 전 isolated-test migration/auth/economy/rollback 증거를 fail-closed로 추가하도록 기획.

### P1

- `REL-104-03`: runtime code에 required status check/ruleset을 강제하고 docs-only는 좁은 예외로 유지.
- object-ID inventory + BOLA negative test.
- auth/session fixation/rotation/logout/reauth 검증.
- SEO public read-model/backend+privacy scan.
- backup restore proof와 migration/ledger recovery evidence.

## 수익성 결정

- WLD-only spend는 게임경제 sink이며 실제 인식매출이 아니다.
- 광고는 retention/session/support/privacy 비용을 차감한 net contribution으로 평가한다.
- SEO는 impression이 아니라 incremental organic D30 retained user와 downstream value로 평가한다.
- 보안/QA/release 개선은 사고·fraud·refund·downtime·support 회피비용으로 평가한다.
- 실결제/구독은 provider, receipt/webhook, tax/refund, legal, unit economics 계약이 선택·검증되기 전 `UNVERIFIED` 상태다.

## 롤백/배포

현재 문서 정책에 따라 문서-only 변경만 `main`에 직접 커밋했다. 런타임 운영승격은 요청하거나 수행하지 않았다. 이 기획 변경의 롤백은 Git 이력을 사용한다.