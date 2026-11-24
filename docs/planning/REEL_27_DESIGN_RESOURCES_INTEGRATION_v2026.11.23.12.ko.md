# 웹 디자인 리소스 27곳 적용 및 Spring 웹 구축 상세 기획 — v2026.11.23.12

[English canonical](REEL_27_DESIGN_RESOURCES_INTEGRATION_v2026.11.23.12.md) | 한국어

> 상태: **PLANNING / 구현·Test·운영 미검증** · 기준일: 2026-11-23 KST · 시작 `origin/main`: `9876c09888ec84034eec183cf1309c85df3d7447`
> 사용자 참고: https://www.instagram.com/reel/DgB15siSolR/ (게시자 jungtudio). 공식 Instagram oEmbed **게시글 설명**에서 9개 그룹·27개 이름 검증. **영상 프레임·음성·댓글은 검증하지 않았음.**
> 우선순위: [현재 프로젝트 계획](PROJECT_PLAN.ko.md) → [통합 마스터](INTEGRATED_PLANNING_MASTER.ko.md) → [11월 18일 디자인](NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md) → [Spring 웹 재구축 실행계획](../superpowers/plans/2026-11-21-native-frontend-rebuild.md). [게임 UI 180장 브랜치](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/tree/feat/game-ui-180-single-master-20261123)는 별도 **미승인 시안**이며 자동 승격 기준이 아님.

## 1. 목적과 범위

릴스는 **새로운 웹사이트 제작에 도움이 되는 소스 27개**의 목록이지, 27개를 전부 설치하라는 기술 지시가 아니다. 월덕 머니버스의 기존 승인 디자인을 망가뜨리지 않으면서 제작 효율·모듈 품질·시각 완성도와 접근성을 높일 **평가·선별·라이선스·에셋 관리·구현·QA 파이프라인**으로 수용한다.

**결과물(계획)**: (1) 27곳 참고 카탈로그, (2) 실제 적용 에셋 및 외부 컴포넌트 별도 승인 원장, (3) 공유 Spring 디자인 토큰/컴포넌트, (4) 화면별 원본 시안↔실제 브라우저 대조, (5) 진짜 데이터와 동작하는 관리자/회원 화면, (6) PC·모바일·다국어·접근성/성능 회귀, (7) 운영 무중단 승격 증거. **이번 변경에서 실제 완성한 것은 이 기획과 발견 카탈로그뿐**이다.

**강제 불변식**:
- 웹은 Java Spring MVC+Thymeleaf의 기존 런타임으로 구현. React/Next.js/Framer/21st.dev 컴포넌트를 붙이려고 Node SSR, 두 번째 웹 프론트엔드 서버, iframe 또는 외부 스크립트 CDN을 신설하지 않는다.
- 승인된 11월 18일 다크 네이비/보라색 디자인의 실제 토큰, 현재 로고·파비콘 바이트, 회원/관리자 공통 셸과 전역 단일 56px 문의/채팅 버튼을 보존한다. 새로운 색 조합은 먼저 **안**으로 기록하고 실제 토큰 대체 금지.
- 기본 영어(EN), 두 번째 한국어(KO), 일본어(JA), 중국어 간체(ZH), 베트남어(VI): 자동 감지 + 언제나 사용자 수동 선택 + 선호도 유지. 화면·에셋 대체텍스트·광고 표시까지 5언어.
- 주식·잔액·지갑·은행·거래·카지노·회원·관리자 기능에 하드코딩 숫자, 가상 거래 영수증, 성공 흉내, 실제 아닌 차트, 예시 사용자·게시글 노출 금지. **백엔드의 실제 권한 있는 응답에만 바인딩**, 미가용 시 명시적 오류/UNKNOWN.
- 광고는 콘텐츠와 명확히 구별하고 `Sponsored/광고` 식별 가능하게 표시하며 프로모션 자료를 실제 게임 데이터처럼 연출하지 않는다.
- 원본 파일/자산, 현재 다른 기여자의 작업 및 과거 시안 원본을 덮어쓰지 않는다.

