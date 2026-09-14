# 작업기록 — 통합 Release Lineage & Runtime Audit — v2026.09.15.110

날짜: 2026-09-15 KST
범위: planning/docs only

## 수행 순서

1. Flux Kustomization 상태/revision, GitHub protected branch/status check·artifact attestation, OWASP API Security, Google Search canonical/noindex를 최신 공식자료로 조사하고 기존 복구·개인정보·구독 가이드를 교차검증했다.
2. 최신 application `main`, 영문/한국어 통합기획서, open issue/PR, CI/Test candidate 증거, 공개 Production runtime을 대조했다.
3. 기존 Production 계약 drift를 재현하고 PR #332의 현재 Test exact-SHA 불일치를 확인했다.
4. v110 release-lineage, QA, security, SEO, profitability 및 전체 기능 통합계약을 작성했다.
5. 통합 중 `main`을 재확인했다. 시작 application `main`은 `a0b4d656f7bad17ff9ee0acb976358df9466a750`였고 이후 `9aeab1f8...`, `453de0cd...` 이동은 이번 회차 영/한 문서 write 자체에 의한 것이며 외부 동시 commit은 관측되지 않았다.
6. `PROJECT_PLAN.md`, `PROJECT_PLAN.ko.md`와 영/한 changelog/worklog를 별도 문서 PR 없이 `main`에 직접 반영했다.

## Runtime / QA 증거

- 약 08:08 KST Production `/status`는 계속 `모든 서비스 정상`이라고 했지만 표시된 관측시각은 모두 04:06 KST였다. OPS-107-01은 P0이며 4시간 이상 false-green 지속이 확인됐다.
- Production `/guide`는 직업작업의 일일 제한 없는 전액 WLD/EXP 보상 문구와 Discord/Google-only·별도 Moneyverse 비밀번호 없음 설명을 유지했다. QA-104-01, AUTH-105-01은 OPEN이다.
- Production privacy는 OAuth 중심이며 코드/계약에 이미 존재하는 local credential 처리사실을 설명하지 않는다.
- backup issue #139는 OPEN이다. 승인 Remote Desktop 장비가 모두 offline이므로 현재 backup medium이나 cluster 상태를 추정하지 않았다.

## PR #332 / Test 증거

- candidate: `b3f28185107a2f6f4a8bd389016de778df08b747`.
- CI workflow: 성공 완료.
- Build Test Candidate workflow: 성공 완료, immutable Test image build/push 성공.
- Test infrastructure desired-state 변경은 merge된 것으로 기록됐으나 공개 Test `/api/version`은 candidate SHA 대신 `1789391457242`를 반환했다.
- 결과: `REL-110-01 / P0 / BLOCKED`. CI/image 성공은 applied/runtime 성공과 동일하지 않다. source→Flux→workload→public exact-SHA 증거가 일치하기 전 application-main merge와 Production promotion을 금지한다.
- 승인장비 offline으로 cluster root-cause inspection은 BLOCKED이며 추측 원인을 확정하지 않았다.

## Repository governance 증거

최신 `main` metadata는 branch protection enabled이지만 required status-check enforcement `off`, contexts/checks empty다. 따라서 `REL-104-03`은 단순 미확인이 아니라 `P1 OPEN/CONFIRMED`다. GitHub 공식 protected-branch 문서에 따라 runtime-code merge에는 선택된 required check와 필요한 경우 strict up-to-date 정책을 적용하도록 기획했다.

## 기획 변경

- `SOURCE_READY → CI_GREEN → IMAGE_BUILT → GITOPS_DECLARED → TEST_APPLIED → TEST_WORKLOAD_EXACT → TEST_PUBLIC_EXACT → TEST_QA_GREEN → MAIN_INTEGRATED → MAIN_EXACT_TEST_GREEN → PRODUCTION_READY → PROD_DEPLOYED → PROD_SMOKE_GREEN` 13단계 candidate state를 추가했다.
- Git SHA, image digest/provenance, GitOps revision, Flux applied revision, workload digest, public version, migration checksum, smoke/QA/security, 필요한 backup evidence, rollback target을 연결하는 minimum evidence field를 추가했다.
- QA-104-01은 candidate 부분 증거가 생겨 IN PROGRESS로 바꾸되 Test mismatch와 Production guide 오류 때문에 P0 미종료로 유지했다.
- 전체 기능 매트릭스를 보존하고 release lineage를 중심으로 security, SEO, backup, profitability, monitoring 연결을 강화했다.

## 외부 레퍼런스 적용

- Flux: applied/attempted revision 및 reconciliation 증거에 직접채택.
- GitHub required checks: runtime-code merge enforcement에 직접채택; 현재 repo 설정은 gap.
- GitHub artifact attestation: supply-chain evidence로 직접채택하되 deployment proof는 아님.
- OWASP API4/API5/API6: 전 기능 공통 보안기준으로 직접채택.
- Google canonical/noindex: SEO 구현규칙으로 직접채택.
- CISA/PostgreSQL/PIPC/FTC 기준은 backup/privacy/subscription guardrail로 유지.

## 구현 우선순위

P0는 데이터손실·릴리스 진실성부터 `BAK-106-01 → REL-110-01 → OPS-107-01 → AUTH-105-01 → QA-104-01 → REL-104-02` 순서다. 이후 P1 `AUTH-105-02 → REL-104-03`, BOLA matrix, SEO backend, 수익화/성장, 하위 UX 작업 순으로 진행한다. 실제 runtime 수정은 별도 branch→CI→exact-SHA Test→QA→main→Production 흐름을 따른다.
