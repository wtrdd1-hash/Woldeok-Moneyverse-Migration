# 월덕 머니버스 전체 웹 UI·관리자 화면 재점검 — v2026.10.16.718

**상태:** 감사/분석 완료, 전체 UI 승인 **BLOCKED** — Test 및 Production 최종 검증 아님 | [English](MONEYVERSE_FULL_UI_ADMIN_AUDIT_v2026.10.16.718.md)
**점검 일시:** 2026-10-16 KST, `$pc` 미니PC의 읽기 전용 소스/운영 HTTP 검사
**기준:** `origin/main=2a06bed92c22d63013672b44c55b621e9be5019f` (착수·중간 재조회 일치)
**격리 브랜치:** `audit/full-ui-admin-v2026.10.16.718`
**우선 규정:** `DOCUMENTATION_POLICY` → `PROJECT_PLAN` → `INTEGRATED_PLANNING_MASTER` → v530 `EMERGENCY_FULL_UI_REAUDIT_SPEC`. 과거 v624/v628 기록은 참고 증거이며 현재 합격 증거가 아니다.

## 1. 점검한 범위와 증거 한계

| 항목 | 관찰 결과 | 주의 |
| --- | --- | --- |
| 전체 Next 페이지 | **166개 템플릿**: 정적 135개, 동적 31개 | 코드 인벤토리, 전부 실제 브라우저 렌더링한 것은 아님 |
| 관리자 페이지 | **34개 템플릿** (정적 33 + 동적 1) | v530의 25개 기록은 과거 스냅샷 |
| 운영 읽기 전용 GET | 정적 경로 **135/135 HTTP 200** (일반 102, 관리자 33) | 관리자 200은 로그인·재인증 게이트 HTML일 수 있음. 버튼 작동 및 권한 통과 증거 아님 |
| 관리자 내비게이션 | **34/34** 상위 메뉴 또는 하위 경로에서 발견 가능, `/admin`은 `adminConsole()` 게이트 사용 | 키보드·스크린리더 검증은 별개 |
| 무로그인 음성 검사 | `/api/admin/treasury/grants`, `/api/admin/seo-audit`, `/api/admin/pension/overview`, `/api/admin/bonds/overview`, `/app-api/v1/account/identities` 모두 **401** | 인증된 사용자·관리자 테스트 안 함; `/api/admin/seo/twitter` GET은 200으로 의도된 공개 상태 조회인지 판단 필요 |
| 선택적 테스트 | `NODE_ENV=test`에서 관리자 SEO + 모바일 반응형 Vitest **2개 파일/13개 통과** | 주로 코드 문자열·jsdom 테스트; 실제 화면 크기 측정 아님 |
| 소스/운영 연계 | v717 후보 `176ca04e`부터 기준 `2a06bed9`까지 frontend/backend 파일 차이 없음 | 이 검사에서 운영 프록시 실제 실행 SHA를 독립적으로 입증한 것은 아님 |
| 전 화면 실제 브라우저 | **미수행** | 그래픽 브라우저·관리자 QA 세션 부재. 픽셀 겹침, 클릭 영역, 포커스, 200%/400% 확대, 5회 전체 패스는 미검증 |

처음 테스트는 서버 환경변수 `NODE_ENV=production` 때문에 React.act 테스트 하네스 오류 7건이 발생했다. 테스트 환경을 정확히 `NODE_ENV=test`로 지정하여 13/13 재검증 통과했다. 이를 제품 UI 결함으로 계산하지 않는다.

전체 라우트와 HTTP 관찰 데이터는 `docs/findings/evidence/full-ui-admin-v718-route-matrix.json`, `full-ui-admin-v718-http-smoke.json`에 기록했다.

## 2. 우선 해결 대상

### UI718-01 — P1 / 관리자 SEO 외부 작업 API의 권한 검사 미흡

- `frontend/src/app/api/admin/seo/indexing-submit/route.ts:13-83`: Next POST 함수에 관리자 인증·승격 콘솔·CSRF 검증이 드러나지 않은 상태에서 IndexNow/검색엔진 통보를 호출한다. 하위 제공자가 실패해도 성공 문구가 반환될 수 있다.
- `frontend/src/app/api/admin/seo/gsc-sitemap-submit/route.ts:55-124`: 호스트 허용 목록/호출 제한은 있지만 운영자 검사 없이 외부 Ping 및 백엔드 제출이 호출될 수 있는 코드이다. GSC 제출이 확인되지 않아도 `success:true` 반환 경로가 있다.
- `frontend/src/components/public-sitemap-submit-box.tsx:25`의 공개용 UI가 `/api/admin/seo/gsc-sitemap-submit`을 직접 호출한다. 공개 기능인지 관리자 전용인지 설계 정책을 정리해야 한다.
- **운영 환경에 변화를 일으키는 POST 재현은 실행하지 않았다.** 실제 취약점 악용 여부·CDN 차단 여부는 미검증이다.
- 조치: 공개 상태조회와 관리자 제출 기능 분리, 제출 전 관리자 세션·승격·CSRF·Origin 검사, 서버가 발행한 요청 ID/제공자 응답 기록, 제출과 색인의 단계별 구분, 음성/쿼터/실패 테스트.

### UI718-02 — P1 / 모바일 관리자 SEO 탭 잘림 가능성

`frontend/src/app/admin/seo/page.tsx:110-126`에 긴 한글 제목의 두 탭이 `flex gap-2`에 가로 배치되지만 좁은 화면에서 줄바꿈이나 스크롤 보장이 없다. **코드상 가능성이지 실제 픽셀 겹침 확정은 아니다.** 320/360/375/390/412/430px, 태블릿, 200%/400% 확대, KO/EN/JA/ZH 문구로 시각·키보드 테스트하고 반응형 탭 구조로 수정한다.

