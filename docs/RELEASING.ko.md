# 릴리스 가이드

[English canonical](RELEASING.md) | **한국어**

> 버전: v2026.09.23.404
> 현재 런타임 기준: [CURRENT_RUNTIME_BASELINE.ko.md](CURRENT_RUNTIME_BASELINE.ko.md)

## 런타임 계약

| 환경 | 공개 주소 | 현재 런타임 | Backend / frontend |
|---|---|---|---|
| Production | `https://easy-scraping.com` | Debian 13 host systemd + Nginx | 3000 / 3001 |
| Isolated Test | `https://test.easy-scraping.com` | Debian 13 host systemd + Nginx | 3100 / 3101 |

현재 Production 데이터 권위는 Debian 호스트의 PostgreSQL이다. 관측된 Production PostgreSQL runtime은 Docker PostgreSQL 17.11이다.

Kubernetes/Flux는 복구/목표 아키텍처이며 현재 공개 runtime 증거가 아니다. Docker Compose도 현재 Production 배포 제어면이 아니다.

## 1. 개발 브랜치 게이트

런타임 변경은 전용 브랜치를 사용하고 통합 전 해당 exact-HEAD 검증을 통과해야 한다. Candidate evidence는 실제 시험한 exact source SHA에 결합한다.

필요한 검증에는 상황에 따라 다음을 포함한다.
- lint/typecheck/build;
- unit/integration test;
- PostgreSQL migration과 real-DB test;
- API contract/schema check;
- authorization/security negative;
- 경제 mutation의 idempotency/concurrency;
- committed-secret와 supply-chain 검사.

필수 DB/security/contract test가 skip된 상태는 PASS가 아니다.

문서 전용 브랜치는 application candidate가 아니며 repository `main`이 전진했다는 이유만으로 runtime release를 시작하면 안 된다.

## 2. Isolated Test 검증

승인 candidate는 Test release 디렉터리에 materialize하고 다음 서비스로 실행한다.
- `test-main-backend.service`
- `test-main-frontend.service`

Production 승격 전 다음을 검증한다.
1. 공개 Test가 의도한 application version을 보고;
2. backend readiness 성공;
3. 대표 API와 권위 Test DB 경로 성공;
4. 변경 user flow 통과;
5. 관련 authz/security negative 통과;
6. server restart/update 후 기존 로그인 세션 유지;
7. frontend cache/runtime write permission 정상;
8. 필요한 Test noindex 유지;
9. 신규 fatal/critical log 없음.

Test가 exact intended candidate를 제공하지 않으면 승격은 BLOCKED다.

## 3. Main 통합·재검증

Candidate 승인 후 동시작업을 덮지 않고 검증 변경을 `main`에 통합한다. 현재 기획을 다시 읽고 application source identity를 재계산한다.

작업 중 `main`이 변경됐다면 rebase/reconcile 후 필요한 exact-main 검증을 다시 한다. 과거 branch SHA의 PASS는 다른 merged SHA 증거가 아니다.

## 4. Production 준비

Production은 `/srv/moneyverse-data/releases` 아래 immutable/reviewable release 디렉터리를 사용하고 secret/DB credential은 application release 디렉터리 밖의 안정 설정으로 유지한다.

현재 service pointer:
- `/srv/moneyverse-data/releases/production-current/backend`
- `/srv/moneyverse-data/releases/production-current/frontend`

Next.js에 필요한 mutable frontend runtime cache 하위만 준비한다. immutable release 전체 ownership을 재귀 변경하거나 cache 정리를 위해 회원 session을 삭제하지 않는다.

## 5. 무중단 승격

승격은 서비스 연속성과 로그인 연속성을 보존해야 한다.

필수 순서:
1. last-known-good generation 유지;
2. replacement generation 또는 승인 canary 경로 준비;
3. readiness와 version identity 검증;
4. restart/cutover 전에 만든 session이 이후에도 인증되는지 검증;
5. 승인된 Nginx/systemd release mechanism으로 traffic 전환;
6. public smoke와 changed-flow 확인;
7. observation window 동안 rollback 가능상태 유지.

Replacement가 준비되기 전에 유일한 healthy Production process를 의도적으로 중지하지 않는다.

## 6. Production 수용

관련 증거가 모두 일치해야 Production을 수용한다.
- application source/release identity;
- backend/frontend readiness;
- public version freshness;
- 권위 Production DB 연결·migration state;
- changed-flow smoke;
- session continuity;
- 신규 critical/fatal 오류 없음;
- 필요한 ledger/economy reconciliation;
- data/schema 위험이 있으면 backup/recovery gate.

일반적인 최소 공개 검사는 `/`, `/status`, version/health endpoint와 필요한 `robots.txt`, `sitemap.xml`, `ads.txt`다.

## 7. 데이터·migration 게이트

Migration은 forward-only, 번호/내용/checksum 불변으로 유지한다.

Destructive/schema-changing release는 요구되는 backup/restore evidence가 최신이 아니면 차단한다. Application release 성공을 위해 Production DB, ledger row, audit, session, volume을 삭제하지 않는다.

Production DB는 Docker container 이름만이 아니라 실제 application/service connection evidence로 식별한다.

## 8. Rollback

Rollback 대상은 현재 DB/config/session 계약과 호환되는 마지막 검증 application generation이다.

Application/config 실패는 code/runtime pointer를 되돌린 뒤 readiness/version/session/smoke를 반복한다.

Data/schema 실패는 corrective forward migration을 우선한다. Restore는 backup identity/checksum/source-target/operator record가 있는 검증 복구절차만 사용한다.

## 9. Kubernetes/Flux 상태

GitOps/Kubernetes 기록은 provenance와 복구/목표 아키텍처로 유지할 수 있다. Debian systemd/Nginx가 공개 origin을 제공하는 현재에는 public deployment 증거가 아니다.

향후 Kubernetes/Flux로 cutover하면 다음을 같은 작업 단위에서 갱신한다.
- `CURRENT_RUNTIME_BASELINE.ko.md`
- `INFRASTRUCTURE.ko.md`
- `architecture/deployment-flow.ko.md`
- 이 release guide
- 현재 기획 권위

## 참고

- [현재 런타임 기준](CURRENT_RUNTIME_BASELINE.ko.md)
- [인프라](INFRASTRUCTURE.ko.md)
- [배포 흐름](architecture/deployment-flow.ko.md)
- [Production 배포](operations/production-deployment.ko.md)
- [백업·복구](operations/backup-and-recovery.ko.md)
- [프로젝트 기획](planning/PROJECT_PLAN.ko.md)
