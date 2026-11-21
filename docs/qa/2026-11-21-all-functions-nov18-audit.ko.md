# 전체 기능·Nov18 디자인 운영 QA 재검증 — 2026-11-21

**판정: 전체 기능 정상 아님. 11월 18일 디자인 통일 완료 아님.** 이 문서는 운영을 직접 연 결과와 현재 main 소스 결함을 구분한다. 실패/차단 항목을 정상이나 완료로 바꾸지 않았다. 이번 작업은 감사와 증거 문서화이며 앱·DB·Nginx·보안 설정을 변경하거나 배포하지 않았다.

## 1. 기준과 검사 범위

- 기준 main: `dfade03ea9b555f58beabd0dfaf4a7d9a27817c9`. 작업 시작 후와 중간에 fetch하여 동일함을 확인했다.
- 승인 디자인: [Nov18 권위 문서](../planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md), [180개 경로 원본 목록](../design/all-pages-v2026.11.18.12/README.md), [관리자·채팅 명세](../planning/ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13.ko.md), 통합 기획서·PROJECT_PLAN. 홈·관리자 PC/모바일 원본 PNG도 직접 열어 대조했다. 개념 원본의 예시 숫자/그래프는 실데이터가 아니다.
- 소스 후보: Next 페이지180개=정적147+동적33. 네이티브 HTML 매핑 후보92개는 별칭 포함이며 별도92개 기능을 뜻하지 않는다. 정규식으로 얻은 form206/handler1146도 실행 가능한 기능 수가 아니다.
- 운영 브라우저: 로그인된 QA 세션으로 공개/회원/관리자 정적147개를 PC1440×1000, 모바일390×844에서 각각 다시 열었다. 관리자 정적39개도 포함했다. 추가 별칭41개, 유효 공개 카탈로그/실제 QA 회원/공개 글 fixture로 동적 패턴25개를 열었다. 총360개 기본 탐색 사례이며, 재촬영·버튼 검사는 별도다.
- 렌더되는68개 화면은 PC/모바일 fullPage 원본을 새로 캡처했다. 기본 PC 캡처가 IAB 패널 폭에 잘리는 현상을 발견하여 전체 폭 캡처로 교체했다. 캡처 도구의 잘림을 사이트 overflow 결함으로 세지 않았다. fullPage의 고정 하단 메뉴가 긴 이미지 중간에 보이는 것도 그 자체로 제품 결함 판정 근거가 아니다.
- 68개 화면의 시각 개요를 검토했다. 긴 페이지 축소 개요만으로 모든 글자/하단 영역까지 정밀 통과했다고 주장하지 않는다. 실제200% 브라우저 확대, 스크린리더, 물리 모바일 IME, 모든8개 규정 뷰포트, 모든 문장의5언어 교열은 NOT_RUN이다.
- 원본 캡처/회원 이름/UUID/잔액/개인 본문/인증 정보는 GitHub에 포함하지 않는다. [허용 필드만 남긴 브라우저 원장](2026-11-21-all-functions-safe-metadata.json), [경로별 표](2026-11-21-all-functions-route-ledger.ko.md), [소스·fixture 추적 원장](2026-11-21-all-functions-source-ledger.json), [CI 스킵 목록](2026-11-21-all-functions-ci-skips.json)을 제공한다.

## 2. 운영 화면 결과

| 구분 | 검사 | 결과 | 해석 |
|---|---:|---:|---|
| 정적 PC |147|오류/차단 화면79, 렌더68|79를 각각 기능 성공으로 셀 수 없다. 403 본문 등 실제 화면 기준이며 모두 앱 코드 오류라는 뜻은 아니다.|
| 정적 모바일 |147|오류/차단 화면79, 렌더68|동일 경로의 모바일 검사다.|
| 관리자 정적 |39|렌더38, `/admin/logs/errors` 오류|38도 업무 기능 완료를 뜻하지 않는다.|
| 별칭 |41|오류5, 나머지36 렌더/리다이렉트|오류: `/admin-preview`, `/admin-preview.html`, `/admin-preview/`, `/admin-preview/index.html`, `/admin.html`. 미공개 preview의 접근 거부는 보안 결함이 아니라 매핑/의도 확인 항목이다.|
| 유효 fixture 동적 패턴 |25|오류21, 상세 대신 홈4|URL만 성공하고 상세 내용이 없는 것도 FAIL_CONTENT_FALLBACK으로 기록했다.|
| 나머지 동적 패턴 |8|BLOCKED_FIXTURE|아래 fixture 원장에 경로별 이유를 남겼다.|