### UI718-03 — P1 / SEO 제출 성공·내역 표시 신뢰성

`frontend/src/app/admin/seo/indexing-api-card.tsx:25-45,70-99`는 포괄적인 `data.success`로 성공 기록을 만들고 사이트맵 제출에도 **564건**을 고정된 처리 건수처럼 사용한다. `public-sitemap-submit-box.tsx:25-40` 역시 실제 Google 색인과 단순 제출/핑의 차이를 명확히 표시하지 않는다. 요청·접수·색인 확인을 나누고 실제 제공자 응답, 시간, 오류 및 부분 성공을 보여야 한다.

### UI718-04 — P1 / 홈 페이지 H1 누락

`frontend/src/app/page.tsx`에는 `h2/h3`만 있고 `h1`이 없으며, 운영 `/` HTML에서도 SSR `<h1>`을 찾지 못했다. 다국어 서버 렌더링 대표 제목과 올바른 heading 계층이 필요하다. 다른 인증 게이트 페이지의 H1 누락까지 모두 SEO 오류로 분류하지 않는다.

### UI718-05 — P1 분류 대상 / 터치 영역 44px 미만 후보

명시적 높이 기준으로 공통/관리자 구성요소에서 **39개 후보**, 그중 **관리자 9개 후보**를 추출했다. 예: `admin/money-flow/page.tsx:338,341` 40px, `admin/shop/admin-shop-view.tsx:138` 36px, `components/site-header.tsx:263` 38px. CSS 재정의, 데스크톱 예외, 실측 영역에 따라 적합한 버튼도 있으므로 39개를 확정 결함으로 취급하지 않는다. 프로젝트 모바일 기본 목표 44×44px 준수 여부를 실측한다.

### UI718-06 — P2 / 관리자 다국어 일관성

`admin/seo/page.tsx:98-126`는 표제/설명을 EN과 나머지 언어로만 분기하고, 하위 탭 텍스트는 언어 선택과 무관하게 한국어로 고정된다. 실제 관리자 화면에서 영·한·일·중의 긴 문구와 사용자 선택 언어 유지·국가 자동 감지 우선순위를 검증해야 한다.

### UI718-07 — P0 검증 공백 / v530 전체 UI 다섯 차례 통과 조건

166개 화면(관리자 34개) 전부에 대해 실제 브라우저 5회 반복, 관리자 역할/재인증, 정상·빈값·오류·긴 데이터, 동적 경로, 320px부터 데스크톱과 확대, 모달 포커스·키보드 조작·스크린리더·토스트 겹침은 수행되지 않았다. 따라서 **전체 UI 합격 또는 운영 수정 완료 판정 불가**이다.

## 3. 과거 문제와 비교

- 관리자 블로그 메뉴 및 국고 그랜트 메뉴 누락(v628): **현 소스에 메뉴 있음**.
- 국고 그랜트 BFF(v628): 현재 GET은 백엔드 관리자 보안 세션을 확인하고 POST는 지급/심사를 503으로 거부한다. 실제 지급 기능 합격은 아님.
- 벤처·경매·퀀트(v628): 현재 소스에 시뮬레이션·미리보기·실제 WLD 불변 고지가 있다. 다만 경매 미리보기의 `isPlusUser=true` 고정 권한 표시는 따로 정리 필요.
- 하단 부유 위젯(v530): 온보딩 좌측, 지원 우측, AI 우측 분리 및 관리자 영역 제외가 보이지만 실제 기기 겹침 여부는 미검증.
- 계정 identities 과거 500(v530): 지금 무로그인 401은 정상 접근 통제 증거일 뿐, 과거 **로그인 후 500** 해결 증거가 아니다.

## 4. 다음 수정 후보의 합격 순서

1. 최신 main 재조회 후 충돌 없는 별도 작업 브랜치를 만든다.
2. SEO 관리자 외부 실행 API의 인증·CSRF·실제 응답 판정과 음성 테스트를 먼저 시정한다.
3. 관리자 SEO 탭·머니 플로우/상점 터치 크기·홈 H1 및 다국어를 시정한다.
4. 166개 전체 라우트를 5회씩 Playwright로 검증한다. 320/360/375/390/412/430, 가로모드, 768/1024/1280/1440, 200%/400% 확대, 한/영/일/중을 포함한다.
5. 34개 관리자 화면에서 실제 권한 사용자, 권한 거부, 만료·재인증, 빈/오류/긴 데이터, 대화창 포커스와 감사 내역을 Test에서 검증한다.
6. 31개 동적 화면의 정상·비정상 경로, 프론트 CTA → BFF → 백엔드 → DB/원장 영수증 정합성을 검증한다.
7. 변경 후 재조회와 CI, 동일 SHA 테스트 서버 백엔드·DB·세션·롤백·무중단 승격까지 통과한 경우에만 운영에 배포한다.

**운영 처리:** 이번 v718은 감사를 위한 문서 작업이며 실제 앱 코드, DB, 잔액, 기능 스위치, 테스트/운영 배포 포인터를 바꾸지 않았다. 문서만을 위한 운영 배포는 하지 않는다.

## 5. 근거 자료

내부: v530 UI 권위 문서, `RESPONSIVE_DESIGN_GUIDELINES.md`, `DESIGN_SYSTEM_GUIDELINES.md`, `frontend-ui-anti-clash-master-spec.md` 및 v624/v628 이전 감사.
외부: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI-ARIA Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [WAI Keyboard](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/).
