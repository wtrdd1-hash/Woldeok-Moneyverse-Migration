# Flux 런타임 복구 v2026.09.16.149

## 목적
기존 v148 Flux 복구 workflow를 현재 서버 네트워크 상황에 맞게 조정합니다. 현재 저장된 배포 SSH endpoint는 연결 거부가 발생하지만, 내부에서 확인된 현재 서버는 SSH 22번을 사용합니다.

## 변경 전 증거
- v148 복구 run은 Kubernetes 접근 전 단계에서 설정된 배포 endpoint의 `Connection refused`로 실패했습니다.
- Production SSH Secret 자체는 존재하며, 문제는 credential 누락이 아니라 endpoint 도달성입니다.
- MCP 내부망 점검에서 외부로 열린 Kubernetes API는 없고 현재 유력 서버에는 SSH 22번만 열려 있습니다.
- 따라서 과거 `DEPLOY_PORT` 값이 현재도 맞다고 가정하면 안 됩니다.

## 작업 순서
- [x] GitHub Actions 로그에서 v148 실패 원인 확인.
- [x] 과거 OS/포트 구성을 가정하지 않고 MCP 내부망 재점검.
- [ ] 설정 포트를 먼저 시도하고 실패 시 22, 2212만 제한적으로 시도하도록 SSH 연결 설정 수정.
- [ ] strict known-host 검증과 public-key-only 인증 유지.
- [ ] controller restart 없이 Flux 복구 재실행.
- [ ] SSH/Kubernetes 연결 후에도 Flux source가 stale이면 controller restart를 켜서 2차 실행.
- [ ] Production 애플리케이션 승격 전에 Test exact SHA 검증.

## 안전 조건
- credential 값은 출력하거나 Actions runner 외부에 저장하지 않습니다.
- 애플리케이션 image를 직접 변경하지 않습니다.
- DB와 Secret 데이터는 변경하지 않습니다.
- Test 수렴 및 smoke 통과 전까지 Production 애플리케이션 승격은 차단합니다.
