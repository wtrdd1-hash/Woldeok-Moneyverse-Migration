# 런타임 정리 인벤토리

[English canonical](RUNTIME_HYGIENE_INVENTORY.md) | **한국어**

> 버전: v2026.09.25.438
> 관측일: 2026-09-23
> 호스트 기준선: [../CURRENT_RUNTIME_BASELINE.ko.md](../CURRENT_RUNTIME_BASELINE.ko.md)

## 릴리스 저장공간 정리 — v2026.09.25.438

정리 전 관측값은 root 59%, Moneyverse data disk 72%, data disk 사용 inode 약 490만 개였다. 삭제 전 Production/Test symlink target과 4개 backend/frontend 프로세스 CWD가 모두 v436임을 재입증했다.

오래된 불변 릴리스 디렉터리 207개를 제거하고 Production 10개, Test 10개만 남겼다. 최종 data disk는 41G/197G(22%), 사용 inode 392,186개(3%)이며 약 94G와 inode 약 450만 개를 회수했다. root는 55G/99G(59%)로 유지됐다.

Production/Test systemd 애플리케이션 서비스 4개가 모두 active를 유지했고 Production/Test backend health가 OK를 반환했다. PostgreSQL, upload, backup, 보호 QA data, 24G disk swapfile은 삭제하지 않았다.

향후 정리는 `../planning/STORAGE_RELEASE_RETENTION_SPEC.ko.md`의 active target/CWD 보호 및 보존 정책을 따른다. 광범위 volume prune은 계속 금지한다.

## 보호 대상 현재 런타임

| 자원 | 분류 | 근거 |
|---|---|---|
| `woldeok-moneyverse-dev-db-1` | **PROTECTED CURRENT / Production DB runtime** | Production backend 환경이 `127.0.0.1:5433/woldeok_moneyverse_dev`를 사용하고 active backend TCP 연결이 관측됨 |
| `moneyverse-test-db` | **PROTECTED CURRENT / Test DB runtime** | Test backend 환경이 `127.0.0.1:5585/woldeok_moneyverse_ci`를 사용하고 active Test backend 연결이 관측됨 |
| `moneyverse-backend.service` | **PROTECTED CURRENT** | active systemd Production backend |
| `moneyverse-frontend.service` | **PROTECTED CURRENT** | active systemd Production frontend |
| `test-main-backend.service` | **PROTECTED CURRENT** | active isolated Test backend |
| `test-main-frontend.service` | **PROTECTED CURRENT** | active isolated Test frontend |

컨테이너 이름만으로 권위를 판단하지 않는다. 위 service connection과 runtime evidence가 보호 근거다.

## 안전 정리 완료

다음 컨테이너 객체는 repository/systemd/config 참조 0건, 미실행 또는 종료 상태, Production/Test DB 아님을 확인한 뒤 제거했다.

- `mv-b280-pg` — `Created`
- `mv-ci315` — `Created`
- `mv-ci315b` — `Created`
- `wdmv-v127-fulltest-db` — exited, 원본 mounted worktree 삭제됨

**데이터 volume은 의도적으로 보존했다.** 이번 조치는 stale container object만 제거했고 Docker volume은 삭제하지 않았다.

## 남은 QA/recovery DB 컨테이너

이름이나 생성일만 보고 삭제하지 않는다. owner/workstream과 데이터 가치를 먼저 확인한다.

- `wdmv-v129r3-qa-db-1` — exited, recovery worktree는 존재
- `wdmv-v182-db`
- `wdmv-v184-pg`
- `wdmv-v214-pg`
- `wdmv-v234-db`
- `moneyverse-v259-pg`
- `mv-ci-273`
- `wdmv-v273-db`
- `moneyverse-qa-v300`
- `mv-ci315c`
- `mv-b316-pg`
- `mv-b318-pg`
- `mv-b390-pg`

이번 스냅샷 시점에 나열한 QA host-mapped port의 established TCP client는 관측되지 않았지만, 한 시점의 무연결 상태만으로 삭제 근거가 되지는 않는다.

## Bind 노출 검토

관측된 Docker host bind:
- Production PostgreSQL `5433`: `0.0.0.0` / IPv6 wildcard
- QA PostgreSQL `55432`, `55433`, `55555`, `56555`: wildcard bind

이는 프로세스가 host-wide interface에서 listen한다는 뜻이다. 이번 검토에서는 firewall/network policy를 독립 검증하지 못했으므로 Internet 도달 가능하다고 단정하지 않는다.

후속 요구:
1. Production DB와 각 QA DB의 의도된 접근범위를 확인한다.
2. 원격 DB 접근이 필요 없으면 localhost-only bind를 우선한다.
3. 원격 접근이 필요하면 source allowlist/VPN/firewall 정책을 문서화한다.
4. Production `5433`은 backend continuity, backup, rollback을 입증하기 전 변경하지 않는다.
5. QA 컨테이너는 owner/workstream 확인 후 localhost-only bind로 재생성한다.

## 정리 판정 규칙

QA 컨테이너 제거 조건:
- 현재 systemd/config/CI/worktree에서 참조하지 않음;
- owner/workstream 종료 또는 명시적 이전 완료;
- active client 없음;
- data retention/rollback 필요성 해소;
- volume 보존/삭제를 별도 명시적으로 결정.

Container 제거와 volume 삭제는 별도 작업이다. 이 호스트에서 일반 정리 목적으로 `docker system prune --volumes`를 사용하지 않는다.
