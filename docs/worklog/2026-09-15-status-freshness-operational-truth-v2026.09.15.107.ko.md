# 2026-09-15 — 상태 freshness·운영 진실성 감사 v2026.09.15.107

## 범위·필수 수행순서

1. 외부조사 우선: Kubernetes health/readiness, Google Cloud Monitoring missing-data/metric-absence, OWASP API Security resource-abuse 자료를 새로 확인하고 기존 PostgreSQL/CISA 복구, Google/Naver SEO, 개인정보보호위원회, FTC subscription 근거를 재검토했다.
2. 최신 GitHub/main·런타임·QA 대조: 시작 `main` `2201b812716d78303388bb838258220a5033d694`, 영·한 통합기획, open issue, status frontend/backend/DB migration, release workflow와 fresh 운영 `/status`, `/guide`, `/privacy`를 확인했다.
3. 초상세 기획: `OPS-107-01` P0를 추가하고 frontend/backend/API/DB/collector/cache/security/monitoring/SEO/사업성/QA/release/rollback 계약을 구체화했다. 기존 전 기능 계약과 blocker를 유지했다.
4. 작업 중간 `main` 재확인: 문서 쓰기 직전까지 `2201b812716d78303388bb838258220a5033d694`로 동일했고 외부 동시 commit을 관찰하지 않았다.
5. 영문 canonical과 한국어 대응본을 v2026.09.15.107로 통합하고 영·한 changelog/worklog를 작성했다. 런타임 코드는 변경하지 않았다.

## 최신 외부 근거·판정

| 근거 | 확인 | 판정 | Moneyverse 적용 | 차이·주의 |
|---|---|---|---|---|
| Kubernetes Liveness/Readiness/Startup Probes | 2026-09-15 current official | 운영원칙 직접채택 | 서비스/모니터 준비 증거가 없으면 healthy로 표시하지 않고 health signal을 계속 평가 | public status가 Kubernetes readiness 그 자체라는 의미는 아니며 fail-honest 원칙만 채택 |
| Google Cloud Monitoring metric absence/missing data | 2026-09-15 current official | 관측원칙 직접채택 | monitoring data·collector heartbeat 부재를 별도 상태로 처리 | threshold 숫자는 Moneyverse 실측/config가 권위 |
| OWASP API Security Top 10 2023 API4 | current official | 보안 baseline 직접채택 | auth/provider/status monitor/external service·expensive query resource budget | OWASP가 Moneyverse 숫자 limit을 정하는 것은 아님 |
| PostgreSQL backup/PITR | current official, 기존채택 | 해당 시 직접채택 | BAK-106-01 manifest/checksum/WAL/full restore 요구 유지 | status 수정이 DR 차단을 완화하지 않음 |
| CISA StopRansomware | current official, 기존채택 | 복원력 지침 직접채택 | 독립 암호화 backup·정기 recovery test | 일반 resilience guidance |
| Google Search Central/Naver Search Advisor | current official | 직접채택 유지 | `/status` 공개 접근+noindex, canonical/sitemap/privacy-safe | 상태페이지는 acquisition inventory가 아님 |
| 한국 개인정보보호위원회 개인정보처리방침 자료 | current official | 고지설계 지침 직접채택 | 실제 local-auth 처리와 public policy 불일치 해소 전 AUTH-105-01 유지 | 구현·법 적용 세부는 별도 검토 |
| FTC 2026 subscription 집행·rulemaking | 2026 official | 참고+제품 guardrail | 반복결제 주요조건·명시동의·쉬운해지 | 미국규칙의 보편 적용 주장 금지, 이번 회차 결제구현 승인 없음 |

## GitHub·QA·런타임 증거

### 저장소·CI

- 시작/중간 `main`: `2201b812716d78303388bb838258220a5033d694`.
- 해당 SHA의 connected combined status는 개별 status가 없었고 workflow-run 조회도 비어 있었다. 따라서 `verification unavailable`이며 pass/fail을 추정하지 않았다.
- branch-protection 세부 endpoint는 integration access denied여서 v107에서도 required check가 이미 강제된다고 주장하지 않고 `REL-104-03`을 유지했다.
- `.github/workflows/deploy.yml`은 현재 GitHub Action을 immutable commit SHA로 pin하고 production image에 provenance/SBOM을 활성화한다. 그러나 `test-gate`가 직접 확인하는 범위는 test exact SHA, public shop catalog, root noindex이고 통합기획이 요구하는 migration/auth/economy/restore/rollback 전체증거는 아니다. `REL-104-02` P0 유지.
- relevant open issue: #139 backup SSD/read-only gate, #127 required CI checks, #126 Kubernetes deployment contract, #129 supply-chain hardening. issue 상태만으로 runtime 사실을 추정하지 않는다.

### Fresh Production runtime

2026-09-15 07:05 KST `/status`에서:

- overall `모든 서비스가 정상입니다.`
- web 04:06 KST 관측, 정상
- economy API 04:06 KST 관측, 정상
- ledger DB 04:06 KST 관측, 정상
- 페이지 설명은 `상태 수집 주기 30초`, `이보다 오래된 기록은 확인 중으로 표시`

약 3시간 stale 상태가 green으로 보이는 내부 불일치로 `OPS-107-01`을 등록했다.

Fresh `/guide`에는 여전히 `일일 횟수 제한 없이 반복하고 매번 전액 WLD·EXP 보상 획득`, 뒤의 unlimited full reward 반복설명, Discord/Google only 로그인과 `따로 비밀번호를 만들지 않아요`가 존재한다. 따라서 `QA-104-01`, `AUTH-105-01` OPEN.

