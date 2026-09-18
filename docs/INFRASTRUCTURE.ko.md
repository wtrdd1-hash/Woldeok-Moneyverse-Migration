# 실제 배포 인프라 구조

[English](INFRASTRUCTURE.md) | **한국어** | [문서 색인](INDEX.ko.md)

> [!IMPORTANT]
>
> **현재 런타임 권위 상태 — 2026-09-16 / v2026.09.16.151**
>
> 현재 공개 Production과 Test는 `192.168.100.190`의 승인된 Debian 13
> 런타임에서 systemd 릴리스 디렉터리와 로컬 PostgreSQL 컨테이너로
> 서비스됩니다. 공개 Production/Test, 애플리케이션 저장소 `main`, GitOps의
> desired 이미지/소스 참조는 모두 정확한 애플리케이션 SHA
> `3d87165f83bcb60903e85d4f3600fdf40074ef40`로 수렴했습니다.
>
> `192.168.100.186`의 NixOS/Kubernetes 노드는 **현재 공개 서비스의 권위
> 런타임이 아닙니다**. 설정된 배포 자격증명으로 관리자 SSH 권한을 복구하지
> 못했으므로 Production Flux `apps` Kustomization은 의도적으로
> `suspend: true`를 유지합니다. 클러스터 관리자 접근을 복구하고 현재 공개
> Production PostgreSQL 권위 DB와 클러스터 DB를 대사하기 전에는 **Flux를
> 재개하거나 Production 트래픽을 Kubernetes DB로 전환하지 마십시오.**
>
> 아래 Kubernetes 설명은 목표/이전 GitOps 아키텍처를 설명합니다. 이 사고
> 상태 공지와 충돌하는 부분은 이후 버전의 런타임 수렴 기록이 이를 대체하기
> 전까지 이 공지를 우선합니다.

`deploy/`, `.github/workflows/` 또는 릴리스 관련 문서를 수정하기 전에 이 문서를 먼저 확인합니다. 과거 저장소에는 이미 사라진 장비 구조를 설명하는 문서가 남아 있었고, 그 설명을 기준으로 잘못된 변경이 수행된 적이 있습니다.

## 한 문단 요약

**목표 아키텍처**는 NixOS 단일 노드 Kubernetes와 `wtrdd1-hash/kuber-infrastructure`를 조정하는 Flux입니다. 그러나 v2026.09.16.151 복구 시점에 검증된 공개 권위 런타임은 `192.168.100.190`의 Debian 13 systemd 환경과 로컬 PostgreSQL 컨테이너입니다. 애플리케이션 저장소는 계속 immutable GHCR 이미지를 만들고 GitOps 저장소도 공개 Test/Production과 같은 exact SHA를 선언하지만, Kubernetes Production `apps` Kustomization은 suspend 상태입니다. 위 접근/DB 대사 게이트를 통과하기 전까지 Kubernetes는 현재 운영 권위가 아니라 복구 대상입니다.

## Kubernetes 복구 대상 장비(현재 공개 권위 아님)

| 항목      | 값                                      |
| --------- | --------------------------------------- |
| 호스트    | `minipc`, NixOS 26.05                   |
| 클러스터  | kubeadm, Kubernetes v1.36.3, 단일 노드  |
| 런타임    | containerd 2.3.3 — **Docker 아님**      |
| CNI       | Cilium                                  |
| ingress   | Traefik, LoadBalancer `192.168.100.201` |
| 공개 엣지 | Cloudflare Tunnel                       |
| 스토리지  | `local-path`, reclaim `Retain`          |
| 장비 선언 | `wtrdd1-hash/kuber-nixos-flakes`        |

이 표는 현재 사고 이전에 기록된 Kubernetes 복구 대상 구성을 설명합니다. 이 워크로드가 지금 공개 트래픽을 처리한다는 증거가 아닙니다. 현재 공개 권위는 위의 공개 exact-SHA probe, 활성 systemd WorkingDirectory, 실제 DB 연결 증거를 기준으로 판단합니다.

## 현재 Production 위치

| 역할                       | 현재 권위 상태                                                     |
| -------------------------- | ------------------------------------------------------------------ |
| 공개 Production URL        | `https://easy-scraping.com`                                        |
| 공개 Test URL              | `https://test.easy-scraping.com`                                   |
| 활성 호스트                | Debian 13, `192.168.100.190`                                       |
| Production 서비스          | systemd의 `moneyverse-backend`, `moneyverse-frontend`              |
| Test 서비스                | systemd의 `test-main-backend`, `test-main-frontend`                |
| Production DB 권위         | 활성 backend가 사용하는 `127.0.0.1:5433` 로컬 PostgreSQL           |
| 공개 exact application SHA | `3d87165f83bcb60903e85d4f3600fdf40074ef40`                         |
| GitOps desired 대상        | `wtrdd1-hash/kuber-infrastructure` → `apps/wdmvp/`, 동일 exact SHA |
| Kubernetes Production 상태 | `clusters/minipc/apps.yaml` → `suspend: true`                      |

