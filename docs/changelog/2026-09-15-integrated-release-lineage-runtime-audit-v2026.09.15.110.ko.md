# 변경이력 — v2026.09.15.110

날짜: 2026-09-15 KST
범위: planning/docs only
한국어 통합본: `docs/planning/PROJECT_PLAN.ko.md`

## 조사자료

- Flux Kustomization 최신 상태/reconciliation 문서: 실제 applied revision과 rollout 증거 기준으로 채택.
- GitHub protected branch / required status check 문서: merge gate 설계에 채택.
- GitHub artifact attestation: build provenance 증거로 채택하되 runtime 배포 증거로는 사용하지 않음.
- OWASP API Security Top 10 API4/API5/API6: resource, authorization, sensitive-business-flow 보안 기준 유지.
- Google Search Central canonical/noindex: 공개/비공개 SEO route와 backend 계약에 유지.
- CISA/PostgreSQL 복구, 한국 PIPC 개인정보, FTC 2026 구독/negative-option 자료: 복원력·개인정보·수익화 guardrail 유지.

## QA → 개발 변경

- `REL-110-01 / P0 / BLOCKED` 신규: PR #332 candidate `b3f28185107a2f6f4a8bd389016de778df08b747`는 CI와 Test image build를 통과했으나 공개 Test `/api/version`이 `1789391457242`를 반환했다. exact-SHA Test 배포 실패로 application main/Production 승격을 차단한다.
- `REL-104-03`을 미확인/TODO에서 `P1 OPEN/CONFIRMED`로 변경: 최신 `main` metadata에서 required-status-check enforcement `off`, required contexts/checks 없음 확인.
- `QA-104-01`을 `P0 IN PROGRESS, 미종료`로 갱신: Work quota UI 후보는 CI/image build가 성공했으나 staging exact-SHA 증거 실패 및 Production `/guide`의 무제한 보상 문구가 남아 있다.
- `OPS-107-01` 재현: 약 08:08 KST에도 Production `/status`가 04:06 KST snapshot을 정상으로 표시해 false-green이 4시간 이상 지속됐다.
- `BAK-106-01`, `AUTH-105-01`, `REL-104-02`, `AUTH-105-02`의 기존 fail-closed gate 유지.

## 신규 통합계약

- `SOURCE_READY`부터 `PROD_SMOKE_GREEN`까지 13단계 candidate evidence state machine 추가.
- build 성공, desired-state merge, Flux applied revision, workload digest, public version, feature QA를 서로 다른 증거단계로 명시.
- candidate/base SHA, CI run ID, image digest, provenance, Test GitOps/Flux/workload/public-version, migration checksum, smoke/QA/security, 필요 backup evidence, rollback target, freshness를 포함하는 machine-readable evidence object 정의.
- Flux reconcile/applied-attempted revision, workload digest/replica, public exact-SHA probe를 monitoring에 추가.

## 기능/SEO/보안/수익성

- 인증부터 릴리스 파이프라인까지 전체 기능군 매트릭스를 v110에 재동기화.
- `/status`는 public-noindex, `/guide`는 권위 문구 교정 전 acquisition HOLD, private/account/economy/admin/recovery는 noindex+sitemap 제외 유지.
- candidate lineage mismatch를 HIGH 위협으로 추가하고 BOLA, replay/concurrency, resource/business-flow abuse, backup/restore, admin, private-data leakage gate 유지.
- WLD는 실매출로 계산하지 않으며 release convergence 비용 KPI(candidate lead time, failed promotion, rerun compute/operator time, escaped-defect avoidance)를 추가.

## 반영

- 영문/한국어 통합 기획서를 v2026.09.15.110으로 동기화.
- 이 기획 회차에서는 runtime code, API, DB schema/data, migration, infrastructure, backup media, secret, collector, branch rule을 변경하지 않았다.
