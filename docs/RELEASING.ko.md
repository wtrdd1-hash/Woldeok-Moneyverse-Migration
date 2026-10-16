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

### 호스트 정확한 소스 버전 확인 (v2026.10.15.670)

후보 코드를 Test에서 실제 실행한 뒤 **현행 Debian 서버**에서 다음을 실행한다.

```bash
node scripts/release/verify-host-runtime-identity.mjs --channel test --sha <검증된-40자-후보-SHA>
```

v717부터 이 명령은 immutable 릴리스 manifest의 버전으로 **실제 운영 중인 release 세대별 systemd 서비스**를 선택한다(Prod `moneyverse-release-vNNN-backend/frontend.service`, Test `test-main-backend/frontend.service`). 선택된 서비스의 **실효 EnvironmentFiles 순서에 따라 적용된** `BUILD_ID`, 프론트엔드 `.next/BUILD_ID`, 실제 프로세스 작업 디렉터리, 공개 버전 API를 대조하며 옛 v600 서비스나 고정된 오래된 env 파일을 대신 검사하지 않는다. 읽기 권한 제한된 `/etc/moneyverse/*-release.env`가 있으면 승인된 운영자만 `sudo -n node scripts/release/verify-host-runtime-identity.mjs --channel test --sha <검증된-40자-후보-SHA>` 형태로 읽기 전용 실행할 수 있다. 환경값 자체나 비밀정보는 출력하지 않는다. 항목 하나라도 누락·불일치하면 **승격 차단**이다. 읽기 전용이며 통과시키려고 배포 manifest나 버전 값을 조작해서는 안 된다. 정확한 코드와 빌드를 새 immutable 경로에 재배포해야 한다.

인증·금융원장·DB 권한·마이그레이션·전체 UI 5회·세션 유지·백업/복구·무중단 canary의 **별도 수용을 모두 통과**한 뒤 운영에 원자적 전환하고, 같은 SHA로 `--channel prod`를 다시 실행한다. 이 버전 확인 자체가 전체 운영 승인을 의미하지 않는다.

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

### 금융 원장·DB 최소권한 최종 차단 — v737

금융/경제/국고 변경 운영승격 전 실제 운영 백엔드 systemd `EnvironmentFiles`로 DB 식별을 확인하고 읽기 전용 검사를 실행한다.

`sudo -n node scripts/release/verify-financial-readiness.mjs --env-file /home/debian/Woldeok-Moneyverse-Migration/backend/.env`

종료코드 비영(非0)·`BLOCKED` 시 승격 금지. v717 운영 2026-10-16 실측: 핵심 5테이블 앱 직접 DML, 미인증 초기 잔액/원장 차이 19계정. 근거 없는 조폐·원장 보정·예외승인 금지. 검사 통과도 오프닝 출처/공급량/금고/Test DB/v530 인증 UI/롤백 별도 승인 필요. [증거](worklog/2026-10-16-financial-readiness-v737.ko.md).
