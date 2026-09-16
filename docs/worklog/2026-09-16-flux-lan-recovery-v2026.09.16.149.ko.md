# LAN Flux 복구 — v2026.09.16.149

## 범위

저장소의 기존 배포 SSH 개인키를 노출하지 않고 현재 NixOS Kubernetes 노드의 직접 관리 접근을 복구합니다.

## 작업 전 확인

- GitHub-hosted 복구 workflow는 저장된 `DEPLOY_HOST/DEPLOY_PORT`까지 도달했지만 `Connection refused`를 받았습니다. 기존 외부 SSH 전송 경로가 stale 상태입니다.
- MCP 개발 호스트 `debian13`과 같은 LAN에서 `192.168.100.186:22` SSH 노드가 살아 있습니다.
- 공개 `ssh.easy-scraping.com:22`의 SSH host-key fingerprint는 `192.168.100.186:22`과 다르므로 대체 대상으로 사용하지 않습니다.
- 과거 CI 기록상 기존 `DEPLOY_SSH_KEY`는 NixOS 전환 이후 Kubernetes 호스트에 인증 가능한 키였습니다.

## 계획

- [x] `debian13`에 1회용 RSA wrapping 인증서를 생성하고 개인키는 MCP 호스트의 `/tmp`에만 둡니다.
- [ ] `DEPLOY_USER`와 `DEPLOY_SSH_KEY`를 묶어 1회용 공개 인증서로 암호화한 ciphertext만 artifact로 올리는 수동 workflow를 추가합니다.
- [ ] `debian13`에서 ciphertext artifact를 받아 로컬 복호화하고 `192.168.100.186:22` SSH 인증을 검증합니다.
- [ ] 인증이 성공하면 LAN에서 Flux source/reconcile을 복구합니다.
- [ ] 복구 후 평문 자격증명, wrapping 개인키, ciphertext artifact, 일회성 workflow/인증서를 삭제합니다.

## 안전 제약

저장소·artifact·로그·채팅에 평문 secret을 남기지 않습니다. 비밀번호/키 내용은 출력하지 않습니다. DB/PVC/원장 데이터는 변경하지 않습니다. 임시 artifact에는 CMS 암호문만 포함합니다.