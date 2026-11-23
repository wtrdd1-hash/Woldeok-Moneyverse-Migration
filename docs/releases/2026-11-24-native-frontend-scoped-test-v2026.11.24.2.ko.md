# Test 전용 프론트엔드 무중단 부분 승격 영수증 — v2026.11.24.2
- 2026-11-24 KST. 대상: test.easy-scraping.com 전용. 운영 도메인/DB/서버 배포 없음.
- 적용: Test Nginx 정확한 14개 경로(새 6·공지/갤러리 8)만 127.0.0.1:55443으로 변경. 기존 프론트 55440·Test API 55438·Test DB 55436·운영 4550 변경 없음.
- 소스 SHA: 6eee110a03932764b01e15bc93faf829282bfa1a / JAR sha256: fbc2bd0367d6a9739a6ed61232b228177786040b7b62fbae0969622d54a96c87.
- Nginx 바이트 스냅샷(변경 전): /srv/moneyverse-native-test-20261124/6eee110a03932764b01e15bc93faf829282bfa1a/nginx-test-scoped.before.conf. 이전 SHA b7d40d78382065579f0491f5f41f69b5994ca344a3ec47780d9f629979d1eb3d, 새 SHA fb95b7f6ba7afd8baa9a2f5f327db970db1d8b1ac0c29a591179e9ad3aecfe67. Test 블록 바깥 SHA 2aded4226c64107dd7e42e95c6f0a5f95ef643c2d01636de37b4bab8241cc7be 보존.
- `nginx -t` PASS, graceful reload. 최초 스모크에서 기존 worker drain 중 일시 403을 관찰했으나 이후 안정화 후 /terms,/privacy 200·기존 /bank,/stocks,/wallet,/admin302·/api/version 200 및 새 scoped header 확인. 첫 스모크의 exit 13은 성공으로 오인하지 않고 재검사를 수행했음.
- 외부 HTTPS 60/60 Chromium, 오류/overflow 0건. Test rollback: 위 백업을 Test Nginx 설정 경로에 복구, `nginx -t`, graceful reload; 새 후보를 강제로 운영 승격하지 않는다.
- 새로운 전체 프론트엔드 운영/Test 승격은 불허; 114 경로/금융/OAuth/chat 전수 QA 미완료.
