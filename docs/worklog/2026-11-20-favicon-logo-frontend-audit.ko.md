# 파비콘 로고 및 운영 프론트엔드 재점검

## Before work
- 사용자 요청: 실제 운영 프론트엔드를 확인하고 현재 파비콘 이미지를 로고로 사용한다. 별도 11월 17일 디자인 원본도 찾는다.
- 최신 origin/main 2a172ce199bbc4dfe123b0672fcb5fb548dea09e에서 미니PC의 기존 격리 worktree에 전용 브랜치를 생성했다. 공유 checkout 및 다른 작업은 변경하지 않는다.
- Superpowers systematic-debugging, writing-plans, executing-plans, TDD, verification-before-completion을 적용한다.
- 운영 브라우저 홈: 로고 2곳은 이미지가 아닌 SPAN W이며 명시적 favicon link가 없다. 실제 /favicon.ico와 /assets/mv39/favicon.ico는 동일한 11,781바이트, SHA256 9ce0a8f10cafff52d1d2f7aa451b3e9162944162f61258842e13aa8546f98e78이다. 저장소 파일과도 일치한다.

## In progress — historical initial checklist
아래 체크리스트와 중간 기록은 당시 상태를 보존한다. 현재 상태는 문서 끝의 종료 기록과 후속 OPEN 항목을 따른다.
- [x] GitHub PR 및 main 디자인 이력, 미니PC 작업 폴더, 연결된 디자인 대화, 사용자 로컬 이미지 목록을 조사했다.
- [x] 공식 왕관·월계수 W 아이콘과 실제 파비콘의 출처를 확인했다.
- [ ] 실제 파비콘을 공통 로고/탭 아이콘으로 연결한다.
- [ ] 회귀 테스트 RED→GREEN 및 관련 전체 검사, 독립 리뷰를 기록한다.
- [ ] 실제 PC·모바일 메뉴/언어/버튼/데이터 로딩을 검사하고 오류 및 미검증 범위를 기록한다.
- [ ] 정확한 소스의 Test와 운영 전환 상태를 기록한다.

### 디자인 원본 검색 결과
- PR3247은 11월 17일 게임형 앱 기획 문서이며 원본 픽셀 이미지가 아니다.
- 보관된 reference-approved-home.jpg 및 180 PNG는 11월 18일 개념 와이어프레임이다. 사용자가 말한 별도 11월 17일 원본이라고 판정하지 않는다.
- 기존 UI_IMAGE_IMPLEMENTATION_HANDOFF 및 LIVE_HOME_APPROVED_UI_GAP 문서도 대화 생성 이미지와 복구 PNG 일치를 미검증으로 명시한다.
- 연결된 ‘사이트 새 디자인 요청’·‘UI 이미지 전달 확인’ 대화는 조회 결과에 생성 이미지 대신 참조만 반환했다. 브라우저는 비로그인 상태이며 앱 화면 접근 승인이 시간 내 완료되지 않아 원본 이미지는 확보하지 못했다.
- 별도 11월 17일 원본 일치 판정은 OPEN이다. 원본을 확보하기 전 임의 디자인을 그 원본이라고 보고하지 않는다.

## Finished — first approved public rollout
2026-11-21 첫 공개 홈·공통 헤더 반영 완료. 아래 중간 이력은 당시 상태이며, 현재 상태는 문서 끝의 종료 증거와 후속 OPEN 항목을 기준으로 한다.

### Owner clarification — in progress
- 사용자가 디자인 기준을 **11월 18일**로 다시 명시했다. 이 명시가 앞선 별도11월17일 원본 탐색을 대체한다. 승인된 NOV18 authority 및 180화면 디자인 문서를 기준으로 구현·대조한다.
- 관리자 페이지 점검, 실제 백엔드 데이터 사용, 고정 샘플 정보 금지, 발견한 백엔드 문제 해결도 요청했다. 이전 backend-later 우선순위는 이 후속 지시로 갱신됐다. 개별 금융 수정은 기존 승인 및 독립 검토·백업·정합성 게이트를 계속 적용한다.
- 실제 /admin 브라우저 접속은 /login?error=login_required로 이동했다. 현 QA 브라우저는 비로그인 상태다. 인증된 관리자 기능 완료를 주장하지 않는다.
- 실제 홈 Invest 링크를 클릭하면 /stocks에서 12,580WLD/+2.41% 샘플 시안이 나타났다. P1 실제 기능 대체 결함으로 기록한다. API는 별도 검증하며 HTTP200을 기능 정상으로 판정하지 않는다.
- 파비콘 회귀는 최초 XPath HTML파싱 오류 후 검사 방식을 수정했다. 이후6개 실제 로고 누락 논리실패 RED를 확인한 뒤 shared template 두 곳을 기존 favicon IMG로 교체하고 tab icon link를 추가했다. focused27건 GREEN(0실패) 확인. 전체검사 및 독립리뷰 진행 중이며 운영에는 아직 반영하지 않았다.

