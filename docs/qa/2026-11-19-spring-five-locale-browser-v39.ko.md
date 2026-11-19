# 실제 Spring PC·모바일 5언어 자동/수동 UI — QA v2026.11.19.39.1

2026-11-19 KST / 독립 브랜치 feat/spring-responsive-five-locales-v20261119-39 / 관리자 Spring PR #3295 위 스택, 회원 핵심 8화면 PR #3296는 별도 작업.

| 점검 | 실제 증빙 | 결과 |
| --- | --- | --- |
| 지원 언어 출처 | 기존 `frontend/src/lib/locale.ts`, `language-switcher.tsx` | **영어·한국어·일본어·중국어 간체·베트남어**, 자동·직접 선택 |
| Node 순수 함수 TDD | 초기 구현 전 모듈 없음 RED → 구현 후 실행 | **7 PASS, 0 FAIL**. 브라우저 언어·영어 fallback·수동/URL 우선·주소/검색 보존 |
| Java HTML/CSS TDD | 관리자·Thymeleaf/JS/CSS 통합 최초 **4개 RED**(5개 중) → GREEN | 실제 Spring 공통 관리자 및 계산기/도구/상태 언어 헤더 연결 |
| 모바일 겹침 | 390px 이하 선택기가 하단 56px 문의 동글을 가리지 않도록 **1 RED→GREEN** | 상단 안전영역 고정·44px 터치 목표 |
| 병렬 회원 화면과 설정 충돌 | PR #3296의 `wdmv_locale_preference` 미사용 오류를 신규 **RED→GREEN** 해결 | 회원/관리자/계산기 화면 전환 시 설정 쿠키·localStorage 공유 |
| 격리 Spring H2 실제 HTTP | Java `SpringFiveLocaleV39HttpTest` | **5 PASS**: EN/KO 계산기 HTTP200+선택기, JS MIME/200, CSS200, 익명 관리자→302 |
| 전체 Java 빌드 | `./gradlew clean test bootJar --offline --no-daemon -Dorg.gradle.workers.max=2` | **262/262 PASS, 실패0, 건너뜀0** |
| JAR 해시 | SHA256 | `2f876f422d7b7ba97277a8b29634913857ec9b65dc36d0368b864dd2ebae7b0b` (격리 개발 산출물) |
| 실제 Chromium 선택기 테스트 | 127.0.0.1 Test 픽스처와 실제 v39 JS/CSS, Playwright | **10/10 PASS**. PC 1440, 태블릿 768, 모바일 390/320, 가로 넘침 없음, 문의 버튼 비겹침, KO 수동 설정·페이지 이동, JA/ZH/VI 안내, Auto, Esc, KO 브라우저 감지, 실계정 API 요청 없음 |
| 운영 서버 신규 UI 제공 | 미반영 | **운영 미승격**, 실제 프론트 화면 전체 교체 아님 |
| 실제 계정·원장·상점/퀘스트·채팅 메시지 | 인증된 E2E 미실시 | 미검증 |
| 180개 페이지 전체 Spring 구현/5개 국어 본문 번역 | PR #3296 8개 주요 기능 화면 및 Spring 네이티브 일부에 한정 | **미완료** |
| 공식 Test Nginx/HTTPS·무중단/롤백 | 미실시 | 승격 HOLD |

**실제 브라우저 10개는 합성 테스트 화면**에 실 v39 선택기 자산을 불러와 검사한 것이다. 실제 고객 로그인/실금융/관리자 페이지 시각 동일성 또는 공개 운영 테스트가 아니다. 한편 별도의 5개 HTTP 테스트는 실제 H2 Spring MVC+Thymeleaf 응답을 확인한 것이므로 두 테스트의 범위를 혼동하지 않는다.

**병렬 충돌 방지:** PR #3296은 홈·지갑·투자·퀘스트·상점·게시판·문의·계정의 정적 HTML과 `assets/mv38/`를 소유한다. 본 작업은 해당 파일을 건드리지 않고 Spring Java 네이티브 공통 화면만 수정한다. 현재 네이티브 관리자·계산기 본문은 EN/KO 제공, JA/ZH/VI는 영어 대체+각 언어 안내. 완전 번역이라고 거짓 표시하지 않는다.

**판정:** 소스·H2·격리 Chromium 언어 선택 QA 통과 / 실제 계정·금융·보안·180개 페이지·실 운영 릴리스 증거 부족으로 **운영 승격 보류**. 원장/운영 Java/Nginx/Discord/회원 데이터는 변경하지 않았다.
