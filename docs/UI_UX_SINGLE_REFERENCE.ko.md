# UI/UX 통합 기준 — 현재 사이트 파비콘/로고 및 결함 원장

> **Current rules — v2026.11.24.DOCSYNC.1:** [EN authority](DOCUMENT_AUTHORITY.md) / [한국어](DOCUMENT_AUTHORITY.ko.md). Owner-approved target: Next.js/React frontend + same-origin BFF + authoritative Spring API; Nov23 v10 design and actual favicon. Automatic image preparation is allowed; actual Production cutover needs separate approval after independent Test. Dated technology/runtime claims below are historical snapshots; business/security requirements retain their adopted scope. No whole-site implementation or runtime acceptance is implied.


> **현행 시각 기준 v2026.11.24.1:** 새 UI 구현에는 **[11월23일 v10 이미지 180개](design/game-ui-v2026.11.23.10/README.ko.md)만** 사용한다. [180경로 매니페스트](design/CURRENT_UI_DESIGN_MANIFEST.json)·[단일 기준 정책](design/CURRENT_UI_DESIGN.ko.md) 확인 필수. v8·11월18일 PNG는 **보관 / 구현 사용 금지**. v10 최종 디자인 승인과 실제 서버 E2E는 별개 미완료.

> **최신 v2026.11.23.10:** 180개 신규 시안 전수 파일 검사 통과, 블로그 상세·은행·관리자 등 화면 구조 수정. [신규 시안 갤러리](design/game-ui-v2026.11.23.10/README.ko.md) 및 [기능/이미지 QA](qa/2026-11-23-game-ui-180-image-feature-audit.ko.md). 180개 기능 실제 정상 여부와 Test/운영 승격은 미검증. v8 원본 시안은 보존.

> **현재 통합 작업 v2026.11.23.9:** 이 문서는 실제 게임형 신규 PNG 180개 / 기존 11월18일 원본 180개 / UI 구현 코드 후보 / 파비콘 로고 / 관리자 전용 메뉴 / 서버 게임시간 / 은행·실데이터·다국어·QA 지침을 한곳에서 확인하는 단일 기준서다. **이미지 180/180 GitHub에 실제 등록, 디자인 최종 승인/전체 페이지 프론트 구현/독립 Test/운영 승격은 미완료**. 이전 NOT_STARTED 단락은 시점별 기록이며 최신 진행 상태는 이 문단과 하단 목록을 따른다.


> v2026.11.23.5 · PLANNING / QA OPEN · [English](UI_UX_SINGLE_REFERENCE.md) · 기준 main `9876c09888ec84034eec183cf1309c85df3d7447`

## 최우선 사용자 지시 (로고)
**현재 사이트에서 쓰는 파비콘이 곧 공식 로고다.** 단순 W 문자 그림·새 왕관/월계수 생성형 엠블럼을 로고로 대체하지 않는다. 단일 정본 파일은 `spring-backend/src/main/resources/static/assets/mv39/favicon.ico` (검증 Git blob `c102a9b1fe85e2d476e00eb82387f97dabb17cc0`). 동일 자산을 브라우저 탭, PC·모바일 사이드바/헤더, 홈 히어로, 관리자 화면에 사용하며 형태·색·비율을 임의로 다시 그리지 않는다. 이미지 시안 생성 시 이 파일의 **실제 픽셀** 사용이 확인되지 않으면 로고가 정확하다고 주장하거나 승인 시안으로 사용하지 않는다.

## 사용자 노출과 권한
**관리자 메뉴는 권한이 검증된 관리자만 볼 수 있다.** 비회원과 일반 회원에게는 PC 사이드바, 모바일 내비게이션/드로어, 빠른 실행, 검색 결과, 홈 카드 어디에도 관리자 메뉴를 렌더링하지 않는다. 단순 CSS 숨김이 아니라 서버 신원·역할에 따른 메뉴 출력과 별도 API/라우트 RBAC를 모두 강제한다. 인증 대기 중에는 관리자 항목을 보이지 않게 한다. 관리자는 정상 표시된다.