### Public source and admin boundary inspection
- 실제 브라우저 /admin 로그인 이동 확인. origin에서 관리자 HTML4개는302/noindex, 관리자 API4개는401/no-store였다. 로그인된 관리자 작업은 미검증이다.
- 실제 공개 API 주식10/상점146/게시글2를 확인했다. 고정 수치가 아니라 점검 시점의 원천 행 수이며 화면에 이 숫자를 하드코딩하지 않는다.
- Task3 추가: 기존 실제 API 소비 모듈을 공유하여 /stocks,/shop,/board의 샘플 화면을 교체한다. 공개 데이터 조회 전용이고 회원 주문/구매/관리자 권한을 우회하지 않는다.

### Implementation validation checkpoint
- 공개3경로와 관리자 파비콘4logicalRED→38GREEN. 새 공개 Controller는 presentation패키지에만 명시적으로 import하여 일반 backend의 기존 /stocks mapping과 충돌하지 않는다. 기존 API/session/member/admin 경계는 그대로다.
- 최신 전체 Spring546tests0fail/error/skip, bootJar 성공. 공유CSS/JS/자산바이트는 변경하지 않았다.
- 추가 기존 Node18검사 중13pass/5fail 발견. 기존Next지원금fallback·허위성공 및 낡은 라벨 기대를 별도OPEN으로 기록. 새 native공개렌더러는 해당Next 코드/금융 API를 포함하지 않으며 전체검사green이라고 보고하지 않는다.
- 실제 운영6메뉴 추가 확인: stocks/shop/board/quests에 같은 설계용 예시 노출; wallet/support/account는 셸·언어 혼용. 상세 docs/qa/2026-11-20-favicon-real-frontend-audit.ko.md.

### CI asset-version regression
- 첫 CI spring-web-check는 새 favicon URL의 내용 기반 v해시가 빠져 native-assets 검사1건이 실패했다. 로컬 동일 검사 RED 재현 후 실제 favicon SHA256 쿼리를 추가한다. 자산 검사/보안 게이트는 완화하지 않는다.
- 독립 소스 리뷰는 기존546건 XML 및 순수 GET/HEAD 범위 확인 후 승인했으나 실제 후보 런타임·브라우저·관리자 인증 검증은 별도OPEN임을 명시했다.

### Latest validation and owner rollout order
- 사용자가 로그인 완료를 알리고 **한 화면을 만든 뒤 검증·승격하는 순서**를 명시했다. 홈 파비콘부터 전환하고, 공개 기능 페이지는 각 경로의 실제 데이터를 확인한 뒤 하나씩 전환한다. 관리자 화면은 실제 로그인 세션으로 열어 점검 중이다.
- favicon 내용해시쿼리 추가 후 native자산검사GREEN. URL과 클래스패스 자원 경로를 분리하고 HTML검사에서 쿼리의 regex 의미를 제거했다. 최초 fixture오류10건은 실패로 보존한다. 최신전체 Spring546건0실패/0오류/0skip 및bootJar, CI와동일 native Node79건0실패/0skip 확인.