상세 대신 홈이 나온 실제 사례는 `/en/blog`, 공개 블로그 목록에서 클릭 가능한 `/blog/2026-11-17-kr-coding-10-unverified`, 동일 글의 `/en/blog/...`, 실제 QA 회원의 `/admin/users/[id]`다. QA 회원 식별자는 기록하지 않는다. `/stocks/AAA`는 실제 공개 종목으로 시도했지만 오류 화면이었다. 유효 프리셋으로 시도한 복리·주식·대출·세금·청년도약 등 상세도 실패했다. 모든 가능한 entity/preset 조합을 검사했다는 의미는 아니다.

`/account`, `/account/security`, `/bank`, `/work`, `/inventory`, `/stocks/portfolio`, `/stocks/history`, `/shop/catalog`, `/wallet/activity` 등 핵심 경로도 오류/차단 화면이었다. 각 경로 전체 목록과 PC/mobile 결과는 원장에 있다. 사용자 안내가 필요한 정책 차단과 실제 서비스 누락을 구분해 후속 수정해야 한다.

## 3. 11월18일 디자인 일치 여부

원본은 네이비 배경 `#0C1020`, 카드 `#151D32`, 보라 `#9C83FF`, 파랑 `#64B7FF`, 본문 `#E9F1FF`, 보조 글자 `#A8BCD8`, PC 우선 반응형·일관된 브랜드·전역 지원을 요구한다.

| 운영 계열 | 화면 수 | 판정 |
|---|---:|---|
| 통합 네이티브 public/member/admin/auth |26|배경·카드·주요 색상 및 구조가 Nov18 계열인 것은 확인. 전체 디자인/모든 기능 승인 아님.|
| `/shop`, `/stocks`, `/quests`, `/board`, `/status` |5|색상과 틀은 있으나 프로토타입 성격/빈 업무 패널/비작동 모바일 카드. 기능형 완성본과 불일치.|
| 나머지 렌더 화면 |37|구형 Next 및 `/guide` 등 다른 헤더·녹색 강조·브랜드·푸터·내비게이션이 섞임. 통일 실패.|
| 오류/차단 경로 |79|디자인 화면 자체를 검수할 수 없음.|

확정 재현:

1. **UI-01/P1 — 운영 전체 외관 불일치.** `/admin/users`의 새 보라 관제 UI에서 `/admin/shop`, `/admin/security`, `/admin/blog`로 이동하면 구형 관제 UI로 바뀐다. 사용자 영역도 `/tools/compound-calculator`와 `/tools/tax-calculator`, `/privacy`의 헤더·브랜드·내비게이션이 다르다. 단순 색상 변경으로 완료 처리하면 안 된다.
2. **UI-02/P2 — 모바일 관리자 기본 로고 누락.** 새 관리자10개 화면에서 drawer를 닫으면 파비콘 로고가 보이지 않는다. drawer 안에는 로고가 있다. 사용자 신형 헤더에서는 로고가 보인다.
3. **UI-03/P2 — 전역 지원 버튼 하단 간격.** 새26개 화면390px에서 회원16개는 하단 메뉴 위14px, 관리자10개는13px. 명세 최소16px 미달. 이26개에서 가로 overflow는 검출되지 않았다. 다른 뷰포트 전체 통과 증거는 아니다.
4. **UI-04/P1 — 모바일 카드의 거짓 클릭 유도.** 위5개 프로토타입 화면의 첫 화살표 카드를 실제 클릭했지만 pathname 변경/상세 dialog가 없었다. 배경 데이터 로딩으로 본문 길이가 바뀔 수 있어 'DOM 전체 불변'으로 판정하지 않았다. 소스에서도 `.mobile-card-item`은 상세 업무 연결이 없는 div다.
5. **UI-05/P1 — 본문 대신 로딩 잔류.** `/admin/logs`, `/admin/support`, `/admin/help`는 main 제목 없이 skeleton이 남았고, 해당 skeleton 숨김을5초 조건 대기한 뒤에도 지속됐다. `/admin/analytics`는 제목·본문이 있어 장식 pulse까지 전체 로딩 실패로 합치지 않았다. 무한 로딩 여부나 최종 원인은 이5초 증거만으로 단정하지 않는다.
6. **UI-06/P1 — 전역 문의·DM 기능 불균등.** 새26개 지원 패널과 구형 관리자23개 지원 dock은 실제 입력/대화 탭 대신 링크 안내다. 구형 사용자12개는 실제 문의/DM 탭이 존재한다. 전 화면 동일56px 버튼이 있다는 사실로 전역 채팅 완성 판정을 할 수 없다.

