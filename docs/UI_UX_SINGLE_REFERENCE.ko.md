# UI/UX 통합 기준 — 현재 사이트 파비콘/로고 및 결함 원장

> **Current rules — v2026.11.27.PLAN-AUDIT.2:** [EN authority](DOCUMENT_AUTHORITY.md) / [한국어](DOCUMENT_AUTHORITY.ko.md). Owner-approved target: Next.js/React frontend + same-origin BFF + authoritative Spring API; G2 design per CURRENT_UI_DESIGN and actual favicon; administrator access denied to guests and non-admins. Automatic image preparation is allowed; actual Production cutover needs separate approval after independent Test. Dated technology/runtime claims below are historical snapshots; business/security requirements retain their adopted scope. No whole-site implementation or runtime acceptance is implied.


> **현행 기준 v2026.11.27.PLAN-AUDIT.2:** [G2 단일 디자인](design/CURRENT_UI_DESIGN.ko.md) · [180경로 매니페스트](design/CURRENT_UI_DESIGN_MANIFEST.json). 관리자 접근 서버 차단. 모든 구 시안은 이력 전용.

> **과거 v2026.11.23.10:** 180개 신규 시안 전수 파일 검사 통과, 블로그 상세·은행·관리자 등 화면 구조 수정. [신규 시안 갤러리](design/game-ui-v2026.11.23.10/README.ko.md) 및 [기능/이미지 QA](qa/2026-11-23-game-ui-180-image-feature-audit.ko.md). 180개 기능 실제 정상 여부와 Test/운영 승격은 미검증. v8 원본 시안은 보존.

> **과거 통합 작업 v2026.11.23.9:** 이 문서는 실제 게임형 신규 PNG 180개 / 기존 11월18일 원본 180개 / UI 구현 코드 후보 / 파비콘 로고 / 관리자 전용 메뉴 / 서버 게임시간 / 은행·실데이터·다국어·QA 지침을 한곳에서 확인하는 단일 기준서다. **이미지 180/180 GitHub에 실제 등록, 디자인 최종 승인/전체 페이지 프론트 구현/독립 Test/운영 승격은 미완료**. 이전 NOT_STARTED 단락은 시점별 기록이며 최신 진행 상태는 이 문단과 하단 목록을 따른다.


> v2026.11.23.5 · PLANNING / QA OPEN · [English](UI_UX_SINGLE_REFERENCE.md) · 기준 main `9876c09888ec84034eec183cf1309c85df3d7447`

## 최우선 사용자 지시 (로고)
**현재 사이트에서 쓰는 파비콘이 곧 공식 로고다.** 단순 W 문자 그림·새 왕관/월계수 생성형 엠블럼을 로고로 대체하지 않는다. 단일 정본 파일은 `spring-backend/src/main/resources/static/assets/mv39/favicon.ico` (검증 Git blob `c102a9b1fe85e2d476e00eb82387f97dabb17cc0`). 동일 자산을 브라우저 탭, PC·모바일 사이드바/헤더, 홈 히어로, 관리자 화면에 사용하며 형태·색·비율을 임의로 다시 그리지 않는다. 이미지 시안 생성 시 이 파일의 **실제 픽셀** 사용이 확인되지 않으면 로고가 정확하다고 주장하거나 승인 시안으로 사용하지 않는다.

## 사용자 노출과 권한
**관리자 메뉴는 권한이 검증된 관리자만 볼 수 있다.** 비회원과 일반 회원에게는 PC 사이드바, 모바일 내비게이션/드로어, 빠른 실행, 검색 결과, 홈 카드 어디에도 관리자 메뉴를 렌더링하지 않는다. 단순 CSS 숨김이 아니라 서버 신원·역할에 따른 메뉴 출력과 별도 API/라우트 RBAC를 모두 강제한다. 인증 대기 중에는 관리자 항목을 보이지 않게 한다. 관리자는 정상 표시된다.

## 승인된 시각 원칙
현행 시각 기준은 [G2](design/CURRENT_UI_DESIGN.ko.md)만 적용한다. [기존 기능·다국어·채팅 조건](planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md)은 유지하며 관리자 접근을 서버에서 차단한다. 모든 수치는 실제 API 또는 명시된 예시 상태로 구분한다.