Fresh `/privacy`는 운영 적용본 version 2026-09-02이며 OAuth login/provider identifier를 설명하지만 local email/password/verifier 처리는 설명하지 않는다. `AUTH-105-01` public rollout 차단 유지.

### Status 구현근거

- `frontend/src/app/status/page.tsx`: 30초 revalidate, `/api/v1/status`를 읽고 반환된 state를 신뢰하며 30초 설명을 hard-code.
- `frontend/src/lib/status.ts`: invalid/unrecognized state만 `unknown`, age 계산 없음.
- migration `013-content-and-status.sql`: `content_status_sources.stale_after_seconds`, 초기 예시 180초, trusted snapshot writer, stale row를 `unknown`/null detail/null observed_at으로 바꾸는 `content_public_status()`.
- backend content service는 DB 반환상태 일관성을 검증하지만 freshness를 별도 재계산하지 않고 repository는 DB function을 사용한다.

결론: 운영결과는 저장소가 의도한 stale 계약과 불일치한다. 저장소만으로 Production root cause를 확정할 수 없다.

## OPS-107-01 QA → 개발 상세 handoff

**Severity/Priority:** HIGH 운영진실성 위험 / status 의존 승격 기준에서는 P0.

**최초·최근재현:** 2026-09-15 07:05 KST.

**영향:** `/status` 이용자 전체, 지원/운영자, status를 향후 release/incident evidence로 사용할 자동화.

**원인상태:** UNKNOWN. mutation 전에 read-only evidence 수집.

**Frontend:** 충돌하는 hard-coded freshness를 제거하고 server-derived freshness를 렌더. stale/missing/API error에서 fail-closed, required source unknown이면 overall healthy 금지. 모바일/desktop/time label/accessibility 포함.

**Backend/API:** public-safe freshness 계약(`freshness`, 또는 `ageSeconds`/`staleAfterSeconds`)을 server authority로 정의. error/cache가 expired green을 제공하지 않아야 함.

**DB:** Production function/config/checksum을 read-only 검사. 수정 필요 시 013을 편집하지 않고 새 migration/config 사용. DB clock, source config, latest snapshot, writer privilege 검증.

**Collector/infra:** last-attempt/last-success heartbeat를 안전한 metric으로 제공, missed collection alert, collector failure와 target outage 구분, public response에 topology/secret 금지.

**Migration 필요여부:** Production parity 조사 전 미확정. 적용된 migration은 변경 금지.

**Rollback:** last-known-good immutable app/config. DB 변경은 forward corrective migration. freshness 증거가 없으면 rollback 중에도 unknown을 유지하고 false-green 금지.

**필수 테스트:** unit state ordering/freshness, DB threshold -1/0/+1초, source-specific threshold, no snapshot, future timestamp, collector stop, cache expiry, API/DB outage, restart, mixed states, forged writer/app-role denial, public detail leak, frontend SSR/a11y, isolated exact-SHA E2E.

**테스트서버 수용:** candidate exact SHA, fresh synthetic source 확인 → collector stop → 승인 threshold 내 API/UI unknown/확인 중 + alert → trusted fresh snapshot 후에만 healthy. noindex/ads-off 유지.

**운영승격:** CI/release evidence, migration parity, observable collector heartbeat, 승인된 synthetic/non-destructive freshness smoke, 관찰기간 stale-green 0.

**모니터링:** source age, collector last-success age, unknown source count, status API error, stale-operational violation. false-green 발생 시 operator alert + status-dependent release success 무효화.

**상태:** TODO/OPEN. **작업순서:** read-only runtime/DB/collector 진단 → backend/DB contract → frontend copy/render → tests → exact-SHA test → release evidence → Production smoke.

## SEO·보안·사업·성장 영향

- SEO: `/status`는 public-noindex+sitemap 제외. thin incident/status SEO page를 만들지 않는다. 다른 공개콘텐츠는 기존 canonical/structured-data/privacy 계약 유지.
- 보안: status writer는 browser가 아닌 trusted path. app role이 health를 선언하지 못하게 하며 public status/alert에 topology, DB name, internal endpoint, credential, private user/economy state를 넣지 않는다.
- 악용: forged healthy snapshot, timestamp replay, stale cache를 security/operational abuse case로 테스트한다.
- 사업: 직접매출 0. 회피된 downtime·지원비·신뢰손실로 평가한다. false-green은 음의 가치다.
- 성장/UX: 공개 운영약속의 명백한 불일치는 신뢰·복귀를 해치므로 OPS-107-01 해결 전 acquisition에서 현재 health를 홍보근거로 사용하지 않는다.

## v107 이후 우선순위

1. `BAK-106-01` P0 — 독립 restore proof.
2. `OPS-107-01` P0 — stale/false-green 운영상태.
3. `AUTH-105-01` P0 — local-auth privacy/public contract.
4. `QA-104-01` P0 — 직업 quota public/server parity.
5. `REL-104-02` P0 — complete machine-readable release evidence.
6. `AUTH-105-02` P1 — app-auth 문서 parity.
7. `REL-104-03` P1 — runtime-code required check evidence/ruleset.
8. BOLA/auth matrix, backup drill automation, SEO backend 이후 payment/monetization/growth를 P0 gate에 따라 진행.

이번 기획 회차에서는 runtime code, DB schema/data, status collector, infrastructure, backup device, secret, branch rule을 수정하지 않았다.