현재 공개 `/favicon.ico`는200이며 SHA256 `7c17c9be67fb26d74879b5392423e736ed7079a3c00e5a203adcecddf35fa3d5`. 새 파비콘 PNG와 보관된 공식 아이콘을 직접 열어 왕관·W·월계수·보라 문양이 같은 계열임을 확인했다. ICO/PNG 재인코딩·해상도 차이로 해시가 다르다는 이유만으로 다른 로고라고 하지 않는다. 구형 녹색/별도 아이콘과 모바일 관리자 로고 누락은 별개 문제다.

## 4. 실제로 조작한 결과

| 동작 | 결과 | 인정 범위 |
|---|---|---|
| 복리1000, 월납0, 연10%,2년, 연복리 |1210 일치|순수 산술/실제 GET 계산 버튼|
| 복리1000, 월납100, 이율0%,2년 |3400 일치|0% 경계 산술|
| 복리 초기금액-1 |기존 제출 query 유지, 입력 min=0|브라우저 제출 차단 관찰. validity 메서드는 DOM 도구에 없어 직접 호출 검증 안 됨.|
| 평균단가100×10+200×10, 목표10%,수수료0 |평단150/목표165/수익300 일치|실제 계산 버튼; 실제 매매 아님.|
| 부동산1억, 월세100만, 부채/세금/비용0 |ROE12%,연1200만 일치|가정 산술. 공실·법정 세율·추천 적합성 검증 아님.|
| 세금 도구1000만 매도/500만 매수/손실0 |표시된250만 공제·22% 가정의55만 산술 일치|법률적 정확성 승인 아님. WLD와 법정 통화 세금 혼용 및 '2026/2027 반영' 문구는 별도 검증 필요.|
| 세금 해외주식/배당 탭 |해당 입력 화면 전환|실제 탭 조작; 납세 기능 승인 아님.|
| `/tools`, `/calculators` 불가능 검색어→초기화 |결과 숨김→복원|실제 검색 제출/초기화 링크|
| 관리자 메뉴 검색/분류 |0/35 빈 결과, 보안 분류6/35|메뉴 필터. 메뉴35개가35개 완성 기능이라는 뜻 아님.|
| 회원 불가능 q 검색 |조회 범위 내 일치 회원 없음|초기 테스트가 다른 빈 상태 문구를 기대해 false였으나 실제 q 폼/빈 행으로 재확인하여 수정. 제품 결함으로 세지 않음.|
| 시스템 로그 source/lines/filter |GET query 반영|로그 수집 누락/완전성·내용 진실성까지 승인하지 않음.|
| 문의/쪽지 새로고침 |조회 재시도, 보류 설명 유지|발송/수신/저장/상대방 확인 증거 아님.|
| 지갑 실제 표시 현금+은행=총자산 |BigInt 정수 합계 일치|잔액 값은 비공개. 독립 DB 원장 대사는 아님. 거래10행/내보내기 활성/송금 비활성 상태 관찰.|
| 신형 지원 패널26곳 열기·닫기 |26곳 확인|링크 안내 패널 동작|
| 신형 모바일 메뉴26곳 열기·닫기 |26곳 확인|메뉴 상태만; 전체 반응형 승인 아님.|
| 구형 관리자 dock23곳 열기·닫기 |23곳 확인|실제 panel 요소의 가시성 확인. role=dialog가 없다는 이유만으로 비작동 처리하지 않음.|
| 구형 사용자 채팅12곳 열기→DM→문의→닫기 |12곳 확인|발송 전까지. 운영 실제 메시지 생성 안 함.|
| 구형 same-origin GET 폼 |보안/국고/자금흐름/활동 로그 제출|조회 동작만, 데이터 정확성/보안 정책 변경 승인 아님.|