## 발견된 문제 · 통합 결함
| ID | 문제 및 실제 확인 범위 | 완료 조건 |
| --- | --- | --- |
| UI-01 | 전체 홈/회원/관리자 화면이 단순 카드와 보라색만 공유, 승인 11/18 게임형 디자인과 레이아웃/세계관 불일치 | 원본 PNG와 PC·모바일 시각/기능 diff |
| UI-02 | 이전 이미지/코드의 실제 로고 대신 생성형 W/왕관 로고 사용 | 동일 파비콘 바이너리 참조, 모든 화면/브라우저 테스트 |
| UI-03 | `Translation unavailable` 메뉴 문구, 언어 혼합 | 전체 5언어 키·오류 상태 검사 |
| UI-04 | 관리자 메뉴 공개·중복 위험 | 관리자만 화면 출력, 비회원/일반회원 DOM·검색까지 미출력 |
| UI-05 | 은행 입출금 입력·버튼 간격·브라우저 기본 오류 UI·성공 메시지 산만함 | 필드별 오류/44px 터치/실제 서버 영수증 |
| UI-06 | 일 기준 금리·연 기준 수익률과 복리/지급 기준 혼동 | 실제 API의 `daily_interest_rate_pct` 및 `annual_yield_pct` 별도 표시; 임의 환산 금지 |
| UI-07 | 서버 시간 미표시 및 현실시간 혼동 | [게임 시계 기획](planning/SERVER_GAME_CLOCK_SPEC.ko.md): 현실 10분=서버1일, 서버7일=서버1주; 실제 현재값은 DB/API 검증 후 표기 |
| UI-08 | Spring 게임 시계의 DB 실패시 합성 성공 응답 | `GameClockService` 실패를 정상으로 반환하지 않도록 별도 백엔드 P0 조치 |
| UI-09 | 주식·퀘스트·은행·관리자 일부 화면의 실제 데이터/기능 미완료와 과거 403·오류 | 권한별 실제 API·원장·상태 QA |
| UI-10 | 잦은 팝업·깜빡임·실시간 갱신 산만함 | 제자리 부분 갱신·재연결·에러·접근성 검증 |
| UI-11 | 약관/개인정보처리방침·Google/Discord 로그인·파비콘/관리자 메뉴 회귀 | 경로별 기능/정책/인증 E2E |

## 이미지 관련 중대 주의
이전 GPT가 생성한 개선 이미지들에 등장한 로고는 **실제 파비콘과 일치함이 검증되지 않았으므로 브랜딩 불합격**이다. 게임 일차, 계정 잔액, 레벨, 수익률 및 게임 1년=365일 등의 수치 역시 근거 없는 가상 데이터일 수 있으므로 사이트에 그대로 사용하지 않는다. 기존 사용자 캡처 2건은 문제 발견 자료로만 사용; GitHub에 바이너리를 업로드했다고 주장하지 않는다.

