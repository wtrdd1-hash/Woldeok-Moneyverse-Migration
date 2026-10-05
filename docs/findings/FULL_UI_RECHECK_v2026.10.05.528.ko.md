# 전체 UI 재검토 — v2026.10.05.528

[English canonical](FULL_UI_RECHECK_v2026.10.05.528.md)

> 상태: **BLOCKED / 릴리스 승인 불가**
> 필수 main 재확인 후 최종 기준: `origin/main=755840748e80919d627c9126269e54559fa817ef`
> 범위: 소스/UI 권한문서 비교, 런타임 식별, 공개 HTTP 스모크, 반응형·접근성 위험 재검토.
> 증거 한계: 필수 5회 브라우저 매트릭스, 인증/관리자 직접 순회, 시각 회귀, 최신 main exact-SHA Test 승인까지 완료했다고 주장하지 않음.

## 결론

현재 UI는 전체 승인할 수 없다. 공식 QA 계약은 후보의 모든 라우트, 모든 관리자 화면, 동적 라우트 fixture, 상태 매트릭스, 전체 반응형/확대 매트릭스와 최소 5회 완전 순회를 exact Test 후보에서 요구한다. 최신 main은 Test에 배포되어 있지 않으며 브라우저 QA 전에 이미 릴리스 차단급 소스 결함이 확인됐다.

## 환경/라우트 기준

| 환경 | exact SHA | 페이지 | 관리자 | 동적 | 상태 |
|---|---|---:|---:|---:|---|
| Production | `7080738e656aca099d5c871278d178d69a984fcc` | 112 | 24 | 12 | backend health OK |
| Test | `9bdafd8699f7ca5f58ee3d00b89a327a3792d893` | 122 | 25 | 15 | backend health OK |
| 최신 main | `755840748e80919d627c9126269e54559fa817ef` | 138 | 25 | 24 | 소스 기준 |

최신 main 신규 인벤토리: 138 routes / 관리자 25 / 동적 24 / `data-page` 80, inventory SHA-256 `d581eff68b716eeeb1ea532d6ba8041053c4d79b5fa08431070b168b660d9f52`.

따라서 과거 60/86 라우트 UI QA 기록만으로 현재 후보를 승인할 수 없다.

## 차단 이슈

### UI528-01 — 최신 exact 후보 전체 라우트 승인 증거 없음
- 심각도: **P0 릴리스 게이트**
- 상태: OPEN
- 최신 후보는 138페이지이지만 Production/Test는 더 오래된 SHA와 더 작은 라우트 집합이다.
- `75584074`에서 필수 5회 브라우저 순회, 회원/관리자 상태, 동적 fixture, 320/360/375/390/412/430 세로 + 가로 + 768/1024/데스크톱 + 200%/적용 가능한 400% 검증이 아직 없다.
- 따라서 Production 승격과 “전체 UI QA 완료” 표시는 금지한다.

### UI528-02 — Test/main 기본 locale이 한국어 fallback 권한과 불일치
- 심각도: **P0 권한/런타임 갭**
- 상태: OPEN
- 현재 권한문서는 제품/공개 fallback을 한국어(`ko`)로 규정하고 v510은 한국어 runtime fallback 수리를 P0으로 지정한다.
- Production은 `DEFAULT_LOCALE='ko'`지만 Test와 최신 main은 `DEFAULT_LOCALE='en'`이다.
- 한국 접속에서는 GeoIP가 문제를 가릴 수 있으나 공식 fallback/canonical 계약 충족이 아니다.
- 하나의 서버 권위 locale 우선순위로 복구하고 명시 locale URL, 저장된 선택, GeoIP 추천, Accept-Language, 한국어 fallback을 검증해야 한다.

### UI528-03 — 전역 온보딩 패널이 320px보다 넓음
- 심각도: **P1 릴리스 차단**
- 상태: OPEN
- `InteractiveOnboardingTracker`가 `sm` 미만에서 `w-[340px]`이고 `right-3.5`로 고정된다.
- 필수 320px 화면에서는 패널 왼쪽과 중요한 컨트롤/내용이 화면 밖으로 나간다. overflow suppression은 결함을 해결하지 않고 숨길 수 있다.
- Test/최신 main의 root layout 전역 컴포넌트다.
- viewport-safe width로 변경 후 320px 실브라우저 증거가 필요하다.