### Actual320px browser findings and minimal header correction
- 격리 Test120케이스에서 실제 UI 실패3건 재현:320px 영어 복리·주식 계산기는 문서 폭331px, 베트남어 계산기 목록은322px였다. 공통 헤더의 로그인 버튼이 오른쪽 화면 밖으로 밀렸다. 표 내부 가로 스크롤과 문서 가로 넘침을 구분했다.
- 359px 이하에서만 공통 헤더를 줄바꿈하고 제목·인증 조작의 축소 및 밀림을 방지한다. 공유 CSS의 새 내용 SHA를 HTML에 연결하고 이전 버전의 자산 라우팅은 보존한다.
- 주식 검사15실패는 미인증 보유란1행과 시장10행을 합산한 harness 오류였다. 시장 요소로 검사를 한정하며 상품 데이터 부족으로 보고하지 않는다. 첫 Chromium 실행 실패도 환경 설정 실패로 보존했다.
- 통제된 CSS 원인 확인 실험은331/331/322px를 모두320px로 해소했다. 실험용 스타일 주입은 최종 배포 검증으로 사용하지 않으며, 새 실제 JAR의 반복 검증이 필요하다.

- 모바일에서는 sidebar와hero장식이 숨겨져 로고가 drawer안에만 남는 것을 확인했다. topbar 제목의 장식용 배경에도 동일한 실제 favicon을 연결해 기본 모바일 화면에서 식별되게 한다. 기존 제목·메뉴 의미·키보드 순서는 변경하지 않는다.

### Frozen source checkpoint
- 모바일 제목의 장식용 favicon이 없는 상태를 actual browser에서background:none으로 논리RED 확인한 뒤 최소 CSS를 구현했다. 제목 텍스트/메뉴/포커스 순서는 유지한다. 최종 CSS SHA256 dc1e8c8b6d7ddf5624978dc60a79596491ab5acf70d0feb892d41d9a09c17264.
- 최종 소스 전체 Spring546/Node79 모두0실패/0skip 및bootJar 성공. 소스 독립 리뷰도 최종3줄 장식용 이미지 및 좁은 헤더수정 승인.359/360px 경계와 실제 재빌드 브라우저 검사는 별도 수행한다.
- 앞선 개발 전용/identity:unverified JAR120브라우저 케이스는0실패였으나 운영승격 증거로 대체하지 않는다. source-bound CI→정확한main 재검증 후 승인된 홈/공통헤더부터 전환한다.

## 2026-11-21 — exact-main staging and Test privacy correction (in progress)
- PR3325 merged at00:01KST, application main93a3c8dbe8c04fda28689904ffe43a86992c73c1. Branch CI44756988867 all4jobsSUCCESS and exactPRmerge4cc20a5bd5484fd5da8617b027268df6d8424724/JARb0f0cef3621d2aa8a5bc1f18c7e86125b8a17cf7ba55eb091c7de827d208d819 passed280actual isolated browser cases.
- Exact-main CI44759127347 native artifact validated: SHA256af0913b0546716871ad57e3fb49b893a4cb662b4a5078882db8707158b6b6cc0; all1,829 application classes/resources byte-identical to the tested PR candidate. Full mainCI and final acceptance remain required.
- New loopback-only mainTest4794/standby4792 use this exact JAR. Both actually return main93a3 identity; direct admin/API/mutating calls403 with no session cookies. No Production traffic change has occurred. Final main125browser cases are running.
- Standalone actual Nginx10regressions passed: newCSSdc→newsource, old85b→oldsource, unknown/unversioned→unchangedlegacyf132, scopedsource/legacyReferer/204/HEAD/405 behavior retained. Independent source and routing proposal reviews approved.

### Test privacy — before work / correction
- Earlier HTTP403 observations did not establish privacy. Actual IAB Test home rendered the old frontend; Nginx exact Test routes had no origin access gate. This corrects the earlier interpretation explicitly. Do not claim the initial state was protected.
- Proposed Test-only change: same exact main on4794, exactfavicon route, server-level loopback allowlist, deny Cloudflare-origin indicators to avoid a local tunnel appearing as localhost. Public Production/API/admin/session/actuator/signup-hold bytes outside this Test server remain identical.
- Cloudflare documents that CF-Ray and CF-Connecting-IP are forwarded to origins: https://developers.cloudflare.com/fundamentals/reference/http-headers/ . No secret or new external credential is created.
- Proposal0ad494595ff50f152ea261088b4a0aa736b74c932d5dff9d922c0ebd2ff781f0 against base1881ba134b9c278c097af84c21b555bd592a78cbf086d781cf8f0bbe23ad6157 passed complete Nginx syntax and independent scoped review. Same existing nonfatal proxy_headers_hash warning retained; no warning-free claim.
- [ ] Apply Test-only compare-and-swap/graceful reload; require real external browser root+favicon403 and direct trusted loopback200/main93a3.
- [ ] After exact-main gates and rollback, switch only existing public home/shared-header routes; verify existing authenticated user survives. Newstocks/shop/board public routes and private/admin routing remain unchanged for this first rollout.