## GPT 오류 / 수정 이력
1. 사용자 지시를 여러 차례 확인했음에도 실제 파비콘을 정본으로 사용하지 않고 임의 로고를 만들었다.
2. 정적 `bank.html` 수정과 실제 입출금 실행 화면을 혼동할 수 있게 설명했다.
3. 이전 UI 단일문서 PR #3393은 **미병합·닫힘**이었는데 그 브랜치 링크를 안내하여 404가 발생했다. 이제 새 브랜치/PR로 이 문서를 재구축한다.
4. [홈 수정 PR #3395](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3395)에서 잘못된 `woldeok-official-icon.png` 참조를 기존 `favicon.ico`로 교체했다. 이 변경은 **코드 후보일 뿐 실제 서버 검증/운영승격이 아니다.**

## 품질 게이트
정확한 메인 SHA 재조회 → 현행 G2 디자인·실제 파비콘 비교 → 별도 PR → UI 경로×역할×5언어×PC/모바일 QA → 실제 API·금융/보안 검증 → 독립 Test → 승인된 무중단 운영승격 및 롤백 증거. 운영·금융·권한 코드는 이번 문서 변경으로 수정하지 않는다. 기존 기획/작업로그/QA 및 출시 기록은 보존한다.


## 11. 사용자 추가 지시 — 예시 디자인 이미지 180개 교체 및 통합 (v2026.11.23.7)

**과거 v2026.11.23.7 시점 요청 기록(현행 지시 아님).** 기존 예시 PNG의 링크만 연결하는 작업으로 끝내지 말고, 11월18일 원본 시안을 근거로 **홈·관리자·금융·게임·로그인·회원·커뮤니티·정책·도구를 포함한 전체 180개 페이지의 새 게임형 예시 이미지**를 실제로 제작·검토·교체 대상으로 관리한다. 기존 이미지 원본은 삭제/덮어쓰기하지 않고 11월18일 기록용 보관 갤러리에 보존하고, 승인된 새 PNG는 버전별 별도 디렉터리(예: `docs/design/game-ui-v2026.11.23.7/previews/`)에 저장한다. **당시에는 비교 링크를 요구했으나 지금 현행 인덱스는 v10만 표시**해야 한다. 이 회차에서 새 PNG를 만들거나 교체했다고 주장하지 않는다.

필수 이미지 규칙:
1. **진짜 현재 로고 파일** `/assets/mv39/favicon.ico`를 추출해 실제 픽셀 그대로 삽입. 임의의 W/왕관/월계수 그림, 생성형 유사 로고는 불합격.
2. 게임형 시각 요소는 기획/실제 기능에 근거한 것만 표시. 임의 레벨·보상·잔액·호가·은행 금리·프로필·게임 연도는 **가상 시안**임을 명확히 표시하고 실데이터로 오인되게 하지 않음.
3. **관리자 화면 이미지의 관리자 메뉴는 관리자 역할 시안에서만 보임.** 게스트·회원용 PC/mobile 시안에는 관리자 항목을 아예 넣지 않음. 실제 구현에서는 서버 RBAC와 렌더링 검증도 별도 필수.
4. 게임 시계 영역을 사용 목적에 맞게 삽입: `현실 10분 = 서버 1일`, `서버 7일 = 서버 1주`는 기획상 비율이며 실제 현재 서버 날짜/주차/상태는 확인된 DB 응답 없이는 표기 금지. 금융 이자 및 보안 시간을 서버 게임 시계로 환산 금지.
5. PC·모바일을 각각 판독 가능한 시안으로 작성하고, 화면별 5언어·반응형·접근성·실제 동작/정보 구조 QA를 붙임. 단순 색상 치환·유사 화면 대량 복제는 불합격.

각 시안 인벤토리에 `route / original_png / proposed_png / brand_check / game_clock_check / role_visibility_check / visual_diff / status / reviewer / approved_sha`를 기록하고 `PLANNED → GENERATED → REVIEWED → APPROVED → IMPLEMENTED → TEST_VERIFIED` 순으로 진척을 관리한다. **승인된 예시 이미지를 실제 프론트엔드로 구현하는 것은 별도 작업**이다.

[180개 원본 전체 목록](design/all-pages-v2026.11.18.12/README.md) · [180개 수정·검증 매트릭스 PR #3397](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3397) · [통합 문서 PR #3396](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3396).

## 보관 전용: v2026.11.23.8 이미지 생성 이력

[구버전 v8 기록용 갤러리](design/game-ui-v2026.11.23.8/README.ko.md)는 당시 시안 180개를 보존하며 **새 구현·대체 시안에 사용 금지**. 현재 favicon 원본 픽셀 삽입, 관리자 전용 메뉴 구분. 180개 이미지가 실제로 생성되었지만 상태는 GENERATED_NOT_APPROVED이며 개별 디자인 검토/실서비스 기능 QA 미완료.


## 12. 현행 G2 180경로 시안 목록

- G2 180개 실제 PNG, 1680×1000. 유형 기반 PC/모바일 예시이며 개별 기능·미술·런타임 검증 미완료. 구 시안은 이력 보존. 관리자 화면은 관리자 전용.

| 화면 경로 | 페이지 | 분류 | 현행 G2 PNG | 단계 |
| --- | --- | --- | --- | --- |
| / | 홈 대시보드 | home | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/home.png) | REFERENCE_ONLY_QA_OPEN |
| /[locale]/blog | 블로그 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/-locale--blog.png) | REFERENCE_ONLY_QA_OPEN |
| /[locale]/blog/[slug] | 블로그 · 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/-locale--blog--slug-.png) | REFERENCE_ONLY_QA_OPEN |
| /[locale]/guide/glossary | 가이드 · 용어사전 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/-locale--guide-glossary.png) | REFERENCE_ONLY_QA_OPEN |
| /[locale]/guide/glossary/[term] | 가이드 · 용어사전 · 용어 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/-locale--guide-glossary--term-.png) | REFERENCE_ONLY_QA_OPEN |
| /[locale]/tools/compound-interest-calculator | 금융 도구 · 복리 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/-locale--tools-compound-interest-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /[locale]/tools/compound-interest-calculator/[preset] | 금융 도구 · 복리 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/-locale--tools-compound-interest-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /account | 계정 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/account.png) | REFERENCE_ONLY_QA_OPEN |
| /account-deletion | 계정 삭제 | legal | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/account-deletion.png) | REFERENCE_ONLY_QA_OPEN |
| /account/notifications | 계정 · 알림 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/account-notifications.png) | REFERENCE_ONLY_QA_OPEN |
| /account/privacy | 계정 · 개인정보 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/account-privacy.png) | REFERENCE_ONLY_QA_OPEN |
| /account/security | 계정 · 보안 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/account-security.png) | REFERENCE_ONLY_QA_OPEN |
| /admin | 관리자 대시보드 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/analytics | 관리자 · 분석 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-analytics.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/api-health | 관리자 · API 상태 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-api-health.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/bank | 관리자 · 은행 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-bank.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/blog | 관리자 · 블로그 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-blog.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/bonds | 관리자 · 국채 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-bonds.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/catalog | 관리자 · 카탈로그 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-catalog.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/central-bank | 관리자 · 중앙은행 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-central-bank.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/content | 관리자 · 콘텐츠 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-content.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/controls | 관리자 · 기능 제어 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-controls.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/discord | 관리자 · 디스코드 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-discord.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/economy | 관리자 · 경제 운영 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-economy.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/economy/scenario-lab | 관리자 · 경제 운영 · 경제 시나리오 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-economy-scenario-lab.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/enterprises | 관리자 · 국영기업 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-enterprises.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/fx | 관리자 · 외환 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-fx.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/help | 관리자 · 도움말 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-help.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/kdic | 관리자 · 예금보험 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-kdic.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/logs | 관리자 · 로그 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-logs.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/logs/activity | 관리자 · 로그 · 활동 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-logs-activity.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/logs/delivery | 관리자 · 로그 · 전송 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-logs-delivery.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/logs/errors | 관리자 · 로그 · 오류 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-logs-errors.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/logs/integrity | 관리자 · 로그 · 무결성 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-logs-integrity.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/logs/system | 관리자 · 로그 · 시스템 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-logs-system.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/market | 관리자 · 시장 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-market.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/market/ai-news | 관리자 · 시장 · AI 뉴스 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-market-ai-news.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/mint | 관리자 · 조폐국 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-mint.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/money-flow | 관리자 · 자금 흐름 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-money-flow.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/operations/storage | 관리자 · 운영 · 저장소 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-operations-storage.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/pension | 관리자 · 연금 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-pension.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/safety | 관리자 · 안전 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-safety.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/security | 관리자 · 보안 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-security.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/seo | 관리자 · 검색 최적화 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-seo.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/seo-audit | 관리자 · SEO 감사 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-seo-audit.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/shop | 관리자 · 상점 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-shop.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/support | 관리자 · 고객지원 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-support.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/treasury | 관리자 · 국고 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-treasury.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/treasury/grants | 관리자 · 국고 · 지원금 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-treasury-grants.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/users | 관리자 · 회원 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-users.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/users/[id] | 관리자 · 회원 · 상세 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-users--id-.png) | REFERENCE_ONLY_QA_OPEN |
| /admin/work | 관리자 · 직업 | admin | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/admin-work.png) | REFERENCE_ONLY_QA_OPEN |
| /advisor | 자산 가이드 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/advisor.png) | REFERENCE_ONLY_QA_OPEN |
| /announcements | 공지사항 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/announcements.png) | REFERENCE_ONLY_QA_OPEN |
| /announcements/[announcementId] | 공지사항 · 공지 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/announcements--announcementId-.png) | REFERENCE_ONLY_QA_OPEN |
| /arcade | 아케이드 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/arcade.png) | REFERENCE_ONLY_QA_OPEN |
| /bank | 은행 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/bank.png) | REFERENCE_ONLY_QA_OPEN |
| /bank/savings-pot | 은행 · 적금 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/bank-savings-pot.png) | REFERENCE_ONLY_QA_OPEN |
| /blog | 블로그 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/blog.png) | REFERENCE_ONLY_QA_OPEN |
| /blog/[slug] | 블로그 · 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/blog--slug-.png) | REFERENCE_ONLY_QA_OPEN |
| /board | 게시판 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/board.png) | REFERENCE_ONLY_QA_OPEN |
| /board/[postId] | 게시판 · 게시글 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/board--postId-.png) | REFERENCE_ONLY_QA_OPEN |
| /bonds | 국채 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/bonds.png) | REFERENCE_ONLY_QA_OPEN |
| /businesses | 사업 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/businesses.png) | REFERENCE_ONLY_QA_OPEN |
| /businesses/ventures | 사업 · 스타트업 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/businesses-ventures.png) | REFERENCE_ONLY_QA_OPEN |
| /calculators | 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/calculators.png) | REFERENCE_ONLY_QA_OPEN |
| /calendar | 일정 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/calendar.png) | REFERENCE_ONLY_QA_OPEN |
| /casino | 카지노 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/casino.png) | REFERENCE_ONLY_QA_OPEN |
| /central-bank | 중앙은행 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/central-bank.png) | REFERENCE_ONLY_QA_OPEN |
| /chat | 채팅 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/chat.png) | REFERENCE_ONLY_QA_OPEN |
| /clubs | 클럽 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/clubs.png) | REFERENCE_ONLY_QA_OPEN |
| /clubs/[clubId] | 클럽 · 클럽 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/clubs--clubId-.png) | REFERENCE_ONLY_QA_OPEN |
| /clubs/[clubId]/members | 클럽 · 클럽 상세 · 멤버 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/clubs--clubId--members.png) | REFERENCE_ONLY_QA_OPEN |
| /clubs/new | 클럽 · 신규 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/clubs-new.png) | REFERENCE_ONLY_QA_OPEN |
| /clubs/warfare | 클럽 · 클럽전 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/clubs-warfare.png) | REFERENCE_ONLY_QA_OPEN |
| /collections | 컬렉션 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/collections.png) | REFERENCE_ONLY_QA_OPEN |
| /dashboard | 대시보드 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/dashboard.png) | REFERENCE_ONLY_QA_OPEN |
| /data-deletion | 데이터 삭제 | legal | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/data-deletion.png) | REFERENCE_ONLY_QA_OPEN |
| /design-preview | 디자인 미리보기 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/design-preview.png) | REFERENCE_ONLY_QA_OPEN |
| /developer | 개발자 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/developer.png) | REFERENCE_ONLY_QA_OPEN |
| /enterprises | 국영기업 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/enterprises.png) | REFERENCE_ONLY_QA_OPEN |
| /features | 기능 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/features.png) | REFERENCE_ONLY_QA_OPEN |
| /forgot-password | 비밀번호 찾기 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/forgot-password.png) | REFERENCE_ONLY_QA_OPEN |
| /fx | 외환 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/fx.png) | REFERENCE_ONLY_QA_OPEN |
| /gallery | 갤러리 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/gallery.png) | REFERENCE_ONLY_QA_OPEN |
| /gallery/[photoId] | 갤러리 · 사진 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/gallery--photoId-.png) | REFERENCE_ONLY_QA_OPEN |
| /gallery/submit | 갤러리 · 등록 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/gallery-submit.png) | REFERENCE_ONLY_QA_OPEN |
| /guide | 가이드 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide.png) | REFERENCE_ONLY_QA_OPEN |
| /guide/career-mastery | 가이드 · 직업 숙련 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide-career-mastery.png) | REFERENCE_ONLY_QA_OPEN |
| /guide/dopamine-system | 가이드 · 성장 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide-dopamine-system.png) | REFERENCE_ONLY_QA_OPEN |
| /guide/glossary | 가이드 · 용어사전 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide-glossary.png) | REFERENCE_ONLY_QA_OPEN |
| /guide/glossary/[term] | 가이드 · 용어사전 · 용어 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide-glossary--term-.png) | REFERENCE_ONLY_QA_OPEN |
| /guide/stock-trading | 가이드 · 주식 거래 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide-stock-trading.png) | REFERENCE_ONLY_QA_OPEN |
| /guide/virtual-banking | 가이드 · 가상 은행 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/guide-virtual-banking.png) | REFERENCE_ONLY_QA_OPEN |
| /help | 도움말 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/help.png) | REFERENCE_ONLY_QA_OPEN |
| /help/[slug] | 도움말 · 상세 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/help--slug-.png) | REFERENCE_ONLY_QA_OPEN |
| /inventory | 보관함 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/inventory.png) | REFERENCE_ONLY_QA_OPEN |
| /invite/[code] | 초대 · 초대 링크 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/invite--code-.png) | REFERENCE_ONLY_QA_OPEN |
| /kdic | 예금보험 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/kdic.png) | REFERENCE_ONLY_QA_OPEN |
| /lobby | 로비 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/lobby.png) | REFERENCE_ONLY_QA_OPEN |
| /login | 로그인 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/login.png) | REFERENCE_ONLY_QA_OPEN |
| /login/providers | 로그인 · 소셜 인증 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/login-providers.png) | REFERENCE_ONLY_QA_OPEN |
| /marketplace | 마켓 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/marketplace.png) | REFERENCE_ONLY_QA_OPEN |
| /marketplace/auction | 마켓 · 경매 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/marketplace-auction.png) | REFERENCE_ONLY_QA_OPEN |
| /mint | 조폐국 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/mint.png) | REFERENCE_ONLY_QA_OPEN |
| /newspaper | 신문 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/newspaper.png) | REFERENCE_ONLY_QA_OPEN |
| /pension | 연금 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/pension.png) | REFERENCE_ONLY_QA_OPEN |
| /prediction | 예측 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/prediction.png) | REFERENCE_ONLY_QA_OPEN |
| /privacy | 개인정보 | legal | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/privacy.png) | REFERENCE_ONLY_QA_OPEN |
| /profile | 프로필 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/profile.png) | REFERENCE_ONLY_QA_OPEN |
| /profile/[userId] | 프로필 · 사용자 상세 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/profile--userId-.png) | REFERENCE_ONLY_QA_OPEN |
| /profile/settings | 프로필 · 설정 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/profile-settings.png) | REFERENCE_ONLY_QA_OPEN |
| /progression | 성장 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/progression.png) | REFERENCE_ONLY_QA_OPEN |
| /progression/prestige | 성장 · 명성 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/progression-prestige.png) | REFERENCE_ONLY_QA_OPEN |
| /quests | 퀘스트 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/quests.png) | REFERENCE_ONLY_QA_OPEN |
| /register | 회원가입 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/register.png) | REFERENCE_ONLY_QA_OPEN |
| /reset-password | 비밀번호 재설정 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/reset-password.png) | REFERENCE_ONLY_QA_OPEN |
| /roadmap | 로드맵 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/roadmap.png) | REFERENCE_ONLY_QA_OPEN |
| /safety | 안전 | legal | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/safety.png) | REFERENCE_ONLY_QA_OPEN |
| /safety/takedown | 안전 · 게시 중단 | legal | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/safety-takedown.png) | REFERENCE_ONLY_QA_OPEN |
| /search | 검색 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/search.png) | REFERENCE_ONLY_QA_OPEN |
| /seasons | 시즌 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/seasons.png) | REFERENCE_ONLY_QA_OPEN |
| /shop | 상점 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/shop.png) | REFERENCE_ONLY_QA_OPEN |
| /shop/catalog | 상점 · 카탈로그 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/shop-catalog.png) | REFERENCE_ONLY_QA_OPEN |
| /spaces | 공간 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/spaces.png) | REFERENCE_ONLY_QA_OPEN |
| /spaces/real-estate | 공간 · 부동산 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/spaces-real-estate.png) | REFERENCE_ONLY_QA_OPEN |
| /status | 상태 | member | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/status.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks | 주식 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/[symbol] | 주식 · 종목 상세 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks--symbol-.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/alerts | 주식 · 알림 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-alerts.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/community | 주식 · 토론 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-community.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/compare | 주식 · 비교 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-compare.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/derivatives | 주식 · 파생상품 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-derivatives.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/history | 주식 · 내역 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-history.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/league | 주식 · 리그 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-league.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/portfolio | 주식 · 포트폴리오 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-portfolio.png) | REFERENCE_ONLY_QA_OPEN |
| /stocks/watchlist | 주식 · 관심종목 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/stocks-watchlist.png) | REFERENCE_ONLY_QA_OPEN |
| /support | 고객지원 | social | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/support.png) | REFERENCE_ONLY_QA_OPEN |
| /terms | 이용약관 | legal | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/terms.png) | REFERENCE_ONLY_QA_OPEN |
| /tools | 금융 도구 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/capital-gains-tax-calculator | 금융 도구 · 양도세 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-capital-gains-tax-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/capital-gains-tax-calculator/[preset] | 금융 도구 · 양도세 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-capital-gains-tax-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/compound-calculator | 금융 도구 · 복리 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-compound-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/compound-calculator/[preset] | 금융 도구 · 복리 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-compound-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/crypto-apy-calculator | 금융 도구 · 가상자산 수익률 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-crypto-apy-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/dividend-tax-calculator | 금융 도구 · 배당세 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-dividend-tax-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/dividend-tax-calculator/[ticker] | 금융 도구 · 배당세 계산기 · 종목 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-dividend-tax-calculator--ticker-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/farming-calculator | 금융 도구 · 직업 수익 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-farming-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/farming-calculator/[preset] | 금융 도구 · 직업 수익 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-farming-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/fire-calculator | 금융 도구 · 경제적 자유 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-fire-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/gift-tax-calculator | 금융 도구 · 증여세 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-gift-tax-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/gift-tax-calculator/[preset] | 금융 도구 · 증여세 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-gift-tax-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/goal-wealth-calculator | 금융 도구 · 목표 자산 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-goal-wealth-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/isa-calculator | 금융 도구 · ISA 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-isa-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/isa-calculator/[slug] | 금융 도구 · ISA 계산기 · 상세 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-isa-calculator--slug-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/kimchi-premium-calculator | 금융 도구 · 김치 프리미엄 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-kimchi-premium-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/kimchi-premium-calculator/[preset] | 금융 도구 · 김치 프리미엄 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-kimchi-premium-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/loan-interest-calculator | 금융 도구 · 대출 이자 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-loan-interest-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/loan-interest-calculator/[preset] | 금융 도구 · 대출 이자 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-loan-interest-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/pension-tax-calculator | 금융 도구 · 연금 세금 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-pension-tax-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/pension-tax-calculator/[slug] | 금융 도구 · 연금 세금 계산기 · 상세 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-pension-tax-calculator--slug-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/quant-studio | 금융 도구 · 퀀트 스튜디오 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-quant-studio.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/real-estate-calculator | 금융 도구 · 부동산 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-real-estate-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/real-estate-calculator/[preset] | 금융 도구 · 부동산 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-real-estate-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/retirement-calculator | 금융 도구 · 은퇴 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-retirement-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/retirement-calculator/[slug] | 금융 도구 · 은퇴 계산기 · 상세 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-retirement-calculator--slug-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/salary-calculator | 금융 도구 · 급여 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-salary-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/salary-calculator/[preset] | 금융 도구 · 급여 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-salary-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/stock-calculator | 금융 도구 · 주식 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-stock-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/stock-calculator/[preset] | 금융 도구 · 주식 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-stock-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/tax-calculator | 금융 도구 · 세금 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-tax-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/youth-leap-calculator | 금융 도구 · 청년도약 계산기 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-youth-leap-calculator.png) | REFERENCE_ONLY_QA_OPEN |
| /tools/youth-leap-calculator/[preset] | 금융 도구 · 청년도약 계산기 · 프리셋 | tools | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/tools-youth-leap-calculator--preset-.png) | REFERENCE_ONLY_QA_OPEN |
| /treasury | 국고 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/treasury.png) | REFERENCE_ONLY_QA_OPEN |
| /verify-email | 이메일 확인 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/verify-email.png) | REFERENCE_ONLY_QA_OPEN |
| /verify-email-change | 이메일 변경 확인 | auth | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/verify-email-change.png) | REFERENCE_ONLY_QA_OPEN |
| /wallet | 지갑 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/wallet.png) | REFERENCE_ONLY_QA_OPEN |
| /wallet/activity | 지갑 · 활동 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/wallet-activity.png) | REFERENCE_ONLY_QA_OPEN |
| /wallet/activity/transactions/[transactionId] | 지갑 · 활동 · 거래 상세 · 거래 상세 | finance | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/wallet-activity-transactions--transactionId-.png) | REFERENCE_ONLY_QA_OPEN |
| /work | 직업 | game | [G2 PNG](design/game-ui-v2026.11.24.G2/routes/work.png) | REFERENCE_ONLY_QA_OPEN |

> **추가 180경로 Test 결과 v2026.11.23.10:** 익명 GET200=132 / 302=42 / 401=3 / 405=1 / 503=2, 홈 title 잘못 반환 33건. /status 및 /stocks/derivatives Test503. 정확한 경로별 표는 [180경로 QA 보고서](qa/2026-11-23-game-ui-180-image-feature-audit.ko.md). 실제 기능 전체 정상 판정 금지.