### UI528-04 — 44px 상호작용 규칙이 공통 primitive에서 강제되지 않음
- 심각도: **P1 릴리스 차단**
- 상태: OPEN
- 공통 `Button`은 24/32/40px compact/icon 변형을 허용하고, `SelectTrigger`는 기본 36px·small 32px, 기본 탭도 화면별 override가 없으면 44px 미만이다.
- 실제 28px chat filter, 32px admin/work, 36px business/trade, 40px 컨트롤과 28px 온보딩 CTA가 확인됐다.
- 전역 헤더도 400px 미만 메뉴 버튼 40px, 모바일 언어 세그먼트 38px, 데스크톱 메뉴 36/40px다.
- primitive/실제 hit-area 수준에서 44px 계약을 강제하고 작은 route-local override를 제거해야 한다.

### UI528-05 — locale 전환 후에도 전역 접근성 텍스트가 한국어로 잔류
- 심각도: **P1 접근성/번역**
- 상태: OPEN
- `wdmv_locale=en/ja/zh`로 강제했을 때 Production/Test의 `html lang`은 맞게 바뀌지만 전역 skip link는 계속 `본문으로 건너뛰기`다.
- 공개 locale 번역 parity와 접근성 UI 일관성에 어긋난다.
- skip link를 locale화하고 root/global 컨트롤을 같은 방식으로 전수 검증해야 한다.

### UI528-06 — 모바일 내비게이션 정보구조 권한 충돌
- 심각도: **P1 제품/UX 거버넌스**
- 상태: OPEN
- 구현 하단 탭: 홈 / 거래소 / 직업 / 지갑 / 계정(로그인).
- 현재 App Spec: Home / Economy / Casino / Social / MY.
- 현재 Design System: Home / Exchange / Financial Tools / Community / MY.
- 과거 UPDATE_LOG에는 구현 구조가 기록되어 있지만 역사 로그는 현재 권한문서를 대체하지 않는다.
- 현재 권한문서에서 하나의 navigation SSOT를 먼저 결정한 뒤 데스크톱/모바일/드로어/문서를 통일해야 한다.

## 브라우저 후속이 필요한 성능 위험

### UI528-07 — 공개 2개 페이지가 8초 본문 전송 스모크 제한 초과
- 심각도: **P2 성능 위험**
- 상태: OPEN / 실측 필요
- 부분 HTTP 스윕에서 Production `/newspaper`, Test `/shop`은 HTTP 200을 받았지만 8초 안에 본문 전송이 끝나지 않았다.
- 이것만으로 Core Web Vitals 실패를 단정하지 않는다. 브라우저 timing, Server-Timing, API waterfall, payload 측정 대상이다.

## 확인된 양호점

- Production/Test backend health는 현재 정상이다.
- 최신 main route inventory 생성이 정상이며 관리자/동적 라우트가 별도 집계된다.
- 모바일 하단 내비게이션 자체는 safe-area padding과 58px 최소 높이를 사용한다.
- 공통 Input은 44px baseline을 사용한다.
- 검토 중 main이 `660c5ebb`, 이후 `75584074`로 두 번 변경됐고, 두 동시 반응형/관리자 터치타깃 변경을 확인한 뒤 감사 브랜치를 최신 main에 rebase했다.

## 수정/검증 우선순위

1. UI528-02 locale fallback 권한 불일치 해결.
2. UI528-03/04/05 전역 320px·터치·번역 접근성 수정.
3. UI528-06 navigation SSOT 확정 후 내비게이션 재정렬.
4. 수정 exact SHA를 격리 Test에 배포하고 backend/API/version identity 확인.
5. 최신 인벤토리 기준 138개 전체, 관리자 25개, 동적 24개를 필수 상태/viewport로 직접 순회.
6. 최소 5회 전체 UI/반응형 QA 후 모든 P0/P1을 exact-SHA 증거로 닫기.
7. 그 후에만 merge → exact merged SHA rebuild → 무중단 Production 승격.

## 비주장

v528은 감사/증거 문서 업데이트다. 소스 수정, Test 배포, DB 변경, Production 변경, 전체 브라우저/시각 회귀 완료, 운영 승격을 주장하지 않는다.
