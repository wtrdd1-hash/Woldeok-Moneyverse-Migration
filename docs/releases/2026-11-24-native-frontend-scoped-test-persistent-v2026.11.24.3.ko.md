# Test 전용 Spring UI 무중단 부분 배포 — 영구 서비스 안정화 v2026.11.24.3

## 변경 배경
v2026.11.24.2의 법률 문서·채팅 스크립트·공지/갤러리 수정은 Test 전용 14 경로에서 외부 HTTPS 및 Chromium 60/60으로 검증됐지만, 최초 55443 백엔드가 /run/systemd/transient 에서 실행되는 일회성 서비스여서 재부팅 시 자동 시작되지 않는 위험이 있었다. 이 변경은 UI 소스/기능을 바꾸지 않고 Test 전용 서비스의 지속성과 복구를 개선한다.

## 실제 인프라 변경
- 기존 완전 동일 불변 JAR SHA256 `fbc2bd0367d6a9739a6ed61232b228177786040b7b62fbae0969622d54a96c87`, Git source SHA `6eee110a03932764b01e15bc93faf829282bfa1a`.
- 영구 systemd 파일 `/etc/systemd/system/moneyverse-test-frontend-scoped-v20261124.service`: **enabled, active, Transient=no**. 서비스는 loopback `127.0.0.1:55444`, DB-free Spring MVC+Thymeleaf, Test API `127.0.0.1:55438`만 읽음. DynamicUser, NoNewPrivileges, PrivateTmp, ProtectSystem, 제한 네트워크와 384MiB 한도. 재부팅 실험 자체는 수행하지 않았으며 설정상 자동 시작 enabled를 확인.
- Test Nginx 14개 scoped route의 proxy_pass만 기존 `55443`→영구 `55444`로 변경. 다른 작업자가 별도로 추가한 `moneyverse-test-crawl-block-v20261124-3.conf` Test-only 크롤러 메타데이터 include를 탐지하여 **그대로 보존**. 변경 전 Nginx sha256 `b9ecab04f6dd2232a8c130ce91e9b66defb045d415e694c1f409b0dbedc8e9bf`, 변경 후 `72c70184e2eca00f25f0f12c4e21dccb0c0f14d08f5c663374facbb3f1576c59`.
- Test 블록 밖 구성(운영 vhost 포함)의 SHA256 `2aded4226c64107dd7e42e95c6f0a5f95ef643c2d01636de37b4bab8241cc7be`로 동일. Nginx config syntax PASS 및 graceful reload. 롤백용 Test Nginx 백업 `/srv/moneyverse-native-test-20261124/6eee110a03932764b01e15bc93faf829282bfa1a/nginx-test-scoped.before-persistent.conf`; 서비스 파일은 해당 경로의 영구 저장.
- 이전 임시 프론트 서비스 `moneyverse-fe-scoped-candidate-20261124`(55443), `moneyverse-fe-hotfix-preview-20261124`(55442)를 중지, 새 영구 서비스가 실제 경로를 제공함을 재확인. 기존 Test 전체 UI 55440 / Spring API 55438 / Test DB 55436 / 운영 4550을 변경하지 않음. 운영 데이터 쓰기 없음.

## 독립 확인
- 영구 서비스 `/frontend-ui-version` HTTP200 및 SHA `6eee110a...`.
- 로컬 Host 지정 Nginx /terms,/privacy,/socket.io.min.js,/assets/mv43/legal.css,/announcements,/gallery GET200; 기존 /bank,/stocks,/wallet,/admin GET302, 홈/API200.
- **외부 HTTPS** /terms,/privacy,/socket.io.min.js,/announcements,/gallery HTTP200, /bank,/stocks HTTP302. 원본 v2026.11.24.2 60개 실제 HTTPS Chromium 회귀 결과는 변경 전 확인되었고 immutable jar가 동일; 영구 서비스 변경 후 전체 60개 재실행은 별도 게이트로 남김.
- Nginx scoped HEAD 응답에서 `X-MV-Test-Scoped-Source=6eee110a...` 유지. 소스·브랜치 및 금융 권한 무변경.
- Test 부트/롤백 영수증은 v2 영수증과 이 기록을 같이 사용. 운영 승격 및 전체180개 합격은 여전히 **HOLD**. Socket.IO 클라이언트 JS GET200 != 실제 WebSocket 기능 PASS.

관련 문서: [v2 전체 Test QA](../qa/2026-11-24-frontend-scoped-test-release-v2026.11.24.2.ko.md) / [v2 60개 실브라우저 원시 결과](../qa/evidence/2026-11-24-native-scoped-test/browser-60-external.json).
