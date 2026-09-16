# Flux ProxyJump 복구 v2026.09.16.150

## 목적
GitHub Actions의 deploy private key를 외부로 꺼내지 않고, 현재 접근 가능한 SSH 게이트웨이를 통해 Kubernetes/Flux 제어 경로를 복구합니다.

## 확인된 상태
- 과거 `DEPLOY_HOST:DEPLOY_PORT`는 현재 연결 거부 상태입니다.
- MCP 네트워크 점검에서 현재 공인 SSH 종단은 22번으로 접근 가능하고 LAN 게이트웨이와 연결됩니다.
- Kubernetes 후보 호스트는 MCP LAN에서 `192.168.100.186:22`로 접근 가능합니다.
- v149 암호화 credential export는 현재 도구 보안 경계에서 복호화가 차단되므로 평문 키 추출 방식은 사용하지 않습니다.
- 복구 중 운영 변경이 한꺼번에 반영되지 않도록 Production GitOps `apps`는 이미 `suspend: true`로 동결했습니다.

## 작업 순서
- [x] deploy private key를 GitHub Actions 내부에만 유지.
- [ ] 인증 전에 현재 게이트웨이 ED25519 host fingerprint 검증.
- [ ] 기존 Production deploy key로 게이트웨이 public-key 인증 확인.
- [ ] 인증된 게이트웨이에서 내부 대상 ED25519 fingerprint 검증.
- [ ] 두 hop 모두 strict host-key checking을 적용한 SSH ProxyJump 사용.
- [ ] 대상 OS를 가정하지 않고 Kubernetes CLI 탐지.
- [ ] Flux source를 `wtrdd1-hash/kuber-infrastructure`로 복구하고 isolated `wdmv-test`만 reconcile.
- [ ] public Test exact SHA 및 smoke 검증.

## 안전 조건
Private key를 export/log하지 않습니다. 애플리케이션 image 직접 변경, DB 쓰기, Secret 조회, Production reconcile은 하지 않습니다.
