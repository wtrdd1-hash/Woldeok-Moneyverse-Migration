# v2026.09.15.107 — 상태 freshness·fail-closed 운영 진실성

## 레퍼런스 판정

- Kubernetes 최신 liveness/readiness/startup probe — **운영원칙 직접채택**: 준비상태는 계속 평가하며 준비되지 않았거나 증거가 없는 상태를 healthy로 표현하지 않는다. https://kubernetes.io/docs/concepts/workloads/pods/probes/
- Google Cloud Monitoring missing data / metric absence — **관측원칙 직접채택**: fresh telemetry 부재는 별도 상태이며 자동 정상으로 취급하지 않는다. https://docs.cloud.google.com/monitoring/alerts/policies-in-json
- OWASP API Security Top 10 / API4 — **보안 baseline 직접채택**: resource abuse·외부서비스 비용/제한에 적용한다. https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/
- PostgreSQL backup/PITR·CISA backup guidance — `BAK-106-01`에 대한 기존 직접채택을 유지한다.
- Google Search Central/Naver Search Advisor — 기존 직접채택 유지. transient `/status`는 공개 접근하되 noindex다.
- FTC 2026 subscription 집행·검토 — 향후 반복결제 제품 guardrail로 유지하며 이번 회차에서 신규 결제 구현을 승인하지 않았다.

## 신규 P0 — OPS-107-01

2026-09-15 07:05 KST 운영 `/status`는 `모든 서비스가 정상입니다.`라고 표시했지만 웹 서비스·경제 API·경제 원장 DB의 관측시각은 모두 04:06 KST였다. 같은 페이지는 수집 주기 30초와 오래된 기록의 `확인 중` 표시를 명시한다.

저장소 대조 결과 더 강한 계약 불일치가 확인됐다. migration `013-content-and-status.sql`은 source별 `stale_after_seconds`와 `content_public_status()` stale→`unknown` 판정을 갖지만 frontend는 API state를 그대로 신뢰하고 30초 설명을 hard-code한다. 따라서 현재 런타임은 저장소 freshness 계약을 위반한다. 원인은 추측하지 않고 Production DB 함수/설정, migration parity, 배포 SHA, raw API/cache, collector heartbeat를 read-only로 검증한다.

## 필수 개발/QA backlog

1. 운영·테스트 `/api/v1/status`, backend/frontend exact SHA/digest, DB clock, latest source snapshot, source freshness config를 수집한다.
2. Production `pg_get_functiondef(content_public_status)`·migration checksum을 `main`과 대조한다.
3. collector last-attempt/last-success/schedule/log를 확인하고 collector 장애와 대상서비스 장애를 분리한다.
4. source별 server-side freshness를 단일 권위로 한다. 수집주기와 stale threshold는 별도이며 UI가 충돌하는 숫자를 hard-code하지 않는다.
5. stale/missing source는 `unknown/확인 중`; 필수 source가 unknown이면 overall은 operational이 될 수 없다. collector 부재는 `모니터링 지연/확인 중`이지 fabricated outage나 healthy가 아니다.
6. healthy cache나 stale-if-error가 승인 stale threshold를 넘겨 green을 유지하지 못하게 한다.
7. DB threshold `-1/0/+1초`, source-specific threshold, no snapshot, future timestamp, stopped collector, API/DB/cache outage, restart, mixed state, forged writer denial, exact-SHA E2E를 추가한다.
8. synthetic collection 중단 시 threshold 안에 public API/UI가 unknown으로 바뀌고 alert가 발생하며 fresh trusted snapshot 이후에만 정상으로 돌아와야 운영승격 가능하다.

적용된 migration은 수정하지 않는다. DB function/config 교정이 필요하면 새 migration 또는 검토된 config 변경과 정상 release evidence를 사용한다.

## 유지 blocker

- `BAK-106-01` P0: issue #139 OPEN, current independent restore proof 부재.
- `AUTH-105-01` P0: fresh privacy/guide는 OAuth 중심인데 local-auth code 존재.
- `QA-104-01` P0: fresh guide가 여전히 직업작업 unlimited full reward를 설명.
- `REL-104-02` P0: 현재 production-ready는 exact SHA/catalog/noindex보다 넓은 migration/auth/economy/restore/rollback 증거를 직접 강제하지 않음.
- `AUTH-105-02`, `REL-104-03` P1 유지.

## SEO·보안·사업성

- `/status`는 `PUBLIC_NOINDEX`, sitemap 제외, public-safe로 정의한다. transient operational truth를 acquisition 콘텐츠로 사용하지 않는다.
- 신규 HIGH 위협: stale/forged operational health. trusted writer, server freshness, collector heartbeat, cache expiry, deployment/migration parity를 필수통제로 둔다. false-green이면 status 의존 릴리스를 차단한다.
- 상태기능 직접매출은 0이다. 사업가치는 MTTR·지원비·신뢰손실 절감이며 `stale_operational_violation_count` 목표는 0이다.

## 통합

영문·한국어 `PROJECT_PLAN`을 v2026.09.15.107로 동기화했다. 이번 변경은 문서/기획 only이며 runtime code, DB, collector, infrastructure, secret, branch rule, backup medium을 수정하지 않았다.
