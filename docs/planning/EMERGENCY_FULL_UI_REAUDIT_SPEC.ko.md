# 긴급 전체 UI 재점검 및 개선 명세 — v2026.10.05.530

[English canonical](EMERGENCY_FULL_UI_REAUDIT_SPEC.md) | **한국어**

> 버전: v2026.10.05.530
> 상태: **BLOCKED — 긴급 UI 수정 필요**
> 브랜치: `audit/emergency-full-ui-v2026.10.05.530`
> 최신 main 점검 기준: `921b467eac21645a51ba362b24cac7eaab89c081`

## 1. 긴급 권위 결정
관리자 전체 화면을 포함한 Moneyverse 웹 UI 전부를 긴급 재점검 대상으로 지정한다. exact candidate SHA와 현행 전체 라우트 5회 QA 계약을 충족하지 않은 과거 UI “통과” 또는 반응형 완료 주장은 현재 릴리스 증거로 사용할 수 없다.

즉시 기획 상태는 **긴급 UI 수정 필요 / BLOCKED**이다. P0 결함, 분류되지 않은 핵심 인터랙션 결함, 관리자 전수 패스 미완료, exact-SHA 증거 공백 중 하나라도 남으면 UI 영향 변경의 Production 승격을 금지한다.

## 2. 현재 인벤토리와 증거 경계
- 최신 main 웹 인벤토리: 추적 중인 Next.js `page.tsx` **142개**(정적 템플릿 115, 동적 템플릿 27).
- 관리자 인벤토리: Control Tower, API Health, Bank, Catalog, Content, Controls, Discord, Economy/Scenario Lab, Logs, Market/AI News, Safety, Security, SEO/SEO Audit, Shop, Support, Treasury, Users, Work를 포함한 `/admin/**` **25개** page 템플릿.
- 문서 인벤토리: 추적 중인 Markdown 1,747개를 열거하여 SHA-256 읽기 스캔했고, 구현 기획서·통합 마스터·문서 정책·반응형/접근성 권위·최신 업데이트/런타임 문서는 우선순위에 따라 별도 검토했다.
- 현재 Production 브라우저 증거와 최신 main 소스 증거는 **동일 런타임 identity가 아니다**. Production은 `prod-v521`, Test는 `test-v524-gsc-9bdafd86`를 가리킨다. 따라서 현재 운영 화면 관측만으로 최신 main 수정 완료를 증명할 수 없다.
- v530은 긴급 점검/기획 회차다. 요구되는 전체 5회 전수 패스가 이미 끝났다고 주장하지 않는다.

## 3. 긴급 결함 원장

### UI530-01 — P0 — 관리자 SEO 모바일 액션바 가로 잘림
사용자가 제공한 모바일 `/admin/seo` 화면에서 우측 액션이 잘린다. 최신 main 소스에서도 외부 액션바는 wrap 가능하지만 실제 4개 버튼 그룹은 긴 라벨을 가진 단일 `flex items-center gap-2` 비줄바꿈 행이라 원인이 확인된다.

필수 수정:
- 모바일 stack/grid 또는 wrap 가능한 액션 그룹, `min-w-0`, 문서 전체 가로 overflow 금지
- 네 액션 모두 화면 밖 숨김 없이 노출
- 주요 액션은 Moneyverse >=44px 터치 규칙 충족
- KO/EN/JA/ZH 긴 라벨 검증
- 320/360/375/390/412/430, landscape, 768/1024, desktop, zoom/reflow 재검증

수용: 페이지 전체 overflow 0, 잘린 액션 0, 모든 액션 탐색/조작 가능, 인증 관리자 상태 회귀 0.

### UI530-02 — P1 릴리스 차단 — 44px 미만 인터랙션 집중 구간
최신 main 소스에서 `Button` 576개를 스캔했고, 명시적인 base 높이가 44px 미만인 고신뢰 `button/a` 후보 **103개**가 유지 샘플에 잡혔다. 관리자 예시에는 quick search, support, audit logs, treasury, work, economy, safety의 24~40px 제어가 포함된다.

이 수치는 모든 항목이 WCAG 위반이라는 뜻이 아니다. skip link, range 내부, 데스크톱 compact 보조 제어, 허용 예외를 분류해야 한다. 다만 Moneyverse 제품 규칙은 WCAG 24px 바닥보다 강한 주요 터치 제어 >=44x44 CSS px 목표를 유지한다.

수용: 모든 후보를 허용 예외 또는 수정으로 분류하고 모바일 주요 액션은 양방향 44px 이상 또는 동등한 compliant target을 제공한다.

### UI530-03 — P1 — 고객지원/온보딩 플로팅 레이어 본문 가림
온보딩 런처는 모바일 `bottom-[136px]`, 고객지원 런처는 `bottom-[74px]`에 각각 독립 fixed 배치된다. 제공 화면에서 플로팅 스택이 본문을 덮는 현상이 보인다.

필수 수정:
- 단일 공용 floating-layer stack/safe-area 계약
- 필요한 경우 본문 bottom/right 공간 예약
- KPI 라벨, 폼 제어, 테이블 액션, 내비게이션, 토스트, 핵심 상태 텍스트 가림 금지
- 펼친 패널은 `100dvh` 내 유지, 모바일 키보드 대응, 320px 폭 대응