## 승인된 시각 원칙
현행 화면 구현은 [11월23일 v10 이미지](design/game-ui-v2026.11.23.10/README.ko.md)를 **단독 시각 기준**으로 적용한다. 11월18일 이미지들은 보관본이며 참고/대체 금지. 기능 정책은 [채팅·다국어 채택 기준](planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md)을 유지한다. 단순히 보라색을 맞추는 것이 아니라 화면의 계층·정보구조·게임 진행·금융 도구·반응형 형태를 원본과 비교한다. 시안 속 샘플 숫자/보상/등급은 서버 실데이터가 아니다. 색 기준 배경 #0C1020, 카드 #151D32, 보라 #9C83FF. EN 기본, KO 2차, JA/ZH/VI 지원. `Translation unavailable` 등 내부 오류를 이용자에게 그대로 노출하지 않는다.

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
정확한 메인 SHA 재조회 → 현행 v10 디자인·실제 파비콘 비교 → 별도 PR → UI 경로×역할×5언어×PC/모바일 QA → 실제 API·금융/보안 검증 → 독립 Test → 승인된 무중단 운영승격 및 롤백 증거. 운영·금융·권한 코드는 이번 문서 변경으로 수정하지 않는다. 기존 기획/작업로그/QA 및 출시 기록은 보존한다.


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


## 12. 현행 v10 이미지 전용 180경로 목록 (v2026.11.24.1)

- 새 이미지 180개는 **실제 파일**이고 GENERATED_NOT_APPROVED 상태다. 동일한 파비콘 원본 픽셀로 로고를 넣었으며 1660×990 PC/모바일 구성이다.
- 11월18일 원본 PNG 180개는 이력 용도로만 보존한다. 아래 각 행은 현행 v10 이미지만 연결한다.
- 180개 화면이 전부 실제 서비스 UI로 구현되거나 신규 이미지가 시각적으로 모두 승인된 것은 아니다. 기능·보안·5언어·역할별·기기별 Test는 OPEN.
- 공통 Spring 게임형 스타일 후보는 이 변경에 포함되지만 정적/별도 구현 화면 전체를 자동으로 수정하는 것은 아니다.

