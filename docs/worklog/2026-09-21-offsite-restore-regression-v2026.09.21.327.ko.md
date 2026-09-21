# v2026.09.21.327 — 오프사이트 복구 체크섬 회귀 게이트

## 상태
- [x] 계획: P1 오프사이트 복구 체크섬 수정에 실행 가능한 회귀 검증을 추가한다.
- [x] 진행: 운영 데이터를 건드리지 않고 절대경로 sidecar와 불일치 digest를 검증한다.
- [x] 완료: 항상 실행되는 CI policy lane에 테스트를 연결했다.
- [ ] CI / 배포: exact-SHA GitHub CI 대기 중이며 기존 migration-authority/DR gate 때문에 Production 승격은 계속 차단한다.

## 구현
- 격리된 rclone/docker/openssl fake를 사용하는 `moneyverse-restore-drill.test.sh`를 추가했다.
- 원본 서버 절대경로가 들어간 sidecar도 내려받은 archive 바이트 자체를 검증함을 확인한다.
- SHA-256 불일치는 복호화/복구 전에 fail-closed됨을 확인한다.
- docs/control-plane 분류에서도 건너뛰지 않도록 CI `policy`에 연결했다.