로그인/가입/복구/삭제의 최종 제출, 실제 송금·주문·구매·발행·배당·제재·역할 변경·보안 rotation·메일/DM 발송은 성공으로 보고하지 않는다. 일부 기능은 소스부터 hold/503/disabled이며, 나머지도 승인된 격리 fixture와 권한·소유자·CSRF·멱등키·원장/감사 영수증·복구 검증이 없어 BLOCKED다. 운영에서 '성공' 버튼만 눌러 데이터 손상을 만들어 검증하지 않는다.

## 5. 기능군별 상태와 누락

| 기능군 | 현재 UI/코드 판단 | 남은 수용 조건 |
|---|---|---|
| 인증·계정 |로그인 UI 존재. 가입/복구/검증/삭제 등 다수 명시적 hold. account 설정 경로 오류.|격리 계정 lifecycle, 메일 확인, 세션/재인증, 실제 변경 영수증.|
| 지갑·송금·내역 |표시 합계/조회 동작 확인. 관찰 세션의 송금 UI는 CSRF/fixture가 확인되지 않아 비활성·미실행. current-main canonical API 구현 여부와 구분. 활동/상세 경로 실패/fixture 부족.|정수38자리·소유자·CSRF·멱등/중복/타인 receipt·실제DB 대사.|
| 상점·인벤토리 |프로토타입 숫자 조회와 안내. 구매/재고/보관함 업무 UI 없음 또는 경로 오류.|상품 식별→구매→영수증→잔고/재고 대사→중복 방지.|
| 주식·포트폴리오 |시장 요약 조회 일부 존재. 유효 종목 상세·포트폴리오·내역·관심/알림 등 다수 오류.|실제 캔들/거래량/주문호가·주문/취소/체결·정수 금액·보유수량·영수증.|
| 일·퀘스트·성장 |`/work` 오류, 퀘스트 모바일 카드 미연결. EngagementService의 진척/claim/vote 일부503.|작업 카탈로그 id→배정→시간/검증→보상→상한·중복·원장 대사.|
| 은행·채권·FX·KDIC·연금 |회원 화면 다수 오류. 관리자 구형 read/hold 혼재.|개설/입출금/만기/이자/대출/환전/보호금 등 개별 계약과 격리DB 영수증.|
| 중앙국고·민트·재정 |구형 UI/보류·소스 허위 성공 위험. 신형 경제는 최신 대사 snapshot 조회.|발행 한도·정책/금고·감사·불변 원장·실패 음성 테스트.|
| 기업·사업·부동산·공간 |신형 기업은 카탈로그 조회. 회원 사업/공간 경로 오류.|소유권·매입/수익/배당·임대·해지·사적 공간 권한.|
| 카지노·오락·예측·시즌 |경로 오류 또는 비활성. CI 카지노 e2e29건 skip.|기획의 활성 전제와 분포/법무 gate. 비활성을 정상 플레이로 세지 않음.|
| 커뮤니티·클럽·갤러리·공지 |board 틀만 있고 작성/댓글 흐름 미연결. 여러 목록 오류/상세 fixture 부족.|공개/본인/타인/관리자 CRUD·신고·업로드·페이지네이션/삭제 복구.|
| 문의·DM·지원 |탭 UI와 안내/새로고침 확인. 신형 전역 입력 부재. 관리자 inbox 로딩.|owner/non-owner, CSRF, 같은 intent/key retry, 실제 저장/상대편 수신/중복 방지.|
| 금융 도구 |기본 복리·평단, 구형 부동산·세금 일부 산술 확인. 다른 다수 기본/프리셋 경로 오류.|각 계산식/경계값/통화·단위·법정 기준/가정 분리·본문5언어.|
| 안내·약관·개인정보·블로그·SEO |구형/정적/상세 fallback 혼재. 언어 선택과 본문 미번역.|정확한 entity·canonical·법률/연도 문구·실데이터 출처·번역 교열.|
| 게임서버 상태·Discord·알림 |상태 프로토타입이며 UI만으로 실서비스 전체 증명 불가.|수집 최신성·장애/복구·전달 영수증·실제 관리 기능.|

