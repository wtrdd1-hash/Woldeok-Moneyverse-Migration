# 실제 배포 인프라 구조

[English](INFRASTRUCTURE.md) | **한국어** | [문서 색인](INDEX.ko.md)

`deploy/`, `.github/workflows/` 또는 릴리스 관련 문서를 수정하기 전에 이 문서를 먼저 확인합니다. 과거 저장소에는 이미 사라진 장비 구조를 설명하는 문서가 남아 있었고, 그 설명을 기준으로 잘못된 변경이 수행된 적이 있습니다.

## 한 문단 요약
Production은 **NixOS의 단일 노드 Kubernetes 클러스터**이며 **Flux**가 `wtrdd1-hash/kuber-infrastructure`에서 선언된 상태를 조정합니다. 이 애플리케이션 저장소는 이미지를 빌드해 GHCR에 올리며 직접 배포하지 않습니다. 실제 릴리스는 인프라 저장소의 이미지 태그가 변경되고 Flux가 이를 감지해 Deployment를 롤아웃할 때 이루어집니다. **호스트에는 Docker가 없으며 실행 중인 시스템에 `docker compose` 제어면이 없습니다.**

## 장비
| 항목 | 값 |
| --- | --- |
| 호스트 | `minipc`, NixOS 26.05 |
| 클러스터 | kubeadm, Kubernetes v1.36.3, 단일 노드 |
| 런타임 | containerd 2.3.3 — **Docker 아님** |
| CNI | Cilium |
| ingress | Traefik, LoadBalancer `192.168.100.201` |
| 공개 엣지 | Cloudflare Tunnel |
| 스토리지 | `local-path`, reclaim `Retain` |
| 장비 선언 | `wtrdd1-hash/kuber-nixos-flakes` |

장비는 2026-09-07에 재설치되었습니다. 그 이전 문서의 `STACK`, `~/moneyverse-production`, 루프백 포트, `docker compose` 설명은 이전 Debian/Docker 환경에 대한 내용입니다.

## Production 위치
| 항목 | Production |
| --- | --- |
| URL | `https://easy-scraping.com`, `www.` |
| 네임스페이스 | `wdmvp` |
| 워크로드 | `wdmvp-backend`, `wdmvp-frontend`, `wdmvp-db` StatefulSet, `wdmvp-discord-voice` |
| 매니페스트 | `wtrdd1-hash/kuber-infrastructure` → `apps/wdmvp/` |
| 백업 | `wdmvp-db-backup` CronJob, 매시 `:17` |

영어 원문 작성 시점의 기록에는 `wdmv-test` 네임스페이스가 2026-09-09 제거되었고 `test.easy-scraping.com`이 404를 반환한다고 되어 있습니다. 다른 최신 배포 문서에는 Test 환경 재구축 내용이 있으므로 실제 배포 작업 전에는 **현재 GitOps 상태와 최신 배포 문서를 반드시 다시 확인**해야 합니다.

같은 노드의 `mail`, `economy`, `launcher`, `discord`, `cloudflared`, `gpt-plugin` 등 다른 네임스페이스는 별도 서비스입니다. 클러스터 전체가 이 프로젝트만을 위한 것이라고 가정하지 않습니다.

## 운영 배포가 실제로 도달하는 흐름

```text
이 저장소: gh workflow run deploy.yml
  → ref 검증
  → 빌드
  → ghcr.io/wtrdd1-hash/wdmv/{backend,frontend}:<sha>-production 게시

인프라 저장소:
  apps/wdmvp/{backend,frontend}.yaml 이미지 태그 변경
  → main 커밋

클러스터:
  Flux가 조정
  → Deployment 롤아웃
```

애플리케이션 저장소의 워크플로는 이미지 빌드 단계에서 끝나며 호스트에 SSH하거나 직접 배포하지 않습니다. 실행 상태를 바꾸는 기준 변경은 `wtrdd1-hash/kuber-infrastructure`의 커밋입니다.

전체 절차는 [운영 배포](operations/production-deployment.ko.md)를 참고합니다.