현재 공개 복구 토폴로지는 Debian 권위 호스트에서 **Test와 Production systemd 서비스를 분리**해 운영합니다. `test.easy-scraping.com`은 활성 상태이며 Production 전 exact-SHA 릴리스 게이트로 사용됩니다. GitOps 저장소도 `wdmv-test` 대상을 선언합니다. Test가 제거됐거나 404를 반환한다는 과거 기록은 v2026.09.16.151 기준으로 폐기된 정보입니다.

### 부팅 연속성 규칙 — v2026.09.18.215

승인된 Debian 13 Production 호스트는 전원 재인가 또는 재부팅 뒤 Moneyverse 런타임을 자동 복구해야 합니다. 다음 unit은 항상 enabled 상태를 유지하고 부팅 후 active인지 확인합니다: `moneyverse-backend.service`, `moneyverse-frontend.service`, `moneyverse-discord-bot.service`, `moneyverse-economy-ai.service`, `moneyverse-mcp.service`, `docker.service`, `nginx.service`, 저장소 GitHub Actions runner service. 호스트 `5433`에 연결된 Production PostgreSQL 컨테이너는 Docker restart policy `unless-stopped`를 유지해야 하며, `554xx` 포트의 단기 QA DB 컨테이너는 Production 부팅 필수 대상이 아닙니다.

Discord 봇은 선택적인 수동 작업이 아니라 부팅 계약의 일부입니다. systemd에서 `multi-user.target` 자동 시작 및 자동 재시작을 유지합니다. 서버 부팅 또는 봇 재시작 뒤 journal에서 봇 로그인 성공과 대상 음성 채널 `1536572442422550538`의 초기 연결 ready 상태를 확인합니다. Discord 음성 연결이 끊기면 봇 voice watchdog이 자동 재입장해야 합니다.

운영 확인 명령:

```bash
systemctl is-enabled moneyverse-backend.service moneyverse-frontend.service \
  moneyverse-discord-bot.service moneyverse-economy-ai.service \
  moneyverse-mcp.service docker.service
systemctl is-active moneyverse-backend.service moneyverse-frontend.service \
  moneyverse-discord-bot.service moneyverse-economy-ai.service \
  moneyverse-mcp.service docker.service nginx.service
journalctl -u moneyverse-discord-bot.service -n 80 --no-pager
docker inspect -f '{{.HostConfig.RestartPolicy.Name}} {{.State.Status}}' \
  woldeok-moneyverse-dev-db-1
```

2026-09-18 승인된 Debian 13 호스트에서 이 계약을 재검증했습니다. 핵심 Moneyverse 6개 unit과 Nginx, GitHub Actions runner가 모두 enabled/active였고, Production PostgreSQL 컨테이너는 `unless-stopped`로 실행 중이었습니다. 공개 Production/Test는 HTTP 200, backend `/health`는 HTTP 200을 반환했으며, Discord 봇 journal에서 로그인 성공과 설정된 대상 음성 채널의 voice-ready 상태를 확인했습니다.

같은 노드의 `mail`, `economy`, `launcher`, `discord`, `cloudflared`, `gpt-plugin` 등 다른 네임스페이스는 별도 서비스입니다. 클러스터 전체가 이 프로젝트만을 위한 것이라고 가정하지 않습니다.

## Kubernetes Production suspend 중 현재 릴리스 흐름

```text
애플리케이션 저장소 main
  → immutable exact SHA / Build Test Candidate
  → 현재 Debian 권위 런타임의 exact-SHA Test
  → 공개 Test backend/API/SEO 경계 QA
  → 신규 Production DB 백업
  → 같은 exact SHA를 Debian Production systemd에 승격
  → 공개 Production smoke + SEO 검증
  → Build Production Release가 exact-SHA GHCR 이미지 게시
  → GitOps Test/Production desired 참조를 같은 SHA로 갱신
  → Runtime Drift Watch로 desired == public live 검증

Kubernetes Production apps는 suspend=true를 유지합니다.
SSH 관리자 접근과 클러스터 DB 대사가 통과하기 전에는 재개하지 않습니다.
```

장기 목표는 NixOS 접근과 DB 게이트를 복구한 뒤 정상 Flux 제어 Production으로 복귀하는 것입니다. 현재 복구 상태에서는 GitOps 이미지 태그 갱신이 **Kubernetes rollout 허가를 의미하지 않으며**, 클러스터가 Production을 서비스한다는 증거로 사용해서도 안 됩니다.

전체 릴리스 안전 계약은 [운영 배포](operations/production-deployment.ko.md)를 참고합니다.

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

| 변경 대상                                             | 저장소                                     |
| ----------------------------------------------------- | ------------------------------------------ |
| 애플리케이션 코드, CI, 이미지 빌드                    | `wtrdd1-hash/Woldeok-Moneyverse-Migration` |
| 클러스터에서 실행되는 이미지 태그, Secret, ingress    | `wtrdd1-hash/kuber-infrastructure`         |
| 장비 자체의 디스크, 네트워크, 방화벽, Kubernetes 노드 | `wtrdd1-hash/kuber-nixos-flakes`           |

인프라 저장소 정책은 해당 저장소의 최신 문서를 따릅니다. 공개 upstream 저장소에는 이 클러스터의 호스트명, 주소, 디스크 식별자, 키 같은 운영 정보를 커밋하지 않습니다.