## 2026-11-21 — finished for the first approved public rollout
- 실제main93a3 CI44759127347 4jobSUCCESS, artifactaf0913...b6cc0, Test125casePASS, PRmerge280casePASS/앱1,829바이트 동등성 확인. 서비스PID와 열린JAR inode/hash/생성시각/자격파일0/재시작0 및boot/restart 보호를 확인했다.
- Test-only 정책을CAS1881ba→0ad494로 적용해 실제 외부IAB홈/favicon403, 내부200/source93를 확인했다. 기존Test가보호됐다는 초기HTTP판단은 정정했다.
- 첫 공개 전환은 잘못된내부actuator응답기대 때문에 자동복구. 동일한원천값404를 올바르게보존해 재전환했으며00:22:17KST에CAS0ad494→b5aa4016으로 수용됐다. 기존로그인/계정/지갑값표시유지. 실제외부IABactuator health/env403 별도확인.
- 공유기능5경로+index별칭만전환. CSSnewdc/old85b/unknownf132 및legacyversion204/기존ID호환성 유지. 이전프로세스/로컬artifact복구대상과새Test보호를보존한inverse구문검사완료. NoSQL/DB/grant/잔액/원장변경.
- 실제 운영25개배치(5페이지×320/359/360/390/1440), logo로드/모바일표시/넘침없음 확인. 대상탭오류로390px반복했던초기측정은증거제외하고재측정했다. 실제복리3400/평단15·수량4·원가60계산도조작했다.
- 관리자홈+35도구 실제로그인조사, 검색·필터·언어조작 완료. 원시로그/식별자/쿠키/잔액원문 미기록. /admin/logs/system은실제API정상이나저장된오류HTML이제공되는결함확인.
- 독립postcutover검토는metadata/좁은hash·source·로그검사로완료했다. raw설정출력은자동검토가차단하여더안전한방법으로검토했고미해결승인요청은없다. 최신서비스로그에ERROR/FATAL/Exception없음확인.
- 후속OPEN: 도구4경로정적로그인표시, 운영stocks/shop/board/quests시안, 관리자기능/테마혼용및운영관리자로고, source없는성공fallback/금융·346출처, 전체역할/언어/변경기능QA. 전체프론트엔드완료로기재하지않는다.
- 최신[운영receipt](../releases/2026-11-21-favicon-public-production.ko.md), [상세QA](../qa/2026-11-20-favicon-real-frontend-audit.ko.md), [공개검증요약](../qa/evidence/2026-11-21-favicon-public-release.md).


### Final scope checklist
- [x] 기존 favicon을 공개 공통 로고·탭 아이콘·모바일 제목에 연결.
- [x] RED→GREEN, 정확한 main CI/Test, 독립 소스·라우팅·운영 검토.
- [x] 공개 5경로 및 index 별칭 운영 전환, 로그인 연속성·계산 입력·25개 실제 배치 검증.
- [x] 관리자 홈·35개 도구 조회 결과와 결함 기록.
- [ ] 후속 화면별 구현·승격 및 관리자 전체 변경 기능 검증 — 별도 후속 작업.

### Documentation closure validation
- 원본 main `93a3c8dbe8c04fda28689904ffe43a86992c73c1` 재확인. 후속 변경은 문서 10개뿐이며 운영 애플리케이션 소스를 재명명하거나 재배포하지 않는다.
- 독립 문서 리뷰: blocker 없음. 계획의 CSS 변경 이력과 과거 체크리스트 표기를 정정했다.
- 문서·릴리스 정책 관련 Node 184건 통과, 실패·skip 0. 저장소 보안·제어문자 검사 및 git diff --check 통과. 상대 링크와 증거 JSON 유효성 확인. 기존 추가 Next QA 5건 실패는 OPEN 유지.