## 2. 릴스 원문 출처 27곳 및 채택 판정

범주 분류: **연구** = 레퍼런스만, **후보** = 자산 단위 검토 후 도입 가능, **보류** = 별도 보안·호환·성능 심사 전 라이브 반영 금지. 아래는 사이트 존재·용도 안내이며 각 개별 자산의 사용허락은 승인된 것으로 **간주하지 않는다**.

| 번호 | 분야 | 원문 이름 / 공식 주소 | 월덕 머니버스 활용안 | 기본 판정 |
|---|---|---|---|---|
| 01 | 일러스트 | [unDraw](https://undraw.co/) | 빈 상태·첫 가입·도움말용 SVG, 브랜드 보라 재색상 | 후보 |
| 02 | 일러스트 | [Storyset](https://storyset.com/) | 튜토리얼 설명·절차 안내 | 후보(무료 이용 시 출처표시) |
| 03 | 일러스트 | [DrawKit](https://www.drawkit.com/) | 게임 경제 안내의 일러스트/픽토그램 | 후보(팩별 약관) |
| 04 | 폰트 | [Fontshare](https://www.fontshare.com/) | 영문 디스플레이 서체 실험, 5언어 글리프 검증 | 후보 |
| 05 | 폰트 | [Fonts In Use](https://fontsinuse.com/) | 금융·게임 타이포 사례 분석. 폰트 파일 제공처 아님 | 연구 |
| 06 | 폰트 | [TypePair](https://www.typepair.co/) | 제목/본문 폰트 조합 가이드 | 연구 |
| 07 | 아이콘 | [Iconify](https://iconify.design/) | 동일 굵기·스트로크 아이콘 세트 선별, 세트별 라이선스 | 후보 |
| 08 | 아이콘 | [Lordicon](https://lordicon.com/) | 안내성 성공·보류·로딩 마이크로모션 | 후보(요금/표기 심사) |
| 09 | 아이콘 | [Icons8](https://icons8.com/) | 카테고리 보조 아이콘 | 후보(자산별 귀속/유료 확인) |
| 10 | UI | [21st.dev](https://21st.dev/) | 레이아웃·카드·폼 디자인 참고, 각 코드 라이선스 별도 | 연구 |
| 11 | UI | [Magic UI](https://magicui.design/) | 시각 효과·컴포넌트 세부 동작 참고 | 연구(React 직접 설치 금지) |
| 12 | UI | [React Bits](https://reactbits.dev/) | 선택·탐색·상태 변화 애니메이션 사례 참고 | 연구(Commons Clause 별도 검토) |
| 13 | 모션 | [Design Spells](https://designspells.com/) | 깜빡임 없는 정보 갱신·미세 피드백 패턴 분석 | 연구 |
| 14 | 모션 | [GSAP](https://gsap.com/) | 기존 JS로 해결 불가한 비핵심 설명 연출에 한정 | 보류 |
| 15 | 모션 | [Framer](https://www.framer.com/) | 사이트 구축/프로토타입 인터랙션 레퍼런스. 기존 Spring 런타임 대체 불가 | 연구 |
| 16 | 3D | [ThreeUI](https://threeui.com/) | 게임 경제 비금융 홍보형 3D 시안 검토 | 보류 |
| 17 | 3D | [GetLayers](https://www.getlayers.ai/) | 3D 배경/레이어/씬 레퍼런스와 재사용권 검토 | 보류 |
| 18 | 3D | [Spline](https://spline.design/) | 공개 소개 페이지에 한해 선택적 씬 제작 | 보류 |
| 19 | 이미지 | [Unsplash](https://unsplash.com/) | 정보성 블로그·공개 랜딩 배경 (실제 서비스 증거로 사용 금지) | 후보 |
| 20 | 이미지 | [Pexels](https://www.pexels.com/) | 공개 랜딩·글의 사진/동영상 | 후보 |
| 21 | 이미지 | [Lummi](https://www.lummi.ai/) | 비실제 설정을 명확히 하는 개념 이미지 | 후보 |
| 22 | 팔레트 | [Coolors](https://coolors.co/) | 승인 보라 팔레트의 톤·명도 보조조합 제안 | 연구 |
| 23 | 팔레트 | [Color Hunt](https://colorhunt.co/) | 디자인 트렌드 확인. 운영 색상 자동 교체 금지 | 연구 |
| 24 | 팔레트 | [Realtime Colors](https://www.realtimecolors.com/) | 대비·배색 실험안 프리뷰 | 연구 |
| 25 | 목업 | [Shots](https://shots.so/) | 실제 QA 캡처를 기기 틀에 넣은 홍보용 이미지 | 연구 |
| 26 | 목업 | [Mockuuups](https://mockuuups.studio/) | PC/모바일 화면 발표자료 제작 | 연구 |
| 27 | 목업 | [Previewed](https://previewed.app/) | 승인된 브라우저 캡처의 소개용 목업 | 연구 |

**확인된 핵심 주의사항(2026-11-23)**: Storyset 무료는 출처표시 조건이 있음([약관](https://storyset.com/terms)). Iconify는 라이브러리 전체가 단일 아이콘 라이선스가 아니라 각 세트별로 다름([안내](https://iconify.design/getting-started/)). 21st.dev 구성요소는 **개별 원본 라이선스**에 따름([약관](https://21st.dev/terms)). React Bits는 단순 MIT가 아닌 **MIT + Commons Clause**([원본 라이선스](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md)). Unsplash/Pexels/Lummi도 상업적 사용 가능하다는 일반 설명이 개별 인물권·상표권·유사 경쟁서비스 재배포 권리까지 보장하지는 않음([Unsplash](https://unsplash.com/license), [Pexels](https://www.pexels.com/license/), [Lummi](https://www.lummi.ai/license)). GSAP, Spline, GetLayers의 현재 제품/요금/재배포 조건도 **파일·기능 단위** 승인 필요.

## 3. 기존 UI 시안과 새 자료의 합성 규칙

1. **시각 계승**: 11월 18일 승인 PNG, 공식 로고/파비콘, PC 사이드바, 모바일 하단 탐색, 공통 헤더·문의를 먼저 배치한다. 11월 23일 게임 UI 180장의 미승인 시안은 차이표 작성 및 개별 승인 후에만 채택한다.
2. **리소스 연결**: 외부 참고는 '현재 화면의 특정 문제 → 후보 1~2개 → 사용권 → 구현 파일 → 브라우저 비교 결과'로 추적한다. 한 화면에 무작위 장식/여러 3D 효과를 혼합 금지.
3. **토큰**: 기존 `--mv-bg`, `--mv-surface`, `--mv-primary`, `--mv-border` 등 현재 승인 CSS 값만 소스로 삼는다. 새 보라색은 시안과 대비 표에만 기록 후 승인; 색상 도구가 런타임 파일을 직접 변경할 수 없다.
4. **서체**: EN/KO/JA/ZH/VI 문자 범위, 숫자 구분(0/O·1/l), 쉼표·통화 단위, 다국어 줄바꿈, 200% 확대, 플래시 현상(FOIT) 비교. WOFF2 서브셋 자체 호스팅 가능 여부와 실제 사용자 요청 추적/외부 폰트 호출 여부 확인.
5. **아이콘**: 공식 파비콘/로고는 라이브러리 아이콘으로 대체 불가. 네비게이션은 한 세트의 일관된 뷰박스·획 두께·최소 24px 터치 그림 및 의미 보존. 버튼에는 텍스트 또는 접근 가능한 이름.
6. **이미지**: 출처·저작자·원본URL·라이선스 증빙·원본 SHA256을 확보해 비공개 준비 공간에 보관, 리사이징/메타데이터 제거/AVIF·WebP 검토, alt text 5개, 크기(width/height), lazy/eager 정책 및 정적 fallback. 실제 금융 잔액 화면의 숫자/차트는 그림으로 대체 불가.
7. **모션**: 정보 변경은 화면 중간에 튀는 모달/토스트 대신 현재 항목 내부의 조용한 값 갱신, 필요한 경우 접근 가능한 업데이트 상태. 호버 120~180ms, 카드 펼침 180~250ms는 **제안값**; `prefers-reduced-motion`에서는 주요 변환/자동재생 제거. API 갱신 횟수와 효과 프레임레이트는 분리.
8. **3D**: 홍보용 공개 홈의 비핵심 영역에서만 후보 검증. 로그인, 송금, 지갑, 거래확인, 관리자 감사, 동의 화면에서는 필수 기능/정보를 가리는 캔버스·외부 임베드 금지. 모바일·저전력·저속망·모션 축소 시 정적 SVG/WebP. 미동의 제3자 추적 요청 차단.
9. **목업**: QA 결과, 실제 운영 증거, 광고 성과 대시보드처럼 오인될 수 없도록 `Concept / 시안`과 `Production verified`를 명확히 구분. 이미지 속 가상 수익률·가짜 잔액 금지.

## 4. Spring 프론트엔드 구현 구조 및 데이터 계약

**기존 코드 기준 확인**: `spring-backend/src/main/resources/templates/shared/chrome.html`, `shared/admin-shell.html`, `templates/mv43/`, `templates/mv46/`, `spring-backend/src/main/resources/static/`가 기존 구조다. 다음은 **신규 후보 파일 경로**이며 아직 존재하지 않는다고 가정하여 브랜치 QA 후 결정한다.

| 제안 대상 | 책임 | 연결 기준 |
|---|---|---|
| `spring-backend/src/main/resources/static/assets/design-tokens.css` | 현재 승인 네이비·보라 토큰을 하나의 진실로 표현 | 기존 CSS 회귀와 시안 픽셀 비교 선행 |
| `spring-backend/src/main/resources/templates/shared/ui/{card,empty,alert,modal,form}.html` | 반복되는 카드·빈 상태·에러·폼 단편 | Thymeleaf 템플릿 렌더·CSRF 테스트 |
| `spring-backend/src/main/resources/static/assets/ui-interactions.js` | 포커스·메뉴·모달·로딩·정보 갱신 | ES module/bundle 필요성 확인; 외부 CDN 금지 |
| `spring-backend/src/main/resources/static/assets/approved/*` | 라이선스 승인된 로컬 이미지·아이콘·서체 | 파일 SHA/출처/배치 경로 원장과 일치 |
| `spring-backend/src/test/.../Nov18DesignAsset*Test.java` | 템플릿·역할·자산 경로·권한 회귀 | 실제 프로젝트 테스트 구조에 맞춰 명명 |
| `docs/design/asset-resources-v2026.11.23.12/source-catalog.json` | **발견한 27개 사이트**의 정적 카탈로그 | 실제 다운로드/승인 이력과 구분 |

**서버 연동 불변식**:
- 화면 서버 렌더링은 인증 세션의 actor로만 실제 API/DB 공개 함수를 호출한다. 브라우저가 user ID나 관리자 역할을 신뢰 헤더로 직접 정하지 못한다.
- 실제 JSON 계약을 route ledger에 기록: 경로, 메서드, 권한, CSRF, 사용자 소유권, 상태코드, 필드/단위/UTC, 캐시 허용, 멱등 키, 감사 영수증, 부하/재접속.
- 잔액·가격·이자·세금·보상은 서버 문자열/정밀 Decimal 보존; 브라우저 부동소수점으로 원장 계산 금지.
- 뷰모델 상태 `LOADING`/`READY`/`EMPTY`/`STALE`/`ERROR`/`UNAUTHORIZED`/`FORBIDDEN`/`UNKNOWN`를 구분. `ERROR`나 `UNKNOWN`를 0원, 비어 있음, 전송 완료로 변조 금지.
- 은행·송금·카드 발급·주문·카지노·관리자 변경은 서버 권한·재인증·CSRF·멱등·원장 대사·확정 영수증까지 실계정 격리 Test 전엔 실행 버튼 비활성. 제3자 UI 코드가 직접 거래 API 호출 못 함.
- 인증 Google/Discord/자체 로그인과 동의/개인정보·약관 링크, 변경 시 재동의, 6개월 정기동의 요구는 현재 승인된 정책·서버 기록 확인 후 구현. 예시 버튼으로 실제 연동을 대신하지 않는다.
- 광고는 광고임을 항상 명시, 영어/한국어 포함 5언어·모바일에서 광고 식별 표시가 사라지지 않도록 한다.

## 5. 화면 적용 계획 — 승인 범위별 상세

| 우선 | 그룹/페이지 | 일러스트·아이콘·색·모션 후보 | 실제 동작/검증 |
|---|---|---|---|
| P0 | 공개 홈, 로그인, 가입, 공지, 오류 | unDraw 빈 상태; 승인 아이콘; 최소 페이드 | OAuth 연결·법정 링크·동의·복구·5언어·실시간 공지 원천 검증 |
| P0 | 사용자 홈, 자산, 지갑, 은행 | 현재 토큰·자산 상태 아이콘; 모션 최소 | 세션 인증, 실제 잔액·내역·입출금·이자·송금 영수증, 조회 실패 및 stale |
| P0 | 주식, 거래, 차트, 게임 | 차트 및 상태 시각화 **실제 API 값**으로만; 스켈레톤 | 가격·주문권한·결과 원장·게임 확률·타임아웃·취소/재시도 |
| P0 | 관리자, 문의·채팅 | 공통 관리자 네비게이션, 상태 아이콘·불필요한 배경 제거 | 실권한 RBAC·감사·권한 거부·전송/수신·중복 팝업 없음 |
| P1 | 상점, 콘텐츠, 블로그, 도움말 | Storyset/DrawKit/Unsplash 등 심사된 리소스 | 게시글/상품 출처, 결제 상태, 번역, 광고 표기, 이미지 대체텍스트 |
| P2 | 공개 홍보·게임 소개 | GSAP/Spline/ThreeUI/GetLayers **선택적 검증** | fallback, 저사양 기기, 프레임 부하, 브라우저 미지원, 추적/라이선스 |
| P2 | 마케팅 이미지·릴리스 소개 | Shots/Mockuuups/Previewed | 실화면 캡처와 시안 표기 분리, 공용 URL 비밀정보 누출 방지 |

**공유 컴포넌트 수용 목록**: `AppShell`, `AdminShell`, `PageHeading`, `StatCard`, `BalanceCard`, `AccountRow`, `TransactionTable`, `DataEmpty`, `DataError`, `LoadingIndicator`, `ToastInline`, `ConfirmDialog`, `LocaleSelector`, `ThemeTokens`, `LegalConsent`, `AdDisclosure`, `SupportLauncher`. 각 요소는 한 개의 모듈·상태표·키보드·접근성·테스트 ID만 유지한다. 이름은 계획상의 계약이며 이미 구현됐다는 뜻이 아니다.

## 6. 라이선스·보안·공급망 도입 게이트

**두 원장을 분리**: `source-catalog.json`은 탐색 카탈로그(27곳, 승인 아님); 구현 시 별도 `approved-assets.json`에 **실제 에셋별** `assetId, sourceName, sourceURL, author, licenseURL, licenseTextEvidence, commercialUse, attributionRequired, redistributionScope, consent/release, originalSHA256, transformedSHA256, reviewedBy, reviewedAt, routes, locales, alt, assetPath, dependencyVersion, SBOM, expiresAt, approvalStatus` 기록. 파일별 승인 없으면 빌드에 포함 금지.

승인 절차: 원본 공식 페이지 확인 → 저작자·해당 파일 이용허락·재배포/편집/상표/초상·AI 생성물 권리 확인 → 필요 시 구매증빙 보안보관 → 다운로드 원본 해시 → 수정본/파생 관계 기록 → svg`<script>`/이벤트속성/원격 `href`/외부 폰트 검사 및 정화 → 폰트 글리프/이미지 해상도·성능 검사 → 표기·저작권 고지 → 리뷰 2인 → 로컬 번들 → QA 이미지·서드파티 요청 검증.

금지: 무검토 `npx` 원격 설치, 비밀값/실고객 데이터 외부 이미지 생성 서비스 업로드, 동의 없는 CDN/analytics, 공급망 출처 불명 코드, 색상 자동 덮어쓰기, 폰트 라이선스 미확인 공개 재배포, 타사 상표를 공식 로고처럼 사용. 외부 의존성은 고정 버전과 SBOM/취약점 조회를 기록하고 승인된 리뷰 이후에만 사용한다.

## 7. 성능·접근성·UI QA 규칙 (검증 목표, 현재 실측치 아님)

- **시각 목표**: 승인 PNG↔실 Chromium 화면 동일한 텍스트 계층/여백/색상/작동; 320/360/390/430/768/1024/1440/1920px, 세로·가로, 200% zoom, 시스템 글자 확대, 모바일 safe area, 가로 넘침 0. 픽셀 차이는 임계치 임의 통과 금지; 변경 사유와 비교 캡처.
- **접근성 목표**: WCAG 2.2 AA, 포커스 노출, 입력 레이블, 색만으로 의미 전달 금지, 키보드 Tab/Shift+Tab/Escape/Enter, 터치 대상 ≥44px(기존 승인 목표), 광고 라벨 스크린리더 안내, 모션 축소.
- **성능 목표**: 실제 조건의 p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1, 모바일에서 불필요한 3D 자동재생 0. 별도 성능 측정 예산과 해당 CI 비교를 마련한다. 부득이한 성능 악화는 기능 채택 보류, 미측정은 PASS 취급 금지.
- **실시간 목표**: 재연결/중복·순서 뒤바뀜·부분 갱신·지연에 대비한 서버 권위 판정. 화면을 가리는 토스트/중간 배너 남발 방지, 동일 정보 반복 알림 제한. 데이터 fresh/stale을 구분.
- **보안 목표**: 관리자/다른 사용자 IDOR, XSS/SVG, CSP, 제3자 네트워크 요청, 로그인 동의, 서버 CSRF/RBAC/step-up, 프런트가 만든 허위 성공, 고액·중복 금융 요청을 별도 실제 E2E로 검사.
- **회귀 단계**: 정적 문서/JSON 스키마 → 에셋 출처 검토 → JS/CSS 검사 → Spring JUnit와 Thymeleaf 렌더 → 독립 Test 실제 HTTP/HTTPS → 5언어×8해상도×기본/성공/실패/권한 상태×최소 5회 브라우저 → 실권한 계정(관리자·회원2명) API/원장/동의/광고 확인 → 운영 복원 리허설.
- **브라우저 자료**: 원본/적용 전/적용 후 캡처와 URL, 릴리스 커밋 SHA, 서버 식별자, 응답 상태, DB read snapshot, 날짜, 검사자를 QA 보고서에 기록. 목업 생성본을 실검증 증거로 사용 불가.

## 8. 작업 단계와 완료 기준

| 단계 | 산출물 | 통과 조건 | 위험/차단 |
|---|---|---|---|
| G0 발견·기록 | 원문 캡션, 27 카탈로그, 버전 기획, 작업 시작/중간/종료 로그 | 원본 서비스 27개 중복·누락 0, 링크 점검 | 영상 본편 미검증 표기 |
| G1 자산 감사 | 기존 favicon·시안·CSS·route ledger inventory | 현재 승인 시안/프론트 코드의 차이 기록 | 미승인 PNG 자동 반영 금지 |
| G2 예시 제작 | 공개 홈 1개·자산 1개·관리자 1개 시안 | 실제 데이터 없이도 콘텐츠 오인 금지, 시안 승인 | 외부 코드 설치 금지 |
| G3 웹 foundation | 공유 토큰·아이콘·대체텍스트·컴포넌트 | Spring 단일 런타임, 단위/접근성/라이선스 테스트 | 기존 브랜치 충돌 금지 |
| G4 핵심 연결 | 실제 API·auth·원장·정책, 실패/오류 상태 | DB-backed E2E, 권한·멱등·영수증 증빙 | 재정 위조·확정되지 않은 API 차단 |
| G5 시각 수용 | 180 경로 인벤토리별 완료/미완료 원장 | 실제 구현된 범위의 8해상도×5언어×5회 증빙 | 비구현 경로 카운트 완성 금지 |
| G6 배포 판정 | 독립 외부접근 Test, 보안/부하/복원 QA | 정확한 SHA, 운영 권한/DB/서비스 무중단 검증 후 승인 | 하나라도 주요 P0 미충족 시 HOLD |

**완료 정의**: '27개 목록 수집' ≠ '27개 파일 사용권 승인' ≠ 'UI 구현' ≠ 'Test 통과' ≠ 'Production 검증'. 이번 회차는 **G0의 문서·카탈로그**까지만 다룬다. 디자인 이미지 생성, 실제 화면 교체, Spring 코드, 브라우저 QA, 테스트서버 가동, 운영 승격은 아직 하지 않았다. 후속 변경에는 각 단계별 새 버전·브랜치·실증과 내부/GitHub 업데이트를 남긴다.

## 9. 공개·비공개 기록 및 다중 작업자 인계

- 다른 기여자의 `feat/game-ui-180-single-master-20261123`, `fix/public-ads-clear-disclosure-20261123`, `fix/game-ui-180-visual-functional-qa-20261123` 작업 파일을 건드리지 않는다.
- 현재 `main`과 미병합 디자인 후보를 명시적으로 구분한다. `main`이 변하면 단계 중간과 합치기 직전에 새 SHA 및 기획 충돌/미병합 시안 상태를 재확인한다.
- 외부 URL은 **디자인 참고 원천**으로 보존하며 리소스 이미지·영상·폰트·타사 코드 자체는 미승인 상태로 GitHub에 가져오지 않는다.
- [작업 기록](../worklog/2026-11-23-reel-27-design-resources-v12.ko.md) · [GitHub용 변경 기록](../updates/v2026.11.23.12-reel-27-resources-github.ko.md) · 내부 변경 기록: 로컬 전용 `docs/updates/v2026.11.23.12-reel-27-resources-internal.ko.md` (저장소 정책상 Git 제외) · [카탈로그](../design/asset-resources-v2026.11.23.12/source-catalog.json).

## 10. 소스 확인 내역

| 출처 | 검증 방식 | 이 회차의 결론 |
|---|---|---|
| Instagram Reel DgB15siSolR | Instagram oEmbed 게시글 제목/설명 | 9개 그룹·27개 이름 확인, 프레임/음성 미검증 |
| unDraw / Storyset / DrawKit | 공식 [unDraw](https://undraw.co/license), [Storyset](https://storyset.com/terms), [DrawKit](https://www.drawkit.com/license) | 사용권 조건이 상이하므로 자산별 심사 |
| Iconify / 21st.dev / React Bits | 공식 [Iconify](https://iconify.design/getting-started/), [21st.dev](https://21st.dev/terms), [React Bits](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md) | 카탈로그 코드/아이콘이 자동으로 무제한 무료는 아님 |
| Unsplash / Pexels / Lummi | [Unsplash](https://unsplash.com/license), [Pexels](https://www.pexels.com/license/), [Lummi](https://www.lummi.ai/license) | 이용 조건과 상표/인물권 검토 필요 |
| GSAP / Spline / GetLayers | [GSAP](https://gsap.com/standard-license), [Spline](https://spline.design/pricing), [GetLayers](https://www.getlayers.ai/terms-of-use) | 각 제품 최신 조건과 JS·외부연동 비용 검토, 미채택 |