새 통합 frontend는 `UnifiedFrontendApplication`의 DB 없는 presentation 조합이다. `UnifiedFrontendApplication.java:31–49`의 read allowlist는 지갑·지원·채팅 중심이며 (`MemberPresentationPageController`는 해당 페이지를 매핑한다), board/shop/stocks/work/quests 전체 업무 기능을 가져오지 않는다. 백엔드에 endpoint가 남아 있다는 사실은 프론트엔드의 기능 연결 증거가 아니다.

관리자 신형10개: `/admin`, `/admin/users`, `/admin/economy`, `/admin/economy/scenario-lab`, `/admin/market`, `/admin/enterprises`, `/admin/controls`, `/admin/logs/system`, `/admin/logs/delivery`, `/admin/api-health`. 이들은 주로 읽기 기능이다. 회원 검색은 최대200개 조회 결과 부분집합 검색이고 전체 검색이 아니다. 회원 상세 링크/제재·조정 UI가 없고, controls는 제어가 아닌 조회다. scenario-lab는 시뮬레이션 엔진이 아닌 대사 snapshot임을 직접 밝힌다. API-health는4개 조회 원천 점검이며 로그인·DB·메시징·전체 endpoint 건강을 보장하지 않는다. delivery는 제한된 최근 outbox 표본이며 전체 전달률/전달 성공 증명과 다르다.

세부 제한도 남는다. `SupportService`의 목록은 최대50/대화500/summary 최근100, `WalletService`의 내역·export는 최신10건 범위다. 따라서 export 활성만으로 전체 원장 다운로드를 지원한다고 하지 않는다. `templates/mv43/chat.html:16`은 새 대화/보관/음소거/차단·해제/신고/업로드를 disabled로 두고 기존 대화 답장만 대상으로 한다. `ShopService.java:147–154`의 crafting recipe/write는503, `BoardController.java:58–61`의 주식 태그/non-general 작성은422 hold다. 이 항목들도 기능군 이름에 묻혀 정상 처리하지 않는다.

## 6. 최신 소스에서 발견한 백엔드 결함

다음은 current-main 소스 확인 결과다. 운영에서 해당 mutation을 실행하거나 취약점을 악용한 결과가 아니다. 현재 혼합 runtime에 어느 handler가 연결되는지는 별도 검증이 필요하다. 파일은 `spring-backend/src/main/java/com/moneyverse/api/domain/` 기준이다.

| ID/우선순위 | 위치 | 결함과 재현 조건 | 요구 수정/검증 |
|---|---|---|---|
| BE-01/P1 |`shop/controller/AdminShopController.java:70–111`|상품 생성/수정/삭제에서 실제 저장 없이 성공 응답 형태 반환.|canonical 함수·receipt와 재조회 일치; 실패를 성공으로 숨기지 않기.|
| BE-02/P1 |`help/controller/AdminHelpController.java:34–42`, `editorial/controller/BlogVerifiedAdminController.java:34–42`|실제 문서 저장 없이 success/id 반환 가능.|저장·발행·재조회 및 실패 테스트.|
| BE-03/P1 |`admin/controller/OperationsController.java:54–81`|작업 실행/점검 요청을 실제 실행·저장 없이 성공으로 표현.|job receipt/실행 결과·실패 전달.|
| BE-04/P1 |`treasury/service/TreasuryService.java:155–171`|procedure 실패 catch 후 정책 결과 SUCCESS 반환.|오류 전파와 격리DB rollback·audit 검증. mint/salary의503 경로와 구분.|
| BE-05/P1 |`identity/controller/AccountController.java:128`, `:142–145`, `:70–75`|unlink 저장 없음. 삭제는 세션/로컬 credential만 처리하고 전체 계정 삭제 성공 표현. 일부 테이블 직접 쓰기는 function-only 경계와 불일치.|canonical lifecycle/원자성/재인증/consent/실제DB 권한 검사. 운영 삭제는 실행하지 않음.|
| BE-06/P0 조사 |`identity/controller/AdminSecurityController.java:48–67`, `:117–158`|현재 시각/active=true로 보안 상태 구성. rotation이 reauthenticated_at 갱신, 실패를 삼킨 뒤 success cookie 응답 가능. migration246의 기존 재인증 시각 보존 계약과 충돌.|보안 변경 허위 성공 제거; 실제 세션/재인증 상태·오류 rollback·역할/CSRF/최근 인증 음성 테스트. 운영 취약점 확정/실행 아님.|
| BE-07/P1 |동일 파일`:191–202`|대상 회원 세션을 revoke하지 않고 호출자 cookie만 지운 뒤 강제 로그아웃 성공 표현.|대상 지정/권한/실제 revoke/감사 확인.|
| BE-08/P1 |`admin/controller/StorageHeadroomController.java:14–19,42–64`|Next는 `/api/v1/admin/operations/storage`를 기대하나 Spring 경로가 다름. headroom 수치에 상수 포함.|경로/응답 계약 일치, 실제 호스트 출처와 unavailable 상태.|
| BE-09/P1 |`bond/controller/AdminBondController.java:28–44,79–83`, `admin/controller/AuditController.java:203–215`, `seo/controller/SeoController.java:245–253`|실패 후 고정 합계/빈 결과, 검증 없는 constant empty, 실제 제출 없이 제출 수 echo 등.|실측/검증 불가/빈 데이터 구분; 외부 제출·DB의 실제 영수증.|
| BE-10/P0 조사 |`identity/service/UserAuthService.java:37–38`|내부 자격정보 설정에 비어 있지 않은 하드코딩 fallback이 존재. 값은 재현/인용하지 않음. 런타임 사용 여부 미확인.|필수 환경 설정의 fail-closed 검증; fallback 제거와 배포 환경 존재 확인. 임의 rotation 금지.|

