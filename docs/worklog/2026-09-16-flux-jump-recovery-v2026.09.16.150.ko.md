# Flux 점프 호스트 복구 v2026.09.16.150

## 목적

기존 배포 개인키를 GitHub Actions 밖으로 반출하지 않고 NixOS Kubernetes 노드의 인증 접근을 복구합니다.

## 구현 전 증거

- 공개 Production은 현재 Debian systemd 비상 경로에서 최신 애플리케이션 계열을 제공하지만 GitOps Production 선언은 오래된 상태입니다.
- 공개 Test는 전진했지만 기존 GitHub SSH endpoint로 NixOS 제어면에 접근할 수 없습니다.
- NixOS 노드는 `debian13` 내부망에서 `192.168.100.186:22`로 도달 가능합니다.
- 기존 `DEPLOY_SSH_KEY`는 GitHub Actions secret 안에 유지하며 출력·다운로드하지 않습니다.

## 체크리스트

- [x] 최신 `main`, 통합 기획서, 런타임 증거, 복구 PR 이력을 다시 확인했습니다.
- [x] 기존 GitHub SSH 직접 복구가 계속 fail-closed임을 확인했습니다.
- [ ] GitHub Actions 안에서 기존 배포키의 공개키만 파생합니다.
- [ ] 임시 Debian 점프 호스트에 그 공개키만 승인합니다.
- [ ] strict host-key 검증으로 GitHub Actions → Debian → NixOS LAN SSH를 구성합니다.
- [ ] Production Flux는 동결한 채 source와 격리 Test부터 복구합니다.
- [ ] 정확한 Test SHA, 백엔드/DB smoke, noindex 경계를 확인합니다.
- [ ] Production 작업 직전 최신 `main`을 다시 확인합니다.
- [ ] 정확한 main SHA가 Test를 통과한 뒤에만 Production을 승격합니다.
- [ ] 수렴 후 임시 점프 승인과 복구 workflow를 제거합니다.

## 안전 조건

평문 개인키를 저장소·artifact·로그·채팅에 남기지 않습니다. DB/PVC/원장 삭제를 하지 않습니다. Test exact-SHA 검증 전 Production은 fail-closed를 유지합니다.