| 화면 경로 | 페이지 | 분류 | 현행 v10 PNG만 | 단계 |
| --- | --- | --- | --- | --- |
| / | 홈 대시보드 | home | [NEW PNG](design/game-ui-v2026.11.23.10/previews/home.png) | GENERATED_NOT_APPROVED |
| /[locale]/blog | 블로그 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/-locale--blog.png) | GENERATED_NOT_APPROVED |
| /[locale]/blog/[slug] | 블로그 · 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/-locale--blog--slug-.png) | GENERATED_NOT_APPROVED |
| /[locale]/guide/glossary | 가이드 · 용어사전 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/-locale--guide-glossary.png) | GENERATED_NOT_APPROVED |
| /[locale]/guide/glossary/[term] | 가이드 · 용어사전 · 용어 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/-locale--guide-glossary--term-.png) | GENERATED_NOT_APPROVED |
| /[locale]/tools/compound-interest-calculator | 금융 도구 · 복리 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/-locale--tools-compound-interest-calculator.png) | GENERATED_NOT_APPROVED |
| /[locale]/tools/compound-interest-calculator/[preset] | 금융 도구 · 복리 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/-locale--tools-compound-interest-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /account | 계정 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/account.png) | GENERATED_NOT_APPROVED |
| /account-deletion | 계정 삭제 | legal | [NEW PNG](design/game-ui-v2026.11.23.10/previews/account-deletion.png) | GENERATED_NOT_APPROVED |
| /account/notifications | 계정 · 알림 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/account-notifications.png) | GENERATED_NOT_APPROVED |
| /account/privacy | 계정 · 개인정보 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/account-privacy.png) | GENERATED_NOT_APPROVED |
| /account/security | 계정 · 보안 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/account-security.png) | GENERATED_NOT_APPROVED |
| /admin | 관리자 대시보드 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin.png) | GENERATED_NOT_APPROVED |
| /admin/analytics | 관리자 · 분석 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-analytics.png) | GENERATED_NOT_APPROVED |
| /admin/api-health | 관리자 · API 상태 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-api-health.png) | GENERATED_NOT_APPROVED |
| /admin/bank | 관리자 · 은행 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-bank.png) | GENERATED_NOT_APPROVED |
| /admin/blog | 관리자 · 블로그 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-blog.png) | GENERATED_NOT_APPROVED |
| /admin/bonds | 관리자 · 국채 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-bonds.png) | GENERATED_NOT_APPROVED |
| /admin/catalog | 관리자 · 카탈로그 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-catalog.png) | GENERATED_NOT_APPROVED |
| /admin/central-bank | 관리자 · 중앙은행 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-central-bank.png) | GENERATED_NOT_APPROVED |
| /admin/content | 관리자 · 콘텐츠 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-content.png) | GENERATED_NOT_APPROVED |
| /admin/controls | 관리자 · 기능 제어 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-controls.png) | GENERATED_NOT_APPROVED |
| /admin/discord | 관리자 · 디스코드 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-discord.png) | GENERATED_NOT_APPROVED |
| /admin/economy | 관리자 · 경제 운영 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-economy.png) | GENERATED_NOT_APPROVED |
| /admin/economy/scenario-lab | 관리자 · 경제 운영 · 경제 시나리오 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-economy-scenario-lab.png) | GENERATED_NOT_APPROVED |
| /admin/enterprises | 관리자 · 국영기업 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-enterprises.png) | GENERATED_NOT_APPROVED |
| /admin/fx | 관리자 · 외환 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-fx.png) | GENERATED_NOT_APPROVED |
| /admin/help | 관리자 · 도움말 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-help.png) | GENERATED_NOT_APPROVED |
| /admin/kdic | 관리자 · 예금보험 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-kdic.png) | GENERATED_NOT_APPROVED |
| /admin/logs | 관리자 · 로그 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-logs.png) | GENERATED_NOT_APPROVED |
| /admin/logs/activity | 관리자 · 로그 · 활동 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-logs-activity.png) | GENERATED_NOT_APPROVED |
| /admin/logs/delivery | 관리자 · 로그 · 전송 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-logs-delivery.png) | GENERATED_NOT_APPROVED |
| /admin/logs/errors | 관리자 · 로그 · 오류 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-logs-errors.png) | GENERATED_NOT_APPROVED |
| /admin/logs/integrity | 관리자 · 로그 · 무결성 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-logs-integrity.png) | GENERATED_NOT_APPROVED |
| /admin/logs/system | 관리자 · 로그 · 시스템 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-logs-system.png) | GENERATED_NOT_APPROVED |
| /admin/market | 관리자 · 시장 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-market.png) | GENERATED_NOT_APPROVED |
| /admin/market/ai-news | 관리자 · 시장 · AI 뉴스 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-market-ai-news.png) | GENERATED_NOT_APPROVED |
| /admin/mint | 관리자 · 조폐국 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-mint.png) | GENERATED_NOT_APPROVED |
| /admin/money-flow | 관리자 · 자금 흐름 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-money-flow.png) | GENERATED_NOT_APPROVED |
| /admin/operations/storage | 관리자 · 운영 · 저장소 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-operations-storage.png) | GENERATED_NOT_APPROVED |
| /admin/pension | 관리자 · 연금 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-pension.png) | GENERATED_NOT_APPROVED |
| /admin/safety | 관리자 · 안전 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-safety.png) | GENERATED_NOT_APPROVED |
| /admin/security | 관리자 · 보안 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-security.png) | GENERATED_NOT_APPROVED |
| /admin/seo | 관리자 · 검색 최적화 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-seo.png) | GENERATED_NOT_APPROVED |
| /admin/seo-audit | 관리자 · SEO 감사 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-seo-audit.png) | GENERATED_NOT_APPROVED |
| /admin/shop | 관리자 · 상점 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-shop.png) | GENERATED_NOT_APPROVED |
| /admin/support | 관리자 · 고객지원 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-support.png) | GENERATED_NOT_APPROVED |
| /admin/treasury | 관리자 · 국고 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-treasury.png) | GENERATED_NOT_APPROVED |
| /admin/treasury/grants | 관리자 · 국고 · 지원금 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-treasury-grants.png) | GENERATED_NOT_APPROVED |
| /admin/users | 관리자 · 회원 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-users.png) | GENERATED_NOT_APPROVED |
| /admin/users/[id] | 관리자 · 회원 · 상세 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-users--id-.png) | GENERATED_NOT_APPROVED |
| /admin/work | 관리자 · 직업 | admin | [NEW PNG](design/game-ui-v2026.11.23.10/previews/admin-work.png) | GENERATED_NOT_APPROVED |
| /advisor | 자산 가이드 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/advisor.png) | GENERATED_NOT_APPROVED |
| /announcements | 공지사항 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/announcements.png) | GENERATED_NOT_APPROVED |
| /announcements/[announcementId] | 공지사항 · 공지 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/announcements--announcementId-.png) | GENERATED_NOT_APPROVED |
| /arcade | 아케이드 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/arcade.png) | GENERATED_NOT_APPROVED |
| /bank | 은행 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/bank.png) | GENERATED_NOT_APPROVED |
| /bank/savings-pot | 은행 · 적금 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/bank-savings-pot.png) | GENERATED_NOT_APPROVED |
| /blog | 블로그 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/blog.png) | GENERATED_NOT_APPROVED |
| /blog/[slug] | 블로그 · 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/blog--slug-.png) | GENERATED_NOT_APPROVED |
| /board | 게시판 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/board.png) | GENERATED_NOT_APPROVED |
| /board/[postId] | 게시판 · 게시글 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/board--postId-.png) | GENERATED_NOT_APPROVED |
| /bonds | 국채 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/bonds.png) | GENERATED_NOT_APPROVED |
| /businesses | 사업 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/businesses.png) | GENERATED_NOT_APPROVED |
| /businesses/ventures | 사업 · 스타트업 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/businesses-ventures.png) | GENERATED_NOT_APPROVED |
| /calculators | 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/calculators.png) | GENERATED_NOT_APPROVED |
| /calendar | 일정 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/calendar.png) | GENERATED_NOT_APPROVED |
| /casino | 카지노 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/casino.png) | GENERATED_NOT_APPROVED |
| /central-bank | 중앙은행 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/central-bank.png) | GENERATED_NOT_APPROVED |
| /chat | 채팅 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/chat.png) | GENERATED_NOT_APPROVED |
| /clubs | 클럽 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/clubs.png) | GENERATED_NOT_APPROVED |
| /clubs/[clubId] | 클럽 · 클럽 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/clubs--clubId-.png) | GENERATED_NOT_APPROVED |
| /clubs/[clubId]/members | 클럽 · 클럽 상세 · 멤버 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/clubs--clubId--members.png) | GENERATED_NOT_APPROVED |
| /clubs/new | 클럽 · 신규 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/clubs-new.png) | GENERATED_NOT_APPROVED |
| /clubs/warfare | 클럽 · 클럽전 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/clubs-warfare.png) | GENERATED_NOT_APPROVED |
| /collections | 컬렉션 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/collections.png) | GENERATED_NOT_APPROVED |
| /dashboard | 대시보드 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/dashboard.png) | GENERATED_NOT_APPROVED |
| /data-deletion | 데이터 삭제 | legal | [NEW PNG](design/game-ui-v2026.11.23.10/previews/data-deletion.png) | GENERATED_NOT_APPROVED |
| /design-preview | 디자인 미리보기 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/design-preview.png) | GENERATED_NOT_APPROVED |
| /developer | 개발자 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/developer.png) | GENERATED_NOT_APPROVED |
| /enterprises | 국영기업 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/enterprises.png) | GENERATED_NOT_APPROVED |
| /features | 기능 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/features.png) | GENERATED_NOT_APPROVED |
| /forgot-password | 비밀번호 찾기 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/forgot-password.png) | GENERATED_NOT_APPROVED |
| /fx | 외환 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/fx.png) | GENERATED_NOT_APPROVED |
| /gallery | 갤러리 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/gallery.png) | GENERATED_NOT_APPROVED |
| /gallery/[photoId] | 갤러리 · 사진 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/gallery--photoId-.png) | GENERATED_NOT_APPROVED |
| /gallery/submit | 갤러리 · 등록 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/gallery-submit.png) | GENERATED_NOT_APPROVED |
| /guide | 가이드 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide.png) | GENERATED_NOT_APPROVED |
| /guide/career-mastery | 가이드 · 직업 숙련 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide-career-mastery.png) | GENERATED_NOT_APPROVED |
| /guide/dopamine-system | 가이드 · 성장 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide-dopamine-system.png) | GENERATED_NOT_APPROVED |
| /guide/glossary | 가이드 · 용어사전 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide-glossary.png) | GENERATED_NOT_APPROVED |
| /guide/glossary/[term] | 가이드 · 용어사전 · 용어 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide-glossary--term-.png) | GENERATED_NOT_APPROVED |
| /guide/stock-trading | 가이드 · 주식 거래 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide-stock-trading.png) | GENERATED_NOT_APPROVED |
| /guide/virtual-banking | 가이드 · 가상 은행 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/guide-virtual-banking.png) | GENERATED_NOT_APPROVED |
| /help | 도움말 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/help.png) | GENERATED_NOT_APPROVED |
| /help/[slug] | 도움말 · 상세 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/help--slug-.png) | GENERATED_NOT_APPROVED |
| /inventory | 보관함 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/inventory.png) | GENERATED_NOT_APPROVED |
| /invite/[code] | 초대 · 초대 링크 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/invite--code-.png) | GENERATED_NOT_APPROVED |
| /kdic | 예금보험 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/kdic.png) | GENERATED_NOT_APPROVED |
| /lobby | 로비 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/lobby.png) | GENERATED_NOT_APPROVED |
| /login | 로그인 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/login.png) | GENERATED_NOT_APPROVED |
| /login/providers | 로그인 · 소셜 인증 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/login-providers.png) | GENERATED_NOT_APPROVED |
| /marketplace | 마켓 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/marketplace.png) | GENERATED_NOT_APPROVED |
| /marketplace/auction | 마켓 · 경매 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/marketplace-auction.png) | GENERATED_NOT_APPROVED |
| /mint | 조폐국 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/mint.png) | GENERATED_NOT_APPROVED |
| /newspaper | 신문 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/newspaper.png) | GENERATED_NOT_APPROVED |
| /pension | 연금 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/pension.png) | GENERATED_NOT_APPROVED |
| /prediction | 예측 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/prediction.png) | GENERATED_NOT_APPROVED |
| /privacy | 개인정보 | legal | [NEW PNG](design/game-ui-v2026.11.23.10/previews/privacy.png) | GENERATED_NOT_APPROVED |
| /profile | 프로필 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/profile.png) | GENERATED_NOT_APPROVED |
| /profile/[userId] | 프로필 · 사용자 상세 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/profile--userId-.png) | GENERATED_NOT_APPROVED |
| /profile/settings | 프로필 · 설정 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/profile-settings.png) | GENERATED_NOT_APPROVED |
| /progression | 성장 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/progression.png) | GENERATED_NOT_APPROVED |
| /progression/prestige | 성장 · 명성 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/progression-prestige.png) | GENERATED_NOT_APPROVED |
| /quests | 퀘스트 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/quests.png) | GENERATED_NOT_APPROVED |
| /register | 회원가입 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/register.png) | GENERATED_NOT_APPROVED |
| /reset-password | 비밀번호 재설정 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/reset-password.png) | GENERATED_NOT_APPROVED |
| /roadmap | 로드맵 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/roadmap.png) | GENERATED_NOT_APPROVED |
| /safety | 안전 | legal | [NEW PNG](design/game-ui-v2026.11.23.10/previews/safety.png) | GENERATED_NOT_APPROVED |
| /safety/takedown | 안전 · 게시 중단 | legal | [NEW PNG](design/game-ui-v2026.11.23.10/previews/safety-takedown.png) | GENERATED_NOT_APPROVED |
| /search | 검색 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/search.png) | GENERATED_NOT_APPROVED |
| /seasons | 시즌 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/seasons.png) | GENERATED_NOT_APPROVED |
| /shop | 상점 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/shop.png) | GENERATED_NOT_APPROVED |
| /shop/catalog | 상점 · 카탈로그 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/shop-catalog.png) | GENERATED_NOT_APPROVED |
| /spaces | 공간 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/spaces.png) | GENERATED_NOT_APPROVED |
| /spaces/real-estate | 공간 · 부동산 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/spaces-real-estate.png) | GENERATED_NOT_APPROVED |
| /status | 상태 | member | [NEW PNG](design/game-ui-v2026.11.23.10/previews/status.png) | GENERATED_NOT_APPROVED |
| /stocks | 주식 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks.png) | GENERATED_NOT_APPROVED |
| /stocks/[symbol] | 주식 · 종목 상세 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks--symbol-.png) | GENERATED_NOT_APPROVED |
| /stocks/alerts | 주식 · 알림 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-alerts.png) | GENERATED_NOT_APPROVED |
| /stocks/community | 주식 · 토론 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-community.png) | GENERATED_NOT_APPROVED |
| /stocks/compare | 주식 · 비교 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-compare.png) | GENERATED_NOT_APPROVED |
| /stocks/derivatives | 주식 · 파생상품 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-derivatives.png) | GENERATED_NOT_APPROVED |
| /stocks/history | 주식 · 내역 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-history.png) | GENERATED_NOT_APPROVED |
| /stocks/league | 주식 · 리그 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-league.png) | GENERATED_NOT_APPROVED |
| /stocks/portfolio | 주식 · 포트폴리오 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-portfolio.png) | GENERATED_NOT_APPROVED |
| /stocks/watchlist | 주식 · 관심종목 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/stocks-watchlist.png) | GENERATED_NOT_APPROVED |
| /support | 고객지원 | social | [NEW PNG](design/game-ui-v2026.11.23.10/previews/support.png) | GENERATED_NOT_APPROVED |
| /terms | 이용약관 | legal | [NEW PNG](design/game-ui-v2026.11.23.10/previews/terms.png) | GENERATED_NOT_APPROVED |
| /tools | 금융 도구 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools.png) | GENERATED_NOT_APPROVED |
| /tools/capital-gains-tax-calculator | 금융 도구 · 양도세 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-capital-gains-tax-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/capital-gains-tax-calculator/[preset] | 금융 도구 · 양도세 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-capital-gains-tax-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/compound-calculator | 금융 도구 · 복리 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-compound-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/compound-calculator/[preset] | 금융 도구 · 복리 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-compound-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/crypto-apy-calculator | 금융 도구 · 가상자산 수익률 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-crypto-apy-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/dividend-tax-calculator | 금융 도구 · 배당세 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-dividend-tax-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/dividend-tax-calculator/[ticker] | 금융 도구 · 배당세 계산기 · 종목 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-dividend-tax-calculator--ticker-.png) | GENERATED_NOT_APPROVED |
| /tools/farming-calculator | 금융 도구 · 직업 수익 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-farming-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/farming-calculator/[preset] | 금융 도구 · 직업 수익 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-farming-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/fire-calculator | 금융 도구 · 경제적 자유 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-fire-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/gift-tax-calculator | 금융 도구 · 증여세 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-gift-tax-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/gift-tax-calculator/[preset] | 금융 도구 · 증여세 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-gift-tax-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/goal-wealth-calculator | 금융 도구 · 목표 자산 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-goal-wealth-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/isa-calculator | 금융 도구 · ISA 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-isa-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/isa-calculator/[slug] | 금융 도구 · ISA 계산기 · 상세 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-isa-calculator--slug-.png) | GENERATED_NOT_APPROVED |
| /tools/kimchi-premium-calculator | 금융 도구 · 김치 프리미엄 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-kimchi-premium-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/kimchi-premium-calculator/[preset] | 금융 도구 · 김치 프리미엄 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-kimchi-premium-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/loan-interest-calculator | 금융 도구 · 대출 이자 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-loan-interest-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/loan-interest-calculator/[preset] | 금융 도구 · 대출 이자 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-loan-interest-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/pension-tax-calculator | 금융 도구 · 연금 세금 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-pension-tax-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/pension-tax-calculator/[slug] | 금융 도구 · 연금 세금 계산기 · 상세 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-pension-tax-calculator--slug-.png) | GENERATED_NOT_APPROVED |
| /tools/quant-studio | 금융 도구 · 퀀트 스튜디오 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-quant-studio.png) | GENERATED_NOT_APPROVED |
| /tools/real-estate-calculator | 금융 도구 · 부동산 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-real-estate-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/real-estate-calculator/[preset] | 금융 도구 · 부동산 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-real-estate-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/retirement-calculator | 금융 도구 · 은퇴 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-retirement-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/retirement-calculator/[slug] | 금융 도구 · 은퇴 계산기 · 상세 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-retirement-calculator--slug-.png) | GENERATED_NOT_APPROVED |
| /tools/salary-calculator | 금융 도구 · 급여 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-salary-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/salary-calculator/[preset] | 금융 도구 · 급여 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-salary-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/stock-calculator | 금융 도구 · 주식 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-stock-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/stock-calculator/[preset] | 금융 도구 · 주식 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-stock-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /tools/tax-calculator | 금융 도구 · 세금 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-tax-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/youth-leap-calculator | 금융 도구 · 청년도약 계산기 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-youth-leap-calculator.png) | GENERATED_NOT_APPROVED |
| /tools/youth-leap-calculator/[preset] | 금융 도구 · 청년도약 계산기 · 프리셋 | tools | [NEW PNG](design/game-ui-v2026.11.23.10/previews/tools-youth-leap-calculator--preset-.png) | GENERATED_NOT_APPROVED |
| /treasury | 국고 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/treasury.png) | GENERATED_NOT_APPROVED |
| /verify-email | 이메일 확인 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/verify-email.png) | GENERATED_NOT_APPROVED |
| /verify-email-change | 이메일 변경 확인 | auth | [NEW PNG](design/game-ui-v2026.11.23.10/previews/verify-email-change.png) | GENERATED_NOT_APPROVED |
| /wallet | 지갑 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/wallet.png) | GENERATED_NOT_APPROVED |
| /wallet/activity | 지갑 · 활동 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/wallet-activity.png) | GENERATED_NOT_APPROVED |
| /wallet/activity/transactions/[transactionId] | 지갑 · 활동 · 거래 상세 · 거래 상세 | finance | [NEW PNG](design/game-ui-v2026.11.23.10/previews/wallet-activity-transactions--transactionId-.png) | GENERATED_NOT_APPROVED |
| /work | 직업 | game | [NEW PNG](design/game-ui-v2026.11.23.10/previews/work.png) | GENERATED_NOT_APPROVED |

> **추가 180경로 Test 결과 v2026.11.23.10:** 익명 GET200=132 / 302=42 / 401=3 / 405=1 / 503=2, 홈 title 잘못 반환 33건. /status 및 /stocks/derivatives Test503. 정확한 경로별 표는 [180경로 QA 보고서](qa/2026-11-23-game-ui-180-image-feature-audit.ko.md). 실제 기능 전체 정상 판정 금지.