## 비공개 이미지와 풀 자격 증명
`ghcr.io/wtrdd1-hash/wdmv/*` 패키지는 비공개입니다. 노드는 `wdmvp` 네임스페이스의 `ghcr-pull` Secret을 사용해 이미지를 가져옵니다. 이 Secret은 클러스터 age 키용 sops로 암호화되어 `kuber-infrastructure`에 선언됩니다. 정상 배포에서 이미지를 수동으로 `docker save`, `scp`, `ctr images import`할 필요가 없습니다.

## 이미 발생했던 함정

### 멈춘 롤아웃도 `Available=True`일 수 있음
새 이미지를 가져오지 못하면 이전 Pod가 계속 서비스하면서 Deployment가 Available로 남을 수 있습니다. `Progressing` 상태까지 확인해야 합니다.

```bash
kubectl -n wdmvp get deploy wdmvp-frontend \
  -o jsonpath='{range .status.conditions[*]}{.type}={.status} {.reason}{"\n"}{end}'
```

`Progressing=False ProgressDeadlineExceeded`는 사이트가 겉으로 정상이어도 새 릴리스가 실제로 반영되지 않았다는 뜻입니다.

### 과거 이미지 태그가 GHCR에서 사라질 수 있음
오래된 `-production` 태그가 목록에는 남아 있어도 manifest 조회가 실패한 사례가 있습니다. 임의의 과거 태그로 언제든 롤백할 수 있다고 가정하지 말고 실제 사용 가능 여부를 확인합니다.

### 롤아웃이 DB 마이그레이션을 자동 실행하지 않을 수 있음
Kubernetes 매니페스트와 스키마 적용 경로가 분리되어 있을 수 있으므로 이미지가 기대하는 마이그레이션이 적용됐는지 `public.schema_migrations`를 확인합니다.

```bash
kubectl -n wdmvp exec wdmvp-db-0 -- sh -c \
  'psql -U $POSTGRES_USER -d moneyverse_production -qAt \
   -c "select filename from public.schema_migrations order by filename desc limit 1;"'
```

### 외부에서 백엔드로 직접 연결되는 경로는 제한됨
공개 ingress는 필요한 일부 통합/소켓 경로만 백엔드로 보내고 일반 웹 요청은 프론트엔드가 서버 측에서 백엔드를 호출하는 구조입니다. 브라우저에서 임의의 `/api/v1/...` 경로가 Next.js 404를 반환하는 것은 설계일 수 있습니다.

## `deploy/`의 현재 의미
이전 Docker Compose 제어면의 `compose.yml`, `roll.sh`, `update.sh`, `bootstrap-env.sh`, `edge/` 등은 제거되었습니다. 남은 일부 스크립트는 이전 Docker 호스트용 데이터 도구이므로 현재 NixOS/Kubernetes 호스트에서 그대로 동작한다고 가정하면 안 됩니다.

영어 원문 기준으로 중요한 미해결 항목은 다음과 같습니다.
- 백업 CronJob은 있지만 현재 클러스터용 완전한 복구 절차가 별도로 필요합니다.
- 일부 운영 Secret이 GitOps/sops로 완전 관리되지 않았던 기록이 있으므로 실제 상태를 배포 전 확인해야 합니다.

## 어떤 저장소를 수정해야 하는가
| 변경 대상 | 저장소 |
| --- | --- |
| 애플리케이션 코드, CI, 이미지 빌드 | `wtrdd1-hash/Woldeok-Moneyverse-Migration` |
| 클러스터에서 실행되는 이미지 태그, Secret, ingress | `wtrdd1-hash/kuber-infrastructure` |
| 장비 자체의 디스크, 네트워크, 방화벽, Kubernetes 노드 | `wtrdd1-hash/kuber-nixos-flakes` |

인프라 저장소 정책은 해당 저장소의 최신 문서를 따릅니다. 공개 upstream 저장소에는 이 클러스터의 호스트명, 주소, 디스크 식별자, 키 같은 운영 정보를 커밋하지 않습니다.
