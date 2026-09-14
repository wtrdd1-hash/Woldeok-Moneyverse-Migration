# 변경 기록 — 통합 릴리스 거버넌스·기능 근거 감사

> 버전: v2026.09.15.104
> 날짜: 2026-09-15
> 범위: 문서/기획 only

## 조사 및 근거

기획 전에 Google Search Central의 최신 canonical/crawling/sitemap 공식 가이드, Naver Search Advisor의 최신 SEO/index/sitemap 가이드, OWASP ASVS 5.0.0 및 OWASP API Security BOLA/인증 가이드, FTC의 2026 구독/negative-option 관련 집행·정책 신호를 조사했다.

그 다음 시작 `main` SHA `3bfa41ce6c251b707254c09f7c3504d1e5245d28`, 운영 public home/guide/status, CI/test-candidate/auto-integrate/deploy workflow, branch protection metadata, commit status 가시성, 인증/app API coverage 문서를 대조했다.

## 결정

- 운영 `/guide`에서 직업작업 무제한 전액보상 문구를 다시 재현하여 daily-quota 공개문구 drift를 **P0 OPEN**으로 유지했다.
- **P0 REL-104-02** 추가: 현재 isolated-test 운영 게이트는 exact SHA, public catalog, root noindex를 검증하지만 test DB migration parity/checksum, authenticated 핵심흐름, rollback 준비 등 규범상 전체 승격증거를 직접 강제하지 않는다.
- **P1 REL-104-03** 추가: `main`은 protected이나 required status check가 repository 수준에서 강제되지 않는다. runtime-code는 ruleset/branch policy로 막고 docs-only 자동화는 좁은 예외만 허용한다.
- 인증, 인벤토리, 상점, 실결제, 작업, 사업, 은행, 주식, 카지노, 커뮤니티, referral, 알림, 검색, 업로드, 공개콘텐츠, 앱 API, 관리자, 백업, 분석, 광고, SEO, 장애운영을 근거 제한 상태로 등록했다. 증거 부족은 완료로 추정하지 않고 `UNVERIFIED`로 기록했다.
- public route별 SEO/index 계약과 SEO backend 구체 컴포넌트를 추가했다.
- BOLA, 인증/세션, 경제 replay/concurrency, release governance, 공급망, upload/UGC, admin, analytics/privacy leakage를 다루는 v104 위협 등록부를 추가했다.
- WLD 경제 sink와 실제 인식매출을 분리하고 보안/QA/SEO/광고를 retained contribution과 회피비용으로 평가하는 사업성 모델을 추가했다.

## QA → 개발 backlog

1. P0 QA-104-01: 직업 quota 안내 동기화 후 exact-SHA isolated 실DB/authenticated quota E2E.
2. P0 REL-104-02: `production-ready` 전에 fail-closed machine-readable release evidence 추가.
3. P1 REL-104-03: runtime-code required check를 branch/ruleset으로 강제.
4. P1: object-ID inventory+BOLA negative test, auth fixation/rotation/logout/reauth, workflow action pinning 정책.
5. P1: SEO read model/canonical/sitemap/redirect/structured-data/GSC-Naver 관측과 privacy scan.
6. P1: 파괴적 DB 변경 전 restore proof/RPO/RTO/migration parity/ledger reconciliation.
7. P1/P2: 실결제는 미검증 상태이며 provider/legal/unit economics/receipt-webhook 계약 전 구현 시작 금지.

## 런타임/CI 상태

운영 public home, guide, status는 접근 가능했다. status는 최신 snapshot 기준 web/economy API/ledger DB 정상으로 표시했으나 authenticated E2E 증거는 아니다. 시작 SHA의 legacy combined status는 status entry 0개였고 조회 가능한 PR-triggered workflow run도 없었으므로 CI 성공을 주장하지 않는다. Runtime verification은 부분 가능이다.

## 파일

- `docs/planning/PROJECT_PLAN.md`
- `docs/planning/PROJECT_PLAN.ko.md`
- 본 변경기록 및 영문 대응본
- 영/한 worklog

런타임 코드/API/DB/migration/인프라/branch protection 설정/보안 구현은 변경하지 않았다.