**POLICY_CONFLICT:** 사용자가 제공한 AGENTS의 관리자2차 인증/최근 재인증 요구와 최신 문서/`197-retire-admin-second-factor.sql`의 TOTP 폐기 방침이 충돌한다. migration246은 entry rotation 시 기존 reauthentication 시각을 보존한다. 외부 AdminApiBoundaryFilter의 실제DB 관리자+CSRF 검사는 별개이며 '최근 인증'을 대신하지 않는다. 이 충돌을 hold 우회나 자동 보안 약화 허가로 해석하지 않았다. 어느 정책이 승인 권위인지 정리하고 동일 계약으로 음성 테스트해야 한다.

## 7. 언어·문구·숫자 검증의 한계

- 신형26개에서 EN/JA/ZH/VI/KO 선택130건을 실제 조작했다. root lang/제목 전환과 overflow를 확인했다. 모든 본문/빈 상태/오류/동적 데이터/스크린리더 문장 번역 완료 판정은 아니다.
- 구형6개 초기 선택22건, 별도 조건 대기를 둔5개 재검증13건에서 클릭 무반응/메뉴 조작 실패·lang 되돌림·비한국어 상태에서도 한국어 제목/본문 유지가 관찰됐다. 초기 비동기 snapshot만으로 모든 선택을 영구 실패로 세지 않았다. 부분 실행이며 나머지 구형 화면×언어 조합은 NOT_RUN/BLOCKED_I18N_STABILITY다.
- 정적 JS의 두 엔진은 각각 `mv_lang`, `wdmv_locale`를 사용하며 Next locale-provider도 html lang을 변경한다. 충돌 가능한 다중 권위의 소스 증거다. 특정 실패의 단일 근본 원인을 완전히 입증했다는 뜻은 아니다.
- delivery의 namespace 형태 문자열5건은 heuristic 후보이며 실제 event 이름일 수 있다. raw translation key 확정 결함으로 세지 않았다.
- WLD는 게임 재화다. 세금 도구가 원/WLD를 혼용하고 '현행/2026/2027 개정 반영', 부동산 도구가 가정만으로 '안정적인 순수익'을 단정하는 문구는 검토가 필요하다. 이번 감사는 현재 법령/세법 적용 정확성이나 투자 추천을 인증하지 않는다. 운영 금액은 Number로 변환하지 않았다.

## 8. 런타임·CI·릴리스 상태

