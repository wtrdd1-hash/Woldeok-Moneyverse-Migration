# 11월 24일 Spring 프론트엔드 P0/P1 직접 수정 및 Test 부분 배포 검증
버전 v2026.11.24.2 / 대상 Test: https://test.easy-scraping.com / **TEST_DEPLOYED_SCOPED / FULL SITE HOLD / PRODUCTION NOT PROMOTED**.

## 기준과 범위
- 통합 기획서 최우선, Nov18 승인 네이비 #0C1020·보라 #9C83FF, 11월23일 v10 화면별 디자인 및 실제 favicon. 인가되지 않은 관리자 메뉴 노출 금지.
- 시작 remote main `9876c09888ec84034eec183cf1309c85df3d7447`, 별도 운영 중인 최신 브랜치 `a61f6d8b9df05bb9f3daee9f8acff067b15abb21`과 Gemini/FE 작업을 덮어쓰지 않도록 독립 worktree.
- **실제 배포 JAR 소스 SHA** `6eee110a03932764b01e15bc93faf829282bfa1a`; JAR SHA256 `fbc2bd0367d6a9739a6ed61232b228177786040b7b62fbae0969622d54a96c87`. Test 신규 프레젠테이션 127.0.0.1:55443. 기존 Test 웹 55440·Spring Test API 55438·Test DB 55436·운영 4550 변경 없음.
- Test Nginx에서 오직 이용약관·개인정보처리방침 각 / 및 / 후행, /socket.io.min.js, 신규 법적 문서 CSS, 공지/갤러리 원래 8개 alias만 55443으로 **부분 전환**. 기존 Test 홈페이지·은행·주식·회원·관리자·API 경로는 55440/55438 유지. 운영 호스트 Nginx 설정은 바이트 동일. 공통 Nginx 서비스 reload 1회 수행.
- SHA256: Nginx 수정 전 `b7d40d78382065579f0491f5f41f69b5994ca344a3ec47780d9f629979d1eb3d`, 수정 후 `fb95b7f6ba7afd8baa9a2f5f327db970db1d8b1ac0c29a591179e9ad3aecfe67`, 비-Test 블록 해시 `2aded4226c64107dd7e42e95c6f0a5f95ef643c2d01636de37b4bab8241cc7be` 동일. 서버 롤백 백업: `/srv/moneyverse-native-test-20261124/6eee110a03932764b01e15bc93faf829282bfa1a/nginx-test-scoped.before.conf`; 운영 호스트 설정은 고치지 않음.

## 변경과 테스트 실증
1. GET/HEAD 정책 페이지 차단 403 → HTTP200. 기존 React EN/KO 정책 문서의 원문(2026-09-02)을 건드리지 않고 오프라인 추출한 Spring Thymeleaf 내용으로 제공. JA/ZH/VI는 제목·화면은 현지화, 정책 원문은 명시된 영어 대체 본문으로 제공. 실제 5개 언어의 새 법률 번역본을 승인받았다고 주장하지 않음.
2. 실제 Socket.IO 클라이언트 JS GET 403→200 (파일 49,993 bytes). **스크립트 로딩만 정상**이며 서버 WebSocket 연결/채팅·알림 E2E는 미검증.
3. 공지/갤러리 문자열 'null | Woldeok Moneyverse' → 실제 현지화 제목. 공개 원본 API가 빈 값을 주면 거짓 게시물 생성하지 않음.
4. 실제 개인정보처리방침 320px·390px 가로 오버플로(441px) 제거. 공통 쉘·파비콘 유지.
5. TDD: 최초 신규 JUnit 2개 RED, 수정 후 대상 JUnit 28/28 PASS. 최초 코드 버전 전체 JUnit **676/676** PASS (Gradle PG-tagged suite 제외, 통과로 세지 않음). v2 CSS-only 변경 후 해당 JUnit 대상 28/28 PASS, Node 정적/계약 테스트 **350/350** PASS, `nginx -t` PASS.
6. **실제 외부 HTTPS Chromium 60/60 PASS**, 새 스크린샷은 /terms,/privacy 각 KO 모바일320·PC1440. 4개 공개 경로 × EN/KO/JA/ZH/VI × 320/390/1440: HTTP200·타이틀·원본 날짜·favicon·수평오버플로·JS 오류·비로그인 관리자 메뉴 노출 여부 검증. `browser-60-external.json`에 원본 60건. 콘솔 pageerror=0. 추가 visual diff 180개 페이지 전체 인증이 아님.
7. 테스트 외부 HTTPS 실제: /terms,/privacy,/socket.io.min.js,/announcements,/gallery HTTP200. /, /api/version HTTP200 유지, /bank,/stocks,/wallet,/admin GET302 유지, API 내부 관리자 경로 403 유지. 기존 55440 버전 식별 7b676e... 유지, 신규 path 헤더 `X-MV-Test-Scoped-Source=6eee110a...`. 다른 Test 화면 전체가 신규 JAR이 된 것이 아님.

## 고위험 차단 및 반영 보류
- 전체 Test 전환 시, 배포된 현행 55440의 /bank,/stocks 비로그인302가 구 후보의 403으로 퇴행함을 재현하여 **전체 교체 금지**. 독립 Test 경로만 원자적으로 전환해 기존 은행/주식 보존. Git commit 6eee...과 현재 다른 프론트 소스 최신 브랜치는 다르며, 구성 파일 없이 전체 릴리스를 동일 SHA로 포장하지 않음.
- 최신 다른 기능 소스 rebase 개발 브랜치에서 별도 Node 350개 중 52개 baseline FAIL(새 stocks 레이아웃과 이전 VM harness mismatch, JSON BOM, 기존 에셋 해시) 발생. 신규 Test 배포 JAR에는 해당 미검증 최신 전체 소스를 적용하지 않음. 이후 충돌 해소 및 독립 검증 필요.
- 아직 180개 전 페이지 기능·UI acceptance, 기존 114개 Test 403 분류 및 복구, 금융/계정 2인 거래원장·OAuth·관리자 RBAC 양성·WebSocket 채팅 기능, 보안·5언어 정책 전체 번역, 240개 브라우저 전체 수용은 **BLOCKED/OPEN**.
- **운영 승격 절대 미실행**. Test 부분 배포 PASS != 전체 제품 정상.

원시 증거: [60건 실제 외부 Chromium](evidence/2026-11-24-native-scoped-test/browser-60-external.json) · [KO 약관 모바일](evidence/2026-11-24-native-scoped-test/terms-ko-mobile-320.png) · [KO 약관 PC](evidence/2026-11-24-native-scoped-test/terms-ko-desktop-1440.png) · [KO 개인정보 모바일](evidence/2026-11-24-native-scoped-test/privacy-ko-mobile-320.png) · [KO 개인정보 PC](evidence/2026-11-24-native-scoped-test/privacy-ko-desktop-1440.png) · [릴리스 매니페스트](evidence/2026-11-24-native-scoped-test/test-release-manifest.json).
