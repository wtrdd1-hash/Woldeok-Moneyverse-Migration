# Flux 클러스터 복구 — v2026.09.16.148

## 범위

GitOps 안전 경계를 우회하지 않고 기존 NixOS 단일 노드 Kubernetes 배포 제어면을 복구합니다. 공개 Test/Production 런타임의 이미지 식별자가 `wtrdd1-hash/kuber-infrastructure`의 목표 SHA와 다릅니다.

## 작업 전 확인

- 운영 호스트 계약은 NixOS 26.05, kubeadm Kubernetes, containerd, Flux입니다.
- 개발용 Debian 호스트에는 kubeconfig와 클러스터 SSH 개인키가 없습니다.
- 저장소 Actions secret에는 `DEPLOY_HOST`, `DEPLOY_PORT`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, `GHCR_PULL_TOKEN`이 남아 있습니다.
- 과거 `k8s-prepull.yml`은 이 secret으로 Kubernetes 호스트에 SSH 접속해 비밀번호 없는 `sudo`, `ctr`, `kubectl`을 실행한 기록입니다.
- Test/Production 이미지 빌드는 `BUILD_ID`에 정확한 Git SHA를 넣으므로 `/api/version` 불일치는 실제 런타임 drift 신호입니다.

## 계획

- [x] 복구 자동화 추가 전에 작업로그를 기록합니다.
- [ ] 기존 SSH secret을 사용하는 수동 production-environment 복구 workflow를 추가합니다.
- [ ] 자격증명 값을 출력하지 않고 Flux source/Kustomization 상태를 조회합니다.
- [ ] 필요할 때만 `flux-system` GitRepository source를 `wtrdd1-hash/kuber-infrastructure`로 수정합니다.
- [ ] reconcile을 강제하고 source/controller 상태를 검증합니다.
- [ ] Test/Production workload의 rollout 조건과 실행 이미지 태그를 확인합니다.
- [ ] 수렴 후 공개 exact-SHA endpoint를 검증합니다.
- [ ] Test가 검증되기 전까지 Production 승격은 fail-closed로 유지합니다.

## 안전 제약

PVC/DB/원장 삭제 금지, secret 값 로그 출력 금지, 애플리케이션 데이터 직접 변경 금지, 복구 workflow에서 Production 애플리케이션 이미지 강제 변경 금지, Flux reconciliation 비활성화 금지.