### UI530-04 — P1 — 계정 identity API 500으로 계정 UI 수용 차단
현재 Production에서 일반 리뷰 계정 로그인/viewer/profile 읽기는 성공했으나 `/app-api/v1/account/identities`가 HTTP 500을 반환했다. 필수 데이터 의존성이 실패하는 동안 계정/보안 UI를 green으로 수용할 수 없다.

수용: exact-SHA Test에서 정상 authenticated contract, 결정적인 loading/empty/error/recovery UI, Test 통과 후에만 Production 재검증.

### UI530-05 — P1 — 코어 사이트 터치 크기 회귀 면
Production 대표 공개/코어 12개 라우트를 320/390/768/1280에서 실행한 48개 페이지 체크는 문서 overflow 0, HTTP 실패 0, blank main 0이었지만 **48/48**에서 제품 44px 목표 미만 탐지 항목이 하나 이상 존재했다. 탐지기에는 합법 특수 케이스가 포함되므로 raw 실패 건수가 아니라 triage 결과다. 다만 화면에 보이는 24/30/32/36/40px 제어도 실제 포함되어 분류가 필요하다.

### UI530-06 — P1 — 현재 Production 시맨틱 heading 공백
963 URL sitemap/meta 점검에서 957개가 HTTP 200, 6개는 timeout이었다. 응답한 페이지 중 root/stocks 계열이 visible H1 누락 집합에 남아 있다. 접근성, 콘텐츠 계층, 검색 표현에 영향을 주므로 heading hierarchy를 재검증한다.

### UI530-07 — P0 증거 공백 — 기존 v529 점검은 현재 gate를 충족하지 못함
이전 v529 장시간 브라우저 점검이 완료되지 않았고 인증 관리자 캡처 범위가 일부에 그쳤으며 그 후 main도 변경됐다. 해당 증거로 현재 후보를 인증할 수 없다.

수용: material main drift마다 route inventory/exact-SHA 증거를 다시 만들고 전체 5회 계약을 완료한다.

## 4. 필수 전체 라우트 QA 계약
UI 영향 release candidate마다 발견된 전체 route inventory를 최소 5회 전수 실행한다. 5회 전체에서:
- 모든 정적 및 대표 동적 route 포함
- 25개 관리자 템플릿 모두 동일 exact Test candidate의 인증 관리자 상태로 포함
- 320/360/375/390/412/430 portrait, 대표 landscape, 768/1024, 1280/1440, 필요 200%/400% zoom/reflow
- loading/empty/partial/error/permission/expired-session/실데이터 상태
- 제품 fallback 한국어 및 공개 locale EN/JA/ZH 긴 라벨/레이아웃 parity
- focus order, keyboard, reduced motion, dialog focus trap, accessible name, form label, contrast, target size
- body overflow, 잘린 제어, fixed overlap, 숨은 CTA, 접근 불가 table action, 핵심 정보 손실 0

## 5. 관리자 전용 패스
각 전수 패스에 모든 `/admin/**`를 포함한다. Test 증거는 다음을 포함한다.
- 관리자 인증, role/step-up/permission
- 좁은 폭 header/sub-nav 탐색
- forms/filters/tables/cards/charts/dialogs 및 안전한 Test destructive/sensitive action
- 긴 identifier, KO/EN 문구, empty/large data, validation/error
- 민감 mutation audit-log
- 문서 전체 가로 overflow 0 및 핵심 액션 터치 규칙 충족

## 6. 수정 순서
1. P0 `/admin/seo` overflow/hidden CTA
2. 공용 shell/floating-layer collision 및 mobile safe-area
3. 관리자 25개 전체 touch-target/dense-table/action 개선
4. account identities 500 및 결정적 error/retry UI
5. 전체 visible touch-target 및 heading/semantic 정리
6. 5회 exact-SHA Test matrix, backend/API health, 인증 관리자 QA
7. 최신 `origin/main` 재수신/재조정 및 영향 범위 재실행
8. blocker 0일 때만 merge → exact merged SHA rebuild → 무중단 Production 승격 → post-promotion smoke/session/runtime identity 확인

## 7. 릴리스 게이트
v530 문서는 런타임 수정, Test 검증, Production 완료를 주장하지 않는다. 코드 변경은 별도 구현 브랜치, exact-SHA Test 배포, backend/API health 검증, 프로젝트 무중단 승격 절차를 필수로 한다.

## 8. v531 구현 응답 — 2026-10-05

승인된 v530 계획은 PR #792로 merge되었고 v531은 exact baseline `9ae2a9e8e0f7d5e403de80c7d30510916e0ed880`에서 첫 blocker 수정을 구현한다.

- UI530-01 소스 수정 구현: `/admin/seo` 액션은 좁은 폭에서 stack/wrap, shrink-safe label, >=44px action height.
- UI530-02 1차 시스템 수정 구현: 관리자 mobile/coarse-pointer button에 44×44 minimum target 계약. route-level runtime 분류는 Test 수용에서 계속 확인.
- UI530-03 소스 수정 구현: 온보딩/고객지원 소비자 overlay 통합 후 `/admin/**`에서 숨김.
- UI530-04 소스 수정 구현: linked identity read는 `local_email` 허용, OAuth 연결은 Google/Discord-only 유지.
- UI530-06 root semantic 수정 구현: home에 실제 보이는 localized H1 추가.
- UI530-07은 exact v531 candidate가 요구된 Test pass를 완료할 때까지 증거 gate로 유지.

소스 구현 후 상태: **IMPLEMENTED — Test 검증 대기**. 이 절은 Test 또는 Production gate를 닫지 않는다.