- 새26개 presentation의 local version id는 `e45f57595415f132eedf36c13748564b93a1d918`; 수정5개 prototype의 source header는 `8ba9139b2fcd577253ee83a24040091be218d64b`. current-main과 동일한 단일 앱 전체 배포라고 볼 수 없다.
- 공개 `/api/version`은 이번 확인에서503, `/api/v1/stocks`는200. version503만으로 사이트 전체 down이라 하지 않고, stocks200만으로 전체 기능 정상이라 하지 않는다.
- 공통 `/js/mv-floating-chat.js`는 최신 소스3621bytes와 실제 운영10680bytes가 다르다. source SHA256 `a1b9a713070811459ad58d8b1d020a7feaf43da4dadd93d8865b27037fa88154`, live `5846ac7b0cc98280359994957a768130ad233eda3600dccde798f881970c3a81`. live에는 DM/문의 탭과 송신 handler가 남고 소스는 링크 안내다. 다른 두 i18n 파일은 일치했다. 기본 urllib 요청403이 있었으나 정상 browser-context 헤더와 loopback은200이어서 이를 자산 outage로 보고하지 않는다.
- 이번 세션 MiniPC: `node --test scripts/native-*.test.mjs scripts/admin-tools.test.mjs` **332 pass/0 fail/0 skip**. VM/DOM/static 계약 검사이며 PostgreSQL·운영 사용자 여정 전수 증거가 아니다.
- 별도 source review focused Node는 회원63건+관리자4건이 pass였으나 위332건과 중복될 수 있어 합산하지 않는다.
- [CI44892088811](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/44892088811)는 application source `37053df900b86d6f7ff5e0f3275cd1454dae715b`에서 runtime/spring 성공. contract41, database package94, backend3668, frontend3084 pass. Backend **117개 테스트 skip**, 전체 파일36개+부분 파일1개다. 별도 네이티브 PostgreSQL messaging9건은0fail/error/skip. 일반 Spring test는 H2/mock/synthetic upstream이며 PostgreSQL tag를 제외한다. 수천 개 green만으로 모든 운영DB 테스트가 실행됐다고 하지 않는다.
- [Production build44893099874](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/44893099874)는 exact-main runtime CI가 skipped여서 prepare에서 BLOCKED, build/test-gate는 skipped. 과거 다른 SHA green으로 대체하지 않았으며 gate를 약화하거나 재배포하지 않았다.

## 9. 수정 우선순위와 재검증 조건

1. P0 조사: 관리자 reauth/rotation 허위 성공·내부 자격정보 fallback의 실제 runtime 경로와 정책 충돌을 비파괴적으로 확정한다. 임의 세션/키 rotation이나 보안 hold 우회 금지.
2. P1: 상세 경로의 홈 fallback·79개 오류/차단 매핑·3개 skeleton 본문 문제를 먼저 해결한다. root proxy 전환 후 모든 실제 entity route와 권한 음성 결과를 검사해야 한다.
3. P1: 관리자 상점/문서/작업/정책/강제 로그아웃 등의 허위 성공을 제거한다. canonical DB 함수와 실패/owner/CSRF/idempotency/실제 영수증 테스트를 같은 변경에 묶는다.
4. P1: 관리자와 회원 공통 shell·현재 favicon 로고·다국어 권위를 하나로 정리하되, 실제 기능이 빠지는 단순 화면 교체를 금지한다.
5. P1: 각 기능군의 승인된 격리 fixture를 만든 후 거래·관리 변경을 끝까지 검사한다. read와 write뿐 아니라 사용자가 id를 얻는 목록/상세 경로도 포함한다.
6. P2: 모바일 로고/최소16px 간격/44px 조작부/키보드와 focus·200% zoom·8개뷰포트·실기기·문장별5언어를 재검증한다.

현재 산출물은 **실제 검사한 범위와 실패·차단·미실행을 남긴 감사 결과**다. 모든 기능의 양성/음성 여정·실제DB·다국어·접근성 QA가 끝났거나, 모든 결함을 해결했거나, 운영 승격이 승인/완료됐다는 문서가 아니다.

## 10. 문서 검증·검토 기록

두 독립 source review(admin/CI, member)를 거쳐 alias 전체 경로·read allowlist 주체·관찰 송금 UI와 canonical API 구현 구분·제한된 history/disabled 기능을 보완했다. 현행 문서 security/control-byte/classifier tests32 pass/0fail/0skip, repository secret/control-byte scan 및 QA JSON/identifier check 성공. [감사 PR #3341](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3341)의 e33b6971 checkpoint CI44899027820는 classify/policy 성공, runtime/spring skip(DOCS_ONLY)이었다. 최종head 검사/병합 결과는 해당PR에서 확인한다. 앱/DB/운영 설정 변경과 배포는 없다.
