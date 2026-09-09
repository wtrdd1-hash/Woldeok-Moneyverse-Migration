# Compose 제어면 정리와 인프라 문서화

**상태:** 완료 · 2026-09-09

## 왜

호스트가 2026-09-07에 NixOS + Kubernetes로 재설치됐는데, 리포는 여전히 Docker
Compose 호스트를 설명하고 있었다. 그 결과 서로 모순되는 설명이 동시에 존재했다:

- `AGENTS.md §7` — `STACK`, `~/moneyverse-production`, 루프백 3022, compose 호스트
- `docs/RELEASING.md` — Flux GitOps, `wdmvp`/`wdmv-test` 네임스페이스
- `deploy/` — compose.yml, roll.sh 등 동작하지 않는 제어면 전체
- `.github/workflows/k8s-prepull.yml` — `docker save`/`scp`까지만 하고 containerd
  import 단계가 없어, 릴리스마다 사람이 손으로 채워야 했던 워크플로

실제로 이 어긋남이 장애를 냈다. 프런트엔드 롤아웃이 한 시간 넘게
`ImagePullBackOff`로 멈춰 있었는데, 아무도 import를 하지 않았기 때문이다.
`ghcr-pull` 시크릿이 들어가면서 그 수동 단계 자체가 사라졌다.

## 한 일

- [x] `.github/workflows/k8s-prepull.yml` 삭제 — pull secret이 대체
- [x] compose 제어면 삭제: `deploy/compose.yml`, `roll.sh`, `update.sh`,
      `bootstrap-env.sh`, `edge/`, `install-backup-cron.sh`, `backup-watchdog.sh`
- [x] `docs/INFRASTRUCTURE.md` 신규 — 이 배포가 무엇인지, 무엇이 죽었는지,
      이미 밟은 함정 네 가지. 한국어 요약 포함
- [x] `AGENTS.md §7` 재작성 — compose 호스트 설명을 걷어내고 INFRASTRUCTURE.md로
      연결. 레이아웃 표의 `deploy/` 행도 수정
- [x] `AGENTS.md`의 `ADMIN_TOTP_ENCRYPTION_KEY` 항목 — 사라진 `bootstrap-env.sh`
      대신 `wdmvp-app` 시크릿을 가리키도록. 회전이 관리자를 고립시킨다는 성질은 유지
- [x] `deploy/README.md` 재작성 — 남은 스크립트가 무엇이고 왜 지금 호스트에서
      돌지 않는지 표로
- [x] `docs/BACKUP.md` 상단에 경고 — 폐기된 Docker 호스트를 설명하는 문서임
- [x] `docs/operations/production-deployment.md` — "reviewed GitOps PR"을
      main 직행으로 수정(인프라 리포 정책), INFRASTRUCTURE.md 링크 추가
- [x] `ops/README.md`, `docs/INDEX.md` 참조 정리

## 남긴 것과 이유

`backup.sh`·`restore.sh`·`recover-display-names*.sh`·`merge-forked-account.sh`는
전부 `docker compose exec`에 의존해 지금 호스트에서 돌지 않는다. 그래도 지우지
않았다 — 그 로직의 유일한 사본이고, 특히 `restore.sh`는 유일한 복구 절차다.
`deploy/README.md`에 "돌지 않음"을 표로 명시했다.

`wdmvp-registry` 시크릿은 `ghcr-pull`과 같은 일을 하는 중복인데, 이번 작업이
만든 것이 아니라 손대지 않고 문서에만 기록했다.

## 드러난 공백 (고치지 않음)

- **이 클러스터에서 동작하는 복구 절차가 없다.** 백업은 `wdmvp-db-backup`
  CronJob이 매시 :17에 돌지만 `restore.sh`가 이식되지 않았다.
- **앱 시크릿이 git에 없다.** `wdmvp-app`(32키)·`wdmvp-db-superuser`·
  `wdmvp-registry`는 손으로 만들어졌고 Flux가 관리하지 않는다. 네임스페이스를
  다시 만들면 애플리케이션 환경이 통째로 사라진다.
- **옛 이미지 태그가 레지스트리에서 사라진다.** 2026-09-09 기준 최신 하나를
  제외한 모든 `-production` 태그의 manifest가 404다. 롤백 대상이 없다.

## 검증

- 삭제한 파일을 가리키는 문서 참조: 0 (계획·감사 문서 제외)
- `docs/INDEX.md`에 INFRASTRUCTURE.md 등재
- 이 정리는 실행 중인 워크로드를 건드리지 않는다. 클러스터 변경은 별건으로
  `kuber-infrastructure` `bc277b6b`에 있다
