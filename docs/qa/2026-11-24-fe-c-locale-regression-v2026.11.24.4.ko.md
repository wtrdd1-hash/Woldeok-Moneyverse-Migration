# FE-C 지원·채팅 언어 계약 회귀 테스트 수정 — v2026.11.24.4

판정: **소스 테스트 오류 수정 / 전체 Test 배포 보류 / 운영 무변경**. [영문 정본](2026-11-24-fe-c-locale-regression-v2026.11.24.4.md). 2026-11-24 KST.

## 기준·작업 분리
- 최신 Migration main `9876c09888ec84034eec183cf1309c85df3d7447` 작업 전·중간 재확인, Android 앱 main `b6e9dda322ab7440567c0306295f3baf45067aeb` 확인. AGENTS.md, 최우선 통합기획서, 11월18일 5언어·UI 기준, 11월23일 v10 180 시안, 최신 FE/Gemini PR 검토.
- 별도 worktree·브랜치 `fix/fe-c-chat-locale-contract-v2026.11.24.0826`; FE-C PR #3413 확정 SHA `e6206a46df28c2da0c503f9b19cfe9f98e3be29e` 위에 쌓는 독립 수정. FE-C 소유 런타임 코드는 수정하지 않았다.
- 언어 우선순위: 사용자가 명시한 `?lang=` > 저장된 `wdmv_locale` 쿠키 > 브라우저 언어. 인증·은행·원장·접근 제어 완화 없음.

## 오류 재현→수정→검증
1. FE-C 최신 코드에서 RED 재현: `NativeMessagingWebTest.nativeMessagingHasFiveLocalesPrivateHeadersAndSingularChrome` 5건 중 **4건 FAIL**. 기존 테스트가 en/ko/ja/zh 쿠키와 명시적 `lang=vi`를 동시에 주면서도 쿠키가 이겨야 한다고 검사하는 모순이 원인.
2. 쿠키 fallback만 검사하는 기존 테스트에서 충돌하는 `lang=vi` 요청 파라미터를 제거. 나머지 별칭·메시지 양식·단일 문의 버튼·번역·캐시/헤더 검사는 보존. 기존 `SupportChatLocaleAliasTest`는 명시적 언어 우선순위를 별도로 검증. 구현 코드는 변경하지 않음.
3. 새 targeted GREEN, 독립 `./gradlew clean test bootJar --offline --console=plain` **전체 670건 PASS / 실패 0 / 오류 0 / SKIP 0**. 불변 JAR SHA256 `bf4c2a978735e0ff8a5fd2b073f3d81ca73eeb8ebd686602e223148196b79c56`.
4. 신규 소스를 Test 전용 임시 loopback :55446에 기동하고 Test API :55438 연결: 홈 200, 지갑·지원·채팅 비회원 302; **은행·주식 403** 및 약관·개인정보·일부 페이지 403 확인. 신규 전체 JAR은 배포하면 안 됨. 임시 서버 중단 확인.
5. 외부 Test HTTPS는 기존대로 홈·약관·개인정보 200, 은행·주식 302, jobs/quests/shop/blog 403. Test Nginx SHA `72c70184e2eca00f25f0f12c4e21dccb0c0f14d08f5c663374facbb3f1576c59` 유지.

## 추가 원인·미해결
- 현재 main의 `UnifiedFrontendApplication` 및 `MemberPresentationPageController`에서 이전 은행·주식 라우트가 제거돼 있고, 현행 Test :55440의 구 소스 `6ed285862`만 비회원 302를 제공한다. 기존 Test를 새 JAR로 통째 교체하면 로그인 이동 기능이 깨진다. 금융 기능이 복구됐다고 주장하지 않는다.
- `/jobs`, `/quests`, `/shop`, `/blog`는 현재 프론트엔드에서 본문 없는 403 응답이다. 실회원 API/DB·권한·화면 기능이 검증되지 않았으므로 단순 200 위장은 금지.

## 작업 시작·중간·종료 기록
- **시작:** 통합기획·기준·브랜치/소유권·서버 분리·기존 결함 확인 후 서버 로컬 `/srv/moneyverse-data/tasks/test-fe-c-locale-20261124-0826/AUDIT.md` 시작 기록.
- **중간:** TDD RED 4→GREEN 및 전체 테스트 670 성공, 임시 서버의 금융 302→403 위험 확인, main 재조회.
- **종료:** 코드 아닌 테스트 계약 수정과 EN/KO QA 기록을 독립 후속 PR로 전달. Test 실제 전환·Nginx·DB·운영·금융 데이터 변경 없음.
- **승격 게이트:** FE-A/B의 인증·상품/퀘스트/블로그 실제 구현, QA-1의 실API/원장, QA-2의 180개 UI/240 브라우저 검증과 롤백까지 **FULL TEST HOLD**.

내부 업데이트 v2026.11.24.4: 테스트 오류 수정·전체 Java PASS, 전체 서버 승격 금지.
GitHub 업데이트 v2026.11.24.4: 문서 2개·별도 코드 테스트 수정 PR, 리뷰/병합/승격 전 검증 필수.
